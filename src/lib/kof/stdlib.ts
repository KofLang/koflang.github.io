/**
 * Stdlib Kof 0.4.x para o browser — algoritmos portados 1:1 das fatias do
 * kof-runtime.mjs real (JsRuntimeUiStdlib / JsRuntimeUiWs / JsRuntimeUiNet /
 * JsRuntimeUiUuid / JsRuntimeUiRandom / JsRuntimeUiCrypto / JsRuntimeUiWeb /
 * JsRuntimeUiSecurity). Mesma saída dos 5 alvos onde o contrato é puro;
 * APIs que precisam de host (io/db/http/web/orm) reportam o gap com o
 * código oficial (R6 — nunca silêncio).
 */
import { KofRuntimeError, kofStr, type KofVal, asNum } from "./values";

const bool = (b: boolean): KofVal => b;

export interface StdCtx {
  now: () => number;
  randomInt: (bound: number) => number;
  randomByte: () => number;
}

// ══════════════════ kof.math (S1 + S1b + S13) ══════════════════

const mathFns: Record<string, (a: KofVal[], c: StdCtx) => KofVal> = {
  abs: (a) => {
    const v = asNum(a[0]);
    return typeof v === "bigint" ? (v < 0n ? -v : v) : v < 0 ? -v : v;
  },
  sign: (a) => {
    const v = Number(asNum(a[0]));
    return v > 0 ? 1 : v < 0 ? -1 : 0;
  },
  clamp: (a) => {
    const v = Number(asNum(a[0]));
    const lo = Number(asNum(a[1]));
    const hi = Number(asNum(a[2]));
    return v < lo ? lo : v > hi ? hi : v;
  },
  min: (a) => {
    const x = asNum(a[0]);
    const y = asNum(a[1]);
    return Number(x) <= Number(y) ? x : y;
  },
  max: (a) => {
    const x = asNum(a[0]);
    const y = asNum(a[1]);
    return Number(x) >= Number(y) ? x : y;
  },
  isEven: (a) => bool((Number(asNum(a[0])) & 1) === 0),
  isOdd: (a) => bool((Number(asNum(a[0])) & 1) !== 0),
  isPositive: (a) => bool(Number(asNum(a[0])) > 0),
  isNegative: (a) => bool(Number(asNum(a[0])) < 0),
  isZero: (a) => bool(Number(asNum(a[0])) === 0),
  sqrt: (a) => Math.sqrt(Number(asNum(a[0]))),
  lerp: (a) => {
    const x = Number(asNum(a[0]));
    const y = Number(asNum(a[1]));
    const t = Number(asNum(a[2]));
    return x + (y - x) * t;
  },
  percentage: (a) => (Number(asNum(a[0])) / Number(asNum(a[1]))) * 100.0,
  pow: (a) => Math.pow(Number(asNum(a[0])), Number(asNum(a[1]))),
  isInteger: (a) => {
    const v = Number(asNum(a[0]));
    return bool(v === Math.floor(v) && v !== Infinity && v !== -Infinity);
  },
  isDecimal: (a) => {
    const v = Number(asNum(a[0]));
    return bool(!(v === Math.floor(v) && v !== Infinity && v !== -Infinity));
  },
  // S1b.3 — half-away-from-zero por escala decimal determinística (kofMathRoundTo)
  roundTo: (a) => {
    let v = Number(asNum(a[0]));
    const decimals = Number(asNum(a[1]));
    if (v !== v || v === Infinity || v === -Infinity) return v;
    let m = decimals < 0 ? -decimals : decimals;
    if (m > 308) m = 308;
    let p = 1.0;
    for (let i = 0; i < m; i++) p *= 10.0;
    const scaled = decimals >= 0 ? v * p : v / p;
    if (scaled === Infinity || scaled === -Infinity) return v;
    let r: number;
    if (scaled >= 4503599627370496.0 || scaled <= -4503599627370496.0) {
      r = scaled;
    } else {
      let t = Math.trunc(scaled);
      const f = scaled - t;
      if (f >= 0.5) t += 1;
      else if (f <= -0.5) t -= 1;
      r = t;
    }
    return decimals >= 0 ? r / p : r * p;
  },
  parseInt: (a) => stringToInt(a[0]),
  parseLong: (a) => stringToLong(a[0]),
  parseDouble: (a) => stringToDouble(a[0]),
  parseFloat: (a) => stringToFloat(a[0]),
  parseIntOrDefault: (a) => {
    try {
      return stringToInt(a[0]);
    } catch {
      return a[1] ?? 0;
    }
  },
  parseLongOrDefault: (a) => {
    try {
      return stringToLong(a[0]);
    } catch {
      return a[1] ?? 0n;
    }
  },
  parseDoubleOrDefault: (a) => {
    try {
      return stringToDouble(a[0]);
    } catch {
      return a[1] ?? 0;
    }
  },
};

// ══════════════════ kof.strings (S2 + S3 + S11) ══════════════════

function toS(v: KofVal | undefined): string {
  return v === null || v === undefined ? "" : kofStr(v);
}

