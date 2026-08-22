/**
 * 用户级技能目录的读写：`$DSH_HOME/skills/` 下那一层。
 *
 * 读路径本身由 DSH 原生的 `ctx.skills` 负责（它含 rank 与遮蔽规则，不重造），
 * 这里只管**写**，以及读单个文件时那些 `ctx.skills` 不暴露的细节。
 *
 * ## 这里的解析必须和 DSH 的一模一样
 *
 * 本模块的 frontmatter 解析是 `@deepseek-ai/dsh-skill-filesystem` 的**镜像**，
 * 不是一份宽松的近似。理由是这一域的界面在回答「模型现在能用什么」——两边
 * 判定不一致时，界面会显示一个 DSH 根本不认的技能，或者漏掉一个它认的。
 * 这类偏差没有任何错误提示，只表现为「我明明装了却调不到」。
 *
 * 与直觉不符、但确实是 DSH 那边规则的几条：
 *
 * - `name` **必填**，且必须是 kebab-case。缺了或不合法，DSH 整个忽略这份技能，
 *   不是退回用目录名。
 * - **技能的身份是 frontmatter 里的 `name`，不是目录名。** `bar/SKILL.md` 里写
 *   `name: foo`，注册出来的就叫 `foo`，目录名只是个壳。
 * - `whenToUse` 是驼峰，而两个开关是短横线（`disable-model-invocation`、
 *   `user-invocable`）。同一份 frontmatter 里两种风格并存，看着像笔误，但它就是
 *   这么解析的。
 * - 驼峰写法的开关（`userInvocable` / `modelInvocable` / `disableModelInvocation`）
 *   会让 DSH **抛错并整个丢弃这份技能**。这是最容易踩的一条：Claude Code 生态
 *   的技能包里这么写的不少，装上去之后界面一切正常、模型却完全看不见它。
 * - 开关的值不止 `true` / `false`：`yes` / `on` / `1` 这些也算真。
 *
 * ## DSH 不认识的字段一律无效
 *
 * frontmatter 里除上述几个键与 `metadata` 之外的东西，DSH 读都不读。
 * `allowed-tools`、`license`、`version`、`model` 这些在别的 harness 里有意义的
 * 字段，在 DSH 上既不报错也不起作用——尤其 `allowed-tools`，它看起来像个
 * 权限边界，实际什么都不限制。
 *
 * @module @staff-os/dsh-workbench/skill/local
 */

import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { isMap, parseDocument } from 'yaml'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { DIR_MODE, FILE_MODE } from '../paths.ts'
import { packageFileText, WorkbenchError } from '../types.ts'
import type { PackageFile } from '../types.ts'
import { assertSafeEntryPath } from '../archive/guard.ts'

/** 与 `@deepseek-ai/dsh-skill` 的 `isSkillName` 一致。 */
export const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

/** 目录形技能的正文文件名。 */
export const SKILL_FILE = 'SKILL.md'

/** DSH 在用户级技能根下跳过的保留目录。 */
export const RESERVED_SKILL_DIR = '.system'

/**
 * 驼峰写法的开关键，以及它对应的正确写法。
 *
 * DSH 遇到这些键会抛错，整份技能被丢弃。写在这里是为了能**指出**问题，
 * 而不是跟着一起忽略——「这份技能不生效」加上「因为第 3 行那个键」，
 * 才是能修的信息。
 */
export const LEGACY_INVOCATION_KEYS: Readonly<Record<string, string>> = {
  disableModelInvocation: 'disable-model-invocation',
  modelInvocable: 'disable-model-invocation',
  userInvocable: 'user-invocable',
}

/** 一个盘上的技能。 */
export interface LocalSkill {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  /** 模型能否自行调用。 */
  readonly modelInvocable: boolean
  /** 用户能否用 `/name` 手动触发。 */
  readonly userInvocable: boolean
  /** 技能文件的绝对路径：目录形是 `<dir>/SKILL.md`，扁平形是 `<name>.md` 自己。 */
  readonly path: string
  /** 扁平形（`<name>.md`）而不是目录形（`<name>/SKILL.md`）。 */
  readonly flat: boolean
  /** frontmatter 之后的正文。 */
  readonly content: string
  /** 技能目录里除 SKILL.md 之外的附带文件（相对路径）；扁平形恒为空。 */
  readonly files: readonly string[]
}

/**
 * 盘上一个 DSH 会拒绝的技能条目。
 *
 * 单独列出来而不是当作不存在：这些条目在盘上、在界面上应该看得见，
 * 否则「装了但没生效」就没有任何线索。
 */
