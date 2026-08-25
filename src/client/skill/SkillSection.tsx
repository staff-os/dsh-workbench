/**
 * 技能域的维护界面：本机清单 ⇄ 详情，外加一页技能市场。
 *
 * 形态与员工域一致——列表与详情不是弹窗，而是内联覆盖，顶部一条「返回列表」
 * 回去。本机与市场之间用一组分段控件切，因为它们是同一件事的两个来源，不是
 * 两个域。
 *
 * 详情页是**两栏**：左边「这是什么」（标题、描述、标签、正文/文件两个页签），
 * 右边「它现在什么状态」（事实卡与操作）。本机技能与市场条目共用这一套版式，
 * 因为它们讲的是同一种东西，换一栏看就得重新找一遍。
 *
 * 这一域有三件事界面必须照实说，不能糊过去：
 *
 * - **被遮蔽的技能**：盘上有、但同名的更高优先级来源盖住了它。改它不会有任何
 *   效果，所以详情页顶上是一条明确的横幅，而不是一个小角标。
 * - **被拒收的文件**：盘上有、但 DSH 因为 frontmatter 不合规整份丢弃。它不会
 *   出现在任何会话里，而 DSH 那边只有一行日志——不在这里说，就没有别处会说。
 * - **写完之后到底生没生效**：不是「重启后生效」（那句话是错的，写完下一个
 *   模型回合就生效），而是回读 `ctx.skills` 得到的真实结论。没生效时那句结论
 *   要显著显示，因为它意味着刚才那下白做了。
 *
 * @module @staff-os/dsh-workbench/client/skill/SkillSection
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import {
  Button,
  CodeBlock,
  IconApiOutline14,
  IconArchiveOutline20,
  IconBranchOutline16,
  IconCheckOutline16,
  IconChevronDownOutline14,
  IconChevronRightOutline14,
  IconChevronUpOutline14,
  IconDataOutline16,
  IconDownloadOutline16,
  IconEnhanceOutline16,
  IconFolderClose16,
  IconFolderOpen16,
  IconFolderOpenOutline16,
  IconInspectOutline12,
  IconLinkOutline16,
  IconListPenOutline16,
  IconPlusOutline16,
  IconRefreshOutline16,
  IconSearchOutline16,
  IconRightUpOutline14,
  IconTrashOutline16,
  IconUserOutline16,
  IconWarningOutline16,
  Input,
  MarkdownText,
  Modal,
  Pill,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReactNode } from 'react'
import {
  IconFileOutline16,
  IconShieldOutline16,
  IconStarOutline16,
} from '../icons.tsx'
import { useStore } from '../state.ts'
import { ARCHIVE_ACCEPT, MAX_UPLOAD_BYTES } from './data.ts'
import type { SkillData } from './data.ts'
import type {
  FileContent,
  MarketPreview,
  MarketView,
  MarketLabel,
  RegistrySourceInput,
  ScanFinding,
  ScanReport,
  SkillContent,
  SkillFileEntry,
  SkillView,
  UpdateStatus,
} from '../contract/remote.ts'
import type { LocaleKey } from '../locales.ts'
import css from './SkillSection.module.css'

/** 翻译函数，与插槽给组件的那个同形。 */
type Translate = (key: LocaleKey) => string

/** 本机清单、市场还是市场配置。 */
type SkillTab = 'local' | 'market' | 'config'

/** 详情页里的页签。 */
type DetailTab = 'overview' | 'files' | 'scan'

/** 正在看的是哪一个。市场条目要连 registry 一起记：同名 slug 可能来自不同源。 */
type Viewing =
  | { readonly kind: 'local'; readonly name: string }
  | { readonly kind: 'market'; readonly slug: string; readonly registry: string }

/** 技能域界面的 props。 */
export interface SkillSectionProps {
  readonly data: SkillData
  readonly t: Translate
}

/**
 * 画技能域。
 * @param props - 数据层与翻译函数。
 * @returns 列表、详情或市场。
 */
export function SkillSection({ data, t }: SkillSectionProps) {
  const state = useStore(data.store)
  const [tab, setTab] = useState<SkillTab>('local')
  const [viewing, setViewing] = useState<Viewing | undefined>(undefined)

  // 面板出现时取一份快照，并查一次更新。
  //
  // 不轮询，但每次切回这个面板都重取：技能目录不是只有本插件在写——模型自己
  // 会用 write/edit 改它，编辑器和 git 也会，别的会话装的技能同样落在这里。
  // 「本地文件不会自己变」在这一域不成立。
  useEffect(() => {
    void data.refresh()
    void data.checkUpdates()
  }, [data])

  const skills = state.snapshot?.skills ?? []
  const current = viewing?.kind === 'local'
    ? skills.find(skill => skill.name === viewing.name)
    : undefined

  // 正在看的技能被删掉了就退回列表，而不是留在一个指向空气的详情页上。
  useEffect(() => {
    if (viewing?.kind === 'local' && state.snapshot !== undefined && current === undefined) {
      setViewing(undefined)
    }
  }, [viewing, state.snapshot, current])

  const back = (): void => { setViewing(undefined) }

  if (viewing?.kind === 'market') {
    return (
      <MarketDetail
        slug={viewing.slug}
        registry={viewing.registry}
        data={data}
        t={t}
        onBack={back}
      />
    )
  }

  if (current !== undefined) {
    return <SkillDetail skill={current} data={data} t={t} onBack={back} />
  }

  return (
    <SkillList
      data={data}
      t={t}
      tab={tab}
      onTab={onTabChange(setTab, setViewing)}
      onOpen={setViewing}
    />
  )
}

/** 换页签时顺手关掉详情，免得从市场详情切回本机还停在那一页。 */
function onTabChange(
  setTab: (tab: SkillTab) => void,
  setViewing: (viewing: Viewing | undefined) => void,
): (tab: SkillTab) => void {
  return (tab) => {
    setViewing(undefined)
    setTab(tab)
  }
}

/** 列表视图的 props。 */
interface SkillListProps {
  readonly data: SkillData
  readonly t: Translate
  readonly tab: SkillTab
  readonly onTab: (tab: SkillTab) => void
  readonly onOpen: (viewing: Viewing) => void
}

/**
 * 本机清单、市场与市场配置的外壳：标题行、分段控件、正文。
 *
 * 标题行上只留「新建」与「导入」两个按钮。原先那五个（搜索框、重新读取、
 * 查更新、全部更新、上传、新建）挤成一排，谁也不比谁显眼，而其中大半只跟
 * 本机清单有关——它们现在归到清单自己的工具条上，标题行只回答「从哪来一份
 * 新技能」这一件事。
 */
