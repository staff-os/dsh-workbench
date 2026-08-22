/**
 * 本地知识库的存储层。
 *
 * 布局：
 * ```
 * $DSH_HOME/workbench/knowledge/<kb-id>/
 * ├── kb.json               名称、描述、分块参数
 * ├── documents/<doc-id>.<ext>
 * └── index.json            分块正文 + 词频 + 文档频次
 * ```
 *
 * 计数不单独存：文档数与块数都从 `index.json` 现算。存一份计数器意味着
 * 它和实际内容有两个真相，而两者不一致时没有任何报错——只是 list 里的
 * 数字对不上。
 *
 * @module @staff-os/dsh-workbench/knowledge/store
 */

import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { DIR_MODE, FILE_MODE } from '../paths.ts'
import { WorkbenchError } from '../types.ts'
import { chunkText, normalizeChunkOptions } from './chunk.ts'
import type { ChunkOptions } from './chunk.ts'
import { scoreChunks, termFrequencies, tokenize } from './search.ts'
import type { CorpusStats } from './search.ts'

/** 知识库 id 与文档 id 的形状。 */
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

/** 单个文档的体积上限。 */
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024

const KB_FILE = 'kb.json'
const INDEX_FILE = 'index.json'
const DOCUMENTS_DIR = 'documents'
const INDEX_VERSION = 1

/** 一个知识库的元数据。 */
export interface KnowledgeBase {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly chunkSize: number
  readonly chunkOverlap: number
  readonly createdAt: string
  readonly updatedAt: string
}

/** 知识库里的一个文档。 */
export interface KnowledgeDocument {
  readonly id: string
  /** 原始文件名，含扩展名。 */
  readonly filename: string
  readonly title?: string
  readonly bytes: number
  readonly chunkCount: number
  readonly addedAt: string
}

/** 索引里的一个块。 */
export interface IndexedChunk {
  readonly id: string
  readonly documentId: string
  readonly index: number
  readonly text: string
  /** 该块的词数。 */
  readonly length: number
  readonly terms: Readonly<Record<string, number>>
}

/** 一个知识库的完整索引。 */
export interface KnowledgeIndex {
  readonly version: number
  readonly documents: readonly KnowledgeDocument[]
  readonly chunks: readonly IndexedChunk[]
  /** 每个词出现在多少个块里。 */
  readonly df: Readonly<Record<string, number>>
  /** 全部块的词数之和。 */
  readonly totalLength: number
}

/** 新建知识库的入参。 */
export interface KnowledgeBaseInput {
  readonly id?: string
  readonly name: string
  readonly description?: string
  readonly chunkSize?: number
  readonly chunkOverlap?: number
}

/** 新增文档的入参。 */
export interface DocumentInput {
  readonly filename: string
  readonly content: string
  readonly title?: string
}

/** 一条检索命中。 */
export interface SearchHit {
  readonly knowledgeBaseId: string
  readonly knowledgeBaseName: string
  readonly documentId: string
  readonly documentTitle: string
  readonly chunkIndex: number
  readonly score: number
  readonly text: string
  readonly matched: readonly string[]
}

/** 检索结果。 */
export interface SearchResult {
  readonly hits: readonly SearchHit[]
  /**
   * 走了哪条召回路径。单机版恒为 `keyword`——字段保留是为了
   * 与后端的返回形状一致，将来接回向量检索时调用方不用改。
   */
  readonly mode: 'keyword'
}

/** 校验一个 id。 */
export function assertId(id: string, what: string): void {
  if (!ID_PATTERN.test(id)) {
    throw new WorkbenchError(
      `${what} "${id}" 不合法：必须是小写字母数字的短横线分隔形式`,
      'WORKBENCH_KB_BAD_ID',
    )
  }
}

/** 从任意文本压出一个合法 id。 */
export function slugify(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/u, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
  return slug
}

function kbDir(root: string, id: string): string {
  return join(root, id)
}

function emptyIndex(): KnowledgeIndex {
  return { version: INDEX_VERSION, documents: [], chunks: [], df: {}, totalLength: 0 }
}

