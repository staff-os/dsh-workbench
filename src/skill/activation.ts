/**
 * 技能写盘之后到底什么时候生效——以及怎么当场验证。
 *
 * ## 「重启 DSH 后生效」是错的
 *
 * 这一域早先每个写操作都回一句「重启 DSH 后生效」。对着源码核过一遍，
 * 这句话不成立，而且它会让人白白重启一次：
 *
 * 1. `dsh-skill-filesystem` 默认 `watch: true`，用 chokidar 盯着每个技能根
 *    （含 `$DSH_HOME/skills`），`depth: 1`，写完有个约 200ms 的稳定期。
 *    新增/删除技能目录、`<name>/SKILL.md` 的增删改、扁平 `<name>.md` 的增删改，
 *    都算「目录变了」。
 * 2. 它随即调用注册时拿到的 `control.invalidate()`。这个回调进到
 *    `SkillRegistry.invalidateCache()`，**清掉的是整个 registry 的发现缓存**
 *    （不只是那一个 provider 的），并广播 `skills/change`。
 * 3. `dsh-tool-skill` 在**每一个** `agent/pre-step` 都重新 `snapshot()`，
 *    对比 digest，变了就往会话里追加一条完整的替换目录。
 * 4. 用户那条 `/name` 调用路径更直接：它每次都现查 `ctx.skills.get(name)`，
 *    完整定义**根本不进缓存**。
 *
 * 也就是说：写完盘，下一个模型回合就生效，人不用做任何事。
 *
 * ## 那为什么还要这个模块
 *
 * 两件事上面那条链路给不了：
 *
 * **一是确定性。** watcher 可以被关（`watch: false`）、可以在容器里因为
 * inotify 配额起不来（此时 provider 把观察标记成不完整、但仍可读）。所以这里
 * 自己注册一个不产出任何技能的 provider，只为拿到那个 `invalidate()` 句柄，
 * 写完盘就主动敲一下。清缓存是全局的，敲谁的句柄都一样。
 *
 * **二是验证。** 「生效了没有」的唯一诚实答案不是一句预测，而是回头查一次
 * `ctx.skills`：这个名字现在在不在，赢的是不是我刚写的那份。同名遮蔽、
 * frontmatter 被 DSH 拒收，这两种「写成功了但没生效」只有回读才看得见。
 *
 * ## 回读查不到，不等于没生效
 *
 * 本插件挂在宿主层，是个**无作用域**的上下文，而 `ctx.skills` 是「宿主层 +
 * 每个作用域一层」的分层注册表。web profile 的出厂组合把宿主层的
 * `skill-filesystem` 关掉了，改由每个 agent preset 在自己那一层挂
 * （`packages/bundle/web-app/cordis.patch.yml` 里写了原因：本地发现归预设所有）。
 * 于是从这里看过去，`$DSH_HOME/skills` 下的技能一个都查不到——而会话里那个
 * agent 照常能用它们。
 *
 * 所以「查不到」有三种成因，处置完全不同，不能合成一句话：这一份被拒收、
 * 宿主层根本不扫这个根、以及两者都不是。分辨的办法见
 * {@link SkillActivation.verify} 里那条私有分支。
 *
 * @module @staff-os/dsh-workbench/skill/activation
 */

import { resolve } from 'node:path'
import { Context, Service } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-skill'
import type { SkillDefinition } from '@deepseek-ai/dsh-skill'
import { scanLocalSkills } from './local.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    workbenchSkillActivation: SkillActivation
  }
}

/**
 * 本插件在 `ctx.skills` 上的 provider 名。
 *
 * 它一个技能都不产出。存在的唯一理由是 `registerProvider` 只在这个入口
 * 交出 `invalidate()` 句柄，而那是「让刚写的技能立刻被重新发现」的正规途径。
 */
export const SIGNAL_PROVIDER = 'workbench-signal'

