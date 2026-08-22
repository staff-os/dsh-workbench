/**
 * AI 员工域的维护界面：列表 ⇄ 编辑面板。
 *
 * 形态照搬智能体页——编辑不是弹窗，而是**内联覆盖列表**，
 * 顶部一条「返回列表」回去；编辑面板左侧一列 tab 导航，右侧是内容。弹窗装
 * 不下十来个字段，来回开关也会丢掉正在改的东西。
 *
 * 底下接的全是 DSH 自己的能力：员工是 `ctx.agentPresets` 的 preset，绑定是
 * 工作台写在 preset 目录里的 `employee.yml`，两者都经本包的 Remote 通道取。
 * 界面上出现的每一个字段都对应一个真实的本地文件字段，没有为了好看而画的
 * 空壳。
 *
 * @module @staff-os/dsh-workbench/client/employee/EmployeeSection
 */

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import {
  Button,
  IconAgentPresetOutline16,
  IconApiOutline14,
  IconCodeOutline16,
  IconDataOutline16,
  IconPlusOutline16,
  IconRefreshOutline16,
  IconSettingsOutline14,
  IconTrashOutline16,
  IconUserOutline16,
  IconWarningOutline16,
  Input,
  Modal,
  Pill,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ReactNode } from 'react'
import { IconWrenchOutline16 } from '../icons.tsx'
import { useStore } from '../state.ts'
import type { EmployeeData } from './data.ts'
import type { CompositionEntry, CompositionSummary, EmployeeView } from '../contract/remote.ts'
import type { LocaleKey } from '../locales.ts'
import css from './EmployeeSection.module.css'

/** 翻译函数，与插槽给组件的那个同形。 */
type Translate = (key: LocaleKey) => string

/** 编辑面板的分页。 */
type EditorTab = 'identity' | 'tools' | 'knowledge' | 'skills' | 'mcp' | 'files'

/** 分页表：id、标题字典键、图标。 */
const TABS: readonly { readonly id: EditorTab; readonly titleKey: LocaleKey; readonly icon: ReactNode }[] = [
  { id: 'identity', titleKey: 'employee.tab.identity', icon: <IconUserOutline16 size={14} /> },
  { id: 'tools', titleKey: 'employee.tab.tools', icon: <IconSettingsOutline14 size={14} /> },
  { id: 'knowledge', titleKey: 'employee.tab.knowledge', icon: <IconDataOutline16 size={14} /> },
  { id: 'skills', titleKey: 'employee.tab.skills', icon: <IconWrenchOutline16 size={14} /> },
  { id: 'mcp', titleKey: 'employee.tab.mcp', icon: <IconApiOutline14 size={14} /> },
  { id: 'files', titleKey: 'employee.tab.files', icon: <IconCodeOutline16 size={14} /> },
]

/** 员工域界面的 props。 */
export interface EmployeeSectionProps {
  readonly data: EmployeeData
  readonly t: Translate
}

/**
 * 画员工域。
 * @param props - 数据层与翻译函数。
 * @returns 列表或编辑面板。
 */
export function EmployeeSection({ data, t }: EmployeeSectionProps) {
  const state = useStore(data.store)
  const [editing, setEditing] = useState<string | undefined>(undefined)

  // 面板第一次出现时取一份快照。之后靠写操作自带的刷新，不做轮询——
  // 本地文件不会自己变，会变是因为有人在这儿改了它。
  useEffect(() => { void data.refresh() }, [data])

  const employees = state.snapshot?.employees ?? []
  const current = editing === undefined
    ? undefined
    : employees.find(employee => employee.id === editing)

  // 正在编辑的员工被删掉了（或者刚好不在新快照里）就退回列表，
  // 而不是留在一个指向空气的编辑面板上。
  useEffect(() => {
    if (editing !== undefined && state.snapshot !== undefined && current === undefined) {
      setEditing(undefined)
    }
  }, [editing, state.snapshot, current])

  if (current !== undefined) {
    return (
      <EmployeeEditor
        employee={current}
        data={data}
        t={t}
        onBack={() => { setEditing(undefined) }}
      />
    )
  }

  return (
    <EmployeeList
      data={data}
      t={t}
      onEdit={(id) => { setEditing(id) }}
    />
  )
}

/** 列表视图的 props。 */
interface EmployeeListProps {
  readonly data: EmployeeData
  readonly t: Translate
  readonly onEdit: (id: string) => void
}

