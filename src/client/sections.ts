/**
 * rail 上的分区表。
 *
 * 每个分区对应一个工作台域。除会话外，各分区在主区域整幅铺开：已经做成维护
 * 界面的域画自己的界面，还没做的域画一页说明——写清这域能做什么、由哪个工具
 * 管，比画一个只能看不能改的假面板有用。
 *
 * `summaryKey` / `actionKeys` / `tool` 是给后一种页面用的，做成维护界面之后
 * 就只剩 `titleKey` 还在用。
 *
 * ## 为什么有的分区不在 rail 上
 *
 * `visible: false` 的分区**只是不画入口**，那一域的工具照常注册、模型照常能
 * 用——`workbench_employee`、`workbench_knowledge`、`workbench_mcp`、
 * `workbench_plugin` 一个都没停。隐掉的理由是那几域的界面还没做完，摆一个
 * 点进去只有一页说明的入口，比不摆更让人以为坏了。做完一个把它的 `visible`
 * 去掉即可，别的地方不用动。
 *
 * @module @staff-os/dsh-workbench/client/sections
 */

import type { LocaleKey } from './locales.ts'

/** rail 上一个分区的标识。 */
export type WorkbenchSectionId =
  | 'sessions'
  | 'employees'
  | 'knowledge'
  | 'skills'
  | 'mcp'
  | 'plugins'

/** 一个分区的定义。 */
export interface WorkbenchSection {
  readonly id: WorkbenchSectionId
  /** 标题的字典键。 */
  readonly titleKey: LocaleKey
  /**
   * 在 rail 上画不画这个入口。
   *
   * 缺省为 `false`——新分区默认不露出来，做完界面再显式打开，避免半成品
   * 因为「忘了标」而进到用户面前。与这一域的工具能不能用无关。
   */
  readonly visible?: boolean
  /** 一句话说明的字典键；会话区没有（它由 ui-workspace 自己渲染）。 */
  readonly summaryKey?: LocaleKey
  /** 该域的管理工具名；会话区没有。 */
  readonly tool?: string
  /** 该域可做的事，字典键。 */
  readonly actionKeys?: readonly LocaleKey[]
}

/** rail 上的分区，自上而下。 */
export const SECTIONS: readonly WorkbenchSection[] = [
  {
    id: 'sessions',
    titleKey: 'section.sessions',
    visible: true,
  },
  {
    id: 'employees',
    titleKey: 'section.employees',
    summaryKey: 'section.employees.summary',
    tool: 'workbench_employee',
    actionKeys: [
      'action.employees.list',
      'action.employees.create',
      'action.employees.bind',
    ],
  },
  {
    id: 'knowledge',
    titleKey: 'section.knowledge',
    summaryKey: 'section.knowledge.summary',
    tool: 'workbench_knowledge',
    actionKeys: [
      'action.knowledge.create',
      'action.knowledge.add',
      'action.knowledge.search',
    ],
  },
  {
    id: 'skills',
    titleKey: 'section.skills',
    visible: true,
    summaryKey: 'section.skills.summary',
    tool: 'workbench_skill',
    actionKeys: [
      'action.skills.list',
      'action.skills.create',
      'action.skills.market',
    ],
  },
  {
    id: 'mcp',
    titleKey: 'section.mcp',
    summaryKey: 'section.mcp.summary',
    tool: 'workbench_mcp',
    actionKeys: [
      'action.mcp.list',
      'action.mcp.add',
      'action.mcp.import',
    ],
  },
  {
    id: 'plugins',
    titleKey: 'section.plugins',
    summaryKey: 'section.plugins.summary',
    tool: 'workbench_plugin',
    actionKeys: [
      'action.plugins.list',
      'action.plugins.install',
      'action.plugins.market',
    ],
  },
]

/** rail 上真正画出来的那些分区，自上而下。 */
export const VISIBLE_SECTIONS: readonly WorkbenchSection[]
  = SECTIONS.filter(section => section.visible === true)

/** 按 id 取一个分区；取不到时退回会话区。 */
export function sectionOf(id: WorkbenchSectionId): WorkbenchSection {
  return SECTIONS.find(section => section.id === id) ?? (SECTIONS[0] as WorkbenchSection)
}

/**
 * 这个分区现在露出来了吗。
 *
 * 面板要用它兜一次底：分区选择存在共享盒子里，用户上一次停在某个域、
 * 而那个域这一版被隐掉时，不兜底就会停在一个没有入口回不去的页面上。
 */
export function sectionVisible(id: WorkbenchSectionId): boolean {
  return sectionOf(id).visible === true
}
