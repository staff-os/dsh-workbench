/**
 * 技能域的数据层：一个盒子装快照，写操作走 Remote 再把结果填回去。
 *
 * 形态与员工域那一份（`client/employee/data.ts`）一致：写操作的返回自带一份
 * 刷新过的完整快照，界面改完不用再取一次；失败不抛，统一折成盒子里的
 * `error`，由界面决定怎么显示。
 *
 * 多出来的是**市场**：它不属于快照。快照是本机状态，市场是一次网络查询的
 * 结果，两者刷新时机不同——重取本机清单不该把搜索结果清掉，反之亦然。所以
 * 市场单独占盒子里的一格，并且带自己的 loading 与错误。
 *
 * 写操作的结果里还带一句 `message` 和一份 `activation`。`message` 说的是
 * 「做了什么」，`activation` 说的是「它现在到底生没生效」——后者是回读
 * `ctx.skills` 得来的事实，不是预测。两者拼成 `notice`，与 `error` 分开存：
 * 它说明操作**成功了**，混进错误位会让人分不清刚才那下到底成没成。
 *
 * @module @staff-os/dsh-workbench/client/skill/data
 */

import { createStore } from '../state.ts'
import type { Store } from '../state.ts'
import type {
  ActivationState,
  FileContent,
  MarketLabel,
  MarketPage,
  MarketPreview,
  MarketView,
  RemoteResult,
  ScanReport,
  SkillContent,
  SkillInput,
  SkillMutation,
  SkillRemote,
  SkillSnapshot,
  SkillVisibilityInput,
  UpdateStatus,
} from '../contract/remote.ts'

/** 技能域界面看到的全部状态。 */
export interface SkillState {
  /** 还没取到第一份快照。 */
  readonly loading: boolean
  /** 有一次写操作正在进行。 */
  readonly busy: boolean
  /** 最近一次失败的说明；成功后清空。 */
  readonly error?: string
  /** 最近一次写操作的结果说明，含生效结论。 */
  readonly notice?: string
  /** 最近一次写操作后那份技能的真实处境；没生效时界面要显著提示。 */
  readonly activation?: ActivationState
  /** 已装技能的更新状态，按技能名索引。 */
  readonly updates?: ReadonlyMap<string, UpdateStatus>
  /** 更新检查进行中。 */
  readonly updatesLoading: boolean
  /** 最近一份快照；从没取到过时不存在。 */
  readonly snapshot?: SkillSnapshot
  /** 市场搜索的结果；没搜过时不存在。 */
  readonly market?: MarketPage
  /** 市场搜索进行中。 */
  readonly marketLoading: boolean
  /** 市场搜索失败的说明。与本机清单的错误分开。 */
  readonly marketError?: string
  /** 各市场源提供的标签；查过之后才有，空数组说明源都不提供。 */
  readonly labels?: readonly MarketLabel[]
}

/** 技能数据层对外的样子。 */
export interface SkillData {
  /** 状态盒子。 */
  readonly store: Store<SkillState>
  /** 取一份新快照。 */
  refresh: () => Promise<void>
  /** 清掉当前的提示与错误。 */
  dismiss: () => void
  /** 读一个技能的正文。 */
  read: (name: string) => Promise<SkillContent | undefined>
  /** 读技能目录里某一个文件。 */
  readFile: (name: string, path: string) => Promise<FileContent | undefined>
  /** 静态扫一遍盘上这一份技能。 */
  scan: (name: string) => Promise<ScanReport | undefined>
  /** 新建一个本地技能。 */
  create: (input: SkillInput) => Promise<boolean>
  /** 改可见性。 */
  visibility: (name: string, visibility: SkillVisibilityInput) => Promise<boolean>
  /** 删掉一个本地技能。 */
  remove: (name: string) => Promise<boolean>
  /** 在市场里搜索、按榜单浏览、或按标签筛。 */
  search: (
    keyword?: string, page?: number, sort?: string, label?: string, labelRegistry?: string,
  ) => Promise<void>
  /** 取一次各源的标签目录。 */
  loadLabels: () => Promise<void>
  /** 从市场安装。 */
  install: (
    slug: string, version?: string, registry?: string, overwrite?: boolean, owner?: string,
  ) => Promise<boolean>
  /** 装一个用户选的本地压缩包。 */
  upload: (file: File, overwrite?: boolean, name?: string) => Promise<boolean>
  /** 读一个市场条目的详情。 */
  marketGet: (slug: string, registry?: string) => Promise<MarketView | undefined>
  /** 读市场条目包里某一个文件。 */
  marketFile: (
    slug: string, version?: string, registry?: string, owner?: string, path?: string,
  ) => Promise<FileContent | undefined>
  /** 静态扫一遍市场条目的包。 */
  marketScan: (
    slug: string, version?: string, registry?: string, owner?: string,
  ) => Promise<ScanReport | undefined>
  /** 读一个市场条目的包内容：正文与文件清单。 */
  marketPreview: (
    slug: string, version?: string, registry?: string, owner?: string,
  ) => Promise<MarketPreview | undefined>
  /** 把一个已装技能更新到来源上的最新版。 */
  update: (name: string) => Promise<boolean>
  /** 把所有有新版本的已装技能一次更新完。 */
  updateAll: () => Promise<boolean>
  /** 查哪些已装技能有新版本。 */
  checkUpdates: () => Promise<void>
}

