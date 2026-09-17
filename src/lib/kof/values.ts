/**
 * Semântica KofJS (Kof4j 0.4.0-beta) — portação fiel dos helpers do
 * kof-runtime.mjs real (JsRuntimeCore / JsRuntimeUiNumFmt / JsRuntimeUiLayout):
 * Double.toString do JDK (§264), divisão inteira truncante, wrap Int32,
 * Long=BigInt (§81), igualdade de conteúdo kofValEq (§104c), kofFormat (§107),
 * compareTo/2-arg clamps do JDK (§102), split-java (§111), casts saturantes
 * JLS 5.1.3 (§181), Map/Set com chave por conteúdo. List=Array, Map=Map,
 * Set=Set — exatamente como o backend JS armazena.
 */
import { type Val, type Param, type Block, type Expr, isFp, type FpVal } from "./parser";

export type Num = number | bigint;
export type KofList = KofVal[];
export type KofMap = Map<KofVal, KofVal>;
export type KofSet = Set<KofVal>;
/** D-NARROW (§216): Char imprime o CARÁTER (paridade 0.3.x+) */
export interface KofChar {
  __kofChar: number;
}
export type KofVal = Val | FpVal | KofChar | KofObj | KofList | KofMap | KofSet | null;

export function isKofChar(v: unknown): v is KofChar {
  return typeof v === "object" && v !== null && "__kofChar" in v;
}

/** ambiente léxico — closure captura a referência, não o snapshot */
export class Scope {
  vars = new Map<string, KofVal>();
  constructor(public parent: Scope | null = null) {}
  get(name: string): KofVal | undefined {
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) return s.vars.get(name);
      s = s.parent;
    }
    return undefined;
  }
  has(name: string): boolean {
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) return true;
      s = s.parent;
    }
    return false;
  }
  set(name: string, v: KofVal): void {
    let s: Scope | null = this;
    while (s) {
      if (s.vars.has(name)) {
        s.vars.set(name, v);
        return;
      }
      s = s.parent;
    }
    this.vars.set(name, v);
  }
  declare(name: string, v: KofVal): void {
    this.vars.set(name, v);
  }
}

export interface KofObj {
  __kof: true;
  kind: "record" | "object" | "enumConst" | "closure" | "handle";
  recType?: string;
  components?: { name: string; value: KofVal }[];
  clsType?: string;
  ns?: string;
  member?: string;
  enumName?: string;
  enumType?: string;
  label?: string;
  fnName?: string;
  ctorName?: string;
  enumStatic?: string;
  enumSelf?: KofObj;
  listOp?: string;
  mapOp?: string;
  setOp?: string;
  strOp?: string;
  recv?: KofVal;
  field?: string;
  recAccessor?: KofObj;
  recSpecial?: string;
  methodOn?: KofObj;
  method?: string;
  toStringOf?: KofVal;
  params?: Param[];
  body?: Block | Expr;
  scope?: Scope | null;
  self?: KofObj | null;
  done?: boolean;
  value?: KofVal;
  error?: unknown;
  kofToString?: () => string;
  kofHashCode?: () => number;
  [k: string]: unknown;
}

export function kofObj(kind: KofObj["kind"], extra: Record<string, unknown> = {}): KofObj {
  return { __kof: true, kind, ...extra } as KofObj;
}

export function isObj(v: unknown): v is KofObj {
  return typeof v === "object" && v !== null && "__kof" in v;
}
export function isList(v: unknown): v is KofList {
  return Array.isArray(v);
}
export function isMap(v: unknown): v is KofMap {
  return v instanceof Map;
}
export function isSet(v: unknown): v is KofSet {
  return v instanceof Set;
}

/** §264 / kofFpToString — formato Double.toString do JDK (paridade 5 alvos) */
export function kofFpToString(v: number, isFloat: boolean): string {
  if (v === null || v === undefined) return "null";
  if (Number.isNaN(v)) return "NaN";
  if (v === Infinity) return "Infinity";
  if (v === -Infinity) return "-Infinity";
  if (v === 0) return Object.is(v, -0) ? "-0.0" : "0.0";
  const d = isFloat ? Math.fround(v) : v;
  const neg = d < 0;
  const a = Math.abs(d);
  let sig: string | null = null;
  let exp = 0;
  const maxP = isFloat ? 9 : 17;
  for (let pr = 1; pr <= maxP; pr++) {
    const c = a.toExponential(pr - 1);
    const back = isFloat ? Math.fround(Number(c)) : Number(c);
    if (back === a) {
      const parts = c.split("e");
      sig = (parts[0] ?? "").replace(".", "").replace(/0+$/, "");
      exp = parseInt(parts[1] ?? "0", 10);
      break;
    }
  }
  if (sig === null || sig === "") {
    sig = String(a);
    exp = 0;
  }
  const lead = neg ? "-" : "";
  let out: string;
  if (exp >= -3 && exp < 7) {
    if (exp >= 0) {
      if (sig.length > exp + 1) out = sig.slice(0, exp + 1) + "." + sig.slice(exp + 1);
      else out = sig + "0".repeat(exp + 1 - sig.length) + ".0";
    } else {
      out = "0." + "0".repeat(-exp - 1) + sig;
    }
  } else {
    const m = sig.length > 1 ? sig.slice(0, 1) + "." + sig.slice(1) : sig + ".0";
    out = m + "E" + exp;
  }
  return lead + out;
}

