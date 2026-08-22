/**
 * 技能域的投影：工具与管理界面共用的那一份。
 *
 * 这里放的是「一个技能在外面长什么样」的唯一定义。工具（给模型）与 Remote
 * 网关（给界面）都从这里取，两边因此不会各说各话——员工域上一轮踩过的坑
 * 就是投影被抄了两份，注释说共用、实际各算各的。
 *
 * 最要紧的一件事是 {@link collectSkills} 合的那两份清单：`ctx.skills` 回答
 * 「模型现在能用什么」（含 rank 与同名遮蔽），本地目录回答「本插件改得动
 * 什么」。同名时高 rank 的来源会盖住用户级，盘上那份仍在、却不生效——
 * `shadowed` 标的就是这种情况。不标出来的话，「我明明建了却调不到」会变成
 * 一个查不明白的问题。
 *
 * @module @staff-os/dsh-workbench/skill/view
 */

import { resolve } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'
import type { SkillSummary } from '@deepseek-ai/dsh-skill'
import type { RegistryItem } from '../types.ts'
import { listLocalSkills, skillDir } from './local.ts'
import type { LocalSkill, RejectedSkill } from './local.ts'

/** 一个技能的投影。 */
export interface SkillView {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  /** 来源标识，例如 `user-dsh`、`project`、`bundled`。 */
  readonly source: string
  /** 提供方插件；`ctx.skills` 才知道这个。 */
  readonly provider?: string
  /** 模型能否自行调用。 */
  readonly modelInvocable: boolean
  /** 用户能否用 `/name` 手动触发。 */
  readonly userInvocable: boolean
  /** 本插件改不改得动它：只有用户级目录里那些才改得动。 */
  readonly managed: boolean
  /** 盘上有这一份，但生效的是同名的另一份。 */
  readonly shadowed: boolean
  readonly path?: string
  /** 技能目录里除 SKILL.md 之外的附带文件。 */
  readonly files?: readonly string[]
}

/** 一个市场条目的投影。 */
export interface MarketView {
  readonly slug: string
  readonly name: string
  readonly description?: string
  readonly version?: string
  readonly tags: readonly string[]
  readonly category?: string
  readonly installCount: number
  readonly avgRating: number
  /** 累计下载量。市场列表主要按它排序，比安装量更能反映热度。 */
  readonly downloadCount: number
  /** 上游仓库 star 数。 */
  readonly stars: number
  /** 发布者。 */
  readonly owner?: string
  /** 图标地址；本插件只透传给界面，不下载。 */
  readonly iconUrl?: string
  /** 条目主页，给「在浏览器里打开」用。 */
  readonly homepage?: string
  /**
   * 平台安全审核结论。
   *
   * 技能装上去就是模型会照着执行的指令，所以这一条要出现在安装按钮旁边，
   * 而不是让人自己去网站上找。只有详情里有。
   */
  readonly securityStatus?: string
  /**
   * 这条是谁托管的：`clawhub` 是 registry 自己托管，其余值说明它是别家目录的
   * 镜像条目。上游没给这个字段时不存在。
   */
  readonly installKind?: string
  /** 能不能从这个源直接装。false 时安装按钮该是禁用的。 */
  readonly installable: boolean
  readonly registry: string
  readonly registryName: string
}

/** 一个被 DSH 拒收的盘上条目。 */
export interface RejectedView {
  /** 从路径推出来的名字，仅用于显示——它没有通过 DSH 的校验，不是有效技能名。 */
  readonly hint: string
  /** 文件路径。 */
  readonly path: string
  /** DSH 丢弃它的理由。 */
  readonly reason: string
}

