/**
 * ClawHub 兼容 registry 客户端，技能市场与插件市场共用。
 *
 * 主力目标是 ClawHub（`https://clawhub.ai`），协议对照它的公开只读 API
 * （`docs.openclaw.ai/clawhub/api`）与实测行为。SkillHub（`api.skillhub.cn`）
 * 实现了同一批端点的一个子集，差异由下面的 `flavor` 吸收。
 *
 * ```
 * GET /api/v1/search?q=                       搜索，返回 {results:[...]}
 * GET /api/v1/skills?limit=&cursor=&sort=     浏览，游标分页，返回 {items:[...]}
 * GET /api/v1/skills/{slug}                   详情
 * GET /api/v1/download?slug=&ownerHandle=&version=   包字节
 * ```
 *
 * ## 几处必须知道的实测行为
 *
 * **一、slug 会歧义，必须带 `ownerHandle`。** ClawHub 上不同发布者可以用同一个
 * slug，裸 slug 请求下载会得到 **409**，而不是随便给你一个。热门技能几乎都撞名
 * （`self-improving-agent`、`pdf` 都是），所以这里把 `ownerHandle` 当作下载的
 * 必要坐标，从条目里带下来。409 的正文会说清有哪些候选，原样转给调用方。
 *
 * **二、错误是纯文本，不是 JSON。** 404 就是一行 `Skill not found`。
 * 只看 `response.ok` 再回落缓存的话，「这个技能不存在」会被显示成
 * 「registry 不可达」——两件完全不同的事。所以失败时把正文读出来当消息。
 * （详情端点的 409 是个例外，它给 JSON，里面有候选列表。）
 *
 * **三、搜索结果里混着别家目录的镜像条目。** `install.kind` 为 `clawhub` 的
 * 才是 ClawHub 自己托管、能直接下载的；`skills-sh` 之类是外部目录的镜像，
 * 只有 `sourceUrl`。不加区分地列出来，人点了安装才发现下不动。
 *
 * **四、`tags` 不是标签。** 列表条目里的 `tags` 是 `{latest: <版本或版本id>}`
 * 这样的版本别名映射；真正的分类在 `topics` 与 `categories` 里。照着字面把
 * `tags` 归一成标签，每个技能都会显示一个叫「latest」的标签。
 *
 * **五、有速率限制。** `RateLimit-*` / `Retry-After` 头。文档要求缓存响应、
 * 收到 429 不要硬轮询，所以这里把 429 单独识别出来并把等待秒数带给调用方。
 *
 * 另外两个反直觉的地方，也是上游本来的样子：响应是裸 DTO，没有 `{code,data}`
 * 包裹；展示名字段叫 `displayName` 而不是 `name`。
 *
 * ## SkillHub（api.skillhub.cn）与上表的出入
 *
 * 搜索、详情、下载三个端点一致（且它的 slug 不歧义，不需要 `ownerHandle`），
 * 方言差异只有一处真的：**不带关键词的浏览**。ClawHub 是
 * `GET /api/v1/skills?sort=`，SkillHub 没有这个路由（无论参数一律 405），
 * 它把浏览拆成了榜单：
 *
 * ```
 * GET /api/v1/showcase/{hot|featured|newest|recommended|trending|paid}
 * ```
 *
 * 返回 `{section, skills:[...]}` 而不是 `{items:[...]}`。
 *
 * 字段命名两边也不统一，而且**同一家的两个端点之间都不统一**：SkillHub 的
 * search 给 `icon_url` / `owner_name`，showcase 给 `iconUrl` / `ownerName`；
 * 统计量在列表里是顶层，在详情里挪进了 `stats`。ClawHub 则把正体埋在
 * `native.skill` 底下。这些一律由归一函数逐个候选位置去读，不值得为它再分
 * 方言分支。
 *
 * 版本解析端点两边都不好用（ClawHub 的 `/api/v1/resolve` 要 hash，
 * SkillHub 的要 `@namespace/slug` 坐标），但下载端点不带 `version` 就给最新版，
 * 所以这里根本不调用它——少一次往返，也少一处方言。
 * @module @staff-os/dsh-workbench/registry
 */

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DIR_MODE, FILE_MODE } from './paths.ts'
import { isAbortError, throwIfAborted, WorkbenchError } from './types.ts'
import type { PackageFile, RegistryItem, RegistryPage, RegistrySource } from './types.ts'

export type { PackageFile }

/**
 * 市场上的一个标签。
 *
 * 标签是 SkillHub 的 `/api/web/labels` 提供的，**不在 ClawHub 兼容契约里**
 * （同样的路径在 clawhub.ai 上是 404）。所以这是尽力而为：取得到就有真正的
 * 分组可用——按标签筛是**服务端**做的，覆盖整个市场而不只是当前这一页；
 * 取不到就当这个源没有标签。
 */
export interface RegistryLabel {
  readonly slug: string
  /** 显示名；上游没给就等于 slug。 */
  readonly name: string
  /** `RECOMMENDED` 像一级分类，`PRIVILEGED` 是来源／认证标记。 */
  readonly kind: string
  readonly registry: string
  readonly registryName: string
}

/** 构造 RegistryClient 所需的参数。 */
export interface RegistryClientOptions {
  readonly sources: readonly RegistrySource[]
  readonly cacheDir: string
  readonly timeoutMs: number
  readonly resolveApiKey?: (ref: string) => Promise<string | undefined>
}

/** 单个 JSON 值的宽松记录视图。 */
type Json = Record<string, unknown>

function asRecord(value: unknown): Json | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Json
    : undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

/**
 * 标签归一。
 *
 * 只收数组形态与 `{items:[...]}`。**对象形态一律当作没有标签**——ClawHub 的
 * `tags` 是 `{latest: "4.0.2"}` 这样的版本别名映射，按对象键归一的话，
 * 市场里每个技能都会挂一个叫「latest」的标签，看着像分类，其实是版本指针。
 * 真正的分类走 {@link collectTopics}。
 */
export function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean).map(String)
  const record = asRecord(raw)
  if (record !== undefined && Array.isArray(record.items)) return record.items.filter(Boolean).map(String)
  return []
}

/**
 * 从若干候选位置收集分类词。
 *
 * ClawHub 把它们分放在 `topics`（自由词）与 `categories`（受控词）两处，
 * SkillHub 用 `tags` 数组加 `subCategories`。合成一份去重列表，
 * 界面上就是一排标签，不必关心它来自哪个字段。
 */