export function fpNum(v: FpVal): number {
  return v.isFloat ? Math.fround(v.__kofFloat) : v.__kofFloat;
}

/** kofFormat/kofElem — println/concat de qualquer valor no contrato Kof */
export function kofStr(v: KofVal | undefined): string {
  if (v === null || v === undefined) return "null";
  if (isKofChar(v)) return String.fromCharCode(v.__kofChar);
  if (isFp(v as Val | FpVal)) {
    const f = v as FpVal;
    return kofFpToString(f.__kofFloat, f.isFloat);
  }
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") {
    if (Number.isNaN(v)) return "NaN";
    if (!Number.isInteger(v) || Math.abs(v) >= 1e15) return kofFpToString(v, false);
    return String(v);
  }
  if (typeof v === "string") return v;
  if (isMap(v)) {
    const parts: string[] = [];
    for (const [k, val] of v) parts.push(kofStr(k) + "=" + kofStr(val));
    return "{" + parts.join(", ") + "}";
  }
  if (isSet(v)) return "[" + [...v].map((e) => kofStr(e)).join(", ") + "]";
  if (isList(v)) return "[" + v.map((e) => kofStr(e)).join(", ") + "]";
  const o = v as KofObj;
  if (o.kind === "enumConst") return String(o.label);
  if (o.kind === "handle") return "Handle{}";
  if (o.kind === "record") {
    const comp = o.components as { name: string; value: KofVal }[];
    return `${o.recType}[${comp.map((c) => c.name + "=" + kofStr(c.value)).join(", ")}]`;
  }
  if (typeof o.kofToString === "function") return (o.kofToString as () => string).call(o);
  return String(o.clsType ?? "Object") + "{}";
}

