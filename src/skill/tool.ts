/**
 * 面向模型的 `workbench_skill` 工具：本地技能读写 + ClawHub 技能市场。
 *
 * 读路径尽量走 DSH 原生的 `ctx.skills`——它含 rank 与同名遮蔽规则，重造一遍
 * 只会得到一份和实际生效结果对不上的清单。本工具自己管的是**写**，以及
 * `ctx.skills` 不回答的那个问题：「我写的这份，现在到底生没生效」。
 *
 * @module @staff-os/dsh-workbench/skill/tool
 */

import { resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenericCallView } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { requireConfirm, WorkbenchError } from '../types.ts'
import type { PackageFile } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import {
  createLocalSkill,
  installSkillFiles,
  listLocalSkills,
  readLocalSkill,
  removeLocalSkill,
  scanLocalSkills,
  setSkillVisibility,
  skillDir,
} from './local.ts'
import type { InstallLocation } from './local.ts'
import type { SkillOrigin } from './ledger.ts'
import { selectSkillFromPackage } from './package.ts'
import { forgetInstall, isNewerVersion, readLedger, recordInstall } from './ledger.ts'
import type {} from './activation.ts'
import { classifyImportSource, fetchPackage, readLocalPackage } from './source.ts'
import { collectSkills, projectLocal, projectMarket, projectWinner, winnerIsLocal } from './view.ts'
import type { MarketView, SkillView } from './view.ts'

/** 工具支持的动作。 */
const ACTIONS = [
  'list',
  'get',
  'create',
  'set_visibility',
  'import',
  'delete',
  'market_search',
  'market_get',
  'market_install',
  'market_update',
  'check_updates',
] as const

type Action = typeof ACTIONS[number]

/**
 * 技能工具的默认超时预算。
 *
 * 比纯本地写盘的工具宽得多：`import` 和 `market_install` 要下载并解包一个
 * 技能包，几十秒是正常的，按写文件的尺度掐会把正常安装掐成失败。
 */
export const DEFAULT_SKILL_TOOL_TIMEOUT_MS = 120_000

/** 工具入参。 */
interface SkillArgs {
  action: string
  name?: string
  description?: string
  whenToUse?: string
  content?: string
  modelInvocable?: boolean
  userInvocable?: boolean
  from?: string
  slug?: string
  version?: string
  registry?: string
  owner?: string
  keyword?: string
  page?: number
  pageSize?: number
  sort?: string
  overwrite?: boolean
  confirm?: boolean
}

/** 出参里的一个技能。 */
/**
 * 把共用投影放宽成出参的形状。
 *
 * 工具的出参 schema 推导出的是可变类型，投影是只读的（它是投影，谁都不该
 * 改它）。放宽只发生在下面那两个函数里，而不是让投影为了迁就 schema 放弃
 * readonly。
 */
type Row<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] | undefined ? U[] : T[K] }

/** 出参里的一个技能。 */
type SkillRow = Row<SkillView>

/** 出参里的一个市场条目。 */
type MarketRow = Row<MarketView>

/** 放宽一个技能投影。 */
function skillRow(view: SkillView): SkillRow {
  // 先把 files 摘出来再拼回去：直接 spread 的话 `...view` 带进来的还是只读
  // 数组类型，条件 spread 覆盖不掉它。
  const { files, ...rest } = view
  return { ...rest, ...files === undefined ? {} : { files: [...files] } }
}

/** 放宽一个市场条目投影。 */
function marketRow(view: MarketView): MarketRow {
  return { ...view, tags: [...view.tags] }
}

/** 工具出参。 */
interface SkillOutput {
  action: string
  message: string
  skills: SkillRow[]
  market: MarketRow[]
  content?: string
  fromCache?: boolean
}

