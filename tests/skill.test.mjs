/**
 * 本地技能读写的行为锁。
 *
 * 两条主线：
 * 一是 **frontmatter 保真**——改可见性时不能顺手抹掉别人的字段和注释，
 * 那些字段丢了不报错，只会让技能悄悄换一副行为。
 * 二是 **安装的原子性**——技能包装到一半失败时，盘上不能留下一个能被 DSH
 * 扫到、却缺文件的「半个技能」。
 */

import { mkdtemp, readdir, readFile, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  assertSkillName,
  classifyImportSource,
  createLocalSkill,
  fallbackSkillName,
  findSkillsInPackage,
  githubArchiveUrl,
  installSkillFiles,
  isNewerVersion,
  listLocalSkills,
  parseSkillFrontmatter,
  readLocalSkill,
  removeLocalSkill,
  scanLocalSkills,
  selectSkillFromPackage,
  setSkillVisibility,
  splitFrontmatter,
} from '../lib/index.js'

/** 建一个临时的技能根目录。 */
const NL = String.fromCharCode(10)

/** 拼一份 frontmatter，避开源码里满屏的换行转义。 */
function FRONT(lines) {
  return ['---', ...lines, '---', ''].join(NL)
}

async function withRoot(run) {
  const base = await mkdtemp(join(tmpdir(), 'dsh-workbench-skills-'))
  const root = join(base, 'skills')
  await mkdir(root, { recursive: true })
  try {
    return await run(root, base)
  } finally {
    await rm(base, { recursive: true, force: true })
  }
}

/**
 * 装包要给的两个目录。
 *
 * 暂存父目录**必须在技能根之外**：DSH 扫描技能根时只跳过 `.system`，
 * 其余点开头目录照收，所以建在根下的半成品会被当成一个真技能注册进去。
 */
function locationOf(root, base) {
  return { root, stagingParent: join(base, 'staging') }
}

/** 直接往盘上放一份 SKILL.md。 */
async function putSkill(root, name, text) {
  await mkdir(join(root, name), { recursive: true })
  await writeFile(join(root, name, 'SKILL.md'), text, 'utf8')
}

test('技能名只认短横线小写形式', () => {
  assert.doesNotThrow(() => assertSkillName('code-review'))
  assert.doesNotThrow(() => assertSkillName('a1'))
  assert.throws(() => assertSkillName('Code-Review'), /不合法/u)
  assert.throws(() => assertSkillName('code_review'), /不合法/u)
  assert.throws(() => assertSkillName('code--review'), /不合法/u)
  assert.throws(() => assertSkillName('../escape'), /不合法/u)
  assert.throws(() => assertSkillName(''), /不合法/u)
})

test('frontmatter 拆分认得出没有 frontmatter 的文件', () => {
  assert.deepEqual(splitFrontmatter('---\nname: a\n---\nbody\n'), {
    frontmatter: 'name: a\n',
    body: 'body\n',
  })
  assert.equal(splitFrontmatter('no frontmatter here'), undefined)
  assert.equal(splitFrontmatter('---\nname: a\n没有收尾分隔线'), undefined)
})

test('新建技能：缺省不写可见性键，文件保持最短', async () => {
  await withRoot(async (root) => {
    const skill = await createLocalSkill(root, {
      name: 'code-review',
      description: '按团队规范审查改动',
      content: '# 步骤\n1. 读 diff\n',
    })
    assert.equal(skill.modelInvocable, true)
    assert.equal(skill.userInvocable, true)

    const text = await readFile(join(root, 'code-review', 'SKILL.md'), 'utf8')
    assert.match(text, /^---\n/u)
    assert.match(text, /name: "code-review"/u)
    assert.doesNotMatch(text, /disable-model-invocation/u, '默认值不该写进文件')
    assert.doesNotMatch(text, /user-invocable/u)
    assert.match(text, /# 步骤/u)
  })
})

test('新建技能：偏离默认时才写可见性键', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, {
      name: 'internal-only',
      description: '只给人用',
      modelInvocable: false,
    })
    const text = await readFile(join(root, 'internal-only', 'SKILL.md'), 'utf8')
    assert.match(text, /disable-model-invocation: true/u)

    const skill = await readLocalSkill(root, 'internal-only')
    assert.equal(skill.modelInvocable, false)
    assert.equal(skill.userInvocable, true)
  })
})

