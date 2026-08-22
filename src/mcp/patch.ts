/**
 * profile patch 层里的 MCP 行读写。
 *
 * DSH 没有 MCP 管理 API——一个 MCP 服务就是 profile `cordis.patch.yml` 的
 * insert 列表里一行 `name: '@deepseek-ai/dsh-mcp-client'`。所以「管理 MCP」
 * 本质上是**改一个用户会手工编辑的 YAML 文件**，这决定了两件事：
 *
 * 1. 必须走 AST 级操作而不是「读成对象再整个写回」。整写会抹掉注释，
 *    也会把 `!!js` 动态值烧成写死的字符串——那个值本来是启动时才求值的。
 * 2. 每次写盘前留一份 `.bak-<时间戳>`，并且只动目标行，其他插件的行原样保留。
 *
 * @module @staff-os/dsh-workbench/mcp/patch
 */

import { mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { isMap, isScalar, isSeq, parseDocument } from 'yaml'
import type { Document, Node, Scalar, YAMLMap, YAMLSeq } from 'yaml'
import { withFileLock, writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { DIR_MODE, FILE_MODE } from '../paths.ts'
import { WorkbenchError } from '../types.ts'

/** MCP 行的插件名；patch 行靠它识别。 */
export const MCP_PLUGIN_NAME = '@deepseek-ai/dsh-mcp-client'

/** 与 `@deepseek-ai/dsh-mcp-client` 自身的校验保持一致。 */
export const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/u

/** `!!js` 的完整标签名。 */
export const JS_TAG = 'tag:yaml.org,2002:js'

/**
 * 动态值在本模块读写模型里的前缀。
 *
 * `!!js` 节点求值前只是一段源码，读出来若直接给字符串，调用方无从分辨
 * 「值就是 `process.env.X` 这七个字」还是「这是个待求值表达式」。
 * 统一带上 `!!js ` 前缀，读写两侧就对称了。
 */
export const JS_PREFIX = '!!js '

/** 传输方式。 */
export type McpTransport = 'stdio' | 'streamable-http'

/** 一个 MCP 服务在 patch 里的样子。 */
export interface McpServer {
  /** patch 行 id。 */
  readonly rowId: string
  readonly serverName: string
  readonly transport: McpTransport
  readonly command?: string
  readonly args?: readonly string[]
  readonly env?: Readonly<Record<string, string>>
  readonly cwd?: string
  readonly url?: string
  readonly headers?: Readonly<Record<string, string>>
  readonly toolCallTimeoutMs?: number
  readonly failOnStartupError?: boolean
  /** 被同 patch 里的 `disabled: true` 条目关掉。 */
  readonly disabled: boolean
}

/** 新增或更新一个 MCP 服务时可给的字段。 */
export interface McpServerInput {
  readonly serverName: string
  readonly transport?: McpTransport
  readonly command?: string
  readonly args?: readonly string[]
  readonly env?: Readonly<Record<string, string>>
  readonly cwd?: string
  readonly url?: string
  readonly headers?: Readonly<Record<string, string>>
  readonly toolCallTimeoutMs?: number
  readonly failOnStartupError?: boolean
}

/** 由 serverName 推出 patch 行 id。 */
export function rowIdFor(serverName: string): string {
  return `mcp-${serverName}`
}

/** 校验 serverName，不合法就抛。 */
export function assertServerName(serverName: string): void {
  if (!SERVER_NAME_PATTERN.test(serverName)) {
    throw new WorkbenchError(
      `serverName "${serverName}" 不合法：只允许字母、数字、下划线和短横线，长度 1-32`,
      'WORKBENCH_MCP_BAD_NAME',
    )
  }
}

/**
 * 建一个空的 patch 文档。
 *
 * 顶层必须是**块式**序列：`parseDocument('[]')` 给的是流式序列，而 YAML 的
 * 流式上下文会传染给所有子节点，整个文件会渲染成 `[ { insert: [ ... ] } ]`
 * 那样的一行流——能加载，但用户没法再手工编辑。
 */
function emptyPatchDocument(): Document {
  const doc = parseDocument('[]')
  if (isSeq(doc.contents)) doc.contents.flow = false
  return doc
}

/**
 * 读出 patch 文档；文件不存在时给一个空的顶层序列。
 *
 * 解析**错误**才抛；解析**警告**要放行——`!!js` 就会产生一条
 * "Unresolved tag" 警告，那是预期内的，把它当错误会让所有含动态值的
 * patch 都打不开。
 */
export async function loadPatch(file: string): Promise<Document> {
  let content: string
  try {
    content = await readFile(file, 'utf8')
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException | null)?.code === 'ENOENT') return emptyPatchDocument()
    throw new WorkbenchError(`读取 patch 文件失败：${file}（${String(error)}）`, 'WORKBENCH_MCP_READ_FAILED')
  }
  const doc = parseDocument(content)
  if (doc.errors.length > 0) {
    const first = doc.errors[0]
    throw new WorkbenchError(
      `patch 文件解析失败：${file}（${first?.message ?? '未知错误'}）`,
      'WORKBENCH_MCP_PARSE_FAILED',
    )
  }
  if (doc.contents === null) return emptyPatchDocument()
  if (!isSeq(doc.contents)) {
    throw new WorkbenchError(`patch 文件必须是顶层 YAML 数组：${file}`, 'WORKBENCH_MCP_BAD_SHAPE')
  }
  return doc
}

