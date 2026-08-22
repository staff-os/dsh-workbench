/**
 * 读懂一个 AI 员工「实际是什么」：解析它的 agent 组合文件。
 *
 * 一个员工不是一张名片，而是**人设 + 工具 + 技能 + MCP + 知识库**凑起来的一个
 * 可直接对话的智能体模板。名片（`preset.yml`）只有名字和简介，真正决定这个
 * 员工能干什么的是 `agent.cordis.yml`——一份 cordis loader 的条目数组，每行装
 * 一个插件，可以用 `cordis:group` 套娃。
 *
 * 所以界面要展示的东西得从那份文件里读出来，而不是另建一套记录：那样两边会
 * 立刻开始不一致，而组合文件才是唯一说了算的那个。
 *
 * **分类是按包名前缀的启发式，不是 DSH 的正式分类。** `@deepseek-ai/dsh-tool-*`
 * 认作工具行，`dsh-skill*` 认作技能能力，`dsh-mcp-client` 认作 MCP。DSH 没有
 * 给插件打「我是工具」的标记，能依据的只有命名约定；认不出来的一律进
 * {@link CompositionSummary.others}，而不是猜。
 *
 * 还有一件事必须说清楚，界面上也照实写：**一个工具行不等于一个工具名**。
 * `dsh-tool-fs` 一行会往目录里注册好几个文件操作工具，真正的工具名要到运行时
 * 才知道。这里给出的是「这个员工装了哪些工具插件」，不是模型看到的工具清单。
 *
 * @module @staff-os/dsh-workbench/employee/composition
 */

import { parseDocument } from 'yaml'

/** 一行条目在本包眼里的类别。 */
export type EntryKind = 'persona' | 'instructions' | 'tool' | 'skill' | 'mcp' | 'other'

/** 组合文件里的一行。 */
export interface CompositionEntry {
  /** 条目 id；组合文件里几乎总是写了。 */
  readonly id?: string
  /** 插件包名，原样。 */
  readonly name: string
  /** 去掉约定前缀后的短名，给界面显示用。 */
  readonly label: string
  /** 本包认出来的类别。 */
  readonly kind: EntryKind
  /**
   * 禁用条件。`true` 是写死禁用；字符串是 `!!js` 表达式原文（例如按平台
   * 禁用），到底禁不禁用要看运行环境，所以原样给出而不是替它判断。
   */
  readonly disabled?: true | string
  /** 它套在哪几层 group 里，自外向内；顶层是空数组。 */
  readonly group: readonly string[]
}

/** 人设行读出来的东西。 */
export interface PersonaSummary {
  /** 系统提示原文。 */
  readonly text: string
  /** 为真时这段文本就是完整的系统提示，别处再也加不进去。 */
  readonly complete: boolean
  /** 是否把运行时上下文（工作目录、时间等）附给模型。 */
  readonly includeRuntimeContext: boolean
}

/** 一份组合文件读出来的全部东西。 */
export interface CompositionSummary {
  /** 人设；没有 persona 行时不存在（此时用部署的默认人设）。 */
  readonly persona?: PersonaSummary
  /** 是否装了 `dsh-agent-instructions`（读工作区的 AGENTS.md）。 */
  readonly agentInstructions: boolean
  /** 工具插件行。 */
  readonly tools: readonly CompositionEntry[]
  /** 技能相关行。 */
  readonly skills: readonly CompositionEntry[]
  /** MCP 相关行。 */
  readonly mcpServers: readonly CompositionEntry[]
  /** 认不出类别的其余行。 */
  readonly others: readonly CompositionEntry[]
  /** 条目总数（含 group 行本身不计）。 */
  readonly total: number
  /** 解析失败的原因；解析成功时不存在。 */
  readonly error?: string
}

/** 约定前缀，用来认类别和推短名。 */
const TOOL_PREFIX = '@deepseek-ai/dsh-tool-'
const SKILL_PREFIXES = ['@deepseek-ai/dsh-skill', '@deepseek-ai/dsh-tool-skill']
const MCP_PREFIXES = ['@deepseek-ai/dsh-mcp']
const PERSONA_NAME = '@deepseek-ai/dsh-persona'
const INSTRUCTIONS_NAME = '@deepseek-ai/dsh-agent-instructions'

/**
 * 空摘要，附一句为什么是空的。
 *
 * 导出是给读文件那一步用的：文件都没读到时也要给界面一个能显示的说明，
 * 而不是让整份员工列表跟着失败。
 */
export function emptyComposition(error?: string): CompositionSummary {
  return {
    agentInstructions: false,
    tools: [],
    skills: [],
    mcpServers: [],
    others: [],
    total: 0,
    ...error === undefined ? {} : { error },
  }
}

