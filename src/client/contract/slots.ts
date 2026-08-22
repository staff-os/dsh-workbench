/**
 * 工作台侧栏的插槽契约。
 *
 * 本包占的是 ui-layout 的 `sidebar` 槽，而**占据即替换**：一旦占了，原
 * ui-sidebar 连同它声明的那几个内层座位一起消失，ui-workspace 与 ui-settings
 * 就没地方落了。所以这里把 `sidebar.workspaces` 与 `sidebar.settings` 原样
 * 重新声明出来并继续托管——名字、kind、scope、owner 字段都与上游一致，
 * 那两个插件不用改一行代码。
 *
 * `sidebar.brand.mark` / `sidebar.brand.name` 同理重新声明：品牌位是部署方
 * 会替换的东西，少声明一个就等于把别人的定制悄悄弄没了。
 *
 * @module @staff-os/dsh-workbench/client/contract/slots
 */

import type { PropsLocale, PropsRenderSlots, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// 仅类型：把 ui-layout 的 SlotMap 合并（其中的 'sidebar' 项）带进来，
// 好让 PropsRuntime<'sidebar'> 解析得出。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client'
import type { WorkbenchSectionId } from '../sections.ts'
import type { WorkbenchUiStore } from '../workbench-ui.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** 品牌标记，画在 rail 顶端。与上游同名同形，部署方的替换继续生效。 */
    'sidebar.brand.mark': { kind: 'single'; scope: 'root'; owner: SidebarBrandMarkOwnerProps }
    /** 品牌名，画在内容列的标题行。 */
    'sidebar.brand.name': { kind: 'single'; scope: 'root'; owner: SidebarBrandNameOwnerProps }
    /** 会话浏览区：ui-workspace 落在这里。 */
    'sidebar.workspaces': { kind: 'single'; scope: 'root'; owner: SidebarSectionOwnerProps }
    /** 设置座位：ui-settings 落在这里。 */
    'sidebar.settings': { kind: 'single'; scope: 'root'; owner: SidebarSettingsOwnerProps }
    /** 设置旁边的附加动作。 */
    'sidebar.footer.action': { kind: 'list'; scope: 'root'; owner: SidebarFooterActionOwnerProps }
  }
}

/** 品牌标记占位方拿到的几何信息。 */
export interface SidebarBrandMarkOwnerProps {
  /** 期望的正方形边长（像素）。 */
  size: number
}

/** 品牌名占位方不需要外部信息，自己决定内容与宽度。 */
export interface SidebarBrandNameOwnerProps {
  children?: never
}

/**
 * 会话区占位方拿到的那一份。
 *
 * 字段与上游一致。注意 `wide` 在这里**恒为 true**：本侧栏的 rail 是常驻的
 * 独立一列，会话区只在内容列展开时才渲染，不存在「会话区自己缩成图标条」
 * 那个状态——那是上游单列侧栏才有的形态。
 */
export interface SidebarSectionOwnerProps {
  /** 是否渲染完整形态。本侧栏恒为 true。 */
  wide: boolean
  /** 请求展开侧栏；内容列已经是展开态时是空操作。 */
  expandSidebar: () => void
}

/** 设置座位占位方拿到的那一份。 */
export interface SidebarSettingsOwnerProps {
  /** 是否渲染完整形态；内容列收起时为 false，设置只画一个 rail 图标。 */
  wide: boolean
}

/** 底部附加动作拿到的那一份。 */
export interface SidebarFooterActionOwnerProps {
  /** 是否渲染完整形态。 */
  wide: boolean
}

/** 本包私有的注入份额，来自 register 的 inject 工厂。 */
export interface WorkbenchSidebarInjected {
  /**
   * 与管理面板共享的 UI 状态。
   *
   * 选中的分区不能只放在侧栏的 `useState` 里：面板在 `shell.overlay` 槽，
   * 与侧栏是两棵不相邻的 React 树，context 跨不过去。
   */
  ui: WorkbenchUiStore
  /** 新建会话：带 workspace 就复用或新建它的空会话，不带则沿用当前的。 */
  startSession: (workspaceId?: WorkspaceId) => void
  /** 切换内容列的展开/收起。 */
  toggleSidebar: () => void
}

/** 组件完整 props：owner 份额 + 声明出的座位 + 本包注入 + 本地化。 */
export type WorkbenchSidebarProps =
  PropsRuntime<'sidebar'>
  & PropsRenderSlots<
    | 'sidebar.brand.mark'
    | 'sidebar.brand.name'
    | 'sidebar.workspaces'
    | 'sidebar.settings'
    | 'sidebar.footer.action'
  >
  & WorkbenchSidebarInjected & PropsLocale<'workbench'>

/** 当前选中的 rail 分区。 */
export type { WorkbenchSectionId }