function joinWords(v: string, mode: number): string {
  if (v === null) return v;
  let out = "";
  let wc = 0;
  let prev = -1;
  for (let i = 0; i < v.length; i++) {
    const c = v.charCodeAt(i);
    const upper = c >= 65 && c <= 90;
    const alnum = upper || (c >= 97 && c <= 122) || (c >= 48 && c <= 57);
    if (!alnum) {
      prev = -1;
      continue;
    }
    let nw = false;
    if (prev === -1) nw = true;
    else if (upper) {
      const pl = prev >= 97 && prev <= 122;
      const pd = prev >= 48 && prev <= 57;
      const pu = prev >= 65 && prev <= 90;
      let nl = false;
      if (i + 1 < v.length) {
        const nx = v.charCodeAt(i + 1);
        nl = nx >= 97 && nx <= 122;
      }
      nw = pl || pd || (pu && nl);
    }
    const low = (ch: number) => (ch >= 65 && ch <= 90 ? ch + 32 : ch);
    const up = (ch: number) => (ch >= 97 && ch <= 122 ? ch - 32 : ch);
    if (nw) {
      if (out.length > 0 && mode >= 2) out += String.fromCharCode(mode === 2 ? 95 : 45);
      const cap = mode === 1 || (mode === 0 && wc > 0);
      out += String.fromCharCode(cap ? up(c) : low(c));
      wc++;
    } else {
      out += String.fromCharCode(low(c));
    }
    prev = c;
  }
  return out;
}

const stringsFns: Record<string, (a: KofVal[]) => KofVal> = {
  isAlpha: (a) => bool(/^[A-Za-z]+$/.test(toS(a[0]))),
  isNumeric: (a) => bool(/^[0-9]+$/.test(toS(a[0]))),
  isAlphaNumeric: (a) => bool(/^[A-Za-z0-9]+$/.test(toS(a[0]))),
  isAscii: (a) => bool(/^[\x00-\x7F]+$/.test(toS(a[0]))),
  isUpperCase: (a) => {
    const v = toS(a[0]);
    return v.length === 0 ? false : /[a-z]/.test(v) ? false : /[A-Z]/.test(v);
  },
  isLowerCase: (a) => {
    const v = toS(a[0]);
    return v.length === 0 ? false : /[A-Z]/.test(v) ? false : /[a-z]/.test(v);
  },
  count: (a) => {
    const v = toS(a[0]);
    const sub = toS(a[1]);
    if (sub.length === 0 || v.length === 0) return 0;
    let n = 0;
    let i = 0;
    while ((i = v.indexOf(sub, i)) >= 0) {
      n++;
      i += sub.length;
    }
    return n;
  },
  capitalize: (a) => {
    const v = toS(a[0]);
    if (v.length === 0) return v;
    const c = v.charCodeAt(0);
    return c >= 97 && c <= 122 ? String.fromCharCode(c - 32) + v.slice(1) : v;
  },
  uncapitalize: (a) => {
    const v = toS(a[0]);
    if (v.length === 0) return v;
    const c = v.charCodeAt(0);
    return c >= 65 && c <= 90 ? String.fromCharCode(c + 32) + v.slice(1) : v;
  },
  reverse: (a) => [...toS(a[0])].reverse().join(""),
  repeat: (a) => {
    const v = toS(a[0]);
    const n = Number(asNum(a[1]));
    if (v.length === 0 || n <= 0) return "";
    return v.repeat(n);
  },
  truncate: (a) => {
    const v = toS(a[0]);
    const n = Number(asNum(a[1]));
    if (n <= 0) return "";
    return v.length <= n ? v : v.slice(0, n);
  },
  padLeft: (a) => {
    let v = toS(a[0]);
    const n = Number(asNum(a[1]));
    const pad = toS(a[2]);
    if (pad.length === 0 || v.length >= n) return v;
    const p = pad.charAt(0);
    while (v.length < n) v = p + v;
    return v;
  },
  padRight: (a) => {
    let v = toS(a[0]);
    const n = Number(asNum(a[1]));
    const pad = toS(a[2]);
    if (pad.length === 0 || v.length >= n) return v;
    const p = pad.charAt(0);
    while (v.length < n) v = v + p;
    return v;
  },
  toCamelCase: (a) => joinWords(toS(a[0]), 0),
  toPascalCase: (a) => joinWords(toS(a[0]), 1),
  toSnakeCase: (a) => joinWords(toS(a[0]), 2),
  toKebabCase: (a) => joinWords(toS(a[0]), 3),
  slugify: (a) => joinWords(toS(a[0]), 4),
  escapeHtml: (a) => {
    const v = toS(a[0]);
    let o = "";
    for (const c of v) {
      if (c === "&") o += "&amp;";
      else if (c === "<") o += "&lt;";
      else if (c === ">") o += "&gt;";
      else if (c === '"') o += "&quot;";
      else if (c === "'") o += "&#39;";
      else o += c;
    }
    return o;
  },
  escapeJson: (a) => {
    const v = toS(a[0]);
    const B = "\\";
    let o = "";
    for (let i = 0; i < v.length; i++) {
      const c = v.charCodeAt(i);
      if (c === 92) o += B + B;
      else if (c === 34) o += B + '"';
      else if (c === 8) o += B + "b";
      else if (c === 12) o += B + "f";
      else if (c === 10) o += B + "n";
      else if (c === 13) o += B + "r";
      else if (c === 9) o += B + "t";
      else if (c < 32) o += B + "u" + c.toString(16).padStart(4, "0");
      else o += v[i];
    }
    return o;
  },
  unescapeHtml: (a) => {
    const v = toS(a[0]);
    const hexD = (c: number) => {
      if (c >= 48 && c <= 57) return c - 48;
      if (c >= 97 && c <= 102) return c - 97 + 10;
      if (c >= 65 && c <= 70) return c - 65 + 10;
      return -1;
    };
    let o = "";
    let i = 0;
    const n = v.length;
    while (i < n) {
      const c = v[i];
      if (c !== "&") {
        o += c;
        i++;
        continue;
      }
      if (v.startsWith("&amp;", i)) {
        o += "&";
        i += 5;
        continue;
      }
      if (v.startsWith("&lt;", i)) {
        o += "<";
        i += 4;
        continue;
      }
      if (v.startsWith("&gt;", i)) {
        o += ">";
        i += 4;
        continue;
      }
      if (v.startsWith("&quot;", i)) {
        o += '"';
        i += 6;
        continue;
      }
      if (v.startsWith("&apos;", i)) {
        o += String.fromCharCode(39);
        i += 6;
        continue;
      }
      if (i + 1 < n && v.charCodeAt(i + 1) === 35) {
        let j = i + 2;
        let hx = false;
        const x = v.charCodeAt(j);
        if (j < n && (x === 120 || x === 88)) {
          hx = true;
          j++;
        }
        let k = j;
        let acc = 0;
        while (k < n) {
          const dv = hexD(v.charCodeAt(k));
          if (dv < 0 || (dv > 9 && !hx)) break;
          if (!hx && (v.charCodeAt(k) < 48 || v.charCodeAt(k) > 57)) break;
          acc = acc * (hx ? 16 : 10) + dv;
          if (acc > 0x10ffff) break;
          k++;
        }
        if (
          k > j &&
          k < n &&
          v.charCodeAt(k) === 59 &&
          acc > 0 &&
          acc < 0x10000 &&
          !(acc >= 0xd800 && acc <= 0xdfff)
        ) {
          o += String.fromCodePoint(acc);
          i = k + 1;
          continue;
        }
      }
      o += "&";
      i++;
    }
    return o;
  },
  removeWhitespace: (a) => {
    const v = toS(a[0]);
    let o = "";
    for (let i = 0; i < v.length; i++) {
      const c = v.charCodeAt(i);
      if (!(c === 32 || (c >= 9 && c <= 13))) o += v[i];
    }
    return o;
  },
  normalizeWhitespace: (a) => {
    const v = toS(a[0]);
    let o = "";
    let inws = false;
    let started = false;
    for (let i = 0; i < v.length; i++) {
      const c = v.charCodeAt(i);
      if (c === 32 || (c >= 9 && c <= 13)) {
        if (started) inws = true;
      } else {
        if (inws) {
          o += " ";
          inws = false;
        }
        o += v[i];
        started = true;
      }
    }
    return o;
  },
  indent: (a) => {
    const v = toS(a[0]);
    const n = Number(asNum(a[1]));
    if (v.length === 0 || n <= 0) return v;
    const pad = " ".repeat(n);
    return v
      .split("\n")
      .map((l) => (l.length > 0 ? pad + l : l))
      .join("\n");
  },
  dedent: (a) => {
    const v = toS(a[0]);
    if (v.length === 0) return v;
    const lines = v.split("\n");
    let minIndent = -1;
    for (const line of lines) {
      let ws = 0;
      while (ws < line.length && (line[ws] === " " || line[ws] === "\t")) ws++;
      if (ws < line.length && (minIndent === -1 || ws < minIndent)) minIndent = ws;
    }
    if (minIndent <= 0) return v;
    return lines.map((l) => l.slice(Math.min(minIndent, l.length))).join("\n");
  },
};

