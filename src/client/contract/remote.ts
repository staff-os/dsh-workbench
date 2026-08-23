/**
 * 浏览器侧看 Remote 通道的那一面。
 *
 * 这里的接口是**结构化重述**，不是从 `@deepseek-ai/dsh-api-remotes` 引进来的。
 * 两个原因：那个包是 DSH 自己那套 Remote 的选定装配，第三方插件挂自己的
 * contribution 不经过它；而客户端产物的模块表只认六个说明符（见
 * `tsdown.client.ts`），多 import 一个包在运行时就是 require 抛错。
 *
 * `ctx.remote` 是运行时已经在那儿的服务，用 `ctx.get('remote')` 取，按这里
 * 的形状用。形状与 `typert-schemas.ts` 的 descriptor 表必须对齐——那张表是
 * 手写的，这份接口也是，两边都没有编译期约束，改一处要改两处。
 *
 * @module @staff-os/dsh-workbench/client/contract/remote
 */

/** Remote 调用失败时的载荷。 */
export interface RemoteFailure {
  readonly code: string
  readonly message: string
  readonly details: object
}

/**
 * 每个 Remote 方法的返回。
 *
 * 载体本身的故障也折进 error 分支，所以调用方不需要再包一层 try——只有装配
 * 层面的错（方法没挂上、参数个数不对）才会 reject。
 */
export type RemoteResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RemoteFailure }

/**
 * 一个员工装了什么，读自它的 agent 组合文件。
 *
 * 一个员工是**人设 + 工具 + 技能 + MCP + 知识库**凑成的智能体模板，这几个
 * 数字就是列表上区分两个模板的依据。
 */
export interface EmployeeCapabilities {
  /** 工具插件行数。**不等于工具名个数**：一行可能注册好几个工具。 */
  readonly tools: number
  /** 技能能力行数。 */
  readonly skills: number
  /** 组合文件里的 MCP 行数。 */
  readonly mcpServers: number
  /** 有没有自己的人设；没有就用部署的默认人设。 */
  readonly hasPersona: boolean
  /** 人设的头一句。 */
  readonly personaLine?: string
  /** 人设是不是完整系统提示。 */
  readonly personaComplete: boolean
  /** 是否读工作区的 AGENTS.md。 */
  readonly agentInstructions: boolean
  /** 组合文件的条目总数。 */
  readonly entries: number
  /** 组合文件读不动时的原因。 */
  readonly error?: string
}

/** 组合文件里的一行。 */
export interface CompositionEntry {
  readonly id?: string
  /** 插件包名，原样。 */
  readonly name: string
  /** 去掉约定前缀后的短名。 */
  readonly label: string
  readonly kind: 'persona' | 'instructions' | 'tool' | 'skill' | 'mcp' | 'other'
  /** `true` 是写死禁用；字符串是 `!!js` 表达式原文，禁不禁用要看运行环境。 */
  readonly disabled?: true | string
  /** 套在哪几层 group 里，自外向内。 */
  readonly group: readonly string[]
}

/** 一份组合文件解析出来的组成。 */
export interface CompositionSummary {
  readonly persona?: {
    readonly text: string
    readonly complete: boolean
    readonly includeRuntimeContext: boolean
  }
  readonly agentInstructions: boolean
  readonly tools: readonly CompositionEntry[]
  readonly skills: readonly CompositionEntry[]
  readonly mcpServers: readonly CompositionEntry[]
  readonly others: readonly CompositionEntry[]
  readonly total: number
  readonly error?: string
}

/** `read` 的返回：组合文件原文加解析结果。 */
export interface EmployeeComposition {
  readonly source: string
  readonly composition: CompositionSummary
}

/** 一个员工的投影；与 Node 半边的 `EmployeeView` 对应。 */
export interface EmployeeView {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly order?: number
  /** `user` 之外的都是随部署发布的，改不了也删不掉。 */
  readonly trust: string
  readonly isDefault: boolean
  /** 这个员工为什么挂不起来；能挂时不出现。 */
  readonly broken?: string
  readonly persona?: string
  readonly knowledgeBases: readonly string[]
  readonly skills: readonly string[]
  readonly mcpServers: readonly string[]
  /** 这个模板由什么组成，读自它的 agent 组合文件。 */
  readonly capabilities: EmployeeCapabilities
}

