/**
 * 工作台管理面板：铺在 `shell.overlay` 上，从侧栏右边缘起占满剩下的地方。
 *
 * 非会话分区的侧栏只剩一条 56px 的 rail，所以「剩下的地方」实际是整幅——
 * 每个域的界面横铺开，中间没有第二列。侧栏那条轨道在 AppFrame 里仍按用户
 * 拖出的宽度占着，多出来的那截空底色由本面板盖住（overlay 的 z-index 高于
 * 侧栏列）。
 *
 * 为什么是 overlay 而不是中间列：中间列那个 `conversation` 槽是 single，已经
 * 被 ui-conversation 占着，占它就等于把整个对话界面连同它声明的座位一起换掉
 * ——那意味着自己重写一遍对话。overlay 是 list 槽，加一份进去谁都不影响；
 * 选回会话分区时本面板整个不渲染，对话界面原样露出来。
 *
 * overlay 那一层是 `inset: 0` 且 click-through 的（entry 自己开 pointer-events），
 * 所以这里要自己让开侧栏那一列——宽度由侧栏写进共享盒子，它才是知道自己
 * 有多宽的人。
 *
 * @module @staff-os/dsh-workbench/client/WorkbenchPanel
 */

import { useStore } from './state.ts'
import { sectionOf, sectionVisible } from './sections.ts'
import { EmployeeSection } from './employee/EmployeeSection.tsx'
import { SkillSection } from './skill/SkillSection.tsx'
import type { WorkbenchPanelSlotProps } from './contract/panel.ts'
import type { WorkbenchSectionId } from './sections.ts'
import type { LocaleKey } from './locales.ts'
import css from './WorkbenchPanel.module.css'

/**
 * 画管理面板。
 * @param props - 组合出来的插槽 props，见 contract/panel.ts。
 * @returns 面板；停在会话分区时是 null。
 */
export function WorkbenchPanel({ ui, employees, skills, startSession, t }: WorkbenchPanelSlotProps) {
  const { section, sidebarWidth } = useStore(ui)

  // 会话分区不画：那一格归 ui-workspace 和中间列的对话界面。
  //
  // 分区被隐掉时也走这条：rail 上没有它的入口，画出来就是一个回不去的页面。
  // 停在哪个分区是存在共享盒子里的，上一次停的地方可能这一版已经不露出来了。
  if (section === 'sessions' || !sectionVisible(section)) return null

  return (
    <div className={css.panel} style={{ left: `${String(sidebarWidth)}px` }}>
      {section === 'employees'
        ? <EmployeeSection data={employees} t={t} />
        : section === 'skills'
        ? <SkillSection data={skills} t={t} />
        : (
          <Placeholder
            section={section}
            t={t}
            onStart={() => {
              // 开会话得连着切回会话分区：不切的话新会话开在本面板底下，
              // 按钮看着像没反应。
              ui.set(current => ({ ...current, section: 'sessions' }))
              startSession()
            }}
          />
        )}
    </div>
  )
}

/**
 * 还没做成维护界面的域，先照实说这一域现在只能用工具管。
 *
 * 版式与员工域对齐（同样的标题行 + 可滚正文），换域时不会跳成另一种页面；
 * 内容是原先侧栏那块说明面板搬过来的——那块在这里才有位置把话说全。
 */
function Placeholder({ section, t, onStart }: {
  readonly section: Exclude<WorkbenchSectionId, 'sessions' | 'employees' | 'skills'>
  readonly t: (key: LocaleKey) => string
  readonly onStart: () => void
}) {
  const definition = sectionOf(section)
  return (
    <div className={css.section}>
      <header className={css.head}>
        <h1 className={css.title}>{t(definition.titleKey)}</h1>
        {definition.summaryKey !== undefined && (
          <p className={css.subtitle}>{t(definition.summaryKey)}</p>
        )}
      </header>

      <div className={css.body}>
        {definition.actionKeys !== undefined && (
          <ul className={css.actions}>
            {definition.actionKeys.map(key => (
              <li key={key} className={css.action}>{t(key)}</li>
            ))}
          </ul>
        )}
        {definition.tool !== undefined && (
          <p className={css.toolLine}>
            <span>{t('panel.tool')}</span>
            <code className={css.toolName}>{definition.tool}</code>
          </p>
        )}
        <p className={css.hint}>{t('panel.hint')}</p>
        <button type="button" className={css.startButton} onClick={onStart}>
          {t('panel.start')}
        </button>
      </div>
    </div>
  )
}