// ══════════════════ parse String→número (paridade kof_string_to_*) ══════════════════

function stringToInt(v: KofVal | undefined): number {
  const s = toS(v).trim();
  if (!/^[-+]?\d+$/.test(s)) throw new KofRuntimeError(`Cannot parse "${s}" as Int`);
  const n = Number(s);
  if (n < -2147483648 || n > 2147483647) throw new KofRuntimeError(`Cannot parse "${s}" as Int`);
  return n | 0;
}
function stringToLong(v: KofVal | undefined): bigint {
  const s = toS(v).trim();
  if (!/^[-+]?\d+$/.test(s)) throw new KofRuntimeError(`Cannot parse "${s}" as Long`);
  const b = BigInt(s);
  const MIN = -(2n ** 63n);
  const MAX = 2n ** 63n - 1n;
  if (b < MIN || b > MAX) throw new KofRuntimeError(`Cannot parse "${s}" as Long`);
  return b;
}
function stringToDouble(v: KofVal | undefined): number {
  const s = toS(v).trim();
  if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$|^-?Infinity$|^NaN$/.test(s))
    throw new KofRuntimeError(`Cannot parse "${s}" as Double`);
  return Number(s);
}
function stringToFloat(v: KofVal | undefined): number {
  return Math.fround(stringToDouble(v));
}

// ══════════════════ kof.encoding (S4) — UTF-8 próprio (sem TextEncoder) ══════════════════

function utf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    } else if (c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) {
      const c2 = str.charCodeAt(i + 1);
      if (c2 >= 0xdc00 && c2 < 0xe000) {
        const cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(
          0xf0 | (cp >> 18),
          0x80 | ((cp >> 12) & 63),
          0x80 | ((cp >> 6) & 63),
          0x80 | (cp & 63),
        );
        i++;
      } else out.push(0xef, 0xbf, 0xbd);
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}

function fromUtf8(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length;) {
    let cp = bytes[i]!;
    if (cp < 0x80) {
      out += String.fromCharCode(cp);
      i += 1;
    } else if (cp >= 0xc0 && cp < 0xe0 && i + 1 < bytes.length) {
      cp = ((cp & 31) << 6) | (bytes[i + 1]! & 63);
      out += String.fromCharCode(cp);
      i += 2;
    } else if (cp >= 0xe0 && cp < 0xf0 && i + 2 < bytes.length) {
      cp = ((cp & 15) << 12) | ((bytes[i + 1]! & 63) << 6) | (bytes[i + 2]! & 63);
      out += String.fromCharCode(cp);
      i += 3;
    } else if (cp >= 0xf0 && i + 3 < bytes.length) {
      cp =
        ((cp & 7) << 18) |
        ((bytes[i + 1]! & 63) << 12) |
        ((bytes[i + 2]! & 63) << 6) |
        (bytes[i + 3]! & 63);
      out += String.fromCodePoint(cp);
      i += 4;
    } else {
      out += String.fromCharCode(0xfffd);
      i += 1;
    }
  }
  return out;
}

