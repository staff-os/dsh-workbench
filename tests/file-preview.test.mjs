/**
 * 文件预览这条路的行为锁。
 *
 * 两件事值得单独钉住：
 *
 * - **允许读哪里**。相对路径是浏览器传上来的，它必须只能落在那个技能目录
 *   里面。这是一条安全边界，写错了不会有任何报错，只会变成一个能读任意文件
 *   的接口。
 * - **截断之后还认不认得出是文本**。截口落在一个多字节字符中间时，fatal 模式
 *   的解码会抛，一份中文文档因此会被判成「二进制文件」——一个只在文件够大
 *   且恰好切在汉字上时才出现的表现。
 */

import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  fileContentOf,
  MAX_PREVIEW_BYTES,
  readFileContent,
  resolveInsideSkill,
} from '../lib/index.js'

/** 建一个临时技能目录跑一段。 */
async function withDir(run) {
  const dir = await mkdtemp(join(tmpdir(), 'dsh-workbench-file-'))
  try {
    return await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test('预览路径只能落在技能目录里面', () => {
  const dir = resolve('/skills/demo')
  assert.equal(resolveInsideSkill(dir, 'SKILL.md'), resolve(dir, 'SKILL.md'))
  assert.equal(resolveInsideSkill(dir, 'references/api.md'), resolve(dir, 'references/api.md'))

  for (const bad of ['../secrets.env', 'a/../../b', '/etc/passwd', 'C:/Windows/win.ini']) {
    assert.throws(
      () => resolveInsideSkill(dir, bad),
      (error) => {
        // 字面检查（archive/guard 报 UNSAFE_ARCHIVE）与解析后复核
        // （报 UNSAFE_PATH）两道都算数，只要拦住就行。
        assert.match(String(error.code), /WORKBENCH_UNSAFE_(PATH|ARCHIVE)/u)
        return true
      },
      `"${bad}" 应该被拦下`,
    )
  }
})

test('前缀相同的旁边目录不算「在里面」', () => {
  // resolve 之后拿 startsWith 比对时，少加一个分隔符就会让
  // `/skills/demo-evil` 通过 `/skills/demo` 的检查。
  const dir = resolve('/skills/demo')
  assert.throws(() => resolveInsideSkill(dir, '../demo-evil/SKILL.md'))
})

test('文本、二进制、截断三种结论', () => {
  const text = Buffer.from('# 标题\n正文', 'utf8')
  const whole = fileContentOf('SKILL.md', text.byteLength, text)
  assert.equal(whole.binary, false)
  assert.equal(whole.truncated, false)
  assert.equal(whole.text, '# 标题\n正文')

  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a])
  const binary = fileContentOf('logo.png', png.byteLength, png)
  assert.equal(binary.binary, true)
  assert.equal(binary.text, undefined, '二进制的字节不往浏览器送')
  assert.equal(binary.size, png.byteLength, '体积照报，界面要说清它有多大')
})

test('截在汉字中间时仍然认得出是文本', () => {
  // 「中」是 3 字节。切掉最后一个字节，剩下的不是合法 UTF-8——直接解会抛，
  // 于是一份纯中文文档被报成二进制。
  const full = Buffer.from('前面的内容中', 'utf8')
  const cut = full.subarray(0, full.byteLength - 1)
  const result = fileContentOf('notes.md', full.byteLength + 999, cut)
  assert.equal(result.binary, false, '截口落在汉字上不代表它是二进制')
  assert.equal(result.truncated, true)
  assert.equal(result.text, '前面的内容', '不完整的那个字符被削掉')
})

test('超过上限的文件只读开头一段，size 报的仍是完整体积', async () => {
  await withDir(async (dir) => {
    const size = MAX_PREVIEW_BYTES + 4096
    await writeFile(join(dir, 'big.txt'), 'x'.repeat(size), 'utf8')
    const result = await readFileContent(join(dir, 'big.txt'), 'big.txt')
    assert.equal(result.size, size, 'size 是文件多大，不是这次送了多少')
    assert.equal(result.truncated, true)
    assert.equal(result.text.length, MAX_PREVIEW_BYTES)
  })
})

test('读一个子目录里的文件，路径按相对的报回去', async () => {
  await withDir(async (dir) => {
    await mkdir(join(dir, 'references'), { recursive: true })
    await writeFile(join(dir, 'references/api.md'), '# API', 'utf8')
    const full = resolveInsideSkill(dir, 'references/api.md')
    const result = await readFileContent(full, 'references/api.md')
    assert.equal(result.path, 'references/api.md')
    assert.equal(result.text, '# API')
    assert.equal(result.truncated, false)
  })
})

test('文件不在时报的是「读不到」，不是崩一个 ENOENT 出来', async () => {
  await withDir(async (dir) => {
    await assert.rejects(
      () => readFileContent(join(dir, 'nope.md'), 'nope.md'),
      (error) => {
        assert.equal(error.code, 'WORKBENCH_SKILL_NOT_FOUND')
        assert.match(error.message, /nope\.md/u)
        return true
      },
    )
  })
})
