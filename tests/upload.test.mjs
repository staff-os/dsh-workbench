/**
 * 浏览器上传技能包这条路的行为锁。
 *
 * 这条路与「从盘上读一个压缩包」的区别只有来源：字节随一次 Remote 调用整个
 * 传上来，中途没有分片也没有流式。差别都在入口那一段——体积要在解码**之前**
 * 拦下，坏的 base64 要当场说清是 base64 的问题，而不是让它一路走到解包器那里
 * 报一个看不懂的格式错误。
 *
 * 解包本身（路径穿越、条目数、体积）走的是与本地压缩包完全相同的那一套，
 * 由 archive.test.mjs 守着，这里只验证上传这条路确实接进了它。
 */

import AdmZip from 'adm-zip'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  decodeUploadedPackage,
  MAX_UPLOAD_BYTES,
  packageFileText,
  readPackageBytes,
} from '../lib/index.js'

const NL = String.fromCharCode(10)

/** 拼一份 frontmatter。 */
function front(lines) {
  return ['---', ...lines, '---', ''].join(NL)
}

/** 打一个 zip 并转成上传时那种 base64。 */
function uploadOf(entries) {
  const zip = new AdmZip()
  for (const [path, content] of Object.entries(entries)) {
    zip.addFile(path, Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8'))
  }
  return zip.toBuffer().toString('base64')
}

test('上传：一个正常的 zip 解出来就是包内文件', async () => {
  const encoded = uploadOf({
    'SKILL.md': front(['name: uploaded-skill', 'description: 上传上来的']) + '正文' + NL,
    'templates/page.html': '<html></html>',
  })
  const files = await readPackageBytes(decodeUploadedPackage(encoded, 'x.zip'), 'x.zip')
  assert.deepEqual(files.map(file => file.path).sort(), ['SKILL.md', 'templates/page.html'])
  assert.match(packageFileText(files.find(file => file.path === 'SKILL.md')), /uploaded-skill/u)
})

test('上传：二进制资源原样带过来，不会在 base64 这一段变形', async () => {
  // 图标、字体这类文件少一个在盘上看不出来，只表现为技能失灵。
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const encoded = uploadOf({
    'SKILL.md': front(['name: with-binary', 'description: d']),
    'assets/logo.png': png,
  })
  const files = await readPackageBytes(decodeUploadedPackage(encoded, 'x.zip'), 'x.zip')
  const logo = files.find(file => file.path === 'assets/logo.png')
  assert.ok(Buffer.from(logo.content).equals(png))
})

test('上传：超过上限的包在解码之前就拒掉', () => {
  // 关键是「解码之前」：Buffer.from 会先把整串分配出来再让人检查大小，
  // 对着一个几十 MB 的字符串就是白分配一次内存。
  const oversized = 'A'.repeat(Math.ceil(MAX_UPLOAD_BYTES * 4 / 3) + 1024)
  assert.throws(
    () => decodeUploadedPackage(oversized, 'huge.zip'),
    (error) => {
      assert.equal(error.code, 'WORKBENCH_PACKAGE_TOO_LARGE')
      // 报错要说清接下来该怎么办，而不是只说「太大了」。
      assert.match(error.message, /import/u)
      return true
    },
  )
})

test('上传：空内容与坏 base64 都在入口报清楚', () => {
  assert.throws(() => decodeUploadedPackage('', 'x.zip'), /没有可安装的内容/u)
  assert.throws(() => decodeUploadedPackage('   ', 'x.zip'), /没有可安装的内容/u)
  // Buffer 的 base64 解码不报错，只是把非法字符跳过——全是非法字符时解出
  // 一个空 Buffer。不自己判这一种，错误会变成解包器那句「不是 zip 也不是 tar」。
  assert.throws(
    () => decodeUploadedPackage('!!!!', 'x.zip'),
    (error) => {
      assert.equal(error.code, 'WORKBENCH_PACKAGE_UNREADABLE')
      assert.match(error.message, /base64/u)
      return true
    },
  )
})

test('上传：选错文件时说的是「这不是压缩包」，不是「包里没有 SKILL.md」', async () => {
  // 上传入口最常见的用户错误就是选错文件。tar 开头没有魔数，读到一堆不认识
  // 的字节时读取器不报错、只是什么都读不出来——不拦的话，人选了个 .txt，
  // 收到的却是一句「包里没有找到任何 SKILL.md（包内有：空包）」。
  const encoded = Buffer.from('这不是一个压缩包', 'utf8').toString('base64')
  await assert.rejects(
    () => readPackageBytes(decodeUploadedPackage(encoded, 'notes.txt'), 'notes.txt'),
    (error) => {
      assert.equal(error.code, 'WORKBENCH_PACKAGE_UNREADABLE')
      assert.match(error.message, /zip/u)
      return true
    },
  )
})