const B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function b64Encode(bytes: number[]): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]!;
    const b1 = i + 1 < bytes.length ? bytes[i + 1]! : -1;
    const b2 = i + 2 < bytes.length ? bytes[i + 2]! : -1;
    out += B64_CHARS[b0 >> 2];
    out += B64_CHARS[((b0 & 3) << 4) | (b1 >= 0 ? b1 >> 4 : 0)];
    out += b1 >= 0 ? B64_CHARS[((b1 & 15) << 2) | (b2 >= 0 ? b2 >> 6 : 0)] : "=";
    out += b2 >= 0 ? B64_CHARS[b2 & 63] : "=";
  }
  return out;
}

// tolerante (strict=false — spec travada na matriz: inválidos são pulados)
function b64Decode(s: string): number[] {
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "=") break;
    const v = B64_CHARS.indexOf(c ?? "");
    if (v < 0) continue;
    buffer = (buffer << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return out;
}

const HEX = "0123456789ABCDEF";
function hexStrict(ch: string): number {
  const c = ch.charCodeAt(0);
  if (c >= 48 && c <= 57) return c - 48;
  if (c >= 97 && c <= 102) return c - 97 + 10;
  if (c >= 65 && c <= 70) return c - 65 + 10;
  return -1;
}

const encodingFns: Record<string, (a: KofVal[]) => KofVal> = {
  hexEncode: (a) => {
    const b = utf8Bytes(toS(a[0]));
    let out = "";
    for (let i = 0; i < b.length; i++) {
      out += ((b[i]! >> 4) & 15).toString(16);
      out += (b[i]! & 15).toString(16);
    }
    return out;
  },
  hexDecode: (a) => {
    const v = toS(a[0]);
    const nib = (ch: string) => {
      const c = ch.charCodeAt(0);
      if (c >= 48 && c <= 57) return c - 48;
      if (c >= 97 && c <= 102) return c - 97 + 10;
      if (c >= 65 && c <= 70) return c - 65 + 10;
      return 0;
    };
    const out: number[] = [];
    for (let i = 0; i < v.length; i += 2) {
      const hi = nib(v[i]!);
      const lo = i + 1 < v.length ? nib(v[i + 1]!) : 0;
      out.push((hi << 4) | lo);
    }
    return fromUtf8(out);
  },
  base64Encode: (a) => b64Encode(utf8Bytes(toS(a[0]))),
  base64Decode: (a) => fromUtf8(b64Decode(toS(a[0]))),
  base64UrlEncode: (a) => {
    let b64 = b64Encode(utf8Bytes(toS(a[0])));
    b64 = b64.split("+").join("-").split("/").join("_");
    return b64.indexOf("=") >= 0 ? b64.substring(0, b64.indexOf("=")) : b64;
  },
  base64UrlDecode: (a) => {
    const v = toS(a[0]);
    const std = v.split("-").join("+").split("_").join("/");
    return fromUtf8(b64Decode(std));
  },
  urlEncode: (a) => {
    const b = utf8Bytes(toS(a[0]));
    let out = "";
    for (let i = 0; i < b.length; i++) {
      const c = b[i]!;
      const unres =
        (c >= 65 && c <= 90) ||
        (c >= 97 && c <= 122) ||
        (c >= 48 && c <= 57) ||
        c === 45 ||
        c === 95 ||
        c === 46 ||
        c === 126;
      if (unres) out += String.fromCharCode(c);
      else out += "%" + HEX.charAt(c >> 4) + HEX.charAt(c & 15);
    }
    return out;
  },
  urlDecode: (a) => {
    const v = toS(a[0]);
    const out: number[] = [];
    for (let i = 0; i < v.length; i++) {
      const c = v.charCodeAt(i);
      if (c === 37 && i + 2 < v.length) {
        const hi = hexStrict(v[i + 1]!);
        const lo = hexStrict(v[i + 2]!);
        if (hi >= 0 && lo >= 0) {
          out.push((hi << 4) | lo);
          i += 2;
          continue;
        }
      }
      out.push(c & 255);
    }
    return fromUtf8(out);
  },
};

// ══════════════════ kof.time — calendário civil (S7) — algoritmo Hinnant, sem Date ══════════════════