/** 员工列表：一屏卡片，外加新建入口。 */
function EmployeeList({ data, t, onEdit }: EmployeeListProps) {
  const state = useStore(data.store)
  const [keyword, setKeyword] = useState('')
  const [creating, setCreating] = useState(false)

  const employees = state.snapshot?.employees ?? []
  const needle = keyword.trim().toLowerCase()
  const shown = needle === ''
    ? employees
    : employees.filter(employee => `${employee.id} ${employee.name} ${employee.description ?? ''}`
      .toLowerCase().includes(needle))

  return (
    <div className={css.section}>
      <header className={css.head}>
        <div className={css.headText}>
          <h1 className={css.title}>{t('section.employees')}</h1>
          <p className={css.subtitle}>{t('employee.subtitle')}</p>
        </div>
        <div className={css.headActions}>
          <Input
            className={clsx(css.search)}
            value={keyword}
            placeholder={t('employee.search')}
            aria-label={t('employee.search')}
            onChange={(event) => { setKeyword(event.target.value) }}
          />
          <Tooltip label={t('employee.refresh')} delayMs={400}>
            <Button
              variant="outline"
              size="sm"
              aria-label={t('employee.refresh')}
              disabled={state.busy}
              icon={<IconRefreshOutline16 size={16} />}
              onClick={() => { void data.refresh() }}
            />
          </Tooltip>
          <Button
            variant="primary"
            size="sm"
            icon={<IconPlusOutline16 size={16} />}
            disabled={state.busy || employees.length === 0}
            onClick={() => { setCreating(true) }}
          >
            {t('employee.create')}
          </Button>
        </div>
      </header>

      {state.error !== undefined && <ErrorLine text={state.error} />}

      <div className={css.body}>
        {state.loading
          ? <p className={css.empty}>{t('employee.loading')}</p>
          : shown.length === 0
            ? <p className={css.empty}>{needle === '' ? t('employee.none') : t('employee.noMatch')}</p>
            : (
              <ul className={css.grid}>
                {shown.map(employee => (
                  <li key={employee.id}>
                    <EmployeeCard employee={employee} t={t} onEdit={() => { onEdit(employee.id) }} />
                  </li>
                ))}
              </ul>
            )}
      </div>

      <CreateDialog
        open={creating}
        data={data}
        t={t}
        employees={employees}
        defaultId={state.snapshot?.defaultId}
        onClose={() => { setCreating(false) }}
        onCreated={(id) => { setCreating(false); onEdit(id) }}
      />
    </div>
  )
}

/** 一张员工卡片。 */
function EmployeeCard({ employee, t, onEdit }: {
  readonly employee: EmployeeView
  readonly t: Translate
  readonly onEdit: () => void
}) {
  const readOnly = employee.trust !== 'user'
  const bound = employee.knowledgeBases.length + employee.skills.length + employee.mcpServers.length
  return (
    <button type="button" className={css.card} aria-label={employee.name} onClick={onEdit}>
      <span className={css.cardMark} aria-hidden="true">
        <IconAgentPresetOutline16 size={18} />
      </span>
      <span className={css.cardMain}>
        <span className={css.cardTitle}>
          <span className={css.cardName}>{employee.name}</span>
          {employee.isDefault && <Pill className={clsx(css.tag)}>{t('employee.tag.default')}</Pill>}
          {readOnly && <Pill className={clsx(css.tag)}>{t('employee.tag.readonly')}</Pill>}
        </span>
        <span className={css.cardId}>{employee.id}</span>
        <span className={css.cardDesc}>
          {employee.description
            ?? employee.persona
            ?? employee.capabilities.personaLine
            ?? t('employee.noDescription')}
        </span>
        {employee.broken === undefined
          ? (
            <span className={css.cardFacts}>
              <span className={css.fact}>
                {t('employee.meta.tools').replace('{n}', String(employee.capabilities.tools))}
              </span>
              {employee.capabilities.skills > 0 && (
                <span className={css.fact}>{t('employee.meta.skillCapable')}</span>
              )}
              {employee.capabilities.personaComplete && (
                <span className={css.fact}>{t('employee.meta.fixedPrompt')}</span>
              )}
              {employee.capabilities.agentInstructions && (
                <span className={css.fact}>{t('employee.meta.agents')}</span>
              )}
              <span className={css.fact}>
                {t(bound === 0 ? 'employee.meta.unbound' : 'employee.meta.bound')
                  .replace('{n}', String(bound))}
              </span>
            </span>
          )
          : (
            <span className={css.cardMeta}>
              <span className={css.broken}>
                <IconWarningOutline16 size={14} />
                {employee.broken}
              </span>
            </span>
          )}
      </span>
    </button>
  )
}

