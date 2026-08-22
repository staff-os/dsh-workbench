/**
 * 技能包的静态扫描：装之前先看看这一份里有没有明显不该有的东西。
 *
 * 规则表与字符集夹带的判法移植自腾讯朱雀实验室的 AI-Infra-Guard
 * （`skill-scan/skill_scan/utils/pre_scan.py` 与 `text_decoder.py`，
 * https://github.com/Tencent/AI-Infra-Guard ，Apache License 2.0），
 * 内网 SkillHub 的发布前置校验用的是同一份规则的 Java 版。这边照着搬是为了
 * **两边说的是同一件事**：市场上标了什么风险，装到本地之后再扫一遍还是那些。
 *
 * 三件事要说清楚：
 *
 * - **这是正则匹配，不是判决**。命中说明「这段文字长得像某种高危写法」，
 *   不代表这份技能真会那么做——`crontab` 出现在一份讲定时任务的文档里完全
 *   正常。所以界面上给的是「命中了哪条规则、在哪个文件哪一行」，让人自己看，
 *   而不是一个红绿灯。
 * - **没命中不等于安全**。规则只有十三条，绕过它们不难。这一页的价值在于
 *   「装之前顺手看一眼」，不在于给出安全结论。
 * - **只扫文本、只扫开头一段**。多行规则用的是 dot-all 量词，代价随输入长度
 *   涨，所以超过 {@link MAX_SCAN_BYTES} 的文件整个跳过，与上游一致。
 *
 * @module @staff-os/dsh-workbench/skill/scan
 */

import { decodeText } from '../archive/guard.ts'

/**
 * 严重度。取值与 SkillHub 安全审计界面那套词表一致，声明顺序从高到低——
 * {@link highestSeverity} 靠这个顺序取一包里最高的那一档。
 */
export const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const

/** 严重度。 */
export type RiskSeverity = typeof SEVERITY_ORDER[number]

/**
 * 一条静态规则。
 *
 * `multiline` 的意思是这条规则跨行匹配（dot-all）：整份文件先匹一次，命中之后
 * 再逐行找一遍具体位置，找不到就不报行号——跨行的匹配本来就没有「哪一行」。
 */
export interface RiskRule {
  readonly id: string
  readonly pattern: RegExp
  readonly multiline: boolean
  readonly severity: RiskSeverity
  readonly category: string
  readonly description: string
}

/** 单行规则。 */
function single(
  id: string,
  source: string,
  severity: RiskSeverity,
  category: string,
  description: string,
): RiskRule {
  return { id, pattern: new RegExp(source, 'iu'), multiline: false, severity, category, description }
}

/** 跨行规则：`.` 也吃换行。 */
function multiline(
  id: string,
  source: string,
  severity: RiskSeverity,
  category: string,
  description: string,
): RiskRule {
  return { id, pattern: new RegExp(source, 'ius'), multiline: true, severity, category, description }
}

/**
 * 规则表，十三条。
 *
 * 说明写成中文是因为它直接显示在界面上；`id` 与 `category` 保持上游的写法，
 * 那两个是稳定标识，改了就对不上 SkillHub 那边的审计记录。
 */
