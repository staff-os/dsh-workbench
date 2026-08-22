/**
 * 把 Claude Code / Cursor 风格的 `{ "mcpServers": {...} }` 翻译成 DSH 的 MCP 行。
 *
 * 这是 MCP 管理里最容易出静默错误的一步，因为两边的**变量语义不一样**：
 * 那些客户端会在自己进程里把 `${VAR}` 展开成环境变量，DSH 不会——原样写进
 * patch 的话，MCP 服务拿到的 token 就是 `${GITHUB_TOKEN}` 这十六个字符，
 * 而且报错发生在远端鉴权阶段，很难回溯到这里。所以必须转成 `!!js` 表达式，
 * 让 DSH 在启动时求值。
 *
 * @module @staff-os/dsh-workbench/mcp/import
 */

import { JS_PREFIX, SERVER_NAME_PATTERN } from './patch.ts'
import type { McpServerInput, McpTransport } from './patch.ts'
import { WorkbenchError } from '../types.ts'

/** 整串就是一个 `${VAR}` 引用。 */
const WHOLE_REFERENCE = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/u

/** 串里夹着一个或多个 `${VAR}` 引用。 */
const ANY_REFERENCE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/gu

/**
 * 把一个可能含 `${VAR}` 的值转成 patch 能用的形式。
 *
 * 整串就是一个引用时给最朴素的 `process.env.X`；夹在文字里时才用模板串，
 * 因为 `Bearer ${TOKEN}` 这种拼接同样常见，而把它整体当成变量名会静默取到
 * `undefined`。
 */
export function convertVariables(value: string): string {
  const whole = WHOLE_REFERENCE.exec(value)
  if (whole !== null) return `${JS_PREFIX}process.env.${whole[1] ?? ''}`
  ANY_REFERENCE.lastIndex = 0
  if (!ANY_REFERENCE.test(value)) return value
  ANY_REFERENCE.lastIndex = 0
  const template = value
    .replace(/`/gu, '\\`')
    .replace(ANY_REFERENCE, (_match, name: string) => `\${process.env.${name}}`)
  return `${JS_PREFIX}\`${template}\``
}

/** 对一个字典的每个值做变量转换。 */
function convertDict(dict: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(dict)) {
    if (typeof value === 'string') out[key] = convertVariables(value)
    else if (value !== null && value !== undefined) out[key] = String(value)
  }
  return out
}

/**
 * 把外部客户端的服务名压成 DSH 认的 serverName。
 * @returns 合法名；无法救回时返回 `undefined`。
 */
export function sanitizeServerName(raw: string): string | undefined {
  if (SERVER_NAME_PATTERN.test(raw)) return raw
  const squeezed = raw.replace(/[^A-Za-z0-9_-]/gu, '-').replace(/-{2,}/gu, '-').replace(/^-|-$/gu, '')
  const clipped = squeezed.slice(0, 32)
  return SERVER_NAME_PATTERN.test(clipped) ? clipped : undefined
}

/** 一条导入结果。 */
export interface ImportedServer {
  /** 转换后的输入，可直接交给 `addServer`。 */
  readonly input: McpServerInput
  /** 源 JSON 里的名字；与 `input.serverName` 不同说明被改名了。 */
  readonly originalName: string
}

/** 一次导入的整体结果。 */
export interface ImportResult {
  readonly servers: readonly ImportedServer[]
  /** 跳过的条目及原因。 */
  readonly skipped: readonly { readonly name: string; readonly reason: string }[]
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

/**
 * 解析一份 `{ "mcpServers": {...} }`。
 *
 * 顶层直接是服务字典（没有 `mcpServers` 包裹）也认——两种写法在野外都常见。
 */
export function parseMcpServersJson(text: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch (error: unknown) {
    throw new WorkbenchError(`MCP 配置不是合法 JSON：${String(error)}`, 'WORKBENCH_MCP_BAD_JSON')
  }
  const body = asRecord(parsed)
  if (body === undefined) {
    throw new WorkbenchError('MCP 配置必须是一个 JSON 对象', 'WORKBENCH_MCP_BAD_JSON')
  }
  const servers = asRecord(body.mcpServers) ?? body
  if (Object.keys(servers).length === 0) {
    throw new WorkbenchError('MCP 配置里没有任何服务条目', 'WORKBENCH_MCP_EMPTY_IMPORT')
  }

  const imported: ImportedServer[] = []
  const skipped: { name: string; reason: string }[] = []
  for (const [originalName, raw] of Object.entries(servers)) {
    const entry = asRecord(raw)
    if (entry === undefined) {
      skipped.push({ name: originalName, reason: '条目不是对象' })
      continue
    }
    const serverName = sanitizeServerName(originalName)
    if (serverName === undefined) {
      skipped.push({ name: originalName, reason: '服务名里没有可用的字母或数字' })
      continue
    }

    // 有 url 就是远端，不管它把 type 写成 http 还是 sse——DSH 只有
    // streamable-http 一种远端传输。
    const url = typeof entry.url === 'string' ? entry.url : undefined
    const transport: McpTransport = url === undefined ? 'stdio' : 'streamable-http'

    if (transport === 'streamable-http') {
      const headers = asRecord(entry.headers)
      imported.push({
        originalName,
        input: {
          serverName,
          transport,
          url: convertVariables(url ?? ''),
          ...headers === undefined ? {} : { headers: convertDict(headers) },
        },
      })
      continue
    }

    const command = typeof entry.command === 'string' ? entry.command : undefined
    if (command === undefined || command === '') {
      skipped.push({ name: originalName, reason: '既没有 url 也没有 command' })
      continue
    }
    const args = Array.isArray(entry.args)
      ? entry.args.filter(arg => typeof arg === 'string').map(arg => convertVariables(arg))
      : undefined
    const env = asRecord(entry.env)
    const cwd = typeof entry.cwd === 'string' ? entry.cwd : undefined
    imported.push({
      originalName,
      input: {
        serverName,
        transport,
        command: convertVariables(command),
        ...args === undefined || args.length === 0 ? {} : { args },
        ...env === undefined ? {} : { env: convertDict(env) },
        ...cwd === undefined || cwd === '' ? {} : { cwd: convertVariables(cwd) },
      },
    })
  }

  return { servers: imported, skipped }
}
