/**
 * 面向模型的 `workbench_employee` 工具：AI 员工与资源绑定。
 * @module @staff-os/dsh-workbench/employee/tool
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenericCallView } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-agent-presets'
import type { AgentPreset } from '@deepseek-ai/dsh-agent-presets'
import type {} from '@deepseek-ai/dsh-skill'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { requireConfirm, WorkbenchError } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import {
  applyBinding,
  assertEmployeeId,
  BINDING_KINDS,
  readBindings,
  writeBindings,
  writeMetadata,
} from './store.ts'
import type { BindMode, BindingKind, EmployeeBindings } from './store.ts'
// 投影与清点跟界面共用一份（见 view.ts 的模块注释）：模型看到的员工和界面上
// 看到的必须是同一批，包括「这个模板由什么组成」那几个数字。
import {
  findUnknown,
  listEmployees,
  presetDirOf,
  project,
  readComposition,
  readInventory,
} from './view.ts'
import type { EmployeeView } from './view.ts'

/** 员工工具的默认超时预算。 */
export const DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS = 30_000

/** 工具支持的动作。 */
const ACTIONS = ['list', 'get', 'create', 'update', 'bind', 'delete'] as const

type Action = typeof ACTIONS[number]

const MODES = ['replace', 'add', 'remove'] as const

/** 工具入参。 */
interface EmployeeArgs {
  action: string
  id?: string
  from?: string
  name?: string
  description?: string
  order?: number
  persona?: string
  knowledgeBases?: string[]
  skills?: string[]
  mcpServers?: string[]
  mode?: string
  confirm?: boolean
}

/** 出参里的一个员工。 */
/** 出参里的一个员工：共用投影放宽成可变结构。 */
type EmployeeRow = {
  -readonly [K in keyof EmployeeView]: EmployeeView[K] extends readonly (infer T)[]
    ? T[]
    : EmployeeView[K]
}

/** 工具出参。 */
interface EmployeeOutput {
  action: string
  message: string
  employees: EmployeeRow[]
  /** 绑定里指向了不存在的资源时列在这里。 */
  unknownBindings: { kind: string; id: string }[]
}

/**
 * 把只读投影放宽成出参的形状。
 *
 * 工具的 output schema 推出来的是可变类型，共用投影是只读的；这里是唯一一处
 * 转换，而不是让投影为了迁就 schema 放弃 readonly。
 */
function row(employee: EmployeeView): EmployeeRow {
  return {
    ...employee,
    knowledgeBases: [...employee.knowledgeBases],
    skills: [...employee.skills],
    mcpServers: [...employee.mcpServers],
    capabilities: { ...employee.capabilities },
  }
}