export interface RejectedSkill {
  /** 技能文件的绝对路径。 */
  readonly path: string
  /** 从路径推出来的名字，仅用于显示。 */
  readonly hint: string
  /** DSH 会以什么理由丢弃它。 */
  readonly reason: string
}

/** 新建技能时可给的字段。 */
export interface LocalSkillInput {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly content?: string
  readonly modelInvocable?: boolean
  readonly userInvocable?: boolean
}

/** frontmatter 解析出来的技能，不含落盘位置。 */
export interface ParsedSkillFile {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
  readonly content: string
}

/** 解析结果：DSH 会收下，或者会以某个理由丢弃。 */
export type SkillParseResult =
  | { readonly kind: 'ok'; readonly skill: ParsedSkillFile }
  | { readonly kind: 'invalid'; readonly reason: string }

/** 校验技能名。 */
export function assertSkillName(name: string): void {
  if (!SKILL_NAME_PATTERN.test(name)) {
    throw new WorkbenchError(
      `技能名 "${name}" 不合法：必须是小写字母数字的短横线分隔形式，例如 my-skill`,
      'WORKBENCH_SKILL_BAD_NAME',
    )
  }
}

/** 拆开 frontmatter 与正文。 */
export function splitFrontmatter(raw: string): { frontmatter: string; body: string } | undefined {
  const firstBreak = raw.indexOf('\n')
  if (firstBreak < 0) return undefined
  if (raw.slice(0, firstBreak).replace(/\r$/u, '') !== '---') return undefined

  let lineStart = firstBreak + 1
  while (lineStart <= raw.length) {
    const nextBreak = raw.indexOf('\n', lineStart)
    const lineEnd = nextBreak < 0 ? raw.length : nextBreak
    if (raw.slice(lineStart, lineEnd).replace(/\r$/u, '') === '---') {
      return {
        frontmatter: raw.slice(firstBreak + 1, lineStart),
        body: raw.slice(nextBreak < 0 ? raw.length : nextBreak + 1),
      }
    }
    if (nextBreak < 0) return undefined
    lineStart = nextBreak + 1
  }
  return undefined
}

/** 拼回一个完整的 SKILL.md。 */
function joinFrontmatter(frontmatter: string, body: string): string {
  const block = frontmatter.endsWith('\n') ? frontmatter : `${frontmatter}\n`
  return `---\n${block}---\n${body}`
}

