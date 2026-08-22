/**
 * 工作台客户端产物的构建配置。
 *
 * DSH 自己的 `packages/client/tsdown.client.ts` 用不了：它靠
 * `globSync('packages/*&#47;*&#47;package.json')` 在 harness 仓库里找包，
 * 仓库外的插件在那儿查无此名、直接抛错。所以这里按同一份**产物契约**
 * 自己写一遍——契约本身是 DSH 的加载协议，不是它的实现：
 *
 * 1. CJS 产物，`platform: browser`，文件名固定 `client.js`（宿主按
 *    `/plugins/<id>/client.js` 提供）。
 * 2. 整个产物包在 `window.__ModuleLoader__.load({ id, factory })` 里，
 *    外部依赖由注入的 `require` 从加载器模块表取，不走 import map。
 * 3. 只有模块表里的说明符能保持 external，**其余一律内联**：模块表答不上来的
 *    require 在运行时必然抛错。跨插件的值导入本身也是禁的（会引入第二份运行时
 *    实例），协作走 cordis 服务。
 * 4. `.module.css` 由 lightningcss 编译，产出哈希类名表，并在 factory 执行时
 *    往 head 插一个带 `data-plugin` 标记的 style。
 *
 * @module @staff-os/dsh-workbench/tsdown.client
 */

import { readFile } from 'node:fs/promises'
import { basename, dirname, relative, resolve as resolvePath } from 'node:path'
import { transform } from 'lightningcss'
import type { UserConfig } from 'tsdown'

/** 本包的 id，会烧进 `__ModuleLoader__.load` 的交接与 style 标记里。 */
const ID = '@staff-os/dsh-workbench'

/**
 * 加载器模块表：只有这些说明符能保持 external。
 *
 * 对应 DSH 的 `PLATFORM_MODULES` + `PRELOADED_CLIENT_EXTERNALS`。少一个会让
 * 本该共享的运行时被内联出第二份实例，多一个则是运行时 require 直接抛错。
 */
const MODULE_TABLE = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-runtime/client',
])

/** CSS 模块的虚拟 id 前缀；结尾不能是 `.css`，否则会被 tsdown 自己的 css 管线截走。 */
const CSS_VIRTUAL_PREFIX = '\0workbench-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/** 生成一段「插样式 + 导出类名表」的模块。 */
function styleModule(fileId: string, code: string, classMap: Record<string, string>): string {
  const tagId = `${ID}/${basename(fileId)}`
  return [
    `const css = ${JSON.stringify(code)};`,
    `const tagId = ${JSON.stringify(tagId)};`,
    'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
    '  const tag = document.createElement(\'style\');',
    `  tag.dataset.plugin = ${JSON.stringify(ID)};`,
    '  tag.dataset.pluginCss = tagId;',
    '  tag.textContent = css;',
    '  document.head.appendChild(tag);',
    '}',
    `export default ${JSON.stringify(classMap)};`,
  ].join('\n')
}

/** 客户端产物的 tsdown 配置。 */
export const clientConfig: UserConfig = {
  name: `${ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: {
    neverBundle: (specifier: string) => MODULE_TABLE.has(specifier),
    alwaysBundle: (specifier: string) => !MODULE_TABLE.has(specifier),
  },
  // 内联的浏览器依赖（clsx 之外，将来还可能有别的）会读 process.env.NODE_ENV；
  // CJS 产物里没有 import.meta，不替换掉就是启动时 ReferenceError。
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
    'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
  },
  plugins: [{
    /**
     * 产物纯净度闸门：跨插件的值导入会内联出第二份运行时实例，
     * 或者要求模块表回答一个它没有的说明符——两种都是运行时才炸。
     * 类型导入会被编译擦掉，到不了这里。
     */
    name: 'workbench-client-purity',
    resolveId(source: string) {
      if (!source.startsWith('@deepseek-ai/')) return null
      if (MODULE_TABLE.has(source)) return null
      throw new Error(
        `client bundle purity: "${source}" 不在加载器模块表里——跨插件的值导入会引入第二份运行时实例；`
        + '协作请走 cordis 服务，或把它改成仅类型导入',
      )
    },
  }, {
    name: 'workbench-css-modules',
    resolveId(source: string, importer: string | undefined) {
      if (!source.endsWith('.module.css')) return null
      const absolute = importer === undefined ? source : resolvePath(dirname(importer), source)
      // 虚拟 id 只用相对路径：rolldown 会把虚拟 id 原样写进 //#region 注释，
      // 用绝对路径会把本地构建路径泄露进产物。
      const rel = relative(process.cwd(), absolute).replaceAll('\\', '/')
      return CSS_VIRTUAL_PREFIX + rel + CSS_VIRTUAL_SUFFIX
    },
    async load(virtualId: string) {
      if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
      const rel = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
      const fileId = resolvePath(process.cwd(), rel)
      // 虚拟 id 会让真实样式表从 rolldown 的 watch 图里消失，手动加回去。
      this.addWatchFile(fileId)
      const { code, exports: cssExports } = transform({
        filename: fileId,
        code: await readFile(fileId),
        cssModules: { pattern: '[hash]_[local]' },
        minify: true,
      })
      const classMap: Record<string, string> = {}
      for (const [local, exported] of Object.entries(cssExports ?? {})) {
        classMap[local] = exported.name
      }
      return styleModule(fileId, code.toString(), classMap)
    },
  }],
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}