/**
 * 浏览器上传技能包的体积上限，与 Node 半边的 `MAX_UPLOAD_BYTES` 同值。
 *
 * 这里挡一道是为了在读文件之前就当场给反馈——传上去再被拒，用户白等一次
 * 编码加一次往返。真正说了算的仍然是那边。
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

/** 认得出的技能包扩展名，与 Node 半边的 `ARCHIVE_SUFFIX` 同形。 */
export const ARCHIVE_ACCEPT = '.zip,.tar,.tgz,.tar.gz'

/**
 * 把一个 File 读成 base64。
 *
 * 走 `readAsDataURL` 而不是自己对 `ArrayBuffer` 做 `btoa`：后者要把字节先摊成
 * 一个字符串，几 MB 的包足以把 `String.fromCharCode(...bytes)` 的参数栈撑爆。
 */
async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => { reject(reader.error ?? new Error('读取文件失败')) }
    reader.onload = () => { resolve(typeof reader.result === 'string' ? reader.result : '') }
    reader.readAsDataURL(file)
  })
  const comma = dataUrl.indexOf(',')
  return comma === -1 ? '' : dataUrl.slice(comma + 1)
}

/** 初始状态：还没开始取。 */
const INITIAL: SkillState = { loading: true, busy: false, marketLoading: false, updatesLoading: false }

/** 把 Remote 失败转成一句人话。 */
function failureText(
  result: { readonly ok: false; readonly error: { code: string; message: string } },
): string {
  const { code, message } = result.error
  return message === '' ? code : message
}

/** 把一个抛出来的东西转成一句人话。 */
function causeText(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause)
}

/**
 * 建技能域的数据层。
 * @param remote - 取当前的 Remote 命名空间；没挂上时返回 undefined。
 * @returns 数据层。
 */
