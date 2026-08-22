/**
 * ClawHub 协议归一的行为锁。
 *
 * 这里锁的全是上游协议里**反直觉**的地方：响应是裸 DTO 没有 `{code,data}` 包裹、
 * 展示名叫 `displayName` 而不是 `name`、`tags` 可能是对象、`page` 从 0 开始。
 * 每一条写错都不会报错，只会让搜索结果少一半或永远停在第一页。
 */

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'

import AdmZip from 'adm-zip'

import {
  ambiguityMessage,
  collectTopics,
  itemFromDetail,
  itemFromListEntry,
  itemFromSearchResult,
  itemFromWebEntry,
  normalizeTags,
  packageFileText,
  RegistryClient,
  showcasePath,
  summarizeModeration,
  versionFromDisposition,
} from '../lib/index.js'

const SOURCE = { id: 'skillhub', name: 'SkillHub', url: 'https://hub.example.com/' }
const NL = String.fromCharCode(10)

/** 一份最小的合法技能，装进包里当下载结果用。 */
const MINIMAL_SKILL = ['---', 'name: demo-skill', 'description: 一份用来测下载路径的技能', '---', '', '正文'].join(NL)

/** 拼一个只含 SKILL.md 的 zip。 */
function zipBytes() {
  const zip = new AdmZip()
  zip.addFile('SKILL.md', Buffer.from(MINIMAL_SKILL, 'utf8'))
  return zip.toBuffer()
}

test('标签只认数组形态；对象形态是版本别名映射，不是标签', () => {
  assert.deepEqual(normalizeTags(['a', 'b']), ['a', 'b'])
  assert.deepEqual(normalizeTags({ items: ['a', 'b'] }), ['a', 'b'])
  // ClawHub 的 `tags` 是 `{latest: "4.0.2"}` 这样的版本指针。按键名归一的话，
  // 市场里每个技能都会挂一个叫「latest」的标签，看着像分类、其实是版本。
  assert.deepEqual(normalizeTags({ latest: '4.0.2' }), [], '版本别名映射不是标签')
  assert.deepEqual(normalizeTags(undefined), [])
  assert.deepEqual(normalizeTags('nope'), [])
})

test('分类词从 topics/categories/subCategories 收集并去重', () => {
  assert.deepEqual(
    collectTopics([{ topics: ['PDF'], categories: ['knowledge'] }]),
    ['PDF', 'knowledge'],
  )
  // subCategories 是 `{key,name}` 对象数组，取显示名。
  assert.deepEqual(
    collectTopics([{ subCategories: [{ key: 'agent-memory', name: '记忆增强' }] }]),
    ['记忆增强'],
  )
  assert.deepEqual(collectTopics([{ topics: ['a'] }, { categories: ['a', 'b'] }]), ['a', 'b'], '跨来源去重')
  assert.deepEqual(collectTopics([undefined, null, 'nope']), [])
})

test('search 结果：displayName 是展示名，summary 是描述', () => {
  const item = itemFromSearchResult({
    slug: 'code-review',
    displayName: '代码审查',
    summary: '按团队规范做审查',
    version: '1.2.0',
    topics: ['review'],
    downloads: 120,
  }, SOURCE)
  assert.equal(item.slug, 'code-review')
  assert.equal(item.name, '代码审查')
  assert.equal(item.description, '按团队规范做审查')
  assert.equal(item.version, '1.2.0')
  assert.deepEqual(item.tags, ['review'])
  assert.equal(item.sourceRegistry, 'skillhub')
  assert.equal(item.downloadCount, 120, '统计量在顶层，早先这里被写死成 0')
})