function timeValidDate(y: number, m: number, d: number): boolean {
  if (y < 1 || y > 9999 || m < 1 || m > 12) return false;
  return d >= 1 && d <= daysInMonth(y, m);
}
function isLeapYear(y: number): boolean {
  return y >= 1 && y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
}
function daysInMonth(year: number, month: number): number {
  if (year < 1 || month < 1 || month > 12) return 0;
  const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return dim[month - 1]!;
}
function epochDay(year: number, month: number, day: number): number {
  const y = year - (month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = month + (month > 2 ? -3 : 9);
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function civilFromEpoch(ed: number): { y: number; m: number; d: number } {
  const floor = (a: number, b: number) => Math.floor(a / b);
  const z = ed + 719468;
  const era = z >= 0 ? floor(z, 146097) : floor(z - 146096, 146097);
  const doe = z - era * 146097;
  const yoe = floor(
    doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096),
    365,
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: y + (m <= 2 ? 1 : 0), m, d };
}
function timeDigits(s: string, from: number, len: number): number {
  let v = 0;
  for (let i = from; i < from + len; i++) {
    const c = s.charCodeAt(i);
    if (c < 48 || c > 57) return -1;
    v = v * 10 + (c - 48);
  }
  return v;
}
function parseIso(s: string): { y: number; m: number; d: number } | null {
  if (typeof s !== "string" || s.length !== 10) return null;
  if (s.charCodeAt(4) !== 45 || s.charCodeAt(7) !== 45) return null;
  const y = timeDigits(s, 0, 4);
  const m = timeDigits(s, 5, 2);
  const d = timeDigits(s, 8, 2);
  if (y < 0 || m < 0 || d < 0 || !timeValidDate(y, m, d)) return null;
  return { y, m, d };
}
const pad2 = (n: number) => (n < 10 ? "0" : "") + n;
const pad4 = (n: number) => {
  let s = "" + n;
  while (s.length < 4) s = "0" + s;
  return s;
};

const timeFns: Record<string, (a: KofVal[], c: StdCtx) => KofVal> = {
  now: (_a, ctx) => ctx.now(),
  todayIso: () => {
    const ed = Math.floor(Date.now() / 86400000);
    const c = civilFromEpoch(ed);
    return pad4(c.y) + "-" + pad2(c.m) + "-" + pad2(c.d);
  },
  isLeapYear: (a) => bool(isLeapYear(Number(asNum(a[0])))),
  daysInMonth: (a) => daysInMonth(Number(asNum(a[0])), Number(asNum(a[1]))),
  dayOfWeek: (a) => {
    const y = Number(asNum(a[0]));
    const m = Number(asNum(a[1]));
    const d = Number(asNum(a[2]));
    if (!timeValidDate(y, m, d)) return 0;
    const ed = epochDay(y, m, d);
    return (((ed % 7) + 7 + 3) % 7) + 1;
  },
  isWeekend: (a) => {
    const y = Number(asNum(a[0]));
    const m = Number(asNum(a[1]));
    const d = Number(asNum(a[2]));
    let dow: number;
    if (!timeValidDate(y, m, d)) dow = 0;
    else {
      const ed = epochDay(y, m, d);
      dow = (((ed % 7) + 7 + 3) % 7) + 1;
    }
    return bool(dow >= 6);
  },
  daysBetween: (a) => {
    const y1 = Number(asNum(a[0]));
    const m1 = Number(asNum(a[1]));
    const d1 = Number(asNum(a[2]));
    const y2 = Number(asNum(a[3]));
    const m2 = Number(asNum(a[4]));
    const d2 = Number(asNum(a[5]));
    if (!timeValidDate(y1, m1, d1) || !timeValidDate(y2, m2, d2)) return 0;
    return epochDay(y2, m2, d2) - epochDay(y1, m1, d1);
  },
  addDays: (a) => {
    const parsed = parseIso(toS(a[0]));
    const days = Number(asNum(a[1]));
    if (!parsed) return "";
    const r = civilFromEpoch(epochDay(parsed.y, parsed.m, parsed.d) + days);
    if (r.y < 1 || r.y > 9999) return "";
    return pad4(r.y) + "-" + pad2(r.m) + "-" + pad2(r.d);
  },
  diffDays: (a) => {
    const x = parseIso(toS(a[0]));
    const y = parseIso(toS(a[1]));
    if (!x || !y) return 0;
    return epochDay(y.y, y.m, y.d) - epochDay(x.y, x.m, x.d);
  },
  sleep: () => {
    throw new KofRuntimeError(
      "time.sleep: no-op honesto no browser (sem pump de event-loop do KofJS host) — CONC/§132",
      undefined,
      false,
    );
  },
};

// ══════════════════ kof.uuid (S3b) ══════════════════

const uuidFns: Record<string, (a: KofVal[], c: StdCtx) => KofVal> = {
  v4: (_a, ctx) => {
    let hex = "";
    for (let i = 0; i < 16; i++) hex += ctx.randomByte().toString(16).padStart(2, "0");
    const b = hex.split("");
    b[12] = "4";
    b[16] = "89ab".charAt(parseInt(b[16]!, 16) >> 2);
    return (
      b.slice(0, 8).join("") +
      "-" +
      b.slice(8, 12).join("") +
      "-" +
      b.slice(12, 16).join("") +
      "-" +
      b.slice(16, 20).join("") +
      "-" +
      b.slice(20, 32).join("")
    );
  },
  v7: (_a, ctx) => {
    const ts = Date.now();
    const tsHex = ts.toString(16).padStart(12, "0");
    let randHex = "";
    for (let i = 0; i < 10; i++) randHex += ctx.randomByte().toString(16).padStart(2, "0");
    const b = (tsHex + randHex).split("");
    b[12] = "7";
    b[16] = "89ab".charAt(parseInt(b[16]!, 16) >> 2);
    return (
      b.slice(0, 8).join("") +
      "-" +
      b.slice(8, 12).join("") +
      "-" +
      b.slice(12, 16).join("") +
      "-" +
      b.slice(16, 20).join("") +
      "-" +
      b.slice(20, 32).join("")
    );
  },
  isUuid: (a) => {
    const v = toS(a[0]);
    if (v.length !== 36) return false;
    for (let i = 0; i < 36; i++) {
      const c = v.charCodeAt(i);
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        if (c !== 45) return false;
      } else if (!((c >= 48 && c <= 57) || (c >= 97 && c <= 102) || (c >= 65 && c <= 70))) {
        return false;
      }
    }
    return true;
  },
};

// ══════════════════ kof.validation (S5/S6/S12) ══════════════════

function brDigits(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) out.push(c - 48);
  }
  return out;
}
function isHexC(c: number): boolean {
  return (c >= 48 && c <= 57) || (c >= 97 && c <= 102) || (c >= 65 && c <= 70);
}

