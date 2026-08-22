/**
 * 技能包的形状解析：在一堆解出来的条目里找出「哪些是技能、各自的根在哪」。
 *
 * 早先这里的假设是「包根就有 SKILL.md」，只对市场那种单技能包成立。实际拿到
 * 的包远不止一种形状：
 *
 * - `SKILL.md` 在根（市场的单技能包）
 * - `<name>/SKILL.md`（打包时多带了一层目录）
 * - `skills/<name>/SKILL.md`（一个仓库的技能集合，GitHub tarball 剥掉
 *   `repo-<sha>/` 之后就是这个形状）
 * - 上面几种的混合，一个包里好几个技能
 *
 * 一律按「找出包内所有 SKILL.md，各自把所在目录当成一个技能根」处理。找不到
 * 就报错，并把包里实际有什么列出来——「包里没有 SKILL.md」这句话本身帮不上忙，
 * 人需要知道的是「那里面到底是什么」。
 *
 * 扁平技能（`<name>.md`）**不在这里认**：一个 Markdown 文件在包里可能只是
 * README，把它当技能装会凭空造出一个模型能调用的东西。扁平形式是给人手写在
 * 技能根里的，不是包的分发形式。
 *
 * @module @staff-os/dsh-workbench/skill/package
 */

import { packageFileText, WorkbenchError } from '../types.ts'
import type { PackageFile } from '../types.ts'
import { parseSkillFrontmatter, SKILL_FILE } from './local.ts'
import type { ParsedSkillFile } from './local.ts'

/** 包里的一个技能：它的根目录，加上归到这个根下的全部条目。 */
export interface SkillInPackage {
  /**
   * 该技能在包内的根目录，`''` 表示包根本身。
   * 只用于报错和排序，落盘时路径已经相对化过了。
   */
  readonly root: string
  /** 从 SKILL.md 的 frontmatter 解析出来的结果。 */
  readonly parsed: ParsedSkillFile
  /** 相对于该技能根的全部条目，`SKILL.md` 在其中。 */
  readonly files: readonly PackageFile[]
}

/** 一个条目在不在某个根之下。 */
function underRoot(path: string, root: string): boolean {
  return root === '' ? true : path.startsWith(`${root}/`)
}

/** 把一个条目的路径改成相对于某个根。 */
function relativeTo(file: PackageFile, root: string): PackageFile {
  return root === '' ? file : { path: file.path.slice(root.length + 1), content: file.content }
}

/**
 * 找出包里的全部技能。
 *
 * **包根有 `SKILL.md` 时，整个包就是一个技能，到此为止。** 这不是图省事，
 * 而是照着 DSH 的发现语义走：`dsh-skill-filesystem` 只看技能根下一层，
 * 递归的 `**‍/SKILL.md` 明确不支持。所以装进 `<name>/` 之后，
 * `notes/SKILL.md` 对 DSH 而言就是一个普通资源文件——技能正文引用它，
 * 而不是它自己成为一个技能。
 *
 * 真实的包印证了这一点：SkillHub 上的 `ima-skills` 根有 SKILL.md，
 * 底下 `notes/` 与 `knowledge-base/` 各还有一份。把它们拆成三个技能会凭空
 * 造出两个模型可以自行调用的东西，而作者的意图是一个技能带两份子文档。
 *
 * 只有根没有 SKILL.md 时，才往下找——那是「一个仓库装着若干技能」的形状
 * （`skills/<name>/SKILL.md`，GitHub tarball 剥掉 `repo-<sha>/` 之后常见）。
 * 此时归属按「最近的那个根赢」，免得资源文件被外层技能一起收走。
 *
 * @param files - 解包并剥掉包裹目录之后的全部条目。
 * @returns 按包内根路径排序的技能列表；一个都没有时为空数组。
 */