test('新建技能：重名与空描述都拒绝', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'dup', description: 'x' })
    await assert.rejects(() => createLocalSkill(root, { name: 'dup', description: 'y' }), /已存在/u)
    await assert.rejects(
      () => createLocalSkill(root, { name: 'blank', description: '   ' }),
      /必须有 description/u,
    )
  })
})

test('改可见性只动目标字段，别的元数据与注释原样', async () => {
  await withRoot(async (root) => {
    await putSkill(root, 'keeper', [
      '---',
      '# 这行注释必须活下来',
      'name: keeper',
      'description: 保留测试',
      'whenToUse: 需要时',
      'allowed-tools:',
      '  - Read',
      '  - Grep',
      'license: MIT',
      '---',
      '正文原样不动。',
      '',
    ].join('\n'))

    const updated = await setSkillVisibility(root, 'keeper', { modelInvocable: false })
    assert.equal(updated.modelInvocable, false)
    assert.equal(updated.whenToUse, '需要时')

    const text = await readFile(join(root, 'keeper', 'SKILL.md'), 'utf8')
    assert.match(text, /# 这行注释必须活下来/u)
    assert.match(text, /allowed-tools:/u)
    assert.match(text, /- Grep/u)
    assert.match(text, /license: MIT/u)
    assert.match(text, /正文原样不动。/u)
    assert.match(text, /disable-model-invocation: true/u)
  })
})

test('可见性回到默认时删键而不是写 false', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, {
      name: 'toggler',
      description: '开关测试',
      modelInvocable: false,
      userInvocable: false,
    })
    let text = await readFile(join(root, 'toggler', 'SKILL.md'), 'utf8')
    assert.match(text, /disable-model-invocation: true/u)
    assert.match(text, /user-invocable: false/u)

    await setSkillVisibility(root, 'toggler', { modelInvocable: true, userInvocable: true })
    text = await readFile(join(root, 'toggler', 'SKILL.md'), 'utf8')
    assert.doesNotMatch(text, /disable-model-invocation/u)
    assert.doesNotMatch(text, /user-invocable/u)

    const skill = await readLocalSkill(root, 'toggler')
    assert.equal(skill.modelInvocable, true)
    assert.equal(skill.userInvocable, true)
  })
})

test('改不存在的技能给明确错误', async () => {
  await withRoot(async (root) => {
    await assert.rejects(() => setSkillVisibility(root, 'ghost', { userInvocable: false }), /不存在/u)
    await assert.rejects(() => removeLocalSkill(root, 'ghost'), /不存在/u)
  })
})

test('列表跳过隐藏目录和缺 frontmatter 的目录', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'good', description: '正常的' })
    await putSkill(root, 'broken', '没有 frontmatter\n')
    await putSkill(root, '.staging-leftover', '---\nname: x\ndescription: y\n---\n')
    await mkdir(join(root, 'empty-dir'), { recursive: true })

    const skills = await listLocalSkills(root)
    assert.deepEqual(skills.map(skill => skill.name), ['good'])
  })
})

test('列表带出技能目录里的附带文件', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'with-files', description: '带文件' })
    await mkdir(join(root, 'with-files', 'scripts'), { recursive: true })
    await writeFile(join(root, 'with-files', 'scripts', 'run.py'), 'print(1)\n', 'utf8')
    await writeFile(join(root, 'with-files', 'REFERENCE.md'), 'ref\n', 'utf8')

    const skill = await readLocalSkill(root, 'with-files')
    assert.deepEqual([...skill.files], ['REFERENCE.md', 'scripts/run.py'])
  })
})

test('删除技能会带走整个目录', async () => {
  await withRoot(async (root) => {
    await createLocalSkill(root, { name: 'doomed', description: '要删的' })
    await writeFile(join(root, 'doomed', 'extra.md'), 'x', 'utf8')
    const removed = await removeLocalSkill(root, 'doomed')
    assert.equal(removed.name, 'doomed')
    assert.deepEqual(await readdir(root), [])
  })
})