function stringField(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/**
 * 按 DSH 的规则读一个布尔量。
 *
 * 不只认 `true` / `false`：YAML 里写 `yes`、`on`、`1` 的人不少，DSH 全都收下。
 * 只认 JS 布尔的话，`disable-model-invocation: "true"` 会被这里当成「没设」，
 * 界面显示「模型可调用」，而 DSH 那边是关着的。
 *
 * @returns 布尔值；键不存在时 `undefined`；值不是布尔量时抛错（与 DSH 一致）。
 */
export function frontmatterBoolean(data: Record<string, unknown>, key: string): boolean | undefined {
  if (!Object.hasOwn(data, key)) return undefined
  const value = data[key]
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1') return true
  if (value === 0 || value === '0') return false
  if (typeof value === 'string') {
    switch (value.toLowerCase()) {
      case 'true':
      case 'yes':
      case 'on':
        return true
      case 'false':
      case 'no':
      case 'off':
        return false
    }
  }
  throw new WorkbenchError(
    `frontmatter 字段 "${key}" 必须是布尔量`,
    'WORKBENCH_SKILL_BAD_FILE',
  )
}

/**
 * 按 DSH 的规则解析一份 SKILL.md 的文本。
 *
 * 判定与 `dsh-skill-filesystem` 的 `parseSkillFile` 逐条对齐，见模块头。
 * 拒绝时给出**理由**，而不是简单地返回 `undefined`——理由是这份技能为什么
 * 不生效的唯一线索。
 *
 * @param raw - SKILL.md（或扁平 `<name>.md`）的完整文本。
 * @returns 解析成功的技能，或 DSH 丢弃它的理由。
 */
export function parseSkillFrontmatter(raw: string): SkillParseResult {
  const split = splitFrontmatter(raw)
  if (split === undefined) return { kind: 'invalid', reason: '缺少 YAML frontmatter' }

  let data: Record<string, unknown>
  try {
    const doc = parseDocument(split.frontmatter)
    if (doc.errors.length > 0) {
      return { kind: 'invalid', reason: `frontmatter YAML 解析失败：${doc.errors[0]?.message ?? '未知错误'}` }
    }
    const parsed = doc.toJS() as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { kind: 'invalid', reason: 'frontmatter 不是一个键值映射' }
    }
    data = parsed as Record<string, unknown>
  } catch (error: unknown) {
    return { kind: 'invalid', reason: `frontmatter YAML 解析失败：${String(error)}` }
  }

  const name = stringField(data, 'name')
  const description = stringField(data, 'description')
  if (name === undefined || description === undefined) {
    return { kind: 'invalid', reason: 'frontmatter 至少要有 name 与 description' }
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    return { kind: 'invalid', reason: `技能名 "${name}" 不是 kebab-case（小写字母数字加单个短横线）` }
  }

  // 驼峰开关在 DSH 那边是抛错路径，整份技能会被丢掉。这里同样拒绝，
  // 但把该改成什么一并说出来。
  for (const [legacy, canonical] of Object.entries(LEGACY_INVOCATION_KEYS)) {
    if (Object.hasOwn(data, legacy)) {
      return {
        kind: 'invalid',
        reason: `frontmatter 字段 "${legacy}" 不受支持，DSH 会因此丢弃整份技能；改成 "${canonical}"`,
      }
    }
  }

  let disableModelInvocation: boolean | undefined
  let userInvocable: boolean | undefined
  try {
    disableModelInvocation = frontmatterBoolean(data, 'disable-model-invocation')
    userInvocable = frontmatterBoolean(data, 'user-invocable')
  } catch (error: unknown) {
    return { kind: 'invalid', reason: error instanceof Error ? error.message : String(error) }
  }

  const whenToUse = stringField(data, 'whenToUse')
  return {
    kind: 'ok',
    skill: {
      name,
      description,
      ...whenToUse === undefined ? {} : { whenToUse },
      modelInvocable: disableModelInvocation !== true,
      userInvocable: userInvocable !== false,
      content: split.body.trim(),
    },
  }
}

/** 一个技能的目录。 */
export function skillDir(root: string, name: string): string {
  return join(root, name)
}

/** 技能目录里的一个文件。 */
export interface SkillFileEntry {
  /** 相对技能目录的路径，正斜杠分隔。 */
  readonly path: string
  /** 字节数。 */
  readonly size: number
}

/**
 * 列出一个技能目录里的全部文件，**含 SKILL.md**，带体积。
 *
 * 与 {@link listExtraFiles} 的区别不只是多一个 SKILL.md：那一份是给清单和工具
 * 用的「附带文件」，只要名字；这一份是给详情页的文件树用的，要的是「这个目录
 * 里到底有什么」，所以 SKILL.md 也是其中一个文件，并且每个都 stat 一次拿体积。
 * 分成两份而不是合并，是因为清单会把每个技能都扫一遍——为一个只有详情页用得上
 * 的体积，给整份清单加上一轮 stat 不值当。
 *
 * @param dir - 技能目录。
 * @returns 目录内文件，按路径排序；读不到时是空数组。
 */
export async function listSkillFiles(dir: string, prefix = ''): Promise<SkillFileEntry[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const files: SkillFileEntry[] = []
  for (const entry of entries) {
    const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) {
      files.push(...await listSkillFiles(join(dir, entry.name), relative))
      continue
    }
    // stat 失败（权限、竞态删除）不该让整棵树消失，按 0 记下来照样列出它。
    let size = 0
    try {
      size = (await stat(join(dir, entry.name))).size
    } catch { /* 保持 0 */ }
    files.push({ path: relative, size })
  }
  return files.sort((left, right) => left.path.localeCompare(right.path))
}

/** 列出技能目录里除 SKILL.md 之外的文件。 */
async function listExtraFiles(dir: string, prefix = ''): Promise<string[]> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
  const files: string[] = []
  for (const entry of entries) {
    const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) {
      files.push(...await listExtraFiles(join(dir, entry.name), relative))
    } else if (relative !== SKILL_FILE) {
      files.push(relative)
    }
  }
  return files.sort((left, right) => left.localeCompare(right))
}

/** 读一个技能文件并按 DSH 的规则解析；连文件都读不到时给 `undefined`。 */
async function loadSkillFile(path: string): Promise<SkillParseResult | undefined> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch {
    return undefined
  }
  return parseSkillFrontmatter(raw)
}