export function findSkillsInPackage(files: readonly PackageFile[]): SkillInPackage[] {
  const manifests: string[] = []
  for (const file of files) {
    if (file.path !== SKILL_FILE && !file.path.endsWith(`/${SKILL_FILE}`)) continue
    if (packageFileText(file) === undefined) continue
    manifests.push(file.path)
  }
  const roots = manifests.includes(SKILL_FILE)
    ? ['']
    : manifests.map(path => path.slice(0, -(SKILL_FILE.length + 1)))
  // 深的根先排，这样下面按顺序认领时「最近的根」自然先拿到条目。
  roots.sort((left, right) => right.length - left.length || left.localeCompare(right))

  const claimed = new Set<string>()
  const found: SkillInPackage[] = []
  for (const root of roots) {
    const owned: PackageFile[] = []
    for (const file of files) {
      if (claimed.has(file.path) || !underRoot(file.path, root)) continue
      claimed.add(file.path)
      owned.push(relativeTo(file, root))
    }
    const manifest = owned.find(file => file.path === SKILL_FILE)
    /* c8 ignore next -- roots 就是从 SKILL.md 推出来的，认领必然拿得到它。 */
    if (manifest === undefined) continue
    const parsed = parseSkillFrontmatter(packageFileText(manifest) ?? '')
    if (parsed.kind === 'invalid') {
      // 说清「所以呢」：这类包装下去 DSH 会整份丢弃，装了也调不到，
      // 表现是「一切正常但模型完全看不见它」。所以这里直接拦下，并指到
      // 唯一改得动的地方——包里那份 frontmatter。
      throw new WorkbenchError(
        `包内 ${root === '' ? SKILL_FILE : `${root}/${SKILL_FILE}`} 不是 DSH 认得的技能：${parsed.reason}；`
        + '这样的技能 DSH 会整份丢弃，装上去也调不到，得先把包里的 frontmatter 改合规',
        'WORKBENCH_SKILL_BAD_FILE',
      )
    }
    found.push({ root, parsed: parsed.skill, files: owned })
  }
  return found.sort((left, right) => left.root.localeCompare(right.root))
}

/** 报错时给出的包内容摘要，最多列 8 条。 */
export function describePackage(files: readonly PackageFile[]): string {
  const shown = files.slice(0, 8).map(file => file.path)
  const rest = files.length - shown.length
  if (shown.length === 0) return '空包'
  return `${shown.join('、')}${rest > 0 ? `，另有 ${String(rest)} 个条目` : ''}`
}

/**
 * 从包里挑出**唯一**要装的那个技能。
 *
 * 一个包里有多个技能时不猜：装哪个是用户的决定，猜错了的后果是盘上多出一个
 * 他没打算装的、模型可以自行调用的技能。调用方拿到这个错误后，应该把
 * {@link findSkillsInPackage} 的结果摆给用户选。
 *
 * @param files - 解包后的全部条目。
 * @param prefer - 指定要哪一个技能（按 frontmatter 的 `name`）；留空时要求包里只有一个。
 * @returns 选中的那个技能。
 */
export function selectSkillFromPackage(
  files: readonly PackageFile[],
  prefer?: string,
): SkillInPackage {
  const found = findSkillsInPackage(files)
  if (found.length === 0) {
    throw new WorkbenchError(
      `包里没有找到任何 ${SKILL_FILE}（包内有：${describePackage(files)}）`,
      'WORKBENCH_SKILL_NO_MANIFEST',
    )
  }
  if (prefer !== undefined) {
    const picked = found.find(entry => entry.parsed.name === prefer)
    if (picked === undefined) {
      const names = found.map(entry => entry.parsed.name).join('、')
      throw new WorkbenchError(
        `包里没有名为 "${prefer}" 的技能（包内有：${names}）`,
        'WORKBENCH_SKILL_NOT_FOUND',
      )
    }
    return picked
  }
  const only = found[0]
  if (found.length > 1 || only === undefined) {
    const names = found.map(entry => `${entry.parsed.name}（${entry.root || '包根'}）`).join('、')
    throw new WorkbenchError(
      `包里有 ${String(found.length)} 个技能，请用 name 指定装哪一个：${names}`,
      'WORKBENCH_SKILL_AMBIGUOUS',
    )
  }
  return only
}