export function collectTopics(sources: readonly unknown[]): string[] {
  const out = new Set<string>()
  for (const source of sources) {
    const record = asRecord(source)
    if (record === undefined) continue
    for (const key of ['topics', 'categories', 'tags', 'subCategories']) {
      const value = record[key]
      if (!Array.isArray(value)) continue
      for (const entry of value) {
        // subCategories 是 `{key,name}` 对象数组，取它的显示名。
        const label = typeof entry === 'string' ? entry : text(asRecord(entry)?.name)
        if (label !== undefined && label !== '') out.add(label)
      }
    }
  }
  return [...out]
}

/**
 * 从若干个候选对象里按候选键取整数，取不到给 0。
 *
 * 收多个对象而不是一个：同一个量在列表响应里挂顶层、在详情响应里挂 `stats`，
 * 两处都传进来比在每个调用点写一遍 `??` 链干净。
 */
function pickInt(sources: readonly unknown[], ...keys: string[]): number {
  for (const source of sources) {
    const record = asRecord(source)
    if (record === undefined) continue
    for (const key of keys) {
      const value = record[key]
      if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
    }
  }
  return 0
}

/** 同 {@link pickInt}，但保留小数。 */
function pickFloat(sources: readonly unknown[], ...keys: string[]): number {
  for (const source of sources) {
    const record = asRecord(source)
    if (record === undefined) continue
    for (const key of keys) {
      const value = record[key]
      if (typeof value === 'number' && Number.isFinite(value)) return value
    }
  }
  return 0
}

/** 从若干个候选对象里按候选键取一个非空字符串。 */
function pickText(sources: readonly unknown[], ...keys: string[]): string | undefined {
  for (const source of sources) {
    const record = asRecord(source)
    if (record === undefined) continue
    for (const key of keys) {
      const value = text(record[key])
      if (value !== undefined) return value
    }
  }
  return undefined
}

/**
 * 两家共有的那部分统计与展示字段。
 *
 * search / showcase / detail 三种响应的字段名各不相同（见模块头），
 * 归一集中在这里，三个 `itemFrom*` 只负责把自己那份响应拆成几个候选对象
 * 递进来。
 */
function commonFields(
  sources: readonly unknown[],
  source: RegistrySource,
): Pick<
  RegistryItem,
  'installCount' | 'avgRating' | 'downloadCount' | 'stars' | 'sourceRegistry' | 'sourceRegistryName'
> & Partial<Pick<RegistryItem, 'owner' | 'iconUrl' | 'homepage'>> {
  // 只认真正的发布者字段。`displayName` 不在候选里：条目记录自己也有一个
  // `displayName`，那是技能的显示名（「Pdf」），拿它当发布者会得到
  // 「作者：Pdf」这种明显不对、又不会报错的东西。
  const owner = pickText(sources, 'ownerHandle', 'owner_name', 'ownerName', 'handle')
  const iconUrl = pickText(sources, 'icon_url', 'iconUrl')
  const homepage = pickText(sources, 'homepage', 'sourceUrl', 'upstream_url')
  return {
    installCount: pickInt(sources, 'installs', 'installCount'),
    avgRating: pickFloat(sources, 'rating', 'avgRating', 'ratingAvg'),
    downloadCount: pickInt(sources, 'downloads', 'downloadCount'),
    stars: pickInt(sources, 'stars', 'starCount'),
    ...owner === undefined ? {} : { owner },
    ...iconUrl === undefined ? {} : { iconUrl },
    ...homepage === undefined ? {} : { homepage },
    sourceRegistry: source.id,
    sourceRegistryName: source.name,
  }
}

/**
 * 把安全审核结论并成一句话。
 *
 * SkillHub 详情里的 `securityReports` 是 `{实验室: {status, statusText}}`。
 * 技能装上去就是模型会照着做的指令，上游既然审了，安装前就该看得见结论。
 */
export function summarizeSecurity(raw: unknown): string | undefined {
  const record = asRecord(raw)
  if (record === undefined) return undefined
  const parts: string[] = []
  for (const [lab, value] of Object.entries(record)) {
    const report = asRecord(value)
    const label = text(report?.statusText) ?? text(report?.status)
    if (label !== undefined) parts.push(`${lab}：${label}`)
  }
  return parts.length === 0 ? undefined : parts.join('；')
}

/**
 * 把 ClawHub 的 `moderation` 块归一成一句结论。
 *
 * 内部部署与 clawhub.ai 的详情里都带它：`{isSuspicious, isMalwareBlocked,
 * verdict, reasonCodes, summary}`。`clean` 不值得占一行——「没问题」是默认预期，
 * 真正要顶到人眼前的是被拦下和可疑这两种。
 */
export function summarizeModeration(raw: unknown): string | undefined {
  const record = asRecord(raw)
  if (record === undefined) return undefined
  const reasons = asArray(record.reasonCodes).map(String).filter(code => code !== '')
  const detail = text(record.summary) ?? (reasons.length > 0 ? reasons.join('、') : undefined)
  const suffix = detail === undefined ? '' : `（${detail}）`
  if (record.isMalwareBlocked === true) return `已被平台拦截：判定为恶意${suffix}`
  if (record.isSuspicious === true) return `平台标记为可疑${suffix}`
  const verdict = text(record.verdict)
  if (verdict === undefined || verdict === 'clean') return undefined
  return `平台审核结论：${verdict}${suffix}`
}

/** 尽力探测一个可以交给包管理器的安装规格。 */
function installSpecOf(...sources: (Json | undefined)[]): string | undefined {
  for (const source of sources) {
    if (source === undefined) continue
    const spec = text(source.installSpec) ?? text(source.packageName)
    if (spec !== undefined) return spec
  }
  return undefined
}

/**
 * 把 `/search` 或 `/showcase/*` 的一条结果归一成条目。
 *
 * 两个端点的条目形状相同（只有下划线/驼峰之差，见模块头），所以共用一条路径。
 * 统计量在这一层是**顶层**字段，不在 `stats` 里——早先这里把 `installCount`
 * 与 `avgRating` 写死成 0，市场列表因此每一条都显示「0 次安装」，
 * 而上游明明给了 `downloads` / `installs` / `stars`。
 *
 * 描述优先取中文：SkillHub 的条目大多带 `description_zh`，
 * 而 `summary` 是把中英文拼在一起的那一版，列表里显示会很挤。
 */
