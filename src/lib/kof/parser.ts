/**
 * Parser Kof (playground) — descida recursiva sobre a linguagem da 0.4.0-beta:
 * funções com tipo antes (`Int f()`) ou depois (`f(): Int`), expression body
 * (`Int dobro(Int x) = x*2`), main(), classes com construtor primário,
 * records, enums, if-expr, switch com record/type patterns + guards (SG-014),
 * lambdas `(x: Int) -> ...`, `spawn`/`await`, `new Int[n]`, try/catch/finally,
 * throw String, `as` cast, `instanceof` com binding, statements de topo
 * (modelo KofScript: viram corpo de `main`).
 */
import { type Tok, tokenize } from "./lexer";
import { KofDiag } from "./diag";

export type Val = string | number | bigint | boolean;

export interface Param {
  name: string;
  type: string | null;
  def: Expr | null;
}
export interface Pattern {
  type: "const" | "typeBind" | "record";
  expr?: Expr | undefined;
  varType?: string | undefined;
  name?: string | undefined;
  recType?: string | undefined;
  bindings?: string[] | undefined;
  guard?: Expr | undefined;
}
export interface SwitchClause {
  patterns: Pattern[];
  body: Node;
  isDefault: boolean;
  line: number;
}
export interface CatchClause {
  type: string;
  name: string;
  body: Block;
}

export interface Program {
  kind: "Program";
  decls: Node[];
}
export interface Block {
  kind: "Block";
  stmts: Node[];
}
export interface Fn {
  kind: "Fn";
  name: string;
  params: Param[];
  ret: string | null;
  body: Block;
  exprBody?: Expr;
  modifiers: string[];
  line: number;
}
export interface ClassDecl {
  kind: "Class";
  name: string;
  primary: Param[];
  superName: string | null;
  members: Node[];
  line: number;
}
export interface FieldDecl {
  kind: "FieldDecl";
  name: string;
  type: string | null;
  init: Expr | null;
  line: number;
}
export type Stmt =
  | Block
  | { kind: "VarDecl"; name: string; type: string | null; init: Expr; val: boolean; line: number }
  | { kind: "If"; cond: Expr; then: Node; els: Node | null }
  | { kind: "While"; cond: Expr; body: Node }
  | { kind: "DoWhile"; cond: Expr; body: Node }
  | { kind: "ForClassic"; init: Node | null; cond: Expr | null; step: Node | null; body: Node }
  | { kind: "ForIn"; name: string; iter: Expr; body: Node; line: number }
  | { kind: "Switch"; subject: Expr; clauses: SwitchClause[]; line: number }
  | { kind: "Return"; value: Expr | null; line: number }
  | { kind: "Break" | "Continue"; line: number }
  | { kind: "Throw"; value: Expr; line: number }
  | { kind: "Try"; body: Block; catches: CatchClause[]; finally_: Block | null }
  | { kind: "Assert"; cond: Expr; msg: Expr | null; line: number }
  | { kind: "PrintStmt"; name: "println" | "print"; args: Expr[]; line: number }
  | { kind: "ExprStmt"; expr: Expr }
  | { kind: "Assign"; target: Expr; op: string; value: Expr; line: number }
  | { kind: "IncDec"; target: Expr; op: "++" | "--"; prefix: boolean; line: number }
  | { kind: "Empty" };

export type Expr =
  | { kind: "Lit"; v: Val | FpVal; line: number }
  | { kind: "Null"; line: number }
  | { kind: "Id"; name: string; typeArgs: string[]; line: number }
  | { kind: "This"; line: number }
  | { kind: "Unary"; op: string; e: Expr; line: number }
  | { kind: "Binary"; op: string; left: Expr; right: Expr; line: number }
  | { kind: "Assign"; target: Expr; op: string; value: Expr; line: number }
  | { kind: "IncDec"; target: Expr; op: "++" | "--"; prefix: boolean; line: number }
  | { kind: "IfExpr"; cond: Expr; then: Expr; els: Expr; line: number }
  | { kind: "Call"; callee: Expr; args: Expr[]; line: number }
  | { kind: "Method"; obj: Expr; name: string; typeArgs: string[]; line: number }
  | { kind: "Index"; obj: Expr; index: Expr; line: number }
  | { kind: "Field"; obj: Expr; name: string; line: number }
  | { kind: "Cast"; e: Expr; to: string; line: number }
  | { kind: "InstanceOf"; e: Expr; type: string; binding: string | null; line: number }
  | { kind: "Lambda"; params: Param[]; body: Block | Expr; line: number }
  | { kind: "Spawn"; e: Expr; line: number }
  | { kind: "Await"; e: Expr; line: number }
  | { kind: "IncDec"; target: Expr; op: "++" | "--"; prefix: boolean; line: number }
  | { kind: "CollectionLit"; name: "listOf" | "mapOf" | "setOf" | "arrayOf"; args: Expr[]; typeArgs: string[]; line: number }
  | { kind: "NewArray"; elem: string; dims: Expr[]; line: number }
  | { kind: "NewObj"; type: string; args: Expr[]; line: number };