/**
 * 从一个具体目录读目录形技能。
 *
 * 内部用：调用方给的是已经确定安全的路径（readdir 的结果、或本模块自己建的
 * 暂存目录）。对外的 {@link readLocalSkill} 才做名字校验。
 */
async function readSkillDir(dir: string): Promise<LocalSkill | RejectedSkill | undefined> {
  const path = join(dir, SKILL_FILE)
  const result = await loadSkillFile(path)
  if (result === undefined) return undefined
  if (result.kind === 'invalid') {
    return { path, hint: dir.split(/[\\/]/u).pop() ?? dir, reason: result.reason }
  }
  return {
    ...result.skill,
    path,
    flat: false,
    files: await listExtraFiles(dir),
  }
}

/** 从一个扁平 `<name>.md` 读技能。 */
async function readSkillFlat(path: string): Promise<LocalSkill | RejectedSkill | undefined> {
  const result = await loadSkillFile(path)
  if (result === undefined) return undefined
  const hint = (path.split(/[\\/]/u).pop() ?? path).replace(/\.md$/iu, '')
  if (result.kind === 'invalid') return { path, hint, reason: result.reason }
  return { ...result.skill, path, flat: true, files: [] }
}

/** 一个条目是不是被 DSH 拒收的那种。 */
function isRejected(entry: LocalSkill | RejectedSkill): entry is RejectedSkill {
  return 'reason' in entry
}

/** 读一个盘上的技能；不存在或 DSH 不认时给 `undefined`。 */
export async function readLocalSkill(root: string, name: string): Promise<LocalSkill | undefined> {
  assertSkillName(name)
  const dir = await readSkillDir(skillDir(root, name))
  if (dir !== undefined && !isRejected(dir)) return dir
  // 目录形不在或不合法时再看扁平形：DSH 的扫描顺序是按目录项名字排的，
  // `<name>.md` 与 `<name>/` 同时存在属于用户自己制造的歧义，这里不替他选。
  const flat = await readSkillFlat(join(root, `${name}.md`))
  return flat !== undefined && !isRejected(flat) ? flat : undefined
}

/** 一次技能根扫描的结果。 */
export interface LocalSkillScan {
  /** DSH 会收下的技能。 */
  readonly skills: readonly LocalSkill[]
  /** 盘上有、但 DSH 会丢弃的条目。 */
  readonly rejected: readonly RejectedSkill[]
}

/**
 * 扫一遍用户级技能根。
 *
 * 目录形（`<name>/SKILL.md`）与扁平形（`<name>.md`）都算，因为 DSH 两种都收。
 * 只认目录形会让手写的扁平技能在界面上凭空消失——它照常生效，却既看不见也
 * 删不掉。
 *
 * `.system` 是 DSH 的保留目录，跳过；其余点开头的条目 DSH 其实照收，但那不是
 * 本插件写出来的东西，交给下面 {@link scanLocalSkills} 一并列进 `rejected`
 * 会更吵，所以同样跳过、不显示。
 */
export async function scanLocalSkills(root: string): Promise<LocalSkillScan> {
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return { skills: [], rejected: [] }
  }
  const skills: LocalSkill[] = []
  const rejected: RejectedSkill[] = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const found = entry.isDirectory()
      ? await readSkillDir(join(root, entry.name))
      : entry.isFile() && entry.name.toLowerCase().endsWith('.md')
        ? await readSkillFlat(join(root, entry.name))
        : undefined
    if (found === undefined) continue
    if (isRejected(found)) rejected.push(found)
    else skills.push(found)
  }
  return {
    skills: skills.sort((left, right) => left.name.localeCompare(right.name)),
    rejected: rejected.sort((left, right) => left.hint.localeCompare(right.hint)),
  }
}

/** 列出用户级技能根下 DSH 会收下的技能。 */
export async function listLocalSkills(root: string): Promise<LocalSkill[]> {
  return [...(await scanLocalSkills(root)).skills]
}

/** 渲染一份新的 SKILL.md。 */
function renderSkillFile(input: LocalSkillInput): string {
  const lines: string[] = [
    `name: ${JSON.stringify(input.name)}`,
    `description: ${JSON.stringify(input.description)}`,
  ]
  if (input.whenToUse !== undefined && input.whenToUse !== '') {
    lines.push(`whenToUse: ${JSON.stringify(input.whenToUse)}`)
  }
  // 只在偏离默认时写键：缺省即「模型可调用、用户可调用」。
  if (input.modelInvocable === false) lines.push('disable-model-invocation: true')
  if (input.userInvocable === false) lines.push('user-invocable: false')
  const body = (input.content ?? '').trim()
  return joinFrontmatter(lines.join('\n'), body === '' ? '' : `\n${body}\n`)
}