export function itemFromSearchResult(raw: unknown, source: RegistrySource): RegistryItem | undefined {
  const record = asRecord(raw)
  if (record === undefined) return undefined
  // ClawHub 把正体埋在 `native.skill` 底下，顶层只留摘要字段；
  // SkillHub 全在顶层。两处都读，谁先有算谁的。
  const native = asRecord(record.native)
  const skill = asRecord(native?.skill)
  const namespace = asRecord(record.namespace)
  const publisher = asRecord(record.publisher) ?? asRecord(native?.owner)
  const install = asRecord(record.install)
  const trust = asRecord(record.trust)
  const stats = asRecord(skill?.stats) ?? asRecord(record.stats)
  // publisher/owner 排在技能记录之前：两边都有 `handle` 之类的字段，
  // 而发布者那份才是我们要的。
  const positions = [publisher, namespace, record, skill, stats]

  const slug = pickText([record, skill, namespace], 'slug', 'publicSlug')
  if (slug === undefined) return undefined
  const description = pickText([record, skill], 'description_zh', 'description', 'summary')
  const version = pickText([record, asRecord(record.latestVersion), skill], 'version')
  const category = pickText([record, skill], 'category', 'categoryKey')
  const spec = installSpecOf(record, skill)
  const topics = collectTopics([record, skill])
  const kind = pickText([install], 'kind')
  return {
    slug,
    name: pickText([record, skill], 'displayName', 'name') ?? slug,
    ...description === undefined ? {} : { description },
    ...version === undefined ? {} : { version },
    ...category === undefined ? {} : { category },
    ...spec === undefined ? {} : { installSpec: spec },
    tags: topics.length > 0 ? topics : normalizeTags(record.tags),
    ...installFields(record, install, trust, skill, kind),
    ...commonFields(positions, source),
  }
}

/**
 * 「这一条能不能直接装」相关的字段。
 *
 * 搜索结果里混着别家目录的镜像条目（`install.kind` 是 `skills-sh` 之类），
 * 它们在 ClawHub 上没有包，只有一个指向外部的 `sourceUrl`。把这件事显式带
 * 出来，界面才能在安装按钮上做区分——否则人点下去才发现下不动，
 * 而错误信息只会是一句 404。
 */
function installFields(
  record: Json,
  install: Json | undefined,
  trust: Json | undefined,
  skill: Json | undefined,
  kind: string | undefined,
): Pick<RegistryItem, 'installable'> & Partial<Pick<RegistryItem, 'installKind' | 'installReference' | 'securityStatus'>> {
  // kind 缺失按可装处理：SkillHub 的条目根本没有这个字段，
  // 而它每一条都是自己托管的。
  const foreign = kind !== undefined && kind !== 'clawhub'
  const installability = pickText([trust], 'installability')
  const suspicious = (skill?.isSuspicious ?? record.isSuspicious) === true
  const reference = pickText([install], 'reference')
  const verdict = pickText([trust], 'clawHubVerdict')
  const security = suspicious
    ? '上游标记为可疑'
    : verdict ?? undefined
  return {
    ...kind === undefined ? {} : { installKind: kind },
    installable: !foreign && installability !== 'unavailable',
    ...reference === undefined ? {} : { installReference: reference },
    ...security === undefined ? {} : { securityStatus: security },
  }
}

/**
 * 把 `/skills` 浏览列表的一条归一成条目。
 *
 * 与搜索结果的形状不同：这里正体就在顶层，版本在 `latestVersion.version`，
 * 统计量在 `stats`。分类走 `topics`——这条响应里的 `tags` 同样是
 * `{latest: "4.0.2"}` 那种版本别名映射。
 *
 * 列表端点不带发布者信息，所以这里的条目**没有 `owner`**；下载需要它的话，
 * 得先去详情端点补一次。歧义的 slug 会在下载时以 409 说明。
 */
export function itemFromListEntry(raw: unknown, source: RegistrySource): RegistryItem | undefined {
  const record = asRecord(raw)
  const slug = text(record?.slug)
  if (record === undefined || slug === undefined) return undefined
  const latest = asRecord(record.latestVersion)
  const stats = asRecord(record.stats)
  const description = text(record.description) ?? text(record.summary)
  const version = text(latest?.version)
  const category = text(record.category)
  const spec = installSpecOf(latest, record)
  const topics = collectTopics([record])
  return {
    slug,
    name: text(record.displayName) ?? slug,
    ...description === undefined ? {} : { description },
    ...version === undefined ? {} : { version },
    ...category === undefined ? {} : { category },
    ...spec === undefined ? {} : { installSpec: spec },
    tags: topics,
    installable: true,
    ...commonFields([record, stats, asRecord(record.namespace)], source),
  }
}

/**
 * 把 `/skills/{slug}` 详情归一成条目。
 *
 * 详情的结构与列表不同：正体在 `skill` 下，版本在 `latestVersion` 下，
 * stats 在不同部署里可能挂 `skill.stats` 也可能挂顶层，两处都兜。
 */
/** 一句描述最长到这里；再长就不是摘要，是正文。 */
const SUMMARY_LIMIT = 300

/** 看着像不像一句摘要：不跨行、不太长。 */
function looksLikeSummary(value: string): boolean {
  return value.length <= SUMMARY_LIMIT && !/\n/u.test(value)
}

/**
 * 从若干候选里挑一句能当描述用的话。
 *
 * ClawHub 的详情端点里，`description` 装的是**整份 SKILL.md**——连 frontmatter
 * 一起，几千字；真正的那一行摘要在 `summary` 里。列表端点只给 summary，所以
 * 不挑的话，同一个技能在卡片上是一行字，点进详情变成一堵墙。
 *
 * 挑法是按形状而不是按字段名：优先级不变，只是跳过那些明显是正文的候选；
 * 一个像样的都没有时仍然给出第一个非空的，总比什么都不显示强。
 */
function pickDescription(candidates: readonly (string | undefined)[]): string | undefined {
  const present = candidates.filter(isPresent)
  return present.find(looksLikeSummary) ?? present[0]
}

