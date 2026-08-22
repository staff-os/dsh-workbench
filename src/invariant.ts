/**
 * `@staff-os/dsh-workbench` 的包自有不变量伴生插件。
 * @module @staff-os/dsh-workbench/invariant
 */

import { relative, isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantFailure, InvariantInstaller } from '@deepseek-ai/dsh-invariants'
import type { WorkbenchRuntime } from './runtime.ts'

const PACKAGE_NAME = '@staff-os/dsh-workbench'

/** Cordis 伴生插件名。 */
export const name = 'workbench-invariant'

/** 注册包归属前需要的服务。 */
export const inject = ['invariants']

/**
 * 运行期不变量：工作台解析出的每个路径都必须落在 `$DSH_HOME` 之内。
 *
 * 这条值得单独校验，是因为 `dshHome` 与 `profile` 都来自配置，一个写歪的
 * profile 名（`../../etc` 之类）会让后续所有写操作跑到用户主目录外面去。
 * 与其在每个写点上重复判断，不如在装载时一次性把住。
 */
const install: InvariantInstaller = Object.assign((ctx: Context, fail: InvariantFailure) => {
  const runtime = ctx.get('workbench') as WorkbenchRuntime | undefined
  if (runtime === undefined) return
  const { home, ...rest } = runtime.paths
  for (const [key, value] of Object.entries(rest)) {
    const offset = relative(home, value)
    if (offset.startsWith('..') || isAbsolute(offset)) {
      fail(`路径 "${key}" 解析到 ${value}，落在 $DSH_HOME（${home}）之外`)
    }
  }
}, { inject: ['workbench'] })

/**
 * 注册本包的不变量伴生插件。
 */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
