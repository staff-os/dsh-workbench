/**
 * 员工域的数据层：一个盒子装快照，写操作走 Remote 再把结果填回去。
 *
 * 每个写方法拿到的返回里都带一份**刷新过的完整快照**（Node 半边一并算好），
 * 所以界面改完东西不用再取一次列表，也不会出现「改完了但列表还是旧的」。
 *
 * 失败不抛：Remote 把载体故障也折进 `ok: false` 分支，这里统一转成盒子里的
 * `error` 字段，由界面决定怎么显示。抛异常穿过 React 事件处理器只会变成一条
 * 控制台噪音，界面上什么都看不见。
 *
 * @module @staff-os/dsh-workbench/client/employee/data
 */

import { createStore } from '../state.ts'
import type { Store } from '../state.ts'
import type {
  EmployeeBindingInput,
  EmployeeComposition,
  EmployeeMetadataInput,
  EmployeeRemote,
  EmployeeSnapshot,
  RemoteResult,
} from '../contract/remote.ts'

/** 员工域界面看到的全部状态。 */
export interface EmployeeState {
  /** 还没取到第一份快照。 */
  readonly loading: boolean
  /** 有一次写操作正在进行。 */
  readonly busy: boolean
  /** 最近一次失败的说明；成功后清空。 */
  readonly error?: string
  /** 最近一份快照；从没取到过时不存在。 */
  readonly snapshot?: EmployeeSnapshot
  /** 当前选中的员工 id。 */
  readonly selected?: string
}

/** 员工数据层对外的样子。 */
export interface EmployeeData {
  /** 状态盒子。 */
  readonly store: Store<EmployeeState>
  /** 取一份新快照。 */
  refresh: () => Promise<void>
  /** 选中一个员工。 */
  select: (id: string | undefined) => void
  /** 以模板复制一个新员工。 */
  create: (id: string, from?: string, name?: string) => Promise<boolean>
  /** 改展示元数据。 */
  update: (id: string, metadata: EmployeeMetadataInput) => Promise<boolean>
  /** 改资源绑定。 */
  bind: (id: string, bindings: EmployeeBindingInput) => Promise<boolean>
  /** 删掉一个员工。 */
  remove: (id: string) => Promise<boolean>
  /** 读 agent 组合文件：原文加解析出来的组成。 */
  read: (id: string) => Promise<EmployeeComposition | undefined>
}

/** 初始状态：还没开始取。 */
const INITIAL: EmployeeState = { loading: true, busy: false }

/**
 * 把 Remote 失败转成一句人话。
 *
 * 通道没挂上时 `remote` 是 undefined——那是部署问题而不是操作失败，说清楚
 * 是「通道没接上」比让界面一直转圈有用。
 */
function failureText(result: { readonly ok: false; readonly error: { code: string; message: string } }): string {
  const { code, message } = result.error
  return message === '' ? code : message
}

/**
 * 建员工域的数据层。
 * @param remote - 取当前的 Remote 命名空间；没挂上时返回 undefined。
 * @returns 数据层。
 */
export function createEmployeeData(remote: () => EmployeeRemote | undefined): EmployeeData {
  const store = createStore<EmployeeState>(INITIAL)

  /** 没有通道时统一的说法。 */
  const noChannel = (): void => {
    store.set(current => ({
      ...current,
      loading: false,
      busy: false,
      error: '员工数据通道没有接上：本插件的 Remote 契约未挂载',
    }))
  }

  /** 收下一份快照，顺带修正选中项。 */
  const accept = (snapshot: EmployeeSnapshot): void => {
    store.set((current) => {
      const stillThere = current.selected !== undefined
        && snapshot.employees.some(employee => employee.id === current.selected)
      const selected = stillThere ? current.selected : snapshot.employees[0]?.id
      return {
        loading: false,
        busy: false,
        snapshot,
        ...selected === undefined ? {} : { selected },
      }
    })
  }

  /** 跑一次写操作：置忙、调用、按结果收快照或记错误。 */
  const mutate = async (
    call: (face: EmployeeRemote) => Promise<RemoteResult<{ readonly snapshot: EmployeeSnapshot }>>,
    selectAfter?: string,
  ): Promise<boolean> => {
    const face = remote()
    if (face === undefined) {
      noChannel()
      return false
    }
    store.set(current => ({ ...current, busy: true }))
    let result: RemoteResult<{ readonly snapshot: EmployeeSnapshot }>
    try {
      result = await call(face)
    } catch (cause) {
      store.set(current => ({
        ...current,
        busy: false,
        error: cause instanceof Error ? cause.message : String(cause),
      }))
      return false
    }
    if (!result.ok) {
      store.set(current => ({ ...current, busy: false, error: failureText(result) }))
      return false
    }
    if (selectAfter !== undefined) store.set(current => ({ ...current, selected: selectAfter }))
    accept(result.value.snapshot)
    return true
  }

  return {
    store,

    refresh: async () => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return
      }
      store.set(current => ({ ...current, loading: current.snapshot === undefined }))
      let result: RemoteResult<EmployeeSnapshot>
      try {
        result = await face.list()
      } catch (cause) {
        store.set(current => ({
          ...current,
          loading: false,
          error: cause instanceof Error ? cause.message : String(cause),
        }))
        return
      }
      if (!result.ok) {
        store.set(current => ({ ...current, loading: false, error: failureText(result) }))
        return
      }
      accept(result.value)
    },

    select: (id) => {
      // 换选中项顺手清掉上一条错误：那条错误说的是上一次操作，留着会让人
      // 以为刚点的这个员工有问题。
      store.set((current) => {
        const { error: _dropped, ...rest } = current
        return { ...rest, ...id === undefined ? {} : { selected: id } }
      })
    },

    create: async (id, from, name) => mutate(face => face.create(id, from, name), id),
    update: async (id, metadata) => mutate(face => face.update(id, metadata)),
    bind: async (id, bindings) => mutate(face => face.bind(id, bindings)),
    remove: async (id) => mutate(face => face.delete(id)),

    read: async (id) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        const result = await face.read(id)
        if (!result.ok) {
          store.set(current => ({ ...current, error: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({
          ...current,
          error: cause instanceof Error ? cause.message : String(cause),
        }))
        return undefined
      }
    },
  }
}