/** kofValEq (§104c) — igualdade de conteúdo; objeto de classe = identidade */
export function kofEq(a: KofVal | undefined, b: KofVal | undefined): boolean {
  const an = a !== null && isFp(a as Val | FpVal) ? fpNum(a as FpVal) : a;
  const bn = b !== null && isFp(b as Val | FpVal) ? fpNum(b as FpVal) : b;
  if (typeof an === "number" && typeof bn === "number") {
    if (Number.isNaN(an) && Number.isNaN(bn)) return false; // IEEE — bug 94 congelado
    return an === bn;
  }
  if (typeof an === "bigint" || typeof bn === "bigint") {
    if (typeof an === typeof bn) return an === bn;
    if (typeof an === "number" && Number.isInteger(an)) return BigInt(an) === (bn as bigint);
    if (typeof bn === "number" && Number.isInteger(bn)) return (an as bigint) === BigInt(bn);
    return false;
  }
  if (an === null || an === undefined) return bn === null || bn === undefined;
  if (bn === null || bn === undefined) return false;
  if (typeof an === "string" || typeof an === "boolean")
    return typeof an === typeof bn && an === bn;
  if (isObj(an) && isObj(bn)) {
    if (an.kind !== bn.kind) return false;
    if (an.kind === "record") {
      if (an.recType !== bn.recType) return false;
      const x = an.components as { name: string; value: KofVal }[];
      const y = bn.components as { name: string; value: KofVal }[];
      return x.length === y.length && x.every((c, i) => kofEq(c.value, y[i]!.value));
    }
    if (an.kind === "enumConst") return an.enumType === bn.enumType && an.label === bn.label;
    return an === bn;
  }
  if (isList(an) && isList(bn))
    return an.length === bn.length && an.every((v, i) => kofEq(v, bn[i]!));
  if (isMap(an) && isMap(bn)) {
    if (an.size !== bn.size) return false;
    for (const [k, v] of an) {
      if (!bn.has(k) || !kofEq(v, bn.get(k)!)) {
        let found = false;
        for (const [k2, v2] of bn) {
          if (kofEq(k, k2) && kofEq(v, v2)) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
    }
    return true;
  }
  if (isSet(an) && isSet(bn))
    return an.size === bn.size && [...an].every((v) => [...bn].some((w) => kofEq(v, w)));
  if (isObj(an) && !isObj(bn)) return false;
  return an === bn;
}

export function asNum(v: KofVal | undefined): Num {
  if (v === null || v === undefined) return 0;
  if (isFp(v as Val | FpVal)) return fpNum(v as FpVal);
  if (typeof v === "number" || typeof v === "bigint") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  return 0;
}

export function asInt(v: KofVal | undefined): number {
  const n = asNum(v);
  if (typeof n === "bigint") return Number(BigInt.asIntN(32, n));
  return n | 0;
}

export function asLong(v: KofVal | undefined): bigint {
  const n = asNum(v);
  if (typeof n === "bigint") return n;
  return BigInt(Math.trunc(n) || 0);
}

export function wrapInt(x: number): number {
  return x | 0;
}
export function wrapLong(x: bigint): bigint {
  return BigInt.asIntN(64, x);
}

/** divisão truncante inteira (7/2 → 3 — expressions.pt_BR.md) */
export function intDiv(a: number, b: number): number {
  if (b === 0) throw new KofRuntimeError("/ by zero");
  return wrapInt(Math.trunc(a / b));
}
export function intMod(a: number, b: number): number {
  if (b === 0) throw new KofRuntimeError("/ by zero");
  return wrapInt(a % b);
}
export function longDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new KofRuntimeError("/ by zero");
  return wrapLong(a / b);
}
export function longMod(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new KofRuntimeError("/ by zero");
  return wrapLong(a % b);
}

/** kofSplit (§111) — regra Java: remove vazios TRAILING, exceto "" → [""] */
export function kofSplit(s: string, sep: string): string[] {
  const parts = s.split(sep);
  if (s === "") return [""];
  let end = parts.length;
  while (end > 0 && parts[end - 1] === "") end--;
  return parts.slice(0, end);
}

/** kofStringCompareTo (bug 97) — UTF-16 code-unit walk (sem localeCompare) */
export function kofCompareTo(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  const n = la < lb ? la : lb;
  for (let i = 0; i < n; i++) {
    const u = a.charCodeAt(i);
    const v = b.charCodeAt(i);
    if (u !== v) return u - v;
  }
  return la - lb;
}

/** kof_string_index_of2 / _last_index_of2 / _starts_with2 (§102) */
export function strIndexOf2(s: string, needle: string, from: number): number {
  const f = from < 0 ? 0 : from > s.length ? s.length : from;
  if (needle.length === 0) return f;
  if (needle.length > s.length) return -1;
  for (let i = f; i + needle.length <= s.length; i++) if (s.startsWith(needle, i)) return i;
  return -1;
}
export function strLastIndexOf2(s: string, needle: string, from: number): number {
  if (from < 0) return -1;
  const f = from > s.length ? s.length : from;
  if (needle.length === 0) return f;
  if (needle.length > s.length) return -1;
  for (let i = Math.min(f, s.length - needle.length); i >= 0; i--)
    if (s.startsWith(needle, i)) return i;
  return -1;
}
export function strStartsWith2(s: string, needle: string, from: number): boolean {
  if (from < 0 || from > s.length) return false;
  return s.startsWith(needle, from);
}

/** kofHashCode — Objects.hashCode/record JVM (31*h + unit UTF-16) */
export function kofHashCode(v: KofVal | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = isFp(v as Val | FpVal) ? fpNum(v as FpVal) : v;
  if (typeof n === "number") return n | 0;
  if (typeof n === "string") {
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (31 * h + n.charCodeAt(i)) | 0;
    return h;
  }
  if (typeof n === "boolean") return n ? 1 : 0;
  if (typeof n === "bigint") return Number(BigInt.asIntN(32, n));
  if (isObj(n) && typeof n.kofHashCode === "function")
    return (n.kofHashCode as () => number).call(n);
  return kofHashCode(kofStr(n));
}

/** kofD2I/kofD2L (§181) — casts saturantes JLS 5.1.3 */
export function kofD2I(v: number): number {
  if (Number.isNaN(v)) return 0;
  const t = Math.trunc(v);
  if (t > 2147483647) return 2147483647;
  if (t < -2147483648) return -2147483648;
  return t;
}
export function kofD2L(v: number): bigint {
  if (Number.isNaN(v)) return 0n;
  const t = Math.trunc(v);
  if (t > 9223372036854775807) return 9223372036854775807n;
  if (t < -9223372036854775807) return -9223372036854775807n;
  return BigInt(t);
}

/** erro de runtime Kof (throw String / bounds / stdlib) */
export class KofRuntimeError extends Error {
  readonly thrown: KofVal;
  readonly isThrow: boolean;
  constructor(message: string, thrown?: KofVal, isThrow = false) {
    super(message);
    this.thrown = thrown === undefined ? message : thrown;
    this.isThrow = isThrow;
  }
}

/** tipo-runtime p/ instanceof, casts e patterns (names sem tipo-arg) */
export function typeOf(v: KofVal | undefined): string {
  if (v === null || v === undefined) return "Null";
  if (typeof v === "string") return "String";
  if (typeof v === "boolean") return "Bool";
  if (typeof v === "bigint") return "Long";
  if (typeof v === "number") return "Int";
  if (isFp(v as Val | FpVal)) return (v as FpVal).isFloat ? "Float" : "Double";
  if (isList(v)) return "List";
  if (isMap(v)) return "Map";
  if (isSet(v)) return "Set";
  const o = v as KofObj;
  if (o.kind === "record") return String(o.recType);
  if (o.kind === "object") return String(o.clsType);
  if (o.kind === "enumConst") return String(o.enumType);
  return "Object";
}

export function truthy(v: KofVal | undefined): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0 && !Number.isNaN(v);
  if (typeof v === "bigint") return v !== 0n;
  if (isFp(v as Val | FpVal)) return fpNum(v as FpVal) !== 0;
  return true;
}