export function itemFromDetail(raw: unknown, slug: string, source: RegistrySource): RegistryItem | undefined {
  const body = asRecord(raw)
  if (body === undefined) return undefined
  const skill = asRecord(body.skill) ?? {}
  const latest = asRecord(body.latestVersion)
  const stats = skill.stats ?? body.stats
  // 两套安全信息：SkillHub 给 `securityReports`（按实验室分组），
  // ClawHub 给 `moderation`（单一结论）。哪边有读哪边。
  const security = summarizeSecurity(body.securityReports) ?? summarizeModeration(body.moderation)
  const description = pickDescription([
    text(skill.description_zh),
    text(skill.description),
    text(skill.readme),
    text(skill.summary),
  ])
  const version = text(latest?.version)
  const category = text(skill.category)
  const spec = installSpecOf(latest, skill, body)
  const topics = collectTopics([skill, body])
  // ClawHub 的详情把发布者放在 `owner`/`publisher`，SkillHub 放在
  // `owner` 与 `namespace`。下载要靠它定位（歧义 slug 必须带 ownerHandle），
  // 所以这里一定要取到。
  // 只从发布者记录里取，且不认 `displayName`：技能记录自己也有一个
  // `displayName`，拿它当发布者会得到「作者：<技能名>」。没有发布者信息就
  // 是没有——内部部署的 `owner` 就是 null，而它的 slug 也不歧义，
  // 下载本来就不需要这个坐标。
  const owner = pickText(
    [asRecord(body.owner), asRecord(body.publisher), asRecord(body.namespace)],
    'ownerHandle',
    'handle',
  )
  return {
    slug: text(skill.slug) ?? text(body.slug) ?? slug,
    name: text(skill.displayName) ?? text(skill.slug) ?? slug,
    ...description === undefined ? {} : { description },
    ...version === undefined ? {} : { version },
    ...category === undefined ? {} : { category },
    ...spec === undefined ? {} : { installSpec: spec },
    tags: topics,
    installable: true,
    ...security === undefined ? {} : { securityStatus: security },
    ...commonFields([skill, stats, asRecord(body.namespace), asRecord(body.owner)], source),
    ...owner === undefined ? {} : { owner },
  }
}

/**
 * 从 SkillHub 的 web 列表条目归一。
 *
 * 这条路与 `/api/v1` 那两条形状不同：显示名与摘要各有一个中文版，版本在
 * `headlineVersion` 里，统计量的字段名也换了一套。它只在按标签筛选时走——
 * 标签是 `/api/web` 独有的能力，见 {@link RegistryClient.listLabels}。
 *
 * **`namespace` 不是发布者**：SkillHub 上它是 `global` 这样的命名空间，
 * 拿它当 `owner` 会让卡片上写着「发布者 global」，下载时还会带上一个
 * 上游不认的坐标。
 */
export function itemFromWebEntry(raw: unknown, source: RegistrySource): RegistryItem | undefined {
  const record = asRecord(raw)
  const slug = text(record?.slug)
  if (record === undefined || slug === undefined) return undefined
  const version = text(asRecord(record.headlineVersion)?.version)
    ?? text(asRecord(record.publishedVersion)?.version)
  const description = pickDescription([text(record.summaryZh), text(record.summary)])
  return {
    slug,
    name: text(record.displayNameZh) ?? text(record.displayName) ?? slug,
    ...description === undefined ? {} : { description },
    ...version === undefined ? {} : { version },
    tags: [],
    installable: true,
    ...commonFields([record], source),
  }
}

/** SkillHub 的榜单端点。浏览时按这几个之一取列表。 */
export const SHOWCASE_SECTIONS = ['hot', 'featured', 'newest', 'recommended', 'trending', 'paid'] as const

/** 一个榜单名。 */
export type ShowcaseSection = typeof SHOWCASE_SECTIONS[number]

/**
 * 把调用方给的 `sort` 映射成 SkillHub 的榜单端点。
 *
 * 认不出来的值回落到 `hot` 而不是报错：`sort` 是个软偏好，
 * 为它失败一次市场浏览不值得。
 */
export function showcasePath(sort: string | undefined): string {
  const wanted = (sort ?? '').trim().toLowerCase()
  const section = SHOWCASE_SECTIONS.find(candidate => candidate === wanted) ?? 'hot'
  return `/api/v1/showcase/${section}`
}

/**
 * 从 `Content-Disposition` 里读出实际下载到的版本。
 *
 * 文件名形如 `find-skills-1.0.0.zip`。取它是因为不带 `version` 请求时，
 * 「拿到的是哪一版」只有响应头知道——记成 `latest` 的话，
 * 本地记录的版本永远对不上，更新检查也就无从谈起。
 */
export function versionFromDisposition(header: string | null): string | undefined {
  if (header === null) return undefined
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/iu.exec(header)
  const filename = match?.[1]
  if (filename === undefined) return undefined
  const version = /-(\d[^-]*?)\.(?:zip|tar|tgz|tar\.gz)$/iu.exec(filename)?.[1]
  return version === undefined || version === '' ? undefined : version
}

/**
 * 剥掉包内共同的顶层包裹目录。
 *
 * 只有「所有路径都带斜杠且首段一致」时才剥，否则 `scripts/run.py` 会被压平成
 * `run.py`，子目录结构就丢了。
 */
export function stripCommonPrefix(files: readonly PackageFile[]): PackageFile[] {
  const cleaned: PackageFile[] = []
  for (const file of files) {
    let path = file.path
    while (path.startsWith('./')) path = path.slice(2)
    path = path.replace(/^\/+/u, '')
    if (path !== '') cleaned.push({ path, content: file.content })
  }
  if (cleaned.length === 0) return []
  const firstSegments = new Set(cleaned.map(file => file.path.split('/', 1)[0]))
  const hasCommonPrefix = firstSegments.size === 1 && cleaned.every(file => file.path.includes('/'))
  if (!hasCommonPrefix) return cleaned
  return cleaned.map(file => ({ path: file.path.slice(file.path.indexOf('/') + 1), content: file.content }))
}

/** 一次成功下载的结果。 */
export interface DownloadedPackage {
  readonly files: PackageFile[]
  /** 实际拿到的版本；上游用 `Content-Disposition` 报它。 */
  readonly version: string
  /** 出包的那个源。 */
  readonly source: RegistrySource
  /** 用来定位这个包的发布者 handle；更新时要用同一个。 */
  readonly owner?: string
}

