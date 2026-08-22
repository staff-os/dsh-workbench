/**
 * DSH 插件的装卸：一层薄薄的转发。
 *
 * `dsh plugin --profile <p> <args>` 本身就是个 pnpm 转发器——初始化 profile、
 * 在 profile 目录里跑 pnpm、再按**安装后的实际状态**对账 `dsh.profile.bundles`。
 * 这里直接调它，不自己碰 pnpm 也不自己改 bundles 清单：绕过去意味着要复刻
 * 那套对账规则，而它们不一致时的表现是「装上了但没生效」，最难查。
 *
 * @module @staff-os/dsh-workbench/plugin/ops
 */

import { spawn } from 'node:child_process'
import { constants } from 'node:fs'
import { access, readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { WorkbenchError } from '../types.ts'

/** profile 里的一个依赖。 */
export interface PluginEntry {
  readonly name: string
  /** profile package.json 里记的依赖规格。 */
  readonly spec?: string
  /** 实际装上的版本，读自 node_modules。 */
  readonly version?: string
  readonly description?: string
  /** 是否声明了 `dsh.bundle`，即是不是一个 DSH 插件。 */
  readonly isBundle: boolean
  /** 是否在 `dsh.profile.bundles` 里，即是否真正参与组合。 */
  readonly active: boolean
}

/** 一个 profile 的插件全景。 */
export interface ProfilePlugins {
  readonly plugins: readonly PluginEntry[]
  /**
   * 随 profile 模板出厂的组合层，不是依赖，装卸命令碰不到它们。
   * 列出来是为了让「为什么删不掉」有个明确答案。
   */
  readonly builtIn: readonly string[]
}

interface PackageManifest {
  name?: string
  version?: string
  description?: string
  dependencies?: Record<string, string>
  dsh?: {
    bundle?: { patch?: string }
    profile?: { bundles?: string[] }
  }
}

async function readManifest(path: string): Promise<PackageManifest | undefined> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as PackageManifest
  } catch {
    return undefined
  }
}

/**
 * 读一个 profile 当前装了什么。
 *
 * 依赖列表来自 profile 的 package.json，是否为插件则要看**装到盘上的那一份**
 * 自己怎么声明——一个包可能在新版本里才加上 `dsh.bundle`，只看依赖名判断不出来。
 */
export async function readProfilePlugins(profileDir: string): Promise<ProfilePlugins> {
  const manifest = await readManifest(join(profileDir, 'package.json'))
  if (manifest === undefined) {
    throw new WorkbenchError(
      `profile 目录 ${profileDir} 还没初始化（没有 package.json）；先跑一次 dsh plugin 或启动一次该 profile`,
      'WORKBENCH_PROFILE_NOT_INITIALIZED',
    )
  }
  const dependencies = manifest.dependencies ?? {}
  const bundles = manifest.dsh?.profile?.bundles ?? []
  const plugins: PluginEntry[] = []
  for (const [name, spec] of Object.entries(dependencies)) {
    const installed = await readManifest(join(profileDir, 'node_modules', name, 'package.json'))
    const description = installed?.description
    plugins.push({
      name,
      spec,
      ...installed?.version === undefined ? {} : { version: installed.version },
      ...description === undefined ? {} : { description },
      isBundle: installed?.dsh?.bundle?.patch !== undefined,
      active: bundles.includes(name),
    })
  }
  plugins.sort((left, right) => left.name.localeCompare(right.name))
  return {
    plugins,
    builtIn: bundles.filter(name => dependencies[name] === undefined),
  }
}

/**
 * shell 会拿去拆命令的字符。
 *
 * 注意没有 `^`：它在 cmd 里是转义符，但在 Node 加的双引号里是字面量，
 * 单独也开不出新命令；而 `^1.2.3` 是最常见的 npm 版本范围写法，
 * 把它拒掉等于每一次带范围的安装都装不了。
 */