/**
 * 写回 patch 文档：先备份、再原子替换，全程持有跨进程写锁。
 * @returns 备份文件路径；原文件不存在时为 `undefined`。
 */
export async function savePatch(file: string, doc: Document): Promise<string | undefined> {
  await mkdir(dirname(file), { recursive: true, mode: DIR_MODE })
  return withFileLock(file, async () => {
    let backup: string | undefined
    try {
      const previous = await readFile(file, 'utf8')
      backup = `${file}.bak-${String(Date.now())}`
      await writeFileAtomic(backup, previous, { mode: FILE_MODE, dirMode: DIR_MODE })
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException | null)?.code !== 'ENOENT') throw error
    }
    await writeFileAtomic(file, doc.toString({ singleQuote: true }), { mode: FILE_MODE, dirMode: DIR_MODE })
    return backup
  })
}

/** 顶层序列。 */
function root(doc: Document): YAMLSeq {
  if (!isSeq(doc.contents)) throw new WorkbenchError('patch 文档不是顶层数组', 'WORKBENCH_MCP_BAD_SHAPE')
  return doc.contents
}

/** 文档里所有 `insert` 列表。 */
function insertLists(doc: Document): YAMLSeq[] {
  const lists: YAMLSeq[] = []
  for (const entry of root(doc).items) {
    if (!isMap(entry)) continue
    const list = entry.get('insert', true)
    if (isSeq(list)) lists.push(list)
  }
  return lists
}

/**
 * 一个标量位置读成字符串；`!!js` 节点带上前缀以示区分。
 *
 * 两种形态都要认：从文件解析出来的是 `Scalar` 节点，而 `YAMLMap.set(key, 'x')`
 * 存进去的是**裸 JS 值**。只认前者的话，本轮刚写进文档、还没落盘重读的行
 * 会读不回来——写完立刻读回校验的路径就会假失败。
 */
function readScalar(node: unknown): string | undefined {
  if (isScalar(node)) {
    const raw = node.value
    if (raw === null || raw === undefined) return undefined
    const text = String(raw)
    return node.tag === JS_TAG ? `${JS_PREFIX}${text}` : text
  }
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') return String(node)
  return undefined
}

/** 建一个标量节点；带 `!!js ` 前缀的建成动态值节点。 */
function makeScalar(doc: Document, value: string): Node {
  if (!value.startsWith(JS_PREFIX)) return doc.createNode(value) as Node
  const node = doc.createNode(value.slice(JS_PREFIX.length)) as Scalar
  node.tag = JS_TAG
  return node
}

/** 读一个字符串字典（env / headers）。 */
function readDict(node: unknown): Record<string, string> | undefined {
  if (!isMap(node)) return undefined
  const out: Record<string, string> = {}
  for (const pair of node.items) {
    // 键和值一样有两种形态（解析出的 Scalar / set() 存进去的裸值），
    // 走同一个宽容读取，否则刚写进去的字典读回来是空的。
    const key = readScalar(pair.key)
    const value = readScalar(pair.value)
    if (key !== undefined && value !== undefined) out[key] = value
  }
  return out
}