async function readJson<T>(path: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T
  } catch {
    return undefined
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFileAtomic(path, `${JSON.stringify(value, undefined, 2)}\n`, {
    mode: FILE_MODE,
    dirMode: DIR_MODE,
  })
}

/** 读一个知识库的元数据；不存在时给 `undefined`。 */
export async function readKnowledgeBase(root: string, id: string): Promise<KnowledgeBase | undefined> {
  assertId(id, '知识库 id')
  return readJson<KnowledgeBase>(join(kbDir(root, id), KB_FILE))
}

/** 读一个知识库的元数据；不存在就抛。 */
async function requireKnowledgeBase(root: string, id: string): Promise<KnowledgeBase> {
  const kb = await readKnowledgeBase(root, id)
  if (kb === undefined) throw new WorkbenchError(`知识库 "${id}" 不存在`, 'WORKBENCH_KB_NOT_FOUND')
  return kb
}

/** 列出全部知识库。 */
export async function listKnowledgeBases(root: string): Promise<KnowledgeBase[]> {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return []
  }
  const bases: KnowledgeBase[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const kb = await readJson<KnowledgeBase>(join(root, entry.name, KB_FILE))
    if (kb !== undefined) bases.push(kb)
  }
  return bases.sort((left, right) => left.id.localeCompare(right.id))
}

/** 读一个知识库的索引；没有索引时给空索引。 */
export async function readIndex(root: string, id: string): Promise<KnowledgeIndex> {
  const index = await readJson<KnowledgeIndex>(join(kbDir(root, id), INDEX_FILE))
  if (index === undefined || index.version !== INDEX_VERSION) return emptyIndex()
  return index
}

/** 新建一个知识库。 */
export async function createKnowledgeBase(root: string, input: KnowledgeBaseInput): Promise<KnowledgeBase> {
  const name = input.name.trim()
  if (name === '') {
    throw new WorkbenchError('知识库必须有名称', 'WORKBENCH_KB_NO_NAME')
  }
  const id = input.id?.trim() ?? slugify(name)
  if (id === '') {
    throw new WorkbenchError(
      `无法从名称 "${name}" 生成 id，请显式指定 id`,
      'WORKBENCH_KB_BAD_ID',
    )
  }
  assertId(id, '知识库 id')
  if (await readKnowledgeBase(root, id) !== undefined) {
    throw new WorkbenchError(`知识库 "${id}" 已存在`, 'WORKBENCH_KB_DUPLICATE')
  }
  const description = input.description?.trim()
  const options = normalizeChunkOptions({
    ...input.chunkSize === undefined ? {} : { chunkSize: input.chunkSize },
    ...input.chunkOverlap === undefined ? {} : { chunkOverlap: input.chunkOverlap },
  })
  const now = new Date().toISOString()
  const kb: KnowledgeBase = {
    id,
    name,
    ...description === undefined || description === '' ? {} : { description },
    chunkSize: options.chunkSize,
    chunkOverlap: options.chunkOverlap,
    createdAt: now,
    updatedAt: now,
  }
  await mkdir(join(kbDir(root, id), DOCUMENTS_DIR), { recursive: true, mode: DIR_MODE })
  await writeJson(join(kbDir(root, id), KB_FILE), kb)
  await writeJson(join(kbDir(root, id), INDEX_FILE), emptyIndex())
  return kb
}

/** 可改的知识库字段。 */
export interface KnowledgeBasePatch {
  readonly name?: string
  readonly description?: string
  readonly chunkSize?: number
  readonly chunkOverlap?: number
}

/**
 * 改知识库设置。
 *
 * 改了分块参数会**整库重建索引**——旧块是按旧参数切的，混着用会让同一个
 * 知识库里的块长短不一，BM25 的长度归一化直接失真。
 */
