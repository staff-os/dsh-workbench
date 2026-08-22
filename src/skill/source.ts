/**
 * 技能包的来源解析：本地压缩包、远端 URL、或市场 slug。
 *
 * 三种来源共用一条落盘路径（解包 → 校验 → 原子替换），差别只在怎么拿到字节，
 * 所以这里只负责「辨认来源」和「取回字节」，装盘交给 `local.ts`。
 *
 * @module @staff-os/dsh-workbench/skill/source
 */

import { readFile } from 'node:fs/promises'
import { MAX_TOTAL_BYTES } from '../archive/guard.ts'
import { extractPackage, stripCommonPrefix } from '../registry.ts'
import { isAbortError, throwIfAborted, WorkbenchError } from '../types.ts'
import type { PackageFile } from '../types.ts'

/** 一个技能包的来源。 */
export type ImportOrigin =
  /** 本地压缩包路径。 */
  | { readonly kind: 'archive'; readonly path: string }
  /** 远端 URL，已归一成可直接下载的包地址。 */
  | { readonly kind: 'url'; readonly url: string; readonly label: string }
  /** 市场条目。 */
  | { readonly kind: 'registry'; readonly slug: string; readonly version?: string }

/** 认得出的压缩包扩展名。 */
const ARCHIVE_SUFFIX = /\.(?:zip|tar|tgz|tar\.gz)$/iu

/** 市场 slug 的形状；命名空间形式 `owner/name` 也算。 */
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/u

/**
 * 把 GitHub 页面地址翻成能直接下载的包地址。
 *
 * 用户手里的链接通常是浏览器地址栏里那一条，它返回的是 HTML 而不是包。
 * `/tarball` 端点会跟随仓库的默认分支，省得让用户先去查默认分支叫什么。
 *
 * @returns 可下载的地址；不是 GitHub 仓库地址时返回 `undefined`。
 */
export function githubArchiveUrl(raw: string): string | undefined {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return undefined
  }
  if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') return undefined
  const segments = url.pathname.split('/').filter(segment => segment !== '')
  const owner = segments[0]
  const repo = segments[1]?.replace(/\.git$/iu, '')
  if (owner === undefined || repo === undefined) return undefined
  // 已经是 /archive/... 的直链就别再翻一次。
  if (segments[2] === 'archive') return raw
  const base = `https://api.github.com/repos/${owner}/${repo}/tarball`
  // /tree/<ref> 里的 ref 可能含斜杠（feature/x），后面几段要拼回去。
  if (segments[2] === 'tree' && segments.length > 3) {
    return `${base}/${segments.slice(3).join('/')}`
  }
  return base
}

/**
 * 辨认一个 `from` 参数指的是哪种来源。
 *
 * 顺序有讲究：先看协议头，再看压缩包扩展名，剩下的才当 slug。反过来的话
 * `https://…/foo.zip` 会被扩展名规则抢走，当成本地路径去读盘。
 */
export function classifyImportSource(from: string, version?: string): ImportOrigin {
  const value = from.trim()
  if (value === '') {
    throw new WorkbenchError('必须给 from：本地压缩包路径、下载链接、或市场 slug', 'WORKBENCH_MISSING_ARG')
  }
  if (/^https?:\/\//iu.test(value)) {
    const github = githubArchiveUrl(value)
    return { kind: 'url', url: github ?? value, label: value }
  }
  if (ARCHIVE_SUFFIX.test(value)) return { kind: 'archive', path: value }
  if (SLUG_PATTERN.test(value)) {
    return { kind: 'registry', slug: value, ...version === undefined ? {} : { version } }
  }
  // 剩下的多半是本地路径写法（相对路径、Windows 盘符、没扩展名的包），
  // 当压缩包处理，读不出来时报的错比「slug 不合法」更贴近真相。
  return { kind: 'archive', path: value }
}

/**
 * 从来源字符串里凑一个合法的技能名。
 *
 * 只是暂存目录的名字与兜底：真正的技能名以包内 frontmatter 的 `name` 为准，
 * 所以这里凑不准也不影响最终装出来的东西叫什么。
 */
