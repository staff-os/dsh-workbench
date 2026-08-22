import { defineConfig } from 'tsdown'
import { clientConfig } from './tsdown.client.ts'

/**
 * 构建 dsh-workbench 插件的运行时 JS。
 *
 * `@deepseek-ai/*` 全部 external：它们由 DSH profile 的 bundle 层提供
 * （双锚点 + 扁平闭包解析），重复打包会让同一个 Service 出现两份实例。
 *
 * `@deepseek-ai/schemastery` 例外，强制内联：DSH profile 的 node_modules 里
 * 可能是只有源码没有 `lib/index.mjs` 的 vendor 副本，external 会在运行时解析失败。
 *
 * `yaml` / `adm-zip` 是本插件自己的依赖，DSH 侧不保证存在，一并内联。`zod` 同理：
 * typert 产物在运行时要用它建 schema。
 */
const nodeConfig = defineConfig({
  // 吃 tsc emit 出来的 JS 而不是 .ts 源：`@Remote` 装饰器要由 tsc 转译成
  // 运行时代码，tsdown 底下的 oxc 会把装饰器语法原样吐出来，Node 加载即
  // 语法错误。构建顺序由 package.json 的 build 脚本保证（tsc -b 在前）。
  entry: ['./.tsbuild/index.js', './.tsbuild/invariant.js', './.tsbuild/typert.host.js'],
  outDir: 'lib',
  format: 'esm',
  fixedExtension: false,
  dts: false,
  clean: true,
  deps: {
    alwaysBundle: ['@deepseek-ai/schemastery', 'yaml', 'adm-zip', 'zod'],
    neverBundle: [
      '@deepseek-ai/cordis',
      '@deepseek-ai/dsh-agent-presets',
      '@deepseek-ai/dsh-atomic-write',
      '@deepseek-ai/dsh-credentials',
      '@deepseek-ai/dsh-home-paths',
      '@deepseek-ai/dsh-invariants',
      '@deepseek-ai/dsh-launch-environment',
      '@deepseek-ai/dsh-llm',
      '@deepseek-ai/dsh-skill',
      '@deepseek-ai/dsh-system-prompt',
      '@deepseek-ai/dsh-tools',
      '@deepseek-ai/dsh-typert-protocol',
    ],
  },
})

/**
 * 两半一起出：Node 半边给宿主加载，浏览器半边给 DSH 的客户端加载器。
 *
 * `clean` 只在 Node 半边开着——两个配置都清一遍 lib 的话，后跑的那个会把
 * 先跑的产物删掉。
 */
export default [nodeConfig, clientConfig]
