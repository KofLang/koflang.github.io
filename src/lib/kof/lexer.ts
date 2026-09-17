/**
 * Lexer Kof — fiel à estrutura léxica documentada em
 * Kof4j/docs/language-reference/lexical-structure.md (Lexer.java 477 linhas):
 * maximal munch, keywords exatas, `fun`/`fn`/`func` reservadas (SG-001),
 * literais hex/long/float, escapes \n \t \r \\ \' \" \0 \uXXXX,
 * LEX001 (bloco não terminado), LEX002 (string não terminada).
 */
import { KofDiag } from "./diag";

export type TokKind = "id" | "kw" | "num" | "str" | "chr" | "op" | "eof";

export interface Tok {
  k: TokKind;
  v: string;
  line: number;
  /** valor pronto para numerais (com sufixo aplicado) */
  num?: number | bigint;
  numKind?: "Int" | "Long" | "Float" | "Double";
}

export const KEYWORDS = new Set([
  "class",
  "interface",
  "record",
  "enum",
  "entity",
  "generated",
  "unique",
  "extends",
  "implements",
  "package",
  "import",
  "public",
  "private",
  "protected",
  "static",
  "final",
  "abstract",
  "transient",
  "volatile",
  "synchronized",
  "native",
  "default",
  "override",
  "void",
  "new",
  "this",
  "super",
  "return",
  "throw",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "try",
  "catch",
  "finally",
  "spawn",
  "await",
  "assert",
  "instanceof",
  "var",
  "val",
  "as",
  "bool",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "char",
  "string",
  "true",
  "false",
  "null",
]);

/** Palavras RESERVADAS (SG-001): tokens próprios — nunca IDENTIFIER. */
export const RESERVED = new Set(["fun", "fn", "func"]);

const PRIMITIVE_TYPE_KEYWORDS = new Set([
  "bool",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "char",
  "string",
]);

const MULTI_OPS = [
  ">>>=",
  "<<=",
  ">>=",
  ">>>",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^=",
  "->",
  "::",
  "=>",
];

export function isTypeKeyword(v: string): boolean {
  return PRIMITIVE_TYPE_KEYWORDS.has(v) || v === "void";
}

const LONG_MAX = 9223372036854775807n;
const INT_MIN = -2147483648;
const INT_MAX = 2147483647;

/** só os dígitos (remove sufixo l/f/d que entrou no raw) */
function digitsOf(raw: string): string {
  return raw.replace(/[lLfFdD]$/, "");
}

