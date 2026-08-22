/**
 * Node 半边的 Typert 产物，由 `@deepseek-ai/dsh-typert-loader` 发现。
 *
 * loader 跟着 Cordis 的 `internal/plugin` 生命周期走，解析每个 Loader entry
 * 的 `package.json`，看到 `./typert` 导出就 import 它并注册里面的 `TYPERT`。
 * 本包是 profile 装出来的一个 entry，所以这份表装上就被认领，不需要谁去
 * 显式登记。
 *
 * 内容是手写的，原因与代价见 {@link module:@staff-os/dsh-workbench/typert-schemas}。
 *
 * @module @staff-os/dsh-workbench/typert.host
 */

import { DESCRIPTORS, PACKAGE } from './typert-schemas.ts'

/** 本包的 Node 半边反射清单。 */
export const TYPERT = {
  package: PACKAGE,
  face: 'host',
  schemas: [],
  invocations: DESCRIPTORS,
  model: {
    services: [],
    events: [],
    objects: [],
  },
}

export default TYPERT
