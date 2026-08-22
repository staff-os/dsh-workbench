/**
 * 解包安全边界的行为锁。
 *
 * 这些用例守的是「包里写什么就往盘上落什么」这个默认行为**没有**发生：
 * 技能包来自市场、GitHub、用户随手给的压缩包，路径穿越和解压炸弹都是
 * 现成的攻击面，而两者失败时都是静默的——落错地方的文件不会报错。
 */

import AdmZip from 'adm-zip'
import { gzipSync } from 'node:zlib'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  extractPackage,
  isSafeEntryPath,
  MAX_FILE_BYTES,
  packageFileText,
  stripCommonPrefix,
} from '../lib/index.js'

/** 打一个 zip。 */
function zipOf(entries) {
  const zip = new AdmZip()
  for (const [path, content] of Object.entries(entries)) {
    zip.addFile(path, Buffer.from(content, 'utf8'))
  }
  return zip.toBuffer()
}

/** 手搓一个 ustar 条目头，用来验证自写的 tar 读取器。 */
function tarEntry(path, content) {
  const body = Buffer.from(content, 'utf8')
  const header = Buffer.alloc(512, 0)
  header.write(path, 0, 100, 'utf8')
  header.write('0000644\0', 100, 8, 'ascii')
  header.write('0000000\0', 108, 8, 'ascii')
  header.write('0000000\0', 116, 8, 'ascii')
  header.write(`${body.length.toString(8).padStart(11, '0')}\0`, 124, 12, 'ascii')
  header.write('00000000000\0', 136, 12, 'ascii')
  header.write('        ', 148, 8, 'ascii')
  header.write('0', 156, 1, 'ascii')
  header.write('ustar\0', 257, 6, 'ascii')
  header.write('00', 263, 2, 'ascii')
  let checksum = 0
  for (const byte of header) checksum += byte
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii')

  const padding = Buffer.alloc((512 - (body.length % 512)) % 512, 0)
  return Buffer.concat([header, body, padding])
}

/** 打一个 tar。 */
function tarOf(entries) {
  const parts = Object.entries(entries).map(([path, content]) => tarEntry(path, content))
  return Buffer.concat([...parts, Buffer.alloc(1024, 0)])
}

test('路径判定按段切，不用 includes', () => {
  assert.equal(isSafeEntryPath('SKILL.md'), true)
  assert.equal(isSafeEntryPath('scripts/run.py'), true)
  assert.equal(isSafeEntryPath('a..b/c.md'), true, '名字里带两个点不是穿越')
  assert.equal(isSafeEntryPath('../evil.md'), false)
  assert.equal(isSafeEntryPath('a/../../etc/passwd'), false)
  assert.equal(isSafeEntryPath('/etc/passwd'), false)
  assert.equal(isSafeEntryPath('C:/Windows/system32'), false)
  assert.equal(isSafeEntryPath('..\\evil.md'), false, '反斜杠也要归一后再判')
  assert.equal(isSafeEntryPath('a\0b'), false)
  assert.equal(isSafeEntryPath(''), false)
})

test('ZIP：正常包读得出，目录条目跳过', async () => {
  const files = await extractPackage(zipOf({
    'SKILL.md': '---\nname: demo\ndescription: d\n---\nbody\n',
    'scripts/run.py': 'print(1)\n',
  }))
  const byPath = Object.fromEntries(files.map(file => [file.path, file.content]))
  assert.equal(Object.keys(byPath).length, 2)
  assert.match(byPath['SKILL.md'], /name: demo/u)
  assert.equal(byPath['scripts/run.py'], 'print(1)\n')
})

/**
 * 打一个带穿越路径的 zip。
 *
 * 不能直接 `addFile('../../evil.md')`——adm-zip 的**写**路径会把 `../` 洗掉，
 * 用它造不出恶意包。真实的攻击包是别的打包器（或手写字节）产出的，
 * 所以这里用等长占位名打包、再在字节层把名字换回去，才测得到读路径的防线。
 */