export const RISK_RULES: readonly RiskRule[] = [
  single(
    'curl_pipe_exec',
    'curl\\s+.*\\|\\s*(ba)?sh|wget\\s+.*\\|\\s*(ba)?sh|curl\\s+-[^|]*\\|\\s*(python|ruby|perl)',
    'HIGH',
    'remote-payload',
    '把下载到的脚本直接管进 shell 执行。审核时看到的内容和实际跑的可以完全是两回事',
  ),
  single(
    'cloud_metadata_access',
    '169\\.254\\.169\\.254|metadata\\.google\\.internal|metadata\\.azure\\.com',
    'HIGH',
    'credential-access',
    '访问云主机的元数据端点，那是取云上临时凭据的常见路子',
  ),
  // 定成 LOW：查本机主机名在正经的诊断类技能里很常见，值得报出来，但不该
  // 单凭它把整包的严重度抬上去。
  single(
    'local_env_recon',
    'gethostname|getfqdn|getsockname|socket\\.connect.*8\\.8\\.8\\.8',
    'LOW',
    'reconnaissance',
    '收集本机环境信息（主机名／IP／FQDN），像是在踩点',
  ),
  single(
    'credential_file_access',
    '(~/|HOME|USERPROFILE).*(/|\\\\)(\\.ssh|\\.aws|\\.env|credentials|mcp\\.json|Keychain|authorized_keys)',
    'HIGH',
    'credential-access',
    '读凭据或密钥所在的路径',
  ),
  single(
    'prompt_injection',
    '(ignore\\s+(previous|above|all)\\s+(instructions?|rules?|prompts?)'
      + '|you\\s+are\\s+now|SYSTEM\\s*OVERRIDE|<\\|im_start\\|>'
      + '|forget\\s+(everything|your\\s+instructions))',
    'CRITICAL',
    'prompt-injection',
    '含疑似提示词注入的措辞，试图盖掉 agent 自己的约束',
  ),
  multiline(
    'fixed_tail_ad_injection',
    '((文末|结尾|每篇必带|固定收束|固定提示).{0,80}(链接|扫码|进群|群里|资讯|广告|内幕|吃瓜|news|http))'
      + '|((扫码进群|进群吃瓜|获取更多资讯新闻点击|点击[:：]|想深扒更多).{0,120}(https?://|www\\.))'
      + '|((https?://|www\\.).{0,120}(扫码进群|进群|群里|资讯|广告|内幕|吃瓜))',
    'MEDIUM',
    'prompt-injection',
    '要求在模型输出末尾固定附上一段广告或引流内容',
  ),
  single(
    'reverse_shell',
    '(socket\\.connect|subprocess|/bin/(ba)?sh).*\\d+\\.\\d+\\.\\d+\\.\\d+',
    'CRITICAL',
    'remote-control',
    '含疑似反弹 shell 的写法',
  ),
  multiline(
    'encoded_payload',
    '(base64\\.b64decode|atob|Buffer\\.from.*base64).*\\b(exec|eval|system|popen)\\b',
    'CRITICAL',
    'obfuscation',
    '先解码再执行，真正跑的是什么在审核时看不到',
  ),
  multiline(
    'data_exfil_encoded',
    '(base64\\.(b64)?encode|btoa).*?(key|secret|token|password|credential|private|id_rsa)',
    'HIGH',
    'data-exfiltration',
    '把敏感数据编码之后再写出去，像是一条隐蔽的外传通道',
  ),
  multiline(
    'outbound_data_exfil',
    '(requests\\.(post|put)|urlopen|fetch|http\\.request).*?(environ|os\\.getenv|password|secret|token|api_key)',
    'HIGH',
    'data-exfiltration',
    '把环境变量或凭据往网络上发',
  ),
  single(
    'crontab_persistence',
    'crontab|systemctl\\s+enable|launchctl\\s+load|schtasks',
    'MEDIUM',
    'persistence',
    '装一个定时任务或系统服务，技能这一次跑完了它还在',
  ),
  single(
    'ssh_key_write',
    'authorized_keys|id_rsa|\\.ssh.*write|\\.ssh.*open.*w',
    'HIGH',
    'credential-access',
    '往 SSH 密钥文件里写东西',
  ),
  single(
    'non_official_download',
    '(github\\.com/[a-zA-Z0-9_-]+/|glot\\.io|pastebin\\.com|raw\\.githubusercontent\\.com/[a-zA-Z0-9_-]+/)'
      + '.*\\.(exe|sh|py|bin|zip|tar)',
    'MEDIUM',
    'remote-payload',
    '从个人代码托管或贴代码站下可执行文件',
  ),
]

/**
 * 一个文件最多扫多少字节。
 *
 * 与上游的 pre-scan 上限一致。跨行规则用的是 dot-all 量词，代价随输入长度涨，
 * 所以超过这个数的文件整个跳过，而不是截一段来扫——截出来的半截内容既可能
 * 漏报，也可能因为切在半路而误报。
 */
export const MAX_SCAN_BYTES = 512 * 1024

/** 字符集夹带这一条不是正则匹出来的，是解码器解出来的，所以单独有个 id。 */
export const CHARSET_SMUGGLING_RULE = 'charset_smuggling'

/** 会去扫的扩展名。二进制与不认识的一律跳过。 */
const TEXT_EXTENSIONS = new Set([
  'md', 'txt', 'json', 'yaml', 'yml', 'js', 'cjs', 'mjs', 'ts', 'py', 'sh',
  'html', 'css', 'csv', 'toml', 'xml', 'xsd', 'xsl', 'dtd', 'ini', 'cfg', 'env',
  'rb', 'go', 'rs', 'java', 'kt', 'lua', 'sql', 'r', 'bat', 'ps1', 'zsh', 'bash',
  'svg',
])

