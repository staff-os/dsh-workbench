/**
 * 文档分块。
 *
 * 语义沿用知识库约定：`chunkSize` 是**字符**上限、`chunkOverlap`
 * 是相邻块的重叠字符数。按字符而不是 token 切是刻意的——单机版没有分词器，
 * 而中文按 token 估算的误差比按字符大得多。
 *
 * 重叠不是冗余：一句话被切在两块中间时，只有靠重叠才能保证至少有一块
 * 完整包含它，否则检索永远命中不到跨界的内容。
 *
 * @module @staff-os/dsh-workbench/knowledge/chunk
 */

/** 默认块大小（字符）。 */
export const DEFAULT_CHUNK_SIZE = 1_000

/** 默认重叠（字符）。 */
export const DEFAULT_CHUNK_OVERLAP = 200

/** 块大小的合法区间。 */
export const MIN_CHUNK_SIZE = 100
export const MAX_CHUNK_SIZE = 8_000

/** 分块参数。 */
export interface ChunkOptions {
  readonly chunkSize: number
  readonly chunkOverlap: number
}

/** 一个分块。 */
export interface TextChunk {
  /** 在文档内的序号，从 0 起。 */
  readonly index: number
  /** 在原文里的起止字符位置，半开区间。 */
  readonly start: number
  readonly end: number
  readonly text: string
}

/** 归一分块参数，越界的值夹回合法区间。 */
export function normalizeChunkOptions(options?: Partial<ChunkOptions>): ChunkOptions {
  const chunkSize = clamp(options?.chunkSize ?? DEFAULT_CHUNK_SIZE, MIN_CHUNK_SIZE, MAX_CHUNK_SIZE)
  // 重叠必须小于块大小，等于或超过会让游标原地打转。
  const maxOverlap = Math.floor(chunkSize / 2)
  const chunkOverlap = clamp(options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP, 0, maxOverlap)
  return { chunkSize, chunkOverlap }
}

function clamp(value: number, low: number, high: number): number {
  if (!Number.isFinite(value)) return low
  return Math.min(Math.max(Math.trunc(value), low), high)
}

/**
 * 在窗口尾部找一个自然断点。
 *
 * 优先级从强到弱：空行 > 换行 > 句末标点 > 空白。只在窗口的后 30% 里找，
 * 找得太靠前会把块切得远小于 chunkSize，白白增加块数。
 *
 * @returns 断点位置（该位置**之后**开始下一块）；找不到时返回 `undefined`。
 */
function findBreak(text: string, from: number, to: number): number | undefined {
  const floor = from + Math.floor((to - from) * 0.7)
  const window = text.slice(floor, to)

  const blank = window.lastIndexOf('\n\n')
  if (blank >= 0) return floor + blank + 2

  const line = window.lastIndexOf('\n')
  if (line >= 0) return floor + line + 1

  // 中英文句末标点都算；后面常跟着引号或右括号，一起带上。
  const sentence = /[。！？；.!?;](?:["'”’)）\]】》]*)\s*/gu
  let last: number | undefined
  for (let match = sentence.exec(window); match !== null; match = sentence.exec(window)) {
    last = floor + match.index + match[0].length
  }
  if (last !== undefined) return last

  const space = window.search(/\s\S*$/u)
  if (space >= 0) return floor + space + 1

  return undefined
}

/**
 * 把文本切成带重叠的块。
 *
 * 空文本给空数组而不是一个空块：一个内容为空的块会污染 BM25 的平均长度。
 */
export function chunkText(text: string, options?: Partial<ChunkOptions>): TextChunk[] {
  const { chunkSize, chunkOverlap } = normalizeChunkOptions(options)
  const body = text.replace(/\r\n/gu, '\n')
  if (body.trim() === '') return []

  const chunks: TextChunk[] = []
  let start = 0
  while (start < body.length) {
    const hardEnd = Math.min(start + chunkSize, body.length)
    const end = hardEnd >= body.length ? body.length : findBreak(body, start, hardEnd) ?? hardEnd
    const slice = body.slice(start, end)
    if (slice.trim() !== '') {
      chunks.push({ index: chunks.length, start, end, text: slice.trim() })
    }
    if (end >= body.length) break
    // 至少前进一个字符：断点回退加上重叠回退，理论上能把游标推回原地。
    start = Math.max(end - chunkOverlap, start + 1)
  }
  return chunks
}