/** 一条指向不存在资源的绑定。 */
export interface UnknownBinding {
  readonly kind: string
  readonly id: string
}

/** 一次列表读取的结果。 */
export interface EmployeeSnapshot {
  readonly employees: readonly EmployeeView[]
  readonly defaultId: string
  readonly knowledgeBases: readonly string[]
  readonly skills: readonly string[]
  readonly mcpServers: readonly string[]
  readonly unknownBindings: readonly UnknownBinding[]
}

/** 一次写操作的结果。 */
export interface EmployeeMutation {
  readonly employee?: EmployeeView
  readonly snapshot: EmployeeSnapshot
}

/** 绑定的改法。 */
export type BindMode = 'replace' | 'add' | 'remove'

/** 改展示元数据的入参。 */
export interface EmployeeMetadataInput {
  readonly name?: string
  readonly description?: string
  readonly order?: number
}

/** 改绑定的入参。 */
export interface EmployeeBindingInput {
  readonly persona?: string
  readonly knowledgeBases?: readonly string[]
  readonly skills?: readonly string[]
  readonly mcpServers?: readonly string[]
  readonly mode?: BindMode
}

/** 员工域的 Remote 命名空间。 */
export interface EmployeeRemote {
  list: () => Promise<RemoteResult<EmployeeSnapshot>>
  create: (id: string, from?: string, name?: string) => Promise<RemoteResult<EmployeeMutation>>
  update: (id: string, metadata: EmployeeMetadataInput) => Promise<RemoteResult<EmployeeMutation>>
  bind: (id: string, bindings: EmployeeBindingInput) => Promise<RemoteResult<EmployeeMutation>>
  /** 不叫 `remove`：那个名字被命名空间 Service 的原型占着。 */
  delete: (id: string) => Promise<RemoteResult<EmployeeMutation>>
  read: (id: string) => Promise<RemoteResult<EmployeeComposition>>
}

/** 一个技能的投影；与 Node 半边的 `SkillView` 对应。 */
export interface SkillView {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  /** 来源标识，例如 `user-dsh`、`project`、`bundled`。 */
  readonly source: string
  /** 提供方插件。 */
  readonly provider?: string
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
  /** 本插件改不改得动它：只有用户级目录里那些才改得动。 */
  readonly managed: boolean
  /** 盘上有这一份，但生效的是同名的另一份——改它不会有任何效果。 */
  readonly shadowed: boolean
  readonly path?: string
  readonly files?: readonly string[]
}

/** 一个市场条目的投影。 */
export interface MarketView {
  readonly slug: string
  readonly name: string
  readonly description?: string
  readonly version?: string
  readonly tags: readonly string[]
  readonly category?: string
  readonly installCount: number
  readonly avgRating: number
  /** 累计下载量；市场列表主要按它体现热度。 */
  readonly downloadCount: number
  /** 上游仓库 star 数。 */
  readonly stars: number
  /** 发布者 handle。安装时要带上它消解同名 slug。 */
  readonly owner?: string
  readonly iconUrl?: string
  readonly homepage?: string
  /** 平台安全审核结论；要显示在安装按钮旁边。 */
  readonly securityStatus?: string
  /** 托管方；`clawhub` 之外的值说明这是别家目录的镜像条目。 */
  readonly installKind?: string
  /** 能不能从这个源直接装。false 时安装按钮该是禁用的。 */
  readonly installable: boolean
  readonly registry: string
  readonly registryName: string
}

/** 一个被 DSH 拒收的盘上条目。 */
export interface RejectedView {
  readonly hint: string
  readonly path: string
  /** DSH 丢弃它的理由，照原样显示。 */
  readonly reason: string
}

/** 一个已配置的市场源。 */
export interface RegistryInfo {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly flavor: string
  /** 凭据引用名；只存引用，不存明文。回传也是安全的：它不是 key 本身。 */
  readonly apiKeyEnv?: string
}

/** 市场配置写操作的入参——一条源的编辑表单。 */
export interface RegistrySourceInput {
  /** 源标识；空字符串会被过滤掉。 */
  readonly id: string
  /** 展示名；留空时用 id 顶上。 */
  readonly name: string
  /** 服务根地址。 */
  readonly url: string
  /** 协议方言；留空按 clawhub 处理。 */
  readonly flavor?: string
  /** 凭据引用名；只存引用，不存明文。 */
  readonly apiKeyEnv?: string
}