/**
 * 这个文件扫不扫。
 *
 * @param path - 包内相对路径。
 * @returns 扫就是 true。
 */
export function isScannableTextFile(path: string): boolean {
  const lower = path.toLowerCase()
  const ext = lower.includes('.') ? lower.split('.').pop() ?? '' : ''
  return TEXT_EXTENSIONS.has(ext)
}

/** 一条命中。 */
export interface ScanFinding {
  /** 规则 id，与上游一致。 */
  readonly rule: string
  readonly severity: RiskSeverity
  /** kebab-case 的分类标识，界面上再翻成人话。 */
  readonly category: string
  /** 这条规则在说什么。 */
  readonly description: string
  /** 包内相对路径。 */
  readonly path: string
  /** 1 起的行号；跨行匹配定位不到具体某一行时没有这一项。 */
  readonly line?: number
  /** 命中的这一段是从藏起来的文本里解出来的，这里说它是怎么解出来的。 */
  readonly recovery?: string
}

/** 一个检测面的结论。 */
export interface ScanCategory {
  /** kebab-case 的分类标识。 */
  readonly id: string
  /** 这一面上命中了几条。 */
  readonly hits: number
  /** 这一面上最高的那一档；没命中时没有这一项。 */
  readonly severity?: RiskSeverity
}

/** 一次扫描的结果。 */
export interface ScanReport {
  readonly findings: readonly ScanFinding[]
  /** 实际扫了几个文件。 */
  readonly scanned: number
  /** 跳过几个：二进制、不认识的扩展名、或者太大。 */
  readonly skipped: number
  /** 这一包里最高的那一档严重度；一条都没命中时没有这一项。 */
  readonly severity?: RiskSeverity
  /** 规则命中评分，见 {@link scoreOf}。 */
  readonly score: number
  /** 八个检测面各自的结论，顺序固定，没命中的也在里面。 */
  readonly categories: readonly ScanCategory[]
}

/** 送进来扫的一个文件。 */
export interface ScanInput {
  readonly path: string
  readonly data: Uint8Array
}

/**
 * 扫一批文件。
 *
 * @param files - 要扫的文件，路径是包内相对路径。
 * @returns 扫描结果。
 */
export function scanFiles(files: readonly ScanInput[]): ScanReport {
  const findings: ScanFinding[] = []
  let scanned = 0
  let skipped = 0

  for (const file of files) {
    if (!isScannableTextFile(file.path) || file.data.byteLength > MAX_SCAN_BYTES) {
      skipped += 1
      continue
    }
    const text = decodeText(file.data)
    if (text === undefined) {
      // 扩展名说是文本、内容却不是合法 UTF-8。规则表匹的是文字，对着一堆
      // 乱码匹没有意义，所以算跳过而不是算扫过。
      skipped += 1
      continue
    }
    scanned += 1
    collect(file.path, text, undefined, findings)

    const hidden = recoverMojibake(text)
    if (hidden !== undefined) {
      findings.push({
        rule: CHARSET_SMUGGLING_RULE,
        severity: 'HIGH',
        category: 'obfuscation',
        description: `藏了一段要再解一次码才读得出来的内容（${hidden.recovery}）`,
        path: file.path,
        recovery: hidden.recovery,
      })
      collect(file.path, hidden.text, hidden.recovery, findings)
    }
  }

  const severity = highestSeverity(findings)
  return {
    findings,
    scanned,
    skipped,
    ...severity === undefined ? {} : { severity },
    score: scoreOf(findings),
    categories: categoriesOf(findings),
  }
}

/**
 * 八个检测面。顺序固定，界面按这个顺序摆。
 *
 * 就是规则表里出现过的那些 `category`，外加字符集夹带落在的 `obfuscation`。
 * 写成一张明表而不是从规则表里现算：这一格摆在界面上是「查了哪几方面」，
 * 少一条规则不该让某一面整个消失。
 */
export const SCAN_CATEGORIES: readonly string[] = [
  'remote-payload',
  'credential-access',
  'reconnaissance',
  'prompt-injection',
  'remote-control',
  'obfuscation',
  'data-exfiltration',
  'persistence',
]

/**
 * 每个检测面上命中了什么。
 *
 * @param findings - 命中。
 * @returns 八个检测面的结论，没命中的也在里面。
 */