/**
 * 认出「这不是包，是一个指向 GitHub 的转交描述符」。
 *
 * ClawHub 对 GitHub 托管、扫描结论为 clean/suspicious 的技能不发自己的字节，
 * 而是回一段 JSON 描述符。照着当压缩包解只会得到一句「无法解析」，
 * 真正的原因（要去 GitHub 拿）就丢了。
 *
 * @returns 描述符里的仓库地址；不是描述符时 `undefined`。
 */
export function githubHandoff(response: Response, data: Buffer): string | undefined {
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('json')) return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(data.toString('utf8'))
  } catch {
    return undefined
  }
  const record = asRecord(parsed)
  if (record === undefined) return undefined
  const kind = text(record.kind) ?? text(record.type)
  if (kind !== undefined && !kind.includes('github')) return undefined
  return pickText([record, asRecord(record.source), asRecord(record.repository)], 'url', 'repositoryUrl', 'sourceUrl', 'html_url')
    ?? '它的 GitHub 仓库地址'
}

/** 缓存文件的封装。 */
interface CacheEnvelope {
  readonly savedAt: number
  readonly payload: unknown
}

/** ClawHub 兼容 registry 的聚合客户端。 */
/**
 * 跟市场要哪种语言的显示名。
 *
 * 标签的译名是在市场后台按 locale 维护的，取哪一份靠 `Accept-Language` 协商：
 * 不带这个头时 `/api/web/labels` 的 `displayName` 原样回 slug（筛选条上就是
 * 一排 `efficiencyimprovement`），带上就是后台里那份译名（「效率提升」）。
 * 内部代号尤其明显——`gh` 是「工业互联网」、`xj` 是「巡检」，光看 slug 猜不出来。
 *
 * 写死中文而不是跟着界面语言走：语言是浏览器那边的状态，这些请求却发生在插件
 * 这一侧，中间隔着一层 Remote，把它一路传下来要动协议描述表。不认这个头的源
 * （公网 ClawHub）多一个请求头也没有影响。
 */
const ACCEPT_LANGUAGE = 'zh-CN,zh;q=0.9,en;q=0.8'

/** 查不出命名空间时按这个走。SkillHub 的默认命名空间就是它。 */
const DEFAULT_NAMESPACE = 'global'

export class RegistryClient {
  private sources: readonly RegistrySource[]
  private readonly cacheDir: string
  private readonly timeoutMs: number
  private readonly resolveApiKey: ((ref: string) => Promise<string | undefined>) | undefined

  constructor(options: RegistryClientOptions) {
    this.sources = options.sources
    this.cacheDir = options.cacheDir
    this.timeoutMs = options.timeoutMs
    this.resolveApiKey = options.resolveApiKey
  }

  /** 已配置的源；空数组说明用户没配 registry，市场类动作要给出明确提示。 */
  listSources(): readonly RegistrySource[] {
    return this.sources
  }

  /**
   * 在运行时替换源列表。
   *
   * 用户在界面上加减市场源后立刻生效，不必重启——`RegistryClient` 的其余
   * 状态（缓存目录、超时、凭据解析）都不随源列表变，所以只换这一份。
   */
  setSources(sources: readonly RegistrySource[]): void {
    this.sources = sources
  }

  /**
   * 列出各源提供的标签。
   *
   * 尽力而为：走的是 SkillHub 的 `/api/web/labels`，不在 ClawHub 兼容契约里。
   * 取不到就是这个源没有标签，不是错误——界面据此决定要不要摆那条分组栏。
   *
   * @returns 各源的标签合起来；每条带着自己来自哪个源。
   */
  async listLabels(signal?: AbortSignal): Promise<RegistryLabel[]> {
    const labels: RegistryLabel[] = []
    for (const source of this.sources) {
      throwIfAborted(signal)
      const body = await this.getJson(source, '/api/web/labels', undefined, signal)
      for (const raw of asArray(asRecord(body)?.data)) {
        const record = asRecord(raw)
        const slug = text(record?.slug)
        if (record === undefined || slug === undefined) continue
        labels.push({
          slug,
          name: text(record.displayName) ?? slug,
          kind: text(record.type) ?? 'RECOMMENDED',
          registry: source.id,
          registryName: source.name,
        })
      }
    }
    return labels
  }

