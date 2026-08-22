/**
 * 面向模型的 `workbench_plugin` 工具：DSH 插件的装卸与插件市场。
 * @module @staff-os/dsh-workbench/plugin/tool
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenericCallView } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { requireConfirm, WorkbenchError } from '../types.ts'
import type { RegistryItem } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import { assertSafeSpec, inspectLocalSpec, readProfilePlugins, runDshPlugin } from './ops.ts'
import type { PluginEntry } from './ops.ts'

/** 插件工具的默认超时预算：一次 pnpm 安装可能要几十秒。 */
export const DEFAULT_PLUGIN_TOOL_TIMEOUT_MS = 300_000

/** 默认的 DSH 命令行可执行文件名。 */
export const DEFAULT_DSH_EXECUTABLE = 'dsh'

/** 工具支持的动作。 */
const ACTIONS = ['list', 'install', 'remove', 'update', 'market_search', 'market_install'] as const

type Action = typeof ACTIONS[number]

/** 工具入参。 */
interface PluginArgs {
  action: string
  spec?: string
  name?: string
  slug?: string
  version?: string
  registry?: string
  keyword?: string
  page?: number
  pageSize?: number
  sort?: string
  allowNonBundle?: boolean
  confirm?: boolean
}

/** 出参里的一个插件。 */
interface PluginView {
  name: string
  spec?: string
  version?: string
  description?: string
  isBundle: boolean
  active: boolean
}

/** 出参里的一个市场条目。 */
interface MarketView {
  slug: string
  name: string
  description?: string
  version?: string
  installSpec?: string
  tags: string[]
  installCount: number
  registry: string
  registryName: string
}

/** 工具出参。 */
interface PluginOutput {
  action: string
  message: string
  plugins: PluginView[]
  builtIn: string[]
  market: MarketView[]
  /** 转发给 DSH 命令行时它说了什么；失败时这是唯一有用的线索。 */
  commandOutput?: string
}

/** 校验动作名。 */
export function parsePluginAction(raw: string): Action {
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
  // 这些值最终会进到一条要走 shell 的命令里（Windows 上 dsh 是 .cmd 垫片）。
  assertSafeSpec(trimmed, field)
  return trimmed
}

function project(plugin: PluginEntry): PluginView {
  return {
    name: plugin.name,
    ...plugin.spec === undefined ? {} : { spec: plugin.spec },
    ...plugin.version === undefined ? {} : { version: plugin.version },
    ...plugin.description === undefined ? {} : { description: plugin.description },
    isBundle: plugin.isBundle,
    active: plugin.active,
  }
}

function projectMarket(item: RegistryItem): MarketView {
  return {
    slug: item.slug,
    name: item.name,
    ...item.description === undefined ? {} : { description: item.description },
    ...item.version === undefined ? {} : { version: item.version },
    ...item.installSpec === undefined ? {} : { installSpec: item.installSpec },
    tags: [...item.tags],
    installCount: item.installCount,
    registry: item.sourceRegistry,
    registryName: item.sourceRegistryName,
  }
}

/** 把命令输出剪到能进上下文的长度，保留尾部——错误信息在最后。 */
function tail(text: string, limit = 4_000): string | undefined {
  const trimmed = text.trim()
  if (trimmed === '') return undefined
  return trimmed.length <= limit ? trimmed : `…（前面省略）\n${trimmed.slice(-limit)}`
}