export function categoriesOf(findings: readonly ScanFinding[]): readonly ScanCategory[] {
  return SCAN_CATEGORIES.map((id) => {
    const mine = findings.filter(one => one.category === id)
    const severity = highestSeverity(mine)
    return {
      id,
      hits: mine.length,
      ...severity === undefined ? {} : { severity },
    }
  })
}

/** 每一档扣多少分。 */
const SEVERITY_PENALTY: Record<RiskSeverity, number> = {
  CRITICAL: 30,
  HIGH: 18,
  MEDIUM: 8,
  LOW: 3,
  INFO: 1,
}

/**
 * 一个 0–100 的分数。
 *
 * **按命中的规则种类扣，不按命中次数扣。** 一条越狱语料库里 `prompt_injection`
 * 可以命中几十次，那说明的仍然是同一件事；按次数扣的话，分数变成「这个包里
 * 有多少个文件」的函数，而不是「它做了什么」的函数。
 *
 * 这个分**不是安全结论**。规则是正则，命中只说明「长得像」，没命中也只说明
 * 这十三条没匹上。它的用处是把一批技能排个先后，决定先看哪一个。
 *
 * @param findings - 命中。
 * @returns 0 到 100。
 */
export function scoreOf(findings: readonly ScanFinding[]): number {
  const worst = new Map<string, RiskSeverity>()
  for (const finding of findings) {
    const seen = worst.get(finding.rule)
    if (seen === undefined || SEVERITY_ORDER.indexOf(finding.severity) < SEVERITY_ORDER.indexOf(seen)) {
      worst.set(finding.rule, finding.severity)
    }
  }
  let score = 100
  for (const severity of worst.values()) score -= SEVERITY_PENALTY[severity]
  return Math.max(0, score)
}

/**
 * 一批命中里最高的那一档。
 *
 * @param findings - 命中。
 * @returns 最高严重度；一条都没有时 `undefined`。
 */
export function highestSeverity(
  findings: readonly ScanFinding[],
): RiskSeverity | undefined {
  let best: RiskSeverity | undefined
  for (const finding of findings) {
    if (best === undefined || SEVERITY_ORDER.indexOf(finding.severity) < SEVERITY_ORDER.indexOf(best)) {
      best = finding.severity
    }
  }
  return best
}

/**
 * 拿规则表匹一份文本。
 *
 * 先整份匹一次——跨行规则本来就跨行；命中之后再逐行找一遍，找得到就报行号。
 */
function collect(
  path: string,
  content: string,
  recovery: string | undefined,
  into: ScanFinding[],
): void {
  let lines: readonly string[] | undefined
  for (const rule of RISK_RULES) {
    if (!rule.pattern.test(content)) continue
    lines ??= content.split(/\r\n|[\r\n]/u)
    const line = firstMatchingLine(rule, lines)
    into.push({
      rule: rule.id,
      severity: rule.severity,
      category: rule.category,
      description: rule.description,
      path,
      ...line === undefined ? {} : { line },
      ...recovery === undefined ? {} : { recovery },
    })
  }
}

/** 第一条能单独匹上这条规则的行；跨行匹配定位不到时 `undefined`。 */
function firstMatchingLine(rule: RiskRule, lines: readonly string[]): number | undefined {
  for (const [index, line] of lines.entries()) {
    if (rule.pattern.test(line)) return index + 1
  }
  return undefined
}

/** 一次成功的还原。 */
export interface Recovered {
  /** 还原出来的文本。 */
  readonly text: string
  /** 怎么还原的，例如 `utf-16le -> utf-8`。 */
  readonly recovery: string
}

/** 控制字符占比超过这个数就当它不是文本。 */
const MAX_CONTROL_RATIO = 0.02

/** 还原之后可读字符的占比至少要涨这么多，才算「本来就是藏起来的」。 */
const MIN_READABILITY_GAIN = 0.25

/**
 * 还原可逆乱码：盘上是合法 UTF-8，按 UTF-16 重新编码再当 UTF-8 解，却能解出
 * 另一段读得通的文字——那多半是故意藏进去的。
 *
 * 包校验已经把非 UTF-8 的文本文件挡在外面了，这是剩下的那条字符集夹带通道。
 *
 * @param stored - 盘上那份文本。
 * @returns 还原结果；不是可逆乱码时 `undefined`。
 */
