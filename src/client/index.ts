/**
 * 工作台侧栏的客户端半边：把 {@link WorkbenchSidebar} 注册进 ui-layout 的
 * `sidebar` 槽，把 {@link WorkbenchPanel} 注册进 `shell.overlay`。
 *
 * 占 `sidebar` 槽等于**替换**整条导航列：上游 ui-sidebar 连同它声明的内层
 * 座位一起消失。所以注册时把 `sidebar.workspaces`、`sidebar.settings` 等座位
 * 原样重新声明出来（见 contract/slots.ts），ui-workspace 与 ui-settings 才有
 * 地方落。这也意味着本插件与 ui-sidebar 二选一——两个都占同一个 single 槽
 * 会打架。
 *
 * 管理面板走 `shell.overlay` 而不是 `conversation`：后者也是 single，占了就
 * 得自己重写整个对话界面。overlay 是 list，加一份谁都不影响。
 *
 * 数据通道（`ctx.remote`）挂在一个**子插件**里，它 inject 了 `remote`。这样
 * 一个没装 api-gateway 的部署只是没有管理面板，侧栏和会话导航照常工作——
 * 把 `remote` 写进主 apply 的 inject 会让整条侧栏跟着一起不加载。
 *
 * @module @staff-os/dsh-workbench/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// 仅类型：把 locale 插件的 Context 合并（ctx.locale）带进来。
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { WorkbenchSidebarInjected } from './contract/slots.ts'
import type { WorkbenchPanelInjected } from './contract/panel.ts'
import { WorkbenchSidebar } from './WorkbenchSidebar.tsx'
import { WorkbenchPanel } from './WorkbenchPanel.tsx'
import { createWorkbenchUi } from './workbench-ui.ts'
import { createEmployeeData } from './employee/data.ts'
import { createSkillData } from './skill/data.ts'
import { TYPERT_REMOTE } from '../typert.remote-client.ts'
import type { EmployeeRemote, SkillRemote, WorkbenchRemote } from './contract/remote.ts'
import { en, zh } from './locales.ts'
import type { LocaleKey } from './locales.ts'

export type {
  SidebarBrandMarkOwnerProps,
  SidebarBrandNameOwnerProps,
  SidebarFooterActionOwnerProps,
  SidebarSectionOwnerProps,
  SidebarSettingsOwnerProps,
  WorkbenchSidebarInjected,
  WorkbenchSidebarProps,
} from './contract/slots.ts'
export type { WorkbenchPanelInjected, WorkbenchPanelSlotProps } from './contract/panel.ts'
export type {
  EmployeeBindingInput,
  EmployeeMetadataInput,
  EmployeeMutation,
  EmployeeRemote,
  EmployeeSnapshot,
  EmployeeView,
  RemoteFailure,
  RemoteResult,
  UnknownBinding,
  WorkbenchRemote,
} from './contract/remote.ts'
export type { LocaleKey } from './locales.ts'
export { SECTIONS, sectionOf, sectionVisible, VISIBLE_SECTIONS } from './sections.ts'
export type { WorkbenchSection, WorkbenchSectionId } from './sections.ts'
export { createStore, useStore } from './state.ts'
export type { Store } from './state.ts'
export { createWorkbenchUi } from './workbench-ui.ts'
export type { WorkbenchUiState, WorkbenchUiStore } from './workbench-ui.ts'
export { createEmployeeData } from './employee/data.ts'
export type { EmployeeData, EmployeeState } from './employee/data.ts'
export { createSkillData } from './skill/data.ts'
export type { SkillData, SkillState } from './skill/data.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** 工作台侧栏的界面文案。 */
    workbench: LocaleKey
  }
}

/** 本插件拥有的字典命名空间。 */
const NS = 'workbench'

/** 客户端半边依赖的服务。 */
export const inject = ['slots', 'layout', 'sessions', 'workspaces', 'locale']

/**
 * 注册工作台侧栏、管理面板及其服务回调。
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-workbench: dictionaries')

  // 侧栏与面板共享的那点状态：现在选中哪个分区、侧栏当前多宽。
  const ui = createWorkbenchUi()

  const injectSidebar = (): WorkbenchSidebarInjected => ({
    ui,
    startSession: (workspaceId) => { ctx.workspaces.startSession(workspaceId) },
    toggleSidebar: () => { ctx.layout.toggleSidebar() },
  })

  ctx.effect(
    () => ctx.slots.register({
      name: 'sidebar',
      locale: NS,
      // 与上游 ui-sidebar 逐字对齐：名字、kind、scope 有一处不同，
      // 对应的插件就落不进来，而且落不进来时没有任何报错。
      children: {
        'sidebar.brand.mark': { kind: 'single', scope: 'root' },
        'sidebar.brand.name': { kind: 'single', scope: 'root' },
        'sidebar.workspaces': { kind: 'single', scope: 'root' },
        'sidebar.settings': { kind: 'single', scope: 'root' },
        'sidebar.footer.action': { kind: 'list', scope: 'root' },
      },
      inject: injectSidebar,
    }, WorkbenchSidebar),
    'dsh-workbench: sidebar registration',
  )

  // 数据通道与管理面板：`remote` 缺席时这个子插件不激活，侧栏不受影响。
  ctx.plugin({
    name: 'dsh-workbench-panel',
    inject: ['slots', 'remote'],
    apply: (panelCtx: ClientContext) => {
      const remote = panelCtx.get('remote') as WorkbenchRemote | undefined

      // 命名空间是**独立的 cordis 服务**，key 是 `remote.<namespace>`——
      // `ctx.get('remote')` 拿到的是 Remote 服务本身，它身上没有这个属性。
      // 官方消费方写 `ctx.remote.pluginInventory` 走的也是这个服务 key。
      const face = (): EmployeeRemote | undefined =>
        panelCtx.get('remote.workbenchEmployee' as 'remote') as EmployeeRemote | undefined

      const employees = createEmployeeData(face)

      const skillFace = (): SkillRemote | undefined =>
        panelCtx.get('remote.workbenchSkill' as 'remote') as SkillRemote | undefined
      const skills = createSkillData(skillFace)

      // 挂本包的 Remote 契约。`$mount` 是异步的：挂上之前命名空间还不存在，
      // 所以挂上之后主动取一次——否则先切到员工分区的人会看到「通道没接上」，
      // 得手动点一次刷新才好。
      panelCtx.effect(() => {
        let dispose: (() => Promise<void>) | undefined
        let dropped = false
        void remote?.$mount(TYPERT_REMOTE).then((disposer) => {
          if (dropped) { void disposer(); return }
          dispose = disposer
          void employees.refresh()
          void skills.refresh()
        }, (error: unknown) => {
          console.error('dsh-workbench: Remote 契约挂载失败', error)
        })
        return () => {
          dropped = true
          void dispose?.()
        }
      }, 'dsh-workbench: remote contribution')

      const injectPanel = (): WorkbenchPanelInjected => ({
        ui,
        employees,
        skills,
        startSession: () => { ctx.workspaces.startSession() },
      })

      panelCtx.effect(
        () => panelCtx.slots.register({
          name: 'shell.overlay',
          id: 'workbench.panel',
          locale: NS,
          inject: injectPanel,
        }, WorkbenchPanel),
        'dsh-workbench: panel registration',
      )
    },
  })
}
