/**
 * AI 员工绑定清单的行为锁。
 *
 * 绑定文件是**附加**在 DSH preset 目录里的，所以最该守住的是它不越界：
 * 不碰 preset 自己的组合文件，元数据只走 DSH 提供的渲染器，
 * 以及「清空就把文件删掉」——留一个只剩时间戳的空壳会让下次读出一份
 * 看起来存在、实际什么都没绑的清单。
 */

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  applyBinding,
  assertEmployeeId,
  EMPLOYEE_FILE,
  emptyBindings,
  readBindings,
  writeBindings,
  writeMetadata,
} from '../lib/index.js'

/** 建一个临时的 preset 目录。 */
async function withPresetDir(run) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-workbench-preset-'))
  await writeFile(join(dir, 'agent.cordis.yml'), '- id: agent-loop\n', 'utf8')
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('员工 id 与 preset 目录名同一套约束', () => {
  assert.doesNotThrow(() => assertEmployeeId('finance-assistant'))
  assert.throws(() => assertEmployeeId('Finance'), /不合法/u)
  assert.throws(() => assertEmployeeId('../escape'), /不合法/u)
})

test('没有绑定文件时读出空清单，而不是报错', async () => {
  await withPresetDir(async (dir) => {
    assert.deepEqual(await readBindings(dir), emptyBindings())
  })
})

test('绑定写入后读得回来，且列表去重排序', async () => {
  await withPresetDir(async (dir) => {
    await writeBindings(dir, {
      persona: '你是财务助理，负责报销审核。',
      knowledgeBases: ['finance-policy', 'hr-handbook', 'finance-policy'],
      skills: ['expense-review'],
      mcpServers: [],
    })
    const read = await readBindings(dir)
    assert.equal(read.persona, '你是财务助理，负责报销审核。')
    assert.deepEqual([...read.knowledgeBases], ['finance-policy', 'hr-handbook'], '去重并排序，写两遍不会存两份')
    assert.deepEqual([...read.skills], ['expense-review'])
    assert.deepEqual([...read.mcpServers], [])
    assert.ok(read.updatedAt !== undefined)

    // 只碰自己的文件，preset 的组合文件原样。
    assert.equal(await readFile(join(dir, 'agent.cordis.yml'), 'utf8'), '- id: agent-loop\n')
  })
})

test('清空绑定会把文件删掉，不留只剩时间戳的空壳', async () => {
  await withPresetDir(async (dir) => {
    await writeBindings(dir, { knowledgeBases: ['a'], skills: [], mcpServers: [] })
    assert.ok((await readdir(dir)).includes(EMPLOYEE_FILE))

    await writeBindings(dir, emptyBindings())
    assert.ok(!(await readdir(dir)).includes(EMPLOYEE_FILE))
    assert.deepEqual(await readBindings(dir), emptyBindings())
  })
})

test('绑定文件损坏时降级为空清单，员工本身仍然读得出', async () => {
  await withPresetDir(async (dir) => {
    await writeFile(join(dir, EMPLOYEE_FILE), '这不是: [合法的 YAML', 'utf8')
    assert.deepEqual(await readBindings(dir), emptyBindings())

    await writeFile(join(dir, EMPLOYEE_FILE), '- 顶层是个数组\n', 'utf8')
    assert.deepEqual(await readBindings(dir), emptyBindings())

    // 类型不对的字段丢掉，别的字段照读。
    await writeFile(join(dir, EMPLOYEE_FILE), 'persona: 助理\nskills: 不是数组\n', 'utf8')
    const partial = await readBindings(dir)
    assert.equal(partial.persona, '助理')
    assert.deepEqual([...partial.skills], [])
  })
})

test('绑定的三种改法', () => {
  assert.deepEqual(applyBinding(['a', 'b'], ['c'], 'replace'), ['c'], 'replace 就是整份换掉')
  assert.deepEqual(applyBinding(['a', 'b'], ['c'], 'add'), ['a', 'b', 'c'])
  assert.deepEqual(applyBinding(['a', 'b'], ['a'], 'add'), ['a', 'b'], 'add 已有项不会重复')
  assert.deepEqual(applyBinding(['a', 'b'], ['a'], 'remove'), ['b'])
  assert.deepEqual(applyBinding(['a'], ['nope'], 'remove'), ['a'], 'remove 不存在的项是无操作')
  assert.deepEqual(applyBinding([], [' a ', '', 'b'], 'replace'), ['a', 'b'], '空串丢掉，两边空白剪掉')
})

test('元数据走 DSH 自己的渲染器，全空时删文件', async () => {
  await withPresetDir(async (dir) => {
    await writeMetadata(dir, { name: '财务助理', description: '审核报销单据', order: 10 })
    const text = await readFile(join(dir, 'preset.yml'), 'utf8')
    assert.match(text, /name: 财务助理/u)
    assert.match(text, /description: 审核报销单据/u)
    assert.match(text, /order: 10/u)

    await writeMetadata(dir, {})
    assert.ok(!(await readdir(dir)).includes('preset.yml'), '三个字段都空就没有元数据可存')
  })
})

test('绑定与元数据互不覆盖，各写各的文件', async () => {
  await withPresetDir(async (dir) => {
    await writeMetadata(dir, { name: '财务助理' })
    await writeBindings(dir, { persona: '审核报销', knowledgeBases: ['finance'], skills: [], mcpServers: [] })

    assert.match(await readFile(join(dir, 'preset.yml'), 'utf8'), /name: 财务助理/u)
    const bindings = await readBindings(dir)
    assert.equal(bindings.persona, '审核报销')

    // 再改一次元数据不该动到绑定。
    await writeMetadata(dir, { name: '高级财务助理' })
    assert.deepEqual([...(await readBindings(dir)).knowledgeBases], ['finance'])
  })
})

test('写绑定不会自己创建 preset 目录以外的东西', async () => {
  const parent = await mkdtemp(join(tmpdir(), 'dsh-workbench-presets-'))
  try {
    const dir = join(parent, 'assistant')
    await mkdir(dir, { recursive: true })
    await writeBindings(dir, { knowledgeBases: ['a'], skills: [], mcpServers: [] })
    assert.deepEqual(await readdir(parent), ['assistant'])
    assert.deepEqual(await readdir(dir), [EMPLOYEE_FILE])
  } finally {
    await rm(parent, { recursive: true, force: true })
  }
})
