/**
 * 插件装卸的行为锁。
 *
 * 这里最要紧的判断是「装上了」与「生效了」不是一回事：一个包可以装进
 * profile 的依赖却因为没声明 dsh.bundle 而完全不参与组合，pnpm 会成功、
 * 对账会跳过它，最终表现是「装完了但什么都没变」。清单与预检都要把这件事
 * 说出来。
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import { assertSafeSpec, inspectLocalSpec, readProfilePlugins, runCommand } from '../lib/index.js'

/** 写一个 package.json。 */
async function writeManifest(dir, manifest) {
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'package.json'), JSON.stringify(manifest, undefined, 2), 'utf8')
}

/** 搭一个假的 profile 目录。 */
async function withProfile(run) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-workbench-profile-'))
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('profile 没初始化时给出可操作的错误', async () => {
  await withProfile(async (dir) => {
    await assert.rejects(() => readProfilePlugins(dir), /还没初始化/u)
  })
})

test('清单区分「是插件」与「已生效」', async () => {
  await withProfile(async (dir) => {
    await writeManifest(dir, {
      name: 'profile-web',
      dependencies: {
        '@staff-os/dsh-workbench': '^0.1.0',
        '@vendor/plain-lib': '^2.0.0',
        '@vendor/inactive-plugin': '^1.0.0',
      },
      dsh: { profile: { bundles: ['@deepseek-ai/dsh-base', '@staff-os/dsh-workbench'] } },
    })
    // 是否为插件要看**装到盘上的那一份**怎么声明，不是看依赖名。
    await writeManifest(join(dir, 'node_modules', '@staff-os', 'dsh-workbench'), {
      name: '@staff-os/dsh-workbench',
      version: '0.1.0',
      description: '企业工作台',
      dsh: { bundle: { patch: './cordis.patch.yml' } },
    })
    await writeManifest(join(dir, 'node_modules', '@vendor', 'plain-lib'), {
      name: '@vendor/plain-lib',
      version: '2.1.0',
    })
    await writeManifest(join(dir, 'node_modules', '@vendor', 'inactive-plugin'), {
      name: '@vendor/inactive-plugin',
      version: '1.0.0',
      dsh: { bundle: { patch: './patch.yml' } },
    })

    const state = await readProfilePlugins(dir)
    const byName = Object.fromEntries(state.plugins.map(plugin => [plugin.name, plugin]))

    assert.equal(byName['@staff-os/dsh-workbench'].isBundle, true)
    assert.equal(byName['@staff-os/dsh-workbench'].active, true)
    assert.equal(byName['@staff-os/dsh-workbench'].version, '0.1.0', '版本读自实际装上的那份')
    assert.equal(byName['@staff-os/dsh-workbench'].spec, '^0.1.0')

    assert.equal(byName['@vendor/plain-lib'].isBundle, false, '没有 dsh.bundle 就不是插件')
    assert.equal(byName['@vendor/plain-lib'].active, false)

    // 声明了 bundle 却不在 bundles 列表里：装上了但没生效，这是最容易误判的一种。
    assert.equal(byName['@vendor/inactive-plugin'].isBundle, true)
    assert.equal(byName['@vendor/inactive-plugin'].active, false)

    // 模板出厂的组合层不是依赖，装卸命令碰不到，单独列出来。
    assert.deepEqual([...state.builtIn], ['@deepseek-ai/dsh-base'])
  })
})

test('依赖装了但 node_modules 里没有时，仍然列出来', async () => {
  await withProfile(async (dir) => {
    await writeManifest(dir, { dependencies: { '@vendor/ghost': '^1.0.0' } })
    const state = await readProfilePlugins(dir)
    assert.equal(state.plugins.length, 1)
    assert.equal(state.plugins[0].version, undefined)
    assert.equal(state.plugins[0].isBundle, false, '读不到就当不是插件，而不是猜它是')
  })
})