export interface FpVal {
  __kofFloat: number;
  isFloat: boolean;
}

export type Node = Program | Fn | ClassDecl | Stmt | Expr | RecordDecl | EnumDecl | FieldDecl;
export interface RecordDecl {
  kind: "Record";
  name: string;
  params: Param[];
  line: number;
}
export interface EnumDecl {
  kind: "Enum";
  name: string;
  consts: string[];
  line: number;
}

export function isFp(v: Val | FpVal): v is FpVal {
  return typeof v === "object" && v !== null && "__kofFloat" in v;
}

const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<=", ">>=", ">>>="]);
const TYPE_PRIMS: Record<string, string> = {
  string: "String",
  int: "Int",
  long: "Long",
  double: "Double",
  float: "Float",
  bool: "Bool",
  char: "Char",
  byte: "Byte",
  short: "Short",
  void: "Void",
};

const MODIFIERS = new Set([
  "public",
  "private",
  "protected",
  "static",
  "final",
  "abstract",
  "override",
  "native",
  "synchronized",
  "transient",
  "volatile",
]);

class Pr {
  toks: Tok[];
  pos = 0;
  constructor(src: string) {
    this.toks = tokenize(src);
  }
  peek(o = 0): Tok {
    return this.toks[Math.min(this.pos + o, this.toks.length - 1)]!;
  }
  at(v: string, o = 0): boolean {
    const t = this.peek(o);
    return (t.k === "kw" || t.k === "op" || t.k === "id") && t.v === v;
  }
  eat(v: string): boolean {
    if (this.at(v)) {
      this.pos++;
      return true;
    }
    return false;
  }
  expect(v: string): Tok {
    if (!this.at(v))
      throw new KofDiag(
        `esperado \`${v}\`, encontrado \`${this.peek().v || "fim do arquivo"}\``,
        "PARSE010",
        this.peek().line,
      );
    return this.toks[this.pos++]!;
  }
  expectId(what = "nome"): Tok {
    const t = this.peek();
    if (t.k !== "id")
      throw new KofDiag(
        `esperado ${what}, encontrado \`${t.v || "fim do arquivo"}\``,
        "PARSE010",
        t.line,
      );
    return this.toks[this.pos++]!;
  }
  end(): boolean {
    return this.peek().k === "eof";
  }
  semi(): void {
    if (this.at(";")) this.pos++;
  }
}

// ── tipos ────────────────────────────────────────────────────────────────

function parseTypeName(p: Pr): string | null {
  const t = p.peek();
  let base: string | null = null;
  if (t.k === "kw" && TYPE_PRIMS[t.v]) {
    p.pos++;
    base = TYPE_PRIMS[t.v]!;
  } else if (t.k === "id" && (t.v === "Bool" || /^[A-Z]/.test(t.v))) {
    p.pos++;
    base = t.v;
  } else return null;
  if (p.at("<")) {
    let depth = 0;
    let inner = "";
    do {
      const tk = p.peek();
      if (tk.k === "eof") break;
      if (tk.v === "<") depth++;
      if (tk.v === ">") depth--;
      if (depth > 0 || tk.v === ">") if (!(depth === 1 && tk.v === "<")) inner += tk.v;
      p.pos++;
    } while (!p.end() && depth > 0);
    base = `${base}<${inner.trim()}>`;
  }
  while (p.at("[") && p.peek(1).v === "]") {
    p.pos += 2;
    base += "[]";
  }
  while (p.at("?")) {
    p.pos++;
    base += "?";
  }
  return base;
}

/** lookahead: `Type id` (declaração tipada) sem confundir com expressão */
function looksLikeTypedDecl(p: Pr): boolean {
  const t = p.peek();
  const prim = t.k === "kw" && TYPE_PRIMS[t.v];
  const ident = t.k === "id" && /^[A-Z]/.test(t.v);
  if (!(prim || ident)) return false;
  let q = 1;
  if (p.peek(q).v === "<") {
    let depth = 0;
    for (;;) {
      const tk = p.peek(q);
      if (tk.k === "eof") return false;
      if (tk.v === "<") depth++;
      else if (tk.v === ">") {
        depth--;
        if (depth === 0) {
          q++;
          break;
        }
      }
      q++;
    }
  }
  while (p.peek(q).v === "[" && p.peek(q + 1).v === "]") q += 2;
  while (p.peek(q).v === "?") q++;
  return p.peek(q).k === "id";
}

// ── parâmetros e blocos ──────────────────────────────────────────────────

function parseParams(p: Pr): Param[] {
  p.expect("(");
  const params: Param[] = [];
  if (!p.at(")")) {
    do {
      if (p.at(")")) break;
      const type = looksLikeTypeInParam(p) ? (parseTypeName(p) ?? null) : null;
      const id = p.expectId("nome de parâmetro");
      let def: Expr | null = null;
      if (p.eat("=")) def = parseExpr(p);
      params.push({ name: id.v, type, def });
    } while (p.eat(","));
  }
  p.expect(")");
  return params;
}

