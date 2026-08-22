/**
 * 员工域的 Remote 半边：把本地维护的 AI 员工送到浏览器。
 *
 * 界面要显示**实际的**员工，而员工是 `$DSH_HOME` 下的 preset 目录加一份
 * `employee.yml`——那些都在 Node 半边。浏览器读它们只有一条正规路径：
 * Typert Remote。本类注册为 `ctx.workbenchEmployee`，`@Remote` 标出的方法
 * 经由 api-gateway 暴露成 `ctx.remote.workbenchEmployee.*`。
 *
 * 与 `workbench_employee` 工具的分工：工具是给模型的，带确认语义和给模型看
 * 的文本；这里是给界面的，只送结构化数据。两边读的是同一份 {@link listEmployees}
 * 投影，所以界面上的员工和模型看到的员工不会各说各话。
 *
 * 写操作也放在这里而不是只读：一个只能看不能改的界面等于没有维护界面，而
 * 「改」这件事在工具那边已经有实现——这里复用同一批 store 函数，不另起一套
 * 规则。删除的确认由界面负责，因为点删除的是人不是模型。
 *
 * @module @staff-os/dsh-workbench/employee/remote
 */

import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { AgentPreset, AgentPresets } from '@deepseek-ai/dsh-agent-presets'
import { WorkbenchError } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import {
  applyBinding,
  assertEmployeeId,
  BINDING_KINDS,
  readBindings,
  writeBindings,
  writeMetadata,
} from './store.ts'
import type { BindMode, BindingKind } from './store.ts'
import {
  findUnknown,
  listEmployees,
  presetDirOf,
  project,
  readComposition,
  readInventory,
} from './view.ts'
import type { EmployeeView, UnknownBinding } from './view.ts'
import type { CompositionSummary } from './composition.ts'

/** 一次员工列表读取的结果。 */
export interface EmployeeSnapshot {
  /** 全部员工，按 preset 的既有顺序。 */
  readonly employees: readonly EmployeeView[]
  /** 新会话默认挂载的员工 id。 */
  readonly defaultId: string
  /** 当前盘上可绑定的知识库 id。 */
  readonly knowledgeBases: readonly string[]
  /** 当前盘上可绑定的技能名。 */
  readonly skills: readonly string[]
  /** 当前 profile 里可绑定的 MCP 服务名。 */
  readonly mcpServers: readonly string[]
  /** 绑定里指向了不存在资源的条目。 */
  readonly unknownBindings: readonly UnknownBinding[]
}

/** 一个员工的组合文件：原文加解析结果。 */
export interface EmployeeComposition {
  /** 组合文件原文。 */
  readonly source: string
  /** 从原文解析出来的组成：人设、工具、技能、MCP。 */
  readonly composition: CompositionSummary
}

/** 一次写操作之后的结果：改完的那个员工，外加刷新过的清单。 */
export interface EmployeeMutation {
  /** 改完的员工；删除时不出现。 */
  readonly employee?: EmployeeView
  /** 写操作之后的完整快照，省掉界面再取一次。 */
  readonly snapshot: EmployeeSnapshot
}

/** 改展示元数据用的入参。 */
export interface EmployeeMetadataInput {
  readonly name?: string
  readonly description?: string
  readonly order?: number
}

/** 改绑定用的入参。 */
export interface EmployeeBindingInput {
  readonly persona?: string
  readonly knowledgeBases?: readonly string[]
  readonly skills?: readonly string[]
  readonly mcpServers?: readonly string[]
  /** 默认 `replace`。 */
  readonly mode?: BindMode
}

/**
 * 员工域的 Remote 服务。注册为 `ctx.workbenchEmployee`。
 */
export class WorkbenchEmployeeGateway extends TypertRemoteService {
  static inject = ['workbench']

  constructor(ctx: Context) {
    super(ctx, 'workbenchEmployee')
  }

  /**
   * 读出全部员工与当前可绑定的资源。
   * @returns 员工快照。
   */
  @Remote('list')
  async list(): Promise<EmployeeSnapshot> {
    return this.snapshot()
  }

  /**
   * 以一个现成员工为模板复制出新员工。
   *
   * 只能整目录复制，这是 DSH 刻意的安全边界：preset 的创作 API 不接受调用方
   * 直接给组合内容，复制出来的东西不会比源多出任何能力。
   * @param id - 新员工 id。
   * @param from - 模板员工 id；留空用当前默认员工。
   * @param name - 新员工的显示名。
   * @returns 新建的员工与刷新后的快照。
   */
  @Remote('create')
  async create(id: string, from?: string, name?: string): Promise<EmployeeMutation> {
    const presets = this.presets()
    const trimmed = id.trim()
    assertEmployeeId(trimmed)
    await presets.copy((from ?? presets.defaultId).trim(), trimmed, name?.trim())
    return this.mutated(trimmed)
  }

  /**
   * 改一个员工的展示元数据（`preset.yml`）。
   * @param id - 员工 id。
   * @param metadata - 要写入的字段；全空时元数据文件会被删掉。
   * @returns 改完的员工与刷新后的快照。
   */
  @Remote('update')
  async update(id: string, metadata: EmployeeMetadataInput): Promise<EmployeeMutation> {
    const preset = await this.writable(id)
    await writeMetadata(presetDirOf(preset), {
      ...metadata.name === undefined ? {} : { name: metadata.name.trim() },
      ...metadata.description === undefined ? {} : { description: metadata.description.trim() },
      ...metadata.order === undefined ? {} : { order: metadata.order },
    })
    return this.mutated(id)
  }

