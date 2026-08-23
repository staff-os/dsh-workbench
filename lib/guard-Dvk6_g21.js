import { HarnessError } from "@deepseek-ai/dsh-llm";
//#region .tsbuild/types.js
/**
* 工作台各域共享的词汇表。
* @module @staff-os/dsh-workbench/types
*/
/** 带机器可路由 `code` 的工作台错误。 */
var WorkbenchError = class extends HarnessError {};
/**
* 破坏性动作缺少 `confirm: true` 时抛出的错误码。
*
* 模型误删的代价远高于多问一句，所以删除类动作一律要求显式确认，
* 而不是靠工具描述里写「请谨慎」。
*/
const CONFIRM_REQUIRED = "WORKBENCH_CONFIRM_REQUIRED";
/**
* 校验破坏性动作的确认位。
* @param confirmed - 调用方传入的 `confirm` 参数。
* @param what - 出现在错误信息里的动作描述。
*/
function requireConfirm(confirmed, what) {
	if (confirmed === true) return;
	throw new WorkbenchError(`${what} 是不可逆操作，请在确认后重新调用并传入 confirm: true`, CONFIRM_REQUIRED);
}
/** 中止信号已触发时抛出。 */
function throwIfAborted(signal) {
	if (signal?.aborted === true) throw new WorkbenchError("工作台操作已取消", "WORKBENCH_ABORTED", { cause: signal.reason });
}
/** 判断一个异常是否为 fetch 的中止错误。 */
function isAbortError(error) {
	return error instanceof DOMException && error.name === "AbortError";
}
/**
* 取一个条目的文本内容；二进制条目给 `undefined`。
*
* 解析 SKILL.md、判断包形状这些事只对文本成立，用这个收口，
* 免得每个调用点各写一次 `typeof === 'string'`。
*/
function packageFileText(file) {
	return typeof file.content === "string" ? file.content : void 0;
}
/** 一个条目落盘后占多少字节。 */
function packageFileBytes(file) {
	return typeof file.content === "string" ? Buffer.byteLength(file.content, "utf8") : file.content.byteLength;
}
//#endregion
//#region .tsbuild/archive/guard.js
/**
* 解包安全边界：路径穿越与解压炸弹的统一防线。
*
* 技能包和插件包都来自外部——市场下载、用户给的 zip、GitHub 仓库——
* 所以「包里写什么就往盘上落什么」是不能接受的。这里的检查在**解压之前**
* 拦掉恶意条目，zip/tar 两条路径共用同一套判定，避免两边规则漂移。
* @module @staff-os/dsh-workbench/archive/guard
*/
/** 单个包内最多多少个条目。 */
const MAX_ENTRIES = 2e3;
/** 单个文件解压后的体积上限。 */
const MAX_FILE_BYTES = 5242880;
/** 整包解压后的体积上限。 */
const MAX_TOTAL_BYTES = 52428800;
/** 解包被安全策略拒绝时的错误码。 */
const UNSAFE_ARCHIVE = "WORKBENCH_UNSAFE_ARCHIVE";
/** 抛出一个解包安全错误。 */
function unsafe(reason) {
	return new WorkbenchError(`包内容不安全，已拒绝导入：${reason}`, UNSAFE_ARCHIVE);
}
/**
* 判断一个包内路径是否可以安全落盘。
*
* 拒绝四类：绝对路径（含 Windows 盘符与 UNC）、含 `..` 段、含 NUL 字节、空路径。
* 注意判定在**按分隔符切段之后**做，`..` 不能只用 `includes` 判——
* 那样 `a..b/c` 这种合法名字会被误杀，而 `foo/../../etc` 反而要拦住。
*/
function isSafeEntryPath(raw) {
	if (raw === "" || raw.includes("\0")) return false;
	const path = raw.replace(/\\/gu, "/");
	if (path.startsWith("/") || /^[A-Za-z]:/u.test(path)) return false;
	return !path.split("/").includes("..");
}
/** 校验路径，不安全就抛。 */
function assertSafeEntryPath(raw) {
	if (!isSafeEntryPath(raw)) throw unsafe(`非法条目路径 "${raw}"`);
}
/**
* 解压体积预算。
*
* 解压炸弹的要害是「声明体积很小、实际解出来很大」，所以声明值和实际值
* 都要过一遍这个预算：调用方先用 header 里的声明体积探一次（便宜，能在
* 分配内存前就拒绝），解出来后再用真实长度记一次账。
*/
var ExtractBudget = class {
	entries = 0;
	total = 0;
	/**
	* 记一个条目。
	* @param bytes - 该条目的体积（声明值或实际值）。
	*/
	add(path, bytes) {
		this.entries += 1;
		if (this.entries > 2e3) throw unsafe(`条目数超过 ${String(MAX_ENTRIES)}`);
		if (bytes > 5242880) throw unsafe(`"${path}" 解压后 ${String(bytes)} 字节，超过单文件上限 ${String(MAX_FILE_BYTES)}`);
		this.total += bytes;
		if (this.total > 52428800) throw unsafe(`整包解压后超过 ${String(MAX_TOTAL_BYTES)} 字节`);
	}
	/** 只检查不记账，用于解压前的声明体积预检。 */
	peek(path, bytes) {
		if (bytes > 5242880) throw unsafe(`"${path}" 声明体积 ${String(bytes)} 字节，超过单文件上限 ${String(MAX_FILE_BYTES)}`);
		if (this.total + bytes > 52428800) throw unsafe(`整包声明体积超过 ${String(MAX_TOTAL_BYTES)} 字节`);
	}
};
const utf8 = new TextDecoder("utf-8", { fatal: true });
/**
* 把条目内容解成文本；二进制返回 `undefined` 由调用方跳过。
*
* 先看 NUL 字节：技能包里的图片、字体、编译产物都会命中，比让 TextDecoder
* 抛异常再兜要快得多，也不会把合法的非 UTF-8 文本误判成二进制。
*/
function decodeText(data) {
	if (data.includes(0)) return void 0;
	try {
		return utf8.decode(data);
	} catch {
		return;
	}
}
/** 归一包内路径分隔符。 */
function normalizeEntryPath(raw) {
	return raw.replace(/\\/gu, "/");
}
//#endregion
export { throwIfAborted as _, UNSAFE_ARCHIVE as a, isSafeEntryPath as c, CONFIRM_REQUIRED as d, WorkbenchError as f, requireConfirm as g, packageFileText as h, MAX_TOTAL_BYTES as i, normalizeEntryPath as l, packageFileBytes as m, MAX_ENTRIES as n, assertSafeEntryPath as o, isAbortError as p, MAX_FILE_BYTES as r, decodeText as s, ExtractBudget as t, unsafe as u };