export function fallbackSkillName(hint: string): string {
  const base = hint.split(/[\\/]/u).filter(segment => segment !== '').pop() ?? hint
  const kebab = base
    .replace(ARCHIVE_SUFFIX, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
  return kebab === '' ? 'imported-skill' : kebab
}

/**
 * 带上限地读完一个响应体。
 *
 * `arrayBuffer()` 会先把整个响应吃进内存再让人检查大小，对着一个恶意的
 * 无限流就是直接把进程撑爆。这里边收边算，超了立刻断。
 */
async function readCapped(response: Response, cap: number, label: string): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length') ?? '')
  if (Number.isFinite(declared) && declared > cap) {
    throw new WorkbenchError(
      `${label} 的包声明有 ${String(declared)} 字节，超过 ${String(cap)} 上限`,
      'WORKBENCH_PACKAGE_TOO_LARGE',
    )
  }
  const body = response.body
  if (body === null) throw new WorkbenchError(`${label} 没有返回包内容`, 'WORKBENCH_DOWNLOAD_FAILED')
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of body as unknown as AsyncIterable<Uint8Array>) {
    total += chunk.byteLength
    if (total > cap) {
      throw new WorkbenchError(
        `${label} 的包超过 ${String(cap)} 字节上限，已中断下载`,
        'WORKBENCH_PACKAGE_TOO_LARGE',
      )
    }
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/** 从 URL 取一个技能包。 */
export async function fetchPackage(
  url: string,
  label: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<PackageFile[]> {
  throwIfAborted(signal)
  let response: Response
  try {
    response = await fetch(url, {
      headers: { accept: 'application/octet-stream, application/gzip, application/zip, */*' },
      redirect: 'follow',
      signal: signal ?? AbortSignal.timeout(timeoutMs),
    })
  } catch (error: unknown) {
    if (signal?.aborted === true || isAbortError(error)) {
      throw new WorkbenchError('技能包下载已取消', 'WORKBENCH_ABORTED', { cause: error })
    }
    throw new WorkbenchError(`下载 ${label} 失败：${String(error)}`, 'WORKBENCH_DOWNLOAD_FAILED', { cause: error })
  }
  if (!response.ok) {
    throw new WorkbenchError(
      `下载 ${label} 失败：HTTP ${String(response.status)}`,
      'WORKBENCH_DOWNLOAD_FAILED',
    )
  }
  const data = await readCapped(response, MAX_TOTAL_BYTES, label)
  return stripCommonPrefix(await extractPackage(data))
}

/**
 * 浏览器上传的压缩包，允许多大。
 *
 * 比解包那边的 {@link MAX_TOTAL_BYTES} 紧得多，因为这条路径与那条不同：包字节
 * 是**随一次 Remote 调用整个传上来**的，base64 之后还要涨三分之一，中途没有
 * 分片也没有流式。技能包本来就小——市场上最大的也就几百 KB——所以这里按
 * 「够用且不会把一次调用撑爆」定，而不是照抄解包上限。
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

/**
 * 把浏览器传上来的 base64 解回压缩包字节。
 *
 * @param contentBase64 - 包字节的 base64。
 * @param label - 出错时用来指代它的名字，通常是原始文件名。
 * @returns 压缩包字节。
 */
export function decodeUploadedPackage(contentBase64: string, label: string): Buffer {
  const encoded = contentBase64.trim()
  if (encoded === '') {
    throw new WorkbenchError(`${label} 是空的，没有可安装的内容`, 'WORKBENCH_MISSING_ARG')
  }
  // 先按 base64 的长度估算原始体积再解码：`Buffer.from` 会先分配再让人检查，
  // 对着一个超大字符串就是白分配一次内存。
  const estimated = Math.floor(encoded.length * 3 / 4)
  if (estimated > MAX_UPLOAD_BYTES) {
    throw new WorkbenchError(
      `${label} 约 ${String(estimated)} 字节，超过上传上限 ${String(MAX_UPLOAD_BYTES)}；`
      + '这么大的包请放到盘上或发到市场，再用 workbench_skill 的 import 装',
      'WORKBENCH_PACKAGE_TOO_LARGE',
    )
  }
  // Buffer 的 base64 解码是宽容的：非法字符被跳过而不报错，所以「解出来是空的」
  // 这一种要自己判，否则会一路走到解包器那里报一个看不懂的格式错误。
  const data = Buffer.from(encoded, 'base64')
  if (data.length === 0) {
    throw new WorkbenchError(`${label} 的内容不是合法的 base64`, 'WORKBENCH_PACKAGE_UNREADABLE')
  }
  return data
}

/**
 * 从一段已经在内存里的压缩包字节读一个技能包。
 *
 * 与 {@link readLocalPackage} 是同一条解包路径——同一套体积与路径检查、
 * 同样剥掉公共前缀目录。浏览器上传走这里：那份字节是用户在文件选择器里
 * 挑的，宿主这边没有它的路径可读。
 *
 * @param data - 压缩包字节。
 * @param label - 出错时用来指代它的名字，通常是原始文件名。
 * @returns 包内文件，路径已相对化。
 */
export async function readPackageBytes(data: Buffer, label: string): Promise<PackageFile[]> {
  if (data.length > MAX_TOTAL_BYTES) {
    throw new WorkbenchError(
      `压缩包 ${label} 有 ${String(data.length)} 字节，超过 ${String(MAX_TOTAL_BYTES)} 上限`,
      'WORKBENCH_PACKAGE_TOO_LARGE',
    )
  }
  const files = stripCommonPrefix(await extractPackage(data))
  // 一个文件都没解出来，几乎总是「这压根不是压缩包」——tar 没有开头的魔数，
  // 读到一堆不认识的字节时读取器不会报错，只是什么都读不出来。不在这里拦，
  // 错误会变成下一步那句「包里没有找到任何 SKILL.md（包内有：空包）」，
  // 而人刚才选的其实是一个 .txt。
  if (files.length === 0) {
    throw new WorkbenchError(
      `${label} 里没有解出任何文件：它多半不是 zip / tar / tgz 压缩包`,
      'WORKBENCH_PACKAGE_UNREADABLE',
    )
  }
  return files
}

/** 从本地压缩包读一个技能包。 */
export async function readLocalPackage(path: string): Promise<PackageFile[]> {
  let data: Buffer
  try {
    data = await readFile(path)
  } catch (error: unknown) {
    throw new WorkbenchError(`读不到压缩包 ${path}：${String(error)}`, 'WORKBENCH_PACKAGE_UNREADABLE', { cause: error })
  }
  return readPackageBytes(data, path)
}
