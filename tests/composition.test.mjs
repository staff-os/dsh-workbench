/**
 * agent 组合文件解析的测试。
 *
 * 这块逻辑是纯函数，且它的输入是**别人家的文件格式**——DSH 的 preset 组合。
 * 格式变了这里就该红，所以用例照着四个内置模式的真实写法来，不自己编一套
 * 好解析的 YAML。
 */

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { parseComposition, emptyComposition } from '../lib/index.js'

/** 照 `standard` 的写法：顶层若干行，工具与技能各若干。 */
const STANDARD = `
- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: >-
      You are a coding agent powered by the {{model}} model.

- id: agent-instructions
  name: '@deepseek-ai/dsh-agent-instructions'
  config:
    maxBytes: 65536

- id: tool-bash
  name: '@deepseek-ai/dsh-tool-bash'
  disabled: !!js process.platform === 'win32'

- id: tool-fs
  name: '@deepseek-ai/dsh-tool-fs'

- id: skill-filesystem
  name: '@deepseek-ai/dsh-skill-filesystem'

- id: tool-skill
  name: '@deepseek-ai/dsh-tool-skill'

- id: plan-mode
  name: '@deepseek-ai/dsh-plan-mode'
`

/** 照 `minimal` 的写法：人设是完整提示，工具装在 group 里。 */
const MINIMAL = `
- id: persona
  name: '@deepseek-ai/dsh-persona'
  config:
    text: You are a helpful software engineer assistant.
    complete: true
    includeRuntimeContext: false

- id: persistent-shell
  name: cordis:group
  group: true
  isolate:
    terminals: true
  config:
    - id: pty
      name: '@deepseek-ai/dsh-terminal'

    - id: persistent-bash
      name: '@deepseek-ai/dsh-tool-bash-persistent'
      config:
        timeoutMs: 300000
`

test('人设读出文本与它的两个开关', () => {
  const summary = parseComposition(STANDARD)
  assert.equal(summary.error, undefined)
  assert.match(summary.persona.text, /coding agent/u)
  // 两个开关都没写：默认是「还能往后接」且「带运行时上下文」。
  assert.equal(summary.persona.complete, false)
  assert.equal(summary.persona.includeRuntimeContext, true)
  assert.equal(summary.agentInstructions, true)
})

test('complete 与 includeRuntimeContext 按写的来', () => {
  const summary = parseComposition(MINIMAL)
  assert.equal(summary.persona.complete, true)
  assert.equal(summary.persona.includeRuntimeContext, false)
  // minimal 没有 agent-instructions 行。
  assert.equal(summary.agentInstructions, false)
})

test('技能行不被当成普通工具', () => {
  const summary = parseComposition(STANDARD)
  // `dsh-tool-skill` 两个前缀都沾，它属于技能能力而不是又一个工具。
  assert.deepEqual(summary.skills.map(entry => entry.id), ['skill-filesystem', 'tool-skill'])
  assert.deepEqual(summary.tools.map(entry => entry.id), ['tool-bash', 'tool-fs'])
})

test('认不出类别的行进 others，不猜', () => {
  const summary = parseComposition(STANDARD)
  assert.deepEqual(summary.others.map(entry => entry.id), ['plan-mode'])
})

test('`!!js` 禁用条件原样留着，不替它判断', () => {
  const summary = parseComposition(STANDARD)
  const bash = summary.tools.find(entry => entry.id === 'tool-bash')
  assert.equal(bash.disabled, `process.platform === 'win32'`)
  // 没写 disabled 的行不该冒出这个字段。
  assert.equal(summary.tools.find(entry => entry.id === 'tool-fs').disabled, undefined)
})

test('group 里的行也算，并记下它套在哪一层', () => {
  const summary = parseComposition(MINIMAL)
  const bash = summary.tools.find(entry => entry.id === 'persistent-bash')
  assert.deepEqual(bash.group, ['persistent-shell'])
  // group 行本身不计数，里面的两行才算。
  assert.equal(summary.total, 3)
})

test('短名去掉约定前缀', () => {
  const summary = parseComposition(STANDARD)
  assert.equal(summary.tools.find(entry => entry.id === 'tool-fs').label, 'fs')
  assert.equal(summary.skills.find(entry => entry.id === 'skill-filesystem').label, 'skill-filesystem')
})

test('顶层不是数组时给出原因而不是抛异常', () => {
  const summary = parseComposition('name: not-a-list')
  assert.match(summary.error, /顶层/u)
  assert.deepEqual(summary.tools, [])
})

test('YAML 有语法错误时照常给出能解析的部分，但带上那条错误', () => {
  // yaml 不为语法错误抛异常，而是收进 doc.errors 并照样吐出解析得到的部分。
  // 那部分该显示，但错误不能被吞掉——否则界面安静地少列几行，看的人还以为
  // 这个员工本来就这么少。
  const summary = parseComposition('- id: x\n   bad indent: [')
  assert.notEqual(summary.error, undefined)
})

test('DSH 自己的 !!js 标签不算语法错误', () => {
  const summary = parseComposition(STANDARD)
  assert.equal(summary.error, undefined)
})

test('空摘要可以附一句为什么是空的', () => {
  const summary = emptyComposition('文件没读到')
  assert.equal(summary.error, '文件没读到')
  assert.equal(summary.total, 0)
  assert.equal(summary.persona, undefined)
})
