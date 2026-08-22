/**
 * 面向模型的 `workbench_mcp` 工具：管理本 profile 的 MCP 服务。
 * @module @staff-os/dsh-workbench/mcp/tool
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenericCallView } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { requireConfirm, WorkbenchError } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import { parseMcpServersJson } from './import.ts'
import {
  addServer,
  listServers,
  loadPatch,
  removeServer,
  savePatch,
  setServerDisabled,
  updateServer,
} from './patch.ts'
import type { McpServer, McpServerInput, McpServerPatch, McpTransport } from './patch.ts'

/** 单次 MCP 操作的超时预算。 */
export const DEFAULT_MCP_TOOL_TIMEOUT_MS = 20_000

/** 工具支持的动作。 */
const ACTIONS = ['list', 'get', 'add', 'update', 'delete', 'enable', 'disable', 'import_json'] as const

type Action = typeof ACTIONS[number]

/** 工具入参。 */
interface McpArgs {
  action: string
  serverName?: string
  transport?: string
  command?: string
  args?: string[]
  env?: unknown
  cwd?: string
  url?: string
  headers?: unknown
  toolCallTimeoutMs?: number
  failOnStartupError?: boolean
  json?: string
  confirm?: boolean
}

/** 工具出参里的一个服务。 */
interface ServerView {
  rowId: string
  serverName: string
  transport: string
  disabled: boolean
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  toolCallTimeoutMs?: number
  failOnStartupError?: boolean
}

/** 工具出参。 */
interface McpOutput {
  action: string
  message: string
  servers: ServerView[]
  skipped: { name: string; reason: string }[]
  backupFile?: string
}

/** 投影一个服务，丢掉全部缺省字段，免得模型面对一堆 null。 */
function project(server: McpServer): ServerView {
  return {
    rowId: server.rowId,
    serverName: server.serverName,
    transport: server.transport,
    disabled: server.disabled,
    ...server.command === undefined ? {} : { command: server.command },
    ...server.args === undefined ? {} : { args: [...server.args] },
    ...server.env === undefined ? {} : { env: { ...server.env } },
    ...server.cwd === undefined ? {} : { cwd: server.cwd },
    ...server.url === undefined ? {} : { url: server.url },
    ...server.headers === undefined ? {} : { headers: { ...server.headers } },
    ...server.toolCallTimeoutMs === undefined ? {} : { toolCallTimeoutMs: server.toolCallTimeoutMs },
    ...server.failOnStartupError === undefined ? {} : { failOnStartupError: server.failOnStartupError },
  }
}

/** 校验动作名。 */
export function parseAction(raw: string): Action {
  const action = ACTIONS.find(candidate => candidate === raw)
  if (action === undefined) {
    throw new WorkbenchError(
      `未知动作 "${raw}"，可用：${ACTIONS.join('、')}`,
      'WORKBENCH_BAD_ACTION',
    )
  }
  return action
}

/** 取必填的 serverName。 */
function requireServerName(args: McpArgs, action: Action): string {
  const name = args.serverName?.trim()
  if (name === undefined || name === '') {
    throw new WorkbenchError(`动作 "${action}" 必须给 serverName`, 'WORKBENCH_MISSING_ARG')
  }
  return name
}

/** 把一个自由形态的 JSON 值收成字符串字典。 */
export function asStringDict(value: unknown, field: string): Record<string, string> | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new WorkbenchError(`${field} 必须是「键: 字符串」的对象`, 'WORKBENCH_BAD_ARG')
  }
  const out: Record<string, string> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item !== 'string') {
      throw new WorkbenchError(`${field}.${key} 必须是字符串`, 'WORKBENCH_BAD_ARG')
    }
    out[key] = item
  }
  return out
}

/** 校验传输方式。 */
function parseTransport(raw: string | undefined): McpTransport | undefined {
  if (raw === undefined) return undefined
  if (raw === 'stdio' || raw === 'streamable-http') return raw
  throw new WorkbenchError(`未知 transport "${raw}"，可用：stdio、streamable-http`, 'WORKBENCH_BAD_ARG')
}

/** 从入参收集写字段。 */
function collectInput(args: McpArgs): McpServerPatch {
  const transport = parseTransport(args.transport)
  const env = asStringDict(args.env, 'env')
  const headers = asStringDict(args.headers, 'headers')
  return {
    ...transport === undefined ? {} : { transport },
    ...args.command === undefined ? {} : { command: args.command },
    ...args.args === undefined ? {} : { args: args.args },
    ...env === undefined ? {} : { env },
    ...args.cwd === undefined ? {} : { cwd: args.cwd },
    ...args.url === undefined ? {} : { url: args.url },
    ...headers === undefined ? {} : { headers },
    ...args.toolCallTimeoutMs === undefined ? {} : { toolCallTimeoutMs: args.toolCallTimeoutMs },
    ...args.failOnStartupError === undefined ? {} : { failOnStartupError: args.failOnStartupError },
  }
}