function looksLikeTypeInParam(p: Pr): boolean {
  const t = p.peek();
  const prim = t.k === "kw" && TYPE_PRIMS[t.v];
  const ident = t.k === "id" && /^[A-Z]/.test(t.v);
  return Boolean(prim || ident);
}

function parseBlock(p: Pr): Block {
  p.expect("{");
  const stmts: Node[] = [];
  while (!p.at("}") && !p.end()) stmts.push(parseStmt(p));
  p.expect("}");
  return { kind: "Block", stmts: stmts as Stmt[] };
}

// ── statements ───────────────────────────────────────────────────────────

function parseStmt(p: Pr): Node {
  const line = p.peek().line;
  if (p.at(";")) {
    p.pos++;
    return { kind: "Empty" };
  }
  const t = p.peek();
  if (t.k === "kw") {
    switch (t.v) {
      case "var":
      case "val": {
        p.pos++;
        const id = p.expectId("nome de variável");
        let type: string | null = null;
        if (p.eat(":")) type = parseTypeName(p);
        const init: Expr = p.eat("=") ? parseExpr(p) : { kind: "Null", line };
        p.semi();
        return { kind: "VarDecl", name: id.v, type, init, val: t.v === "val", line };
      }
      case "if":
        return parseIfStmt(p);
      case "while": {
        p.pos++;
        const cond = parseParenExpr(p);
        return { kind: "While", cond, body: parseStmtOrBlock(p) };
      }
      case "do": {
        p.pos++;
        const body = parseStmtOrBlock(p);
        p.expect("while");
        const cond = parseParenExpr(p);
        p.semi();
        return { kind: "DoWhile", cond, body };
      }
      case "for":
        return parseFor(p);
      case "return": {
        p.pos++;
        let value: Expr | null = null;
        if (!p.at(";") && !p.at("}") && !p.end()) value = parseExpr(p);
        p.semi();
        return { kind: "Return", value, line };
      }
      case "break":
        p.pos++;
        p.semi();
        return { kind: "Break", line };
      case "continue":
        p.pos++;
        p.semi();
        return { kind: "Continue", line };
      case "throw": {
        p.pos++;
        const value = parseExpr(p);
        p.semi();
        return { kind: "Throw", value, line };
      }
      case "try": {
        p.pos++;
        const body = parseBlock(p);
        const catches: CatchClause[] = [];
        while (p.at("catch")) {
          p.pos++;
          p.expect("(");
          const type = parseTypeName(p) ?? "String";
          const id = p.expectId("nome do catch");
          p.expect(")");
          catches.push({ type, name: id.v, body: parseBlock(p) });
        }
        const finally_: Block | null = p.eat("finally") ? parseBlock(p) : null;
        return { kind: "Try", body, catches, finally_ };
      }
      case "assert": {
        p.pos++;
        p.expect("(");
        const cond = parseExpr(p);
        const msg: Expr | null = p.eat(",") ? parseExpr(p) : null;
        p.expect(")");
        p.semi();
        return { kind: "Assert", cond, msg, line };
      }
      case "switch":
        return parseSwitch(p);
      case "print":
      case "println": {
        p.pos++;
        const args: Expr[] = p.at("(") ? parseArgs(p) : [];
        p.semi();
        return { kind: "PrintStmt", name: t.v, args, line };
      }
    }
  }
  if (p.at("{")) return parseBlock(p);
  const s = parseExprStmt(p);
  p.semi();
  return s;
}

function parseExprStmt(p: Pr): Node {
  const line = p.peek().line;
  if (looksLikeTypedDecl(p)) {
    const type = parseTypeName(p);
    const id = p.expectId("nome de variável");
    const init: Expr = p.eat("=") ? parseExpr(p) : { kind: "Null", line };
    return { kind: "VarDecl", name: id.v, type, init, val: false, line };
  }
  const expr = parseExpr(p);
  const t = p.peek();
  if (t.k === "op" && ASSIGN_OPS.has(t.v)) {
    p.pos++;
    const value = parseExpr(p);
    return { kind: "Assign", target: expr, op: t.v, value, line };
  }
  if (t.k === "op" && (t.v === "++" || t.v === "--")) {
    p.pos++;
    return { kind: "IncDec", target: expr, op: t.v, prefix: false, line };
  }
  return { kind: "ExprStmt", expr };
}

function parseIfStmt(p: Pr): Node {
  p.pos++;
  const cond = parseParenExpr(p);
  const then = parseStmtOrBlock(p);
  let els: Node | null = null;
  if (p.at("else")) {
    p.pos++;
    els = p.at("if") ? parseIfStmt(p) : parseStmtOrBlock(p);
  }
  return { kind: "If", cond, then, els };
}

