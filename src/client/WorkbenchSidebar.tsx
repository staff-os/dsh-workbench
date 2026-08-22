/**
 * 工作台侧栏：常驻 56px 图标 rail + 一列随分区切换的内容。
 *
 * 与上游单列侧栏最大的不同是 **rail 常驻**：收起只收内容列，rail 原样留着，
 * 所以任何宽度下都能切分区。上游的收起态是整列缩成 56px 图标条，那是同一
 * 列的两个形态，切不了分区。
 *
 * 会话分区把内容整块交给 `sidebar.workspaces`（ui-workspace），设置座位交给
 * `sidebar.settings`（ui-settings）——占了 `sidebar` 就等于把上游那几个座位
 * 一起拿走，重新托管是让它们继续工作的唯一办法。
 *
 * **内容列只属于会话分区。** 其余分区的界面在右边整幅铺开，这一列不再渲染，
 * 侧栏缩成一条 rail。理由是内容列在那些分区里只能摆一份与右边讲同一件事的
 * 摘要，既切走一块可用宽度，又让人先在窄栏里选一次、再到右边选一次。
 *
 * @module @staff-os/dsh-workbench/client/WorkbenchSidebar
 */

import { useEffect } from 'react'
import clsx from 'clsx'
import {
  FishLogo,
  IconAgentPresetOutline16,
  IconApiOutline14,
  IconCordisPluginOutline14,
  IconDataOutline16,
  IconNewChatOutline16,
  IconPanelLeftOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReactNode } from 'react'
import { IconWrenchOutline16 } from './icons.tsx'
import type { WorkbenchSidebarProps } from './contract/slots.ts'
import { VISIBLE_SECTIONS } from './sections.ts'
import type { WorkbenchSectionId } from './sections.ts'
import { useStore } from './state.ts'
import css from './WorkbenchSidebar.module.css'

/** rail 图标的统一尺寸。 */
const RAIL_ICON = 18

/**
 * rail 那一列的宽度，与 WorkbenchSidebar.module.css 里的 `.rail` 对齐。
 *
 * 内容列不渲染时侧栏实际只占这么宽，管理面板要从这里起铺。注意 AppFrame 的
 * 那条轨道仍是 `width` 那么宽——面板在 overlay 层上，正好把多出来的那截
 * 空侧栏底色盖住，所以不用去改布局 store（`ctx.layout` 只给了 toggle，
 * 拿它模拟「关上」会跟用户自己的收起状态打架）。
 */
const RAIL_WIDTH = 56

/** 各分区的图标。放在组件这边而不是 sections.ts：那份表要能被非 React 代码读。 */
function sectionIcon(id: WorkbenchSectionId): ReactNode {
  switch (id) {
    case 'sessions': return <IconNewChatOutline16 size={RAIL_ICON} />
    case 'employees': return <IconAgentPresetOutline16 size={RAIL_ICON} />
    case 'knowledge': return <IconDataOutline16 size={RAIL_ICON} />
    case 'skills': return <IconWrenchOutline16 size={RAIL_ICON} />
    case 'mcp': return <IconApiOutline14 size={RAIL_ICON} />
    case 'plugins': return <IconCordisPluginOutline14 size={RAIL_ICON} />
  }
}

/**
 * 画工作台侧栏。
 * @param props - 组合出来的插槽 props，见 contract/slots.ts。
 * @returns 侧栏元素树。
 */
export function WorkbenchSidebar({
  collapsed,
  width,
  ui,
  startSession,
  toggleSidebar,
  t,
  renderSlot,
}: WorkbenchSidebarProps) {
  const active = useStore(ui).section

  // 内容列只在会话分区出现，且用户没把它收起来的时候。
  const showContent = active === 'sessions' && !collapsed

  // 侧栏是唯一知道自己有多宽的人，管理面板靠这个数字决定从哪儿开始铺。
  useEffect(() => {
    ui.set(current => ({ ...current, sidebarWidth: showContent ? width : RAIL_WIDTH }))
  }, [ui, width, showContent])

  /** 点 rail 图标：切分区。 */
  const pick = (id: WorkbenchSectionId): void => {
    ui.set(current => ({ ...current, section: id }))
    // 只有回会话时才展开：内容列收起后，rail 上没有别的展开入口，这是回到
    // 会话列表的唯一办法。其余分区不展开——它们的界面在右边。
    if (id === 'sessions' && collapsed) toggleSidebar()
  }

  return (
    <div className={css.root}>
      <div className={css.rail}>
        <span className={css.brandMark} aria-hidden="true">
          {renderSlot('sidebar.brand.mark', { size: 24 }, { fallback: <FishLogo size={24} /> })}
        </span>

        <div className={css.railGroup} role="tablist" aria-orientation="vertical">
          {VISIBLE_SECTIONS.map(item => (
            <Tooltip key={item.id} label={t(item.titleKey)} delayMs={400}>
              <button
                type="button"
                role="tab"
                aria-selected={item.id === active}
                className={clsx(css.railButton, item.id === active && css.active)}
                aria-label={t(item.titleKey)}
                onClick={() => { pick(item.id) }}
              >
                {sectionIcon(item.id)}
              </button>
            </Tooltip>
          ))}
        </div>

        <div className={clsx(css.railGroup, css.bottom)}>
          <span className={css.railDivider} aria-hidden="true" />
          {/* 内容列不在时设置座位画在 rail 上；它在时座位在内容列底部，
              两处只能渲染一份，否则同一个座位会被挂两次。 */}
          {!showContent && (
            <div className={css.railFoot}>
              {renderSlot('sidebar.footer.action', { wide: false })}
              {renderSlot('sidebar.settings', { wide: false })}
            </div>
          )}
          <span className={css.avatar} aria-hidden="true">DS</span>
        </div>
      </div>

      {showContent && (
        <div className={css.content}>
          <div className={css.contentHead}>
            <span className={css.title}>
              {renderSlot('sidebar.brand.name', {}, { fallback: t('section.sessions') })}
            </span>
            <Tooltip label={t('session.new')} delayMs={400}>
              <button
                type="button"
                className={css.iconButton}
                aria-label={t('session.new')}
                onClick={() => { startSession() }}
              >
                <IconNewChatOutline16 size={16} />
              </button>
            </Tooltip>
            <Tooltip label={t('toggle.collapse')} delayMs={400}>
              <button
                type="button"
                className={css.iconButton}
                aria-label={t('toggle.collapse')}
                onClick={() => { toggleSidebar() }}
              >
                <IconPanelLeftOutline16 size={16} />
              </button>
            </Tooltip>
          </div>

          <div className={css.body}>
            {renderSlot('sidebar.workspaces', {
              // 本侧栏的会话区没有「缩成图标条」那个形态：内容列不展开
              // 时它压根不渲染，所以恒为完整形态。
              wide: true,
              expandSidebar: () => { if (collapsed) toggleSidebar() },
            })}
          </div>

          <div className={css.footArea}>
            {renderSlot('sidebar.footer.action', { wide: true })}
            {renderSlot('sidebar.settings', { wide: true })}
          </div>
        </div>
      )}
    </div>
  )
}