test('search 结果：ClawHub 把正体埋在 native.skill 下，发布者要取 handle 而不是显示名', () => {
  // 这是 clawhub.ai 实测的形状。顶层 displayName 是**技能**的显示名——
  // 拿它当发布者会得到「作者：Pdf」这种不报错但明显不对的东西。
  const item = itemFromSearchResult({
    slug: 'pdf',
    displayName: 'Pdf',
    summary: 'PDF 工具包',
    ownerHandle: 'awspace',
    downloads: 48017,
    install: { kind: 'clawhub', reference: 'awspace/pdf', sourceUrl: null },
    publisher: { displayName: 'awspace', handle: 'awspace', kind: 'user' },
    trust: { installability: 'installable', clawHubVerdict: null },
    native: {
      skill: {
        slug: 'pdf',
        displayName: 'Pdf',
        categories: ['knowledge'],
        topics: ['PDF'],
        isSuspicious: false,
        stats: { downloads: 48017, installs: 1466, stars: 65 },
        tags: { latest: 'k97cz981kj0veqx1m79dd5sy4n809j57' },
      },
    },
  }, SOURCE)
  assert.equal(item.owner, 'awspace', '发布者是 handle，不是技能显示名')
  assert.deepEqual(item.tags, ['PDF', 'knowledge'], 'tags 那个版本指针不该混进来')
  assert.equal(item.installCount, 1466)
  assert.equal(item.stars, 65)
  assert.equal(item.installable, true)
  assert.equal(item.installKind, 'clawhub')
  assert.equal(item.installReference, 'awspace/pdf')
})

test('别家目录的镜像条目标成装不了，而不是让人点下去收 404', () => {
  const item = itemFromSearchResult({
    slug: 'pdf',
    displayName: 'Pdf',
    install: { kind: 'skills-sh', reference: 'skills-sh:openai/skills/pdf', sourceUrl: 'https://www.skills.sh/openai/skills/pdf' },
  }, SOURCE)
  assert.equal(item.installable, false)
  assert.equal(item.installKind, 'skills-sh')
})

test('上游标记为可疑时带出安全结论', () => {
  const item = itemFromSearchResult({
    slug: 'sketchy',
    isSuspicious: true,
  }, SOURCE)
  assert.match(item.securityStatus, /可疑/u)
})

test('缺 slug 的条目丢掉而不是造一个空壳', () => {
  assert.equal(itemFromSearchResult({ displayName: 'x' }, SOURCE), undefined)
  assert.equal(itemFromListEntry({}, SOURCE), undefined)
  assert.equal(itemFromSearchResult(null, SOURCE), undefined)
})

test('列表条目：版本在 latestVersion 里，stats 兼容多种键名', () => {
  const item = itemFromListEntry({
    slug: 'writer',
    displayName: 'Writer',
    summary: '写作',
    category: 'content',
    latestVersion: { version: '2.0.1' },
    stats: { installs: 42, rating: 4.5, downloads: 900, stars: 7 },
    topics: ['writing'],
  }, SOURCE)
  assert.equal(item.version, '2.0.1')
  assert.equal(item.category, 'content')
  assert.equal(item.installCount, 42)
  assert.equal(item.avgRating, 4.5)
  assert.equal(item.downloadCount, 900)
  assert.equal(item.stars, 7)
  assert.deepEqual(item.tags, ['writing'])

  // 安装量取不到时**不**拿下载量顶替：两者在 ClawHub 上差一个数量级
  // （self-improving-agent 是 47 万下载对 1.8 万安装），混为一谈会让
  // 市场列表报出一个大得离谱的安装量。
  const alt = itemFromListEntry({
    slug: 'writer',
    stats: { downloads: 7, avgRating: 3 },
  }, SOURCE)
  assert.equal(alt.installCount, 0, '没有 installs 就是 0，不借下载量')
  assert.equal(alt.downloadCount, 7)
  assert.equal(alt.avgRating, 3)
  assert.equal(alt.name, 'writer', '没有 displayName 就退回 slug')
})