export function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let line = 1;
  const n = src.length;

  const push = (t: Tok) => toks.push(t);
  const isIdStart = (c: string) => /[A-Za-z_$]/.test(c) || c.codePointAt(0)! > 127;
  const isIdPart = (c: string) => /[A-Za-z0-9_$]/.test(c) || c.codePointAt(0)! > 127;

  while (i < n) {
    const c = src[i]!;
    if (c === "\n") {
      line++;
      i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i++;
      continue;
    }
    // comentários
    if (c === "/" && src[i + 1] === "/") {
      while (i < n && src[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2;
      const startLine = line;
      let closed = false;
      while (i < n) {
        if (src[i] === "\n") line++;
        if (src[i] === "*" && src[i + 1] === "/") {
          i += 2;
          closed = true;
          break;
        }
        i++;
      }
      if (!closed) throw new KofDiag("comentário de bloco não terminado", "LEX001", startLine);
      continue;
    }
    // string
    if (c === '"') {
      const startLine = line;
      i++;
      let s = "";
      let closed = false;
      while (i < n) {
        const ch = src[i];
        if (ch === "\n") {
          line++;
          s += ch;
          i++;
          continue;
        }
        if (ch === '"') {
          i++;
          closed = true;
          break;
        }
        if (ch === "\\") {
          i++;
          const esc = src[i];
          const [val, adv] = readEscape(esc, src, i, line, startLine);
          s += val;
          if (esc === "\n") line++;
          i += adv;
          continue;
        }
        s += ch;
        i++;
      }
      if (!closed) throw new KofDiag("string não terminada", "LEX002", startLine);
      push({ k: "str", v: s, line: startLine });
      continue;
    }
    // char
    if (c === "'") {
      const startLine = line;
      i++;
      let s = "";
      if (src[i] === "\\") {
        const esc = src[i + 1];
        const [val, adv] = readEscape(esc, src, i + 1, line, startLine);
        s = val;
        i += 1 + adv;
      } else {
        s = src[i] ?? "";
        i++;
      }
      if (src[i] !== "'") throw new KofDiag("char não terminada", "LEX004", startLine);
      i++;
      push({ k: "chr", v: s, line: startLine });
      continue;
    }
    // números
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      const startLine = line;
      const start = i;
      let isDouble = false;
      let kind: Tok["numKind"] = "Int";
      let hex = false;
      if (c === "0" && (src[i + 1] === "x" || src[i + 1] === "X")) {
        hex = true;
        i += 2;
        while (i < n && /[0-9a-fA-F]/.test(src[i]!)) i++;
      } else {
        while (i < n && /[0-9]/.test(src[i]!)) i++;
        if (i < n && src[i] === "." && /[0-9]/.test(src[i + 1] ?? "")) {
          isDouble = true;
          i++;
          while (i < n && /[0-9]/.test(src[i]!)) i++;
        } else if (i < n && src[i] === ".") {
          // "1." → ponto decimal exige dígitos dos dois lados (PARSE039)
          throw new KofDiag('ponto decimal exige dígitos após "."', "PARSE039", startLine);
        }
        if (i < n && (src[i] === "e" || src[i] === "E")) {
          const save = i;
          i++;
          if (i < n && (src[i] === "+" || src[i] === "-")) i++;
          if (i < n && /[0-9]/.test(src[i]!)) {
            isDouble = true;
            while (i < n && /[0-9]/.test(src[i]!)) i++;
          } else {
            i = save;
          }
        }
      }
      let suffix = "";
      if (i < n && /[lLfFdD]/.test(src[i]!) && !isIdPart(src[i + 1] ?? "")) {
        suffix = src[i]!.toLowerCase();
        i++;
      }
      const raw = src.slice(start, i);
      if (hex) {
        push({ k: "num", v: raw, line: startLine, num: parseInt(raw, 16) | 0, numKind: "Int" });
        continue;
      }
      if (suffix === "l") kind = "Long";
      else if (suffix === "f") kind = "Float";
      else if (suffix === "d") kind = "Double";
      else if (isDouble) kind = "Double";
      if (kind === "Long") {
        const big = BigInt(digitsOf(raw));
        if (big > LONG_MAX) throw new KofDiag("literal Long fora do range", "PARSE084", startLine);
        push({ k: "num", v: raw, line: startLine, num: big, numKind: "Long" });
      } else if (kind === "Int") {
        const digits = digitsOf(raw);
        const val = Number(digits);
        if (val > INT_MAX || val < INT_MIN) {
          // inteiro sem sufixo que não cabe em Int vira Long (Lexer.java:325-328)
          push({ k: "num", v: raw, line: startLine, num: BigInt(digits), numKind: "Long" });
        } else {
          push({ k: "num", v: raw, line: startLine, num: val, numKind: "Int" });
        }
      } else {
        const val = parseFloat(raw.slice(0, raw.length - (suffix ? 1 : 0)));
        push({ k: "num", v: raw, line: startLine, num: val, numKind: kind });
      }
      continue;
    }
    // identificadores e keywords
    if (isIdStart(c)) {
      const start = i;
      while (i < n && isIdPart(src[i]!)) i++;
      const w = src.slice(start, i);
      if (RESERVED.has(w)) {
        throw new KofDiag(
          `\`${w}\` é palavra reservada — não existe em Kof (SG-001). Declare como \`Tipo nome(...) { }\` ou \`nome(...): Tipo { }\``,
          "PARSE085",
          line,
        );
      }
      if (KEYWORDS.has(w)) push({ k: "kw", v: w, line });
      else push({ k: "id", v: w, line });
      continue;
    }
    // operadores (maximal munch)
    let matched = false;
    for (const op of MULTI_OPS) {
      if (src.startsWith(op, i)) {
        push({ k: "op", v: op, line });
        i += op.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if ("+-*/%=<>!&|^~?:;,.(){}[]".includes(c)) {
      push({ k: "op", v: c, line });
      i++;
      continue;
    }
    throw new KofDiag(`caractere inesperado \`${c}\``, "LEX008", line);
  }
  push({ k: "eof", v: "", line });
  return toks;
}

/** escapes: \n \t \r \\ \' \" \0 \uXXXX; desconhecido colapsa para o próprio char */
function readEscape(
  esc: string | undefined,
  src: string,
  pos: number,
  _line: number,
  startLine: number,
): [string, number] {
  switch (esc) {
    case "n":
      return ["\n", 1];
    case "t":
      return ["\t", 1];
    case "r":
      return ["\r", 1];
    case "b":
      return ["\b", 1];
    case "f":
      return ["\f", 1];
    case "0":
      return ["\0", 1];
    case "\\":
      return ["\\", 1];
    case "'":
      return ["'", 1];
    case '"':
      return ['"', 1];
    case "u": {
      const hex = src.slice(pos + 1, pos + 5);
      if (!/^[0-9a-fA-F]{4}$/.test(hex))
        throw new KofDiag("\\u exige 4 dígitos hex", "LEX006", startLine);
      return [String.fromCharCode(parseInt(hex, 16)), 5];
    }
    default:
      return [esc ?? "", 1];
  }
}
