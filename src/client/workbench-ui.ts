/**
 * 侧栏与 overlay 面板之间共享的那点 UI 状态。
 *
 * 只有一件事：rail 上现在选中哪个分区。侧栏负责改它，面板负责跟着它显示或
 * 让开——选中会话分区时面板整个不渲染，中间列的对话界面原样露出来。
 *
 * 这块状态不能放在侧栏组件的 `useState` 里：面板在 `shell.overlay` 槽，
 * 与侧栏是两棵不相邻的 React 树（见 {@link module:@staff-os/dsh-workbench/client/state}）。
 *
 * @module @staff-os/dsh-workbench/client/workbench-ui
 */

import { createStore } from './state.ts'
import type { Store } from './state.ts'
import type { WorkbenchSectionId } from './sections.ts'

/** 共享的 UI 状态。 */
export interface WorkbenchUiState {
  /** rail 上选中的分区。 */
  readonly section: WorkbenchSectionId
  /** 侧栏内容列是否收起；面板靠它算自己从哪儿开始铺。 */
  readonly sidebarWidth: number
}

/** 侧栏与面板共享的状态盒子。 */
export type WorkbenchUiStore = Store<WorkbenchUiState>

/**
 * 建共享状态盒子。
 * @returns 盒子，初始停在会话分区。
 */
export function createWorkbenchUi(): WorkbenchUiStore {
  return createStore<WorkbenchUiState>({ section: 'sessions', sidebarWidth: 0 })
}
