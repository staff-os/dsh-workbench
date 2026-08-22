/**
 * tar / tar.gz 包读取。
 *
 * 部分 ClawHub 兼容实现的 download 端点返回 tarball 而不是 ZIP，
 * 所以这条路径必须认。tar 格式本身足够简单（512 字节定长块），
 * 自己解比再拉一个解包依赖划算。
 * @module @staff-os/dsh-workbench/archive/tar
 */

import { gunzipSync } from 'node:zlib'
import {
  assertSafeEntryPath,
  decodeText,
  ExtractBudget,
  MAX_TOTAL_BYTES,
  normalizeEntryPath,
  unsafe,
} from './guard.ts'
import type { PackageFile } from '../types.ts'

const BLOCK = 512

/**
 * 读出 tar（可 gzip 压缩）内的全部条目。
 *
 * 二进制条目按原始字节保留，理由与 ZIP 那条路径一样：技能的资源目录是模型
 * 按正文里的相对路径去读的，少一个文件在盘上看不出来，只会表现成技能失灵。
 */
export function readTarFiles(input: Buffer): PackageFile[] {
  const data = inflate(input)
  const budget = new ExtractBudget()
  const files: PackageFile[] = []

  let offset = 0
  let zeroBlocks = 0
  /** GNU `L` 头或 pax `x` 头给下一个条目预置的长文件名。 */
  let pendingName: string | undefined

  while (offset + BLOCK <= data.length) {
    const header = data.subarray(offset, offset + BLOCK)
    offset += BLOCK

    if (isZeroBlock(header)) {
      // 连续两个全零块是归档结束标记。
      zeroBlocks += 1
      if (zeroBlocks >= 2) break
      continue
    }
    zeroBlocks = 0

    const size = readNumeric(header, 124, 12)
    if (size < 0) throw unsafe('tar 头部体积字段非法')
    const body = data.subarray(offset, offset + size)
    offset += Math.ceil(size / BLOCK) * BLOCK

    const type = readTypeFlag(header)
    if (type === 'L') {
      // GNU 长文件名：本条目没有内容，内容就是下一个条目的名字。
      pendingName = trimNul(body.toString('utf8'))
      continue
    }
    if (type === 'x') {
      pendingName = parsePaxPath(body) ?? pendingName
      continue
    }
    if (type === 'g') continue

    const name = pendingName ?? assembleName(header)
    pendingName = undefined

    // 目录、硬链接、符号链接一律跳过——符号链接是逃出解压目录的经典手法，
    // 而本插件落盘时也不需要它们。
    if (type !== '0') continue
    if (name === '' || name.endsWith('/')) continue

    const path = normalizeEntryPath(name)
    assertSafeEntryPath(path)
    budget.add(path, body.length)

    const content = decodeText(body)
    // body 是 data 上的 subarray，与整包共享缓冲；拷一份，否则一个几十 KB
    // 的图标会把整个归档的字节钉在内存里。
    files.push({ path, content: content ?? Uint8Array.from(body) })
  }

  return files
}

/**
 * gzip 的话解开，否则原样返回。
 *
 * `maxOutputLength` 是 gzip 炸弹的真正防线：没有它，一个几 KB 的包能在
 * 逐条目检查开始之前就把内存吃光。
 */
function inflate(input: Buffer): Buffer {
  if (input[0] !== 0x1f || input[1] !== 0x8b) return input
  try {
    return gunzipSync(input, { maxOutputLength: MAX_TOTAL_BYTES })
  } catch (error: unknown) {
    throw unsafe(`gzip 解压失败或超过 ${String(MAX_TOTAL_BYTES)} 字节上限（${String(error)}）`)
  }
}

function isZeroBlock(block: Buffer): boolean {
  return !block.some(byte => byte !== 0)
}

function readTypeFlag(header: Buffer): string {
  const raw = header[156] ?? 0
  // 历史上的 tar 用 NUL 表示普通文件，后来才统一成 '0'。
  return raw === 0 ? '0' : String.fromCharCode(raw)
}

/** ustar 把超过 100 字节的路径拆成 prefix + name 两段存。 */
function assembleName(header: Buffer): string {
  const name = readString(header, 0, 100)
  const prefix = readString(header, 345, 155)
  return prefix === '' ? name : `${prefix}/${name}`
}

function readString(block: Buffer, offset: number, length: number): string {
  const field = block.subarray(offset, offset + length)
  const end = field.indexOf(0)
  return field.toString('utf8', 0, end === -1 ? field.length : end)
}

/**
 * 读一个数值字段。默认是八进制 ASCII，但 GNU 对超过字段宽度的大数用
 * base-256：最高位置 1，余下字节是大端二进制。
 */
function readNumeric(block: Buffer, offset: number, length: number): number {
  const first = block[offset] ?? 0
  if ((first & 0x80) !== 0) {
    let value = 0
    for (let index = offset + 1; index < offset + length; index += 1) {
      value = value * 256 + (block[index] ?? 0)
    }
    return value
  }
  const raw = trimNul(block.toString('ascii', offset, offset + length)).trim()
  if (raw === '') return 0
  const parsed = Number.parseInt(raw, 8)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * 从 pax 扩展头里取 `path` 记录。
 *
 * 记录格式是 `"<十进制总长> <key>=<value>\n"`，长度以**字节**计，
 * 所以整个解析都在 Buffer 上按字节偏移走——按 JS 字符串下标切会在
 * 非 ASCII 路径上错位。
 */
function parsePaxPath(block: Buffer): string | undefined {
  let pos = 0
  while (pos < block.length) {
    const space = block.indexOf(0x20, pos)
    if (space === -1) break
    const length = Number.parseInt(block.toString('ascii', pos, space), 10)
    if (!Number.isFinite(length) || length <= 0 || pos + length > block.length) break
    const record = block.toString('utf8', space + 1, pos + length).replace(/\n$/u, '')
    const equals = record.indexOf('=')
    if (equals !== -1 && record.slice(0, equals) === 'path') return record.slice(equals + 1)
    pos += length
  }
  return undefined
}

function trimNul(value: string): string {
  const end = value.indexOf('\0')
  return end === -1 ? value : value.slice(0, end)
}