test('安装：目录名以包内 frontmatter 的 name 为准', async () => {
  await withRoot(async (root, base) => {
    const result = await installSkillFiles(locationOf(root, base), [
      { path: 'SKILL.md', content: '---\nname: actual-name\ndescription: 包自己说了算\n---\n正文\n' },
      { path: 'scripts/run.py', content: 'print(1)\n' },
    ], { overwrite: false })

    // DSH 注册技能用的是 frontmatter 里的 name，装到别的目录名下只会让
    // 盘上的名字和实际生效的名字对不上。
    assert.equal(result.installedAs, 'actual-name')
    assert.equal(result.replaced, false)
    assert.deepEqual(await readdir(root), ['actual-name'])
    assert.equal(
      await readFile(join(root, 'actual-name', 'scripts', 'run.py'), 'utf8'),
      'print(1)\n',
    )
  })
})

test('安装：没有 SKILL.md 的包直接拒绝，且不留痕迹', async () => {
  await withRoot(async (root, base) => {
    await assert.rejects(
      () => installSkillFiles(locationOf(root, base), [{ path: 'README.md', content: 'x' }], { overwrite: false }),
      /没有 SKILL\.md/u,
    )
    assert.deepEqual(await readdir(root), [], '失败后不能留下暂存目录')
  })
})

test('安装：frontmatter 不合法时拒绝，暂存目录清干净', async () => {
  await withRoot(async (root, base) => {
    await assert.rejects(
      () => installSkillFiles(locationOf(root, base), [
        { path: 'SKILL.md', content: '没有 frontmatter，只有正文\n' },
      ], { overwrite: false }),
      /缺少 YAML frontmatter/u,
    )
    assert.deepEqual(await readdir(root), [])
  })
})

test('安装：包内穿越路径在落盘前再被拦一次', async () => {
  await withRoot(async (root, base) => {
    await assert.rejects(
      () => installSkillFiles(locationOf(root, base), [
        { path: 'SKILL.md', content: '---\nname: evil\ndescription: d\n---\n' },
        { path: '../escaped.md', content: 'pwned' },
      ], { overwrite: false }),
      /非法条目路径/u,
    )
    assert.deepEqual(await readdir(root), [])
  })
})

test('安装：同名已存在时要显式 overwrite，覆盖后不留旧文件', async () => {
  await withRoot(async (root, base) => {
    const first = [
      { path: 'SKILL.md', content: '---\nname: shared\ndescription: 第一版\n---\n' },
      { path: 'old.md', content: '旧文件' },
    ]
    await installSkillFiles(locationOf(root, base), first, { overwrite: false })

    const second = [
      { path: 'SKILL.md', content: '---\nname: shared\ndescription: 第二版\n---\n' },
    ]
    await assert.rejects(
      () => installSkillFiles(locationOf(root, base), second, { overwrite: false }),
      /已存在/u,
    )

    const result = await installSkillFiles(locationOf(root, base), second, { overwrite: true })
    assert.equal(result.replaced, true)
    assert.equal(result.skill.description, '第二版')
    // 整目录换上去而不是逐文件覆盖，所以上一版的多余文件不会留下来。
    assert.deepEqual(await readdir(join(root, 'shared')), ['SKILL.md'])
  })
})

test('GitHub 页面地址翻成可下载的包地址', () => {
  assert.equal(
    githubArchiveUrl('https://github.com/owner/repo'),
    'https://api.github.com/repos/owner/repo/tarball',
  )
  assert.equal(
    githubArchiveUrl('https://github.com/owner/repo.git'),
    'https://api.github.com/repos/owner/repo/tarball',
  )
  assert.equal(
    githubArchiveUrl('https://github.com/owner/repo/tree/feature/x'),
    'https://api.github.com/repos/owner/repo/tarball/feature/x',
    '带斜杠的分支名要整段拼回去',
  )
  assert.equal(
    githubArchiveUrl('https://github.com/owner/repo/archive/refs/heads/main.tar.gz'),
    'https://github.com/owner/repo/archive/refs/heads/main.tar.gz',
    '已经是直链就别再翻一次',
  )
  assert.equal(githubArchiveUrl('https://example.com/a.zip'), undefined)
  assert.equal(githubArchiveUrl('not a url'), undefined)
})