/** 建一个字符串字典节点。 */
function makeDict(doc: Document, dict: Readonly<Record<string, string>>): Node {
  const map = doc.createNode({}) as YAMLMap
  for (const [key, value] of Object.entries(dict)) map.set(key, makeScalar(doc, value))
  return map
}

/** 读一个字符串数组。 */
function readList(node: unknown): string[] | undefined {
  if (!isSeq(node)) return undefined
  return node.items
    .map(item => readScalar(item))
    .filter((item): item is string => item !== undefined)
}

/** 定位一个 MCP 行。 */
interface RowLocation {
  readonly list: YAMLSeq
  readonly index: number
  readonly map: YAMLMap
}

function locateRow(doc: Document, serverName: string): RowLocation | undefined {
  for (const list of insertLists(doc)) {
    for (const [index, item] of list.items.entries()) {
      if (!isMap(item)) continue
      if (readScalar(item.get('name', true)) !== MCP_PLUGIN_NAME) continue
      const config = item.get('config', true)
      if (!isMap(config)) continue
      if (readScalar(config.get('serverName', true)) === serverName) return { list, index, map: item }
    }
  }
  return undefined
}

/** 收集被 `disabled: true` 关掉的行 id。 */
function disabledRowIds(doc: Document): Set<string> {
  const ids = new Set<string>()
  for (const entry of root(doc).items) {
    if (!isMap(entry)) continue
    if (entry.get('disabled') !== true) continue
    const id = readScalar(entry.get('id', true))
    if (id !== undefined) ids.add(id)
  }
  return ids
}

/** 列出 patch 里的全部 MCP 服务。 */
export function listServers(doc: Document): McpServer[] {
  const disabled = disabledRowIds(doc)
  const servers: McpServer[] = []
  for (const list of insertLists(doc)) {
    for (const item of list.items) {
      if (!isMap(item)) continue
      if (readScalar(item.get('name', true)) !== MCP_PLUGIN_NAME) continue
      const config = item.get('config', true)
      if (!isMap(config)) continue
      const serverName = readScalar(config.get('serverName', true))
      if (serverName === undefined) continue
      const rowId = readScalar(item.get('id', true)) ?? rowIdFor(serverName)
      const transport = readScalar(config.get('transport', true)) === 'streamable-http'
        ? 'streamable-http'
        : 'stdio'
      const command = readScalar(config.get('command', true))
      const args = readList(config.get('args', true))
      const env = readDict(config.get('env', true))
      const cwd = readScalar(config.get('cwd', true))
      const url = readScalar(config.get('url', true))
      const headers = readDict(config.get('headers', true))
      const timeout = config.get('toolCallTimeoutMs')
      const failOnStartupError = config.get('failOnStartupError')
      servers.push({
        rowId,
        serverName,
        transport,
        ...command === undefined ? {} : { command },
        ...args === undefined || args.length === 0 ? {} : { args },
        ...env === undefined || Object.keys(env).length === 0 ? {} : { env },
        ...cwd === undefined || cwd === '' ? {} : { cwd },
        ...url === undefined ? {} : { url },
        ...headers === undefined || Object.keys(headers).length === 0 ? {} : { headers },
        ...typeof timeout === 'number' ? { toolCallTimeoutMs: timeout } : {},
        ...typeof failOnStartupError === 'boolean' ? { failOnStartupError } : {},
        disabled: disabled.has(rowId),
      })
    }
  }
  return servers
}

/**
 * 校验一份输入在给定传输方式下是否自洽。
 *
 * stdio 要 command，streamable-http 要 url；两边的专属字段互相串台时直接报错，
 * 而不是默默丢掉——一个配了 `url` 却是 stdio 的服务起不来，且现场极难看出原因。
 */
