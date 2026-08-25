/**
 * Remote 调用的运行时 schema 与 descriptor 表，两个产物入口共用一份。
 *
 * **这份表是手写的，DSH 自己的同类产物是 `@deepseek-ai/dsh-typert-generator`
 * 从源码类型生成的。** 生成器按 harness 的 workspace 布局发现包，仓库外的独立
 * 插件跑不了它；而 loader 那边只认 `package.json#exports` 里的 `./typert` 与
 * 产物里的 `TYPERT` 形状，不关心它是谁写的。所以这里按同一份**产物契约**手写，
 * 契约本身是 DSH 的加载协议——和 `tsdown.client.ts` 手写客户端产物是同一个道理。
 *
 * 代价是这份 schema 与 `employee/remote.ts` 的类型**没有编译期联系**：改了那边
 * 的返回类型，这里不会报错，而是运行时被 gateway 的 strict 校验挡下来。
 * 改任何一个 Remote 方法的签名时，这个文件必须跟着改。
 *
 * @module @staff-os/dsh-workbench/typert-schemas
 */

import { z } from 'zod'

/** 本包名，descriptor id 与 manifest 都按它归属。 */
export const PACKAGE = '@staff-os/dsh-workbench'

/** 员工域的 wire 命名空间；浏览器侧是 `ctx.remote.workbenchEmployee`。 */
export const EMPLOYEE_NAMESPACE = 'workbenchEmployee'

/** 一个员工装了什么。与 `employee/view.ts` 的 `EmployeeCapabilities` 对应。 */
const capabilities$schema = z.object({
  tools: z.number(),
  skills: z.number(),
  mcpServers: z.number(),
  hasPersona: z.boolean(),
  personaLine: z.string().optional(),
  personaComplete: z.boolean(),
  agentInstructions: z.boolean(),
  entries: z.number(),
  error: z.string().optional(),
})

/** 一个员工的投影。与 `employee/view.ts` 的 `EmployeeView` 对应。 */
const employeeView$schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  order: z.number().optional(),
  trust: z.string(),
  isDefault: z.boolean(),
  broken: z.string().optional(),
  persona: z.string().optional(),
  knowledgeBases: z.array(z.string()),
  skills: z.array(z.string()),
  mcpServers: z.array(z.string()),
  capabilities: capabilities$schema,
})

/** 一条指向不存在资源的绑定。 */
const unknownBinding$schema = z.object({
  kind: z.string(),
  id: z.string(),
})

/** 一次列表读取的结果。与 `employee/remote.ts` 的 `EmployeeSnapshot` 对应。 */
const snapshot$schema = z.object({
  employees: z.array(employeeView$schema),
  defaultId: z.string(),
  knowledgeBases: z.array(z.string()),
  skills: z.array(z.string()),
  mcpServers: z.array(z.string()),
  unknownBindings: z.array(unknownBinding$schema),
})

/** 一次写操作的结果。与 `employee/remote.ts` 的 `EmployeeMutation` 对应。 */
const mutation$schema = z.object({
  employee: employeeView$schema.optional(),
  snapshot: snapshot$schema,
})

/** 改展示元数据的入参。 */
const metadataInput$schema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
})

/** 改绑定的入参。 */
const bindingInput$schema = z.object({
  persona: z.string().optional(),
  knowledgeBases: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  mcpServers: z.array(z.string()).optional(),
  mode: z.union([z.literal('replace'), z.literal('add'), z.literal('remove')]).optional(),
})

const string$schema = z.string()

/** 组合文件里的一行。与 `employee/composition.ts` 的 `CompositionEntry` 对应。 */
const compositionEntry$schema = z.object({
  id: z.string().optional(),
  name: z.string(),
  label: z.string(),
  kind: z.union([
    z.literal('persona'),
    z.literal('instructions'),
    z.literal('tool'),
    z.literal('skill'),
    z.literal('mcp'),
    z.literal('other'),
  ]),
  disabled: z.union([z.literal(true), z.string()]).optional(),
  group: z.array(z.string()),
})

/** 一份组合文件的解析结果。与 `CompositionSummary` 对应。 */
const composition$schema = z.object({
  persona: z.object({
    text: z.string(),
    complete: z.boolean(),
    includeRuntimeContext: z.boolean(),
  }).optional(),
  agentInstructions: z.boolean(),
  tools: z.array(compositionEntry$schema),
  skills: z.array(compositionEntry$schema),
  mcpServers: z.array(compositionEntry$schema),
  others: z.array(compositionEntry$schema),
  total: z.number(),
  error: z.string().optional(),
})

