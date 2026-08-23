/**
 * 技能市场配置的持久化：ClawHub 兼容市场的根地址与凭据引用。
 *
 * 与安装台账（{@link module:@staff-os/dsh-workbench/skill/ledger}）一样落在本插件
 * 自己的目录下，而不是写进 Cordis 配置——Cordis 配置是启动时读的静态文件，
 * 运行时改不了；而市场配置是用户在界面上一条条加减的，要能即时生效。
 *
 * 配置改完不需要重启：`RegistryClient` 每次请求都从这里取最新的源列表，
 * 而不是构造时缓存一份。凭据引用名（`apiKeyEnv`）由凭据服务解析，
 * 这里只存引用名，不存明文。
 *
 * @module @staff-os/dsh-workbench/skill/market-config
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { writeFileAtomic } from '@deepseek-ai/dsh-atomic-write'
import { DIR_MODE, FILE_MODE } from '../paths.ts'
import type { RegistrySource } from '../types.ts'

/** 市场配置文件名，落在工作台自己的目录下。 */
export const MARKET_CONFIG_FILE = 'market.json'

/** 配置文件的形状。 */
interface MarketConfigFile {
  readonly version: 1
  readonly registries: readonly RegistrySource[]
}

/** 配置文件的绝对路径。 */
export function marketConfigPath(workbenchDir: string): string {
  return join(workbenchDir, MARKET_CONFIG_FILE)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 把一条源从 JSON 还原；形状不对时丢掉这一条而不是整个配置。 */
function parseSource(raw: unknown): RegistrySource | undefined {
  if (!isRecord(raw)) return undefined
  const id = raw.id
  const name = raw.name
  const url = raw.url
  if (typeof id !== 'string' || typeof name !== 'string' || typeof url !== 'string') {
    return undefined
  }
  const flavor = raw.flavor
  const apiKeyEnv = raw.apiKeyEnv
  return {
    id,
    name,
    url,
    ...typeof flavor === 'string' && flavor !== '' ? { flavor: flavor as 'clawhub' | 'skillhub' } : {},
    ...typeof apiKeyEnv === 'string' && apiKeyEnv !== '' ? { apiKeyEnv } : {},
  }
}

/**
 * 读出市场配置。
 *
 * 文件不在、读不动、或者内容坏了，都当作空配置：市场不是必须配的，
 * 出厂自带一条 ClawHub 源，空配置时由调用方回退到那一条。
 */
export async function readMarketConfig(workbenchDir: string): Promise<readonly RegistrySource[]> {
  let raw: string
  try {
    raw = await readFile(marketConfigPath(workbenchDir), 'utf8')
  } catch {
    return []
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.registries)) return []
  return parsed.registries
    .map(parseSource)
    .filter((source): source is RegistrySource => source !== undefined)
}

/** 把市场配置整份写回。 */
export async function writeMarketConfig(
  workbenchDir: string,
  sources: readonly RegistrySource[],
): Promise<void> {
  const file: MarketConfigFile = { version: 1, registries: sources }
  await writeFileAtomic(
    marketConfigPath(workbenchDir),
    `${JSON.stringify(file, undefined, 2)}\n`,
    { mode: FILE_MODE, dirMode: DIR_MODE },
  )
}
