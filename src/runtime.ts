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

  constructor(ctx: Context, config: WorkbenchRuntimeConfig = {}) {
    super(ctx, 'workbench')
    this.profileName = config.profile ?? DEFAULT_PROFILE
    this.paths = resolvePaths(this.profileName, config.dshHome)
    // 没配 registries 就用出厂那一条，而不是给一页空市场。
    const configured = config.registries ?? []
    this.registry = new RegistryClient({
      sources: configured.length > 0 ? configured : DEFAULT_REGISTRIES,
      cacheDir: this.paths.cache,
      timeoutMs: config.registryTimeoutMs ?? DEFAULT_REGISTRY_TIMEOUT_MS,
      ...config.resolveApiKey === undefined ? {} : { resolveApiKey: config.resolveApiKey },
    })
  }
}

export default WorkbenchRuntime