/** 写完之后那份技能的真实处境；回读 `ctx.skills` 得来，不是预测。 */
export interface ActivationState {
  readonly active: boolean
  readonly mine: boolean
  readonly winnerSource?: string
  readonly winnerPath?: string
  /** 一句可以直接显示的结论。 */
  readonly summary: string
  /**
   * 这句结论说的是这一份技能，还是整个部署。
   *
   * 部署级的话（「宿主层不扫本地技能根」一类）对每个技能都成立，只在写操作
   * 之后的提示里说一次，不摆在详情页上。
   */
  readonly scope: 'skill' | 'deployment'
}

/** 一个已装技能的更新状态。 */
export interface UpdateStatus {
  readonly name: string
  readonly installed: string
  readonly latest?: string
  readonly outdated: boolean
  readonly origin: {
    readonly name: string
    readonly registry: string
    readonly slug: string
    readonly owner?: string
    readonly version: string
    readonly installedAt: number
  }
  readonly error?: string
}

/** 一次技能列表读取的结果。 */
export interface SkillSnapshot {
  readonly skills: readonly SkillView[]
  /** 盘上有、但 DSH 会丢弃的条目。 */
  readonly rejected: readonly RejectedView[]
  readonly registries: readonly RegistryInfo[]
  /** DSH 的技能服务在不在。 */
  readonly hasRegistry: boolean
}

/** 一次技能写操作的结果。 */
export interface SkillMutation {
  readonly skill?: SkillView
  /** 给人看的结果说明。 */
  readonly message: string
  /** 回读得到的生效结论；删除时不出现。 */
  readonly activation?: ActivationState
  readonly snapshot: SkillSnapshot
}

/** 技能目录或包里的一个文件。 */
export interface SkillFileEntry {
  /** 相对技能目录（或包根）的路径，正斜杠分隔。 */
  readonly path: string
  /** 字节数。 */
  readonly size: number
}