/** 编辑面板的 props。 */
interface EmployeeEditorProps {
  readonly employee: EmployeeView
  readonly data: EmployeeData
  readonly t: Translate
  readonly onBack: () => void
}

/** 编辑面板：左 tab 导航，右内容。 */
function EmployeeEditor({ employee, data, t, onBack }: EmployeeEditorProps) {
  const state = useStore(data.store)
  const [tab, setTab] = useState<EditorTab>('identity')
  const [removing, setRemoving] = useState(false)
  const [source, setSource] = useState<string | undefined>(undefined)
  const [composition, setComposition] = useState<CompositionSummary | undefined>(undefined)
  const readOnly = employee.trust !== 'user'

  // 换人就回到第一页：停在「技能」页看另一个人的技能，很容易以为改的还是
  // 上一个人。
  useEffect(() => { setTab('identity') }, [employee.id])

  // 组合文件在这儿读一次给下面几页共用：人设、工具、技能能力都在同一份文件
  // 里，每页各读一次等于同一个文件取四遍。
  useEffect(() => {
    let live = true
    setSource(undefined)
    setComposition(undefined)
    void data.read(employee.id).then((result) => {
      if (!live || result === undefined) return
      setSource(result.source)
      setComposition(result.composition)
    })
    return () => { live = false }
  }, [data, employee.id])

  return (
    <div className={css.section}>
      <header className={css.head}>
        <div className={css.headText}>
          <button type="button" className={css.back} onClick={onBack}>
            {t('employee.back')}
          </button>
          <h1 className={css.title}>{employee.name}</h1>
          <p className={css.subtitle}>{employee.id}</p>
        </div>
        <div className={css.headActions}>
          {employee.isDefault && <Pill className={clsx(css.tag)}>{t('employee.tag.default')}</Pill>}
          {readOnly && <Pill className={clsx(css.tag)}>{t('employee.tag.readonly')}</Pill>}
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              icon={<IconTrashOutline16 size={16} />}
              disabled={state.busy}
              onClick={() => { setRemoving(true) }}
            >
              {t('employee.delete')}
            </Button>
          )}
        </div>
      </header>

      {state.error !== undefined && <ErrorLine text={state.error} />}

      <div className={css.editor}>
        <nav className={css.tabs} aria-orientation="vertical" role="tablist">
          {TABS.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === tab}
              aria-label={t(item.titleKey)}
              className={clsx(css.tab, item.id === tab && css.tabActive)}
              onClick={() => { setTab(item.id) }}
            >
              {item.icon}
              <span>{t(item.titleKey)}</span>
            </button>
          ))}
        </nav>

        <div className={css.tabBody}>
          {tab === 'identity' && (
            <IdentityTab
              employee={employee}
              data={data}
              t={t}
              readOnly={readOnly}
              composition={composition}
            />
          )}
          {tab === 'tools' && <ToolsTab composition={composition} t={t} />}
          {tab === 'knowledge' && (
            <BindingTab
              kind="knowledgeBases"
              employee={employee}
              data={data}
              t={t}
              readOnly={readOnly}
              available={state.snapshot?.knowledgeBases ?? []}
              emptyKey="employee.bind.noKnowledge"
              composition={composition}
            />
          )}
          {tab === 'skills' && (
            <BindingTab
              kind="skills"
              employee={employee}
              data={data}
              t={t}
              readOnly={readOnly}
              available={state.snapshot?.skills ?? []}
              emptyKey="employee.bind.noSkills"
              composition={composition}
            />
          )}
          {tab === 'mcp' && (
            <BindingTab
              kind="mcpServers"
              employee={employee}
              data={data}
              t={t}
              readOnly={readOnly}
              available={state.snapshot?.mcpServers ?? []}
              emptyKey="employee.bind.noMcp"
              composition={composition}
            />
          )}
          {tab === 'files' && <FilesTab source={source} t={t} />}
        </div>
      </div>

      <Modal
        open={removing}
        title={t('employee.delete.title')}
        description={t('employee.delete.hint').replace('{id}', employee.id)}
        closeLabel={t('employee.cancel')}
        onClose={() => { setRemoving(false) }}
        footer={(
          <div className={css.dialogFooter}>
            <Button variant="ghost" onClick={() => { setRemoving(false) }}>
              {t('employee.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={state.busy}
              onClick={() => {
                void data.remove(employee.id).then((done) => {
                  setRemoving(false)
                  if (done) onBack()
                })
              }}
            >
              {t('employee.delete.confirm')}
            </Button>
          </div>
        )}
      />
    </div>
  )
}