function assertConsistent(transport: McpTransport, input: Partial<McpServerInput>): void {
  if (transport === 'stdio') {
    if (input.command === undefined || input.command === '') {
      throw new WorkbenchError('stdio 传输必须给 command', 'WORKBENCH_MCP_MISSING_COMMAND')
    }
    if (input.url !== undefined || input.headers !== undefined) {
      throw new WorkbenchError('stdio 传输不接受 url / headers', 'WORKBENCH_MCP_FIELD_CONFLICT')
    }
    return
  }
  if (input.url === undefined || input.url === '') {
    throw new WorkbenchError('streamable-http 传输必须给 url', 'WORKBENCH_MCP_MISSING_URL')
  }
  if (input.command !== undefined || input.args !== undefined || input.cwd !== undefined || input.env !== undefined) {
    throw new WorkbenchError('streamable-http 传输不接受 command / args / cwd / env', 'WORKBENCH_MCP_FIELD_CONFLICT')
  }
}

/** 建一个 MCP 行的 config 节点。 */
function makeConfig(doc: Document, transport: McpTransport, input: McpServerInput): YAMLMap {
  const config = doc.createNode({}) as YAMLMap
  config.set('transport', transport)
  config.set('serverName', input.serverName)
  if (transport === 'stdio') {
    if (input.command !== undefined) config.set('command', makeScalar(doc, input.command))
    if (input.args !== undefined && input.args.length > 0) {
      config.set('args', doc.createNode(input.args.map(arg => makeScalar(doc, arg))))
    }
    if (input.env !== undefined && Object.keys(input.env).length > 0) config.set('env', makeDict(doc, input.env))
    if (input.cwd !== undefined && input.cwd !== '') config.set('cwd', makeScalar(doc, input.cwd))
  } else {
    if (input.url !== undefined) config.set('url', makeScalar(doc, input.url))
    if (input.headers !== undefined && Object.keys(input.headers).length > 0) {
      config.set('headers', makeDict(doc, input.headers))
    }
  }
  if (input.toolCallTimeoutMs !== undefined) config.set('toolCallTimeoutMs', input.toolCallTimeoutMs)
  if (input.failOnStartupError !== undefined) config.set('failOnStartupError', input.failOnStartupError)
  return config
}

/**
 * 选一个 insert 列表来放新行：优先已经有 MCP 行的那个，
 * 否则用最后一个 insert，都没有就新建一段。
 *
 * 这样多次添加的 MCP 行会聚在一起，而不是在文件里散成一片。
 */
function targetList(doc: Document): YAMLSeq {
  const lists = insertLists(doc)
  for (const list of lists) {
    const hasMcp = list.items.some(item => isMap(item) && readScalar(item.get('name', true)) === MCP_PLUGIN_NAME)
    if (hasMcp) return list
  }
  const last = lists.at(-1)
  if (last !== undefined) return last
  const list = doc.createNode([]) as YAMLSeq
  const entry = doc.createNode({}) as YAMLMap
  entry.set('insert', list)
  entry.commentBefore = ' MCP 服务，由 workbench_mcp 工具维护'
  root(doc).add(entry)
  return list
}

/** 读回刚写完的一行，顺带确认写进去了。 */
function readBack(doc: Document, serverName: string, what: string): McpServer {
  const found = listServers(doc).find(server => server.serverName === serverName)
  if (found === undefined) {
    throw new WorkbenchError(`${what}后未能读回 MCP 行 "${serverName}"`, 'WORKBENCH_MCP_WRITE_FAILED')
  }
  return found
}

/** 往 patch 里加一个 MCP 服务。 */
export function addServer(doc: Document, input: McpServerInput): McpServer {
  assertServerName(input.serverName)
  if (locateRow(doc, input.serverName) !== undefined) {
    throw new WorkbenchError(`MCP 服务 "${input.serverName}" 已存在`, 'WORKBENCH_MCP_DUPLICATE')
  }
  const transport = input.transport ?? 'stdio'
  assertConsistent(transport, input)

  const row = doc.createNode({}) as YAMLMap
  row.set('id', rowIdFor(input.serverName))
  row.set('name', MCP_PLUGIN_NAME)
  row.set('config', makeConfig(doc, transport, input))
  targetList(doc).add(row)

  return readBack(doc, input.serverName, '新增')
}