/**
 * 渲染成一段给模型看的文本。
 *
 * 入参放宽成结构最小集而不是直接用 {@link McpOutput}：`render` 拿到的 value
 * 是**由出参 schema 推出来**的类型，`env`/`headers` 在那边是自由 JSON，
 * 与手写接口里的字符串字典对不上。
 */
export function formatOutput(value: FormattableOutput): string {
  const lines: string[] = [value.message]
  if (value.servers.length > 0) {
    lines.push('')
    for (const server of value.servers) {
      const flags: string[] = [server.transport]
      if (server.disabled) flags.push('已停用')
      const target = server.transport === 'stdio'
        ? [server.command, ...server.args ?? []].filter(Boolean).join(' ')
        : server.url ?? ''
      lines.push(`- ${server.serverName}（${flags.join('，')}）：${target}`)
      const keys = [...dictKeys(server.env), ...dictKeys(server.headers)]
      if (keys.length > 0) lines.push(`  变量：${keys.join('、')}`)
    }
  }
  if (value.skipped.length > 0) {
    lines.push('')
    lines.push('已跳过：')
    for (const item of value.skipped) lines.push(`- ${item.name}：${item.reason}`)
  }
  if (value.backupFile !== undefined) {
    lines.push('')
    lines.push(`原文件已备份到 ${value.backupFile}`)
  }
  return lines.join('\n')
}

/** {@link formatOutput} 需要的最小服务形状。 */
interface FormattableServer {
  readonly serverName: string
  readonly transport: string
  readonly disabled: boolean
  readonly command?: string | undefined
  readonly args?: readonly string[] | undefined
  readonly url?: string | undefined
  readonly env?: unknown
  readonly headers?: unknown
}

/** {@link formatOutput} 需要的最小整体形状。 */
interface FormattableOutput {
  readonly message: string
  readonly servers: readonly FormattableServer[]
  readonly skipped: readonly { readonly name: string; readonly reason: string }[]
  readonly backupFile?: string | undefined
}

/** 取一个自由 JSON 值里的键名，取不出就当空。 */
function dictKeys(value: unknown): string[] {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.keys(value as Record<string, unknown>)
    : []
}

/** 一个服务在出参 schema 里的形状。 */
const SERVER_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    rowId: { type: 'string', required: true },
    serverName: { type: 'string', required: true },
    transport: { type: 'string', required: true },
    disabled: { type: 'boolean', required: true },
    command: { type: 'string' },
    args: { type: 'array', items: { type: 'string' } },
    env: { type: 'json' },
    cwd: { type: 'string' },
    url: { type: 'string' },
    headers: { type: 'json' },
    toolCallTimeoutMs: { type: 'number' },
    failOnStartupError: { type: 'boolean' },
  },
} as const

/**
 * 注册 `workbench_mcp` 工具及其使用指引。
 */