/**
 * 基本设置页：名片（可改）+ 模板自带的人设（只读）。
 *
 * 两个「人设」得分清楚，界面上也分了两块：
 *
 * - **模板自带的人设**是组合文件里 `dsh-persona` 行的系统提示，它决定这个
 *   智能体开口时是谁。改它要动组合文件，本插件不碰。
 * - **岗位说明**是工作台自己加的一层，写在 `employee.yml` 里，给模型看
 *   「以这个员工身份工作时你负责什么」。
 *
 * 把后者说成"人设"会让人以为改了它就改了系统提示，其实没有。
 */
function IdentityTab({ employee, data, t, readOnly, composition }: {
  readonly employee: EmployeeView
  readonly data: EmployeeData
  readonly t: Translate
  readonly readOnly: boolean
  readonly composition: CompositionSummary | undefined
}) {
  const state = useStore(data.store)
  const [name, setName] = useState(employee.name)
  const [description, setDescription] = useState(employee.description ?? '')
  const [persona, setPersona] = useState(employee.persona ?? '')

  // 换人时把草稿换成那个人的值，否则会把上一个人的名字存到这个人身上。
  useEffect(() => {
    setName(employee.name)
    setDescription(employee.description ?? '')
    setPersona(employee.persona ?? '')
  }, [employee.id, employee.name, employee.description, employee.persona])

  const metaDirty = name.trim() !== employee.name
    || description.trim() !== (employee.description ?? '')
  const personaDirty = persona.trim() !== (employee.persona ?? '')

  return (
    <div className={css.pane}>
      <Field label={t('employee.field.name')} hint={t('employee.field.name.hint')}>
        <Input
          value={name}
          disabled={readOnly}
          onChange={(event) => { setName(event.target.value) }}
        />
      </Field>
      <Field label={t('employee.field.description')} hint={t('employee.field.description.hint')}>
        <textarea
          className={css.textarea}
          rows={2}
          value={description}
          disabled={readOnly}
          onChange={(event) => { setDescription(event.target.value) }}
        />
      </Field>
      <Field label={t('employee.field.persona')} hint={t('employee.field.persona.hint')}>
        <textarea
          className={css.textarea}
          rows={6}
          value={persona}
          disabled={readOnly}
          onChange={(event) => { setPersona(event.target.value) }}
        />
      </Field>

      <section className={css.block}>
        <h2 className={css.blockTitle}>{t('employee.field.systemPrompt')}</h2>
        <p className={css.note}>{t('employee.field.systemPrompt.hint')}</p>
        {composition === undefined
          ? <p className={css.empty}>{t('employee.loading')}</p>
          : composition.persona === undefined
            ? <p className={css.empty}>{t('employee.persona.inherited')}</p>
            : (
              <>
                <pre className={css.source}>{composition.persona.text}</pre>
                <ul className={css.facts}>
                  <li>
                    {t(composition.persona.complete
                      ? 'employee.persona.complete'
                      : 'employee.persona.extendable')}
                  </li>
                  <li>
                    {t(composition.persona.includeRuntimeContext
                      ? 'employee.persona.runtimeOn'
                      : 'employee.persona.runtimeOff')}
                  </li>
                  <li>
                    {t(composition.agentInstructions
                      ? 'employee.persona.agentsOn'
                      : 'employee.persona.agentsOff')}
                  </li>
                </ul>
              </>
            )}
      </section>

      {!readOnly && (
        <div className={css.paneActions}>
          <Button
            variant="primary"
            size="sm"
            disabled={state.busy || (!metaDirty && !personaDirty)}
            onClick={() => {
              void (async () => {
                if (metaDirty) {
                  await data.update(employee.id, {
                    name: name.trim(),
                    description: description.trim(),
                    ...employee.order === undefined ? {} : { order: employee.order },
                  })
                }
                if (personaDirty) await data.bind(employee.id, { persona: persona.trim() })
              })()
            }}
          >
            {t('employee.save')}
          </Button>
        </div>
      )}
      {readOnly && <p className={css.note}>{t('employee.readonly.hint')}</p>}
    </div>
  )
}