test('ClawHub 的错误处理：歧义 slug、限流、Content-Disposition 里的版本', () => {
  // 纯文本那版本身就写清了要加 ownerHandle，原样用。
  assert.equal(ambiguityMessage('Ambiguous skill slug. Retry with ownerHandle.'), undefined)
  // JSON 那版给的是候选列表，得自己拼成一句能照做的话。
  const message = ambiguityMessage(JSON.stringify({
    code: 'AMBIGUOUS_SKILL_SLUG',
    message: 'Found multiple skills',
    matches: [
      { ownerHandle: 'pskoett', ref: '@pskoett/self-improving-agent' },
      { ownerHandle: 'jianghg01', ref: '@jianghg01/self-improving-agent' },
    ],
  }))
  assert.match(message, /@pskoett\/self-improving-agent/u)
  assert.match(message, /@jianghg01\/self-improving-agent/u)

  // 不带版本请求时，「拿到的是哪一版」只有响应头知道。
  assert.equal(
    versionFromDisposition('attachment; filename="find-skills-1.0.0.zip"'),
    '1.0.0',
  )
  assert.equal(versionFromDisposition('attachment; filename="self-improving-agent-4.0.2.zip"'), '4.0.2')
  assert.equal(versionFromDisposition(null), undefined)
})

test('SkillHub 的浏览走榜单端点，认不出的 sort 回落到 hot', () => {
  assert.equal(showcasePath('trending'), '/api/v1/showcase/trending')
  assert.equal(showcasePath('NEWEST'), '/api/v1/showcase/newest')
  assert.equal(showcasePath('乱写的'), '/api/v1/showcase/hot', 'sort 是软偏好，不为它失败一次浏览')
  assert.equal(showcasePath(undefined), '/api/v1/showcase/hot')
})

test('审核结论：clean 不占地方，被拦下和可疑要顶到前面', () => {
  assert.equal(summarizeModeration({ verdict: 'clean', isSuspicious: false }), undefined)
  assert.match(summarizeModeration({ isSuspicious: true, reasonCodes: ['obfuscation'] }), /可疑/u)
  assert.match(summarizeModeration({ isMalwareBlocked: true, summary: '含恶意载荷' }), /拦截/u)
  assert.equal(summarizeModeration(undefined), undefined)
})

test('详情：正体在 skill 下，版本在顶层 latestVersion 下', () => {
  const item = itemFromDetail({
    skill: { slug: 'writer', displayName: 'Writer', description: '写作助手', stats: { installs: 9 } },
    latestVersion: { version: '3.1.0' },
  }, 'writer', SOURCE)
  assert.equal(item.name, 'Writer')
  assert.equal(item.description, '写作助手')
  assert.equal(item.version, '3.1.0')
  assert.equal(item.installCount, 9)
})

test('详情里的 description 是整份 SKILL.md 时，描述取 summary 那一行', () => {
  // ClawHub 的详情端点把整份 SKILL.md（连 frontmatter）塞在 `description` 里，
  // 一行摘要在 `summary`。列表端点只给 summary——不挑的话，同一个技能在卡片上
  // 是一行字，点进详情变成一堵几千字的墙。
  const whole = ['---', 'name: mailer', 'description: 邮件助手', '---', '', '# 邮件助手', '正文'].join(NL)
  const item = itemFromDetail({
    skill: { slug: 'mailer', displayName: 'mailer', description: whole, summary: '邮件助手 - 自动收信并归档' },
    latestVersion: { version: '1.3.0' },
  }, 'mailer', SOURCE)
  assert.equal(item.description, '邮件助手 - 自动收信并归档')
})

test('一个像样的摘要都没有时，仍然按原优先级给出第一个非空的', () => {
  // 挑的是形状不是字段名：全都是长正文时不能挑没了，那样详情页会一片空白。
  const long = 'x'.repeat(400)
  const item = itemFromDetail({
    skill: { slug: 'mailer', displayName: 'mailer', description: long, readme: 'y'.repeat(400) },
  }, 'mailer', SOURCE)
  assert.equal(item.description, long)
})