test('import 的来源辨认：协议头优先于扩展名', () => {
  assert.deepEqual(
    classifyImportSource('https://example.com/skill.zip'),
    { kind: 'url', url: 'https://example.com/skill.zip', label: 'https://example.com/skill.zip' },
    '远端的 .zip 不能被扩展名规则抢走当本地路径',
  )
  assert.deepEqual(
    classifyImportSource('E:/packs/my-skill.tar.gz'),
    { kind: 'archive', path: 'E:/packs/my-skill.tar.gz' },
  )
  assert.deepEqual(
    classifyImportSource('code-review', '1.2.0'),
    { kind: 'registry', slug: 'code-review', version: '1.2.0' },
  )
  assert.deepEqual(
    classifyImportSource('owner/pack'),
    { kind: 'registry', slug: 'owner/pack' },
  )
  assert.equal(classifyImportSource('./local/dir/pack').kind, 'archive', '认不出的当本地路径')
  assert.throws(() => classifyImportSource('   '), /必须给 from/u)
})

test('从来源字符串凑出的兜底技能名总是合法的', () => {
  assert.equal(fallbackSkillName('E:/packs/Code_Review.zip'), 'code-review')
  assert.equal(fallbackSkillName('https://example.com/a/b/my-skill.tar.gz'), 'my-skill')
  assert.equal(fallbackSkillName('owner/pack'), 'pack')
  assert.equal(fallbackSkillName('@@@'), 'imported-skill')
  assert.doesNotThrow(() => assertSkillName(fallbackSkillName('__weird__NAME__')))
})

// ── 与 DSH 解析规则的一致性 ─────────────────────────────────────────────
//
// 这一组盯的是同一件事：本插件对 SKILL.md 的判定必须和
// `dsh-skill-filesystem` 逐条一致。不一致的表现不是报错，而是界面上显示一个
// DSH 根本不认的技能、或漏掉一个它认的——「我明明装了却调不到」。

test('解析：驼峰开关键会让 DSH 丢弃整份技能，这里要拒收并说清改成什么', () => {
  // DSH 的 parseInvocationPolicy 遇到这三个键直接抛，调用方 catch 之后
  // 记一行日志、返回 undefined——整份技能就此消失，没有别的提示。
  for (const [legacy, canonical] of [
    ['userInvocable', 'user-invocable'],
    ['modelInvocable', 'disable-model-invocation'],
    ['disableModelInvocation', 'disable-model-invocation'],
  ]) {
    const result = parseSkillFrontmatter(FRONT(['name: legacy-keys', 'description: d', legacy + ': true']))
    assert.equal(result.kind, 'invalid', legacy + ' 必须被拒')
    assert.match(result.reason, new RegExp(legacy, 'u'))
    assert.match(result.reason, new RegExp(canonical, 'u'), '要说清改成什么，否则修不了')
  }
})

test('解析：name 必填且必须是 kebab-case，缺了不退回目录名', () => {
  assert.equal(parseSkillFrontmatter(FRONT(['description: 只有描述'])).kind, 'invalid')
  const bad = parseSkillFrontmatter(FRONT(['name: Not_Kebab', 'description: d']))
  assert.equal(bad.kind, 'invalid')
  assert.match(bad.reason, /kebab-case/u)
  assert.equal(parseSkillFrontmatter(FRONT(['name: fine-name', 'description: d'])).kind, 'ok')
})

