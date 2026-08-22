/**
 * 工作台各域共享的词汇表。
 * @module @staff-os/dsh-workbench/types
 */

import { HarnessError } from '@deepseek-ai/dsh-llm'

/** 带机器可路由 `code` 的工作台错误。 */
export class WorkbenchError extends HarnessError {}

/**
 * 破坏性动作缺少 `confirm: true` 时抛出的错误码。
 *
 * 模型误删的代价远高于多问一句，所以删除类动作一律要求显式确认，
 * 而不是靠工具描述里写「请谨慎」。
 */
export const CONFIRM_REQUIRED = 'WORKBENCH_CONFIRM_REQUIRED'

/**
 * 校验破坏性动作的确认位。
 * @param confirmed - 调用方传入的 `confirm` 参数。
 * @param what - 出现在错误信息里的动作描述。
 */
export function requireConfirm(confirmed: boolean | undefined, what: string): void {
  if (confirmed === true) return
  throw new WorkbenchError(
    `${what} 是不可逆操作，请在确认后重新调用并传入 confirm: true`,
    CONFIRM_REQUIRED,
  )
}

/**
 * registry 的协议方言。
 *
 * 两家的搜索、详情、下载端点是一样的，唯独**不带关键词的浏览**不同：
 * ClawHub 是 `/api/v1/skills?sort=`，SkillHub 没有这个路由（返回 405），
 * 它把浏览拆成了几个榜单端点 `/api/v1/showcase/<榜单>`。
 * 其余字段差异（下划线还是驼峰、统计量在顶层还是在 `stats` 里）由归一函数
 * 一并吃掉，不必分方言。
 */
export type RegistryFlavor = 'clawhub' | 'skillhub'

/** 一个 ClawHub 兼容 registry 的连接参数。 */
export interface RegistrySource {
  /** 源标识，出现在聚合结果的 `sourceRegistry` 字段里。 */
  readonly id: string
  /** 展示名。 */
  readonly name: string
  /** 服务根地址；`/api/v1/...` 由客户端追加。 */
  readonly url: string
  /** 协议方言；留空按 `clawhub` 处理。 */
  readonly flavor?: RegistryFlavor
  /** 凭据引用名；值从凭据服务或启动环境解析，不内联写死。 */
  readonly apiKeyEnv?: string
}

/** registry 归一后的一个条目。 */
export interface RegistryItem {
  readonly slug: string
  readonly name: string
  readonly description?: string
  readonly version?: string
  readonly tags: readonly string[]
  readonly category?: string
  /**
   * 插件市场专用：装它时该把什么交给包管理器。
   *
   * ClawHub 的必需字段里没有这一项（它最初是为技能包设计的），
   * 所以这里是**尽力探测**：上游发了 `installSpec` 或 `packageName` 就用，
   * 都没有则回退到 slug。回退错了的后果是一次失败的安装，
   * 不是静默的错误。
   */
  readonly installSpec?: string
  readonly installCount: number
  readonly avgRating: number
  /** 累计下载量；上游没给时为 0。 */
  readonly downloadCount: number
  /** 上游仓库的 star 数；同步自 GitHub 的条目才有。 */
  readonly stars: number
  /** 发布者显示名。 */
  readonly owner?: string
  /** 图标地址，用于市场列表；本插件只透传，不下载。 */
  readonly iconUrl?: string
  /** 条目主页，给「在浏览器里打开」用。 */
  readonly homepage?: string
  /**
   * 平台安全审核结论的汇总，例如「安全」「可疑」。
   *
   * 技能装上去就是模型会照着执行的指令，上游既然审了，
   * 就该让人在安装前看见结论，而不是埋在网站上。
   */
  readonly securityStatus?: string
  /**
   * 这条是谁托管的：`clawhub` 是 registry 自己托管、可直接下载，
   * `skills-sh` 之类是别家目录的镜像条目。上游没给这个字段时不存在。
   */
  readonly installKind?: string
  /**
   * 能不能从这个 registry 直接下载。
   *
   * 搜索结果里混着外部目录的镜像条目，它们在这里没有包。不区分的话，
   * 人点了安装才发现下不动，而错误只有一句 404。
   */
  readonly installable: boolean
  /** 上游给出的规范安装引用，例如 `awspace/pdf`。 */
  readonly installReference?: string
  readonly sourceRegistry: string
  readonly sourceRegistryName: string
}

/** registry 分页查询结果。 */
export interface RegistryPage {
  readonly items: readonly RegistryItem[]
  /** 上游 search 端点不返回总数，此时为 `undefined`。 */
  readonly total?: number
  /** 本次结果是否来自离线缓存。 */
  readonly fromCache: boolean
}

/** 中止信号已触发时抛出。 */
export function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted === true) {
    throw new WorkbenchError('工作台操作已取消', 'WORKBENCH_ABORTED', {
      cause: signal.reason,
    })
  }
}

/** 判断一个异常是否为 fetch 的中止错误。 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * 技能包 / 插件包内的一个条目。
 *
 * 文本与二进制都在这里，而不是只留文本：技能的 `resourceBase` 是一个目录，
 * 正文里会去引用 `assets/` 下的图、`references/` 下的 PDF、模板 `.xlsx`。
 * 早先只保留文本条目的做法会让这些文件在安装时静默消失，装出来的技能
 * 一读资源就断——而界面上一切正常，这种缺失查不出来。
 */
export interface PackageFile {
  /** 包内相对路径，已归一为正斜杠且不含前导 `./`。 */
  readonly path: string
  /** 文本条目是解码后的字符串，二进制条目是原始字节。 */
  readonly content: string | Uint8Array
}

/**
 * 取一个条目的文本内容；二进制条目给 `undefined`。
 *
 * 解析 SKILL.md、判断包形状这些事只对文本成立，用这个收口，
 * 免得每个调用点各写一次 `typeof === 'string'`。
 */
export function packageFileText(file: PackageFile): string | undefined {
  return typeof file.content === 'string' ? file.content : undefined
}

/** 一个条目落盘后占多少字节。 */
export function packageFileBytes(file: PackageFile): number {
  return typeof file.content === 'string'
    ? Buffer.byteLength(file.content, 'utf8')
    : file.content.byteLength
}