/**
 * 工具页：这个模板装了哪些工具插件。
 *
 * 全部读自组合文件，只读——工具是 preset 的组成部分，加减工具等于改这个
 * 智能体本身，那要动组合文件。
 *
 * 显示的是**插件行**而不是工具名：一行可能往目录里注册好几个工具（`fs` 就
 * 是），真正的工具名要到运行时才定。界面上照实写清楚，免得有人照着这个数
 * 去数模型能调几个工具。
 */
function ToolsTab({ composition, t }: {
  readonly composition: CompositionSummary | undefined
  readonly t: Translate
}) {
  if (composition === undefined) {
    return <div className={css.pane}><p className={css.empty}>{t('employee.loading')}</p></div>
  }
  if (composition.error !== undefined) {
    return (
      <div className={css.pane}>
        <p className={css.missing}>
          <IconWarningOutline16 size={14} />
          <span>{t('employee.composition.error').replace('{reason}', composition.error)}</span>
        </p>
      </div>
    )
  }

  return (
    <div className={css.pane}>
      <p className={css.note}>{t('employee.tools.hint')}</p>

      {composition.tools.length === 0
        ? <p className={css.empty}>{t('employee.tools.none')}</p>
        : <EntryList entries={composition.tools} t={t} />}

      {composition.others.length > 0 && (
        <section className={css.block}>
          <h2 className={css.blockTitle}>{t('employee.tools.others')}</h2>
          <p className={css.note}>{t('employee.tools.others.hint')}</p>
          <EntryList entries={composition.others} t={t} />
        </section>
      )}
    </div>
  )
}

