/**
 * 面向模型的 `workbench_knowledge` 工具：本地知识库与关键词检索。
 * @module @staff-os/dsh-workbench/knowledge/tool
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenericCallView } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { requireConfirm, WorkbenchError } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import {
  addDocument,
  createKnowledgeBase,
  listDocuments,
  listKnowledgeBases,
  readDocumentFile,
  readIndex,
  readKnowledgeBase,
  removeDocument,
  removeKnowledgeBase,
  searchKnowledge,
  updateKnowledgeBase,
} from './store.ts'
import type { KnowledgeBase, KnowledgeDocument, SearchHit } from './store.ts'

/** 知识库工具的默认超时预算：重建索引要读完整库的文档。 */
export const DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS = 60_000

/** 默认返回几条检索结果。 */
const DEFAULT_TOP_K = 5

/** 检索结果条数上限。 */
const MAX_TOP_K = 20

/** 工具支持的动作。 */
const ACTIONS = [
  'list',
  'create',
  'get',
  'update',
  'delete',
  'add_document',
  'list_documents',
  'delete_document',
  'search',
] as const

type Action = typeof ACTIONS[number]

/** 工具入参。 */
interface KnowledgeArgs {
  action: string
  id?: string
  name?: string
  description?: string
  chunkSize?: number
  chunkOverlap?: number
  path?: string
  filename?: string
  content?: string
  title?: string
  documentId?: string
  query?: string
  topK?: number
  confirm?: boolean
}

/** 出参里的一个知识库。 */
interface KnowledgeBaseView {
  id: string
  name: string
  description?: string
  chunkSize: number
  chunkOverlap: number
  documentCount: number
  chunkCount: number
  updatedAt: string
}

/** 出参里的一个文档。 */
interface DocumentView {
  id: string
  filename: string
  title?: string
  bytes: number
  chunkCount: number
  addedAt: string
}

/** 出参里的一条检索命中。 */
interface HitView {
  knowledgeBaseId: string
  knowledgeBaseName: string
  documentId: string
  documentTitle: string
  chunkIndex: number
  score: number
  text: string
  matched: string[]
}

/** 工具出参。 */
interface KnowledgeOutput {
  action: string
  message: string
  knowledgeBases: KnowledgeBaseView[]
  documents: DocumentView[]
  hits: HitView[]
  /** 走了哪条召回路径；单机版恒为 keyword。 */
  mode?: string
}

/** 校验动作名。 */
export function parseKnowledgeAction(raw: string): Action {
  const action = ACTIONS.find(candidate => candidate === raw)
  if (action === undefined) {
    throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS.join('、')}`, 'WORKBENCH_BAD_ACTION')
  }
  return action
}

function requireArg(value: string | undefined, field: string, action: Action): string {
  const trimmed = value?.trim()
  if (trimmed === undefined || trimmed === '') {
    throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, 'WORKBENCH_MISSING_ARG')
  }
  return trimmed
}

function projectDocument(document: KnowledgeDocument): DocumentView {
  return {
    id: document.id,
    filename: document.filename,
    ...document.title === undefined ? {} : { title: document.title },
    bytes: document.bytes,
    chunkCount: document.chunkCount,
    addedAt: document.addedAt,
  }
}

function projectHit(hit: SearchHit): HitView {
  return {
    knowledgeBaseId: hit.knowledgeBaseId,
    knowledgeBaseName: hit.knowledgeBaseName,
    documentId: hit.documentId,
    documentTitle: hit.documentTitle,
    chunkIndex: hit.chunkIndex,
    // 分数留两位，原始值的十几位小数对模型没有任何信息量。
    score: Math.round(hit.score * 100) / 100,
    text: hit.text,
    matched: [...hit.matched],
  }
}

/** 投影一个知识库，计数从索引现算。 */
async function projectBase(root: string, kb: KnowledgeBase): Promise<KnowledgeBaseView> {
  const index = await readIndex(root, kb.id)
  return {
    id: kb.id,
    name: kb.name,
    ...kb.description === undefined ? {} : { description: kb.description },
    chunkSize: kb.chunkSize,
    chunkOverlap: kb.chunkOverlap,
    documentCount: index.documents.length,
    chunkCount: index.chunks.length,
    updatedAt: kb.updatedAt,
  }
}

/** 渲染成给模型看的文本。 */
export function formatKnowledgeOutput(value: FormattableKnowledgeOutput): string {
  const lines: string[] = [value.message]
  if (value.knowledgeBases.length > 0) {
    lines.push('')
    for (const kb of value.knowledgeBases) {
      lines.push(
        `- ${kb.id}（${kb.name}）：${String(kb.documentCount)} 个文档，`
        + `${String(kb.chunkCount)} 个分块${kb.description === undefined ? '' : `；${kb.description}`}`,
      )
    }
  }
  if (value.documents.length > 0) {
    lines.push('')
    for (const document of value.documents) {
      lines.push(
        `- ${document.id}：${document.title ?? document.filename}`
        + `（${String(document.bytes)} 字节，${String(document.chunkCount)} 个分块）`,
      )
    }
  }
  if (value.hits.length > 0) {
    lines.push('')
    for (const hit of value.hits) {
      lines.push(
        `【${hit.knowledgeBaseName} / ${hit.documentTitle} #${String(hit.chunkIndex)}】`
        + `得分 ${String(hit.score)}`,
      )
      lines.push(hit.text)
      lines.push('')
    }
    lines.push('以上为关键词检索（BM25）结果，不是语义检索；如果没找到想要的内容，换几个关键词再试。')
  }
  return lines.join('\n')
}