export async function updateKnowledgeBase(
  root: string,
  id: string,
  patch: KnowledgeBasePatch,
): Promise<{ kb: KnowledgeBase; reindexed: boolean }> {
  const current = await requireKnowledgeBase(root, id)
  const options = normalizeChunkOptions({
    chunkSize: patch.chunkSize ?? current.chunkSize,
    chunkOverlap: patch.chunkOverlap ?? current.chunkOverlap,
  })
  const name = patch.name?.trim()
  const next: KnowledgeBase = {
    id: current.id,
    name: name === undefined || name === '' ? current.name : name,
    ...resolveDescription(current.description, patch.description),
    chunkSize: options.chunkSize,
    chunkOverlap: options.chunkOverlap,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }
  await writeJson(join(kbDir(root, id), KB_FILE), next)

  const reindexed = options.chunkSize !== current.chunkSize || options.chunkOverlap !== current.chunkOverlap
  if (reindexed) await rebuildIndex(root, next)
  return { kb: next, reindexed }
}

/**
 * 决定改完之后的描述。
 *
 * 显式传空串是「清空」而不是「不改」：否则一段写错的描述就再也删不掉了。
 */
function resolveDescription(
  current: string | undefined,
  patch: string | undefined,
): { description?: string } {
  if (patch === undefined) return current === undefined ? {} : { description: current }
  const trimmed = patch.trim()
  return trimmed === '' ? {} : { description: trimmed }
}

/** 删掉一个知识库及其全部文档。 */
export async function removeKnowledgeBase(root: string, id: string): Promise<KnowledgeBase> {
  const kb = await requireKnowledgeBase(root, id)
  await rm(kbDir(root, id), { recursive: true, force: true })
  return kb
}

/** 把一组块累加进语料统计。 */
function accumulate(chunks: readonly IndexedChunk[]): { df: Record<string, number>; totalLength: number } {
  const df: Record<string, number> = {}
  let totalLength = 0
  for (const chunk of chunks) {
    totalLength += chunk.length
    for (const term of Object.keys(chunk.terms)) df[term] = (df[term] ?? 0) + 1
  }
  return { df, totalLength }
}

/** 把一个文档切块并算好词频。 */
function indexDocument(
  documentId: string,
  content: string,
  options: ChunkOptions,
): IndexedChunk[] {
  return chunkText(content, options).map(chunk => ({
    id: `${documentId}#${String(chunk.index)}`,
    documentId,
    index: chunk.index,
    text: chunk.text,
    length: tokenize(chunk.text).length,
    terms: termFrequencies(chunk.text),
  }))
}

/** 文档在盘上的路径。 */
function documentPath(root: string, kbId: string, document: KnowledgeDocument): string {
  return join(kbDir(root, kbId), DOCUMENTS_DIR, storedName(document))
}

/** 文档在盘上的文件名：id 加上原扩展名，避免不同文档撞名。 */
function storedName(document: KnowledgeDocument): string {
  const dot = document.filename.lastIndexOf('.')
  const extension = dot > 0 ? document.filename.slice(dot) : '.txt'
  return `${document.id}${extension}`
}

/**
 * 从盘上的文档重建整个索引。
 *
 * 用在改了分块参数、或索引与文档目录对不上的时候。读不出来的文档会被
 * 剔出清单而不是让整次重建失败——重建的目的就是让索引回到与盘一致。
 */
export async function rebuildIndex(root: string, kb: KnowledgeBase): Promise<KnowledgeIndex> {
  const indexPath = join(kbDir(root, kb.id), INDEX_FILE)
  await mkdir(join(kbDir(root, kb.id), DOCUMENTS_DIR), { recursive: true, mode: DIR_MODE })
  return withFileLock(indexPath, async () => {
    const current = await readIndex(root, kb.id)
    const options = normalizeChunkOptions(kb)
    const documents: KnowledgeDocument[] = []
    const chunks: IndexedChunk[] = []
    for (const document of current.documents) {
      let content: string
      try {
        content = await readFile(documentPath(root, kb.id, document), 'utf8')
      } catch {
        continue
      }
      const documentChunks = indexDocument(document.id, content, options)
      chunks.push(...documentChunks)
      documents.push({ ...document, chunkCount: documentChunks.length })
    }
    const next: KnowledgeIndex = { version: INDEX_VERSION, documents, chunks, ...accumulate(chunks) }
    await writeJson(indexPath, next)
    return next
  })
}

