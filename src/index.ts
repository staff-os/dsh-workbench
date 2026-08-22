/**
 * `@staff-os/dsh-workbench`：把企业工作台能力移植到
 * DeepSeek Harness 上，装上就能用——**不依赖外部后端，也不依赖数据库**，
 * 状态全部落在 `$DSH_HOME` 下的本地文件里。
 *
 * 覆盖四块能力，外加一个市场对接：
 *
 * - **AI 员工**：DSH 原生 agent preset 就是「一个可挂载的 AI 员工」，直接复用
 * - **知识库**：本地目录 + 分块 + 关键词检索
 * - **技能**：本地技能读写，以及 ClawHub 兼容技能市场
 * - **MCP**：profile `cordis.patch.yml` 里的 `@deepseek-ai/dsh-mcp-client` 行
 * - **插件**：DSH 插件的装卸与插件市场
 *
 * 三种能力缝角色都在这个包里：**Service Definition** 是注册为 `ctx.workbench`
 * 的 {@link WorkbenchRuntime}；**Provider** 是各域下的本地文件实现；
 * **Consumer** 是五个面向模型的工具。
 *
 * @module @staff-os/dsh-workbench
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type {} from '@deepseek-ai/dsh-tools'
import { DEFAULT_PROFILE, DEFAULT_REGISTRY_TIMEOUT_MS, WorkbenchRuntime } from './runtime.ts'
import { applyMcpTool, DEFAULT_MCP_TOOL_TIMEOUT_MS } from './mcp/tool.ts'
import { applySkillTool, DEFAULT_SKILL_TOOL_TIMEOUT_MS } from './skill/tool.ts'
import { applyKnowledgeTool, DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS } from './knowledge/tool.ts'
import { applyEmployeeTool, DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS } from './employee/tool.ts'
import { WorkbenchEmployeeGateway } from './employee/remote.ts'
import { WorkbenchSkillGateway } from './skill/remote.ts'
import { SkillActivation } from './skill/activation.ts'
import {
  applyPluginTool,
  DEFAULT_DSH_EXECUTABLE,
  DEFAULT_PLUGIN_TOOL_TIMEOUT_MS,
} from './plugin/tool.ts'
import type { RegistrySource } from './types.ts'

export { CONFIRM_REQUIRED, requireConfirm, WorkbenchError } from './types.ts'
export { packageFileBytes, packageFileText } from './types.ts'
export type {
  PackageFile,
  RegistryFlavor,
  RegistryItem,
  RegistryPage,
  RegistrySource,
} from './types.ts'
export { DEFAULT_PROFILE, DEFAULT_REGISTRY_TIMEOUT_MS, WorkbenchRuntime } from './runtime.ts'
export type { WorkbenchRuntimeConfig } from './runtime.ts'
export { resolvePaths } from './paths.ts'
export type { WorkbenchPaths } from './paths.ts'
export {
  ambiguityMessage,
  collectTopics,
  extractPackage,
  githubHandoff,
  itemFromDetail,
  itemFromListEntry,
  itemFromSearchResult,
  itemFromWebEntry,
  normalizeTags,
  RegistryClient,
  retryAfterSeconds,
  SHOWCASE_SECTIONS,
  showcasePath,
  stripCommonPrefix,
  summarizeModeration,
  summarizeSecurity,
  versionFromDisposition,
} from './registry.ts'
export type { DownloadedPackage, RegistryLabel, ShowcaseSection } from './registry.ts'
export type { RegistryClientOptions } from './registry.ts'
export {
  addServer,
  listServers,
  loadPatch,
  MCP_PLUGIN_NAME,
  removeServer,
  savePatch,
  setServerDisabled,
  updateServer,
} from './mcp/patch.ts'
export type { McpServer, McpServerInput, McpServerPatch, McpTransport } from './mcp/patch.ts'
export { convertVariables, parseMcpServersJson, sanitizeServerName } from './mcp/import.ts'
export { applyMcpTool, DEFAULT_MCP_TOOL_TIMEOUT_MS } from './mcp/tool.ts'
export {
  assertSkillName,
  createLocalSkill,
  frontmatterBoolean,
  installSkillFiles,
  listLocalSkills,
  listSkillFiles,
  parseSkillFrontmatter,
  readLocalSkill,
  removeLocalSkill,
  scanLocalSkills,
  setSkillVisibility,
  SKILL_FILE,
  SKILL_NAME_PATTERN,
  splitFrontmatter,
} from './skill/local.ts'
export type {
  InstallLocation,
  InstallResult,
  LocalSkill,
  LocalSkillInput,
  LocalSkillScan,
  ParsedSkillFile,
  RejectedSkill,
  SkillFileEntry,
  SkillParseResult,
} from './skill/local.ts'
export {
  classifyImportSource,
  decodeUploadedPackage,
  fallbackSkillName,
  githubArchiveUrl,
  MAX_UPLOAD_BYTES,
  readPackageBytes,
} from './skill/source.ts'
export type { ImportOrigin } from './skill/source.ts'
export { applySkillTool, DEFAULT_SKILL_TOOL_TIMEOUT_MS } from './skill/tool.ts'
export { detailNote, SkillActivation, SIGNAL_PROVIDER } from './skill/activation.ts'
export type { ActivationState } from './skill/activation.ts'
export { describePackage, findSkillsInPackage, selectSkillFromPackage } from './skill/package.ts'
export {
  forgetInstall,
  isNewerVersion,
  LEDGER_FILE,
  ledgerPath,
  readLedger,
  recordInstall,
} from './skill/ledger.ts'
export type { SkillOrigin, UpdateStatus } from './skill/ledger.ts'
export type { SkillInPackage } from './skill/package.ts'
export {
  chunkText,
  DEFAULT_CHUNK_OVERLAP,
  DEFAULT_CHUNK_SIZE,
  normalizeChunkOptions,
} from './knowledge/chunk.ts'
export type { ChunkOptions, TextChunk } from './knowledge/chunk.ts'
export { idf, scoreChunks, termFrequencies, tokenize } from './knowledge/search.ts'
export type { CorpusStats, ScorableChunk, ScoredChunk } from './knowledge/search.ts'
export {
  addDocument,
  createKnowledgeBase,
  listDocuments,
  listKnowledgeBases,
  MAX_DOCUMENT_BYTES,
  readDocumentFile,
  readIndex,
  readKnowledgeBase,
  rebuildIndex,
  removeDocument,
  removeKnowledgeBase,
  searchKnowledge,
  slugify,
  updateKnowledgeBase,
} from './knowledge/store.ts'
export type {
  DocumentInput,
  KnowledgeBase,
  KnowledgeBaseInput,
  KnowledgeBasePatch,
  KnowledgeDocument,
  KnowledgeIndex,
  SearchHit,
  SearchResult,
} from './knowledge/store.ts'
export { applyKnowledgeTool, DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS } from './knowledge/tool.ts'
export {
  applyBinding,
  assertEmployeeId,
  BINDING_KINDS,
  EMPLOYEE_FILE,
  emptyBindings,
  readBindings,
  writeBindings,
  writeMetadata,
} from './employee/store.ts'
export type { BindMode, BindingKind, EmployeeBindings } from './employee/store.ts'
export { applyEmployeeTool, DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS, formatEmployeeOutput, parseBindMode, parseEmployeeAction } from './employee/tool.ts'
export { WorkbenchEmployeeGateway } from './employee/remote.ts'
export type {
  EmployeeBindingInput,
  EmployeeMetadataInput,
  EmployeeMutation,
  EmployeeSnapshot,
} from './employee/remote.ts'
export {
  fileContentOf,
  MAX_PREVIEW_BYTES,
  readFileContent,
  resolveInsideSkill,
} from './skill/file.ts'
export type { FileContent } from './skill/file.ts'
export {
  categoriesOf,
  CHARSET_SMUGGLING_RULE,
  highestSeverity,
  isLikelyText,
  isScannableTextFile,
  MAX_SCAN_BYTES,
  recoverMojibake,
  RISK_RULES,
  scanFiles,
  SCAN_CATEGORIES,
  scoreOf,
  SEVERITY_ORDER,
} from './skill/scan.ts'
export type {
  Recovered,
  RiskRule,
  RiskSeverity,
  ScanCategory,
  ScanFinding,
  ScanInput,
  ScanReport,
} from './skill/scan.ts'
export { WorkbenchSkillGateway } from './skill/remote.ts'
export type {
  MarketLabel,
  MarketPage,
  MarketPreview,
  RegistryInfo,
  SkillContent,
  SkillInput,
  SkillMutation,
  SkillSnapshot,
  SkillVisibilityInput,
} from './skill/remote.ts'
export {
  collectSkills,
  projectLocal,
  projectMarket,
  projectRejected,
  projectWinner,
  winnerIsLocal,
} from './skill/view.ts'
export type { MarketView, RejectedView, SkillView } from './skill/view.ts'
export { findUnknown, listEmployees, presetDirOf, project, readInventory } from './employee/view.ts'
export { emptyComposition, parseComposition } from './employee/composition.ts'
export type { CompositionEntry, CompositionSummary, EntryKind, PersonaSummary } from './employee/composition.ts'
export type { EmployeeCapabilities, EmployeeView, Inventory, UnknownBinding } from './employee/view.ts'
export {
  assertSafeSpec,
  inspectLocalSpec,
  readProfilePlugins,
  resolveExecutable,
  runCommand,
  runDshPlugin,
} from './plugin/ops.ts'
export type { CommandResult, LocalSpecInfo, PluginEntry, ProfilePlugins } from './plugin/ops.ts'
export {
  applyPluginTool,
  DEFAULT_DSH_EXECUTABLE,
  DEFAULT_PLUGIN_TOOL_TIMEOUT_MS,
} from './plugin/tool.ts'
export {
  assertSafeEntryPath,
  isSafeEntryPath,
  MAX_ENTRIES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  normalizeEntryPath,
  UNSAFE_ARCHIVE,
} from './archive/guard.ts'

/** 加载器诊断里用的 Cordis 插件名。 */
export const name = 'workbench'