function parseFor(p: Pr): Node {
  const line = p.peek().line;
  p.pos++;
  p.expect("(");
  // for-in: (var x in iter)
  if ((p.at("var") || p.at("val")) && (p.peek(1).k === "id" && (p.peek(2).v === "in" || (p.peek(2).v === ":" && p.peek(4).v === "in")))) {
    p.pos++;
    const id = p.expectId();
    if (p.eat(":")) parseTypeName(p);
    p.expect("in");
    const iter = parseExpr(p);
    p.expect(")");
    return { kind: "ForIn", name: id.v, iter, body: parseStmtOrBlock(p), line };
  }
  let init: Node | null = null;
  if (!p.at(";")) {
    if (p.at("var") || p.at("val")) {
      const il = p.peek().line;
      const kw = p.peek().v;
      p.pos++;
      const id = p.expectId();
      let type: string | null = null;
      if (p.eat(":")) type = parseTypeName(p);
      const ini: Expr = p.eat("=") ? parseExpr(p) : { kind: "Null", line: il };
      init = { kind: "VarDecl", name: id.v, type, init: ini, val: kw === "val", line: il };
    } else if (looksLikeTypedDecl(p)) {
      const il = p.peek().line;
      const type = parseTypeName(p);
      const id = p.expectId();
      const ini: Expr = p.eat("=") ? parseExpr(p) : { kind: "Null", line: il };
      init = { kind: "VarDecl", name: id.v, type, init: ini, val: false, line: il };
    } else {
      init = parseExprStmt(p);
    }
  }
  p.expect(";");
  const cond: Expr | null = p.at(";") ? null : parseExpr(p);
  p.expect(";");
  let step: Node | null = null;
  if (!p.at(")")) step = parseExprStmt(p);
  p.expect(")");
  return { kind: "ForClassic", init, cond, step, body: parseStmtOrBlock(p) };
}

function parseSwitch(p: Pr): Node {
  const line = p.peek().line;
  p.pos++;
  const subject = parseParenExpr(p);
  p.expect("{");
  const clauses: SwitchClause[] = [];
  while (!p.at("}") && !p.end()) {
    if (p.at("default")) {
      p.pos++;
      p.expect(":");
      clauses.push({ patterns: [], body: parseCaseBody(p), isDefault: true, line });
      continue;
    }
    p.expect("case");
    const patterns: Pattern[] = [];
    do {
      patterns.push(parsePattern(p));
    } while (p.eat(","));
    p.expect(":");
    clauses.push({ patterns, body: parseCaseBody(p), isDefault: false, line });
  }
  p.expect("}");
  return { kind: "Switch", subject, clauses, line };
}

function parseCaseBody(p: Pr): Node {
  if (p.at("{")) {
    // bloco de caso; consome `break` opcional que vem depois do `}`
    const b = parseBlock(p);
    if (p.at("break")) {
      p.pos++;
      p.semi();
    }
    return b;
  }
  const stmts: Stmt[] = [];
  while (!p.at("}") && !p.at("case") && !p.at("default") && !p.end()) {
    const s = parseStmt(p);
    if (s.kind === "Break") break;
    stmts.push(s as Stmt);
  }
  return { kind: "Block", stmts };
}

function parsePattern(p: Pr): Pattern {
  const t = p.peek();
  const guard = (): Expr | undefined => {
    if (p.at("if")) {
      p.pos++;
      return parseExpr(p);
    }
    return undefined;
  };
  // record destructure: Point(x, y)
  if (t.k === "id" && /^[A-Z]/.test(t.v) && p.peek(1).v === "(") {
    const recType = t.v;
    p.pos += 2;
    const bindings: string[] = [];
    if (!p.at(")")) {
      do {
        const b = p.peek();
        if (b.v === "_") p.pos++;
        else bindings.push(p.expectId().v);
      } while (p.eat(","));
    }
    p.expect(")");
    return { type: "record", recType, bindings, guard: guard() };
  }
  // type bind: String s
  if (t.k === "id" && /^[A-Z]/.test(t.v) && p.peek(1).k === "id") {
    const varType = t.v;
    p.pos++;
    const name = p.expectId().v;
    return { type: "typeBind", varType, name, guard: guard() };
  }
  return { type: "const", expr: parseExpr(p), guard: guard() };
}

function parseStmtOrBlock(p: Pr): Node {
  if (p.at("{")) return parseBlock(p);
  return parseStmt(p);
}

function parseParenExpr(p: Pr): Expr {
  p.expect("(");
  const e = parseExpr(p);
  p.expect(")");
  return e;
}

// ── expressões ───────────────────────────────────────────────────────────