test('解析：开关不止 true/false，yes/on/1 也算真', () => {
  // DSH 的 frontmatterBoolean 收这些写法。只认 JS 布尔的话，
  // `disable-model-invocation: "true"` 会被当成「没设」，
  // 界面显示「模型可调用」而 DSH 那边是关着的。
  for (const truthy of ['true', 'yes', 'on', '1']) {
    const parsed = parseSkillFrontmatter(FRONT([
      'name: n', 'description: d', 'disable-model-invocation: ' + truthy,
    ]))
    assert.equal(parsed.kind, 'ok')
    assert.equal(parsed.skill.modelInvocable, false, truthy + ' 该被当成真')
  }
  const bogus = parseSkillFrontmatter(FRONT(['name: n', 'description: d', 'user-invocable: 也许吧']))
  assert.equal(bogus.kind, 'invalid', '不是布尔量的值 DSH 会抛，这里同样拒收')
})

test('解析：whenToUse 是驼峰，两个开关是短横线', () => {
  // 同一份 frontmatter 里两种命名风格并存，看着像笔误，但 DSH 就是这么读的。
  const parsed = parseSkillFrontmatter(FRONT([
    'name: mixed-style',
    'description: d',
    'whenToUse: 需要的时候',
    'user-invocable: false',
  ]))
  assert.equal(parsed.kind, 'ok')
  assert.equal(parsed.skill.whenToUse, '需要的时候')
  assert.equal(parsed.skill.userInvocable, false)
})

test('扫描：扁平 <name>.md 也是技能，不能只认目录', async () => {
  await withRoot(async (root) => {
    await writeFile(join(root, 'flat-one.md'), FRONT(['name: flat-one', 'description: 手写的扁平技能']) + '正文' + NL)
    await mkdir(join(root, 'dir-one'), { recursive: true })
    await writeFile(join(root, 'dir-one', 'SKILL.md'), FRONT(['name: dir-one', 'description: 目录形']))

    const scan = await scanLocalSkills(root)
    assert.deepEqual(scan.skills.map(skill => skill.name), ['dir-one', 'flat-one'])
    assert.equal(scan.skills.find(skill => skill.name === 'flat-one').flat, true)
    // 只认目录形的话，扁平技能照常生效却既看不见也删不掉。
    const removed = await removeLocalSkill(root, 'flat-one')
    assert.equal(removed.flat, true)
    assert.equal((await scanLocalSkills(root)).skills.length, 1)
  })
})

test('扫描：DSH 会拒收的文件单列出来，而不是当作不存在', async () => {
  await withRoot(async (root) => {
    await mkdir(join(root, 'legacy-keys'), { recursive: true })
    await writeFile(
      join(root, 'legacy-keys', 'SKILL.md'),
      FRONT(['name: legacy-keys', 'description: d', 'userInvocable: true']),
    )
    const scan = await scanLocalSkills(root)
    assert.deepEqual(scan.skills, [])
    assert.equal(scan.rejected.length, 1, '装了却不生效必须有线索——DSH 那边只有一行日志')
    assert.equal(scan.rejected[0].hint, 'legacy-keys')
    assert.match(scan.rejected[0].reason, /user-invocable/u)
  })
})

test('安装：暂存目录建在技能根之外，失败也不会污染技能根', async () => {
  await withRoot(async (root, base) => {
    // 建在根下的话，DSH 会把半成品当成一个真技能扫进去——它只跳过 `.system`，
    // 别的点开头目录照收，而且点号排在字母前面，同 rank 时先入者胜。
    await assert.rejects(
      () => installSkillFiles(locationOf(root, base), [
        { path: 'SKILL.md', content: FRONT(['name: half-done', 'description: d']) },
        { path: '../escape.md', content: 'pwned' },
      ], { overwrite: false }),
      /非法条目路径/u,
    )
    assert.deepEqual(await readdir(root), [], '技能根必须一尘不染')
  })
})

test('安装：二进制资源原样落盘，不是静默丢掉', async () => {
  await withRoot(async (root, base) => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])
    const result = await installSkillFiles(locationOf(root, base), [
      { path: 'SKILL.md', content: FRONT(['name: with-assets', 'description: 带资源的技能']) },
      { path: 'assets/logo.png', content: png },
    ], { overwrite: false })

    assert.equal(result.binaryCount, 1)
    assert.equal(result.fileCount, 2)
    // 技能正文按相对路径引用它，少一个文件在盘上看不出来，只表现为技能失灵。
    assert.deepEqual(await readFile(join(root, 'with-assets', 'assets', 'logo.png')), png)
  })
})