test('web 列表条目：版本在 headlineVersion 里，中文名优先', () => {
  // 按标签筛走的是 SkillHub 的 /api/web/skills，形状与 /api/v1 那两条都不同：
  // 显示名与摘要各有一个中文版，版本藏在 headlineVersion 里，统计量换了字段名。
  const item = itemFromWebEntry({
    slug: 'vpn-analysis',
    displayName: 'vpn-analysis',
    displayNameZh: 'VPN 网站分析',
    summary: 'Analyze VPN sites',
    namespace: 'global',
    downloadCount: 7,
    starCount: 2,
    ratingAvg: 4.5,
    headlineVersion: { version: '20260715.084836' },
  }, SOURCE)
  assert.equal(item.name, 'VPN 网站分析')
  assert.equal(item.version, '20260715.084836')
  assert.equal(item.downloadCount, 7)
  assert.equal(item.stars, 2)
  assert.equal(item.description, 'Analyze VPN sites')
  // namespace 是命名空间不是发布者。当成 owner 会让卡片上写着「发布者 global」，
  // 下载时还会带上一个上游不认的坐标。
  assert.equal(item.owner, undefined, 'namespace 不是发布者')
})

test('web 列表条目：没有 slug 的行整条丢掉', () => {
  assert.equal(itemFromWebEntry({ displayName: '无名' }, SOURCE), undefined)
  assert.equal(itemFromWebEntry(undefined, SOURCE), undefined)
})

/** 换掉全局 fetch，记录请求并给出预设响应。 */
function withFetch(handler, run) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init) => {
    calls.push(String(url))
    return handler(String(url), init)
  }
  return Promise.resolve(run(calls)).finally(() => {
    globalThis.fetch = original
  })
}

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

/** 建一个带临时缓存目录的客户端。 */
async function withClient(run, sources = [SOURCE]) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'dsh-workbench-cache-'))
  const client = new RegistryClient({ sources, cacheDir, timeoutMs: 5_000 })
  try {
    return await run(client, cacheDir)
  } finally {
    await rm(cacheDir, { recursive: true, force: true })
  }
}

test('调用方的 1 起页码转成 ClawHub 的 0 起', async () => {
  await withClient(async (client) => {
    await withFetch(() => jsonResponse({ results: [] }), async (calls) => {
      await client.search({ keyword: 'review', page: 1, pageSize: 5 })
      const url = new URL(calls[0])
      assert.equal(url.pathname, '/api/v1/search')
      assert.equal(url.searchParams.get('q'), 'review')
      assert.equal(url.searchParams.get('page'), '0', '第 1 页对应 ClawHub 的 page=0')
      assert.equal(url.searchParams.get('limit'), '5')
    })
  })
})

test('没有关键词时走 /skills 浏览端点', async () => {
  await withClient(async (client) => {
    await withFetch(() => jsonResponse({ items: [{ slug: 'a', displayName: 'A' }] }), async (calls) => {
      const page = await client.search({ page: 2, sort: 'popular' })
      assert.match(calls[0], /\/api\/v1\/skills\?/u)
      assert.equal(new URL(calls[0]).searchParams.get('page'), '1')
      assert.equal(new URL(calls[0]).searchParams.get('sort'), 'popular')
      assert.equal(page.items.length, 1)
      assert.equal(page.items[0].name, 'A')
    })
  })
})

test('registry 不可达时回退上次缓存，并标出 fromCache', async () => {
  await withClient(async (client) => {
    await withFetch(() => jsonResponse({ items: [{ slug: 'cached', displayName: 'Cached' }] }), async () => {
      const fresh = await client.search({})
      assert.equal(fresh.items[0].slug, 'cached')
      assert.equal(fresh.fromCache, false)
    })

    await withFetch(() => { throw new Error('ECONNREFUSED') }, async () => {
      const offline = await client.search({})
      assert.equal(offline.items[0].slug, 'cached', '断网时给上次的结果，而不是空列表')
      assert.equal(offline.fromCache, true, '要标出来，否则用户以为看到的是最新的')
    })
  })
})

test('registry 不可达且没有缓存时给空结果而不是抛异常', async () => {
  await withClient(async (client) => {
    await withFetch(() => { throw new Error('ECONNREFUSED') }, async () => {
      const page = await client.search({ keyword: 'nothing-cached' })
      assert.deepEqual(page.items, [])
    })
  })
})