const validationFns: Record<string, (a: KofVal[]) => KofVal> = {
  isCpf: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 11) return false;
    let allSame = true;
    for (let i = 1; i < 11; i++)
      if (d[i] !== d[0]) {
        allSame = false;
        break;
      }
    if (allSame) return false;
    let r1 = 0;
    for (let i = 0; i < 9; i++) r1 += d[i]! * (10 - i);
    r1 %= 11;
    if ((r1 < 2 ? 0 : 11 - r1) !== d[9]) return false;
    let r2 = 0;
    for (let i = 0; i < 10; i++) r2 += d[i]! * (11 - i);
    r2 %= 11;
    return (r2 < 2 ? 0 : 11 - r2) === d[10];
  },
  isCnpj: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 14) return false;
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let r1 = 0;
    for (let i = 0; i < 12; i++) r1 += d[i]! * w1[i]!;
    r1 %= 11;
    if ((r1 < 2 ? 0 : 11 - r1) !== d[12]) return false;
    let r2 = 0;
    for (let i = 0; i < 13; i++) r2 += d[i]! * w2[i]!;
    r2 %= 11;
    return (r2 < 2 ? 0 : 11 - r2) === d[13];
  },
  isCep: (a) => bool(brDigits(toS(a[0])).length === 8),
  isPis: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 11) return false;
    const w = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let r = 0;
    for (let i = 0; i < 10; i++) r += d[i]! * w[i]!;
    r %= 11;
    return (r < 2 ? 0 : 11 - r) === d[10];
  },
  isNis: (a) => validationFns["isPis"]!(a),
  formatCpf: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 11) return toS(a[0]);
    const s = d.join("");
    return s.slice(0, 3) + "." + s.slice(3, 6) + "." + s.slice(6, 9) + "-" + s.slice(9);
  },
  formatCep: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 8) return toS(a[0]);
    const s = d.join("");
    return s.slice(0, 5) + "-" + s.slice(5);
  },
  formatCnpj: (a) => {
    const d = brDigits(toS(a[0]));
    if (d.length !== 14) return toS(a[0]);
    const s = d.join("");
    return (
      s.slice(0, 2) +
      "." +
      s.slice(2, 5) +
      "." +
      s.slice(5, 8) +
      "/" +
      s.slice(8, 12) +
      "-" +
      s.slice(12)
    );
  },
  isIpv4: (a) => {
    const s = toS(a[0]);
    const n = s.length;
    let octets = 0;
    let val = 0;
    let digits = 0;
    for (let i = 0; i <= n; i++) {
      const c = i < n ? s.charCodeAt(i) : 46;
      if (c >= 48 && c <= 57) {
        if (digits === 0 && i < n && c === 48 && i + 1 < n && s.charCodeAt(i + 1) !== 46)
          return false;
        val = val * 10 + (c - 48);
        digits++;
        if (digits > 3) return false;
      } else if (c === 46) {
        if (digits === 0) return false;
        if (val > 255) return false;
        octets++;
        val = 0;
        digits = 0;
      } else return false;
    }
    return bool(octets === 4);
  },
  isIpv6: (a) => {
    const s = toS(a[0]);
    if (s.length === 0) return false;
    let i = 0;
    let g = 0;
    let dbl = -1;
    const n = s.length;
    while (i < n) {
      let h = 0;
      while (i < n && isHexC(s.charCodeAt(i)) && h < 5) {
        h++;
        i++;
      }
      if (h > 4) return false;
      if (h === 0) {
        if (i + 1 >= n || s.charCodeAt(i) !== 58 || s.charCodeAt(i + 1) !== 58) return false;
        if (dbl >= 0) return false;
        dbl = i;
        i += 2;
        continue;
      }
      g++;
      if (g > 8) return false;
      if (i >= n) break;
      if (s.charCodeAt(i) !== 58) return false;
      i++;
      if (i >= n) return false;
      if (s.charCodeAt(i) === 58) {
        if (dbl >= 0) return false;
        dbl = i;
        i++;
      }
    }
    return dbl < 0 ? bool(g === 8) : bool(g < 8);
  },
  isMac: (a) => {
    const s = toS(a[0]);
    if (s.length !== 17) return false;
    const sep = s.charCodeAt(2);
    if (sep !== 58 && sep !== 45) return false;
    for (let i = 0; i < 17; i++) {
      const c = s.charCodeAt(i);
      if ((i + 1) % 3 === 0) {
        if (c !== sep) return false;
      } else if (!isHexC(c)) return false;
    }
    return true;
  },
  isPort: (a) => {
    const p = Number(asNum(a[0]));
    return bool(p >= 1 && p <= 65535);
  },
  isCreditCard: (a) => {
    const s = toS(a[0]);
    const d: number[] = [];
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c >= 48 && c <= 57) {
        if (d.length === 19) return false;
        d.push(c - 48);
      }
    }
    const n = d.length;
    if (n < 12) return false;
    let sum = 0;
    for (let j = 0; j < n; j++) {
      let v = d[j]!;
      if (((n - 1 - j) & 1) === 1) {
        v *= 2;
        if (v > 9) v -= 9;
      }
      sum += v;
    }
    return bool(sum % 10 === 0);
  },
  isDomain: (a) => {
    const s = toS(a[0]);
    if (s.length === 0 || s.length > 253) return false;
    const domC = (c: number) =>
      (c >= 48 && c <= 57) || (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c === 45;
    let start = 0;
    let labels = 0;
    for (let i = 0; i <= s.length; i++) {
      if (i === s.length || s.charCodeAt(i) === 46) {
        const len = i - start;
        if (len < 1 || len > 63) return false;
        if (s.charCodeAt(start) === 45 || s.charCodeAt(i - 1) === 45) return false;
        for (let j = start; j < i; j++) if (!domC(s.charCodeAt(j))) return false;
        labels++;
        start = i + 1;
      }
    }
    if (labels < 2) return false;
    const dot = s.lastIndexOf(".");
    if (s.length - dot - 1 < 2) return false;
    for (let j = dot + 1; j < s.length; j++) {
      const c = s.charCodeAt(j);
      if (!((c >= 97 && c <= 122) || (c >= 65 && c <= 90))) return false;
    }
    return true;
  },
  isEmail: (a) => {
    const s = toS(a[0]);
    if (s.length < 3) return false;
    let at = -1;
    let cnt = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c === 32 || c === 9) return false;
      if (c === 64) {
        cnt++;
        at = i;
      }
    }
    if (cnt !== 1 || at <= 0 || at >= s.length - 1) return false;
    if (s.charCodeAt(s.length - 1) === 46) return false;
    const after = s.slice(at + 1);
    if (!after.includes(".")) return false;
    if (after.startsWith(".")) return false;
    return true;
  },
  isUrl: (a) => {
    const s = toS(a[0]);
    return s.startsWith("http://") || s.startsWith("https://");
  },
  isInt: (a) => {
    const s = toS(a[0]).trim();
    if (!/^[-+]?\d+$/.test(s)) return false;
    try {
      const n = Number(s);
      return Number.isInteger(n) && n >= -2147483648 && n <= 2147483647;
    } catch {
      return false;
    }
  },
  isLong: (a) => {
    const s = toS(a[0]).trim();
    if (!/^[-+]?\d+$/.test(s)) return false;
    try {
      const b = BigInt(s);
      return b >= -(2n ** 63n) && b <= 2n ** 63n - 1n;
    } catch {
      return false;
    }
  },
};

