/**
 * 一个够用的可订阅状态盒子。
 *
 * 侧栏和 overlay 面板是两棵**互不相邻**的 React 树——一个在 `sidebar` 槽里，
 * 一个在 `shell.overlay` 里，中间隔着 AppFrame。React context 跨不过去，所以
 * 分区选择、员工数据这类两边都要看的东西放在这里，各自用
 * `useSyncExternalStore` 订阅同一个盒子。
 *
 * 不引 zustand：客户端产物的模块表只认六个说明符，别的依赖一律内联进
 * bundle，为这点状态多背一个库不值当。
 *
 * @module @staff-os/dsh-workbench/client/state
 */

import { useSyncExternalStore } from 'react'

/** 一个可订阅的状态盒子。 */
export interface Store<T> {
  /** 当前值。 */
  get: () => T
  /** 写入新值并通知订阅者；值没变（`Object.is`）时不通知。 */
  set: (next: T | ((current: T) => T)) => void
  /** 订阅变更，返回退订。 */
  subscribe: (listener: () => void) => () => void
}

/**
 * 建一个状态盒子。
 * @param initial - 初始值。
 * @returns 盒子。
 */
export function createStore<T>(initial: T): Store<T> {
  let current = initial
  const listeners = new Set<() => void>()
  return {
    get: () => current,
    set: (next) => {
      const value = typeof next === 'function' ? (next as (c: T) => T)(current) : next
      if (Object.is(value, current)) return
      current = value
      for (const listener of [...listeners]) listener()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  }
}

/**
 * 在组件里订阅一个盒子。
 * @param store - 要订阅的盒子。
 * @returns 当前值。
 */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