test('没配任何源时，市场动作给出可操作的错误', async () => {
  await withClient(async (client) => {
    await assert.rejects(() => client.search({}), /没有配置任何技能\/插件 registry/u)
  }, [])
})

test('指定不存在的 registry 时报出已配置的有哪些', async () => {
  await withClient(async (client) => {
    await assert.rejects(() => client.get('x', 'nope'), /已配置：skillhub/u)
  })
})

test('URL 拼接不会因为源地址末尾的斜杠而出现双斜杠', async () => {
  await withClient(async (client) => {
    await withFetch(() => jsonResponse({}), async (calls) => {
      await client.get('my-skill', 'skillhub')
      assert.equal(calls[0], 'https://hub.example.com/api/v1/skills/my-skill')
    })
  })
})

test('下载端点回了个没有 Location 的 302 时，改走规范路径', async () => {
  // slug 不是 ASCII 时，SkillHub 那句 `Location: /api/v1/skills/{ns}/{slug}/download`
  // 发不出来——HTTP 头承载不了非 ASCII，服务端直接把它丢了。客户端于是收到一个
  // 无处可去的 302，报出来就是一句「HTTP 302」，那个技能永远装不上。
  const slug = '移动集团恶意软件运维助手'
  await withClient(async (client) => {
    await withFetch((url) => {
      const parsed = new URL(url)
      if (parsed.pathname === '/api/v1/download') {
        // 没有 Location：fetch 跟不动，交给我们自己走。
        return new Response(null, { status: 302 })
      }
      if (parsed.pathname === '/api/web/skills') {
        return jsonResponse({ data: { items: [{ slug, namespace: 'team-a' }] } })
      }
      if (parsed.pathname === `/api/v1/skills/team-a/${encodeURIComponent(slug)}/download`) {
        return new Response(zipBytes(), { status: 200 })
      }
      return new Response('nope', { status: 404 })
    }, async (calls) => {
      const pkg = await client.download(slug, undefined, 'skillhub')
      assert.equal(pkg.files.length, 1)
      assert.equal(packageFileText(pkg.files[0]), MINIMAL_SKILL)

      // 命名空间是从 web 列表里查出来的，不是写死的。
      assert.ok(
        calls.some(one => new URL(one).pathname === `/api/v1/skills/team-a/${encodeURIComponent(slug)}/download`),
        '应该拿服务端本来要指过去的那条规范路径重试',
      )
    })
  })
})

test('查不出命名空间时按 global 走', async () => {
  const slug = '中文技能'
  await withClient(async (client) => {
    await withFetch((url) => {
      const parsed = new URL(url)
      if (parsed.pathname === '/api/v1/download') return new Response(null, { status: 302 })
      // 这个源没有 /api/web，查不到命名空间。
      if (parsed.pathname === '/api/web/skills') return new Response('nope', { status: 404 })
      if (parsed.pathname === `/api/v1/skills/global/${encodeURIComponent(slug)}/download`) {
        return new Response(zipBytes(), { status: 200 })
      }
      return new Response('nope', { status: 404 })
    }, async () => {
      const pkg = await client.download(slug, undefined, 'skillhub')
      assert.equal(pkg.files.length, 1)
    })
  })
})

test('带 Location 的重定向不走这条兜底，失败也照旧报出来', async () => {
  await withClient(async (client) => {
    await withFetch((url) => {
      const parsed = new URL(url)
      // 真正的 404 不该被当成「跟不动的重定向」而去试规范路径。
      if (parsed.pathname === '/api/v1/download') return new Response('no such skill', { status: 404 })
      return new Response('nope', { status: 404 })
    }, async (calls) => {
      await assert.rejects(
        () => client.download('missing', undefined, 'skillhub'),
        (error) => {
          assert.match(error.message, /no such skill/u)
          return true
        },
      )
      assert.equal(
        calls.some(one => new URL(one).pathname.endsWith('/download') && new URL(one).pathname.startsWith('/api/v1/skills/')),
        false,
        '不是重定向就别去试规范路径',
      )
    })
  })
})
