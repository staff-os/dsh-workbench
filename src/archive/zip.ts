/**
 * ZIP 包读取。市场 download 端点返回的就是 ZIP，用户手工导入的技能包也多是 ZIP。
 * @module @staff-os/dsh-workbench/archive/zip
 */

import AdmZip from 'adm-zip'
import { assertSafeEntryPath, decodeText, ExtractBudget, normalizeEntryPath, unsafe } from './guard.ts'
import type { PackageFile } from '../types.ts'

/**
 * 读出 ZIP 内的全部条目。
 *
 * 顺序很关键：先校验路径、再用 header 里的**声明**体积过一遍预算，
 * 最后才 `getData()` 真正解压并用实际长度记账。声明值可以撒谎，
 * 所以两道都要走——只信声明值挡不住炸弹，只看实际值又得先把炸弹解出来。
 *
 * 二进制条目按原始字节保留而不是丢掉：技能包里带图、带 PDF、带模板都很正常，
 * 而技能的资源目录就是模型按正文里的相对路径去读的那个目录——少一个文件，
 * 表现是技能「时灵时不灵」，且盘上看不出哪里不对。
 */
export function readZipFiles(data: Buffer): PackageFile[] {
  let zip: AdmZip
  try {
    zip = new AdmZip(data)
  } catch (error: unknown) {
    throw unsafe(`ZIP 无法解析（${String(error)}）`)
  }

  const budget = new ExtractBudget()
  const files: PackageFile[] = []
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue
    const path = normalizeEntryPath(entry.entryName)
    assertSafeEntryPath(path)
    budget.peek(path, entry.header.size)

    let raw: Buffer
    try {
      raw = entry.getData()
    } catch (error: unknown) {
      throw unsafe(`条目 "${path}" 解压失败（${String(error)}）`)
    }
    budget.add(path, raw.length)

    const content = decodeText(raw)
    // getData() 每次返回新 Buffer，直接留用不会与解压器共享缓冲。
    files.push({ path, content: content ?? raw })
  }
  return files
}
