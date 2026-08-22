/**
 * 员工域的只读投影，工具与 Remote 两个消费方共用一份。
 *
 * 抽出来是因为它有两个调用方而不是一个：`workbench_employee` 工具把它渲染成
 * 给模型看的文本，`WorkbenchEmployeeGateway` 把同一份数据送给浏览器画界面。
 * 两边各写一遍的话，界面上看到的员工和模型看到的员工会慢慢长成两个东西。
 *
 * 这里只有读。写操作留在工具那边——它带着确认语义（删除要 confirm）和
 * 面向模型的错误文本，那些不属于投影。
 *
 * @module @staff-os/dsh-workbench/employee/view
 */

import { readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { AgentPreset, AgentPresets } from '@deepseek-ai/dsh-agent-presets'
import type {} from '@deepseek-ai/dsh-skill'
import { listKnowledgeBases } from '../knowledge/store.ts'
import { listServers, loadPatch } from '../mcp/patch.ts'
import { listLocalSkills } from '../skill/local.ts'
import type { WorkbenchPaths } from '../paths.ts'
import { BINDING_KINDS, readBindings } from './store.ts'
import type { EmployeeBindings } from './store.ts'
import { emptyComposition, parseComposition } from './composition.ts'
import type { CompositionSummary } from './composition.ts'

/**
 * 一个员工「装了什么」的概览。
 *
 * 全部从它的 agent 组合文件读出来——那份文件才是这个智能体模板实际由什么
 * 组成的唯一依据。列表上要一眼看出 minimal 和 standard 不是一回事，靠的就是
 * 这几个数字。
 */
export interface EmployeeCapabilities {
  /** 工具插件行数。**不等于工具名个数**：一行可能注册好几个工具。 */
  readonly tools: number
  /** 技能能力行数（技能发现、技能目录与加载器）。 */
  readonly skills: number
  /** 组合文件里的 MCP 行数。 */
  readonly mcpServers: number
  /** 有没有自己的人设；没有就用部署的默认人设。 */
  readonly hasPersona: boolean
  /** 人设的头一句，列表上给个印象。 */
  readonly personaLine?: string
  /** 人设是不是完整系统提示（别处再加不进去）。 */
  readonly personaComplete: boolean
  /** 是否读工作区的 AGENTS.md。 */
  readonly agentInstructions: boolean
  /** 组合文件的条目总数。 */
  readonly entries: number
  /** 组合文件读不动时的原因。 */
  readonly error?: string
}

/** 一个 AI 员工的完整只读投影。 */
export interface EmployeeView {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly order?: number
  /** `system` 是随部署发布的，不能改也不能删。 */
  readonly trust: string
  /** 是不是新会话默认挂载的那个。 */
  readonly isDefault: boolean
  /** 这个 preset 为什么挂不起来；能挂时不出现。 */
  readonly broken?: string
  readonly persona?: string
  readonly knowledgeBases: readonly string[]
  readonly skills: readonly string[]
  readonly mcpServers: readonly string[]
  /** 这个模板由什么组成，读自它的 agent 组合文件。 */
  readonly capabilities: EmployeeCapabilities
}

/** 一条指向不存在资源的绑定。 */
export interface UnknownBinding {
  readonly kind: string
  readonly id: string
}

/** 现有的可绑定资源，用来校验绑定指向的东西是否还在。 */
export interface Inventory {
  readonly knowledgeBases: ReadonlySet<string>
  readonly skills: ReadonlySet<string>
  readonly mcpServers: ReadonlySet<string>
}

/** preset 目录：composition 文件的父目录。 */
export function presetDirOf(preset: AgentPreset): string {
  return dirname(preset.path)
}

/** 人设的头一句，掐到一行以内。 */
function firstLine(text: string): string | undefined {
  const line = text.split(/\r?\n/u).map(part => part.trim()).find(part => part !== '')
  if (line === undefined) return undefined
  return line.length > 120 ? `${line.slice(0, 119)}…` : line
}

/** 把一份组合文件摘要压成列表用的几个数字。 */
export function summarize(composition: CompositionSummary): EmployeeCapabilities {
  const line = composition.persona === undefined ? undefined : firstLine(composition.persona.text)
  return {
    tools: composition.tools.length,
    skills: composition.skills.length,
    mcpServers: composition.mcpServers.length,
    hasPersona: composition.persona !== undefined,
    ...line === undefined ? {} : { personaLine: line },
    personaComplete: composition.persona?.complete === true,
    agentInstructions: composition.agentInstructions,
    entries: composition.total,
    ...composition.error === undefined ? {} : { error: composition.error },
  }
}

/**
 * 读并解析一个 preset 的 agent 组合文件。
 *
 * 读不到就当空摘要带上原因：一个 preset 的组合文件坏了或没权限，不该让整份
 * 员工列表取不出来。`preset.broken` 那条路管的是「挂不起来」，与这里无关。
 */
export async function readComposition(preset: AgentPreset): Promise<CompositionSummary> {
  try {
    return parseComposition(await readFile(preset.path, 'utf8'))
  } catch (cause) {
    return emptyComposition(cause instanceof Error ? cause.message : String(cause))
  }
}

/** 投影一个员工。 */
export function project(
  preset: AgentPreset,
  defaultId: string,
  bindings: EmployeeBindings,
  composition: CompositionSummary,
): EmployeeView {
  return {
    id: preset.id,
    name: preset.name ?? preset.id,
    ...preset.description === undefined ? {} : { description: preset.description },
    ...preset.order === undefined ? {} : { order: preset.order },
    trust: preset.trust,
    isDefault: preset.id === defaultId,
    ...preset.broken === undefined ? {} : { broken: preset.broken },
    ...bindings.persona === undefined ? {} : { persona: bindings.persona },
    knowledgeBases: [...bindings.knowledgeBases],
    skills: [...bindings.skills],
    mcpServers: [...bindings.mcpServers],
    capabilities: summarize(composition),
  }
}

/**
 * 读出当前盘上的可绑定资源。
 *
 * 技能取「盘上的」与「当前生效的」并集：刚建的还没被 DSH 扫到，项目级的
 * 又不在盘上，只认一边都会误报不存在。
 */
export async function readInventory(ctx: Context, paths: WorkbenchPaths): Promise<Inventory> {
  const bases = await listKnowledgeBases(paths.knowledge)
  const localSkills = await listLocalSkills(paths.skills)
  const registry = ctx.get('skills')
  const effective = registry === undefined ? [] : await registry.list({})
  const servers = listServers(await loadPatch(paths.profilePatch))
  return {
    knowledgeBases: new Set(bases.map(kb => kb.id)),
    skills: new Set([...localSkills.map(skill => skill.name), ...effective.map(skill => skill.name)]),
    mcpServers: new Set(servers.map(server => server.serverName)),
  }
}

/** 找出绑定里指向不存在资源的条目。 */
export function findUnknown(bindings: EmployeeBindings, inventory: Inventory): UnknownBinding[] {
  const unknown: UnknownBinding[] = []
  for (const kind of BINDING_KINDS) {
    for (const id of bindings[kind]) {
      if (!inventory[kind].has(id)) unknown.push({ kind, id })
    }
  }
  return unknown
}

/** 列出全部员工，按 preset 的既有顺序。 */
export async function listEmployees(
  presets: AgentPresets,
  defaultId: string,
): Promise<EmployeeView[]> {
  const all = await presets.list()
  return Promise.all(all.map(async preset => project(
    preset,
    defaultId,
    await readBindings(presetDirOf(preset)),
    await readComposition(preset),
  )))
}