/** 写完盘之后，那份技能现在的处境。 */
export interface ActivationState {
  /** DSH 现在认这个名字。 */
  readonly active: boolean
  /** 生效的那份就是本插件刚写的那份。 */
  readonly mine: boolean
  /** 实际生效那份的来源（`project-dsh`、`bundled` 之类）；没生效时不存在。 */
  readonly winnerSource?: string
  /** 实际生效那份的路径；没生效时不存在。 */
  readonly winnerPath?: string
  /** 一句给人看的结论。界面与工具都直接显示这句。 */
  readonly summary: string
  /**
   * 这句结论说的是**这一份技能**，还是**整个部署**。
   *
   * 「宿主层不扫本地技能根」对根下每一个技能都成立，说不出这一份的任何事。
   * 刚写完一份技能时它仍然值得说——那一下到底生没生效是当时的问题；但摆在
   * 每一页详情的顶上，就是同一段话重复 N 遍，把真正与这一份有关的话
   * （被拒收、被遮蔽）淹掉。所以详情页只显示 `skill` 这一档。
   */
  readonly scope: 'skill' | 'deployment'
}

/**
 * 技能生效的信号与验证。注册为 `ctx.workbenchSkillActivation`。
 */
export class SkillActivation extends Service {
  /** provider 注册时拿到的失效句柄；`ctx.skills` 不在时为空。 */
  private invalidateProvider: (() => void) | undefined

  constructor(ctx: Context) {
    super(ctx, 'workbenchSkillActivation')

    const skills = ctx.get('skills')
    if (skills === undefined) return
    // 注册一个空 provider，只为换那个 invalidate 句柄。fiber 卸载时
    // Cordis 自己会注销它，这里不需要额外的清理。
    skills.registerProvider((control) => {
      this.invalidateProvider = control.invalidate
      return {
        name: SIGNAL_PROVIDER,
        list: async () => [],
        get: async () => undefined,
      }
    })
  }

  /**
   * 告诉 DSH 技能目录变了，让它重新发现。
   *
   * 写完盘立刻调用。`skill-filesystem` 的 watcher 通常也会在约 200ms 后自己
   * 发现同一件事，这里只是把「通常」换成「一定」，并且省掉那段稳定期。
   * 重复失效是无害的：它只是清缓存加一次广播。
   */
  notifyChanged(): void {
    this.invalidateProvider?.()
  }

  /**
   * 回头查一次：这个技能现在到底生没生效。
   *
   * @param name - 技能名。
   * @param root - 用户级技能根，用来判断赢家是不是本插件写的那份。
   * @param cwd - 查询用的工作目录；项目级技能的遮蔽与它有关。
   * @returns 当前处境，含一句可以直接显示的结论。
   */
  async verify(name: string, root: string, cwd?: string): Promise<ActivationState> {
    const skills = this.ctx.get('skills')
    if (skills === undefined) {
      return {
        active: false,
        mine: false,
        summary: '这个部署没装 DSH 的技能服务（`ctx.skills`），技能文件已落盘但不会被任何会话读到',
        // 没有技能服务是整个部署的事，与哪一份技能无关。
        scope: 'deployment',
      }
    }
    const view = { ...cwd === undefined ? {} : { cwd } }
    const winner = await skills.get(name, view)
    if (winner === undefined) return this.explainMissing(name, root, view)
    const mine = winnerIsUnder(winner, root)
    if (mine) {
      return {
        active: true,
        mine: true,
        winnerSource: winner.source,
        ...winner.path === undefined ? {} : { winnerPath: winner.path },
        summary: `已生效：下一个模型回合就能用 "${name}"，无需重启`,
        scope: 'skill',
      }
    }
    return {
      active: true,
      mine: false,
      winnerSource: winner.source,
      ...winner.path === undefined ? {} : { winnerPath: winner.path },
      summary: `已落盘，但当前生效的是 ${winner.source} 的同名技能`
        + `${winner.path === undefined ? '' : `（${winner.path}）`}`
        + '，你改的这份被它遮蔽，不会有任何效果',
      scope: 'skill',
    }
  }