// ══════════════════ kof.net (S8) — mesma máquina de estados do kofNetSplit ══════════════════

function netSplit(u: string): string[] {
  const r = ["", "", "", "", "", ""];
  const cp = u.indexOf(":");
  let after = 0;
  if (cp > 0) {
    let ok = /[A-Za-z]/.test(u[0] ?? "");
    if (ok) {
      for (let i = 1; i < cp; i++) {
        if (!/[A-Za-z0-9+.\-]/.test(u[i] ?? "")) {
          ok = false;
          break;
        }
      }
    }
    if (ok) {
      r[0] = u.slice(0, cp);
      after = cp + 1;
    }
  }
  const tail = u.slice(after);
  const fp = tail.indexOf("#");
  const body = fp < 0 ? tail : tail.slice(0, fp);
  if (fp >= 0) r[5] = tail.slice(fp + 1);
  const qp = body.indexOf("?");
  if (qp >= 0) {
    r[3] = body.slice(0, qp);
    r[4] = body.slice(qp + 1);
  } else r[3] = body;
  if (r[3].startsWith("//")) {
    const a = r[3].slice(2);
    let cut = a.length;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === "/" || a[i] === "?" || a[i] === "#") {
        cut = i;
        break;
      }
    }
    let auth = a.slice(0, cut);
    r[3] = a.slice(cut);
    const at = auth.lastIndexOf("@");
    if (at >= 0) auth = auth.slice(at + 1);
    const hp = auth.indexOf(":");
    if (hp >= 0) {
      r[1] = auth.slice(0, hp);
      r[2] = auth.slice(hp + 1);
    } else r[1] = auth;
  }
  return r;
}

const netFns: Record<string, (a: KofVal[]) => KofVal> = {
  scheme: (a) => netSplit(toS(a[0]))[0]!,
  host: (a) => netSplit(toS(a[0]))[1]!,
  port: (a) => netSplit(toS(a[0]))[2]!,
  path: (a) => netSplit(toS(a[0]))[3]!,
  query: (a) => netSplit(toS(a[0]))[4]!,
  fragment: (a) => netSplit(toS(a[0]))[5]!,
  queryEncode: (a) => encodingFns["urlEncode"]!(a),
  queryDecode: (a) => encodingFns["urlDecode"]!(a),
};

// ══════════════════ kof.random (S10) — face sorteio; entropia do SO (crypto) ══════════════════

const randomFns: Record<string, (a: KofVal[], c: StdCtx) => KofVal> = {
  randomInt: (a, ctx) => ctx.randomInt(Number(asNum(a[0]))),
  randomBoolean: (_a, ctx) => bool((ctx.randomByte() & 1) === 1),
  randomString: (a, ctx) => {
    const n = Number(asNum(a[0]));
    const alphabet = toS(a[1]);
    if (n <= 0 || alphabet.length === 0) return "";
    let out = "";
    for (let i = 0; i < n; i++) out += alphabet.charAt(ctx.randomInt(alphabet.length));
    return out;
  },
  double: (_a, ctx) => {
    let hi = 0;
    for (let i = 0; i < 4; i++) hi = hi * 256 + ctx.randomByte();
    let lo = 0;
    for (let i = 0; i < 3; i++) lo = lo * 256 + ctx.randomByte();
    const v = (hi * 2 ** 21 + lo * 2 ** -3) % 2 ** 53;
    return v / 2 ** 53;
  },
  boolean: (_a, ctx) => bool((ctx.randomByte() & 1) === 1),
  int: (a, ctx) => ctx.randomInt(Number(asNum(a[0]))),
  hex: (a, ctx) => {
    const n = Number(asNum(a[0]));
    if (n <= 0) return null;
    const hexl = "0123456789abcdef";
    let out = "";
    for (let i = 0; i < n; i++) {
      const b = ctx.randomByte();
      out += hexl.charAt(b >> 4) + hexl.charAt(b & 15);
    }
    return out;
  },
  randomBytesHex: (a, ctx) => randomFns["hex"]!(a, ctx),
};

// ══════════════════ kof.security (parcial — sha256/hmac/porta) ══════════════════