/** `read` 的返回：原文加解析结果。 */
const employeeComposition$schema = z.object({
  source: z.string(),
  composition: composition$schema,
})

/**
 * 一个业务参数的 descriptor；本包的参数一律走 json，没有 lookup。
 *
 * `optional` 不是可有可无的修饰：api-gateway 收到调用时按 descriptor 逐字核
 * 对参数名，而 `undefined` 在 JSON 里根本不存在——传了个 undefined 的可选参
 * 数，到网关那边就是「少了一个字段」，调用被整个拒掉。让网关接受缺席的开关
 * 是参数上的 `acceptsUndefined`，schema 那边写 `.optional()` 管不了这件事。
 * @param name - 参数名，同时也是 wire 名。
 * @param schema - 运行时校验用的 schema。
 * @param typeSymbol - 类型符号，只用于诊断。
 * @param optional - 这个参数可以整个缺席。
 * @returns 参数 descriptor。
 */
function parameter(
  name: string,
  schema: z.ZodType,
  typeSymbol: string,
  optional = false,
): unknown {
  return {
    name,
    wire: name,
    source: 'json',
    ...optional ? { acceptsUndefined: true } : {},
    codec: { mode: 'strict', typeSymbol, schema },
  }
}

/** 一个 direct 调用的 descriptor。 */
function descriptor(
  namespace: string,
  method: string,
  parameters: readonly unknown[],
  result: { readonly typeSymbol: string; readonly schema: z.ZodType },
): unknown {
  return {
    id: `${PACKAGE}#${namespace}/${method}`,
    service: namespace,
    namespace,
    method,
    invocation: { kind: 'direct' },
    parameters,
    result: { mode: 'strict', typeSymbol: result.typeSymbol, schema: result.schema },
  }
}

/** 类型符号前缀；只用于诊断，指回声明这些类型的模块。 */
const SYMBOL = `${PACKAGE}#`