function SkillList({ data, t, tab, onTab, onOpen }: SkillListProps) {
  const state = useStore(data.store)
  const [keyword, setKeyword] = useState('')
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)

  const skills = state.snapshot?.skills ?? []
  const rejected = state.snapshot?.rejected ?? []
  const statuses = [...state.updates?.values() ?? []]
  const outdated = statuses.filter(status => status.outdated)
  const unchecked = statuses.filter(status => status.error !== undefined)
  const needle = keyword.trim().toLowerCase()
  const shown = needle === ''
    ? skills
    : skills.filter(skill => `${skill.name} ${skill.description} ${skill.whenToUse ?? ''}`
      .toLowerCase().includes(needle))

  return (
    <div className={css.section}>
      <header className={css.head}>
        <div className={css.headText}>
          <h1 className={css.title}>{t('section.skills')}</h1>
          <p className={css.subtitle}>{t('skill.subtitle')}</p>
        </div>
        {/*
          这两个按钮写着字而不是只放一个图标：光看图标说不出它们干什么，
          而 primitives 的 Button 收不到 Tooltip 往下传的 hover 句柄
          （侧栏那种原生 button 才收得到），所以移上去也没有提示可看。

          导入排在新建后面并且是主按钮：装一个现成的包是这一页最常做的事，
          从零写一份 SKILL.md 是少数情况。
        */}
        {tab !== 'config' && (
          <div className={css.headActions}>
            <Button
              variant="outline"
              size="sm"
              icon={<IconPlusOutline16 size={16} />}
              disabled={state.busy}
              onClick={() => { setCreating(true) }}
            >
              {t('skill.create')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<IconArchiveOutline20 size={16} />}
              disabled={state.busy}
              onClick={() => { setImporting(true) }}
            >
              {t('skill.import')}
            </Button>
          </div>
        )}
      </header>

      <div className={css.tabs} role="tablist" aria-label={t('section.skills')}>
        {(['local', 'market', 'config'] as const).map(id => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={clsx(css.tab, tab === id && css.tabActive)}
            onClick={() => { onTab(id) }}
          >
            {t(id === 'local' ? 'skill.tab.local' : id === 'market' ? 'skill.tab.market' : 'skill.tab.config')}
          </button>
        ))}
      </div>

      <Notices data={data} t={t} />

      {tab === 'market'
        ? <MarketPanel data={data} t={t} onOpen={onOpen} />
        : tab === 'config'
          ? <MarketConfigPanel data={data} t={t} />
          : (
            <div className={css.body}>
              {/*
                清单自己的工具条：左边搜，右边是三件只跟这份清单有关的事。
                「查更新」要走网络问每个源，比刷新本地清单慢得多，所以是单独
                一个按钮而不是并进刷新里——刷新是这一页最常按的东西，不该每次
                都等一轮市场往返。
              */}
              <div className={css.toolBar}>
                <label className={css.searchPill}>
                  <IconSearchOutline16 size={15} className={css.searchMark} />
                  <input
                    className={css.searchInput}
                    value={keyword}
                    placeholder={t('skill.search')}
                    aria-label={t('skill.search')}
                    onChange={(event) => { setKeyword(event.target.value) }}
                  />
                </label>
                <div className={css.toolBarActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={state.busy}
                    icon={<IconRefreshOutline16 size={16} />}
                    onClick={() => { void data.refresh() }}
                  >
                    {t('skill.refresh')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={state.busy || state.updatesLoading}
                    icon={<IconEnhanceOutline16 size={16} />}
                    onClick={() => { void data.checkUpdates() }}
                  >
                    {t(state.updatesLoading ? 'skill.updates.checking' : 'skill.updates.check')}
                  </Button>
                  {outdated.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<IconRefreshOutline16 size={16} />}
                      disabled={state.busy}
                      onClick={() => { void data.updateAll() }}
                    >
                      {t('skill.updates.all').replace('{n}', String(outdated.length))}
                    </Button>
                  )}
                </div>
              </div>

              {/*
                一行数字，说清这份清单里都有些什么。被遮蔽与被拒收这两个数
                即使是 0 也照样报出来——它们是这一域最容易让人白忙的两件事，
                只在非零时才出现的话，人不会知道界面替他查过。
              */}
              <p className={css.resultLine}>{localSummary(skills, rejected.length, t)}</p>

              {/* 没有技能服务时这份清单只是目录列表，「生效」「被遮蔽」都无从谈起。 */}
              {state.snapshot?.hasRegistry === false && (
                <p className={css.banner}>{t('skill.noRegistry')}</p>
              )}
              {state.updatesLoading && <p className={css.banner}>{t('skill.updates.checking')}</p>}
              {outdated.length > 0 && (
                <p className={css.banner}>
                  {t('skill.updates.available').replace('{n}', String(outdated.length))}
                  {'：'}
                  {outdated.map(status => `${status.name} ${status.installed} → ${status.latest ?? '?'}`).join('、')}
                </p>
              )}
              {/*
                查更新失败的那些单独说一句。台账里记着来源、但源现在不可达时，
                界面上的表现是「它就是最新的」——那是一个安静的谎。
              */}
              {unchecked.length > 0 && (
                <p className={css.banner}>
                  {t('skill.updates.unchecked').replace('{n}', String(unchecked.length))}
                  {'：'}
                  {unchecked.map(status => `${status.name}（${status.error ?? '?'}）`).join('；')}
                </p>
              )}

              {state.loading
                ? <p className={css.empty}>{t('skill.loading')}</p>
                : shown.length === 0
                  ? <p className={css.empty}>{needle === '' ? t('skill.none') : t('skill.noMatch')}</p>
                  : (
                    <ul className={css.rows}>
                      {shown.map(skill => (
                        <li key={`${skill.source}:${skill.name}`}>
                          <SkillRow
                            skill={skill}
                            update={state.updates?.get(skill.name)}
                            busy={state.busy}
                            t={t}
                            onOpen={() => { onOpen({ kind: 'local', name: skill.name }) }}
                            onUpdate={() => { void data.update(skill.name) }}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

              {/*
                被 DSH 拒收的文件。它们不是上面那份清单折起来的一部分，而是
                另一种东西：盘上有、但 DSH 整份丢弃，只留一行日志。顶上那行
                数字已经报过有几个，这里逐条说清是哪一个、为什么。
              */}
              {rejected.length > 0 && (
                <section className={css.rejected}>
                  <h2 className={css.rejectedTitle}>{t('skill.rejected.section')}</h2>
                  <p className={css.rejectedHint}>{t('skill.rejected.sectionHint')}</p>
                  <ul className={css.rejectedList}>
                    {rejected.map(entry => (
                      <li key={entry.path} className={css.rejectedRow}>
                        <IconWarningOutline16 size={16} className={css.rejectedMark} />
                        <span className={css.rejectedMain}>
                          <span className={css.rejectedName}>{entry.hint}</span>
                          <span className={css.rejectedPath}>{entry.path}</span>
                        </span>
                        <span className={css.rejectedReason}>{entry.reason}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

      <CreateDialog
        open={creating}
        data={data}
        t={t}
        onClose={() => { setCreating(false) }}
        onCreated={(name) => { setCreating(false); onOpen({ kind: 'local', name }) }}
      />
      <ImportDialog
        open={importing}
        data={data}
        t={t}
        onClose={() => { setImporting(false) }}
      />
    </div>
  )
}

/**
 * 已装清单顶上那一行数字。
 *
 * 「受本插件管理」数的是用户目录里、且没被遮蔽的那些——只有它们在这个界面上
 * 改得动。项目级与随插件发布的技能照样生效、照样列出来，但它们不归这里管，
 * 混进同一个数里会让人以为界面能改。
 *
 * @param skills - 当前快照里的全部技能。
 * @param rejectedCount - 被 DSH 拒收的文件数。
 * @param t - 翻译函数。
 * @returns 一行用「·」串起来的说明。
 */
function localSummary(
  skills: readonly SkillView[],
  rejectedCount: number,
  t: Translate,
): string {
  const managed = skills.filter(skill => skill.managed && !skill.shadowed).length
  const shadowed = skills.filter(skill => skill.shadowed).length
  return [
    t('skill.local.count').replace('{n}', String(skills.length)),
    t('skill.local.managed').replace('{n}', String(managed)),
    t('skill.local.shadowed').replace('{n}', String(shadowed)),
    t('skill.local.rejectedCount').replace('{n}', String(rejectedCount)),
  ].join(' · ')
}

/** 方牌的配色档数；`glyph0`…`glyph5` 在样式表里。 */
const TILE_TONES = 6

/**
 * 一个名字落在哪一档方牌配色上。
 *
 * 按名字的码点和取模，而不是按它在列表里的下标：同一个技能在市场页与已装
 * 清单里下标不同，按下标算的话同一件东西会换颜色，看着像两个。
 *
 * @param name - 技能名或 slug。
 * @returns `0` 到 `TILE_TONES - 1`。
 */
function toneOf(name: string): number {
  let sum = 0
  for (const ch of name) sum += ch.codePointAt(0) ?? 0
  return sum % TILE_TONES
}

/**
 * 方牌上那个字。
 *
 * 按码点切而不是 `name[0]`：后者切的是 UTF-16 码元，遇到 emoji 或增补平面的
 * 汉字会切出半个字符，渲染成一个替换符。
 *
 * @param name - 技能名。
 * @returns 头一个字符，拉丁字母转大写。
 */
function initialOf(name: string): string {
  return [...name][0]?.toUpperCase() ?? '·'
}

/**
 * 已装清单里的一行。
 *
 * 做成横排而不是卡片：这份清单要回答的是「盘上现在有什么、它生没生效、
 * 调不调得到」，这些都是逐项对齐着看的事实，网格卡片会把同一列的事实错开。
 *
 * 一行里从左到右是四件事，顺序就是人查这一页的顺序：**是谁**（方牌与名字）、
 * **在哪**（来源与路径）、**怎么调**（模型可调用 / 斜杠触发两个开关状态）、
 * **要不要动它**（有新版时才出现的更新按钮）。
 *
 * 「已安装 vX」不挂在这里：那个版本号只有**台账里有记录**的技能才有，也就是
 * 从市场装来的那些。手写的技能同样在盘上、同样生效，但它没有上游版本可言，
 * 给它挂一个版本号是无中生有。
 */
function SkillRow({ skill, update, busy, t, onOpen, onUpdate }: {
  readonly skill: SkillView
  /** 这个技能的更新状态；手写的技能没有。 */
  readonly update?: UpdateStatus | undefined
  readonly busy: boolean
  readonly t: Translate
  readonly onOpen: () => void
  readonly onUpdate: () => void
}) {
  const outdated = update?.outdated === true
  return (
    <div className={css.row}>
      {/*
        可点的是左边这一整块，不是整行：右边那截里有更新按钮，套在一个大按钮
        里就是按钮套按钮——HTML 不合法，点更新还会连带把详情页也打开。
      */}
      <button type="button" className={css.rowOpen} aria-label={skill.name} onClick={onOpen}>
        <span className={clsx(css.glyph, css.glyphSm, css[`glyph${String(toneOf(skill.name))}`])} aria-hidden="true">
          {initialOf(skill.name)}
        </span>
        <span className={css.rowMain}>
          <span className={css.rowTitle}>
            <span className={css.rowName}>{skill.name}</span>
            <span className={css.rowSource}>{skill.source}</span>
            {/*
              遮蔽是这一域最容易让人白忙的事：改它、更新它、甚至重装它都不会
              有任何效果。所以这里是一条写着「不生效」的角标，而不是一个只说
              「被遮蔽」的中性标签——后者读起来像一种状态，不像一句结论。
            */}
            {skill.shadowed && (
              <span className={clsx(css.badge, css.badgeWarn)}>
                <IconWarningOutline16 size={12} />
                {t('skill.tag.shadowed.long')}
              </span>
            )}
            {outdated && (
              <span className={clsx(css.badge, css.badgeGood)}>
                {`${t('skill.updates.newer')} v${update?.latest ?? '?'}`}
              </span>
            )}
            {!skill.managed && <span className={css.badge}>{t('skill.tag.readonly')}</span>}
          </span>
          <span className={css.rowPath}>{skill.path ?? skill.source}</span>
          {skill.shadowed && (
            <span className={css.rowNote}>
              {t('skill.shadowed.hint').replace('{source}', skill.source)}
            </span>
          )}
        </span>
      </button>

      <div className={css.rowSide}>
        {/*
          两个开关状态都画出来，关掉的那个压暗而不是撤掉。只画开着的那个的话，
          「这个技能不能被模型自己调用」与「界面忘了说」在屏幕上长得一样。
        */}
        <span className={clsx(css.stateChip, !skill.modelInvocable && css.stateChipOff)}>
          {t('skill.tag.modelOn')}
        </span>
        <span
          className={clsx(
            css.stateChip,
            css.stateChipMono,
            !skill.userInvocable && css.stateChipOff,
          )}
        >
          {`/${skill.name}`}
        </span>
        {outdated && (
          <Button variant="primary" size="sm" disabled={busy} onClick={onUpdate}>
            {t('skill.market.update')}
          </Button>
        )}
      </div>
    </div>
  )
}

/** 详情页的 props。 */
interface SkillDetailProps {
  readonly skill: SkillView
  readonly data: SkillData
  readonly t: Translate
  readonly onBack: () => void
}

/** 一个本机技能的详情：正文、文件、可见性与操作。 */
function SkillDetail({ skill, data, t, onBack }: SkillDetailProps) {
  const state = useStore(data.store)
  const [removing, setRemoving] = useState(false)
  const [tab, setTab] = useState<DetailTab>('overview')
  const [detail, setDetail] = useState<SkillContent | undefined>(undefined)
  const picked = useFilePreview(
    (path: string) => data.readFile(skill.name, path),
    [data, skill.name],
  )
  const scan = useScan(() => data.scan(skill.name), tab === 'scan', [data, skill.name])

  // 正文单独取：清单里不带它，一份 SKILL.md 可以很长，全塞进列表快照不值当。
  useEffect(() => {
    let live = true
    setDetail(undefined)
    void data.read(skill.name).then((result) => {
      if (live && result !== undefined) setDetail(result)
    })
    return () => { live = false }
  }, [data, skill.name])

  const editable = skill.managed && !skill.shadowed
  const update = state.updates?.get(skill.name)
  // 文件树用详情里那一份（含 SKILL.md、带体积），不是清单里那份只有名字的
  // 「附带文件」。详情还没到之前先不报数，免得数字从 N 跳成 N+1。
  const files = detail?.files

  return (
    <div className={css.section}>
      <Notices data={data} t={t} />

      <div className={css.detail}>
        <div className={css.detailMain}>
          <button type="button" className={css.back} onClick={onBack}>{t('skill.back')}</button>

          <div className={css.detailBadges}>
            <Pill className={clsx(css.tag)}>{skill.source}</Pill>
            {skill.shadowed && (
              <Pill className={clsx(css.tag, css.tagWarn)}>{t('skill.tag.shadowed')}</Pill>
            )}
            {!skill.managed && <Pill className={clsx(css.tag)}>{t('skill.tag.readonly')}</Pill>}
            {!skill.modelInvocable && (
              <Pill className={clsx(css.tag)}>{t('skill.tag.modelOff')}</Pill>
            )}
            {!skill.userInvocable && <Pill className={clsx(css.tag)}>{t('skill.tag.userOff')}</Pill>}
          </div>

          <h1 className={css.detailTitle}>{skill.name}</h1>

          {skill.provider !== undefined && (
            <span className={css.metaChip}>
              <span className={css.metaChipMark} aria-hidden="true">
                <IconUserOutline16 size={12} />
              </span>
              <span>{t('skill.detail.author').replace('{name}', skill.provider)}</span>
            </span>
          )}

          <p className={css.detailDesc}>{skill.description}</p>

          {/* 遮蔽是这一域最容易让人白忙的事，所以顶在最前面而不是做成小角标。 */}
          {skill.shadowed && (
            <p className={clsx(css.banner, css.bannerWarn)}>
              <IconWarningOutline16 size={14} />
              <span>{t('skill.shadowed.hint').replace('{source}', skill.source)}</span>
            </p>
          )}
          {!skill.managed && (
            <p className={css.banner}>
              {t('skill.readonly.hint').replace('{source}', skill.source)}
            </p>
          )}
          {detail?.note !== undefined && <p className={css.banner}>{detail.note}</p>}

          <SubTabs
            tabs={[
              ['overview', t('skill.tab.overview')],
              ['files', `${t('skill.tab.files')}${files === undefined ? '' : ` (${String(files.length)})`}`],
              ['scan', scanTabLabel(scan.report, t)],
            ]}
            active={tab}
            onPick={setTab}
          />

          {tab === 'overview' && (
            <>
              {skill.whenToUse !== undefined && (
                <Field label={t('skill.field.whenToUse')}>
                  <p className={css.value}>{skill.whenToUse}</p>
                </Field>
              )}
              {detail === undefined
                ? <p className={css.empty}>{t('skill.detail.loading')}</p>
                : detail.content.trim() === ''
                  ? <p className={css.empty}>{t('skill.detail.noContent')}</p>
                  : <MarkdownBody body={detail.content} t={t} />}
            </>
          )}
          {tab === 'files' && (
            files === undefined
              ? <p className={css.empty}>{t('skill.detail.loading')}</p>
              : files.length === 0
                ? <p className={css.empty}>{t('skill.detail.noFiles')}</p>
                : <FileTree files={files} t={t} onOpen={picked.open} />
          )}
          {tab === 'scan' && (
            <ScanPanel report={scan.report} loading={scan.loading} t={t} onOpen={picked.open} />
          )}
        </div>

        <aside className={css.detailAside}>
          <div className={css.factCard}>
            <FactRow label={t('skill.field.source')}>{skill.source}</FactRow>
            {skill.provider !== undefined && (
              <FactRow label={t('panel.tool')}>{skill.provider}</FactRow>
            )}
            {update !== undefined && (
              <FactRow label={t('skill.detail.installedVersion')}>{update.installed}</FactRow>
            )}
            {/* 这一格数的是目录里的全部文件（含 SKILL.md），所以标签用「文件」，
                不是清单里那个只算附带文件的说法。 */}
            {files !== undefined && files.length > 0 && (
              <FactRow label={t('skill.tab.files')}>
                {t('skill.detail.fileCount').replace('{n}', String(files.length))}
              </FactRow>
            )}
            {skill.path !== undefined && (
              <div className={css.factBlock}>
                <span className={css.factTitle}>{t('skill.field.path')}</span>
                <code className={clsx(css.factValue, css.factMono)}>{skill.path}</code>
              </div>
            )}
            <div className={css.factBlock}>
              <span className={css.factTitle}>{t('skill.visibility')}</span>
              <ul className={css.checkList}>
                <li>
                  <label className={css.check}>
                    <input
                      type="checkbox"
                      checked={skill.modelInvocable}
                      disabled={!editable || state.busy}
                      onChange={() => {
                        void data.visibility(skill.name, { modelInvocable: !skill.modelInvocable })
                      }}
                    />
                    <span>{t('skill.visibility.model')}</span>
                  </label>
                </li>
                <li>
                  <label className={css.check}>
                    <input
                      type="checkbox"
                      checked={skill.userInvocable}
                      disabled={!editable || state.busy}
                      onChange={() => {
                        void data.visibility(skill.name, { userInvocable: !skill.userInvocable })
                      }}
                    />
                    <span>{t('skill.visibility.user')}</span>
                  </label>
                </li>
              </ul>
            </div>
          </div>

          {skill.managed && (
            <div className={css.factCard}>
              <div className={css.factBlock}>
                <span className={css.factTitle}>{t('skill.detail.actions')}</span>
                <div className={css.asideActions}>
                  {/*
                    只有从市场装来的技能才有「更新」这回事：手写的技能没有上游，
                    拿它的名字去市场碰一个同名条目装上来，是用一个不相干的包
                    把人写的东西覆盖掉。有台账记录才显示这个按钮。
                  */}
                  {update !== undefined && (
                    <Button
                      variant={update.outdated ? 'primary' : 'outline'}
                      size="sm"
                      icon={<IconRefreshOutline16 size={16} />}
                      disabled={state.busy || !update.outdated}
                      onClick={() => { void data.update(skill.name) }}
                    >
                      {update.outdated
                        ? `${t('skill.market.update')} → ${update.latest ?? ''}`
                        : t('skill.market.upToDate')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<IconTrashOutline16 size={16} />}
                    disabled={state.busy}
                    onClick={() => { setRemoving(true) }}
                  >
                    {t('skill.delete')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      <FilePreview
        path={picked.path}
        content={picked.content}
        loading={picked.loading}
        t={t}
        onClose={picked.close}
      />

      <Modal
        open={removing}
        title={t('skill.delete.title')}
        description={t('skill.delete.hint').replace('{name}', skill.name)}
        closeLabel={t('skill.cancel')}
        onClose={() => { setRemoving(false) }}
        footer={(
          <div className={css.dialogFooter}>
            <Button variant="ghost" onClick={() => { setRemoving(false) }}>
              {t('skill.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={state.busy}
              onClick={() => {
                void data.remove(skill.name).then((ok) => { if (ok) { setRemoving(false); onBack() } })
              }}
            >
              {t('skill.delete')}
            </Button>
          </div>
        )}
      />
    </div>
  )
}

/**
 * 一个市场条目的详情。与本机详情同一套版式与同一组页签，但只读，右边那栏是安装。
 *
 * 「概览」与「文件」的内容来自**把包取回来**，而不是市场的某个目录接口：
 * 这样看到的正文与文件就是装上去会得到的那一份。取不到时两个页签都照实说
 * 为什么，而不是留一片空白——见 `skill/remote.ts` 的 `marketPreview`。
 */
function MarketDetail({ slug, registry, data, t, onBack }: {
  readonly slug: string
  readonly registry: string
  readonly data: SkillData
  readonly t: Translate
  readonly onBack: () => void
}) {
  const state = useStore(data.store)
  const [item, setItem] = useState<MarketView | undefined>(undefined)
  const [tab, setTab] = useState<DetailTab>('overview')
  const [preview, setPreview] = useState<MarketPreview | undefined>(undefined)

  useEffect(() => {
    let live = true
    setItem(undefined)
    void data.marketGet(slug, registry).then((result) => {
      if (live && result !== undefined) setItem(result)
    })
    return () => { live = false }
  }, [data, slug, registry])

  // 包内容排在详情之后取：版本与发布者要等详情回来才知道。发布者尤其要紧——
  // 同一个 slug 在 ClawHub 上可以归不同的人，不带它下载会撞上 409。
  const version = item?.version
  const owner = item?.owner
  const installable = item?.installable
  useEffect(() => {
    if (item === undefined) return undefined
    let live = true
    setPreview(undefined)
    // 镜像条目在这个源上根本没有包，不必白跑一趟下载。
    if (installable === false) return () => { live = false }
    void data.marketPreview(slug, version, registry, owner).then((result) => {
      if (live && result !== undefined) setPreview(result)
    })
    return () => { live = false }
  }, [data, slug, registry, item, version, owner, installable])

  const installed = new Set((state.snapshot?.skills ?? []).map(skill => skill.name))
  const install = item === undefined ? undefined : installOf(item, installed, state.updates)
  const taken = install?.taken === true
  const status = install?.status
  const foreign = item !== undefined && !item.installable
  const files = preview?.files ?? []
  const picked = useFilePreview(
    (path: string) => data.marketFile(slug, version, registry, owner, path),
    [data, slug, version, registry, owner],
  )
  // 镜像条目在这个源上没有包，扫无可扫。
  const scan = useScan(
    () => data.marketScan(slug, version, registry, owner),
    tab === 'scan' && !foreign,
    [data, slug, version, registry, owner],
  )

  return (
    <div className={css.section}>
      <Notices data={data} t={t} />

      <div className={css.detail}>
        <div className={css.detailMain}>
          <button type="button" className={css.back} onClick={onBack}>{t('skill.back')}</button>

          {state.marketError !== undefined && <ErrorLine text={state.marketError} />}

          {item === undefined
            ? <p className={css.empty}>{t('skill.detail.loading')}</p>
            : (
              <>
                <div className={css.detailBadges}>
                  {item.version !== undefined && (
                    <Pill className={clsx(css.tag)}>{`v${item.version}`}</Pill>
                  )}
                  {status !== undefined && (
                    <Pill className={clsx(css.tag)}>
                      {`${t('skill.installed')} v${status.installed}`}
                    </Pill>
                  )}
                  {status?.outdated === true && (
                    <Pill className={clsx(css.tag, css.tagWarn)}>
                      {`${t('skill.updates.newer')} v${status.latest ?? '?'}`}
                    </Pill>
                  )}
                  {status === undefined && taken && (
                    <Pill className={clsx(css.tag, css.tagWarn)}>{t('skill.market.sameName')}</Pill>
                  )}
                  {/*
                    审核结论与托管方式不在这一排：前者归右栏那张安全卡（那串字
                    是源给的自由文本，涂成 warn 色等于替它下结论），后者归事实行。
                    这一排只放「它是哪个版本、在本机是什么处境」。
                  */}
                </div>

                <h1 className={css.detailTitle}>{item.name}</h1>

                {item.owner !== undefined && (
                  <span className={css.metaChip}>
                    <span className={css.metaChipMark} aria-hidden="true">
                      <IconUserOutline16 size={12} />
                    </span>
                    <span>{t('skill.detail.owner').replace('{name}', item.owner)}</span>
                  </span>
                )}

                <p className={css.detailDesc}>{item.description ?? item.name}</p>

                {item.tags.length > 0 && (
                  <div className={css.chipRow}>
                    {item.tags.map(tag => <span key={tag} className={css.chip}>{tag}</span>)}
                  </div>
                )}

                {foreign && (
                  <p className={css.banner}>
                    {t('skill.market.foreign').replace('{kind}', item.installKind ?? '外部')}
                  </p>
                )}

                <SubTabs
                  tabs={[
                    ['overview', t('skill.tab.overview')],
                    ['files', `${t('skill.tab.files')}${files.length === 0 ? '' : ` (${String(files.length)})`}`],
                    ['scan', scanTabLabel(scan.report, t)],
                  ]}
                  active={tab}
                  onPick={setTab}
                />

                {tab === 'overview' && (
                  <PreviewBody
                    preview={preview}
                    foreign={foreign}
                    t={t}
                    fallback={t('skill.detail.noContent')}
                  >
                    {preview === undefined || (preview.content ?? '').trim() === ''
                      ? undefined
                      : <MarkdownBody body={preview.content ?? ''} t={t} />}
                  </PreviewBody>
                )}
                {tab === 'files' && (
                  <PreviewBody
                    preview={preview}
                    foreign={foreign}
                    t={t}
                    fallback={t('skill.market.preview.noFiles')}
                  >
                    {files.length === 0
                      ? undefined
                      : <FileTree files={files} t={t} onOpen={picked.open} />}
                  </PreviewBody>
                )}
                {tab === 'scan' && (
                  foreign
                    ? <p className={css.empty}>{t('skill.market.preview.foreign')}</p>
                    : <ScanPanel report={scan.report} loading={scan.loading} t={t} onOpen={picked.open} />
                )}
              </>
            )}
        </div>

        {item !== undefined && (
          <aside className={css.detailAside}>
            {/*
              安全审核结论顶在这一栏最上面，在安装按钮之前。

              装一个技能不是装一个库：SKILL.md 的正文是模型会照着执行的一段
              指令。所以这一栏的顺序是「这东西可信吗 → 要不要装」，而不是把
              审核结论混进下面那堆事实行里，让它和「下载量」一样重。

              源不给这个字段时照实说「不提供」，不写「未通过」也不留空：空着
              会被读成「没问题」，而这里根本没有人下过结论。
            */}
            <div className={css.securityCard}>
              <IconShieldOutline16 size={17} className={css.securityMark} />
              <div className={css.securityText}>
                <span
                  className={clsx(
                    css.securityTitle,
                    item.securityStatus === undefined && css.securityUnknown,
                  )}
                >
                  {item.securityStatus ?? t('skill.market.security.unknown')}
                </span>
                <span className={css.securityNote}>
                  {t(item.securityStatus === undefined
                    ? 'skill.market.security.unknownNote'
                    : 'skill.market.security.note')}
                </span>
              </div>
            </div>

            <div className={css.factCard}>
              <div className={css.factBlock}>
                <span className={css.factTitle}>{t('skill.detail.actions')}</span>
                <div className={css.asideActions}>
                  {/*
                    台账认得这一条、而且确实有新版本时，主按钮是「更新」——走
                    marketUpdate 而不是安装：更新的定义是「同一来源的更新版」，
                    它照着台账里那条来源走，不会因为参数不同装成另一个包。
                  */}
                  {status?.outdated === true && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<IconRefreshOutline16 size={16} />}
                      disabled={state.busy}
                      onClick={() => { void data.update(status.name) }}
                    >
                      {`${t('skill.market.update')} → v${status.latest ?? '?'}`}
                    </Button>
                  )}
                  <Button
                    variant={taken || status !== undefined ? 'outline' : 'primary'}
                    size="sm"
                    disabled={state.busy || foreign}
                    onClick={() => {
                      void data.install(item.slug, item.version, item.registry, taken, item.owner)
                    }}
                  >
                    {t(taken ? 'skill.market.overwrite' : 'skill.market.install')}
                  </Button>
                  {item.homepage !== undefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<IconRightUpOutline14 size={14} />}
                      onClick={() => { window.open(item.homepage, '_blank', 'noopener,noreferrer') }}
                    >
                      {t('skill.detail.homepage')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/*
              三格数字。它们在卡片上已经出现过一次，这里再摆一遍是因为详情页
              是最终下决定的地方，翻回列表去对数字是白翻一趟。
            */}
            <div className={css.statGrid}>
              <div className={css.stat}>
                <span className={css.statValue}>{formatCount(item.downloadCount)}</span>
                <span className={css.statLabel}>{t('skill.market.downloadCount')}</span>
              </div>
              <div className={css.stat}>
                <span className={css.statValue}>
                  {item.avgRating > 0 ? item.avgRating.toFixed(1) : '—'}
                </span>
                <span className={css.statLabel}>{t('skill.market.rating')}</span>
              </div>
              <div className={css.stat}>
                <span className={css.statValue}>
                  {item.stars > 0 ? formatCount(item.stars) : '—'}
                </span>
                <span className={css.statLabel}>{t('skill.market.starCount')}</span>
              </div>
            </div>

            <div className={css.factCard}>
              {item.version !== undefined && (
                <FactRow label={t('skill.market.version')}>{`v${item.version}`}</FactRow>
              )}
              <FactRow label={t('skill.detail.registry')}>{item.registryName}</FactRow>
              {item.owner !== undefined && (
                <FactRow label={t('skill.market.owner')}>{item.owner}</FactRow>
              )}
              {item.installKind !== undefined && (
                <FactRow label={t('skill.market.installKind')}>{item.installKind}</FactRow>
              )}
              {item.installCount > 0 && (
                <FactRow label={t('skill.market.installCount')}>
                  {formatCount(item.installCount)}
                </FactRow>
              )}
              <div className={css.factBlock}>
                <span className={css.factTitle}>{t('skill.market.install')}</span>
                <code className={clsx(css.factValue, css.factMono)}>
                  {item.owner === undefined ? item.slug : `${item.owner}/${item.slug}`}
                </code>
              </div>
            </div>
          </aside>
        )}
      </div>

      <FilePreview
        path={picked.path}
        content={picked.content}
        loading={picked.loading}
        t={t}
        onClose={picked.close}
      />
    </div>
  )
}

/** 市场页：浏览、筛选与挑一条看详情。 */
function MarketPanel({ data, t, onOpen }: {
  readonly data: SkillData
  readonly t: Translate
  readonly onOpen: (viewing: Viewing) => void
}) {
  const state = useStore(data.store)
  const [keyword, setKeyword] = useState('')
  /**
   * 上一次真正发给市场的那个关键词。
   *
   * 与 `keyword` 分开记，因为排序要看它：留空浏览时这一页按下载量重排（热门
   * 的在前，这也是人打开市场首页想看到的），而带关键词搜出来的那一批得保持
   * 市场给的次序——那是相关度，按下载量重排会把最贴题的一条压到第二屏去。
   */
  const [submitted, setSubmitted] = useState('')
  const [picked, setPicked] = useState<string | undefined>(undefined)
  const [label, setLabel] = useState<MarketLabel | undefined>(undefined)
  const [expanded, setExpanded] = useState(false)
  const autoloaded = useRef(false)

  const registries = state.snapshot?.registries ?? []
  const installed = new Set((state.snapshot?.skills ?? []).map(skill => skill.name))

  // 依赖是 `state.market` 而不是 `items`：后者每次渲染都是一个新数组，
  // 挂上去等于没有记忆化。
  const items = state.market?.items
  const facets = useMemo(() => countFacets(items ?? []), [items])
  // 换了一批结果之后，原来选的那个分类可能已经不在了。这里按「不在就当没选」
  // 处理，而不是留一个选中却过滤掉全部结果的死状态。
  const active = facets.some(facet => facet.key === picked) ? picked : undefined
  const filtered = active === undefined
    ? items ?? []
    : (items ?? []).filter(item => facetsOf(item).some(one => normalizeLabel(one) === active))
  const byDownloads = submitted === ''
  const shown = byDownloads
    ? [...filtered].sort((a, b) => b.downloadCount - a.downloadCount)
    : filtered

  // 市场自己的标签目录。有它就用它分组——按标签筛是服务端做的，覆盖整个市场；
  // 没有才退回下面那套从当前这批结果里数出来的分类。
  const labels = state.labels ?? []

  const run = (next?: MarketLabel | undefined): void => {
    setSubmitted(keyword.trim())
    void data.search(keyword, undefined, undefined, next?.slug, next?.registry)
  }

  // 切过来就先把首页那批取出来，顺带问一次标签目录。
  //
  // 原先停在一句「输入关键词开始搜索」上，等用户自己点一下——可这一页最常见
  // 的用法是「先看看有什么」，而不是心里已经有个名字。`autoloaded` 挡住重复
  // 触发：查失败时 `market` 仍然是空的，没有这道闸就会每次渲染都重试一次。
  useEffect(() => {
    if (autoloaded.current || registries.length === 0) return
    autoloaded.current = true
    if (state.labels === undefined) void data.loadLabels()
    if (state.market === undefined && !state.marketLoading) void data.search()
  }, [data, registries.length, state.labels, state.market, state.marketLoading])

  if (registries.length === 0 && state.snapshot !== undefined) {
    return <div className={css.body}><p className={css.empty}>{t('skill.market.noRegistry')}</p></div>
  }

  return (
    <div className={css.body}>
      {/*
        一条工具条：左边是筛选用的分类，右边是搜。两者摆在同一行，因为它们是
        同一件事的两种收窄方式，分成上下两条会让人以为要先选一个再搜。
      */}
      <div className={css.marketBar}>
        <div className={css.facetRow}>
          {/*
            市场自己的标签目录。与下面那条分类筛选的区别要紧：这一条是**服务端**
            筛的，点一个标签得到的是整个市场里归在它下面的条目；那一条只在已经
            取回来的这一批结果里筛。两条同时摆会让人以为是一回事，所以有标签就
            只摆标签这一条。
          */}
          {labels.length > 0 && (
            <>
              <button
                type="button"
                className={clsx(css.facet, label === undefined && css.facetActive)}
                onClick={() => { setLabel(undefined); setPicked(undefined); run(undefined) }}
              >
                {t('skill.market.filter.all')}
              </button>
              {labels
                .filter((one, index) => expanded || index < FACET_LIMIT || one.slug === label?.slug)
                .map(one => (
                  <button
                    key={`${one.registry}:${one.slug}`}
                    type="button"
                    className={clsx(
                      css.facet,
                      one.kind === 'PRIVILEGED' && css.facetMark,
                      label?.slug === one.slug && label.registry === one.registry && css.facetActive,
                    )}
                    onClick={() => {
                      const next = label?.slug === one.slug && label.registry === one.registry
                        ? undefined
                        : one
                      setLabel(next)
                      setPicked(undefined)
                      run(next)
                    }}
                  >
                    {one.name}
                  </button>
                ))}
              {labels.length > FACET_LIMIT && (
                <button
                  type="button"
                  className={clsx(css.facet, css.facetMore)}
                  onClick={() => { setExpanded(!expanded) }}
                >
                  {expanded
                    ? t('skill.market.filter.less')
                    : t('skill.market.filter.more').replace('{n}', String(labels.length - FACET_LIMIT))}
                </button>
              )}
            </>
          )}

          {labels.length === 0 && facets.length > 0 && (
            <>
              <button
                type="button"
                className={clsx(css.facet, active === undefined && css.facetActive)}
                onClick={() => { setPicked(undefined) }}
              >
                {`${t('skill.market.filter.all')} (${String(items?.length ?? 0)})`}
              </button>
              {/*
                上游的标签相当零散——一批 40 条里能数出三十几个分类，大半只挂着
                一条。全摆出来就是一堵墙，所以默认只留最靠前的那些；选中的那个
                即使排在后面也要留着，否则点完它自己就消失了。
              */}
              {facets
                .filter((facet, index) => expanded || index < FACET_LIMIT || facet.key === active)
                .map(facet => (
                  <button
                    key={facet.key}
                    type="button"
                    className={clsx(css.facet, active === facet.key && css.facetActive)}
                    onClick={() => { setPicked(active === facet.key ? undefined : facet.key) }}
                  >
                    {`${facet.label} (${String(facet.count)})`}
                  </button>
                ))}
              {facets.length > FACET_LIMIT && (
                <button
                  type="button"
                  className={clsx(css.facet, css.facetMore)}
                  onClick={() => { setExpanded(!expanded) }}
                >
                  {expanded
                    ? t('skill.market.filter.less')
                    : t('skill.market.filter.more').replace('{n}', String(facets.length - FACET_LIMIT))}
                </button>
              )}
            </>
          )}
        </div>

        <div className={css.marketSearchGroup}>
          <label className={css.searchPill}>
            <IconSearchOutline16 size={15} className={css.searchMark} />
            <input
              className={css.searchInput}
              value={keyword}
              placeholder={t('skill.market.search')}
              aria-label={t('skill.market.search')}
              onChange={(event) => { setKeyword(event.target.value) }}
              onKeyDown={(event) => { if (event.key === 'Enter') run(label) }}
            />
          </label>
          {/*
            回车能搜，按钮也留着：这一下是一次网络往返，不是就地过滤，没有一个
            看得见的触发点的话，人会以为自己打的字已经在筛了。
          */}
          <Button
            variant="outline"
            size="sm"
            disabled={state.marketLoading}
            onClick={() => { run(label) }}
          >
            {t('skill.market.go')}
          </Button>
        </div>
      </div>

      {/*
        一行说清这批结果是什么、从哪来、按什么排。排序那一句会跟着变——留空
        浏览时是按下载量重排的，带关键词时是市场给的次序，混成一句固定的话，
        其中一种情况下它就是假的。
      */}
      <p className={css.resultLine}>
        {[
          t('skill.market.resultLine')
            .replace('{n}', String(shown.length))
            .replace('{m}', String(registries.length)),
          t(byDownloads ? 'skill.market.sortedByDownloads' : 'skill.market.sortedByRelevance'),
        ].join(' · ')}
      </p>

      {registries.length > 0 && (
        <p className={css.hint}>
          {t('skill.market.sources').replace('{names}', registries.map(one => one.name).join('、'))}
        </p>
      )}

      {/*
        分类是从**已载入的这一批**结果里数出来的，不是市场的目录——
        ClawHub 兼容契约里没有分类端点。不说清这一条，选中一个分类之后
        看到的三条会被当成「整个市场只有三条」。
      */}
      {labels.length === 0 && facets.length > 0 && (
        <p className={css.hint}>
          {t('skill.market.filter.scope').replace('{n}', String(items?.length ?? 0))}
        </p>
      )}

      {state.marketError !== undefined && <ErrorLine text={state.marketError} />}
      {state.market?.fromCache === true && <p className={css.banner}>{t('skill.market.cached')}</p>}

      {state.marketLoading
        ? <p className={css.empty}>{t('skill.market.loading')}</p>
        : state.market === undefined
          ? <p className={css.empty}>{t('skill.market.idle')}</p>
          : shown.length === 0
            ? <p className={css.empty}>{t('skill.market.none')}</p>
            : (
              <ul className={css.grid}>
                {shown.map(item => (
                  <li key={`${item.registry}:${item.slug}`}>
                    <MarketCard
                      item={item}
                      t={t}
                      install={installOf(item, installed, state.updates)}
                      onOpen={() => { onOpen({ kind: 'market', slug: item.slug, registry: item.registry }) }}
                    />
                  </li>
                ))}
              </ul>
            )}
    </div>
  )
}

/**
 * 一张市场卡片。
 *
 * 整张卡是一个按钮，点进去是详情——卡片上**没有安装按钮**。这是刻意的：技能
 * 装上去就是模型会照着执行的一段指令，而一张卡片放不下决定要不要装它所需的
 * 东西（谁发布的、平台给没给审核结论、包里有什么、静态扫描命中了什么）。让
 * 「装」这一下只能在看过那些之后按，比在网格里一路点下去安全。
 *
 * 卡上留的是能一眼比较的那几样：
 *
 * - **它来自哪个源**：搜索结果是几个源混在一起的，同一个 slug 在不同源上是
 *   不同的包。
 * - **它在本机是什么处境**：已安装 / 可安装 / 仅浏览。「仅浏览」是别家目录的
 *   镜像条目，这个源上没有它的包——点进去也装不了，先在卡上说清。
 * - **热度**：下载量、评分、上游 star。三个都是给人排序用的参考，不是结论。
 */
function MarketCard({ item, t, install, onOpen }: {
  readonly item: MarketView
  readonly t: Translate
  readonly install: MarketInstall
  readonly onOpen: () => void
}) {
  const { taken, status } = install
  const state = status !== undefined
    ? t('skill.market.status.installed')
    : item.installable
      ? t('skill.market.status.installable')
      : t('skill.market.status.browseOnly')
  // 「已安装」之外还有话说时接在同一行后面：这一行本来就是「它在本机怎么样」，
  // 拆成两行会让卡片高度随状态跳。
  const suffix = status?.outdated === true
    ? ` · ${t('skill.market.status.update').replace('{v}', status.latest ?? '?')}`
    : status === undefined && taken
      ? ` · ${t('skill.market.sameName')}`
      : ''

  return (
    <button type="button" className={css.marketCard} aria-label={item.name} onClick={onOpen}>
      <span className={css.marketCardHead}>
        <span
          className={clsx(css.glyph, css[`glyph${String(toneOf(item.slug))}`])}
          aria-hidden="true"
        >
          {initialOf(item.name)}
        </span>
        <span className={css.registryPill}>
          <span className={css.registryDot} aria-hidden="true" />
          {item.registryName}
        </span>
      </span>

      <span
        className={clsx(
          css.cardStatus,
          status !== undefined && css.cardStatusOn,
          status === undefined && !item.installable && css.cardStatusOff,
        )}
      >
        {`${state}${suffix}`}
      </span>
      <span className={css.cardName}>{item.name}</span>
      <span className={css.cardDesc}>{item.description ?? item.name}</span>

      {/* 撑开的空档：卡片高度由网格拉齐，底下那排数字得贴着底边对齐。 */}
      <span className={css.cardSpacer} />

      {item.tags.length > 0 && (
        <span className={css.cardTags}>
          {item.tags.slice(0, 3).map(tag => <span key={tag} className={css.cardTag}>{tag}</span>)}
        </span>
      )}

      <span className={css.cardMetrics}>
        <span className={css.metric}>
          <IconDownloadOutline16 size={13} className={css.metricMark} />
          {formatCount(item.downloadCount)}
        </span>
        {item.avgRating > 0 && (
          <span className={css.metric}>
            <IconStarOutline16 size={13} className={css.metricMark} />
            {item.avgRating.toFixed(1)}
          </span>
        )}
        {item.stars > 0 && (
          <span className={css.metric}>
            <IconBranchOutline16 size={13} className={css.metricMark} />
            {formatCount(item.stars)}
          </span>
        )}
      </span>
    </button>
  )
}

/**
 * 市场配置面板：加减与编辑 ClawHub 兼容源。
 *
 * 这里的编辑是**本地草稿**，按「保存」才整份写回去。写完立刻生效——`data.writeMarketConfig`
 * 调的那一头在写完之后会重取一份快照，本地清单里的 registries 跟着变。
 *
 * 空列表是一个合法配置，含义是「回退到出厂源」。所以删光再保存不会报错，只是
 * 转一圈又回到默认。这条要说清，否则「我删光了，怎么市场还能搜」会成为一个谜。
 */
function MarketConfigPanel({ data, t }: {
  readonly data: SkillData
  readonly t: Translate
}) {
  const state = useStore(data.store)
  const [draft, setDraft] = useState<readonly RegistrySourceInput[] | undefined>(undefined)
  const [saved, setSaved] = useState(false)

  // 配置只在切到这一页时取一次：它是本地文件，不会自己变。
  useEffect(() => {
    let live = true
    setDraft(undefined)
    void data.readMarketConfig().then((result) => {
      if (!live) return
      setDraft(result.map(source => ({
        id: source.id,
        name: source.name,
        url: source.url,
        flavor: source.flavor,
        ...source.apiKeyEnv === undefined ? {} : { apiKeyEnv: source.apiKeyEnv },
      })))
    })
    return () => { live = false }
  }, [data])

  if (draft === undefined) {
    return <div className={css.body}><p className={css.empty}>{t('skill.config.loading')}</p></div>
  }

  const update = (index: number, patch: Partial<RegistrySourceInput>): void => {
    setDraft(current => current?.map((one, i) => i === index ? { ...one, ...patch } : one))
  }

  const add = (): void => {
    setDraft(current => [...current ?? [], { id: '', name: '', url: '', flavor: '', apiKeyEnv: '' }])
  }

  const remove = (index: number): void => {
    setDraft(current => current?.filter((_, i) => i !== index))
  }

  const save = (): void => {
    // 去掉 id 为空的那些——没有标识的源没法用。
    const filtered = draft
      .map(one => ({
        ...one,
        id: one.id.trim(),
        name: one.name.trim(),
        url: one.url.trim(),
      }))
      .filter(one => one.id !== '')
    void data.writeMarketConfig(filtered).then((result) => {
      if (result !== undefined) {
        setSaved(true)
        setDraft(result.map(source => ({
          id: source.id,
          name: source.name,
          url: source.url,
          flavor: source.flavor,
        })))
        setTimeout(() => { setSaved(false) }, 3000)
      }
    })
  }

  return (
    <div className={css.body}>
      <p className={css.subtitle}>{t('skill.config.subtitle')}</p>

      {draft.length === 0 && (
        <p className={css.banner}>{t('skill.config.empty')}</p>
      )}

      <ul className={css.configList}>
        {draft.map((source, index) => (
          <li key={String(index)} className={css.configCard}>
            <div className={css.configRow}>
              <Field label={t('skill.config.field.id')} hint={t('skill.config.field.id.hint')}>
                <Input
                  value={source.id}
                  placeholder="clawhub"
                  onChange={(event) => { update(index, { id: event.target.value }) }}
                />
              </Field>
              <Field label={t('skill.config.field.name')} hint={t('skill.config.field.name.hint')}>
                <Input
                  value={source.name}
                  placeholder={source.id || 'ClawHub'}
                  onChange={(event) => { update(index, { name: event.target.value }) }}
                />
              </Field>
            </div>
            <Field label={t('skill.config.field.url')} hint={t('skill.config.field.url.hint')}>
              <Input
                value={source.url}
                placeholder="https://clawhub.ai"
                onChange={(event) => { update(index, { url: event.target.value }) }}
              />
            </Field>
            <div className={css.configRow}>
              <Field label={t('skill.config.field.flavor')} hint={t('skill.config.field.flavor.hint')}>
                <Input
                  value={source.flavor ?? ''}
                  placeholder="clawhub"
                  onChange={(event) => { update(index, { flavor: event.target.value }) }}
                />
              </Field>
              <Field label={t('skill.config.field.apiKeyEnv')} hint={t('skill.config.field.apiKeyEnv.hint')}>
                <Input
                  value={source.apiKeyEnv ?? ''}
                  placeholder="CLAWHUB_API_KEY"
                  onChange={(event) => { update(index, { apiKeyEnv: event.target.value }) }}
                />
              </Field>
            </div>
            <div className={css.configActions}>
              <Button
                variant="ghost"
                size="sm"
                icon={<IconTrashOutline16 size={14} />}
                onClick={() => { remove(index) }}
              >
                {t('skill.config.remove')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className={css.configFooter}>
        <Button variant="outline" size="sm" icon={<IconPlusOutline16 size={14} />} onClick={add}>
          {t('skill.config.add')}
        </Button>
        <div className={css.configSave}>
          {saved && <span className={css.configSaved}>{t('skill.config.saved')}</span>}
          <Button
            variant="primary"
            size="sm"
            disabled={state.configBusy}
            icon={<IconEnhanceOutline16 size={14} />}
            onClick={save}
          >
            {t('skill.config.save')}
          </Button>
        </div>
      </div>

      <p className={css.hint}>{t('skill.config.hint')}</p>
    </div>
  )
}

/** 一条市场条目在本机的处境。 */
interface MarketInstall {
  /** 名字被占了：本机有同名技能。 */
  readonly taken: boolean
  /**
   * 台账说这一条就是从这里装的。
   *
   * 与 `taken` 不是一回事：同名可能只是撞名——另一个源的、或者手写的同名技能。
   * 说「已安装」得有台账里那条来源记录对得上（同一个源、同一个 slug）才算。
   */
  readonly status?: UpdateStatus | undefined
}

/**
 * 查一条市场条目在本机装没装。
 *
 * @param item - 市场条目。
 * @param names - 本机技能名。
 * @param updates - 按技能名索引的安装台账／更新状态。
 * @returns 名字占没占、以及台账里对得上的那条记录。
 */
function installOf(
  item: MarketView,
  names: ReadonlySet<string>,
  updates: ReadonlyMap<string, UpdateStatus> | undefined,
): MarketInstall {
  const status = [...updates?.values() ?? []].find(
    one => one.origin.registry === item.registry && one.origin.slug === item.slug,
  )
  return { taken: names.has(item.slug), ...status === undefined ? {} : { status } }
}

/** 归一：大小写与连字符不该让同一个类目认不出来。 */
function normalizeLabel(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]+/gu, '')
}

/** 一个分类：用来比对的键、显示用的写法，加上这一批结果里有多少条归在它下面。 */
interface Facet {
  /** 归一之后的写法，比对按它来。 */
  readonly key: string
  /** 显示用的原写法。 */
  readonly label: string
  readonly count: number
}

/** 筛选条上默认摆几个；再多就折起来。 */
const FACET_LIMIT = 12

/**
 * 一个条目归在哪些分类下。
 *
 * `category` 与 `tags` 合成一个平面：上游两边都可能给，也可能都不给
 * （内网那台 SkillHub 两个都是空的），分开摆会得到两条时有时无的筛选条。
 */
function facetsOf(item: MarketView): readonly string[] {
  const all = item.category === undefined ? item.tags : [item.category, ...item.tags]
  return [...new Set(all.map(one => one.trim()).filter(one => one !== ''))]
}

/**
 * 数出这一批结果里有哪些分类，多的排前面。
 *
 * 两处不照抄上游：
 *
 * - **分类是从结果里数出来的**，不是市场给的目录。ClawHub 兼容契约里没有分类
 *   端点（内网那台的 `/api/v1/categories` 要登录，`search?category=` 直接 500），
 *   所以这是「这一页里有哪些分类」。一条都数不出来时筛选条整条不出现，
 *   而不是摆一个只有「全部」的空壳。
 * - **写法归一**：同一批结果里 `Audio` 与 `audio`、`Data Analysis` 与
 *   `data-analysis` 都会同时出现，它们显然是一个分类。不合并的话筛选条上会有
 *   两颗一模一样的按钮，点哪颗都只得到一半结果——译成中文之后更看不出区别。
 */
function countFacets(items: readonly MarketView[]): readonly Facet[] {
  const counts = new Map<string, { label: string; count: number }>()
  for (const item of items) {
    for (const facet of facetsOf(item)) {
      const key = normalizeLabel(facet)
      const seen = counts.get(key)
      counts.set(key, { label: seen?.label ?? facet, count: (seen?.count ?? 0) + 1 })
    }
  }
  return [...counts]
    .map(([key, { label, count }]) => ({ key, label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
}

/** 把大数字缩成 `12.3k` 这样，免得一张卡片被一串零撑开。 */
function formatCount(value: number): string {
  if (value < 1000) return String(value)
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)}k`
  return `${(value / 1_000_000).toFixed(1)}M`
}

/** 把字节数说成人话。 */
function formatBytes(value: number): string {
  if (value < 1024) return `${String(value)} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

/** 导入技能的四种来源。 */
type ImportMode = 'zip' | 'url' | 'github' | 'slug'

/**
 * 四种来源的文案键，顺序就是对话框上的排法。
 *
 * 写成一张表而不是 `` `skill.import.mode.${mode}` as LocaleKey ``：拼出来的键要
 * 断言成 `LocaleKey` 才过得了类型检查，而断言正好把「这个键在不在字典里」这件
 * 唯一值得检查的事绕过去了。列全之后漏一条是编译错误。
 */
interface ImportModeText {
  readonly id: ImportMode
  readonly label: LocaleKey
  readonly note: LocaleKey
  readonly hint: LocaleKey
  readonly placeholder: LocaleKey
}

// 元组而不是数组：`noUncheckedIndexedAccess` 下 `[0]` 在数组上是可空的，
// 而这张表恒非空，为它写一段 undefined 处理是给一个不存在的情况让路。
const IMPORT_MODES: readonly [ImportModeText, ...ImportModeText[]] = [
  {
    id: 'zip',
    label: 'skill.import.mode.zip',
    note: 'skill.import.mode.zip.note',
    hint: 'skill.import.mode.zip.hint',
    // 压缩包那一栏摆的是文件选择器，不是输入框；这一条只为把表填齐。
    placeholder: 'skill.import.mode.zip.placeholder',
  },
  {
    id: 'url',
    label: 'skill.import.mode.url',
    note: 'skill.import.mode.url.note',
    hint: 'skill.import.mode.url.hint',
    placeholder: 'skill.import.mode.url.placeholder',
  },
  {
    id: 'github',
    label: 'skill.import.mode.github',
    note: 'skill.import.mode.github.note',
    hint: 'skill.import.mode.github.hint',
    placeholder: 'skill.import.mode.github.placeholder',
  },
  {
    id: 'slug',
    label: 'skill.import.mode.slug',
    note: 'skill.import.mode.slug.note',
    hint: 'skill.import.mode.slug.hint',
    placeholder: 'skill.import.mode.slug.placeholder',
  },
]

/**
 * 导入技能的对话框。
 *
 * 四种来源摆在同一个对话框里，因为对用户来说它们是同一件事——「我手上有一份
 * 技能，让它进来」。底下也确实是同一条路：解包 → 校验（条目数、单文件与整包
 * 体积、路径穿越）→ 落到技能根之外的暂存目录 → 整目录原子换上去。四条分支
 * 只在「字节从哪来」这一步不同。
 *
 * 两处必须说清，否则会变成查不明白的问题：
 *
 * - **装成什么名字由包内 `SKILL.md` 的 frontmatter `name` 决定**，与文件名、
 *   仓库名都无关。「我传的是 my-skill.zip，怎么装出来叫别的」就是这么来的。
 * - **只有市场 slug 那一条记安装台账**。压缩包和链接没有 registry 坐标，
 *   记一条假的进去，之后的更新检查会拿技能名去市场里碰一个同名条目，用一个
 *   不相干的包盖掉用户的东西。代价是这两种装法之后不出现在更新检查里。
 */
function ImportDialog({ open, data, t, onClose }: {
  readonly open: boolean
  readonly data: SkillData
  readonly t: Translate
  readonly onClose: () => void
}) {
  const state = useStore(data.store)
  const [mode, setMode] = useState<ImportMode>('zip')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [value, setValue] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [over, setOver] = useState(false)
  const input = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) return
    setMode('zip')
    setFile(undefined)
    setValue('')
    setOverwrite(false)
    setOver(false)
  }, [open])

  // 换来源时把上一种填的东西清掉：链接与 slug 共用同一个输入框，留着上一条
  // 会让人在「GitHub 仓库」那一栏里看见一个 slug。
  const pick = (next: ImportMode): void => {
    setMode(next)
    setValue('')
    setFile(undefined)
  }

  // 表里一定找得到：`mode` 的取值就是这张表的 id。找不到时退回头一条，
  // 免得为一个不可能的分支写一段 undefined 处理。
  const current = IMPORT_MODES.find(one => one.id === mode) ?? IMPORT_MODES[0]
  const ready = mode === 'zip' ? file !== undefined : value.trim() !== ''

  const submit = (): void => {
    const done = (ok: boolean): void => { if (ok) onClose() }
    if (mode === 'zip') {
      if (file === undefined) return
      void data.upload(file, overwrite).then(done)
      return
    }
    if (mode === 'slug') {
      // `owner/name` 写法里的发布者要单独拆出来传：ClawHub 上不同发布者可以
      // 用同一个 slug，不带 owner 下载会撞上另一个人的包。
      const raw = value.trim()
      const slash = raw.lastIndexOf('/')
      const owner = slash === -1 ? undefined : raw.slice(0, slash)
      const slug = slash === -1 ? raw : raw.slice(slash + 1)
      void data.install(slug, undefined, undefined, overwrite, owner).then(done)
      return
    }
    void data.importUrl(value.trim(), overwrite).then(done)
  }

  return (
    <Modal
      open={open}
      title={t('skill.import.title')}
      description={t('skill.import.hint')}
      closeLabel={t('skill.cancel')}
      onClose={onClose}
      footer={(
        <div className={css.dialogFooter}>
          <Button variant="ghost" onClick={onClose}>{t('skill.cancel')}</Button>
          <Button variant="primary" disabled={!ready || state.busy} onClick={submit}>
            {t('skill.import.go')}
          </Button>
        </div>
      )}
    >
      <div className={css.form}>
        <div className={css.modeList}>
          {IMPORT_MODES.map(one => (
            <button
              key={one.id}
              type="button"
              aria-pressed={mode === one.id}
              className={clsx(css.mode, mode === one.id && css.modeActive)}
              onClick={() => { pick(one.id) }}
            >
              <span className={css.modeMark} aria-hidden="true">
                {one.id === 'zip'
                  ? <IconArchiveOutline20 size={17} />
                  : one.id === 'url'
                    ? <IconLinkOutline16 size={17} />
                    : one.id === 'github'
                      ? <IconBranchOutline16 size={17} />
                      : <IconApiOutline14 size={17} />}
              </span>
              <span className={css.modeText}>
                <span className={css.modeLabel}>{t(one.label)}</span>
                <span className={css.modeNote}>{t(one.note)}</span>
              </span>
              <span
                className={clsx(css.modeCheck, mode === one.id && css.modeCheckOn)}
                aria-hidden="true"
              >
                {mode === one.id && <IconCheckOutline16 size={13} />}
              </span>
            </button>
          ))}
        </div>

        <input
          ref={input}
          type="file"
          hidden
          accept={ARCHIVE_ACCEPT}
          onChange={(event) => {
            const picked = event.target.files?.[0]
            if (picked !== undefined) setFile(picked)
            // 清掉，否则同一个文件改完再选一次不会触发 change。
            event.target.value = ''
          }}
        />

        {mode === 'zip'
          ? file === undefined
            ? (
              <button
                type="button"
                className={clsx(css.drop, over && css.dropOver)}
                onClick={() => { input.current?.click() }}
                onDragOver={(event) => { event.preventDefault(); setOver(true) }}
                onDragLeave={() => { setOver(false) }}
                onDrop={(event) => {
                  event.preventDefault()
                  setOver(false)
                  const dropped = event.dataTransfer.files[0]
                  if (dropped !== undefined) setFile(dropped)
                }}
              >
                <IconArchiveOutline20 size={22} />
                <span>{t('skill.upload.drop')}</span>
                <span className={css.dropHint}>
                  {t('skill.upload.accept').replace('{size}', formatBytes(MAX_UPLOAD_BYTES))}
                </span>
              </button>
            )
            : (
              <div className={css.picked}>
                <span className={css.pickedName}>{file.name}</span>
                <span className={css.pickedSize}>{formatBytes(file.size)}</span>
                <Button variant="ghost" size="sm" onClick={() => { setFile(undefined) }}>
                  {t('skill.upload.replace')}
                </Button>
              </div>
            )
          : (
            <input
              className={css.modeInput}
              value={value}
              placeholder={t(current.placeholder)}
              aria-label={t(current.label)}
              onChange={(event) => { setValue(event.target.value) }}
              onKeyDown={(event) => { if (event.key === 'Enter' && ready) submit() }}
            />
          )}

        <label className={css.check}>
          <input
            type="checkbox"
            checked={overwrite}
            onChange={() => { setOverwrite(!overwrite) }}
          />
          <span>{t('skill.upload.overwrite')}</span>
        </label>

        <p className={css.hint}>
          {t(current.hint).replace('{size}', formatBytes(MAX_UPLOAD_BYTES))}
        </p>
      </div>
    </Modal>
  )
}

/** 新建技能的对话框。 */
function CreateDialog({ open, data, t, onClose, onCreated }: {
  readonly open: boolean
  readonly data: SkillData
  readonly t: Translate
  readonly onClose: () => void
  readonly onCreated: (name: string) => void
}) {
  const state = useStore(data.store)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [whenToUse, setWhenToUse] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setDescription('')
    setWhenToUse('')
    setContent('')
  }, [open])

  // 与 Node 半边的 SKILL_NAME_PATTERN 同形；这里挡一道是为了当场给反馈，
  // 真正说了算的仍然是那边。
  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name) && description.trim() !== ''

  return (
    <Modal
      open={open}
      title={t('skill.create.title')}
      description={t('skill.create.hint')}
      closeLabel={t('skill.cancel')}
      onClose={onClose}
      footer={(
        <div className={css.dialogFooter}>
          <Button variant="ghost" onClick={onClose}>{t('skill.cancel')}</Button>
          <Button
            variant="primary"
            disabled={!valid || state.busy}
            onClick={() => {
              void data.create({
                name: name.trim(),
                description: description.trim(),
                ...whenToUse.trim() === '' ? {} : { whenToUse: whenToUse.trim() },
                ...content.trim() === '' ? {} : { content },
              }).then((ok) => { if (ok) onCreated(name.trim()) })
            }}
          >
            {t('skill.create')}
          </Button>
        </div>
      )}
    >
      <div className={css.form}>
        <Field label={t('skill.field.name')} hint={t('skill.field.name.hint')}>
          <Input value={name} onChange={(event) => { setName(event.target.value) }} />
        </Field>
        <Field label={t('skill.field.description')} hint={t('skill.field.description.hint')}>
          <textarea
            className={css.textarea}
            rows={3}
            value={description}
            onChange={(event) => { setDescription(event.target.value) }}
          />
        </Field>
        <Field label={t('skill.field.whenToUse')}>
          <Input value={whenToUse} onChange={(event) => { setWhenToUse(event.target.value) }} />
        </Field>
        <Field label={t('skill.field.content')} hint={t('skill.field.content.hint')}>
          <textarea
            className={css.textarea}
            rows={6}
            value={content}
            onChange={(event) => { setContent(event.target.value) }}
          />
        </Field>
      </div>
    </Modal>
  )
}

/** 一条成功提示在屏幕上待多久。够读完两行字，又不至于一直挡着列表。 */
const TOAST_LINGER_MS = 6000

/**
 * 写操作的结果，浮在这一页左下角。
 *
 * 从原先夹在页签与列表之间的一条横幅改成浮层：那条横幅会把整份列表往下推一
 * 截，装完一个技能之后刚才在看的那一行就跑了位置——而人这时候多半正想接着
 * 装下一个。
 *
 * 三种结果分得很开，因为它们要人做的事完全不同：
 *
 * - **失败**：这一步没做成，得重来。
 * - **成功且生效**：可以接着干别的。这一种会自己消失。
 * - **成功但没生效**：文件确实写进去了，但回读 `ctx.skills` 得到的结论是它调
 *   不到（多半是被同名的更高优先级来源遮蔽）。这句是这一域最要紧的一句话，
 *   它意味着刚才那下白做了，所以**不自动消失**，要人自己点掉。
 *
 * 「生没生效」是回读来的事实，不是「重启后生效」那种预测——写完下一个模型
 * 回合就生效，会不会生效取决于有没有人挡在前面。
 */
function Notices({ data, t }: { readonly data: SkillData; readonly t: Translate }) {
  const state = useStore(data.store)
  const { error, notice, activation } = state
  const stuck = activation !== undefined && !activation.active
  const transient = error === undefined && notice !== undefined && !stuck

  // 依赖里带上 `notice` 本身：连着装两个技能时第二条提示要重新计时，
  // 只看 `transient` 的话它是同一个 true，计时器不会重来。
  useEffect(() => {
    if (!transient) return undefined
    const timer = setTimeout(() => { data.dismiss() }, TOAST_LINGER_MS)
    return () => { clearTimeout(timer) }
  }, [data, transient, notice])

  if (error === undefined && notice === undefined) return null

  return (
    <div className={css.toasts} role="status" aria-live="polite">
      {error !== undefined && (
        <div className={clsx(css.toast, css.toastBad)}>
          <IconWarningOutline16 size={16} className={css.toastMark} />
          <span className={css.toastText}>
            <span className={css.toastTitle}>{t('skill.toast.failed')}</span>
            <span className={css.toastBody}>{error}</span>
          </span>
          <button type="button" className={css.dismiss} onClick={() => { data.dismiss() }}>
            {t('skill.dismiss')}
          </button>
        </div>
      )}
      {notice !== undefined && (
        <div className={clsx(css.toast, stuck && css.toastWarn)}>
          {stuck
            ? <IconWarningOutline16 size={16} className={css.toastMark} />
            : <IconCheckOutline16 size={16} className={css.toastMark} />}
          <span className={css.toastText}>
            <span className={css.toastTitle}>
              {t(stuck ? 'skill.toast.inactive' : 'skill.toast.done')}
            </span>
            <span className={css.toastBody}>{notice}</span>
          </span>
          <button type="button" className={css.dismiss} onClick={() => { data.dismiss() }}>
            {t('skill.dismiss')}
          </button>
        </div>
      )}
    </div>
  )
}

/** 详情页里那一排细页签。 */
/** 正文预览折起来时留多高。 */
const DOC_COLLAPSED_HEIGHT = 520

/** 文件树里的一个节点。 */
type TreeNode =
  | { readonly kind: 'file'; readonly name: string; readonly path: string; readonly size: number }
  | {
    readonly kind: 'dir'
    readonly name: string
    readonly path: string
    readonly children: readonly TreeNode[]
    /** 这个目录底下一共多少个文件（含子目录里的）。 */
    readonly count: number
  }

/** 建树用的可变中间态。 */
interface DirDraft {
  readonly dirs: Map<string, DirDraft>
  readonly files: { name: string; path: string; size: number }[]
}

/**
 * 把一串扁平路径折成目录树。
 *
 * 技能包里的路径本来就是 `references/api.md` 这种形状，摊成一列看不出哪些
 * 归在一起。折成树之后，「这个技能带了一套 references 和一套 scripts」是
 * 一眼的事，而不是要在二十几行里自己数前缀。
 *
 * @param entries - 扁平的文件清单。
 * @returns 根层的节点，目录在前、同类按名字排。
 */
function buildFileTree(entries: readonly SkillFileEntry[]): readonly TreeNode[] {
  const root: DirDraft = { dirs: new Map(), files: [] }
  for (const entry of entries) {
    const parts = entry.path.split('/').filter(part => part !== '')
    const name = parts.pop()
    if (name === undefined) continue
    let cursor = root
    for (const part of parts) {
      let next = cursor.dirs.get(part)
      if (next === undefined) {
        next = { dirs: new Map(), files: [] }
        cursor.dirs.set(part, next)
      }
      cursor = next
    }
    cursor.files.push({ name, path: entry.path, size: entry.size })
  }
  return flattenDraft(root, '')
}

/** 把中间态转成节点，目录排在文件前面。 */
function flattenDraft(draft: DirDraft, prefix: string): readonly TreeNode[] {
  const dirs: TreeNode[] = [...draft.dirs]
    .map(([name, child]) => {
      const path = prefix === '' ? name : `${prefix}/${name}`
      const children = flattenDraft(child, path)
      return { kind: 'dir' as const, name, path, children, count: countFiles(children) }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
  const files: TreeNode[] = draft.files
    .map(file => ({ kind: 'file' as const, ...file }))
    // 根这一层把 SKILL.md 排最前：它是这份技能的入口，按字母排会把它甩到
    // 一堆 json 后面去。
    .sort((left, right) => manifestFirst(left.name) - manifestFirst(right.name)
      || left.name.localeCompare(right.name))
  return [...dirs, ...files]
}

/** 排序权重：SKILL.md 在前，别的在后。 */
function manifestFirst(name: string): number {
  return name === 'SKILL.md' ? 0 : 1
}

/** 一棵子树里有多少个文件。 */
function countFiles(nodes: readonly TreeNode[]): number {
  return nodes.reduce((total, node) => total + (node.kind === 'file' ? 1 : node.count), 0)
}

/**
 * 按扩展名挑一个图标；认不出的画一份普通文件。
 *
 * 兜底的不能是 `IconCodeOutline16`：那是个 `#`，摆在文件名前面看着像文件名
 * 自己带了个井号（`# report.html`），而不像一个图标。
 */
function fileIcon(name: string): ReactNode {
  const ext = name.includes('.') ? name.toLowerCase().split('.').pop() ?? '' : ''
  if (ext === 'md' || ext === 'markdown' || ext === 'txt') return <IconListPenOutline16 size={13} />
  if (ext === 'json' || ext === 'yml' || ext === 'yaml' || ext === 'toml') return <IconDataOutline16 size={13} />
  return <IconFileOutline16 size={13} />
}

/**
 * 文件树：目录可折叠，文件带体积。
 *
 * 默认只摊开第一层：点进「文件」页先看见这个技能有哪几块，要看哪一块再点开
 * 哪一块。整棵摊开的话，references 里几十个文件会把顶层结构冲得看不出来。
 */
function FileTree({ files, t, onOpen }: {
  readonly files: readonly SkillFileEntry[]
  readonly t: Translate
  /** 点一个文件时做什么；不给的话文件行就是不可点的。 */
  readonly onOpen?: ((path: string) => void) | undefined
}) {
  const tree = useMemo(() => buildFileTree(files), [files])
  return (
    <div className={css.tree}>
      <div className={css.treeHead}>
        <span className={css.treeHeadMark} aria-hidden="true">
          <IconFolderOpenOutline16 size={14} />
        </span>
        <span>{t('skill.tab.files')}</span>
        <span className={css.treeCount}>{String(files.length)}</span>
      </div>
      <ul className={css.treeBody}>
        {tree.map(node => (
          <TreeRow key={node.path} node={node} depth={0} t={t} onOpen={onOpen} />
        ))}
      </ul>
    </div>
  )
}

/** 树里的一行；目录会把自己的子树画在下面。 */
function TreeRow({ node, depth, t, onOpen }: {
  readonly node: TreeNode
  readonly depth: number
  readonly t: Translate
  readonly onOpen?: ((path: string) => void) | undefined
}) {
  const [open, setOpen] = useState(false)
  const indent = { paddingLeft: `${String(depth * 16 + 12)}px` }

  if (node.kind === 'file') {
    const body = (
      <>
        <span className={css.treeTwisty} aria-hidden="true" />
        <span className={css.treeMark} aria-hidden="true">{fileIcon(node.name)}</span>
        <span className={css.treeName}>{node.name}</span>
        <span className={css.treeSize}>{formatBytes(node.size)}</span>
      </>
    )
    // 没人接着看的时候文件行画成 div：点它什么都不会发生，做成按钮只会
    // 让人一直点。
    return (
      <li>
        {onOpen === undefined
          ? <div className={css.treeRow} style={indent}>{body}</div>
          : (
            <button
              type="button"
              className={clsx(css.treeRow, css.treeFile)}
              style={indent}
              onClick={() => { onOpen(node.path) }}
            >
              {body}
            </button>
          )}
      </li>
    )
  }

  return (
    <li>
      <button
        type="button"
        className={clsx(css.treeRow, css.treeDir)}
        style={indent}
        aria-expanded={open}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.treeTwisty} aria-hidden="true">
          {open ? <IconChevronDownOutline14 size={12} /> : <IconChevronRightOutline14 size={12} />}
        </span>
        <span className={css.treeMark} aria-hidden="true">
          {open ? <IconFolderOpen16 size={14} /> : <IconFolderClose16 size={14} />}
        </span>
        <span className={css.treeName}>{node.name}</span>
        <span className={css.treeSize}>
          {t('skill.detail.fileCount').replace('{n}', String(node.count))}
        </span>
      </button>
      {open && (
        <ul className={css.treeBody}>
          {node.children.map(child => (
            <TreeRow key={child.path} node={child} depth={depth + 1} t={t} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </li>
  )
}

/** 文件预览的开关与内容。 */
interface FilePreviewState {
  /** 正在看哪个文件；`undefined` 就是没打开。 */
  readonly path: string | undefined
  readonly content: FileContent | undefined
  readonly loading: boolean
  readonly open: (path: string) => void
  readonly close: () => void
}

/**
 * 管一个文件预览：点开、取内容、关掉。
 *
 * 本机与市场两边取内容的方式不同（一个读盘、一个从包里翻），但「点开→等→
 * 显示→关掉」这套状态一模一样，所以收在这里，两边只把各自那个取法传进来。
 *
 * @param fetch - 按路径取内容；取不到时给 undefined（错误已经进了盒子）。
 * @param deps - `fetch` 依赖了什么；变了就把当前这次预览作废。
 * @returns 预览状态与开关。
 */
function useFilePreview(
  fetch: (path: string) => Promise<FileContent | undefined>,
  deps: readonly unknown[],
): FilePreviewState {
  const [path, setPath] = useState<string | undefined>(undefined)
  const [content, setContent] = useState<FileContent | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  // 取的过程是异步的，中途可以再点一个别的文件。记下最后点的那个，
  // 回来的时候对不上就丢掉——否则先发后至会把旧文件的内容盖上来。
  const wanted = useRef<string | undefined>(undefined)

  // 换了技能（或换了市场条目）之后，手上这份内容说的是上一个的事。
  useEffect(() => {
    wanted.current = undefined
    setPath(undefined)
    setContent(undefined)
    setLoading(false)
  }, deps)

  const open = (next: string): void => {
    wanted.current = next
    setPath(next)
    setContent(undefined)
    setLoading(true)
    void fetch(next).then((result) => {
      if (wanted.current !== next) return
      setContent(result)
      setLoading(false)
    })
  }

  const close = (): void => {
    wanted.current = undefined
    setPath(undefined)
    setContent(undefined)
    setLoading(false)
  }

  return { path, content, loading, open, close }
}

/**
 * 静态扫描的取数：点进这一页才去扫。
 *
 * 扫一整包要读几十个文件、跑十三条正则，而多数人打开详情是来看正文的。
 * 挂在页签上按需取，比一进详情就扫一遍省事得多。
 *
 * @param fetch - 去扫；扫不动时给 undefined（错误已经进了盒子）。
 * @param active - 现在正看着这一页。
 * @param deps - `fetch` 依赖了什么；变了就把手上这份结果作废。
 * @returns 扫描结果与「正在扫」。
 */
function useScan(
  fetch: () => Promise<ScanReport | undefined>,
  active: boolean,
  deps: readonly unknown[],
): { readonly report: ScanReport | undefined; readonly loading: boolean } {
  const [report, setReport] = useState<ScanReport | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  // 换了技能（或换了市场条目）之后，手上这份结果说的是上一个的事。
  const token = useRef(0)

  useEffect(() => {
    token.current += 1
    setReport(undefined)
    setLoading(false)
  }, deps)

  useEffect(() => {
    if (!active || report !== undefined || loading) return undefined
    const mine = token.current
    setLoading(true)
    void fetch().then((result) => {
      if (token.current !== mine) return
      setReport(result)
      setLoading(false)
    })
    return undefined
    // fetch 每次渲染都是新的箭头函数，进依赖表会把这一段变成死循环；
    // 它依赖了什么由调用方在 deps 里说清楚。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, report, loading, ...deps])

  return { report, loading }
}

/**
 * 「安全扫描」这个页签写什么。
 *
 * 命中条数直接摆在页签上：这一页的价值在于「有没有值得看一眼的东西」，
 * 那个数字不点进去就该看得见。还没扫过时不写数——写 0 会被读成「扫过、干净」。
 */
function scanTabLabel(report: ScanReport | undefined, t: Translate): string {
  const label = t('skill.tab.scan')
  return report === undefined ? label : `${label} (${String(report.findings.length)})`
}

/** 严重度的字典键；不认识的原样显示。 */
function severityKey(severity: string): LocaleKey | undefined {
  switch (severity) {
    case 'CRITICAL': return 'skill.scan.severity.critical'
    case 'HIGH': return 'skill.scan.severity.high'
    case 'MEDIUM': return 'skill.scan.severity.medium'
    case 'LOW': return 'skill.scan.severity.low'
    case 'INFO': return 'skill.scan.severity.info'
    default: return undefined
  }
}

/** 分类的字典键；不认识的原样显示。 */
function categoryKey(category: string): LocaleKey | undefined {
  switch (category) {
    case 'remote-payload': return 'skill.scan.category.remotePayload'
    case 'credential-access': return 'skill.scan.category.credentialAccess'
    case 'reconnaissance': return 'skill.scan.category.reconnaissance'
    case 'prompt-injection': return 'skill.scan.category.promptInjection'
    case 'remote-control': return 'skill.scan.category.remoteControl'
    case 'obfuscation': return 'skill.scan.category.obfuscation'
    case 'data-exfiltration': return 'skill.scan.category.dataExfiltration'
    case 'persistence': return 'skill.scan.category.persistence'
    default: return undefined
  }
}

/**
 * 静态扫描这一页，摆成一份报告。
 *
 * 版式借的是常见的技能安全报告：左边一个评分环，右边几格数字与一段摘要，
 * 下面是八个检测面各自的结论，再往下逐面展开命中了什么。这样摆是因为多数
 * 时候人只想知道「要不要细看」，那个判断该在第一屏就做完。
 *
 * 但有两处刻意与那类报告**不一样**，否则这一页会骗人：
 *
 * - **不写「可信」「无风险」这种结论**。这里只有十三条正则，给不出安全结论。
 *   一条没命中时说的是「没命中」，不是「安全」。
 * - **不假装有多个引擎**。就一个静态规则引擎，页面上也只标它。
 *
 * 分数同理：它是一个**规则命中分**，用来把一批技能排个先后，决定先看哪一个。
 */
function ScanPanel({ report, loading, t, onOpen }: {
  readonly report: ScanReport | undefined
  readonly loading: boolean
  readonly t: Translate
  /** 点一条命中时跳到那个文件；不给的话命中行不可点。 */
  readonly onOpen?: ((path: string) => void) | undefined
}) {
  if (loading || report === undefined) {
    return <p className={css.empty}>{t(loading ? 'skill.scan.running' : 'skill.detail.loading')}</p>
  }

  const clean = report.findings.length === 0
  const grave = report.findings.filter(one => one.severity === 'CRITICAL' || one.severity === 'HIGH')
  const mild = report.findings.length - grave.length
  const byCategory = new Map<string, ScanFinding[]>()
  for (const finding of report.findings) {
    const bucket = byCategory.get(finding.category)
    if (bucket === undefined) byCategory.set(finding.category, [finding])
    else bucket.push(finding)
  }

  return (
    <div className={css.report}>
      <header className={css.reportHead}>
        <span className={css.reportMark} aria-hidden="true">
          <IconInspectOutline12 size={16} />
        </span>
        <h2 className={css.reportTitle}>{t('skill.scan.title')}</h2>
        <span className={css.reportEngine}>{t('skill.scan.engine')}</span>
      </header>

      <div className={css.reportTop}>
        <section className={css.scoreCard}>
          <span className={css.scoreLabel}>{t('skill.scan.score')}</span>
          <ScoreRing score={report.score} clean={clean} />
          <dl className={css.scoreFacts}>
            <div className={css.scoreFact}>
              <dt>{t('skill.scan.scannedFiles')}</dt>
              <dd>{String(report.scanned)}</dd>
            </div>
            <div className={css.scoreFact}>
              <dt>{t('skill.scan.skippedFiles')}</dt>
              <dd>{String(report.skipped)}</dd>
            </div>
            <div className={css.scoreFact}>
              <dt>{t('skill.scan.topSeverity')}</dt>
              <dd>
                <span className={clsx(css.verdict, clean && css.verdictClean)}>
                  {report.severity === undefined
                    ? t('skill.scan.none')
                    : severityText(report.severity, t)}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <div className={css.reportRight}>
          <div className={css.tiles}>
            <Tile
              label={t('skill.scan.tile.total')}
              foot={t('skill.scan.tile.total.foot')}
              value={report.findings.length}
            />
            <Tile
              label={t('skill.scan.tile.grave')}
              foot={t('skill.scan.tile.grave.foot')}
              value={grave.length}
              tone="warn"
            />
            <Tile
              label={t('skill.scan.tile.mild')}
              foot={t('skill.scan.tile.mild.foot')}
              value={mild}
              tone="mild"
            />
            <Tile
              label={t('skill.scan.tile.faces')}
              foot={t('skill.scan.tile.faces.foot')}
              value={report.categories.length}
            />
          </div>

          <section className={css.summaryCard}>
            <h3 className={css.summaryTitle}>{t('skill.scan.summaryTitle')}</h3>
            <p className={clsx(css.summaryBody, clean && css.summaryBodyClean)}>
              {clean
                ? t('skill.scan.summary.clean')
                  .replace('{scanned}', String(report.scanned))
                  .replace('{rules}', String(RULE_COUNT))
                : t('skill.scan.summary.hits')
                  .replace('{hits}', String(report.findings.length))
                  .replace('{faces}', String(report.categories.filter(one => one.hits > 0).length))
                  .replace('{scanned}', String(report.scanned))}
            </p>
          </section>
        </div>
      </div>

      <section className={css.facesCard}>
        <h3 className={css.sectionTitle}>{t('skill.scan.facesTitle')}</h3>
        <ul className={css.faces}>
          {report.categories.map(face => (
            <li key={face.id} className={clsx(css.face, face.hits > 0 && css.faceHit)}>
              <span className={css.faceName}>{categoryText(face.id, t)}</span>
              <span className={css.faceState}>
                {face.hits === 0
                  ? t('skill.scan.face.quiet')
                  : t('skill.scan.face.hits').replace('{n}', String(face.hits))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={css.facesCard}>
        <h3 className={css.sectionTitle}>{t('skill.scan.detailTitle')}</h3>
        {report.categories.map(face => (
          <div key={face.id} className={css.faceBlock}>
            <div className={css.faceHead}>
              <span className={clsx(css.faceBadge, face.hits > 0 && css.faceBadgeHit)}>
                {face.hits === 0
                  ? t('skill.scan.face.quiet')
                  : severityText(face.severity ?? 'INFO', t)}
              </span>
              <span className={css.faceTag}>{t('skill.scan.engine.static')}</span>
              <span className={css.faceBlockName}>{categoryText(face.id, t)}</span>
            </div>
            <div className={css.log}>
              <div className={css.logHead}>{t('skill.scan.log')}</div>
              {face.hits === 0
                ? <p className={css.logQuiet}>{t('skill.scan.face.quietLine')}</p>
                : (
                  <ul className={css.logList}>
                    {(byCategory.get(face.id) ?? []).map((finding, index) => (
                      <li key={`${finding.rule}:${finding.path}:${String(finding.line ?? 0)}:${String(index)}`}>
                        <FindingRow finding={finding} t={t} onOpen={onOpen} />
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>
        ))}
      </section>

      <p className={css.scanNote}>{t('skill.scan.disclaimer')}</p>
    </div>
  )
}

/** 规则条数。摘要里那句「这十三条都没匹上」用它，改了规则表这句跟着变。 */
const RULE_COUNT = 13

/** 顶上那几格数字。 */
function Tile({ label, foot, value, tone }: {
  readonly label: string
  /** 这一格底下那行小字，说清这个数字该怎么用。 */
  readonly foot: string
  readonly value: number
  readonly tone?: 'warn' | 'mild' | undefined
}) {
  const lit = value > 0
  return (
    <div className={clsx(css.tile, tone === 'warn' && lit && css.tileWarn, tone === 'mild' && lit && css.tileMild)}>
      <span className={css.tileLabel}>{label}</span>
      <span className={css.tileValue}>{String(value)}</span>
      <span className={css.tileFoot}>{foot}</span>
    </div>
  )
}

/**
 * 评分环。
 *
 * 用 `stroke-dasharray` 画弧：实线画满对应的弧长，剩下的留空。起点转到十二点
 * 方向，否则 SVG 从三点钟开始画，看着像少了四分之一圈。
 */
function ScoreRing({ score, clean }: { readonly score: number; readonly clean: boolean }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const filled = circumference * (Math.max(0, Math.min(100, score)) / 100)
  return (
    <svg className={css.ring} viewBox="0 0 128 128" role="img" aria-label={String(score)}>
      <circle className={css.ringTrack} cx="64" cy="64" r={radius} />
      <circle
        className={clsx(css.ringFill, clean && css.ringFillClean)}
        cx="64"
        cy="64"
        r={radius}
        strokeDasharray={`${String(filled)} ${String(circumference - filled)}`}
        transform="rotate(-90 64 64)"
      />
      <text className={clsx(css.ringText, clean && css.ringTextClean)} x="64" y="64">{String(score)}</text>
    </svg>
  )
}

/** 一条命中。点开就是那个文件。 */
function FindingRow({ finding, t, onOpen }: {
  readonly finding: ScanFinding
  readonly t: Translate
  readonly onOpen?: ((path: string) => void) | undefined
}) {
  const body = (
    <>
      <span className={clsx(css.scanSeverity, css[`scan${finding.severity}`])}>
        {severityText(finding.severity, t)}
      </span>
      <span className={css.scanBody}>
        <span className={css.scanWhat}>{finding.description}</span>
        <span className={css.scanWhere}>
          <span className={css.scanPath}>
            {finding.line === undefined ? finding.path : `${finding.path}:${String(finding.line)}`}
          </span>
          <span className={css.scanRule}>{finding.rule}</span>
          {finding.recovery !== undefined && (
            <span className={css.scanRule}>{finding.recovery}</span>
          )}
        </span>
      </span>
    </>
  )
  if (onOpen === undefined) return <div className={css.scanRow}>{body}</div>
  return (
    <button
      type="button"
      className={clsx(css.scanRow, css.scanRowOpen)}
      onClick={() => { onOpen(finding.path) }}
    >
      {body}
    </button>
  )
}

/** 严重度写成人话；不认识的原样显示。 */
function severityText(severity: string, t: Translate): string {
  const key = severityKey(severity)
  return key === undefined ? severity : t(key)
}

/** 检测面写成人话；不认识的原样显示。 */
function categoryText(category: string, t: Translate): string {
  const key = categoryKey(category)
  return key === undefined ? category : t(key)
}

/** 认得出 markdown 的扩展名；这些用渲染视图看，别的按代码看。 */
const MARKDOWN_SUFFIX = /\.(?:md|markdown)$/iu

/**
 * 从文件名猜一个语法高亮用的语言。
 *
 * 猜不着不要紧：`CodeBlock` 对认不出的 lang 就按纯文本画，不会出错。
 */
function langOf(path: string): string | undefined {
  const ext = path.includes('.') ? path.toLowerCase().split('.').pop() ?? '' : ''
  const alias: Record<string, string> = { yml: 'yaml', py: 'python', sh: 'bash', mjs: 'javascript', cjs: 'javascript' }
  return ext === '' ? undefined : alias[ext] ?? ext
}

/**
 * 一个文件的预览弹窗。
 *
 * markdown 走与正文同一套渲染（预览／源码两档），别的走 `CodeBlock`——带高亮
 * 和复制按钮，与会话里代码块的样子一致。
 *
 * 两件事要照实说而不是留空：**二进制**文件的字节压根没往浏览器送（送了也看
 * 不出什么，还白占一次调用），**过大**的只送了开头一段。
 */
function FilePreview({ path, content, loading, t, onClose }: {
  /** 正在看哪个文件；没有就是没打开。 */
  readonly path: string | undefined
  readonly content: FileContent | undefined
  readonly loading: boolean
  readonly t: Translate
  readonly onClose: () => void
}) {
  return (
    <Modal
      open={path !== undefined}
      title={path ?? ''}
      {...content === undefined ? {} : { description: formatBytes(content.size) }}
      closeLabel={t('skill.cancel')}
      className={clsx(css.previewCard)}
      onClose={onClose}
    >
      {loading || content === undefined
        ? <p className={css.empty}>{t('skill.file.loading')}</p>
        : content.binary
          ? (
            <p className={css.banner}>
              {t('skill.file.binary').replace('{size}', formatBytes(content.size))}
            </p>
          )
          : (
            <>
              {content.truncated && (
                <p className={css.banner}>
                  {t('skill.file.truncated').replace('{size}', formatBytes(content.size))}
                </p>
              )}
              {MARKDOWN_SUFFIX.test(content.path)
                ? <MarkdownBody body={content.text ?? ''} t={t} />
                : (
                  <CodeBlock
                    code={content.text ?? ''}
                    lang={langOf(content.path)}
                    className={clsx(css.previewCode)}
                    copyLabel={t('skill.file.copy')}
                    copiedLabel={t('skill.file.copied')}
                  />
                )}
            </>
          )}
    </Modal>
  )
}

/**
 * 一份 SKILL.md 正文：默认渲染成预览，可以切回源码。
 *
 * 渲染走宿主的 {@link MarkdownText}——就是会话里渲染模型回复的那一个。
 * 不自己引一套 markdown 依赖有两层原因：它已经在加载器模块表里，插件产物
 * 不用为此胖一圈；更要紧的是它对**不可信内容**是收着的（原始 HTML 与危险
 * 协议一律禁掉），而市场上的 SKILL.md 正是不可信内容。
 *
 * 留着源码那一档，是因为模型读到的是原文而不是渲染结果：排查一份技能为什么
 * 不对劲时，要看的是原文里到底写了什么。
 */
function MarkdownBody({ body, t }: { readonly body: string; readonly t: Translate }) {
  const [expanded, setExpanded] = useState(false)
  const [tall, setTall] = useState(false)
  const rendered = useRef<HTMLDivElement>(null)

  // 一份 SKILL.md 渲染出来常有几千像素高，整篇摊开会把详情页的其余部分推到
  // 视野之外。折起来之前先量一次：不够高的就别摆那个「展开」按钮。
  useEffect(() => {
    const node = rendered.current
    setTall(node !== null && node.scrollHeight > DOC_COLLAPSED_HEIGHT + 48)
  }, [body])

  const clipped = tall && !expanded

  return (
    <>
      <div className={clsx(css.markdown, clipped && css.markdownClipped)} ref={rendered}>
        <MarkdownText text={body} />
      </div>
      {tall && (
        <button
          type="button"
          className={css.docMore}
          aria-expanded={expanded}
          onClick={() => { setExpanded(!expanded) }}
        >
          {expanded ? <IconChevronUpOutline14 size={12} /> : <IconChevronDownOutline14 size={12} />}
          <span>{t(expanded ? 'skill.doc.collapse' : 'skill.doc.expand')}</span>
        </button>
      )}
    </>
  )
}

/**
 * 包内容那两个页签的公共外壳：加载中、没有包、取不到，三种情况说法一致。
 *
 * 取不到**不是错误**，所以这里给的是一句说明而不是一条红色横幅。`note` 里装的
 * 是宿主下载失败的原话（源不可达、条目转发到了 GitHub、包里 frontmatter 不合规），
 * 比一句「加载失败」有用得多。
 */
function PreviewBody({ preview, foreign, t, fallback, children }: {
  readonly preview: MarketPreview | undefined
  /** 镜像条目：这个源上根本没有包，所以压根没去取。 */
  readonly foreign: boolean
  readonly t: Translate
  /** 取到了、但这一页确实没有东西可显示时说什么。 */
  readonly fallback: string
  readonly children?: ReactNode
}) {
  if (foreign) return <p className={css.empty}>{t('skill.market.preview.foreign')}</p>
  if (preview === undefined) return <p className={css.empty}>{t('skill.market.preview.loading')}</p>
  if (children === undefined) return <p className={css.empty}>{preview.note ?? fallback}</p>
  return <>{children}</>
}

function SubTabs<T extends string>({ tabs, active, onPick }: {
  readonly tabs: readonly (readonly [T, string])[]
  readonly active: T
  readonly onPick: (id: T) => void
}) {
  return (
    <div className={css.subTabs} role="tablist">
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          className={clsx(css.subTab, active === id && css.subTabActive)}
          onClick={() => { onPick(id) }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** 事实卡里的一行。 */
function FactRow({ label, children }: { readonly label: string; readonly children: ReactNode }) {
  return (
    <div className={css.factRow}>
      <span className={css.factLabel}>{label}</span>
      <span className={css.factValue}>{children}</span>
    </div>
  )
}

/** 一个带标签的字段。 */
function Field({ label, hint, children }: {
  readonly label: string
  readonly hint?: string
  readonly children: ReactNode
}) {
  return (
    <div className={css.field}>
      <span className={css.label}>{label}</span>
      {children}
      {hint !== undefined && <span className={css.hint}>{hint}</span>}
    </div>
  )
}

/** 一条错误。 */
function ErrorLine({ text }: { readonly text: string }) {
  return (
    <p className={css.error}>
      <IconWarningOutline16 size={14} />
      <span>{text}</span>
    </p>
  )
}