/** 本插件依赖的服务。 */
export const inject = ['tools', 'systemPrompt']

/** 插件配置。 */
export interface Config {
  /** MCP 与插件管理作用的 profile 名，默认 `web`。 */
  profile?: string
  /** 覆盖 `$DSH_HOME`；留空走环境解析。 */
  dshHome?: string
  /** ClawHub 兼容 registry 列表，技能市场与插件市场共用。 */
  registries?: RegistrySource[]
  /** 单次市场请求的超时预算（毫秒）。 */
  registryTimeoutMs?: number
  /** 单次工作台写操作的超时预算（毫秒）。 */
  toolTimeoutMs?: number
  /** 含下载的工作台操作的超时预算（毫秒）；技能导入与市场安装用它。 */
  networkToolTimeoutMs?: number
  /** DSH 命令行的可执行文件名；插件装卸转发给它。 */
  dshExecutable?: string
  /** 插件装卸的超时预算（毫秒）；一次 pnpm 安装可能要几十秒。 */
  pluginToolTimeoutMs?: number
}

const RegistrySourceSchema = z.object({
  id: z.string().required(),
  name: z.string(),
  url: z.string().required(),
  // 只存**引用名**不存值：真正的 key 从凭据服务或启动环境取，
  // 免得 apiKey 跟着 patch 文件一起被提交进仓库。
  apiKeyEnv: z.string().role('credential-ref'),
})

