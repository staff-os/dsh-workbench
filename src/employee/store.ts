/**
 * AI 员工 = 一个 agent preset + 一份工作台自己的绑定清单。
 *
 * preset 那半边由 DSH 原生的 `ctx.agentPresets` 管：它已经把「一个可挂载的
 * agent 组合」这件事做完了，包括发现、信任级别、复制与删除。工作台只补上
 * 原生没有的一层——这个员工该用哪些知识库、技能与 MCP 服务，写在 preset
 * 目录里的 `employee.yml`。
 *
 * **这个文件是附加的，不是 DSH 读的。** 往里写一个知识库 id 不会让检索自动
 * 发生；它是给模型看的职责说明，也是员工↔资源绑定关系的落点。
 * 分成两个文件而不是塞进 `preset.yml`，是因为后者的字段集由 DSH 定义，
 * 塞私货进去下个版本就可能撞名。
 *
 * @module @staff-os/dsh-workbench/employee/store
 */

import { readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { parseDocument } from 'yaml'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { METADATA_FILE, renderPresetMetadata } from '@deepseek-ai/dsh-agent-presets'
import type { PresetMetadata } from '@deepseek-ai/dsh-agent-presets'
import { DIR_MODE, FILE_MODE } from '../paths.ts'
import { WorkbenchError } from '../types.ts'

/** 工作台在 preset 目录里附加的绑定文件。 */
export const EMPLOYEE_FILE = 'employee.yml'

/** 可绑定的资源类别。 */
export const BINDING_KINDS = ['knowledgeBases', 'skills', 'mcpServers'] as const

/** 一类可绑定资源。 */
export type BindingKind = typeof BINDING_KINDS[number]

/** 一个员工的绑定清单。 */
export interface EmployeeBindings {
  /** 岗位说明；给模型看的「你是谁、负责什么」。 */
  readonly persona?: string
  readonly knowledgeBases: readonly string[]
  readonly skills: readonly string[]
  readonly mcpServers: readonly string[]
  readonly updatedAt?: string
}

/** 绑定的改法。 */
export type BindMode = 'replace' | 'add' | 'remove'

/** 空绑定。 */
export function emptyBindings(): EmployeeBindings {
  return { knowledgeBases: [], skills: [], mcpServers: [] }
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (trimmed !== '') seen.add(trimmed)
  }
  return [...seen].sort((left, right) => left.localeCompare(right))
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * 读一个 preset 目录里的绑定清单。
 *
 * 读不出来一律当空清单：这个文件是附加的，它坏了不该让员工本身读不出来。
 */
export async function readBindings(presetDir: string): Promise<EmployeeBindings> {
  let raw: string
  try {
    raw = await readFile(join(presetDir, EMPLOYEE_FILE), 'utf8')
  } catch {
    return emptyBindings()
  }
  let data: Record<string, unknown>
  try {
    const parsed = parseDocument(raw).toJS() as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return emptyBindings()
    data = parsed as Record<string, unknown>
  } catch {
    return emptyBindings()
  }
  const persona = text(data.persona)
  const updatedAt = text(data.updatedAt)
  return {
    ...persona === undefined ? {} : { persona },
    knowledgeBases: stringList(data.knowledgeBases),
    skills: stringList(data.skills),
    mcpServers: stringList(data.mcpServers),
    ...updatedAt === undefined ? {} : { updatedAt },
  }
}

/** 写回绑定清单；全空时把文件删掉，不留一个只有时间戳的空壳。 */
export async function writeBindings(presetDir: string, bindings: EmployeeBindings): Promise<void> {
  const path = join(presetDir, EMPLOYEE_FILE)
  const hasContent = bindings.persona !== undefined
    || bindings.knowledgeBases.length > 0
    || bindings.skills.length > 0
    || bindings.mcpServers.length > 0
  if (!hasContent) {
    await rm(path, { force: true })
    return
  }
  const lines: string[] = [
    '# 由 @staff-os/dsh-workbench 维护：这个 AI 员工该用哪些工作台资源。',
    '# DSH 本身不读这个文件，它是给模型看的职责说明。',
  ]
  if (bindings.persona !== undefined) lines.push(`persona: ${JSON.stringify(bindings.persona)}`)
  for (const kind of BINDING_KINDS) {
    const items = bindings[kind]
    if (items.length === 0) continue
    lines.push(`${kind}:`)
    for (const item of items) lines.push(`  - ${JSON.stringify(item)}`)
  }
  lines.push(`updatedAt: ${JSON.stringify(new Date().toISOString())}`)
  await writeFileAtomic(path, `${lines.join('\n')}\n`, { mode: FILE_MODE, dirMode: DIR_MODE })
}

/** 按给定模式改一类绑定。 */
export function applyBinding(
  current: readonly string[],
  incoming: readonly string[],
  mode: BindMode,
): string[] {
  const cleaned = stringList([...incoming])
  if (mode === 'replace') return cleaned
  const set = new Set(current)
  for (const item of cleaned) {
    if (mode === 'add') set.add(item)
    else set.delete(item)
  }
  return [...set].sort((left, right) => left.localeCompare(right))
}

/**
 * 改 preset 的展示元数据（`preset.yml`）。
 *
 * 渲染交给 DSH 自己的 `renderPresetMetadata`，字段集由它定义；三个字段
 * 都空时它给 `undefined`，此时把文件删掉而不是写一份空 YAML。
 */
export async function writeMetadata(presetDir: string, metadata: PresetMetadata): Promise<void> {
  const path = join(presetDir, METADATA_FILE)
  const rendered = renderPresetMetadata(metadata)
  if (rendered === undefined) {
    await rm(path, { force: true })
    return
  }
  await writeFileAtomic(path, rendered, { mode: FILE_MODE, dirMode: DIR_MODE })
}

/** 校验员工 id；与 preset 目录名同一套约束。 */
export function assertEmployeeId(id: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
    throw new WorkbenchError(
      `员工 id "${id}" 不合法：必须是小写字母数字的短横线分隔形式`,
      'WORKBENCH_EMPLOYEE_BAD_ID',
    )
  }
}