function parseExpr(p: Pr): Expr {
  const line = p.peek().line;
  if (p.at("if")) {
    p.pos++;
    const cond = parseParenExpr(p);
    const then = p.at("{") ? parseExprInBraces(p) : parseExpr(p);
    p.expect("else");
    const els = p.at("if") ? parseExpr(p) : p.at("{") ? parseExprInBraces(p) : parseExpr(p);
    return { kind: "IfExpr", cond, then, els, line };
  }
  let left = parseBinary(p, 0);
  const t = p.peek();
  if (t.k === "op" && ASSIGN_OPS.has(t.v)) {
    p.pos++;
    const value = parseExpr(p);
    return { kind: "Assign", target: left, op: t.v, value, line: t.line };
  }
  return left;
}

function parseExprInBraces(p: Pr): Expr {
  const b = parseBlock(p);
  const stmts = b.stmts;
  if (stmts.length === 1 && stmts[0]!.kind === "ExprStmt")
    return (stmts[0] as { expr: Expr }).expr;
  if (stmts.length === 1 && stmts[0]!.kind === "Return")
    return ((stmts[0] as { value: Expr }).value ?? { kind: "Null", line: 0 });
  throw new KofDiag("ramo de if-expr deve produzir um valor", "SEM033", p.peek().line);
}

const PREC: Record<string, number> = {
  "||": 1,
  "&&": 2,
  "|": 3,
  "^": 4,
  "&": 5,
  "==": 6,
  "!=": 6,
  "<": 7,
  ">": 7,
  "<=": 7,
  ">=": 7,
  "<<": 8,
  ">>": 8,
  ">>>": 8,
  "+": 9,
  "-": 9,
  "*": 10,
  "/": 10,
  "%": 10,
};

function parseBinary(p: Pr, minPrec: number): Expr {
  let left = parseUnary(p);
  for (;;) {
    if (p.at("as")) {
      const line = p.peek().line;
      p.pos++;
      const to = parseTypeName(p) ?? "Object";
      left = { kind: "Cast", e: left, to, line };
      continue;
    }
    if (p.at("instanceof")) {
      const line = p.peek().line;
      p.pos++;
      const type = parseTypeName(p) ?? p.expectId().v;
      let binding: string | null = null;
      if (p.peek().k === "id") binding = p.expectId().v;
      left = { kind: "InstanceOf", e: left, type, binding, line };
      continue;
    }
    const op = p.peek().v;
    const prec = PREC[op];
    if (prec === undefined || p.peek().k !== "op" || prec < minPrec) break;
    const line = p.peek().line;
    p.pos++;
    const right = parseBinary(p, prec + 1);
    left = { kind: "Binary", op, left, right, line };
  }
  return left;
}

function parseUnary(p: Pr): Expr {
  const t = p.peek();
  const line = t.line;
  if (t.k === "op" && (t.v === "!" || t.v === "-")) {
    p.pos++;
    return { kind: "Unary", op: t.v, e: parseUnary(p), line };
  }
  if (t.k === "op" && (t.v === "++" || t.v === "--")) {
    p.pos++;
    return { kind: "IncDec", target: parsePostfix(p, parsePrimary(p)), op: t.v, prefix: true, line } as unknown as Expr;
  }
  if (p.at("spawn")) {
    p.pos++;
    if (p.at("{")) return { kind: "Spawn", e: { kind: "Lambda", params: [], body: parseBlock(p), line }, line };
    return { kind: "Spawn", e: parseUnary(p), line };
  }
  if (p.at("await")) {
    p.pos++;
    return { kind: "Await", e: parseUnary(p), line };
  }
  return parsePostfix(p, parsePrimary(p));
}

const COLLECTION_FNS = new Set(["listOf", "mapOf", "setOf", "arrayOf"]);

function parseTypeArgs(p: Pr): string[] {
  // <T> em call de coleção/função genérica — lookahead simples balanceado
  if (!p.at("<")) return [];
  const save = p.pos;
  const args: string[] = [];
  try {
    let depth = 0;
    let cur = "";
    p.pos++;
    depth = 1;
    for (;;) {
      const tk = p.peek();
      if (tk.k === "eof") throw 0;
      if (tk.v === "<") depth++;
      else if (tk.v === ">") {
        depth--;
        if (depth === 0) {
          p.pos++;
          if (cur.trim()) args.push(cur.trim());
          break;
        }
      }
      if (tk.v === "," && depth === 1) {
        args.push(cur.trim());
        cur = "";
      } else cur += tk.v;
      p.pos++;
    }
    if (!p.at("(")) throw 0;
    return args;
  } catch {
    p.pos = save;
    return [];
  }
}