/** 校验动作名。 */
export function parseSkillAction(raw: string): Action {
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

/** 渲染成给模型看的文本。 */
export function formatSkillOutput(value: FormattableSkillOutput): string {
  const lines: string[] = [value.message]
  if (value.skills.length > 0) {
    lines.push('')
    for (const skill of value.skills) {
      const flags: string[] = [skill.source]
      if (skill.shadowed) flags.push('已被同名技能遮蔽，当前不生效')
      if (!skill.modelInvocable) flags.push('模型不可调用')
      if (!skill.userInvocable) flags.push('用户不可调用')
      lines.push(`- ${skill.name}（${flags.join('，')}）：${skill.description}`)
      if (skill.whenToUse !== undefined && skill.whenToUse !== '') lines.push(`  何时用：${skill.whenToUse}`)
    }
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
  if (value.fromCache === true) {
    lines.push('')
    lines.push('注意：本次结果来自离线缓存，registry 当前不可达。')
  }
  if (value.content !== undefined && value.content !== '') {
    lines.push('')
    lines.push(value.content)
  }
  return lines.join('\n')
}

/** {@link formatSkillOutput} 需要的最小技能形状。 */
interface FormattableSkill {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string | undefined
  readonly source: string
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
  readonly shadowed: boolean
}

/** {@link formatSkillOutput} 需要的最小市场条目形状。 */
interface FormattableMarketItem {
  readonly slug: string
  readonly name: string
  readonly description?: string | undefined
  readonly version?: string | undefined
  readonly registryName: string
}

/** {@link formatSkillOutput} 需要的最小整体形状。 */
interface FormattableSkillOutput {
  readonly message: string
  readonly skills: readonly FormattableSkill[]
  readonly market: readonly FormattableMarketItem[]
  readonly content?: string | undefined
  readonly fromCache?: boolean | undefined
}

/** 一个技能在出参 schema 里的形状。 */
const SKILL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string', required: true },
    description: { type: 'string', required: true },
    whenToUse: { type: 'string' },
    source: { type: 'string', required: true },
    provider: { type: 'string' },
    modelInvocable: { type: 'boolean', required: true },
    userInvocable: { type: 'boolean', required: true },
    managed: { type: 'boolean', required: true },
    shadowed: { type: 'boolean', required: true },
    path: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
  },
} as const

/** 一个市场条目在出参 schema 里的形状。 */
const MARKET_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    slug: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    version: { type: 'string' },
    tags: { type: 'array', required: true, items: { type: 'string' } },
    category: { type: 'string' },
    installCount: { type: 'number', required: true },
    avgRating: { type: 'number', required: true },
    registry: { type: 'string', required: true },
    registryName: { type: 'string', required: true },
  },
} as const

/**
 * 装一个技能包并汇报结果。
 *
 * 两步：先在包里定位技能（包根不一定就是技能根，也可能一个包里好几个），
 * 再落盘。落完回读一次 `ctx.skills` 确认它到底生没生效——写成功不等于生效，
 * 同名遮蔽和 frontmatter 被拒收都只有回读才看得见。
 */
async function install(
  ctx: Context,
  location: InstallLocation,
  files: readonly PackageFile[],
  overwrite: boolean,
  origin: string,
  prefer?: string,
  ledger?: { workbenchDir: string; entry: Omit<SkillOrigin, 'name' | 'installedAt'> },
): Promise<SkillOutput> {
  const picked = selectSkillFromPackage(files, prefer)
  const result = await installSkillFiles(location, picked.files, { overwrite })
  if (ledger !== undefined) {
    // 记下来源与版本，更新检查要拿它去比。手工导入（本地包、URL）没有
    // registry 坐标，所以那两条路径不记——它们本来也无从「更新」。
    await recordInstall(ledger.workbenchDir, {
      ...ledger.entry,
      name: result.installedAs,
      installedAt: Date.now(),
    })
  }
  const resources = result.fileCount - 1
  const activation = ctx.get('workbenchSkillActivation')
  activation?.notifyChanged()
  const state = await activation?.verify(result.installedAs, location.root)
  return {
    action: 'import',
    message: [
      `已${result.replaced ? '覆盖安装' : '安装'}技能 "${result.installedAs}"（来自 ${origin}）`,
      resources > 0 ? `，含 ${String(resources)} 个资源文件` : '',
      result.binaryCount > 0 ? `（${String(result.binaryCount)} 个二进制）` : '',
      `。${state?.summary ?? ''}`,
    ].join(''),
    skills: [skillRow(projectLocal(result.skill, false))],
    market: [],
  }
}

