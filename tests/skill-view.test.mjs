/**
 * 技能投影的行为锁。
 *
 * 这份投影是工具与管理界面**共用**的那一份，所以它错了是两处一起错。
 * 用例集中在一件事上：`collectSkills` 合并两份清单时，谁算生效、谁算被
 * 遮蔽、谁算本插件改得动。
 *
 * 「被遮蔽」是这一域最容易让人白忙的状态——盘上有、却不生效，改它没有任何
 * 效果。标错了的后果不是报错，是「我明明建了却调不到」，那种问题很难查。
 */

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import { collectSkills, createLocalSkill, detailNote, projectLocal, projectWinner, winnerIsLocal } from '../lib/index.js'

/** 建一个临时的技能根目录。 */
async function withRoot(run) {
  const root = await mkdtemp(join(tmpdir(), 'dsh-workbench-view-'))
  try {
    return await run(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

/** 一个假的 `ctx`，只回答 `ctx.get('skills')`。 */
function fakeCtx(winners) {
  return {
    get: (name) => name !== 'skills'
      ? undefined
      : { list: async () => winners, get: async (n) => winners.find(w => w.name === n) },
  }
}

/** 照 `SkillSummary` 的形状造一个赢家。 */
function winner(name, source, dir) {
  return {
    name,
    description: `${name} 的说明`,
    source,
    provider: `${source}-provider`,
    invocation: { modelInvocable: true, userInvocable: true },
    ...dir === undefined ? {} : { resourceBase: { kind: 'directory', path: dir } },
  }
}

test('没有技能服务时，清单就是盘上那些，且都不算被遮蔽', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'alpha', description: '甲' })
    const views = await collectSkills({ get: () => undefined }, root)
    assert.equal(views.length, 1)
    assert.equal(views[0].name, 'alpha')
    assert.equal(views[0].shadowed, false)
    assert.equal(views[0].managed, true)
  })
})

test('盘上那份就是生效的那份时，只出现一次', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'alpha', description: '甲' })
    const ctx = fakeCtx([winner('alpha', 'user-dsh', join(root, 'alpha'))])
    const views = await collectSkills(ctx, root)
    assert.equal(views.length, 1)
    assert.equal(views[0].shadowed, false)
    // 赢家就是我们这份，所以改得动。
    assert.equal(views[0].managed, true)
  })
})

test('同名被更高优先级来源盖住时，盘上那份标 shadowed', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'alpha', description: '甲' })
    const ctx = fakeCtx([winner('alpha', 'project', '/somewhere/else/alpha')])
    const views = await collectSkills(ctx, root)
    // 两份都在：生效的那份，和盘上被盖住的那份。
    assert.equal(views.length, 2)
    const shadowed = views.filter(view => view.shadowed)
    assert.equal(shadowed.length, 1)
    assert.equal(shadowed[0].source, 'user-dsh')
    // 生效的那份不是我们的，改不动。
    const effective = views.find(view => !view.shadowed)
    assert.equal(effective.source, 'project')
    assert.equal(effective.managed, false)
  })
})

test('只在别处存在的技能照样列出来，标成改不动', async () => {
  await withRoot(async (root) => {
    const ctx = fakeCtx([winner('bundled-one', 'bundled', undefined)])
    const views = await collectSkills(ctx, root)
    assert.equal(views.length, 1)
    assert.equal(views[0].managed, false)
    assert.equal(views[0].shadowed, false)
    // 没有目录型 resourceBase 的技能给不出路径，不能凭空编一个。
    assert.equal(views[0].path, undefined)
  })
})

test('清单按名字排序，两份来源混在一起也是', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'zulu', description: 'z' })
    const ctx = fakeCtx([winner('alpha', 'bundled', undefined), winner('mike', 'project', '/x/mike')])
    const views = await collectSkills(ctx, root)
    assert.deepEqual(views.map(view => view.name), ['alpha', 'mike', 'zulu'])
  })
})

test('赢家是不是本地那份，按解析后的路径比，不比字符串', async () => {
  const root = '/tmp/skills'
  assert.equal(winnerIsLocal(winner('alpha', 'user-dsh', join(root, 'alpha')), root), true)
  assert.equal(winnerIsLocal(winner('alpha', 'project', '/elsewhere/alpha'), root), false)
  // 没有目录型 resourceBase 的（例如插件内置的）一律不算本地。
  assert.equal(winnerIsLocal(winner('alpha', 'bundled', undefined), root), false)
})

test('本地投影带上附带文件，没有附带文件时不出现这个字段', () => {
  const base = {
    name: 'alpha',
    description: '甲',
    modelInvocable: true,
    userInvocable: false,
    path: '/x/alpha/SKILL.md',
    content: '正文',
  }
  assert.equal(projectLocal({ ...base, files: [] }, false).files, undefined)
  assert.deepEqual(projectLocal({ ...base, files: ['ref.md'] }, false).files, ['ref.md'])
  // 可见性照原样带出去：界面上那两个勾就是它。
  assert.equal(projectLocal({ ...base, files: [] }, false).userInvocable, false)
})

test('赢家投影带上提供方，且永远不标 shadowed', () => {
  const view = projectWinner(winner('alpha', 'project', '/x/alpha'), false)
  assert.equal(view.provider, 'project-provider')
  // 它就是生效的那份，谈不上被谁遮蔽。
  assert.equal(view.shadowed, false)
  assert.equal(view.path, '/x/alpha')
})

test('详情页只挂说得出这一份技能的结论，部署级的那句不挂', () => {
  // 「宿主层不扫本地技能根」对根下每一份都成立，摆在每一页顶上就是同一段话
  // 重复 N 遍，还会把真正与这一份有关的（被拒收、被遮蔽）淹掉。
  const deployment = { active: false, mine: false, summary: '已落盘。这个部署的宿主层不扫本地技能根……', scope: 'deployment' }
  assert.equal(detailNote(deployment), undefined)

  const rejected = { active: false, mine: false, summary: '已落盘，但 DSH 会整份丢弃它：description 缺失', scope: 'skill' }
  assert.equal(detailNote(rejected), rejected.summary)

  // 没查（这个部署没有 activation 服务）时同样不说话。
  assert.equal(detailNote(undefined), undefined)
})