function parsePrimary(p: Pr): Expr {
  const t = p.peek();
  const line = t.line;
  if (t.k === "str") {
    p.pos++;
    return { kind: "Lit", v: t.v, line };
  }
  if (t.k === "chr") {
    p.pos++;
    return { kind: "Lit", v: t.v.codePointAt(0) ?? 0, line };
  }
  if (t.k === "num") {
    p.pos++;
    if (t.numKind === "Long") return { kind: "Lit", v: t.num as bigint, line };
    if (t.numKind === "Double" || t.numKind === "Float")
      return { kind: "Lit", v: { __kofFloat: t.num as number, isFloat: t.numKind === "Float" }, line };
    return { kind: "Lit", v: t.num as number, line };
  }
  if (t.k === "kw" && (t.v === "true" || t.v === "false")) {
    p.pos++;
    return { kind: "Lit", v: t.v === "true", line };
  }
  if (t.k === "kw" && t.v === "null") {
    p.pos++;
    return { kind: "Null", line };
  }
  if (t.k === "kw" && t.v === "this") {
    p.pos++;
    return { kind: "This", line } as unknown as Expr;
  }
  if (t.k === "kw" && t.v === "new") {
    p.pos++;
    const type = parseTypeName(p);
    if (!type) throw new KofDiag("esperado tipo após `new`", "PARSE044", line);
    if (p.at("[")) {
      const dims: Expr[] = [];
      while (p.at("[")) {
        p.pos++;
        dims.push(p.at("]") ? { kind: "Lit", v: 0, line } : parseExpr(p));
        p.expect("]");
      }
      return { kind: "NewArray", elem: type, dims, line };
    }
    const args = parseArgs(p);
    return { kind: "NewObj", type, args, line };
  }
  if (t.k === "op" && t.v === "(") {
    const save = p.pos;
    if (p.peek(1).v === ")") {
      const after = p.peek(2);
      if (after.v === "->") {
        p.pos += 2;
        p.expect("->");
        const body = p.at("{") ? parseBlock(p) : parseExpr(p);
        return { kind: "Lambda", params: [], body, line };
      }
    } else if (p.peek(1).k === "id" || p.peek(1).v === ":") {
      try {
        const params = parseParams(p);
        if (p.at("->")) {
          p.pos++;
          const body = p.at("{") ? parseBlock(p) : parseExpr(p);
          return { kind: "Lambda", params, body, line };
        }
        throw 0;
      } catch {
        p.pos = save;
      }
    }
    p.expect("(");
    const e = parseExpr(p);
    p.expect(")");
    return e;
  }
  if (t.k === "kw" && TYPE_PRIMS[t.v]) {
    // String.valueOf(x) — primitiva minúscula como receiver
    p.pos++;
    return { kind: "Id", name: TYPE_PRIMS[t.v]!, typeArgs: [], line };
  }
  if (t.k === "id") {
    p.pos++;
    if (COLLECTION_FNS.has(t.v) && p.at("(")) {
      const args = parseArgs(p);
      return {
        kind: "CollectionLit",
        name: t.v as "listOf" | "mapOf" | "setOf" | "arrayOf",
        args,
        typeArgs: [],
        line,
      };
    }
    if (COLLECTION_FNS.has(t.v) && p.at("<")) {
      const typeArgs = parseTypeArgs(p);
      const args = parseArgs(p);
      return {
        kind: "CollectionLit",
        name: t.v as "listOf" | "mapOf" | "setOf" | "arrayOf",
        args,
        typeArgs,
        line,
      };
    }
    const typeArgs = p.at("<") ? parseTypeArgs(p) : [];
    return { kind: "Id", name: t.v, typeArgs, line };
  }
  throw new KofDiag(`expressão inesperada \`${t.v || "fim do arquivo"}\``, "PARSE041", line);
}

function parsePostfix(p: Pr, base: Expr): Expr {
  let e = base;
  for (;;) {
    const t = p.peek();
    if (t.v === "." && t.k === "op") {
      const line = t.line;
      p.pos++;
      const m = p.peek();
      if (m.k !== "id" && m.k !== "kw")
        throw new KofDiag("esperado nome após `.`", "PARSE011", m.line);
      p.pos++;
      const typeArgs = p.at("<") ? parseTypeArgs(p) : [];
      if (p.at("(")) {
        const args = parseArgs(p);
        e = { kind: "Call", callee: { kind: "Method", obj: e, name: m.v, typeArgs, line }, args, line };
      } else {
        e = { kind: "Field", obj: e, name: m.v, line };
      }
      continue;
    }
    if (t.v === "[") {
      const line = t.line;
      p.pos++;
      const idx = parseExpr(p);
      p.expect("]");
      e = { kind: "Index", obj: e, index: idx, line };
      continue;
    }
    if (t.v === "(") {
      const line = t.line;
      const args = parseArgs(p);
      e = { kind: "Call", callee: e, args, line };
      continue;
    }
    break;
  }
  return e;
}

function parseArgs(p: Pr): Expr[] {
  p.expect("(");
  const args: Expr[] = [];
  if (!p.at(")")) {
    do {
      if (p.at(")")) break;
      args.push(parseExpr(p));
    } while (p.eat(","));
  }
  p.expect(")");
  return args;
}

// ── topo ─────────────────────────────────────────────────────────────────