/** 在已有文档 id 里挑一个不冲突的。 */
function uniqueDocumentId(base: string, taken: ReadonlySet<string>): string {
  const seed = base === '' ? 'document' : base
  if (!taken.has(seed)) return seed
  for (let suffix = 2; suffix < 10_000; suffix += 1) {
    const candidate = `${seed}-${String(suffix)}`
    if (!taken.has(candidate)) return candidate
  }
  throw new WorkbenchError(`无法为 "${base}" 生成不冲突的文档 id`, 'WORKBENCH_KB_ID_EXHAUSTED')
}

/**
 * 往知识库里加一个文档。
 *
 * 只收文本：二进制在这里明确报错而不是存进去再检索不到。PDF / Office
 * 需要额外的解析依赖，本插件不预先引入。
 */
export async function addDocument(
  root: string,
  kbId: string,
  input: DocumentInput,
): Promise<{ document: KnowledgeDocument; chunkCount: number }> {
  const kb = await requireKnowledgeBase(root, kbId)
  const filename = input.filename.trim()
  if (filename === '' || /[\\/]/u.test(filename) || filename.includes('\0')) {
    throw new WorkbenchError(
      `文件名 "${input.filename}" 不合法：必须是不含路径分隔符的裸文件名`,
      'WORKBENCH_KB_BAD_FILENAME',
    )
  }
  if (input.content.includes('\0')) {
    throw new WorkbenchError(
      `"${filename}" 看起来是二进制文件；知识库只收文本（PDF、Office 等请先转成 Markdown 或纯文本）`,
      'WORKBENCH_KB_BINARY',
    )
  }
  const bytes = Buffer.byteLength(input.content, 'utf8')
  if (bytes > MAX_DOCUMENT_BYTES) {
    throw new WorkbenchError(
      `"${filename}" 有 ${String(bytes)} 字节，超过单文档上限 ${String(MAX_DOCUMENT_BYTES)}`,
      'WORKBENCH_KB_TOO_LARGE',
    )
  }
  if (input.content.trim() === '') {
    throw new WorkbenchError(`"${filename}" 是空文档，没有可索引的内容`, 'WORKBENCH_KB_EMPTY_DOCUMENT')
  }

  const indexPath = join(kbDir(root, kbId), INDEX_FILE)
  await mkdir(join(kbDir(root, kbId), DOCUMENTS_DIR), { recursive: true, mode: DIR_MODE })
  return withFileLock(indexPath, async () => {
    const current = await readIndex(root, kbId)
    const taken = new Set(current.documents.map(document => document.id))
    const documentId = uniqueDocumentId(slugify(filename), taken)
    const title = input.title?.trim()
    const document: KnowledgeDocument = {
      id: documentId,
      filename,
      ...title === undefined || title === '' ? {} : { title },
      bytes,
      chunkCount: 0,
      addedAt: new Date().toISOString(),
    }
    await writeFile(documentPath(root, kbId, document), input.content, {
      encoding: 'utf8',
      mode: FILE_MODE,
    })

    const chunks = indexDocument(documentId, input.content, normalizeChunkOptions(kb))
    const stored: KnowledgeDocument = { ...document, chunkCount: chunks.length }
    const allChunks = [...current.chunks, ...chunks]
    const next: KnowledgeIndex = {
      version: INDEX_VERSION,
      documents: [...current.documents, stored],
      chunks: allChunks,
      ...accumulate(allChunks),
    }
    await writeJson(indexPath, next)
    return { document: stored, chunkCount: chunks.length }
  })
}

/** 列出一个知识库里的文档。 */
export async function listDocuments(root: string, kbId: string): Promise<KnowledgeDocument[]> {
  await requireKnowledgeBase(root, kbId)
  const index = await readIndex(root, kbId)
  return [...index.documents]
}

