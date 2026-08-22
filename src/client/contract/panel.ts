/**
 * 管理面板的插槽契约。
 *
 * 面板占的是 ui-layout 的 `shell.overlay`——一个 list 槽，frame 级的浮层，
 * 在所有列之上、在它们的滚动容器之外。往 list 槽里加一份不排挤任何人，
 * 这正是本面板要的：对话界面原样留着，选回会话分区时面板整个不渲染。
 *
 * overlay 层本身是 click-through 的（`pointer-events: none`），直接子元素由
 * ui-layout 的 `.overlayLayer > *` 规则拿回 pointer-events，所以面板不用自己
 * 开——但也因此，面板必须自己让开侧栏那一列，否则会盖住导航。
 *
 * @module @staff-os/dsh-workbench/client/contract/panel
 */

import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// 仅类型：把 ui-layout 的 SlotMap 合并（其中的 'shell.overlay' 项）带进来。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type { WorkbenchUiStore } from '../workbench-ui.ts'
import type { EmployeeData } from '../employee/data.ts'
import type { SkillData } from '../skill/data.ts'

/** 本包私有的注入份额，来自 register 的 inject 工厂。 */
export interface WorkbenchPanelInjected {
  /** 与侧栏共享的 UI 状态：选中分区、侧栏宽度。 */
  ui: WorkbenchUiStore
  /** 员工域的数据层。 */
  employees: EmployeeData
  /** 技能域的数据层。 */
  skills: SkillData
  /**
   * 新建会话。
   *
   * 还没做成维护界面的域在面板上给的就是这个入口——那些域现在只能在会话里
   * 用工具管，按钮得能真的把人送过去，而不是只写一句「去会话里说」。
   */
  startSession: () => void
}

/** 面板组件的完整 props：owner 份额 + 本包注入 + 本地化。 */
export type WorkbenchPanelSlotProps =
  PropsRuntime<'shell.overlay'>
  & WorkbenchPanelInjected
  & PropsLocale<'workbench'>