function zipWithEntryName(realName) {
  const placeholder = 'Z'.repeat(Buffer.byteLength(realName, 'utf8'))
  const zip = new AdmZip()
  zip.addFile('SKILL.md', Buffer.from('x', 'utf8'))
  zip.addFile(placeholder, Buffer.from('pwned', 'utf8'))
  const buffer = zip.toBuffer()
  const from = Buffer.from(placeholder, 'utf8')
  const to = Buffer.from(realName, 'utf8')
  for (let at = buffer.indexOf(from); at >= 0; at = buffer.indexOf(from, at + 1)) {
    to.copy(buffer, at)
  }
  return buffer
}

test('ZIP：路径穿越条目直接拒绝整个包', async () => {
  const traversal = zipWithEntryName('../../evil.md')
  assert.ok(
    new AdmZip(traversal).getEntries().some(entry => entry.entryName === '../../evil.md'),
    '前置条件：构造出来的包里确实有穿越条目',
  )
  await assert.rejects(() => extractPackage(traversal), /非法条目路径/u)

  const absolute = zipWithEntryName('/etc/passwd')
  await assert.rejects(() => extractPackage(absolute), /非法条目路径/u)
})

test('ZIP：单文件超上限被拒', async () => {
  await assert.rejects(
    () => extractPackage(zipOf({ 'big.md': 'a'.repeat(MAX_FILE_BYTES + 1) })),
    /超过单文件上限/u,
  )
})

const SKILL_TEXT = ['---', 'name: d', 'description: d', '---', ''].join(String.fromCharCode(10))

test('ZIP：二进制条目按原始字节保留，不是丢掉', async () => {
  // 技能的资源目录就是模型按正文里的相对路径去读的那个目录。丢掉一张图，
  // 盘上看不出哪里不对，表现只是技能引用资源时失灵。
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01])
  const zip = new AdmZip()
  zip.addFile('SKILL.md', Buffer.from(SKILL_TEXT, 'utf8'))
  zip.addFile('assets/logo.png', png)
  const files = await extractPackage(zip.toBuffer())
  assert.deepEqual(files.map(file => file.path).sort(), ['SKILL.md', 'assets/logo.png'])

  const binary = files.find(file => file.path === 'assets/logo.png')
  assert.equal(typeof binary.content, 'object', '二进制条目不该被解成字符串')
  assert.deepEqual(Buffer.from(binary.content), png)
  assert.equal(packageFileText(binary), undefined)
  assert.match(packageFileText(files.find(file => file.path === 'SKILL.md')), /^---/u)
})

test('tar 与 tar.gz 都认，穿越同样被拒', async () => {
  const plain = await extractPackage(tarOf({ 'SKILL.md': 'hello\n', 'ref/a.md': 'a\n' }))
  assert.deepEqual(plain.map(file => file.path).sort(), ['SKILL.md', 'ref/a.md'])

  const gzipped = await extractPackage(gzipSync(tarOf({ 'SKILL.md': 'hello\n' })))
  assert.equal(gzipped[0].content, 'hello\n')

  await assert.rejects(
    () => extractPackage(tarOf({ '../evil.md': 'pwned' })),
    /非法条目路径/u,
  )
})

test('stripCommonPrefix 只剥真正共同的顶层目录', () => {
  // GitHub tarball 的典型形状：所有文件都在 repo-sha/ 下面。
  assert.deepEqual(
    stripCommonPrefix([
      { path: 'repo-abc123/SKILL.md', content: 'a' },
      { path: 'repo-abc123/scripts/run.py', content: 'b' },
    ]),
    [
      { path: 'SKILL.md', content: 'a' },
      { path: 'scripts/run.py', content: 'b' },
    ],
  )

  // 顶层已经有文件时不能剥，否则 scripts/run.py 会被压平成 run.py。
  const flat = [
    { path: 'SKILL.md', content: 'a' },
    { path: 'scripts/run.py', content: 'b' },
  ]
  assert.deepEqual(stripCommonPrefix(flat), flat)

  assert.deepEqual(
    stripCommonPrefix([{ path: './SKILL.md', content: 'a' }]),
    [{ path: 'SKILL.md', content: 'a' }],
  )
})