/** {@link formatKnowledgeOutput} 需要的最小形状。 */
interface FormattableKnowledgeOutput {
  readonly message: string
  readonly knowledgeBases: readonly {
    readonly id: string
    readonly name: string
    readonly description?: string | undefined
    readonly documentCount: number
    readonly chunkCount: number
  }[]
  readonly documents: readonly {
    readonly id: string
    readonly filename: string
    readonly title?: string | undefined
    readonly bytes: number
    readonly chunkCount: number
  }[]
  readonly hits: readonly {
    readonly knowledgeBaseName: string
    readonly documentTitle: string
    readonly chunkIndex: number
    readonly score: number
    readonly text: string
  }[]
}

const KB_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    chunkSize: { type: 'number', required: true },
    chunkOverlap: { type: 'number', required: true },
    documentCount: { type: 'number', required: true },
    chunkCount: { type: 'number', required: true },
    updatedAt: { type: 'string', required: true },
  },
} as const

const DOCUMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    filename: { type: 'string', required: true },
    title: { type: 'string' },
    bytes: { type: 'number', required: true },
    chunkCount: { type: 'number', required: true },
    addedAt: { type: 'string', required: true },
  },
} as const

const HIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    knowledgeBaseId: { type: 'string', required: true },
    knowledgeBaseName: { type: 'string', required: true },
    documentId: { type: 'string', required: true },
    documentTitle: { type: 'string', required: true },
    chunkIndex: { type: 'number', required: true },
    score: { type: 'number', required: true },
    text: { type: 'string', required: true },
    matched: { type: 'array', required: true, items: { type: 'string' } },
  },
} as const

/**
 * 注册 `workbench_knowledge` 工具及其使用指引。
 */