export function createSkillData(remote: () => SkillRemote | undefined): SkillData {
  const store = createStore<SkillState>(INITIAL)

  /** 没有通道时统一的说法。 */
  const noChannel = (): void => {
    store.set(current => ({
      ...current,
      loading: false,
      busy: false,
      marketLoading: false,
      updatesLoading: false,
      error: '技能数据通道没有接上：本插件的 Remote 契约未挂载',
    }))
  }

  /** 收下一份快照。 */
  const accept = (snapshot: SkillSnapshot): void => {
    store.set((current) => {
      const { error: _dropped, ...rest } = current
      return { ...rest, loading: false, busy: false, snapshot }
    })
  }

  /** 跑一次写操作：置忙、调用、按结果收快照或记错误。 */
  const mutate = async (
    call: (face: SkillRemote) => Promise<RemoteResult<SkillMutation>>,
  ): Promise<boolean> => {
    const face = remote()
    if (face === undefined) {
      noChannel()
      return false
    }
    store.set((current) => {
      const { error: _dropped, notice: _cleared, activation: _stale, ...rest } = current
      return { ...rest, busy: true }
    })
    let result
    try {
      result = await call(face)
    } catch (cause) {
      store.set(current => ({ ...current, busy: false, error: causeText(cause) }))
      return false
    }
    if (!result.ok) {
      store.set(current => ({ ...current, busy: false, error: failureText(result) }))
      return false
    }
    accept(result.value.snapshot)
    const { message, activation } = result.value
    store.set(current => ({
      ...current,
      // 生效结论接在结果说明后面：光说「已创建」而不说它被同名技能遮蔽了，
      // 人会以为这就完事了。
      notice: activation === undefined ? message : `${message}。${activation.summary}`,
      ...activation === undefined ? {} : { activation },
    }))
    return true
  }

  const api: SkillData = {
    store,

    refresh: async () => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return
      }
      store.set(current => ({ ...current, loading: current.snapshot === undefined }))
      let result: RemoteResult<SkillSnapshot>
      try {
        result = await face.list()
      } catch (cause) {
        store.set(current => ({ ...current, loading: false, error: causeText(cause) }))
        return
      }
      if (!result.ok) {
        store.set(current => ({ ...current, loading: false, error: failureText(result) }))
        return
      }
      accept(result.value)
    },

    dismiss: () => {
      store.set((current) => {
        const { error: _e, notice: _n, marketError: _m, activation: _a, ...rest } = current
        return rest
      })
    },

    read: async (name) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        const result = await face.read(name)
        if (!result.ok) {
          store.set(current => ({ ...current, error: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, error: causeText(cause) }))
        return undefined
      }
    },

    readFile: async (name, path) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        const result = await face.readFile(name, path)
        if (!result.ok) {
          store.set(current => ({ ...current, error: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, error: causeText(cause) }))
        return undefined
      }
    },

    scan: async (name) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        const result = await face.scan(name)
        if (!result.ok) {
          store.set(current => ({ ...current, error: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, error: causeText(cause) }))
        return undefined
      }
    },

    create: async (input) => mutate(face => face.create(input)),
    visibility: async (name, next) => mutate(face => face.visibility(name, next)),
    remove: async (name) => mutate(face => face.delete(name)),
    install: async (slug, version, registry, overwrite, owner) =>
      mutate(face => face.marketInstall(slug, version, registry, overwrite, owner)),
    // 四个参数一个都不能省：Remote 调用按 descriptor 的参数表逐位取值，
    // 少传就是「参数个数对不上」的调用错误，而不是「后面几个当没给」。
    // slug / registry / owner 交给宿主从安装台账里取——那才是「同一来源的
    // 更新版」的定义所在。
    update: async (name) => mutate(face => face.marketUpdate(name, undefined, undefined, undefined)),

    // 更新完立刻重查一遍：不重查的话，刚更新过的技能仍然挂着「有新版本」，
    // 看着像没生效。
    updateAll: async () => {
      const ok = await mutate(face => face.marketUpdateAll())
      if (ok) await api.checkUpdates()
      return ok
    },

    checkUpdates: async () => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return
      }
      store.set(current => ({ ...current, updatesLoading: true }))
      let result: RemoteResult<readonly UpdateStatus[]>
      try {
        result = await face.updates()
      } catch (cause) {
        store.set(current => ({ ...current, updatesLoading: false, error: causeText(cause) }))
        return
      }
      if (!result.ok) {
        store.set(current => ({ ...current, updatesLoading: false, error: failureText(result) }))
        return
      }
      const updates = new Map(result.value.map(status => [status.name, status]))
      store.set(current => ({ ...current, updatesLoading: false, updates }))
    },

    upload: async (file, overwrite, name) => {
      if (file.size > MAX_UPLOAD_BYTES) {
        store.set(current => ({
          ...current,
          error: `${file.name} 有 ${String(file.size)} 字节，超过上传上限 ${String(MAX_UPLOAD_BYTES)}`,
        }))
        return false
      }
      let encoded: string
      try {
        encoded = await fileToBase64(file)
      } catch (cause) {
        store.set(current => ({ ...current, error: causeText(cause) }))
        return false
      }
      return mutate(face => face.importPackage(file.name, encoded, overwrite, name))
    },

    marketGet: async (slug, registry) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        const result = await face.marketGet(slug, registry)
        if (!result.ok) {
          // 市场那边的错误位：详情取不到与本机清单无关。
          store.set(current => ({ ...current, marketError: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, marketError: causeText(cause) }))
        return undefined
      }
    },

    marketFile: async (slug, version, registry, owner, path) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        // 五个参数逐位传齐：descriptor 按位取值，少传就是调用错误。
        const result = await face.marketFile(slug, version, registry, owner, path)
        if (!result.ok) {
          store.set(current => ({ ...current, marketError: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, marketError: causeText(cause) }))
        return undefined
      }
    },

    marketScan: async (slug, version, registry, owner) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        // 四个参数逐位传齐：descriptor 的参数表按位取值，少传是调用错误。
        const result = await face.marketScan(slug, version, registry, owner)
        if (!result.ok) {
          store.set(current => ({ ...current, marketError: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, marketError: causeText(cause) }))
        return undefined
      }
    },

    marketPreview: async (slug, version, registry, owner) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return undefined
      }
      try {
        // 四个参数逐位传齐：descriptor 的参数表按位取值，少传是调用错误。
        const result = await face.marketPreview(slug, version, registry, owner)
        if (!result.ok) {
          store.set(current => ({ ...current, marketError: failureText(result) }))
          return undefined
        }
        return result.value
      } catch (cause) {
        store.set(current => ({ ...current, marketError: causeText(cause) }))
        return undefined
      }
    },

    loadLabels: async () => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return
      }
      try {
        const result = await face.marketLabels()
        // 取不到标签不是错误，只说明这些源没有标签目录。记一个空数组，
        // 界面据此不摆那条分组栏，也不会每次渲染都再问一遍。
        store.set(current => ({ ...current, labels: result.ok ? result.value : [] }))
      } catch {
        store.set(current => ({ ...current, labels: [] }))
      }
    },

    search: async (keyword, page, sort, label, labelRegistry) => {
      const face = remote()
      if (face === undefined) {
        noChannel()
        return
      }
      store.set((current) => {
        const { marketError: _dropped, ...rest } = current
        return { ...rest, marketLoading: true }
      })
      let result: RemoteResult<MarketPage>
      try {
        // 五个参数逐位传齐：descriptor 按位取值，少传就是调用错误。
        result = await face.marketSearch(keyword, page, sort, label, labelRegistry)
      } catch (cause) {
        store.set(current => ({ ...current, marketLoading: false, marketError: causeText(cause) }))
        return
      }
      if (!result.ok) {
        // 没配 registry 就是这一条：它不是本机清单的问题，别去污染那边的错误位。
        store.set(current => ({ ...current, marketLoading: false, marketError: failureText(result) }))
        return
      }
      store.set(current => ({ ...current, marketLoading: false, market: result.value }))
    },
  }

  return api
}
