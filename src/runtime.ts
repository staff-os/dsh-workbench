/**
 * 工作台能力缝的 Service Definition（`ctx.workbench`）。
 *
 * 这个 Service 只持有「所有域都要用的东西」——解析后的路径、registry 客户端、
 * 目标 profile 名。各域的读写逻辑是 `employee/` `knowledge/` `skill/` `mcp/`
 * `plugin/` 下的普通函数，接受 paths 作参数，这样单元测试不用起 Cordis 上下文。
 * @module @staff-os/dsh-workbench/runtime
 */

import { Context, Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { RegistryClient } from './registry.ts'
import { resolvePaths, type WorkbenchPaths } from './paths.ts'
import type { RegistrySource } from './types.ts'
import { readMarketConfig } from './skill/market-config.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    workbench: WorkbenchRuntime
  }
}

/** 默认作用的 profile；`dsh web` 的出厂 profile 就叫 web。 */
export const DEFAULT_PROFILE = 'web'

/** `ctx.workbench` 的配置。 */
export interface WorkbenchRuntimeConfig {
  /** MCP 与插件管理作用的 profile 名。 */
  readonly profile?: string
  /** 覆盖 `$DSH_HOME`；留空走环境解析。 */
  readonly dshHome?: string
  /**
   * registry 列表，技能市场与插件市场共用。
   * 留空用 {@link DEFAULT_REGISTRIES}；给了就整个替换。
   */
  readonly registries?: readonly RegistrySource[]
  /** 单次市场请求的超时预算（毫秒）。 */
  readonly registryTimeoutMs?: number
  /** 解析 registry 凭据；由 apply() 注入，接通凭据服务与启动环境。 */
  readonly resolveApiKey?: (ref: string) => Promise<string | undefined>
}

const RegistrySourceSchema = z.object({
  id: z.string().required(),
  name: z.string(),
  url: z.string().required(),
  flavor: z.union(['clawhub', 'skillhub'] as const).default('clawhub'),
  apiKeyEnv: z.string().role('credential-ref'),
})

/**
 * 出厂自带的市场源：ClawHub（clawhub.ai）。
 *
 * 内置而不是让人自己填，是因为「技能市场」这一页没有源就是一页空白，
 * 而它的只读接口是公开的、不要 token。想换或加源，在插件配置里给
 * `registries`——给了就整个替换，不会与这一条叠加。
 *
 * 配 `apiKeyEnv` 不是为了读：公开读接口匿名可用，但匿名配额按 IP 算
 * （读 3000/分），带 key 时按用户算（12000/分）。有 key 就用上。
 *
 * SkillHub（`api.skillhub.cn`，`flavor: 'skillhub'`）是国内的同类源，
 * 客户端已经认它的方言。等自建的那一版就位，在 `registries` 里加一条即可，
 * 不需要改代码：
 *
 * ```yaml
 * registries:
 *   - id: skillhub
 *     name: SkillHub
 *     url: https://api.skillhub.cn
 *     flavor: skillhub
 * ```
 */
export const DEFAULT_REGISTRIES: readonly RegistrySource[] = [
  {
    id: 'clawhub',
    name: 'ClawHub',
    url: 'https://clawhub.ai',
    flavor: 'clawhub',
    apiKeyEnv: 'CLAWHUB_API_KEY',
  },
]

/** 市场请求默认超时。 */
export const DEFAULT_REGISTRY_TIMEOUT_MS = 15_000

/**
 * 企业工作台服务。注册为 `ctx.workbench`。
 */
export class WorkbenchRuntime extends Service {
  static Config = z.object({
    profile: z.string().default(DEFAULT_PROFILE),
    dshHome: z.string(),
    registries: z.array(RegistrySourceSchema).default([]),
    registryTimeoutMs: z.number().step(1).min(1).default(DEFAULT_REGISTRY_TIMEOUT_MS),
  })

  /** 目标 profile 名。 */
  readonly profileName: string

  /** 解析后的目录布局。 */
  readonly paths: WorkbenchPaths

  /** 市场客户端，技能与插件共用。 */
  readonly registry: RegistryClient

  /** 静态配置里的源；启动时读，运行时不改。 */
  private readonly staticSources: readonly RegistrySource[]

  /** 凭据解析函数；动态源也要用它。 */
  private readonly resolveApiKey?: (ref: string) => Promise<string | undefined>

  /** 单次市场请求的超时预算。 */
  private readonly registryTimeoutMs: number

  constructor(ctx: Context, config: WorkbenchRuntimeConfig = {}) {
    super(ctx, 'workbench')
    this.profileName = config.profile ?? DEFAULT_PROFILE
    this.paths = resolvePaths(this.profileName, config.dshHome)
    // 没配 registries 就用出厂那一条，而不是给一页空市场。
    const configured = config.registries ?? []
    this.staticSources = configured.length > 0 ? configured : DEFAULT_REGISTRIES
    this.registryTimeoutMs = config.registryTimeoutMs ?? DEFAULT_REGISTRY_TIMEOUT_MS
    if (config.resolveApiKey !== undefined) this.resolveApiKey = config.resolveApiKey
    this.registry = new RegistryClient({
      sources: this.staticSources,
      cacheDir: this.paths.cache,
      timeoutMs: this.registryTimeoutMs,
      ...config.resolveApiKey === undefined ? {} : { resolveApiKey: config.resolveApiKey },
    })
  }

  /**
   * 当前生效的市场源列表。
   *
   * 优先读运行时配置文件（用户在界面上加减的那些）；文件不存在或为空时回退
   * 到静态配置（Cordis 配置里的 `registries`，或出厂那一条）。这样用户在界面
   * 上配的源立刻生效，不必重启。
   */
  async loadRegistrySources(): Promise<readonly RegistrySource[]> {
    const dynamic = await readMarketConfig(this.paths.workbench)
    return dynamic.length > 0 ? dynamic : this.staticSources
  }

  /**
   * 把一组动态源注册进 `RegistryClient`。
   *
   * `RegistryClient` 的源列表是构造时定的，这里在运行时覆盖它——用户的配置
   * 改完要立刻生效，不能等重启。
   */
  async applyRegistrySources(sources: readonly RegistrySource[]): Promise<void> {
 this.registry.setSources(sources)
  }
}


export default WorkbenchRuntime