export function applyKnowledgeTool(ctx: Context, timeoutMs: number): void {
  ctx.systemPrompt.section({
    name: 'tool:workbench_knowledge',
    order: 123,
    text: [
      'workbench_knowledge 管理本机的知识库，内容存在 $DSH_HOME/workbench/knowledge 下。',
      '检索走的是关键词（BM25）而不是语义向量：查询词要贴近原文用词，同义换词召不回来，',
      '一次查不到就换几个说法再试，不要断言知识库里没有。',
      'add_document 只收文本，PDF 与 Office 要先转成 Markdown 或纯文本。',
      'delete 与 delete_document 不可逆，必须先向用户说明再带 confirm: true 调用。',
    ].join(''),
  })

  ctx.tools.register(defineTool({
    name: 'workbench_knowledge',
    description: [
      'Manage local knowledge bases and search them by keyword. ',
      'Actions: list, create, get, update, delete (needs confirm), ',
      'add_document, list_documents, delete_document (needs confirm), search. ',
      'Retrieval is BM25 keyword matching over text chunks, not semantic vector search, ',
      'so queries should use wording close to the source documents. ',
      'Everything is stored as local files under $DSH_HOME/workbench/knowledge.',
    ].join(''),
    parameters: {
      action: { type: 'string', required: true, enum: ACTIONS, description: 'Which operation to perform.' },
      id: {
        type: 'string',
        description: 'Knowledge base id in kebab-case. Required for get/update/delete/add_document/list_documents/delete_document. On search, omit to search every knowledge base.',
      },
      name: { type: 'string', description: 'create/update: human readable name. On create the id is derived from it unless id is given.' },
      description: { type: 'string', description: 'create/update: what this knowledge base holds. Pass an empty string on update to clear it.' },
      chunkSize: { type: 'integer', description: 'create/update: maximum characters per chunk (100-8000, default 1000). Changing it on update rebuilds the whole index.' },
      chunkOverlap: { type: 'integer', description: 'create/update: characters shared between neighbouring chunks (default 200, capped at half of chunkSize). Changing it on update rebuilds the whole index.' },
      path: { type: 'string', description: 'add_document: absolute path of a local text file to ingest.' },
      filename: { type: 'string', description: 'add_document: file name to record when passing content inline. Must be a bare name without any path separator.' },
      content: { type: 'string', description: 'add_document: the document text, when not reading from path.' },
      title: { type: 'string', description: 'add_document: display title; defaults to the file name.' },
      documentId: { type: 'string', description: 'delete_document: which document to remove, as reported by list_documents.' },
      query: { type: 'string', description: 'search: the keyword query.' },
      topK: { type: 'integer', description: `search: how many chunks to return, 1-${String(MAX_TOP_K)}. Defaults to ${String(DEFAULT_TOP_K)}.` },
      confirm: { type: 'boolean', description: 'Required to be true for delete and delete_document, which are irreversible. Ask the user first.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true },
          message: { type: 'string', required: true },
          knowledgeBases: { type: 'array', required: true, items: KB_SCHEMA },
          documents: { type: 'array', required: true, items: DOCUMENT_SCHEMA },
          hits: { type: 'array', required: true, items: HIT_SCHEMA },
          mode: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatKnowledgeOutput(value) }],
    },
    timeoutMs,
    // 索引是单一可变资源，写动作串行；读与检索没有共享可变状态。
    isConcurrencySafe: (args) => {
      const action = parseKnowledgeAction(args.action)
      return action === 'list' || action === 'get' || action === 'list_documents' || action === 'search'
    },
    async execute(args: KnowledgeArgs): Promise<KnowledgeOutput> {
      const runtime = ctx.workbench as WorkbenchRuntime
      const root = runtime.paths.knowledge
      const action = parseKnowledgeAction(args.action)
      const empty = { knowledgeBases: [], documents: [], hits: [] }

      if (action === 'list') {
        const bases = await listKnowledgeBases(root)
        return {
          ...empty,
          action,
          message: bases.length === 0
            ? '还没有任何知识库'
            : `共 ${String(bases.length)} 个知识库`,
          knowledgeBases: await Promise.all(bases.map(kb => projectBase(root, kb))),
        }
      }

      if (action === 'create') {
        const name = requireArg(args.name, 'name', action)
        const kb = await createKnowledgeBase(root, {
          name,
          ...args.id === undefined ? {} : { id: args.id.trim() },
          ...args.description === undefined ? {} : { description: args.description },
          ...args.chunkSize === undefined ? {} : { chunkSize: args.chunkSize },
          ...args.chunkOverlap === undefined ? {} : { chunkOverlap: args.chunkOverlap },
        })
        return {
          ...empty,
          action,
          message: `已创建知识库 "${kb.id}"，分块 ${String(kb.chunkSize)} 字符、重叠 ${String(kb.chunkOverlap)} 字符`,
          knowledgeBases: [await projectBase(root, kb)],
        }
      }

      if (action === 'search') {
        const query = requireArg(args.query, 'query', action)
        const topK = Math.min(Math.max(args.topK ?? DEFAULT_TOP_K, 1), MAX_TOP_K)
        const ids = args.id === undefined || args.id.trim() === ''
          ? (await listKnowledgeBases(root)).map(kb => kb.id)
          : [args.id.trim()]
        if (ids.length === 0) {
          return { ...empty, action, message: '还没有任何知识库，先用 create 建一个', mode: 'keyword' }
        }
        const result = await searchKnowledge(root, ids, query, topK)
        return {
          ...empty,
          action,
          message: result.hits.length === 0
            ? `在 ${ids.join('、')} 里没有匹配 "${query}" 的内容；关键词检索对同义换词无效，可以换几个更贴近原文的说法再试`
            : `在 ${ids.join('、')} 里找到 ${String(result.hits.length)} 段相关内容`,
          hits: result.hits.map(projectHit),
          mode: result.mode,
        }
      }

      const id = requireArg(args.id, 'id', action)

      if (action === 'get') {
        const kb = await readKnowledgeBase(root, id)
        if (kb === undefined) throw new WorkbenchError(`知识库 "${id}" 不存在`, 'WORKBENCH_KB_NOT_FOUND')
        const documents = await listDocuments(root, id)
        return {
          ...empty,
          action,
          message: `知识库 "${id}"`,
          knowledgeBases: [await projectBase(root, kb)],
          documents: documents.map(projectDocument),
        }
      }

      if (action === 'update') {
        const { kb, reindexed } = await updateKnowledgeBase(root, id, {
          ...args.name === undefined ? {} : { name: args.name },
          ...args.description === undefined ? {} : { description: args.description },
          ...args.chunkSize === undefined ? {} : { chunkSize: args.chunkSize },
          ...args.chunkOverlap === undefined ? {} : { chunkOverlap: args.chunkOverlap },
        })
        return {
          ...empty,
          action,
          message: `已更新知识库 "${id}"${reindexed ? '，分块参数变了，已整库重建索引' : ''}`,
          knowledgeBases: [await projectBase(root, kb)],
        }
      }

      if (action === 'delete') {
        requireConfirm(args.confirm, `删除知识库 "${id}" 及其全部文档`)
        const kb = await removeKnowledgeBase(root, id)
        return { ...empty, action, message: `已删除知识库 "${kb.id}"（${kb.name}）及其全部文档` }
      }

      if (action === 'list_documents') {
        const documents = await listDocuments(root, id)
        return {
          ...empty,
          action,
          message: documents.length === 0
            ? `知识库 "${id}" 里还没有文档`
            : `知识库 "${id}" 里有 ${String(documents.length)} 个文档`,
          documents: documents.map(projectDocument),
        }
      }

      if (action === 'delete_document') {
        const documentId = requireArg(args.documentId, 'documentId', action)
        requireConfirm(args.confirm, `从知识库 "${id}" 删除文档 "${documentId}"`)
        const document = await removeDocument(root, id, documentId)
        return {
          ...empty,
          action,
          message: `已从知识库 "${id}" 删除文档 "${document.id}"`,
          documents: [projectDocument(document)],
        }
      }

      // add_document
      if (args.path === undefined && args.content === undefined) {
        throw new WorkbenchError(
          '动作 "add_document" 必须给 path（读本地文件）或 content + filename（直接给内容）',
          'WORKBENCH_MISSING_ARG',
        )
      }
      const source = args.path !== undefined && args.path.trim() !== ''
        ? await readDocumentFile(args.path.trim())
        : { filename: requireArg(args.filename, 'filename', action), content: args.content ?? '' }
      const added = await addDocument(root, id, {
        filename: args.filename?.trim() ?? source.filename,
        content: source.content,
        ...args.title === undefined ? {} : { title: args.title },
      })
      return {
        ...empty,
        action,
        message: `已把 "${added.document.filename}" 加进知识库 "${id}"，切成 ${String(added.chunkCount)} 个分块`,
        documents: [projectDocument(added.document)],
      }
    },
    presentCall: (args: KnowledgeArgs): GenericCallView => {
      const subject = args.query ?? args.id ?? args.name
      return {
        card: 'generic',
        kind: 'search',
        title: subject === undefined ? `知识库：${args.action}` : `知识库：${args.action} ${subject}`,
        rawInput: args.action,
      }
    },
  }))
}