  /**
   * 改一个员工的资源绑定（`employee.yml`）。
   *
   * 这份清单是**职责说明**：写进一个知识库 id 不会让检索自动发生，它告诉
   * 模型以这个员工身份工作时该去用哪些资源。
   * @param id - 员工 id。
   * @param bindings - 要写入的绑定。
   * @returns 改完的员工与刷新后的快照。
   */
  @Remote('bind')
  async bind(id: string, bindings: EmployeeBindingInput): Promise<EmployeeMutation> {
    const preset = await this.writable(id)
    const dir = presetDirOf(preset)
    const current = await readBindings(dir)
    const mode = bindings.mode ?? 'replace'
    const next: Record<BindingKind, string[]> = {
      knowledgeBases: [...current.knowledgeBases],
      skills: [...current.skills],
      mcpServers: [...current.mcpServers],
    }
    for (const kind of BINDING_KINDS) {
      const incoming = bindings[kind]
      if (incoming === undefined) continue
      next[kind] = applyBinding(current[kind], incoming, mode)
    }
    const persona = bindings.persona?.trim()
    await writeBindings(dir, {
      ...persona === undefined
        ? current.persona === undefined ? {} : { persona: current.persona }
        : persona === '' ? {} : { persona },
      ...next,
    })
    return this.mutated(id)
  }

  /**
   * 删掉一个员工。
   *
   * 不可逆，且这里不再问一遍：点删除的是人，确认在界面上已经发生过了。
   * @param id - 员工 id。
   * @returns 删除后的快照。
   */
  // 方法名不能叫 `remove`：浏览器侧每个 Remote 命名空间是一个 Service，
  // 它自己的原型上就有 `remove`，重名会在 $mount 时被拒。
  @Remote('delete')
  async delete(id: string): Promise<EmployeeMutation> {
    await this.writable(id)
    await this.presets().remove(id)
    return { snapshot: await this.snapshot() }
  }

  /**
   * 读一个员工的 agent 组合文件：原文，加上从里面解析出来的组成。
   *
   * 这是这个员工「实际是什么」的唯一权威来源——preset.yml 只是名片。人设、
   * 工具、技能、MCP 都写在这里，界面要展示的就是解析出来的这份结构。
   *
   * 原文一并送回去，是因为解析是按包名前缀的启发式（见 composition.ts）：
   * 认不出来的行只能靠人去看原文。
   * @param id - 员工 id。
   * @returns 组合文件原文与解析结果。
   */
  @Remote('read')
  async read(id: string): Promise<EmployeeComposition> {
    const presets = this.presets()
    const preset = await presets.resolve(id)
    return { source: await presets.read(id), composition: await readComposition(preset) }
  }

  /** 当前的完整快照。 */
  private async snapshot(): Promise<EmployeeSnapshot> {
    const runtime = this.ctx.workbench as WorkbenchRuntime
    const presets = this.presets()
    const defaultId = presets.defaultId
    const employees = await listEmployees(presets, defaultId)
    const inventory = await readInventory(this.ctx, runtime.paths)
    const unknown: UnknownBinding[] = []
    const seen = new Set<string>()
    for (const employee of employees) {
      for (const item of findUnknown({
        knowledgeBases: employee.knowledgeBases,
        skills: employee.skills,
        mcpServers: employee.mcpServers,
      }, inventory)) {
        const key = `${item.kind} ${item.id}`
        if (seen.has(key)) continue
        seen.add(key)
        unknown.push(item)
      }
    }
    return {
      employees,
      defaultId,
      knowledgeBases: [...inventory.knowledgeBases].sort((a, b) => a.localeCompare(b)),
      skills: [...inventory.skills].sort((a, b) => a.localeCompare(b)),
      mcpServers: [...inventory.mcpServers].sort((a, b) => a.localeCompare(b)),
      unknownBindings: unknown,
    }
  }

  /** 一次写操作之后：重读那个员工，连同刷新过的快照一起送回去。 */
  private async mutated(id: string): Promise<EmployeeMutation> {
    const presets = this.presets()
    const preset = await presets.resolve(id)
    const employee = project(
      preset,
      presets.defaultId,
      await readBindings(presetDirOf(preset)),
      await readComposition(preset),
    )
    return { employee, snapshot: await this.snapshot() }
  }

  /** 取 preset 服务；没装就说清楚缺的是哪个包。 */
  private presets(): AgentPresets {
    const presets = this.ctx.get('agentPresets')
    if (presets === undefined) {
      throw new WorkbenchError(
        'AI 员工能力依赖 @deepseek-ai/dsh-agent-presets，当前 profile 没有装它',
        'WORKBENCH_NO_AGENT_PRESETS',
      )
    }
    return presets
  }

  /** 解析一个员工并拒绝改动随部署发布的那些。 */
  private async writable(id: string): Promise<AgentPreset> {
    const preset = await this.presets().resolve(id)
    if (preset.trust !== 'user') {
      throw new WorkbenchError(
        `员工 "${preset.id}" 随部署发布（trust: ${preset.trust}），不能修改；`
        + `复制一份再改`,
        'WORKBENCH_EMPLOYEE_READONLY',
      )
    }
    return preset
  }
}

export default WorkbenchEmployeeGateway