/** 认一行的类别。 */
function classify(name: string): EntryKind {
  if (name === PERSONA_NAME) return 'persona'
  if (name === INSTRUCTIONS_NAME) return 'instructions'
  // 技能在工具之前判：`dsh-tool-skill` 两个前缀都沾，它是技能能力而不是
  // 又一个普通工具。
  if (SKILL_PREFIXES.some(prefix => name.startsWith(prefix))) return 'skill'
  if (MCP_PREFIXES.some(prefix => name.startsWith(prefix))) return 'mcp'
  if (name.startsWith(TOOL_PREFIX)) return 'tool'
  return 'other'
}

/** 推一个给人看的短名。 */
function labelOf(name: string): string {
  for (const prefix of [TOOL_PREFIX, '@deepseek-ai/dsh-']) {
    if (name.startsWith(prefix)) return name.slice(prefix.length)
  }
  return name
}

/** 读禁用标记。`!!js` 表达式被 yaml 解析成字符串，原样留着。 */
function disabledOf(value: unknown): true | string | undefined {
  if (value === true) return true
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  return undefined
}

/** 读人设行。 */
function personaOf(config: unknown): PersonaSummary | undefined {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) return undefined
  const record = config as Record<string, unknown>
  const text = typeof record.text === 'string' ? record.text : ''
  if (text === '') return undefined
  return {
    text,
    complete: record.complete === true,
    // 缺省是给的：只有显式写 false 才不给。
    includeRuntimeContext: record.includeRuntimeContext !== false,
  }
}

/**
 * 解析一份 agent 组合文件。
 *
 * 解析不出来不抛异常而是把原因放进 {@link CompositionSummary.error}：这是给
 * 界面看的一份说明，读不懂它不该让整个员工页打不开。
 * @param source - 组合文件原文。
 * @returns 读出来的摘要。
 */
export function parseComposition(source: string): CompositionSummary {
  let rows: unknown
  // 语法错误不一定抛异常：yaml 会把它们收进 doc.errors，同时照样吐出能解析
  // 出来的那部分。那部分照样展示（总比什么都不显示强），但必须带上这条错误
  // ——否则界面会安静地少列几个工具，看的人还以为这个员工本来就这么少。
  let defect: string | undefined
  try {
    // `logLevel: 'silent'`：组合文件里有 `!!js` 这种 DSH 自己的标签，yaml
    // 不认得它，但会原样把值当字符串留下——那正是这里想要的，也不算 error。
    const doc = parseDocument(source, { logLevel: 'silent' })
    defect = doc.errors[0]?.message
    rows = doc.toJS() as unknown
  } catch (cause) {
    return emptyComposition(cause instanceof Error ? cause.message : String(cause))
  }
  if (!Array.isArray(rows)) return emptyComposition('组合文件的顶层不是条目数组')

  const tools: CompositionEntry[] = []
  const skills: CompositionEntry[] = []
  const mcpServers: CompositionEntry[] = []
  const others: CompositionEntry[] = []
  let persona: PersonaSummary | undefined
  let agentInstructions = false
  let total = 0

  /** 递归走一层条目；group 行本身不计数，只往下走。 */
  const walk = (list: readonly unknown[], group: readonly string[]): void => {
    for (const value of list) {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue
      const row = value as Record<string, unknown>
      const name = typeof row.name === 'string' ? row.name : ''
      if (name === '') continue

      if (row.group === true) {
        const nested = row.config
        if (Array.isArray(nested)) {
          const id = typeof row.id === 'string' ? row.id : name
          walk(nested, [...group, id])
        }
        continue
      }

      total += 1
      const kind = classify(name)
      const entry: CompositionEntry = {
        ...typeof row.id === 'string' ? { id: row.id } : {},
        name,
        label: labelOf(name),
        kind,
        ...disabledOf(row.disabled) === undefined ? {} : { disabled: disabledOf(row.disabled) as true | string },
        group,
      }

      switch (kind) {
        case 'persona':
          persona ??= personaOf(row.config)
          break
        case 'instructions':
          agentInstructions = true
          break
        case 'tool':
          tools.push(entry)
          break
        case 'skill':
          skills.push(entry)
          break
        case 'mcp':
          mcpServers.push(entry)
          break
        case 'other':
          others.push(entry)
          break
      }
    }
  }

  walk(rows, [])

  return {
    ...persona === undefined ? {} : { persona },
    agentInstructions,
    tools,
    skills,
    mcpServers,
    others,
    total,
    ...defect === undefined ? {} : { error: defect },
  }
}