/** 渲染成给模型看的文本。 */
export function formatPluginOutput(value: FormattablePluginOutput): string {
  const lines: string[] = [value.message]
  if (value.plugins.length > 0) {
    lines.push('')
    for (const plugin of value.plugins) {
      const flags: string[] = []
      if (!plugin.isBundle) flags.push('不是 DSH 插件，只是普通依赖')
      else if (!plugin.active) flags.push('未并入组合层')
      lines.push(
        `- ${plugin.name}${plugin.version === undefined ? '' : ` ${plugin.version}`}`
        + `${flags.length === 0 ? '' : `（${flags.join('，')}）`}`
        + `${plugin.description === undefined ? '' : `：${plugin.description}`}`,
      )
    }
  }
  if (value.builtIn.length > 0) {
    lines.push('')
    lines.push(`随 profile 模板出厂的组合层（不是依赖，装卸命令碰不到）：${value.builtIn.join('、')}`)
  }
  if (value.market.length > 0) {
    lines.push('')
    for (const item of value.market) {
      const meta = [item.registryName, item.version === undefined ? '' : `v${item.version}`]
        .filter(part => part !== '')
        .join('，')
      lines.push(`- ${item.slug}（${meta}）：${item.description ?? item.name}`)
    }
  }
  if (value.commandOutput !== undefined) {
    lines.push('')
    lines.push('DSH 命令行输出：')
    lines.push(value.commandOutput)
  }
  return lines.join('\n')
}

/** {@link formatPluginOutput} 需要的最小形状。 */
interface FormattablePluginOutput {
  readonly message: string
  readonly plugins: readonly {
    readonly name: string
    readonly version?: string | undefined
    readonly description?: string | undefined
    readonly isBundle: boolean
    readonly active: boolean
  }[]
  readonly builtIn: readonly string[]
  readonly market: readonly {
    readonly slug: string
    readonly name: string
    readonly description?: string | undefined
    readonly version?: string | undefined
    readonly registryName: string
  }[]
  readonly commandOutput?: string | undefined
}

const PLUGIN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', required: true },
    spec: { type: 'string' },
    version: { type: 'string' },
    description: { type: 'string' },
    isBundle: { type: 'boolean', required: true },
    active: { type: 'boolean', required: true },
  },
} as const

const MARKET_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    version: { type: 'string' },
    installSpec: { type: 'string' },
    tags: { type: 'array', required: true, items: { type: 'string' } },
    installCount: { type: 'number', required: true },
    registry: { type: 'string', required: true },
    registryName: { type: 'string', required: true },
  },
} as const

/**
 * 注册 `workbench_plugin` 工具及其使用指引。
 */