function sha256Bytes(msg: number[]): number[] {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const len = msg.length;
  const bitLen = len * 8;
  const padded = new Uint8Array((((len + 8) >>> 6) << 6) + 64);
  padded.set(msg);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
  view.setUint32(padded.length - 4, bitLen >>> 0);
  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 =
        ((w[i - 15]! >>> 7) | (w[i - 15]! << 25)) ^
        ((w[i - 15]! >>> 18) | (w[i - 15]! << 14)) ^
        (w[i - 15]! >>> 3);
      const s1 =
        ((w[i - 2]! >>> 17) | (w[i - 2]! << 15)) ^
        ((w[i - 2]! >>> 19) | (w[i - 2]! << 13)) ^
        (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i]! + w[i]!) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  ov.setUint32(0, h0);
  ov.setUint32(4, h1);
  ov.setUint32(8, h2);
  ov.setUint32(12, h3);
  ov.setUint32(16, h4);
  ov.setUint32(20, h5);
  ov.setUint32(24, h6);
  ov.setUint32(28, h7);
  return Array.from(out);
}

function hmacSha256(keyBytes: number[], dataBytes: number[]): number[] {
  const blockSize = 64;
  let key = keyBytes;
  if (key.length > blockSize) key = sha256Bytes(key);
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = (key[i] || 0) ^ 0x36;
    opad[i] = (key[i] || 0) ^ 0x5c;
  }
  const inner = new Uint8Array(ipad.length + dataBytes.length);
  inner.set(ipad);
  inner.set(dataBytes, ipad.length);
  const innerHash = sha256Bytes(Array.from(inner));
  const outer = new Uint8Array(opad.length + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, opad.length);
  return sha256Bytes(Array.from(outer));
}

function bytesToHex(bytes: number[]): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i]!.toString(16).padStart(2, "0");
  return hex;
}

const securityFns: Record<string, (a: KofVal[], c: StdCtx) => KofVal> = {
  sha256: (a) => bytesToHex(sha256Bytes(utf8Bytes(toS(a[0])))),
  hmacSha256: (a) => bytesToHex(hmacSha256(utf8Bytes(toS(a[0])), utf8Bytes(toS(a[1])))),
  constantTimeEquals: (a) => {
    const x = toS(a[0]);
    const y = toS(a[1]);
    const ab = utf8Bytes(x);
    const bb = utf8Bytes(y);
    if (ab.length !== bb.length) return false;
    let diff = 0;
    for (let i = 0; i < ab.length; i++) diff |= ab[i]! ^ bb[i]!;
    return diff === 0;
  },
  redact: (a) => {
    const v = toS(a[0]);
    if (v.length <= 8) return "********";
    return v.substring(0, 4) + "********" + v.substring(v.length - 4);
  },
  randomHex: (a, ctx) => {
    const n = Number(asNum(a[0]));
    if (n < 0 || n > 4096) throw new KofRuntimeError(`invalid length: ${n}`);
    let out = "";
    for (let i = 0; i < n; i++) out += ctx.randomByte().toString(16).padStart(2, "0");
    return out;
  },
  randomInt: (a, ctx) => {
    const bound = Number(asNum(a[0]));
    if (bound <= 0) throw new KofRuntimeError("bound must be positive");
    return ctx.randomInt(bound);
  },
};

// ══════════════════ dispatch ══════════════════

export type Stdlib = (ns: string, fn: string, args: KofVal[], ctx: StdCtx) => KofVal | undefined;

const GROUPS: Record<string, Record<string, (a: KofVal[], c: StdCtx) => KofVal>> = {
  math: mathFns,
  strings: stringsFns as Record<string, (a: KofVal[], c: StdCtx) => KofVal>,
  encoding: encodingFns as Record<string, (a: KofVal[], c: StdCtx) => KofVal>,
  time: timeFns,
  uuid: uuidFns,
  validation: validationFns as Record<string, (a: KofVal[], c: StdCtx) => KofVal>,
  net: netFns as Record<string, (a: KofVal[], c: StdCtx) => KofVal>,
  random: randomFns,
  security: securityFns,
};

export const STDLIB_NAMESPACES = Object.keys(GROUPS);

/** namespaces que precisam de host real → gap honesto com código oficial */
const GAPPED: Record<string, string> = {
  io: "kof.io precisa do host KofJS (kof_platform) — no browser não existe: DB001/IO não disponível. Rode `kof run app.kf` local.",
  db: "kof.db exige libsqlite3/JDBC (host) — no target JS/browser é o gap DB001, reportado em compile-time pelo `kof check` oficial.",
  orm: "kof.orm depende de kof.db → DB001/ORM001 no browser.",
  http: "kof.http: no browser só fetch assíncrono (`var h = spawn http.get(url); await h` — §133); a face síncrona é HTTP003.",
  web: "kof.web server (`web.app()`/`listen`) roda no `kof serve` JVM — no JS é WEB001/WEB004.",
  ui: "kof.ui abre janela nativa/webview — na galeria do playground o preview é React fiel ao runtime.",
  config: "kof.config lê arquivo/env do host — indisponível no browser.",
  log: "kof.log usa console do host — no playground use println.",
  observability: "kof.observability (metrics/health) é do runtime host.",
};

export function callStdlib(ns: string, fn: string, args: KofVal[], ctx: StdCtx): KofVal {
  const group = GROUPS[ns];
  if (group) {
    const f = group[fn];
    if (!f) throw new KofRuntimeError(`\`${ns}.${fn}\` não existe na stdlib Kof 0.4.x`);
    return f(args, ctx);
  }
  if (GAPPED[ns]) throw new KofRuntimeError(GAPPED[ns]);
  throw new KofRuntimeError(
    `namespace \`${ns}\` não é da stdlib Kof (${STDLIB_NAMESPACES.join("/")}) [SEM011]`,
  );
}
