import { n as __require, t as __commonJSMin } from "./rolldown-runtime-CMFfr-1z.js";
import { _ as throwIfAborted, a as UNSAFE_ARCHIVE, c as isSafeEntryPath, d as CONFIRM_REQUIRED, f as WorkbenchError, g as requireConfirm, h as packageFileText, i as MAX_TOTAL_BYTES, l as normalizeEntryPath, m as packageFileBytes, n as MAX_ENTRIES, o as assertSafeEntryPath, p as isAbortError, r as MAX_FILE_BYTES, s as decodeText } from "./guard-Dvk6_g21.js";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment";
import { Service } from "@deepseek-ai/cordis";
import { createHash } from "node:crypto";
import { access, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve, sep } from "node:path";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";
import { withFileLock, writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { METADATA_FILE, renderPresetMetadata } from "@deepseek-ai/dsh-agent-presets";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { spawn } from "node:child_process";
import { constants } from "node:fs";
//#region node_modules/.pnpm/@deepseek-ai+cosmokit@1.8.2/node_modules/@deepseek-ai/cosmokit/lib/index.js
/** Return true when a value is `null` or `undefined`. */
function isNullable(value) {
	return value === null || value === void 0;
}
/** Return true for non-array object values. */
function isPlainObject(data) {
	return data && typeof data === "object" && !Array.isArray(data);
}
/** Filter object entries and return a new object. */
function filterKeys(object, filter) {
	return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
}
/** Map object values while preserving the original key set. */
function mapValues(object, transform) {
	return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
}
/** Pick selected keys from an object, optionally including `undefined` values. */
function pick(source, keys, forced) {
	if (!keys) return { ...source };
	const result = {};
	for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
	return result;
}
/** Test values using `instanceof` with a `toStringTag` fallback. */
function is(type, value) {
	if (arguments.length === 1) return (value) => is(type, value);
	return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
}
function isArrayBufferLike(value) {
	return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
}
function isArrayBufferSource(value) {
	return isArrayBufferLike(value) || ArrayBuffer.isView(value);
}
/** Binary source detection and base64/hex conversion helpers. */
var Binary;
(function(Binary) {
	Binary.is = isArrayBufferLike;
	Binary.isSource = isArrayBufferSource;
	function fromSource(source) {
		if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
		else return source;
	}
	Binary.fromSource = fromSource;
	function toBase64(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
		let binary = "";
		const bytes = new Uint8Array(source);
		for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	}
	Binary.toBase64 = toBase64;
	function fromBase64(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
		return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
	}
	Binary.fromBase64 = fromBase64;
	function toHex(source) {
		source = fromSource(source);
		if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
		return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
	}
	Binary.toHex = toHex;
	function fromHex(source) {
		if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
		const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
		const buffer = [];
		for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
		return Uint8Array.from(buffer).buffer;
	}
	Binary.fromHex = fromHex;
})(Binary || (Binary = {}));
Binary.fromBase64;
Binary.toBase64;
Binary.fromHex;
Binary.toHex;
/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
function clone(source, refs = /* @__PURE__ */ new Map()) {
	if (!source || typeof source !== "object") return source;
	if (is("Date", source)) return new Date(source.valueOf());
	if (is("RegExp", source)) return new RegExp(source.source, source.flags);
	if (isArrayBufferLike(source)) return source.slice(0);
	if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
	const cached = refs.get(source);
	if (cached) return cached;
	if (Array.isArray(source)) {
		const result = [];
		refs.set(source, result);
		source.forEach((value, index) => {
			result[index] = Reflect.apply(clone, null, [value, refs]);
		});
		return result;
	}
	const result = Object.create(Object.getPrototypeOf(source));
	refs.set(source, result);
	for (const key of Reflect.ownKeys(source)) {
		const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
		if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
		Reflect.defineProperty(result, key, descriptor);
	}
	return result;
}
/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
function deepEqual(a, b, strict) {
	if (a === b) return true;
	if (!strict && isNullable(a) && isNullable(b)) return true;
	if (typeof a !== typeof b) return false;
	if (typeof a !== "object") return false;
	if (!a || !b) return false;
	function check(test, then) {
		return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
	}
	return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
		if (a.byteLength !== b.byteLength) return false;
		const viewA = new Uint8Array(a);
		const viewB = new Uint8Array(b);
		for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
		return true;
	}) ?? Object.keys({
		...a,
		...b
	}).every((key) => deepEqual(a[key], b[key], strict));
}
/** Time constants plus parsing and formatting helpers. */
var Time;
(function(Time) {
	Time.millisecond = 1;
	Time.second = 1e3;
	Time.minute = Time.second * 60;
	Time.hour = Time.minute * 60;
	Time.day = Time.hour * 24;
	Time.week = Time.day * 7;
	let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
	function setTimezoneOffset(offset) {
		timezoneOffset = offset;
	}
	Time.setTimezoneOffset = setTimezoneOffset;
	function getTimezoneOffset() {
		return timezoneOffset;
	}
	Time.getTimezoneOffset = getTimezoneOffset;
	function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
		if (typeof date === "number") date = new Date(date);
		if (offset === void 0) offset = timezoneOffset;
		return Math.floor((date.valueOf() / Time.minute - offset) / 1440);
	}
	Time.getDateNumber = getDateNumber;
	function fromDateNumber(value, offset) {
		const date = new Date(value * Time.day);
		if (offset === void 0) offset = timezoneOffset;
		return new Date(+date + offset * Time.minute);
	}
	Time.fromDateNumber = fromDateNumber;
	const numeric = /\d+(?:\.\d+)?/.source;
	const timeRegExp = new RegExp(`^${[
		"w(?:eek(?:s)?)?",
		"d(?:ay(?:s)?)?",
		"h(?:our(?:s)?)?",
		"m(?:in(?:ute)?(?:s)?)?",
		"s(?:ec(?:ond)?(?:s)?)?"
	].map((unit) => `(${numeric}${unit})?`).join("")}$`);
	function parseTime(source) {
		const capture = timeRegExp.exec(source);
		if (!capture) return 0;
		return (parseFloat(capture[1]) * Time.week || 0) + (parseFloat(capture[2]) * Time.day || 0) + (parseFloat(capture[3]) * Time.hour || 0) + (parseFloat(capture[4]) * Time.minute || 0) + (parseFloat(capture[5]) * Time.second || 0);
	}
	Time.parseTime = parseTime;
	function parseDate(date) {
		const parsed = parseTime(date);
		if (parsed) date = Date.now() + parsed;
		else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
		else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
		return date ? new Date(date) : /* @__PURE__ */ new Date();
	}
	Time.parseDate = parseDate;
	function format(ms) {
		const abs = Math.abs(ms);
		if (abs >= Time.day - Time.hour / 2) return Math.round(ms / Time.day) + "d";
		else if (abs >= Time.hour - Time.minute / 2) return Math.round(ms / Time.hour) + "h";
		else if (abs >= Time.minute - Time.second / 2) return Math.round(ms / Time.minute) + "m";
		else if (abs >= Time.second) return Math.round(ms / Time.second) + "s";
		return ms + "ms";
	}
	Time.format = format;
	function toDigits(source, length = 2) {
		return source.toString().padStart(length, "0");
	}
	Time.toDigits = toDigits;
	function template(template, time = /* @__PURE__ */ new Date()) {
		return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
	}
	Time.template = template;
})(Time || (Time = {}));
//#endregion
//#region node_modules/.pnpm/@deepseek-ai+schemastery@3.18.1/node_modules/@deepseek-ai/schemastery/lib/index.mjs
const kSchema = Symbol.for("schemastery");
const kValidationError = Symbol.for("ValidationError");
globalThis.__schemastery_index__ ??= 0;
globalThis.__schemastery_refs__ = void 0;
var ValidationError = class extends TypeError {
	options;
	name = "ValidationError";
	constructor(message, options) {
		let prefix = "$";
		for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
		else if (typeof segment === "number") prefix += "[" + segment + "]";
		else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
		if (prefix.startsWith(".")) prefix = prefix.slice(1);
		super((prefix === "$" ? "" : `${prefix} `) + message);
		this.options = options;
	}
	static is(error) {
		return !!error?.[kValidationError];
	}
};
Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
const Schema = function(options) {
	const schema = function(data, options = {}) {
		return Schema.resolve(data, schema, options)[0];
	};
	if (options.refs) {
		const refs = mapValues(options.refs, (options) => new Schema(options));
		const getRef = (uid) => refs[uid];
		for (const key in refs) {
			const options = refs[key];
			options.sKey = getRef(options.sKey);
			options.inner = getRef(options.inner);
			options.list = options.list && options.list.map(getRef);
			options.dict = options.dict && mapValues(options.dict, getRef);
		}
		return refs[options.uid];
	}
	Object.assign(schema, options);
	if (typeof schema.callback === "string") try {
		schema.callback = new Function("return " + schema.callback)();
	} catch {}
	Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
	Object.setPrototypeOf(schema, Schema.prototype);
	schema.meta ||= {};
	schema.toString = schema.toString.bind(schema);
	return schema;
};
Schema.prototype = Object.create(Function.prototype);
Schema.prototype[kSchema] = true;
Object.defineProperty(Schema.prototype, "~standard", { get() {
	return {
		version: 1,
		vendor: "schemastery",
		validate: (value) => {
			try {
				return { value: Schema.resolve(value, this, {})[0] };
			} catch (error) {
				if (ValidationError.is(error)) return { issues: [{
					message: error.message,
					path: error.options.path
				}] };
				throw error;
			}
		}
	};
} });
Schema.ValidationError = ValidationError;
Schema.prototype.toJSON = function toJSON() {
	if (globalThis.__schemastery_refs__) {
		globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
		return this.uid;
	}
	globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
	globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
	const result = {
		uid: this.uid,
		refs: globalThis.__schemastery_refs__
	};
	globalThis.__schemastery_refs__ = void 0;
	return result;
};
Schema.prototype.set = function set(key, value) {
	this.dict[key] = value;
	return this;
};
Schema.prototype.push = function push(value) {
	this.list.push(value);
	return this;
};
function mergeDesc(original, messages) {
	const result = typeof original === "string" ? { "": original } : { ...original };
	for (const locale in messages) {
		const value = messages[locale];
		if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
		else if (typeof value === "string") result[locale] = value;
	}
	return result;
}
function getInner(value) {
	return value?.$value ?? value?.$inner;
}
function extractKeys(data) {
	return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
}
Schema.prototype.i18n = function i18n(messages) {
	const schema = Schema(this);
	const desc = mergeDesc(schema.meta.description, messages);
	if (Object.keys(desc).length) schema.meta.description = desc;
	if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
		return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
	});
	if (schema.list) schema.list = schema.list.map((inner, index) => {
		return inner.i18n(mapValues(messages, (data = {}) => {
			if (Array.isArray(getInner(data))) return getInner(data)[index];
			if (Array.isArray(data)) return data[index];
			return extractKeys(data);
		}));
	});
	if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
		if (getInner(data)) return getInner(data);
		return extractKeys(data);
	}));
	if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
	return schema;
};
Schema.prototype.extra = function extra(key, value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
};
for (const key of [
	"required",
	"disabled",
	"collapse",
	"hidden",
	"loose"
]) Object.assign(Schema.prototype, { [key](value = true) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
Schema.prototype.deprecated = function deprecated() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "deprecated",
		type: "danger"
	});
	return schema;
};
Schema.prototype.experimental = function experimental() {
	const schema = Schema(this);
	schema.meta.badges ||= [];
	schema.meta.badges.push({
		text: "experimental",
		type: "warning"
	});
	return schema;
};
Schema.prototype.pattern = function pattern(regexp) {
	const schema = Schema(this);
	const pattern = pick(regexp, ["source", "flags"]);
	schema.meta = {
		...schema.meta,
		pattern
	};
	return schema;
};
Schema.prototype.simplify = function simplify(value) {
	if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
	if (isNullable(value)) return value;
	if (this.type === "object" || this.type === "dict") {
		const result = {};
		for (const key in value) {
			const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
			if (this.type === "dict" || !isNullable(item)) result[key] = item;
		}
		if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
		return result;
	} else if (this.type === "array" || this.type === "tuple") {
		const result = [];
		value.forEach((value, index) => {
			const schema = this.type === "array" ? this.inner : this.list[index];
			const item = schema ? schema.simplify(value) : value;
			result.push(item);
		});
		return result;
	} else if (this.type === "intersect") {
		const result = {};
		for (const item of this.list) Object.assign(result, item.simplify(value));
		return result;
	} else if (this.type === "union") for (const schema of this.list) try {
		Schema.resolve(value, schema, {});
		return schema.simplify(value);
	} catch {}
	return value;
};
Schema.prototype.toString = function toString(inline) {
	return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
};
Schema.prototype.role = function role(role, extra) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		role,
		extra
	};
	return schema;
};
for (const key of [
	"default",
	"link",
	"comment",
	"description",
	"max",
	"min",
	"step"
]) Object.assign(Schema.prototype, { [key](value) {
	const schema = Schema(this);
	schema.meta = {
		...schema.meta,
		[key]: value
	};
	return schema;
} });
const resolvers = {};
Schema.extend = function extend(type, resolve) {
	resolvers[type] = resolve;
};
Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
	if (!schema) return [data];
	if (options.ignore?.(data, schema)) return [data];
	if (isNullable(data) && schema.type !== "lazy") {
		if (schema.meta.required) throw new ValidationError(`missing required value`, options);
		let current = schema;
		let fallback = schema.meta.default;
		while (current?.type === "intersect" && isNullable(fallback)) {
			current = current.list[0];
			fallback = current?.meta.default;
		}
		if (isNullable(fallback)) return [data];
		data = clone(fallback);
	}
	const callback = resolvers[schema.type];
	if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
	try {
		return callback(data, schema, options, strict);
	} catch (error) {
		if (!schema.meta.loose) throw error;
		return [schema.meta.default];
	}
};
Schema.from = function from(source) {
	if (isNullable(source)) return Schema.any();
	else if ([
		"string",
		"number",
		"boolean"
	].includes(typeof source)) return Schema.const(source).required();
	else if (source[kSchema]) return source;
	else if (typeof source === "function") switch (source) {
		case String: return Schema.string().required();
		case Number: return Schema.number().required();
		case Boolean: return Schema.boolean().required();
		case Function: return Schema.function().required();
		default: return Schema.is(source).required();
	}
	else throw new TypeError(`cannot infer schema from ${source}`);
};
Schema.lazy = function lazy(builder) {
	const toJSON = () => {
		if (!schema.inner[kSchema]) {
			schema.inner = schema.builder();
			schema.inner.meta = {
				...schema.meta,
				...schema.inner.meta
			};
		}
		return schema.inner.toJSON();
	};
	const schema = new Schema({
		type: "lazy",
		builder,
		inner: { toJSON }
	});
	return schema;
};
Schema.natural = function natural() {
	return Schema.number().step(1).min(0);
};
Schema.percent = function percent() {
	return Schema.number().step(.01).min(0).max(1).role("slider");
};
Schema.date = function date() {
	return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
		const date = new Date(value);
		if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
		return date;
	}, true)]);
};
Schema.regExp = function regExp(flag = "") {
	return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
		try {
			return new RegExp(value, flag);
		} catch (e) {
			throw new ValidationError(e.message, options);
		}
	}, true)]);
};
Schema.arrayBuffer = function arrayBuffer(encoding) {
	return Schema.union([
		Schema.is(ArrayBuffer),
		Schema.is(SharedArrayBuffer),
		Schema.transform(Schema.any(), (value, options) => {
			if (Binary.isSource(value)) return Binary.fromSource(value);
			throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
		}, true),
		...encoding ? [Schema.transform(Schema.string(), (value, options) => {
			try {
				return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
			} catch (e) {
				throw new ValidationError(e.message, options);
			}
		}, true)] : []
	]);
};
Schema.extend("lazy", (data, schema, options, strict) => {
	if (!schema.inner[kSchema]) {
		schema.inner = schema.builder();
		schema.inner.meta = {
			...schema.meta,
			...schema.inner.meta
		};
	}
	return Schema.resolve(data, schema.inner, options, strict);
});
Schema.extend("any", (data) => {
	return [data];
});
Schema.extend("never", (data, _, options) => {
	throw new ValidationError(`expected nullable but got ${data}`, options);
});
Schema.extend("const", (data, { value }, options) => {
	if (deepEqual(data, value)) return [value];
	throw new ValidationError(`expected ${value} but got ${data}`, options);
});
function checkWithinRange(data, meta, description, options, skipMin = false) {
	const { max = Infinity, min = -Infinity } = meta;
	if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
	if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
}
Schema.extend("string", (data, { meta }, options) => {
	if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
	if (meta.pattern) {
		const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
		if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
	}
	checkWithinRange(data.length, meta, "string length", options);
	return [data];
});
function decimalShift(data, digits) {
	const str = data.toString();
	if (str.includes("e")) return data * Math.pow(10, digits);
	const index = str.indexOf(".");
	if (index === -1) return data * Math.pow(10, digits);
	const frac = str.slice(index + 1);
	const integer = str.slice(0, index);
	if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
	return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
}
function isMultipleOf(data, min, step) {
	step = Math.abs(step);
	if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
	const index = step.toString().indexOf(".");
	const digits = step.toString().slice(index + 1).length;
	return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
}
Schema.extend("number", (data, { meta }, options) => {
	if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
	checkWithinRange(data, meta, "number", options);
	const { step } = meta;
	if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
	return [data];
});
Schema.extend("boolean", (data, _, options) => {
	if (typeof data === "boolean") return [data];
	throw new ValidationError(`expected boolean but got ${data}`, options);
});
Schema.extend("bitset", (data, { bits, meta }, options) => {
	let value = 0, keys = [];
	if (typeof data === "number") {
		value = data;
		for (const key in bits) if (data & bits[key]) keys.push(key);
	} else if (Array.isArray(data)) {
		keys = data;
		for (const key of keys) {
			if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
			if (key in bits) value |= bits[key];
		}
	} else throw new ValidationError(`expected number or array but got ${data}`, options);
	if (value === meta.default) return [value];
	return [value, keys];
});
Schema.extend("function", (data, _, options) => {
	if (typeof data === "function") return [data];
	throw new ValidationError(`expected function but got ${data}`, options);
});
Schema.extend("is", (data, { constructor }, options) => {
	if (typeof constructor === "function") {
		if (data instanceof constructor) return [data];
		throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
	} else {
		if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
		let prototype = Object.getPrototypeOf(data);
		while (prototype) {
			if (prototype.constructor?.name === constructor) return [data];
			prototype = Object.getPrototypeOf(prototype);
		}
		throw new ValidationError(`expected ${constructor} but got ${data}`, options);
	}
});
function property(data, key, schema, options) {
	try {
		const [value, adapted] = Schema.resolve(data[key], schema, {
			...options,
			path: [...options.path || [], key]
		});
		if (adapted !== void 0) data[key] = adapted;
		return value;
	} catch (e) {
		if (!options?.autofix) throw e;
		delete data[key];
		return schema.meta.default;
	}
}
Schema.extend("array", (data, { inner, meta }, options) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
	return [data.map((_, index) => property(data, index, inner, options))];
});
Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in data) {
		let rKey;
		try {
			rKey = Schema.resolve(key, sKey, options)[0];
		} catch (error) {
			if (strict) continue;
			throw error;
		}
		result[rKey] = property(data, key, inner, options);
		data[rKey] = data[key];
		if (key !== rKey) delete data[key];
	}
	return [result];
});
Schema.extend("tuple", (data, { list }, options, strict) => {
	if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
	const result = list.map((inner, index) => property(data, index, inner, options));
	if (strict) return [result];
	result.push(...data.slice(list.length));
	return [result];
});
function merge(result, data) {
	for (const key in data) {
		if (key in result) continue;
		result[key] = data[key];
	}
}
Schema.extend("object", (data, { dict }, options, strict) => {
	if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
	const result = {};
	for (const key in dict) {
		const value = property(data, key, dict[key], options);
		if (!isNullable(value) || key in data) result[key] = value;
	}
	if (!strict) merge(result, data);
	return [result];
});
Schema.extend("union", (data, { list, toString }, options, strict) => {
	const messages = [];
	for (const inner of list) try {
		return Schema.resolve(data, inner, options, strict);
	} catch (error) {
		messages.push(error);
	}
	throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
});
Schema.extend("intersect", (data, { list, toString }, options, strict) => {
	if (!list.length) return [data];
	let result;
	for (const inner of list) {
		const value = Schema.resolve(data, inner, options, true)[0];
		if (isNullable(value)) continue;
		if (isNullable(result)) result = value;
		else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		else if (typeof value === "object") merge(result ??= {}, value);
		else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
	}
	if (!strict && isPlainObject(data)) merge(result, data);
	return [result];
});
Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
	const [result, adapted = data] = Schema.resolve(data, inner, options, true);
	if (preserve) return [callback(result)];
	else return [callback(result), callback(adapted)];
});
const formatters = {};
function defineMethod(name, keys, format) {
	formatters[name] = format;
	Object.assign(Schema, { [name](...args) {
		const schema = new Schema({ type: name });
		keys.forEach((key, index) => {
			switch (key) {
				case "sKey":
					schema.sKey = args[index] ?? Schema.string();
					break;
				case "inner":
					schema.inner = Schema.from(args[index]);
					break;
				case "list":
					schema.list = args[index].map(Schema.from);
					break;
				case "dict":
					schema.dict = mapValues(args[index], Schema.from);
					break;
				case "bits":
					schema.bits = {};
					for (const key in args[index]) {
						if (typeof args[index][key] !== "number") continue;
						schema.bits[key] = args[index][key];
					}
					break;
				case "callback": {
					const callback = schema.callback = args[index];
					callback["toJSON"] ||= () => callback.toString();
					break;
				}
				case "constructor": {
					const constructor = schema.constructor = args[index];
					if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
					break;
				}
				default: schema[key] = args[index];
			}
		});
		if (name === "object" || name === "dict") schema.meta.default = {};
		else if (name === "array" || name === "tuple") schema.meta.default = [];
		else if (name === "bitset") schema.meta.default = 0;
		return schema;
	} });
}
defineMethod("is", ["constructor"], ({ constructor }) => {
	if (typeof constructor === "function") return constructor.name;
	else return constructor;
});
defineMethod("any", [], () => "any");
defineMethod("never", [], () => "never");
defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
defineMethod("string", [], () => "string");
defineMethod("number", [], () => "number");
defineMethod("boolean", [], () => "boolean");
defineMethod("bitset", ["bits"], () => "bitset");
defineMethod("function", [], () => "function");
defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
defineMethod("object", ["dict"], ({ dict }) => {
	if (Object.keys(dict).length === 0) return "{}";
	return `{ ${Object.entries(dict).map(([key, inner]) => {
		return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
	}).join(", ")} }`;
});
defineMethod("union", ["list"], ({ list }, inline) => {
	const result = list.map(({ toString: format }) => format()).join(" | ");
	return inline ? `(${result})` : result;
});
defineMethod("intersect", ["list"], ({ list }) => {
	return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
});
defineMethod("transform", [
	"inner",
	"callback",
	"preserve"
], ({ inner }, isInner) => inner.toString(isInner));
//#endregion
//#region .tsbuild/paths.js
/**
* 工作台在 `$DSH_HOME` 下的目录布局。
*
* 全部状态落本地文件，没有数据库：知识库是目录，技能是 DSH 原生的 skill 根，
* MCP 是 profile 的 patch 层，AI 员工是 DSH 原生的 preset 目录。
* 只有知识库和缓存是本插件自己新开的地盘。
* @module @staff-os/dsh-workbench/paths
*/
/** 本插件自有数据的根目录名，挂在 `$DSH_HOME` 下。 */
const WORKBENCH_DIR = "workbench";
/** 用户级技能根目录名；与 `dsh-skill-filesystem` 扫描的 `user-dsh` 根一致。 */
const SKILLS_DIR = "skills";
/** profile 目录的父目录名。 */
const PROFILES_DIR = "profiles";
/** profile 自有 patch 层的文件名；MCP 行就写在这里。 */
const PROFILE_PATCH_FILE = "cordis.patch.yml";
/**
* 解析工作台用到的全部路径。
* @param profile - 目标 profile 名，MCP 与插件管理都作用于它。
* @param dshHome - 覆盖 `$DSH_HOME`；留空走 `resolveDshHome()`。
*/
function resolvePaths(profile, dshHome) {
	const home = resolveDshHome(dshHome);
	const profileDir = join(home, PROFILES_DIR, profile);
	return {
		home,
		workbench: join(home, WORKBENCH_DIR),
		knowledge: join(home, WORKBENCH_DIR, "knowledge"),
		cache: join(home, WORKBENCH_DIR, "cache"),
		skills: join(home, SKILLS_DIR),
		skillStaging: join(home, WORKBENCH_DIR, "staging"),
		profile: profileDir,
		profilePatch: join(profileDir, PROFILE_PATCH_FILE)
	};
}
//#endregion
//#region .tsbuild/registry.js
/**
* ClawHub 兼容 registry 客户端，技能市场与插件市场共用。
*
* 主力目标是 ClawHub（`https://clawhub.ai`），协议对照它的公开只读 API
* （`docs.openclaw.ai/clawhub/api`）与实测行为。SkillHub（`api.skillhub.cn`）
* 实现了同一批端点的一个子集，差异由下面的 `flavor` 吸收。
*
* ```
* GET /api/v1/search?q=                       搜索，返回 {results:[...]}
* GET /api/v1/skills?limit=&cursor=&sort=     浏览，游标分页，返回 {items:[...]}
* GET /api/v1/skills/{slug}                   详情
* GET /api/v1/download?slug=&ownerHandle=&version=   包字节
* ```
*
* ## 几处必须知道的实测行为
*
* **一、slug 会歧义，必须带 `ownerHandle`。** ClawHub 上不同发布者可以用同一个
* slug，裸 slug 请求下载会得到 **409**，而不是随便给你一个。热门技能几乎都撞名
* （`self-improving-agent`、`pdf` 都是），所以这里把 `ownerHandle` 当作下载的
* 必要坐标，从条目里带下来。409 的正文会说清有哪些候选，原样转给调用方。
*
* **二、错误是纯文本，不是 JSON。** 404 就是一行 `Skill not found`。
* 只看 `response.ok` 再回落缓存的话，「这个技能不存在」会被显示成
* 「registry 不可达」——两件完全不同的事。所以失败时把正文读出来当消息。
* （详情端点的 409 是个例外，它给 JSON，里面有候选列表。）
*
* **三、搜索结果里混着别家目录的镜像条目。** `install.kind` 为 `clawhub` 的
* 才是 ClawHub 自己托管、能直接下载的；`skills-sh` 之类是外部目录的镜像，
* 只有 `sourceUrl`。不加区分地列出来，人点了安装才发现下不动。
*
* **四、`tags` 不是标签。** 列表条目里的 `tags` 是 `{latest: <版本或版本id>}`
* 这样的版本别名映射；真正的分类在 `topics` 与 `categories` 里。照着字面把
* `tags` 归一成标签，每个技能都会显示一个叫「latest」的标签。
*
* **五、有速率限制。** `RateLimit-*` / `Retry-After` 头。文档要求缓存响应、
* 收到 429 不要硬轮询，所以这里把 429 单独识别出来并把等待秒数带给调用方。
*
* 另外两个反直觉的地方，也是上游本来的样子：响应是裸 DTO，没有 `{code,data}`
* 包裹；展示名字段叫 `displayName` 而不是 `name`。
*
* ## SkillHub（api.skillhub.cn）与上表的出入
*
* 搜索、详情、下载三个端点一致（且它的 slug 不歧义，不需要 `ownerHandle`），
* 方言差异只有一处真的：**不带关键词的浏览**。ClawHub 是
* `GET /api/v1/skills?sort=`，SkillHub 没有这个路由（无论参数一律 405），
* 它把浏览拆成了榜单：
*
* ```
* GET /api/v1/showcase/{hot|featured|newest|recommended|trending|paid}
* ```
*
* 返回 `{section, skills:[...]}` 而不是 `{items:[...]}`。
*
* 字段命名两边也不统一，而且**同一家的两个端点之间都不统一**：SkillHub 的
* search 给 `icon_url` / `owner_name`，showcase 给 `iconUrl` / `ownerName`；
* 统计量在列表里是顶层，在详情里挪进了 `stats`。ClawHub 则把正体埋在
* `native.skill` 底下。这些一律由归一函数逐个候选位置去读，不值得为它再分
* 方言分支。
*
* 版本解析端点两边都不好用（ClawHub 的 `/api/v1/resolve` 要 hash，
* SkillHub 的要 `@namespace/slug` 坐标），但下载端点不带 `version` 就给最新版，
* 所以这里根本不调用它——少一次往返，也少一处方言。
* @module @staff-os/dsh-workbench/registry
*/
function asRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function asArray(value) {
	return Array.isArray(value) ? value : [];
}
function text$1(value) {
	if (typeof value !== "string") return void 0;
	const trimmed = value.trim();
	return trimmed === "" ? void 0 : trimmed;
}
/**
* 标签归一。
*
* 只收数组形态与 `{items:[...]}`。**对象形态一律当作没有标签**——ClawHub 的
* `tags` 是 `{latest: "4.0.2"}` 这样的版本别名映射，按对象键归一的话，
* 市场里每个技能都会挂一个叫「latest」的标签，看着像分类，其实是版本指针。
* 真正的分类走 {@link collectTopics}。
*/
function normalizeTags(raw) {
	if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
	const record = asRecord$1(raw);
	if (record !== void 0 && Array.isArray(record.items)) return record.items.filter(Boolean).map(String);
	return [];
}
/**
* 从若干候选位置收集分类词。
*
* ClawHub 把它们分放在 `topics`（自由词）与 `categories`（受控词）两处，
* SkillHub 用 `tags` 数组加 `subCategories`。合成一份去重列表，
* 界面上就是一排标签，不必关心它来自哪个字段。
*/
function collectTopics(sources) {
	const out = /* @__PURE__ */ new Set();
	for (const source of sources) {
		const record = asRecord$1(source);
		if (record === void 0) continue;
		for (const key of [
			"topics",
			"categories",
			"tags",
			"subCategories"
		]) {
			const value = record[key];
			if (!Array.isArray(value)) continue;
			for (const entry of value) {
				const label = typeof entry === "string" ? entry : text$1(asRecord$1(entry)?.name);
				if (label !== void 0 && label !== "") out.add(label);
			}
		}
	}
	return [...out];
}
/**
* 从若干个候选对象里按候选键取整数，取不到给 0。
*
* 收多个对象而不是一个：同一个量在列表响应里挂顶层、在详情响应里挂 `stats`，
* 两处都传进来比在每个调用点写一遍 `??` 链干净。
*/
function pickInt(sources, ...keys) {
	for (const source of sources) {
		const record = asRecord$1(source);
		if (record === void 0) continue;
		for (const key of keys) {
			const value = record[key];
			if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
		}
	}
	return 0;
}
/** 同 {@link pickInt}，但保留小数。 */
function pickFloat(sources, ...keys) {
	for (const source of sources) {
		const record = asRecord$1(source);
		if (record === void 0) continue;
		for (const key of keys) {
			const value = record[key];
			if (typeof value === "number" && Number.isFinite(value)) return value;
		}
	}
	return 0;
}
/** 从若干个候选对象里按候选键取一个非空字符串。 */
function pickText(sources, ...keys) {
	for (const source of sources) {
		const record = asRecord$1(source);
		if (record === void 0) continue;
		for (const key of keys) {
			const value = text$1(record[key]);
			if (value !== void 0) return value;
		}
	}
}
/**
* 两家共有的那部分统计与展示字段。
*
* search / showcase / detail 三种响应的字段名各不相同（见模块头），
* 归一集中在这里，三个 `itemFrom*` 只负责把自己那份响应拆成几个候选对象
* 递进来。
*/
function commonFields(sources, source) {
	const owner = pickText(sources, "ownerHandle", "owner_name", "ownerName", "handle");
	const iconUrl = pickText(sources, "icon_url", "iconUrl");
	const homepage = pickText(sources, "homepage", "sourceUrl", "upstream_url");
	return {
		installCount: pickInt(sources, "installs", "installCount"),
		avgRating: pickFloat(sources, "rating", "avgRating", "ratingAvg"),
		downloadCount: pickInt(sources, "downloads", "downloadCount"),
		stars: pickInt(sources, "stars", "starCount"),
		...owner === void 0 ? {} : { owner },
		...iconUrl === void 0 ? {} : { iconUrl },
		...homepage === void 0 ? {} : { homepage },
		sourceRegistry: source.id,
		sourceRegistryName: source.name
	};
}
/**
* 把安全审核结论并成一句话。
*
* SkillHub 详情里的 `securityReports` 是 `{实验室: {status, statusText}}`。
* 技能装上去就是模型会照着做的指令，上游既然审了，安装前就该看得见结论。
*/
function summarizeSecurity(raw) {
	const record = asRecord$1(raw);
	if (record === void 0) return void 0;
	const parts = [];
	for (const [lab, value] of Object.entries(record)) {
		const report = asRecord$1(value);
		const label = text$1(report?.statusText) ?? text$1(report?.status);
		if (label !== void 0) parts.push(`${lab}：${label}`);
	}
	return parts.length === 0 ? void 0 : parts.join("；");
}
/**
* 把 ClawHub 的 `moderation` 块归一成一句结论。
*
* 内部部署与 clawhub.ai 的详情里都带它：`{isSuspicious, isMalwareBlocked,
* verdict, reasonCodes, summary}`。`clean` 不值得占一行——「没问题」是默认预期，
* 真正要顶到人眼前的是被拦下和可疑这两种。
*/
function summarizeModeration(raw) {
	const record = asRecord$1(raw);
	if (record === void 0) return void 0;
	const reasons = asArray(record.reasonCodes).map(String).filter((code) => code !== "");
	const detail = text$1(record.summary) ?? (reasons.length > 0 ? reasons.join("、") : void 0);
	const suffix = detail === void 0 ? "" : `（${detail}）`;
	if (record.isMalwareBlocked === true) return `已被平台拦截：判定为恶意${suffix}`;
	if (record.isSuspicious === true) return `平台标记为可疑${suffix}`;
	const verdict = text$1(record.verdict);
	if (verdict === void 0 || verdict === "clean") return void 0;
	return `平台审核结论：${verdict}${suffix}`;
}
/** 尽力探测一个可以交给包管理器的安装规格。 */
function installSpecOf(...sources) {
	for (const source of sources) {
		if (source === void 0) continue;
		const spec = text$1(source.installSpec) ?? text$1(source.packageName);
		if (spec !== void 0) return spec;
	}
}
/**
* 把 `/search` 或 `/showcase/*` 的一条结果归一成条目。
*
* 两个端点的条目形状相同（只有下划线/驼峰之差，见模块头），所以共用一条路径。
* 统计量在这一层是**顶层**字段，不在 `stats` 里——早先这里把 `installCount`
* 与 `avgRating` 写死成 0，市场列表因此每一条都显示「0 次安装」，
* 而上游明明给了 `downloads` / `installs` / `stars`。
*
* 描述优先取中文：SkillHub 的条目大多带 `description_zh`，
* 而 `summary` 是把中英文拼在一起的那一版，列表里显示会很挤。
*/
function itemFromSearchResult(raw, source) {
	const record = asRecord$1(raw);
	if (record === void 0) return void 0;
	const native = asRecord$1(record.native);
	const skill = asRecord$1(native?.skill);
	const namespace = asRecord$1(record.namespace);
	const publisher = asRecord$1(record.publisher) ?? asRecord$1(native?.owner);
	const install = asRecord$1(record.install);
	const trust = asRecord$1(record.trust);
	const positions = [
		publisher,
		namespace,
		record,
		skill,
		asRecord$1(skill?.stats) ?? asRecord$1(record.stats)
	];
	const slug = pickText([
		record,
		skill,
		namespace
	], "slug", "publicSlug");
	if (slug === void 0) return void 0;
	const description = pickText([record, skill], "description_zh", "description", "summary");
	const version = pickText([
		record,
		asRecord$1(record.latestVersion),
		skill
	], "version");
	const category = pickText([record, skill], "category", "categoryKey");
	const spec = installSpecOf(record, skill);
	const topics = collectTopics([record, skill]);
	const kind = pickText([install], "kind");
	return {
		slug,
		name: pickText([record, skill], "displayName", "name") ?? slug,
		...description === void 0 ? {} : { description },
		...version === void 0 ? {} : { version },
		...category === void 0 ? {} : { category },
		...spec === void 0 ? {} : { installSpec: spec },
		tags: topics.length > 0 ? topics : normalizeTags(record.tags),
		...installFields(record, install, trust, skill, kind),
		...commonFields(positions, source)
	};
}
/**
* 「这一条能不能直接装」相关的字段。
*
* 搜索结果里混着别家目录的镜像条目（`install.kind` 是 `skills-sh` 之类），
* 它们在 ClawHub 上没有包，只有一个指向外部的 `sourceUrl`。把这件事显式带
* 出来，界面才能在安装按钮上做区分——否则人点下去才发现下不动，
* 而错误信息只会是一句 404。
*/
function installFields(record, install, trust, skill, kind) {
	const foreign = kind !== void 0 && kind !== "clawhub";
	const installability = pickText([trust], "installability");
	const suspicious = (skill?.isSuspicious ?? record.isSuspicious) === true;
	const reference = pickText([install], "reference");
	const verdict = pickText([trust], "clawHubVerdict");
	const security = suspicious ? "上游标记为可疑" : verdict ?? void 0;
	return {
		...kind === void 0 ? {} : { installKind: kind },
		installable: !foreign && installability !== "unavailable",
		...reference === void 0 ? {} : { installReference: reference },
		...security === void 0 ? {} : { securityStatus: security }
	};
}
/**
* 把 `/skills` 浏览列表的一条归一成条目。
*
* 与搜索结果的形状不同：这里正体就在顶层，版本在 `latestVersion.version`，
* 统计量在 `stats`。分类走 `topics`——这条响应里的 `tags` 同样是
* `{latest: "4.0.2"}` 那种版本别名映射。
*
* 列表端点不带发布者信息，所以这里的条目**没有 `owner`**；下载需要它的话，
* 得先去详情端点补一次。歧义的 slug 会在下载时以 409 说明。
*/
function itemFromListEntry(raw, source) {
	const record = asRecord$1(raw);
	const slug = text$1(record?.slug);
	if (record === void 0 || slug === void 0) return void 0;
	const latest = asRecord$1(record.latestVersion);
	const stats = asRecord$1(record.stats);
	const description = text$1(record.description) ?? text$1(record.summary);
	const version = text$1(latest?.version);
	const category = text$1(record.category);
	const spec = installSpecOf(latest, record);
	const topics = collectTopics([record]);
	return {
		slug,
		name: text$1(record.displayName) ?? slug,
		...description === void 0 ? {} : { description },
		...version === void 0 ? {} : { version },
		...category === void 0 ? {} : { category },
		...spec === void 0 ? {} : { installSpec: spec },
		tags: topics,
		installable: true,
		...commonFields([
			record,
			stats,
			asRecord$1(record.namespace)
		], source)
	};
}
/**
* 把 `/skills/{slug}` 详情归一成条目。
*
* 详情的结构与列表不同：正体在 `skill` 下，版本在 `latestVersion` 下，
* stats 在不同部署里可能挂 `skill.stats` 也可能挂顶层，两处都兜。
*/
/** 一句描述最长到这里；再长就不是摘要，是正文。 */
const SUMMARY_LIMIT = 300;
/** 看着像不像一句摘要：不跨行、不太长。 */
function looksLikeSummary(value) {
	return value.length <= SUMMARY_LIMIT && !/\n/u.test(value);
}
/**
* 从若干候选里挑一句能当描述用的话。
*
* ClawHub 的详情端点里，`description` 装的是**整份 SKILL.md**——连 frontmatter
* 一起，几千字；真正的那一行摘要在 `summary` 里。列表端点只给 summary，所以
* 不挑的话，同一个技能在卡片上是一行字，点进详情变成一堵墙。
*
* 挑法是按形状而不是按字段名：优先级不变，只是跳过那些明显是正文的候选；
* 一个像样的都没有时仍然给出第一个非空的，总比什么都不显示强。
*/
function pickDescription(candidates) {
	const present = candidates.filter(isPresent);
	return present.find(looksLikeSummary) ?? present[0];
}
function itemFromDetail(raw, slug, source) {
	const body = asRecord$1(raw);
	if (body === void 0) return void 0;
	const skill = asRecord$1(body.skill) ?? {};
	const latest = asRecord$1(body.latestVersion);
	const stats = skill.stats ?? body.stats;
	const security = summarizeSecurity(body.securityReports) ?? summarizeModeration(body.moderation);
	const description = pickDescription([
		text$1(skill.description_zh),
		text$1(skill.description),
		text$1(skill.readme),
		text$1(skill.summary)
	]);
	const version = text$1(latest?.version);
	const category = text$1(skill.category);
	const spec = installSpecOf(latest, skill, body);
	const topics = collectTopics([skill, body]);
	const owner = pickText([
		asRecord$1(body.owner),
		asRecord$1(body.publisher),
		asRecord$1(body.namespace)
	], "ownerHandle", "handle");
	return {
		slug: text$1(skill.slug) ?? text$1(body.slug) ?? slug,
		name: text$1(skill.displayName) ?? text$1(skill.slug) ?? slug,
		...description === void 0 ? {} : { description },
		...version === void 0 ? {} : { version },
		...category === void 0 ? {} : { category },
		...spec === void 0 ? {} : { installSpec: spec },
		tags: topics,
		installable: true,
		...security === void 0 ? {} : { securityStatus: security },
		...commonFields([
			skill,
			stats,
			asRecord$1(body.namespace),
			asRecord$1(body.owner)
		], source),
		...owner === void 0 ? {} : { owner }
	};
}
/**
* 从 SkillHub 的 web 列表条目归一。
*
* 这条路与 `/api/v1` 那两条形状不同：显示名与摘要各有一个中文版，版本在
* `headlineVersion` 里，统计量的字段名也换了一套。它只在按标签筛选时走——
* 标签是 `/api/web` 独有的能力，见 {@link RegistryClient.listLabels}。
*
* **`namespace` 不是发布者**：SkillHub 上它是 `global` 这样的命名空间，
* 拿它当 `owner` 会让卡片上写着「发布者 global」，下载时还会带上一个
* 上游不认的坐标。
*/
function itemFromWebEntry(raw, source) {
	const record = asRecord$1(raw);
	const slug = text$1(record?.slug);
	if (record === void 0 || slug === void 0) return void 0;
	const version = text$1(asRecord$1(record.headlineVersion)?.version) ?? text$1(asRecord$1(record.publishedVersion)?.version);
	const description = pickDescription([text$1(record.summaryZh), text$1(record.summary)]);
	return {
		slug,
		name: text$1(record.displayNameZh) ?? text$1(record.displayName) ?? slug,
		...description === void 0 ? {} : { description },
		...version === void 0 ? {} : { version },
		tags: [],
		installable: true,
		...commonFields([record], source)
	};
}
/** SkillHub 的榜单端点。浏览时按这几个之一取列表。 */
const SHOWCASE_SECTIONS = [
	"hot",
	"featured",
	"newest",
	"recommended",
	"trending",
	"paid"
];
/**
* 把调用方给的 `sort` 映射成 SkillHub 的榜单端点。
*
* 认不出来的值回落到 `hot` 而不是报错：`sort` 是个软偏好，
* 为它失败一次市场浏览不值得。
*/
function showcasePath(sort) {
	const wanted = (sort ?? "").trim().toLowerCase();
	return `/api/v1/showcase/${SHOWCASE_SECTIONS.find((candidate) => candidate === wanted) ?? "hot"}`;
}
/**
* 从 `Content-Disposition` 里读出实际下载到的版本。
*
* 文件名形如 `find-skills-1.0.0.zip`。取它是因为不带 `version` 请求时，
* 「拿到的是哪一版」只有响应头知道——记成 `latest` 的话，
* 本地记录的版本永远对不上，更新检查也就无从谈起。
*/
function versionFromDisposition(header) {
	if (header === null) return void 0;
	const filename = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/iu.exec(header)?.[1];
	if (filename === void 0) return void 0;
	const version = /-(\d[^-]*?)\.(?:zip|tar|tgz|tar\.gz)$/iu.exec(filename)?.[1];
	return version === void 0 || version === "" ? void 0 : version;
}
/**
* 剥掉包内共同的顶层包裹目录。
*
* 只有「所有路径都带斜杠且首段一致」时才剥，否则 `scripts/run.py` 会被压平成
* `run.py`，子目录结构就丢了。
*/
function stripCommonPrefix(files) {
	const cleaned = [];
	for (const file of files) {
		let path = file.path;
		while (path.startsWith("./")) path = path.slice(2);
		path = path.replace(/^\/+/u, "");
		if (path !== "") cleaned.push({
			path,
			content: file.content
		});
	}
	if (cleaned.length === 0) return [];
	if (!(new Set(cleaned.map((file) => file.path.split("/", 1)[0])).size === 1 && cleaned.every((file) => file.path.includes("/")))) return cleaned;
	return cleaned.map((file) => ({
		path: file.path.slice(file.path.indexOf("/") + 1),
		content: file.content
	}));
}
/**
* 认出「这不是包，是一个指向 GitHub 的转交描述符」。
*
* ClawHub 对 GitHub 托管、扫描结论为 clean/suspicious 的技能不发自己的字节，
* 而是回一段 JSON 描述符。照着当压缩包解只会得到一句「无法解析」，
* 真正的原因（要去 GitHub 拿）就丢了。
*
* @returns 描述符里的仓库地址；不是描述符时 `undefined`。
*/
function githubHandoff(response, data) {
	if (!(response.headers.get("content-type") ?? "").includes("json")) return void 0;
	let parsed;
	try {
		parsed = JSON.parse(data.toString("utf8"));
	} catch {
		return;
	}
	const record = asRecord$1(parsed);
	if (record === void 0) return void 0;
	const kind = text$1(record.kind) ?? text$1(record.type);
	if (kind !== void 0 && !kind.includes("github")) return void 0;
	return pickText([
		record,
		asRecord$1(record.source),
		asRecord$1(record.repository)
	], "url", "repositoryUrl", "sourceUrl", "html_url") ?? "它的 GitHub 仓库地址";
}
/** ClawHub 兼容 registry 的聚合客户端。 */
/**
* 跟市场要哪种语言的显示名。
*
* 标签的译名是在市场后台按 locale 维护的，取哪一份靠 `Accept-Language` 协商：
* 不带这个头时 `/api/web/labels` 的 `displayName` 原样回 slug（筛选条上就是
* 一排 `efficiencyimprovement`），带上就是后台里那份译名（「效率提升」）。
* 内部代号尤其明显——`gh` 是「工业互联网」、`xj` 是「巡检」，光看 slug 猜不出来。
*
* 写死中文而不是跟着界面语言走：语言是浏览器那边的状态，这些请求却发生在插件
* 这一侧，中间隔着一层 Remote，把它一路传下来要动协议描述表。不认这个头的源
* （公网 ClawHub）多一个请求头也没有影响。
*/
const ACCEPT_LANGUAGE = "zh-CN,zh;q=0.9,en;q=0.8";
/** 查不出命名空间时按这个走。SkillHub 的默认命名空间就是它。 */
const DEFAULT_NAMESPACE = "global";
var RegistryClient = class {
	sources;
	cacheDir;
	timeoutMs;
	resolveApiKey;
	constructor(options) {
		this.sources = options.sources;
		this.cacheDir = options.cacheDir;
		this.timeoutMs = options.timeoutMs;
		this.resolveApiKey = options.resolveApiKey;
	}
	/** 已配置的源；空数组说明用户没配 registry，市场类动作要给出明确提示。 */
	listSources() {
		return this.sources;
	}
	/**
	* 在运行时替换源列表。
	*
	* 用户在界面上加减市场源后立刻生效，不必重启——`RegistryClient` 的其余
	* 状态（缓存目录、超时、凭据解析）都不随源列表变，所以只换这一份。
	*/
	setSources(sources) {
		this.sources = sources;
	}
	/**
	* 列出各源提供的标签。
	*
	* 尽力而为：走的是 SkillHub 的 `/api/web/labels`，不在 ClawHub 兼容契约里。
	* 取不到就是这个源没有标签，不是错误——界面据此决定要不要摆那条分组栏。
	*
	* @returns 各源的标签合起来；每条带着自己来自哪个源。
	*/
	async listLabels(signal) {
		const labels = [];
		for (const source of this.sources) {
			throwIfAborted(signal);
			const body = await this.getJson(source, "/api/web/labels", void 0, signal);
			for (const raw of asArray(asRecord$1(body)?.data)) {
				const record = asRecord$1(raw);
				const slug = text$1(record?.slug);
				if (record === void 0 || slug === void 0) continue;
				labels.push({
					slug,
					name: text$1(record.displayName) ?? slug,
					kind: text$1(record.type) ?? "RECOMMENDED",
					registry: source.id,
					registryName: source.name
				});
			}
		}
		return labels;
	}
	/**
	* 跨所有源搜索。
	* @param keyword - 关键词；留空则走 `/skills` 浏览列表
	* @param page - 1 起的页码，内部转成 ClawHub 的 0 起
	* @param label - 按标签筛；只查 `label.registry` 那一个源，因为标签是各源
	*   自己的东西，拿一个源的标签去问另一个源，要么 404、要么被无视之后回一
	*   整页没筛过的结果——后者更糟，看着像筛过了。
	*/
	async search(options, signal) {
		if (this.sources.length === 0) throw new WorkbenchError("没有配置任何技能/插件 registry；在插件配置的 registries 里加一条 ClawHub 兼容源后重试", "WORKBENCH_NO_REGISTRY");
		const page = Math.max(options.page ?? 1, 1);
		const pageSize = Math.min(Math.max(options.pageSize ?? 20, 1), 100);
		const items = [];
		let fromCache = false;
		const wanted = options.label === void 0 ? this.sources : this.sources.filter((source) => source.id === options.label?.registry);
		for (const source of wanted) {
			throwIfAborted(signal);
			const result = await this.searchOne(source, {
				...options,
				page,
				pageSize
			}, signal);
			items.push(...result.items);
			if (result.fromCache) fromCache = true;
		}
		return {
			items,
			fromCache
		};
	}
	/** 取一个条目的详情；`registryId` 留空时按源顺序找到第一个命中的。 */
	async get(slug, registryId, signal) {
		for (const source of this.selectSources(registryId)) {
			throwIfAborted(signal);
			const body = await this.getJson(source, `/api/v1/skills/${encodeURIComponent(slug)}`, void 0, signal);
			if (body === void 0) continue;
			const item = itemFromDetail(body, slug, source);
			if (item !== void 0) return item;
		}
	}
	/**
	* 解析版本并下载包，返回归一后的文本文件列表。
	*
	* 包格式按 magic bytes 判断：SkillHub 的 download 返回 ZIP，
	* 部分 ClawHub 兼容实现返回 tar(.gz)，两种都要认。
	*/
	async download(slug, version, registryId, signal, owner) {
		const errors = [];
		for (const source of this.selectSources(registryId)) {
			throwIfAborted(signal);
			const ownerHandle = owner ?? await this.ownerOf(source, slug, signal);
			const url = this.endpoint(source, "/api/v1/download", {
				slug,
				...ownerHandle === void 0 ? {} : { ownerHandle },
				...version === void 0 ? {} : { version }
			});
			let response;
			try {
				response = await fetch(url, {
					headers: await this.headers(source),
					signal: signal ?? AbortSignal.timeout(this.timeoutMs)
				});
			} catch (error) {
				if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error);
				errors.push(`${source.name}: ${String(error)}`);
				continue;
			}
			if (!response.ok) {
				const retry = await this.followBlindRedirect(source, response, slug, version, signal);
				if (retry === void 0) {
					errors.push(await this.describeFailure(source, response));
					continue;
				}
				response = retry;
			}
			const data = Buffer.from(await response.arrayBuffer());
			const handoff = githubHandoff(response, data);
			if (handoff !== void 0) {
				errors.push(`${source.name}: 这个技能由 ClawHub 转发到 GitHub，registry 本身没有包；请改用「从链接导入」并给 ${handoff}`);
				continue;
			}
			const files = stripCommonPrefix(await extractPackage(data));
			if (files.length === 0) {
				errors.push(`${source.name}: 下载到的包是空的`);
				continue;
			}
			return {
				files,
				version: versionFromDisposition(response.headers.get("content-disposition")) ?? version ?? "latest",
				source,
				...ownerHandle === void 0 ? {} : { owner: ownerHandle }
			};
		}
		throw new WorkbenchError(`无法从任何 registry 下载 "${slug}"：${errors.join("；") || "没有可用的源"}`, "WORKBENCH_REGISTRY_DOWNLOAD_FAILED");
	}
	/**
	* 查一个条目的最新版本号。
	*
	* 走详情端点而不是版本解析端点：两家的 resolve 路由都不好用
	* （ClawHub 的要 hash，SkillHub 的要 `@namespace/slug` 坐标），
	* 而详情端点两边都有，`latestVersion.version` 就在里面。
	*/
	async latestVersion(source, slug, signal) {
		return text$1(asRecord$1((await this.detailBody(source, slug, signal))?.latestVersion)?.version);
	}
	/**
	* 查一个条目的发布者 handle，用来消解 slug 歧义。
	*
	* 查不到不是错误：SkillHub 的 slug 不歧义，不带 `ownerHandle` 也能下。
	* 真歧义时下载端点会以 409 说清有哪些候选。
	*/
	async ownerOf(source, slug, signal) {
		let body;
		try {
			body = await this.detailBody(source, slug, signal);
		} catch (error) {
			if (error instanceof WorkbenchError && error.code === "WORKBENCH_REGISTRY_AMBIGUOUS") throw error;
			return;
		}
		if (body === void 0) return void 0;
		return pickText([
			asRecord$1(body.owner),
			asRecord$1(body.publisher),
			asRecord$1(body.skill),
			asRecord$1(body.namespace)
		], "ownerHandle", "handle");
	}
	/** 详情端点的原始响应体。 */
	async detailBody(source, slug, signal) {
		return asRecord$1(await this.getJson(source, `/api/v1/skills/${encodeURIComponent(slug)}`, void 0, signal));
	}
	selectSources(registryId) {
		if (registryId === void 0) return this.sources;
		const source = this.sources.find((candidate) => candidate.id === registryId);
		if (source === void 0) {
			const ids = this.sources.map((candidate) => candidate.id).join(", ");
			throw new WorkbenchError(`registry "${registryId}" 未配置（已配置：${ids || "无"}）`, "WORKBENCH_REGISTRY_UNKNOWN");
		}
		return [source];
	}
	async searchOne(source, options, signal) {
		const clawPage = options.page - 1;
		if (options.label !== void 0) return {
			items: asArray(asRecord$1(asRecord$1(await this.getJson(source, "/api/web/skills", {
				label: options.label.slug,
				page: clawPage,
				size: options.pageSize,
				...options.keyword === void 0 || options.keyword.trim() === "" ? {} : { q: options.keyword.trim() }
			}, signal))?.data)?.items).map((raw) => itemFromWebEntry(raw, source)).filter(isPresent),
			fromCache: this.lastServedFromCache
		};
		if (options.keyword !== void 0 && options.keyword.trim() !== "") return {
			items: asArray(asRecord$1(await this.getJson(source, "/api/v1/search", {
				q: options.keyword,
				page: clawPage,
				limit: options.pageSize
			}, signal))?.results).map((raw) => itemFromSearchResult(raw, source)).filter(isPresent),
			fromCache: this.lastServedFromCache
		};
		const params = {
			page: clawPage,
			limit: options.pageSize
		};
		if ((source.flavor ?? "clawhub") === "skillhub") return {
			items: asArray(asRecord$1(await this.getJson(source, showcasePath(options.sort), params, signal))?.skills).map((raw) => itemFromSearchResult(raw, source)).filter(isPresent),
			fromCache: this.lastServedFromCache
		};
		if (options.sort !== void 0 && options.sort !== "") params.sort = options.sort;
		return {
			items: asArray(asRecord$1(await this.getJson(source, "/api/v1/skills", params, signal))?.items).map((raw) => itemFromListEntry(raw, source)).filter(isPresent),
			fromCache: this.lastServedFromCache
		};
	}
	/** 上一次 getJson 是否吃了缓存；只在同一次 searchOne 内读取，不跨调用共享。 */
	lastServedFromCache = false;
	/**
	* 把一个失败响应变成一句能用的话。
	*
	* ClawHub 的错误正文是纯文本（`Skill not found`），歧义 slug 那一条是 JSON。
	* 两种都读出来：只报「HTTP 404」的话，「这个技能不存在」和「registry 挂了」
	* 在界面上长得一模一样。
	*/
	async describeFailure(source, response) {
		const retryAfter = retryAfterSeconds(response);
		if (response.status === 429) return `${source.name}: 请求过于频繁，${retryAfter === void 0 ? "请稍后再试" : `请等 ${String(retryAfter)} 秒后再试`}`;
		let body = "";
		try {
			body = (await response.text()).trim();
		} catch {}
		const detail = ambiguityMessage(body) ?? body;
		if (detail === "") return `${source.name}: HTTP ${String(response.status)}`;
		const hint = response.status === 409 && !detail.includes("；") ? "；这个 slug 有多个发布者，安装时把市场列表里的 owner 一并带上" : "";
		return `${source.name}: ${detail}${hint}`;
	}
	/**
	* 下载端点回了个 3xx 却没给 `Location` 时，自己走一趟规范路径。
	*
	* `/api/v1/download?slug=` 在 SkillHub 上只是个跳板，它把请求 302 到
	* `/api/v1/skills/{namespace}/{slug}/download`。**slug 不是 ASCII 时那个
	* Location 头发不出来**——HTTP 头承载不了非 ASCII 字符，服务端那一头把它
	* 丢掉，于是客户端收到一个无处可去的 302，报出来就是一句「HTTP 302」。
	* 内网市场上确实有中文 slug 的技能（`移动集团恶意软件运维助手`），这条路上
	* 它们一个都装不了。
	*
	* 所以这里补一手：直接请求服务端本来要指过去的那个规范路径——路径段里的
	* 非 ASCII 由 percent-encoding 承载，没有响应头那个限制。命名空间从市场的
	* web 列表里查（那份 payload 带 `namespace`），查不到按 `global` 走，那是
	* SkillHub 的默认命名空间，也正是它在 ASCII slug 上跳过去的那一个。
	*
	* @param source - 当前这个源。
	* @param response - 那个没给 Location 的响应。
	* @param slug - 市场里的标识。
	* @param version - 版本；留空取最新。
	* @param signal - 取消信号。
	* @returns 重试拿到的响应；这次失败不属于这种情况、或者重试也没成时 undefined。
	*/
	async followBlindRedirect(source, response, slug, version, signal) {
		if (response.status < 300 || response.status >= 400) return void 0;
		if (response.headers.get("location") !== null) return void 0;
		const namespace = await this.namespaceOf(source, slug, signal) ?? DEFAULT_NAMESPACE;
		const url = this.endpoint(source, `/api/v1/skills/${encodeURIComponent(namespace)}/${encodeURIComponent(slug)}/download`, version === void 0 ? void 0 : { version });
		try {
			const retry = await fetch(url, {
				headers: await this.headers(source),
				signal: signal ?? AbortSignal.timeout(this.timeoutMs)
			});
			return retry.ok ? retry : void 0;
		} catch (error) {
			if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error);
			return;
		}
	}
	/**
	* 一个技能落在哪个命名空间下。
	*
	* 只有 `/api/web/skills` 那份 payload 带这个字段，`/api/v1` 的详情不带。
	* 查不到不是错误——调用方有默认值可用。
	*/
	async namespaceOf(source, slug, signal) {
		let body;
		try {
			body = await this.getJson(source, "/api/web/skills", {
				q: slug,
				page: 0,
				size: 20
			}, signal);
		} catch (error) {
			if (signal?.aborted === true || isAbortError(error)) throw abortedError(signal, error);
			return;
		}
		for (const raw of asArray(asRecord$1(asRecord$1(body)?.data)?.items)) {
			const record = asRecord$1(raw);
			if (text$1(record?.slug) === slug) return text$1(record?.namespace);
		}
	}
	/**
	* GET 一个裸 JSON。网络失败时回退本地缓存；缓存也没有才返回 undefined。
	*
	* 单个源不可用不该让整次市场查询失败——多源聚合的意义就在这里。
	*/
	async getJson(source, path, params, signal) {
		this.lastServedFromCache = false;
		const url = this.endpoint(source, path, params);
		const key = cacheKey(source.id, url);
		try {
			const response = await fetch(url, {
				headers: await this.headers(source),
				signal: signal ?? AbortSignal.timeout(this.timeoutMs)
			});
			if (!response.ok) {
				const message = await this.describeFailure(source, response);
				if (response.status >= 400 && response.status < 500) throw new WorkbenchError(message, registryErrorCode(response.status));
				throw new Error(message);
			}
			const payload = await response.json();
			await this.writeCache(key, payload);
			return payload;
		} catch (error) {
			if (signal?.aborted === true) throw abortedError(signal, error);
			if (error instanceof WorkbenchError) throw error;
			const cached = await this.readCache(key);
			if (cached !== void 0) {
				this.lastServedFromCache = true;
				return cached;
			}
			return;
		}
	}
	endpoint(source, path, params) {
		const base = source.url.replace(/\/+$/u, "");
		if (params === void 0) return `${base}${path}`;
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) search.set(key, String(value));
		return `${base}${path}?${search.toString()}`;
	}
	async headers(source) {
		const headers = {
			"accept": "application/json",
			"accept-language": ACCEPT_LANGUAGE,
			"user-agent": "dsh-workbench/0.1.0"
		};
		if (source.apiKeyEnv !== void 0 && this.resolveApiKey !== void 0) {
			const key = await this.resolveApiKey(source.apiKeyEnv);
			if (key !== void 0 && key !== "") headers.authorization = `Bearer ${key}`;
		}
		return headers;
	}
	async readCache(key) {
		try {
			const raw = await readFile(join(this.cacheDir, `${key}.json`), "utf8");
			return JSON.parse(raw).payload;
		} catch {
			return;
		}
	}
	async writeCache(key, payload) {
		try {
			await mkdir(this.cacheDir, {
				recursive: true,
				mode: 448
			});
			const envelope = {
				savedAt: Date.now(),
				payload
			};
			await writeFile(join(this.cacheDir, `${key}.json`), JSON.stringify(envelope), { mode: 384 });
		} catch {}
	}
};
/**
* 从响应头里读出该等多久再重试。
*
* 三个头都可能出现：`Retry-After` 是延迟秒数，`RateLimit-Reset` 也是延迟秒数，
* `X-RateLimit-Reset` 却是绝对的 Unix 秒。优先级按 ClawHub 文档的建议。
*/
function retryAfterSeconds(response) {
	const direct = Number(response.headers.get("retry-after") ?? "");
	if (Number.isFinite(direct) && direct >= 0) return Math.ceil(direct);
	const delay = Number(response.headers.get("ratelimit-reset") ?? "");
	if (Number.isFinite(delay) && delay >= 0) return Math.ceil(delay);
	const absolute = Number(response.headers.get("x-ratelimit-reset") ?? "");
	if (!Number.isFinite(absolute) || absolute <= 0) return void 0;
	return Math.max(0, Math.ceil(absolute - Date.now() / 1e3));
}
/**
* 把歧义 slug 的响应变成一句能照做的话。
*
* ClawHub 上不同发布者可以用同一个 slug，此时它回 409。纯文本那版的正文
* 已经写清了要加 `ownerHandle`；JSON 那版给的是候选列表，得自己拼。
* 两者都要落到「装哪一个，怎么写」这句话上，否则人只看到一个 409。
*/
function ambiguityMessage(body) {
	if (body === "") return void 0;
	let parsed;
	try {
		parsed = JSON.parse(body);
	} catch {
		return;
	}
	const record = asRecord$1(parsed);
	if (record === void 0) return void 0;
	const message = text$1(record.message) ?? text$1(record.error);
	const matches = asArray(record.matches).map((entry) => text$1(asRecord$1(entry)?.ref) ?? text$1(asRecord$1(entry)?.ownerHandle)).filter(isPresent);
	if (matches.length === 0) return message;
	return `${message ?? "这个 slug 有多个发布者"}：${matches.join("、")}；安装时请指定发布者（registry 参数旁的 owner）`;
}
/** 4xx 的机器可路由错误码。 */
function registryErrorCode(status) {
	if (status === 404) return "WORKBENCH_REGISTRY_NOT_FOUND";
	if (status === 409) return "WORKBENCH_REGISTRY_AMBIGUOUS";
	if (status === 429) return "WORKBENCH_REGISTRY_RATE_LIMITED";
	if (status === 401 || status === 403) return "WORKBENCH_REGISTRY_UNAUTHORIZED";
	return "WORKBENCH_REGISTRY_REJECTED";
}
function isPresent(value) {
	return value !== void 0;
}
function cacheKey(sourceId, url) {
	return `${sourceId.replace(/[^A-Za-z0-9_-]/gu, "_")}-${createHash("sha256").update(url).digest("hex").slice(0, 16)}`;
}
function abortedError(signal, cause) {
	return new WorkbenchError("registry 请求已取消", "WORKBENCH_ABORTED", { cause: signal?.aborted === true ? signal.reason : cause });
}
/** 按 magic bytes 解包：`PK` 开头是 ZIP，其余按 tar(.gz) 处理。 */
async function extractPackage(data) {
	const { readZipFiles } = await import("./zip-B1SBHfoq.js");
	const { readTarFiles } = await import("./tar-DqDQ9KEn.js");
	return data[0] === 80 && data[1] === 75 ? readZipFiles(data) : readTarFiles(data);
}
//#endregion
//#region .tsbuild/skill/market-config.js
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
/** 市场配置文件名，落在工作台自己的目录下。 */
const MARKET_CONFIG_FILE = "market.json";
/** 配置文件的绝对路径。 */
function marketConfigPath(workbenchDir) {
	return join(workbenchDir, MARKET_CONFIG_FILE);
}
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** 把一条源从 JSON 还原；形状不对时丢掉这一条而不是整个配置。 */
function parseSource(raw) {
	if (!isRecord$1(raw)) return void 0;
	const id = raw.id;
	const name = raw.name;
	const url = raw.url;
	if (typeof id !== "string" || typeof name !== "string" || typeof url !== "string") return;
	const flavor = raw.flavor;
	const apiKeyEnv = raw.apiKeyEnv;
	return {
		id,
		name,
		url,
		...typeof flavor === "string" && flavor !== "" ? { flavor } : {},
		...typeof apiKeyEnv === "string" && apiKeyEnv !== "" ? { apiKeyEnv } : {}
	};
}
/**
* 读出市场配置。
*
* 文件不在、读不动、或者内容坏了，都当作空配置：市场不是必须配的，
* 出厂自带一条 ClawHub 源，空配置时由调用方回退到那一条。
*/
async function readMarketConfig(workbenchDir) {
	let raw;
	try {
		raw = await readFile(marketConfigPath(workbenchDir), "utf8");
	} catch {
		return [];
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return [];
	}
	if (!isRecord$1(parsed) || !Array.isArray(parsed.registries)) return [];
	return parsed.registries.map(parseSource).filter((source) => source !== void 0);
}
/** 把市场配置整份写回。 */
async function writeMarketConfig(workbenchDir, sources) {
	const file = {
		version: 1,
		registries: sources
	};
	await writeFileAtomic(marketConfigPath(workbenchDir), `${JSON.stringify(file, void 0, 2)}\n`, {
		mode: 384,
		dirMode: 448
	});
}
//#endregion
//#region .tsbuild/runtime.js
/**
* 工作台能力缝的 Service Definition（`ctx.workbench`）。
*
* 这个 Service 只持有「所有域都要用的东西」——解析后的路径、registry 客户端、
* 目标 profile 名。各域的读写逻辑是 `employee/` `knowledge/` `skill/` `mcp/`
* `plugin/` 下的普通函数，接受 paths 作参数，这样单元测试不用起 Cordis 上下文。
* @module @staff-os/dsh-workbench/runtime
*/
/** 默认作用的 profile；`dsh web` 的出厂 profile 就叫 web。 */
const DEFAULT_PROFILE = "web";
const RegistrySourceSchema$1 = Schema.object({
	id: Schema.string().required(),
	name: Schema.string(),
	url: Schema.string().required(),
	flavor: Schema.union(["clawhub", "skillhub"]).default("clawhub"),
	apiKeyEnv: Schema.string().role("credential-ref")
});
/**
* 出厂自带的市场源：ClawHub（clawhub.ai）。
*
* 内置而不是让人自己填，是因为「技能市场」这一页没有源就是一页空白，
* 而它的只读接口是公开的、不要 token。想换或加源，在插件配置里给
* `registries`——给了就整个替换，不会与这一条叠加。
*
* 配 `apiKeyEnv` 不是为了读：公开读接口匿名可用，但匿名配额按 IP 算
* （读 3000/分），带 key 时按用户算（12000/分）。有 key 就用上。
*
* SkillHub（`api.skillhub.cn`，`flavor: 'skillhub'`）是国内的同类源，
* 客户端已经认它的方言。等自建的那一版就位，在 `registries` 里加一条即可，
* 不需要改代码：
*
* ```yaml
* registries:
*   - id: skillhub
*     name: SkillHub
*     url: https://api.skillhub.cn
*     flavor: skillhub
* ```
*/
const DEFAULT_REGISTRIES = [{
	id: "clawhub",
	name: "ClawHub",
	url: "https://clawhub.ai",
	flavor: "clawhub",
	apiKeyEnv: "CLAWHUB_API_KEY"
}];
/** 市场请求默认超时。 */
const DEFAULT_REGISTRY_TIMEOUT_MS = 15e3;
/**
* 企业工作台服务。注册为 `ctx.workbench`。
*/
var WorkbenchRuntime = class extends Service {
	static Config = Schema.object({
		profile: Schema.string().default("web"),
		dshHome: Schema.string(),
		registries: Schema.array(RegistrySourceSchema$1).default([]),
		registryTimeoutMs: Schema.number().step(1).min(1).default(DEFAULT_REGISTRY_TIMEOUT_MS)
	});
	/** 目标 profile 名。 */
	profileName;
	/** 解析后的目录布局。 */
	paths;
	/** 市场客户端，技能与插件共用。 */
	registry;
	/** 静态配置里的源；启动时读，运行时不改。 */
	staticSources;
	/** 凭据解析函数；动态源也要用它。 */
	resolveApiKey;
	/** 单次市场请求的超时预算。 */
	registryTimeoutMs;
	constructor(ctx, config = {}) {
		super(ctx, "workbench");
		this.profileName = config.profile ?? "web";
		this.paths = resolvePaths(this.profileName, config.dshHome);
		const configured = config.registries ?? [];
		this.staticSources = configured.length > 0 ? configured : DEFAULT_REGISTRIES;
		this.registryTimeoutMs = config.registryTimeoutMs ?? 15e3;
		if (config.resolveApiKey !== void 0) this.resolveApiKey = config.resolveApiKey;
		this.registry = new RegistryClient({
			sources: this.staticSources,
			cacheDir: this.paths.cache,
			timeoutMs: this.registryTimeoutMs,
			...config.resolveApiKey === void 0 ? {} : { resolveApiKey: config.resolveApiKey }
		});
	}
	/**
	* 当前生效的市场源列表。
	*
	* 优先读运行时配置文件（用户在界面上加减的那些）；文件不存在或为空时回退
	* 到静态配置（Cordis 配置里的 `registries`，或出厂那一条）。这样用户在界面
	* 上配的源立刻生效，不必重启。
	*/
	async loadRegistrySources() {
		const dynamic = await readMarketConfig(this.paths.workbench);
		return dynamic.length > 0 ? dynamic : this.staticSources;
	}
	/**
	* 把一组动态源注册进 `RegistryClient`。
	*
	* `RegistryClient` 的源列表是构造时定的，这里在运行时覆盖它——用户的配置
	* 改完要立刻生效，不能等重启。
	*/
	async applyRegistrySources(sources) {
		this.registry.setSources(sources);
	}
};
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/identity.js
var require_identity = /* @__PURE__ */ __commonJSMin(((exports) => {
	const ALIAS = Symbol.for("yaml.alias");
	const DOC = Symbol.for("yaml.document");
	const MAP = Symbol.for("yaml.map");
	const PAIR = Symbol.for("yaml.pair");
	const SCALAR = Symbol.for("yaml.scalar");
	const SEQ = Symbol.for("yaml.seq");
	const NODE_TYPE = Symbol.for("yaml.node.type");
	const isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
	const isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
	const isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
	const isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
	const isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
	const isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
	function isCollection(node) {
		if (node && typeof node === "object") switch (node[NODE_TYPE]) {
			case MAP:
			case SEQ: return true;
		}
		return false;
	}
	function isNode(node) {
		if (node && typeof node === "object") switch (node[NODE_TYPE]) {
			case ALIAS:
			case MAP:
			case SCALAR:
			case SEQ: return true;
		}
		return false;
	}
	const hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
	exports.ALIAS = ALIAS;
	exports.DOC = DOC;
	exports.MAP = MAP;
	exports.NODE_TYPE = NODE_TYPE;
	exports.PAIR = PAIR;
	exports.SCALAR = SCALAR;
	exports.SEQ = SEQ;
	exports.hasAnchor = hasAnchor;
	exports.isAlias = isAlias;
	exports.isCollection = isCollection;
	exports.isDocument = isDocument;
	exports.isMap = isMap;
	exports.isNode = isNode;
	exports.isPair = isPair;
	exports.isScalar = isScalar;
	exports.isSeq = isSeq;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/visit.js
var require_visit = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	const BREAK = Symbol("break visit");
	const SKIP = Symbol("skip children");
	const REMOVE = Symbol("remove node");
	/**
	* Apply a visitor to an AST node or document.
	*
	* Walks through the tree (depth-first) starting from `node`, calling a
	* `visitor` function with three arguments:
	*   - `key`: For sequence values and map `Pair`, the node's index in the
	*     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
	*     `null` for the root node.
	*   - `node`: The current node.
	*   - `path`: The ancestry of the current node.
	*
	* The return value of the visitor may be used to control the traversal:
	*   - `undefined` (default): Do nothing and continue
	*   - `visit.SKIP`: Do not visit the children of this node, continue with next
	*     sibling
	*   - `visit.BREAK`: Terminate traversal completely
	*   - `visit.REMOVE`: Remove the current node, then continue with the next one
	*   - `Node`: Replace the current node, then continue by visiting it
	*   - `number`: While iterating the items of a sequence or map, set the index
	*     of the next step. This is useful especially if the index of the current
	*     node has changed.
	*
	* If `visitor` is a single function, it will be called with all values
	* encountered in the tree, including e.g. `null` values. Alternatively,
	* separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
	* `Alias` and `Scalar` node. To define the same visitor function for more than
	* one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
	* and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
	* specific defined one will be used for each node.
	*/
	function visit(node, visitor) {
		const visitor_ = initVisitor(visitor);
		if (identity.isDocument(node)) {
			if (visit_(null, node.contents, visitor_, Object.freeze([node])) === REMOVE) node.contents = null;
		} else visit_(null, node, visitor_, Object.freeze([]));
	}
	/** Terminate visit traversal completely */
	visit.BREAK = BREAK;
	/** Do not visit the children of the current node */
	visit.SKIP = SKIP;
	/** Remove the current node */
	visit.REMOVE = REMOVE;
	function visit_(key, node, visitor, path) {
		const ctrl = callVisitor(key, node, visitor, path);
		if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
			replaceNode(key, path, ctrl);
			return visit_(key, ctrl, visitor, path);
		}
		if (typeof ctrl !== "symbol") {
			if (identity.isCollection(node)) {
				path = Object.freeze(path.concat(node));
				for (let i = 0; i < node.items.length; ++i) {
					const ci = visit_(i, node.items[i], visitor, path);
					if (typeof ci === "number") i = ci - 1;
					else if (ci === BREAK) return BREAK;
					else if (ci === REMOVE) {
						node.items.splice(i, 1);
						i -= 1;
					}
				}
			} else if (identity.isPair(node)) {
				path = Object.freeze(path.concat(node));
				const ck = visit_("key", node.key, visitor, path);
				if (ck === BREAK) return BREAK;
				else if (ck === REMOVE) node.key = null;
				const cv = visit_("value", node.value, visitor, path);
				if (cv === BREAK) return BREAK;
				else if (cv === REMOVE) node.value = null;
			}
		}
		return ctrl;
	}
	/**
	* Apply an async visitor to an AST node or document.
	*
	* Walks through the tree (depth-first) starting from `node`, calling a
	* `visitor` function with three arguments:
	*   - `key`: For sequence values and map `Pair`, the node's index in the
	*     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
	*     `null` for the root node.
	*   - `node`: The current node.
	*   - `path`: The ancestry of the current node.
	*
	* The return value of the visitor may be used to control the traversal:
	*   - `Promise`: Must resolve to one of the following values
	*   - `undefined` (default): Do nothing and continue
	*   - `visit.SKIP`: Do not visit the children of this node, continue with next
	*     sibling
	*   - `visit.BREAK`: Terminate traversal completely
	*   - `visit.REMOVE`: Remove the current node, then continue with the next one
	*   - `Node`: Replace the current node, then continue by visiting it
	*   - `number`: While iterating the items of a sequence or map, set the index
	*     of the next step. This is useful especially if the index of the current
	*     node has changed.
	*
	* If `visitor` is a single function, it will be called with all values
	* encountered in the tree, including e.g. `null` values. Alternatively,
	* separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
	* `Alias` and `Scalar` node. To define the same visitor function for more than
	* one node type, use the `Collection` (map and seq), `Value` (map, seq & scalar)
	* and `Node` (alias, map, seq & scalar) targets. Of all these, only the most
	* specific defined one will be used for each node.
	*/
	async function visitAsync(node, visitor) {
		const visitor_ = initVisitor(visitor);
		if (identity.isDocument(node)) {
			if (await visitAsync_(null, node.contents, visitor_, Object.freeze([node])) === REMOVE) node.contents = null;
		} else await visitAsync_(null, node, visitor_, Object.freeze([]));
	}
	/** Terminate visit traversal completely */
	visitAsync.BREAK = BREAK;
	/** Do not visit the children of the current node */
	visitAsync.SKIP = SKIP;
	/** Remove the current node */
	visitAsync.REMOVE = REMOVE;
	async function visitAsync_(key, node, visitor, path) {
		const ctrl = await callVisitor(key, node, visitor, path);
		if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
			replaceNode(key, path, ctrl);
			return visitAsync_(key, ctrl, visitor, path);
		}
		if (typeof ctrl !== "symbol") {
			if (identity.isCollection(node)) {
				path = Object.freeze(path.concat(node));
				for (let i = 0; i < node.items.length; ++i) {
					const ci = await visitAsync_(i, node.items[i], visitor, path);
					if (typeof ci === "number") i = ci - 1;
					else if (ci === BREAK) return BREAK;
					else if (ci === REMOVE) {
						node.items.splice(i, 1);
						i -= 1;
					}
				}
			} else if (identity.isPair(node)) {
				path = Object.freeze(path.concat(node));
				const ck = await visitAsync_("key", node.key, visitor, path);
				if (ck === BREAK) return BREAK;
				else if (ck === REMOVE) node.key = null;
				const cv = await visitAsync_("value", node.value, visitor, path);
				if (cv === BREAK) return BREAK;
				else if (cv === REMOVE) node.value = null;
			}
		}
		return ctrl;
	}
	function initVisitor(visitor) {
		if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) return Object.assign({
			Alias: visitor.Node,
			Map: visitor.Node,
			Scalar: visitor.Node,
			Seq: visitor.Node
		}, visitor.Value && {
			Map: visitor.Value,
			Scalar: visitor.Value,
			Seq: visitor.Value
		}, visitor.Collection && {
			Map: visitor.Collection,
			Seq: visitor.Collection
		}, visitor);
		return visitor;
	}
	function callVisitor(key, node, visitor, path) {
		if (typeof visitor === "function") return visitor(key, node, path);
		if (identity.isMap(node)) return visitor.Map?.(key, node, path);
		if (identity.isSeq(node)) return visitor.Seq?.(key, node, path);
		if (identity.isPair(node)) return visitor.Pair?.(key, node, path);
		if (identity.isScalar(node)) return visitor.Scalar?.(key, node, path);
		if (identity.isAlias(node)) return visitor.Alias?.(key, node, path);
	}
	function replaceNode(key, path, node) {
		const parent = path[path.length - 1];
		if (identity.isCollection(parent)) parent.items[key] = node;
		else if (identity.isPair(parent)) {
			if (key === "key") parent.key = node;
			else parent.value = node;
		} else if (identity.isDocument(parent)) parent.contents = node;
		else {
			const pt = identity.isAlias(parent) ? "alias" : "scalar";
			throw new Error(`Cannot replace node with ${pt} parent`);
		}
	}
	exports.visit = visit;
	exports.visitAsync = visitAsync;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/directives.js
var require_directives = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var visit = require_visit();
	const escapeChars = {
		"!": "%21",
		",": "%2C",
		"[": "%5B",
		"]": "%5D",
		"{": "%7B",
		"}": "%7D"
	};
	const escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
	var Directives = class Directives {
		constructor(yaml, tags) {
			/**
			* The directives-end/doc-start marker `---`. If `null`, a marker may still be
			* included in the document's stringified representation.
			*/
			this.docStart = null;
			/** The doc-end marker `...`.  */
			this.docEnd = false;
			this.yaml = Object.assign({}, Directives.defaultYaml, yaml);
			this.tags = Object.assign({}, Directives.defaultTags, tags);
		}
		clone() {
			const copy = new Directives(this.yaml, this.tags);
			copy.docStart = this.docStart;
			return copy;
		}
		/**
		* During parsing, get a Directives instance for the current document and
		* update the stream state according to the current version's spec.
		*/
		atDocument() {
			const res = new Directives(this.yaml, this.tags);
			switch (this.yaml.version) {
				case "1.1":
					this.atNextDocument = true;
					break;
				case "1.2":
					this.atNextDocument = false;
					this.yaml = {
						explicit: Directives.defaultYaml.explicit,
						version: "1.2"
					};
					this.tags = Object.assign({}, Directives.defaultTags);
			}
			return res;
		}
		/**
		* @param onError - May be called even if the action was successful
		* @returns `true` on success
		*/
		add(line, onError) {
			if (this.atNextDocument) {
				this.yaml = {
					explicit: Directives.defaultYaml.explicit,
					version: "1.1"
				};
				this.tags = Object.assign({}, Directives.defaultTags);
				this.atNextDocument = false;
			}
			const parts = line.trim().split(/[ \t]+/);
			const name = parts.shift();
			switch (name) {
				case "%TAG": {
					if (parts.length !== 2) {
						onError(0, "%TAG directive should contain exactly two parts");
						if (parts.length < 2) return false;
					}
					const [handle, prefix] = parts;
					this.tags[handle] = prefix;
					return true;
				}
				case "%YAML": {
					this.yaml.explicit = true;
					if (parts.length !== 1) {
						onError(0, "%YAML directive should contain exactly one part");
						return false;
					}
					const [version] = parts;
					if (version === "1.1" || version === "1.2") {
						this.yaml.version = version;
						return true;
					} else {
						const isValid = /^\d+\.\d+$/.test(version);
						onError(6, `Unsupported YAML version ${version}`, isValid);
						return false;
					}
				}
				default:
					onError(0, `Unknown directive ${name}`, true);
					return false;
			}
		}
		/**
		* Resolves a tag, matching handles to those defined in %TAG directives.
		*
		* @returns Resolved tag, which may also be the non-specific tag `'!'` or a
		*   `'!local'` tag, or `null` if unresolvable.
		*/
		tagName(source, onError) {
			if (source === "!") return "!";
			if (source[0] !== "!") {
				onError(`Not a valid tag: ${source}`);
				return null;
			}
			if (source[1] === "<") {
				const verbatim = source.slice(2, -1);
				if (verbatim === "!" || verbatim === "!!") {
					onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
					return null;
				}
				if (source[source.length - 1] !== ">") onError("Verbatim tags must end with a >");
				return verbatim;
			}
			const [, handle, suffix] = source.match(/^(.*!)([^!]*)$/s);
			if (!suffix) onError(`The ${source} tag has no suffix`);
			const prefix = this.tags[handle];
			if (prefix) try {
				return prefix + decodeURIComponent(suffix);
			} catch (error) {
				onError(String(error));
				return null;
			}
			if (handle === "!") return source;
			onError(`Could not resolve tag: ${source}`);
			return null;
		}
		/**
		* Given a fully resolved tag, returns its printable string form,
		* taking into account current tag prefixes and defaults.
		*/
		tagString(tag) {
			for (const [handle, prefix] of Object.entries(this.tags)) if (tag.startsWith(prefix)) return handle + escapeTagName(tag.substring(prefix.length));
			return tag[0] === "!" ? tag : `!<${tag}>`;
		}
		toString(doc) {
			const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
			const tagEntries = Object.entries(this.tags);
			let tagNames;
			if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
				const tags = {};
				visit.visit(doc.contents, (_key, node) => {
					if (identity.isNode(node) && node.tag) tags[node.tag] = true;
				});
				tagNames = Object.keys(tags);
			} else tagNames = [];
			for (const [handle, prefix] of tagEntries) {
				if (handle === "!!" && prefix === "tag:yaml.org,2002:") continue;
				if (!doc || tagNames.some((tn) => tn.startsWith(prefix))) lines.push(`%TAG ${handle} ${prefix}`);
			}
			return lines.join("\n");
		}
	};
	Directives.defaultYaml = {
		explicit: false,
		version: "1.2"
	};
	Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
	exports.Directives = Directives;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/anchors.js
var require_anchors = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var visit = require_visit();
	/**
	* Verify that the input string is a valid anchor.
	*
	* Will throw on errors.
	*/
	function anchorIsValid(anchor) {
		if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
			const msg = `Anchor must not contain whitespace or control characters: ${JSON.stringify(anchor)}`;
			throw new Error(msg);
		}
		return true;
	}
	function anchorNames(root) {
		const anchors = /* @__PURE__ */ new Set();
		visit.visit(root, { Value(_key, node) {
			if (node.anchor) anchors.add(node.anchor);
		} });
		return anchors;
	}
	/** Find a new anchor name with the given `prefix` and a one-indexed suffix. */
	function findNewAnchor(prefix, exclude) {
		for (let i = 1;; ++i) {
			const name = `${prefix}${i}`;
			if (!exclude.has(name)) return name;
		}
	}
	function createNodeAnchors(doc, prefix) {
		const aliasObjects = [];
		const sourceObjects = /* @__PURE__ */ new Map();
		let prevAnchors = null;
		return {
			onAnchor: (source) => {
				aliasObjects.push(source);
				prevAnchors ?? (prevAnchors = anchorNames(doc));
				const anchor = findNewAnchor(prefix, prevAnchors);
				prevAnchors.add(anchor);
				return anchor;
			},
			/**
			* With circular references, the source node is only resolved after all
			* of its child nodes are. This is why anchors are set only after all of
			* the nodes have been created.
			*/
			setAnchors: () => {
				for (const source of aliasObjects) {
					const ref = sourceObjects.get(source);
					if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) ref.node.anchor = ref.anchor;
					else {
						const error = /* @__PURE__ */ new Error("Failed to resolve repeated object (this should not happen)");
						error.source = source;
						throw error;
					}
				}
			},
			sourceObjects
		};
	}
	exports.anchorIsValid = anchorIsValid;
	exports.anchorNames = anchorNames;
	exports.createNodeAnchors = createNodeAnchors;
	exports.findNewAnchor = findNewAnchor;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Applies the JSON.parse reviver algorithm as defined in the ECMA-262 spec,
	* in section 24.5.1.1 "Runtime Semantics: InternalizeJSONProperty" of the
	* 2021 edition: https://tc39.es/ecma262/#sec-json.parse
	*
	* Includes extensions for handling Map and Set objects.
	*/
	function applyReviver(reviver, obj, key, val) {
		if (val && typeof val === "object") {
			if (Array.isArray(val)) for (let i = 0, len = val.length; i < len; ++i) {
				const v0 = val[i];
				const v1 = applyReviver(reviver, val, String(i), v0);
				if (v1 === void 0) delete val[i];
				else if (v1 !== v0) val[i] = v1;
			}
			else if (val instanceof Map) for (const k of Array.from(val.keys())) {
				const v0 = val.get(k);
				const v1 = applyReviver(reviver, val, k, v0);
				if (v1 === void 0) val.delete(k);
				else if (v1 !== v0) val.set(k, v1);
			}
			else if (val instanceof Set) for (const v0 of Array.from(val)) {
				const v1 = applyReviver(reviver, val, v0, v0);
				if (v1 === void 0) val.delete(v0);
				else if (v1 !== v0) {
					val.delete(v0);
					val.add(v1);
				}
			}
			else for (const [k, v0] of Object.entries(val)) {
				const v1 = applyReviver(reviver, val, k, v0);
				if (v1 === void 0) delete val[k];
				else if (v1 !== v0) val[k] = v1;
			}
		}
		return reviver.call(obj, key, val);
	}
	exports.applyReviver = applyReviver;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	/**
	* Recursively convert any node or its contents to native JavaScript
	*
	* @param value - The input value
	* @param arg - If `value` defines a `toJSON()` method, use this
	*   as its first argument
	* @param ctx - Conversion context, originally set in Document#toJS(). If
	*   `{ keep: true }` is not set, output should be suitable for JSON
	*   stringification.
	*/
	function toJS(value, arg, ctx) {
		if (Array.isArray(value)) return value.map((v, i) => toJS(v, String(i), ctx));
		if (value && typeof value.toJSON === "function") {
			if (!ctx || !identity.hasAnchor(value)) return value.toJSON(arg, ctx);
			const data = {
				aliasCount: 0,
				count: 1,
				res: void 0
			};
			ctx.anchors.set(value, data);
			ctx.onCreate = (res) => {
				data.res = res;
				delete ctx.onCreate;
			};
			const res = value.toJSON(arg, ctx);
			if (ctx.onCreate) ctx.onCreate(res);
			return res;
		}
		if (typeof value === "bigint" && !ctx?.keep) return Number(value);
		return value;
	}
	exports.toJS = toJS;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Node.js
var require_Node = /* @__PURE__ */ __commonJSMin(((exports) => {
	var applyReviver = require_applyReviver();
	var identity = require_identity();
	var toJS = require_toJS();
	var NodeBase = class {
		constructor(type) {
			Object.defineProperty(this, identity.NODE_TYPE, { value: type });
		}
		/** Create a copy of this node.  */
		clone() {
			const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
			if (this.range) copy.range = this.range.slice();
			return copy;
		}
		/** A plain JavaScript representation of this node. */
		toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
			if (!identity.isDocument(doc)) throw new TypeError("A document argument is required");
			const ctx = {
				anchors: /* @__PURE__ */ new Map(),
				doc,
				keep: true,
				mapAsMap: mapAsMap === true,
				mapKeyWarned: false,
				maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
			};
			const res = toJS.toJS(this, "", ctx);
			if (typeof onAnchor === "function") for (const { count, res } of ctx.anchors.values()) onAnchor(res, count);
			return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
		}
	};
	exports.NodeBase = NodeBase;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = /* @__PURE__ */ __commonJSMin(((exports) => {
	var anchors = require_anchors();
	var visit = require_visit();
	var identity = require_identity();
	var Node = require_Node();
	var toJS = require_toJS();
	var Alias = class extends Node.NodeBase {
		constructor(source) {
			super(identity.ALIAS);
			this.source = source;
			Object.defineProperty(this, "tag", { set() {
				throw new Error("Alias nodes cannot have tags");
			} });
		}
		/**
		* Resolve the value of this alias within `doc`, finding the last
		* instance of the `source` anchor before this node.
		*/
		resolve(doc, ctx) {
			if (ctx?.maxAliasCount === 0) throw new ReferenceError("Alias resolution is disabled");
			let nodes;
			if (ctx?.aliasResolveCache) nodes = ctx.aliasResolveCache;
			else {
				nodes = [];
				visit.visit(doc, { Node: (_key, node) => {
					if (identity.isAlias(node) || identity.hasAnchor(node)) nodes.push(node);
				} });
				if (ctx) ctx.aliasResolveCache = nodes;
			}
			let found = void 0;
			for (const node of nodes) {
				if (node === this) break;
				if (node.anchor === this.source) found = node;
			}
			return found;
		}
		toJSON(_arg, ctx) {
			if (!ctx) return { source: this.source };
			const { anchors, doc, maxAliasCount } = ctx;
			const source = this.resolve(doc, ctx);
			if (!source) {
				const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
				throw new ReferenceError(msg);
			}
			let data = anchors.get(source);
			if (!data) {
				toJS.toJS(source, null, ctx);
				data = anchors.get(source);
			}
			/* istanbul ignore if */
			if (data?.res === void 0) throw new ReferenceError("This should not happen: Alias anchor was not resolved?");
			if (maxAliasCount >= 0) {
				data.count += 1;
				if (data.aliasCount === 0) data.aliasCount = getAliasCount(doc, source, anchors);
				if (data.count * data.aliasCount > maxAliasCount) throw new ReferenceError("Excessive alias count indicates a resource exhaustion attack");
			}
			return data.res;
		}
		toString(ctx, _onComment, _onChompKeep) {
			const src = `*${this.source}`;
			if (ctx) {
				anchors.anchorIsValid(this.source);
				if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
					const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
					throw new Error(msg);
				}
				if (ctx.implicitKey) return `${src} `;
			}
			return src;
		}
	};
	function getAliasCount(doc, node, anchors) {
		if (identity.isAlias(node)) {
			const source = node.resolve(doc);
			const anchor = anchors && source && anchors.get(source);
			return anchor ? anchor.count * anchor.aliasCount : 0;
		} else if (identity.isCollection(node)) {
			let count = 0;
			for (const item of node.items) {
				const c = getAliasCount(doc, item, anchors);
				if (c > count) count = c;
			}
			return count;
		} else if (identity.isPair(node)) {
			const kc = getAliasCount(doc, node.key, anchors);
			const vc = getAliasCount(doc, node.value, anchors);
			return Math.max(kc, vc);
		}
		return 1;
	}
	exports.Alias = Alias;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Node = require_Node();
	var toJS = require_toJS();
	const isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
	var Scalar = class extends Node.NodeBase {
		constructor(value) {
			super(identity.SCALAR);
			this.value = value;
		}
		toJSON(arg, ctx) {
			return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
		}
		toString() {
			return String(this.value);
		}
	};
	Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
	Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
	Scalar.PLAIN = "PLAIN";
	Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
	Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
	exports.Scalar = Scalar;
	exports.isScalarValue = isScalarValue;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/createNode.js
var require_createNode = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Alias = require_Alias();
	var identity = require_identity();
	var Scalar = require_Scalar();
	const defaultTagPrefix = "tag:yaml.org,2002:";
	function findTagObject(value, tagName, tags) {
		if (tagName) {
			const match = tags.filter((t) => t.tag === tagName);
			const tagObj = match.find((t) => !t.format) ?? match[0];
			if (!tagObj) throw new Error(`Tag ${tagName} not found`);
			return tagObj;
		}
		return tags.find((t) => t.identify?.(value) && !t.format);
	}
	function createNode(value, tagName, ctx) {
		if (identity.isDocument(value)) value = value.contents;
		if (identity.isNode(value)) return value;
		if (identity.isPair(value)) {
			const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
			map.items.push(value);
			return map;
		}
		if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) value = value.valueOf();
		const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
		let ref = void 0;
		if (aliasDuplicateObjects && value && typeof value === "object") {
			ref = sourceObjects.get(value);
			if (ref) {
				ref.anchor ?? (ref.anchor = onAnchor(value));
				return new Alias.Alias(ref.anchor);
			} else {
				ref = {
					anchor: null,
					node: null
				};
				sourceObjects.set(value, ref);
			}
		}
		if (tagName?.startsWith("!!")) tagName = defaultTagPrefix + tagName.slice(2);
		let tagObj = findTagObject(value, tagName, schema.tags);
		if (!tagObj) {
			if (value && typeof value.toJSON === "function") value = value.toJSON();
			if (!value || typeof value !== "object") {
				const node = new Scalar.Scalar(value);
				if (ref) ref.node = node;
				return node;
			}
			tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
		}
		if (onTagObj) {
			onTagObj(tagObj);
			delete ctx.onTagObj;
		}
		const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
		if (tagName) node.tag = tagName;
		else if (!tagObj.default) node.tag = tagObj.tag;
		if (ref) ref.node = node;
		return node;
	}
	exports.createNode = createNode;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	var createNode = require_createNode();
	var identity = require_identity();
	var Node = require_Node();
	function collectionFromPath(schema, path, value) {
		let v = value;
		for (let i = path.length - 1; i >= 0; --i) {
			const k = path[i];
			if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
				const a = [];
				a[k] = v;
				v = a;
			} else v = /* @__PURE__ */ new Map([[k, v]]);
		}
		return createNode.createNode(v, void 0, {
			aliasDuplicateObjects: false,
			keepUndefined: false,
			onAnchor: () => {
				throw new Error("This should not happen, please report a bug.");
			},
			schema,
			sourceObjects: /* @__PURE__ */ new Map()
		});
	}
	const isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
	var Collection = class extends Node.NodeBase {
		constructor(type, schema) {
			super(type);
			Object.defineProperty(this, "schema", {
				value: schema,
				configurable: true,
				enumerable: false,
				writable: true
			});
		}
		/**
		* Create a copy of this collection.
		*
		* @param schema - If defined, overwrites the original's schema
		*/
		clone(schema) {
			const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
			if (schema) copy.schema = schema;
			copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
			if (this.range) copy.range = this.range.slice();
			return copy;
		}
		/**
		* Adds a value to the collection. For `!!map` and `!!omap` the value must
		* be a Pair instance or a `{ key, value }` object, which may not have a key
		* that already exists in the map.
		*/
		addIn(path, value) {
			if (isEmptyPath(path)) this.add(value);
			else {
				const [key, ...rest] = path;
				const node = this.get(key, true);
				if (identity.isCollection(node)) node.addIn(rest, value);
				else if (node === void 0 && this.schema) this.set(key, collectionFromPath(this.schema, rest, value));
				else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
			}
		}
		/**
		* Removes a value from the collection.
		* @returns `true` if the item was found and removed.
		*/
		deleteIn(path) {
			const [key, ...rest] = path;
			if (rest.length === 0) return this.delete(key);
			const node = this.get(key, true);
			if (identity.isCollection(node)) return node.deleteIn(rest);
			else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
		}
		/**
		* Returns item at `key`, or `undefined` if not found. By default unwraps
		* scalar values from their surrounding node; to disable set `keepScalar` to
		* `true` (collections are always returned intact).
		*/
		getIn(path, keepScalar) {
			const [key, ...rest] = path;
			const node = this.get(key, true);
			if (rest.length === 0) return !keepScalar && identity.isScalar(node) ? node.value : node;
			else return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
		}
		hasAllNullValues(allowScalar) {
			return this.items.every((node) => {
				if (!identity.isPair(node)) return false;
				const n = node.value;
				return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
			});
		}
		/**
		* Checks if the collection includes a value with the key `key`.
		*/
		hasIn(path) {
			const [key, ...rest] = path;
			if (rest.length === 0) return this.has(key);
			const node = this.get(key, true);
			return identity.isCollection(node) ? node.hasIn(rest) : false;
		}
		/**
		* Sets a value in this collection. For `!!set`, `value` needs to be a
		* boolean to add/remove the item from the set.
		*/
		setIn(path, value) {
			const [key, ...rest] = path;
			if (rest.length === 0) this.set(key, value);
			else {
				const node = this.get(key, true);
				if (identity.isCollection(node)) node.setIn(rest, value);
				else if (node === void 0 && this.schema) this.set(key, collectionFromPath(this.schema, rest, value));
				else throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
			}
		}
	};
	exports.Collection = Collection;
	exports.collectionFromPath = collectionFromPath;
	exports.isEmptyPath = isEmptyPath;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Stringifies a comment.
	*
	* Empty comment lines are left empty,
	* lines consisting of a single space are replaced by `#`,
	* and all other lines are prefixed with a `#`.
	*/
	const stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
	function indentComment(comment, indent) {
		if (/^\n+$/.test(comment)) return comment.substring(1);
		return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
	}
	const lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
	exports.indentComment = indentComment;
	exports.lineComment = lineComment;
	exports.stringifyComment = stringifyComment;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = /* @__PURE__ */ __commonJSMin(((exports) => {
	const FOLD_FLOW = "flow";
	const FOLD_BLOCK = "block";
	const FOLD_QUOTED = "quoted";
	/**
	* Tries to keep input at up to `lineWidth` characters, splitting only on spaces
	* not followed by newlines or spaces unless `mode` is `'quoted'`. Lines are
	* terminated with `\n` and started with `indent`.
	*/
	function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
		if (!lineWidth || lineWidth < 0) return text;
		if (lineWidth < minContentWidth) minContentWidth = 0;
		const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
		if (text.length <= endStep) return text;
		const folds = [];
		const escapedFolds = {};
		let end = lineWidth - indent.length;
		if (typeof indentAtStart === "number") {
			if (indentAtStart > lineWidth - Math.max(2, minContentWidth)) folds.push(0);
			else end = lineWidth - indentAtStart;
		}
		let split = void 0;
		let prev = void 0;
		let overflow = false;
		let i = -1;
		let escStart = -1;
		let escEnd = -1;
		if (mode === FOLD_BLOCK) {
			i = consumeMoreIndentedLines(text, i, indent.length);
			if (i !== -1) end = i + endStep;
		}
		for (let ch; ch = text[i += 1];) {
			if (mode === FOLD_QUOTED && ch === "\\") {
				escStart = i;
				switch (text[i + 1]) {
					case "x":
						i += 3;
						break;
					case "u":
						i += 5;
						break;
					case "U":
						i += 9;
						break;
					default: i += 1;
				}
				escEnd = i;
			}
			if (ch === "\n") {
				if (mode === FOLD_BLOCK) i = consumeMoreIndentedLines(text, i, indent.length);
				end = i + indent.length + endStep;
				split = void 0;
			} else {
				if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
					const next = text[i + 1];
					if (next && next !== " " && next !== "\n" && next !== "	") split = i;
				}
				if (i >= end) {
					if (split) {
						folds.push(split);
						end = split + endStep;
						split = void 0;
					} else if (mode === FOLD_QUOTED) {
						while (prev === " " || prev === "	") {
							prev = ch;
							ch = text[i += 1];
							overflow = true;
						}
						const j = i > escEnd + 1 ? i - 2 : escStart - 1;
						if (escapedFolds[j]) return text;
						folds.push(j);
						escapedFolds[j] = true;
						end = j + endStep;
						split = void 0;
					} else overflow = true;
				}
			}
			prev = ch;
		}
		if (overflow && onOverflow) onOverflow();
		if (folds.length === 0) return text;
		if (onFold) onFold();
		let res = text.slice(0, folds[0]);
		for (let i = 0; i < folds.length; ++i) {
			const fold = folds[i];
			const end = folds[i + 1] || text.length;
			if (fold === 0) res = `\n${indent}${text.slice(0, end)}`;
			else {
				if (mode === FOLD_QUOTED && escapedFolds[fold]) res += `${text[fold]}\\`;
				res += `\n${indent}${text.slice(fold + 1, end)}`;
			}
		}
		return res;
	}
	/**
	* Presumes `i + 1` is at the start of a line
	* @returns index of last newline in more-indented block
	*/
	function consumeMoreIndentedLines(text, i, indent) {
		let end = i;
		let start = i + 1;
		let ch = text[start];
		while (ch === " " || ch === "	") if (i < start + indent) ch = text[++i];
		else {
			do
				ch = text[++i];
			while (ch && ch !== "\n");
			end = i;
			start = i + 1;
			ch = text[start];
		}
		return end;
	}
	exports.FOLD_BLOCK = FOLD_BLOCK;
	exports.FOLD_FLOW = FOLD_FLOW;
	exports.FOLD_QUOTED = FOLD_QUOTED;
	exports.foldFlowLines = foldFlowLines;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	var foldFlowLines = require_foldFlowLines();
	const getFoldOptions = (ctx, isBlock) => ({
		indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
		lineWidth: ctx.options.lineWidth,
		minContentWidth: ctx.options.minContentWidth
	});
	const containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
	function lineLengthOverLimit(str, lineWidth, indentLength) {
		if (!lineWidth || lineWidth < 0) return false;
		const limit = lineWidth - indentLength;
		const strLen = str.length;
		if (strLen <= limit) return false;
		for (let i = 0, start = 0; i < strLen; ++i) if (str[i] === "\n") {
			if (i - start > limit) return true;
			start = i + 1;
			if (strLen - start <= limit) return false;
		}
		return true;
	}
	function doubleQuotedString(value, ctx) {
		const json = JSON.stringify(value);
		if (ctx.options.doubleQuotedAsJSON) return json;
		const { implicitKey } = ctx;
		const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
		const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
		let str = "";
		let start = 0;
		for (let i = 0, ch = json[i]; ch; ch = json[++i]) {
			if (ch === " " && json[i + 1] === "\\" && json[i + 2] === "n") {
				str += json.slice(start, i) + "\\ ";
				i += 1;
				start = i;
				ch = "\\";
			}
			if (ch === "\\") switch (json[i + 1]) {
				case "u":
					{
						str += json.slice(start, i);
						const code = json.substr(i + 2, 4);
						switch (code) {
							case "0000":
								str += "\\0";
								break;
							case "0007":
								str += "\\a";
								break;
							case "000b":
								str += "\\v";
								break;
							case "001b":
								str += "\\e";
								break;
							case "0085":
								str += "\\N";
								break;
							case "00a0":
								str += "\\_";
								break;
							case "2028":
								str += "\\L";
								break;
							case "2029":
								str += "\\P";
								break;
							default: if (code.substr(0, 2) === "00") str += "\\x" + code.substr(2);
							else str += json.substr(i, 6);
						}
						i += 5;
						start = i + 1;
					}
					break;
				case "n":
					if (implicitKey || json[i + 2] === "\"" || json.length < minMultiLineLength) i += 1;
					else {
						str += json.slice(start, i) + "\n\n";
						while (json[i + 2] === "\\" && json[i + 3] === "n" && json[i + 4] !== "\"") {
							str += "\n";
							i += 2;
						}
						str += indent;
						if (json[i + 2] === " ") str += "\\";
						i += 1;
						start = i + 1;
					}
					break;
				default: i += 1;
			}
		}
		str = start ? str + json.slice(start) : json;
		return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
	}
	function singleQuotedString(value, ctx) {
		if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value)) return doubleQuotedString(value, ctx);
		const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
		const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&\n${indent}`) + "'";
		return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
	}
	function quotedString(value, ctx) {
		const { singleQuote } = ctx.options;
		let qs;
		if (singleQuote === false) qs = doubleQuotedString;
		else {
			const hasDouble = value.includes("\"");
			const hasSingle = value.includes("'");
			if (hasDouble && !hasSingle) qs = singleQuotedString;
			else if (hasSingle && !hasDouble) qs = doubleQuotedString;
			else qs = singleQuote ? singleQuotedString : doubleQuotedString;
		}
		return qs(value, ctx);
	}
	let blockEndNewlines;
	try {
		blockEndNewlines = /* @__PURE__ */ new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
	} catch {
		blockEndNewlines = /\n+(?!\n|$)/g;
	}
	function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
		const { blockQuote, commentString, lineWidth } = ctx.options;
		if (!blockQuote || /\n[\t ]+$/.test(value)) return quotedString(value, ctx);
		const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
		const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
		if (!value) return literal ? "|\n" : ">\n";
		let chomp;
		let endStart;
		for (endStart = value.length; endStart > 0; --endStart) {
			const ch = value[endStart - 1];
			if (ch !== "\n" && ch !== "	" && ch !== " ") break;
		}
		let end = value.substring(endStart);
		const endNlPos = end.indexOf("\n");
		if (endNlPos === -1) chomp = "-";
		else if (value === end || endNlPos !== end.length - 1) {
			chomp = "+";
			if (onChompKeep) onChompKeep();
		} else chomp = "";
		if (end) {
			value = value.slice(0, -end.length);
			if (end[end.length - 1] === "\n") end = end.slice(0, -1);
			end = end.replace(blockEndNewlines, `$&${indent}`);
		}
		let startWithSpace = false;
		let startEnd;
		let startNlPos = -1;
		for (startEnd = 0; startEnd < value.length; ++startEnd) {
			const ch = value[startEnd];
			if (ch === " ") startWithSpace = true;
			else if (ch === "\n") startNlPos = startEnd;
			else break;
		}
		let start = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
		if (start) {
			value = value.substring(start.length);
			start = start.replace(/\n+/g, `$&${indent}`);
		}
		let header = (startWithSpace ? indent ? "2" : "1" : "") + chomp;
		if (comment) {
			header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
			if (onComment) onComment();
		}
		if (!literal) {
			const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
			let literalFallback = false;
			const foldOptions = getFoldOptions(ctx, true);
			if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) foldOptions.onOverflow = () => {
				literalFallback = true;
			};
			const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
			if (!literalFallback) return `>${header}\n${indent}${body}`;
		}
		value = value.replace(/\n+/g, `$&${indent}`);
		return `|${header}\n${indent}${start}${value}${end}`;
	}
	function plainString(item, ctx, onComment, onChompKeep) {
		const { type, value } = item;
		const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
		if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) return quotedString(value, ctx);
		if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
		if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) return blockString(item, ctx, onComment, onChompKeep);
		if (containsDocumentMarker(value)) {
			if (indent === "") {
				ctx.forceBlockIndent = true;
				return blockString(item, ctx, onComment, onChompKeep);
			} else if (implicitKey && indent === indentStep) return quotedString(value, ctx);
		}
		const str = value.replace(/\n+/g, `$&\n${indent}`);
		if (actualString) {
			const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
			const { compat, tags } = ctx.doc.schema;
			if (tags.some(test) || compat?.some(test)) return quotedString(value, ctx);
		}
		return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
	}
	function stringifyString(item, ctx, onComment, onChompKeep) {
		const { implicitKey, inFlow } = ctx;
		const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
		let { type } = item;
		if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
			if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value)) type = Scalar.Scalar.QUOTE_DOUBLE;
		}
		const _stringify = (_type) => {
			switch (_type) {
				case Scalar.Scalar.BLOCK_FOLDED:
				case Scalar.Scalar.BLOCK_LITERAL: return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
				case Scalar.Scalar.QUOTE_DOUBLE: return doubleQuotedString(ss.value, ctx);
				case Scalar.Scalar.QUOTE_SINGLE: return singleQuotedString(ss.value, ctx);
				case Scalar.Scalar.PLAIN: return plainString(ss, ctx, onComment, onChompKeep);
				default: return null;
			}
		};
		let res = _stringify(type);
		if (res === null) {
			const { defaultKeyType, defaultStringType } = ctx.options;
			const t = implicitKey && defaultKeyType || defaultStringType;
			res = _stringify(t);
			if (res === null) throw new Error(`Unsupported default string type ${t}`);
		}
		return res;
	}
	exports.stringifyString = stringifyString;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = /* @__PURE__ */ __commonJSMin(((exports) => {
	var anchors = require_anchors();
	var identity = require_identity();
	var stringifyComment = require_stringifyComment();
	var stringifyString = require_stringifyString();
	function createStringifyContext(doc, options) {
		const opt = Object.assign({
			blockQuote: true,
			commentString: stringifyComment.stringifyComment,
			defaultKeyType: null,
			defaultStringType: "PLAIN",
			directives: null,
			doubleQuotedAsJSON: false,
			doubleQuotedMinMultiLineLength: 40,
			falseStr: "false",
			flowCollectionPadding: true,
			indentSeq: true,
			lineWidth: 80,
			minContentWidth: 20,
			nullStr: "null",
			simpleKeys: false,
			singleQuote: null,
			trailingComma: false,
			trueStr: "true",
			verifyAliasOrder: true
		}, doc.schema.toStringOptions, options);
		let inFlow;
		switch (opt.collectionStyle) {
			case "block":
				inFlow = false;
				break;
			case "flow":
				inFlow = true;
				break;
			default: inFlow = null;
		}
		return {
			anchors: /* @__PURE__ */ new Set(),
			doc,
			flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
			indent: "",
			indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
			inFlow,
			options: opt
		};
	}
	function getTagObject(tags, item) {
		if (item.tag) {
			const match = tags.filter((t) => t.tag === item.tag);
			if (match.length > 0) return match.find((t) => t.format === item.format) ?? match[0];
		}
		let tagObj = void 0;
		let obj;
		if (identity.isScalar(item)) {
			obj = item.value;
			let match = tags.filter((t) => t.identify?.(obj));
			if (match.length > 1) {
				const testMatch = match.filter((t) => t.test);
				if (testMatch.length > 0) match = testMatch;
			}
			tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
		} else {
			obj = item;
			tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
		}
		if (!tagObj) {
			const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
			throw new Error(`Tag not resolved for ${name} value`);
		}
		return tagObj;
	}
	function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
		if (!doc.directives) return "";
		const props = [];
		const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
		if (anchor && anchors.anchorIsValid(anchor)) {
			anchors$1.add(anchor);
			props.push(`&${anchor}`);
		}
		const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
		if (tag) props.push(doc.directives.tagString(tag));
		return props.join(" ");
	}
	function stringify(item, ctx, onComment, onChompKeep) {
		if (identity.isPair(item)) return item.toString(ctx, onComment, onChompKeep);
		if (identity.isAlias(item)) {
			if (ctx.doc.directives) return item.toString(ctx);
			if (ctx.resolvedAliases?.has(item)) throw new TypeError(`Cannot stringify circular structure without alias nodes`);
			else {
				if (ctx.resolvedAliases) ctx.resolvedAliases.add(item);
				else ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
				item = item.resolve(ctx.doc);
			}
		}
		let tagObj = void 0;
		const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
		tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
		const props = stringifyProps(node, tagObj, ctx);
		if (props.length > 0) ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
		const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
		if (!props) return str;
		return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}\n${ctx.indent}${str}`;
	}
	exports.createStringifyContext = createStringifyContext;
	exports.stringify = stringify;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Scalar = require_Scalar();
	var stringify = require_stringify();
	var stringifyComment = require_stringifyComment();
	function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
		const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
		let keyComment = identity.isNode(key) && key.comment || null;
		if (simpleKeys) {
			if (keyComment) throw new Error("With simple keys, key nodes cannot have comments");
			if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") throw new Error("With simple keys, collection cannot be used as a key value");
		}
		let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
		ctx = Object.assign({}, ctx, {
			allNullValues: false,
			implicitKey: !explicitKey && (simpleKeys || !allNullValues),
			indent: indent + indentStep
		});
		let keyCommentDone = false;
		let chompKeep = false;
		let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
		if (!explicitKey && !ctx.inFlow && str.length > 1024) {
			if (simpleKeys) throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
			explicitKey = true;
		}
		if (ctx.inFlow) {
			if (allNullValues || value == null) {
				if (keyCommentDone && onComment) onComment();
				return str === "" ? "?" : explicitKey ? `? ${str}` : str;
			}
		} else if (allNullValues && !simpleKeys || value == null && explicitKey) {
			str = `? ${str}`;
			if (keyComment && !keyCommentDone) str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
			else if (chompKeep && onChompKeep) onChompKeep();
			return str;
		}
		if (keyCommentDone) keyComment = null;
		if (explicitKey) {
			if (keyComment) str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
			str = `? ${str}\n${indent}:`;
		} else {
			str = `${str}:`;
			if (keyComment) str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
		}
		let vsb, vcb, valueComment;
		if (identity.isNode(value)) {
			vsb = !!value.spaceBefore;
			vcb = value.commentBefore;
			valueComment = value.comment;
		} else {
			vsb = false;
			vcb = null;
			valueComment = null;
			if (value && typeof value === "object") value = doc.createNode(value);
		}
		ctx.implicitKey = false;
		if (!explicitKey && !keyComment && identity.isScalar(value)) ctx.indentAtStart = str.length + 1;
		chompKeep = false;
		if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) ctx.indent = ctx.indent.substring(2);
		let valueCommentDone = false;
		const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
		let ws = " ";
		if (keyComment || vsb || vcb) {
			ws = vsb ? "\n" : "";
			if (vcb) {
				const cs = commentString(vcb);
				ws += `\n${stringifyComment.indentComment(cs, ctx.indent)}`;
			}
			if (valueStr === "" && !ctx.inFlow) {
				if (ws === "\n" && valueComment) ws = "\n\n";
			} else ws += `\n${ctx.indent}`;
		} else if (!explicitKey && identity.isCollection(value)) {
			const vs0 = valueStr[0];
			const nl0 = valueStr.indexOf("\n");
			const hasNewline = nl0 !== -1;
			const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
			if (hasNewline || !flow) {
				let hasPropsLine = false;
				if (hasNewline && (vs0 === "&" || vs0 === "!")) {
					let sp0 = valueStr.indexOf(" ");
					if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") sp0 = valueStr.indexOf(" ", sp0 + 1);
					if (sp0 === -1 || nl0 < sp0) hasPropsLine = true;
				}
				if (!hasPropsLine) ws = `\n${ctx.indent}`;
			}
		} else if (valueStr === "" || valueStr[0] === "\n") ws = "";
		str += ws + valueStr;
		if (ctx.inFlow) {
			if (valueCommentDone && onComment) onComment();
		} else if (valueComment && !valueCommentDone) str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
		else if (chompKeep && onChompKeep) onChompKeep();
		return str;
	}
	exports.stringifyPair = stringifyPair;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/log.js
var require_log = /* @__PURE__ */ __commonJSMin(((exports) => {
	var node_process$2 = __require("process");
	function debug(logLevel, ...messages) {
		if (logLevel === "debug") console.log(...messages);
	}
	function warn(logLevel, warning) {
		if (logLevel === "debug" || logLevel === "warn") {
			if (typeof node_process$2.emitWarning === "function") node_process$2.emitWarning(warning);
			else console.warn(warning);
		}
	}
	exports.debug = debug;
	exports.warn = warn;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Scalar = require_Scalar();
	const MERGE_KEY = "<<";
	const merge = {
		identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
		default: "key",
		tag: "tag:yaml.org,2002:merge",
		test: /^<<$/,
		resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), { addToJSMap: addMergeToJSMap }),
		stringify: () => MERGE_KEY
	};
	const isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
	function addMergeToJSMap(ctx, map, value) {
		const source = resolveAliasValue(ctx, value);
		if (identity.isSeq(source)) for (const it of source.items) mergeValue(ctx, map, it);
		else if (Array.isArray(source)) for (const it of source) mergeValue(ctx, map, it);
		else mergeValue(ctx, map, source);
	}
	function mergeValue(ctx, map, value) {
		const source = resolveAliasValue(ctx, value);
		if (!identity.isMap(source)) throw new Error("Merge sources must be maps or map aliases");
		const srcMap = source.toJSON(null, ctx, Map);
		for (const [key, value] of srcMap) if (map instanceof Map) {
			if (!map.has(key)) map.set(key, value);
		} else if (map instanceof Set) map.add(key);
		else if (!Object.prototype.hasOwnProperty.call(map, key)) Object.defineProperty(map, key, {
			value,
			writable: true,
			enumerable: true,
			configurable: true
		});
		return map;
	}
	function resolveAliasValue(ctx, value) {
		return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
	}
	exports.addMergeToJSMap = addMergeToJSMap;
	exports.isMergeKey = isMergeKey;
	exports.merge = merge;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = /* @__PURE__ */ __commonJSMin(((exports) => {
	var log = require_log();
	var merge = require_merge();
	var stringify = require_stringify();
	var identity = require_identity();
	var toJS = require_toJS();
	function addPairToJSMap(ctx, map, { key, value }) {
		if (identity.isNode(key) && key.addToJSMap) key.addToJSMap(ctx, map, value);
		else if (merge.isMergeKey(ctx, key)) merge.addMergeToJSMap(ctx, map, value);
		else {
			const jsKey = toJS.toJS(key, "", ctx);
			if (map instanceof Map) map.set(jsKey, toJS.toJS(value, jsKey, ctx));
			else if (map instanceof Set) map.add(jsKey);
			else {
				const stringKey = stringifyKey(key, jsKey, ctx);
				const jsValue = toJS.toJS(value, stringKey, ctx);
				if (stringKey in map) Object.defineProperty(map, stringKey, {
					value: jsValue,
					writable: true,
					enumerable: true,
					configurable: true
				});
				else map[stringKey] = jsValue;
			}
		}
		return map;
	}
	function stringifyKey(key, jsKey, ctx) {
		if (jsKey === null) return "";
		if (typeof jsKey !== "object") return String(jsKey);
		if (identity.isNode(key) && ctx?.doc) {
			const strCtx = stringify.createStringifyContext(ctx.doc, {});
			strCtx.anchors = /* @__PURE__ */ new Set();
			for (const node of ctx.anchors.keys()) strCtx.anchors.add(node.anchor);
			strCtx.inFlow = true;
			strCtx.inStringifyKey = true;
			const strKey = key.toString(strCtx);
			if (!ctx.mapKeyWarned) {
				let jsonStr = JSON.stringify(strKey);
				if (jsonStr.length > 40) jsonStr = jsonStr.substring(0, 36) + "...\"";
				log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
				ctx.mapKeyWarned = true;
			}
			return strKey;
		}
		return JSON.stringify(jsKey);
	}
	exports.addPairToJSMap = addPairToJSMap;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = /* @__PURE__ */ __commonJSMin(((exports) => {
	var createNode = require_createNode();
	var stringifyPair = require_stringifyPair();
	var addPairToJSMap = require_addPairToJSMap();
	var identity = require_identity();
	function createPair(key, value, ctx) {
		return new Pair(createNode.createNode(key, void 0, ctx), createNode.createNode(value, void 0, ctx));
	}
	var Pair = class Pair {
		constructor(key, value = null) {
			Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
			this.key = key;
			this.value = value;
		}
		clone(schema) {
			let { key, value } = this;
			if (identity.isNode(key)) key = key.clone(schema);
			if (identity.isNode(value)) value = value.clone(schema);
			return new Pair(key, value);
		}
		toJSON(_, ctx) {
			const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
			return addPairToJSMap.addPairToJSMap(ctx, pair, this);
		}
		toString(ctx, onComment, onChompKeep) {
			return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
		}
	};
	exports.Pair = Pair;
	exports.createPair = createPair;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var stringify = require_stringify();
	var stringifyComment = require_stringifyComment();
	function stringifyCollection(collection, ctx, options) {
		return (ctx.inFlow ?? collection.flow ? stringifyFlowCollection : stringifyBlockCollection)(collection, ctx, options);
	}
	function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
		const { indent, options: { commentString } } = ctx;
		const itemCtx = Object.assign({}, ctx, {
			indent: itemIndent,
			type: null
		});
		let chompKeep = false;
		const lines = [];
		for (let i = 0; i < items.length; ++i) {
			const item = items[i];
			let comment = null;
			if (identity.isNode(item)) {
				if (!chompKeep && item.spaceBefore) lines.push("");
				addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
				if (item.comment) comment = item.comment;
			} else if (identity.isPair(item)) {
				const ik = identity.isNode(item.key) ? item.key : null;
				if (ik) {
					if (!chompKeep && ik.spaceBefore) lines.push("");
					addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
				}
			}
			chompKeep = false;
			let str = stringify.stringify(item, itemCtx, () => comment = null, () => chompKeep = true);
			if (comment) str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
			if (chompKeep && comment) chompKeep = false;
			lines.push(blockItemPrefix + str);
		}
		let str;
		if (lines.length === 0) str = flowChars.start + flowChars.end;
		else {
			str = lines[0];
			for (let i = 1; i < lines.length; ++i) {
				const line = lines[i];
				str += line ? `\n${indent}${line}` : "\n";
			}
		}
		if (comment) {
			str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
			if (onComment) onComment();
		} else if (chompKeep && onChompKeep) onChompKeep();
		return str;
	}
	function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
		const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
		itemIndent += indentStep;
		const itemCtx = Object.assign({}, ctx, {
			indent: itemIndent,
			inFlow: true,
			type: null
		});
		let reqNewline = false;
		let linesAtValue = 0;
		const lines = [];
		for (let i = 0; i < items.length; ++i) {
			const item = items[i];
			let comment = null;
			if (identity.isNode(item)) {
				if (item.spaceBefore) lines.push("");
				addCommentBefore(ctx, lines, item.commentBefore, false);
				if (item.comment) comment = item.comment;
			} else if (identity.isPair(item)) {
				const ik = identity.isNode(item.key) ? item.key : null;
				if (ik) {
					if (ik.spaceBefore) lines.push("");
					addCommentBefore(ctx, lines, ik.commentBefore, false);
					if (ik.comment) reqNewline = true;
				}
				const iv = identity.isNode(item.value) ? item.value : null;
				if (iv) {
					if (iv.comment) comment = iv.comment;
					if (iv.commentBefore) reqNewline = true;
				} else if (item.value == null && ik?.comment) comment = ik.comment;
			}
			if (comment) reqNewline = true;
			let str = stringify.stringify(item, itemCtx, () => comment = null);
			reqNewline || (reqNewline = lines.length > linesAtValue || str.includes("\n"));
			if (i < items.length - 1) str += ",";
			else if (ctx.options.trailingComma) {
				if (ctx.options.lineWidth > 0) reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
				if (reqNewline) str += ",";
			}
			if (comment) str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
			lines.push(str);
			linesAtValue = lines.length;
		}
		const { start, end } = flowChars;
		if (lines.length === 0) return start + end;
		else {
			if (!reqNewline) {
				const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
				reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
			}
			if (reqNewline) {
				let str = start;
				for (const line of lines) str += line ? `\n${indentStep}${indent}${line}` : "\n";
				return `${str}\n${indent}${end}`;
			} else return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
		}
	}
	function addCommentBefore({ indent, options: { commentString } }, lines, comment, chompKeep) {
		if (comment && chompKeep) comment = comment.replace(/^\n+/, "");
		if (comment) {
			const ic = stringifyComment.indentComment(commentString(comment), indent);
			lines.push(ic.trimStart());
		}
	}
	exports.stringifyCollection = stringifyCollection;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stringifyCollection = require_stringifyCollection();
	var addPairToJSMap = require_addPairToJSMap();
	var Collection = require_Collection();
	var identity = require_identity();
	var Pair = require_Pair();
	var Scalar = require_Scalar();
	function findPair(items, key) {
		const k = identity.isScalar(key) ? key.value : key;
		for (const it of items) if (identity.isPair(it)) {
			if (it.key === key || it.key === k) return it;
			if (identity.isScalar(it.key) && it.key.value === k) return it;
		}
	}
	var YAMLMap = class extends Collection.Collection {
		static get tagName() {
			return "tag:yaml.org,2002:map";
		}
		constructor(schema) {
			super(identity.MAP, schema);
			this.items = [];
		}
		/**
		* A generic collection parsing method that can be extended
		* to other node classes that inherit from YAMLMap
		*/
		static from(schema, obj, ctx) {
			const { keepUndefined, replacer } = ctx;
			const map = new this(schema);
			const add = (key, value) => {
				if (typeof replacer === "function") value = replacer.call(obj, key, value);
				else if (Array.isArray(replacer) && !replacer.includes(key)) return;
				if (value !== void 0 || keepUndefined) map.items.push(Pair.createPair(key, value, ctx));
			};
			if (obj instanceof Map) for (const [key, value] of obj) add(key, value);
			else if (obj && typeof obj === "object") for (const key of Object.keys(obj)) add(key, obj[key]);
			if (typeof schema.sortMapEntries === "function") map.items.sort(schema.sortMapEntries);
			return map;
		}
		/**
		* Adds a value to the collection.
		*
		* @param overwrite - If not set `true`, using a key that is already in the
		*   collection will throw. Otherwise, overwrites the previous value.
		*/
		add(pair, overwrite) {
			let _pair;
			if (identity.isPair(pair)) _pair = pair;
			else if (!pair || typeof pair !== "object" || !("key" in pair)) _pair = new Pair.Pair(pair, pair?.value);
			else _pair = new Pair.Pair(pair.key, pair.value);
			const prev = findPair(this.items, _pair.key);
			const sortEntries = this.schema?.sortMapEntries;
			if (prev) {
				if (!overwrite) throw new Error(`Key ${_pair.key} already set`);
				if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value)) prev.value.value = _pair.value;
				else prev.value = _pair.value;
			} else if (sortEntries) {
				const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
				if (i === -1) this.items.push(_pair);
				else this.items.splice(i, 0, _pair);
			} else this.items.push(_pair);
		}
		delete(key) {
			const it = findPair(this.items, key);
			if (!it) return false;
			return this.items.splice(this.items.indexOf(it), 1).length > 0;
		}
		get(key, keepScalar) {
			const node = findPair(this.items, key)?.value;
			return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
		}
		has(key) {
			return !!findPair(this.items, key);
		}
		set(key, value) {
			this.add(new Pair.Pair(key, value), true);
		}
		/**
		* @param ctx - Conversion context, originally set in Document#toJS()
		* @param {Class} Type - If set, forces the returned collection type
		* @returns Instance of Type, Map, or Object
		*/
		toJSON(_, ctx, Type) {
			const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
			if (ctx?.onCreate) ctx.onCreate(map);
			for (const item of this.items) addPairToJSMap.addPairToJSMap(ctx, map, item);
			return map;
		}
		toString(ctx, onComment, onChompKeep) {
			if (!ctx) return JSON.stringify(this);
			for (const item of this.items) if (!identity.isPair(item)) throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
			if (!ctx.allNullValues && this.hasAllNullValues(false)) ctx = Object.assign({}, ctx, { allNullValues: true });
			return stringifyCollection.stringifyCollection(this, ctx, {
				blockItemPrefix: "",
				flowChars: {
					start: "{",
					end: "}"
				},
				itemIndent: ctx.indent || "",
				onChompKeep,
				onComment
			});
		}
	};
	exports.YAMLMap = YAMLMap;
	exports.findPair = findPair;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/map.js
var require_map = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var YAMLMap = require_YAMLMap();
	exports.map = {
		collection: "map",
		default: true,
		nodeClass: YAMLMap.YAMLMap,
		tag: "tag:yaml.org,2002:map",
		resolve(map, onError) {
			if (!identity.isMap(map)) onError("Expected a mapping for this tag");
			return map;
		},
		createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
	};
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = /* @__PURE__ */ __commonJSMin(((exports) => {
	var createNode = require_createNode();
	var stringifyCollection = require_stringifyCollection();
	var Collection = require_Collection();
	var identity = require_identity();
	var Scalar = require_Scalar();
	var toJS = require_toJS();
	var YAMLSeq = class extends Collection.Collection {
		static get tagName() {
			return "tag:yaml.org,2002:seq";
		}
		constructor(schema) {
			super(identity.SEQ, schema);
			this.items = [];
		}
		add(value) {
			this.items.push(value);
		}
		/**
		* Removes a value from the collection.
		*
		* `key` must contain a representation of an integer for this to succeed.
		* It may be wrapped in a `Scalar`.
		*
		* @returns `true` if the item was found and removed.
		*/
		delete(key) {
			const idx = asItemIndex(key);
			if (typeof idx !== "number") return false;
			return this.items.splice(idx, 1).length > 0;
		}
		get(key, keepScalar) {
			const idx = asItemIndex(key);
			if (typeof idx !== "number") return void 0;
			const it = this.items[idx];
			return !keepScalar && identity.isScalar(it) ? it.value : it;
		}
		/**
		* Checks if the collection includes a value with the key `key`.
		*
		* `key` must contain a representation of an integer for this to succeed.
		* It may be wrapped in a `Scalar`.
		*/
		has(key) {
			const idx = asItemIndex(key);
			return typeof idx === "number" && idx < this.items.length;
		}
		/**
		* Sets a value in this collection. For `!!set`, `value` needs to be a
		* boolean to add/remove the item from the set.
		*
		* If `key` does not contain a representation of an integer, this will throw.
		* It may be wrapped in a `Scalar`.
		*/
		set(key, value) {
			const idx = asItemIndex(key);
			if (typeof idx !== "number") throw new Error(`Expected a valid index, not ${key}.`);
			const prev = this.items[idx];
			if (identity.isScalar(prev) && Scalar.isScalarValue(value)) prev.value = value;
			else this.items[idx] = value;
		}
		toJSON(_, ctx) {
			const seq = [];
			if (ctx?.onCreate) ctx.onCreate(seq);
			let i = 0;
			for (const item of this.items) seq.push(toJS.toJS(item, String(i++), ctx));
			return seq;
		}
		toString(ctx, onComment, onChompKeep) {
			if (!ctx) return JSON.stringify(this);
			return stringifyCollection.stringifyCollection(this, ctx, {
				blockItemPrefix: "- ",
				flowChars: {
					start: "[",
					end: "]"
				},
				itemIndent: (ctx.indent || "") + "  ",
				onChompKeep,
				onComment
			});
		}
		static from(schema, obj, ctx) {
			const { replacer } = ctx;
			const seq = new this(schema);
			if (obj && Symbol.iterator in Object(obj)) {
				let i = 0;
				for (let it of obj) {
					if (typeof replacer === "function") {
						const key = obj instanceof Set ? it : String(i++);
						it = replacer.call(obj, key, it);
					}
					seq.items.push(createNode.createNode(it, void 0, ctx));
				}
			}
			return seq;
		}
	};
	function asItemIndex(key) {
		let idx = identity.isScalar(key) ? key.value : key;
		if (idx && typeof idx === "string") idx = Number(idx);
		return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
	}
	exports.YAMLSeq = YAMLSeq;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/seq.js
var require_seq = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var YAMLSeq = require_YAMLSeq();
	exports.seq = {
		collection: "seq",
		default: true,
		nodeClass: YAMLSeq.YAMLSeq,
		tag: "tag:yaml.org,2002:seq",
		resolve(seq, onError) {
			if (!identity.isSeq(seq)) onError("Expected a sequence for this tag");
			return seq;
		},
		createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
	};
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/string.js
var require_string = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stringifyString = require_stringifyString();
	exports.string = {
		identify: (value) => typeof value === "string",
		default: true,
		tag: "tag:yaml.org,2002:str",
		resolve: (str) => str,
		stringify(item, ctx, onComment, onChompKeep) {
			ctx = Object.assign({ actualString: true }, ctx);
			return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/common/null.js
var require_null = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	const nullTag = {
		identify: (value) => value == null,
		createNode: () => new Scalar.Scalar(null),
		default: true,
		tag: "tag:yaml.org,2002:null",
		test: /^(?:~|[Nn]ull|NULL)?$/,
		resolve: () => new Scalar.Scalar(null),
		stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
	};
	exports.nullTag = nullTag;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/bool.js
var require_bool$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	const boolTag = {
		identify: (value) => typeof value === "boolean",
		default: true,
		tag: "tag:yaml.org,2002:bool",
		test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
		resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
		stringify({ source, value }, ctx) {
			if (source && boolTag.test.test(source)) {
				if (value === (source[0] === "t" || source[0] === "T")) return source;
			}
			return value ? ctx.options.trueStr : ctx.options.falseStr;
		}
	};
	exports.boolTag = boolTag;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = /* @__PURE__ */ __commonJSMin(((exports) => {
	function stringifyNumber({ format, minFractionDigits, tag, value }) {
		if (typeof value === "bigint") return String(value);
		const num = typeof value === "number" ? value : Number(value);
		if (!isFinite(num)) return isNaN(num) ? ".nan" : num < 0 ? "-.inf" : ".inf";
		let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
		if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
			let i = n.indexOf(".");
			if (i < 0) {
				i = n.length;
				n += ".";
			}
			let d = minFractionDigits - (n.length - i - 1);
			while (d-- > 0) n += "0";
		}
		return n;
	}
	exports.stringifyNumber = stringifyNumber;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/float.js
var require_float$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	var stringifyNumber = require_stringifyNumber();
	const floatNaN = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
		resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
		stringify: stringifyNumber.stringifyNumber
	};
	const floatExp = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		format: "EXP",
		test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
		resolve: (str) => parseFloat(str),
		stringify(node) {
			const num = Number(node.value);
			return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
		}
	};
	exports.float = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
		resolve(str) {
			const node = new Scalar.Scalar(parseFloat(str));
			const dot = str.indexOf(".");
			if (dot !== -1 && str[str.length - 1] === "0") node.minFractionDigits = str.length - dot - 1;
			return node;
		},
		stringify: stringifyNumber.stringifyNumber
	};
	exports.floatExp = floatExp;
	exports.floatNaN = floatNaN;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/int.js
var require_int$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stringifyNumber = require_stringifyNumber();
	const intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
	const intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
	function intStringify(node, radix, prefix) {
		const { value } = node;
		if (intIdentify(value) && value >= 0) return prefix + value.toString(radix);
		return stringifyNumber.stringifyNumber(node);
	}
	const intOct = {
		identify: (value) => intIdentify(value) && value >= 0,
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "OCT",
		test: /^0o[0-7]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
		stringify: (node) => intStringify(node, 8, "0o")
	};
	const int = {
		identify: intIdentify,
		default: true,
		tag: "tag:yaml.org,2002:int",
		test: /^[-+]?[0-9]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
		stringify: stringifyNumber.stringifyNumber
	};
	const intHex = {
		identify: (value) => intIdentify(value) && value >= 0,
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "HEX",
		test: /^0x[0-9a-fA-F]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
		stringify: (node) => intStringify(node, 16, "0x")
	};
	exports.int = int;
	exports.intHex = intHex;
	exports.intOct = intOct;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/core/schema.js
var require_schema$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var map = require_map();
	var _null = require_null();
	var seq = require_seq();
	var string = require_string();
	var bool = require_bool$1();
	var float = require_float$1();
	var int = require_int$1();
	exports.schema = [
		map.map,
		seq.seq,
		string.string,
		_null.nullTag,
		bool.boolTag,
		int.intOct,
		int.int,
		int.intHex,
		float.floatNaN,
		float.floatExp,
		float.float
	];
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/json/schema.js
var require_schema$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	var map = require_map();
	var seq = require_seq();
	function intIdentify(value) {
		return typeof value === "bigint" || Number.isInteger(value);
	}
	const stringifyJSON = ({ value }) => JSON.stringify(value);
	const jsonScalars = [
		{
			identify: (value) => typeof value === "string",
			default: true,
			tag: "tag:yaml.org,2002:str",
			resolve: (str) => str,
			stringify: stringifyJSON
		},
		{
			identify: (value) => value == null,
			createNode: () => new Scalar.Scalar(null),
			default: true,
			tag: "tag:yaml.org,2002:null",
			test: /^null$/,
			resolve: () => null,
			stringify: stringifyJSON
		},
		{
			identify: (value) => typeof value === "boolean",
			default: true,
			tag: "tag:yaml.org,2002:bool",
			test: /^true$|^false$/,
			resolve: (str) => str === "true",
			stringify: stringifyJSON
		},
		{
			identify: intIdentify,
			default: true,
			tag: "tag:yaml.org,2002:int",
			test: /^-?(?:0|[1-9][0-9]*)$/,
			resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
			stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
		},
		{
			identify: (value) => typeof value === "number",
			default: true,
			tag: "tag:yaml.org,2002:float",
			test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
			resolve: (str) => parseFloat(str),
			stringify: stringifyJSON
		}
	];
	exports.schema = [map.map, seq.seq].concat(jsonScalars, {
		default: true,
		tag: "",
		test: /^/,
		resolve(str, onError) {
			onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
			return str;
		}
	});
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = /* @__PURE__ */ __commonJSMin(((exports) => {
	var node_buffer = __require("buffer");
	var Scalar = require_Scalar();
	var stringifyString = require_stringifyString();
	exports.binary = {
		identify: (value) => value instanceof Uint8Array,
		default: false,
		tag: "tag:yaml.org,2002:binary",
		/**
		* Returns a Buffer in node and an Uint8Array in browsers
		*
		* To use the resulting buffer as an image, you'll want to do something like:
		*
		*   const blob = new Blob([buffer], { type: 'image/jpeg' })
		*   document.querySelector('#photo').src = URL.createObjectURL(blob)
		*/
		resolve(src, onError) {
			if (typeof node_buffer.Buffer === "function") return node_buffer.Buffer.from(src, "base64");
			else if (typeof atob === "function") {
				const str = atob(src.replace(/[\n\r]/g, ""));
				const buffer = new Uint8Array(str.length);
				for (let i = 0; i < str.length; ++i) buffer[i] = str.charCodeAt(i);
				return buffer;
			} else {
				onError("This environment does not support reading binary tags; either Buffer or atob is required");
				return src;
			}
		},
		stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
			if (!value) return "";
			const buf = value;
			let str;
			if (typeof node_buffer.Buffer === "function") str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
			else if (typeof btoa === "function") {
				let s = "";
				for (let i = 0; i < buf.length; ++i) s += String.fromCharCode(buf[i]);
				str = btoa(s);
			} else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
			type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
			if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
				const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
				const n = Math.ceil(str.length / lineWidth);
				const lines = new Array(n);
				for (let i = 0, o = 0; i < n; ++i, o += lineWidth) lines[i] = str.substr(o, lineWidth);
				str = lines.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
			}
			return stringifyString.stringifyString({
				comment,
				type,
				value: str
			}, ctx, onComment, onChompKeep);
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Pair = require_Pair();
	var Scalar = require_Scalar();
	var YAMLSeq = require_YAMLSeq();
	function resolvePairs(seq, onError) {
		if (identity.isSeq(seq)) for (let i = 0; i < seq.items.length; ++i) {
			let item = seq.items[i];
			if (identity.isPair(item)) continue;
			else if (identity.isMap(item)) {
				if (item.items.length > 1) onError("Each pair must have its own sequence indicator");
				const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
				if (item.commentBefore) pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}\n${pair.key.commentBefore}` : item.commentBefore;
				if (item.comment) {
					const cn = pair.value ?? pair.key;
					cn.comment = cn.comment ? `${item.comment}\n${cn.comment}` : item.comment;
				}
				item = pair;
			}
			seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
		}
		else onError("Expected a sequence for this tag");
		return seq;
	}
	function createPairs(schema, iterable, ctx) {
		const { replacer } = ctx;
		const pairs = new YAMLSeq.YAMLSeq(schema);
		pairs.tag = "tag:yaml.org,2002:pairs";
		let i = 0;
		if (iterable && Symbol.iterator in Object(iterable)) for (let it of iterable) {
			if (typeof replacer === "function") it = replacer.call(iterable, String(i++), it);
			let key, value;
			if (Array.isArray(it)) {
				if (it.length === 2) {
					key = it[0];
					value = it[1];
				} else throw new TypeError(`Expected [key, value] tuple: ${it}`);
			} else if (it && it instanceof Object) {
				const keys = Object.keys(it);
				if (keys.length === 1) {
					key = keys[0];
					value = it[key];
				} else throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
			} else key = it;
			pairs.items.push(Pair.createPair(key, value, ctx));
		}
		return pairs;
	}
	const pairs = {
		collection: "seq",
		default: false,
		tag: "tag:yaml.org,2002:pairs",
		resolve: resolvePairs,
		createNode: createPairs
	};
	exports.createPairs = createPairs;
	exports.pairs = pairs;
	exports.resolvePairs = resolvePairs;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var toJS = require_toJS();
	var YAMLMap = require_YAMLMap();
	var YAMLSeq = require_YAMLSeq();
	var pairs = require_pairs();
	var YAMLOMap = class YAMLOMap extends YAMLSeq.YAMLSeq {
		constructor() {
			super();
			this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
			this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
			this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
			this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
			this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
			this.tag = YAMLOMap.tag;
		}
		/**
		* If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
		* but TypeScript won't allow widening the signature of a child method.
		*/
		toJSON(_, ctx) {
			if (!ctx) return super.toJSON(_);
			const map = /* @__PURE__ */ new Map();
			if (ctx?.onCreate) ctx.onCreate(map);
			for (const pair of this.items) {
				let key, value;
				if (identity.isPair(pair)) {
					key = toJS.toJS(pair.key, "", ctx);
					value = toJS.toJS(pair.value, key, ctx);
				} else key = toJS.toJS(pair, "", ctx);
				if (map.has(key)) throw new Error("Ordered maps must not include duplicate keys");
				map.set(key, value);
			}
			return map;
		}
		static from(schema, iterable, ctx) {
			const pairs$1 = pairs.createPairs(schema, iterable, ctx);
			const omap = new this();
			omap.items = pairs$1.items;
			return omap;
		}
	};
	YAMLOMap.tag = "tag:yaml.org,2002:omap";
	const omap = {
		collection: "seq",
		identify: (value) => value instanceof Map,
		nodeClass: YAMLOMap,
		default: false,
		tag: "tag:yaml.org,2002:omap",
		resolve(seq, onError) {
			const pairs$1 = pairs.resolvePairs(seq, onError);
			const seenKeys = [];
			for (const { key } of pairs$1.items) if (identity.isScalar(key)) {
				if (seenKeys.includes(key.value)) onError(`Ordered maps must not include duplicate keys: ${key.value}`);
				else seenKeys.push(key.value);
			}
			return Object.assign(new YAMLOMap(), pairs$1);
		},
		createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
	};
	exports.YAMLOMap = YAMLOMap;
	exports.omap = omap;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	function boolStringify({ value, source }, ctx) {
		if (source && (value ? trueTag : falseTag).test.test(source)) return source;
		return value ? ctx.options.trueStr : ctx.options.falseStr;
	}
	const trueTag = {
		identify: (value) => value === true,
		default: true,
		tag: "tag:yaml.org,2002:bool",
		test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
		resolve: () => new Scalar.Scalar(true),
		stringify: boolStringify
	};
	const falseTag = {
		identify: (value) => value === false,
		default: true,
		tag: "tag:yaml.org,2002:bool",
		test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
		resolve: () => new Scalar.Scalar(false),
		stringify: boolStringify
	};
	exports.falseTag = falseTag;
	exports.trueTag = trueTag;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	var stringifyNumber = require_stringifyNumber();
	const floatNaN = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
		resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
		stringify: stringifyNumber.stringifyNumber
	};
	const floatExp = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		format: "EXP",
		test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
		resolve: (str) => parseFloat(str.replace(/_/g, "")),
		stringify(node) {
			const num = Number(node.value);
			return isFinite(num) ? num.toExponential() : stringifyNumber.stringifyNumber(node);
		}
	};
	exports.float = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
		resolve(str) {
			const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
			const dot = str.indexOf(".");
			if (dot !== -1) {
				const f = str.substring(dot + 1).replace(/_/g, "");
				if (f[f.length - 1] === "0") node.minFractionDigits = f.length;
			}
			return node;
		},
		stringify: stringifyNumber.stringifyNumber
	};
	exports.floatExp = floatExp;
	exports.floatNaN = floatNaN;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stringifyNumber = require_stringifyNumber();
	const intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
	function intResolve(str, offset, radix, { intAsBigInt }) {
		const sign = str[0];
		if (sign === "-" || sign === "+") offset += 1;
		str = str.substring(offset).replace(/_/g, "");
		if (intAsBigInt) {
			switch (radix) {
				case 2:
					str = `0b${str}`;
					break;
				case 8:
					str = `0o${str}`;
					break;
				case 16: str = `0x${str}`;
			}
			const n = BigInt(str);
			return sign === "-" ? BigInt(-1) * n : n;
		}
		const n = parseInt(str, radix);
		return sign === "-" ? -1 * n : n;
	}
	function intStringify(node, radix, prefix) {
		const { value } = node;
		if (intIdentify(value)) {
			const str = value.toString(radix);
			return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
		}
		return stringifyNumber.stringifyNumber(node);
	}
	const intBin = {
		identify: intIdentify,
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "BIN",
		test: /^[-+]?0b[0-1_]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
		stringify: (node) => intStringify(node, 2, "0b")
	};
	const intOct = {
		identify: intIdentify,
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "OCT",
		test: /^[-+]?0[0-7_]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
		stringify: (node) => intStringify(node, 8, "0")
	};
	const int = {
		identify: intIdentify,
		default: true,
		tag: "tag:yaml.org,2002:int",
		test: /^[-+]?[0-9][0-9_]*$/,
		resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
		stringify: stringifyNumber.stringifyNumber
	};
	const intHex = {
		identify: intIdentify,
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "HEX",
		test: /^[-+]?0x[0-9a-fA-F_]+$/,
		resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
		stringify: (node) => intStringify(node, 16, "0x")
	};
	exports.int = int;
	exports.intBin = intBin;
	exports.intHex = intHex;
	exports.intOct = intOct;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Pair = require_Pair();
	var YAMLMap = require_YAMLMap();
	var YAMLSet = class YAMLSet extends YAMLMap.YAMLMap {
		constructor(schema) {
			super(schema);
			this.tag = YAMLSet.tag;
		}
		add(key) {
			let pair;
			if (identity.isPair(key)) pair = key;
			else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null) pair = new Pair.Pair(key.key, null);
			else pair = new Pair.Pair(key, null);
			if (!YAMLMap.findPair(this.items, pair.key)) this.items.push(pair);
		}
		/**
		* If `keepPair` is `true`, returns the Pair matching `key`.
		* Otherwise, returns the value of that Pair's key.
		*/
		get(key, keepPair) {
			const pair = YAMLMap.findPair(this.items, key);
			return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
		}
		set(key, value) {
			if (typeof value !== "boolean") throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
			const prev = YAMLMap.findPair(this.items, key);
			if (prev && !value) this.items.splice(this.items.indexOf(prev), 1);
			else if (!prev && value) this.items.push(new Pair.Pair(key));
		}
		toJSON(_, ctx) {
			return super.toJSON(_, ctx, Set);
		}
		toString(ctx, onComment, onChompKeep) {
			if (!ctx) return JSON.stringify(this);
			if (this.hasAllNullValues(true)) return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
			else throw new Error("Set items must all have null values");
		}
		static from(schema, iterable, ctx) {
			const { replacer } = ctx;
			const set = new this(schema);
			if (iterable && Symbol.iterator in Object(iterable)) for (let value of iterable) {
				if (typeof replacer === "function") value = replacer.call(iterable, value, value);
				set.items.push(Pair.createPair(value, null, ctx));
			}
			return set;
		}
	};
	YAMLSet.tag = "tag:yaml.org,2002:set";
	const set = {
		collection: "map",
		identify: (value) => value instanceof Set,
		nodeClass: YAMLSet,
		default: false,
		tag: "tag:yaml.org,2002:set",
		createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
		resolve(map, onError) {
			if (identity.isMap(map)) {
				if (map.hasAllNullValues(true)) return Object.assign(new YAMLSet(), map);
				else onError("Set items must all have null values");
			} else onError("Expected a mapping for this tag");
			return map;
		}
	};
	exports.YAMLSet = YAMLSet;
	exports.set = set;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = /* @__PURE__ */ __commonJSMin(((exports) => {
	var stringifyNumber = require_stringifyNumber();
	/** Internal types handle bigint as number, because TS can't figure it out. */
	function parseSexagesimal(str, asBigInt) {
		const sign = str[0];
		const parts = sign === "-" || sign === "+" ? str.substring(1) : str;
		const num = (n) => asBigInt ? BigInt(n) : Number(n);
		const res = parts.replace(/_/g, "").split(":").reduce((res, p) => res * num(60) + num(p), num(0));
		return sign === "-" ? num(-1) * res : res;
	}
	/**
	* hhhh:mm:ss.sss
	*
	* Internal types handle bigint as number, because TS can't figure it out.
	*/
	function stringifySexagesimal(node) {
		let { value } = node;
		let num = (n) => n;
		if (typeof value === "bigint") num = (n) => BigInt(n);
		else if (isNaN(value) || !isFinite(value)) return stringifyNumber.stringifyNumber(node);
		let sign = "";
		if (value < 0) {
			sign = "-";
			value *= num(-1);
		}
		const _60 = num(60);
		const parts = [value % _60];
		if (value < 60) parts.unshift(0);
		else {
			value = (value - parts[0]) / _60;
			parts.unshift(value % _60);
			if (value >= 60) {
				value = (value - parts[0]) / _60;
				parts.unshift(value);
			}
		}
		return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
	}
	const intTime = {
		identify: (value) => typeof value === "bigint" || Number.isInteger(value),
		default: true,
		tag: "tag:yaml.org,2002:int",
		format: "TIME",
		test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
		resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
		stringify: stringifySexagesimal
	};
	const floatTime = {
		identify: (value) => typeof value === "number",
		default: true,
		tag: "tag:yaml.org,2002:float",
		format: "TIME",
		test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
		resolve: (str) => parseSexagesimal(str, false),
		stringify: stringifySexagesimal
	};
	const timestamp = {
		identify: (value) => value instanceof Date,
		default: true,
		tag: "tag:yaml.org,2002:timestamp",
		test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
		resolve(str) {
			const match = str.match(timestamp.test);
			if (!match) throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
			const [, year, month, day, hour, minute, second] = match.map(Number);
			const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
			let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
			const tz = match[8];
			if (tz && tz !== "Z") {
				let d = parseSexagesimal(tz, false);
				if (Math.abs(d) < 30) d *= 60;
				date -= 6e4 * d;
			}
			return new Date(date);
		},
		stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
	};
	exports.floatTime = floatTime;
	exports.intTime = intTime;
	exports.timestamp = timestamp;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema = /* @__PURE__ */ __commonJSMin(((exports) => {
	var map = require_map();
	var _null = require_null();
	var seq = require_seq();
	var string = require_string();
	var binary = require_binary();
	var bool = require_bool();
	var float = require_float();
	var int = require_int();
	var merge = require_merge();
	var omap = require_omap();
	var pairs = require_pairs();
	var set = require_set();
	var timestamp = require_timestamp();
	exports.schema = [
		map.map,
		seq.seq,
		string.string,
		_null.nullTag,
		bool.trueTag,
		bool.falseTag,
		int.intBin,
		int.intOct,
		int.int,
		int.intHex,
		float.floatNaN,
		float.floatExp,
		float.float,
		binary.binary,
		merge.merge,
		omap.omap,
		pairs.pairs,
		set.set,
		timestamp.intTime,
		timestamp.floatTime,
		timestamp.timestamp
	];
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/tags.js
var require_tags = /* @__PURE__ */ __commonJSMin(((exports) => {
	var map = require_map();
	var _null = require_null();
	var seq = require_seq();
	var string = require_string();
	var bool = require_bool$1();
	var float = require_float$1();
	var int = require_int$1();
	var schema = require_schema$2();
	var schema$1 = require_schema$1();
	var binary = require_binary();
	var merge = require_merge();
	var omap = require_omap();
	var pairs = require_pairs();
	var schema$2 = require_schema();
	var set = require_set();
	var timestamp = require_timestamp();
	const schemas = /* @__PURE__ */ new Map([
		["core", schema.schema],
		["failsafe", [
			map.map,
			seq.seq,
			string.string
		]],
		["json", schema$1.schema],
		["yaml11", schema$2.schema],
		["yaml-1.1", schema$2.schema]
	]);
	const tagsByName = {
		binary: binary.binary,
		bool: bool.boolTag,
		float: float.float,
		floatExp: float.floatExp,
		floatNaN: float.floatNaN,
		floatTime: timestamp.floatTime,
		int: int.int,
		intHex: int.intHex,
		intOct: int.intOct,
		intTime: timestamp.intTime,
		map: map.map,
		merge: merge.merge,
		null: _null.nullTag,
		omap: omap.omap,
		pairs: pairs.pairs,
		seq: seq.seq,
		set: set.set,
		timestamp: timestamp.timestamp
	};
	const coreKnownTags = {
		"tag:yaml.org,2002:binary": binary.binary,
		"tag:yaml.org,2002:merge": merge.merge,
		"tag:yaml.org,2002:omap": omap.omap,
		"tag:yaml.org,2002:pairs": pairs.pairs,
		"tag:yaml.org,2002:set": set.set,
		"tag:yaml.org,2002:timestamp": timestamp.timestamp
	};
	function getTags(customTags, schemaName, addMergeTag) {
		const schemaTags = schemas.get(schemaName);
		if (schemaTags && !customTags) return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
		let tags = schemaTags;
		if (!tags) {
			if (Array.isArray(customTags)) tags = [];
			else {
				const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
				throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
			}
		}
		if (Array.isArray(customTags)) for (const tag of customTags) tags = tags.concat(tag);
		else if (typeof customTags === "function") tags = customTags(tags.slice());
		if (addMergeTag) tags = tags.concat(merge.merge);
		return tags.reduce((tags, tag) => {
			const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
			if (!tagObj) {
				const tagName = JSON.stringify(tag);
				const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
				throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
			}
			if (!tags.includes(tagObj)) tags.push(tagObj);
			return tags;
		}, []);
	}
	exports.coreKnownTags = coreKnownTags;
	exports.getTags = getTags;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/schema/Schema.js
var require_Schema = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var map = require_map();
	var seq = require_seq();
	var string = require_string();
	var tags = require_tags();
	const sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
	exports.Schema = class Schema {
		constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
			this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
			this.name = typeof schema === "string" && schema || "core";
			this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
			this.tags = tags.getTags(customTags, this.name, merge);
			this.toStringOptions = toStringDefaults ?? null;
			Object.defineProperty(this, identity.MAP, { value: map.map });
			Object.defineProperty(this, identity.SCALAR, { value: string.string });
			Object.defineProperty(this, identity.SEQ, { value: seq.seq });
			this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
		}
		clone() {
			const copy = Object.create(Schema.prototype, Object.getOwnPropertyDescriptors(this));
			copy.tags = this.tags.slice();
			return copy;
		}
	};
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var stringify = require_stringify();
	var stringifyComment = require_stringifyComment();
	function stringifyDocument(doc, options) {
		const lines = [];
		let hasDirectives = options.directives === true;
		if (options.directives !== false && doc.directives) {
			const dir = doc.directives.toString(doc);
			if (dir) {
				lines.push(dir);
				hasDirectives = true;
			} else if (doc.directives.docStart) hasDirectives = true;
		}
		if (hasDirectives) lines.push("---");
		const ctx = stringify.createStringifyContext(doc, options);
		const { commentString } = ctx.options;
		if (doc.commentBefore) {
			if (lines.length !== 1) lines.unshift("");
			const cs = commentString(doc.commentBefore);
			lines.unshift(stringifyComment.indentComment(cs, ""));
		}
		let chompKeep = false;
		let contentComment = null;
		if (doc.contents) {
			if (identity.isNode(doc.contents)) {
				if (doc.contents.spaceBefore && hasDirectives) lines.push("");
				if (doc.contents.commentBefore) {
					const cs = commentString(doc.contents.commentBefore);
					lines.push(stringifyComment.indentComment(cs, ""));
				}
				ctx.forceBlockIndent = !!doc.comment;
				contentComment = doc.contents.comment;
			}
			const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
			let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
			if (contentComment) body += stringifyComment.lineComment(body, "", commentString(contentComment));
			if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") lines[lines.length - 1] = `--- ${body}`;
			else lines.push(body);
		} else lines.push(stringify.stringify(doc.contents, ctx));
		if (doc.directives?.docEnd) {
			if (doc.comment) {
				const cs = commentString(doc.comment);
				if (cs.includes("\n")) {
					lines.push("...");
					lines.push(stringifyComment.indentComment(cs, ""));
				} else lines.push(`... ${cs}`);
			} else lines.push("...");
		} else {
			let dc = doc.comment;
			if (dc && chompKeep) dc = dc.replace(/^\n+/, "");
			if (dc) {
				if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "") lines.push("");
				lines.push(stringifyComment.indentComment(commentString(dc), ""));
			}
		}
		return lines.join("\n") + "\n";
	}
	exports.stringifyDocument = stringifyDocument;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/doc/Document.js
var require_Document = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Alias = require_Alias();
	var Collection = require_Collection();
	var identity = require_identity();
	var Pair = require_Pair();
	var toJS = require_toJS();
	var Schema = require_Schema();
	var stringifyDocument = require_stringifyDocument();
	var anchors = require_anchors();
	var applyReviver = require_applyReviver();
	var createNode = require_createNode();
	var directives = require_directives();
	var Document = class Document {
		constructor(value, replacer, options) {
			/** A comment before this Document */
			this.commentBefore = null;
			/** A comment immediately after this Document */
			this.comment = null;
			/** Errors encountered during parsing. */
			this.errors = [];
			/** Warnings encountered during parsing. */
			this.warnings = [];
			Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
			let _replacer = null;
			if (typeof replacer === "function" || Array.isArray(replacer)) _replacer = replacer;
			else if (options === void 0 && replacer) {
				options = replacer;
				replacer = void 0;
			}
			const opt = Object.assign({
				intAsBigInt: false,
				keepSourceTokens: false,
				logLevel: "warn",
				prettyErrors: true,
				strict: true,
				stringKeys: false,
				uniqueKeys: true,
				version: "1.2"
			}, options);
			this.options = opt;
			let { version } = opt;
			if (options?._directives) {
				this.directives = options._directives.atDocument();
				if (this.directives.yaml.explicit) version = this.directives.yaml.version;
			} else this.directives = new directives.Directives({ version });
			this.setSchema(version, options);
			this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
		}
		/**
		* Create a deep copy of this Document and its contents.
		*
		* Custom Node values that inherit from `Object` still refer to their original instances.
		*/
		clone() {
			const copy = Object.create(Document.prototype, { [identity.NODE_TYPE]: { value: identity.DOC } });
			copy.commentBefore = this.commentBefore;
			copy.comment = this.comment;
			copy.errors = this.errors.slice();
			copy.warnings = this.warnings.slice();
			copy.options = Object.assign({}, this.options);
			if (this.directives) copy.directives = this.directives.clone();
			copy.schema = this.schema.clone();
			copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
			if (this.range) copy.range = this.range.slice();
			return copy;
		}
		/** Adds a value to the document. */
		add(value) {
			if (assertCollection(this.contents)) this.contents.add(value);
		}
		/** Adds a value to the document. */
		addIn(path, value) {
			if (assertCollection(this.contents)) this.contents.addIn(path, value);
		}
		/**
		* Create a new `Alias` node, ensuring that the target `node` has the required anchor.
		*
		* If `node` already has an anchor, `name` is ignored.
		* Otherwise, the `node.anchor` value will be set to `name`,
		* or if an anchor with that name is already present in the document,
		* `name` will be used as a prefix for a new unique anchor.
		* If `name` is undefined, the generated anchor will use 'a' as a prefix.
		*/
		createAlias(node, name) {
			if (!node.anchor) {
				const prev = anchors.anchorNames(this);
				node.anchor = !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
			}
			return new Alias.Alias(node.anchor);
		}
		createNode(value, replacer, options) {
			let _replacer = void 0;
			if (typeof replacer === "function") {
				value = replacer.call({ "": value }, "", value);
				_replacer = replacer;
			} else if (Array.isArray(replacer)) {
				const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
				const asStr = replacer.filter(keyToStr).map(String);
				if (asStr.length > 0) replacer = replacer.concat(asStr);
				_replacer = replacer;
			} else if (options === void 0 && replacer) {
				options = replacer;
				replacer = void 0;
			}
			const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
			const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(this, anchorPrefix || "a");
			const ctx = {
				aliasDuplicateObjects: aliasDuplicateObjects ?? true,
				keepUndefined: keepUndefined ?? false,
				onAnchor,
				onTagObj,
				replacer: _replacer,
				schema: this.schema,
				sourceObjects
			};
			const node = createNode.createNode(value, tag, ctx);
			if (flow && identity.isCollection(node)) node.flow = true;
			setAnchors();
			return node;
		}
		/**
		* Convert a key and a value into a `Pair` using the current schema,
		* recursively wrapping all values as `Scalar` or `Collection` nodes.
		*/
		createPair(key, value, options = {}) {
			const k = this.createNode(key, null, options);
			const v = this.createNode(value, null, options);
			return new Pair.Pair(k, v);
		}
		/**
		* Removes a value from the document.
		* @returns `true` if the item was found and removed.
		*/
		delete(key) {
			return assertCollection(this.contents) ? this.contents.delete(key) : false;
		}
		/**
		* Removes a value from the document.
		* @returns `true` if the item was found and removed.
		*/
		deleteIn(path) {
			if (Collection.isEmptyPath(path)) {
				if (this.contents == null) return false;
				this.contents = null;
				return true;
			}
			return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
		}
		/**
		* Returns item at `key`, or `undefined` if not found. By default unwraps
		* scalar values from their surrounding node; to disable set `keepScalar` to
		* `true` (collections are always returned intact).
		*/
		get(key, keepScalar) {
			return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
		}
		/**
		* Returns item at `path`, or `undefined` if not found. By default unwraps
		* scalar values from their surrounding node; to disable set `keepScalar` to
		* `true` (collections are always returned intact).
		*/
		getIn(path, keepScalar) {
			if (Collection.isEmptyPath(path)) return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
			return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
		}
		/**
		* Checks if the document includes a value with the key `key`.
		*/
		has(key) {
			return identity.isCollection(this.contents) ? this.contents.has(key) : false;
		}
		/**
		* Checks if the document includes a value at `path`.
		*/
		hasIn(path) {
			if (Collection.isEmptyPath(path)) return this.contents !== void 0;
			return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
		}
		/**
		* Sets a value in this document. For `!!set`, `value` needs to be a
		* boolean to add/remove the item from the set.
		*/
		set(key, value) {
			if (this.contents == null) this.contents = Collection.collectionFromPath(this.schema, [key], value);
			else if (assertCollection(this.contents)) this.contents.set(key, value);
		}
		/**
		* Sets a value in this document. For `!!set`, `value` needs to be a
		* boolean to add/remove the item from the set.
		*/
		setIn(path, value) {
			if (Collection.isEmptyPath(path)) this.contents = value;
			else if (this.contents == null) this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
			else if (assertCollection(this.contents)) this.contents.setIn(path, value);
		}
		/**
		* Change the YAML version and schema used by the document.
		* A `null` version disables support for directives, explicit tags, anchors, and aliases.
		* It also requires the `schema` option to be given as a `Schema` instance value.
		*
		* Overrides all previously set schema options.
		*/
		setSchema(version, options = {}) {
			if (typeof version === "number") version = String(version);
			let opt;
			switch (version) {
				case "1.1":
					if (this.directives) this.directives.yaml.version = "1.1";
					else this.directives = new directives.Directives({ version: "1.1" });
					opt = {
						resolveKnownTags: false,
						schema: "yaml-1.1"
					};
					break;
				case "1.2":
				case "next":
					if (this.directives) this.directives.yaml.version = version;
					else this.directives = new directives.Directives({ version });
					opt = {
						resolveKnownTags: true,
						schema: "core"
					};
					break;
				case null:
					if (this.directives) delete this.directives;
					opt = null;
					break;
				default: {
					const sv = JSON.stringify(version);
					throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
				}
			}
			if (options.schema instanceof Object) this.schema = options.schema;
			else if (opt) this.schema = new Schema.Schema(Object.assign(opt, options));
			else throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
		}
		toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
			const ctx = {
				anchors: /* @__PURE__ */ new Map(),
				doc: this,
				keep: !json,
				mapAsMap: mapAsMap === true,
				mapKeyWarned: false,
				maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
			};
			const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
			if (typeof onAnchor === "function") for (const { count, res } of ctx.anchors.values()) onAnchor(res, count);
			return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
		}
		/**
		* A JSON representation of the document `contents`.
		*
		* @param jsonArg Used by `JSON.stringify` to indicate the array index or
		*   property name.
		*/
		toJSON(jsonArg, onAnchor) {
			return this.toJS({
				json: true,
				jsonArg,
				mapAsMap: false,
				onAnchor
			});
		}
		/** A YAML representation of the document. */
		toString(options = {}) {
			if (this.errors.length > 0) throw new Error("Document with errors cannot be stringified");
			if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
				const s = JSON.stringify(options.indent);
				throw new Error(`"indent" option must be a positive integer, not ${s}`);
			}
			return stringifyDocument.stringifyDocument(this, options);
		}
	};
	function assertCollection(contents) {
		if (identity.isCollection(contents)) return true;
		throw new Error("Expected a YAML collection as document contents");
	}
	exports.Document = Document;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports) => {
	var YAMLError = class extends Error {
		constructor(name, pos, code, message) {
			super();
			this.name = name;
			this.code = code;
			this.message = message;
			this.pos = pos;
		}
	};
	var YAMLParseError = class extends YAMLError {
		constructor(pos, code, message) {
			super("YAMLParseError", pos, code, message);
		}
	};
	var YAMLWarning = class extends YAMLError {
		constructor(pos, code, message) {
			super("YAMLWarning", pos, code, message);
		}
	};
	const prettifyError = (src, lc) => (error) => {
		if (error.pos[0] === -1) return;
		error.linePos = error.pos.map((pos) => lc.linePos(pos));
		const { line, col } = error.linePos[0];
		error.message += ` at line ${line}, column ${col}`;
		let ci = col - 1;
		let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
		if (ci >= 60 && lineStr.length > 80) {
			const trimStart = Math.min(ci - 39, lineStr.length - 79);
			lineStr = "…" + lineStr.substring(trimStart);
			ci -= trimStart - 1;
		}
		if (lineStr.length > 80) lineStr = lineStr.substring(0, 79) + "…";
		if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
			let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
			if (prev.length > 80) prev = prev.substring(0, 79) + "…\n";
			lineStr = prev + lineStr;
		}
		if (/[^ ]/.test(lineStr)) {
			let count = 1;
			const end = error.linePos[1];
			if (end?.line === line && end.col > col) count = Math.max(1, Math.min(end.col - col, 80 - ci));
			const pointer = " ".repeat(ci) + "^".repeat(count);
			error.message += `:\n\n${lineStr}\n${pointer}\n`;
		}
	};
	exports.YAMLError = YAMLError;
	exports.YAMLParseError = YAMLParseError;
	exports.YAMLWarning = YAMLWarning;
	exports.prettifyError = prettifyError;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = /* @__PURE__ */ __commonJSMin(((exports) => {
	function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
		let spaceBefore = false;
		let atNewline = startOnNewline;
		let hasSpace = startOnNewline;
		let comment = "";
		let commentSep = "";
		let hasNewline = false;
		let reqSpace = false;
		let tab = null;
		let anchor = null;
		let tag = null;
		let newlineAfterProp = null;
		let comma = null;
		let found = null;
		let start = null;
		for (const token of tokens) {
			if (reqSpace) {
				if (token.type !== "space" && token.type !== "newline" && token.type !== "comma") onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
				reqSpace = false;
			}
			if (tab) {
				if (atNewline && token.type !== "comment" && token.type !== "newline") onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
				tab = null;
			}
			switch (token.type) {
				case "space":
					if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) tab = token;
					hasSpace = true;
					break;
				case "comment": {
					if (!hasSpace) onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
					const cb = token.source.substring(1) || " ";
					if (!comment) comment = cb;
					else comment += commentSep + cb;
					commentSep = "";
					atNewline = false;
					break;
				}
				case "newline":
					if (atNewline) {
						if (comment) comment += token.source;
						else if (!found || indicator !== "seq-item-ind") spaceBefore = true;
					} else commentSep += token.source;
					atNewline = true;
					hasNewline = true;
					if (anchor || tag) newlineAfterProp = token;
					hasSpace = true;
					break;
				case "anchor":
					if (anchor) onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
					if (token.source.endsWith(":")) onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
					anchor = token;
					start ?? (start = token.offset);
					atNewline = false;
					hasSpace = false;
					reqSpace = true;
					break;
				case "tag":
					if (tag) onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
					tag = token;
					start ?? (start = token.offset);
					atNewline = false;
					hasSpace = false;
					reqSpace = true;
					break;
				case indicator:
					if (anchor || tag) onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
					if (found) onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
					found = token;
					atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
					hasSpace = false;
					break;
				case "comma": if (flow) {
					if (comma) onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
					comma = token;
					atNewline = false;
					hasSpace = false;
					break;
				}
				default:
					onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
					atNewline = false;
					hasSpace = false;
			}
		}
		const last = tokens[tokens.length - 1];
		const end = last ? last.offset + last.source.length : offset;
		if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
		if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq")) onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
		return {
			comma,
			found,
			spaceBefore,
			comment,
			hasNewline,
			anchor,
			tag,
			newlineAfterProp,
			end,
			start: start ?? end
		};
	}
	exports.resolveProps = resolveProps;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = /* @__PURE__ */ __commonJSMin(((exports) => {
	function containsNewline(key) {
		if (!key) return null;
		switch (key.type) {
			case "alias":
			case "scalar":
			case "double-quoted-scalar":
			case "single-quoted-scalar":
				if (key.source.includes("\n")) return true;
				if (key.end) {
					for (const st of key.end) if (st.type === "newline") return true;
				}
				return false;
			case "flow-collection":
				for (const it of key.items) {
					for (const st of it.start) if (st.type === "newline") return true;
					if (it.sep) {
						for (const st of it.sep) if (st.type === "newline") return true;
					}
					if (containsNewline(it.key) || containsNewline(it.value)) return true;
				}
				return false;
			default: return true;
		}
	}
	exports.containsNewline = containsNewline;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = /* @__PURE__ */ __commonJSMin(((exports) => {
	var utilContainsNewline = require_util_contains_newline();
	function flowIndentCheck(indent, fc, onError) {
		if (fc?.type === "flow-collection") {
			const end = fc.end[0];
			if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) onError(end, "BAD_INDENT", "Flow end indicator should be more indented than parent", true);
		}
	}
	exports.flowIndentCheck = flowIndentCheck;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	function mapIncludes(ctx, items, search) {
		const { uniqueKeys } = ctx.options;
		if (uniqueKeys === false) return false;
		const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
		return items.some((pair) => isEqual(pair.key, search));
	}
	exports.mapIncludes = mapIncludes;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Pair = require_Pair();
	var YAMLMap = require_YAMLMap();
	var resolveProps = require_resolve_props();
	var utilContainsNewline = require_util_contains_newline();
	var utilFlowIndentCheck = require_util_flow_indent_check();
	var utilMapIncludes = require_util_map_includes();
	const startColMsg = "All mapping items must start at the same column";
	function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
		const map = new ((tag?.nodeClass) ?? YAMLMap.YAMLMap)(ctx.schema);
		if (ctx.atRoot) ctx.atRoot = false;
		let offset = bm.offset;
		let commentEnd = null;
		for (const collItem of bm.items) {
			const { start, key, sep, value } = collItem;
			const keyProps = resolveProps.resolveProps(start, {
				indicator: "explicit-key-ind",
				next: key ?? sep?.[0],
				offset,
				onError,
				parentIndent: bm.indent,
				startOnNewline: true
			});
			const implicitKey = !keyProps.found;
			if (implicitKey) {
				if (key) {
					if (key.type === "block-seq") onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
					else if ("indent" in key && key.indent !== bm.indent) onError(offset, "BAD_INDENT", startColMsg);
				}
				if (!keyProps.anchor && !keyProps.tag && !sep) {
					commentEnd = keyProps.end;
					if (keyProps.comment) {
						if (map.comment) map.comment += "\n" + keyProps.comment;
						else map.comment = keyProps.comment;
					}
					continue;
				}
				if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
			} else if (keyProps.found?.indent !== bm.indent) onError(offset, "BAD_INDENT", startColMsg);
			ctx.atKey = true;
			const keyStart = keyProps.end;
			const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
			if (ctx.schema.compat) utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
			ctx.atKey = false;
			if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode)) onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
			const valueProps = resolveProps.resolveProps(sep ?? [], {
				indicator: "map-value-ind",
				next: value,
				offset: keyNode.range[2],
				onError,
				parentIndent: bm.indent,
				startOnNewline: !key || key.type === "block-scalar"
			});
			offset = valueProps.end;
			if (valueProps.found) {
				if (implicitKey) {
					if (value?.type === "block-map" && !valueProps.hasNewline) onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
					if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024) onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
				}
				const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep, null, valueProps, onError);
				if (ctx.schema.compat) utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
				offset = valueNode.range[2];
				const pair = new Pair.Pair(keyNode, valueNode);
				if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
				map.items.push(pair);
			} else {
				if (implicitKey) onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
				if (valueProps.comment) {
					if (keyNode.comment) keyNode.comment += "\n" + valueProps.comment;
					else keyNode.comment = valueProps.comment;
				}
				const pair = new Pair.Pair(keyNode);
				if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
				map.items.push(pair);
			}
		}
		if (commentEnd && commentEnd < offset) onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
		map.range = [
			bm.offset,
			offset,
			commentEnd ?? offset
		];
		return map;
	}
	exports.resolveBlockMap = resolveBlockMap;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = /* @__PURE__ */ __commonJSMin(((exports) => {
	var YAMLSeq = require_YAMLSeq();
	var resolveProps = require_resolve_props();
	var utilFlowIndentCheck = require_util_flow_indent_check();
	function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
		const seq = new ((tag?.nodeClass) ?? YAMLSeq.YAMLSeq)(ctx.schema);
		if (ctx.atRoot) ctx.atRoot = false;
		if (ctx.atKey) ctx.atKey = false;
		let offset = bs.offset;
		let commentEnd = null;
		for (const { start, value } of bs.items) {
			const props = resolveProps.resolveProps(start, {
				indicator: "seq-item-ind",
				next: value,
				offset,
				onError,
				parentIndent: bs.indent,
				startOnNewline: true
			});
			if (!props.found) {
				if (props.anchor || props.tag || value) {
					if (value?.type === "block-seq") onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
					else onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
				} else {
					commentEnd = props.end;
					if (props.comment) seq.comment = props.comment;
					continue;
				}
			}
			const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
			if (ctx.schema.compat) utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
			offset = node.range[2];
			seq.items.push(node);
		}
		seq.range = [
			bs.offset,
			offset,
			commentEnd ?? offset
		];
		return seq;
	}
	exports.resolveBlockSeq = resolveBlockSeq;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = /* @__PURE__ */ __commonJSMin(((exports) => {
	function resolveEnd(end, offset, reqSpace, onError) {
		let comment = "";
		if (end) {
			let hasSpace = false;
			let sep = "";
			for (const token of end) {
				const { source, type } = token;
				switch (type) {
					case "space":
						hasSpace = true;
						break;
					case "comment": {
						if (reqSpace && !hasSpace) onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
						const cb = source.substring(1) || " ";
						if (!comment) comment = cb;
						else comment += sep + cb;
						sep = "";
						break;
					}
					case "newline":
						if (comment) sep += source;
						hasSpace = true;
						break;
					default: onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
				}
				offset += source.length;
			}
		}
		return {
			comment,
			offset
		};
	}
	exports.resolveEnd = resolveEnd;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Pair = require_Pair();
	var YAMLMap = require_YAMLMap();
	var YAMLSeq = require_YAMLSeq();
	var resolveEnd = require_resolve_end();
	var resolveProps = require_resolve_props();
	var utilContainsNewline = require_util_contains_newline();
	var utilMapIncludes = require_util_map_includes();
	const blockMsg = "Block collections are not allowed within flow collections";
	const isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
	function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
		const isMap = fc.start.source === "{";
		const fcName = isMap ? "flow map" : "flow sequence";
		const coll = new ((tag?.nodeClass) ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq))(ctx.schema);
		coll.flow = true;
		const atRoot = ctx.atRoot;
		if (atRoot) ctx.atRoot = false;
		if (ctx.atKey) ctx.atKey = false;
		let offset = fc.offset + fc.start.source.length;
		for (let i = 0; i < fc.items.length; ++i) {
			const collItem = fc.items[i];
			const { start, key, sep, value } = collItem;
			const props = resolveProps.resolveProps(start, {
				flow: fcName,
				indicator: "explicit-key-ind",
				next: key ?? sep?.[0],
				offset,
				onError,
				parentIndent: fc.indent,
				startOnNewline: false
			});
			if (!props.found) {
				if (!props.anchor && !props.tag && !sep && !value) {
					if (i === 0 && props.comma) onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
					else if (i < fc.items.length - 1) onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
					if (props.comment) {
						if (coll.comment) coll.comment += "\n" + props.comment;
						else coll.comment = props.comment;
					}
					offset = props.end;
					continue;
				}
				if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key)) onError(key, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
			}
			if (i === 0) {
				if (props.comma) onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
			} else {
				if (!props.comma) onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
				if (props.comment) {
					let prevItemComment = "";
					loop: for (const st of start) switch (st.type) {
						case "comma":
						case "space": break;
						case "comment":
							prevItemComment = st.source.substring(1);
							break loop;
						default: break loop;
					}
					if (prevItemComment) {
						let prev = coll.items[coll.items.length - 1];
						if (identity.isPair(prev)) prev = prev.value ?? prev.key;
						if (prev.comment) prev.comment += "\n" + prevItemComment;
						else prev.comment = prevItemComment;
						props.comment = props.comment.substring(prevItemComment.length + 1);
					}
				}
			}
			if (!isMap && !sep && !props.found) {
				const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep, null, props, onError);
				coll.items.push(valueNode);
				offset = valueNode.range[2];
				if (isBlock(value)) onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
			} else {
				ctx.atKey = true;
				const keyStart = props.end;
				const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
				if (isBlock(key)) onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
				ctx.atKey = false;
				const valueProps = resolveProps.resolveProps(sep ?? [], {
					flow: fcName,
					indicator: "map-value-ind",
					next: value,
					offset: keyNode.range[2],
					onError,
					parentIndent: fc.indent,
					startOnNewline: false
				});
				if (valueProps.found) {
					if (!isMap && !props.found && ctx.options.strict) {
						if (sep) for (const st of sep) {
							if (st === valueProps.found) break;
							if (st.type === "newline") {
								onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
								break;
							}
						}
						if (props.start < valueProps.found.offset - 1024) onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
					}
				} else if (value) {
					if ("source" in value && value.source?.[0] === ":") onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
					else onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
				}
				const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep, null, valueProps, onError) : null;
				if (valueNode) {
					if (isBlock(value)) onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
				} else if (valueProps.comment) {
					if (keyNode.comment) keyNode.comment += "\n" + valueProps.comment;
					else keyNode.comment = valueProps.comment;
				}
				const pair = new Pair.Pair(keyNode, valueNode);
				if (ctx.options.keepSourceTokens) pair.srcToken = collItem;
				if (isMap) {
					const map = coll;
					if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode)) onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
					map.items.push(pair);
				} else {
					const map = new YAMLMap.YAMLMap(ctx.schema);
					map.flow = true;
					map.items.push(pair);
					const endRange = (valueNode ?? keyNode).range;
					map.range = [
						keyNode.range[0],
						endRange[1],
						endRange[2]
					];
					coll.items.push(map);
				}
				offset = valueNode ? valueNode.range[2] : valueProps.end;
			}
		}
		const expectedEnd = isMap ? "}" : "]";
		const [ce, ...ee] = fc.end;
		let cePos = offset;
		if (ce?.source === expectedEnd) cePos = ce.offset + ce.source.length;
		else {
			const name = fcName[0].toUpperCase() + fcName.substring(1);
			const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
			onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
			if (ce && ce.source.length !== 1) ee.unshift(ce);
		}
		if (ee.length > 0) {
			const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
			if (end.comment) {
				if (coll.comment) coll.comment += "\n" + end.comment;
				else coll.comment = end.comment;
			}
			coll.range = [
				fc.offset,
				cePos,
				end.offset
			];
		} else coll.range = [
			fc.offset,
			cePos,
			cePos
		];
		return coll;
	}
	exports.resolveFlowCollection = resolveFlowCollection;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Scalar = require_Scalar();
	var YAMLMap = require_YAMLMap();
	var YAMLSeq = require_YAMLSeq();
	var resolveBlockMap = require_resolve_block_map();
	var resolveBlockSeq = require_resolve_block_seq();
	var resolveFlowCollection = require_resolve_flow_collection();
	function resolveCollection(CN, ctx, token, onError, tagName, tag) {
		const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
		const Coll = coll.constructor;
		if (tagName === "!" || tagName === Coll.tagName) {
			coll.tag = Coll.tagName;
			return coll;
		}
		if (tagName) coll.tag = tagName;
		return coll;
	}
	function composeCollection(CN, ctx, token, props, onError) {
		const tagToken = props.tag;
		const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
		if (token.type === "block-seq") {
			const { anchor, newlineAfterProp: nl } = props;
			const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
			if (lastProp && (!nl || nl.offset < lastProp.offset)) onError(lastProp, "MISSING_CHAR", "Missing newline after block sequence props");
		}
		const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
		if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") return resolveCollection(CN, ctx, token, onError, tagName);
		let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
		if (!tag) {
			const kt = ctx.schema.knownTags[tagName];
			if (kt?.collection === expType) {
				ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
				tag = kt;
			} else {
				if (kt) onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
				else onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
				return resolveCollection(CN, ctx, token, onError, tagName);
			}
		}
		const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
		const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
		const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
		node.range = coll.range;
		node.tag = tagName;
		if (tag?.format) node.format = tag.format;
		return node;
	}
	exports.composeCollection = composeCollection;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	function resolveBlockScalar(ctx, scalar, onError) {
		const start = scalar.offset;
		const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
		if (!header) return {
			value: "",
			type: null,
			comment: "",
			range: [
				start,
				start,
				start
			]
		};
		const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
		const lines = scalar.source ? splitLines(scalar.source) : [];
		let chompStart = lines.length;
		for (let i = lines.length - 1; i >= 0; --i) {
			const content = lines[i][1];
			if (content === "" || content === "\r") chompStart = i;
			else break;
		}
		if (chompStart === 0) {
			const value = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
			let end = start + header.length;
			if (scalar.source) end += scalar.source.length;
			return {
				value,
				type,
				comment: header.comment,
				range: [
					start,
					end,
					end
				]
			};
		}
		let trimIndent = scalar.indent + header.indent;
		let offset = scalar.offset + header.length;
		let contentStart = 0;
		for (let i = 0; i < chompStart; ++i) {
			const [indent, content] = lines[i];
			if (content === "" || content === "\r") {
				if (header.indent === 0 && indent.length > trimIndent) trimIndent = indent.length;
			} else {
				if (indent.length < trimIndent) onError(offset + indent.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator");
				if (header.indent === 0) trimIndent = indent.length;
				contentStart = i;
				if (trimIndent === 0 && !ctx.atRoot) onError(offset, "BAD_INDENT", "Block scalar values in collections must be indented");
				break;
			}
			offset += indent.length + content.length + 1;
		}
		for (let i = lines.length - 1; i >= chompStart; --i) if (lines[i][0].length > trimIndent) chompStart = i + 1;
		let value = "";
		let sep = "";
		let prevMoreIndented = false;
		for (let i = 0; i < contentStart; ++i) value += lines[i][0].slice(trimIndent) + "\n";
		for (let i = contentStart; i < chompStart; ++i) {
			let [indent, content] = lines[i];
			offset += indent.length + content.length + 1;
			const crlf = content[content.length - 1] === "\r";
			if (crlf) content = content.slice(0, -1);
			/* istanbul ignore if already caught in lexer */
			if (content && indent.length < trimIndent) {
				const message = `Block scalar lines must not be less indented than their ${header.indent ? "explicit indentation indicator" : "first line"}`;
				onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
				indent = "";
			}
			if (type === Scalar.Scalar.BLOCK_LITERAL) {
				value += sep + indent.slice(trimIndent) + content;
				sep = "\n";
			} else if (indent.length > trimIndent || content[0] === "	") {
				if (sep === " ") sep = "\n";
				else if (!prevMoreIndented && sep === "\n") sep = "\n\n";
				value += sep + indent.slice(trimIndent) + content;
				sep = "\n";
				prevMoreIndented = true;
			} else if (content === "") {
				if (sep === "\n") value += "\n";
				else sep = "\n";
			} else {
				value += sep + content;
				sep = " ";
				prevMoreIndented = false;
			}
		}
		switch (header.chomp) {
			case "-": break;
			case "+":
				for (let i = chompStart; i < lines.length; ++i) value += "\n" + lines[i][0].slice(trimIndent);
				if (value[value.length - 1] !== "\n") value += "\n";
				break;
			default: value += "\n";
		}
		const end = start + header.length + scalar.source.length;
		return {
			value,
			type,
			comment: header.comment,
			range: [
				start,
				end,
				end
			]
		};
	}
	function parseBlockScalarHeader({ offset, props }, strict, onError) {
		/* istanbul ignore if should not happen */
		if (props[0].type !== "block-scalar-header") {
			onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
			return null;
		}
		const { source } = props[0];
		const mode = source[0];
		let indent = 0;
		let chomp = "";
		let error = -1;
		for (let i = 1; i < source.length; ++i) {
			const ch = source[i];
			if (!chomp && (ch === "-" || ch === "+")) chomp = ch;
			else {
				const n = Number(ch);
				if (!indent && n) indent = n;
				else if (error === -1) error = offset + i;
			}
		}
		if (error !== -1) onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
		let hasSpace = false;
		let comment = "";
		let length = source.length;
		for (let i = 1; i < props.length; ++i) {
			const token = props[i];
			switch (token.type) {
				case "space": hasSpace = true;
				case "newline":
					length += token.source.length;
					break;
				case "comment":
					if (strict && !hasSpace) onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
					length += token.source.length;
					comment = token.source.substring(1);
					break;
				case "error":
					onError(token, "UNEXPECTED_TOKEN", token.message);
					length += token.source.length;
					break;
				/* istanbul ignore next should not happen */
				default: {
					onError(token, "UNEXPECTED_TOKEN", `Unexpected token in block scalar header: ${token.type}`);
					const ts = token.source;
					if (ts && typeof ts === "string") length += ts.length;
				}
			}
		}
		return {
			mode,
			indent,
			chomp,
			comment,
			length
		};
	}
	/** @returns Array of lines split up as `[indent, content]` */
	function splitLines(source) {
		const split = source.split(/\n( *)/);
		const first = split[0];
		const m = first.match(/^( *)/);
		const lines = [m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first]];
		for (let i = 1; i < split.length; i += 2) lines.push([split[i], split[i + 1]]);
		return lines;
	}
	exports.resolveBlockScalar = resolveBlockScalar;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scalar = require_Scalar();
	var resolveEnd = require_resolve_end();
	function resolveFlowScalar(scalar, strict, onError) {
		const { offset, type, source, end } = scalar;
		let _type;
		let value;
		const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
		switch (type) {
			case "scalar":
				_type = Scalar.Scalar.PLAIN;
				value = plainValue(source, _onError);
				break;
			case "single-quoted-scalar":
				_type = Scalar.Scalar.QUOTE_SINGLE;
				value = singleQuotedValue(source, _onError);
				break;
			case "double-quoted-scalar":
				_type = Scalar.Scalar.QUOTE_DOUBLE;
				value = doubleQuotedValue(source, _onError);
				break;
			/* istanbul ignore next should not happen */
			default:
				onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
				return {
					value: "",
					type: null,
					comment: "",
					range: [
						offset,
						offset + source.length,
						offset + source.length
					]
				};
		}
		const valueEnd = offset + source.length;
		const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
		return {
			value,
			type: _type,
			comment: re.comment,
			range: [
				offset,
				valueEnd,
				re.offset
			]
		};
	}
	function plainValue(source, onError) {
		let badChar = "";
		switch (source[0]) {
			/* istanbul ignore next should not happen */
			case "	":
				badChar = "a tab character";
				break;
			case ",":
				badChar = "flow indicator character ,";
				break;
			case "%":
				badChar = "directive indicator character %";
				break;
			case "|":
			case ">":
				badChar = `block scalar indicator ${source[0]}`;
				break;
			case "@":
			case "`": badChar = `reserved character ${source[0]}`;
		}
		if (badChar) onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
		return foldLines(source);
	}
	function singleQuotedValue(source, onError) {
		if (source[source.length - 1] !== "'" || source.length === 1) onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
		return foldLines(source.slice(1, -1)).replace(/''/g, "'");
	}
	function foldLines(source) {
		/**
		* The negative lookbehind here and in the `re` RegExp is to
		* prevent causing a polynomial search time in certain cases.
		*
		* The try-catch is for Safari, which doesn't support this yet:
		* https://caniuse.com/js-regexp-lookbehind
		*/
		let first, line;
		try {
			first = /* @__PURE__ */ new RegExp("(.*?)(?<![ 	])[ 	]*\r?\n", "sy");
			line = /* @__PURE__ */ new RegExp("[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?\n", "sy");
		} catch {
			first = /(.*?)[ \t]*\r?\n/sy;
			line = /[ \t]*(.*?)[ \t]*\r?\n/sy;
		}
		let match = first.exec(source);
		if (!match) return source;
		let res = match[1];
		let sep = " ";
		let pos = first.lastIndex;
		line.lastIndex = pos;
		while (match = line.exec(source)) {
			if (match[1] === "") {
				if (sep === "\n") res += sep;
				else sep = "\n";
			} else {
				res += sep + match[1];
				sep = " ";
			}
			pos = line.lastIndex;
		}
		const last = /[ \t]*(.*)/sy;
		last.lastIndex = pos;
		match = last.exec(source);
		return res + sep + (match?.[1] ?? "");
	}
	function doubleQuotedValue(source, onError) {
		let res = "";
		for (let i = 1; i < source.length - 1; ++i) {
			const ch = source[i];
			if (ch === "\r" && source[i + 1] === "\n") continue;
			if (ch === "\n") {
				const { fold, offset } = foldNewline(source, i);
				res += fold;
				i = offset;
			} else if (ch === "\\") {
				let next = source[++i];
				const cc = escapeCodes[next];
				if (cc) res += cc;
				else if (next === "\n") {
					next = source[i + 1];
					while (next === " " || next === "	") next = source[++i + 1];
				} else if (next === "\r" && source[i + 1] === "\n") {
					next = source[++i + 1];
					while (next === " " || next === "	") next = source[++i + 1];
				} else if (next === "x" || next === "u" || next === "U") {
					const length = next === "x" ? 2 : next === "u" ? 4 : 8;
					res += parseCharCode(source, i + 1, length, onError);
					i += length;
				} else {
					const raw = source.substr(i - 1, 2);
					onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
					res += raw;
				}
			} else if (ch === " " || ch === "	") {
				const wsStart = i;
				let next = source[i + 1];
				while (next === " " || next === "	") next = source[++i + 1];
				if (next !== "\n" && !(next === "\r" && source[i + 2] === "\n")) res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
			} else res += ch;
		}
		if (source[source.length - 1] !== "\"" || source.length === 1) onError(source.length, "MISSING_CHAR", "Missing closing \"quote");
		return res;
	}
	/**
	* Fold a single newline into a space, multiple newlines to N - 1 newlines.
	* Presumes `source[offset] === '\n'`
	*/
	function foldNewline(source, offset) {
		let fold = "";
		let ch = source[offset + 1];
		while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
			if (ch === "\r" && source[offset + 2] !== "\n") break;
			if (ch === "\n") fold += "\n";
			offset += 1;
			ch = source[offset + 1];
		}
		if (!fold) fold = " ";
		return {
			fold,
			offset
		};
	}
	const escapeCodes = {
		"0": "\0",
		a: "\x07",
		b: "\b",
		e: "\x1B",
		f: "\f",
		n: "\n",
		r: "\r",
		t: "	",
		v: "\v",
		N: "",
		_: "\xA0",
		L: "\u2028",
		P: "\u2029",
		" ": " ",
		"\"": "\"",
		"/": "/",
		"\\": "\\",
		"	": "	"
	};
	function parseCharCode(source, offset, length, onError) {
		const cc = source.substr(offset, length);
		const code = cc.length === length && /^[0-9a-fA-F]+$/.test(cc) ? parseInt(cc, 16) : NaN;
		try {
			return String.fromCodePoint(code);
		} catch {
			const raw = source.substr(offset - 2, length + 2);
			onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
			return raw;
		}
	}
	exports.resolveFlowScalar = resolveFlowScalar;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = /* @__PURE__ */ __commonJSMin(((exports) => {
	var identity = require_identity();
	var Scalar = require_Scalar();
	var resolveBlockScalar = require_resolve_block_scalar();
	var resolveFlowScalar = require_resolve_flow_scalar();
	function composeScalar(ctx, token, tagToken, onError) {
		const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
		const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
		let tag;
		if (ctx.options.stringKeys && ctx.atKey) tag = ctx.schema[identity.SCALAR];
		else if (tagName) tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
		else if (token.type === "scalar") tag = findScalarTagByTest(ctx, value, token, onError);
		else tag = ctx.schema[identity.SCALAR];
		let scalar;
		try {
			const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
			scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error);
			onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
			scalar = new Scalar.Scalar(value);
		}
		scalar.range = range;
		scalar.source = value;
		if (type) scalar.type = type;
		if (tagName) scalar.tag = tagName;
		if (tag.format) scalar.format = tag.format;
		if (comment) scalar.comment = comment;
		return scalar;
	}
	function findScalarTagByName(schema, value, tagName, tagToken, onError) {
		if (tagName === "!") return schema[identity.SCALAR];
		const matchWithTest = [];
		for (const tag of schema.tags) if (!tag.collection && tag.tag === tagName) {
			if (tag.default && tag.test) matchWithTest.push(tag);
			else return tag;
		}
		for (const tag of matchWithTest) if (tag.test?.test(value)) return tag;
		const kt = schema.knownTags[tagName];
		if (kt && !kt.collection) {
			schema.tags.push(Object.assign({}, kt, {
				default: false,
				test: void 0
			}));
			return kt;
		}
		onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
		return schema[identity.SCALAR];
	}
	function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
		const tag = schema.tags.find((tag) => (tag.default === true || atKey && tag.default === "key") && tag.test?.test(value)) || schema[identity.SCALAR];
		if (schema.compat) {
			const compat = schema.compat.find((tag) => tag.default && tag.test?.test(value)) ?? schema[identity.SCALAR];
			if (tag.tag !== compat.tag) onError(token, "TAG_RESOLVE_FAILED", `Value may be parsed as either ${directives.tagString(tag.tag)} or ${directives.tagString(compat.tag)}`, true);
		}
		return tag;
	}
	exports.composeScalar = composeScalar;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = /* @__PURE__ */ __commonJSMin(((exports) => {
	function emptyScalarPosition(offset, before, pos) {
		if (before) {
			pos ?? (pos = before.length);
			for (let i = pos - 1; i >= 0; --i) {
				let st = before[i];
				switch (st.type) {
					case "space":
					case "comment":
					case "newline":
						offset -= st.source.length;
						continue;
				}
				st = before[++i];
				while (st?.type === "space") {
					offset += st.source.length;
					st = before[++i];
				}
				break;
			}
		}
		return offset;
	}
	exports.emptyScalarPosition = emptyScalarPosition;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Alias = require_Alias();
	var identity = require_identity();
	var composeCollection = require_compose_collection();
	var composeScalar = require_compose_scalar();
	var resolveEnd = require_resolve_end();
	var utilEmptyScalarPosition = require_util_empty_scalar_position();
	const CN = {
		composeNode,
		composeEmptyNode
	};
	function composeNode(ctx, token, props, onError) {
		const atKey = ctx.atKey;
		const { spaceBefore, comment, anchor, tag } = props;
		let node;
		let isSrcToken = true;
		switch (token.type) {
			case "alias":
				node = composeAlias(ctx, token, onError);
				if (anchor || tag) onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
				break;
			case "scalar":
			case "single-quoted-scalar":
			case "double-quoted-scalar":
			case "block-scalar":
				node = composeScalar.composeScalar(ctx, token, tag, onError);
				if (anchor) node.anchor = anchor.source.substring(1);
				break;
			case "block-map":
			case "block-seq":
			case "flow-collection":
				try {
					node = composeCollection.composeCollection(CN, ctx, token, props, onError);
					if (anchor) node.anchor = anchor.source.substring(1);
				} catch (error) {
					onError(token, "RESOURCE_EXHAUSTION", error instanceof Error ? error.message : String(error));
				}
				break;
			default:
				onError(token, "UNEXPECTED_TOKEN", token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`);
				isSrcToken = false;
		}
		node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
		if (anchor && node.anchor === "") onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
		if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) onError(tag ?? token, "NON_STRING_KEY", "With stringKeys, all keys must be strings");
		if (spaceBefore) node.spaceBefore = true;
		if (comment) {
			if (token.type === "scalar" && token.source === "") node.comment = comment;
			else node.commentBefore = comment;
		}
		if (ctx.options.keepSourceTokens && isSrcToken) node.srcToken = token;
		return node;
	}
	function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
		const token = {
			type: "scalar",
			offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
			indent: -1,
			source: ""
		};
		const node = composeScalar.composeScalar(ctx, token, tag, onError);
		if (anchor) {
			node.anchor = anchor.source.substring(1);
			if (node.anchor === "") onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
		}
		if (spaceBefore) node.spaceBefore = true;
		if (comment) {
			node.comment = comment;
			node.range[2] = end;
		}
		return node;
	}
	function composeAlias({ options }, { offset, source, end }, onError) {
		const alias = new Alias.Alias(source.substring(1));
		if (alias.source === "") onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
		if (alias.source.endsWith(":")) onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
		const valueEnd = offset + source.length;
		const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
		alias.range = [
			offset,
			valueEnd,
			re.offset
		];
		if (re.comment) alias.comment = re.comment;
		return alias;
	}
	exports.composeEmptyNode = composeEmptyNode;
	exports.composeNode = composeNode;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Document = require_Document();
	var composeNode = require_compose_node();
	var resolveEnd = require_resolve_end();
	var resolveProps = require_resolve_props();
	function composeDoc(options, directives, { offset, start, value, end }, onError) {
		const opts = Object.assign({ _directives: directives }, options);
		const doc = new Document.Document(void 0, opts);
		const ctx = {
			atKey: false,
			atRoot: true,
			directives: doc.directives,
			options: doc.options,
			schema: doc.schema
		};
		const props = resolveProps.resolveProps(start, {
			indicator: "doc-start",
			next: value ?? end?.[0],
			offset,
			onError,
			parentIndent: 0,
			startOnNewline: true
		});
		if (props.found) {
			doc.directives.docStart = true;
			if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline) onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
		}
		doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
		const contentEnd = doc.contents.range[2];
		const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
		if (re.comment) doc.comment = re.comment;
		doc.range = [
			offset,
			contentEnd,
			re.offset
		];
		return doc;
	}
	exports.composeDoc = composeDoc;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/compose/composer.js
var require_composer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var node_process$1 = __require("process");
	var directives = require_directives();
	var Document = require_Document();
	var errors = require_errors();
	var identity = require_identity();
	var composeDoc = require_compose_doc();
	var resolveEnd = require_resolve_end();
	function getErrorPos(src) {
		if (typeof src === "number") return [src, src + 1];
		if (Array.isArray(src)) return src.length === 2 ? src : [src[0], src[1]];
		const { offset, source } = src;
		return [offset, offset + (typeof source === "string" ? source.length : 1)];
	}
	function parsePrelude(prelude) {
		let comment = "";
		let atComment = false;
		let afterEmptyLine = false;
		for (let i = 0; i < prelude.length; ++i) {
			const source = prelude[i];
			switch (source[0]) {
				case "#":
					comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
					atComment = true;
					afterEmptyLine = false;
					break;
				case "%":
					if (prelude[i + 1]?.[0] !== "#") i += 1;
					atComment = false;
					break;
				default:
					if (!atComment) afterEmptyLine = true;
					atComment = false;
			}
		}
		return {
			comment,
			afterEmptyLine
		};
	}
	/**
	* Compose a stream of CST nodes into a stream of YAML Documents.
	*
	* ```ts
	* import { Composer, Parser } from 'yaml'
	*
	* const src: string = ...
	* const tokens = new Parser().parse(src)
	* const docs = new Composer().compose(tokens)
	* ```
	*/
	var Composer = class {
		constructor(options = {}) {
			this.doc = null;
			this.atDirectives = false;
			this.prelude = [];
			this.errors = [];
			this.warnings = [];
			this.onError = (source, code, message, warning) => {
				const pos = getErrorPos(source);
				if (warning) this.warnings.push(new errors.YAMLWarning(pos, code, message));
				else this.errors.push(new errors.YAMLParseError(pos, code, message));
			};
			this.directives = new directives.Directives({ version: options.version || "1.2" });
			this.options = options;
		}
		decorate(doc, afterDoc) {
			const { comment, afterEmptyLine } = parsePrelude(this.prelude);
			if (comment) {
				const dc = doc.contents;
				if (afterDoc) doc.comment = doc.comment ? `${doc.comment}\n${comment}` : comment;
				else if (afterEmptyLine || doc.directives.docStart || !dc) doc.commentBefore = comment;
				else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
					let it = dc.items[0];
					if (identity.isPair(it)) it = it.key;
					const cb = it.commentBefore;
					it.commentBefore = cb ? `${comment}\n${cb}` : comment;
				} else {
					const cb = dc.commentBefore;
					dc.commentBefore = cb ? `${comment}\n${cb}` : comment;
				}
			}
			if (afterDoc) {
				for (let i = 0; i < this.errors.length; ++i) doc.errors.push(this.errors[i]);
				for (let i = 0; i < this.warnings.length; ++i) doc.warnings.push(this.warnings[i]);
			} else {
				doc.errors = this.errors;
				doc.warnings = this.warnings;
			}
			this.prelude = [];
			this.errors = [];
			this.warnings = [];
		}
		/**
		* Current stream status information.
		*
		* Mostly useful at the end of input for an empty stream.
		*/
		streamInfo() {
			return {
				comment: parsePrelude(this.prelude).comment,
				directives: this.directives,
				errors: this.errors,
				warnings: this.warnings
			};
		}
		/**
		* Compose tokens into documents.
		*
		* @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
		* @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
		*/
		*compose(tokens, forceDoc = false, endOffset = -1) {
			for (const token of tokens) yield* this.next(token);
			yield* this.end(forceDoc, endOffset);
		}
		/** Advance the composer by one CST token. */
		*next(token) {
			if (node_process$1.env.LOG_STREAM) console.dir(token, { depth: null });
			switch (token.type) {
				case "directive":
					this.directives.add(token.source, (offset, message, warning) => {
						const pos = getErrorPos(token);
						pos[0] += offset;
						this.onError(pos, "BAD_DIRECTIVE", message, warning);
					});
					this.prelude.push(token.source);
					this.atDirectives = true;
					break;
				case "document": {
					const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
					if (this.atDirectives && !doc.directives.docStart) this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
					this.decorate(doc, false);
					if (this.doc) yield this.doc;
					this.doc = doc;
					this.atDirectives = false;
					break;
				}
				case "byte-order-mark":
				case "space": break;
				case "comment":
				case "newline":
					this.prelude.push(token.source);
					break;
				case "error": {
					const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
					const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
					if (this.atDirectives || !this.doc) this.errors.push(error);
					else this.doc.errors.push(error);
					break;
				}
				case "doc-end": {
					if (!this.doc) {
						this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", "Unexpected doc-end without preceding document"));
						break;
					}
					this.doc.directives.docEnd = true;
					const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
					this.decorate(this.doc, true);
					if (end.comment) {
						const dc = this.doc.comment;
						this.doc.comment = dc ? `${dc}\n${end.comment}` : end.comment;
					}
					this.doc.range[2] = end.offset;
					break;
				}
				default: this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
			}
		}
		/**
		* Call at end of input to yield any remaining document.
		*
		* @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
		* @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
		*/
		*end(forceDoc = false, endOffset = -1) {
			if (this.doc) {
				this.decorate(this.doc, true);
				yield this.doc;
				this.doc = null;
			} else if (forceDoc) {
				const opts = Object.assign({ _directives: this.directives }, this.options);
				const doc = new Document.Document(void 0, opts);
				if (this.atDirectives) this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
				doc.range = [
					0,
					endOffset,
					endOffset
				];
				this.decorate(doc, false);
				yield doc;
			}
		}
	};
	exports.Composer = Composer;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = /* @__PURE__ */ __commonJSMin(((exports) => {
	var resolveBlockScalar = require_resolve_block_scalar();
	var resolveFlowScalar = require_resolve_flow_scalar();
	var errors = require_errors();
	var stringifyString = require_stringifyString();
	function resolveAsScalar(token, strict = true, onError) {
		if (token) {
			const _onError = (pos, code, message) => {
				const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
				if (onError) onError(offset, code, message);
				else throw new errors.YAMLParseError([offset, offset + 1], code, message);
			};
			switch (token.type) {
				case "scalar":
				case "single-quoted-scalar":
				case "double-quoted-scalar": return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
				case "block-scalar": return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
			}
		}
		return null;
	}
	/**
	* Create a new scalar token with `value`
	*
	* Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
	* as this function does not support any schema operations and won't check for such conflicts.
	*
	* @param value The string representation of the value, which will have its content properly indented.
	* @param context.end Comments and whitespace after the end of the value, or after the block scalar header. If undefined, a newline will be added.
	* @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
	* @param context.indent The indent level of the token.
	* @param context.inFlow Is this scalar within a flow collection? This may affect the resolved type of the token's value.
	* @param context.offset The offset position of the token.
	* @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
	*/
	function createScalarToken(value, context) {
		const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
		const source = stringifyString.stringifyString({
			type,
			value
		}, {
			implicitKey,
			indent: indent > 0 ? " ".repeat(indent) : "",
			inFlow,
			options: {
				blockQuote: true,
				lineWidth: -1
			}
		});
		const end = context.end ?? [{
			type: "newline",
			offset: -1,
			indent,
			source: "\n"
		}];
		switch (source[0]) {
			case "|":
			case ">": {
				const he = source.indexOf("\n");
				const head = source.substring(0, he);
				const body = source.substring(he + 1) + "\n";
				const props = [{
					type: "block-scalar-header",
					offset,
					indent,
					source: head
				}];
				if (!addEndtoBlockProps(props, end)) props.push({
					type: "newline",
					offset: -1,
					indent,
					source: "\n"
				});
				return {
					type: "block-scalar",
					offset,
					indent,
					props,
					source: body
				};
			}
			case "\"": return {
				type: "double-quoted-scalar",
				offset,
				indent,
				source,
				end
			};
			case "'": return {
				type: "single-quoted-scalar",
				offset,
				indent,
				source,
				end
			};
			default: return {
				type: "scalar",
				offset,
				indent,
				source,
				end
			};
		}
	}
	/**
	* Set the value of `token` to the given string `value`, overwriting any previous contents and type that it may have.
	*
	* Best efforts are made to retain any comments previously associated with the `token`,
	* though all contents within a collection's `items` will be overwritten.
	*
	* Values that represent an actual string but may be parsed as a different type should use a `type` other than `'PLAIN'`,
	* as this function does not support any schema operations and won't check for such conflicts.
	*
	* @param token Any token. If it does not include an `indent` value, the value will be stringified as if it were an implicit key.
	* @param value The string representation of the value, which will have its content properly indented.
	* @param context.afterKey In most cases, values after a key should have an additional level of indentation.
	* @param context.implicitKey Being within an implicit key may affect the resolved type of the token's value.
	* @param context.inFlow Being within a flow collection may affect the resolved type of the token's value.
	* @param context.type The preferred type of the scalar token. If undefined, the previous type of the `token` will be used, defaulting to `'PLAIN'`.
	*/
	function setScalarValue(token, value, context = {}) {
		let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
		let indent = "indent" in token ? token.indent : null;
		if (afterKey && typeof indent === "number") indent += 2;
		if (!type) switch (token.type) {
			case "single-quoted-scalar":
				type = "QUOTE_SINGLE";
				break;
			case "double-quoted-scalar":
				type = "QUOTE_DOUBLE";
				break;
			case "block-scalar": {
				const header = token.props[0];
				if (header.type !== "block-scalar-header") throw new Error("Invalid block scalar header");
				type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
				break;
			}
			default: type = "PLAIN";
		}
		const source = stringifyString.stringifyString({
			type,
			value
		}, {
			implicitKey: implicitKey || indent === null,
			indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
			inFlow,
			options: {
				blockQuote: true,
				lineWidth: -1
			}
		});
		switch (source[0]) {
			case "|":
			case ">":
				setBlockScalarValue(token, source);
				break;
			case "\"":
				setFlowScalarValue(token, source, "double-quoted-scalar");
				break;
			case "'":
				setFlowScalarValue(token, source, "single-quoted-scalar");
				break;
			default: setFlowScalarValue(token, source, "scalar");
		}
	}
	function setBlockScalarValue(token, source) {
		const he = source.indexOf("\n");
		const head = source.substring(0, he);
		const body = source.substring(he + 1) + "\n";
		if (token.type === "block-scalar") {
			const header = token.props[0];
			if (header.type !== "block-scalar-header") throw new Error("Invalid block scalar header");
			header.source = head;
			token.source = body;
		} else {
			const { offset } = token;
			const indent = "indent" in token ? token.indent : -1;
			const props = [{
				type: "block-scalar-header",
				offset,
				indent,
				source: head
			}];
			if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0)) props.push({
				type: "newline",
				offset: -1,
				indent,
				source: "\n"
			});
			for (const key of Object.keys(token)) if (key !== "type" && key !== "offset") delete token[key];
			Object.assign(token, {
				type: "block-scalar",
				indent,
				props,
				source: body
			});
		}
	}
	/** @returns `true` if last token is a newline */
	function addEndtoBlockProps(props, end) {
		if (end) for (const st of end) switch (st.type) {
			case "space":
			case "comment":
				props.push(st);
				break;
			case "newline":
				props.push(st);
				return true;
		}
		return false;
	}
	function setFlowScalarValue(token, source, type) {
		switch (token.type) {
			case "scalar":
			case "double-quoted-scalar":
			case "single-quoted-scalar":
				token.type = type;
				token.source = source;
				break;
			case "block-scalar": {
				const end = token.props.slice(1);
				let oa = source.length;
				if (token.props[0].type === "block-scalar-header") oa -= token.props[0].source.length;
				for (const tok of end) tok.offset += oa;
				delete token.props;
				Object.assign(token, {
					type,
					source,
					end
				});
				break;
			}
			case "block-map":
			case "block-seq": {
				const nl = {
					type: "newline",
					offset: token.offset + source.length,
					indent: token.indent,
					source: "\n"
				};
				delete token.items;
				Object.assign(token, {
					type,
					source,
					end: [nl]
				});
				break;
			}
			default: {
				const indent = "indent" in token ? token.indent : -1;
				const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
				for (const key of Object.keys(token)) if (key !== "type" && key !== "offset") delete token[key];
				Object.assign(token, {
					type,
					indent,
					source,
					end
				});
			}
		}
	}
	exports.createScalarToken = createScalarToken;
	exports.resolveAsScalar = resolveAsScalar;
	exports.setScalarValue = setScalarValue;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Stringify a CST document, token, or collection item
	*
	* Fair warning: This applies no validation whatsoever, and
	* simply concatenates the sources in their logical order.
	*/
	const stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
	function stringifyToken(token) {
		switch (token.type) {
			case "block-scalar": {
				let res = "";
				for (const tok of token.props) res += stringifyToken(tok);
				return res + token.source;
			}
			case "block-map":
			case "block-seq": {
				let res = "";
				for (const item of token.items) res += stringifyItem(item);
				return res;
			}
			case "flow-collection": {
				let res = token.start.source;
				for (const item of token.items) res += stringifyItem(item);
				for (const st of token.end) res += st.source;
				return res;
			}
			case "document": {
				let res = stringifyItem(token);
				if (token.end) for (const st of token.end) res += st.source;
				return res;
			}
			default: {
				let res = token.source;
				if ("end" in token && token.end) for (const st of token.end) res += st.source;
				return res;
			}
		}
	}
	function stringifyItem({ start, key, sep, value }) {
		let res = "";
		for (const st of start) res += st.source;
		if (key) res += stringifyToken(key);
		if (sep) for (const st of sep) res += st.source;
		if (value) res += stringifyToken(value);
		return res;
	}
	exports.stringify = stringify;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = /* @__PURE__ */ __commonJSMin(((exports) => {
	const BREAK = Symbol("break visit");
	const SKIP = Symbol("skip children");
	const REMOVE = Symbol("remove item");
	/**
	* Apply a visitor to a CST document or item.
	*
	* Walks through the tree (depth-first) starting from the root, calling a
	* `visitor` function with two arguments when entering each item:
	*   - `item`: The current item, which included the following members:
	*     - `start: SourceToken[]` – Source tokens before the key or value,
	*       possibly including its anchor or tag.
	*     - `key?: Token | null` – Set for pair values. May then be `null`, if
	*       the key before the `:` separator is empty.
	*     - `sep?: SourceToken[]` – Source tokens between the key and the value,
	*       which should include the `:` map value indicator if `value` is set.
	*     - `value?: Token` – The value of a sequence item, or of a map pair.
	*   - `path`: The steps from the root to the current node, as an array of
	*     `['key' | 'value', number]` tuples.
	*
	* The return value of the visitor may be used to control the traversal:
	*   - `undefined` (default): Do nothing and continue
	*   - `visit.SKIP`: Do not visit the children of this token, continue with
	*      next sibling
	*   - `visit.BREAK`: Terminate traversal completely
	*   - `visit.REMOVE`: Remove the current item, then continue with the next one
	*   - `number`: Set the index of the next step. This is useful especially if
	*     the index of the current token has changed.
	*   - `function`: Define the next visitor for this item. After the original
	*     visitor is called on item entry, next visitors are called after handling
	*     a non-empty `key` and when exiting the item.
	*/
	function visit(cst, visitor) {
		if ("type" in cst && cst.type === "document") cst = {
			start: cst.start,
			value: cst.value
		};
		_visit(Object.freeze([]), cst, visitor);
	}
	/** Terminate visit traversal completely */
	visit.BREAK = BREAK;
	/** Do not visit the children of the current item */
	visit.SKIP = SKIP;
	/** Remove the current item */
	visit.REMOVE = REMOVE;
	/** Find the item at `path` from `cst` as the root */
	visit.itemAtPath = (cst, path) => {
		let item = cst;
		for (const [field, index] of path) {
			const tok = item?.[field];
			if (tok && "items" in tok) item = tok.items[index];
			else return void 0;
		}
		return item;
	};
	/**
	* Get the immediate parent collection of the item at `path` from `cst` as the root.
	*
	* Throws an error if the collection is not found, which should never happen if the item itself exists.
	*/
	visit.parentCollection = (cst, path) => {
		const parent = visit.itemAtPath(cst, path.slice(0, -1));
		const field = path[path.length - 1][0];
		const coll = parent?.[field];
		if (coll && "items" in coll) return coll;
		throw new Error("Parent collection not found");
	};
	function _visit(path, item, visitor) {
		let ctrl = visitor(item, path);
		if (typeof ctrl === "symbol") return ctrl;
		for (const field of ["key", "value"]) {
			const token = item[field];
			if (token && "items" in token) {
				for (let i = 0; i < token.items.length; ++i) {
					const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
					if (typeof ci === "number") i = ci - 1;
					else if (ci === BREAK) return BREAK;
					else if (ci === REMOVE) {
						token.items.splice(i, 1);
						i -= 1;
					}
				}
				if (typeof ctrl === "function" && field === "key") ctrl = ctrl(item, path);
			}
		}
		return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
	}
	exports.visit = visit;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/cst.js
var require_cst = /* @__PURE__ */ __commonJSMin(((exports) => {
	var cstScalar = require_cst_scalar();
	var cstStringify = require_cst_stringify();
	var cstVisit = require_cst_visit();
	/** The byte order mark */
	const BOM = "﻿";
	/** Start of doc-mode */
	const DOCUMENT = "";
	/** Unexpected end of flow-mode */
	const FLOW_END = "";
	/** Next token is a scalar value */
	const SCALAR = "";
	/** @returns `true` if `token` is a flow or block collection */
	const isCollection = (token) => !!token && "items" in token;
	/** @returns `true` if `token` is a flow or block scalar; not an alias */
	const isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
	/* istanbul ignore next */
	/** Get a printable representation of a lexer token */
	function prettyToken(token) {
		switch (token) {
			case BOM: return "<BOM>";
			case DOCUMENT: return "<DOC>";
			case FLOW_END: return "<FLOW_END>";
			case SCALAR: return "<SCALAR>";
			default: return JSON.stringify(token);
		}
	}
	/** Identify the type of a lexer token. May return `null` for unknown tokens. */
	function tokenType(source) {
		switch (source) {
			case BOM: return "byte-order-mark";
			case DOCUMENT: return "doc-mode";
			case FLOW_END: return "flow-error-end";
			case SCALAR: return "scalar";
			case "---": return "doc-start";
			case "...": return "doc-end";
			case "":
			case "\n":
			case "\r\n": return "newline";
			case "-": return "seq-item-ind";
			case "?": return "explicit-key-ind";
			case ":": return "map-value-ind";
			case "{": return "flow-map-start";
			case "}": return "flow-map-end";
			case "[": return "flow-seq-start";
			case "]": return "flow-seq-end";
			case ",": return "comma";
		}
		switch (source[0]) {
			case " ":
			case "	": return "space";
			case "#": return "comment";
			case "%": return "directive-line";
			case "*": return "alias";
			case "&": return "anchor";
			case "!": return "tag";
			case "'": return "single-quoted-scalar";
			case "\"": return "double-quoted-scalar";
			case "|":
			case ">": return "block-scalar-header";
		}
		return null;
	}
	exports.createScalarToken = cstScalar.createScalarToken;
	exports.resolveAsScalar = cstScalar.resolveAsScalar;
	exports.setScalarValue = cstScalar.setScalarValue;
	exports.stringify = cstStringify.stringify;
	exports.visit = cstVisit.visit;
	exports.BOM = BOM;
	exports.DOCUMENT = DOCUMENT;
	exports.FLOW_END = FLOW_END;
	exports.SCALAR = SCALAR;
	exports.isCollection = isCollection;
	exports.isScalar = isScalar;
	exports.prettyToken = prettyToken;
	exports.tokenType = tokenType;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/lexer.js
var require_lexer = /* @__PURE__ */ __commonJSMin(((exports) => {
	var cst = require_cst();
	function isEmpty(ch) {
		switch (ch) {
			case void 0:
			case " ":
			case "\n":
			case "\r":
			case "	": return true;
			default: return false;
		}
	}
	const hexDigits = /* @__PURE__ */ new Set("0123456789ABCDEFabcdef");
	const tagChars = /* @__PURE__ */ new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
	const flowIndicatorChars = /* @__PURE__ */ new Set(",[]{}");
	const invalidAnchorChars = /* @__PURE__ */ new Set(" ,[]{}\n\r	");
	const isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
	/**
	* Splits an input string into lexical tokens, i.e. smaller strings that are
	* easily identifiable by `tokens.tokenType()`.
	*
	* Lexing starts always in a "stream" context. Incomplete input may be buffered
	* until a complete token can be emitted.
	*
	* In addition to slices of the original input, the following control characters
	* may also be emitted:
	*
	* - `\x02` (Start of Text): A document starts with the next token
	* - `\x18` (Cancel): Unexpected end of flow-mode (indicates an error)
	* - `\x1f` (Unit Separator): Next token is a scalar value
	* - `\u{FEFF}` (Byte order mark): Emitted separately outside documents
	*/
	var Lexer = class {
		constructor() {
			/**
			* Flag indicating whether the end of the current buffer marks the end of
			* all input
			*/
			this.atEnd = false;
			/**
			* Explicit indent set in block scalar header, as an offset from the current
			* minimum indent, so e.g. set to 1 from a header `|2+`. Set to -1 if not
			* explicitly set.
			*/
			this.blockScalarIndent = -1;
			/**
			* Block scalars that include a + (keep) chomping indicator in their header
			* include trailing empty lines, which are otherwise excluded from the
			* scalar's contents.
			*/
			this.blockScalarKeep = false;
			/** Current input */
			this.buffer = "";
			/**
			* Flag noting whether the map value indicator : can immediately follow this
			* node within a flow context.
			*/
			this.flowKey = false;
			/** Count of surrounding flow collection levels. */
			this.flowLevel = 0;
			/**
			* Minimum level of indentation required for next lines to be parsed as a
			* part of the current scalar value.
			*/
			this.indentNext = 0;
			/** Indentation level of the current line. */
			this.indentValue = 0;
			/** Position of the next \n character. */
			this.lineEndPos = null;
			/** Stores the state of the lexer if reaching the end of incpomplete input */
			this.next = null;
			/** A pointer to `buffer`; the current position of the lexer. */
			this.pos = 0;
		}
		/**
		* Generate YAML tokens from the `source` string. If `incomplete`,
		* a part of the last line may be left as a buffer for the next call.
		*
		* @returns A generator of lexical tokens
		*/
		*lex(source, incomplete = false) {
			if (source) {
				if (typeof source !== "string") throw TypeError("source is not a string");
				this.buffer = this.buffer ? this.buffer + source : source;
				this.lineEndPos = null;
			}
			this.atEnd = !incomplete;
			let next = this.next ?? "stream";
			while (next && (incomplete || this.hasChars(1))) next = yield* this.parseNext(next);
		}
		atLineEnd() {
			let i = this.pos;
			let ch = this.buffer[i];
			while (ch === " " || ch === "	") ch = this.buffer[++i];
			if (!ch || ch === "#" || ch === "\n") return true;
			if (ch === "\r") return this.buffer[i + 1] === "\n";
			return false;
		}
		charAt(n) {
			return this.buffer[this.pos + n];
		}
		continueScalar(offset) {
			let ch = this.buffer[offset];
			if (this.indentNext > 0) {
				let indent = 0;
				while (ch === " ") ch = this.buffer[++indent + offset];
				if (ch === "\r") {
					const next = this.buffer[indent + offset + 1];
					if (next === "\n" || !next && !this.atEnd) return offset + indent + 1;
				}
				return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
			}
			if (ch === "-" || ch === ".") {
				const dt = this.buffer.substr(offset, 3);
				if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3])) return -1;
			}
			return offset;
		}
		getLine() {
			let end = this.lineEndPos;
			if (typeof end !== "number" || end !== -1 && end < this.pos) {
				end = this.buffer.indexOf("\n", this.pos);
				this.lineEndPos = end;
			}
			if (end === -1) return this.atEnd ? this.buffer.substring(this.pos) : null;
			if (this.buffer[end - 1] === "\r") end -= 1;
			return this.buffer.substring(this.pos, end);
		}
		hasChars(n) {
			return this.pos + n <= this.buffer.length;
		}
		setNext(state) {
			this.buffer = this.buffer.substring(this.pos);
			this.pos = 0;
			this.lineEndPos = null;
			this.next = state;
			return null;
		}
		peek(n) {
			return this.buffer.substr(this.pos, n);
		}
		*parseNext(next) {
			switch (next) {
				case "stream": return yield* this.parseStream();
				case "line-start": return yield* this.parseLineStart();
				case "block-start": return yield* this.parseBlockStart();
				case "doc": return yield* this.parseDocument();
				case "flow": return yield* this.parseFlowCollection();
				case "quoted-scalar": return yield* this.parseQuotedScalar();
				case "block-scalar": return yield* this.parseBlockScalar();
				case "plain-scalar": return yield* this.parsePlainScalar();
			}
		}
		*parseStream() {
			let line = this.getLine();
			if (line === null) return this.setNext("stream");
			if (line[0] === cst.BOM) {
				yield* this.pushCount(1);
				line = line.substring(1);
			}
			if (line[0] === "%") {
				let dirEnd = line.length;
				let cs = line.indexOf("#");
				while (cs !== -1) {
					const ch = line[cs - 1];
					if (ch === " " || ch === "	") {
						dirEnd = cs - 1;
						break;
					} else cs = line.indexOf("#", cs + 1);
				}
				while (true) {
					const ch = line[dirEnd - 1];
					if (ch === " " || ch === "	") dirEnd -= 1;
					else break;
				}
				const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
				yield* this.pushCount(line.length - n);
				this.pushNewline();
				return "stream";
			}
			if (this.atLineEnd()) {
				const sp = yield* this.pushSpaces(true);
				yield* this.pushCount(line.length - sp);
				yield* this.pushNewline();
				return "stream";
			}
			yield cst.DOCUMENT;
			return yield* this.parseLineStart();
		}
		*parseLineStart() {
			const ch = this.charAt(0);
			if (!ch && !this.atEnd) return this.setNext("line-start");
			if (ch === "-" || ch === ".") {
				if (!this.atEnd && !this.hasChars(4)) return this.setNext("line-start");
				const s = this.peek(3);
				if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
					yield* this.pushCount(3);
					this.indentValue = 0;
					this.indentNext = 0;
					return s === "---" ? "doc" : "stream";
				}
			}
			this.indentValue = yield* this.pushSpaces(false);
			if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1))) this.indentNext = this.indentValue;
			return yield* this.parseBlockStart();
		}
		*parseBlockStart() {
			const [ch0, ch1] = this.peek(2);
			if (!ch1 && !this.atEnd) return this.setNext("block-start");
			if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
				const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
				this.indentNext = this.indentValue + 1;
				this.indentValue += n;
				return "block-start";
			}
			return "doc";
		}
		*parseDocument() {
			yield* this.pushSpaces(true);
			const line = this.getLine();
			if (line === null) return this.setNext("doc");
			let n = yield* this.pushIndicators();
			switch (line[n]) {
				case "#": yield* this.pushCount(line.length - n);
				case void 0:
					yield* this.pushNewline();
					return yield* this.parseLineStart();
				case "{":
				case "[":
					yield* this.pushCount(1);
					this.flowKey = false;
					this.flowLevel = 1;
					return "flow";
				case "}":
				case "]":
					yield* this.pushCount(1);
					return "doc";
				case "*":
					yield* this.pushUntil(isNotAnchorChar);
					return "doc";
				case "\"":
				case "'": return yield* this.parseQuotedScalar();
				case "|":
				case ">":
					n += yield* this.parseBlockScalarHeader();
					n += yield* this.pushSpaces(true);
					yield* this.pushCount(line.length - n);
					yield* this.pushNewline();
					return yield* this.parseBlockScalar();
				default: return yield* this.parsePlainScalar();
			}
		}
		*parseFlowCollection() {
			let nl, sp;
			let indent = -1;
			do {
				nl = yield* this.pushNewline();
				if (nl > 0) {
					sp = yield* this.pushSpaces(false);
					this.indentValue = indent = sp;
				} else sp = 0;
				sp += yield* this.pushSpaces(true);
			} while (nl + sp > 0);
			const line = this.getLine();
			if (line === null) return this.setNext("flow");
			if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
				if (!(indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}"))) {
					this.flowLevel = 0;
					yield cst.FLOW_END;
					return yield* this.parseLineStart();
				}
			}
			let n = 0;
			while (line[n] === ",") {
				n += yield* this.pushCount(1);
				n += yield* this.pushSpaces(true);
				this.flowKey = false;
			}
			n += yield* this.pushIndicators();
			switch (line[n]) {
				case void 0: return "flow";
				case "#":
					yield* this.pushCount(line.length - n);
					return "flow";
				case "{":
				case "[":
					yield* this.pushCount(1);
					this.flowKey = false;
					this.flowLevel += 1;
					return "flow";
				case "}":
				case "]":
					yield* this.pushCount(1);
					this.flowKey = true;
					this.flowLevel -= 1;
					return this.flowLevel ? "flow" : "doc";
				case "*":
					yield* this.pushUntil(isNotAnchorChar);
					return "flow";
				case "\"":
				case "'":
					this.flowKey = true;
					return yield* this.parseQuotedScalar();
				case ":": {
					const next = this.charAt(1);
					if (this.flowKey || isEmpty(next) || next === ",") {
						this.flowKey = false;
						yield* this.pushCount(1);
						yield* this.pushSpaces(true);
						return "flow";
					}
				}
				default:
					this.flowKey = false;
					return yield* this.parsePlainScalar();
			}
		}
		*parseQuotedScalar() {
			const quote = this.charAt(0);
			let end = this.buffer.indexOf(quote, this.pos + 1);
			if (quote === "'") while (end !== -1 && this.buffer[end + 1] === "'") end = this.buffer.indexOf("'", end + 2);
			else while (end !== -1) {
				let n = 0;
				while (this.buffer[end - 1 - n] === "\\") n += 1;
				if (n % 2 === 0) break;
				end = this.buffer.indexOf("\"", end + 1);
			}
			const qb = this.buffer.substring(0, end);
			let nl = qb.indexOf("\n", this.pos);
			if (nl !== -1) {
				while (nl !== -1) {
					const cs = this.continueScalar(nl + 1);
					if (cs === -1) break;
					nl = qb.indexOf("\n", cs);
				}
				if (nl !== -1) end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
			}
			if (end === -1) {
				if (!this.atEnd) return this.setNext("quoted-scalar");
				end = this.buffer.length;
			}
			yield* this.pushToIndex(end + 1, false);
			return this.flowLevel ? "flow" : "doc";
		}
		*parseBlockScalarHeader() {
			this.blockScalarIndent = -1;
			this.blockScalarKeep = false;
			let i = this.pos;
			while (true) {
				const ch = this.buffer[++i];
				if (ch === "+") this.blockScalarKeep = true;
				else if (ch > "0" && ch <= "9") this.blockScalarIndent = Number(ch) - 1;
				else if (ch !== "-") break;
			}
			return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
		}
		*parseBlockScalar() {
			let nl = this.pos - 1;
			let indent = 0;
			let ch;
			loop: for (let i = this.pos; ch = this.buffer[i]; ++i) switch (ch) {
				case " ":
					indent += 1;
					break;
				case "\n":
					nl = i;
					indent = 0;
					break;
				case "\r": {
					const next = this.buffer[i + 1];
					if (!next && !this.atEnd) return this.setNext("block-scalar");
					if (next === "\n") break;
				}
				default: break loop;
			}
			if (!ch && !this.atEnd) return this.setNext("block-scalar");
			if (indent >= this.indentNext) {
				if (this.blockScalarIndent === -1) this.indentNext = indent;
				else this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
				do {
					const cs = this.continueScalar(nl + 1);
					if (cs === -1) break;
					nl = this.buffer.indexOf("\n", cs);
				} while (nl !== -1);
				if (nl === -1) {
					if (!this.atEnd) return this.setNext("block-scalar");
					nl = this.buffer.length;
				}
			}
			let i = nl + 1;
			ch = this.buffer[i];
			while (ch === " ") ch = this.buffer[++i];
			if (ch === "	") {
				while (ch === "	" || ch === " " || ch === "\r" || ch === "\n") ch = this.buffer[++i];
				nl = i - 1;
			} else if (!this.blockScalarKeep) do {
				let i = nl - 1;
				let ch = this.buffer[i];
				if (ch === "\r") ch = this.buffer[--i];
				const lastChar = i;
				while (ch === " ") ch = this.buffer[--i];
				if (ch === "\n" && i >= this.pos && i + 1 + indent > lastChar) nl = i;
				else break;
			} while (true);
			yield cst.SCALAR;
			yield* this.pushToIndex(nl + 1, true);
			return yield* this.parseLineStart();
		}
		*parsePlainScalar() {
			const inFlow = this.flowLevel > 0;
			let end = this.pos - 1;
			let i = this.pos - 1;
			let ch;
			while (ch = this.buffer[++i]) if (ch === ":") {
				const next = this.buffer[i + 1];
				if (isEmpty(next) || inFlow && flowIndicatorChars.has(next)) break;
				end = i;
			} else if (isEmpty(ch)) {
				let next = this.buffer[i + 1];
				if (ch === "\r") {
					if (next === "\n") {
						i += 1;
						ch = "\n";
						next = this.buffer[i + 1];
					} else end = i;
				}
				if (next === "#" || inFlow && flowIndicatorChars.has(next)) break;
				if (ch === "\n") {
					const cs = this.continueScalar(i + 1);
					if (cs === -1) break;
					i = Math.max(i, cs - 2);
				}
			} else {
				if (inFlow && flowIndicatorChars.has(ch)) break;
				end = i;
			}
			if (!ch && !this.atEnd) return this.setNext("plain-scalar");
			yield cst.SCALAR;
			yield* this.pushToIndex(end + 1, true);
			return inFlow ? "flow" : "doc";
		}
		*pushCount(n) {
			if (n > 0) {
				yield this.buffer.substr(this.pos, n);
				this.pos += n;
				return n;
			}
			return 0;
		}
		*pushToIndex(i, allowEmpty) {
			const s = this.buffer.slice(this.pos, i);
			if (s) {
				yield s;
				this.pos += s.length;
				return s.length;
			} else if (allowEmpty) yield "";
			return 0;
		}
		*pushIndicators() {
			let n = 0;
			loop: while (true) {
				switch (this.charAt(0)) {
					case "!":
						n += yield* this.pushTag();
						n += yield* this.pushSpaces(true);
						continue loop;
					case "&":
						n += yield* this.pushUntil(isNotAnchorChar);
						n += yield* this.pushSpaces(true);
						continue loop;
					case "-":
					case "?":
					case ":": {
						const inFlow = this.flowLevel > 0;
						const ch1 = this.charAt(1);
						if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
							if (!inFlow) this.indentNext = this.indentValue + 1;
							else if (this.flowKey) this.flowKey = false;
							n += yield* this.pushCount(1);
							n += yield* this.pushSpaces(true);
							continue loop;
						}
					}
				}
				break loop;
			}
			return n;
		}
		*pushTag() {
			if (this.charAt(1) === "<") {
				let i = this.pos + 2;
				let ch = this.buffer[i];
				while (!isEmpty(ch) && ch !== ">") ch = this.buffer[++i];
				return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
			} else {
				let i = this.pos + 1;
				let ch = this.buffer[i];
				while (ch) if (tagChars.has(ch)) ch = this.buffer[++i];
				else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) ch = this.buffer[i += 3];
				else break;
				return yield* this.pushToIndex(i, false);
			}
		}
		*pushNewline() {
			const ch = this.buffer[this.pos];
			if (ch === "\n") return yield* this.pushCount(1);
			else if (ch === "\r" && this.charAt(1) === "\n") return yield* this.pushCount(2);
			else return 0;
		}
		*pushSpaces(allowTabs) {
			let i = this.pos - 1;
			let ch;
			do
				ch = this.buffer[++i];
			while (ch === " " || allowTabs && ch === "	");
			const n = i - this.pos;
			if (n > 0) {
				yield this.buffer.substr(this.pos, n);
				this.pos = i;
			}
			return n;
		}
		*pushUntil(test) {
			let i = this.pos;
			let ch = this.buffer[i];
			while (!test(ch)) ch = this.buffer[++i];
			return yield* this.pushToIndex(i, false);
		}
	};
	exports.Lexer = Lexer;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Tracks newlines during parsing in order to provide an efficient API for
	* determining the one-indexed `{ line, col }` position for any offset
	* within the input.
	*/
	var LineCounter = class {
		constructor() {
			this.lineStarts = [];
			/**
			* Should be called in ascending order. Otherwise, call
			* `lineCounter.lineStarts.sort()` before calling `linePos()`.
			*/
			this.addNewLine = (offset) => this.lineStarts.push(offset);
			/**
			* Performs a binary search and returns the 1-indexed { line, col }
			* position of `offset`. If `line === 0`, `addNewLine` has never been
			* called or `offset` is before the first known newline.
			*/
			this.linePos = (offset) => {
				let low = 0;
				let high = this.lineStarts.length;
				while (low < high) {
					const mid = low + high >> 1;
					if (this.lineStarts[mid] < offset) low = mid + 1;
					else high = mid;
				}
				if (this.lineStarts[low] === offset) return {
					line: low + 1,
					col: 1
				};
				if (low === 0) return {
					line: 0,
					col: offset
				};
				const start = this.lineStarts[low - 1];
				return {
					line: low,
					col: offset - start + 1
				};
			};
		}
	};
	exports.LineCounter = LineCounter;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/parse/parser.js
var require_parser = /* @__PURE__ */ __commonJSMin(((exports) => {
	var node_process = __require("process");
	var cst = require_cst();
	var lexer = require_lexer();
	function includesToken(list, type) {
		for (let i = 0; i < list.length; ++i) if (list[i].type === type) return true;
		return false;
	}
	function findNonEmptyIndex(list) {
		for (let i = 0; i < list.length; ++i) switch (list[i].type) {
			case "space":
			case "comment":
			case "newline": break;
			default: return i;
		}
		return -1;
	}
	function isFlowToken(token) {
		switch (token?.type) {
			case "alias":
			case "scalar":
			case "single-quoted-scalar":
			case "double-quoted-scalar":
			case "flow-collection": return true;
			default: return false;
		}
	}
	function getPrevProps(parent) {
		switch (parent.type) {
			case "document": return parent.start;
			case "block-map": {
				const it = parent.items[parent.items.length - 1];
				return it.sep ?? it.start;
			}
			case "block-seq": return parent.items[parent.items.length - 1].start;
			/* istanbul ignore next should not happen */
			default: return [];
		}
	}
	/** Note: May modify input array */
	function getFirstKeyStartProps(prev) {
		if (prev.length === 0) return [];
		let i = prev.length;
		loop: while (--i >= 0) switch (prev[i].type) {
			case "doc-start":
			case "explicit-key-ind":
			case "map-value-ind":
			case "seq-item-ind":
			case "newline": break loop;
		}
		while (prev[++i]?.type === "space");
		return prev.splice(i, prev.length);
	}
	function arrayPushArray(target, source) {
		if (source.length < 1e5) Array.prototype.push.apply(target, source);
		else for (let i = 0; i < source.length; ++i) target.push(source[i]);
	}
	function fixFlowSeqItems(fc) {
		if (fc.start.type === "flow-seq-start") {
			for (const it of fc.items) if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
				if (it.key) it.value = it.key;
				delete it.key;
				if (isFlowToken(it.value)) {
					if (it.value.end) arrayPushArray(it.value.end, it.sep);
					else it.value.end = it.sep;
				} else arrayPushArray(it.start, it.sep);
				delete it.sep;
			}
		}
	}
	/**
	* A YAML concrete syntax tree (CST) parser
	*
	* ```ts
	* const src: string = ...
	* for (const token of new Parser().parse(src)) {
	*   // token: Token
	* }
	* ```
	*
	* To use the parser with a user-provided lexer:
	*
	* ```ts
	* function* parse(source: string, lexer: Lexer) {
	*   const parser = new Parser()
	*   for (const lexeme of lexer.lex(source))
	*     yield* parser.next(lexeme)
	*   yield* parser.end()
	* }
	*
	* const src: string = ...
	* const lexer = new Lexer()
	* for (const token of parse(src, lexer)) {
	*   // token: Token
	* }
	* ```
	*/
	var Parser = class {
		/**
		* @param onNewLine - If defined, called separately with the start position of
		*   each new line (in `parse()`, including the start of input).
		*/
		constructor(onNewLine) {
			/** If true, space and sequence indicators count as indentation */
			this.atNewLine = true;
			/** If true, next token is a scalar value */
			this.atScalar = false;
			/** Current indentation level */
			this.indent = 0;
			/** Current offset since the start of parsing */
			this.offset = 0;
			/** On the same line with a block map key */
			this.onKeyLine = false;
			/** Top indicates the node that's currently being built */
			this.stack = [];
			/** The source of the current token, set in parse() */
			this.source = "";
			/** The type of the current token, set in parse() */
			this.type = "";
			this.lexer = new lexer.Lexer();
			this.onNewLine = onNewLine;
		}
		/**
		* Parse `source` as a YAML stream.
		* If `incomplete`, a part of the last line may be left as a buffer for the next call.
		*
		* Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
		*
		* @returns A generator of tokens representing each directive, document, and other structure.
		*/
		*parse(source, incomplete = false) {
			if (this.onNewLine && this.offset === 0) this.onNewLine(0);
			for (const lexeme of this.lexer.lex(source, incomplete)) yield* this.next(lexeme);
			if (!incomplete) yield* this.end();
		}
		/**
		* Advance the parser by the `source` of one lexical token.
		*/
		*next(source) {
			this.source = source;
			if (node_process.env.LOG_TOKENS) console.log("|", cst.prettyToken(source));
			if (this.atScalar) {
				this.atScalar = false;
				yield* this.step();
				this.offset += source.length;
				return;
			}
			const type = cst.tokenType(source);
			if (!type) {
				const message = `Not a YAML token: ${source}`;
				yield* this.pop({
					type: "error",
					offset: this.offset,
					message,
					source
				});
				this.offset += source.length;
			} else if (type === "scalar") {
				this.atNewLine = false;
				this.atScalar = true;
				this.type = "scalar";
			} else {
				this.type = type;
				yield* this.step();
				switch (type) {
					case "newline":
						this.atNewLine = true;
						this.indent = 0;
						if (this.onNewLine) this.onNewLine(this.offset + source.length);
						break;
					case "space":
						if (this.atNewLine && source[0] === " ") this.indent += source.length;
						break;
					case "explicit-key-ind":
					case "map-value-ind":
					case "seq-item-ind":
						if (this.atNewLine) this.indent += source.length;
						break;
					case "doc-mode":
					case "flow-error-end": return;
					default: this.atNewLine = false;
				}
				this.offset += source.length;
			}
		}
		/** Call at end of input to push out any remaining constructions */
		*end() {
			while (this.stack.length > 0) yield* this.pop();
		}
		get sourceToken() {
			return {
				type: this.type,
				offset: this.offset,
				indent: this.indent,
				source: this.source
			};
		}
		*step() {
			const top = this.peek(1);
			if (this.type === "doc-end" && top?.type !== "doc-end") {
				while (this.stack.length > 0) yield* this.pop();
				this.stack.push({
					type: "doc-end",
					offset: this.offset,
					source: this.source
				});
				return;
			}
			if (!top) return yield* this.stream();
			switch (top.type) {
				case "document": return yield* this.document(top);
				case "alias":
				case "scalar":
				case "single-quoted-scalar":
				case "double-quoted-scalar": return yield* this.scalar(top);
				case "block-scalar": return yield* this.blockScalar(top);
				case "block-map": return yield* this.blockMap(top);
				case "block-seq": return yield* this.blockSequence(top);
				case "flow-collection": return yield* this.flowCollection(top);
				case "doc-end": return yield* this.documentEnd(top);
			}
			/* istanbul ignore next should not happen */
			yield* this.pop();
		}
		peek(n) {
			return this.stack[this.stack.length - n];
		}
		*pop(error) {
			const token = error ?? this.stack.pop();
			/* istanbul ignore if should not happen */
			if (!token) yield {
				type: "error",
				offset: this.offset,
				source: "",
				message: "Tried to pop an empty stack"
			};
			else if (this.stack.length === 0) yield token;
			else {
				const top = this.peek(1);
				if (token.type === "block-scalar") token.indent = "indent" in top ? top.indent : 0;
				else if (token.type === "flow-collection" && top.type === "document") token.indent = 0;
				if (token.type === "flow-collection") fixFlowSeqItems(token);
				switch (top.type) {
					case "document":
						top.value = token;
						break;
					case "block-scalar":
						top.props.push(token);
						break;
					case "block-map": {
						const it = top.items[top.items.length - 1];
						if (it.value) {
							top.items.push({
								start: [],
								key: token,
								sep: []
							});
							this.onKeyLine = true;
							return;
						} else if (it.sep) it.value = token;
						else {
							Object.assign(it, {
								key: token,
								sep: []
							});
							this.onKeyLine = !it.explicitKey;
							return;
						}
						break;
					}
					case "block-seq": {
						const it = top.items[top.items.length - 1];
						if (it.value) top.items.push({
							start: [],
							value: token
						});
						else it.value = token;
						break;
					}
					case "flow-collection": {
						const it = top.items[top.items.length - 1];
						if (!it || it.value) top.items.push({
							start: [],
							key: token,
							sep: []
						});
						else if (it.sep) it.value = token;
						else Object.assign(it, {
							key: token,
							sep: []
						});
						return;
					}
					/* istanbul ignore next should not happen */
					default:
						yield* this.pop();
						yield* this.pop(token);
				}
				if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
					const last = token.items[token.items.length - 1];
					if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
						if (top.type === "document") top.end = last.start;
						else top.items.push({ start: last.start });
						token.items.splice(-1, 1);
					}
				}
			}
		}
		*stream() {
			switch (this.type) {
				case "directive-line":
					yield {
						type: "directive",
						offset: this.offset,
						source: this.source
					};
					return;
				case "byte-order-mark":
				case "space":
				case "comment":
				case "newline":
					yield this.sourceToken;
					return;
				case "doc-mode":
				case "doc-start": {
					const doc = {
						type: "document",
						offset: this.offset,
						start: []
					};
					if (this.type === "doc-start") doc.start.push(this.sourceToken);
					this.stack.push(doc);
					return;
				}
			}
			yield {
				type: "error",
				offset: this.offset,
				message: `Unexpected ${this.type} token in YAML stream`,
				source: this.source
			};
		}
		*document(doc) {
			if (doc.value) return yield* this.lineEnd(doc);
			switch (this.type) {
				case "doc-start":
					if (findNonEmptyIndex(doc.start) !== -1) {
						yield* this.pop();
						yield* this.step();
					} else doc.start.push(this.sourceToken);
					return;
				case "anchor":
				case "tag":
				case "space":
				case "comment":
				case "newline":
					doc.start.push(this.sourceToken);
					return;
			}
			const bv = this.startBlockValue(doc);
			if (bv) this.stack.push(bv);
			else yield {
				type: "error",
				offset: this.offset,
				message: `Unexpected ${this.type} token in YAML document`,
				source: this.source
			};
		}
		*scalar(scalar) {
			if (this.type === "map-value-ind") {
				const start = getFirstKeyStartProps(getPrevProps(this.peek(2)));
				let sep;
				if (scalar.end) {
					sep = scalar.end;
					sep.push(this.sourceToken);
					delete scalar.end;
				} else sep = [this.sourceToken];
				const map = {
					type: "block-map",
					offset: scalar.offset,
					indent: scalar.indent,
					items: [{
						start,
						key: scalar,
						sep
					}]
				};
				this.onKeyLine = true;
				this.stack[this.stack.length - 1] = map;
			} else yield* this.lineEnd(scalar);
		}
		*blockScalar(scalar) {
			switch (this.type) {
				case "space":
				case "comment":
				case "newline":
					scalar.props.push(this.sourceToken);
					return;
				case "scalar":
					scalar.source = this.source;
					this.atNewLine = true;
					this.indent = 0;
					if (this.onNewLine) {
						let nl = this.source.indexOf("\n") + 1;
						while (nl !== 0) {
							this.onNewLine(this.offset + nl);
							nl = this.source.indexOf("\n", nl) + 1;
						}
					}
					yield* this.pop();
					break;
				/* istanbul ignore next should not happen */
				default:
					yield* this.pop();
					yield* this.step();
			}
		}
		*blockMap(map) {
			const it = map.items[map.items.length - 1];
			switch (this.type) {
				case "newline":
					this.onKeyLine = false;
					if (it.value) {
						const end = "end" in it.value ? it.value.end : void 0;
						if ((Array.isArray(end) ? end[end.length - 1] : void 0)?.type === "comment") end?.push(this.sourceToken);
						else map.items.push({ start: [this.sourceToken] });
					} else if (it.sep) it.sep.push(this.sourceToken);
					else it.start.push(this.sourceToken);
					return;
				case "space":
				case "comment":
					if (it.value) map.items.push({ start: [this.sourceToken] });
					else if (it.sep) it.sep.push(this.sourceToken);
					else {
						if (this.atIndentedComment(it.start, map.indent)) {
							const end = map.items[map.items.length - 2]?.value?.end;
							if (Array.isArray(end)) {
								arrayPushArray(end, it.start);
								end.push(this.sourceToken);
								map.items.pop();
								return;
							}
						}
						it.start.push(this.sourceToken);
					}
					return;
			}
			if (this.indent >= map.indent) {
				const atMapIndent = !this.onKeyLine && this.indent === map.indent;
				const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
				let start = [];
				if (atNextItem && it.sep && !it.value) {
					const nl = [];
					for (let i = 0; i < it.sep.length; ++i) {
						const st = it.sep[i];
						switch (st.type) {
							case "newline":
								nl.push(i);
								break;
							case "space": break;
							case "comment":
								if (st.indent > map.indent) nl.length = 0;
								break;
							default: nl.length = 0;
						}
					}
					if (nl.length >= 2) start = it.sep.splice(nl[1]);
				}
				switch (this.type) {
					case "anchor":
					case "tag":
						if (atNextItem || it.value) {
							start.push(this.sourceToken);
							map.items.push({ start });
							this.onKeyLine = true;
						} else if (it.sep) it.sep.push(this.sourceToken);
						else it.start.push(this.sourceToken);
						return;
					case "explicit-key-ind":
						if (!it.sep && !it.explicitKey) {
							it.start.push(this.sourceToken);
							it.explicitKey = true;
						} else if (atNextItem || it.value) {
							start.push(this.sourceToken);
							map.items.push({
								start,
								explicitKey: true
							});
						} else this.stack.push({
							type: "block-map",
							offset: this.offset,
							indent: this.indent,
							items: [{
								start: [this.sourceToken],
								explicitKey: true
							}]
						});
						this.onKeyLine = true;
						return;
					case "map-value-ind":
						if (it.explicitKey) {
							if (!it.sep) {
								if (includesToken(it.start, "newline")) Object.assign(it, {
									key: null,
									sep: [this.sourceToken]
								});
								else {
									const start = getFirstKeyStartProps(it.start);
									this.stack.push({
										type: "block-map",
										offset: this.offset,
										indent: this.indent,
										items: [{
											start,
											key: null,
											sep: [this.sourceToken]
										}]
									});
								}
							} else if (it.value) map.items.push({
								start: [],
								key: null,
								sep: [this.sourceToken]
							});
							else if (includesToken(it.sep, "map-value-ind")) this.stack.push({
								type: "block-map",
								offset: this.offset,
								indent: this.indent,
								items: [{
									start,
									key: null,
									sep: [this.sourceToken]
								}]
							});
							else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
								const start = getFirstKeyStartProps(it.start);
								const key = it.key;
								const sep = it.sep;
								sep.push(this.sourceToken);
								delete it.key;
								delete it.sep;
								this.stack.push({
									type: "block-map",
									offset: this.offset,
									indent: this.indent,
									items: [{
										start,
										key,
										sep
									}]
								});
							} else if (start.length > 0) it.sep = it.sep.concat(start, this.sourceToken);
							else it.sep.push(this.sourceToken);
						} else if (!it.sep) Object.assign(it, {
							key: null,
							sep: [this.sourceToken]
						});
						else if (it.value || atNextItem) map.items.push({
							start,
							key: null,
							sep: [this.sourceToken]
						});
						else if (includesToken(it.sep, "map-value-ind")) this.stack.push({
							type: "block-map",
							offset: this.offset,
							indent: this.indent,
							items: [{
								start: [],
								key: null,
								sep: [this.sourceToken]
							}]
						});
						else it.sep.push(this.sourceToken);
						this.onKeyLine = true;
						return;
					case "alias":
					case "scalar":
					case "single-quoted-scalar":
					case "double-quoted-scalar": {
						const fs = this.flowScalar(this.type);
						if (atNextItem || it.value) {
							map.items.push({
								start,
								key: fs,
								sep: []
							});
							this.onKeyLine = true;
						} else if (it.sep) this.stack.push(fs);
						else {
							Object.assign(it, {
								key: fs,
								sep: []
							});
							this.onKeyLine = true;
						}
						return;
					}
					default: {
						const bv = this.startBlockValue(map);
						if (bv) {
							if (bv.type === "block-seq") {
								if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
									yield* this.pop({
										type: "error",
										offset: this.offset,
										message: "Unexpected block-seq-ind on same line with key",
										source: this.source
									});
									return;
								}
							} else if (atMapIndent) map.items.push({ start });
							this.stack.push(bv);
							return;
						}
					}
				}
			}
			yield* this.pop();
			yield* this.step();
		}
		*blockSequence(seq) {
			const it = seq.items[seq.items.length - 1];
			switch (this.type) {
				case "newline":
					if (it.value) {
						const end = "end" in it.value ? it.value.end : void 0;
						if ((Array.isArray(end) ? end[end.length - 1] : void 0)?.type === "comment") end?.push(this.sourceToken);
						else seq.items.push({ start: [this.sourceToken] });
					} else it.start.push(this.sourceToken);
					return;
				case "space":
				case "comment":
					if (it.value) seq.items.push({ start: [this.sourceToken] });
					else {
						if (this.atIndentedComment(it.start, seq.indent)) {
							const end = seq.items[seq.items.length - 2]?.value?.end;
							if (Array.isArray(end)) {
								arrayPushArray(end, it.start);
								end.push(this.sourceToken);
								seq.items.pop();
								return;
							}
						}
						it.start.push(this.sourceToken);
					}
					return;
				case "anchor":
				case "tag":
					if (it.value || this.indent <= seq.indent) break;
					it.start.push(this.sourceToken);
					return;
				case "seq-item-ind":
					if (this.indent !== seq.indent) break;
					if (it.value || includesToken(it.start, "seq-item-ind")) seq.items.push({ start: [this.sourceToken] });
					else it.start.push(this.sourceToken);
					return;
			}
			if (this.indent > seq.indent) {
				const bv = this.startBlockValue(seq);
				if (bv) {
					this.stack.push(bv);
					return;
				}
			}
			yield* this.pop();
			yield* this.step();
		}
		*flowCollection(fc) {
			const it = fc.items[fc.items.length - 1];
			if (this.type === "flow-error-end") {
				let top;
				do {
					yield* this.pop();
					top = this.peek(1);
				} while (top?.type === "flow-collection");
			} else if (fc.end.length === 0) {
				switch (this.type) {
					case "comma":
					case "explicit-key-ind":
						if (!it || it.sep) fc.items.push({ start: [this.sourceToken] });
						else it.start.push(this.sourceToken);
						return;
					case "map-value-ind":
						if (!it || it.value) fc.items.push({
							start: [],
							key: null,
							sep: [this.sourceToken]
						});
						else if (it.sep) it.sep.push(this.sourceToken);
						else Object.assign(it, {
							key: null,
							sep: [this.sourceToken]
						});
						return;
					case "space":
					case "comment":
					case "newline":
					case "anchor":
					case "tag":
						if (!it || it.value) fc.items.push({ start: [this.sourceToken] });
						else if (it.sep) it.sep.push(this.sourceToken);
						else it.start.push(this.sourceToken);
						return;
					case "alias":
					case "scalar":
					case "single-quoted-scalar":
					case "double-quoted-scalar": {
						const fs = this.flowScalar(this.type);
						if (!it || it.value) fc.items.push({
							start: [],
							key: fs,
							sep: []
						});
						else if (it.sep) this.stack.push(fs);
						else Object.assign(it, {
							key: fs,
							sep: []
						});
						return;
					}
					case "flow-map-end":
					case "flow-seq-end":
						fc.end.push(this.sourceToken);
						return;
				}
				const bv = this.startBlockValue(fc);
				/* istanbul ignore else should not happen */
				if (bv) this.stack.push(bv);
				else {
					yield* this.pop();
					yield* this.step();
				}
			} else {
				const parent = this.peek(2);
				if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
					yield* this.pop();
					yield* this.step();
				} else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
					const start = getFirstKeyStartProps(getPrevProps(parent));
					fixFlowSeqItems(fc);
					const sep = fc.end.splice(1, fc.end.length);
					sep.push(this.sourceToken);
					const map = {
						type: "block-map",
						offset: fc.offset,
						indent: fc.indent,
						items: [{
							start,
							key: fc,
							sep
						}]
					};
					this.onKeyLine = true;
					this.stack[this.stack.length - 1] = map;
				} else yield* this.lineEnd(fc);
			}
		}
		flowScalar(type) {
			if (this.onNewLine) {
				let nl = this.source.indexOf("\n") + 1;
				while (nl !== 0) {
					this.onNewLine(this.offset + nl);
					nl = this.source.indexOf("\n", nl) + 1;
				}
			}
			return {
				type,
				offset: this.offset,
				indent: this.indent,
				source: this.source
			};
		}
		startBlockValue(parent) {
			switch (this.type) {
				case "alias":
				case "scalar":
				case "single-quoted-scalar":
				case "double-quoted-scalar": return this.flowScalar(this.type);
				case "block-scalar-header": return {
					type: "block-scalar",
					offset: this.offset,
					indent: this.indent,
					props: [this.sourceToken],
					source: ""
				};
				case "flow-map-start":
				case "flow-seq-start": return {
					type: "flow-collection",
					offset: this.offset,
					indent: this.indent,
					start: this.sourceToken,
					items: [],
					end: []
				};
				case "seq-item-ind": return {
					type: "block-seq",
					offset: this.offset,
					indent: this.indent,
					items: [{ start: [this.sourceToken] }]
				};
				case "explicit-key-ind": {
					this.onKeyLine = true;
					const start = getFirstKeyStartProps(getPrevProps(parent));
					start.push(this.sourceToken);
					return {
						type: "block-map",
						offset: this.offset,
						indent: this.indent,
						items: [{
							start,
							explicitKey: true
						}]
					};
				}
				case "map-value-ind": {
					this.onKeyLine = true;
					const start = getFirstKeyStartProps(getPrevProps(parent));
					return {
						type: "block-map",
						offset: this.offset,
						indent: this.indent,
						items: [{
							start,
							key: null,
							sep: [this.sourceToken]
						}]
					};
				}
			}
			return null;
		}
		atIndentedComment(start, indent) {
			if (this.type !== "comment") return false;
			if (this.indent <= indent) return false;
			return start.every((st) => st.type === "newline" || st.type === "space");
		}
		*documentEnd(docEnd) {
			if (this.type !== "doc-mode") {
				if (docEnd.end) docEnd.end.push(this.sourceToken);
				else docEnd.end = [this.sourceToken];
				if (this.type === "newline") yield* this.pop();
			}
		}
		*lineEnd(token) {
			switch (this.type) {
				case "comma":
				case "doc-start":
				case "doc-end":
				case "flow-seq-end":
				case "flow-map-end":
				case "map-value-ind":
					yield* this.pop();
					yield* this.step();
					break;
				case "newline": this.onKeyLine = false;
				default:
					if (token.end) token.end.push(this.sourceToken);
					else token.end = [this.sourceToken];
					if (this.type === "newline") yield* this.pop();
			}
		}
	};
	exports.Parser = Parser;
}));
//#endregion
//#region node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/public-api.js
var require_public_api = /* @__PURE__ */ __commonJSMin(((exports) => {
	var composer = require_composer();
	var Document = require_Document();
	var errors = require_errors();
	var log = require_log();
	var identity = require_identity();
	var lineCounter = require_line_counter();
	var parser = require_parser();
	function parseOptions(options) {
		const prettyErrors = options.prettyErrors !== false;
		return {
			lineCounter: options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null,
			prettyErrors
		};
	}
	/**
	* Parse the input as a stream of YAML documents.
	*
	* Documents should be separated from each other by `...` or `---` marker lines.
	*
	* @returns If an empty `docs` array is returned, it will be of type
	*   EmptyStream and contain additional stream information. In
	*   TypeScript, you should use `'empty' in docs` as a type guard for it.
	*/
	function parseAllDocuments(source, options = {}) {
		const { lineCounter, prettyErrors } = parseOptions(options);
		const parser$1 = new parser.Parser(lineCounter?.addNewLine);
		const composer$1 = new composer.Composer(options);
		const docs = Array.from(composer$1.compose(parser$1.parse(source)));
		if (prettyErrors && lineCounter) for (const doc of docs) {
			doc.errors.forEach(errors.prettifyError(source, lineCounter));
			doc.warnings.forEach(errors.prettifyError(source, lineCounter));
		}
		if (docs.length > 0) return docs;
		return Object.assign([], { empty: true }, composer$1.streamInfo());
	}
	/** Parse an input string into a single YAML.Document */
	function parseDocument(source, options = {}) {
		const { lineCounter, prettyErrors } = parseOptions(options);
		const parser$1 = new parser.Parser(lineCounter?.addNewLine);
		const composer$1 = new composer.Composer(options);
		let doc = null;
		for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) if (!doc) doc = _doc;
		else if (doc.options.logLevel !== "silent") {
			doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
			break;
		}
		if (prettyErrors && lineCounter) {
			doc.errors.forEach(errors.prettifyError(source, lineCounter));
			doc.warnings.forEach(errors.prettifyError(source, lineCounter));
		}
		return doc;
	}
	function parse(src, reviver, options) {
		let _reviver = void 0;
		if (typeof reviver === "function") _reviver = reviver;
		else if (options === void 0 && reviver && typeof reviver === "object") options = reviver;
		const doc = parseDocument(src, options);
		if (!doc) return null;
		doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
		if (doc.errors.length > 0) {
			if (doc.options.logLevel !== "silent") throw doc.errors[0];
			else doc.errors = [];
		}
		return doc.toJS(Object.assign({ reviver: _reviver }, options));
	}
	function stringify(value, replacer, options) {
		let _replacer = null;
		if (typeof replacer === "function" || Array.isArray(replacer)) _replacer = replacer;
		else if (options === void 0 && replacer) options = replacer;
		if (typeof options === "string") options = options.length;
		if (typeof options === "number") {
			const indent = Math.round(options);
			options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
		}
		if (value === void 0) {
			const { keepUndefined } = options ?? replacer ?? {};
			if (!keepUndefined) return void 0;
		}
		if (identity.isDocument(value) && !_replacer) return value.toString(options);
		return new Document.Document(value, _replacer, options).toString(options);
	}
	exports.parse = parse;
	exports.parseAllDocuments = parseAllDocuments;
	exports.parseDocument = parseDocument;
	exports.stringify = stringify;
}));
//#endregion
//#region .tsbuild/mcp/patch.js
/**
* profile patch 层里的 MCP 行读写。
*
* DSH 没有 MCP 管理 API——一个 MCP 服务就是 profile `cordis.patch.yml` 的
* insert 列表里一行 `name: '@deepseek-ai/dsh-mcp-client'`。所以「管理 MCP」
* 本质上是**改一个用户会手工编辑的 YAML 文件**，这决定了两件事：
*
* 1. 必须走 AST 级操作而不是「读成对象再整个写回」。整写会抹掉注释，
*    也会把 `!!js` 动态值烧成写死的字符串——那个值本来是启动时才求值的。
* 2. 每次写盘前留一份 `.bak-<时间戳>`，并且只动目标行，其他插件的行原样保留。
*
* @module @staff-os/dsh-workbench/mcp/patch
*/
var import_dist = (/* @__PURE__ */ __commonJSMin(((exports) => {
	var composer = require_composer();
	var Document = require_Document();
	var Schema = require_Schema();
	var errors = require_errors();
	var Alias = require_Alias();
	var identity = require_identity();
	var Pair = require_Pair();
	var Scalar = require_Scalar();
	var YAMLMap = require_YAMLMap();
	var YAMLSeq = require_YAMLSeq();
	require_cst();
	var lexer = require_lexer();
	var lineCounter = require_line_counter();
	var parser = require_parser();
	var publicApi = require_public_api();
	var visit = require_visit();
	exports.Composer = composer.Composer;
	exports.Document = Document.Document;
	exports.Schema = Schema.Schema;
	exports.YAMLError = errors.YAMLError;
	exports.YAMLParseError = errors.YAMLParseError;
	exports.YAMLWarning = errors.YAMLWarning;
	exports.Alias = Alias.Alias;
	exports.isAlias = identity.isAlias;
	exports.isCollection = identity.isCollection;
	exports.isDocument = identity.isDocument;
	exports.isMap = identity.isMap;
	exports.isNode = identity.isNode;
	exports.isPair = identity.isPair;
	exports.isScalar = identity.isScalar;
	exports.isSeq = identity.isSeq;
	exports.Pair = Pair.Pair;
	exports.Scalar = Scalar.Scalar;
	exports.YAMLMap = YAMLMap.YAMLMap;
	exports.YAMLSeq = YAMLSeq.YAMLSeq;
	exports.Lexer = lexer.Lexer;
	exports.LineCounter = lineCounter.LineCounter;
	exports.Parser = parser.Parser;
	exports.parse = publicApi.parse;
	exports.parseAllDocuments = publicApi.parseAllDocuments;
	exports.parseDocument = publicApi.parseDocument;
	exports.stringify = publicApi.stringify;
	exports.visit = visit.visit;
	exports.visitAsync = visit.visitAsync;
})))();
/** MCP 行的插件名；patch 行靠它识别。 */
const MCP_PLUGIN_NAME = "@deepseek-ai/dsh-mcp-client";
/** 与 `@deepseek-ai/dsh-mcp-client` 自身的校验保持一致。 */
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/u;
/** `!!js` 的完整标签名。 */
const JS_TAG = "tag:yaml.org,2002:js";
/**
* 动态值在本模块读写模型里的前缀。
*
* `!!js` 节点求值前只是一段源码，读出来若直接给字符串，调用方无从分辨
* 「值就是 `process.env.X` 这七个字」还是「这是个待求值表达式」。
* 统一带上 `!!js ` 前缀，读写两侧就对称了。
*/
const JS_PREFIX = "!!js ";
/** 由 serverName 推出 patch 行 id。 */
function rowIdFor(serverName) {
	return `mcp-${serverName}`;
}
/** 校验 serverName，不合法就抛。 */
function assertServerName(serverName) {
	if (!SERVER_NAME_PATTERN.test(serverName)) throw new WorkbenchError(`serverName "${serverName}" 不合法：只允许字母、数字、下划线和短横线，长度 1-32`, "WORKBENCH_MCP_BAD_NAME");
}
/**
* 建一个空的 patch 文档。
*
* 顶层必须是**块式**序列：`parseDocument('[]')` 给的是流式序列，而 YAML 的
* 流式上下文会传染给所有子节点，整个文件会渲染成 `[ { insert: [ ... ] } ]`
* 那样的一行流——能加载，但用户没法再手工编辑。
*/
function emptyPatchDocument() {
	const doc = (0, import_dist.parseDocument)("[]");
	if ((0, import_dist.isSeq)(doc.contents)) doc.contents.flow = false;
	return doc;
}
/**
* 读出 patch 文档；文件不存在时给一个空的顶层序列。
*
* 解析**错误**才抛；解析**警告**要放行——`!!js` 就会产生一条
* "Unresolved tag" 警告，那是预期内的，把它当错误会让所有含动态值的
* patch 都打不开。
*/
async function loadPatch(file) {
	let content;
	try {
		content = await readFile(file, "utf8");
	} catch (error) {
		if (error?.code === "ENOENT") return emptyPatchDocument();
		throw new WorkbenchError(`读取 patch 文件失败：${file}（${String(error)}）`, "WORKBENCH_MCP_READ_FAILED");
	}
	const doc = (0, import_dist.parseDocument)(content);
	if (doc.errors.length > 0) {
		const first = doc.errors[0];
		throw new WorkbenchError(`patch 文件解析失败：${file}（${first?.message ?? "未知错误"}）`, "WORKBENCH_MCP_PARSE_FAILED");
	}
	if (doc.contents === null) return emptyPatchDocument();
	if (!(0, import_dist.isSeq)(doc.contents)) throw new WorkbenchError(`patch 文件必须是顶层 YAML 数组：${file}`, "WORKBENCH_MCP_BAD_SHAPE");
	return doc;
}
/**
* 写回 patch 文档：先备份、再原子替换，全程持有跨进程写锁。
* @returns 备份文件路径；原文件不存在时为 `undefined`。
*/
async function savePatch(file, doc) {
	await mkdir(dirname(file), {
		recursive: true,
		mode: 448
	});
	return withFileLock(file, async () => {
		let backup;
		try {
			const previous = await readFile(file, "utf8");
			backup = `${file}.bak-${String(Date.now())}`;
			await writeFileAtomic(backup, previous, {
				mode: 384,
				dirMode: 448
			});
		} catch (error) {
			if (error?.code !== "ENOENT") throw error;
		}
		await writeFileAtomic(file, doc.toString({ singleQuote: true }), {
			mode: 384,
			dirMode: 448
		});
		return backup;
	});
}
/** 顶层序列。 */
function root(doc) {
	if (!(0, import_dist.isSeq)(doc.contents)) throw new WorkbenchError("patch 文档不是顶层数组", "WORKBENCH_MCP_BAD_SHAPE");
	return doc.contents;
}
/** 文档里所有 `insert` 列表。 */
function insertLists(doc) {
	const lists = [];
	for (const entry of root(doc).items) {
		if (!(0, import_dist.isMap)(entry)) continue;
		const list = entry.get("insert", true);
		if ((0, import_dist.isSeq)(list)) lists.push(list);
	}
	return lists;
}
/**
* 一个标量位置读成字符串；`!!js` 节点带上前缀以示区分。
*
* 两种形态都要认：从文件解析出来的是 `Scalar` 节点，而 `YAMLMap.set(key, 'x')`
* 存进去的是**裸 JS 值**。只认前者的话，本轮刚写进文档、还没落盘重读的行
* 会读不回来——写完立刻读回校验的路径就会假失败。
*/
function readScalar(node) {
	if ((0, import_dist.isScalar)(node)) {
		const raw = node.value;
		if (raw === null || raw === void 0) return void 0;
		const text = String(raw);
		return node.tag === "tag:yaml.org,2002:js" ? `${JS_PREFIX}${text}` : text;
	}
	if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") return String(node);
}
/** 建一个标量节点；带 `!!js ` 前缀的建成动态值节点。 */
function makeScalar(doc, value) {
	if (!value.startsWith("!!js ")) return doc.createNode(value);
	const node = doc.createNode(value.slice(5));
	node.tag = JS_TAG;
	return node;
}
/** 读一个字符串字典（env / headers）。 */
function readDict(node) {
	if (!(0, import_dist.isMap)(node)) return void 0;
	const out = {};
	for (const pair of node.items) {
		const key = readScalar(pair.key);
		const value = readScalar(pair.value);
		if (key !== void 0 && value !== void 0) out[key] = value;
	}
	return out;
}
/** 建一个字符串字典节点。 */
function makeDict(doc, dict) {
	const map = doc.createNode({});
	for (const [key, value] of Object.entries(dict)) map.set(key, makeScalar(doc, value));
	return map;
}
/** 读一个字符串数组。 */
function readList(node) {
	if (!(0, import_dist.isSeq)(node)) return void 0;
	return node.items.map((item) => readScalar(item)).filter((item) => item !== void 0);
}
function locateRow(doc, serverName) {
	for (const list of insertLists(doc)) for (const [index, item] of list.items.entries()) {
		if (!(0, import_dist.isMap)(item)) continue;
		if (readScalar(item.get("name", true)) !== "@deepseek-ai/dsh-mcp-client") continue;
		const config = item.get("config", true);
		if (!(0, import_dist.isMap)(config)) continue;
		if (readScalar(config.get("serverName", true)) === serverName) return {
			list,
			index,
			map: item
		};
	}
}
/** 收集被 `disabled: true` 关掉的行 id。 */
function disabledRowIds(doc) {
	const ids = /* @__PURE__ */ new Set();
	for (const entry of root(doc).items) {
		if (!(0, import_dist.isMap)(entry)) continue;
		if (entry.get("disabled") !== true) continue;
		const id = readScalar(entry.get("id", true));
		if (id !== void 0) ids.add(id);
	}
	return ids;
}
/** 列出 patch 里的全部 MCP 服务。 */
function listServers(doc) {
	const disabled = disabledRowIds(doc);
	const servers = [];
	for (const list of insertLists(doc)) for (const item of list.items) {
		if (!(0, import_dist.isMap)(item)) continue;
		if (readScalar(item.get("name", true)) !== "@deepseek-ai/dsh-mcp-client") continue;
		const config = item.get("config", true);
		if (!(0, import_dist.isMap)(config)) continue;
		const serverName = readScalar(config.get("serverName", true));
		if (serverName === void 0) continue;
		const rowId = readScalar(item.get("id", true)) ?? rowIdFor(serverName);
		const transport = readScalar(config.get("transport", true)) === "streamable-http" ? "streamable-http" : "stdio";
		const command = readScalar(config.get("command", true));
		const args = readList(config.get("args", true));
		const env = readDict(config.get("env", true));
		const cwd = readScalar(config.get("cwd", true));
		const url = readScalar(config.get("url", true));
		const headers = readDict(config.get("headers", true));
		const timeout = config.get("toolCallTimeoutMs");
		const failOnStartupError = config.get("failOnStartupError");
		servers.push({
			rowId,
			serverName,
			transport,
			...command === void 0 ? {} : { command },
			...args === void 0 || args.length === 0 ? {} : { args },
			...env === void 0 || Object.keys(env).length === 0 ? {} : { env },
			...cwd === void 0 || cwd === "" ? {} : { cwd },
			...url === void 0 ? {} : { url },
			...headers === void 0 || Object.keys(headers).length === 0 ? {} : { headers },
			...typeof timeout === "number" ? { toolCallTimeoutMs: timeout } : {},
			...typeof failOnStartupError === "boolean" ? { failOnStartupError } : {},
			disabled: disabled.has(rowId)
		});
	}
	return servers;
}
/**
* 校验一份输入在给定传输方式下是否自洽。
*
* stdio 要 command，streamable-http 要 url；两边的专属字段互相串台时直接报错，
* 而不是默默丢掉——一个配了 `url` 却是 stdio 的服务起不来，且现场极难看出原因。
*/
function assertConsistent(transport, input) {
	if (transport === "stdio") {
		if (input.command === void 0 || input.command === "") throw new WorkbenchError("stdio 传输必须给 command", "WORKBENCH_MCP_MISSING_COMMAND");
		if (input.url !== void 0 || input.headers !== void 0) throw new WorkbenchError("stdio 传输不接受 url / headers", "WORKBENCH_MCP_FIELD_CONFLICT");
		return;
	}
	if (input.url === void 0 || input.url === "") throw new WorkbenchError("streamable-http 传输必须给 url", "WORKBENCH_MCP_MISSING_URL");
	if (input.command !== void 0 || input.args !== void 0 || input.cwd !== void 0 || input.env !== void 0) throw new WorkbenchError("streamable-http 传输不接受 command / args / cwd / env", "WORKBENCH_MCP_FIELD_CONFLICT");
}
/** 建一个 MCP 行的 config 节点。 */
function makeConfig(doc, transport, input) {
	const config = doc.createNode({});
	config.set("transport", transport);
	config.set("serverName", input.serverName);
	if (transport === "stdio") {
		if (input.command !== void 0) config.set("command", makeScalar(doc, input.command));
		if (input.args !== void 0 && input.args.length > 0) config.set("args", doc.createNode(input.args.map((arg) => makeScalar(doc, arg))));
		if (input.env !== void 0 && Object.keys(input.env).length > 0) config.set("env", makeDict(doc, input.env));
		if (input.cwd !== void 0 && input.cwd !== "") config.set("cwd", makeScalar(doc, input.cwd));
	} else {
		if (input.url !== void 0) config.set("url", makeScalar(doc, input.url));
		if (input.headers !== void 0 && Object.keys(input.headers).length > 0) config.set("headers", makeDict(doc, input.headers));
	}
	if (input.toolCallTimeoutMs !== void 0) config.set("toolCallTimeoutMs", input.toolCallTimeoutMs);
	if (input.failOnStartupError !== void 0) config.set("failOnStartupError", input.failOnStartupError);
	return config;
}
/**
* 选一个 insert 列表来放新行：优先已经有 MCP 行的那个，
* 否则用最后一个 insert，都没有就新建一段。
*
* 这样多次添加的 MCP 行会聚在一起，而不是在文件里散成一片。
*/
function targetList(doc) {
	const lists = insertLists(doc);
	for (const list of lists) if (list.items.some((item) => (0, import_dist.isMap)(item) && readScalar(item.get("name", true)) === "@deepseek-ai/dsh-mcp-client")) return list;
	const last = lists.at(-1);
	if (last !== void 0) return last;
	const list = doc.createNode([]);
	const entry = doc.createNode({});
	entry.set("insert", list);
	entry.commentBefore = " MCP 服务，由 workbench_mcp 工具维护";
	root(doc).add(entry);
	return list;
}
/** 读回刚写完的一行，顺带确认写进去了。 */
function readBack(doc, serverName, what) {
	const found = listServers(doc).find((server) => server.serverName === serverName);
	if (found === void 0) throw new WorkbenchError(`${what}后未能读回 MCP 行 "${serverName}"`, "WORKBENCH_MCP_WRITE_FAILED");
	return found;
}
/** 往 patch 里加一个 MCP 服务。 */
function addServer(doc, input) {
	assertServerName(input.serverName);
	if (locateRow(doc, input.serverName) !== void 0) throw new WorkbenchError(`MCP 服务 "${input.serverName}" 已存在`, "WORKBENCH_MCP_DUPLICATE");
	const transport = input.transport ?? "stdio";
	assertConsistent(transport, input);
	const row = doc.createNode({});
	row.set("id", rowIdFor(input.serverName));
	row.set("name", MCP_PLUGIN_NAME);
	row.set("config", makeConfig(doc, transport, input));
	targetList(doc).add(row);
	return readBack(doc, input.serverName, "新增");
}
/**
* 更新一个 MCP 服务。
*
* 行的位置与周围注释保留，但 config 整块重建——patch 的 config 本来就是
* **整体替换**语义（不是深合并），所以「读出现状、合并入参、整块重写」
* 与 DSH 加载时看到的语义是一致的。
*/
function updateServer(doc, serverName, input) {
	const found = locateRow(doc, serverName);
	const current = listServers(doc).find((server) => server.serverName === serverName);
	if (found === void 0 || current === void 0) throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, "WORKBENCH_MCP_NOT_FOUND");
	const nextName = input.serverName ?? serverName;
	if (nextName !== serverName) {
		assertServerName(nextName);
		if (locateRow(doc, nextName) !== void 0) throw new WorkbenchError(`MCP 服务 "${nextName}" 已存在`, "WORKBENCH_MCP_DUPLICATE");
	}
	const transport = input.transport ?? current.transport;
	const keep = (key) => {
		const value = input[key] ?? current[key];
		return value === void 0 ? {} : { [key]: value };
	};
	const stdioFields = transport === "stdio" ? {
		...keep("command"),
		...keep("args"),
		...keep("env"),
		...keep("cwd")
	} : {};
	const httpFields = transport === "streamable-http" ? {
		...keep("url"),
		...keep("headers")
	} : {};
	const merged = {
		serverName: nextName,
		transport,
		...stdioFields,
		...httpFields,
		...keep("toolCallTimeoutMs"),
		...keep("failOnStartupError")
	};
	assertConsistent(transport, merged);
	found.map.set("id", rowIdFor(nextName));
	found.map.set("config", makeConfig(doc, transport, merged));
	return readBack(doc, nextName, "更新");
}
/** 从 patch 里删掉一个 MCP 服务，连同它的 disabled 条目和空掉的 insert 段。 */
function removeServer(doc, serverName) {
	const target = listServers(doc).find((server) => server.serverName === serverName);
	const found = locateRow(doc, serverName);
	if (found === void 0 || target === void 0) throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, "WORKBENCH_MCP_NOT_FOUND");
	found.list.items.splice(found.index, 1);
	const top = root(doc);
	for (let index = top.items.length - 1; index >= 0; index -= 1) {
		const entry = top.items[index];
		if (!(0, import_dist.isMap)(entry)) continue;
		const list = entry.get("insert", true);
		if ((0, import_dist.isSeq)(list) && list.items.length === 0 && entry.items.length === 1) {
			top.items.splice(index, 1);
			continue;
		}
		if (entry.get("disabled") === true && readScalar(entry.get("id", true)) === target.rowId) top.items.splice(index, 1);
	}
	return target;
}
/** 启用或停用一个 MCP 服务。 */
function setServerDisabled(doc, serverName, disabled) {
	const target = listServers(doc).find((server) => server.serverName === serverName);
	if (target === void 0) throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, "WORKBENCH_MCP_NOT_FOUND");
	const top = root(doc);
	const existing = top.items.findIndex((entry) => (0, import_dist.isMap)(entry) && entry.get("disabled") === true && readScalar(entry.get("id", true)) === target.rowId);
	if (disabled && existing === -1) {
		const entry = doc.createNode({});
		entry.set("id", target.rowId);
		entry.set("disabled", true);
		top.add(entry);
	} else if (!disabled && existing !== -1) top.items.splice(existing, 1);
	return readBack(doc, serverName, "切换启用状态");
}
//#endregion
//#region .tsbuild/mcp/import.js
/**
* 把 Claude Code / Cursor 风格的 `{ "mcpServers": {...} }` 翻译成 DSH 的 MCP 行。
*
* 这是 MCP 管理里最容易出静默错误的一步，因为两边的**变量语义不一样**：
* 那些客户端会在自己进程里把 `${VAR}` 展开成环境变量，DSH 不会——原样写进
* patch 的话，MCP 服务拿到的 token 就是 `${GITHUB_TOKEN}` 这十六个字符，
* 而且报错发生在远端鉴权阶段，很难回溯到这里。所以必须转成 `!!js` 表达式，
* 让 DSH 在启动时求值。
*
* @module @staff-os/dsh-workbench/mcp/import
*/
/** 整串就是一个 `${VAR}` 引用。 */
const WHOLE_REFERENCE = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/u;
/** 串里夹着一个或多个 `${VAR}` 引用。 */
const ANY_REFERENCE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/gu;
/**
* 把一个可能含 `${VAR}` 的值转成 patch 能用的形式。
*
* 整串就是一个引用时给最朴素的 `process.env.X`；夹在文字里时才用模板串，
* 因为 `Bearer ${TOKEN}` 这种拼接同样常见，而把它整体当成变量名会静默取到
* `undefined`。
*/
function convertVariables(value) {
	const whole = WHOLE_REFERENCE.exec(value);
	if (whole !== null) return `${JS_PREFIX}process.env.${whole[1] ?? ""}`;
	ANY_REFERENCE.lastIndex = 0;
	if (!ANY_REFERENCE.test(value)) return value;
	ANY_REFERENCE.lastIndex = 0;
	const template = value.replace(/`/gu, "\\`").replace(ANY_REFERENCE, (_match, name) => `\${process.env.${name}}`);
	return `${JS_PREFIX}\`${template}\``;
}
/** 对一个字典的每个值做变量转换。 */
function convertDict(dict) {
	const out = {};
	for (const [key, value] of Object.entries(dict)) if (typeof value === "string") out[key] = convertVariables(value);
	else if (value !== null && value !== void 0) out[key] = String(value);
	return out;
}
/**
* 把外部客户端的服务名压成 DSH 认的 serverName。
* @returns 合法名；无法救回时返回 `undefined`。
*/
function sanitizeServerName(raw) {
	if (SERVER_NAME_PATTERN.test(raw)) return raw;
	const clipped = raw.replace(/[^A-Za-z0-9_-]/gu, "-").replace(/-{2,}/gu, "-").replace(/^-|-$/gu, "").slice(0, 32);
	return SERVER_NAME_PATTERN.test(clipped) ? clipped : void 0;
}
function asRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
/**
* 解析一份 `{ "mcpServers": {...} }`。
*
* 顶层直接是服务字典（没有 `mcpServers` 包裹）也认——两种写法在野外都常见。
*/
function parseMcpServersJson(text) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch (error) {
		throw new WorkbenchError(`MCP 配置不是合法 JSON：${String(error)}`, "WORKBENCH_MCP_BAD_JSON");
	}
	const body = asRecord(parsed);
	if (body === void 0) throw new WorkbenchError("MCP 配置必须是一个 JSON 对象", "WORKBENCH_MCP_BAD_JSON");
	const servers = asRecord(body.mcpServers) ?? body;
	if (Object.keys(servers).length === 0) throw new WorkbenchError("MCP 配置里没有任何服务条目", "WORKBENCH_MCP_EMPTY_IMPORT");
	const imported = [];
	const skipped = [];
	for (const [originalName, raw] of Object.entries(servers)) {
		const entry = asRecord(raw);
		if (entry === void 0) {
			skipped.push({
				name: originalName,
				reason: "条目不是对象"
			});
			continue;
		}
		const serverName = sanitizeServerName(originalName);
		if (serverName === void 0) {
			skipped.push({
				name: originalName,
				reason: "服务名里没有可用的字母或数字"
			});
			continue;
		}
		const url = typeof entry.url === "string" ? entry.url : void 0;
		const transport = url === void 0 ? "stdio" : "streamable-http";
		if (transport === "streamable-http") {
			const headers = asRecord(entry.headers);
			imported.push({
				originalName,
				input: {
					serverName,
					transport,
					url: convertVariables(url ?? ""),
					...headers === void 0 ? {} : { headers: convertDict(headers) }
				}
			});
			continue;
		}
		const command = typeof entry.command === "string" ? entry.command : void 0;
		if (command === void 0 || command === "") {
			skipped.push({
				name: originalName,
				reason: "既没有 url 也没有 command"
			});
			continue;
		}
		const args = Array.isArray(entry.args) ? entry.args.filter((arg) => typeof arg === "string").map((arg) => convertVariables(arg)) : void 0;
		const env = asRecord(entry.env);
		const cwd = typeof entry.cwd === "string" ? entry.cwd : void 0;
		imported.push({
			originalName,
			input: {
				serverName,
				transport,
				command: convertVariables(command),
				...args === void 0 || args.length === 0 ? {} : { args },
				...env === void 0 ? {} : { env: convertDict(env) },
				...cwd === void 0 || cwd === "" ? {} : { cwd: convertVariables(cwd) }
			}
		});
	}
	return {
		servers: imported,
		skipped
	};
}
//#endregion
//#region .tsbuild/mcp/tool.js
/**
* 面向模型的 `workbench_mcp` 工具：管理本 profile 的 MCP 服务。
* @module @staff-os/dsh-workbench/mcp/tool
*/
/** 单次 MCP 操作的超时预算。 */
const DEFAULT_MCP_TOOL_TIMEOUT_MS = 2e4;
/** 工具支持的动作。 */
const ACTIONS$4 = [
	"list",
	"get",
	"add",
	"update",
	"delete",
	"enable",
	"disable",
	"import_json"
];
/** 投影一个服务，丢掉全部缺省字段，免得模型面对一堆 null。 */
function project$2(server) {
	return {
		rowId: server.rowId,
		serverName: server.serverName,
		transport: server.transport,
		disabled: server.disabled,
		...server.command === void 0 ? {} : { command: server.command },
		...server.args === void 0 ? {} : { args: [...server.args] },
		...server.env === void 0 ? {} : { env: { ...server.env } },
		...server.cwd === void 0 ? {} : { cwd: server.cwd },
		...server.url === void 0 ? {} : { url: server.url },
		...server.headers === void 0 ? {} : { headers: { ...server.headers } },
		...server.toolCallTimeoutMs === void 0 ? {} : { toolCallTimeoutMs: server.toolCallTimeoutMs },
		...server.failOnStartupError === void 0 ? {} : { failOnStartupError: server.failOnStartupError }
	};
}
/** 校验动作名。 */
function parseAction(raw) {
	const action = ACTIONS$4.find((candidate) => candidate === raw);
	if (action === void 0) throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS$4.join("、")}`, "WORKBENCH_BAD_ACTION");
	return action;
}
/** 取必填的 serverName。 */
function requireServerName(args, action) {
	const name = args.serverName?.trim();
	if (name === void 0 || name === "") throw new WorkbenchError(`动作 "${action}" 必须给 serverName`, "WORKBENCH_MISSING_ARG");
	return name;
}
/** 把一个自由形态的 JSON 值收成字符串字典。 */
function asStringDict(value, field) {
	if (value === void 0 || value === null) return void 0;
	if (typeof value !== "object" || Array.isArray(value)) throw new WorkbenchError(`${field} 必须是「键: 字符串」的对象`, "WORKBENCH_BAD_ARG");
	const out = {};
	for (const [key, item] of Object.entries(value)) {
		if (typeof item !== "string") throw new WorkbenchError(`${field}.${key} 必须是字符串`, "WORKBENCH_BAD_ARG");
		out[key] = item;
	}
	return out;
}
/** 校验传输方式。 */
function parseTransport(raw) {
	if (raw === void 0) return void 0;
	if (raw === "stdio" || raw === "streamable-http") return raw;
	throw new WorkbenchError(`未知 transport "${raw}"，可用：stdio、streamable-http`, "WORKBENCH_BAD_ARG");
}
/** 从入参收集写字段。 */
function collectInput(args) {
	const transport = parseTransport(args.transport);
	const env = asStringDict(args.env, "env");
	const headers = asStringDict(args.headers, "headers");
	return {
		...transport === void 0 ? {} : { transport },
		...args.command === void 0 ? {} : { command: args.command },
		...args.args === void 0 ? {} : { args: args.args },
		...env === void 0 ? {} : { env },
		...args.cwd === void 0 ? {} : { cwd: args.cwd },
		...args.url === void 0 ? {} : { url: args.url },
		...headers === void 0 ? {} : { headers },
		...args.toolCallTimeoutMs === void 0 ? {} : { toolCallTimeoutMs: args.toolCallTimeoutMs },
		...args.failOnStartupError === void 0 ? {} : { failOnStartupError: args.failOnStartupError }
	};
}
/**
* 渲染成一段给模型看的文本。
*
* 入参放宽成结构最小集而不是直接用 {@link McpOutput}：`render` 拿到的 value
* 是**由出参 schema 推出来**的类型，`env`/`headers` 在那边是自由 JSON，
* 与手写接口里的字符串字典对不上。
*/
function formatOutput(value) {
	const lines = [value.message];
	if (value.servers.length > 0) {
		lines.push("");
		for (const server of value.servers) {
			const flags = [server.transport];
			if (server.disabled) flags.push("已停用");
			const target = server.transport === "stdio" ? [server.command, ...server.args ?? []].filter(Boolean).join(" ") : server.url ?? "";
			lines.push(`- ${server.serverName}（${flags.join("，")}）：${target}`);
			const keys = [...dictKeys(server.env), ...dictKeys(server.headers)];
			if (keys.length > 0) lines.push(`  变量：${keys.join("、")}`);
		}
	}
	if (value.skipped.length > 0) {
		lines.push("");
		lines.push("已跳过：");
		for (const item of value.skipped) lines.push(`- ${item.name}：${item.reason}`);
	}
	if (value.backupFile !== void 0) {
		lines.push("");
		lines.push(`原文件已备份到 ${value.backupFile}`);
	}
	return lines.join("\n");
}
/** 取一个自由 JSON 值里的键名，取不出就当空。 */
function dictKeys(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? Object.keys(value) : [];
}
/** 一个服务在出参 schema 里的形状。 */
const SERVER_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		rowId: {
			type: "string",
			required: true
		},
		serverName: {
			type: "string",
			required: true
		},
		transport: {
			type: "string",
			required: true
		},
		disabled: {
			type: "boolean",
			required: true
		},
		command: { type: "string" },
		args: {
			type: "array",
			items: { type: "string" }
		},
		env: { type: "json" },
		cwd: { type: "string" },
		url: { type: "string" },
		headers: { type: "json" },
		toolCallTimeoutMs: { type: "number" },
		failOnStartupError: { type: "boolean" }
	}
};
/**
* 注册 `workbench_mcp` 工具及其使用指引。
*/
function applyMcpTool(ctx, timeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:workbench_mcp",
		order: 121,
		text: [
			"workbench_mcp 管理本机 DSH profile 的 MCP 服务，改的是 profile 的 cordis.patch.yml。",
			"改动在下次启动 DSH 时生效，改完要告诉用户这一点。",
			"env 与 headers 里如果要用密钥，写成 \"!!js process.env.变量名\"，让 DSH 启动时求值；",
			"不要把明文密钥写进配置。import_json 会自动把 Claude Code 风格的 ${VAR} 转成这种形式。",
			"delete 是不可逆的，必须先向用户说明要删哪个服务、得到同意后再带 confirm: true 调用。"
		].join("")
	});
	ctx.tools.register(defineTool({
		name: "workbench_mcp",
		description: [
			"Manage MCP servers for the local DeepSeek Harness profile. ",
			"Actions: list (all servers), get (one server), add, update, delete (needs confirm), ",
			"enable, disable, import_json (bulk import a Claude Code / Cursor style {\"mcpServers\":{...}} document). ",
			"Changes are written to the profile patch file and take effect on the next DSH start."
		].join(""),
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS$4,
				description: "Which operation to perform."
			},
			serverName: {
				type: "string",
				description: "Server name. Required for get/add/update/delete/enable/disable. Letters, digits, underscore and hyphen only, 1-32 characters. On update, passing a different value renames the server."
			},
			transport: {
				type: "string",
				enum: ["stdio", "streamable-http"],
				description: "Transport. stdio launches a local process (needs command); streamable-http connects to a URL (needs url). Defaults to stdio on add."
			},
			command: {
				type: "string",
				description: "stdio only: executable to launch."
			},
			args: {
				type: "array",
				items: { type: "string" },
				description: "stdio only: arguments passed to command."
			},
			env: {
				type: "json",
				description: "stdio only: environment variables as a flat string map. Use \"!!js process.env.NAME\" as the value to read a variable at startup instead of inlining a secret."
			},
			cwd: {
				type: "string",
				description: "stdio only: working directory for the launched process."
			},
			url: {
				type: "string",
				description: "streamable-http only: endpoint URL."
			},
			headers: {
				type: "json",
				description: "streamable-http only: HTTP headers as a flat string map. Use \"!!js process.env.NAME\" for secrets."
			},
			toolCallTimeoutMs: {
				type: "integer",
				description: "Per-tool-call timeout budget for this server, in milliseconds."
			},
			failOnStartupError: {
				type: "boolean",
				description: "Whether a connection failure at startup should fail the whole DSH launch."
			},
			json: {
				type: "string",
				description: "import_json only: the JSON document text to import."
			},
			confirm: {
				type: "boolean",
				description: "Required to be true for delete, which is irreversible. Ask the user first."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: {
						type: "string",
						required: true
					},
					message: {
						type: "string",
						required: true
					},
					servers: {
						type: "array",
						required: true,
						items: SERVER_SCHEMA
					},
					skipped: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								name: {
									type: "string",
									required: true
								},
								reason: {
									type: "string",
									required: true
								}
							}
						}
					},
					backupFile: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: formatOutput(value)
			}]
		},
		timeoutMs,
		isConcurrencySafe: (args) => parseAction(args.action) === "list" || parseAction(args.action) === "get",
		async execute(args) {
			const runtime = ctx.workbench;
			const file = runtime.paths.profilePatch;
			const action = parseAction(args.action);
			const doc = await loadPatch(file);
			if (action === "list") {
				const servers = listServers(doc);
				return {
					action,
					message: servers.length === 0 ? `profile "${runtime.profileName}" 还没有配置任何 MCP 服务` : `profile "${runtime.profileName}" 共 ${String(servers.length)} 个 MCP 服务`,
					servers: servers.map(project$2),
					skipped: []
				};
			}
			if (action === "get") {
				const serverName = requireServerName(args, action);
				const server = listServers(doc).find((candidate) => candidate.serverName === serverName);
				if (server === void 0) throw new WorkbenchError(`MCP 服务 "${serverName}" 不存在`, "WORKBENCH_MCP_NOT_FOUND");
				return {
					action,
					message: `MCP 服务 "${serverName}"`,
					servers: [project$2(server)],
					skipped: []
				};
			}
			if (action === "import_json") {
				if (args.json === void 0 || args.json.trim() === "") throw new WorkbenchError("动作 \"import_json\" 必须给 json", "WORKBENCH_MISSING_ARG");
				const parsed = parseMcpServersJson(args.json);
				const added = [];
				const skipped = [...parsed.skipped];
				for (const item of parsed.servers) try {
					added.push(addServer(doc, item.input));
				} catch (error) {
					skipped.push({
						name: item.originalName,
						reason: error instanceof Error ? error.message : String(error)
					});
				}
				if (added.length === 0) return {
					action,
					message: "没有可导入的 MCP 服务",
					servers: [],
					skipped
				};
				const backupFile = await savePatch(file, doc);
				const renamed = parsed.servers.filter((item) => item.originalName !== item.input.serverName).map((item) => `${item.originalName} → ${item.input.serverName}`);
				return {
					action,
					message: [`已导入 ${String(added.length)} 个 MCP 服务，下次启动 DSH 生效`, renamed.length === 0 ? "" : `（改名：${renamed.join("、")}）`].join(""),
					servers: added.map(project$2),
					skipped,
					...backupFile === void 0 ? {} : { backupFile }
				};
			}
			const serverName = requireServerName(args, action);
			let affected;
			let message;
			if (action === "add") {
				affected = addServer(doc, {
					...collectInput(args),
					serverName
				});
				message = `已新增 MCP 服务 "${serverName}"，下次启动 DSH 生效`;
			} else if (action === "update") {
				affected = updateServer(doc, serverName, collectInput(args));
				message = `已更新 MCP 服务 "${affected.serverName}"，下次启动 DSH 生效`;
			} else if (action === "delete") {
				requireConfirm(args.confirm, `删除 MCP 服务 "${serverName}"`);
				affected = removeServer(doc, serverName);
				message = `已删除 MCP 服务 "${serverName}"`;
			} else {
				const disabled = action === "disable";
				affected = setServerDisabled(doc, serverName, disabled);
				message = `已${disabled ? "停用" : "启用"} MCP 服务 "${serverName}"，下次启动 DSH 生效`;
			}
			const backupFile = await savePatch(file, doc);
			return {
				action,
				message,
				servers: [project$2(affected)],
				skipped: [],
				...backupFile === void 0 ? {} : { backupFile }
			};
		},
		presentCall: (args) => ({
			card: "generic",
			kind: "search",
			title: args.serverName === void 0 ? `MCP：${args.action}` : `MCP：${args.action} ${args.serverName}`,
			rawInput: args.action
		})
	}));
}
//#endregion
//#region .tsbuild/skill/local.js
/**
* 用户级技能目录的读写：`$DSH_HOME/skills/` 下那一层。
*
* 读路径本身由 DSH 原生的 `ctx.skills` 负责（它含 rank 与遮蔽规则，不重造），
* 这里只管**写**，以及读单个文件时那些 `ctx.skills` 不暴露的细节。
*
* ## 这里的解析必须和 DSH 的一模一样
*
* 本模块的 frontmatter 解析是 `@deepseek-ai/dsh-skill-filesystem` 的**镜像**，
* 不是一份宽松的近似。理由是这一域的界面在回答「模型现在能用什么」——两边
* 判定不一致时，界面会显示一个 DSH 根本不认的技能，或者漏掉一个它认的。
* 这类偏差没有任何错误提示，只表现为「我明明装了却调不到」。
*
* 与直觉不符、但确实是 DSH 那边规则的几条：
*
* - `name` **必填**，且必须是 kebab-case。缺了或不合法，DSH 整个忽略这份技能，
*   不是退回用目录名。
* - **技能的身份是 frontmatter 里的 `name`，不是目录名。** `bar/SKILL.md` 里写
*   `name: foo`，注册出来的就叫 `foo`，目录名只是个壳。
* - `whenToUse` 是驼峰，而两个开关是短横线（`disable-model-invocation`、
*   `user-invocable`）。同一份 frontmatter 里两种风格并存，看着像笔误，但它就是
*   这么解析的。
* - 驼峰写法的开关（`userInvocable` / `modelInvocable` / `disableModelInvocation`）
*   会让 DSH **抛错并整个丢弃这份技能**。这是最容易踩的一条：Claude Code 生态
*   的技能包里这么写的不少，装上去之后界面一切正常、模型却完全看不见它。
* - 开关的值不止 `true` / `false`：`yes` / `on` / `1` 这些也算真。
*
* ## DSH 不认识的字段一律无效
*
* frontmatter 里除上述几个键与 `metadata` 之外的东西，DSH 读都不读。
* `allowed-tools`、`license`、`version`、`model` 这些在别的 harness 里有意义的
* 字段，在 DSH 上既不报错也不起作用——尤其 `allowed-tools`，它看起来像个
* 权限边界，实际什么都不限制。
*
* @module @staff-os/dsh-workbench/skill/local
*/
/** 与 `@deepseek-ai/dsh-skill` 的 `isSkillName` 一致。 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
/** 目录形技能的正文文件名。 */
const SKILL_FILE = "SKILL.md";
/**
* 驼峰写法的开关键，以及它对应的正确写法。
*
* DSH 遇到这些键会抛错，整份技能被丢弃。写在这里是为了能**指出**问题，
* 而不是跟着一起忽略——「这份技能不生效」加上「因为第 3 行那个键」，
* 才是能修的信息。
*/
const LEGACY_INVOCATION_KEYS = {
	disableModelInvocation: "disable-model-invocation",
	modelInvocable: "disable-model-invocation",
	userInvocable: "user-invocable"
};
/** 校验技能名。 */
function assertSkillName(name) {
	if (!SKILL_NAME_PATTERN.test(name)) throw new WorkbenchError(`技能名 "${name}" 不合法：必须是小写字母数字的短横线分隔形式，例如 my-skill`, "WORKBENCH_SKILL_BAD_NAME");
}
/** 拆开 frontmatter 与正文。 */
function splitFrontmatter(raw) {
	const firstBreak = raw.indexOf("\n");
	if (firstBreak < 0) return void 0;
	if (raw.slice(0, firstBreak).replace(/\r$/u, "") !== "---") return void 0;
	let lineStart = firstBreak + 1;
	while (lineStart <= raw.length) {
		const nextBreak = raw.indexOf("\n", lineStart);
		const lineEnd = nextBreak < 0 ? raw.length : nextBreak;
		if (raw.slice(lineStart, lineEnd).replace(/\r$/u, "") === "---") return {
			frontmatter: raw.slice(firstBreak + 1, lineStart),
			body: raw.slice(nextBreak < 0 ? raw.length : nextBreak + 1)
		};
		if (nextBreak < 0) return void 0;
		lineStart = nextBreak + 1;
	}
}
/** 拼回一个完整的 SKILL.md。 */
function joinFrontmatter(frontmatter, body) {
	return `---\n${frontmatter.endsWith("\n") ? frontmatter : `${frontmatter}\n`}---\n${body}`;
}
function stringField(data, key) {
	const value = data[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
/**
* 按 DSH 的规则读一个布尔量。
*
* 不只认 `true` / `false`：YAML 里写 `yes`、`on`、`1` 的人不少，DSH 全都收下。
* 只认 JS 布尔的话，`disable-model-invocation: "true"` 会被这里当成「没设」，
* 界面显示「模型可调用」，而 DSH 那边是关着的。
*
* @returns 布尔值；键不存在时 `undefined`；值不是布尔量时抛错（与 DSH 一致）。
*/
function frontmatterBoolean(data, key) {
	if (!Object.hasOwn(data, key)) return void 0;
	const value = data[key];
	if (typeof value === "boolean") return value;
	if (value === 1 || value === "1") return true;
	if (value === 0 || value === "0") return false;
	if (typeof value === "string") switch (value.toLowerCase()) {
		case "true":
		case "yes":
		case "on": return true;
		case "false":
		case "no":
		case "off": return false;
	}
	throw new WorkbenchError(`frontmatter 字段 "${key}" 必须是布尔量`, "WORKBENCH_SKILL_BAD_FILE");
}
/**
* 按 DSH 的规则解析一份 SKILL.md 的文本。
*
* 判定与 `dsh-skill-filesystem` 的 `parseSkillFile` 逐条对齐，见模块头。
* 拒绝时给出**理由**，而不是简单地返回 `undefined`——理由是这份技能为什么
* 不生效的唯一线索。
*
* @param raw - SKILL.md（或扁平 `<name>.md`）的完整文本。
* @returns 解析成功的技能，或 DSH 丢弃它的理由。
*/
function parseSkillFrontmatter(raw) {
	const split = splitFrontmatter(raw);
	if (split === void 0) return {
		kind: "invalid",
		reason: "缺少 YAML frontmatter"
	};
	let data;
	try {
		const doc = (0, import_dist.parseDocument)(split.frontmatter);
		if (doc.errors.length > 0) return {
			kind: "invalid",
			reason: `frontmatter YAML 解析失败：${doc.errors[0]?.message ?? "未知错误"}`
		};
		const parsed = doc.toJS();
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {
			kind: "invalid",
			reason: "frontmatter 不是一个键值映射"
		};
		data = parsed;
	} catch (error) {
		return {
			kind: "invalid",
			reason: `frontmatter YAML 解析失败：${String(error)}`
		};
	}
	const name = stringField(data, "name");
	const description = stringField(data, "description");
	if (name === void 0 || description === void 0) return {
		kind: "invalid",
		reason: "frontmatter 至少要有 name 与 description"
	};
	if (!SKILL_NAME_PATTERN.test(name)) return {
		kind: "invalid",
		reason: `技能名 "${name}" 不是 kebab-case（小写字母数字加单个短横线）`
	};
	for (const [legacy, canonical] of Object.entries(LEGACY_INVOCATION_KEYS)) if (Object.hasOwn(data, legacy)) return {
		kind: "invalid",
		reason: `frontmatter 字段 "${legacy}" 不受支持，DSH 会因此丢弃整份技能；改成 "${canonical}"`
	};
	let disableModelInvocation;
	let userInvocable;
	try {
		disableModelInvocation = frontmatterBoolean(data, "disable-model-invocation");
		userInvocable = frontmatterBoolean(data, "user-invocable");
	} catch (error) {
		return {
			kind: "invalid",
			reason: error instanceof Error ? error.message : String(error)
		};
	}
	const whenToUse = stringField(data, "whenToUse");
	return {
		kind: "ok",
		skill: {
			name,
			description,
			...whenToUse === void 0 ? {} : { whenToUse },
			modelInvocable: disableModelInvocation !== true,
			userInvocable: userInvocable !== false,
			content: split.body.trim()
		}
	};
}
/** 一个技能的目录。 */
function skillDir(root, name) {
	return join(root, name);
}
/**
* 列出一个技能目录里的全部文件，**含 SKILL.md**，带体积。
*
* 与 {@link listExtraFiles} 的区别不只是多一个 SKILL.md：那一份是给清单和工具
* 用的「附带文件」，只要名字；这一份是给详情页的文件树用的，要的是「这个目录
* 里到底有什么」，所以 SKILL.md 也是其中一个文件，并且每个都 stat 一次拿体积。
* 分成两份而不是合并，是因为清单会把每个技能都扫一遍——为一个只有详情页用得上
* 的体积，给整份清单加上一轮 stat 不值当。
*
* @param dir - 技能目录。
* @returns 目录内文件，按路径排序；读不到时是空数组。
*/
async function listSkillFiles(dir, prefix = "") {
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const files = [];
	for (const entry of entries) {
		const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
		if (entry.isDirectory()) {
			files.push(...await listSkillFiles(join(dir, entry.name), relative));
			continue;
		}
		let size = 0;
		try {
			size = (await stat(join(dir, entry.name))).size;
		} catch {}
		files.push({
			path: relative,
			size
		});
	}
	return files.sort((left, right) => left.path.localeCompare(right.path));
}
/** 列出技能目录里除 SKILL.md 之外的文件。 */
async function listExtraFiles(dir, prefix = "") {
	let entries;
	try {
		entries = await readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const files = [];
	for (const entry of entries) {
		const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
		if (entry.isDirectory()) files.push(...await listExtraFiles(join(dir, entry.name), relative));
		else if (relative !== "SKILL.md") files.push(relative);
	}
	return files.sort((left, right) => left.localeCompare(right));
}
/** 读一个技能文件并按 DSH 的规则解析；连文件都读不到时给 `undefined`。 */
async function loadSkillFile(path) {
	let raw;
	try {
		raw = await readFile(path, "utf8");
	} catch {
		return;
	}
	return parseSkillFrontmatter(raw);
}
/**
* 从一个具体目录读目录形技能。
*
* 内部用：调用方给的是已经确定安全的路径（readdir 的结果、或本模块自己建的
* 暂存目录）。对外的 {@link readLocalSkill} 才做名字校验。
*/
async function readSkillDir(dir) {
	const path = join(dir, SKILL_FILE);
	const result = await loadSkillFile(path);
	if (result === void 0) return void 0;
	if (result.kind === "invalid") return {
		path,
		hint: dir.split(/[\\/]/u).pop() ?? dir,
		reason: result.reason
	};
	return {
		...result.skill,
		path,
		flat: false,
		files: await listExtraFiles(dir)
	};
}
/** 从一个扁平 `<name>.md` 读技能。 */
async function readSkillFlat(path) {
	const result = await loadSkillFile(path);
	if (result === void 0) return void 0;
	const hint = (path.split(/[\\/]/u).pop() ?? path).replace(/\.md$/iu, "");
	if (result.kind === "invalid") return {
		path,
		hint,
		reason: result.reason
	};
	return {
		...result.skill,
		path,
		flat: true,
		files: []
	};
}
/** 一个条目是不是被 DSH 拒收的那种。 */
function isRejected(entry) {
	return "reason" in entry;
}
/** 读一个盘上的技能；不存在或 DSH 不认时给 `undefined`。 */
async function readLocalSkill(root, name) {
	assertSkillName(name);
	const dir = await readSkillDir(skillDir(root, name));
	if (dir !== void 0 && !isRejected(dir)) return dir;
	const flat = await readSkillFlat(join(root, `${name}.md`));
	return flat !== void 0 && !isRejected(flat) ? flat : void 0;
}
/**
* 扫一遍用户级技能根。
*
* 目录形（`<name>/SKILL.md`）与扁平形（`<name>.md`）都算，因为 DSH 两种都收。
* 只认目录形会让手写的扁平技能在界面上凭空消失——它照常生效，却既看不见也
* 删不掉。
*
* `.system` 是 DSH 的保留目录，跳过；其余点开头的条目 DSH 其实照收，但那不是
* 本插件写出来的东西，交给下面 {@link scanLocalSkills} 一并列进 `rejected`
* 会更吵，所以同样跳过、不显示。
*/
async function scanLocalSkills(root) {
	let entries;
	try {
		entries = await readdir(root, { withFileTypes: true });
	} catch {
		return {
			skills: [],
			rejected: []
		};
	}
	const skills = [];
	const rejected = [];
	for (const entry of entries) {
		if (entry.name.startsWith(".")) continue;
		const found = entry.isDirectory() ? await readSkillDir(join(root, entry.name)) : entry.isFile() && entry.name.toLowerCase().endsWith(".md") ? await readSkillFlat(join(root, entry.name)) : void 0;
		if (found === void 0) continue;
		if (isRejected(found)) rejected.push(found);
		else skills.push(found);
	}
	return {
		skills: skills.sort((left, right) => left.name.localeCompare(right.name)),
		rejected: rejected.sort((left, right) => left.hint.localeCompare(right.hint))
	};
}
/** 列出用户级技能根下 DSH 会收下的技能。 */
async function listLocalSkills(root) {
	return [...(await scanLocalSkills(root)).skills];
}
/** 渲染一份新的 SKILL.md。 */
function renderSkillFile(input) {
	const lines = [`name: ${JSON.stringify(input.name)}`, `description: ${JSON.stringify(input.description)}`];
	if (input.whenToUse !== void 0 && input.whenToUse !== "") lines.push(`whenToUse: ${JSON.stringify(input.whenToUse)}`);
	if (input.modelInvocable === false) lines.push("disable-model-invocation: true");
	if (input.userInvocable === false) lines.push("user-invocable: false");
	const body = (input.content ?? "").trim();
	return joinFrontmatter(lines.join("\n"), body === "" ? "" : `\n${body}\n`);
}
/** 新建一个技能；同名已存在时报错。 */
async function createLocalSkill(root, input) {
	assertSkillName(input.name);
	if (input.description.trim() === "") throw new WorkbenchError("技能必须有 description，它是模型判断何时使用该技能的唯一依据", "WORKBENCH_SKILL_NO_DESCRIPTION");
	if (await readLocalSkill(root, input.name) !== void 0) throw new WorkbenchError(`技能 "${input.name}" 已存在`, "WORKBENCH_SKILL_DUPLICATE");
	const path = join(skillDir(root, input.name), SKILL_FILE);
	await writeFileAtomic(path, renderSkillFile(input), {
		mode: 384,
		dirMode: 448
	});
	const created = await readLocalSkill(root, input.name);
	if (created === void 0) throw new WorkbenchError("新建后未能读回该技能", "WORKBENCH_SKILL_WRITE_FAILED");
	return created;
}
/**
* 只改可见性，其余 frontmatter 字段与正文原样。
*
* 走 YAML AST 而不是重新渲染整个 frontmatter：技能文件常带 `license`、`version`
* 之类本模块不认识的字段，还可能有注释。重渲染会把它们全抹掉，而这只是为了改
* 一个布尔量。（那些字段 DSH 读都不读，但它们是文件作者写的，不该被这一下顺手
* 删掉。）
*
* 两个开关都用「回到默认就删键」的写法，文件保持最短。
*/
async function setSkillVisibility(root, name, visibility) {
	assertSkillName(name);
	const existing = await readLocalSkill(root, name);
	if (existing === void 0) throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
	const path = existing.path;
	let raw;
	try {
		raw = await readFile(path, "utf8");
	} catch {
		throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
	}
	const split = splitFrontmatter(raw);
	if (split === void 0) throw new WorkbenchError(`技能 "${name}" 缺少 YAML frontmatter`, "WORKBENCH_SKILL_BAD_FILE");
	const doc = (0, import_dist.parseDocument)(split.frontmatter);
	if (doc.errors.length > 0 || !(0, import_dist.isMap)(doc.contents)) throw new WorkbenchError(`技能 "${name}" 的 frontmatter 解析失败`, "WORKBENCH_SKILL_BAD_FILE");
	if (visibility.modelInvocable !== void 0) {
		if (visibility.modelInvocable) doc.delete("disable-model-invocation");
		else doc.set("disable-model-invocation", true);
	}
	if (visibility.userInvocable !== void 0) {
		if (visibility.userInvocable) doc.delete("user-invocable");
		else doc.set("user-invocable", false);
	}
	await writeFileAtomic(path, joinFrontmatter(doc.toString(), split.body), {
		mode: 384,
		dirMode: 448
	});
	const updated = await readLocalSkill(root, name);
	if (updated === void 0) throw new WorkbenchError("改可见性后未能读回该技能", "WORKBENCH_SKILL_WRITE_FAILED");
	return updated;
}
/** 删掉一个技能：目录形连目录删，扁平形删那个文件。 */
async function removeLocalSkill(root, name) {
	const existing = await readLocalSkill(root, name);
	if (existing === void 0) throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
	if (existing.flat) await rm(existing.path, { force: true });
	else await rm(skillDir(root, name), {
		recursive: true,
		force: true
	});
	return existing;
}
/** 把一个条目写进暂存目录。 */
async function writeStaged(staging, file) {
	const target = join(staging, file.path);
	await mkdir(dirname(target), {
		recursive: true,
		mode: 448
	});
	await writeFile(target, file.content, { mode: 384 });
}
/**
* 把一个技能包的文件落到技能根目录。
*
* 先写技能根**之外**的暂存目录、校验通过再整目录换上去。技能包来自市场或用户
* 给的压缩包，中途失败若直接落在目标目录上，留下的是一个「半个技能」——
* 它能被 DSH 扫到、却缺文件。
*
* 暂存目录必须在技能根之外：DSH 扫描技能根时只跳过 `.system`，别的点开头目录
* 照收，chokidar 也不忽略它们。建在根下的话，半成品会被当成一个真技能注册进去，
* 而且它排在正式目录前面（`.` 小于字母），同 rank 时先入者胜——一次失败的安装
* 留下的残骸会持续遮蔽同名技能，本插件的清单里还看不见它。
*
* 目录名以包内 frontmatter 的 `name` 为准：那才是 DSH 注册出来的身份，
* 用请求的名字建目录只会让盘上的名字和实际生效的名字对不上。
*/
async function installSkillFiles(location, files, options) {
	const { root, stagingParent } = location;
	const manifest = files.find((file) => file.path === SKILL_FILE);
	if (manifest === void 0) throw new WorkbenchError(`技能包里没有 ${SKILL_FILE}`, "WORKBENCH_SKILL_NO_MANIFEST");
	const parsed = parseSkillFrontmatter(packageFileText(manifest) ?? "");
	if (parsed.kind === "invalid") throw new WorkbenchError(`技能包的 ${SKILL_FILE} 不是 DSH 认得的技能：${parsed.reason}`, "WORKBENCH_SKILL_BAD_FILE");
	const installedAs = parsed.skill.name;
	const existing = await readLocalSkill(root, installedAs);
	if (existing !== void 0 && !options.overwrite) throw new WorkbenchError(`技能 "${installedAs}" 已存在；要覆盖请传 overwrite: true`, "WORKBENCH_SKILL_DUPLICATE");
	const staging = join(stagingParent, `${installedAs}.staging-${String(Date.now())}`);
	try {
		await rm(staging, {
			recursive: true,
			force: true
		});
		await mkdir(staging, {
			recursive: true,
			mode: 448
		});
		let binaryCount = 0;
		for (const file of files) {
			assertSafeEntryPath(file.path);
			if (packageFileText(file) === void 0) binaryCount += 1;
			await writeStaged(staging, file);
		}
		const target = skillDir(root, installedAs);
		await mkdir(root, {
			recursive: true,
			mode: 448
		});
		await rm(target, {
			recursive: true,
			force: true
		});
		await rm(join(root, `${installedAs}.md`), { force: true });
		await rename(staging, target);
		const installed = await readLocalSkill(root, installedAs);
		if (installed === void 0) throw new WorkbenchError("安装后未能读回该技能", "WORKBENCH_SKILL_WRITE_FAILED");
		return {
			skill: installed,
			installedAs,
			replaced: existing !== void 0,
			fileCount: files.length,
			binaryCount
		};
	} finally {
		await rm(staging, {
			recursive: true,
			force: true
		});
	}
}
//#endregion
//#region .tsbuild/skill/package.js
/**
* 技能包的形状解析：在一堆解出来的条目里找出「哪些是技能、各自的根在哪」。
*
* 早先这里的假设是「包根就有 SKILL.md」，只对市场那种单技能包成立。实际拿到
* 的包远不止一种形状：
*
* - `SKILL.md` 在根（市场的单技能包）
* - `<name>/SKILL.md`（打包时多带了一层目录）
* - `skills/<name>/SKILL.md`（一个仓库的技能集合，GitHub tarball 剥掉
*   `repo-<sha>/` 之后就是这个形状）
* - 上面几种的混合，一个包里好几个技能
*
* 一律按「找出包内所有 SKILL.md，各自把所在目录当成一个技能根」处理。找不到
* 就报错，并把包里实际有什么列出来——「包里没有 SKILL.md」这句话本身帮不上忙，
* 人需要知道的是「那里面到底是什么」。
*
* 扁平技能（`<name>.md`）**不在这里认**：一个 Markdown 文件在包里可能只是
* README，把它当技能装会凭空造出一个模型能调用的东西。扁平形式是给人手写在
* 技能根里的，不是包的分发形式。
*
* @module @staff-os/dsh-workbench/skill/package
*/
/** 一个条目在不在某个根之下。 */
function underRoot(path, root) {
	return root === "" ? true : path.startsWith(`${root}/`);
}
/** 把一个条目的路径改成相对于某个根。 */
function relativeTo(file, root) {
	return root === "" ? file : {
		path: file.path.slice(root.length + 1),
		content: file.content
	};
}
/**
* 找出包里的全部技能。
*
* **包根有 `SKILL.md` 时，整个包就是一个技能，到此为止。** 这不是图省事，
* 而是照着 DSH 的发现语义走：`dsh-skill-filesystem` 只看技能根下一层，
* 递归的 `**‍/SKILL.md` 明确不支持。所以装进 `<name>/` 之后，
* `notes/SKILL.md` 对 DSH 而言就是一个普通资源文件——技能正文引用它，
* 而不是它自己成为一个技能。
*
* 真实的包印证了这一点：SkillHub 上的 `ima-skills` 根有 SKILL.md，
* 底下 `notes/` 与 `knowledge-base/` 各还有一份。把它们拆成三个技能会凭空
* 造出两个模型可以自行调用的东西，而作者的意图是一个技能带两份子文档。
*
* 只有根没有 SKILL.md 时，才往下找——那是「一个仓库装着若干技能」的形状
* （`skills/<name>/SKILL.md`，GitHub tarball 剥掉 `repo-<sha>/` 之后常见）。
* 此时归属按「最近的那个根赢」，免得资源文件被外层技能一起收走。
*
* @param files - 解包并剥掉包裹目录之后的全部条目。
* @returns 按包内根路径排序的技能列表；一个都没有时为空数组。
*/
function findSkillsInPackage(files) {
	const manifests = [];
	for (const file of files) {
		if (file.path !== "SKILL.md" && !file.path.endsWith(`/SKILL.md`)) continue;
		if (packageFileText(file) === void 0) continue;
		manifests.push(file.path);
	}
	const roots = manifests.includes("SKILL.md") ? [""] : manifests.map((path) => path.slice(0, -9));
	roots.sort((left, right) => right.length - left.length || left.localeCompare(right));
	const claimed = /* @__PURE__ */ new Set();
	const found = [];
	for (const root of roots) {
		const owned = [];
		for (const file of files) {
			if (claimed.has(file.path) || !underRoot(file.path, root)) continue;
			claimed.add(file.path);
			owned.push(relativeTo(file, root));
		}
		const manifest = owned.find((file) => file.path === SKILL_FILE);
		/* c8 ignore next -- roots 就是从 SKILL.md 推出来的，认领必然拿得到它。 */
		if (manifest === void 0) continue;
		const parsed = parseSkillFrontmatter(packageFileText(manifest) ?? "");
		if (parsed.kind === "invalid") throw new WorkbenchError(`包内 ${root === "" ? SKILL_FILE : `${root}/${SKILL_FILE}`} 不是 DSH 认得的技能：${parsed.reason}；这样的技能 DSH 会整份丢弃，装上去也调不到，得先把包里的 frontmatter 改合规`, "WORKBENCH_SKILL_BAD_FILE");
		found.push({
			root,
			parsed: parsed.skill,
			files: owned
		});
	}
	return found.sort((left, right) => left.root.localeCompare(right.root));
}
/** 报错时给出的包内容摘要，最多列 8 条。 */
function describePackage(files) {
	const shown = files.slice(0, 8).map((file) => file.path);
	const rest = files.length - shown.length;
	if (shown.length === 0) return "空包";
	return `${shown.join("、")}${rest > 0 ? `，另有 ${String(rest)} 个条目` : ""}`;
}
/**
* 从包里挑出**唯一**要装的那个技能。
*
* 一个包里有多个技能时不猜：装哪个是用户的决定，猜错了的后果是盘上多出一个
* 他没打算装的、模型可以自行调用的技能。调用方拿到这个错误后，应该把
* {@link findSkillsInPackage} 的结果摆给用户选。
*
* @param files - 解包后的全部条目。
* @param prefer - 指定要哪一个技能（按 frontmatter 的 `name`）；留空时要求包里只有一个。
* @returns 选中的那个技能。
*/
function selectSkillFromPackage(files, prefer) {
	const found = findSkillsInPackage(files);
	if (found.length === 0) throw new WorkbenchError(`包里没有找到任何 ${SKILL_FILE}（包内有：${describePackage(files)}）`, "WORKBENCH_SKILL_NO_MANIFEST");
	if (prefer !== void 0) {
		const picked = found.find((entry) => entry.parsed.name === prefer);
		if (picked === void 0) {
			const names = found.map((entry) => entry.parsed.name).join("、");
			throw new WorkbenchError(`包里没有名为 "${prefer}" 的技能（包内有：${names}）`, "WORKBENCH_SKILL_NOT_FOUND");
		}
		return picked;
	}
	const only = found[0];
	if (found.length > 1 || only === void 0) {
		const names = found.map((entry) => `${entry.parsed.name}（${entry.root || "包根"}）`).join("、");
		throw new WorkbenchError(`包里有 ${String(found.length)} 个技能，请用 name 指定装哪一个：${names}`, "WORKBENCH_SKILL_AMBIGUOUS");
	}
	return only;
}
//#endregion
//#region .tsbuild/skill/ledger.js
/**
* 已安装技能的来源台账：这份技能从哪来、装的是哪一版。
*
* 没有它就没法回答「有没有新版本」——技能目录里只有 SKILL.md，
* frontmatter 里那个 `version` 是作者随手写的，与 registry 上的版本号
* 不是一回事（实测有包写 `version: "1.7.0"`，而 registry 上发布的是 `1.0.0`）。
* 更新检查必须拿装的时候记下来的那个版本去比。
*
* ## 为什么记在插件自己的地盘，而不是技能目录里
*
* 技能目录是 DSH 的 `resourceBase`——模型按正文里的相对路径去那里读文件。
* 往里塞一个本插件的元数据文件，是在别人的命名空间里放东西。所以台账落在
* `$DSH_HOME/workbench/skills.json`，技能目录保持只有技能自己的东西。
*
* 代价是台账可能与盘上对不上：人手动删掉技能目录，台账里那条就成了孤儿。
* 所以**以盘为准**：读的时候拿技能清单过滤一遍，盘上没有的条目不算数，
* 也不去主动清理——下一次安装同名技能时它自然被覆盖。
*
* @module @staff-os/dsh-workbench/skill/ledger
*/
/** 台账文件名，落在工作台自己的目录下。 */
const LEDGER_FILE = "skills.json";
/** 台账文件的绝对路径。 */
function ledgerPath(workbenchDir) {
	return join(workbenchDir, LEDGER_FILE);
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/** 把一条记录从 JSON 还原；形状不对时丢掉这一条而不是整个台账。 */
function parseEntry(name, raw) {
	if (!isRecord(raw)) return void 0;
	const registry = raw.registry;
	const slug = raw.slug;
	const version = raw.version;
	if (typeof registry !== "string" || typeof slug !== "string" || typeof version !== "string") return;
	const owner = raw.owner;
	const installedAt = raw.installedAt;
	return {
		name,
		registry,
		slug,
		version,
		...typeof owner === "string" && owner !== "" ? { owner } : {},
		installedAt: typeof installedAt === "number" && Number.isFinite(installedAt) ? installedAt : 0
	};
}
/**
* 读出全部安装记录。
*
* 文件不在、读不动、或者内容坏了，都当作空台账：它是加速用的辅助数据，
* 不该因为它坏了就让整个技能页打不开。
*/
async function readLedger(workbenchDir) {
	let raw;
	try {
		raw = await readFile(ledgerPath(workbenchDir), "utf8");
	} catch {
		return /* @__PURE__ */ new Map();
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return /* @__PURE__ */ new Map();
	}
	if (!isRecord(parsed) || !isRecord(parsed.skills)) return /* @__PURE__ */ new Map();
	const out = /* @__PURE__ */ new Map();
	for (const [name, value] of Object.entries(parsed.skills)) {
		const entry = parseEntry(name, value);
		if (entry !== void 0) out.set(name, entry);
	}
	return out;
}
/**
* 记下一次安装。
*
* 整份重写而不是追加：台账很小（一条几十字节），而读-改-写一次成型比维护
* 增量格式简单得多。
*/
async function recordInstall(workbenchDir, origin) {
	const current = await readLedger(workbenchDir);
	current.set(origin.name, origin);
	await writeLedger(workbenchDir, current);
}
/** 删掉一条记录。技能被删时调用；台账里留着孤儿条目没有害处，但也没有意义。 */
async function forgetInstall(workbenchDir, name) {
	const current = await readLedger(workbenchDir);
	if (!current.delete(name)) return;
	await writeLedger(workbenchDir, current);
}
async function writeLedger(workbenchDir, entries) {
	const skills = {};
	for (const [name, entry] of [...entries].sort((left, right) => left[0].localeCompare(right[0]))) {
		const { name: _dropped, ...rest } = entry;
		skills[name] = rest;
	}
	const file = {
		version: 1,
		skills
	};
	await writeFileAtomic(ledgerPath(workbenchDir), `${JSON.stringify(file, void 0, 2)}\n`, {
		mode: 384,
		dirMode: 448
	});
}
/**
* 判断两个版本号哪个新。
*
* 按点分段比，每段能当数字就比数字、否则比字符串；段数不同时短的补零。
* 认不出来的写法（日期串、带后缀的预发布号）不会崩，只是退化成字符串比较——
* 结论错了的后果是多提示一次更新，不是装错东西。
*/
function isNewerVersion(candidate, current) {
	if (candidate === current) return false;
	const left = candidate.split(".");
	const right = current.split(".");
	const length = Math.max(left.length, right.length);
	for (let index = 0; index < length; index += 1) {
		const a = left[index] ?? "0";
		const b = right[index] ?? "0";
		if (a === b) continue;
		const na = Number(a);
		const nb = Number(b);
		if (Number.isFinite(na) && Number.isFinite(nb)) return na > nb;
		return a.localeCompare(b) > 0;
	}
	return false;
}
//#endregion
//#region .tsbuild/skill/source.js
/**
* 技能包的来源解析：本地压缩包、远端 URL、或市场 slug。
*
* 三种来源共用一条落盘路径（解包 → 校验 → 原子替换），差别只在怎么拿到字节，
* 所以这里只负责「辨认来源」和「取回字节」，装盘交给 `local.ts`。
*
* @module @staff-os/dsh-workbench/skill/source
*/
/** 认得出的压缩包扩展名。 */
const ARCHIVE_SUFFIX = /\.(?:zip|tar|tgz|tar\.gz)$/iu;
/** 市场 slug 的形状；命名空间形式 `owner/name` 也算。 */
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/u;
/**
* 把 GitHub 页面地址翻成能直接下载的包地址。
*
* 用户手里的链接通常是浏览器地址栏里那一条，它返回的是 HTML 而不是包。
* `/tarball` 端点会跟随仓库的默认分支，省得让用户先去查默认分支叫什么。
*
* @returns 可下载的地址；不是 GitHub 仓库地址时返回 `undefined`。
*/
function githubArchiveUrl(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		return;
	}
	if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return void 0;
	const segments = url.pathname.split("/").filter((segment) => segment !== "");
	const owner = segments[0];
	const repo = segments[1]?.replace(/\.git$/iu, "");
	if (owner === void 0 || repo === void 0) return void 0;
	if (segments[2] === "archive") return raw;
	const base = `https://api.github.com/repos/${owner}/${repo}/tarball`;
	if (segments[2] === "tree" && segments.length > 3) return `${base}/${segments.slice(3).join("/")}`;
	return base;
}
/**
* 辨认一个 `from` 参数指的是哪种来源。
*
* 顺序有讲究：先看协议头，再看压缩包扩展名，剩下的才当 slug。反过来的话
* `https://…/foo.zip` 会被扩展名规则抢走，当成本地路径去读盘。
*/
function classifyImportSource(from, version) {
	const value = from.trim();
	if (value === "") throw new WorkbenchError("必须给 from：本地压缩包路径、下载链接、或市场 slug", "WORKBENCH_MISSING_ARG");
	if (/^https?:\/\//iu.test(value)) return {
		kind: "url",
		url: githubArchiveUrl(value) ?? value,
		label: value
	};
	if (ARCHIVE_SUFFIX.test(value)) return {
		kind: "archive",
		path: value
	};
	if (SLUG_PATTERN.test(value)) return {
		kind: "registry",
		slug: value,
		...version === void 0 ? {} : { version }
	};
	return {
		kind: "archive",
		path: value
	};
}
/**
* 从来源字符串里凑一个合法的技能名。
*
* 只是暂存目录的名字与兜底：真正的技能名以包内 frontmatter 的 `name` 为准，
* 所以这里凑不准也不影响最终装出来的东西叫什么。
*/
function fallbackSkillName(hint) {
	const kebab = (hint.split(/[\\/]/u).filter((segment) => segment !== "").pop() ?? hint).replace(ARCHIVE_SUFFIX, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
	return kebab === "" ? "imported-skill" : kebab;
}
/**
* 带上限地读完一个响应体。
*
* `arrayBuffer()` 会先把整个响应吃进内存再让人检查大小，对着一个恶意的
* 无限流就是直接把进程撑爆。这里边收边算，超了立刻断。
*/
async function readCapped(response, cap, label) {
	const declared = Number(response.headers.get("content-length") ?? "");
	if (Number.isFinite(declared) && declared > cap) throw new WorkbenchError(`${label} 的包声明有 ${String(declared)} 字节，超过 ${String(cap)} 上限`, "WORKBENCH_PACKAGE_TOO_LARGE");
	const body = response.body;
	if (body === null) throw new WorkbenchError(`${label} 没有返回包内容`, "WORKBENCH_DOWNLOAD_FAILED");
	const chunks = [];
	let total = 0;
	for await (const chunk of body) {
		total += chunk.byteLength;
		if (total > cap) throw new WorkbenchError(`${label} 的包超过 ${String(cap)} 字节上限，已中断下载`, "WORKBENCH_PACKAGE_TOO_LARGE");
		chunks.push(Buffer.from(chunk));
	}
	return Buffer.concat(chunks);
}
/** 从 URL 取一个技能包。 */
async function fetchPackage(url, label, timeoutMs, signal) {
	throwIfAborted(signal);
	let response;
	try {
		response = await fetch(url, {
			headers: { accept: "application/octet-stream, application/gzip, application/zip, */*" },
			redirect: "follow",
			signal: signal ?? AbortSignal.timeout(timeoutMs)
		});
	} catch (error) {
		if (signal?.aborted === true || isAbortError(error)) throw new WorkbenchError("技能包下载已取消", "WORKBENCH_ABORTED", { cause: error });
		throw new WorkbenchError(`下载 ${label} 失败：${String(error)}`, "WORKBENCH_DOWNLOAD_FAILED", { cause: error });
	}
	if (!response.ok) throw new WorkbenchError(`下载 ${label} 失败：HTTP ${String(response.status)}`, "WORKBENCH_DOWNLOAD_FAILED");
	return stripCommonPrefix(await extractPackage(await readCapped(response, MAX_TOTAL_BYTES, label)));
}
/**
* 浏览器上传的压缩包，允许多大。
*
* 比解包那边的 {@link MAX_TOTAL_BYTES} 紧得多，因为这条路径与那条不同：包字节
* 是**随一次 Remote 调用整个传上来**的，base64 之后还要涨三分之一，中途没有
* 分片也没有流式。技能包本来就小——市场上最大的也就几百 KB——所以这里按
* 「够用且不会把一次调用撑爆」定，而不是照抄解包上限。
*/
const MAX_UPLOAD_BYTES = 8388608;
/**
* 把浏览器传上来的 base64 解回压缩包字节。
*
* @param contentBase64 - 包字节的 base64。
* @param label - 出错时用来指代它的名字，通常是原始文件名。
* @returns 压缩包字节。
*/
function decodeUploadedPackage(contentBase64, label) {
	const encoded = contentBase64.trim();
	if (encoded === "") throw new WorkbenchError(`${label} 是空的，没有可安装的内容`, "WORKBENCH_MISSING_ARG");
	const estimated = Math.floor(encoded.length * 3 / 4);
	if (estimated > 8388608) throw new WorkbenchError(`${label} 约 ${String(estimated)} 字节，超过上传上限 ${String(MAX_UPLOAD_BYTES)}；这么大的包请放到盘上或发到市场，再用 workbench_skill 的 import 装`, "WORKBENCH_PACKAGE_TOO_LARGE");
	const data = Buffer.from(encoded, "base64");
	if (data.length === 0) throw new WorkbenchError(`${label} 的内容不是合法的 base64`, "WORKBENCH_PACKAGE_UNREADABLE");
	return data;
}
/**
* 从一段已经在内存里的压缩包字节读一个技能包。
*
* 与 {@link readLocalPackage} 是同一条解包路径——同一套体积与路径检查、
* 同样剥掉公共前缀目录。浏览器上传走这里：那份字节是用户在文件选择器里
* 挑的，宿主这边没有它的路径可读。
*
* @param data - 压缩包字节。
* @param label - 出错时用来指代它的名字，通常是原始文件名。
* @returns 包内文件，路径已相对化。
*/
async function readPackageBytes(data, label) {
	if (data.length > 52428800) throw new WorkbenchError(`压缩包 ${label} 有 ${String(data.length)} 字节，超过 ${String(MAX_TOTAL_BYTES)} 上限`, "WORKBENCH_PACKAGE_TOO_LARGE");
	const files = stripCommonPrefix(await extractPackage(data));
	if (files.length === 0) throw new WorkbenchError(`${label} 里没有解出任何文件：它多半不是 zip / tar / tgz 压缩包`, "WORKBENCH_PACKAGE_UNREADABLE");
	return files;
}
/** 从本地压缩包读一个技能包。 */
async function readLocalPackage(path) {
	let data;
	try {
		data = await readFile(path);
	} catch (error) {
		throw new WorkbenchError(`读不到压缩包 ${path}：${String(error)}`, "WORKBENCH_PACKAGE_UNREADABLE", { cause: error });
	}
	return readPackageBytes(data, path);
}
//#endregion
//#region .tsbuild/skill/view.js
/**
* 技能域的投影：工具与管理界面共用的那一份。
*
* 这里放的是「一个技能在外面长什么样」的唯一定义。工具（给模型）与 Remote
* 网关（给界面）都从这里取，两边因此不会各说各话——员工域上一轮踩过的坑
* 就是投影被抄了两份，注释说共用、实际各算各的。
*
* 最要紧的一件事是 {@link collectSkills} 合的那两份清单：`ctx.skills` 回答
* 「模型现在能用什么」（含 rank 与同名遮蔽），本地目录回答「本插件改得动
* 什么」。同名时高 rank 的来源会盖住用户级，盘上那份仍在、却不生效——
* `shadowed` 标的就是这种情况。不标出来的话，「我明明建了却调不到」会变成
* 一个查不明白的问题。
*
* @module @staff-os/dsh-workbench/skill/view
*/
/** 把一个市场条目投影成出参形状。 */
function projectMarket(item) {
	return {
		slug: item.slug,
		name: item.name,
		...item.description === void 0 ? {} : { description: item.description },
		...item.version === void 0 ? {} : { version: item.version },
		tags: [...item.tags],
		...item.category === void 0 ? {} : { category: item.category },
		installCount: item.installCount,
		avgRating: item.avgRating,
		downloadCount: item.downloadCount,
		stars: item.stars,
		...item.owner === void 0 ? {} : { owner: item.owner },
		...item.iconUrl === void 0 ? {} : { iconUrl: item.iconUrl },
		...item.homepage === void 0 ? {} : { homepage: item.homepage },
		...item.securityStatus === void 0 ? {} : { securityStatus: item.securityStatus },
		...item.installKind === void 0 ? {} : { installKind: item.installKind },
		installable: item.installable,
		registry: item.sourceRegistry,
		registryName: item.sourceRegistryName
	};
}
/** 把一个被拒收的条目投影成出参形状。 */
function projectRejected(entry) {
	return {
		hint: entry.hint,
		path: entry.path,
		reason: entry.reason
	};
}
/** 一个盘上技能的投影，带上是否被遮蔽。 */
function projectLocal(skill, shadowed) {
	return {
		name: skill.name,
		description: skill.description,
		...skill.whenToUse === void 0 ? {} : { whenToUse: skill.whenToUse },
		source: "user-dsh",
		modelInvocable: skill.modelInvocable,
		userInvocable: skill.userInvocable,
		managed: true,
		shadowed,
		path: skill.path,
		...skill.files.length === 0 ? {} : { files: [...skill.files] }
	};
}
/** 一个 `ctx.skills` 赢家的投影。 */
function projectWinner(summary, managed) {
	const base = summary.resourceBase;
	const path = base !== void 0 && base.kind === "directory" ? base.path : void 0;
	return {
		name: summary.name,
		description: summary.description,
		...summary.whenToUse === void 0 ? {} : { whenToUse: summary.whenToUse },
		source: summary.source,
		provider: summary.provider,
		modelInvocable: summary.invocation.modelInvocable,
		userInvocable: summary.invocation.userInvocable,
		managed,
		shadowed: false,
		...path === void 0 ? {} : { path }
	};
}
/**
* 赢家是不是就是我们盘上那一份。
*
* 两种形状都要认：目录形技能的 `resourceBase` 是 `<root>/<name>`，而扁平形
* （`<name>.md`）的是 `<root>` 本身——DSH 对扁平文件给的就是技能根。只比对
* 前者的话，手写的扁平技能会被判成「不受本插件管」，界面上变成只读，
* 删都删不掉。
*/
function winnerIsLocal(summary, root) {
	const base = summary.resourceBase;
	if (base === void 0 || base.kind !== "directory") return false;
	const dir = resolve(base.path);
	return dir === resolve(skillDir(root, summary.name)) || dir === resolve(root);
}
/**
* 合并「实际生效的技能」与「本插件管的技能」。
*
* 见本模块开头：两份清单不是同一件事，同名时盘上那份可能存在却不生效。
* @param ctx - cordis 上下文，用来取 `ctx.skills`。
* @param root - 用户级技能目录。
* @param signal - 取消信号。
* @returns 按名字排序的技能清单。
*/
async function collectSkills(ctx, root, signal) {
	const local = await listLocalSkills(root);
	const registry = ctx.get("skills");
	if (registry === void 0) return local.map((skill) => projectLocal(skill, false));
	const winners = await registry.list({ ...signal === void 0 ? {} : { signal } });
	const byName = new Map(winners.map((summary) => [summary.name, summary]));
	const views = [];
	for (const summary of winners) views.push(projectWinner(summary, winnerIsLocal(summary, root)));
	for (const skill of local) {
		const winner = byName.get(skill.name);
		if (winner !== void 0 && winnerIsLocal(winner, root)) continue;
		views.push(projectLocal(skill, winner !== void 0));
	}
	return views.sort((left, right) => left.name.localeCompare(right.name));
}
//#endregion
//#region .tsbuild/skill/tool.js
/** 工具支持的动作。 */
const ACTIONS$3 = [
	"list",
	"get",
	"create",
	"set_visibility",
	"import",
	"delete",
	"market_search",
	"market_get",
	"market_install",
	"market_update",
	"check_updates"
];
/**
* 技能工具的默认超时预算。
*
* 比纯本地写盘的工具宽得多：`import` 和 `market_install` 要下载并解包一个
* 技能包，几十秒是正常的，按写文件的尺度掐会把正常安装掐成失败。
*/
const DEFAULT_SKILL_TOOL_TIMEOUT_MS = 12e4;
/** 放宽一个技能投影。 */
function skillRow(view) {
	const { files, ...rest } = view;
	return {
		...rest,
		...files === void 0 ? {} : { files: [...files] }
	};
}
/** 放宽一个市场条目投影。 */
function marketRow(view) {
	return {
		...view,
		tags: [...view.tags]
	};
}
/** 校验动作名。 */
function parseSkillAction(raw) {
	const action = ACTIONS$3.find((candidate) => candidate === raw);
	if (action === void 0) throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS$3.join("、")}`, "WORKBENCH_BAD_ACTION");
	return action;
}
function requireArg$3(value, field, action) {
	const trimmed = value?.trim();
	if (trimmed === void 0 || trimmed === "") throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, "WORKBENCH_MISSING_ARG");
	return trimmed;
}
/** 渲染成给模型看的文本。 */
function formatSkillOutput(value) {
	const lines = [value.message];
	if (value.skills.length > 0) {
		lines.push("");
		for (const skill of value.skills) {
			const flags = [skill.source];
			if (skill.shadowed) flags.push("已被同名技能遮蔽，当前不生效");
			if (!skill.modelInvocable) flags.push("模型不可调用");
			if (!skill.userInvocable) flags.push("用户不可调用");
			lines.push(`- ${skill.name}（${flags.join("，")}）：${skill.description}`);
			if (skill.whenToUse !== void 0 && skill.whenToUse !== "") lines.push(`  何时用：${skill.whenToUse}`);
		}
	}
	if (value.market.length > 0) {
		lines.push("");
		for (const item of value.market) {
			const meta = [item.registryName, item.version === void 0 ? "" : `v${item.version}`].filter((part) => part !== "").join("，");
			lines.push(`- ${item.slug}（${meta}）：${item.description ?? item.name}`);
		}
	}
	if (value.fromCache === true) {
		lines.push("");
		lines.push("注意：本次结果来自离线缓存，registry 当前不可达。");
	}
	if (value.content !== void 0 && value.content !== "") {
		lines.push("");
		lines.push(value.content);
	}
	return lines.join("\n");
}
/** 一个技能在出参 schema 里的形状。 */
const SKILL_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		name: {
			type: "string",
			required: true
		},
		description: {
			type: "string",
			required: true
		},
		whenToUse: { type: "string" },
		source: {
			type: "string",
			required: true
		},
		provider: { type: "string" },
		modelInvocable: {
			type: "boolean",
			required: true
		},
		userInvocable: {
			type: "boolean",
			required: true
		},
		managed: {
			type: "boolean",
			required: true
		},
		shadowed: {
			type: "boolean",
			required: true
		},
		path: { type: "string" },
		files: {
			type: "array",
			items: { type: "string" }
		}
	}
};
/** 一个市场条目在出参 schema 里的形状。 */
const MARKET_SCHEMA$1 = {
	type: "object",
	additionalProperties: false,
	properties: {
		slug: {
			type: "string",
			required: true
		},
		name: {
			type: "string",
			required: true
		},
		description: { type: "string" },
		version: { type: "string" },
		tags: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		category: { type: "string" },
		installCount: {
			type: "number",
			required: true
		},
		avgRating: {
			type: "number",
			required: true
		},
		registry: {
			type: "string",
			required: true
		},
		registryName: {
			type: "string",
			required: true
		}
	}
};
/**
* 装一个技能包并汇报结果。
*
* 两步：先在包里定位技能（包根不一定就是技能根，也可能一个包里好几个），
* 再落盘。落完回读一次 `ctx.skills` 确认它到底生没生效——写成功不等于生效，
* 同名遮蔽和 frontmatter 被拒收都只有回读才看得见。
*/
async function install(ctx, location, files, overwrite, origin, prefer, ledger) {
	const result = await installSkillFiles(location, selectSkillFromPackage(files, prefer).files, { overwrite });
	if (ledger !== void 0) await recordInstall(ledger.workbenchDir, {
		...ledger.entry,
		name: result.installedAs,
		installedAt: Date.now()
	});
	const resources = result.fileCount - 1;
	const activation = ctx.get("workbenchSkillActivation");
	activation?.notifyChanged();
	const state = await activation?.verify(result.installedAs, location.root);
	return {
		action: "import",
		message: [
			`已${result.replaced ? "覆盖安装" : "安装"}技能 "${result.installedAs}"（来自 ${origin}）`,
			resources > 0 ? `，含 ${String(resources)} 个资源文件` : "",
			result.binaryCount > 0 ? `（${String(result.binaryCount)} 个二进制）` : "",
			`。${state?.summary ?? ""}`
		].join(""),
		skills: [skillRow(projectLocal(result.skill, false))],
		market: []
	};
}
/**
* 注册 `workbench_skill` 工具及其使用指引。
*/
function applySkillTool(ctx, timeoutMs, networkTimeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:workbench_skill",
		order: 122,
		text: [
			"workbench_skill 管理本机的技能：本地技能落在 $DSH_HOME/skills/<name>/SKILL.md，",
			"市场动作对接已配置的 ClawHub 兼容 registry。",
			"list 结果里 shadowed 为 true 表示盘上有这份技能、但被同名的更高优先级来源盖住了，",
			"此时改它不会有效果，要先向用户说明。写完的技能下一个回合就生效，不需要重启，每次写操作的返回里都带一句它到底生没生效的结论，照它说的答复用户。ClawHub 上不同发布者可以用同一个 slug，安装时把 market_search 结果里的 owner 一并带上，否则会因为歧义失败。新建技能时 description 必须写清「什么情况下该用它」，",
			"那是模型选用技能的唯一依据。delete 不可逆，必须先说明再带 confirm: true 调用。"
		].join("")
	});
	ctx.tools.register(defineTool({
		name: "workbench_skill",
		description: [
			"Manage agent skills on this machine. ",
			"Local actions: list (every effective skill plus locally managed ones), get (one skill with its body), ",
			"create, set_visibility, import (from a local archive path, a download/GitHub URL, or a marketplace slug), ",
			"delete (needs confirm). ",
			"Marketplace actions: market_search, market_get, market_install, market_update (reinstall from the source it came from), check_updates. ",
			"Local skills are written to $DSH_HOME/skills/<name>/SKILL.md and take effect on the next model turn — no restart. ",
			"Every write reports back whether the skill actually became effective, since a same-name higher-priority source can shadow it."
		].join(""),
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS$3,
				description: "Which operation to perform."
			},
			name: {
				type: "string",
				description: "Skill name in kebab-case (lowercase letters, digits and single hyphens). Required for get/create/set_visibility/delete."
			},
			description: {
				type: "string",
				description: "create only: one line telling the model when this skill should be used. This is the only routing signal, so make it concrete."
			},
			whenToUse: {
				type: "string",
				description: "create only: extra routing guidance beyond description."
			},
			content: {
				type: "string",
				description: "create only: the markdown instruction body of the skill."
			},
			modelInvocable: {
				type: "boolean",
				description: "Whether the model may invoke this skill on its own. Defaults to true. Used by create and set_visibility."
			},
			userInvocable: {
				type: "boolean",
				description: "Whether the user may invoke this skill with a slash command. Defaults to true. Used by create and set_visibility."
			},
			from: {
				type: "string",
				description: "import only: a local .zip/.tar.gz path, an http(s) download URL, a GitHub repository URL, or a marketplace slug."
			},
			slug: {
				type: "string",
				description: "market_get / market_install only: the marketplace slug."
			},
			version: {
				type: "string",
				description: "Marketplace version to resolve. Defaults to the latest published version."
			},
			registry: {
				type: "string",
				description: "Restrict a marketplace action to one configured registry id. Defaults to searching all of them."
			},
			owner: {
				type: "string",
				description: "Publisher handle for a marketplace entry. ClawHub lets different publishers share a slug, so an install without it can fail as ambiguous; take the owner field from the market_search result."
			},
			keyword: {
				type: "string",
				description: "market_search only: search keyword. Omit to browse the newest entries instead."
			},
			page: {
				type: "integer",
				description: "market_search only: 1-based page number. Defaults to 1."
			},
			pageSize: {
				type: "integer",
				description: "market_search only: entries per page, 1-100. Defaults to 20."
			},
			sort: {
				type: "string",
				description: "market_search only: registry sort key used when browsing without a keyword."
			},
			overwrite: {
				type: "boolean",
				description: "import / market_install only: replace an existing skill of the same name instead of failing."
			},
			confirm: {
				type: "boolean",
				description: "Required to be true for delete, which is irreversible. Ask the user first."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: {
						type: "string",
						required: true
					},
					message: {
						type: "string",
						required: true
					},
					skills: {
						type: "array",
						required: true,
						items: SKILL_SCHEMA
					},
					market: {
						type: "array",
						required: true,
						items: MARKET_SCHEMA$1
					},
					content: { type: "string" },
					fromCache: { type: "boolean" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: formatSkillOutput(value)
			}]
		},
		timeoutMs,
		isConcurrencySafe: (args) => {
			const action = parseSkillAction(args.action);
			return action === "list" || action === "get" || action === "market_search" || action === "market_get" || action === "check_updates";
		},
		async execute(args, exec) {
			const runtime = ctx.workbench;
			const root = runtime.paths.skills;
			const location = {
				root,
				stagingParent: runtime.paths.skillStaging
			};
			const action = parseSkillAction(args.action);
			const signal = exec.signal;
			const activation = ctx.get("workbenchSkillActivation");
			/** 写完之后让 DSH 重新发现，并回读确认生效结论。 */
			const settle = async (name) => {
				activation?.notifyChanged();
				const state = await activation?.verify(name, root);
				return state === void 0 ? "" : `。${state.summary}`;
			};
			if (action === "list") {
				const skills = (await collectSkills(ctx, root, signal)).map(skillRow);
				const managed = skills.filter((skill) => skill.managed).length;
				const { rejected } = await scanLocalSkills(root);
				return {
					action,
					message: [skills.length === 0 ? "当前没有任何技能" : `共 ${String(skills.length)} 个技能，其中 ${String(managed)} 个由本工具管理`, rejected.length === 0 ? "" : `；另有 ${String(rejected.length)} 个文件被 DSH 拒收，不会生效：` + rejected.map((entry) => `${entry.hint}（${entry.reason}）`).join("、")].join(""),
					skills,
					market: []
				};
			}
			if (action === "get") {
				const name = requireArg$3(args.name, "name", action);
				const definition = await ctx.get("skills")?.get(name, { ...signal === void 0 ? {} : { signal } });
				const local = await readLocalSkill(root, name);
				if (definition !== void 0) {
					const isLocal = winnerIsLocal(definition, root);
					return {
						action,
						message: isLocal || local === void 0 ? `技能 "${name}"` : `技能 "${name}"（当前生效的是 ${definition.source} 的版本，本地那份被遮蔽）`,
						skills: [skillRow(projectWinner(definition, isLocal))],
						market: [],
						content: definition.content
					};
				}
				if (local === void 0) throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
				const state = await activation?.verify(name, root);
				return {
					action,
					message: `技能 "${name}"${state === void 0 ? "" : `（${state.summary}）`}`,
					skills: [skillRow(projectLocal(local, false))],
					market: [],
					content: local.content
				};
			}
			if (action === "create") {
				const name = requireArg$3(args.name, "name", action);
				const skill = await createLocalSkill(root, {
					name,
					description: requireArg$3(args.description, "description", action),
					...args.whenToUse === void 0 ? {} : { whenToUse: args.whenToUse },
					...args.content === void 0 ? {} : { content: args.content },
					...args.modelInvocable === void 0 ? {} : { modelInvocable: args.modelInvocable },
					...args.userInvocable === void 0 ? {} : { userInvocable: args.userInvocable }
				});
				return {
					action,
					message: `已创建技能 "${name}"${await settle(name)}`,
					skills: [skillRow(projectLocal(skill, false))],
					market: []
				};
			}
			if (action === "set_visibility") {
				const name = requireArg$3(args.name, "name", action);
				if (args.modelInvocable === void 0 && args.userInvocable === void 0) throw new WorkbenchError("动作 \"set_visibility\" 必须至少给 modelInvocable 或 userInvocable 其中一个", "WORKBENCH_MISSING_ARG");
				const skill = await setSkillVisibility(root, name, {
					...args.modelInvocable === void 0 ? {} : { modelInvocable: args.modelInvocable },
					...args.userInvocable === void 0 ? {} : { userInvocable: args.userInvocable }
				});
				return {
					action,
					message: `已更新技能 "${name}" 的可见性${await settle(name)}`,
					skills: [skillRow(projectLocal(skill, false))],
					market: []
				};
			}
			if (action === "delete") {
				const name = requireArg$3(args.name, "name", action);
				requireConfirm(args.confirm, `删除技能 "${name}"`);
				const removed = await removeLocalSkill(root, name);
				await forgetInstall(runtime.paths.workbench, name);
				activation?.notifyChanged();
				return {
					action,
					message: `已删除技能 "${name}"`,
					skills: [skillRow(projectLocal(removed, false))],
					market: []
				};
			}
			if (action === "market_search") {
				const page = await runtime.registry.search({
					...args.keyword === void 0 ? {} : { keyword: args.keyword },
					...args.page === void 0 ? {} : { page: args.page },
					...args.pageSize === void 0 ? {} : { pageSize: args.pageSize },
					...args.sort === void 0 ? {} : { sort: args.sort }
				}, signal);
				return {
					action,
					message: page.items.length === 0 ? "市场里没有匹配的技能" : `市场共找到 ${String(page.items.length)} 个技能`,
					skills: [],
					market: page.items.map((item) => marketRow(projectMarket(item))),
					fromCache: page.fromCache
				};
			}
			if (action === "market_get") {
				const slug = requireArg$3(args.slug ?? args.name, "slug", action);
				const item = await runtime.registry.get(slug, args.registry, signal);
				if (item === void 0) throw new WorkbenchError(`市场里没有 "${slug}"`, "WORKBENCH_MARKET_NOT_FOUND");
				return {
					action,
					message: `市场技能 "${slug}"`,
					skills: [],
					market: [marketRow(projectMarket(item))]
				};
			}
			if (action === "check_updates") {
				const ledger = await readLedger(runtime.paths.workbench);
				const present = new Set((await scanLocalSkills(root)).skills.map((skill) => skill.name));
				const rows = [];
				let outdated = 0;
				for (const entry of ledger.values()) {
					if (!present.has(entry.name)) continue;
					const source = runtime.registry.listSources().find((candidate) => candidate.id === entry.registry);
					if (source === void 0) {
						rows.push(`${entry.name}：装它的源 "${entry.registry}" 现在没配置，查不了`);
						continue;
					}
					let latest;
					try {
						latest = await runtime.registry.latestVersion(source, entry.slug, signal);
					} catch (error) {
						rows.push(`${entry.name}：查询失败（${String(error)}）`);
						continue;
					}
					if (latest !== void 0 && isNewerVersion(latest, entry.version)) {
						outdated += 1;
						rows.push(`${entry.name}：${entry.version} → ${latest}（market_update 可更新）`);
					}
				}
				return {
					action,
					message: rows.length === 0 ? "没有从市场装过的技能，或它们都已是最新" : `${String(outdated)} 个技能有新版本：${rows.join("；")}`,
					skills: [],
					market: []
				};
			}
			if (action === "market_update") {
				const name = requireArg$3(args.name, "name", action);
				if (await readLocalSkill(root, name) === void 0) throw new WorkbenchError(`技能 "${name}" 不在用户目录里，更新无从谈起；要装请用 market_install`, "WORKBENCH_SKILL_NOT_FOUND");
				const known = (await readLedger(runtime.paths.workbench)).get(name);
				const downloaded = await runtime.registry.download(args.slug ?? known?.slug ?? name, args.version, args.registry ?? known?.registry, signal, args.owner ?? known?.owner);
				return {
					...await install(ctx, location, downloaded.files, true, `${downloaded.source.name} v${downloaded.version}`, name, {
						workbenchDir: runtime.paths.workbench,
						entry: {
							registry: downloaded.source.id,
							slug: args.slug ?? known?.slug ?? name,
							...downloaded.owner === void 0 ? {} : { owner: downloaded.owner },
							version: downloaded.version
						}
					}),
					action
				};
			}
			if (action === "market_install") {
				const slug = requireArg$3(args.slug ?? args.name, "slug", action);
				const downloaded = await runtime.registry.download(slug, args.version, args.registry, signal, args.owner);
				return {
					...await install(ctx, location, downloaded.files, args.overwrite === true, `${downloaded.source.name} v${downloaded.version}`, args.name, {
						workbenchDir: runtime.paths.workbench,
						entry: {
							registry: downloaded.source.id,
							slug,
							...downloaded.owner === void 0 ? {} : { owner: downloaded.owner },
							version: downloaded.version
						}
					}),
					action
				};
			}
			const origin = classifyImportSource(requireArg$3(args.from, "from", action), args.version);
			if (origin.kind === "registry") {
				const downloaded = await runtime.registry.download(origin.slug, origin.version, args.registry, signal, args.owner);
				return install(ctx, location, downloaded.files, args.overwrite === true, `${downloaded.source.name} v${downloaded.version}`, args.name, {
					workbenchDir: runtime.paths.workbench,
					entry: {
						registry: downloaded.source.id,
						slug: origin.slug,
						...downloaded.owner === void 0 ? {} : { owner: downloaded.owner },
						version: downloaded.version
					}
				});
			}
			if (origin.kind === "url") return install(ctx, location, await fetchPackage(origin.url, origin.label, networkTimeoutMs, signal), args.overwrite === true, origin.label, args.name);
			return install(ctx, location, await readLocalPackage(origin.path), args.overwrite === true, origin.path, args.name);
		},
		presentCall: (args) => {
			const subject = args.name ?? args.slug ?? args.from ?? args.keyword;
			return {
				card: "generic",
				kind: "search",
				title: subject === void 0 ? `技能：${args.action}` : `技能：${args.action} ${subject}`,
				rawInput: args.action
			};
		}
	}));
}
//#endregion
//#region .tsbuild/knowledge/chunk.js
/**
* 文档分块。
*
* 语义沿用知识库约定：`chunkSize` 是**字符**上限、`chunkOverlap`
* 是相邻块的重叠字符数。按字符而不是 token 切是刻意的——单机版没有分词器，
* 而中文按 token 估算的误差比按字符大得多。
*
* 重叠不是冗余：一句话被切在两块中间时，只有靠重叠才能保证至少有一块
* 完整包含它，否则检索永远命中不到跨界的内容。
*
* @module @staff-os/dsh-workbench/knowledge/chunk
*/
/** 默认块大小（字符）。 */
const DEFAULT_CHUNK_SIZE = 1e3;
/** 默认重叠（字符）。 */
const DEFAULT_CHUNK_OVERLAP = 200;
const MAX_CHUNK_SIZE = 8e3;
/** 归一分块参数，越界的值夹回合法区间。 */
function normalizeChunkOptions(options) {
	const chunkSize = clamp(options?.chunkSize ?? 1e3, 100, MAX_CHUNK_SIZE);
	const maxOverlap = Math.floor(chunkSize / 2);
	return {
		chunkSize,
		chunkOverlap: clamp(options?.chunkOverlap ?? 200, 0, maxOverlap)
	};
}
function clamp(value, low, high) {
	if (!Number.isFinite(value)) return low;
	return Math.min(Math.max(Math.trunc(value), low), high);
}
/**
* 在窗口尾部找一个自然断点。
*
* 优先级从强到弱：空行 > 换行 > 句末标点 > 空白。只在窗口的后 30% 里找，
* 找得太靠前会把块切得远小于 chunkSize，白白增加块数。
*
* @returns 断点位置（该位置**之后**开始下一块）；找不到时返回 `undefined`。
*/
function findBreak(text, from, to) {
	const floor = from + Math.floor((to - from) * .7);
	const window = text.slice(floor, to);
	const blank = window.lastIndexOf("\n\n");
	if (blank >= 0) return floor + blank + 2;
	const line = window.lastIndexOf("\n");
	if (line >= 0) return floor + line + 1;
	const sentence = /[。！？；.!?;](?:["'”’)）\]】》]*)\s*/gu;
	let last;
	for (let match = sentence.exec(window); match !== null; match = sentence.exec(window)) last = floor + match.index + match[0].length;
	if (last !== void 0) return last;
	const space = window.search(/\s\S*$/u);
	if (space >= 0) return floor + space + 1;
}
/**
* 把文本切成带重叠的块。
*
* 空文本给空数组而不是一个空块：一个内容为空的块会污染 BM25 的平均长度。
*/
function chunkText(text, options) {
	const { chunkSize, chunkOverlap } = normalizeChunkOptions(options);
	const body = text.replace(/\r\n/gu, "\n");
	if (body.trim() === "") return [];
	const chunks = [];
	let start = 0;
	while (start < body.length) {
		const hardEnd = Math.min(start + chunkSize, body.length);
		const end = hardEnd >= body.length ? body.length : findBreak(body, start, hardEnd) ?? hardEnd;
		const slice = body.slice(start, end);
		if (slice.trim() !== "") chunks.push({
			index: chunks.length,
			start,
			end,
			text: slice.trim()
		});
		if (end >= body.length) break;
		start = Math.max(end - chunkOverlap, start + 1);
	}
	return chunks;
}
//#endregion
//#region .tsbuild/knowledge/search.js
/**
* 关键词检索：分词 + BM25。
*
* **为什么不是向量检索**：DSH 的 `ctx.llm` 只是对话适配器注册表，没有
* embedding 能力，单机版没地方拿向量。这不是阉割——后端在
* embedding 不可用时本来就回退关键词召回，`search` 返回的 `mode` 字段
* 就是告诉调用方走了哪条路，这里同样返回 `keyword`。
*
* **中文怎么分**：没有分词器可用，所以走 CJK 二元分词（bigram），
* 连续汉字切成逐位滑动的字对。**不出一元**：一元看上去能提高单字
* 查询的召回，实际上是把「的」「在」「不」这类几乎出现在每一块里的字
* 变成了可匹配项，结果是任何带虚词的查询都能把全库召回来——而且它不报错，
* 只是给出一堆不相干的段落。单字自成一段（两边都是非汉字）时才当一个词收。
*
* @module @staff-os/dsh-workbench/knowledge/search
*/
/** BM25 的词频饱和参数。 */
const K1 = 1.2;
/** BM25 的长度归一化强度。 */
const B = .75;
/** CJK 字符（含扩展 A 区、日文假名、韩文），这些不按空白分词。 */
const CJK = /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힯]/u;
/** 拉丁字母、数字与下划线组成的词。 */
const LATIN_WORD = /[A-Za-z0-9_]+/gu;
/**
* 把一段文本切成检索词。
*
* 大小写统一成小写；拉丁词整词入索引；CJK 连续段切成二元字对。
*/
function tokenize(text) {
	const lower = text.toLowerCase();
	const tokens = [];
	LATIN_WORD.lastIndex = 0;
	for (let match = LATIN_WORD.exec(lower); match !== null; match = LATIN_WORD.exec(lower)) tokens.push(match[0]);
	let run = "";
	const flush = () => {
		if (run === "") return;
		if (run.length === 1) tokens.push(run);
		else for (let at = 0; at + 1 < run.length; at += 1) tokens.push(run.slice(at, at + 2));
		run = "";
	};
	for (const char of lower) if (CJK.test(char)) run += char;
	else flush();
	flush();
	return tokens;
}
/** 统计词频。 */
function termFrequencies(text) {
	const counts = {};
	for (const token of tokenize(text)) counts[token] = (counts[token] ?? 0) + 1;
	return counts;
}
/**
* 计算一个词的 IDF。
*
* 用带平滑的 Robertson-Sparck Jones 形式，并整体加 1 再取对数：
* 不加的话，出现在半数以上块里的词会得到负分，一个高频词能把整条查询
* 的得分拉成负的。
*/
function idf(df, count) {
	return Math.log(1 + (count - df + .5) / (df + .5));
}
/**
* 用 BM25 给块打分。
* @returns 得分大于 0 的块，按分数从高到低。
*/
function scoreChunks(query, chunks, stats) {
	const queryTerms = [...new Set(tokenize(query))];
	if (queryTerms.length === 0 || chunks.length === 0) return [];
	const averageLength = stats.averageLength > 0 ? stats.averageLength : 1;
	const scored = [];
	for (const chunk of chunks) {
		let score = 0;
		const matched = [];
		for (const term of queryTerms) {
			const frequency = chunk.terms[term];
			if (frequency === void 0 || frequency === 0) continue;
			const weight = idf(stats.df[term] ?? 0, stats.count);
			const norm = K1 * (.25 + B * (chunk.length / averageLength));
			score += weight * (frequency * 2.2 / (frequency + norm));
			matched.push(term);
		}
		if (score > 0) scored.push({
			id: chunk.id,
			score,
			matched
		});
	}
	return scored.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}
//#endregion
//#region .tsbuild/knowledge/store.js
/**
* 本地知识库的存储层。
*
* 布局：
* ```
* $DSH_HOME/workbench/knowledge/<kb-id>/
* ├── kb.json               名称、描述、分块参数
* ├── documents/<doc-id>.<ext>
* └── index.json            分块正文 + 词频 + 文档频次
* ```
*
* 计数不单独存：文档数与块数都从 `index.json` 现算。存一份计数器意味着
* 它和实际内容有两个真相，而两者不一致时没有任何报错——只是 list 里的
* 数字对不上。
*
* @module @staff-os/dsh-workbench/knowledge/store
*/
/** 知识库 id 与文档 id 的形状。 */
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
/** 单个文档的体积上限。 */
const MAX_DOCUMENT_BYTES = 5242880;
const KB_FILE = "kb.json";
const INDEX_FILE = "index.json";
const DOCUMENTS_DIR = "documents";
const INDEX_VERSION = 1;
/** 校验一个 id。 */
function assertId(id, what) {
	if (!ID_PATTERN.test(id)) throw new WorkbenchError(`${what} "${id}" 不合法：必须是小写字母数字的短横线分隔形式`, "WORKBENCH_KB_BAD_ID");
}
/** 从任意文本压出一个合法 id。 */
function slugify(raw) {
	return raw.toLowerCase().replace(/\.[a-z0-9]+$/u, "").replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
}
function kbDir(root, id) {
	return join(root, id);
}
function emptyIndex() {
	return {
		version: INDEX_VERSION,
		documents: [],
		chunks: [],
		df: {},
		totalLength: 0
	};
}
async function readJson(path) {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch {
		return;
	}
}
async function writeJson(path, value) {
	await writeFileAtomic(path, `${JSON.stringify(value, void 0, 2)}\n`, {
		mode: 384,
		dirMode: 448
	});
}
/** 读一个知识库的元数据；不存在时给 `undefined`。 */
async function readKnowledgeBase(root, id) {
	assertId(id, "知识库 id");
	return readJson(join(kbDir(root, id), KB_FILE));
}
/** 读一个知识库的元数据；不存在就抛。 */
async function requireKnowledgeBase(root, id) {
	const kb = await readKnowledgeBase(root, id);
	if (kb === void 0) throw new WorkbenchError(`知识库 "${id}" 不存在`, "WORKBENCH_KB_NOT_FOUND");
	return kb;
}
/** 列出全部知识库。 */
async function listKnowledgeBases(root) {
	let entries;
	try {
		entries = await readdir(root, { withFileTypes: true });
	} catch {
		return [];
	}
	const bases = [];
	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
		const kb = await readJson(join(root, entry.name, KB_FILE));
		if (kb !== void 0) bases.push(kb);
	}
	return bases.sort((left, right) => left.id.localeCompare(right.id));
}
/** 读一个知识库的索引；没有索引时给空索引。 */
async function readIndex(root, id) {
	const index = await readJson(join(kbDir(root, id), INDEX_FILE));
	if (index === void 0 || index.version !== INDEX_VERSION) return emptyIndex();
	return index;
}
/** 新建一个知识库。 */
async function createKnowledgeBase(root, input) {
	const name = input.name.trim();
	if (name === "") throw new WorkbenchError("知识库必须有名称", "WORKBENCH_KB_NO_NAME");
	const id = input.id?.trim() ?? slugify(name);
	if (id === "") throw new WorkbenchError(`无法从名称 "${name}" 生成 id，请显式指定 id`, "WORKBENCH_KB_BAD_ID");
	assertId(id, "知识库 id");
	if (await readKnowledgeBase(root, id) !== void 0) throw new WorkbenchError(`知识库 "${id}" 已存在`, "WORKBENCH_KB_DUPLICATE");
	const description = input.description?.trim();
	const options = normalizeChunkOptions({
		...input.chunkSize === void 0 ? {} : { chunkSize: input.chunkSize },
		...input.chunkOverlap === void 0 ? {} : { chunkOverlap: input.chunkOverlap }
	});
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const kb = {
		id,
		name,
		...description === void 0 || description === "" ? {} : { description },
		chunkSize: options.chunkSize,
		chunkOverlap: options.chunkOverlap,
		createdAt: now,
		updatedAt: now
	};
	await mkdir(join(kbDir(root, id), DOCUMENTS_DIR), {
		recursive: true,
		mode: 448
	});
	await writeJson(join(kbDir(root, id), KB_FILE), kb);
	await writeJson(join(kbDir(root, id), INDEX_FILE), emptyIndex());
	return kb;
}
/**
* 改知识库设置。
*
* 改了分块参数会**整库重建索引**——旧块是按旧参数切的，混着用会让同一个
* 知识库里的块长短不一，BM25 的长度归一化直接失真。
*/
async function updateKnowledgeBase(root, id, patch) {
	const current = await requireKnowledgeBase(root, id);
	const options = normalizeChunkOptions({
		chunkSize: patch.chunkSize ?? current.chunkSize,
		chunkOverlap: patch.chunkOverlap ?? current.chunkOverlap
	});
	const name = patch.name?.trim();
	const next = {
		id: current.id,
		name: name === void 0 || name === "" ? current.name : name,
		...resolveDescription(current.description, patch.description),
		chunkSize: options.chunkSize,
		chunkOverlap: options.chunkOverlap,
		createdAt: current.createdAt,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	await writeJson(join(kbDir(root, id), KB_FILE), next);
	const reindexed = options.chunkSize !== current.chunkSize || options.chunkOverlap !== current.chunkOverlap;
	if (reindexed) await rebuildIndex(root, next);
	return {
		kb: next,
		reindexed
	};
}
/**
* 决定改完之后的描述。
*
* 显式传空串是「清空」而不是「不改」：否则一段写错的描述就再也删不掉了。
*/
function resolveDescription(current, patch) {
	if (patch === void 0) return current === void 0 ? {} : { description: current };
	const trimmed = patch.trim();
	return trimmed === "" ? {} : { description: trimmed };
}
/** 删掉一个知识库及其全部文档。 */
async function removeKnowledgeBase(root, id) {
	const kb = await requireKnowledgeBase(root, id);
	await rm(kbDir(root, id), {
		recursive: true,
		force: true
	});
	return kb;
}
/** 把一组块累加进语料统计。 */
function accumulate(chunks) {
	const df = {};
	let totalLength = 0;
	for (const chunk of chunks) {
		totalLength += chunk.length;
		for (const term of Object.keys(chunk.terms)) df[term] = (df[term] ?? 0) + 1;
	}
	return {
		df,
		totalLength
	};
}
/** 把一个文档切块并算好词频。 */
function indexDocument(documentId, content, options) {
	return chunkText(content, options).map((chunk) => ({
		id: `${documentId}#${String(chunk.index)}`,
		documentId,
		index: chunk.index,
		text: chunk.text,
		length: tokenize(chunk.text).length,
		terms: termFrequencies(chunk.text)
	}));
}
/** 文档在盘上的路径。 */
function documentPath(root, kbId, document) {
	return join(kbDir(root, kbId), DOCUMENTS_DIR, storedName(document));
}
/** 文档在盘上的文件名：id 加上原扩展名，避免不同文档撞名。 */
function storedName(document) {
	const dot = document.filename.lastIndexOf(".");
	const extension = dot > 0 ? document.filename.slice(dot) : ".txt";
	return `${document.id}${extension}`;
}
/**
* 从盘上的文档重建整个索引。
*
* 用在改了分块参数、或索引与文档目录对不上的时候。读不出来的文档会被
* 剔出清单而不是让整次重建失败——重建的目的就是让索引回到与盘一致。
*/
async function rebuildIndex(root, kb) {
	const indexPath = join(kbDir(root, kb.id), INDEX_FILE);
	await mkdir(join(kbDir(root, kb.id), DOCUMENTS_DIR), {
		recursive: true,
		mode: 448
	});
	return withFileLock(indexPath, async () => {
		const current = await readIndex(root, kb.id);
		const options = normalizeChunkOptions(kb);
		const documents = [];
		const chunks = [];
		for (const document of current.documents) {
			let content;
			try {
				content = await readFile(documentPath(root, kb.id, document), "utf8");
			} catch {
				continue;
			}
			const documentChunks = indexDocument(document.id, content, options);
			chunks.push(...documentChunks);
			documents.push({
				...document,
				chunkCount: documentChunks.length
			});
		}
		const next = {
			version: INDEX_VERSION,
			documents,
			chunks,
			...accumulate(chunks)
		};
		await writeJson(indexPath, next);
		return next;
	});
}
/** 在已有文档 id 里挑一个不冲突的。 */
function uniqueDocumentId(base, taken) {
	const seed = base === "" ? "document" : base;
	if (!taken.has(seed)) return seed;
	for (let suffix = 2; suffix < 1e4; suffix += 1) {
		const candidate = `${seed}-${String(suffix)}`;
		if (!taken.has(candidate)) return candidate;
	}
	throw new WorkbenchError(`无法为 "${base}" 生成不冲突的文档 id`, "WORKBENCH_KB_ID_EXHAUSTED");
}
/**
* 往知识库里加一个文档。
*
* 只收文本：二进制在这里明确报错而不是存进去再检索不到。PDF / Office
* 需要额外的解析依赖，本插件不预先引入。
*/
async function addDocument(root, kbId, input) {
	const kb = await requireKnowledgeBase(root, kbId);
	const filename = input.filename.trim();
	if (filename === "" || /[\\/]/u.test(filename) || filename.includes("\0")) throw new WorkbenchError(`文件名 "${input.filename}" 不合法：必须是不含路径分隔符的裸文件名`, "WORKBENCH_KB_BAD_FILENAME");
	if (input.content.includes("\0")) throw new WorkbenchError(`"${filename}" 看起来是二进制文件；知识库只收文本（PDF、Office 等请先转成 Markdown 或纯文本）`, "WORKBENCH_KB_BINARY");
	const bytes = Buffer.byteLength(input.content, "utf8");
	if (bytes > 5242880) throw new WorkbenchError(`"${filename}" 有 ${String(bytes)} 字节，超过单文档上限 ${String(MAX_DOCUMENT_BYTES)}`, "WORKBENCH_KB_TOO_LARGE");
	if (input.content.trim() === "") throw new WorkbenchError(`"${filename}" 是空文档，没有可索引的内容`, "WORKBENCH_KB_EMPTY_DOCUMENT");
	const indexPath = join(kbDir(root, kbId), INDEX_FILE);
	await mkdir(join(kbDir(root, kbId), DOCUMENTS_DIR), {
		recursive: true,
		mode: 448
	});
	return withFileLock(indexPath, async () => {
		const current = await readIndex(root, kbId);
		const taken = new Set(current.documents.map((document) => document.id));
		const documentId = uniqueDocumentId(slugify(filename), taken);
		const title = input.title?.trim();
		const document = {
			id: documentId,
			filename,
			...title === void 0 || title === "" ? {} : { title },
			bytes,
			chunkCount: 0,
			addedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		await writeFile(documentPath(root, kbId, document), input.content, {
			encoding: "utf8",
			mode: 384
		});
		const chunks = indexDocument(documentId, input.content, normalizeChunkOptions(kb));
		const stored = {
			...document,
			chunkCount: chunks.length
		};
		const allChunks = [...current.chunks, ...chunks];
		const next = {
			version: INDEX_VERSION,
			documents: [...current.documents, stored],
			chunks: allChunks,
			...accumulate(allChunks)
		};
		await writeJson(indexPath, next);
		return {
			document: stored,
			chunkCount: chunks.length
		};
	});
}
/** 列出一个知识库里的文档。 */
async function listDocuments(root, kbId) {
	await requireKnowledgeBase(root, kbId);
	return [...(await readIndex(root, kbId)).documents];
}
/** 从知识库里删掉一个文档。 */
async function removeDocument(root, kbId, documentId) {
	await requireKnowledgeBase(root, kbId);
	const indexPath = join(kbDir(root, kbId), INDEX_FILE);
	return withFileLock(indexPath, async () => {
		const current = await readIndex(root, kbId);
		const document = current.documents.find((candidate) => candidate.id === documentId);
		if (document === void 0) throw new WorkbenchError(`知识库 "${kbId}" 里没有文档 "${documentId}"`, "WORKBENCH_KB_DOCUMENT_NOT_FOUND");
		await rm(documentPath(root, kbId, document), { force: true });
		const chunks = current.chunks.filter((chunk) => chunk.documentId !== documentId);
		const next = {
			version: INDEX_VERSION,
			documents: current.documents.filter((candidate) => candidate.id !== documentId),
			chunks,
			...accumulate(chunks)
		};
		await writeJson(indexPath, next);
		return document;
	});
}
/** 读一个本地文件当作文档内容。 */
async function readDocumentFile(path) {
	let info;
	try {
		info = await stat(path);
	} catch (error) {
		throw new WorkbenchError(`读不到文件 ${path}`, "WORKBENCH_KB_FILE_UNREADABLE", { cause: error });
	}
	if (!info.isFile()) throw new WorkbenchError(`${path} 不是一个文件`, "WORKBENCH_KB_FILE_UNREADABLE");
	if (info.size > 5242880) throw new WorkbenchError(`${path} 有 ${String(info.size)} 字节，超过单文档上限 ${String(MAX_DOCUMENT_BYTES)}`, "WORKBENCH_KB_TOO_LARGE");
	const raw = await readFile(path);
	if (raw.includes(0)) throw new WorkbenchError(`${path} 看起来是二进制文件；知识库只收文本（PDF、Office 等请先转成 Markdown 或纯文本）`, "WORKBENCH_KB_BINARY");
	return {
		filename: path.split(/[\\/]/u).filter((segment) => segment !== "").pop() ?? "document.txt",
		content: raw.toString("utf8")
	};
}
/**
* 在若干知识库里做关键词检索。
*
* 每个知识库各算各的 IDF：把几个库的语料统计混在一起，会让大库的词频
* 淹掉小库的，跨库结果就没法比了。
*/
async function searchKnowledge(root, kbIds, query, topK) {
	const hits = [];
	for (const kbId of kbIds) {
		const kb = await readKnowledgeBase(root, kbId);
		if (kb === void 0) continue;
		const index = await readIndex(root, kbId);
		if (index.chunks.length === 0) continue;
		const stats = {
			df: index.df,
			count: index.chunks.length,
			averageLength: index.totalLength / index.chunks.length
		};
		const byId = new Map(index.chunks.map((chunk) => [chunk.id, chunk]));
		const titles = new Map(index.documents.map((document) => [document.id, document.title ?? document.filename]));
		for (const scored of scoreChunks(query, index.chunks, stats).slice(0, topK)) {
			const chunk = byId.get(scored.id);
			if (chunk === void 0) continue;
			hits.push({
				knowledgeBaseId: kb.id,
				knowledgeBaseName: kb.name,
				documentId: chunk.documentId,
				documentTitle: titles.get(chunk.documentId) ?? chunk.documentId,
				chunkIndex: chunk.index,
				score: scored.score,
				text: chunk.text,
				matched: scored.matched
			});
		}
	}
	hits.sort((left, right) => right.score - left.score);
	return {
		hits: hits.slice(0, topK),
		mode: "keyword"
	};
}
//#endregion
//#region .tsbuild/knowledge/tool.js
/**
* 面向模型的 `workbench_knowledge` 工具：本地知识库与关键词检索。
* @module @staff-os/dsh-workbench/knowledge/tool
*/
/** 知识库工具的默认超时预算：重建索引要读完整库的文档。 */
const DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS = 6e4;
/** 默认返回几条检索结果。 */
const DEFAULT_TOP_K = 5;
/** 检索结果条数上限。 */
const MAX_TOP_K = 20;
/** 工具支持的动作。 */
const ACTIONS$2 = [
	"list",
	"create",
	"get",
	"update",
	"delete",
	"add_document",
	"list_documents",
	"delete_document",
	"search"
];
/** 校验动作名。 */
function parseKnowledgeAction(raw) {
	const action = ACTIONS$2.find((candidate) => candidate === raw);
	if (action === void 0) throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS$2.join("、")}`, "WORKBENCH_BAD_ACTION");
	return action;
}
function requireArg$2(value, field, action) {
	const trimmed = value?.trim();
	if (trimmed === void 0 || trimmed === "") throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, "WORKBENCH_MISSING_ARG");
	return trimmed;
}
function projectDocument(document) {
	return {
		id: document.id,
		filename: document.filename,
		...document.title === void 0 ? {} : { title: document.title },
		bytes: document.bytes,
		chunkCount: document.chunkCount,
		addedAt: document.addedAt
	};
}
function projectHit(hit) {
	return {
		knowledgeBaseId: hit.knowledgeBaseId,
		knowledgeBaseName: hit.knowledgeBaseName,
		documentId: hit.documentId,
		documentTitle: hit.documentTitle,
		chunkIndex: hit.chunkIndex,
		score: Math.round(hit.score * 100) / 100,
		text: hit.text,
		matched: [...hit.matched]
	};
}
/** 投影一个知识库，计数从索引现算。 */
async function projectBase(root, kb) {
	const index = await readIndex(root, kb.id);
	return {
		id: kb.id,
		name: kb.name,
		...kb.description === void 0 ? {} : { description: kb.description },
		chunkSize: kb.chunkSize,
		chunkOverlap: kb.chunkOverlap,
		documentCount: index.documents.length,
		chunkCount: index.chunks.length,
		updatedAt: kb.updatedAt
	};
}
/** 渲染成给模型看的文本。 */
function formatKnowledgeOutput(value) {
	const lines = [value.message];
	if (value.knowledgeBases.length > 0) {
		lines.push("");
		for (const kb of value.knowledgeBases) lines.push(`- ${kb.id}（${kb.name}）：${String(kb.documentCount)} 个文档，${String(kb.chunkCount)} 个分块${kb.description === void 0 ? "" : `；${kb.description}`}`);
	}
	if (value.documents.length > 0) {
		lines.push("");
		for (const document of value.documents) lines.push(`- ${document.id}：${document.title ?? document.filename}（${String(document.bytes)} 字节，${String(document.chunkCount)} 个分块）`);
	}
	if (value.hits.length > 0) {
		lines.push("");
		for (const hit of value.hits) {
			lines.push(`【${hit.knowledgeBaseName} / ${hit.documentTitle} #${String(hit.chunkIndex)}】得分 ${String(hit.score)}`);
			lines.push(hit.text);
			lines.push("");
		}
		lines.push("以上为关键词检索（BM25）结果，不是语义检索；如果没找到想要的内容，换几个关键词再试。");
	}
	return lines.join("\n");
}
const KB_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		id: {
			type: "string",
			required: true
		},
		name: {
			type: "string",
			required: true
		},
		description: { type: "string" },
		chunkSize: {
			type: "number",
			required: true
		},
		chunkOverlap: {
			type: "number",
			required: true
		},
		documentCount: {
			type: "number",
			required: true
		},
		chunkCount: {
			type: "number",
			required: true
		},
		updatedAt: {
			type: "string",
			required: true
		}
	}
};
const DOCUMENT_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		id: {
			type: "string",
			required: true
		},
		filename: {
			type: "string",
			required: true
		},
		title: { type: "string" },
		bytes: {
			type: "number",
			required: true
		},
		chunkCount: {
			type: "number",
			required: true
		},
		addedAt: {
			type: "string",
			required: true
		}
	}
};
const HIT_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		knowledgeBaseId: {
			type: "string",
			required: true
		},
		knowledgeBaseName: {
			type: "string",
			required: true
		},
		documentId: {
			type: "string",
			required: true
		},
		documentTitle: {
			type: "string",
			required: true
		},
		chunkIndex: {
			type: "number",
			required: true
		},
		score: {
			type: "number",
			required: true
		},
		text: {
			type: "string",
			required: true
		},
		matched: {
			type: "array",
			required: true,
			items: { type: "string" }
		}
	}
};
/**
* 注册 `workbench_knowledge` 工具及其使用指引。
*/
function applyKnowledgeTool(ctx, timeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:workbench_knowledge",
		order: 123,
		text: [
			"workbench_knowledge 管理本机的知识库，内容存在 $DSH_HOME/workbench/knowledge 下。",
			"检索走的是关键词（BM25）而不是语义向量：查询词要贴近原文用词，同义换词召不回来，",
			"一次查不到就换几个说法再试，不要断言知识库里没有。",
			"add_document 只收文本，PDF 与 Office 要先转成 Markdown 或纯文本。",
			"delete 与 delete_document 不可逆，必须先向用户说明再带 confirm: true 调用。"
		].join("")
	});
	ctx.tools.register(defineTool({
		name: "workbench_knowledge",
		description: [
			"Manage local knowledge bases and search them by keyword. ",
			"Actions: list, create, get, update, delete (needs confirm), ",
			"add_document, list_documents, delete_document (needs confirm), search. ",
			"Retrieval is BM25 keyword matching over text chunks, not semantic vector search, ",
			"so queries should use wording close to the source documents. ",
			"Everything is stored as local files under $DSH_HOME/workbench/knowledge."
		].join(""),
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS$2,
				description: "Which operation to perform."
			},
			id: {
				type: "string",
				description: "Knowledge base id in kebab-case. Required for get/update/delete/add_document/list_documents/delete_document. On search, omit to search every knowledge base."
			},
			name: {
				type: "string",
				description: "create/update: human readable name. On create the id is derived from it unless id is given."
			},
			description: {
				type: "string",
				description: "create/update: what this knowledge base holds. Pass an empty string on update to clear it."
			},
			chunkSize: {
				type: "integer",
				description: "create/update: maximum characters per chunk (100-8000, default 1000). Changing it on update rebuilds the whole index."
			},
			chunkOverlap: {
				type: "integer",
				description: "create/update: characters shared between neighbouring chunks (default 200, capped at half of chunkSize). Changing it on update rebuilds the whole index."
			},
			path: {
				type: "string",
				description: "add_document: absolute path of a local text file to ingest."
			},
			filename: {
				type: "string",
				description: "add_document: file name to record when passing content inline. Must be a bare name without any path separator."
			},
			content: {
				type: "string",
				description: "add_document: the document text, when not reading from path."
			},
			title: {
				type: "string",
				description: "add_document: display title; defaults to the file name."
			},
			documentId: {
				type: "string",
				description: "delete_document: which document to remove, as reported by list_documents."
			},
			query: {
				type: "string",
				description: "search: the keyword query."
			},
			topK: {
				type: "integer",
				description: `search: how many chunks to return, 1-${String(MAX_TOP_K)}. Defaults to ${String(DEFAULT_TOP_K)}.`
			},
			confirm: {
				type: "boolean",
				description: "Required to be true for delete and delete_document, which are irreversible. Ask the user first."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: {
						type: "string",
						required: true
					},
					message: {
						type: "string",
						required: true
					},
					knowledgeBases: {
						type: "array",
						required: true,
						items: KB_SCHEMA
					},
					documents: {
						type: "array",
						required: true,
						items: DOCUMENT_SCHEMA
					},
					hits: {
						type: "array",
						required: true,
						items: HIT_SCHEMA
					},
					mode: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: formatKnowledgeOutput(value)
			}]
		},
		timeoutMs,
		isConcurrencySafe: (args) => {
			const action = parseKnowledgeAction(args.action);
			return action === "list" || action === "get" || action === "list_documents" || action === "search";
		},
		async execute(args) {
			const root = ctx.workbench.paths.knowledge;
			const action = parseKnowledgeAction(args.action);
			const empty = {
				knowledgeBases: [],
				documents: [],
				hits: []
			};
			if (action === "list") {
				const bases = await listKnowledgeBases(root);
				return {
					...empty,
					action,
					message: bases.length === 0 ? "还没有任何知识库" : `共 ${String(bases.length)} 个知识库`,
					knowledgeBases: await Promise.all(bases.map((kb) => projectBase(root, kb)))
				};
			}
			if (action === "create") {
				const kb = await createKnowledgeBase(root, {
					name: requireArg$2(args.name, "name", action),
					...args.id === void 0 ? {} : { id: args.id.trim() },
					...args.description === void 0 ? {} : { description: args.description },
					...args.chunkSize === void 0 ? {} : { chunkSize: args.chunkSize },
					...args.chunkOverlap === void 0 ? {} : { chunkOverlap: args.chunkOverlap }
				});
				return {
					...empty,
					action,
					message: `已创建知识库 "${kb.id}"，分块 ${String(kb.chunkSize)} 字符、重叠 ${String(kb.chunkOverlap)} 字符`,
					knowledgeBases: [await projectBase(root, kb)]
				};
			}
			if (action === "search") {
				const query = requireArg$2(args.query, "query", action);
				const topK = Math.min(Math.max(args.topK ?? DEFAULT_TOP_K, 1), MAX_TOP_K);
				const ids = args.id === void 0 || args.id.trim() === "" ? (await listKnowledgeBases(root)).map((kb) => kb.id) : [args.id.trim()];
				if (ids.length === 0) return {
					...empty,
					action,
					message: "还没有任何知识库，先用 create 建一个",
					mode: "keyword"
				};
				const result = await searchKnowledge(root, ids, query, topK);
				return {
					...empty,
					action,
					message: result.hits.length === 0 ? `在 ${ids.join("、")} 里没有匹配 "${query}" 的内容；关键词检索对同义换词无效，可以换几个更贴近原文的说法再试` : `在 ${ids.join("、")} 里找到 ${String(result.hits.length)} 段相关内容`,
					hits: result.hits.map(projectHit),
					mode: result.mode
				};
			}
			const id = requireArg$2(args.id, "id", action);
			if (action === "get") {
				const kb = await readKnowledgeBase(root, id);
				if (kb === void 0) throw new WorkbenchError(`知识库 "${id}" 不存在`, "WORKBENCH_KB_NOT_FOUND");
				const documents = await listDocuments(root, id);
				return {
					...empty,
					action,
					message: `知识库 "${id}"`,
					knowledgeBases: [await projectBase(root, kb)],
					documents: documents.map(projectDocument)
				};
			}
			if (action === "update") {
				const { kb, reindexed } = await updateKnowledgeBase(root, id, {
					...args.name === void 0 ? {} : { name: args.name },
					...args.description === void 0 ? {} : { description: args.description },
					...args.chunkSize === void 0 ? {} : { chunkSize: args.chunkSize },
					...args.chunkOverlap === void 0 ? {} : { chunkOverlap: args.chunkOverlap }
				});
				return {
					...empty,
					action,
					message: `已更新知识库 "${id}"${reindexed ? "，分块参数变了，已整库重建索引" : ""}`,
					knowledgeBases: [await projectBase(root, kb)]
				};
			}
			if (action === "delete") {
				requireConfirm(args.confirm, `删除知识库 "${id}" 及其全部文档`);
				const kb = await removeKnowledgeBase(root, id);
				return {
					...empty,
					action,
					message: `已删除知识库 "${kb.id}"（${kb.name}）及其全部文档`
				};
			}
			if (action === "list_documents") {
				const documents = await listDocuments(root, id);
				return {
					...empty,
					action,
					message: documents.length === 0 ? `知识库 "${id}" 里还没有文档` : `知识库 "${id}" 里有 ${String(documents.length)} 个文档`,
					documents: documents.map(projectDocument)
				};
			}
			if (action === "delete_document") {
				const documentId = requireArg$2(args.documentId, "documentId", action);
				requireConfirm(args.confirm, `从知识库 "${id}" 删除文档 "${documentId}"`);
				const document = await removeDocument(root, id, documentId);
				return {
					...empty,
					action,
					message: `已从知识库 "${id}" 删除文档 "${document.id}"`,
					documents: [projectDocument(document)]
				};
			}
			if (args.path === void 0 && args.content === void 0) throw new WorkbenchError("动作 \"add_document\" 必须给 path（读本地文件）或 content + filename（直接给内容）", "WORKBENCH_MISSING_ARG");
			const source = args.path !== void 0 && args.path.trim() !== "" ? await readDocumentFile(args.path.trim()) : {
				filename: requireArg$2(args.filename, "filename", action),
				content: args.content ?? ""
			};
			const added = await addDocument(root, id, {
				filename: args.filename?.trim() ?? source.filename,
				content: source.content,
				...args.title === void 0 ? {} : { title: args.title }
			});
			return {
				...empty,
				action,
				message: `已把 "${added.document.filename}" 加进知识库 "${id}"，切成 ${String(added.chunkCount)} 个分块`,
				documents: [projectDocument(added.document)]
			};
		},
		presentCall: (args) => {
			const subject = args.query ?? args.id ?? args.name;
			return {
				card: "generic",
				kind: "search",
				title: subject === void 0 ? `知识库：${args.action}` : `知识库：${args.action} ${subject}`,
				rawInput: args.action
			};
		}
	}));
}
//#endregion
//#region .tsbuild/employee/store.js
/**
* AI 员工 = 一个 agent preset + 一份工作台自己的绑定清单。
*
* preset 那半边由 DSH 原生的 `ctx.agentPresets` 管：它已经把「一个可挂载的
* agent 组合」这件事做完了，包括发现、信任级别、复制与删除。工作台只补上
* 原生没有的一层——这个员工该用哪些知识库、技能与 MCP 服务，写在 preset
* 目录里的 `employee.yml`。
*
* **这个文件是附加的，不是 DSH 读的。** 往里写一个知识库 id 不会让检索自动
* 发生；它是给模型看的职责说明，也是员工↔资源绑定关系的落点。
* 分成两个文件而不是塞进 `preset.yml`，是因为后者的字段集由 DSH 定义，
* 塞私货进去下个版本就可能撞名。
*
* @module @staff-os/dsh-workbench/employee/store
*/
/** 工作台在 preset 目录里附加的绑定文件。 */
const EMPLOYEE_FILE = "employee.yml";
/** 可绑定的资源类别。 */
const BINDING_KINDS = [
	"knowledgeBases",
	"skills",
	"mcpServers"
];
/** 空绑定。 */
function emptyBindings() {
	return {
		knowledgeBases: [],
		skills: [],
		mcpServers: []
	};
}
function stringList(value) {
	if (!Array.isArray(value)) return [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of value) {
		if (typeof item !== "string") continue;
		const trimmed = item.trim();
		if (trimmed !== "") seen.add(trimmed);
	}
	return [...seen].sort((left, right) => left.localeCompare(right));
}
function text(value) {
	if (typeof value !== "string") return void 0;
	const trimmed = value.trim();
	return trimmed === "" ? void 0 : trimmed;
}
/**
* 读一个 preset 目录里的绑定清单。
*
* 读不出来一律当空清单：这个文件是附加的，它坏了不该让员工本身读不出来。
*/
async function readBindings(presetDir) {
	let raw;
	try {
		raw = await readFile(join(presetDir, EMPLOYEE_FILE), "utf8");
	} catch {
		return emptyBindings();
	}
	let data;
	try {
		const parsed = (0, import_dist.parseDocument)(raw).toJS();
		if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return emptyBindings();
		data = parsed;
	} catch {
		return emptyBindings();
	}
	const persona = text(data.persona);
	const updatedAt = text(data.updatedAt);
	return {
		...persona === void 0 ? {} : { persona },
		knowledgeBases: stringList(data.knowledgeBases),
		skills: stringList(data.skills),
		mcpServers: stringList(data.mcpServers),
		...updatedAt === void 0 ? {} : { updatedAt }
	};
}
/** 写回绑定清单；全空时把文件删掉，不留一个只有时间戳的空壳。 */
async function writeBindings(presetDir, bindings) {
	const path = join(presetDir, EMPLOYEE_FILE);
	if (!(bindings.persona !== void 0 || bindings.knowledgeBases.length > 0 || bindings.skills.length > 0 || bindings.mcpServers.length > 0)) {
		await rm(path, { force: true });
		return;
	}
	const lines = ["# 由 @staff-os/dsh-workbench 维护：这个 AI 员工该用哪些工作台资源。", "# DSH 本身不读这个文件，它是给模型看的职责说明。"];
	if (bindings.persona !== void 0) lines.push(`persona: ${JSON.stringify(bindings.persona)}`);
	for (const kind of BINDING_KINDS) {
		const items = bindings[kind];
		if (items.length === 0) continue;
		lines.push(`${kind}:`);
		for (const item of items) lines.push(`  - ${JSON.stringify(item)}`);
	}
	lines.push(`updatedAt: ${JSON.stringify((/* @__PURE__ */ new Date()).toISOString())}`);
	await writeFileAtomic(path, `${lines.join("\n")}\n`, {
		mode: 384,
		dirMode: 448
	});
}
/** 按给定模式改一类绑定。 */
function applyBinding(current, incoming, mode) {
	const cleaned = stringList([...incoming]);
	if (mode === "replace") return cleaned;
	const set = new Set(current);
	for (const item of cleaned) if (mode === "add") set.add(item);
	else set.delete(item);
	return [...set].sort((left, right) => left.localeCompare(right));
}
/**
* 改 preset 的展示元数据（`preset.yml`）。
*
* 渲染交给 DSH 自己的 `renderPresetMetadata`，字段集由它定义；三个字段
* 都空时它给 `undefined`，此时把文件删掉而不是写一份空 YAML。
*/
async function writeMetadata(presetDir, metadata) {
	const path = join(presetDir, METADATA_FILE);
	const rendered = renderPresetMetadata(metadata);
	if (rendered === void 0) {
		await rm(path, { force: true });
		return;
	}
	await writeFileAtomic(path, rendered, {
		mode: 384,
		dirMode: 448
	});
}
/** 校验员工 id；与 preset 目录名同一套约束。 */
function assertEmployeeId(id) {
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) throw new WorkbenchError(`员工 id "${id}" 不合法：必须是小写字母数字的短横线分隔形式`, "WORKBENCH_EMPLOYEE_BAD_ID");
}
//#endregion
//#region .tsbuild/employee/composition.js
/**
* 读懂一个 AI 员工「实际是什么」：解析它的 agent 组合文件。
*
* 一个员工不是一张名片，而是**人设 + 工具 + 技能 + MCP + 知识库**凑起来的一个
* 可直接对话的智能体模板。名片（`preset.yml`）只有名字和简介，真正决定这个
* 员工能干什么的是 `agent.cordis.yml`——一份 cordis loader 的条目数组，每行装
* 一个插件，可以用 `cordis:group` 套娃。
*
* 所以界面要展示的东西得从那份文件里读出来，而不是另建一套记录：那样两边会
* 立刻开始不一致，而组合文件才是唯一说了算的那个。
*
* **分类是按包名前缀的启发式，不是 DSH 的正式分类。** `@deepseek-ai/dsh-tool-*`
* 认作工具行，`dsh-skill*` 认作技能能力，`dsh-mcp-client` 认作 MCP。DSH 没有
* 给插件打「我是工具」的标记，能依据的只有命名约定；认不出来的一律进
* {@link CompositionSummary.others}，而不是猜。
*
* 还有一件事必须说清楚，界面上也照实写：**一个工具行不等于一个工具名**。
* `dsh-tool-fs` 一行会往目录里注册好几个文件操作工具，真正的工具名要到运行时
* 才知道。这里给出的是「这个员工装了哪些工具插件」，不是模型看到的工具清单。
*
* @module @staff-os/dsh-workbench/employee/composition
*/
/** 约定前缀，用来认类别和推短名。 */
const TOOL_PREFIX = "@deepseek-ai/dsh-tool-";
const SKILL_PREFIXES = ["@deepseek-ai/dsh-skill", "@deepseek-ai/dsh-tool-skill"];
const MCP_PREFIXES = ["@deepseek-ai/dsh-mcp"];
const PERSONA_NAME = "@deepseek-ai/dsh-persona";
const INSTRUCTIONS_NAME = "@deepseek-ai/dsh-agent-instructions";
/**
* 空摘要，附一句为什么是空的。
*
* 导出是给读文件那一步用的：文件都没读到时也要给界面一个能显示的说明，
* 而不是让整份员工列表跟着失败。
*/
function emptyComposition(error) {
	return {
		agentInstructions: false,
		tools: [],
		skills: [],
		mcpServers: [],
		others: [],
		total: 0,
		...error === void 0 ? {} : { error }
	};
}
/** 认一行的类别。 */
function classify(name) {
	if (name === PERSONA_NAME) return "persona";
	if (name === INSTRUCTIONS_NAME) return "instructions";
	if (SKILL_PREFIXES.some((prefix) => name.startsWith(prefix))) return "skill";
	if (MCP_PREFIXES.some((prefix) => name.startsWith(prefix))) return "mcp";
	if (name.startsWith(TOOL_PREFIX)) return "tool";
	return "other";
}
/** 推一个给人看的短名。 */
function labelOf(name) {
	for (const prefix of [TOOL_PREFIX, "@deepseek-ai/dsh-"]) if (name.startsWith(prefix)) return name.slice(prefix.length);
	return name;
}
/** 读禁用标记。`!!js` 表达式被 yaml 解析成字符串，原样留着。 */
function disabledOf(value) {
	if (value === true) return true;
	if (typeof value === "string" && value.trim() !== "") return value.trim();
}
/** 读人设行。 */
function personaOf(config) {
	if (typeof config !== "object" || config === null || Array.isArray(config)) return void 0;
	const record = config;
	const text = typeof record.text === "string" ? record.text : "";
	if (text === "") return void 0;
	return {
		text,
		complete: record.complete === true,
		includeRuntimeContext: record.includeRuntimeContext !== false
	};
}
/**
* 解析一份 agent 组合文件。
*
* 解析不出来不抛异常而是把原因放进 {@link CompositionSummary.error}：这是给
* 界面看的一份说明，读不懂它不该让整个员工页打不开。
* @param source - 组合文件原文。
* @returns 读出来的摘要。
*/
function parseComposition(source) {
	let rows;
	let defect;
	try {
		const doc = (0, import_dist.parseDocument)(source, { logLevel: "silent" });
		defect = doc.errors[0]?.message;
		rows = doc.toJS();
	} catch (cause) {
		return emptyComposition(cause instanceof Error ? cause.message : String(cause));
	}
	if (!Array.isArray(rows)) return emptyComposition("组合文件的顶层不是条目数组");
	const tools = [];
	const skills = [];
	const mcpServers = [];
	const others = [];
	let persona;
	let agentInstructions = false;
	let total = 0;
	/** 递归走一层条目；group 行本身不计数，只往下走。 */
	const walk = (list, group) => {
		for (const value of list) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
			const row = value;
			const name = typeof row.name === "string" ? row.name : "";
			if (name === "") continue;
			if (row.group === true) {
				const nested = row.config;
				if (Array.isArray(nested)) {
					const id = typeof row.id === "string" ? row.id : name;
					walk(nested, [...group, id]);
				}
				continue;
			}
			total += 1;
			const kind = classify(name);
			const entry = {
				...typeof row.id === "string" ? { id: row.id } : {},
				name,
				label: labelOf(name),
				kind,
				...disabledOf(row.disabled) === void 0 ? {} : { disabled: disabledOf(row.disabled) },
				group
			};
			switch (kind) {
				case "persona":
					persona ??= personaOf(row.config);
					break;
				case "instructions":
					agentInstructions = true;
					break;
				case "tool":
					tools.push(entry);
					break;
				case "skill":
					skills.push(entry);
					break;
				case "mcp":
					mcpServers.push(entry);
					break;
				case "other": others.push(entry);
			}
		}
	};
	walk(rows, []);
	return {
		...persona === void 0 ? {} : { persona },
		agentInstructions,
		tools,
		skills,
		mcpServers,
		others,
		total,
		...defect === void 0 ? {} : { error: defect }
	};
}
//#endregion
//#region .tsbuild/employee/view.js
/**
* 员工域的只读投影，工具与 Remote 两个消费方共用一份。
*
* 抽出来是因为它有两个调用方而不是一个：`workbench_employee` 工具把它渲染成
* 给模型看的文本，`WorkbenchEmployeeGateway` 把同一份数据送给浏览器画界面。
* 两边各写一遍的话，界面上看到的员工和模型看到的员工会慢慢长成两个东西。
*
* 这里只有读。写操作留在工具那边——它带着确认语义（删除要 confirm）和
* 面向模型的错误文本，那些不属于投影。
*
* @module @staff-os/dsh-workbench/employee/view
*/
/** preset 目录：composition 文件的父目录。 */
function presetDirOf(preset) {
	return dirname(preset.path);
}
/** 人设的头一句，掐到一行以内。 */
function firstLine(text) {
	const line = text.split(/\r?\n/u).map((part) => part.trim()).find((part) => part !== "");
	if (line === void 0) return void 0;
	return line.length > 120 ? `${line.slice(0, 119)}…` : line;
}
/** 把一份组合文件摘要压成列表用的几个数字。 */
function summarize(composition) {
	const line = composition.persona === void 0 ? void 0 : firstLine(composition.persona.text);
	return {
		tools: composition.tools.length,
		skills: composition.skills.length,
		mcpServers: composition.mcpServers.length,
		hasPersona: composition.persona !== void 0,
		...line === void 0 ? {} : { personaLine: line },
		personaComplete: composition.persona?.complete === true,
		agentInstructions: composition.agentInstructions,
		entries: composition.total,
		...composition.error === void 0 ? {} : { error: composition.error }
	};
}
/**
* 读并解析一个 preset 的 agent 组合文件。
*
* 读不到就当空摘要带上原因：一个 preset 的组合文件坏了或没权限，不该让整份
* 员工列表取不出来。`preset.broken` 那条路管的是「挂不起来」，与这里无关。
*/
async function readComposition(preset) {
	try {
		return parseComposition(await readFile(preset.path, "utf8"));
	} catch (cause) {
		return emptyComposition(cause instanceof Error ? cause.message : String(cause));
	}
}
/** 投影一个员工。 */
function project(preset, defaultId, bindings, composition) {
	return {
		id: preset.id,
		name: preset.name ?? preset.id,
		...preset.description === void 0 ? {} : { description: preset.description },
		...preset.order === void 0 ? {} : { order: preset.order },
		trust: preset.trust,
		isDefault: preset.id === defaultId,
		...preset.broken === void 0 ? {} : { broken: preset.broken },
		...bindings.persona === void 0 ? {} : { persona: bindings.persona },
		knowledgeBases: [...bindings.knowledgeBases],
		skills: [...bindings.skills],
		mcpServers: [...bindings.mcpServers],
		capabilities: summarize(composition)
	};
}
/**
* 读出当前盘上的可绑定资源。
*
* 技能取「盘上的」与「当前生效的」并集：刚建的还没被 DSH 扫到，项目级的
* 又不在盘上，只认一边都会误报不存在。
*/
async function readInventory(ctx, paths) {
	const bases = await listKnowledgeBases(paths.knowledge);
	const localSkills = await listLocalSkills(paths.skills);
	const registry = ctx.get("skills");
	const effective = registry === void 0 ? [] : await registry.list({});
	const servers = listServers(await loadPatch(paths.profilePatch));
	return {
		knowledgeBases: new Set(bases.map((kb) => kb.id)),
		skills: /* @__PURE__ */ new Set([...localSkills.map((skill) => skill.name), ...effective.map((skill) => skill.name)]),
		mcpServers: new Set(servers.map((server) => server.serverName))
	};
}
/** 找出绑定里指向不存在资源的条目。 */
function findUnknown(bindings, inventory) {
	const unknown = [];
	for (const kind of BINDING_KINDS) for (const id of bindings[kind]) if (!inventory[kind].has(id)) unknown.push({
		kind,
		id
	});
	return unknown;
}
/** 列出全部员工，按 preset 的既有顺序。 */
async function listEmployees(presets, defaultId) {
	const all = await presets.list();
	return Promise.all(all.map(async (preset) => project(preset, defaultId, await readBindings(presetDirOf(preset)), await readComposition(preset))));
}
//#endregion
//#region .tsbuild/employee/tool.js
/**
* 面向模型的 `workbench_employee` 工具：AI 员工与资源绑定。
* @module @staff-os/dsh-workbench/employee/tool
*/
/** 员工工具的默认超时预算。 */
const DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS = 3e4;
/** 工具支持的动作。 */
const ACTIONS$1 = [
	"list",
	"get",
	"create",
	"update",
	"bind",
	"delete"
];
const MODES = [
	"replace",
	"add",
	"remove"
];
/**
* 把只读投影放宽成出参的形状。
*
* 工具的 output schema 推出来的是可变类型，共用投影是只读的；这里是唯一一处
* 转换，而不是让投影为了迁就 schema 放弃 readonly。
*/
function row(employee) {
	return {
		...employee,
		knowledgeBases: [...employee.knowledgeBases],
		skills: [...employee.skills],
		mcpServers: [...employee.mcpServers],
		capabilities: { ...employee.capabilities }
	};
}
/** 校验动作名。 */
function parseEmployeeAction(raw) {
	const action = ACTIONS$1.find((candidate) => candidate === raw);
	if (action === void 0) throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS$1.join("、")}`, "WORKBENCH_BAD_ACTION");
	return action;
}
/** 校验绑定模式。 */
function parseBindMode(raw) {
	if (raw === void 0) return "replace";
	const mode = MODES.find((candidate) => candidate === raw);
	if (mode === void 0) throw new WorkbenchError(`未知 mode "${raw}"，可用：${MODES.join("、")}`, "WORKBENCH_BAD_ARG");
	return mode;
}
function requireArg$1(value, field, action) {
	const trimmed = value?.trim();
	if (trimmed === void 0 || trimmed === "") throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, "WORKBENCH_MISSING_ARG");
	return trimmed;
}
/** 拒绝改动随部署发布的 preset。 */
function assertWritable(preset) {
	if (preset.trust !== "user") throw new WorkbenchError(`员工 "${preset.id}" 随部署发布（trust: ${preset.trust}），不能修改；用 create 以它为模板复制一个再改`, "WORKBENCH_EMPLOYEE_READONLY");
}
/** 渲染成给模型看的文本。 */
function formatEmployeeOutput(value) {
	const lines = [value.message];
	for (const employee of value.employees) {
		lines.push("");
		const flags = [];
		if (employee.isDefault) flags.push("默认");
		if (employee.trust !== "user") flags.push("随部署发布，只读");
		if (employee.broken !== void 0) flags.push(`无法挂载：${employee.broken}`);
		lines.push(`- ${employee.id}（${employee.name}${flags.length === 0 ? "" : `，${flags.join("，")}`}）`);
		if (employee.description !== void 0) lines.push(`  简介：${employee.description}`);
		if (employee.persona !== void 0) lines.push(`  岗位：${employee.persona}`);
		if (employee.knowledgeBases.length > 0) lines.push(`  知识库：${employee.knowledgeBases.join("、")}`);
		if (employee.skills.length > 0) lines.push(`  技能：${employee.skills.join("、")}`);
		if (employee.mcpServers.length > 0) lines.push(`  MCP：${employee.mcpServers.join("、")}`);
		const made = [`${String(employee.capabilities.tools)} 个工具插件`];
		if (employee.capabilities.skills > 0) made.push("支持技能");
		if (employee.capabilities.personaComplete) made.push("固定系统提示");
		if (employee.capabilities.agentInstructions) made.push("读 AGENTS.md");
		lines.push(`  组成：${made.join("，")}`);
		if (employee.capabilities.error !== void 0) lines.push(`  组合文件读不动：${employee.capabilities.error}`);
	}
	if (value.unknownBindings.length > 0) {
		lines.push("");
		lines.push("以下绑定指向的资源当前不存在：");
		for (const item of value.unknownBindings) lines.push(`- ${item.kind}：${item.id}`);
	}
	return lines.join("\n");
}
const EMPLOYEE_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		id: {
			type: "string",
			required: true
		},
		name: {
			type: "string",
			required: true
		},
		description: { type: "string" },
		order: { type: "number" },
		trust: {
			type: "string",
			required: true
		},
		isDefault: {
			type: "boolean",
			required: true
		},
		broken: { type: "string" },
		persona: { type: "string" },
		knowledgeBases: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		skills: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		mcpServers: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		capabilities: {
			type: "object",
			required: true,
			additionalProperties: false,
			properties: {
				tools: {
					type: "number",
					required: true
				},
				skills: {
					type: "number",
					required: true
				},
				mcpServers: {
					type: "number",
					required: true
				},
				hasPersona: {
					type: "boolean",
					required: true
				},
				personaLine: { type: "string" },
				personaComplete: {
					type: "boolean",
					required: true
				},
				agentInstructions: {
					type: "boolean",
					required: true
				},
				entries: {
					type: "number",
					required: true
				},
				error: { type: "string" }
			}
		}
	}
};
/**
* 注册 `workbench_employee` 工具及其使用指引。
*/
function applyEmployeeTool(ctx, timeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:workbench_employee",
		order: 124,
		text: [
			"workbench_employee 管理 AI 员工，一个员工就是一个 DSH agent preset。",
			"create 只能以一个现成员工为模板整目录复制，这是 DSH 刻意的安全边界，不要试图绕过；",
			"trust 为 system 的员工随部署发布，改不了也删不掉，要改就先复制一份。",
			"一个员工就是人设、工具、技能、MCP 凑成的智能体模板，list 出来的「组成」读自它的 agent 组合文件，",
			"那份文件本工具改不了：要增删工具就复制一个员工再改它的组合文件。",
			"bind 写的是这个员工该用哪些知识库、技能与 MCP 服务——这份清单是职责说明，",
			"DSH 不会因为绑定了知识库就自动检索；以某个员工身份工作时，要照着它的绑定去调用对应工具。",
			"delete 不可逆，必须先向用户说明再带 confirm: true 调用。"
		].join("")
	});
	ctx.tools.register(defineTool({
		name: "workbench_employee",
		description: [
			"Manage AI employees. An employee is a DSH agent preset plus a workbench-owned ",
			"binding list naming the knowledge bases, skills and MCP servers it should use. ",
			"Actions: list, get, create (copies an existing employee whole), update (display metadata and persona), ",
			"bind (edit the resource bindings), delete (needs confirm). ",
			"Presets with trust \"system\" ship with the deployment and cannot be modified or deleted."
		].join(""),
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS$1,
				description: "Which operation to perform."
			},
			id: {
				type: "string",
				description: "Employee id in kebab-case; it becomes the preset directory name. Required for get/create/update/bind/delete."
			},
			from: {
				type: "string",
				description: "create only: the existing employee to copy from. Defaults to the current default employee."
			},
			name: {
				type: "string",
				description: "create/update: display name."
			},
			description: {
				type: "string",
				description: "update: one sentence on what this employee is for. Pass an empty string to clear it."
			},
			order: {
				type: "integer",
				description: "update: sort position in pickers; lower comes first."
			},
			persona: {
				type: "string",
				description: "update: the job description this employee should work under. Pass an empty string to clear it."
			},
			knowledgeBases: {
				type: "array",
				items: { type: "string" },
				description: "bind: knowledge base ids."
			},
			skills: {
				type: "array",
				items: { type: "string" },
				description: "bind: skill names."
			},
			mcpServers: {
				type: "array",
				items: { type: "string" },
				description: "bind: MCP server names."
			},
			mode: {
				type: "string",
				enum: MODES,
				description: "bind: how to apply the given lists. \"replace\" (default) overwrites each list you pass, \"add\" appends, \"remove\" deletes. Lists you omit are left alone in every mode."
			},
			confirm: {
				type: "boolean",
				description: "Required to be true for delete, which is irreversible. Ask the user first."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: {
						type: "string",
						required: true
					},
					message: {
						type: "string",
						required: true
					},
					employees: {
						type: "array",
						required: true,
						items: EMPLOYEE_SCHEMA
					},
					unknownBindings: {
						type: "array",
						required: true,
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								kind: {
									type: "string",
									required: true
								},
								id: {
									type: "string",
									required: true
								}
							}
						}
					}
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: formatEmployeeOutput(value)
			}]
		},
		timeoutMs,
		isConcurrencySafe: (args) => {
			const action = parseEmployeeAction(args.action);
			return action === "list" || action === "get";
		},
		async execute(args) {
			const runtime = ctx.workbench;
			const presets = ctx.get("agentPresets");
			if (presets === void 0) throw new WorkbenchError("AI 员工能力依赖 @deepseek-ai/dsh-agent-presets，当前 profile 没有装它", "WORKBENCH_NO_AGENT_PRESETS");
			const action = parseEmployeeAction(args.action);
			const defaultId = presets.defaultId;
			if (action === "list") {
				await presets.list();
				const employees = (await listEmployees(presets, defaultId)).map(row);
				return {
					action,
					message: employees.length === 0 ? "还没有任何 AI 员工" : `共 ${String(employees.length)} 个 AI 员工，默认是 "${defaultId}"`,
					employees,
					unknownBindings: []
				};
			}
			const id = requireArg$1(args.id, "id", action);
			if (action === "create") {
				assertEmployeeId(id);
				const from = args.from?.trim() ?? defaultId;
				await presets.copy(from, id, args.name?.trim());
				const created = await presets.resolve(id);
				const dir = presetDirOf(created);
				const bindings = await readBindings(dir);
				const persona = args.persona?.trim();
				if (persona !== void 0 && persona !== "") await writeBindings(dir, {
					...bindings,
					persona
				});
				return {
					action,
					message: `已以 "${from}" 为模板创建 AI 员工 "${id}"`,
					employees: [row(project(created, defaultId, await readBindings(dir), await readComposition(created)))],
					unknownBindings: []
				};
			}
			const preset = await presets.resolve(id);
			const dir = presetDirOf(preset);
			if (action === "get") {
				const bindings = await readBindings(dir);
				return {
					action,
					message: `AI 员工 "${id}"`,
					employees: [row(project(preset, defaultId, bindings, await readComposition(preset)))],
					unknownBindings: findUnknown(bindings, await readInventory(ctx, runtime.paths))
				};
			}
			if (action === "delete") {
				requireConfirm(args.confirm, `删除 AI 员工 "${id}"`);
				const removed = row(project(preset, defaultId, await readBindings(dir), await readComposition(preset)));
				await presets.remove(id);
				return {
					action,
					message: `已删除 AI 员工 "${id}"`,
					employees: [removed],
					unknownBindings: []
				};
			}
			assertWritable(preset);
			if (action === "update") {
				const name = args.name?.trim();
				const description = args.description?.trim();
				const nextName = name === void 0 || name === "" ? preset.name : name;
				const nextDescription = description === void 0 ? preset.description : description === "" ? void 0 : description;
				const nextOrder = args.order ?? preset.order;
				await writeMetadata(dir, {
					...nextName === void 0 ? {} : { name: nextName },
					...nextDescription === void 0 ? {} : { description: nextDescription },
					...nextOrder === void 0 ? {} : { order: nextOrder }
				});
				const persona = args.persona;
				if (persona !== void 0) {
					const current = await readBindings(dir);
					const trimmed = persona.trim();
					const { persona: _dropped, ...rest } = current;
					await writeBindings(dir, trimmed === "" ? rest : {
						...rest,
						persona: trimmed
					});
				}
				const updated = await presets.resolve(id);
				return {
					action,
					message: `已更新 AI 员工 "${id}"`,
					employees: [row(project(updated, defaultId, await readBindings(dir), await readComposition(updated)))],
					unknownBindings: []
				};
			}
			const mode = parseBindMode(args.mode);
			const given = {
				...args.knowledgeBases === void 0 ? {} : { knowledgeBases: args.knowledgeBases },
				...args.skills === void 0 ? {} : { skills: args.skills },
				...args.mcpServers === void 0 ? {} : { mcpServers: args.mcpServers }
			};
			if (Object.keys(given).length === 0) throw new WorkbenchError("动作 \"bind\" 必须至少给 knowledgeBases、skills、mcpServers 其中一项", "WORKBENCH_MISSING_ARG");
			const current = await readBindings(dir);
			const nextList = (kind) => {
				const incoming = given[kind];
				return incoming === void 0 ? [...current[kind]] : applyBinding(current[kind], incoming, mode);
			};
			const next = {
				...current.persona === void 0 ? {} : { persona: current.persona },
				knowledgeBases: nextList("knowledgeBases"),
				skills: nextList("skills"),
				mcpServers: nextList("mcpServers")
			};
			const unknownBindings = mode === "remove" ? [] : findUnknown(next, await readInventory(ctx, runtime.paths));
			await writeBindings(dir, next);
			return {
				action,
				message: [`已更新 AI 员工 "${id}" 的资源绑定`, unknownBindings.length === 0 ? "" : `；其中 ${String(unknownBindings.length)} 项指向的资源当前不存在，绑定已写入但不会有效果`].join(""),
				employees: [row(project(preset, defaultId, next, await readComposition(preset)))],
				unknownBindings
			};
		},
		presentCall: (args) => ({
			card: "generic",
			kind: "search",
			title: args.id === void 0 ? `员工：${args.action}` : `员工：${args.action} ${args.id}`,
			rawInput: args.action
		})
	}));
}
//#endregion
//#region .tsbuild/employee/remote.js
/**
* 员工域的 Remote 半边：把本地维护的 AI 员工送到浏览器。
*
* 界面要显示**实际的**员工，而员工是 `$DSH_HOME` 下的 preset 目录加一份
* `employee.yml`——那些都在 Node 半边。浏览器读它们只有一条正规路径：
* Typert Remote。本类注册为 `ctx.workbenchEmployee`，`@Remote` 标出的方法
* 经由 api-gateway 暴露成 `ctx.remote.workbenchEmployee.*`。
*
* 与 `workbench_employee` 工具的分工：工具是给模型的，带确认语义和给模型看
* 的文本；这里是给界面的，只送结构化数据。两边读的是同一份 {@link listEmployees}
* 投影，所以界面上的员工和模型看到的员工不会各说各话。
*
* 写操作也放在这里而不是只读：一个只能看不能改的界面等于没有维护界面，而
* 「改」这件事在工具那边已经有实现——这里复用同一批 store 函数，不另起一套
* 规则。删除的确认由界面负责，因为点删除的是人不是模型。
*
* @module @staff-os/dsh-workbench/employee/remote
*/
var __runInitializers$1 = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate$1 = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/**
* 员工域的 Remote 服务。注册为 `ctx.workbenchEmployee`。
*/
let WorkbenchEmployeeGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _list_decorators;
	let _create_decorators;
	let _update_decorators;
	let _bind_decorators;
	let _delete_decorators;
	let _read_decorators;
	return class WorkbenchEmployeeGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_list_decorators = [Remote("list")];
			_create_decorators = [Remote("create")];
			_update_decorators = [Remote("update")];
			_bind_decorators = [Remote("bind")];
			_delete_decorators = [Remote("delete")];
			_read_decorators = [Remote("read")];
			__esDecorate$1(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate$1(this, null, _create_decorators, {
				kind: "method",
				name: "create",
				static: false,
				private: false,
				access: {
					has: (obj) => "create" in obj,
					get: (obj) => obj.create
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate$1(this, null, _update_decorators, {
				kind: "method",
				name: "update",
				static: false,
				private: false,
				access: {
					has: (obj) => "update" in obj,
					get: (obj) => obj.update
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate$1(this, null, _bind_decorators, {
				kind: "method",
				name: "bind",
				static: false,
				private: false,
				access: {
					has: (obj) => "bind" in obj,
					get: (obj) => obj.bind
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate$1(this, null, _delete_decorators, {
				kind: "method",
				name: "delete",
				static: false,
				private: false,
				access: {
					has: (obj) => "delete" in obj,
					get: (obj) => obj.delete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate$1(this, null, _read_decorators, {
				kind: "method",
				name: "read",
				static: false,
				private: false,
				access: {
					has: (obj) => "read" in obj,
					get: (obj) => obj.read
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["workbench"];
		constructor(ctx) {
			super(ctx, "workbenchEmployee");
			__runInitializers$1(this, _instanceExtraInitializers);
		}
		/**
		* 读出全部员工与当前可绑定的资源。
		* @returns 员工快照。
		*/
		async list() {
			return this.snapshot();
		}
		/**
		* 以一个现成员工为模板复制出新员工。
		*
		* 只能整目录复制，这是 DSH 刻意的安全边界：preset 的创作 API 不接受调用方
		* 直接给组合内容，复制出来的东西不会比源多出任何能力。
		* @param id - 新员工 id。
		* @param from - 模板员工 id；留空用当前默认员工。
		* @param name - 新员工的显示名。
		* @returns 新建的员工与刷新后的快照。
		*/
		async create(id, from, name) {
			const presets = this.presets();
			const trimmed = id.trim();
			assertEmployeeId(trimmed);
			await presets.copy((from ?? presets.defaultId).trim(), trimmed, name?.trim());
			return this.mutated(trimmed);
		}
		/**
		* 改一个员工的展示元数据（`preset.yml`）。
		* @param id - 员工 id。
		* @param metadata - 要写入的字段；全空时元数据文件会被删掉。
		* @returns 改完的员工与刷新后的快照。
		*/
		async update(id, metadata) {
			await writeMetadata(presetDirOf(await this.writable(id)), {
				...metadata.name === void 0 ? {} : { name: metadata.name.trim() },
				...metadata.description === void 0 ? {} : { description: metadata.description.trim() },
				...metadata.order === void 0 ? {} : { order: metadata.order }
			});
			return this.mutated(id);
		}
		/**
		* 改一个员工的资源绑定（`employee.yml`）。
		*
		* 这份清单是**职责说明**：写进一个知识库 id 不会让检索自动发生，它告诉
		* 模型以这个员工身份工作时该去用哪些资源。
		* @param id - 员工 id。
		* @param bindings - 要写入的绑定。
		* @returns 改完的员工与刷新后的快照。
		*/
		async bind(id, bindings) {
			const dir = presetDirOf(await this.writable(id));
			const current = await readBindings(dir);
			const mode = bindings.mode ?? "replace";
			const next = {
				knowledgeBases: [...current.knowledgeBases],
				skills: [...current.skills],
				mcpServers: [...current.mcpServers]
			};
			for (const kind of BINDING_KINDS) {
				const incoming = bindings[kind];
				if (incoming === void 0) continue;
				next[kind] = applyBinding(current[kind], incoming, mode);
			}
			const persona = bindings.persona?.trim();
			await writeBindings(dir, {
				...persona === void 0 ? current.persona === void 0 ? {} : { persona: current.persona } : persona === "" ? {} : { persona },
				...next
			});
			return this.mutated(id);
		}
		/**
		* 删掉一个员工。
		*
		* 不可逆，且这里不再问一遍：点删除的是人，确认在界面上已经发生过了。
		* @param id - 员工 id。
		* @returns 删除后的快照。
		*/
		async delete(id) {
			await this.writable(id);
			await this.presets().remove(id);
			return { snapshot: await this.snapshot() };
		}
		/**
		* 读一个员工的 agent 组合文件：原文，加上从里面解析出来的组成。
		*
		* 这是这个员工「实际是什么」的唯一权威来源——preset.yml 只是名片。人设、
		* 工具、技能、MCP 都写在这里，界面要展示的就是解析出来的这份结构。
		*
		* 原文一并送回去，是因为解析是按包名前缀的启发式（见 composition.ts）：
		* 认不出来的行只能靠人去看原文。
		* @param id - 员工 id。
		* @returns 组合文件原文与解析结果。
		*/
		async read(id) {
			const presets = this.presets();
			const preset = await presets.resolve(id);
			return {
				source: await presets.read(id),
				composition: await readComposition(preset)
			};
		}
		/** 当前的完整快照。 */
		async snapshot() {
			const runtime = this.ctx.workbench;
			const presets = this.presets();
			const defaultId = presets.defaultId;
			const employees = await listEmployees(presets, defaultId);
			const inventory = await readInventory(this.ctx, runtime.paths);
			const unknown = [];
			const seen = /* @__PURE__ */ new Set();
			for (const employee of employees) for (const item of findUnknown({
				knowledgeBases: employee.knowledgeBases,
				skills: employee.skills,
				mcpServers: employee.mcpServers
			}, inventory)) {
				const key = `${item.kind} ${item.id}`;
				if (seen.has(key)) continue;
				seen.add(key);
				unknown.push(item);
			}
			return {
				employees,
				defaultId,
				knowledgeBases: [...inventory.knowledgeBases].sort((a, b) => a.localeCompare(b)),
				skills: [...inventory.skills].sort((a, b) => a.localeCompare(b)),
				mcpServers: [...inventory.mcpServers].sort((a, b) => a.localeCompare(b)),
				unknownBindings: unknown
			};
		}
		/** 一次写操作之后：重读那个员工，连同刷新过的快照一起送回去。 */
		async mutated(id) {
			const presets = this.presets();
			const preset = await presets.resolve(id);
			return {
				employee: project(preset, presets.defaultId, await readBindings(presetDirOf(preset)), await readComposition(preset)),
				snapshot: await this.snapshot()
			};
		}
		/** 取 preset 服务；没装就说清楚缺的是哪个包。 */
		presets() {
			const presets = this.ctx.get("agentPresets");
			if (presets === void 0) throw new WorkbenchError("AI 员工能力依赖 @deepseek-ai/dsh-agent-presets，当前 profile 没有装它", "WORKBENCH_NO_AGENT_PRESETS");
			return presets;
		}
		/** 解析一个员工并拒绝改动随部署发布的那些。 */
		async writable(id) {
			const preset = await this.presets().resolve(id);
			if (preset.trust !== "user") throw new WorkbenchError(`员工 "${preset.id}" 随部署发布（trust: ${preset.trust}），不能修改；复制一份再改`, "WORKBENCH_EMPLOYEE_READONLY");
			return preset;
		}
	};
})();
//#endregion
//#region .tsbuild/skill/activation.js
/**
* 技能写盘之后到底什么时候生效——以及怎么当场验证。
*
* ## 「重启 DSH 后生效」是错的
*
* 这一域早先每个写操作都回一句「重启 DSH 后生效」。对着源码核过一遍，
* 这句话不成立，而且它会让人白白重启一次：
*
* 1. `dsh-skill-filesystem` 默认 `watch: true`，用 chokidar 盯着每个技能根
*    （含 `$DSH_HOME/skills`），`depth: 1`，写完有个约 200ms 的稳定期。
*    新增/删除技能目录、`<name>/SKILL.md` 的增删改、扁平 `<name>.md` 的增删改，
*    都算「目录变了」。
* 2. 它随即调用注册时拿到的 `control.invalidate()`。这个回调进到
*    `SkillRegistry.invalidateCache()`，**清掉的是整个 registry 的发现缓存**
*    （不只是那一个 provider 的），并广播 `skills/change`。
* 3. `dsh-tool-skill` 在**每一个** `agent/pre-step` 都重新 `snapshot()`，
*    对比 digest，变了就往会话里追加一条完整的替换目录。
* 4. 用户那条 `/name` 调用路径更直接：它每次都现查 `ctx.skills.get(name)`，
*    完整定义**根本不进缓存**。
*
* 也就是说：写完盘，下一个模型回合就生效，人不用做任何事。
*
* ## 那为什么还要这个模块
*
* 两件事上面那条链路给不了：
*
* **一是确定性。** watcher 可以被关（`watch: false`）、可以在容器里因为
* inotify 配额起不来（此时 provider 把观察标记成不完整、但仍可读）。所以这里
* 自己注册一个不产出任何技能的 provider，只为拿到那个 `invalidate()` 句柄，
* 写完盘就主动敲一下。清缓存是全局的，敲谁的句柄都一样。
*
* **二是验证。** 「生效了没有」的唯一诚实答案不是一句预测，而是回头查一次
* `ctx.skills`：这个名字现在在不在，赢的是不是我刚写的那份。同名遮蔽、
* frontmatter 被 DSH 拒收，这两种「写成功了但没生效」只有回读才看得见。
*
* ## 回读查不到，不等于没生效
*
* 本插件挂在宿主层，是个**无作用域**的上下文，而 `ctx.skills` 是「宿主层 +
* 每个作用域一层」的分层注册表。web profile 的出厂组合把宿主层的
* `skill-filesystem` 关掉了，改由每个 agent preset 在自己那一层挂
* （`packages/bundle/web-app/cordis.patch.yml` 里写了原因：本地发现归预设所有）。
* 于是从这里看过去，`$DSH_HOME/skills` 下的技能一个都查不到——而会话里那个
* agent 照常能用它们。
*
* 所以「查不到」有三种成因，处置完全不同，不能合成一句话：这一份被拒收、
* 宿主层根本不扫这个根、以及两者都不是。分辨的办法见
* {@link SkillActivation.verify} 里那条私有分支。
*
* @module @staff-os/dsh-workbench/skill/activation
*/
/**
* 本插件在 `ctx.skills` 上的 provider 名。
*
* 它一个技能都不产出。存在的唯一理由是 `registerProvider` 只在这个入口
* 交出 `invalidate()` 句柄，而那是「让刚写的技能立刻被重新发现」的正规途径。
*/
const SIGNAL_PROVIDER = "workbench-signal";
/**
* 技能生效的信号与验证。注册为 `ctx.workbenchSkillActivation`。
*/
var SkillActivation = class extends Service {
	/** provider 注册时拿到的失效句柄；`ctx.skills` 不在时为空。 */
	invalidateProvider;
	constructor(ctx) {
		super(ctx, "workbenchSkillActivation");
		const skills = ctx.get("skills");
		if (skills === void 0) return;
		skills.registerProvider((control) => {
			this.invalidateProvider = control.invalidate;
			return {
				name: SIGNAL_PROVIDER,
				list: async () => [],
				get: async () => void 0
			};
		});
	}
	/**
	* 告诉 DSH 技能目录变了，让它重新发现。
	*
	* 写完盘立刻调用。`skill-filesystem` 的 watcher 通常也会在约 200ms 后自己
	* 发现同一件事，这里只是把「通常」换成「一定」，并且省掉那段稳定期。
	* 重复失效是无害的：它只是清缓存加一次广播。
	*/
	notifyChanged() {
		this.invalidateProvider?.();
	}
	/**
	* 回头查一次：这个技能现在到底生没生效。
	*
	* @param name - 技能名。
	* @param root - 用户级技能根，用来判断赢家是不是本插件写的那份。
	* @param cwd - 查询用的工作目录；项目级技能的遮蔽与它有关。
	* @returns 当前处境，含一句可以直接显示的结论。
	*/
	async verify(name, root, cwd) {
		const skills = this.ctx.get("skills");
		if (skills === void 0) return {
			active: false,
			mine: false,
			summary: "这个部署没装 DSH 的技能服务（`ctx.skills`），技能文件已落盘但不会被任何会话读到",
			scope: "deployment"
		};
		const view = { ...cwd === void 0 ? {} : { cwd } };
		const winner = await skills.get(name, view);
		if (winner === void 0) return this.explainMissing(name, root, view);
		if (winnerIsUnder(winner, root)) return {
			active: true,
			mine: true,
			winnerSource: winner.source,
			...winner.path === void 0 ? {} : { winnerPath: winner.path },
			summary: `已生效：下一个模型回合就能用 "${name}"，无需重启`,
			scope: "skill"
		};
		return {
			active: true,
			mine: false,
			winnerSource: winner.source,
			...winner.path === void 0 ? {} : { winnerPath: winner.path },
			summary: `已落盘，但当前生效的是 ${winner.source} 的同名技能${winner.path === void 0 ? "" : `（${winner.path}）`}，你改的这份被它遮蔽，不会有任何效果`,
			scope: "skill"
		};
	}
	/**
	* `ctx.skills.get()` 查不到时，说清到底是哪一种「查不到」。
	*
	* 三种情形的处置完全不同，混成一句「多半是 frontmatter 不合规」会把人引到
	* 一份根本没问题的文件上：
	*
	* 1. **这一份确实不合规**——本插件的解析规则是照着 `skill-filesystem` 抄的，
	*    它拒收就等于 DSH 拒收。这时给出具体理由（哪个键该改成什么）。
	* 2. **宿主层压根不扫本地技能根**。web profile 的出厂组合就是这样：
	*    `skill-filesystem` 在宿主层是关掉的，改由每个 agent preset 挂进它自己的
	*    作用域层。于是从本插件这个无作用域的上下文看过去，任何本地技能都查不到，
	*    而会话里那个 agent 照样能用。这时说「没生效」是错的。
	* 3. 根扫得到、这一份也合规，却仍然查不到——这时诚实地说不知道，别编原因。
	*
	* @param name - 技能名。
	* @param root - 用户级技能根。
	* @param view - 传给 `ctx.skills` 的查询选项。
	* @returns 对应情形的结论。
	*/
	async explainMissing(name, root, view) {
		const scan = await scanLocalSkills(root);
		const rejected = scan.rejected.find((entry) => entry.hint === name);
		if (rejected !== void 0) return {
			active: false,
			mine: false,
			summary: `已落盘，但 DSH 会整份丢弃它：${rejected.reason}`,
			scope: "skill"
		};
		const skills = this.ctx.get("skills");
		const catalog = skills === void 0 ? [] : await skills.list(view);
		const base = resolve(root);
		if (!catalog.some((summary) => {
			const resourceBase = summary.resourceBase;
			return resourceBase !== void 0 && resourceBase.kind === "directory" && isUnder(resourceBase.path, base);
		}) && scan.skills.length > 0) return {
			active: false,
			mine: false,
			summary: `已落盘。这个部署的宿主层不扫本地技能根——web profile 的出厂组合就把 \`skill-filesystem\` 关在宿主层、交给各个 agent preset 在自己的作用域里挂，所以这里查不到 "${name}" 是正常的，会话按预设加载时能看到它`,
			scope: "deployment"
		};
		return {
			active: false,
			mine: false,
			summary: `已落盘，frontmatter 也合规，但 DSH 现在仍然不认 "${name}"——原因不在本插件能看到的范围里，去看 DSH 的日志（它丢弃技能文件时会记一行 warn）`,
			scope: "skill"
		};
	}
};
/**
* 详情页顶上该不该挂这句结论。
*
* 只有说得出**这一份技能**的话才挂。部署级的结论（没装技能服务、宿主层不扫
* 本地技能根）对根下每一份都一样，摆在每一页详情顶上就是同一段话重复 N 遍，
* 还会把真正与这一份有关的（被拒收、被遮蔽）淹掉。写操作之后的提示不走这里，
* 那一下到底生没生效是当时的问题，部署级的原因照说不误。
*
* @param state - 查到的处境；没查（没有 activation 服务）时是 `undefined`。
* @returns 要显示的那句话，或 `undefined` 表示这一页不说话。
*/
function detailNote(state) {
	return state === void 0 || state.scope !== "skill" ? void 0 : state.summary;
}
/** `path` 是不是落在 `base` 之下（`base` 已 resolve 过）。 */
function isUnder(path, base) {
	const resolved = resolve(path);
	return resolved === base || resolved.startsWith(`${base}${pathSeparator(resolved, base)}`);
}
/** 赢家是不是落在某个技能根之下。 */
function winnerIsUnder(winner, root) {
	if (winner.path === void 0) return false;
	return isUnder(winner.path, resolve(root));
}
/** 取该平台的分隔符；`resolve` 的结果里两种斜杠不会混用。 */
function pathSeparator(path, base) {
	return path.slice(base.length).startsWith("\\") ? "\\" : "/";
}
//#endregion
//#region .tsbuild/skill/file.js
/**
* 把一个文件送到界面上去看：读多少、怎么判断是不是文本、允许读哪里。
*
* 详情页的文件树点开一个文件就走这里。两个来源（盘上的技能目录、刚下载回来
* 的市场包）最后都落到 {@link fileContentOf} 这一个形状上，所以界面那边只有
* 一套显示逻辑。
*
* 这里有一条安全边界：{@link resolveInsideSkill}。相对路径是浏览器传上来的，
* 它必须只能落在那个技能目录**里面**——`assertSafeEntryPath` 先按字面挡掉
* `..` 与绝对路径，解析之后再核一遍结果确实还在目录底下。只做前一道不够：
* 路径分隔符与盘符在不同平台上的写法不止一种，字面检查总有漏网的。
*
* @module @staff-os/dsh-workbench/skill/file
*/
/**
* 一个文件预览能有多大。
*
* 送到浏览器的是一次 Remote 调用的返回值，中途没有分片也没有流式。技能里的
* 文档和脚本都远小于这个数，真撞上上限的多半是别人顺手塞进包里的数据文件——
* 那种东西看前 256 KiB 已经够判断它是什么了。
*/
const MAX_PREVIEW_BYTES = 262144;
/**
* 把「技能目录 + 相对路径」落到盘上一个绝对路径，并确认它没跑出去。
*
* @param dir - 技能目录。
* @param path - 浏览器给的相对路径。
* @returns 绝对路径。
* @throws 路径不合法、或解析之后落在了目录之外。
*/
function resolveInsideSkill(dir, path) {
	assertSafeEntryPath(path);
	const home = resolve(dir);
	const full = resolve(home, path);
	if (!full.startsWith(home + sep)) throw new WorkbenchError(`路径 "${path}" 不在技能目录里`, "WORKBENCH_UNSAFE_PATH");
	return full;
}
/**
* 读盘上一个文件，做成能送到浏览器的样子。
*
* 大文件只读前 {@link MAX_PREVIEW_BYTES} 个字节，而不是读完再截：一份被人
* 顺手塞进技能里的几十 MB 数据文件，光是读进内存就够呛。
*
* @param full - 盘上的绝对路径。
* @param path - 报给界面的相对路径。
* @returns 文件内容。
*/
async function readFileContent(full, path) {
	let size;
	try {
		size = (await stat(full)).size;
	} catch (error) {
		throw new WorkbenchError(`读不到 "${path}"`, "WORKBENCH_SKILL_NOT_FOUND", { cause: error });
	}
	const wanted = Math.min(size, MAX_PREVIEW_BYTES);
	const handle = await open(full, "r");
	let data;
	try {
		data = Buffer.alloc(wanted);
		await handle.read(data, 0, wanted, 0);
	} finally {
		await handle.close();
	}
	return fileContentOf(path, size, data);
}
/**
* 把一段字节做成文件内容。
*
* @param path - 报给界面的相对路径。
* @param size - 文件的完整体积；比 `data` 长就说明这次只取了开头一段。
* @param data - 取到的字节。
* @returns 文件内容。
*/
function fileContentOf(path, size, data) {
	const truncated = size > data.byteLength;
	const text = truncated ? decodeTruncated(data) : decodeText(data);
	return {
		path,
		size,
		...text === void 0 ? {} : { text },
		binary: text === void 0,
		truncated
	};
}
/**
* 解一段被截过的文本。
*
* 截口可能落在一个多字节字符中间，而 `decodeText` 是 fatal 模式——直接解会把
* 一份纯文本判成二进制。UTF-8 一个字符最多 4 字节，所以最多削掉末尾 3 个字节
* 再试；真是二进制的话这几次也都解不出来，结论不变。
*/
function decodeTruncated(data) {
	for (let back = 0; back <= 3 && data.byteLength > back; back += 1) {
		const text = decodeText(data.subarray(0, data.byteLength - back));
		if (text !== void 0) return text;
	}
}
//#endregion
//#region .tsbuild/skill/scan.js
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
/**
* 严重度。取值与 SkillHub 安全审计界面那套词表一致，声明顺序从高到低——
* {@link highestSeverity} 靠这个顺序取一包里最高的那一档。
*/
const SEVERITY_ORDER = [
	"CRITICAL",
	"HIGH",
	"MEDIUM",
	"LOW",
	"INFO"
];
/** 单行规则。 */
function single(id, source, severity, category, description) {
	return {
		id,
		pattern: new RegExp(source, "iu"),
		multiline: false,
		severity,
		category,
		description
	};
}
/** 跨行规则：`.` 也吃换行。 */
function multiline(id, source, severity, category, description) {
	return {
		id,
		pattern: new RegExp(source, "ius"),
		multiline: true,
		severity,
		category,
		description
	};
}
/**
* 规则表，十三条。
*
* 说明写成中文是因为它直接显示在界面上；`id` 与 `category` 保持上游的写法，
* 那两个是稳定标识，改了就对不上 SkillHub 那边的审计记录。
*/
const RISK_RULES = [
	single("curl_pipe_exec", "curl\\s+.*\\|\\s*(ba)?sh|wget\\s+.*\\|\\s*(ba)?sh|curl\\s+-[^|]*\\|\\s*(python|ruby|perl)", "HIGH", "remote-payload", "把下载到的脚本直接管进 shell 执行。审核时看到的内容和实际跑的可以完全是两回事"),
	single("cloud_metadata_access", "169\\.254\\.169\\.254|metadata\\.google\\.internal|metadata\\.azure\\.com", "HIGH", "credential-access", "访问云主机的元数据端点，那是取云上临时凭据的常见路子"),
	single("local_env_recon", "gethostname|getfqdn|getsockname|socket\\.connect.*8\\.8\\.8\\.8", "LOW", "reconnaissance", "收集本机环境信息（主机名／IP／FQDN），像是在踩点"),
	single("credential_file_access", "(~/|HOME|USERPROFILE).*(/|\\\\)(\\.ssh|\\.aws|\\.env|credentials|mcp\\.json|Keychain|authorized_keys)", "HIGH", "credential-access", "读凭据或密钥所在的路径"),
	single("prompt_injection", "(ignore\\s+(previous|above|all)\\s+(instructions?|rules?|prompts?)|you\\s+are\\s+now|SYSTEM\\s*OVERRIDE|<\\|im_start\\|>|forget\\s+(everything|your\\s+instructions))", "CRITICAL", "prompt-injection", "含疑似提示词注入的措辞，试图盖掉 agent 自己的约束"),
	multiline("fixed_tail_ad_injection", "((文末|结尾|每篇必带|固定收束|固定提示).{0,80}(链接|扫码|进群|群里|资讯|广告|内幕|吃瓜|news|http))|((扫码进群|进群吃瓜|获取更多资讯新闻点击|点击[:：]|想深扒更多).{0,120}(https?://|www\\.))|((https?://|www\\.).{0,120}(扫码进群|进群|群里|资讯|广告|内幕|吃瓜))", "MEDIUM", "prompt-injection", "要求在模型输出末尾固定附上一段广告或引流内容"),
	single("reverse_shell", "(socket\\.connect|subprocess|/bin/(ba)?sh).*\\d+\\.\\d+\\.\\d+\\.\\d+", "CRITICAL", "remote-control", "含疑似反弹 shell 的写法"),
	multiline("encoded_payload", "(base64\\.b64decode|atob|Buffer\\.from.*base64).*\\b(exec|eval|system|popen)\\b", "CRITICAL", "obfuscation", "先解码再执行，真正跑的是什么在审核时看不到"),
	multiline("data_exfil_encoded", "(base64\\.(b64)?encode|btoa).*?(key|secret|token|password|credential|private|id_rsa)", "HIGH", "data-exfiltration", "把敏感数据编码之后再写出去，像是一条隐蔽的外传通道"),
	multiline("outbound_data_exfil", "(requests\\.(post|put)|urlopen|fetch|http\\.request).*?(environ|os\\.getenv|password|secret|token|api_key)", "HIGH", "data-exfiltration", "把环境变量或凭据往网络上发"),
	single("crontab_persistence", "crontab|systemctl\\s+enable|launchctl\\s+load|schtasks", "MEDIUM", "persistence", "装一个定时任务或系统服务，技能这一次跑完了它还在"),
	single("ssh_key_write", "authorized_keys|id_rsa|\\.ssh.*write|\\.ssh.*open.*w", "HIGH", "credential-access", "往 SSH 密钥文件里写东西"),
	single("non_official_download", "(github\\.com/[a-zA-Z0-9_-]+/|glot\\.io|pastebin\\.com|raw\\.githubusercontent\\.com/[a-zA-Z0-9_-]+/).*\\.(exe|sh|py|bin|zip|tar)", "MEDIUM", "remote-payload", "从个人代码托管或贴代码站下可执行文件")
];
/**
* 一个文件最多扫多少字节。
*
* 与上游的 pre-scan 上限一致。跨行规则用的是 dot-all 量词，代价随输入长度涨，
* 所以超过这个数的文件整个跳过，而不是截一段来扫——截出来的半截内容既可能
* 漏报，也可能因为切在半路而误报。
*/
const MAX_SCAN_BYTES = 524288;
/** 字符集夹带这一条不是正则匹出来的，是解码器解出来的，所以单独有个 id。 */
const CHARSET_SMUGGLING_RULE = "charset_smuggling";
/** 会去扫的扩展名。二进制与不认识的一律跳过。 */
const TEXT_EXTENSIONS = /* @__PURE__ */ new Set([
	"md",
	"txt",
	"json",
	"yaml",
	"yml",
	"js",
	"cjs",
	"mjs",
	"ts",
	"py",
	"sh",
	"html",
	"css",
	"csv",
	"toml",
	"xml",
	"xsd",
	"xsl",
	"dtd",
	"ini",
	"cfg",
	"env",
	"rb",
	"go",
	"rs",
	"java",
	"kt",
	"lua",
	"sql",
	"r",
	"bat",
	"ps1",
	"zsh",
	"bash",
	"svg"
]);
/**
* 这个文件扫不扫。
*
* @param path - 包内相对路径。
* @returns 扫就是 true。
*/
function isScannableTextFile(path) {
	const lower = path.toLowerCase();
	const ext = lower.includes(".") ? lower.split(".").pop() ?? "" : "";
	return TEXT_EXTENSIONS.has(ext);
}
/**
* 扫一批文件。
*
* @param files - 要扫的文件，路径是包内相对路径。
* @returns 扫描结果。
*/
function scanFiles(files) {
	const findings = [];
	let scanned = 0;
	let skipped = 0;
	for (const file of files) {
		if (!isScannableTextFile(file.path) || file.data.byteLength > 524288) {
			skipped += 1;
			continue;
		}
		const text = decodeText(file.data);
		if (text === void 0) {
			skipped += 1;
			continue;
		}
		scanned += 1;
		collect(file.path, text, void 0, findings);
		const hidden = recoverMojibake(text);
		if (hidden !== void 0) {
			findings.push({
				rule: CHARSET_SMUGGLING_RULE,
				severity: "HIGH",
				category: "obfuscation",
				description: `藏了一段要再解一次码才读得出来的内容（${hidden.recovery}）`,
				path: file.path,
				recovery: hidden.recovery
			});
			collect(file.path, hidden.text, hidden.recovery, findings);
		}
	}
	const severity = highestSeverity(findings);
	return {
		findings,
		scanned,
		skipped,
		...severity === void 0 ? {} : { severity },
		score: scoreOf(findings),
		categories: categoriesOf(findings)
	};
}
/**
* 八个检测面。顺序固定，界面按这个顺序摆。
*
* 就是规则表里出现过的那些 `category`，外加字符集夹带落在的 `obfuscation`。
* 写成一张明表而不是从规则表里现算：这一格摆在界面上是「查了哪几方面」，
* 少一条规则不该让某一面整个消失。
*/
const SCAN_CATEGORIES = [
	"remote-payload",
	"credential-access",
	"reconnaissance",
	"prompt-injection",
	"remote-control",
	"obfuscation",
	"data-exfiltration",
	"persistence"
];
/**
* 每个检测面上命中了什么。
*
* @param findings - 命中。
* @returns 八个检测面的结论，没命中的也在里面。
*/
function categoriesOf(findings) {
	return SCAN_CATEGORIES.map((id) => {
		const mine = findings.filter((one) => one.category === id);
		const severity = highestSeverity(mine);
		return {
			id,
			hits: mine.length,
			...severity === void 0 ? {} : { severity }
		};
	});
}
/** 每一档扣多少分。 */
const SEVERITY_PENALTY = {
	CRITICAL: 30,
	HIGH: 18,
	MEDIUM: 8,
	LOW: 3,
	INFO: 1
};
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
function scoreOf(findings) {
	const worst = /* @__PURE__ */ new Map();
	for (const finding of findings) {
		const seen = worst.get(finding.rule);
		if (seen === void 0 || SEVERITY_ORDER.indexOf(finding.severity) < SEVERITY_ORDER.indexOf(seen)) worst.set(finding.rule, finding.severity);
	}
	let score = 100;
	for (const severity of worst.values()) score -= SEVERITY_PENALTY[severity];
	return Math.max(0, score);
}
/**
* 一批命中里最高的那一档。
*
* @param findings - 命中。
* @returns 最高严重度；一条都没有时 `undefined`。
*/
function highestSeverity(findings) {
	let best;
	for (const finding of findings) if (best === void 0 || SEVERITY_ORDER.indexOf(finding.severity) < SEVERITY_ORDER.indexOf(best)) best = finding.severity;
	return best;
}
/**
* 拿规则表匹一份文本。
*
* 先整份匹一次——跨行规则本来就跨行；命中之后再逐行找一遍，找得到就报行号。
*/
function collect(path, content, recovery, into) {
	let lines;
	for (const rule of RISK_RULES) {
		if (!rule.pattern.test(content)) continue;
		lines ??= content.split(/\r\n|[\r\n]/u);
		const line = firstMatchingLine(rule, lines);
		into.push({
			rule: rule.id,
			severity: rule.severity,
			category: rule.category,
			description: rule.description,
			path,
			...line === void 0 ? {} : { line },
			...recovery === void 0 ? {} : { recovery }
		});
	}
}
/** 第一条能单独匹上这条规则的行；跨行匹配定位不到时 `undefined`。 */
function firstMatchingLine(rule, lines) {
	for (const [index, line] of lines.entries()) if (rule.pattern.test(line)) return index + 1;
}
/** 控制字符占比超过这个数就当它不是文本。 */
const MAX_CONTROL_RATIO = .02;
/** 还原之后可读字符的占比至少要涨这么多，才算「本来就是藏起来的」。 */
const MIN_READABILITY_GAIN = .25;
/**
* 还原可逆乱码：盘上是合法 UTF-8，按 UTF-16 重新编码再当 UTF-8 解，却能解出
* 另一段读得通的文字——那多半是故意藏进去的。
*
* 包校验已经把非 UTF-8 的文本文件挡在外面了，这是剩下的那条字符集夹带通道。
*
* @param stored - 盘上那份文本。
* @returns 还原结果；不是可逆乱码时 `undefined`。
*/
function recoverMojibake(stored) {
	if (stored === "" || isAscii(stored)) return void 0;
	const suspicious = hasFormatOrPrivateUse(stored);
	for (const source of ["utf-16le", "utf-16be"]) {
		const recovered = reinterpret(stored, source);
		if (recovered === void 0 || recovered === stored || recovered.trim() === "") continue;
		if (!isLikelyText(recovered)) continue;
		if (suspicious || asciiRatio(recovered) - asciiRatio(stored) >= MIN_READABILITY_GAIN) return {
			text: recovered,
			recovery: `${source} -> utf-8`
		};
	}
}
/**
* 按 `source` 重新编码，再当 UTF-8 解。
*
* 两头都要求严格：编码不下的、解不出来的都直接放弃，而不是拿替换字符糊过去——
* 糊过去会把一份普通文件解成一堆问号，然后被当成「藏了东西」。
*/
function reinterpret(stored, source) {
	const units = new Uint8Array(stored.length * 2);
	for (let index = 0; index < stored.length; index += 1) {
		const code = stored.charCodeAt(index);
		if (code >= 55296 && code <= 57343 && !isPaired(stored, index)) return void 0;
		const high = code >> 8;
		const low = code & 255;
		if (source === "utf-16le") {
			units[index * 2] = low;
			units[index * 2 + 1] = high;
		} else {
			units[index * 2] = high;
			units[index * 2 + 1] = low;
		}
	}
	return decodeStrict(units);
}
const utf8 = new TextDecoder("utf-8", { fatal: true });
/**
* 严格解一段 UTF-8。
*
* 不能拿 `decodeText` 代替：那一版先挡 NUL 字节（技能包里的图片、字体都靠这个
* 判出来），而 UTF-16 编码出来的 ASCII 字符正好每隔一个字节就是 0x00——用它
* 的话这条通道永远探不出东西来。
*/
function decodeStrict(data) {
	try {
		return utf8.decode(data);
	} catch {
		return;
	}
}
/** 这个位置上的代理项有没有配对。 */
function isPaired(text, index) {
	const code = text.charCodeAt(index);
	if (code >= 55296 && code <= 56319) {
		const next = text.charCodeAt(index + 1);
		return next >= 56320 && next <= 57343;
	}
	const previous = text.charCodeAt(index - 1);
	return previous >= 55296 && previous <= 56319;
}
/**
* 这段东西读起来像不像文本：控制字符、代理项、未分配码点合起来不超过 2%，
* 制表符与换行不算。
*
* @param text - 待判断的文本。
* @returns 像文本就是 true。
*/
function isLikelyText(text) {
	if (text === "") return true;
	let total = 0;
	let controls = 0;
	for (const char of text) {
		total += 1;
		if (char === "\n" || char === "\r" || char === "	") continue;
		if (isControlLike(char)) controls += 1;
	}
	return controls / total <= MAX_CONTROL_RATIO;
}
/** 控制字符或落单代理项。 */
function isControlLike(char) {
	const code = char.codePointAt(0) ?? 0;
	if (code < 32 || code >= 127 && code <= 159) return true;
	return code >= 55296 && code <= 57343;
}
/** 可打印 ASCII 的占比。 */
function asciiRatio(text) {
	if (text === "") return 0;
	let total = 0;
	let readable = 0;
	for (const char of text) {
		total += 1;
		const code = char.codePointAt(0) ?? 0;
		if (code === 10 || code === 13 || code === 9 || code >= 32 && code <= 126) readable += 1;
	}
	return readable / total;
}
/** 全是 ASCII。 */
function isAscii(text) {
	for (const char of text) if ((char.codePointAt(0) ?? 0) >= 128) return false;
	return true;
}
/** 带格式控制符或私用区码点。这两类正常文档里几乎不会出现。 */
function hasFormatOrPrivateUse(text) {
	for (const char of text) {
		const code = char.codePointAt(0) ?? 0;
		if (code === 173 || code >= 8203 && code <= 8207 || code >= 8234 && code <= 8238 || code >= 8288 && code <= 8292 || code === 65279 || code >= 57344 && code <= 63743 || code >= 983040 && code <= 1114109) return true;
	}
	return false;
}
//#endregion
//#region .tsbuild/skill/remote.js
/**
* 技能域的 Remote 半边：把本机技能与技能市场送到浏览器。
*
* 与 `workbench_skill` 工具的分工同员工域：工具是给模型的，带确认语义与
* 给模型看的文本；这里是给界面的，只送结构化数据。两边共用
* {@link module:@staff-os/dsh-workbench/skill/view} 那一份投影，界面上的技能
* 与模型看到的技能不会各说各话。
*
* 四件事界面必须照实显示，所以在这里一并送出去：
*
* - **`shadowed`**：盘上有这份技能，但同名的更高优先级来源盖住了它。此时改
*   它不会有任何效果。
* - **`managed`**：只有用户级目录（`$DSH_HOME/skills/`）里的技能本插件才改得
*   动。项目级与随插件发布的技能在界面上只读，与工具那边同一条规则。
* - **`rejected`**：盘上有这份文件，但 DSH 会因为 frontmatter 不合规而整份丢弃。
*   不列出来的话，「我装了却怎么都调不到」没有任何线索——DSH 那边只有一行
*   日志警告。
* - **`activation`**：写完之后回读一次得到的真实结论，而不是一句预测。
*
* 关于「什么时候生效」：不是重启，是下一个模型回合。理由与做法见
* {@link module:@staff-os/dsh-workbench/skill/activation}。
*
* @module @staff-os/dsh-workbench/skill/remote
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/**
* 列出生效的那一份技能所在目录里的全部文件。
*
* 有一处不能想当然：`SkillView.path` 在两条投影里指的**不是同一种东西**——
* `projectLocal` 给的是 `<dir>/SKILL.md`，而 `projectWinner` 给的是
* `resourceBase` 那个**目录**。所以这里不看 `path`，直接收 `resourceBase`。
*
* 还有一处：扁平形技能（`<name>.md`）的 `resourceBase` 给的是**技能根**，
* 照着列会把根下每一个技能的文件都算成这一个的。所以只有目录里确实有
* SKILL.md 才当技能目录列，否则退回盘上那一份自己报的路径。
*
* @param dir - `resourceBase` 给的目录；来源不是目录形时 undefined。
* @param local - 盘上那一份，用来兜底。
* @returns 目录内文件，含 SKILL.md。
*/
async function filesOfSkill(dir, local) {
	if (dir !== void 0 && await isSkillDir(dir)) return listSkillFiles(dir);
	return local === void 0 ? [] : filesOfLocal(local);
}
/** 盘上那一份技能的文件清单。 */
async function filesOfLocal(local) {
	if (!local.flat) return listSkillFiles(dirname(local.path));
	const name = local.path.split(/[\/]/u).pop();
	return name === void 0 ? [] : [{
		path: name,
		size: await fileSize(local.path)
	}];
}
/** 这个目录是不是一个技能目录（底下有 SKILL.md）。 */
async function isSkillDir(dir) {
	try {
		return (await stat(join(dir, SKILL_FILE))).isFile();
	} catch {
		return false;
	}
}
/** 一个文件的字节数；读不到按 0 记，不让详情页整个塌掉。 */
async function fileSize(path) {
	try {
		return (await stat(path)).size;
	} catch {
		return 0;
	}
}
/**
* 把技能目录里该扫的文件读成字节。
*
* 只读扩展名认得出的文本、且不超过 {@link MAX_SCAN_BYTES} 的那些——剩下的
* 交给 {@link scanFiles} 也是跳过，但那时已经把几十 MB 读进内存了。读不到的
* 文件直接略过：一次扫描不该因为某个文件权限不对就整个失败。
*/
async function readScanInputs(dir, entries) {
	const inputs = [];
	for (const entry of entries) {
		if (!isScannableTextFile(entry.path) || entry.size > 524288) continue;
		try {
			inputs.push({
				path: entry.path,
				data: await readFile(join(dir, entry.path))
			});
		} catch {
			continue;
		}
	}
	return inputs;
}
/**
* 缓存一个市场包最多占多少内存。
*
* 这份东西一直留到下一次预览把它换掉，所以上限按「技能包该有的大小」定，
* 而不是按解包上限。真有超过这个数的包，代价只是点开文件时重下一次。
*/
const MAX_CACHED_PACKAGE_BYTES = 8388608;
/** 一个市场包的坐标，用来判断缓存里那份是不是同一个。 */
function packageKey(slug, version, registry, owner) {
	return JSON.stringify([
		registry ?? "",
		owner ?? "",
		slug,
		version ?? "latest"
	]);
}
/** 文件清单的排序权重：SKILL.md 排最前，它是这个包的入口。 */
function rank(path) {
	return path === "SKILL.md" ? 0 : 1;
}
/**
* 技能域的 Remote 服务。注册为 `ctx.workbenchSkill`。
*/
let WorkbenchSkillGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _list_decorators;
	let _read_decorators;
	let _readFile_decorators;
	let _create_decorators;
	let _visibility_decorators;
	let _delete_decorators;
	let _marketSearch_decorators;
	let _marketLabels_decorators;
	let _marketGet_decorators;
	let _marketPreview_decorators;
	let _marketFile_decorators;
	let _scan_decorators;
	let _marketScan_decorators;
	let _marketInstall_decorators;
	let _importPackage_decorators;
	let _marketUpdateAll_decorators;
	let _updates_decorators;
	let _marketUpdate_decorators;
	let _marketConfigRead_decorators;
	let _marketConfigWrite_decorators;
	return class WorkbenchSkillGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_list_decorators = [Remote("list")];
			_read_decorators = [Remote("read")];
			_readFile_decorators = [Remote("readFile")];
			_create_decorators = [Remote("create")];
			_visibility_decorators = [Remote("visibility")];
			_delete_decorators = [Remote("delete")];
			_marketSearch_decorators = [Remote("marketSearch")];
			_marketLabels_decorators = [Remote("marketLabels")];
			_marketGet_decorators = [Remote("marketGet")];
			_marketPreview_decorators = [Remote("marketPreview")];
			_marketFile_decorators = [Remote("marketFile")];
			_scan_decorators = [Remote("scan")];
			_marketScan_decorators = [Remote("marketScan")];
			_marketInstall_decorators = [Remote("marketInstall")];
			_importPackage_decorators = [Remote("importPackage")];
			_marketUpdateAll_decorators = [Remote("marketUpdateAll")];
			_updates_decorators = [Remote("updates")];
			_marketUpdate_decorators = [Remote("marketUpdate")];
			_marketConfigRead_decorators = [Remote("marketConfigRead")];
			_marketConfigWrite_decorators = [Remote("marketConfigWrite")];
			__esDecorate(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _read_decorators, {
				kind: "method",
				name: "read",
				static: false,
				private: false,
				access: {
					has: (obj) => "read" in obj,
					get: (obj) => obj.read
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _readFile_decorators, {
				kind: "method",
				name: "readFile",
				static: false,
				private: false,
				access: {
					has: (obj) => "readFile" in obj,
					get: (obj) => obj.readFile
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _create_decorators, {
				kind: "method",
				name: "create",
				static: false,
				private: false,
				access: {
					has: (obj) => "create" in obj,
					get: (obj) => obj.create
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _visibility_decorators, {
				kind: "method",
				name: "visibility",
				static: false,
				private: false,
				access: {
					has: (obj) => "visibility" in obj,
					get: (obj) => obj.visibility
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _delete_decorators, {
				kind: "method",
				name: "delete",
				static: false,
				private: false,
				access: {
					has: (obj) => "delete" in obj,
					get: (obj) => obj.delete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketSearch_decorators, {
				kind: "method",
				name: "marketSearch",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketSearch" in obj,
					get: (obj) => obj.marketSearch
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketLabels_decorators, {
				kind: "method",
				name: "marketLabels",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketLabels" in obj,
					get: (obj) => obj.marketLabels
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketGet_decorators, {
				kind: "method",
				name: "marketGet",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketGet" in obj,
					get: (obj) => obj.marketGet
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketPreview_decorators, {
				kind: "method",
				name: "marketPreview",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketPreview" in obj,
					get: (obj) => obj.marketPreview
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketFile_decorators, {
				kind: "method",
				name: "marketFile",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketFile" in obj,
					get: (obj) => obj.marketFile
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _scan_decorators, {
				kind: "method",
				name: "scan",
				static: false,
				private: false,
				access: {
					has: (obj) => "scan" in obj,
					get: (obj) => obj.scan
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketScan_decorators, {
				kind: "method",
				name: "marketScan",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketScan" in obj,
					get: (obj) => obj.marketScan
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketInstall_decorators, {
				kind: "method",
				name: "marketInstall",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketInstall" in obj,
					get: (obj) => obj.marketInstall
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _importPackage_decorators, {
				kind: "method",
				name: "importPackage",
				static: false,
				private: false,
				access: {
					has: (obj) => "importPackage" in obj,
					get: (obj) => obj.importPackage
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketUpdateAll_decorators, {
				kind: "method",
				name: "marketUpdateAll",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketUpdateAll" in obj,
					get: (obj) => obj.marketUpdateAll
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _updates_decorators, {
				kind: "method",
				name: "updates",
				static: false,
				private: false,
				access: {
					has: (obj) => "updates" in obj,
					get: (obj) => obj.updates
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketUpdate_decorators, {
				kind: "method",
				name: "marketUpdate",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketUpdate" in obj,
					get: (obj) => obj.marketUpdate
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketConfigRead_decorators, {
				kind: "method",
				name: "marketConfigRead",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketConfigRead" in obj,
					get: (obj) => obj.marketConfigRead
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _marketConfigWrite_decorators, {
				kind: "method",
				name: "marketConfigWrite",
				static: false,
				private: false,
				access: {
					has: (obj) => "marketConfigWrite" in obj,
					get: (obj) => obj.marketConfigWrite
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["workbench"];
		constructor(ctx) {
			super(ctx, "workbenchSkill");
		}
		/**
		* 读出全部技能与已配置的市场源。
		* @returns 技能快照。
		*/
		async list() {
			return this.snapshot();
		}
		/**
		* 读一个技能的正文。
		*
		* 优先读实际生效的那份（`ctx.skills`），因为人想看的是「模型现在读到的是
		* 什么」。盘上那份被遮蔽时会一并说明。
		* @param name - 技能名。
		* @returns 技能投影与正文。
		*/
		async read(name) {
			const root = this.root();
			const definition = await this.ctx.get("skills")?.get(name);
			const local = await readLocalSkill(root, name);
			if (definition !== void 0) {
				const isLocal = winnerIsLocal(definition, root);
				return {
					skill: projectWinner(definition, isLocal),
					content: definition.content,
					files: await filesOfSkill(definition.resourceBase?.kind === "directory" ? definition.resourceBase.path : void 0, isLocal ? local : void 0),
					...isLocal || local === void 0 ? {} : { note: `当前生效的是 ${definition.source} 的版本，本地那份被遮蔽` }
				};
			}
			if (local === void 0) throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
			const note = detailNote(await this.activation()?.verify(name, root));
			return {
				skill: projectLocal(local, false),
				content: local.content,
				files: await filesOfLocal(local),
				...note === void 0 ? {} : { note }
			};
		}
		/**
		* 读技能目录里某一个文件的内容，给详情页的文件预览用。
		*
		* 目录取的与 {@link read} 一样是**生效的那一份**所在的目录，所以随部署发布的
		* 技能里的文件也看得到。`path` 必须是技能目录**里面**的相对路径：
		* `assertSafeEntryPath` 先挡掉 `..` 与绝对路径，落到盘上之后再核一遍解析结果
		* 确实还在目录底下——只做前一道的话，一个精心构造的 path 仍可能靠平台差异
		* 绕出去。
		*
		* @param name - 技能名。
		* @param path - 相对技能目录的路径。
		* @returns 文件内容；二进制只报体积，过大的截断。
		*/
		async readFile(name, path) {
			const root = this.root();
			const definition = await this.ctx.get("skills")?.get(name);
			const local = await readLocalSkill(root, name);
			const base = definition?.resourceBase;
			const dir = base !== void 0 && base.kind === "directory" && await isSkillDir(base.path) ? base.path : local !== void 0 && !local.flat ? dirname(local.path) : void 0;
			if (dir === void 0) {
				if (local !== void 0 && local.flat && basename(local.path) === path) return readFileContent(local.path, path);
				throw new WorkbenchError(`技能 "${name}" 里没有 "${path}"`, "WORKBENCH_SKILL_NOT_FOUND");
			}
			return readFileContent(resolveInsideSkill(dir, path), path);
		}
		/**
		* 新建一个本地技能。
		* @param input - 技能字段；`description` 要写清什么情况下该用它。
		* @returns 新建的技能与刷新后的快照。
		*/
		async create(input) {
			const name = input.name.trim();
			const skill = await createLocalSkill(this.root(), {
				name,
				description: input.description.trim(),
				...input.whenToUse === void 0 ? {} : { whenToUse: input.whenToUse.trim() },
				...input.content === void 0 ? {} : { content: input.content },
				...input.modelInvocable === void 0 ? {} : { modelInvocable: input.modelInvocable },
				...input.userInvocable === void 0 ? {} : { userInvocable: input.userInvocable }
			});
			return this.mutated(projectLocal(skill, false), `已创建技能 "${name}"`, name);
		}
		/**
		* 改一个技能的可见性。
		* @param name - 技能名。
		* @param visibility - 至少给 `modelInvocable` 与 `userInvocable` 其中一个。
		* @returns 改完的技能与刷新后的快照。
		*/
		async visibility(name, visibility) {
			if (visibility.modelInvocable === void 0 && visibility.userInvocable === void 0) throw new WorkbenchError("改可见性至少要给 modelInvocable 或 userInvocable 其中一个", "WORKBENCH_MISSING_ARG");
			const skill = await setSkillVisibility(this.root(), name, {
				...visibility.modelInvocable === void 0 ? {} : { modelInvocable: visibility.modelInvocable },
				...visibility.userInvocable === void 0 ? {} : { userInvocable: visibility.userInvocable }
			});
			return this.mutated(projectLocal(skill, false), `已更新技能 "${name}" 的可见性`, name);
		}
		/**
		* 删掉一个本地技能。
		*
		* 不可逆，且这里不再问一遍：点删除的是人，确认在界面上已经发生过了。
		* @param name - 技能名。
		* @returns 删除后的快照。
		*/
		async delete(name) {
			await removeLocalSkill(this.root(), name);
			await forgetInstall(this.runtime().paths.workbench, name);
			this.activation()?.notifyChanged();
			return {
				message: `已删除技能 "${name}"`,
				snapshot: await this.snapshot()
			};
		}
		/**
		* 在已配置的市场源里搜索。
		* @param keyword - 关键词；留空则按 `sort` 指定的榜单浏览。
		* @param page - 1 起的页码。
		* @param sort - 浏览时的榜单：`hot` `featured` `newest` `recommended` `trending` `paid`。
		* @returns 这一页的条目。
		*/
		async marketSearch(keyword, page, sort, label, labelRegistry) {
			const slug = label?.trim() ?? "";
			const registry = labelRegistry?.trim() ?? "";
			const result = await this.runtime().registry.search({
				...keyword === void 0 || keyword.trim() === "" ? {} : { keyword: keyword.trim() },
				...page === void 0 ? {} : { page },
				...sort === void 0 || sort.trim() === "" ? {} : { sort: sort.trim() },
				...slug === "" || registry === "" ? {} : { label: {
					slug,
					registry
				} }
			});
			return {
				items: result.items.map(projectMarket),
				fromCache: result.fromCache
			};
		}
		/**
		* 列出各市场源提供的标签。
		*
		* 尽力而为：只有 SkillHub 那套 `/api/web/labels` 提供得了，ClawHub 上没有
		* 这个端点。空数组说明配置的源都没有标签，界面据此不摆那条分组栏，而不是
		* 摆一条空的。
		*
		* @returns 各源的标签，每条带着自己来自哪个源。
		*/
		async marketLabels() {
			return this.runtime().registry.listLabels();
		}
		/**
		* 读一个市场条目的详情。
		*
		* 比列表多出来的是安全审核结论与完整描述。技能装上去就是模型会照着执行的
		* 指令，上游既然审了，安装前就该看得见。
		* @param slug - 市场里的标识。
		* @param registry - 指定源；留空按配置顺序找第一个命中的。
		* @returns 条目详情。
		*/
		async marketGet(slug, registry) {
			const item = await this.runtime().registry.get(slug, registry);
			if (item === void 0) throw new WorkbenchError(`市场里没有 "${slug}"`, "WORKBENCH_REGISTRY_NOT_FOUND");
			return projectMarket(item);
		}
		/**
		* 读一个市场条目的包内容：正文与文件清单。
		*
		* 走的是**下载**那条路，而不是某家市场的文件浏览接口。SkillHub 有一组
		* `/api/web/skills/.../files` 端点，但它不在 ClawHub 兼容契约里——同样的
		* 路径在 clawhub.ai 上是 404。下载端点则是安装本来就要走的那一个，所以
		* 这里列出来的东西与「装上去会得到什么」逐字一致，而不是另一份可能对不上
		* 的目录。
		*
		* 代价是要把包整个取回来。技能包通常几十 KB，最大的也就几百 KB，而且字节
		* 不出宿主——送到浏览器的只有路径、大小和一份 SKILL.md 正文。
		*
		* **取不到不算错误**：镜像条目没有包，转发到 GitHub 的条目也没有，源不可达
		* 更是常事。这些情况下 `files` 是空的、`note` 说清为什么，界面照实显示，
		* 而不是弹一个失败——人只是想看看这个技能是什么，不是在装它。
		*
		* @param slug - 市场里的标识。
		* @param version - 版本；留空取最新。
		* @param registry - 指定源；留空按配置顺序找第一个命中的。
		* @param owner - 发布者 handle，用来消解同名 slug。
		* @returns 包内容；取不到时是一份带 `note` 的空清单。
		*/
		async marketPreview(slug, version, registry, owner) {
			let downloaded;
			try {
				downloaded = await this.runtime().registry.download(slug, version, registry, void 0, owner);
			} catch (error) {
				return {
					files: [],
					note: error instanceof Error ? error.message : String(error)
				};
			}
			this.remember(packageKey(slug, version, registry, owner), downloaded.files);
			const files = [...downloaded.files].map((file) => ({
				path: file.path,
				size: packageFileBytes(file)
			})).sort((left, right) => rank(left.path) - rank(right.path) || left.path.localeCompare(right.path));
			try {
				const found = findSkillsInPackage(downloaded.files);
				const primary = found.find((entry) => entry.parsed.name === slug) ?? found[0];
				return {
					files,
					...primary === void 0 ? {} : { content: primary.parsed.content },
					...primary === void 0 ? { note: `包里没有找到 ${SKILL_FILE}` } : {}
				};
			} catch (error) {
				return {
					files,
					note: error instanceof Error ? error.message : String(error)
				};
			}
		}
		/**
		* 读一个市场条目包里某一个文件的内容。
		*
		* 包本身是 {@link marketPreview} 刚取回来的那一份——文件树上点一个文件，
		* 内容不该再让人等一次整包下载。缓存只留一份、按坐标比对，对不上就重新取；
		* 见 {@link remember}。
		*
		* @param slug - 市场里的标识。
		* @param version - 版本；留空取最新。
		* @param registry - 指定源。
		* @param owner - 发布者 handle。
		* @param path - 包内相对路径。
		* @returns 文件内容；二进制只报体积，过大的截断。
		*/
		async marketFile(slug, version, registry, owner, path) {
			const wanted = path?.trim() ?? "";
			if (wanted === "") throw new WorkbenchError("要读哪个文件？path 是空的", "WORKBENCH_MISSING_ARG");
			const key = packageKey(slug, version, registry, owner);
			let files = this.cached?.key === key ? this.cached.files : void 0;
			if (files === void 0) {
				files = (await this.runtime().registry.download(slug, version, registry, void 0, owner)).files;
				this.remember(key, files);
			}
			const file = files.find((entry) => entry.path === wanted);
			if (file === void 0) throw new WorkbenchError(`包里没有 "${wanted}"`, "WORKBENCH_SKILL_NOT_FOUND");
			return fileContentOf(wanted, packageFileBytes(file), (typeof file.content === "string" ? Buffer.from(file.content, "utf8") : Buffer.from(file.content)).subarray(0, MAX_PREVIEW_BYTES));
		}
		/**
		* 扫一个本机技能：装完之后再看一眼盘上这一份。
		*
		* 扫的是**盘上真实存在的那些字节**，不是市场详情页上那份预览——两者本该
		* 一样，但「本该一样」正是值得复核的地方。
		*
		* @param name - 技能名。
		* @returns 扫描结果。
		*/
		async scan(name) {
			const root = this.root();
			const definition = await this.ctx.get("skills")?.get(name);
			const local = await readLocalSkill(root, name);
			const dir = definition?.resourceBase?.kind === "directory" && await isSkillDir(definition.resourceBase.path) ? definition.resourceBase.path : local === void 0 ? void 0 : local.flat ? void 0 : dirname(local.path);
			if (dir === void 0) {
				if (local === void 0) throw new WorkbenchError(`技能 "${name}" 不存在`, "WORKBENCH_SKILL_NOT_FOUND");
				return scanFiles(await readScanInputs(dirname(local.path), [{
					path: basename(local.path),
					size: 0
				}]));
			}
			return scanFiles(await readScanInputs(dir, await listSkillFiles(dir)));
		}
		/**
		* 扫一个市场条目：装之前先看一眼这个包里有什么。
		*
		* 用的是 {@link marketPreview} 刚取回来的那一份包，与文件树、正文预览同一份
		* 字节——扫出来的东西和点开文件看到的东西必须对得上，否则这一页没有意义。
		*
		* @param slug - 市场里的标识。
		* @param version - 版本；留空取最新。
		* @param registry - 指定源。
		* @param owner - 发布者 handle。
		* @returns 扫描结果。
		*/
		async marketScan(slug, version, registry, owner) {
			const key = packageKey(slug, version, registry, owner);
			let files = this.cached?.key === key ? this.cached.files : void 0;
			if (files === void 0) {
				files = (await this.runtime().registry.download(slug, version, registry, void 0, owner)).files;
				this.remember(key, files);
			}
			return scanFiles(files.map((file) => ({
				path: file.path,
				data: typeof file.content === "string" ? Buffer.from(file.content, "utf8") : file.content
			})));
		}
		/**
		* 从市场装一个技能。
		* @param slug - 市场里的标识。
		* @param version - 版本；留空取最新。
		* @param registry - 指定源；留空按配置顺序找第一个命中的。
		* @param overwrite - 同名已存在时是否覆盖。
		* @param owner - 发布者 handle。ClawHub 上同名 slug 归不同发布者是常态，
		*   不给的话客户端会先查一次详情去补；市场列表里已经有这个字段，直接带上更快。
		* @returns 装好的技能与刷新后的快照。
		*/
		async marketInstall(slug, version, registry, overwrite, owner) {
			const runtime = this.runtime();
			const downloaded = await runtime.registry.download(slug, version, registry, void 0, owner);
			const picked = selectSkillFromPackage(downloaded.files);
			const result = await installSkillFiles({
				root: this.root(),
				stagingParent: runtime.paths.skillStaging
			}, picked.files, { overwrite: overwrite === true });
			await recordInstall(runtime.paths.workbench, {
				name: result.installedAs,
				registry: downloaded.source.id,
				slug,
				...downloaded.owner === void 0 ? {} : { owner: downloaded.owner },
				version: downloaded.version,
				installedAt: Date.now()
			});
			const resources = result.fileCount - 1;
			return this.mutated(projectLocal(result.skill, false), `已${result.replaced ? "覆盖安装" : "安装"}技能 "${result.installedAs}"（来自 ${downloaded.source.name} v${downloaded.version}${resources > 0 ? `，含 ${String(resources)} 个资源文件` : ""}${result.binaryCount > 0 ? `，其中 ${String(result.binaryCount)} 个二进制` : ""}）`, result.installedAs);
		}
		/**
		* 装一个用户从浏览器上传的技能压缩包。
		*
		* 与市场安装的区别只有来源：包字节是随调用一起传上来的，不是下载的。
		* 因此**不记安装台账**——手上传的包没有 registry 坐标，记一条假的进去，
		* 之后的更新检查会拿技能名去市场里碰一个同名条目，用一个不相干的包
		* 覆盖掉用户自己的东西。手上传的技能就是没有「更新」这回事。
		*
		* 包里可能不止一个技能，也可能技能不在包根；定位与落盘复用与市场安装
		* 完全相同的两步，所以解包安全检查（路径穿越、条目数、体积）也是同一套。
		*
		* @param fileName - 原始文件名，只用于报错与日志，不参与落盘路径。
		* @param contentBase64 - 压缩包字节的 base64。
		* @param overwrite - 同名已存在时是否覆盖。
		* @param name - 包里有多个技能时指定装哪一个。
		* @returns 装好的技能与刷新后的快照。
		*/
		async importPackage(fileName, contentBase64, overwrite, name) {
			const label = fileName.trim() === "" ? "上传的压缩包" : fileName.trim();
			const picked = selectSkillFromPackage(await readPackageBytes(decodeUploadedPackage(contentBase64, label), label), name);
			const result = await installSkillFiles({
				root: this.root(),
				stagingParent: this.runtime().paths.skillStaging
			}, picked.files, { overwrite: overwrite === true });
			const resources = result.fileCount - 1;
			return this.mutated(projectLocal(result.skill, false), `已${result.replaced ? "覆盖安装" : "安装"}技能 "${result.installedAs}"（来自上传的 ${label}${resources > 0 ? `，含 ${String(resources)} 个资源文件` : ""}${result.binaryCount > 0 ? `，其中 ${String(result.binaryCount)} 个二进制` : ""}）`, result.installedAs);
		}
		/**
		* 查哪些已装技能有新版本。
		*
		* 只查台账里有记录的那些：手写的技能没有「上游最新版」这个概念，
		* 拿技能名去市场里碰运气搜一个同名条目再报「有更新」，是在拿一个
		* 不相干的包冒充它的新版。
		*
		* 单个条目查失败不影响其余：市场限流或某个 slug 被下架时，
		* 其余技能的更新状态照常给出，失败的那条带上原因。
		* @returns 每个有台账记录的技能的更新状态。
		*/
		/**
		* 把所有有新版本的已装技能一次更新完。
		*
		* 一条失败不拖累其余：技能之间互不相干，其中一个的源临时不可达，没有理由
		* 让另外五个也停在原地。做完之后把成功与失败**分别**说清——只报一句
		* 「已更新 N 个」而把失败的咽下去，人会以为全都更新了。
		*
		* 只动台账里记着来源的那些。手写的技能没有上游，拿它的名字去市场碰一个
		* 同名条目装上来，是用一个不相干的包覆盖掉人自己写的东西。
		*
		* @returns 一句汇总说明与刷新后的快照。
		*/
		async marketUpdateAll() {
			const outdated = (await this.updates()).filter((status) => status.outdated);
			if (outdated.length === 0) return {
				message: "没有需要更新的技能",
				snapshot: await this.snapshot()
			};
			const done = [];
			const failed = [];
			for (const status of outdated) try {
				await this.marketUpdate(status.name);
				done.push(`${status.name} → v${status.latest ?? "?"}`);
			} catch (error) {
				failed.push(`${status.name}（${error instanceof Error ? error.message : String(error)}）`);
			}
			return {
				message: [done.length === 0 ? void 0 : `已更新 ${String(done.length)} 个：${done.join("、")}`, failed.length === 0 ? void 0 : `${String(failed.length)} 个没更新成：${failed.join("；")}`].filter((part) => part !== void 0).join("。"),
				snapshot: await this.snapshot()
			};
		}
		async updates() {
			const ledger = await readLedger(this.runtime().paths.workbench);
			if (ledger.size === 0) return [];
			const present = new Set((await scanLocalSkills(this.root())).skills.map((skill) => skill.name));
			const alive = [...ledger.values()].filter((origin) => present.has(origin.name));
			return Promise.all(alive.map(async (origin) => this.updateStatusOf(origin)));
		}
		/** 查一个技能的更新状态。 */
		async updateStatusOf(origin) {
			const source = this.runtime().registry.listSources().find((candidate) => candidate.id === origin.registry);
			if (source === void 0) return {
				name: origin.name,
				installed: origin.version,
				outdated: false,
				origin,
				error: `装它的源 "${origin.registry}" 现在没有配置，查不了更新`
			};
			let latest;
			try {
				latest = await this.runtime().registry.latestVersion(source, origin.slug);
			} catch (error) {
				return {
					name: origin.name,
					installed: origin.version,
					outdated: false,
					origin,
					error: error instanceof Error ? error.message : String(error)
				};
			}
			return {
				name: origin.name,
				installed: origin.version,
				...latest === void 0 ? {} : { latest },
				outdated: latest !== void 0 && isNewerVersion(latest, origin.version),
				origin
			};
		}
		/**
		* 把一个已装技能更新到市场上的最新版。
		*
		* 与安装的差别只有两处：必须已经装过（否则这是「安装」，不是「更新」），
		* 以及一定覆盖。同名遮蔽照样可能发生，所以结论仍然来自回读。
		* @param name - 本机技能名。
		* @param slug - 市场标识；留空时用技能名当 slug。
		* @param registry - 指定源。
		* @returns 更新后的技能与刷新后的快照。
		*/
		async marketUpdate(name, slug, registry, owner) {
			const runtime = this.runtime();
			if (await readLocalSkill(this.root(), name) === void 0) throw new WorkbenchError(`技能 "${name}" 还没装在用户目录里，更新无从谈起；要装请用安装`, "WORKBENCH_SKILL_NOT_FOUND");
			const known = (await readLedger(runtime.paths.workbench)).get(name);
			const downloaded = await runtime.registry.download(slug ?? known?.slug ?? name, void 0, registry ?? known?.registry, void 0, owner ?? known?.owner);
			const picked = selectSkillFromPackage(downloaded.files, name);
			const result = await installSkillFiles({
				root: this.root(),
				stagingParent: runtime.paths.skillStaging
			}, picked.files, { overwrite: true });
			await recordInstall(runtime.paths.workbench, {
				name: result.installedAs,
				registry: downloaded.source.id,
				slug: slug ?? name,
				...downloaded.owner === void 0 ? {} : { owner: downloaded.owner },
				version: downloaded.version,
				installedAt: Date.now()
			});
			return this.mutated(projectLocal(result.skill, false), `已把技能 "${result.installedAs}" 更新到 ${downloaded.source.name} 的 v${downloaded.version}`, result.installedAs);
		}
		/** 当前生效的市场源列表。 */
		async registrySources() {
			return this.runtime().loadRegistrySources();
		}
		/**
		* 读出市场配置。
		*
		* 返回的是当前生效的源列表：优先运行时配置文件（用户在界面上配的那些），
		* 回退到静态配置（Cordis 配置或出厂那一条）。
		* @returns 当前生效的市场源列表。
		*/
		async marketConfigRead() {
			return (await this.registrySources()).map((source) => ({
				id: source.id,
				name: source.name,
				url: source.url,
				flavor: source.flavor ?? "clawhub",
				...source.apiKeyEnv === void 0 || source.apiKeyEnv === "" ? {} : { apiKeyEnv: source.apiKeyEnv }
			}));
		}
		/**
		* 写入市场配置。
		*
		* 整份替换，而不是增量改：市场源少且每次改动都要整体校验，增量格式只会
		* 让「删到最后一个时报 id 不存在」这类边角情况变多。写完立刻生效，不必重启。
		* @param sources - 要设成哪些源；空数组表示清空，会回退到出厂那条。
		*/
		async marketConfigWrite(sources) {
			const cleaned = sources.filter((s) => s.id.trim() !== "" && s.url.trim() !== "").map((s, index) => ({
				id: s.id.trim(),
				name: s.name.trim() === "" ? s.id.trim() : s.name.trim(),
				url: s.url.trim(),
				...s.flavor === void 0 || s.flavor === "" ? {} : { flavor: s.flavor },
				...s.apiKeyEnv === void 0 || s.apiKeyEnv.trim() === "" ? {} : { apiKeyEnv: s.apiKeyEnv.trim() },
				...s.id.trim() === "" ? { id: `source-${String(index)}` } : {}
			}));
			await writeMarketConfig(this.runtime().paths.workbench, cleaned);
			await this.runtime().applyRegistrySources(cleaned);
			return cleaned.map((source) => ({
				id: source.id,
				name: source.name,
				url: source.url,
				flavor: source.flavor ?? "clawhub",
				...source.apiKeyEnv === void 0 || source.apiKeyEnv === "" ? {} : { apiKeyEnv: source.apiKeyEnv }
			}));
		}
		/** 当前的完整快照。 */
		async snapshot() {
			const root = this.root();
			const [skills, scan, sources] = await Promise.all([
				collectSkills(this.ctx, root),
				scanLocalSkills(root),
				this.registrySources()
			]);
			return {
				skills,
				rejected: scan.rejected.map(projectRejected),
				registries: sources.map((source) => ({
					id: source.id,
					name: source.name,
					url: source.url,
					flavor: source.flavor ?? "clawhub"
				})),
				hasRegistry: this.ctx.get("skills") !== void 0
			};
		}
		/**
		* 一次写操作之后：让 DSH 重新发现，回读确认，再连快照一起交出去。
		*
		* 回读那一下是这里的重点。写盘成功只说明文件在盘上；它有没有真的被 DSH
		* 收下、是不是被同名的更高优先级来源盖住了，只有查一次才知道。
		*/
		async mutated(skill, message, name) {
			const activation = this.activation();
			activation?.notifyChanged();
			const state = await activation?.verify(name, this.root());
			return {
				skill,
				message,
				...state === void 0 ? {} : { activation: state },
				snapshot: await this.snapshot()
			};
		}
		/**
		* 上一次取回来的市场包，给「点开一个文件看看」用。
		*
		* 只留**一份**：人是顺着一个条目的文件树往下点的，再往前翻的很少，
		* 而多留几份就要认真管上限了。
		*/
		cached = __runInitializers(this, _instanceExtraInitializers);
		/**
		* 记住刚取回来的包。
		*
		* 太大的不留——这份东西会一直占着内存直到下一次预览把它换掉，而超过这个数
		* 的包在市场上本来就是异类，为它长期占住几十 MB 不划算。
		*/
		remember(key, files) {
			const total = files.reduce((sum, file) => sum + packageFileBytes(file), 0);
			this.cached = total > MAX_CACHED_PACKAGE_BYTES ? void 0 : {
				key,
				files
			};
		}
		/** 生效信号与验证；插件没装全时可能不在。 */
		activation() {
			return this.ctx.get("workbenchSkillActivation");
		}
		/** 本插件的运行时（目录布局与市场客户端）。 */
		runtime() {
			return this.ctx.workbench;
		}
		/** 用户级技能目录。 */
		root() {
			return this.runtime().paths.skills;
		}
	};
})();
//#endregion
//#region .tsbuild/plugin/ops.js
/**
* DSH 插件的装卸：一层薄薄的转发。
*
* `dsh plugin --profile <p> <args>` 本身就是个 pnpm 转发器——初始化 profile、
* 在 profile 目录里跑 pnpm、再按**安装后的实际状态**对账 `dsh.profile.bundles`。
* 这里直接调它，不自己碰 pnpm 也不自己改 bundles 清单：绕过去意味着要复刻
* 那套对账规则，而它们不一致时的表现是「装上了但没生效」，最难查。
*
* @module @staff-os/dsh-workbench/plugin/ops
*/
async function readManifest(path) {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch {
		return;
	}
}
/**
* 读一个 profile 当前装了什么。
*
* 依赖列表来自 profile 的 package.json，是否为插件则要看**装到盘上的那一份**
* 自己怎么声明——一个包可能在新版本里才加上 `dsh.bundle`，只看依赖名判断不出来。
*/
async function readProfilePlugins(profileDir) {
	const manifest = await readManifest(join(profileDir, "package.json"));
	if (manifest === void 0) throw new WorkbenchError(`profile 目录 ${profileDir} 还没初始化（没有 package.json）；先跑一次 dsh plugin 或启动一次该 profile`, "WORKBENCH_PROFILE_NOT_INITIALIZED");
	const dependencies = manifest.dependencies ?? {};
	const bundles = manifest.dsh?.profile?.bundles ?? [];
	const plugins = [];
	for (const [name, spec] of Object.entries(dependencies)) {
		const installed = await readManifest(join(profileDir, "node_modules", name, "package.json"));
		const description = installed?.description;
		plugins.push({
			name,
			spec,
			...installed?.version === void 0 ? {} : { version: installed.version },
			...description === void 0 ? {} : { description },
			isBundle: installed?.dsh?.bundle?.patch !== void 0,
			active: bundles.includes(name)
		});
	}
	plugins.sort((left, right) => left.name.localeCompare(right.name));
	return {
		plugins,
		builtIn: bundles.filter((name) => dependencies[name] === void 0)
	};
}
/**
* shell 会拿去拆命令的字符。
*
* 注意没有 `^`：它在 cmd 里是转义符，但在 Node 加的双引号里是字面量，
* 单独也开不出新命令；而 `^1.2.3` 是最常见的 npm 版本范围写法，
* 把它拒掉等于每一次带范围的安装都装不了。
*/
const UNSAFE_SPEC = /[&|;<>`$\r\n"']/u;
/**
* 挡下带 shell 元字符的包规格。
*
* Windows 上 `dsh` 是个 `.cmd` 垫片，只能由 cmd.exe 启动（见
* {@link spawnResolved}），而 cmd 会把命令行重新解一遍；这个规格又是模型
* 给的。合法的 npm 包名、版本号、git 地址与路径都用不到这些字符，
* 拒掉不会误伤，不拒则是把一条命令行交给了调用方。
*/
function assertSafeSpec(spec, field) {
	if (UNSAFE_SPEC.test(spec)) throw new WorkbenchError(`${field} 里含有不允许的字符（shell 元字符）：${spec}`, "WORKBENCH_PLUGIN_BAD_SPEC");
}
/**
* 在 PATH 上找出可执行文件的真实路径。
*
* 自己找而不是交给 spawn，是因为「命令不存在」在两个平台上表现完全不同：
* POSIX 给一个 ENOENT 错误事件，Windows 经 cmd 则是退出码 1 加一句英文
* “is not recognized as an internal or external command”。靠后者去猜，
* 等于把「dsh 没装」和「dsh 报错了」混成同一件事。先查一遍就都不用猜。
*
* @returns 可执行文件的绝对路径；找不到时 `undefined`。
*/
async function resolveExecutable(executable) {
	const extensions = process.platform === "win32" ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter((item) => item !== "") : [""];
	const candidates = /[/\\]/u.test(executable) ? [executable] : (process.env.PATH ?? "").split(process.platform === "win32" ? ";" : ":").filter((dir) => dir !== "").map((dir) => join(dir, executable));
	for (const candidate of candidates) for (const extension of ["", ...extensions]) {
		const path = `${candidate}${extension}`;
		try {
			await access(path, constants.X_OK);
			return path;
		} catch {}
	}
}
/**
* 起一个子进程，必要时经 cmd.exe。
*
* `.cmd` / `.bat` 垫片在 CVE-2024-27980 加固之后不能直接 spawn，只能由
* cmd.exe 代启。这里显式起 `cmd.exe /d /s /c` 而不是用 `shell: true`：
* 后者被 Node 标了 DEP0190——它把参数**直接拼接、完全不转义**，而显式
* 起 cmd 时参数仍走 Node 自己的 Windows 引号规则。真正的防线还是
* {@link assertSafeSpec}，这一步只是不再额外放大风险。
*/
function spawnResolved(path, args, cwd) {
	const options = {
		...cwd === void 0 ? {} : { cwd },
		windowsHide: true
	};
	if (process.platform === "win32" && /\.(?:cmd|bat)$/iu.test(path)) return spawn(process.env.ComSpec ?? "cmd.exe", [
		"/d",
		"/s",
		"/c",
		path,
		...args
	], options);
	return spawn(path, [...args], options);
}
/**
* 跑一条命令并收集输出。
*
* 走异步 spawn 而不是 spawnSync：一次 pnpm 安装可能要几十秒，同步跑会把
* 整个事件循环钉住，连取消都响应不了。
*/
async function runCommand(executable, args, options) {
	if (options.signal?.aborted === true) return {
		code: 130,
		stdout: "",
		stderr: "操作已取消"
	};
	const path = await resolveExecutable(executable);
	if (path === void 0) throw new WorkbenchError(`找不到可执行文件 "${executable}"；插件管理要求 DSH 命令行在 PATH 上`, "WORKBENCH_DSH_CLI_MISSING");
	return new Promise((settle, fail) => {
		const child = spawnResolved(path, args, options.cwd);
		let stdout = "";
		let stderr = "";
		let settled = false;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			options.signal?.removeEventListener("abort", onAbort);
			settle(result);
		};
		const timer = setTimeout(() => {
			child.kill();
			finish({
				code: 124,
				stdout,
				stderr: `${stderr}\n命令超时（${String(options.timeoutMs)} 毫秒）`
			});
		}, options.timeoutMs);
		const onAbort = () => {
			child.kill();
			finish({
				code: 130,
				stdout,
				stderr: `${stderr}\n操作已取消`
			});
		};
		options.signal?.addEventListener("abort", onAbort, { once: true });
		if (options.signal?.aborted === true) onAbort();
		child.stdout?.on("data", (chunk) => {
			stdout += chunk.toString("utf8");
		});
		child.stderr?.on("data", (chunk) => {
			stderr += chunk.toString("utf8");
		});
		child.on("error", (error) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			options.signal?.removeEventListener("abort", onAbort);
			fail(error);
		});
		child.on("close", (code) => {
			finish({
				code: code ?? 1,
				stdout,
				stderr
			});
		});
	});
}
/** 把一次 `dsh plugin` 调用转发出去。 */
async function runDshPlugin(executable, profile, args, options) {
	return runCommand(executable, [
		"plugin",
		"--profile",
		profile,
		...args
	], options);
}
/** 一个规格是不是本地路径。 */
function localPathOf(spec) {
	const bare = spec.replace(/^(?:file|link):/u, "");
	if (bare === "") return void 0;
	if (bare.startsWith(".") || bare.startsWith("/") || bare.startsWith("\\")) return bare;
	if (/^[A-Za-z]:[/\\]/u.test(bare)) return bare;
	return isAbsolute(bare) ? bare : void 0;
}
/**
* 本地路径规格的安装前预检。
*
* 指错目录是这里最常见的失误：把一个聚合仓库的根目录当插件装上去，pnpm
* 会成功、对账会发现它没有 `dsh.bundle` 于是不并入组合层，最后表现为
* 「装完了但什么都没变」。在转发之前读一眼它的 package.json 就能把这句话
* 说清楚。
*
* @returns 本地路径的预检信息；不是本地路径时返回 `undefined`。
*/
async function inspectLocalSpec(spec, cwd) {
	const bare = localPathOf(spec);
	if (bare === void 0) return void 0;
	const path = resolve(cwd, bare);
	const manifest = await readManifest(join(path, "package.json"));
	if (manifest === void 0) throw new WorkbenchError(`${path} 下没有可读的 package.json，装不了；确认路径指向的是插件包本身`, "WORKBENCH_PLUGIN_BAD_SPEC");
	return {
		path,
		...manifest.name === void 0 ? {} : { packageName: manifest.name },
		declaresBundle: manifest.dsh?.bundle?.patch !== void 0
	};
}
//#endregion
//#region .tsbuild/plugin/tool.js
/**
* 面向模型的 `workbench_plugin` 工具：DSH 插件的装卸与插件市场。
* @module @staff-os/dsh-workbench/plugin/tool
*/
/** 插件工具的默认超时预算：一次 pnpm 安装可能要几十秒。 */
const DEFAULT_PLUGIN_TOOL_TIMEOUT_MS = 3e5;
/** 默认的 DSH 命令行可执行文件名。 */
const DEFAULT_DSH_EXECUTABLE = "dsh";
/** 工具支持的动作。 */
const ACTIONS = [
	"list",
	"install",
	"remove",
	"update",
	"market_search",
	"market_install"
];
/** 校验动作名。 */
function parsePluginAction(raw) {
	const action = ACTIONS.find((candidate) => candidate === raw);
	if (action === void 0) throw new WorkbenchError(`未知动作 "${raw}"，可用：${ACTIONS.join("、")}`, "WORKBENCH_BAD_ACTION");
	return action;
}
function requireArg(value, field, action) {
	const trimmed = value?.trim();
	if (trimmed === void 0 || trimmed === "") throw new WorkbenchError(`动作 "${action}" 必须给 ${field}`, "WORKBENCH_MISSING_ARG");
	assertSafeSpec(trimmed, field);
	return trimmed;
}
function project$1(plugin) {
	return {
		name: plugin.name,
		...plugin.spec === void 0 ? {} : { spec: plugin.spec },
		...plugin.version === void 0 ? {} : { version: plugin.version },
		...plugin.description === void 0 ? {} : { description: plugin.description },
		isBundle: plugin.isBundle,
		active: plugin.active
	};
}
function projectMarket$1(item) {
	return {
		slug: item.slug,
		name: item.name,
		...item.description === void 0 ? {} : { description: item.description },
		...item.version === void 0 ? {} : { version: item.version },
		...item.installSpec === void 0 ? {} : { installSpec: item.installSpec },
		tags: [...item.tags],
		installCount: item.installCount,
		registry: item.sourceRegistry,
		registryName: item.sourceRegistryName
	};
}
/** 把命令输出剪到能进上下文的长度，保留尾部——错误信息在最后。 */
function tail(text, limit = 4e3) {
	const trimmed = text.trim();
	if (trimmed === "") return void 0;
	return trimmed.length <= limit ? trimmed : `…（前面省略）\n${trimmed.slice(-limit)}`;
}
/** 渲染成给模型看的文本。 */
function formatPluginOutput(value) {
	const lines = [value.message];
	if (value.plugins.length > 0) {
		lines.push("");
		for (const plugin of value.plugins) {
			const flags = [];
			if (!plugin.isBundle) flags.push("不是 DSH 插件，只是普通依赖");
			else if (!plugin.active) flags.push("未并入组合层");
			lines.push(`- ${plugin.name}${plugin.version === void 0 ? "" : ` ${plugin.version}`}${flags.length === 0 ? "" : `（${flags.join("，")}）`}${plugin.description === void 0 ? "" : `：${plugin.description}`}`);
		}
	}
	if (value.builtIn.length > 0) {
		lines.push("");
		lines.push(`随 profile 模板出厂的组合层（不是依赖，装卸命令碰不到）：${value.builtIn.join("、")}`);
	}
	if (value.market.length > 0) {
		lines.push("");
		for (const item of value.market) {
			const meta = [item.registryName, item.version === void 0 ? "" : `v${item.version}`].filter((part) => part !== "").join("，");
			lines.push(`- ${item.slug}（${meta}）：${item.description ?? item.name}`);
		}
	}
	if (value.commandOutput !== void 0) {
		lines.push("");
		lines.push("DSH 命令行输出：");
		lines.push(value.commandOutput);
	}
	return lines.join("\n");
}
const PLUGIN_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		name: {
			type: "string",
			required: true
		},
		spec: { type: "string" },
		version: { type: "string" },
		description: { type: "string" },
		isBundle: {
			type: "boolean",
			required: true
		},
		active: {
			type: "boolean",
			required: true
		}
	}
};
const MARKET_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		slug: {
			type: "string",
			required: true
		},
		name: {
			type: "string",
			required: true
		},
		description: { type: "string" },
		version: { type: "string" },
		installSpec: { type: "string" },
		tags: {
			type: "array",
			required: true,
			items: { type: "string" }
		},
		installCount: {
			type: "number",
			required: true
		},
		registry: {
			type: "string",
			required: true
		},
		registryName: {
			type: "string",
			required: true
		}
	}
};
/**
* 注册 `workbench_plugin` 工具及其使用指引。
*/
function applyPluginTool(ctx, executable, timeoutMs) {
	ctx.systemPrompt.section({
		name: "tool:workbench_plugin",
		order: 125,
		text: [
			"workbench_plugin 装卸本机 DSH profile 的插件，底层转发给 dsh plugin 命令行（一个 pnpm 转发器）。",
			"插件装完要重启 DSH 才生效，改完要告诉用户这一点。",
			"list 结果里 isBundle 为 false 表示那个包没有声明 dsh.bundle，只是普通依赖、不参与组合；",
			"active 为 false 表示它没被并入组合层。装完之后要看这两个标记确认是不是真的装成了插件。",
			"remove 会改动运行环境，必须先向用户说明再带 confirm: true 调用。"
		].join("")
	});
	ctx.tools.register(defineTool({
		name: "workbench_plugin",
		description: [
			"Install, remove and update DSH plugins for the local profile, and browse the plugin marketplace. ",
			"Actions: list, install, remove (needs confirm), update, market_search, market_install. ",
			"Install and remove forward to the `dsh plugin` CLI, which runs pnpm inside the profile directory ",
			"and reconciles the profile bundle layer list. Changes take effect after DSH restarts."
		].join(""),
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS,
				description: "Which operation to perform."
			},
			spec: {
				type: "string",
				description: "install only: what to install — an npm package name, a name@version, a git URL, or an absolute local directory path. Relative paths are not accepted because this tool does not run in the user's shell directory."
			},
			name: {
				type: "string",
				description: "remove/update: the installed package name, as reported by list."
			},
			slug: {
				type: "string",
				description: "market_install: the marketplace slug."
			},
			version: {
				type: "string",
				description: "market_install: version to install. Defaults to the latest published version."
			},
			registry: {
				type: "string",
				description: "Restrict a marketplace action to one configured registry id."
			},
			keyword: {
				type: "string",
				description: "market_search: search keyword. Omit to browse the newest entries."
			},
			page: {
				type: "integer",
				description: "market_search: 1-based page number. Defaults to 1."
			},
			pageSize: {
				type: "integer",
				description: "market_search: entries per page, 1-100. Defaults to 20."
			},
			sort: {
				type: "string",
				description: "market_search: registry sort key used when browsing without a keyword."
			},
			allowNonBundle: {
				type: "boolean",
				description: "install only: proceed even when a local path does not declare dsh.bundle. Default false, which refuses — pointing at a monorepo root instead of the plugin package is the usual cause."
			},
			confirm: {
				type: "boolean",
				description: "Required to be true for remove, which changes the running environment. Ask the user first."
			}
		},
		output: {
			schema: {
				type: "object",
				additionalProperties: false,
				properties: {
					action: {
						type: "string",
						required: true
					},
					message: {
						type: "string",
						required: true
					},
					plugins: {
						type: "array",
						required: true,
						items: PLUGIN_SCHEMA
					},
					builtIn: {
						type: "array",
						required: true,
						items: { type: "string" }
					},
					market: {
						type: "array",
						required: true,
						items: MARKET_SCHEMA
					},
					commandOutput: { type: "string" }
				}
			},
			render: (_args, value) => [{
				type: "text",
				text: formatPluginOutput(value)
			}]
		},
		timeoutMs,
		isConcurrencySafe: (args) => {
			const action = parsePluginAction(args.action);
			return action === "list" || action === "market_search";
		},
		async execute(args, exec) {
			const runtime = ctx.workbench;
			const profileDir = runtime.paths.profile;
			const action = parsePluginAction(args.action);
			const signal = exec.signal;
			const empty = {
				plugins: [],
				builtIn: [],
				market: []
			};
			if (action === "market_search") {
				const page = await runtime.registry.search({
					...args.keyword === void 0 ? {} : { keyword: args.keyword },
					...args.page === void 0 ? {} : { page: args.page },
					...args.pageSize === void 0 ? {} : { pageSize: args.pageSize },
					...args.sort === void 0 ? {} : { sort: args.sort }
				}, signal);
				return {
					...empty,
					action,
					message: page.items.length === 0 ? "市场里没有匹配的插件" : `市场共找到 ${String(page.items.length)} 个条目${page.fromCache ? "（来自离线缓存，registry 当前不可达）" : ""}`,
					market: page.items.map(projectMarket$1)
				};
			}
			if (action === "list") {
				const state = await readProfilePlugins(profileDir);
				const active = state.plugins.filter((plugin) => plugin.active).length;
				return {
					...empty,
					action,
					message: state.plugins.length === 0 ? `profile "${runtime.profileName}" 还没有装任何插件依赖` : `profile "${runtime.profileName}" 共 ${String(state.plugins.length)} 个依赖，其中 ${String(active)} 个作为插件生效`,
					plugins: state.plugins.map(project$1),
					builtIn: [...state.builtIn]
				};
			}
			/** 跑一次转发并把结果整理成出参。 */
			const forward = async (commandArgs, succeeded, watch) => {
				const result = await runDshPlugin(executable, runtime.profileName, commandArgs, {
					timeoutMs,
					...signal === void 0 ? {} : { signal }
				});
				const output = tail(`${result.stdout}\n${result.stderr}`);
				if (result.code !== 0) throw new WorkbenchError(`dsh plugin ${commandArgs.join(" ")} 失败（退出码 ${String(result.code)}）：\n${output ?? "（没有输出）"}`, "WORKBENCH_PLUGIN_COMMAND_FAILED");
				const state = await readProfilePlugins(profileDir);
				const touched = watch === void 0 ? [] : state.plugins.filter((plugin) => plugin.name === watch);
				const landed = touched[0];
				const warning = landed !== void 0 && !landed.isBundle ? `；注意：${landed.name} 没有声明 dsh.bundle，只是作为普通依赖装上了，不会参与组合` : landed !== void 0 && !landed.active ? `；注意：${landed.name} 还没并入组合层` : "";
				return {
					action,
					message: `${succeeded}${warning}`,
					plugins: (touched.length > 0 ? touched : state.plugins).map(project$1),
					builtIn: [...state.builtIn],
					market: [],
					...output === void 0 ? {} : { commandOutput: output }
				};
			};
			if (action === "remove") {
				const name = requireArg(args.name, "name", action);
				requireConfirm(args.confirm, `从 profile "${runtime.profileName}" 卸载插件 "${name}"`);
				return forward(["remove", name], `已卸载 "${name}"，重启 DSH 后生效`, void 0);
			}
			if (action === "update") {
				const name = args.name?.trim();
				return name === void 0 || name === "" ? forward(["update"], "已更新 profile 里的全部插件，重启 DSH 后生效", void 0) : forward(["update", name], `已更新 "${name}"，重启 DSH 后生效`, name);
			}
			if (action === "market_install") {
				const slug = requireArg(args.slug ?? args.name, "slug", action);
				const item = await runtime.registry.get(slug, args.registry, signal);
				if (item === void 0) throw new WorkbenchError(`市场里没有 "${slug}"`, "WORKBENCH_MARKET_NOT_FOUND");
				const base = item.installSpec ?? item.slug;
				const version = args.version ?? item.version;
				const spec = version === void 0 || base.includes("@", 1) ? base : `${base}@${version}`;
				assertSafeSpec(spec, "installSpec");
				return forward(["add", spec], `已从 ${item.sourceRegistryName} 安装 "${spec}"，重启 DSH 后生效`, item.installSpec ?? void 0);
			}
			const spec = requireArg(args.spec, "spec", action);
			if (/^(?:file:|link:)?\.{1,2}[/\\]/u.test(spec)) throw new WorkbenchError(`不接受相对路径 "${spec}"：本工具不在用户的 shell 目录里运行，相对路径会解析到别处；请给绝对路径`, "WORKBENCH_PLUGIN_BAD_SPEC");
			const local = await inspectLocalSpec(spec, profileDir);
			if (local !== void 0 && !local.declaresBundle && args.allowNonBundle !== true) throw new WorkbenchError(`${local.path} 的 package.json 没有声明 dsh.bundle，装上去也不会参与 DSH 组合；常见原因是路径指到了聚合仓库的根目录而不是插件包本身。确认要按普通依赖安装请传 allowNonBundle: true`, "WORKBENCH_PLUGIN_NOT_A_BUNDLE");
			return forward(["add", spec], `已安装 "${local?.packageName ?? spec}"，重启 DSH 后生效`, local?.packageName);
		},
		presentCall: (args) => {
			const subject = args.spec ?? args.name ?? args.slug ?? args.keyword;
			return {
				card: "generic",
				kind: "search",
				title: subject === void 0 ? `插件：${args.action}` : `插件：${args.action} ${subject}`,
				rawInput: args.action
			};
		}
	}));
}
//#endregion
//#region .tsbuild/index.js
/**
* `@staff-os/dsh-workbench`：把企业工作台能力移植到
* DeepSeek Harness 上，装上就能用——**不依赖外部后端，也不依赖数据库**，
* 状态全部落在 `$DSH_HOME` 下的本地文件里。
*
* 覆盖四块能力，外加一个市场对接：
*
* - **AI 员工**：DSH 原生 agent preset 就是「一个可挂载的 AI 员工」，直接复用
* - **知识库**：本地目录 + 分块 + 关键词检索
* - **技能**：本地技能读写，以及 ClawHub 兼容技能市场
* - **MCP**：profile `cordis.patch.yml` 里的 `@deepseek-ai/dsh-mcp-client` 行
* - **插件**：DSH 插件的装卸与插件市场
*
* 三种能力缝角色都在这个包里：**Service Definition** 是注册为 `ctx.workbench`
* 的 {@link WorkbenchRuntime}；**Provider** 是各域下的本地文件实现；
* **Consumer** 是五个面向模型的工具。
*
* @module @staff-os/dsh-workbench
*/
/** 加载器诊断里用的 Cordis 插件名。 */
const name = "workbench";
/** 本插件依赖的服务。 */
const inject = ["tools", "systemPrompt"];
const RegistrySourceSchema = Schema.object({
	id: Schema.string().required(),
	name: Schema.string(),
	url: Schema.string().required(),
	apiKeyEnv: Schema.string().role("credential-ref")
});
const Config = Schema.object({
	profile: Schema.string().default("web"),
	dshHome: Schema.string(),
	registries: Schema.array(RegistrySourceSchema).default([]),
	registryTimeoutMs: Schema.number().step(1).min(1).default(DEFAULT_REGISTRY_TIMEOUT_MS),
	toolTimeoutMs: Schema.number().step(1).min(1).default(DEFAULT_MCP_TOOL_TIMEOUT_MS),
	networkToolTimeoutMs: Schema.number().step(1).min(1).default(DEFAULT_SKILL_TOOL_TIMEOUT_MS),
	dshExecutable: Schema.string().default("dsh"),
	pluginToolTimeoutMs: Schema.number().step(1).min(1).default(DEFAULT_PLUGIN_TOOL_TIMEOUT_MS)
});
/**
* 解析一个 registry 的 apiKey：优先凭据服务，回退启动环境。
*
* 与 `dsh-ragflow` 同构——凭据服务不一定装了，此时降级到进程启动环境，
* 而不是让整个市场功能失效。
*/
function makeApiKeyResolver(ctx) {
	return async (ref) => {
		const credential = credentialRef(ref);
		const credentials = ctx.get("credentials");
		if (credentials !== void 0) return (await credentials.resolve(credential))?.value;
		const ambient = launchEnvironmentOf(ctx).get(credential);
		return ambient !== void 0 && ambient.value.length > 0 ? ambient.value : void 0;
	};
}
/**
* 注册工作台能力缝与面向模型的工具。全部随插件卸载而注销。
*/
function apply(ctx, config) {
	ctx.plugin(WorkbenchRuntime, {
		profile: config.profile ?? "web",
		...config.dshHome === void 0 ? {} : { dshHome: config.dshHome },
		registries: config.registries ?? [],
		registryTimeoutMs: config.registryTimeoutMs ?? 15e3,
		resolveApiKey: makeApiKeyResolver(ctx)
	});
	ctx.systemPrompt.section({
		name: "tool:workbench",
		order: 120,
		text: [
			"企业工作台工具管理本机 DeepSeek Harness 的四类资源：AI 员工（workbench_employee）、",
			"知识库（workbench_knowledge）、技能（workbench_skill）、MCP 服务（workbench_mcp），",
			"以及 DSH 插件（workbench_plugin）。每个工具用 action 参数选择具体动作，先用 list 看清现状再动手。",
			"删除类动作必须显式传 confirm: true，且要先向用户说明将要删除什么、得到用户同意之后再调用。"
		].join("")
	});
	ctx.plugin(SkillActivation);
	ctx.plugin(WorkbenchEmployeeGateway);
	ctx.plugin(WorkbenchSkillGateway);
	const toolTimeoutMs = config.toolTimeoutMs ?? 2e4;
	const networkToolTimeoutMs = config.networkToolTimeoutMs ?? 12e4;
	applyMcpTool(ctx, toolTimeoutMs);
	applySkillTool(ctx, networkToolTimeoutMs, config.registryTimeoutMs ?? 15e3);
	applyKnowledgeTool(ctx, DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS);
	applyEmployeeTool(ctx, DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS);
	applyPluginTool(ctx, config.dshExecutable ?? "dsh", config.pluginToolTimeoutMs ?? 3e5);
}
//#endregion
export { BINDING_KINDS, CHARSET_SMUGGLING_RULE, CONFIRM_REQUIRED, Config, DEFAULT_CHUNK_OVERLAP, DEFAULT_CHUNK_SIZE, DEFAULT_DSH_EXECUTABLE, DEFAULT_EMPLOYEE_TOOL_TIMEOUT_MS, DEFAULT_KNOWLEDGE_TOOL_TIMEOUT_MS, DEFAULT_MCP_TOOL_TIMEOUT_MS, DEFAULT_PLUGIN_TOOL_TIMEOUT_MS, DEFAULT_PROFILE, DEFAULT_REGISTRY_TIMEOUT_MS, DEFAULT_SKILL_TOOL_TIMEOUT_MS, EMPLOYEE_FILE, LEDGER_FILE, MAX_DOCUMENT_BYTES, MAX_ENTRIES, MAX_FILE_BYTES, MAX_PREVIEW_BYTES, MAX_SCAN_BYTES, MAX_TOTAL_BYTES, MAX_UPLOAD_BYTES, MCP_PLUGIN_NAME, RISK_RULES, RegistryClient, SCAN_CATEGORIES, SEVERITY_ORDER, SHOWCASE_SECTIONS, SIGNAL_PROVIDER, SKILL_FILE, SKILL_NAME_PATTERN, SkillActivation, UNSAFE_ARCHIVE, WorkbenchEmployeeGateway, WorkbenchError, WorkbenchRuntime, WorkbenchSkillGateway, addDocument, addServer, ambiguityMessage, apply, applyBinding, applyEmployeeTool, applyKnowledgeTool, applyMcpTool, applyPluginTool, applySkillTool, assertEmployeeId, assertSafeEntryPath, assertSafeSpec, assertSkillName, categoriesOf, chunkText, classifyImportSource, collectSkills, collectTopics, convertVariables, createKnowledgeBase, createLocalSkill, decodeUploadedPackage, describePackage, detailNote, emptyBindings, emptyComposition, extractPackage, fallbackSkillName, fileContentOf, findSkillsInPackage, findUnknown, forgetInstall, formatEmployeeOutput, frontmatterBoolean, githubArchiveUrl, githubHandoff, highestSeverity, idf, inject, inspectLocalSpec, installSkillFiles, isLikelyText, isNewerVersion, isSafeEntryPath, isScannableTextFile, itemFromDetail, itemFromListEntry, itemFromSearchResult, itemFromWebEntry, ledgerPath, listDocuments, listEmployees, listKnowledgeBases, listLocalSkills, listServers, listSkillFiles, loadPatch, name, normalizeChunkOptions, normalizeEntryPath, normalizeTags, packageFileBytes, packageFileText, parseBindMode, parseComposition, parseEmployeeAction, parseMcpServersJson, parseSkillFrontmatter, presetDirOf, project, projectLocal, projectMarket, projectRejected, projectWinner, readBindings, readDocumentFile, readFileContent, readIndex, readInventory, readKnowledgeBase, readLedger, readLocalSkill, readPackageBytes, readProfilePlugins, rebuildIndex, recordInstall, recoverMojibake, removeDocument, removeKnowledgeBase, removeLocalSkill, removeServer, requireConfirm, resolveExecutable, resolveInsideSkill, resolvePaths, retryAfterSeconds, runCommand, runDshPlugin, sanitizeServerName, savePatch, scanFiles, scanLocalSkills, scoreChunks, scoreOf, searchKnowledge, selectSkillFromPackage, setServerDisabled, setSkillVisibility, showcasePath, slugify, splitFrontmatter, stripCommonPrefix, summarizeModeration, summarizeSecurity, termFrequencies, tokenize, updateKnowledgeBase, updateServer, versionFromDisposition, winnerIsLocal, writeBindings, writeMetadata };