/**
 * 注册 `workbench_skill` 工具及其使用指引。
 */
export function applySkillTool(ctx: Context, timeoutMs: number, networkTimeoutMs: number): void {
  ctx.systemPrompt.section({
    name: 'tool:workbench_skill',
    order: 122,
    text: [
      'workbench_skill 管理本机的技能：本地技能落在 $DSH_HOME/skills/<name>/SKILL.md，',
      '市场动作对接已配置的 ClawHub 兼容 registry。',
      'list 结果里 shadowed 为 true 表示盘上有这份技能、但被同名的更高优先级来源盖住了，',
      '此时改它不会有效果，要先向用户说明。写完的技能下一个回合就生效，不需要重启，'
      + '每次写操作的返回里都带一句它到底生没生效的结论，照它说的答复用户。'
      + 'ClawHub 上不同发布者可以用同一个 slug，安装时把 market_search 结果里的 owner 一并带上，'
      + '否则会因为歧义失败。新建技能时 description 必须写清「什么情况下该用它」，',
      '那是模型选用技能的唯一依据。delete 不可逆，必须先说明再带 confirm: true 调用。',
    ].join(''),
  })

  ctx.tools.register(defineTool({
    name: 'workbench_skill',
    description: [
      'Manage agent skills on this machine. ',
      'Local actions: list (every effective skill plus locally managed ones), get (one skill with its body), ',
      'create, set_visibility, import (from a local archive path, a download/GitHub URL, or a marketplace slug), ',
      'delete (needs confirm). ',
      'Marketplace actions: market_search, market_get, market_install, market_update (reinstall from the source it came from), check_updates. ',
      'Local skills are written to $DSH_HOME/skills/<name>/SKILL.md and take effect on the next model turn — no restart. ',
      'Every write reports back whether the skill actually became effective, since a same-name higher-priority source can shadow it.',
    ].join(''),
    parameters: {
      action: { type: 'string', required: true, enum: ACTIONS, description: 'Which operation to perform.' },
      name: {
        type: 'string',
        description: 'Skill name in kebab-case (lowercase letters, digits and single hyphens). Required for get/create/set_visibility/delete.',
      },
      description: {
        type: 'string',
        description: 'create only: one line telling the model when this skill should be used. This is the only routing signal, so make it concrete.',
      },
      whenToUse: { type: 'string', description: 'create only: extra routing guidance beyond description.' },
      content: { type: 'string', description: 'create only: the markdown instruction body of the skill.' },
      modelInvocable: {
        type: 'boolean',
        description: 'Whether the model may invoke this skill on its own. Defaults to true. Used by create and set_visibility.',
      },
      userInvocable: {
        type: 'boolean',
        description: 'Whether the user may invoke this skill with a slash command. Defaults to true. Used by create and set_visibility.',
      },
      from: {
        type: 'string',
        description: 'import only: a local .zip/.tar.gz path, an http(s) download URL, a GitHub repository URL, or a marketplace slug.',
      },
      slug: { type: 'string', description: 'market_get / market_install only: the marketplace slug.' },
      version: { type: 'string', description: 'Marketplace version to resolve. Defaults to the latest published version.' },
      registry: { type: 'string', description: 'Restrict a marketplace action to one configured registry id. Defaults to searching all of them.' },
      owner: {
        type: 'string',
        description: 'Publisher handle for a marketplace entry. ClawHub lets different publishers share a slug, so an install without it can fail as ambiguous; take the owner field from the market_search result.',
      },
      keyword: { type: 'string', description: 'market_search only: search keyword. Omit to browse the newest entries instead.' },
      page: { type: 'integer', description: 'market_search only: 1-based page number. Defaults to 1.' },
      pageSize: { type: 'integer', description: 'market_search only: entries per page, 1-100. Defaults to 20.' },
      sort: { type: 'string', description: 'market_search only: registry sort key used when browsing without a keyword.' },
      overwrite: { type: 'boolean', description: 'import / market_install only: replace an existing skill of the same name instead of failing.' },
      confirm: { type: 'boolean', description: 'Required to be true for delete, which is irreversible. Ask the user first.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true },
          message: { type: 'string', required: true },
          skills: { type: 'array', required: true, items: SKILL_SCHEMA },
          market: { type: 'array', required: true, items: MARKET_SCHEMA },
          content: { type: 'string' },
          fromCache: { type: 'boolean' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatSkillOutput(value) }],
    },
    timeoutMs,
    // 写路径要独占技能目录；读与市场查询没有共享可变状态。
    isConcurrencySafe: (args) => {
      const action = parseSkillAction(args.action)
      return action === 'list'
        || action === 'get'
        || action === 'market_search'
        || action === 'market_get'
        || action === 'check_updates'
    },
    async execute(args: SkillArgs, exec): Promise<SkillOutput> {
      const runtime = ctx.workbench as WorkbenchRuntime
      const root = runtime.paths.skills
      const location: InstallLocation = { root, stagingParent: runtime.paths.skillStaging }
      const action = parseSkillAction(args.action)
      const signal = exec.signal
      const activation = ctx.get('workbenchSkillActivation')

      /** 写完之后让 DSH 重新发现，并回读确认生效结论。 */
      const settle = async (name: string): Promise<string> => {
        activation?.notifyChanged()
        const state = await activation?.verify(name, root)
        return state === undefined ? '' : `。${state.summary}`
      }

      if (action === 'list') {
        const skills = (await collectSkills(ctx, root, signal)).map(skillRow)
        const managed = skills.filter(skill => skill.managed).length
        // 被 DSH 拒收的条目也要报。它们在盘上、却不会出现在任何会话里，
        // 而 DSH 那边只有一行日志警告——不在这里说，就没有别处会说。
        const { rejected } = await scanLocalSkills(root)
        return {
          action,
          message: [
            skills.length === 0
              ? '当前没有任何技能'
              : `共 ${String(skills.length)} 个技能，其中 ${String(managed)} 个由本工具管理`,
            rejected.length === 0
              ? ''
              : `；另有 ${String(rejected.length)} 个文件被 DSH 拒收，不会生效：`
                + rejected.map(entry => `${entry.hint}（${entry.reason}）`).join('、'),
          ].join(''),
          skills,
          market: [],
        }
      }

      if (action === 'get') {
        const name = requireArg(args.name, 'name', action)
        const registry = ctx.get('skills')
        const definition = await registry?.get(name, { ...signal === undefined ? {} : { signal } })
        const local = await readLocalSkill(root, name)
        if (definition !== undefined) {
          const isLocal = winnerIsLocal(definition, root)
          return {
            action,
            message: isLocal || local === undefined
              ? `技能 "${name}"`
              : `技能 "${name}"（当前生效的是 ${definition.source} 的版本，本地那份被遮蔽）`,
            skills: [skillRow(projectWinner(definition, isLocal))],
            market: [],
            content: definition.content,
          }
        }
        if (local === undefined) {
          throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
        }
        // 盘上有、`ctx.skills` 却没有。为什么查不到不止一种可能，所以这句话
        // 交给 activation 去分辨，不在这里猜。
        const state = await activation?.verify(name, root)
        return {
          action,
          message: `技能 "${name}"${state === undefined ? '' : `（${state.summary}）`}`,
          skills: [skillRow(projectLocal(local, false))],
          market: [],
          content: local.content,
        }
      }

      if (action === 'create') {
        const name = requireArg(args.name, 'name', action)
        const description = requireArg(args.description, 'description', action)
        const skill = await createLocalSkill(root, {
          name,
          description,
          ...args.whenToUse === undefined ? {} : { whenToUse: args.whenToUse },
          ...args.content === undefined ? {} : { content: args.content },
          ...args.modelInvocable === undefined ? {} : { modelInvocable: args.modelInvocable },
          ...args.userInvocable === undefined ? {} : { userInvocable: args.userInvocable },
        })
        return {
          action,
          message: `已创建技能 "${name}"${await settle(name)}`,
          skills: [skillRow(projectLocal(skill, false))],
          market: [],
        }
      }

      if (action === 'set_visibility') {
        const name = requireArg(args.name, 'name', action)
        if (args.modelInvocable === undefined && args.userInvocable === undefined) {
          throw new WorkbenchError(
            '动作 "set_visibility" 必须至少给 modelInvocable 或 userInvocable 其中一个',
            'WORKBENCH_MISSING_ARG',
          )
        }
        const skill = await setSkillVisibility(root, name, {
          ...args.modelInvocable === undefined ? {} : { modelInvocable: args.modelInvocable },
          ...args.userInvocable === undefined ? {} : { userInvocable: args.userInvocable },
        })
        return {
          action,
          message: `已更新技能 "${name}" 的可见性${await settle(name)}`,
          skills: [skillRow(projectLocal(skill, false))],
          market: [],
        }
      }

      if (action === 'delete') {
        const name = requireArg(args.name, 'name', action)
        requireConfirm(args.confirm, `删除技能 "${name}"`)
        const removed = await removeLocalSkill(root, name)
        await forgetInstall(runtime.paths.workbench, name)
        activation?.notifyChanged()
        return {
          action,
          message: `已删除技能 "${name}"`,
          skills: [skillRow(projectLocal(removed, false))],
          market: [],
        }
      }

      if (action === 'market_search') {
        const page = await runtime.registry.search({
          ...args.keyword === undefined ? {} : { keyword: args.keyword },
          ...args.page === undefined ? {} : { page: args.page },
          ...args.pageSize === undefined ? {} : { pageSize: args.pageSize },
          ...args.sort === undefined ? {} : { sort: args.sort },
        }, signal)
        return {
          action,
          message: page.items.length === 0
            ? '市场里没有匹配的技能'
            : `市场共找到 ${String(page.items.length)} 个技能`,
          skills: [],
          market: page.items.map(item => marketRow(projectMarket(item))),
          fromCache: page.fromCache,
        }
      }

      if (action === 'market_get') {
        const slug = requireArg(args.slug ?? args.name, 'slug', action)
        const item = await runtime.registry.get(slug, args.registry, signal)
        if (item === undefined) {
          throw new WorkbenchError(`市场里没有 "${slug}"`, 'WORKBENCH_MARKET_NOT_FOUND')
        }
        return { action, message: `市场技能 "${slug}"`, skills: [], market: [marketRow(projectMarket(item))] }
      }

      if (action === 'check_updates') {
        // 只查台账里有记录的技能：手写的技能没有「上游最新版」这回事，
        // 拿名字去市场碰一个同名条目再报「有更新」，是在用一个不相干的包
        // 冒充它的新版。
        const ledger = await readLedger(runtime.paths.workbench)
        const present = new Set((await scanLocalSkills(root)).skills.map(skill => skill.name))
        const rows: string[] = []
        let outdated = 0
        for (const entry of ledger.values()) {
          if (!present.has(entry.name)) continue
          const source = runtime.registry.listSources().find(candidate => candidate.id === entry.registry)
          if (source === undefined) {
            rows.push(`${entry.name}：装它的源 "${entry.registry}" 现在没配置，查不了`)
            continue
          }
          let latest: string | undefined
          try {
            latest = await runtime.registry.latestVersion(source, entry.slug, signal)
          } catch (error: unknown) {
            rows.push(`${entry.name}：查询失败（${String(error)}）`)
            continue
          }
          if (latest !== undefined && isNewerVersion(latest, entry.version)) {
            outdated += 1
            rows.push(`${entry.name}：${entry.version} → ${latest}（market_update 可更新）`)
          }
        }
        return {
          action,
          message: rows.length === 0
            ? '没有从市场装过的技能，或它们都已是最新'
            : `${String(outdated)} 个技能有新版本：${rows.join('；')}`,
          skills: [],
          market: [],
        }
      }

      if (action === 'market_update') {
        const name = requireArg(args.name, 'name', action)
        const existing = await readLocalSkill(root, name)
        if (existing === undefined) {
          throw new WorkbenchError(
            `技能 "${name}" 不在用户目录里，更新无从谈起；要装请用 market_install`,
            'WORKBENCH_SKILL_NOT_FOUND',
          )
        }
        // 台账记着当初从哪个源、哪个 slug、哪个发布者装的。更新的定义是
        // 「同一来源的更新版」，换个源装同名技能是另一回事。
        const known = (await readLedger(runtime.paths.workbench)).get(name)
        const downloaded = await runtime.registry.download(
          args.slug ?? known?.slug ?? name,
          args.version,
          args.registry ?? known?.registry,
          signal,
          args.owner ?? known?.owner,
        )
        const result = await install(
          ctx,
          location,
          downloaded.files,
          true,
          `${downloaded.source.name} v${downloaded.version}`,
          name,
          {
            workbenchDir: runtime.paths.workbench,
            entry: {
              registry: downloaded.source.id,
              slug: args.slug ?? known?.slug ?? name,
              ...downloaded.owner === undefined ? {} : { owner: downloaded.owner },
              version: downloaded.version,
            },
          },
        )
        return { ...result, action }
      }

      if (action === 'market_install') {
        const slug = requireArg(args.slug ?? args.name, 'slug', action)
        const downloaded = await runtime.registry.download(slug, args.version, args.registry, signal, args.owner)
        const result = await install(
          ctx,
          location,
          downloaded.files,
          args.overwrite === true,
          `${downloaded.source.name} v${downloaded.version}`,
          args.name,
          {
            workbenchDir: runtime.paths.workbench,
            entry: {
              registry: downloaded.source.id,
              slug,
              ...downloaded.owner === undefined ? {} : { owner: downloaded.owner },
              version: downloaded.version,
            },
          },
        )
        return { ...result, action }
      }

      const from = requireArg(args.from, 'from', action)
      const origin = classifyImportSource(from, args.version)
      if (origin.kind === 'registry') {
        const downloaded = await runtime.registry.download(origin.slug, origin.version, args.registry, signal, args.owner)
        return install(
          ctx,
          location,
          downloaded.files,
          args.overwrite === true,
          `${downloaded.source.name} v${downloaded.version}`,
          args.name,
          {
            workbenchDir: runtime.paths.workbench,
            entry: {
              registry: downloaded.source.id,
              slug: origin.slug,
              ...downloaded.owner === undefined ? {} : { owner: downloaded.owner },
              version: downloaded.version,
            },
          },
        )
      }
      if (origin.kind === 'url') {
        const files = await fetchPackage(origin.url, origin.label, networkTimeoutMs, signal)
        return install(ctx, location, files, args.overwrite === true, origin.label, args.name)
      }
      const files = await readLocalPackage(origin.path)
      return install(ctx, location, files, args.overwrite === true, origin.path, args.name)
    },
    presentCall: (args: SkillArgs): GenericCallView => {
      const subject = args.name ?? args.slug ?? args.from ?? args.keyword
      return {
        card: 'generic',
        kind: 'search',
        title: subject === undefined ? `技能：${args.action}` : `技能：${args.action} ${subject}`,
        rawInput: args.action,
      }
    },
  }))
}
