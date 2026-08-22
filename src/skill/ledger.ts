/**
 * 已安装技能的来源台账：这份技能从哪来、装的是哪一版。
 *
 * 没有它就没法回答「有没有新版本」——技能目录里只有 SKILL.md，
 * frontmatter 里那个 `version` 是作者随手写的，与 registry 上的版本号
 * 不是一回事（实测有包写 `version: "1.7.0"`，而 registry 上发布的是 `1.0.0`）。
 * 更新检查必须拿装的时候记下来的那个版本去比。
 *
 * ## 为什么记在插件自己的地盘，而不是技能目录里
 *
 * 技能目录是 DSH 的 `resourceBase`——模型按正文里的相对路径去那里读文件。
 * 往里塞一个本插件的元数据文件，是在别人的命名空间里放东西。所以台账落在
 * `$DSH_HOME/workbench/skills.json`，技能目录保持只有技能自己的东西。
 *
 * 代价是台账可能与盘上对不上：人手动删掉技能目录，台账里那条就成了孤儿。
 * 所以**以盘为准**：读的时候拿技能清单过滤一遍，盘上没有的条目不算数，
 * 也不去主动清理——下一次安装同名技能时它自然被覆盖。
 *
 * @module @staff-os/dsh-workbench/skill/ledger
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { DIR_MODE, FILE_MODE } from '../paths.ts'

/** 台账文件名，落在工作台自己的目录下。 */
export const LEDGER_FILE = 'skills.json'

/** 一条安装记录。 */
export interface SkillOrigin {
  /** 本机技能名，也就是台账的键。 */
  readonly name: string
  /** 装它的那个 registry id。 */
  readonly registry: string
  /** 市场标识。与技能名常常不同——包内 frontmatter 的 name 才决定落盘叫什么。 */
  readonly slug: string
  /** 发布者 handle；ClawHub 上消解同名 slug 要用它。 */
  readonly owner?: string
  /** 装下来的版本。 */
  readonly version: string
  /** 安装时刻，Unix 毫秒。 */
  readonly installedAt: number
}

/** 台账文件的形状。 */
interface LedgerFile {
  readonly version: 1
  readonly skills: Record<string, Omit<SkillOrigin, 'name'>>
}

/** 台账文件的绝对路径。 */
export function ledgerPath(workbenchDir: string): string {
  return join(workbenchDir, LEDGER_FILE)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 把一条记录从 JSON 还原；形状不对时丢掉这一条而不是整个台账。 */
function parseEntry(name: string, raw: unknown): SkillOrigin | undefined {
  if (!isRecord(raw)) return undefined
  const registry = raw.registry
  const slug = raw.slug
  const version = raw.version
  if (typeof registry !== 'string' || typeof slug !== 'string' || typeof version !== 'string') {
    return undefined
  }
  const owner = raw.owner
  const installedAt = raw.installedAt
  return {
    name,
    registry,
    slug,
    version,
    ...typeof owner === 'string' && owner !== '' ? { owner } : {},
    installedAt: typeof installedAt === 'number' && Number.isFinite(installedAt) ? installedAt : 0,
  }
}

/**
 * 读出全部安装记录。
 *
 * 文件不在、读不动、或者内容坏了，都当作空台账：它是加速用的辅助数据，
 * 不该因为它坏了就让整个技能页打不开。
 */
export async function readLedger(workbenchDir: string): Promise<Map<string, SkillOrigin>> {
  let raw: string
  try {
    raw = await readFile(ledgerPath(workbenchDir), 'utf8')
  } catch {
    return new Map()
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return new Map()
  }
  if (!isRecord(parsed) || !isRecord(parsed.skills)) return new Map()
  const out = new Map<string, SkillOrigin>()
  for (const [name, value] of Object.entries(parsed.skills)) {
    const entry = parseEntry(name, value)
    if (entry !== undefined) out.set(name, entry)
  }
  return out
}

/**
 * 记下一次安装。
 *
 * 整份重写而不是追加：台账很小（一条几十字节），而读-改-写一次成型比维护
 * 增量格式简单得多。
 */
export async function recordInstall(workbenchDir: string, origin: SkillOrigin): Promise<void> {
  const current = await readLedger(workbenchDir)
  current.set(origin.name, origin)
  await writeLedger(workbenchDir, current)
}

/** 删掉一条记录。技能被删时调用；台账里留着孤儿条目没有害处，但也没有意义。 */
export async function forgetInstall(workbenchDir: string, name: string): Promise<void> {
  const current = await readLedger(workbenchDir)
  if (!current.delete(name)) return
  await writeLedger(workbenchDir, current)
}

async function writeLedger(workbenchDir: string, entries: ReadonlyMap<string, SkillOrigin>): Promise<void> {
  const skills: Record<string, Omit<SkillOrigin, 'name'>> = {}
  for (const [name, entry] of [...entries].sort((left, right) => left[0].localeCompare(right[0]))) {
    const { name: _dropped, ...rest } = entry
    skills[name] = rest
  }
  const file: LedgerFile = { version: 1, skills }
  await writeFileAtomic(
    ledgerPath(workbenchDir),
    `${JSON.stringify(file, undefined, 2)}\n`,
    { mode: FILE_MODE, dirMode: DIR_MODE },
  )
}

/** 一个技能的更新状态。 */
export interface UpdateStatus {
  readonly name: string
  /** 装的时候记下的版本。 */
  readonly installed: string
  /** registry 上的最新版本；查不到时不存在。 */
  readonly latest?: string
  /** 有新版本可装。 */
  readonly outdated: boolean
  /** 来源信息，更新时原样拿去下载。 */
  readonly origin: SkillOrigin
  /** 查询失败时的说明。 */
  readonly error?: string
}

/**
 * 判断两个版本号哪个新。
 *
 * 按点分段比，每段能当数字就比数字、否则比字符串；段数不同时短的补零。
 * 认不出来的写法（日期串、带后缀的预发布号）不会崩，只是退化成字符串比较——
 * 结论错了的后果是多提示一次更新，不是装错东西。
 */
export function isNewerVersion(candidate: string, current: string): boolean {
  if (candidate === current) return false
  const left = candidate.split('.')
  const right = current.split('.')
  const length = Math.max(left.length, right.length)
  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? '0'
    const b = right[index] ?? '0'
    if (a === b) continue
    const na = Number(a)
    const nb = Number(b)
    if (Number.isFinite(na) && Number.isFinite(nb)) return na > nb
    return a.localeCompare(b) > 0
  }
  return false
}
