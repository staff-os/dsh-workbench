/**
 * 技能域的 Remote 半边：把本机技能与技能市场送到浏览器。
 *
 * 与 `workbench_skill` 工具的分工同员工域：工具是给模型的，带确认语义与
 * 给模型看的文本；这里是给界面的，只送结构化数据。两边共用
 * {@link module:@staff-os/dsh-workbench/skill/view} 那一份投影，界面上的技能
 * 与模型看到的技能不会各说各话。
 *
 * 四件事界面必须照实显示，所以在这里一并送出去：
 *
 * - **`shadowed`**：盘上有这份技能，但同名的更高优先级来源盖住了它。此时改
 *   它不会有任何效果。
 * - **`managed`**：只有用户级目录（`$DSH_HOME/skills/`）里的技能本插件才改得
 *   动。项目级与随插件发布的技能在界面上只读，与工具那边同一条规则。
 * - **`rejected`**：盘上有这份文件，但 DSH 会因为 frontmatter 不合规而整份丢弃。
 *   不列出来的话，「我装了却怎么都调不到」没有任何线索——DSH 那边只有一行
 *   日志警告。
 * - **`activation`**：写完之后回读一次得到的真实结论，而不是一句预测。
 *
 * 关于「什么时候生效」：不是重启，是下一个模型回合。理由与做法见
 * {@link module:@staff-os/dsh-workbench/skill/activation}。
 *
 * @module @staff-os/dsh-workbench/skill/remote
 */