/** 一个技能的正文。 */
export interface SkillContent {
  readonly skill: SkillView
  readonly content: string
  /**
   * 技能目录里的全部文件，**含 SKILL.md**，带体积。
   *
   * 与 `SkillView.files` 不是一回事：那一份是清单用的「附带文件」名字，不含
   * SKILL.md 也没有体积。详情页的文件树用这一份。
   */
  readonly files: readonly SkillFileEntry[]
  /** 盘上有这份、但生效的是别处那份时的说明。 */
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
 * 的这一批结果里数；标签是市场自己的目录，按它筛是服务端做的，覆盖整个市场。
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

/** 一个文件的内容。 */
export interface FileContent {
  readonly path: string
  /** 完整体积，不是这次送了多少。 */
  readonly size: number
  /** 文本内容；二进制文件没有这一项。 */
  readonly text?: string
  /** 二进制文件：字节不往浏览器送，只报体积。 */
  readonly binary: boolean
  /** 太大，`text` 只是开头那一段。 */
  readonly truncated: boolean
}

/** 一个市场条目的包内容：装上去会得到什么。 */
export interface MarketPreview {
  /** 包内全部文件，SKILL.md 在最前。 */
  readonly files: readonly SkillFileEntry[]
  /** 包里 SKILL.md 的正文，与本机详情里那份是同一种东西。 */
  readonly content?: string
  /** 取不到内容时的说明；这不是错误，照实显示即可。 */
  readonly note?: string
}

/** 一条静态扫描命中。 */
export interface ScanFinding {
  /** 规则 id，与 SkillHub 那边的审计记录一致。 */
  readonly rule: string
  /** `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` / `INFO`。 */
  readonly severity: string
  /** kebab-case 的分类标识。 */
  readonly category: string
  /** 这条规则在说什么。 */
  readonly description: string
  /** 包内相对路径。 */
  readonly path: string
  /** 1 起的行号；跨行匹配定位不到某一行时没有这一项。 */
  readonly line?: number
  /** 命中的这一段是从藏起来的文本里解出来的。 */
  readonly recovery?: string
}

/** 一个检测面的结论。 */
export interface ScanCategory {
  /** kebab-case 的分类标识。 */
  readonly id: string
  /** 这一面上命中了几条。 */
  readonly hits: number
  /** 这一面上最高的那一档；没命中时没有这一项。 */
  readonly severity?: string
}

/** 一次静态扫描的结果。 */
export interface ScanReport {
  readonly findings: readonly ScanFinding[]
  /** 实际扫了几个文件。 */
  readonly scanned: number
  /** 跳过几个：二进制、不认识的扩展名、或者太大。 */
  readonly skipped: number
  /** 这一包里最高的那一档严重度；一条都没命中时没有这一项。 */
  readonly severity?: string
  /** 规则命中评分，0–100。按命中的规则**种类**扣分，不按次数。 */
  readonly score: number
  /** 八个检测面各自的结论，顺序固定，没命中的也在里面。 */
  readonly categories: readonly ScanCategory[]
}

/** 技能域的 Remote 命名空间。 */
export interface SkillRemote {
  list: () => Promise<RemoteResult<SkillSnapshot>>
  read: (name: string) => Promise<RemoteResult<SkillContent>>
  /** 读技能目录里某一个文件，给文件树的预览用。 */
  readFile: (name: string, path: string) => Promise<RemoteResult<FileContent>>
  /** 静态扫一遍盘上这一份技能。 */
  scan: (name: string) => Promise<RemoteResult<ScanReport>>
  create: (input: SkillInput) => Promise<RemoteResult<SkillMutation>>
  visibility: (name: string, visibility: SkillVisibilityInput) => Promise<RemoteResult<SkillMutation>>
  /** 不叫 `remove`：那个名字被命名空间 Service 的原型占着。 */
  delete: (name: string) => Promise<RemoteResult<SkillMutation>>
  marketSearch: (
    keyword?: string, page?: number, sort?: string, label?: string, labelRegistry?: string,
  ) => Promise<RemoteResult<MarketPage>>
  /** 各市场源提供的标签；不提供的源不出现在结果里。 */
  marketLabels: () => Promise<RemoteResult<readonly MarketLabel[]>>
  marketGet: (slug: string, registry?: string) => Promise<RemoteResult<MarketView>>
  /** 读一个市场条目的包内容；取不到时给的是带 `note` 的空清单，不是失败。 */
  marketPreview: (
    slug: string, version?: string, registry?: string, owner?: string,
  ) => Promise<RemoteResult<MarketPreview>>
  /** 读市场条目包里某一个文件。 */
  marketFile: (
    slug: string, version?: string, registry?: string, owner?: string, path?: string,
  ) => Promise<RemoteResult<FileContent>>
  /** 静态扫一遍市场条目的包；用的是预览已经取回来的那一份。 */
  marketScan: (
    slug: string, version?: string, registry?: string, owner?: string,
  ) => Promise<RemoteResult<ScanReport>>
  marketInstall: (
    slug: string, version?: string, registry?: string, overwrite?: boolean, owner?: string,
  ) => Promise<RemoteResult<SkillMutation>>
  /** 装一个用户上传的压缩包；`contentBase64` 是包字节。 */
  importPackage: (
    fileName: string, contentBase64: string, overwrite?: boolean, name?: string,
  ) => Promise<RemoteResult<SkillMutation>>
  marketUpdate: (
    name: string, slug?: string, registry?: string, owner?: string,
  ) => Promise<RemoteResult<SkillMutation>>
  /** 把所有有新版本的已装技能一次更新完。 */
  marketUpdateAll: () => Promise<RemoteResult<SkillMutation>>
  updates: () => Promise<RemoteResult<readonly UpdateStatus[]>>
  /** 读出当前生效的市场配置。 */
  marketConfigRead: () => Promise<RemoteResult<readonly RegistryInfo[]>>
  /** 写入市场配置；整份替换，写完立刻生效。 */
  marketConfigWrite: (sources: readonly RegistrySourceInput[]) => Promise<RemoteResult<readonly RegistryInfo[]>>
}

/** `ctx.remote` 里本包用到的那部分。 */
export interface WorkbenchRemote {
  /** 挂一个 contribution，返回撤销它的 disposer。 */
  $mount: (contribution: unknown) => Promise<() => Promise<void>>
  /** 本包挂上去之后才存在。 */
  workbenchEmployee?: EmployeeRemote
  /** 本包挂上去之后才存在。 */
  workbenchSkill?: SkillRemote
}