export function recoverMojibake(stored: string): Recovered | undefined {
  if (stored === '' || isAscii(stored)) return undefined
  // 带格式控制符或私用区码点的，本来就可疑，不要求可读性涨那么多。
  const suspicious = hasFormatOrPrivateUse(stored)
  for (const source of ['utf-16le', 'utf-16be'] as const) {
    const recovered = reinterpret(stored, source)
    if (recovered === undefined || recovered === stored || recovered.trim() === '') continue
    if (!isLikelyText(recovered)) continue
    if (suspicious || asciiRatio(recovered) - asciiRatio(stored) >= MIN_READABILITY_GAIN) {
      return { text: recovered, recovery: `${source} -> utf-8` }
    }
  }
  return undefined
}

/**
 * 按 `source` 重新编码，再当 UTF-8 解。
 *
 * 两头都要求严格：编码不下的、解不出来的都直接放弃，而不是拿替换字符糊过去——
 * 糊过去会把一份普通文件解成一堆问号，然后被当成「藏了东西」。
 */
function reinterpret(stored: string, source: 'utf-16le' | 'utf-16be'): string | undefined {
  const units = new Uint8Array(stored.length * 2)
  for (let index = 0; index < stored.length; index += 1) {
    const code = stored.charCodeAt(index)
    // 落单的代理项在 UTF-16 里是非法序列，Java 那边的编码器会直接报错。
    if (code >= 0xd800 && code <= 0xdfff && !isPaired(stored, index)) return undefined
    const high = code >> 8
    const low = code & 0xff
    if (source === 'utf-16le') {
      units[index * 2] = low
      units[index * 2 + 1] = high
    } else {
      units[index * 2] = high
      units[index * 2 + 1] = low
    }
  }
  return decodeStrict(units)
}

const utf8 = new TextDecoder('utf-8', { fatal: true })

/**
 * 严格解一段 UTF-8。
 *
 * 不能拿 `decodeText` 代替：那一版先挡 NUL 字节（技能包里的图片、字体都靠这个
 * 判出来），而 UTF-16 编码出来的 ASCII 字符正好每隔一个字节就是 0x00——用它
 * 的话这条通道永远探不出东西来。
 */
function decodeStrict(data: Uint8Array): string | undefined {
  try {
    return utf8.decode(data)
  } catch {
    return undefined
  }
}

/** 这个位置上的代理项有没有配对。 */
function isPaired(text: string, index: number): boolean {
  const code = text.charCodeAt(index)
  if (code >= 0xd800 && code <= 0xdbff) {
    const next = text.charCodeAt(index + 1)
    return next >= 0xdc00 && next <= 0xdfff
  }
  const previous = text.charCodeAt(index - 1)
  return previous >= 0xd800 && previous <= 0xdbff
}

/**
 * 这段东西读起来像不像文本：控制字符、代理项、未分配码点合起来不超过 2%，
 * 制表符与换行不算。
 *
 * @param text - 待判断的文本。
 * @returns 像文本就是 true。
 */
export function isLikelyText(text: string): boolean {
  if (text === '') return true
  let total = 0
  let controls = 0
  for (const char of text) {
    total += 1
    if (char === '\n' || char === '\r' || char === '\t') continue
    if (isControlLike(char)) controls += 1
  }
  return controls / total <= MAX_CONTROL_RATIO
}

/** 控制字符或落单代理项。 */
function isControlLike(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return true
  return code >= 0xd800 && code <= 0xdfff
}

/** 可打印 ASCII 的占比。 */
function asciiRatio(text: string): number {
  if (text === '') return 0
  let total = 0
  let readable = 0
  for (const char of text) {
    total += 1
    const code = char.codePointAt(0) ?? 0
    if (code === 0x0a || code === 0x0d || code === 0x09 || (code >= 0x20 && code <= 0x7e)) readable += 1
  }
  return readable / total
}

/** 全是 ASCII。 */
function isAscii(text: string): boolean {
  for (const char of text) {
    if ((char.codePointAt(0) ?? 0) >= 128) return false
  }
  return true
}

/** 带格式控制符或私用区码点。这两类正常文档里几乎不会出现。 */
function hasFormatOrPrivateUse(text: string): boolean {
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    // Cf：零宽连接符、方向标记这一类；Co：私用区。
    if (code === 0xad || (code >= 0x200b && code <= 0x200f) || (code >= 0x202a && code <= 0x202e)
      || (code >= 0x2060 && code <= 0x2064) || code === 0xfeff
      || (code >= 0xe000 && code <= 0xf8ff)
      || (code >= 0xf0000 && code <= 0x10fffd)) {
      return true
    }
  }
  return false
}
