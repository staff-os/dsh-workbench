/**
 * 关键词检索：分词 + BM25。
 *
 * **为什么不是向量检索**：DSH 的 `ctx.llm` 只是对话适配器注册表，没有
 * embedding 能力，单机版没地方拿向量。这不是阉割——后端在
 * embedding 不可用时本来就回退关键词召回，`search` 返回的 `mode` 字段
 * 就是告诉调用方走了哪条路，这里同样返回 `keyword`。
 *
 * **中文怎么分**：没有分词器可用，所以走 CJK 二元分词（bigram），
 * 连续汉字切成逐位滑动的字对。**不出一元**：一元看上去能提高单字
 * 查询的召回，实际上是把「的」「在」「不」这类几乎出现在每一块里的字
 * 变成了可匹配项，结果是任何带虚词的查询都能把全库召回来——而且它不报错，
 * 只是给出一堆不相干的段落。单字自成一段（两边都是非汉字）时才当一个词收。
 *
 * @module @staff-os/dsh-workbench/knowledge/search
 */

/** BM25 的词频饱和参数。 */
const K1 = 1.2

/** BM25 的长度归一化强度。 */
const B = 0.75

/** CJK 字符（含扩展 A 区、日文假名、韩文），这些不按空白分词。 */
const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/u

/** 拉丁字母、数字与下划线组成的词。 */
const LATIN_WORD = /[A-Za-z0-9_]+/gu

/**
 * 把一段文本切成检索词。
 *
 * 大小写统一成小写；拉丁词整词入索引；CJK 连续段切成二元字对。
 */
export function tokenize(text: string): string[] {
  const lower = text.toLowerCase()
  const tokens: string[] = []

  LATIN_WORD.lastIndex = 0
  for (let match = LATIN_WORD.exec(lower); match !== null; match = LATIN_WORD.exec(lower)) {
    tokens.push(match[0])
  }

  let run = ''
  const flush = (): void => {
    if (run === '') return
    if (run.length === 1) tokens.push(run)
    else for (let at = 0; at + 1 < run.length; at += 1) tokens.push(run.slice(at, at + 2))
    run = ''
  }
  for (const char of lower) {
    if (CJK.test(char)) run += char
    else flush()
  }
  flush()

  return tokens
}

/** 统计词频。 */
export function termFrequencies(text: string): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const token of tokenize(text)) {
    counts[token] = (counts[token] ?? 0) + 1
  }
  return counts
}

/** 参与打分的一个块。 */
export interface ScorableChunk {
  readonly id: string
  readonly terms: Readonly<Record<string, number>>
  /** 该块的词数，用于长度归一化。 */
  readonly length: number
}

/** 打分需要的语料统计。 */
export interface CorpusStats {
  /** 每个词出现在多少个块里。 */
  readonly df: Readonly<Record<string, number>>
  /** 块总数。 */
  readonly count: number
  /** 全部块的平均词数。 */
  readonly averageLength: number
}

/**
 * 计算一个词的 IDF。
 *
 * 用带平滑的 Robertson-Sparck Jones 形式，并整体加 1 再取对数：
 * 不加的话，出现在半数以上块里的词会得到负分，一个高频词能把整条查询
 * 的得分拉成负的。
 */
export function idf(df: number, count: number): number {
  return Math.log(1 + (count - df + 0.5) / (df + 0.5))
}

/** 一条检索结果。 */
export interface ScoredChunk {
  readonly id: string
  readonly score: number
  /** 实际命中的词，用来向用户解释为什么这条被召回。 */
  readonly matched: readonly string[]
}

/**
 * 用 BM25 给块打分。
 * @returns 得分大于 0 的块，按分数从高到低。
 */
export function scoreChunks(
  query: string,
  chunks: readonly ScorableChunk[],
  stats: CorpusStats,
): ScoredChunk[] {
  const queryTerms = [...new Set(tokenize(query))]
  if (queryTerms.length === 0 || chunks.length === 0) return []
  const averageLength = stats.averageLength > 0 ? stats.averageLength : 1

  const scored: ScoredChunk[] = []
  for (const chunk of chunks) {
    let score = 0
    const matched: string[] = []
    for (const term of queryTerms) {
      const frequency = chunk.terms[term]
      if (frequency === undefined || frequency === 0) continue
      const weight = idf(stats.df[term] ?? 0, stats.count)
      const norm = K1 * (1 - B + B * (chunk.length / averageLength))
      score += weight * ((frequency * (K1 + 1)) / (frequency + norm))
      matched.push(term)
    }
    if (score > 0) scored.push({ id: chunk.id, score, matched })
  }
  // 同分时按 id 排，让结果稳定可复现。
  return scored.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
}
