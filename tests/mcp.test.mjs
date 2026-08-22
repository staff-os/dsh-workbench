/**
 * MCP patch 层的行为锁。
 *
 * 这里最该守住的是**保真**：改一行不能顺手抹掉注释、别的插件行，
 * 或者把 `!!js` 动态值烧成死字符串。这三件事出了问题都不会报错，
 * 只会在下次启动 DSH 时以「服务连不上」的形式暴露出来。
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  addServer,
  convertVariables,
  listServers,
  loadPatch,
  parseMcpServersJson,
  removeServer,
  sanitizeServerName,
  savePatch,
  setServerDisabled,
  updateServer,
} from '../lib/index.js'

const FIXTURE = `# 顶部说明，必须活下来
- id: system-prompt
  config:
    persona: 你是一个助手

# 别的插件的行
- insert:
    - id: storage-json
      name: '@deepseek-ai/dsh-storage-json'
      config:
        root: !!js dshHomePath('storages')

    - id: mcp-fs
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        transport: stdio
        serverName: fs
        command: npx
        args:
          - -y
          - server-filesystem
        env:
          TOKEN: !!js process.env.FS_TOKEN
`

/** 建一个装着 fixture 的临时 profile 目录。 */
async function withPatch(run) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-workbench-'))
  const file = join(dir, 'cordis.patch.yml')
  await writeFile(file, FIXTURE, 'utf8')
  try {
    return await run(file)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('listServers 只认 mcp-client 行，且带出 !!js 值', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    const servers = listServers(doc)
    assert.equal(servers.length, 1, 'storage-json 那行不该被当成 MCP')
    const [fs] = servers
    assert.equal(fs.serverName, 'fs')
    assert.equal(fs.transport, 'stdio')
    assert.equal(fs.command, 'npx')
    assert.deepEqual([...fs.args], ['-y', 'server-filesystem'])
    assert.equal(fs.env.TOKEN, '!!js process.env.FS_TOKEN', '动态值要带前缀，好与字面量区分')
    assert.equal(fs.disabled, false)
  })
})

test('新增一行后，注释、别的插件行与 !!js 全部原样保留', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    addServer(doc, {
      serverName: 'github',
      transport: 'stdio',
      command: 'npx',
      args: ['-y', 'server-github'],
      env: { GITHUB_TOKEN: '!!js process.env.GITHUB_TOKEN' },
    })
    await savePatch(file, doc)

    const text = await readFile(file, 'utf8')
    assert.match(text, /# 顶部说明，必须活下来/u)
    assert.match(text, /# 别的插件的行/u)
    assert.match(text, /root: !!js dshHomePath\('storages'\)/u, 'storage 行的动态值不能被改写')
    assert.match(text, /TOKEN: !!js process\.env\.FS_TOKEN/u, '既有的动态值不能被烧成字面量')
    assert.match(text, /GITHUB_TOKEN: !!js process\.env\.GITHUB_TOKEN/u, '新写入的动态值要带标签')

    const servers = listServers(await loadPatch(file))
    assert.deepEqual(servers.map(server => server.serverName).sort(), ['fs', 'github'])
  })
})

test('savePatch 会留下备份', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    addServer(doc, { serverName: 'x', transport: 'stdio', command: 'echo' })
    const backup = await savePatch(file, doc)
    assert.ok(backup, '原文件存在时必须有备份')
    assert.equal(await readFile(backup, 'utf8'), FIXTURE)
  })
})

test('update 是整块替换 config，但不动别的行', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    const updated = updateServer(doc, 'fs', { command: 'node' })
    assert.equal(updated.command, 'node')
    assert.deepEqual([...updated.args], ['-y', 'server-filesystem'], '没给的字段沿用现状')
    assert.equal(updated.env.TOKEN, '!!js process.env.FS_TOKEN')

    await savePatch(file, doc)
    const text = await readFile(file, 'utf8')
    assert.match(text, /root: !!js dshHomePath\('storages'\)/u)
    assert.match(text, /command: node/u)
  })
})

test('换传输方式会清掉另一侧的遗留字段', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    const updated = updateServer(doc, 'fs', {
      transport: 'streamable-http',
      url: 'https://mcp.example.com/sse',
    })
    assert.equal(updated.transport, 'streamable-http')
    assert.equal(updated.url, 'https://mcp.example.com/sse')
    assert.equal(updated.command, undefined, 'stdio 的 command 不能留着')
    assert.equal(updated.args, undefined)
    assert.equal(updated.env, undefined)
  })
})

test('字段串台直接报错而不是默默丢弃', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    assert.throws(
      () => addServer(doc, { serverName: 'bad', transport: 'stdio', command: 'x', url: 'https://y' }),
      /stdio 传输不接受/u,
    )
    assert.throws(
      () => addServer(doc, { serverName: 'bad2', transport: 'streamable-http', url: 'https://y', command: 'x' }),
      /不接受 command/u,
    )
    assert.throws(
      () => addServer(doc, { serverName: 'bad3', transport: 'stdio' }),
      /必须给 command/u,
    )
  })
})