export const Config: z<Config> = z.object({
  profile: z.string().default(DEFAULT_PROFILE),
  dshHome: z.string(),
  registries: z.array(RegistrySourceSchema).default([]),
  registryTimeoutMs: z.number().step(1).min(1).default(DEFAULT_REGISTRY_TIMEOUT_MS),
  toolTimeoutMs: z.number().step(1).min(1).default(DEFAULT_MCP_TOOL_TIMEOUT_MS),
  networkToolTimeoutMs: z.number().step(1).min(1).default(DEFAULT_SKILL_TOOL_TIMEOUT_MS),
  dshExecutable: z.string().default(DEFAULT_DSH_EXECUTABLE),
  pluginToolTimeoutMs: z.number().step(1).min(1).default(DEFAULT_PLUGIN_TOOL_TIMEOUT_MS),
})

/**
 * 解析一个 registry 的 apiKey：优先凭据服务，回退启动环境。
 *
 * 与 `dsh-ragflow` 同构——凭据服务不一定装了，此时降级到进程启动环境，
 * 而不是让整个市场功能失效。
 */
function makeApiKeyResolver(ctx: Context): (ref: string) => Promise<string | undefined> {
  return async (ref: string) => {
    const credential = credentialRef(ref)
    const credentials = ctx.get('credentials')
    if (credentials !== undefined) return (await credentials.resolve(credential))?.value
    const ambient = launchEnvironmentOf(ctx).get(credential)
    return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined
  }
}