test('安装：装目录形时，同名的扁平技能要让位', async () => {
  await withRoot(async (root, base) => {
    await writeFile(join(root, 'both.md'), FRONT(['name: both', 'description: 扁平那份']))
    await installSkillFiles(locationOf(root, base), [
      { path: 'SKILL.md', content: FRONT(['name: both', 'description: 目录那份']) },
    ], { overwrite: true })

    // 两份并存的话，谁生效由 DSH 的目录项排序决定——一个没人想要的抽签。
    const scan = await scanLocalSkills(root)
    assert.equal(scan.skills.length, 1)
    assert.equal(scan.skills[0].description, '目录那份')
    assert.equal(scan.skills[0].flat, false)
  })
})

// ── 包形状 ────────────────────────────────────────────────────────────────

test('包形状：包根有 SKILL.md 时整包就是一个技能，子目录里的是资源', () => {
  // SkillHub 的 ima-skills 就是这个形状：根一份，notes/ 与 knowledge-base/
  // 各还有一份。DSH 明确不做递归发现，所以后两份对它就是普通资源文件；
  // 拆成三个技能会凭空造出两个模型能自行调用的东西。
  const found = findSkillsInPackage([
    { path: 'SKILL.md', content: FRONT(['name: main-skill', 'description: 主技能']) },
    { path: 'notes/SKILL.md', content: FRONT(['name: notes', 'description: 子文档']) },
    { path: 'notes/references/api.md', content: 'api' },
  ])
  assert.equal(found.length, 1)
  assert.equal(found[0].parsed.name, 'main-skill')
  assert.equal(found[0].files.length, 3, '子目录的文件归主技能')
})

test('包形状：根没有 SKILL.md 时往下找，多个技能要求明确指定装哪个', () => {
  // GitHub tarball 剥掉 repo-<sha>/ 之后常见的形状。
  const files = [
    { path: 'skills/alpha/SKILL.md', content: FRONT(['name: alpha', 'description: A']) },
    { path: 'skills/alpha/run.py', content: 'print(1)' },
    { path: 'skills/beta/SKILL.md', content: FRONT(['name: beta', 'description: B']) },
    { path: 'README.md', content: '仓库说明' },
  ]
  const found = findSkillsInPackage(files)
  assert.deepEqual(found.map(entry => entry.parsed.name), ['alpha', 'beta'])
  assert.deepEqual(found[0].files.map(file => file.path).sort(), ['SKILL.md', 'run.py'], '路径已相对化')

  // 猜一个装上去，就是往盘上放一个人没打算装、而模型可以自行调用的技能。
  assert.throws(() => selectSkillFromPackage(files), /请用 name 指定/u)
  assert.equal(selectSkillFromPackage(files, 'beta').parsed.name, 'beta')
  assert.throws(() => selectSkillFromPackage(files, 'gamma'), /没有名为 "gamma"/u)
})

test('包形状：一个 SKILL.md 都没有时，报错要说清包里到底是什么', () => {
  assert.throws(
    () => selectSkillFromPackage([
      { path: 'README.md', content: 'x' },
      { path: 'src/index.ts', content: 'y' },
    ]),
    /README\.md/u,
  )
})

// ── 版本比较 ──────────────────────────────────────────────────────────────

test('版本比较：认得出新版本，认不出的写法也不会崩', () => {
  assert.equal(isNewerVersion('2.0.0', '1.9.9'), true)
  assert.equal(isNewerVersion('1.10.0', '1.9.0'), true, '按段比数字，不是字符串比大小')
  assert.equal(isNewerVersion('1.0.0', '1.0.0'), false)
  assert.equal(isNewerVersion('1.0', '1.0.0'), false, '段数不同时短的补零')
  assert.equal(isNewerVersion('1.0.1', '1.0'), true)
  // 日期串这类写法退化成字符串比较：结论错了顶多多提示一次更新。
  assert.equal(isNewerVersion('20260715.045047', '20260101.000000'), true)
})