/** 员工域的全部 Remote 调用。 */
export const EMPLOYEE_DESCRIPTORS: readonly unknown[] = [
  descriptor(EMPLOYEE_NAMESPACE, 'list', [], {
    typeSymbol: `${SYMBOL}EmployeeSnapshot`,
    schema: snapshot$schema,
  }),
  descriptor(EMPLOYEE_NAMESPACE, 'create', [
    parameter('id', string$schema, `${SYMBOL}string`),
    parameter('from', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('name', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}EmployeeMutation`,
    schema: mutation$schema,
  }),
  descriptor(EMPLOYEE_NAMESPACE, 'update', [
    parameter('id', string$schema, `${SYMBOL}string`),
    parameter('metadata', metadataInput$schema, `${SYMBOL}EmployeeMetadataInput`),
  ], {
    typeSymbol: `${SYMBOL}EmployeeMutation`,
    schema: mutation$schema,
  }),
  descriptor(EMPLOYEE_NAMESPACE, 'bind', [
    parameter('id', string$schema, `${SYMBOL}string`),
    parameter('bindings', bindingInput$schema, `${SYMBOL}EmployeeBindingInput`),
  ], {
    typeSymbol: `${SYMBOL}EmployeeMutation`,
    schema: mutation$schema,
  }),
  descriptor(EMPLOYEE_NAMESPACE, 'delete', [
    parameter('id', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}EmployeeMutation`,
    schema: mutation$schema,
  }),
  descriptor(EMPLOYEE_NAMESPACE, 'read', [
    parameter('id', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}EmployeeComposition`,
    schema: employeeComposition$schema,
  }),
]

/** 技能域的 wire 命名空间；浏览器侧是 `ctx.remote.workbenchSkill`。 */
export const SKILL_NAMESPACE = 'workbenchSkill'

/** 一个技能的投影。与 `skill/view.ts` 的 `SkillView` 对应。 */
const skillView$schema = z.object({
  name: z.string(),
  description: z.string(),
  whenToUse: z.string().optional(),
  source: z.string(),
  provider: z.string().optional(),
  modelInvocable: z.boolean(),
  userInvocable: z.boolean(),
  managed: z.boolean(),
  shadowed: z.boolean(),
  path: z.string().optional(),
  files: z.array(z.string()).optional(),
})

/**
 * 一个市场条目的投影。与 `skill/view.ts` 的 `MarketView` 对应。
 *
 * 少写一个字段不会报错，只会被 strict 编解码悄悄剥掉——`installable` 漏掉时的
 * 表现就是安装按钮对着一条装不了的镜像条目照常可点。
 */
const marketView$schema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()),
  category: z.string().optional(),
  installCount: z.number(),
  avgRating: z.number(),
  downloadCount: z.number(),
  stars: z.number(),
  owner: z.string().optional(),
  iconUrl: z.string().optional(),
  homepage: z.string().optional(),
  securityStatus: z.string().optional(),
  installKind: z.string().optional(),
  installable: z.boolean(),
  registry: z.string(),
  registryName: z.string(),
})

/** 一个已配置的市场源。 */
const registryInfo$schema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  flavor: z.string(),
  apiKeyEnv: z.string().optional(),
})

/** 一个被 DSH 拒收的盘上条目。与 `skill/view.ts` 的 `RejectedView` 对应。 */
const rejectedView$schema = z.object({
  hint: z.string(),
  path: z.string(),
  reason: z.string(),
})

/** 一次技能列表读取的结果。与 `skill/remote.ts` 的 `SkillSnapshot` 对应。 */
const skillSnapshot$schema = z.object({
  skills: z.array(skillView$schema),
  rejected: z.array(rejectedView$schema),
  registries: z.array(registryInfo$schema),
  hasRegistry: z.boolean(),
})

/** 写完之后回读得到的生效结论。与 `skill/activation.ts` 的 `ActivationState` 对应。 */
const activationState$schema = z.object({
  active: z.boolean(),
  mine: z.boolean(),
  winnerSource: z.string().optional(),
  winnerPath: z.string().optional(),
  summary: z.string(),
  scope: z.union([z.literal('skill'), z.literal('deployment')]),
})

/** 一次技能写操作的结果。与 `SkillMutation` 对应。 */
const skillMutation$schema = z.object({
  skill: skillView$schema.optional(),
  message: z.string(),
  activation: activationState$schema.optional(),
  snapshot: skillSnapshot$schema,
})

/** 一条安装来源记录。与 `skill/ledger.ts` 的 `SkillOrigin` 对应。 */
const skillOrigin$schema = z.object({
  name: z.string(),
  registry: z.string(),
  slug: z.string(),
  owner: z.string().optional(),
  version: z.string(),
  installedAt: z.number(),
})

/** 一个已装技能的更新状态。与 `skill/ledger.ts` 的 `UpdateStatus` 对应。 */
const updateStatus$schema = z.object({
  name: z.string(),
  installed: z.string(),
  latest: z.string().optional(),
  outdated: z.boolean(),
  origin: skillOrigin$schema,
  error: z.string().optional(),
})

/** 技能目录或包里的一个文件。与 `skill/local.ts` 的 `SkillFileEntry` 对应。 */
const skillFileEntry$schema = z.object({
  path: z.string(),
  size: z.number(),
})

/** 一个技能的正文。与 `SkillContent` 对应。 */
const skillContent$schema = z.object({
  skill: skillView$schema,
  content: z.string(),
  files: z.array(skillFileEntry$schema),
  note: z.string().optional(),
})

/** 新建技能的入参。 */
const skillInput$schema = z.object({
  name: z.string(),
  description: z.string(),
  whenToUse: z.string().optional(),
  content: z.string().optional(),
  modelInvocable: z.boolean().optional(),
  userInvocable: z.boolean().optional(),
})

/** 改可见性的入参。 */
const skillVisibilityInput$schema = z.object({
  modelInvocable: z.boolean().optional(),
  userInvocable: z.boolean().optional(),
})

/** 市场上的一个标签。与 `MarketLabel` 对应。 */
const marketLabel$schema = z.object({
  slug: z.string(),
  name: z.string(),
  kind: z.string(),
  registry: z.string(),
  registryName: z.string(),
})

/** 一次市场搜索的结果。与 `MarketPage` 对应。 */
const marketPage$schema = z.object({
  items: z.array(marketView$schema),
  fromCache: z.boolean(),
})

/** 一个文件的内容。与 `FileContent` 对应。 */
const fileContent$schema = z.object({
  path: z.string(),
  size: z.number(),
  text: z.string().optional(),
  binary: z.boolean(),
  truncated: z.boolean(),
})

/** 一个市场条目的包内容。与 `MarketPreview` 对应。 */
const marketPreview$schema = z.object({
  files: z.array(skillFileEntry$schema),
  content: z.string().optional(),
  note: z.string().optional(),
})

/** 一条静态扫描命中。与 `ScanFinding` 对应。 */
const scanFinding$schema = z.object({
  rule: z.string(),
  severity: z.string(),
  category: z.string(),
  description: z.string(),
  path: z.string(),
  line: z.number().optional(),
  recovery: z.string().optional(),
})

/** 一次静态扫描的结果。与 `ScanReport` 对应。 */
const scanReport$schema = z.object({
  findings: z.array(scanFinding$schema),
  scanned: z.number(),
  skipped: z.number(),
  severity: z.string().optional(),
  score: z.number(),
  categories: z.array(z.object({
    id: z.string(),
    hits: z.number(),
    severity: z.string().optional(),
  })),
})

const number$schema = z.number()
const boolean$schema = z.boolean()

/** 市场配置写操作的入参——一条源的编辑表单。 */
const registrySourceInput$schema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  flavor: z.string().optional(),
  apiKeyEnv: z.string().optional(),
})

/** 技能域的全部 Remote 调用。 */
export const SKILL_DESCRIPTORS: readonly unknown[] = [
  descriptor(SKILL_NAMESPACE, 'list', [], {
    typeSymbol: `${SYMBOL}SkillSnapshot`,
    schema: skillSnapshot$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'read', [
    parameter('name', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}SkillContent`,
    schema: skillContent$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'readFile', [
    parameter('name', string$schema, `${SYMBOL}string`),
    parameter('path', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}FileContent`,
    schema: fileContent$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'scan', [
    parameter('name', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}ScanReport`,
    schema: scanReport$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'create', [
    parameter('input', skillInput$schema, `${SYMBOL}SkillInput`),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'visibility', [
    parameter('name', string$schema, `${SYMBOL}string`),
    parameter('visibility', skillVisibilityInput$schema, `${SYMBOL}SkillVisibilityInput`),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'delete', [
    parameter('name', string$schema, `${SYMBOL}string`),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketSearch', [
    parameter('keyword', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('page', number$schema.optional(), `${SYMBOL}number`, true),
    parameter('sort', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('label', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('labelRegistry', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}MarketPage`,
    schema: marketPage$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketLabels', [], {
    typeSymbol: `${SYMBOL}MarketLabel[]`,
    schema: z.array(marketLabel$schema),
  }),
  descriptor(SKILL_NAMESPACE, 'marketGet', [
    parameter('slug', string$schema, `${SYMBOL}string`),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}MarketView`,
    schema: marketView$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketPreview', [
    parameter('slug', string$schema, `${SYMBOL}string`),
    parameter('version', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('owner', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}MarketPreview`,
    schema: marketPreview$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketFile', [
    parameter('slug', string$schema, `${SYMBOL}string`),
    parameter('version', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('owner', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('path', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}FileContent`,
    schema: fileContent$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketScan', [
    parameter('slug', string$schema, `${SYMBOL}string`),
    parameter('version', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('owner', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}ScanReport`,
    schema: scanReport$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketInstall', [
    parameter('slug', string$schema, `${SYMBOL}string`),
    parameter('version', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('overwrite', boolean$schema.optional(), `${SYMBOL}boolean`, true),
    parameter('owner', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'importPackage', [
    parameter('fileName', string$schema, `${SYMBOL}string`),
    parameter('contentBase64', string$schema, `${SYMBOL}string`),
    parameter('overwrite', boolean$schema.optional(), `${SYMBOL}boolean`, true),
    parameter('name', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'importUrl', [
    parameter('url', string$schema, `${SYMBOL}string`),
    parameter('overwrite', boolean$schema.optional(), `${SYMBOL}boolean`, true),
    parameter('name', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketUpdate', [
    parameter('name', string$schema, `${SYMBOL}string`),
    parameter('slug', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('registry', string$schema.optional(), `${SYMBOL}string`, true),
    parameter('owner', string$schema.optional(), `${SYMBOL}string`, true),
  ], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'marketUpdateAll', [], {
    typeSymbol: `${SYMBOL}SkillMutation`,
    schema: skillMutation$schema,
  }),
  descriptor(SKILL_NAMESPACE, 'updates', [], {
    typeSymbol: `${SYMBOL}UpdateStatus[]`,
    schema: z.array(updateStatus$schema),
  }),
  descriptor(SKILL_NAMESPACE, 'marketConfigRead', [], {
    typeSymbol: `${SYMBOL}RegistryInfo[]`,
    schema: z.array(registryInfo$schema),
  }),
  descriptor(SKILL_NAMESPACE, 'marketConfigWrite', [
    parameter('sources', z.array(registrySourceInput$schema), `${SYMBOL}RegistrySourceInput[]`),
  ], {
    typeSymbol: `${SYMBOL}RegistryInfo[]`,
    schema: z.array(registryInfo$schema),
  }),
]

/** 本包全部 Remote 调用，两个产物入口共用。 */
export const DESCRIPTORS: readonly unknown[] = [...EMPLOYEE_DESCRIPTORS, ...SKILL_DESCRIPTORS]