/**
 * 注册工作台能力缝与面向模型的工具。全部随插件卸载而注销。
 */
export function apply(ctx: Context, config: Config): void {
  ctx.plugin(WorkbenchRuntime, {
    profile: config.profile ?? DEFAULT_PROFILE,
    ...config.dshHome === undefined ? {} : { dshHome: config.dshHome },
    registries: config.registries ?? [],
    registryTimeoutMs: config.registryTimeoutMs ?? DEFAULT_REGISTRY_TIMEOUT_MS,
    resolveApiKey: makeApiKeyResolver(ctx),
  })

  ctx.systemPrompt.section({
    name: 'tool:workbench',
    order: 120,
    text: [
      '企业工作台工具管理本机 DeepSeek Harness 的四类资源：AI 员工（workbench_employee）、',
      '知识库（workbench_knowledge）、技能（workbench_skill）、MCP 服务（workbench_mcp），',
      '以及 DSH 插件（workbench_plugin）。每个工具用 action 参数选择具体动作，先用 list 看清现状再动手。',
      '删除类动作必须显式传 confirm: true，且要先向用户说明将要删除什么、得到用户同意之后再调用。',
    ].join(''),
  })

  // 各域的浏览器数据通道。工具与它们读的是同一份投影，所以界面上看到的
  // 东西和模型看到的是同一批。
  // 技能生效的信号与验证。必须在技能网关与技能工具之前挂：它在 `ctx.skills`
  // 上注册一个空 provider，为的是拿到那个失效句柄，好让写完的技能立刻被
  // 重新发现，而不是等 watcher 的稳定期——更不是等重启。
  ctx.plugin(SkillActivation)

  ctx.plugin(WorkbenchEmployeeGateway)
  ctx.plugin(WorkbenchSkillGateway)

  const toolTimeoutMs = config.toolTimeoutMs ?? DEFAULT_MCP_TOOL_TIMEOUT_MS
  const networkToolTimeoutMs = config.networkToolTimeoutMs ?? DEFAULT_SKILL_TOOL_TIMEOUT_MS
  applyMcpTool(ctx, toolTimeoutMs)
  applySkillTool(ctx, networkToolTimeoutMs, config.registryTimeoutMs ?? DEFAULT_REGISTRY_TIMEOUT_MS)
  applyKnowledgeTool(ctx, DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS)
  applyEmployeeTool(ctx, DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS)
  applyPluginTool(
    ctx,
    config.dshExecutable ?? DEFAULT_DSH_EXECUTABLE,
    config.pluginToolTimeoutMs ?? DEFAULT_PLUGIN_TOOL_TIMEOUT_MS,
  )
}