/** 新建一个技能；同名已存在时报错。 */
export async function createLocalSkill(root: string, input: LocalSkillInput): Promise<LocalSkill> {
  assertSkillName(input.name)
  if (input.description.trim() === '') {
    throw new WorkbenchError(
      '技能必须有 description，它是模型判断何时使用该技能的唯一依据',
      'WORKBENCH_SKILL_NO_DESCRIPTION',
    )
  }
  if (await readLocalSkill(root, input.name) !== undefined) {
    throw new WorkbenchError(`技能 "${input.name}" 已存在`, 'WORKBENCH_SKILL_DUPLICATE')
  }
  const path = join(skillDir(root, input.name), SKILL_FILE)
  await writeFileAtomic(path, renderSkillFile(input), { mode: FILE_MODE, dirMode: DIR_MODE })
  const created = await readLocalSkill(root, input.name)
  if (created === undefined) throw new WorkbenchError('新建后未能读回该技能', 'WORKBENCH_SKILL_WRITE_FAILED')
  return created
}

/**
 * 只改可见性，其余 frontmatter 字段与正文原样。
 *
 * 走 YAML AST 而不是重新渲染整个 frontmatter：技能文件常带 `license`、`version`
 * 之类本模块不认识的字段，还可能有注释。重渲染会把它们全抹掉，而这只是为了改
 * 一个布尔量。（那些字段 DSH 读都不读，但它们是文件作者写的，不该被这一下顺手
 * 删掉。）
 *
 * 两个开关都用「回到默认就删键」的写法，文件保持最短。
 */
export async function setSkillVisibility(
  root: string,
  name: string,
  visibility: { readonly modelInvocable?: boolean; readonly userInvocable?: boolean },
): Promise<LocalSkill> {
  assertSkillName(name)
  const existing = await readLocalSkill(root, name)
  if (existing === undefined) {
    throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
  }
  const path = existing.path
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch {
    throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
  }
  const split = splitFrontmatter(raw)
  if (split === undefined) {
    throw new WorkbenchError(`技能 "${name}" 缺少 YAML frontmatter`, 'WORKBENCH_SKILL_BAD_FILE')
  }
  const doc = parseDocument(split.frontmatter)
  if (doc.errors.length > 0 || !isMap(doc.contents)) {
    throw new WorkbenchError(`技能 "${name}" 的 frontmatter 解析失败`, 'WORKBENCH_SKILL_BAD_FILE')
  }
  // 走 Document 上的 set/delete 而不是 doc.contents 上的：解析出来的 map
  // 键类型是 ParsedNode，直接喂字符串过不了类型检查，Document 这一层才收裸键。
  if (visibility.modelInvocable !== undefined) {
    if (visibility.modelInvocable) doc.delete('disable-model-invocation')
    else doc.set('disable-model-invocation', true)
  }
  if (visibility.userInvocable !== undefined) {
    if (visibility.userInvocable) doc.delete('user-invocable')
    else doc.set('user-invocable', false)
  }
  await writeFileAtomic(path, joinFrontmatter(doc.toString(), split.body), { mode: FILE_MODE, dirMode: DIR_MODE })
  const updated = await readLocalSkill(root, name)
  if (updated === undefined) throw new WorkbenchError('改可见性后未能读回该技能', 'WORKBENCH_SKILL_WRITE_FAILED')
  return updated
}

/** 删掉一个技能：目录形连目录删，扁平形删那个文件。 */
export async function removeLocalSkill(root: string, name: string): Promise<LocalSkill> {
  const existing = await readLocalSkill(root, name)
  if (existing === undefined) throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
  if (existing.flat) await rm(existing.path, { force: true })
  else await rm(skillDir(root, name), { recursive: true, force: true })
  return existing
}

/** 安装一个技能包的结果。 */
export interface InstallResult {
  readonly skill: LocalSkill
  /** 实际落盘的目录名。与请求的名字不同说明包内 frontmatter 另有主张。 */
  readonly installedAs: string
  /** 是否覆盖了一个已有技能。 */
  readonly replaced: boolean
  /** 落盘的文件数。 */
  readonly fileCount: number
  /** 其中的二进制文件数（图、PDF、模板这些）。 */
  readonly binaryCount: number
}

