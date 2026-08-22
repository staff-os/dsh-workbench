/**
 * 把一个文件送到界面上去看：读多少、怎么判断是不是文本、允许读哪里。
 *
 * 详情页的文件树点开一个文件就走这里。两个来源（盘上的技能目录、刚下载回来
 * 的市场包）最后都落到 {@link fileContentOf} 这一个形状上，所以界面那边只有
 * 一套显示逻辑。
 *
 * 这里有一条安全边界：{@link resolveInsideSkill}。相对路径是浏览器传上来的，
 * 它必须只能落在那个技能目录**里面**——`assertSafeEntryPath` 先按字面挡掉
 * `..` 与绝对路径，解析之后再核一遍结果确实还在目录底下。只做前一道不够：
 * 路径分隔符与盘符在不同平台上的写法不止一种，字面检查总有漏网的。
 *
 * @module @staff-os/dsh-workbench/skill/file
 */

import { open, stat } from 'node:fs/promises'
import { resolve, sep } from 'node:path'
import { assertSafeEntryPath, decodeText } from '../archive/guard.ts'
import { WorkbenchError } from '../types.ts'

/**
 * 一个文件预览能有多大。
 *
 * 送到浏览器的是一次 Remote 调用的返回值，中途没有分片也没有流式。技能里的
 * 文档和脚本都远小于这个数，真撞上上限的多半是别人顺手塞进包里的数据文件——
 * 那种东西看前 256 KiB 已经够判断它是什么了。
 */
export const MAX_PREVIEW_BYTES = 256 * 1024

/** 一个文件的内容。 */
export interface FileContent {
  /** 相对技能目录（或包根）的路径。 */
  readonly path: string
  /** 完整体积，不是这次送了多少。 */
  readonly size: number
  /** 文本内容；二进制文件没有这一项。 */
  readonly text?: string
  /** 二进制文件。字节不往浏览器送，只说它有多大。 */
  readonly binary: boolean
  /** 超过 {@link MAX_PREVIEW_BYTES}，`text` 只是开头那一段。 */
  readonly truncated: boolean
}

/**
 * 把「技能目录 + 相对路径」落到盘上一个绝对路径，并确认它没跑出去。
 *
 * @param dir - 技能目录。
 * @param path - 浏览器给的相对路径。
 * @returns 绝对路径。
 * @throws 路径不合法、或解析之后落在了目录之外。
 */
export function resolveInsideSkill(dir: string, path: string): string {
  assertSafeEntryPath(path)
  const home = resolve(dir)
  const full = resolve(home, path)
  if (!full.startsWith(home + sep)) {
    throw new WorkbenchError(`路径 "${path}" 不在技能目录里`, 'WORKBENCH_UNSAFE_PATH')
  }
  return full
}

/**
 * 读盘上一个文件，做成能送到浏览器的样子。
 *
 * 大文件只读前 {@link MAX_PREVIEW_BYTES} 个字节，而不是读完再截：一份被人
 * 顺手塞进技能里的几十 MB 数据文件，光是读进内存就够呛。
 *
 * @param full - 盘上的绝对路径。
 * @param path - 报给界面的相对路径。
 * @returns 文件内容。
 */
export async function readFileContent(full: string, path: string): Promise<FileContent> {
  let size: number
  try {
    size = (await stat(full)).size
  } catch (error: unknown) {
    throw new WorkbenchError(`读不到 "${path}"`, 'WORKBENCH_SKILL_NOT_FOUND', { cause: error })
  }
  const wanted = Math.min(size, MAX_PREVIEW_BYTES)
  const handle = await open(full, 'r')
  let data: Buffer
  try {
    data = Buffer.alloc(wanted)
    await handle.read(data, 0, wanted, 0)
  } finally {
    await handle.close()
  }
  return fileContentOf(path, size, data)
}

/**
 * 把一段字节做成文件内容。
 *
 * @param path - 报给界面的相对路径。
 * @param size - 文件的完整体积；比 `data` 长就说明这次只取了开头一段。
 * @param data - 取到的字节。
 * @returns 文件内容。
 */
export function fileContentOf(path: string, size: number, data: Buffer): FileContent {
  const truncated = size > data.byteLength
  const text = truncated ? decodeTruncated(data) : decodeText(data)
  return {
    path,
    size,
    ...text === undefined ? {} : { text },
    binary: text === undefined,
    truncated,
  }
}

/**
 * 解一段被截过的文本。
 *
 * 截口可能落在一个多字节字符中间，而 `decodeText` 是 fatal 模式——直接解会把
 * 一份纯文本判成二进制。UTF-8 一个字符最多 4 字节，所以最多削掉末尾 3 个字节
 * 再试；真是二进制的话这几次也都解不出来，结论不变。
 */
function decodeTruncated(data: Buffer): string | undefined {
  for (let back = 0; back <= 3 && data.byteLength > back; back += 1) {
    const text = decodeText(data.subarray(0, data.byteLength - back))
    if (text !== undefined) return text
  }
  return undefined
}