function parseTop(p: Pr): Node {
  const line = p.peek().line;
  const modifiers: string[] = [];
  while (p.peek().k === "kw" && MODIFIERS.has(p.peek().v)) {
    modifiers.push(p.peek().v);
    p.pos++;
  }
  const t = p.peek();
  if (t.k === "kw" && (t.v === "class" || t.v === "entity")) {
    p.pos++;
    const name = p.expectId("nome de classe");
    const primary = p.at("(") ? parseParams(p) : [];
    let superName: string | null = null;
    if (p.eat("extends")) superName = p.expectId().v;
    if (p.eat("implements")) {
      do {
        p.expectId();
      } while (p.eat(","));
    }
    p.expect("{");
    const members: Node[] = [];
    while (!p.at("}") && !p.end()) members.push(parseMember(p));
    p.expect("}");
    p.semi();
    return { kind: "Class", name: name.v, primary, superName, members, line };
  }
  if (t.k === "kw" && t.v === "record") {
    p.pos++;
    const name = p.expectId("nome de record");
    const params = p.at("(") ? parseParams(p) : [];
    if (p.at("{")) {
      // membros de record ignorados no subset do playground — pula bloco
      let depth = 0;
      do {
        if (p.at("{")) depth++;
        if (p.at("}")) depth--;
        p.pos++;
      } while (!p.end() && depth > 0);
    }
    p.semi();
    return { kind: "Record", name: name.v, params, line };
  }
  if (t.k === "kw" && t.v === "enum") {
    p.pos++;
    const name = p.expectId("nome de enum");
    p.expect("{");
    const consts: string[] = [];
    if (!p.at("}")) {
      do {
        if (p.at("}")) break;
        consts.push(p.expectId().v);
        if (p.at("(")) {
          // constante com args — pula
          let depth = 0;
          do {
            if (p.at("(")) depth++;
            if (p.at(")")) depth--;
            p.pos++;
          } while (!p.end() && depth > 0);
        }
      } while (p.eat(","));
    }
    let depth = 0;
    if (p.at("{")) {
      do {
        if (p.at("{")) depth++;
        if (p.at("}")) depth--;
        p.pos++;
      } while (!p.end() && depth > 0);
    }
    p.expect("}");
    p.semi();
    return { kind: "Enum", name: name.v, consts, line };
  }
  if (t.k === "kw" && t.v === "interface") {
    p.pos++;
    p.expectId();
    while (!p.at("{") && !p.end()) p.pos++;
    let depth = 0;
    p.expect("{");
    depth = 1;
    while (!p.end() && depth > 0) {
      if (p.at("{")) depth++;
      if (p.at("}")) depth--;
      if (depth > 0) p.pos++;
    }
    p.expect("}");
    p.semi();
    return { kind: "Empty" };
  }
  // função: `Tipo nome(` | `nome(` | `nome(...): Tipo {`
  const retBefore = looksLikeFnHeadType(p) ? parseTypeName(p) : null;
  const idTok = p.peek();
  if (idTok.k === "id" && p.peek(1).v === "(" && looksLikeFnDecl(p, p.pos)) {
    p.pos++;
    const params = parseParams(p);
    const retAfter = p.eat(":") ? parseTypeName(p) : null;
    const ret = retAfter ?? retBefore;
    if (p.eat("=")) {
      const expr = parseExpr(p);
      p.semi();
      return { kind: "Fn", name: idTok.v, params, ret, body: { kind: "Block", stmts: [] }, exprBody: expr, modifiers, line };
    }
    const body = parseBlock(p);
    return { kind: "Fn", name: idTok.v, params, ret, body, modifiers, line };
  }
  if (modifiers.length) {
    // modificador sem declaração atrás — rejeita limpo
    throw new KofDiag(`esperado \`class\`/\`record\`/\`interface\`/função após \`${modifiers[modifiers.length - 1]}\``, "PARSE010", p.peek().line);
  }
  if (retBefore) {
    // `Tipo nome` sem `(` — declaração tipada de statement (var sem var)
    const nameTok = p.expectId("nome de variável");
    const ini: Expr = p.eat("=") ? parseExpr(p) : { kind: "Null", line };
    p.semi();
    return { kind: "VarDecl", name: nameTok.v, type: retBefore, init: ini, val: false, line };
  }
  return parseStmt(p);
}

/** após `nome(`: se o balanceamento fecha e vem `{`, `: Tipo {`, `= expr` → declaração */
function looksLikeFnDecl(p: Pr, _start: number): boolean {
  // peek() é relativo a p.pos (=== start): anda com offsets relativos
  let q = 2; // pula `nome` e `(`
  let depth = 1;
  for (;;) {
    const tk = p.peek(q);
    if (tk.k === "eof") return false;
    if (tk.v === "(") depth++;
    else if (tk.v === ")") {
      depth--;
      if (depth === 0) break;
    }
    q++;
  }
  q++;
  if (p.peek(q).v === "{") return true;
  if (p.peek(q).v === ":") {
    q++;
    if (p.peek(q).k === "kw" || p.peek(q).k === "id") {
      q++;
      while (p.peek(q).v === "<") {
        let d = 0;
        for (;;) {
          const tk = p.peek(q);
          if (tk.k === "eof") return false;
          if (tk.v === "<") d++;
          else if (tk.v === ">") {
            d--;
            if (d === 0) break;
          }
          q++;
        }
        q++;
      }
      while (p.peek(q).v === "[" && p.peek(q + 1).v === "]") q += 2;
      while (p.peek(q).v === "?") q++;
      return p.peek(q).v === "{" || p.peek(q).v === "=";
    }
    return false;
  }
  if (p.peek(q).v === "=" && p.peek(q + 1).v !== "=" && p.peek(q + 1).v !== ">") return true;
  return false;
}