export function applyMcpTool(ctx: Context, timeoutMs: number): void {
  ctx.systemPrompt.section({
    name: 'tool:workbench_mcp',
    order: 121,
    text: [
      'workbench_mcp 管理本机 DSH profile 的 MCP 服务，改的是 profile 的 cordis.patch.yml。',
      '改动在下次启动 DSH 时生效，改完要告诉用户这一点。',
      'env 与 headers 里如果要用密钥，写成 "!!js process.env.变量名"，让 DSH 启动时求值；',
      '不要把明文密钥写进配置。import_json 会自动把 Claude Code 风格的 ${VAR} 转成这种形式。',
      'delete 是不可逆的，必须先向用户说明要删哪个服务、得到同意后再带 confirm: true 调用。',
    ].join(''),
  })

  ctx.tools.register(defineTool({
    name: 'workbench_mcp',
    description: [
      'Manage MCP servers for the local DeepSeek Harness profile. ',
      'Actions: list (all servers), get (one server), add, update, delete (needs confirm), ',
      'enable, disable, import_json (bulk import a Claude Code / Cursor style {"mcpServers":{...}} document). ',
      'Changes are written to the profile patch file and take effect on the next DSH start.',
    ].join(''),
    parameters: {
      action: {
        type: 'string',
        required: true,
        enum: ACTIONS,
        description: 'Which operation to perform.',
      },
      serverName: {
        type: 'string',
        description: 'Server name. Required for get/add/update/delete/enable/disable. Letters, digits, underscore and hyphen only, 1-32 characters. On update, passing a different value renames the server.',
      },
      transport: {
        type: 'string',
        enum: ['stdio', 'streamable-http'],
        description: 'Transport. stdio launches a local process (needs command); streamable-http connects to a URL (needs url). Defaults to stdio on add.',
      },
      command: { type: 'string', description: 'stdio only: executable to launch.' },
      args: { type: 'array', items: { type: 'string' }, description: 'stdio only: arguments passed to command.' },
      env: { type: 'json', description: 'stdio only: environment variables as a flat string map. Use "!!js process.env.NAME" as the value to read a variable at startup instead of inlining a secret.' },
      cwd: { type: 'string', description: 'stdio only: working directory for the launched process.' },
      url: { type: 'string', description: 'streamable-http only: endpoint URL.' },
      headers: { type: 'json', description: 'streamable-http only: HTTP headers as a flat string map. Use "!!js process.env.NAME" for secrets.' },
      toolCallTimeoutMs: { type: 'integer', description: 'Per-tool-call timeout budget for this server, in milliseconds.' },
      failOnStartupError: { type: 'boolean', description: 'Whether a connection failure at startup should fail the whole DSH launch.' },
      json: { type: 'string', description: 'import_json only: the JSON document text to import.' },
      confirm: { type: 'boolean', description: 'Required to be true for delete, which is irreversible. Ask the user first.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true },
          message: { type: 'string', required: true },
          servers: { type: 'array', required: true, items: SERVER_SCHEMA },
          skipped: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                name: { type: 'string', required: true },
                reason: { type: 'string', required: true },
              },
            },
          },
          backupFile: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatOutput(value) }],
    },
    timeoutMs,
    // patch 文件是单一可变资源，两个并发写会互相覆盖对方的行。
    isConcurrencySafe: args => parseAction(args.action) === 'list' || parseAction(args.action) === 'get',
    async execute(args: McpArgs): Promise<McpOutput> {
      const runtime = ctx.workbench as WorkbenchRuntime
      const file = runtime.paths.profilePatch
      const action = parseAction(args.action)
      const doc = await loadPatch(file)

      if (action === 'list') {
        const servers = listServers(doc)
        return {
          action,
          message: servers.length === 0
            ? `profile "${runtime.profileName}" 还没有配置任何 MCP 服务`
            : `profile "${runtime.profileName}" 共 ${String(servers.length)} 个 MCP 服务`,
          servers: servers.map(project),
          skipped: [],
        }
      }

      if (action === 'get') {
        const serverName = requireServerName(args, action)
        const server = listServers(doc).find(candidate => candidate.serverName === serverName)
        if (server === undefined) {
          throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, 'WORKBENCH_MCP_NOT_FOUND')
        }
        return { action, message: `MCP 服务 "${serverName}"`, servers: [project(server)], skipped: [] }
      }

      if (action === 'import_json') {
        if (args.json === undefined || args.json.trim() === '') {
          throw new WorkbenchError('动作 "import_json" 必须给 json', 'WORKBENCH_MISSING_ARG')
        }
        const parsed = parseMcpServersJson(args.json)
        const added: McpServer[] = []
        const skipped = [...parsed.skipped]
        for (const item of parsed.servers) {
          try {
            added.push(addServer(doc, item.input))
          } catch (error: unknown) {
            skipped.push({
              name: item.originalName,
              reason: error instanceof Error ? error.message : String(error),
            })
          }
        }
        if (added.length === 0) {
          return {
            action,
            message: '没有可导入的 MCP 服务',
            servers: [],
            skipped,
          }
        }
        const backupFile = await savePatch(file, doc)
        const renamed = parsed.servers
          .filter(item => item.originalName !== item.input.serverName)
          .map(item => `${item.originalName} → ${item.input.serverName}`)
        return {
          action,
          message: [
            `已导入 ${String(added.length)} 个 MCP 服务，下次启动 DSH 生效`,
            renamed.length === 0 ? '' : `（改名：${renamed.join('、')}）`,
          ].join(''),
          servers: added.map(project),
          skipped,
          ...backupFile === undefined ? {} : { backupFile },
        }
      }

      const serverName = requireServerName(args, action)
      let affected: McpServer
      let message: string
      if (action === 'add') {
        const input = collectInput(args)
        affected = addServer(doc, { ...input, serverName } as McpServerInput)
        message = `已新增 MCP 服务 "${serverName}"，下次启动 DSH 生效`
      } else if (action === 'update') {
        const input = collectInput(args)
        // serverName 参数在 update 里指「要改哪个」，改名靠单独的 rename 语义，
        // 这里不把它当成新名字，否则每次 update 都会触发一次自我重命名检查。
        affected = updateServer(doc, serverName, input)
        message = `已更新 MCP 服务 "${affected.serverName}"，下次启动 DSH 生效`
      } else if (action === 'delete') {
        requireConfirm(args.confirm, `删除 MCP 服务 "${serverName}"`)
        affected = removeServer(doc, serverName)
        message = `已删除 MCP 服务 "${serverName}"`
      } else {
        const disabled = action === 'disable'
        affected = setServerDisabled(doc, serverName, disabled)
        message = `已${disabled ? '停用' : '启用'} MCP 服务 "${serverName}"，下次启动 DSH 生效`
      }
      const backupFile = await savePatch(file, doc)
      return {
        action,
        message,
        servers: [project(affected)],
        skipped: [],
        ...backupFile === undefined ? {} : { backupFile },
      }
    },
    presentCall: (args: McpArgs): GenericCallView => ({
      card: 'generic',
      kind: 'search',
      title: args.serverName === undefined ? `MCP：${args.action}` : `MCP：${args.action} ${args.serverName}`,
      rawInput: args.action,
    }),
  }))
}