/** 一列组合文件条目。 */
function EntryList({ entries, t }: {
  readonly entries: readonly CompositionEntry[]
  readonly t: Translate
}) {
  return (
    <ul className={css.entryList}>
      {entries.map(entry => (
        <li key={`${entry.group.join('/')}/${entry.id ?? entry.name}`} className={css.entry}>
          <span className={css.entryHead}>
            <span className={css.entryName}>{entry.id ?? entry.label}</span>
            {entry.disabled !== undefined && (
              <span className={css.entryFlag}>
                {entry.disabled === true
                  ? t('employee.entry.disabled')
                  : t('employee.entry.conditional').replace('{cond}', entry.disabled)}
              </span>
            )}
          </span>
          <code className={css.entryPackage}>{entry.name}</code>
          {entry.group.length > 0 && (
            <span className={css.entryGroup}>{entry.group.join(' › ')}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * 三个绑定页共用一个实现：先说这个模板本身支不支持该类资源，再给绑定清单。
 *
 * 两层必须分开讲，否则界面会骗人：`minimal` 那种模板压根没装技能能力，给它
 * 绑一堆技能，绑定是写进去了，模型却根本没有用技能的工具。上面一行说的是
 * 「这个智能体有没有这个能力」（读自组合文件），下面的清单才是「让它用哪些」。
 */
function BindingTab({ kind, employee, data, t, readOnly, available, emptyKey, composition }: {
  readonly kind: 'knowledgeBases' | 'skills' | 'mcpServers'
  readonly employee: EmployeeView
  readonly data: EmployeeData
  readonly t: Translate
  readonly readOnly: boolean
  readonly available: readonly string[]
  readonly emptyKey: LocaleKey
  readonly composition: CompositionSummary | undefined
}) {
  const state = useStore(data.store)
  const bound = employee[kind]

  const toggle = (id: string): void => {
    const next = bound.includes(id)
      ? bound.filter(item => item !== id)
      : [...bound, id]
    void data.bind(employee.id, { [kind]: next, mode: 'replace' })
  }

  // 绑定里指向了不存在资源的条目也要露出来：藏起来的话，界面上看着好好的，
  // 模型照着这份清单去找却什么都找不到。
  const missing = bound.filter(id => !available.includes(id))

  // 组合文件里对应的能力行。知识库不是 DSH 的组合概念——它整个是工作台加的
  // 一层，所以那一页没有这条。
  const capability = composition === undefined || kind === 'knowledgeBases'
    ? undefined
    : kind === 'skills' ? composition.skills : composition.mcpServers

  return (
    <div className={css.pane}>
      {capability !== undefined && (
        <div className={capability.length === 0 ? css.missing : css.capability}>
          {capability.length === 0
            ? (
              <>
                <IconWarningOutline16 size={14} />
                <span>
                  {t(kind === 'skills'
                    ? 'employee.capability.noSkills'
                    : 'employee.capability.noMcp')}
                </span>
              </>
            )
            : (
              <span>
                {t(kind === 'skills'
                  ? 'employee.capability.skills'
                  : 'employee.capability.mcp')
                  .replace('{items}', capability.map(entry => entry.id ?? entry.label).join('、'))}
              </span>
            )}
        </div>
      )}

      <p className={css.note}>{t('employee.bind.hint')}</p>

      {missing.length > 0 && (
        <div className={css.missing}>
          <IconWarningOutline16 size={14} />
          <span>{t('employee.bind.missing').replace('{items}', missing.join('、'))}</span>
        </div>
      )}

      {available.length === 0
        ? <p className={css.empty}>{t(emptyKey)}</p>
        : (
          <ul className={css.checkList}>
            {available.map(id => (
              <li key={id}>
                <label className={css.check}>
                  <input
                    type="checkbox"
                    checked={bound.includes(id)}
                    disabled={readOnly || state.busy}
                    onChange={() => { toggle(id) }}
                  />
                  <span>{id}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
    </div>
  )
}

/**
 * 核心文件页：组合文件原文。
 *
 * 上面几页展示的都是从这份文件解析出来的东西，而解析是按包名前缀的启发式；
 * 认不出来的行只有原文说了算，所以原文得能看到。
 */
function FilesTab({ source, t }: {
  readonly source: string | undefined
  readonly t: Translate
}) {
  return (
    <div className={css.pane}>
      <p className={css.note}>{t('employee.files.hint')}</p>
      {source === undefined
        ? <p className={css.empty}>{t('employee.loading')}</p>
        : <pre className={css.source}>{source}</pre>}
    </div>
  )
}

/** 新建对话框：选模板、起 id 和名字。 */
function CreateDialog({ open, data, t, employees, defaultId, onClose, onCreated }: {
  readonly open: boolean
  readonly data: EmployeeData
  readonly t: Translate
  readonly employees: readonly EmployeeView[]
  readonly defaultId: string | undefined
  readonly onClose: () => void
  readonly onCreated: (id: string) => void
}) {
  const state = useStore(data.store)
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState(defaultId ?? '')

  useEffect(() => {
    if (!open) return
    setId('')
    setName('')
    setFrom(defaultId ?? employees[0]?.id ?? '')
  }, [open, defaultId, employees])

  const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id.trim())

  return (
    <Modal
      open={open}
      title={t('employee.create.title')}
      description={t('employee.create.hint')}
      closeLabel={t('employee.cancel')}
      onClose={onClose}
      footer={(
        <div className={css.dialogFooter}>
          <Button variant="ghost" onClick={onClose}>{t('employee.cancel')}</Button>
          <Button
            variant="primary"
            disabled={!valid || state.busy || from === ''}
            onClick={() => {
              void data.create(id.trim(), from, name.trim() === '' ? undefined : name.trim())
                .then((done) => { if (done) onCreated(id.trim()) })
            }}
          >
            {t('employee.create.confirm')}
          </Button>
        </div>
      )}
    >
      <div className={css.dialogBody}>
        <Field label={t('employee.create.from')} hint={t('employee.create.from.hint')}>
          <select
            className={css.select}
            value={from}
            onChange={(event) => { setFrom(event.target.value) }}
          >
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.name}（{employee.id}）
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('employee.create.id')} hint={t('employee.create.id.hint')}>
          <Input
            value={id}
            placeholder="sales-assistant"
            onChange={(event) => { setId(event.target.value) }}
          />
        </Field>
        <Field label={t('employee.field.name')} hint={t('employee.create.name.hint')}>
          <Input value={name} onChange={(event) => { setName(event.target.value) }} />
        </Field>
      </div>
    </Modal>
  )
}

/** 一个带标签与说明的字段。 */
function Field({ label, hint, children }: {
  readonly label: string
  readonly hint?: string
  readonly children: ReactNode
}) {
  return (
    <label className={css.field}>
      <span className={css.fieldLabel}>{label}</span>
      {children}
      {hint !== undefined && <span className={css.fieldHint}>{hint}</span>}
    </label>
  )
}

/** 一条错误横幅。 */
function ErrorLine({ text }: { readonly text: string }) {
  return (
    <p className={css.error} role="alert">
      <IconWarningOutline16 size={14} />
      <span>{text}</span>
    </p>
  )
}