/** 装包时要给的目录。 */
export interface InstallLocation {
  /** 用户级技能根。 */
  readonly root: string
  /**
   * 暂存目录的父目录，**必须在技能根之外、且与它同盘**。
   * 前者是为了不让半成品被 DSH 扫到，后者是为了最后那步 rename 仍然原子。
   */
  readonly stagingParent: string
}

/** 把一个条目写进暂存目录。 */
async function writeStaged(staging: string, file: PackageFile): Promise<void> {
  // 这里刻意不用 writeFileAtomic：原子边界是最后整目录那一次 rename，
  // 每个文件再各自建临时兄弟文件是白费一轮 I/O，而且它只收字符串，
  // 二进制资源就得绕开它——两条落盘路径分叉才是真正的风险。
  const target = join(staging, file.path)
  await mkdir(dirname(target), { recursive: true, mode: DIR_MODE })
  await writeFile(target, file.content, { mode: FILE_MODE })
}

/**
 * 把一个技能包的文件落到技能根目录。
 *
 * 先写技能根**之外**的暂存目录、校验通过再整目录换上去。技能包来自市场或用户
 * 给的压缩包，中途失败若直接落在目标目录上，留下的是一个「半个技能」——
 * 它能被 DSH 扫到、却缺文件。
 *
 * 暂存目录必须在技能根之外：DSH 扫描技能根时只跳过 `.system`，别的点开头目录
 * 照收，chokidar 也不忽略它们。建在根下的话，半成品会被当成一个真技能注册进去，
 * 而且它排在正式目录前面（`.` 小于字母），同 rank 时先入者胜——一次失败的安装
 * 留下的残骸会持续遮蔽同名技能，本插件的清单里还看不见它。
 *
 * 目录名以包内 frontmatter 的 `name` 为准：那才是 DSH 注册出来的身份，
 * 用请求的名字建目录只会让盘上的名字和实际生效的名字对不上。
 */
export async function installSkillFiles(
  location: InstallLocation,
  files: readonly PackageFile[],
  options: { readonly overwrite: boolean },
): Promise<InstallResult> {
  const { root, stagingParent } = location
  const manifest = files.find(file => file.path === SKILL_FILE)
  if (manifest === undefined) {
    throw new WorkbenchError(
      `技能包里没有 ${SKILL_FILE}`,
      'WORKBENCH_SKILL_NO_MANIFEST',
    )
  }
  const parsed = parseSkillFrontmatter(packageFileText(manifest) ?? '')
  if (parsed.kind === 'invalid') {
    throw new WorkbenchError(
      `技能包的 ${SKILL_FILE} 不是 DSH 认得的技能：${parsed.reason}`,
      'WORKBENCH_SKILL_BAD_FILE',
    )
  }
  const installedAs = parsed.skill.name

  const existing = await readLocalSkill(root, installedAs)
  if (existing !== undefined && !options.overwrite) {
    throw new WorkbenchError(
      `技能 "${installedAs}" 已存在；要覆盖请传 overwrite: true`,
      'WORKBENCH_SKILL_DUPLICATE',
    )
  }

  const staging = join(stagingParent, `${installedAs}.staging-${String(Date.now())}`)
  try {
    await rm(staging, { recursive: true, force: true })
    await mkdir(staging, { recursive: true, mode: DIR_MODE })
    let binaryCount = 0
    for (const file of files) {
      // 解包时已经查过一次，这里再查一次：这是落盘前的最后一道关口，
      // 而调用方未必都经过同一条解包路径。
      assertSafeEntryPath(file.path)
      if (packageFileText(file) === undefined) binaryCount += 1
      await writeStaged(staging, file)
    }

    const target = skillDir(root, installedAs)
    await mkdir(root, { recursive: true, mode: DIR_MODE })
    await rm(target, { recursive: true, force: true })
    // 扁平形的同名技能也要让位，否则两份并存、由 DSH 的目录项排序决定谁赢。
    await rm(join(root, `${installedAs}.md`), { force: true })
    await rename(staging, target)

    const installed = await readLocalSkill(root, installedAs)
    if (installed === undefined) {
      throw new WorkbenchError('安装后未能读回该技能', 'WORKBENCH_SKILL_WRITE_FAILED')
    }
    return {
      skill: installed,
      installedAs,
      replaced: existing !== undefined,
      fileCount: files.length,
      binaryCount,
    }
  } finally {
    // rename 成功后暂存目录已经不在了，force 让这里成为无操作；
    // 失败路径上它才真正清场。
    await rm(staging, { recursive: true, force: true })
  }
}
