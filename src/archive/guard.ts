/**
 * 解包安全边界：路径穿越与解压炸弹的统一防线。
 *
 * 技能包和插件包都来自外部——市场下载、用户给的 zip、GitHub 仓库——
 * 所以「包里写什么就往盘上落什么」是不能接受的。这里的检查在**解压之前**
 * 拦掉恶意条目，zip/tar 两条路径共用同一套判定，避免两边规则漂移。
 * @module @staff-os/dsh-workbench/archive/guard
 */

import { WorkbenchError } from '../types.ts'

/** 单个包内最多多少个条目。 */
export const MAX_ENTRIES = 2_000

/** 单个文件解压后的体积上限。 */
export const MAX_FILE_BYTES = 5 * 1024 * 1024

/** 整包解压后的体积上限。 */
export const MAX_TOTAL_BYTES = 50 * 1024 * 1024

/** 解包被安全策略拒绝时的错误码。 */
export const UNSAFE_ARCHIVE = 'WORKBENCH_UNSAFE_ARCHIVE'

/** 抛出一个解包安全错误。 */
export function unsafe(reason: string): WorkbenchError {
  return new WorkbenchError(`包内容不安全，已拒绝导入：${reason}`, UNSAFE_ARCHIVE)
}

/**
 * 判断一个包内路径是否可以安全落盘。
 *
 * 拒绝四类：绝对路径（含 Windows 盘符与 UNC）、含 `..` 段、含 NUL 字节、空路径。
 * 注意判定在**按分隔符切段之后**做，`..` 不能只用 `includes` 判——
 * 那样 `a..b/c` 这种合法名字会被误杀，而 `foo/../../etc` 反而要拦住。
 */
export function isSafeEntryPath(raw: string): boolean {
  if (raw === '' || raw.includes('\0')) return false
  const path = raw.replace(/\\/gu, '/')
  if (path.startsWith('/') || /^[A-Za-z]:/u.test(path)) return false
  return !path.split('/').includes('..')
}

/** 校验路径，不安全就抛。 */
export function assertSafeEntryPath(raw: string): void {
  if (!isSafeEntryPath(raw)) throw unsafe(`非法条目路径 "${raw}"`)
}

/**
 * 解压体积预算。
 *
 * 解压炸弹的要害是「声明体积很小、实际解出来很大」，所以声明值和实际值
 * 都要过一遍这个预算：调用方先用 header 里的声明体积探一次（便宜，能在
 * 分配内存前就拒绝），解出来后再用真实长度记一次账。
 */
export class ExtractBudget {
  private entries = 0
  private total = 0

  /**
   * 记一个条目。
   * @param bytes - 该条目的体积（声明值或实际值）。
   */
  add(path: string, bytes: number): void {
    this.entries += 1
    if (this.entries > MAX_ENTRIES) throw unsafe(`条目数超过 ${String(MAX_ENTRIES)}`)
    if (bytes > MAX_FILE_BYTES) {
      throw unsafe(`"${path}" 解压后 ${String(bytes)} 字节，超过单文件上限 ${String(MAX_FILE_BYTES)}`)
    }
    this.total += bytes
    if (this.total > MAX_TOTAL_BYTES) {
      throw unsafe(`整包解压后超过 ${String(MAX_TOTAL_BYTES)} 字节`)
    }
  }

  /** 只检查不记账，用于解压前的声明体积预检。 */
  peek(path: string, bytes: number): void {
    if (bytes > MAX_FILE_BYTES) {
      throw unsafe(`"${path}" 声明体积 ${String(bytes)} 字节，超过单文件上限 ${String(MAX_FILE_BYTES)}`)
    }
    if (this.total + bytes > MAX_TOTAL_BYTES) {
      throw unsafe(`整包声明体积超过 ${String(MAX_TOTAL_BYTES)} 字节`)
    }
  }
}

const utf8 = new TextDecoder('utf-8', { fatal: true })

/**
 * 把条目内容解成文本；二进制返回 `undefined` 由调用方跳过。
 *
 * 先看 NUL 字节：技能包里的图片、字体、编译产物都会命中，比让 TextDecoder
 * 抛异常再兜要快得多，也不会把合法的非 UTF-8 文本误判成二进制。
 */
export function decodeText(data: Uint8Array): string | undefined {
  if (data.includes(0)) return undefined
  try {
    return utf8.decode(data)
  } catch {
    return undefined
  }
}

/** 归一包内路径分隔符。 */
export function normalizeEntryPath(raw: string): string {
  return raw.replace(/\\/gu, '/')
}
