/**
 * 工作台在 `$DSH_HOME` 下的目录布局。
 *
 * 全部状态落本地文件，没有数据库：知识库是目录，技能是 DSH 原生的 skill 根，
 * MCP 是 profile 的 patch 层，AI 员工是 DSH 原生的 preset 目录。
 * 只有知识库和缓存是本插件自己新开的地盘。
 * @module @staff-os/dsh-workbench/paths
 */

import { join } from 'node:path'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'

/** 本插件自有数据的根目录名，挂在 `$DSH_HOME` 下。 */
export const WORKBENCH_DIR = 'workbench'

/** 用户级技能根目录名；与 `dsh-skill-filesystem` 扫描的 `user-dsh` 根一致。 */
export const SKILLS_DIR = 'skills'

/** profile 目录的父目录名。 */
export const PROFILES_DIR = 'profiles'

/** profile 自有 patch 层的文件名；MCP 行就写在这里。 */
export const PROFILE_PATCH_FILE = 'cordis.patch.yml'

/** 解析后的工作台路径集合。 */
export interface WorkbenchPaths {
  /** `$DSH_HOME`。 */
  readonly home: string
  /** 知识库根目录。 */
  readonly knowledge: string
  /** 市场结果的离线缓存目录。 */
  readonly cache: string
  /** 本插件自有数据的根；已安装技能的来源台账落在这里。 */
  readonly workbench: string
  /** 用户级技能根目录（技能写入落这里）。 */
  readonly skills: string
  /**
   * 装包时的暂存目录，**刻意不在技能根之内**。
   *
   * `dsh-skill-filesystem` 扫描技能根时只跳过 `.system` 一个名字，别的点开头
   * 目录照收；chokidar 也不忽略它们。把暂存目录建在技能根下，DSH 会把半成品
   * 当成一个真技能扫进去，而且它排在正式目录前面（`.` 小于字母），同 rank
   * 时先入者胜——安装失败留下的残骸会持续遮蔽同名技能，界面上还看不见。
   *
   * 放在 `$DSH_HOME` 下的另一处，既躲开扫描，又与技能根同盘，
   * 最后那一步 rename 仍然是原子的。
   */
  readonly skillStaging: string
  /** 目标 profile 的目录。 */
  readonly profile: string
  /** 目标 profile 的 patch 文件。 */
  readonly profilePatch: string
}

/**
 * 解析工作台用到的全部路径。
 * @param profile - 目标 profile 名，MCP 与插件管理都作用于它。
 * @param dshHome - 覆盖 `$DSH_HOME`；留空走 `resolveDshHome()`。
 */
export function resolvePaths(profile: string, dshHome?: string): WorkbenchPaths {
  const home = resolveDshHome(dshHome)
  const profileDir = join(home, PROFILES_DIR, profile)
  return {
    home,
    workbench: join(home, WORKBENCH_DIR),
    knowledge: join(home, WORKBENCH_DIR, 'knowledge'),
    cache: join(home, WORKBENCH_DIR, 'cache'),
    skills: join(home, SKILLS_DIR),
    skillStaging: join(home, WORKBENCH_DIR, 'staging'),
    profile: profileDir,
    profilePatch: join(profileDir, PROFILE_PATCH_FILE),
  }
}

/** 文件权限：patch 与知识库可能含 token 或企业内容，一律 owner-only。 */
export const FILE_MODE = 0o600

/** 目录权限：同上。 */
export const DIR_MODE = 0o700