export function applyPluginTool(ctx: Context, executable: string, timeoutMs: number): void {
  ctx.systemPrompt.section({
    name: 'tool:workbench_plugin',
    order: 125,
    text: [
      'workbench_plugin 装卸本机 DSH profile 的插件，底层转发给 dsh plugin 命令行（一个 pnpm 转发器）。',
      '插件装完要重启 DSH 才生效，改完要告诉用户这一点。',
      'list 结果里 isBundle 为 false 表示那个包没有声明 dsh.bundle，只是普通依赖、不参与组合；',
      'active 为 false 表示它没被并入组合层。装完之后要看这两个标记确认是不是真的装成了插件。',
      'remove 会改动运行环境，必须先向用户说明再带 confirm: true 调用。',
    ].join(''),
  })

  ctx.tools.register(defineTool({
    name: 'workbench_plugin',
    description: [
      'Install, remove and update DSH plugins for the local profile, and browse the plugin marketplace. ',
      'Actions: list, install, remove (needs confirm), update, market_search, market_install. ',
      'Install and remove forward to the `dsh plugin` CLI, which runs pnpm inside the profile directory ',
      'and reconciles the profile bundle layer list. Changes take effect after DSH restarts.',
    ].join(''),
    parameters: {
      action: { type: 'string', required: true, enum: ACTIONS, description: 'Which operation to perform.' },
      spec: {
        type: 'string',
        description: 'install only: what to install — an npm package name, a name@version, a git URL, or an absolute local directory path. Relative paths are not accepted because this tool does not run in the user\'s shell directory.',
      },
      name: { type: 'string', description: 'remove/update: the installed package name, as reported by list.' },
      slug: { type: 'string', description: 'market_install: the marketplace slug.' },
      version: { type: 'string', description: 'market_install: version to install. Defaults to the latest published version.' },
      registry: { type: 'string', description: 'Restrict a marketplace action to one configured registry id.' },
      keyword: { type: 'string', description: 'market_search: search keyword. Omit to browse the newest entries.' },
      page: { type: 'integer', description: 'market_search: 1-based page number. Defaults to 1.' },
      pageSize: { type: 'integer', description: 'market_search: entries per page, 1-100. Defaults to 20.' },
      sort: { type: 'string', description: 'market_search: registry sort key used when browsing without a keyword.' },
      allowNonBundle: {
        type: 'boolean',
        description: 'install only: proceed even when a local path does not declare dsh.bundle. Default false, which refuses — pointing at a monorepo root instead of the plugin package is the usual cause.',
      },
      confirm: { type: 'boolean', description: 'Required to be true for remove, which changes the running environment. Ask the user first.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true },
          message: { type: 'string', required: true },
          plugins: { type: 'array', required: true, items: PLUGIN_SCHEMA },
          builtIn: { type: 'array', required: true, items: { type: 'string' } },
          market: { type: 'array', required: true, items: MARKET_SCHEMA },
          commandOutput: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatPluginOutput(value) }],
    },
    timeoutMs,
    // profile 的 package.json 与 pnpm 锁是单一可变资源，写动作必须串行。
    isConcurrencySafe: (args) => {
      const action = parsePluginAction(args.action)
      return action === 'list' || action === 'market_search'
    },
    async execute(args: PluginArgs, exec): Promise<PluginOutput> {
      const runtime = ctx.workbench as WorkbenchRuntime
      const profileDir = runtime.paths.profile
      const action = parsePluginAction(args.action)
      const signal = exec.signal
      const empty = { plugins: [], builtIn: [], market: [] }

      if (action === 'market_search') {
        const page = await runtime.registry.search({
          ...args.keyword === undefined ? {} : { keyword: args.keyword },
          ...args.page === undefined ? {} : { page: args.page },
          ...args.pageSize === undefined ? {} : { pageSize: args.pageSize },
          ...args.sort === undefined ? {} : { sort: args.sort },
        }, signal)
        return {
          ...empty,
          action,
          message: page.items.length === 0
            ? '市场里没有匹配的插件'
            : `市场共找到 ${String(page.items.length)} 个条目`
              + `${page.fromCache ? '（来自离线缓存，registry 当前不可达）' : ''}`,
          market: page.items.map(projectMarket),
        }
      }

      if (action === 'list') {
        const state = await readProfilePlugins(profileDir)
        const active = state.plugins.filter(plugin => plugin.active).length
        return {
          ...empty,
          action,
          message: state.plugins.length === 0
            ? `profile "${runtime.profileName}" 还没有装任何插件依赖`
            : `profile "${runtime.profileName}" 共 ${String(state.plugins.length)} 个依赖，`
              + `其中 ${String(active)} 个作为插件生效`,
          plugins: state.plugins.map(project),
          builtIn: [...state.builtIn],
        }
      }

      /** 跑一次转发并把结果整理成出参。 */
      const forward = async (
        commandArgs: readonly string[],
        succeeded: string,
        watch: string | undefined,
      ): Promise<PluginOutput> => {
        const result = await runDshPlugin(executable, runtime.profileName, commandArgs, {
          timeoutMs,
          ...signal === undefined ? {} : { signal },
        })
        const output = tail(`${result.stdout}\n${result.stderr}`)
        if (result.code !== 0) {
          throw new WorkbenchError(
            `dsh plugin ${commandArgs.join(' ')} 失败（退出码 ${String(result.code)}）：\n${output ?? '（没有输出）'}`,
            'WORKBENCH_PLUGIN_COMMAND_FAILED',
          )
        }
        const state = await readProfilePlugins(profileDir)
        const touched = watch === undefined
          ? []
          : state.plugins.filter(plugin => plugin.name === watch)
        const landed = touched[0]
        const warning = landed !== undefined && !landed.isBundle
          ? `；注意：${landed.name} 没有声明 dsh.bundle，只是作为普通依赖装上了，不会参与组合`
          : landed !== undefined && !landed.active
            ? `；注意：${landed.name} 还没并入组合层`
            : ''
        return {
          action,
          message: `${succeeded}${warning}`,
          plugins: (touched.length > 0 ? touched : state.plugins).map(project),
          builtIn: [...state.builtIn],
          market: [],
          ...output === undefined ? {} : { commandOutput: output },
        }
      }

      if (action === 'remove') {
        const name = requireArg(args.name, 'name', action)
        requireConfirm(args.confirm, `从 profile "${runtime.profileName}" 卸载插件 "${name}"`)
        return forward(['remove', name], `已卸载 "${name}"，重启 DSH 后生效`, undefined)
      }

      if (action === 'update') {
        const name = args.name?.trim()
        return name === undefined || name === ''
          ? forward(['update'], '已更新 profile 里的全部插件，重启 DSH 后生效', undefined)
          : forward(['update', name], `已更新 "${name}"，重启 DSH 后生效`, name)
      }

      if (action === 'market_install') {
        const slug = requireArg(args.slug ?? args.name, 'slug', action)
        const item = await runtime.registry.get(slug, args.registry, signal)
        if (item === undefined) {
          throw new WorkbenchError(`市场里没有 "${slug}"`, 'WORKBENCH_MARKET_NOT_FOUND')
        }
        // 上游没发安装规格时用 slug 兜底：装失败是一次明确的失败，
        // 比在这里凭空猜一个包名要诚实。
        const base = item.installSpec ?? item.slug
        const version = args.version ?? item.version
        const spec = version === undefined || base.includes('@', 1) ? base : `${base}@${version}`
        assertSafeSpec(spec, 'installSpec')
        return forward(
          ['add', spec],
          `已从 ${item.sourceRegistryName} 安装 "${spec}"，重启 DSH 后生效`,
          item.installSpec ?? undefined,
        )
      }

      // install
      const spec = requireArg(args.spec, 'spec', action)
      // 相对路径会被 dsh 锚到**它自己的**工作目录，而这里不是用户的 shell，
      // 两边对不上时装出来的东西指向哪儿谁也说不准，所以直接拒绝。
      if (/^(?:file:|link:)?\.{1,2}[/\\]/u.test(spec)) {
        throw new WorkbenchError(
          `不接受相对路径 "${spec}"：本工具不在用户的 shell 目录里运行，相对路径会解析到别处；请给绝对路径`,
          'WORKBENCH_PLUGIN_BAD_SPEC',
        )
      }
      const local = await inspectLocalSpec(spec, profileDir)
      if (local !== undefined && !local.declaresBundle && args.allowNonBundle !== true) {
        throw new WorkbenchError(
          `${local.path} 的 package.json 没有声明 dsh.bundle，装上去也不会参与 DSH 组合；`
          + `常见原因是路径指到了聚合仓库的根目录而不是插件包本身。`
          + `确认要按普通依赖安装请传 allowNonBundle: true`,
          'WORKBENCH_PLUGIN_NOT_A_BUNDLE',
        )
      }
      return forward(
        ['add', spec],
        `已安装 "${local?.packageName ?? spec}"，重启 DSH 后生效`,
        local?.packageName,
      )
    },
    presentCall: (args: PluginArgs): GenericCallView => {
      const subject = args.spec ?? args.name ?? args.slug ?? args.keyword
      return {
        card: 'generic',
        kind: 'search',
        title: subject === undefined ? `插件：${args.action}` : `插件：${args.action} ${subject}`,
        rawInput: args.action,
      }
    },
  }))
}