/** 从知识库里删掉一个文档。 */
export async function removeDocument(
  root: string,
  kbId: string,
  documentId: string,
): Promise<KnowledgeDocument> {
  await requireKnowledgeBase(root, kbId)
  const indexPath = join(kbDir(root, kbId), INDEX_FILE)
  return withFileLock(indexPath, async () => {
    const current = await readIndex(root, kbId)
    const document = current.documents.find(candidate => candidate.id === documentId)
    if (document === undefined) {
      throw new WorkbenchError(
        `知识库 "${kbId}" 里没有文档 "${documentId}"`,
        'WORKBENCH_KB_DOCUMENT_NOT_FOUND',
      )
    }
    await rm(documentPath(root, kbId, document), { force: true })
    const chunks = current.chunks.filter(chunk => chunk.documentId !== documentId)
    const next: KnowledgeIndex = {
      version: INDEX_VERSION,
      documents: current.documents.filter(candidate => candidate.id !== documentId),
      chunks,
      ...accumulate(chunks),
    }
    await writeJson(indexPath, next)
    return document
  })
}

/** 读一个本地文件当作文档内容。 */
export async function readDocumentFile(path: string): Promise<{ filename: string; content: string }> {
  let info
  try {
    info = await stat(path)
  } catch (error: unknown) {
    throw new WorkbenchError(`读不到文件 ${path}`, 'WORKBENCH_KB_FILE_UNREADABLE', { cause: error })
  }
  if (!info.isFile()) {
    throw new WorkbenchError(`${path} 不是一个文件`, 'WORKBENCH_KB_FILE_UNREADABLE')
  }
  if (info.size > MAX_DOCUMENT_BYTES) {
    throw new WorkbenchError(
      `${path} 有 ${String(info.size)} 字节，超过单文档上限 ${String(MAX_DOCUMENT_BYTES)}`,
      'WORKBENCH_KB_TOO_LARGE',
    )
  }
  const raw = await readFile(path)
  if (raw.includes(0)) {
    throw new WorkbenchError(
      `${path} 看起来是二进制文件；知识库只收文本（PDF、Office 等请先转成 Markdown 或纯文本）`,
      'WORKBENCH_KB_BINARY',
    )
  }
  const filename = path.split(/[\\/]/u).filter(segment => segment !== '').pop() ?? 'document.txt'
  return { filename, content: raw.toString('utf8') }
}

/**
 * 在若干知识库里做关键词检索。
 *
 * 每个知识库各算各的 IDF：把几个库的语料统计混在一起，会让大库的词频
 * 淹掉小库的，跨库结果就没法比了。
 */
export async function searchKnowledge(
  root: string,
  kbIds: readonly string[],
  query: string,
  topK: number,
): Promise<SearchResult> {
  const hits: SearchHit[] = []
  for (const kbId of kbIds) {
    const kb = await readKnowledgeBase(root, kbId)
    if (kb === undefined) continue
    const index = await readIndex(root, kbId)
    if (index.chunks.length === 0) continue
    const stats: CorpusStats = {
      df: index.df,
      count: index.chunks.length,
      averageLength: index.totalLength / index.chunks.length,
    }
    const byId = new Map(index.chunks.map(chunk => [chunk.id, chunk]))
    const titles = new Map(index.documents.map(document => [document.id, document.title ?? document.filename]))
    for (const scored of scoreChunks(query, index.chunks, stats).slice(0, topK)) {
      const chunk = byId.get(scored.id)
      if (chunk === undefined) continue
      hits.push({
        knowledgeBaseId: kb.id,
        knowledgeBaseName: kb.name,
        documentId: chunk.documentId,
        documentTitle: titles.get(chunk.documentId) ?? chunk.documentId,
        chunkIndex: chunk.index,
        score: scored.score,
        text: chunk.text,
        matched: scored.matched,
      })
    }
  }
  hits.sort((left, right) => right.score - left.score)
  return { hits: hits.slice(0, topK), mode: 'keyword' }
}
