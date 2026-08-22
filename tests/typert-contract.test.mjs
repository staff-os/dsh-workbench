/**
 * Typert descriptor 表与 Remote 方法签名的一致性锁。
 *
 * 这份表是手写的（原因见 `src/typert-schemas.ts` 的模块注释），与各域
 * `remote.ts` 的方法签名**没有编译期联系**。改了签名忘了改表，`tsc` 一声不吭，
 * 浏览器那边才会在点下按钮时收到一句
 * `client api: workbenchSkill/marketSearch expected 2 argument(s), got 3`——
 * 而少写一个字段更安静：strict 编解码会把它悄悄剥掉，界面上表现为一条
 * 装不了的镜像条目照常可点。
 *
 * 所以这里拿源码里的 `@Remote` 声明当真源，逐条比对 descriptor 表。
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import assert from 'node:assert/strict'

import TYPERT from '../lib/typert.host.js'

/** 声明了 Remote 方法的网关源码，以及它们各自的 wire 命名空间。 */
const GATEWAYS = [
  ['../src/skill/remote.ts', 'workbenchSkill'],
  ['../src/employee/remote.ts', 'workbenchEmployee'],
]

/** 从 `(` 之后开始，取到配对的 `)` 为止。嵌套的括号与泛型尖括号都算在内。 */
function balanced(source, open) {
  let depth = 1
  for (let index = open + 1; index < source.length; index += 1) {
    const char = source[index]
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, index)
    }
  }
  throw new Error('参数表没有配对的右括号')
}

/** 按顶层逗号切分参数表；`Record<string, X>` 这种里面的逗号不算。 */
function splitParams(text) {
  const out = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if (char === '<' || char === '(' || char === '{' || char === '[') depth += 1
    if (char === '>' || char === ')' || char === '}' || char === ']') depth -= 1
    if (char === ',' && depth === 0) {
      out.push(current)
      current = ''
      continue
    }
    current += char
  }
  out.push(current)
  return out.map(one => one.trim()).filter(one => one !== '')
}

/** 源码里一个网关声明的全部 Remote 方法。 */
function declaredMethods(source) {
  const methods = []
  const marker = /@Remote\('([A-Za-z0-9_$]+)'\)\s*(?:async\s+)?([A-Za-z0-9_$]+)\s*\(/gu
  for (const match of source.matchAll(marker)) {
    const [whole, exportName, methodName] = match
    const open = match.index + whole.length - 1
    const parameters = splitParams(balanced(source, open)).map((declaration) => {
      const name = declaration.slice(0, declaration.indexOf(':')).trim()
      return { name: name.replace(/\?$/u, ''), optional: name.endsWith('?') }
    })
    methods.push({ exportName, methodName, parameters })
  }
  return methods
}

for (const [relative, namespace] of GATEWAYS) {
  test(`typert：${namespace} 的 descriptor 表与方法签名一致`, async () => {
    const path = fileURLToPath(new URL(relative, import.meta.url))
    const declared = declaredMethods(await readFile(path, 'utf8'))
    assert.ok(declared.length > 0, '没解析到任何 @Remote 方法，正则大概过期了')

    const descriptors = TYPERT.invocations.filter(one => one.namespace === namespace)
    const byMethod = new Map(descriptors.map(one => [one.method, one]))

    for (const method of declared) {
      // 表里缺一条，浏览器那边整个动作不存在——按钮点了没反应，控制台一句
      // 「unknown method」，而 host 侧的代码看着完全正常。
      const descriptor = byMethod.get(method.exportName)
      assert.ok(descriptor !== undefined, `descriptor 表里没有 ${namespace}/${method.exportName}`)

      const expected = method.parameters.map(one => one.name)
      const actual = descriptor.parameters.map(one => one.name)
      assert.deepEqual(actual, expected, `${namespace}/${method.exportName} 的参数表对不上`)

      for (const [index, parameter] of method.parameters.entries()) {
        assert.equal(
          descriptor.parameters[index].acceptsUndefined === true,
          parameter.optional,
          `${namespace}/${method.exportName} 的参数 ${parameter.name} 可选性对不上`,
        )
      }
    }

    // 反向也要查：表里多出来的条目说明方法改了名或被删了，留着它只会让
    // 浏览器调到一个不存在的东西。
    const declaredNames = new Set(declared.map(one => one.exportName))
    for (const descriptor of descriptors) {
      assert.ok(
        declaredNames.has(descriptor.method),
        `descriptor 表里的 ${namespace}/${descriptor.method} 在源码里没有对应的 @Remote 方法`,
      )
    }
  })
}

/** 浏览器侧调用 Remote 的数据层，以及它们各自的 wire 命名空间。 */
const CALLERS = [
  ['../src/client/skill/data.ts', 'workbenchSkill'],
  ['../src/client/employee/data.ts', 'workbenchEmployee'],
]

for (const [relative, namespace] of CALLERS) {
  test(`typert：${namespace} 的调用点实参个数与 descriptor 一致`, async () => {
    // Remote 调用按 descriptor 的参数表**逐位**取值，少传一个就是调用错误
    // （`expected 4 argument(s), got 1`），哪怕缺的那几个都标了可选。
    // 这一条锁的就是这件事：`face.marketUpdate(name)` 少传三个 undefined，
    // 表现是界面上的「更新」按钮点了报错，而两边的类型都是对的。
    const path = fileURLToPath(new URL(relative, import.meta.url))
    const source = await readFile(path, 'utf8')
    const byMethod = new Map(
      TYPERT.invocations.filter(one => one.namespace === namespace).map(one => [one.method, one]),
    )

    const calls = /face\.([A-Za-z0-9_$]+)\(/gu
    let checked = 0
    for (const match of source.matchAll(calls)) {
      const descriptor = byMethod.get(match[1])
      if (descriptor === undefined) continue
      const open = match.index + match[0].length - 1
      const args = splitParams(balanced(source, open))
      assert.equal(
        args.length,
        descriptor.parameters.length,
        `${namespace}/${match[1]} 传了 ${args.length} 个实参，descriptor 要 ${descriptor.parameters.length} 个`,
      )
      checked += 1
    }
    assert.ok(checked > 0, '没解析到任何 face.* 调用，正则大概过期了')
  })
}

test('typert：市场条目的 schema 覆盖 MarketView 的每个字段', async () => {
  // 漏字段不报错，只是被 strict 编解码剥掉。`installable` 就这样丢过一次：
  // 界面拿不到它，于是把一条在本源没有包的镜像条目也画成可安装。
  const path = fileURLToPath(new URL('../src/skill/view.ts', import.meta.url))
  const source = await readFile(path, 'utf8')
  const block = source.slice(
    source.indexOf('export interface MarketView {'),
    source.indexOf('export interface RejectedView {'),
  )
  const fields = [...block.matchAll(/^\s*readonly ([A-Za-z0-9_$]+)\??:/gmu)].map(match => match[1])
  assert.ok(fields.length > 10, '没解析到 MarketView 的字段，正则大概过期了')

  const descriptor = TYPERT.invocations.find(
    one => one.namespace === 'workbenchSkill' && one.method === 'marketGet',
  )
  const shape = descriptor.result.schema.shape
  for (const field of fields) {
    assert.ok(field in shape, `marketView schema 少了字段 ${field}`)
  }
})