  /**
   * `ctx.skills.get()` 查不到时，说清到底是哪一种「查不到」。
   *
   * 三种情形的处置完全不同，混成一句「多半是 frontmatter 不合规」会把人引到
   * 一份根本没问题的文件上：
   *
   * 1. **这一份确实不合规**——本插件的解析规则是照着 `skill-filesystem` 抄的，
   *    它拒收就等于 DSH 拒收。这时给出具体理由（哪个键该改成什么）。
   * 2. **宿主层压根不扫本地技能根**。web profile 的出厂组合就是这样：
   *    `skill-filesystem` 在宿主层是关掉的，改由每个 agent preset 挂进它自己的
   *    作用域层。于是从本插件这个无作用域的上下文看过去，任何本地技能都查不到，
   *    而会话里那个 agent 照样能用。这时说「没生效」是错的。
   * 3. 根扫得到、这一份也合规，却仍然查不到——这时诚实地说不知道，别编原因。
   *
   * @param name - 技能名。
   * @param root - 用户级技能根。
   * @param view - 传给 `ctx.skills` 的查询选项。
   * @returns 对应情形的结论。
   */
  private async explainMissing(
    name: string,
    root: string,
    view: { cwd?: string },
  ): Promise<ActivationState> {
    const scan = await scanLocalSkills(root)
    const rejected = scan.rejected.find(entry => entry.hint === name)
    if (rejected !== undefined) {
      return {
        active: false,
        mine: false,
        summary: `已落盘，但 DSH 会整份丢弃它：${rejected.reason}`,
        scope: 'skill',
      }
    }

    const skills = this.ctx.get('skills')
    const catalog = skills === undefined ? [] : await skills.list(view)
    const base = resolve(root)
    const scansRoot = catalog.some((summary) => {
      const resourceBase = summary.resourceBase
      return resourceBase !== undefined && resourceBase.kind === 'directory'
        && isUnder(resourceBase.path, base)
    })
    if (!scansRoot && scan.skills.length > 0) {
      return {
        active: false,
        mine: false,
        summary: `已落盘。这个部署的宿主层不扫本地技能根——web profile 的出厂组合就把 `
          + '`skill-filesystem` 关在宿主层、交给各个 agent preset 在自己的作用域里挂，'
          + `所以这里查不到 "${name}" 是正常的，会话按预设加载时能看到它`,
        // 这句话与哪一个技能无关，根下每一份都一样。
        scope: 'deployment',
      }
    }

    return {
      active: false,
      mine: false,
      summary: `已落盘，frontmatter 也合规，但 DSH 现在仍然不认 "${name}"——`
        + '原因不在本插件能看到的范围里，去看 DSH 的日志（它丢弃技能文件时会记一行 warn）',
      scope: 'skill',
    }
  }
}

/**
 * 详情页顶上该不该挂这句结论。
 *
 * 只有说得出**这一份技能**的话才挂。部署级的结论（没装技能服务、宿主层不扫
 * 本地技能根）对根下每一份都一样，摆在每一页详情顶上就是同一段话重复 N 遍，
 * 还会把真正与这一份有关的（被拒收、被遮蔽）淹掉。写操作之后的提示不走这里，
 * 那一下到底生没生效是当时的问题，部署级的原因照说不误。
 *
 * @param state - 查到的处境；没查（没有 activation 服务）时是 `undefined`。
 * @returns 要显示的那句话，或 `undefined` 表示这一页不说话。
 */
export function detailNote(state: ActivationState | undefined): string | undefined {
  return state === undefined || state.scope !== 'skill' ? undefined : state.summary
}

/** `path` 是不是落在 `base` 之下（`base` 已 resolve 过）。 */
function isUnder(path: string, base: string): boolean {
  const resolved = resolve(path)
  return resolved === base || resolved.startsWith(`${base}${pathSeparator(resolved, base)}`)
}

/** 赢家是不是落在某个技能根之下。 */
function winnerIsUnder(winner: SkillDefinition, root: string): boolean {
  if (winner.path === undefined) return false
  return isUnder(winner.path, resolve(root))
}

/** 取该平台的分隔符；`resolve` 的结果里两种斜杠不会混用。 */
function pathSeparator(path: string, base: string): string {
  return path.slice(base.length).startsWith('\\') ? '\\' : '/'
}

export default SkillActivation