import { readFile, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-skill'
import { packageFileBytes, WorkbenchError } from '../types.ts'
import type { PackageFile } from '../types.ts'
import type { WorkbenchRuntime } from '../runtime.ts'
import { detailNote } from './activation.ts'
import type { ActivationState } from './activation.ts'
import {
  createLocalSkill,
  installSkillFiles,
  listSkillFiles,
  readLocalSkill,
  removeLocalSkill,
  scanLocalSkills,
  setSkillVisibility,
  SKILL_FILE,
} from './local.ts'
import type { LocalSkill, SkillFileEntry } from './local.ts'
import { fileContentOf, MAX_PREVIEW_BYTES, readFileContent, resolveInsideSkill } from './file.ts'
import { isScannableTextFile, MAX_SCAN_BYTES, scanFiles } from './scan.ts'
import type { ScanInput, ScanReport } from './scan.ts'
import type { FileContent } from './file.ts'
import { findSkillsInPackage, selectSkillFromPackage } from './package.ts'
import { decodeUploadedPackage, readPackageBytes } from './source.ts'
import { forgetInstall, isNewerVersion, readLedger, recordInstall } from './ledger.ts'
import type { SkillOrigin, UpdateStatus } from './ledger.ts'
import { collectSkills, projectLocal, projectMarket, projectRejected, projectWinner, winnerIsLocal } from './view.ts'
import type { MarketView, RejectedView, SkillView } from './view.ts'

/** 一个已配置的市场源。 */
export interface RegistryInfo {
  readonly id: string
  readonly name: string
  readonly url: string
  /** 协议方言，界面上用来说明这个源支持哪些浏览方式。 */
  readonly flavor: string
}

/** 一次技能列表读取的结果。 */
export interface SkillSnapshot {
  /** 全部技能：实际生效的加上盘上被遮蔽的，按名字排序。 */
  readonly skills: readonly SkillView[]
  /** 盘上有、但 DSH 会丢弃的条目，附上它丢弃的理由。 */
  readonly rejected: readonly RejectedView[]
  /** 已配置的市场源；空数组说明市场页只能提示「没配 registry」。 */
  readonly registries: readonly RegistryInfo[]
  /** DSH 的技能服务在不在；不在时清单只有盘上那些，谈不上生效与否。 */
  readonly hasRegistry: boolean
}

/** 一次写操作之后的结果。 */
export interface SkillMutation {
  /** 改完的技能；删除时不出现。 */
  readonly skill?: SkillView
  /** 一句给人看的结果说明。 */
  readonly message: string
  /** 回读得到的生效结论；删除时不出现。 */
  readonly activation?: ActivationState
  /** 写操作之后的完整快照，省掉界面再取一次。 */
  readonly snapshot: SkillSnapshot
}

/** 一个技能的正文。 */
export interface SkillContent {
  readonly skill: SkillView
  /** frontmatter 之后的正文。 */
  readonly content: string
  /**
   * 技能目录里的全部文件，**含 SKILL.md**，带体积。
   *
   * 与 `SkillView.files` 不是一回事：那一份是清单与工具用的「附带文件」名字，
   * 不含 SKILL.md、也没有体积；这一份是详情页的文件树用的，讲的是「这个目录
   * 里到底有什么」。清单会把每个技能都扫一遍，为一个只有详情页用得上的体积
   * 给整份清单加一轮 stat 不值当，所以分成两份。
   */
  readonly files: readonly SkillFileEntry[]
  /** 盘上有这份、但生效的是别处那份时给出的说明。 */
  readonly note?: string
}

/** 新建技能的入参。 */
export interface SkillInput {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly content?: string
  readonly modelInvocable?: boolean
  readonly userInvocable?: boolean
}

/** 改可见性的入参。 */
export interface SkillVisibilityInput {
  readonly modelInvocable?: boolean
  readonly userInvocable?: boolean
}

/**
 * 市场上的一个标签。
 *
 * 与 `MarketView.tags` 不是一回事：那是条目自己带的话题词，只能在已经取回来
 * 的这一批结果里数；标签是市场自己的目录，按它筛是**服务端**做的，覆盖整个
 * 市场。
 */
export interface MarketLabel {
  readonly slug: string
  readonly name: string
  /** `RECOMMENDED` 像一级分类，`PRIVILEGED` 是来源／认证标记。 */
  readonly kind: string
  readonly registry: string
  readonly registryName: string
}

/** 一次市场搜索的结果。 */
export interface MarketPage {
  readonly items: readonly MarketView[]
  /** registry 当前不可达、结果来自离线缓存。 */
  readonly fromCache: boolean
}

/**
 * 一个市场条目的包内容：装上去会得到什么。
 *
 * `content` 与本机详情里那份 `SkillContent.content` 是同一种东西——SKILL.md
 * 在 frontmatter 之后的正文，也就是模型真正读到的部分。两边因此可以摆成
 * 同一套页签，看的人不用换一种读法。
 */
export interface MarketPreview {
  /** 包内全部文件，SKILL.md 排在最前。 */
  readonly files: readonly SkillFileEntry[]
  /** 包里 SKILL.md 的正文；包里没有合规的 SKILL.md 时不存在。 */
  readonly content?: string
  /** 取不到内容时的说明。取到了就没有这一条。 */
  readonly note?: string
}

/**
 * 列出生效的那一份技能所在目录里的全部文件。
 *
 * 有一处不能想当然：`SkillView.path` 在两条投影里指的**不是同一种东西**——
 * `projectLocal` 给的是 `<dir>/SKILL.md`，而 `projectWinner` 给的是
 * `resourceBase` 那个**目录**。所以这里不看 `path`，直接收 `resourceBase`。
 *
 * 还有一处：扁平形技能（`<name>.md`）的 `resourceBase` 给的是**技能根**，
 * 照着列会把根下每一个技能的文件都算成这一个的。所以只有目录里确实有
 * SKILL.md 才当技能目录列，否则退回盘上那一份自己报的路径。
 *
 * @param dir - `resourceBase` 给的目录；来源不是目录形时 undefined。
 * @param local - 盘上那一份，用来兜底。
 * @returns 目录内文件，含 SKILL.md。
 */
async function filesOfSkill(
  dir: string | undefined,
  local: LocalSkill | undefined,
): Promise<readonly SkillFileEntry[]> {
  if (dir !== undefined && await isSkillDir(dir)) return listSkillFiles(dir)
  return local === undefined ? [] : filesOfLocal(local)
}

/** 盘上那一份技能的文件清单。 */
async function filesOfLocal(local: LocalSkill): Promise<readonly SkillFileEntry[]> {
  if (!local.flat) return listSkillFiles(dirname(local.path))
  // 扁平形没有自己的目录，就它一个文件。
  const name = local.path.split(/[\/]/u).pop()
  return name === undefined ? [] : [{ path: name, size: await fileSize(local.path) }]
}

/** 这个目录是不是一个技能目录（底下有 SKILL.md）。 */
async function isSkillDir(dir: string): Promise<boolean> {
  try {
    return (await stat(join(dir, SKILL_FILE))).isFile()
  } catch {
    return false
  }
}

/** 一个文件的字节数；读不到按 0 记，不让详情页整个塌掉。 */
async function fileSize(path: string): Promise<number> {
  try {
    return (await stat(path)).size
  } catch {
    return 0
  }
}

/**
 * 把技能目录里该扫的文件读成字节。
 *
 * 只读扩展名认得出的文本、且不超过 {@link MAX_SCAN_BYTES} 的那些——剩下的
 * 交给 {@link scanFiles} 也是跳过，但那时已经把几十 MB 读进内存了。读不到的
 * 文件直接略过：一次扫描不该因为某个文件权限不对就整个失败。
 */
async function readScanInputs(
  dir: string,
  entries: readonly SkillFileEntry[],
): Promise<readonly ScanInput[]> {
  const inputs: ScanInput[] = []
  for (const entry of entries) {
    if (!isScannableTextFile(entry.path) || entry.size > MAX_SCAN_BYTES) continue
    try {
      inputs.push({ path: entry.path, data: await readFile(join(dir, entry.path)) })
    } catch {
      continue
    }
  }
  return inputs
}

/**
 * 缓存一个市场包最多占多少内存。
 *
 * 这份东西一直留到下一次预览把它换掉，所以上限按「技能包该有的大小」定，
 * 而不是按解包上限。真有超过这个数的包，代价只是点开文件时重下一次。
 */
const MAX_CACHED_PACKAGE_BYTES = 8 * 1024 * 1024

/** 一个市场包的坐标，用来判断缓存里那份是不是同一个。 */
function packageKey(
  slug: string,
  version: string | undefined,
  registry: string | undefined,
  owner: string | undefined,
): string {
  // JSON 数组当键：各段本身可以含任何字符，拿分隔符拼会撞上歧义。
  return JSON.stringify([registry ?? '', owner ?? '', slug, version ?? 'latest'])
}

/** 文件清单的排序权重：SKILL.md 排最前，它是这个包的入口。 */
function rank(path: string): number {
  return path === SKILL_FILE ? 0 : 1
}

/**
 * 技能域的 Remote 服务。注册为 `ctx.workbenchSkill`。
 */
export class WorkbenchSkillGateway extends TypertRemoteService {
  static inject = ['workbench']

  constructor(ctx: Context) {
    super(ctx, 'workbenchSkill')
  }

  /**
   * 读出全部技能与已配置的市场源。
   * @returns 技能快照。
   */
  @Remote('list')
  async list(): Promise<SkillSnapshot> {
    return this.snapshot()
  }

  /**
   * 读一个技能的正文。
   *
   * 优先读实际生效的那份（`ctx.skills`），因为人想看的是「模型现在读到的是
   * 什么」。盘上那份被遮蔽时会一并说明。
   * @param name - 技能名。
   * @returns 技能投影与正文。
   */
  @Remote('read')
  async read(name: string): Promise<SkillContent> {
    const root = this.root()
    const registry = this.ctx.get('skills')
    const definition = await registry?.get(name)
    const local = await readLocalSkill(root, name)
    if (definition !== undefined) {
      const isLocal = winnerIsLocal(definition, root)
      const winner = projectWinner(definition, isLocal)
      return {
        skill: winner,
        content: definition.content,
        // 列的是**生效的那一份**所在的目录，而不是本地那一份：正文取自赢家，
        // 文件也该取自赢家，否则详情页会把一份正文和另一份的文件摆在一起。
        // 随部署发布的技能因此也能看到自己的文件——它们的 `resourceBase`
        // 一样是个目录，只是本插件改不动而已。盘上那一份只有在它自己就是
        // 赢家时才拿来兜底（扁平形走的就是这条）。
        files: await filesOfSkill(
          definition.resourceBase?.kind === 'directory' ? definition.resourceBase.path : undefined,
          isLocal ? local : undefined,
        ),
        ...isLocal || local === undefined
          ? {}
          : { note: `当前生效的是 ${definition.source} 的版本，本地那份被遮蔽` },
      }
    }
    if (local === undefined) {
      throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
    }
    // 盘上有、`ctx.skills` 却没有。为什么查不到不止一种可能（frontmatter 被
    // 拒收、宿主层根本不扫本地根），所以这句话交给 activation 去分辨，
    // 不在这里猜。
    const note = detailNote(await this.activation()?.verify(name, root))
    return {
      skill: projectLocal(local, false),
      content: local.content,
      files: await filesOfLocal(local),
      // 部署级的结论不挂在详情页上，见 detailNote。
      ...note === undefined ? {} : { note },
    }
  }

  /**
   * 读技能目录里某一个文件的内容，给详情页的文件预览用。
   *
   * 目录取的与 {@link read} 一样是**生效的那一份**所在的目录，所以随部署发布的
   * 技能里的文件也看得到。`path` 必须是技能目录**里面**的相对路径：
   * `assertSafeEntryPath` 先挡掉 `..` 与绝对路径，落到盘上之后再核一遍解析结果
   * 确实还在目录底下——只做前一道的话，一个精心构造的 path 仍可能靠平台差异
   * 绕出去。
   *
   * @param name - 技能名。
   * @param path - 相对技能目录的路径。
   * @returns 文件内容；二进制只报体积，过大的截断。
   */
  @Remote('readFile')
  async readFile(name: string, path: string): Promise<FileContent> {
    const root = this.root()
    const definition = await this.ctx.get('skills')?.get(name)
    const local = await readLocalSkill(root, name)
    const base = definition?.resourceBase
    const dir = base !== undefined && base.kind === 'directory' && await isSkillDir(base.path)
      ? base.path
      : local !== undefined && !local.flat ? dirname(local.path) : undefined
    // 扁平形技能没有自己的目录，能读的只有它自己那一个 `.md`——文件树里
    // 列出来的也就是它，所以只认那一个名字。
    if (dir === undefined) {
      if (local !== undefined && local.flat && basename(local.path) === path) {
        return readFileContent(local.path, path)
      }
      throw new WorkbenchError(`技能 "${name}" 里没有 "${path}"`, 'WORKBENCH_SKILL_NOT_FOUND')
    }
    return readFileContent(resolveInsideSkill(dir, path), path)
  }

  /**
   * 新建一个本地技能。
   * @param input - 技能字段；`description` 要写清什么情况下该用它。
   * @returns 新建的技能与刷新后的快照。
   */
  @Remote('create')
  async create(input: SkillInput): Promise<SkillMutation> {
    const name = input.name.trim()
    const skill = await createLocalSkill(this.root(), {
      name,
      description: input.description.trim(),
      ...input.whenToUse === undefined ? {} : { whenToUse: input.whenToUse.trim() },
      ...input.content === undefined ? {} : { content: input.content },
      ...input.modelInvocable === undefined ? {} : { modelInvocable: input.modelInvocable },
      ...input.userInvocable === undefined ? {} : { userInvocable: input.userInvocable },
    })
    return this.mutated(projectLocal(skill, false), `已创建技能 "${name}"`, name)
  }

  /**
   * 改一个技能的可见性。
   * @param name - 技能名。
   * @param visibility - 至少给 `modelInvocable` 与 `userInvocable` 其中一个。
   * @returns 改完的技能与刷新后的快照。
   */
  @Remote('visibility')
  async visibility(name: string, visibility: SkillVisibilityInput): Promise<SkillMutation> {
    if (visibility.modelInvocable === undefined && visibility.userInvocable === undefined) {
      throw new WorkbenchError(
        '改可见性至少要给 modelInvocable 或 userInvocable 其中一个',
        'WORKBENCH_MISSING_ARG',
      )
    }
    const skill = await setSkillVisibility(this.root(), name, {
      ...visibility.modelInvocable === undefined ? {} : { modelInvocable: visibility.modelInvocable },
      ...visibility.userInvocable === undefined ? {} : { userInvocable: visibility.userInvocable },
    })
    return this.mutated(projectLocal(skill, false), `已更新技能 "${name}" 的可见性`, name)
  }

  /**
   * 删掉一个本地技能。
   *
   * 不可逆，且这里不再问一遍：点删除的是人，确认在界面上已经发生过了。
   * @param name - 技能名。
   * @returns 删除后的快照。
   */
  // 方法名不能叫 `remove`：浏览器侧每个 Remote 命名空间是一个 Service，
  // 它自己的原型上就有 `remove`，重名会在 $mount 时被拒。
  @Remote('delete')
  async delete(name: string): Promise<SkillMutation> {
    await removeLocalSkill(this.root(), name)
    await forgetInstall(this.runtime().paths.workbench, name)
    this.activation()?.notifyChanged()
    return { message: `已删除技能 "${name}"`, snapshot: await this.snapshot() }
  }

  /**
   * 在已配置的市场源里搜索。
   * @param keyword - 关键词；留空则按 `sort` 指定的榜单浏览。
   * @param page - 1 起的页码。
   * @param sort - 浏览时的榜单：`hot` `featured` `newest` `recommended` `trending` `paid`。
   * @returns 这一页的条目。
   */
  @Remote('marketSearch')
  async marketSearch(
    keyword?: string,
    page?: number,
    sort?: string,
    label?: string,
    labelRegistry?: string,
  ): Promise<MarketPage> {
    const slug = label?.trim() ?? ''
    const registry = labelRegistry?.trim() ?? ''
    const result = await this.runtime().registry.search({
      ...keyword === undefined || keyword.trim() === '' ? {} : { keyword: keyword.trim() },
      ...page === undefined ? {} : { page },
      ...sort === undefined || sort.trim() === '' ? {} : { sort: sort.trim() },
      // 标签与它所属的源要成对给：单给标签就不知道该问谁，而问错了源会得到
      // 一整页没筛过的结果——看着像筛过了，比报错更坏。
      ...slug === '' || registry === '' ? {} : { label: { slug, registry } },
    })
    return { items: result.items.map(projectMarket), fromCache: result.fromCache }
  }

  /**
   * 列出各市场源提供的标签。
   *
   * 尽力而为：只有 SkillHub 那套 `/api/web/labels` 提供得了，ClawHub 上没有
   * 这个端点。空数组说明配置的源都没有标签，界面据此不摆那条分组栏，而不是
   * 摆一条空的。
   *
   * @returns 各源的标签，每条带着自己来自哪个源。
   */
  @Remote('marketLabels')
  async marketLabels(): Promise<readonly MarketLabel[]> {
    return this.runtime().registry.listLabels()
  }

  /**
   * 读一个市场条目的详情。
   *
   * 比列表多出来的是安全审核结论与完整描述。技能装上去就是模型会照着执行的
   * 指令，上游既然审了，安装前就该看得见。
   * @param slug - 市场里的标识。
   * @param registry - 指定源；留空按配置顺序找第一个命中的。
   * @returns 条目详情。
   */
  @Remote('marketGet')
  async marketGet(slug: string, registry?: string): Promise<MarketView> {
    const item = await this.runtime().registry.get(slug, registry)
    if (item === undefined) {
      throw new WorkbenchError(`市场里没有 "${slug}"`, 'WORKBENCH_REGISTRY_NOT_FOUND')
    }
    return projectMarket(item)
  }

  /**
   * 读一个市场条目的包内容：正文与文件清单。
   *
   * 走的是**下载**那条路，而不是某家市场的文件浏览接口。SkillHub 有一组
   * `/api/web/skills/.../files` 端点，但它不在 ClawHub 兼容契约里——同样的
   * 路径在 clawhub.ai 上是 404。下载端点则是安装本来就要走的那一个，所以
   * 这里列出来的东西与「装上去会得到什么」逐字一致，而不是另一份可能对不上
   * 的目录。
   *
   * 代价是要把包整个取回来。技能包通常几十 KB，最大的也就几百 KB，而且字节
   * 不出宿主——送到浏览器的只有路径、大小和一份 SKILL.md 正文。
   *
   * **取不到不算错误**：镜像条目没有包，转发到 GitHub 的条目也没有，源不可达
   * 更是常事。这些情况下 `files` 是空的、`note` 说清为什么，界面照实显示，
   * 而不是弹一个失败——人只是想看看这个技能是什么，不是在装它。
   *
   * @param slug - 市场里的标识。
   * @param version - 版本；留空取最新。
   * @param registry - 指定源；留空按配置顺序找第一个命中的。
   * @param owner - 发布者 handle，用来消解同名 slug。
   * @returns 包内容；取不到时是一份带 `note` 的空清单。
   */
  @Remote('marketPreview')
  async marketPreview(
    slug: string,
    version?: string,
    registry?: string,
    owner?: string,
  ): Promise<MarketPreview> {
    let downloaded
    try {
      downloaded = await this.runtime().registry.download(slug, version, registry, undefined, owner)
    } catch (error: unknown) {
      return { files: [], note: error instanceof Error ? error.message : String(error) }
    }
    this.remember(packageKey(slug, version, registry, owner), downloaded.files)
    const files = [...downloaded.files]
      .map(file => ({ path: file.path, size: packageFileBytes(file) }))
      .sort((left, right) => rank(left.path) - rank(right.path) || left.path.localeCompare(right.path))
    try {
      // 包里可能不止一个技能（一个仓库装若干技能的形状）。正文取与 slug 同名
      // 的那个，取不到就取第一个——这里不像安装那样必须问清装哪一个，看错
      // 一份正文的代价只是看错，不会在盘上留下东西。
      const found = findSkillsInPackage(downloaded.files)
      const primary = found.find(entry => entry.parsed.name === slug) ?? found[0]
      return {
        files,
        ...primary === undefined ? {} : { content: primary.parsed.content },
        ...primary === undefined ? { note: `包里没有找到 ${SKILL_FILE}` } : {},
      }
    } catch (error: unknown) {
      // frontmatter 不合规。文件清单仍然是真的，照样给出去。
      return { files, note: error instanceof Error ? error.message : String(error) }
    }
  }

  /**
   * 读一个市场条目包里某一个文件的内容。
   *
   * 包本身是 {@link marketPreview} 刚取回来的那一份——文件树上点一个文件，
   * 内容不该再让人等一次整包下载。缓存只留一份、按坐标比对，对不上就重新取；
   * 见 {@link remember}。
   *
   * @param slug - 市场里的标识。
   * @param version - 版本；留空取最新。
   * @param registry - 指定源。
   * @param owner - 发布者 handle。
   * @param path - 包内相对路径。
   * @returns 文件内容；二进制只报体积，过大的截断。
   */
  @Remote('marketFile')
  async marketFile(
    slug: string,
    version?: string,
    registry?: string,
    owner?: string,
    path?: string,
  ): Promise<FileContent> {
    const wanted = path?.trim() ?? ''
    if (wanted === '') throw new WorkbenchError('要读哪个文件？path 是空的', 'WORKBENCH_MISSING_ARG')
    const key = packageKey(slug, version, registry, owner)
    let files = this.cached?.key === key ? this.cached.files : undefined
    if (files === undefined) {
      files = (await this.runtime().registry.download(slug, version, registry, undefined, owner)).files
      this.remember(key, files)
    }
    const file = files.find(entry => entry.path === wanted)
    if (file === undefined) {
      throw new WorkbenchError(`包里没有 "${wanted}"`, 'WORKBENCH_SKILL_NOT_FOUND')
    }
    const size = packageFileBytes(file)
    const data = typeof file.content === 'string' ? Buffer.from(file.content, 'utf8') : Buffer.from(file.content)
    return fileContentOf(wanted, size, data.subarray(0, MAX_PREVIEW_BYTES))
  }

  /**
   * 扫一个本机技能：装完之后再看一眼盘上这一份。
   *
   * 扫的是**盘上真实存在的那些字节**，不是市场详情页上那份预览——两者本该
   * 一样，但「本该一样」正是值得复核的地方。
   *
   * @param name - 技能名。
   * @returns 扫描结果。
   */
  @Remote('scan')
  async scan(name: string): Promise<ScanReport> {
    const root = this.root()
    const registry = this.ctx.get('skills')
    const definition = await registry?.get(name)
    const local = await readLocalSkill(root, name)
    const dir = definition?.resourceBase?.kind === 'directory' && await isSkillDir(definition.resourceBase.path)
      ? definition.resourceBase.path
      : local === undefined ? undefined : local.flat ? undefined : dirname(local.path)
    if (dir === undefined) {
      if (local === undefined) {
        throw new WorkbenchError(`技能 "${name}" 不存在`, 'WORKBENCH_SKILL_NOT_FOUND')
      }
      // 扁平形技能没有自己的目录，就它一个文件。
      return scanFiles(await readScanInputs(dirname(local.path), [
        { path: basename(local.path), size: 0 },
      ]))
    }
    return scanFiles(await readScanInputs(dir, await listSkillFiles(dir)))
  }

  /**
   * 扫一个市场条目：装之前先看一眼这个包里有什么。
   *
   * 用的是 {@link marketPreview} 刚取回来的那一份包，与文件树、正文预览同一份
   * 字节——扫出来的东西和点开文件看到的东西必须对得上，否则这一页没有意义。
   *
   * @param slug - 市场里的标识。
   * @param version - 版本；留空取最新。
   * @param registry - 指定源。
   * @param owner - 发布者 handle。
   * @returns 扫描结果。
   */
  @Remote('marketScan')
  async marketScan(
    slug: string,
    version?: string,
    registry?: string,
    owner?: string,
  ): Promise<ScanReport> {
    const key = packageKey(slug, version, registry, owner)
    let files = this.cached?.key === key ? this.cached.files : undefined
    if (files === undefined) {
      files = (await this.runtime().registry.download(slug, version, registry, undefined, owner)).files
      this.remember(key, files)
    }
    return scanFiles(files.map(file => ({
      path: file.path,
      data: typeof file.content === 'string' ? Buffer.from(file.content, 'utf8') : file.content,
    })))
  }

  /**
   * 从市场装一个技能。
   * @param slug - 市场里的标识。
   * @param version - 版本；留空取最新。
   * @param registry - 指定源；留空按配置顺序找第一个命中的。
   * @param overwrite - 同名已存在时是否覆盖。
   * @param owner - 发布者 handle。ClawHub 上同名 slug 归不同发布者是常态，
   *   不给的话客户端会先查一次详情去补；市场列表里已经有这个字段，直接带上更快。
   * @returns 装好的技能与刷新后的快照。
   */
  @Remote('marketInstall')
  async marketInstall(
    slug: string,
    version?: string,
    registry?: string,
    overwrite?: boolean,
    owner?: string,
  ): Promise<SkillMutation> {
    const runtime = this.runtime()
    const downloaded = await runtime.registry.download(slug, version, registry, undefined, owner)
    // 包里可能不止一个技能，也可能技能不在包根。这一步把「装哪个、它的根在哪」
    // 定下来，落盘那一步只处理已经相对化好的文件。
    const picked = selectSkillFromPackage(downloaded.files)
    const result = await installSkillFiles(
      { root: this.root(), stagingParent: runtime.paths.skillStaging },
      picked.files,
      { overwrite: overwrite === true },
    )
    // 记下来源与版本。技能目录里没有这个信息——SKILL.md 里那个 `version`
    // 是作者写的，与 registry 上发布的版本号不是一回事，拿它比对会得出
    // 一个看着合理、实际不对的更新结论。
    await recordInstall(runtime.paths.workbench, {
      name: result.installedAs,
      registry: downloaded.source.id,
      slug,
      ...downloaded.owner === undefined ? {} : { owner: downloaded.owner },
      version: downloaded.version,
      installedAt: Date.now(),
    })
    const resources = result.fileCount - 1
    return this.mutated(
      projectLocal(result.skill, false),
      `已${result.replaced ? '覆盖安装' : '安装'}技能 "${result.installedAs}"`
      + `（来自 ${downloaded.source.name} v${downloaded.version}`
      + `${resources > 0 ? `，含 ${String(resources)} 个资源文件` : ''}`
      + `${result.binaryCount > 0 ? `，其中 ${String(result.binaryCount)} 个二进制` : ''}）`,
      result.installedAs,
    )
  }

  /**
   * 装一个用户从浏览器上传的技能压缩包。
   *
   * 与市场安装的区别只有来源：包字节是随调用一起传上来的，不是下载的。
   * 因此**不记安装台账**——手上传的包没有 registry 坐标，记一条假的进去，
   * 之后的更新检查会拿技能名去市场里碰一个同名条目，用一个不相干的包
   * 覆盖掉用户自己的东西。手上传的技能就是没有「更新」这回事。
   *
   * 包里可能不止一个技能，也可能技能不在包根；定位与落盘复用与市场安装
   * 完全相同的两步，所以解包安全检查（路径穿越、条目数、体积）也是同一套。
   *
   * @param fileName - 原始文件名，只用于报错与日志，不参与落盘路径。
   * @param contentBase64 - 压缩包字节的 base64。
   * @param overwrite - 同名已存在时是否覆盖。
   * @param name - 包里有多个技能时指定装哪一个。
   * @returns 装好的技能与刷新后的快照。
   */
  @Remote('importPackage')
  async importPackage(
    fileName: string,
    contentBase64: string,
    overwrite?: boolean,
    name?: string,
  ): Promise<SkillMutation> {
    const label = fileName.trim() === '' ? '上传的压缩包' : fileName.trim()
    const data = decodeUploadedPackage(contentBase64, label)
    const files = await readPackageBytes(data, label)
    const picked = selectSkillFromPackage(files, name)
    const result = await installSkillFiles(
      { root: this.root(), stagingParent: this.runtime().paths.skillStaging },
      picked.files,
      { overwrite: overwrite === true },
    )
    const resources = result.fileCount - 1
    return this.mutated(
      projectLocal(result.skill, false),
      `已${result.replaced ? '覆盖安装' : '安装'}技能 "${result.installedAs}"（来自上传的 ${label}`
      + `${resources > 0 ? `，含 ${String(resources)} 个资源文件` : ''}`
      + `${result.binaryCount > 0 ? `，其中 ${String(result.binaryCount)} 个二进制` : ''}）`,
      result.installedAs,
    )
  }

  /**
   * 查哪些已装技能有新版本。
   *
   * 只查台账里有记录的那些：手写的技能没有「上游最新版」这个概念，
   * 拿技能名去市场里碰运气搜一个同名条目再报「有更新」，是在拿一个
   * 不相干的包冒充它的新版。
   *
   * 单个条目查失败不影响其余：市场限流或某个 slug 被下架时，
   * 其余技能的更新状态照常给出，失败的那条带上原因。
   * @returns 每个有台账记录的技能的更新状态。
   */
  /**
   * 把所有有新版本的已装技能一次更新完。
   *
   * 一条失败不拖累其余：技能之间互不相干，其中一个的源临时不可达，没有理由
   * 让另外五个也停在原地。做完之后把成功与失败**分别**说清——只报一句
   * 「已更新 N 个」而把失败的咽下去，人会以为全都更新了。
   *
   * 只动台账里记着来源的那些。手写的技能没有上游，拿它的名字去市场碰一个
   * 同名条目装上来，是用一个不相干的包覆盖掉人自己写的东西。
   *
   * @returns 一句汇总说明与刷新后的快照。
   */
  @Remote('marketUpdateAll')
  async marketUpdateAll(): Promise<SkillMutation> {
    const outdated = (await this.updates()).filter(status => status.outdated)
    if (outdated.length === 0) {
      return { message: '没有需要更新的技能', snapshot: await this.snapshot() }
    }
    const done: string[] = []
    const failed: string[] = []
    for (const status of outdated) {
      try {
        await this.marketUpdate(status.name)
        done.push(`${status.name} → v${status.latest ?? '?'}`)
      } catch (error: unknown) {
        failed.push(`${status.name}（${error instanceof Error ? error.message : String(error)}）`)
      }
    }
    const parts = [
      done.length === 0 ? undefined : `已更新 ${String(done.length)} 个：${done.join('、')}`,
      failed.length === 0 ? undefined : `${String(failed.length)} 个没更新成：${failed.join('；')}`,
    ].filter(part => part !== undefined)
    return { message: parts.join('。'), snapshot: await this.snapshot() }
  }

  @Remote('updates')
  async updates(): Promise<readonly UpdateStatus[]> {
    const runtime = this.runtime()
    const ledger = await readLedger(runtime.paths.workbench)
    if (ledger.size === 0) return []
    // 以盘为准：台账里的孤儿条目（技能已被手动删掉）不算数。
    const present = new Set((await scanLocalSkills(this.root())).skills.map(skill => skill.name))
    const alive = [...ledger.values()].filter(origin => present.has(origin.name))
    return Promise.all(alive.map(async origin => this.updateStatusOf(origin)))
  }

  /** 查一个技能的更新状态。 */
  private async updateStatusOf(origin: SkillOrigin): Promise<UpdateStatus> {
    const sources = this.runtime().registry.listSources()
    const source = sources.find(candidate => candidate.id === origin.registry)
    if (source === undefined) {
      return {
        name: origin.name,
        installed: origin.version,
        outdated: false,
        origin,
        error: `装它的源 "${origin.registry}" 现在没有配置，查不了更新`,
      }
    }
    let latest: string | undefined
    try {
      latest = await this.runtime().registry.latestVersion(source, origin.slug)
    } catch (error: unknown) {
      return {
        name: origin.name,
        installed: origin.version,
        outdated: false,
        origin,
        error: error instanceof Error ? error.message : String(error),
      }
    }
    return {
      name: origin.name,
      installed: origin.version,
      ...latest === undefined ? {} : { latest },
      outdated: latest !== undefined && isNewerVersion(latest, origin.version),
      origin,
    }
  }

  /**
   * 把一个已装技能更新到市场上的最新版。
   *
   * 与安装的差别只有两处：必须已经装过（否则这是「安装」，不是「更新」），
   * 以及一定覆盖。同名遮蔽照样可能发生，所以结论仍然来自回读。
   * @param name - 本机技能名。
   * @param slug - 市场标识；留空时用技能名当 slug。
   * @param registry - 指定源。
   * @returns 更新后的技能与刷新后的快照。
   */
  @Remote('marketUpdate')
  async marketUpdate(name: string, slug?: string, registry?: string, owner?: string): Promise<SkillMutation> {
    const runtime = this.runtime()
    const existing = await readLocalSkill(this.root(), name)
    if (existing === undefined) {
      throw new WorkbenchError(
        `技能 "${name}" 还没装在用户目录里，更新无从谈起；要装请用安装`,
        'WORKBENCH_SKILL_NOT_FOUND',
      )
    }
    // 台账里记着当初是从哪个源、哪个 slug、哪个发布者装的。不给参数时
    // 就照那条走——更新的定义是「同一来源的更新版」，换个源装同名技能
    // 是另一回事。
    const known = (await readLedger(runtime.paths.workbench)).get(name)
    const downloaded = await runtime.registry.download(
      slug ?? known?.slug ?? name,
      undefined,
      registry ?? known?.registry,
      undefined,
      owner ?? known?.owner,
    )
    const picked = selectSkillFromPackage(downloaded.files, name)
    const result = await installSkillFiles(
      { root: this.root(), stagingParent: runtime.paths.skillStaging },
      picked.files,
      { overwrite: true },
    )
    await recordInstall(runtime.paths.workbench, {
      name: result.installedAs,
      registry: downloaded.source.id,
      slug: slug ?? name,
      ...downloaded.owner === undefined ? {} : { owner: downloaded.owner },
      version: downloaded.version,
      installedAt: Date.now(),
    })
    return this.mutated(
      projectLocal(result.skill, false),
      `已把技能 "${result.installedAs}" 更新到 ${downloaded.source.name} 的 v${downloaded.version}`,
      result.installedAs,
    )
  }

  /** 当前的完整快照。 */
  private async snapshot(): Promise<SkillSnapshot> {
    const root = this.root()
    const [skills, scan] = await Promise.all([
      collectSkills(this.ctx, root),
      scanLocalSkills(root),
    ])
    return {
      skills,
      rejected: scan.rejected.map(projectRejected),
      registries: this.runtime().registry.listSources().map(source => ({
        id: source.id,
        name: source.name,
        url: source.url,
        flavor: source.flavor ?? 'clawhub',
      })),
      hasRegistry: this.ctx.get('skills') !== undefined,
    }
  }

  /**
   * 一次写操作之后：让 DSH 重新发现，回读确认，再连快照一起交出去。
   *
   * 回读那一下是这里的重点。写盘成功只说明文件在盘上；它有没有真的被 DSH
   * 收下、是不是被同名的更高优先级来源盖住了，只有查一次才知道。
   */
  private async mutated(skill: SkillView, message: string, name: string): Promise<SkillMutation> {
    const activation = this.activation()
    activation?.notifyChanged()
    const state = await activation?.verify(name, this.root())
    return {
      skill,
      message,
      ...state === undefined ? {} : { activation: state },
      snapshot: await this.snapshot(),
    }
  }

  /**
   * 上一次取回来的市场包，给「点开一个文件看看」用。
   *
   * 只留**一份**：人是顺着一个条目的文件树往下点的，再往前翻的很少，
   * 而多留几份就要认真管上限了。
   */
  private cached: { key: string; files: readonly PackageFile[] } | undefined

  /**
   * 记住刚取回来的包。
   *
   * 太大的不留——这份东西会一直占着内存直到下一次预览把它换掉，而超过这个数
   * 的包在市场上本来就是异类，为它长期占住几十 MB 不划算。
   */
  private remember(key: string, files: readonly PackageFile[]): void {
    const total = files.reduce((sum, file) => sum + packageFileBytes(file), 0)
    this.cached = total > MAX_CACHED_PACKAGE_BYTES ? undefined : { key, files }
  }

  /** 生效信号与验证；插件没装全时可能不在。 */
  private activation() {
    return this.ctx.get('workbenchSkillActivation')
  }

  /** 本插件的运行时（目录布局与市场客户端）。 */
  private runtime(): WorkbenchRuntime {
    return this.ctx.workbench as WorkbenchRuntime
  }

  /** 用户级技能目录。 */
  private root(): string {
    return this.runtime().paths.skills
  }
}

export default WorkbenchSkillGateway