const UNSAFE_SPEC = /[&|;<>`$\r\n"']/u

/**
 * 挡下带 shell 元字符的包规格。
 *
 * Windows 上 `dsh` 是个 `.cmd` 垫片，只能由 cmd.exe 启动（见
 * {@link spawnResolved}），而 cmd 会把命令行重新解一遍；这个规格又是模型
 * 给的。合法的 npm 包名、版本号、git 地址与路径都用不到这些字符，
 * 拒掉不会误伤，不拒则是把一条命令行交给了调用方。
 */
export function assertSafeSpec(spec: string, field: string): void {
  if (UNSAFE_SPEC.test(spec)) {
    throw new WorkbenchError(
      `${field} 里含有不允许的字符（shell 元字符）：${spec}`,
      'WORKBENCH_PLUGIN_BAD_SPEC',
    )
  }
}

/**
 * 在 PATH 上找出可执行文件的真实路径。
 *
 * 自己找而不是交给 spawn，是因为「命令不存在」在两个平台上表现完全不同：
 * POSIX 给一个 ENOENT 错误事件，Windows 经 cmd 则是退出码 1 加一句英文
 * “is not recognized as an internal or external command”。靠后者去猜，
 * 等于把「dsh 没装」和「dsh 报错了」混成同一件事。先查一遍就都不用猜。
 *
 * @returns 可执行文件的绝对路径；找不到时 `undefined`。
 */
export async function resolveExecutable(executable: string): Promise<string | undefined> {
  const extensions = process.platform === 'win32'
    ? (process.env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';').filter(item => item !== '')
    : ['']
  const candidates = /[/\\]/u.test(executable)
    ? [executable]
    : (process.env.PATH ?? '').split(process.platform === 'win32' ? ';' : ':')
        .filter(dir => dir !== '')
        .map(dir => join(dir, executable))
  for (const candidate of candidates) {
    for (const extension of ['', ...extensions]) {
      const path = `${candidate}${extension}`
      try {
        await access(path, constants.X_OK)
        return path
      } catch {
        // 这个候选不存在或不可执行，继续找下一个。
      }
    }
  }
  return undefined
}

/**
 * 起一个子进程，必要时经 cmd.exe。
 *
 * `.cmd` / `.bat` 垫片在 CVE-2024-27980 加固之后不能直接 spawn，只能由
 * cmd.exe 代启。这里显式起 `cmd.exe /d /s /c` 而不是用 `shell: true`：
 * 后者被 Node 标了 DEP0190——它把参数**直接拼接、完全不转义**，而显式
 * 起 cmd 时参数仍走 Node 自己的 Windows 引号规则。真正的防线还是
 * {@link assertSafeSpec}，这一步只是不再额外放大风险。
 */
function spawnResolved(
  path: string,
  args: readonly string[],
  cwd: string | undefined,
): ReturnType<typeof spawn> {
  const options = {
    ...cwd === undefined ? {} : { cwd },
    windowsHide: true,
  }
  if (process.platform === 'win32' && /\.(?:cmd|bat)$/iu.test(path)) {
    return spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', path, ...args], options)
  }
  return spawn(path, [...args], options)
}

/** 一条命令的执行结果。 */
export interface CommandResult {
  readonly code: number
  readonly stdout: string
  readonly stderr: string
}

/**
 * 跑一条命令并收集输出。
 *
 * 走异步 spawn 而不是 spawnSync：一次 pnpm 安装可能要几十秒，同步跑会把
 * 整个事件循环钉住，连取消都响应不了。
 */
export async function runCommand(
  executable: string,
  args: readonly string[],
  options: { readonly cwd?: string; readonly timeoutMs: number; readonly signal?: AbortSignal },
): Promise<CommandResult> {
  // 解析可执行文件是异步的，取消信号可能在这期间就到了；不先看一眼的话
  // 那次取消会掉在监听器注册之前，命令照跑不误。
  if (options.signal?.aborted === true) {
    return { code: 130, stdout: '', stderr: '操作已取消' }
  }
  const path = await resolveExecutable(executable)
  if (path === undefined) {
    throw new WorkbenchError(
      `找不到可执行文件 "${executable}"；插件管理要求 DSH 命令行在 PATH 上`,
      'WORKBENCH_DSH_CLI_MISSING',
    )
  }
  return new Promise<CommandResult>((settle, fail) => {
    const child = spawnResolved(path, args, options.cwd)
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (result: CommandResult): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
      settle(result)
    }
    const timer = setTimeout(() => {
      child.kill()
      finish({ code: 124, stdout, stderr: `${stderr}\n命令超时（${String(options.timeoutMs)} 毫秒）` })
    }, options.timeoutMs)
    const onAbort = (): void => {
      child.kill()
      finish({ code: 130, stdout, stderr: `${stderr}\n操作已取消` })
    }
    options.signal?.addEventListener('abort', onAbort, { once: true })
    // 已经触发过的信号不会再派发事件，补一次手动调用。
    if (options.signal?.aborted === true) onAbort()

    child.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
    child.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
    child.on('error', (error: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      options.signal?.removeEventListener('abort', onAbort)
      fail(error)
    })
    child.on('close', (code) => { finish({ code: code ?? 1, stdout, stderr }) })
  })
}

/** 把一次 `dsh plugin` 调用转发出去。 */
export async function runDshPlugin(
  executable: string,
  profile: string,
  args: readonly string[],
  options: { readonly cwd?: string; readonly timeoutMs: number; readonly signal?: AbortSignal },
): Promise<CommandResult> {
  return runCommand(executable, ['plugin', '--profile', profile, ...args], options)
}

/** 本地路径规格的预检结果。 */
export interface LocalSpecInfo {
  readonly path: string
  readonly packageName?: string
  /** 是否声明了 `dsh.bundle.patch`。 */
  readonly declaresBundle: boolean
}

/** 一个规格是不是本地路径。 */
function localPathOf(spec: string): string | undefined {
  const bare = spec.replace(/^(?:file|link):/u, '')
  if (bare === '') return undefined
  if (bare.startsWith('.') || bare.startsWith('/') || bare.startsWith('\\')) return bare
  if (/^[A-Za-z]:[/\\]/u.test(bare)) return bare
  return isAbsolute(bare) ? bare : undefined
}

/**
 * 本地路径规格的安装前预检。
 *
 * 指错目录是这里最常见的失误：把一个聚合仓库的根目录当插件装上去，pnpm
 * 会成功、对账会发现它没有 `dsh.bundle` 于是不并入组合层，最后表现为
 * 「装完了但什么都没变」。在转发之前读一眼它的 package.json 就能把这句话
 * 说清楚。
 *
 * @returns 本地路径的预检信息；不是本地路径时返回 `undefined`。
 */
export async function inspectLocalSpec(spec: string, cwd: string): Promise<LocalSpecInfo | undefined> {
  const bare = localPathOf(spec)
  if (bare === undefined) return undefined
  const path = resolve(cwd, bare)
  const manifest = await readManifest(join(path, 'package.json'))
  if (manifest === undefined) {
    throw new WorkbenchError(
      `${path} 下没有可读的 package.json，装不了；确认路径指向的是插件包本身`,
      'WORKBENCH_PLUGIN_BAD_SPEC',
    )
  }
  return {
    path,
    ...manifest.name === undefined ? {} : { packageName: manifest.name },
    declaresBundle: manifest.dsh?.bundle?.patch !== undefined,
  }
}