/** 把一个市场条目投影成出参形状。 */
export function projectMarket(item: RegistryItem): MarketView {
  return {
    slug: item.slug,
    name: item.name,
    ...item.description === undefined ? {} : { description: item.description },
    ...item.version === undefined ? {} : { version: item.version },
    tags: [...item.tags],
    ...item.category === undefined ? {} : { category: item.category },
    installCount: item.installCount,
    avgRating: item.avgRating,
    downloadCount: item.downloadCount,
    stars: item.stars,
    ...item.owner === undefined ? {} : { owner: item.owner },
    ...item.iconUrl === undefined ? {} : { iconUrl: item.iconUrl },
    ...item.homepage === undefined ? {} : { homepage: item.homepage },
    ...item.securityStatus === undefined ? {} : { securityStatus: item.securityStatus },
    ...item.installKind === undefined ? {} : { installKind: item.installKind },
    installable: item.installable,
    registry: item.sourceRegistry,
    registryName: item.sourceRegistryName,
  }
}

/** 把一个被拒收的条目投影成出参形状。 */
export function projectRejected(entry: RejectedSkill): RejectedView {
  return { hint: entry.hint, path: entry.path, reason: entry.reason }
}

/** 一个盘上技能的投影，带上是否被遮蔽。 */
export function projectLocal(skill: LocalSkill, shadowed: boolean): SkillView {
  return {
    name: skill.name,
    description: skill.description,
    ...skill.whenToUse === undefined ? {} : { whenToUse: skill.whenToUse },
    source: 'user-dsh',
    modelInvocable: skill.modelInvocable,
    userInvocable: skill.userInvocable,
    managed: true,
    shadowed,
    path: skill.path,
    ...skill.files.length === 0 ? {} : { files: [...skill.files] },
  }
}

/** 一个 `ctx.skills` 赢家的投影。 */
export function projectWinner(summary: SkillSummary, managed: boolean): SkillView {
  const base = summary.resourceBase
  const path = base !== undefined && base.kind === 'directory' ? base.path : undefined
  return {
    name: summary.name,
    description: summary.description,
    ...summary.whenToUse === undefined ? {} : { whenToUse: summary.whenToUse },
    source: summary.source,
    provider: summary.provider,
    modelInvocable: summary.invocation.modelInvocable,
    userInvocable: summary.invocation.userInvocable,
    managed,
    shadowed: false,
    ...path === undefined ? {} : { path },
  }
}

/**
 * 赢家是不是就是我们盘上那一份。
 *
 * 两种形状都要认：目录形技能的 `resourceBase` 是 `<root>/<name>`，而扁平形
 * （`<name>.md`）的是 `<root>` 本身——DSH 对扁平文件给的就是技能根。只比对
 * 前者的话，手写的扁平技能会被判成「不受本插件管」，界面上变成只读，
 * 删都删不掉。
 */
export function winnerIsLocal(summary: SkillSummary, root: string): boolean {
  const base = summary.resourceBase
  if (base === undefined || base.kind !== 'directory') return false
  const dir = resolve(base.path)
  return dir === resolve(skillDir(root, summary.name)) || dir === resolve(root)
}

/**
 * 合并「实际生效的技能」与「本插件管的技能」。
 *
 * 见本模块开头：两份清单不是同一件事，同名时盘上那份可能存在却不生效。
 * @param ctx - cordis 上下文，用来取 `ctx.skills`。
 * @param root - 用户级技能目录。
 * @param signal - 取消信号。
 * @returns 按名字排序的技能清单。
 */
export async function collectSkills(
  ctx: Context,
  root: string,
  signal?: AbortSignal,
): Promise<SkillView[]> {
  const local = await listLocalSkills(root)
  const registry = ctx.get('skills')
  if (registry === undefined) {
    return local.map(skill => projectLocal(skill, false))
  }
  const winners = await registry.list({ ...signal === undefined ? {} : { signal } })
  const byName = new Map(winners.map(summary => [summary.name, summary]))
  const views: SkillView[] = []
  for (const summary of winners) {
    views.push(projectWinner(summary, winnerIsLocal(summary, root)))
  }
  for (const skill of local) {
    const winner = byName.get(skill.name)
    if (winner !== undefined && winnerIsLocal(winner, root)) continue
    views.push(projectLocal(skill, winner !== undefined))
  }
  return views.sort((left, right) => left.name.localeCompare(right.name))
}