  /**
   * 跨所有源搜索。
   * @param keyword - 关键词；留空则走 `/skills` 浏览列表
   * @param page - 1 起的页码，内部转成 ClawHub 的 0 起
   * @param label - 按标签筛；只查 `label.registry` 那一个源，因为标签是各源
   *   自己的东西，拿一个源的标签去问另一个源，要么 404、要么被无视之后回一
   *   整页没筛过的结果——后者更糟，看着像筛过了。
   */
  async search(
    options: {
      keyword?: string
      page?: number
      pageSize?: number
      sort?: string
      label?: { slug: string; registry: string }
    },
    signal?: AbortSignal,
  ): Promise<RegistryPage> {
    if (this.sources.length === 0) {
      throw new WorkbenchError(
        '没有配置任何技能/插件 registry；在插件配置的 registries 里加一条 ClawHub 兼容源后重试',
        'WORKBENCH_NO_REGISTRY',
      )
    }
    const page = Math.max(options.page ?? 1, 1)
    const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100)
    const items: RegistryItem[] = []
    let fromCache = false
    const wanted = options.label === undefined
      ? this.sources
      : this.sources.filter(source => source.id === options.label?.registry)
    for (const source of wanted) {
      throwIfAborted(signal)
      const result = await this.searchOne(source, { ...options, page, pageSize }, signal)
      items.push(...result.items)
      if (result.fromCache) fromCache = true
    }
    return { items, fromCache }
  }

  /** 取一个条目的详情；`registryId` 留空时按源顺序找到第一个命中的。 */
  async get(slug: string, registryId: string | undefined, signal?: AbortSignal): Promise<RegistryItem | undefined> {
    for (const source of this.selectSources(registryId)) {
      throwIfAborted(signal)
      const body = await this.getJson(source, `/api/v1/skills/${encodeURIComponent(slug)}`, undefined, signal)
      if (body === undefined) continue
      const item = itemFromDetail(body, slug, source)
      if (item !== undefined) return item
    }
    return undefined
  }

  /**
   * 解析版本并下载包，返回归一后的文本文件列表。
   *
   * 包格式按 magic bytes 判断：SkillHub 的 download 返回 ZIP，
   * 部分 ClawHub 兼容实现返回 tar(.gz)，两种都要认。
   */
  async download(
    slug: string,
    version: string | undefined,
    registryId: string | undefined,
    signal?: AbortSignal,
    owner?: string,
  ): Promise<DownloadedPackage> {
    const errors: string[] = []
    for (const source of this.selectSources(registryId)) {
      throwIfAborted(signal)
      // 没给发布者就先去详情端点补一个。ClawHub 上同名 slug 归不同发布者是
      // 常态（热门技能几乎都撞名），不带 `ownerHandle` 请求下载会直接 409。
      const ownerHandle = owner ?? await this.ownerOf(source, slug, signal)
      const url = this.endpoint(source, '/api/v1/download', {
        slug,
        ...ownerHandle === undefined ? {} : { ownerHandle },
        // 不带 version 时下载端点自己给最新版。
        ...version === undefined ? {} : { version },
      })
      let response: Response
      try {
        response = await fetch(url, {
          headers: await this.headers(source),
          signal: signal ?? AbortSignal.timeout(this.timeoutMs),
        })
      } catch (error: unknown) {
        if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error)
        errors.push(`${source.name}: ${String(error)}`)
        continue
      }
      if (!response.ok) {
        const retry = await this.followBlindRedirect(source, response, slug, version, signal)
        if (retry === undefined) {
          errors.push(await this.describeFailure(source, response))
          continue
        }
        response = retry
      }
      const data = Buffer.from(await response.arrayBuffer())
      const handoff = githubHandoff(response, data)
      if (handoff !== undefined) {
        // ClawHub 对 GitHub 托管的技能不发字节，只发一个指向仓库的描述符。
        // 这里不跟着去 GitHub 拉——那是另一条信任边界，该由调用方按
        // 「从 URL 导入」明确走一遍。
        errors.push(
          `${source.name}: 这个技能由 ClawHub 转发到 GitHub，registry 本身没有包；`
          + `请改用「从链接导入」并给 ${handoff}`,
        )
        continue
      }
      const files = stripCommonPrefix(await extractPackage(data))
      if (files.length === 0) {
        errors.push(`${source.name}: 下载到的包是空的`)
        continue
      }
      // 下载端点用 Content-Disposition 报的是它实际给了哪一版，
      // 比调用方猜的准。
      const served = versionFromDisposition(response.headers.get('content-disposition'))
      return {
        files,
        version: served ?? version ?? 'latest',
        source,
        ...ownerHandle === undefined ? {} : { owner: ownerHandle },
      }
    }
    throw new WorkbenchError(
      `无法从任何 registry 下载 "${slug}"：${errors.join('；') || '没有可用的源'}`,
      'WORKBENCH_REGISTRY_DOWNLOAD_FAILED',
    )
  }

  /**
   * 查一个条目的最新版本号。
   *
   * 走详情端点而不是版本解析端点：两家的 resolve 路由都不好用
   * （ClawHub 的要 hash，SkillHub 的要 `@namespace/slug` 坐标），
   * 而详情端点两边都有，`latestVersion.version` 就在里面。
   */
  async latestVersion(
    source: RegistrySource,
    slug: string,
    signal?: AbortSignal,
  ): Promise<string | undefined> {
    const body = await this.detailBody(source, slug, signal)
    return text(asRecord(body?.latestVersion)?.version)
  }

  /**
   * 查一个条目的发布者 handle，用来消解 slug 歧义。
   *
   * 查不到不是错误：SkillHub 的 slug 不歧义，不带 `ownerHandle` 也能下。
   * 真歧义时下载端点会以 409 说清有哪些候选。
   */
  private async ownerOf(
    source: RegistrySource,
    slug: string,
    signal?: AbortSignal,
  ): Promise<string | undefined> {
    let body
    try {
      body = await this.detailBody(source, slug, signal)
    } catch (error: unknown) {
      // 歧义直接往上抛：详情端点的 409 是 JSON，里面有候选发布者列表，
      // 而下载端点的 409 只有一行英文说「加个 ownerHandle」。前者能照做，
      // 后者还得人自己去查有哪些候选。
      if (error instanceof WorkbenchError && error.code === 'WORKBENCH_REGISTRY_AMBIGUOUS') throw error
      // 其余失败不该让下载止步：让下载端点自己去报更具体的错。
      return undefined
    }
    if (body === undefined) return undefined
    return pickText(
      [asRecord(body.owner), asRecord(body.publisher), asRecord(body.skill), asRecord(body.namespace)],
      'ownerHandle',
      'handle',
    )
  }

  /** 详情端点的原始响应体。 */
  private async detailBody(
    source: RegistrySource,
    slug: string,
    signal?: AbortSignal,
  ): Promise<Json | undefined> {
    return asRecord(await this.getJson(source, `/api/v1/skills/${encodeURIComponent(slug)}`, undefined, signal))
  }

  private selectSources(registryId: string | undefined): readonly RegistrySource[] {
    if (registryId === undefined) return this.sources
    const source = this.sources.find(candidate => candidate.id === registryId)
    if (source === undefined) {
      const ids = this.sources.map(candidate => candidate.id).join(', ')
      throw new WorkbenchError(
        `registry "${registryId}" 未配置（已配置：${ids || '无'}）`,
        'WORKBENCH_REGISTRY_UNKNOWN',
      )
    }
    return [source]
  }

  private async searchOne(
    source: RegistrySource,
    options: {
      keyword?: string
      page: number
      pageSize: number
      sort?: string
      label?: { slug: string; registry: string }
    },
    signal?: AbortSignal,
  ): Promise<{ items: RegistryItem[]; fromCache: boolean }> {
    // ClawHub 的 page 从 0 开始，调用方给的是 1 起。
    const clawPage = options.page - 1
    // 按标签筛只有 `/api/web/skills` 会做，`/api/v1` 那两条路都不认这个参数。
    // 它的关键词参数叫 `q`，分页是 `page`（0 起）加 `size`。
    if (options.label !== undefined) {
      const body = await this.getJson(source, '/api/web/skills', {
        label: options.label.slug,
        page: clawPage,
        size: options.pageSize,
        ...options.keyword === undefined || options.keyword.trim() === ''
          ? {}
          : { q: options.keyword.trim() },
      }, signal)
      const entries = asArray(asRecord(asRecord(body)?.data)?.items)
      return {
        items: entries.map(raw => itemFromWebEntry(raw, source)).filter(isPresent),
        fromCache: this.lastServedFromCache,
      }
    }
    if (options.keyword !== undefined && options.keyword.trim() !== '') {
      const body = await this.getJson(
        source,
        '/api/v1/search',
        { q: options.keyword, page: clawPage, limit: options.pageSize },
        signal,
      )
      const results = asArray(asRecord(body)?.results)
      return {
        items: results.map(raw => itemFromSearchResult(raw, source)).filter(isPresent),
        fromCache: this.lastServedFromCache,
      }
    }
    const params: Record<string, string | number> = { page: clawPage, limit: options.pageSize }
    if ((source.flavor ?? 'clawhub') === 'skillhub') {
      // SkillHub 没有 `/api/v1/skills` 列表路由（返回 405），浏览走榜单。
      const body = await this.getJson(source, showcasePath(options.sort), params, signal)
      const entries = asArray(asRecord(body)?.skills)
      return {
        // showcase 的条目形状与 search 的一致，共用一条归一路径。
        items: entries.map(raw => itemFromSearchResult(raw, source)).filter(isPresent),
        fromCache: this.lastServedFromCache,
      }
    }
    if (options.sort !== undefined && options.sort !== '') params.sort = options.sort
    const body = await this.getJson(source, '/api/v1/skills', params, signal)
    const entries = asArray(asRecord(body)?.items)
    return {
      items: entries.map(raw => itemFromListEntry(raw, source)).filter(isPresent),
      fromCache: this.lastServedFromCache,
    }
  }

  /** 上一次 getJson 是否吃了缓存；只在同一次 searchOne 内读取，不跨调用共享。 */
  private lastServedFromCache = false

  /**
   * 把一个失败响应变成一句能用的话。
   *
   * ClawHub 的错误正文是纯文本（`Skill not found`），歧义 slug 那一条是 JSON。
   * 两种都读出来：只报「HTTP 404」的话，「这个技能不存在」和「registry 挂了」
   * 在界面上长得一模一样。
   */
  private async describeFailure(source: RegistrySource, response: Response): Promise<string> {
    const retryAfter = retryAfterSeconds(response)
    if (response.status === 429) {
      return `${source.name}: 请求过于频繁，${retryAfter === undefined ? '请稍后再试' : `请等 ${String(retryAfter)} 秒后再试`}`
    }
    let body = ''
    try {
      body = (await response.text()).trim()
    } catch {
      // 正文读不出来时退回状态码，不让这一步本身成为失败原因。
    }
    const detail = ambiguityMessage(body) ?? body
    if (detail === '') return `${source.name}: HTTP ${String(response.status)}`
    // 纯文本那版的歧义说明是英文的，且只说「加 ownerHandle」。补一句中文，
    // 指到市场列表里那个字段上——用户看得到的是那个，不是查询参数名。
    const hint = response.status === 409 && !detail.includes('；')
      ? '；这个 slug 有多个发布者，安装时把市场列表里的 owner 一并带上'
      : ''
    return `${source.name}: ${detail}${hint}`
  }

  /**
   * 下载端点回了个 3xx 却没给 `Location` 时，自己走一趟规范路径。
   *
   * `/api/v1/download?slug=` 在 SkillHub 上只是个跳板，它把请求 302 到
   * `/api/v1/skills/{namespace}/{slug}/download`。**slug 不是 ASCII 时那个
   * Location 头发不出来**——HTTP 头承载不了非 ASCII 字符，服务端那一头把它
   * 丢掉，于是客户端收到一个无处可去的 302，报出来就是一句「HTTP 302」。
   * 内网市场上确实有中文 slug 的技能（`移动集团恶意软件运维助手`），这条路上
   * 它们一个都装不了。
   *
   * 所以这里补一手：直接请求服务端本来要指过去的那个规范路径——路径段里的
   * 非 ASCII 由 percent-encoding 承载，没有响应头那个限制。命名空间从市场的
   * web 列表里查（那份 payload 带 `namespace`），查不到按 `global` 走，那是
   * SkillHub 的默认命名空间，也正是它在 ASCII slug 上跳过去的那一个。
   *
   * @param source - 当前这个源。
   * @param response - 那个没给 Location 的响应。
   * @param slug - 市场里的标识。
   * @param version - 版本；留空取最新。
   * @param signal - 取消信号。
   * @returns 重试拿到的响应；这次失败不属于这种情况、或者重试也没成时 undefined。
   */
  private async followBlindRedirect(
    source: RegistrySource,
    response: Response,
    slug: string,
    version: string | undefined,
    signal?: AbortSignal,
  ): Promise<Response | undefined> {
    // 带 Location 的 3xx 由 fetch 自己跟完了，这里看到的一定是跟不动的那种。
    if (response.status < 300 || response.status >= 400) return undefined
    if (response.headers.get('location') !== null) return undefined
    const namespace = await this.namespaceOf(source, slug, signal) ?? DEFAULT_NAMESPACE
    const url = this.endpoint(
      source,
      `/api/v1/skills/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}/download`,
      version === undefined ? undefined : { version },
    )
    try {
      const retry = await fetch(url, {
        headers: await this.headers(source),
        signal: signal ?? AbortSignal.timeout(this.timeoutMs),
      })
      return retry.ok ? retry : undefined
    } catch (error: unknown) {
      if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error)
      return undefined
    }
  }

  /**
   * 一个技能落在哪个命名空间下。
   *
   * 只有 `/api/web/skills` 那份 payload 带这个字段，`/api/v1` 的详情不带。
   * 查不到不是错误——调用方有默认值可用。
   */
  private async namespaceOf(
    source: RegistrySource,
    slug: string,
    signal?: AbortSignal,
  ): Promise<string | undefined> {
    let body
    try {
      body = await this.getJson(source, '/api/web/skills', { q: slug, page: 0, size: 20 }, signal)
    } catch (error: unknown) {
      // 没有 /api/web 的源（公网 ClawHub）在这里会 404。这只是一次可有可无的
      // 查询，不能让它把下载本身带崩——调用方有默认命名空间可用。
      if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error)
      return undefined
    }
    for (const raw of asArray(asRecord(asRecord(body)?.data)?.items)) {
      const record = asRecord(raw)
      if (text(record?.slug) === slug) return text(record?.namespace)
    }
    return undefined
  }

  /**
   * GET 一个裸 JSON。网络失败时回退本地缓存；缓存也没有才返回 undefined。
   *
   * 单个源不可用不该让整次市场查询失败——多源聚合的意义就在这里。
   */
  private async getJson(
    source: RegistrySource,
    path: string,
    params: Record<string, string | number> | undefined,
    signal?: AbortSignal,
  ): Promise<unknown> {
    this.lastServedFromCache = false
    const url = this.endpoint(source, path, params)
    const key = cacheKey(source.id, url)
    try {
      const response = await fetch(url, {
        headers: await this.headers(source),
        signal: signal ?? AbortSignal.timeout(this.timeoutMs),
      })
      if (!response.ok) {
        // 4xx 是「这个请求本身有问题」，不是「源不可达」，所以不回落缓存，
        // 直接把上游的说法交出去。5xx 与网络故障才走下面的缓存路径。
        const message = await this.describeFailure(source, response)
        if (response.status >= 400 && response.status < 500) {
          throw new WorkbenchError(message, registryErrorCode(response.status))
        }
        throw new Error(message)
      }
      const payload = await response.json() as unknown
      await this.writeCache(key, payload)
      return payload
    } catch (error: unknown) {
      if (signal?.aborted === true) throw abortedError(signal, error)
      if (error instanceof WorkbenchError) throw error
      const cached = await this.readCache(key)
      if (cached !== undefined) {
        this.lastServedFromCache = true
        return cached
      }
      return undefined
    }
  }

  private endpoint(source: RegistrySource, path: string, params?: Record<string, string | number>): string {
    const base = source.url.replace(/\/+$/u, '')
    if (params === undefined) return `${base}${path}`
    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) search.set(key, String(value))
    return `${base}${path}?${search.toString()}`
  }

  private async headers(source: RegistrySource): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'accept': 'application/json',
      'accept-language': ACCEPT_LANGUAGE,
      'user-agent': 'dsh-workbench/0.1.0',
    }
    if (source.apiKeyEnv !== undefined && this.resolveApiKey !== undefined) {
      const key = await this.resolveApiKey(source.apiKeyEnv)
      if (key !== undefined && key !== '') headers.authorization = `Bearer ${key}`
    }
    return headers
  }

  private async readCache(key: string): Promise<unknown> {
    try {
      const raw = await readFile(join(this.cacheDir, `${key}.json`), 'utf8')
      return (JSON.parse(raw) as CacheEnvelope).payload
    } catch {
      // 缓存缺失或损坏与「没有缓存」是同一个答案，调用方据此决定是否报错。
      return undefined
    }
  }

  private async writeCache(key: string, payload: unknown): Promise<void> {
    try {
      await mkdir(this.cacheDir, { recursive: true, mode: DIR_MODE })
      const envelope: CacheEnvelope = { savedAt: Date.now(), payload }
      await writeFile(join(this.cacheDir, `${key}.json`), JSON.stringify(envelope), { mode: FILE_MODE })
    } catch {
      // 缓存写失败不该让一次成功的查询变成失败。
    }
  }
}