test('serverName 校验与重名拒绝', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    assert.throws(() => addServer(doc, { serverName: 'has space', command: 'x' }), /不合法/u)
    assert.throws(() => addServer(doc, { serverName: 'fs', command: 'x' }), /已存在/u)
  })
})

test('停用写成独立的 disabled 条目，启用再收回去', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    assert.equal(setServerDisabled(doc, 'fs', true).disabled, true)
    await savePatch(file, doc)
    assert.match(await readFile(file, 'utf8'), /id: mcp-fs\n\s*disabled: true/u)

    const again = await loadPatch(file)
    assert.equal(listServers(again)[0].disabled, true, '重新读回来还是停用')
    assert.equal(setServerDisabled(again, 'fs', false).disabled, false)
    await savePatch(file, again)
    assert.doesNotMatch(await readFile(file, 'utf8'), /disabled: true/u)
  })
})

test('删除会带走 disabled 条目，别的行不受影响', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    setServerDisabled(doc, 'fs', true)
    removeServer(doc, 'fs')
    await savePatch(file, doc)

    const text = await readFile(file, 'utf8')
    assert.doesNotMatch(text, /serverName: fs/u)
    assert.doesNotMatch(text, /disabled: true/u, '孤儿 disabled 条目不能留下')
    assert.match(text, /storage-json/u, '别人的行不能被误删')
    assert.equal(listServers(await loadPatch(file)).length, 0)
  })
})

test('删不存在的服务给明确错误', async () => {
  await withPatch(async (file) => {
    const doc = await loadPatch(file)
    assert.throws(() => removeServer(doc, 'nope'), /不存在/u)
  })
})

test('patch 文件不存在时当作空配置，而不是报错', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-workbench-'))
  try {
    const file = join(dir, 'nested', 'cordis.patch.yml')
    const doc = await loadPatch(file)
    assert.deepEqual(listServers(doc), [])
    addServer(doc, { serverName: 'first', command: 'echo' })
    await savePatch(file, doc)
    assert.equal(listServers(await loadPatch(file)).length, 1)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('${VAR} 转成 !!js 表达式', () => {
  assert.equal(convertVariables('${GITHUB_TOKEN}'), '!!js process.env.GITHUB_TOKEN')
  assert.equal(convertVariables('plain'), 'plain', '没有引用就不该动')
  assert.equal(
    convertVariables('Bearer ${TOKEN}'),
    '!!js `Bearer ${process.env.TOKEN}`',
    '夹在文字里要用模板串，不能整体当变量名',
  )
  assert.equal(
    convertVariables('${A}-${B}'),
    '!!js `${process.env.A}-${process.env.B}`',
  )
})

test('serverName 压名规则', () => {
  assert.equal(sanitizeServerName('github'), 'github')
  assert.equal(sanitizeServerName('my.server'), 'my-server')
  assert.equal(sanitizeServerName('a@@@b'), 'a-b', '连续非法字符压成一个短横线')
  assert.equal(sanitizeServerName('@@@'), undefined, '压完什么都不剩就该放弃')
  assert.equal(sanitizeServerName('x'.repeat(40)).length, 32)
})

test('import_json 认 Claude Code 风格，也认裸字典', () => {
  const wrapped = parseMcpServersJson(JSON.stringify({
    mcpServers: {
      'filesystem': { command: 'npx', args: ['-y', 'fs'], env: { T: '${FS_TOKEN}' } },
      'remote.api': { url: 'https://mcp.example.com', headers: { Authorization: 'Bearer ${K}' } },
      'broken': { description: '既没有 url 也没有 command' },
    },
  }))
  assert.equal(wrapped.servers.length, 2)
  assert.deepEqual(wrapped.skipped, [{ name: 'broken', reason: '既没有 url 也没有 command' }])

  const fs = wrapped.servers.find(item => item.originalName === 'filesystem')
  assert.equal(fs.input.transport, 'stdio')
  assert.equal(fs.input.env.T, '!!js process.env.FS_TOKEN')

  const remote = wrapped.servers.find(item => item.originalName === 'remote.api')
  assert.equal(remote.input.transport, 'streamable-http', '有 url 就是远端')
  assert.equal(remote.input.serverName, 'remote-api', '点号要被压掉')
  assert.equal(remote.input.headers.Authorization, '!!js `Bearer ${process.env.K}`')

  const bare = parseMcpServersJson(JSON.stringify({ solo: { command: 'echo' } }))
  assert.equal(bare.servers.length, 1, '没有 mcpServers 包裹也要认')
})

test('import_json 对坏输入给明确错误', () => {
  assert.throws(() => parseMcpServersJson('{'), /不是合法 JSON/u)
  assert.throws(() => parseMcpServersJson('[]'), /必须是一个 JSON 对象/u)
  assert.throws(() => parseMcpServersJson('{"mcpServers":{}}'), /没有任何服务条目/u)
})