/** 更新时可改的字段；`serverName` 给了就是重命名。 */
export type McpServerPatch = Partial<McpServerInput>

/**
 * 更新一个 MCP 服务。
 *
 * 行的位置与周围注释保留，但 config 整块重建——patch 的 config 本来就是
 * **整体替换**语义（不是深合并），所以「读出现状、合并入参、整块重写」
 * 与 DSH 加载时看到的语义是一致的。
 */
export function updateServer(doc: Document, serverName: string, input: McpServerPatch): McpServer {
  const found = locateRow(doc, serverName)
  const current = listServers(doc).find(server => server.serverName === serverName)
  if (found === undefined || current === undefined) {
    throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, 'WORKBENCH_MCP_NOT_FOUND')
  }

  const nextName = input.serverName ?? serverName
  if (nextName !== serverName) {
    assertServerName(nextName)
    if (locateRow(doc, nextName) !== undefined) {
      throw new WorkbenchError(`MCP 服务 "${nextName}" 已存在`, 'WORKBENCH_MCP_DUPLICATE')
    }
  }

  const transport = input.transport ?? current.transport
  // 换传输方式时另一侧的遗留字段要一起清掉，否则会带着 stdio 的 command
  // 去连 HTTP。同侧则是「入参给了用入参，没给沿用现状」。
  const keep = <K extends keyof McpServerInput>(key: K): Partial<McpServerInput> => {
    const value = input[key] ?? (current as Partial<McpServerInput>)[key]
    return value === undefined ? {} : ({ [key]: value } as Partial<McpServerInput>)
  }
  const stdioFields = transport === 'stdio'
    ? { ...keep('command'), ...keep('args'), ...keep('env'), ...keep('cwd') }
    : {}
  const httpFields = transport === 'streamable-http'
    ? { ...keep('url'), ...keep('headers') }
    : {}
  const merged: McpServerInput = {
    serverName: nextName,
    transport,
    ...stdioFields,
    ...httpFields,
    ...keep('toolCallTimeoutMs'),
    ...keep('failOnStartupError'),
  }
  assertConsistent(transport, merged)

  found.map.set('id', rowIdFor(nextName))
  found.map.set('config', makeConfig(doc, transport, merged))

  return readBack(doc, nextName, '更新')
}

/** 从 patch 里删掉一个 MCP 服务，连同它的 disabled 条目和空掉的 insert 段。 */
export function removeServer(doc: Document, serverName: string): McpServer {
  const target = listServers(doc).find(server => server.serverName === serverName)
  const found = locateRow(doc, serverName)
  if (found === undefined || target === undefined) {
    throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, 'WORKBENCH_MCP_NOT_FOUND')
  }
  found.list.items.splice(found.index, 1)

  const top = root(doc)
  for (let index = top.items.length - 1; index >= 0; index -= 1) {
    const entry = top.items[index]
    if (!isMap(entry)) continue
    // 空掉的 insert 段留在文件里只是噪声，顺手收走。
    const list = entry.get('insert', true)
    if (isSeq(list) && list.items.length === 0 && entry.items.length === 1) {
      top.items.splice(index, 1)
      continue
    }
    if (entry.get('disabled') === true && readScalar(entry.get('id', true)) === target.rowId) {
      top.items.splice(index, 1)
    }
  }
  return target
}

/** 启用或停用一个 MCP 服务。 */
export function setServerDisabled(doc: Document, serverName: string, disabled: boolean): McpServer {
  const target = listServers(doc).find(server => server.serverName === serverName)
  if (target === undefined) throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, 'WORKBENCH_MCP_NOT_FOUND')

  const top = root(doc)
  const existing = top.items.findIndex(entry =>
    isMap(entry) && entry.get('disabled') === true && readScalar(entry.get('id', true)) === target.rowId)

  if (disabled && existing === -1) {
    const entry = doc.createNode({}) as YAMLMap
    entry.set('id', target.rowId)
    entry.set('disabled', true)
    top.add(entry)
  } else if (!disabled && existing !== -1) {
    top.items.splice(existing, 1)
  }
  return readBack(doc, serverName, '切换启用状态')
}