/**
 * 从响应头里读出该等多久再重试。
 *
 * 三个头都可能出现：`Retry-After` 是延迟秒数，`RateLimit-Reset` 也是延迟秒数，
 * `X-RateLimit-Reset` 却是绝对的 Unix 秒。优先级按 ClawHub 文档的建议。
 */
export function retryAfterSeconds(response: Response): number | undefined {
  const direct = Number(response.headers.get('retry-after') ?? '')
  if (Number.isFinite(direct) && direct >= 0) return Math.ceil(direct)
  const delay = Number(response.headers.get('ratelimit-reset') ?? '')
  if (Number.isFinite(delay) && delay >= 0) return Math.ceil(delay)
  const absolute = Number(response.headers.get('x-ratelimit-reset') ?? '')
  if (!Number.isFinite(absolute) || absolute <= 0) return undefined
  return Math.max(0, Math.ceil(absolute - Date.now() / 1000))
}

/**
 * 把歧义 slug 的响应变成一句能照做的话。
 *
 * ClawHub 上不同发布者可以用同一个 slug，此时它回 409。纯文本那版的正文
 * 已经写清了要加 `ownerHandle`；JSON 那版给的是候选列表，得自己拼。
 * 两者都要落到「装哪一个，怎么写」这句话上，否则人只看到一个 409。
 */