test('本地路径预检：认得出没有 dsh.bundle 的目录', async () => {
  await withProfile(async (dir) => {
    const pluginDir = join(dir, 'my-plugin')
    await writeManifest(pluginDir, {
      name: '@vendor/my-plugin',
      dsh: { bundle: { patch: './cordis.patch.yml' } },
    })
    const good = await inspectLocalSpec(pluginDir, dir)
    assert.equal(good.packageName, '@vendor/my-plugin')
    assert.equal(good.declaresBundle, true)

    // 聚合仓库根目录是最常见的误指：pnpm 会装成功，但它不参与组合。
    const monorepo = join(dir, 'monorepo')
    await writeManifest(monorepo, { name: 'monorepo-root', private: true })
    const bad = await inspectLocalSpec(monorepo, dir)
    assert.equal(bad.declaresBundle, false)

    await assert.rejects(
      () => inspectLocalSpec(join(dir, 'nowhere'), dir),
      /没有可读的 package\.json/u,
    )
  })
})

test('本地路径预检认得 file: 与 link: 前缀，registry 名字不当路径', async () => {
  await withProfile(async (dir) => {
    const pluginDir = join(dir, 'pkg')
    await writeManifest(pluginDir, { name: 'pkg', dsh: { bundle: { patch: './p.yml' } } })

    assert.equal((await inspectLocalSpec(`file:${pluginDir}`, dir)).packageName, 'pkg')
    assert.equal((await inspectLocalSpec(`link:${pluginDir}`, dir)).packageName, 'pkg')

    // 这些都不是路径，预检不该插手。
    assert.equal(await inspectLocalSpec('@vendor/plugin', dir), undefined)
    assert.equal(await inspectLocalSpec('some-plugin@1.2.3', dir), undefined)
    assert.equal(await inspectLocalSpec('git+https://example.com/a.git', dir), undefined)
  })
})

test('外部命令：退出码与输出都收得到', async () => {
  const result = await runCommand(process.execPath, ['-e', 'console.log("out"); console.error("err"); process.exit(3)'], {
    timeoutMs: 20_000,
  })
  assert.equal(result.code, 3)
  assert.match(result.stdout, /out/u)
  assert.match(result.stderr, /err/u)
})

test('外部命令：找不到可执行文件时给出可操作的错误', async () => {
  await assert.rejects(
    () => runCommand('dsh-workbench-no-such-executable', ['--version'], { timeoutMs: 5_000 }),
    /找不到可执行文件/u,
  )
})

test('外部命令：超时会杀掉子进程并报出来', async () => {
  const result = await runCommand(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], {
    timeoutMs: 300,
  })
  assert.equal(result.code, 124)
  assert.match(result.stderr, /超时/u)
})

test('外部命令：取消信号会杀掉子进程', async () => {
  const controller = new AbortController()
  const running = runCommand(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], {
    timeoutMs: 30_000,
    signal: controller.signal,
  })
  controller.abort()
  const result = await running
  assert.equal(result.code, 130)
  assert.match(result.stderr, /已取消/u)
})

test('包规格里的 shell 元字符直接拒掉', () => {
  // Windows 上 dsh 是 .cmd 垫片，命令得经 cmd.exe；规格又是模型给的，
  // 不拦就等于把一条命令行交出去。
  assert.throws(() => assertSafeSpec('pkg & del /q *', 'spec'), /shell 元字符/u)
  assert.throws(() => assertSafeSpec('pkg | more', 'spec'), /shell 元字符/u)
  assert.throws(() => assertSafeSpec('pkg`whoami`', 'spec'), /shell 元字符/u)
  assert.throws(() => assertSafeSpec('pkg > out.txt', 'spec'), /shell 元字符/u)
  assert.throws(() => assertSafeSpec('pkg; rm -rf /', 'spec'), /shell 元字符/u)

  // 真实的包规格一个都不能误伤。
  assert.doesNotThrow(() => assertSafeSpec('@vendor/plugin@^1.2.3', 'spec'))
  assert.doesNotThrow(() => assertSafeSpec('git+https://example.com/a.git#v1', 'spec'))
  assert.doesNotThrow(() => assertSafeSpec('E:\\packs\\My Plugin', 'spec'))
  assert.doesNotThrow(() => assertSafeSpec('file:/opt/dsh/plugin', 'spec'))
})