function looksLikeFnHeadType(p: Pr): boolean {
  const t = p.peek();
  const prim = t.k === "kw" && TYPE_PRIMS[t.v] && t.v !== "void";
  const voidKw = t.k === "kw" && t.v === "void";
  const ident = t.k === "id" && /^[A-Z]/.test(t.v);
  if (!(prim || ident || voidKw)) return false;
  let q = 1;
  if (p.peek(q).v === "<") {
    let depth = 0;
    for (;;) {
      const tk = p.peek(q);
      if (tk.k === "eof") return false;
      if (tk.v === "<") depth++;
      else if (tk.v === ">") {
        depth--;
        if (depth === 0) {
          q++;
          break;
        }
      }
      q++;
    }
  }
  while (p.peek(q).v === "[" && p.peek(q + 1).v === "]") q += 2;
  while (p.peek(q).v === "?") q++;
  return p.peek(q).k === "id" && p.peek(q + 1).v === "(";
}

function parseMember(p: Pr): Node {
  const line = p.peek().line;
  while (p.peek().k === "kw" && MODIFIERS.has(p.peek().v)) p.pos++;
  const t = p.peek();
  if (t.k === "kw" && t.v === "constructor") {
    p.pos++;
    const params = p.at("(") ? parseParams(p) : [];
    return { kind: "Fn", name: "constructor", params, ret: null, body: parseBlock(p), modifiers: ["constructor"], line };
  }
  const save = p.pos;
  const retBefore = looksLikeFnHeadType(p) ? parseTypeName(p) : null;
  const idTok = p.peek();
  if (idTok.k === "id") {
    if (p.peek(1).v === "(") {
      p.pos++;
      const params = parseParams(p);
      const retAfter = p.eat(":") ? parseTypeName(p) : null;
      if (p.eat("=")) {
        const expr = parseExpr(p);
        p.semi();
        return { kind: "Fn", name: idTok.v, params, ret: retAfter ?? retBefore, body: { kind: "Block", stmts: [] }, exprBody: expr, modifiers: [], line };
      }
      return { kind: "Fn", name: idTok.v, params, ret: retAfter ?? retBefore, body: parseBlock(p), modifiers: [], line };
    }
    // campo: Tipo name [= init]
    const type = retBefore ?? (looksLikeTypeInParam(p) ? null : null);
    if (retBefore) {
      p.pos++;
      let init: Expr | null = null;
      if (p.eat("=")) init = parseExpr(p);
      p.semi();
      return { kind: "FieldDecl", name: idTok.v, type: retBefore, init, line };
    }
    // campo sem tipo não existe em Kof
    throw new KofDiag(
      `membro \`${idTok.v}\` sem tipo — declare \`Tipo nome\``,
      "PARSE010",
      line,
    );
  }
  p.pos = save;
  throw new KofDiag(`membro inválido \`${p.peek().v || "eof"}\``, "PARSE010", line);
}

export function parseProgram(src: string): Program {
  const p = new Pr(src);
  const decls: Node[] = [];
  const stmts: Stmt[] = []; // statements de topo → corpo de main (wrapPureKof)
  while (!p.end()) {
    if (p.at(";")) {
      p.pos++;
      continue;
    }
    if (p.at("package") || p.at("import")) {
      const startLine = p.peek().line;
      while (!p.end() && p.peek().line === startLine) p.pos++;
      p.eat(";");
      continue;
    }
    const t = p.peek();
    const isDecl =
      (t.k === "kw" &&
        (["class", "record", "enum", "interface", "entity"].includes(t.v) || MODIFIERS.has(t.v))) ||
      looksLikeFnHeadType(p) ||
      (t.k === "id" && p.peek(1).v === "(" && looksLikeFnDecl(p, p.pos));
    if (isDecl) {
      const d = parseTop(p) as Stmt | Program["decls"][number];
      if (d.kind === "Empty") continue;
      decls.push(d);
      continue;
    }
    stmts.push(parseStmt(p) as Stmt);
  }
  if (stmts.length > 0) {
    decls.push({
      kind: "Fn",
      name: "main",
      params: [],
      ret: null,
      body: { kind: "Block", stmts },
      modifiers: [],
      line: stmts[0] && "line" in stmts[0] ? (stmts[0] as { line: number }).line : 1,
    });
  }
  return { kind: "Program", decls: decls as Program["decls"] };
}