export function ambiguityMessage(body: string): string | undefined {
  if (body === '') return undefined
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    // 纯文本那版本身就是完整的说明，原样用。
    return undefined
  }
  const record = asRecord(parsed)
  if (record === undefined) return undefined
  const message = text(record.message) ?? text(record.error)
  const matches = asArray(record.matches)
    .map(entry => text(asRecord(entry)?.ref) ?? text(asRecord(entry)?.ownerHandle))
    .filter(isPresent)
  if (matches.length === 0) return message
  return `${message ?? '这个 slug 有多个发布者'}：${matches.join('、')}`
    + '；安装时请指定发布者（registry 参数旁的 owner）'
}

/** 4xx 的机器可路由错误码。 */
function registryErrorCode(status: number): string {
  if (status === 404) return 'WORKBENCH_REGISTRY_NOT_FOUND'
  if (status === 409) return 'WORKBENCH_REGISTRY_AMBIGUOUS'
  if (status === 429) return 'WORKBENCH_REGISTRY_RATE_LIMITED'
  if (status === 401 || status === 403) return 'WORKBENCH_REGISTRY_UNAUTHORIZED'
  return 'WORKBENCH_REGISTRY_REJECTED'
}

function isPresent<T>(value: T | undefined): value is T {
  return value !== undefined
}

function cacheKey(sourceId: string, url: string): string {
  return `${sourceId.replace(/[^A-Za-z0-9_-]/gu, '_')}-${createHash('sha256').update(url).digest('hex').slice(0, 16)}`
}

function abortedError(signal: AbortSignal | undefined, cause: unknown): WorkbenchError {
  return new WorkbenchError('registry 请求已取消', 'WORKBENCH_ABORTED', {
    cause: signal?.aborted === true ? signal.reason : cause,
  })
}

/** 按 magic bytes 解包：`PK` 开头是 ZIP，其余按 tar(.gz) 处理。 */
export async function extractPackage(data: Buffer): Promise<PackageFile[]> {
  const { readZipFiles } = await import('./archive/zip.ts')
  const { readTarFiles } = await import('./archive/tar.ts')
  return data[0] === 0x50 && data[1] === 0x4b ? readZipFiles(data) : readTarFiles(data)
}