/** 校验动作名。 */
export function parseEmployeeAction(raw: string): Action {
  const action = ACTIONS.find(candidate => candidate === raw)
  if (action === undefined) {
    throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS.join('、')}`, 'WORKBENCH_BAD_ACTION')
  }
  return action
}

/** 校验绑定模式。 */
export function parseBindMode(raw: string | undefined): BindMode {
  if (raw === undefined) return 'replace'
  const mode = MODES.find(candidate => candidate === raw)
  if (mode === undefined) {
    throw new WorkbenchError(`未知 mode "${raw}"，可用：${MODES.join('、')}`, 'WORKBENCH_BAD_ARG')
  }
  return mode
}

function requireArg(value: string | undefined, field: string, action: Action): string {
  const trimmed = value?.trim()
  if (trimmed === undefined || trimmed === '') {
    throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, 'WORKBENCH_MISSING_ARG')
  }
  return trimmed
}

/** 拒绝改动随部署发布的 preset。 */
function assertWritable(preset: AgentPreset): void {
  if (preset.trust !== 'user') {
    throw new WorkbenchError(
      `员工 "${preset.id}" 随部署发布（trust: ${preset.trust}），不能修改；`
      + `用 create 以它为模板复制一个再改`,
      'WORKBENCH_EMPLOYEE_READONLY',
    )
  }
}

/** 渲染成给模型看的文本。 */
export function formatEmployeeOutput(value: FormattableEmployeeOutput): string {
  const lines: string[] = [value.message]
  for (const employee of value.employees) {
    lines.push('')
    const flags: string[] = []
    if (employee.isDefault) flags.push('默认')
    if (employee.trust !== 'user') flags.push('随部署发布，只读')
    if (employee.broken !== undefined) flags.push(`无法挂载：${employee.broken}`)
    lines.push(`- ${employee.id}（${employee.name}${flags.length === 0 ? '' : `，${flags.join('，')}`}）`)
    if (employee.description !== undefined) lines.push(`  简介：${employee.description}`)
    if (employee.persona !== undefined) lines.push(`  岗位：${employee.persona}`)
    if (employee.knowledgeBases.length > 0) lines.push(`  知识库：${employee.knowledgeBases.join('、')}`)
    if (employee.skills.length > 0) lines.push(`  技能：${employee.skills.join('、')}`)
    if (employee.mcpServers.length > 0) lines.push(`  MCP：${employee.mcpServers.join('、')}`)
    // 这个模板由什么组成，读自它的 agent 组合文件。少了这行，四个内置模式在
    // 模型眼里就只剩名字不同了。
    const made: string[] = [`${String(employee.capabilities.tools)} 个工具插件`]
    if (employee.capabilities.skills > 0) made.push('支持技能')
    if (employee.capabilities.personaComplete) made.push('固定系统提示')
    if (employee.capabilities.agentInstructions) made.push('读 AGENTS.md')
    lines.push(`  组成：${made.join('，')}`)
    if (employee.capabilities.error !== undefined) {
      lines.push(`  组合文件读不动：${employee.capabilities.error}`)
    }
  }
  if (value.unknownBindings.length > 0) {
    lines.push('')
    lines.push('以下绑定指向的资源当前不存在：')
    for (const item of value.unknownBindings) lines.push(`- ${item.kind}：${item.id}`)
  }
  return lines.join('\n')
}

/** {@link formatEmployeeOutput} 需要的最小形状。 */
interface FormattableEmployeeOutput {
  readonly message: string
  readonly employees: readonly {
    readonly id: string
    readonly name: string
    readonly description?: string | undefined
    readonly trust: string
    readonly isDefault: boolean
    readonly broken?: string | undefined
    readonly persona?: string | undefined
    readonly knowledgeBases: readonly string[]
    readonly skills: readonly string[]
    readonly mcpServers: readonly string[]
    readonly capabilities: {
      readonly tools: number
      readonly skills: number
      readonly personaComplete: boolean
      readonly agentInstructions: boolean
      readonly error?: string | undefined
    }
  }[]
  readonly unknownBindings: readonly { readonly kind: string; readonly id: string }[]
}

const EMPLOYEE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string', required: true },
    name: { type: 'string', required: true },
    description: { type: 'string' },
    order: { type: 'number' },
    trust: { type: 'string', required: true },
    isDefault: { type: 'boolean', required: true },
    broken: { type: 'string' },
    persona: { type: 'string' },
    knowledgeBases: { type: 'array', required: true, items: { type: 'string' } },
    skills: { type: 'array', required: true, items: { type: 'string' } },
    mcpServers: { type: 'array', required: true, items: { type: 'string' } },
    capabilities: {
      type: 'object',
      required: true,
      additionalProperties: false,
      properties: {
        tools: { type: 'number', required: true },
        skills: { type: 'number', required: true },
        mcpServers: { type: 'number', required: true },
        hasPersona: { type: 'boolean', required: true },
        personaLine: { type: 'string' },
        personaComplete: { type: 'boolean', required: true },
        agentInstructions: { type: 'boolean', required: true },
        entries: { type: 'number', required: true },
        error: { type: 'string' },
      },
    },
  },
} as const

/**
 * 注册 `workbench_employee` 工具及其使用指引。
 */
export function applyEmployeeTool(ctx: Context, timeoutMs: number): void {
  ctx.systemPrompt.section({
    name: 'tool:workbench_employee',
    order: 124,
    text: [
      'workbench_employee 管理 AI 员工，一个员工就是一个 DSH agent preset。',
      'create 只能以一个现成员工为模板整目录复制，这是 DSH 刻意的安全边界，不要试图绕过；',
      'trust 为 system 的员工随部署发布，改不了也删不掉，要改就先复制一份。',
      '一个员工就是人设、工具、技能、MCP 凑成的智能体模板，list 出来的「组成」读自它的 agent 组合文件，',
      '那份文件本工具改不了：要增删工具就复制一个员工再改它的组合文件。',
      'bind 写的是这个员工该用哪些知识库、技能与 MCP 服务——这份清单是职责说明，',
      'DSH 不会因为绑定了知识库就自动检索；以某个员工身份工作时，要照着它的绑定去调用对应工具。',
      'delete 不可逆，必须先向用户说明再带 confirm: true 调用。',
    ].join(''),
  })

  ctx.tools.register(defineTool({
    name: 'workbench_employee',
    description: [
      'Manage AI employees. An employee is a DSH agent preset plus a workbench-owned ',
      'binding list naming the knowledge bases, skills and MCP servers it should use. ',
      'Actions: list, get, create (copies an existing employee whole), update (display metadata and persona), ',
      'bind (edit the resource bindings), delete (needs confirm). ',
      'Presets with trust "system" ship with the deployment and cannot be modified or deleted.',
    ].join(''),
    parameters: {
      action: { type: 'string', required: true, enum: ACTIONS, description: 'Which operation to perform.' },
      id: { type: 'string', description: 'Employee id in kebab-case; it becomes the preset directory name. Required for get/create/update/bind/delete.' },
      from: { type: 'string', description: 'create only: the existing employee to copy from. Defaults to the current default employee.' },
      name: { type: 'string', description: 'create/update: display name.' },
      description: { type: 'string', description: 'update: one sentence on what this employee is for. Pass an empty string to clear it.' },
      order: { type: 'integer', description: 'update: sort position in pickers; lower comes first.' },
      persona: { type: 'string', description: 'update: the job description this employee should work under. Pass an empty string to clear it.' },
      knowledgeBases: { type: 'array', items: { type: 'string' }, description: 'bind: knowledge base ids.' },
      skills: { type: 'array', items: { type: 'string' }, description: 'bind: skill names.' },
      mcpServers: { type: 'array', items: { type: 'string' }, description: 'bind: MCP server names.' },
      mode: { type: 'string', enum: MODES, description: 'bind: how to apply the given lists. "replace" (default) overwrites each list you pass, "add" appends, "remove" deletes. Lists you omit are left alone in every mode.' },
      confirm: { type: 'boolean', description: 'Required to be true for delete, which is irreversible. Ask the user first.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          action: { type: 'string', required: true },
          message: { type: 'string', required: true },
          employees: { type: 'array', required: true, items: EMPLOYEE_SCHEMA },
          unknownBindings: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                kind: { type: 'string', required: true },
                id: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: formatEmployeeOutput(value) }],
    },
    timeoutMs,
    isConcurrencySafe: (args) => {
      const action = parseEmployeeAction(args.action)
      return action === 'list' || action === 'get'
    },
    async execute(args: EmployeeArgs): Promise<EmployeeOutput> {
      const runtime = ctx.workbench as WorkbenchRuntime
      const presets = ctx.get('agentPresets')
      if (presets === undefined) {
        throw new WorkbenchError(
          'AI 员工能力依赖 @deepseek-ai/dsh-agent-presets，当前 profile 没有装它',
          'WORKBENCH_NO_AGENT_PRESETS',
        )
      }
      const action = parseEmployeeAction(args.action)
      const defaultId = presets.defaultId

      if (action === 'list') {
        const all = await presets.list()
        const employees = (await listEmployees(presets, defaultId)).map(row)
        return {
          action,
          message: employees.length === 0
            ? '还没有任何 AI 员工'
            : `共 ${String(employees.length)} 个 AI 员工，默认是 "${defaultId}"`,
          employees,
          unknownBindings: [],
        }
      }

      const id = requireArg(args.id, 'id', action)

      if (action === 'create') {
        assertEmployeeId(id)
        const from = args.from?.trim() ?? defaultId
        // 只能整目录复制：preset 的创作 API 不接受调用方直接给组合内容，
        // 这样复制出来的东西不会比源多出任何能力。这是刻意的边界。
        await presets.copy(from, id, args.name?.trim())
        const created = await presets.resolve(id)
        const dir = presetDirOf(created)
        const bindings = await readBindings(dir)
        const persona = args.persona?.trim()
        if (persona !== undefined && persona !== '') {
          await writeBindings(dir, { ...bindings, persona })
        }
        return {
          action,
          message: `已以 "${from}" 为模板创建 AI 员工 "${id}"`,
          employees: [row(project(
            created,
            defaultId,
            await readBindings(dir),
            await readComposition(created),
          ))],
          unknownBindings: [],
        }
      }

      const preset = await presets.resolve(id)
      const dir = presetDirOf(preset)

      if (action === 'get') {
        const bindings = await readBindings(dir)
        return {
          action,
          message: `AI 员工 "${id}"`,
          employees: [row(project(preset, defaultId, bindings, await readComposition(preset)))],
          unknownBindings: findUnknown(bindings, await readInventory(ctx, runtime.paths)),
        }
      }

      if (action === 'delete') {
        requireConfirm(args.confirm, `删除 AI 员工 "${id}"`)
        const removed = row(project(
          preset,
          defaultId,
          await readBindings(dir),
          await readComposition(preset),
        ))
        // remove() 自己会拒绝随部署发布的 preset，错误信息比这里能给的更准。
        await presets.remove(id)
        return { action, message: `已删除 AI 员工 "${id}"`, employees: [removed], unknownBindings: [] }
      }

      assertWritable(preset)

      if (action === 'update') {
        const name = args.name?.trim()
        const description = args.description?.trim()
        // 传空串是「清空」，不传是「保持不变」；缺省的字段整个不出现，
        // 而不是显式写 undefined——exactOptionalPropertyTypes 下两者不同。
        const nextName = name === undefined || name === '' ? preset.name : name
        const nextDescription = description === undefined
          ? preset.description
          : description === '' ? undefined : description
        const nextOrder = args.order ?? preset.order
        await writeMetadata(dir, {
          ...nextName === undefined ? {} : { name: nextName },
          ...nextDescription === undefined ? {} : { description: nextDescription },
          ...nextOrder === undefined ? {} : { order: nextOrder },
        })
        const persona = args.persona
        if (persona !== undefined) {
          const current = await readBindings(dir)
          const trimmed = persona.trim()
          const { persona: _dropped, ...rest } = current
          await writeBindings(dir, trimmed === '' ? rest : { ...rest, persona: trimmed })
        }
        const updated = await presets.resolve(id)
        return {
          action,
          message: `已更新 AI 员工 "${id}"`,
          employees: [row(project(
            updated,
            defaultId,
            await readBindings(dir),
            await readComposition(updated),
          ))],
          unknownBindings: [],
        }
      }

      // bind
      const mode = parseBindMode(args.mode)
      const given: Partial<Record<BindingKind, string[]>> = {
        ...args.knowledgeBases === undefined ? {} : { knowledgeBases: args.knowledgeBases },
        ...args.skills === undefined ? {} : { skills: args.skills },
        ...args.mcpServers === undefined ? {} : { mcpServers: args.mcpServers },
      }
      if (Object.keys(given).length === 0) {
        throw new WorkbenchError(
          '动作 "bind" 必须至少给 knowledgeBases、skills、mcpServers 其中一项',
          'WORKBENCH_MISSING_ARG',
        )
      }
      const current = await readBindings(dir)
      // 没给的那几类原样不动，不管 mode 是什么——否则一次 replace 只传了
      // skills，会把知识库绑定一并清空。
      const nextList = (kind: BindingKind): string[] => {
        const incoming = given[kind]
        return incoming === undefined ? [...current[kind]] : applyBinding(current[kind], incoming, mode)
      }
      const next: EmployeeBindings = {
        ...current.persona === undefined ? {} : { persona: current.persona },
        knowledgeBases: nextList('knowledgeBases'),
        skills: nextList('skills'),
        mcpServers: nextList('mcpServers'),
      }
      // 只在写入方向校验：remove 的目标本来就可能是已经不存在的陈旧绑定。
      const unknownBindings = mode === 'remove' ? [] : findUnknown(next, await readInventory(ctx, runtime.paths))
      await writeBindings(dir, next)
      return {
        action,
        message: [
          `已更新 AI 员工 "${id}" 的资源绑定`,
          unknownBindings.length === 0
            ? ''
            : `；其中 ${String(unknownBindings.length)} 项指向的资源当前不存在，绑定已写入但不会有效果`,
        ].join(''),
        employees: [row(project(preset, defaultId, next, await readComposition(preset)))],
        unknownBindings,
      }
    },
    presentCall: (args: EmployeeArgs): GenericCallView => ({
      card: 'generic',
      kind: 'search',
      title: args.id === undefined ? `员工：${args.action}` : `员工：${args.action} ${args.id}`,
      rawInput: args.action,
    }),
  }))
}
