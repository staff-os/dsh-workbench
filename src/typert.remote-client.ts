/**
 * 浏览器半边的 Remote contribution，由客户端 apply 里的 `ctx.remote.$mount()`
 * 挂上去。
 *
 * 挂上之后 `ctx.remote.workbenchEmployee.*` 与 `ctx.remote.workbenchSkill.*` 就存在
 * 了，调用经 api-gateway 走到 Node 半边对应的 gateway。gateway 只对每个 codec 调
 * `schema.parse()`，不认 zod 的实例身份，所以客户端 bundle 内联自己那份 zod
 * 不影响校验。
 *
 * 内容是手写的，原因与代价见 {@link module:@staff-os/dsh-workbench/typert-schemas}。
 *
 * @module @staff-os/dsh-workbench/typert.remote-client
 */

import { DESCRIPTORS, PACKAGE } from './typert-schemas.ts'

/** 本包向浏览器提供的 Remote 契约。 */
export const TYPERT_REMOTE = {
  package: PACKAGE,
  descriptors: DESCRIPTORS,
}

export default TYPERT_REMOTE
