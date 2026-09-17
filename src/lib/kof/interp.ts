/**
 * Avaliador Kof (playground) — AST da 0.4.0-beta com semântica do backend JS
 * oficial (kof-runtime.mjs): records com toString/equals de conteúdo (§104c),
 * classes com construtor primário, enums com values()/valueOf()/name()/ordinal
 * + switch exaustivo (SEM031), pattern matching com guards (SG-014),
 * null-safety (SEM049), if-expr, lambdas com captura, spawn/await como o
 * event-loop cooperativo do KofJS (CONC003), try/catch/finally (String=erro,
 * throw-as-String), Char imprimindo o caráter (§216), divisão truncante,
 * wrap Int32, Long=BigInt (§81).
 */
import {
  type Program,
  type Block,
  type Fn,
  type ClassDecl,
  type RecordDecl,
  type EnumDecl,
  type Param,
  type Node,
  type Expr,
  type Pattern,
  type SwitchClause,
  type SwitchExprClause,
  type Val,
  type FpVal,
  isFp,
} from "./parser";
import {
  type KofVal,
  type KofObj,
  type KofList,
  type KofMap,
  type KofSet,
  type KofChar,
  isKofChar,
  kofObj,
  isObj,
  isList,
  isMap,
  isSet,
  kofEq,
  kofStr,
  asNum,
  asInt,
  wrapInt,
  wrapLong,
  intDiv,
  intMod,
  longDiv,
  longMod,
  kofCompareTo,
  kofHashCode,
  kofD2I,
  kofD2L,
  truthy,
  typeOf,
  KofRuntimeError,
  strIndexOf2,
  strLastIndexOf2,
  strStartsWith2,
  kofSplit,
  fpNum,
  Scope,
} from "./values";
import { callStdlib, type StdCtx, STDLIB_NAMESPACES } from "./stdlib";
import { KofDiag } from "./diag";

// ── ambiente ─────────────────────────────────────────────────────────────

class Flow {
  constructor(
    public type: "return" | "break" | "continue",
    public value?: KofVal,
  ) {}
}

interface ClassDef {
  decl: ClassDecl;
  fields: { name: string; type: string | null }[];
  ctor: Fn | null;
  methods: Map<string, Fn>;
  prim: Param[];
  superName: string | null;
}

interface KofThrow {
  __kofthrow: true;
  value: KofVal;
}

function asKofThrow(e: unknown): KofThrow | null {
  if (e && typeof e === "object" && "__kofthrow" in (e as object)) return e as KofThrow;
  return null;
}

export class KofInterpreter {
  prog: Program;
  ctx: StdCtx;
  funcs = new Map<string, Fn[]>();
  classes = new Map<string, ClassDef>();
  records = new Map<string, RecordDecl>();
  enums = new Map<string, EnumDecl>();
  enumOrder = new Map<string, number>();
  out: string[] = [];
  step = 0;
  activeTasks = 0;
  taskPromises = new Set<Promise<void>>();
  static MAX_STEPS = 10_000_000;
  static MAX_WALL_MS = 12_000;
  private deadline = 0;

  constructor(prog: Program, ctx: StdCtx) {
    this.prog = prog;
    this.ctx = ctx;
  }

  register(): void {
    for (const d of this.prog.decls) {
      if (d.kind === "Fn") this.defFn(d);
      else if (d.kind === "Class") this.defClass(d);
      else if (d.kind === "Record") this.defRecord(d);
      else if (d.kind === "Enum") this.defEnum(d);
    }
  }

  private defFn(d: Fn): void {
    const list = this.funcs.get(d.name) ?? [];
    const clash = list.find((o) => o.params.length === d.params.length && sameParamTypes(o, d));
    if (clash)
      throw new KofDiag(
        `função \`${d.name}\` declarada duas vezes com a mesma assinatura`,
        "SEM047",
        d.line,
      );
    list.push(d);
    this.funcs.set(d.name, list);
  }

  private defClass(d: ClassDecl): void {
    const fields: { name: string; type: string | null }[] = [];
    const methods = new Map<string, Fn>();
    let ctor: Fn | null = null;
    for (const m of d.members) {
      if (m.kind === "Fn") {
        if (m.name === "constructor") {
          if (ctor && ctor.params.length === m.params.length)
            throw new KofDiag(`construtor duplicado em \`${d.name}\``, "SEM061", m.line);
          ctor = m;
        } else methods.set(m.name, m);
      } else if (m.kind === "FieldDecl") {
        fields.push({ name: m.name, type: m.type });
      }
    }
    this.classes.set(d.name, {
      decl: d,
      fields,
      ctor,
      methods,
      prim: d.primary,
      superName: d.superName,
    });
  }

  private defRecord(d: RecordDecl): void {
    this.records.set(d.name, d);
  }

  private defEnum(d: EnumDecl): void {
    this.enums.set(d.name, d);
    d.consts.forEach((c, i) => this.enumOrder.set(`${d.name}.${c}`, i));
  }

  async run(): Promise<string> {
    this.register();
    this.deadline = Date.now() + KofInterpreter.MAX_WALL_MS;
    const mains = this.funcs.get("main") ?? [];
    const main = mains.find((o) => o.params.length === 0);
    if (main) {
      const scope = new Scope();
      try {
        await this.execBlock(main.body, scope, null);
      } catch (e) {
        if (e instanceof Flow) {
          /* main retornou */
        } else if (e instanceof KofDiag) throw e;
        else {
          const t = asKofThrow(e);
          if (t) throw new KofRuntimeError(`uncaught: ${kofStr(t.value)}`, t.value, true);
          throw e;
        }
      }
    }
    // KofJS: tasks spawnadas completam antes da saída do módulo
    let guard = 0;
    while (this.taskPromises.size > 0 && guard++ < 200) {
      await Promise.race([Promise.allSettled([...this.taskPromises]), sleep(50)]);
      if (Date.now() > this.deadline) break;
    }
    return this.out.join("\n");
  }

  private tick(): void {
    if (++this.step % 4096 === 0 && Date.now() > this.deadline)
      throw new KofDiag("tempo limite excedido (loop sem fim?)", "RUN001", 0);
    if (this.step > KofInterpreter.MAX_STEPS)
      throw new KofDiag("limite de passos atingido (loop sem fim?)", "RUN001", 0);
  }

  // ── statements ─────────────────────────────────────────────────────────

  private async execBlock(b: Block, scope: Scope, self: KofObj | null): Promise<void> {
    const inner = new Scope(scope);
    for (const s of b.stmts) await this.exec(s, inner, self);
  }

  private async exec(n: Node, scope: Scope, self: KofObj | null): Promise<void> {
    this.tick();
    switch (n.kind) {
      case "Block":
        return this.execBlock(n, scope, self);
      case "VarDecl": {
        const v = await this.eval(n.init, scope, self);
        scope.declare(n.name, coerce(n.type, v));
        return;
      }
      case "If": {
        if (truthy(await this.eval(n.cond, scope, self))) await this.exec(n.then, scope, self);
        else if (n.els) await this.exec(n.els, scope, self);
        return;
      }
      case "While": {
        while (truthy(await this.eval(n.cond, scope, self))) {
          this.tick();
          try {
            await this.exec(n.body, scope, self);
          } catch (f) {
            if (f instanceof Flow && f.type === "break") break;
            if (f instanceof Flow && f.type === "continue") continue;
            throw f;
          }
        }
        return;
      }
      case "DoWhile": {
        do {
          this.tick();
          try {
            await this.exec(n.body, scope, self);
          } catch (f) {
            if (f instanceof Flow && f.type === "break") break;
            if (f instanceof Flow && f.type === "continue") continue;
            throw f;
          }
        } while (truthy(await this.eval(n.cond, scope, self)));
        return;
      }
      case "ForClassic": {
        const outer = new Scope(scope);
        if (n.init) await this.exec(n.init, outer, self);
        for (;;) {
          this.tick();
          if (n.cond && !truthy(await this.eval(n.cond, outer, self))) break;
          try {
            await this.exec(n.body, outer, self);
          } catch (f) {
            if (f instanceof Flow && f.type === "break") break;
            if (f instanceof Flow && f.type === "continue") {
              /* cai no step */
            } else throw f;
          }
          if (n.step) await this.exec(n.step, outer, self);
        }
        return;
      }
      case "ForIn": {
        const it = await this.eval(n.iter, scope, self);
        if (typeof it === "string")
          throw new KofDiag(
            "for-in sobre String é rejeitado — String não é coleção",
            "SEM058",
            n.line,
          );
        if (isMap(it)) throw new KofDiag("for-in sobre Map — itere `m.keys()`", "SEM058", n.line);
        const items: KofVal[] = isList(it) ? it : isSet(it) ? [...it] : [];
        outer: for (const item of items) {
          this.tick();
          const inner = new Scope(scope);
          inner.declare(n.name, item);
          try {
            await this.exec(n.body, inner, self);
          } catch (f) {
            if (f instanceof Flow && f.type === "break") break;
            if (f instanceof Flow && f.type === "continue") continue outer;
            throw f;
          }
        }
        return;
      }
      case "Switch":
        return this.execSwitch(n.subject, n.clauses, scope, self, n.line);
      case "Return":
        throw new Flow("return", n.value ? await this.eval(n.value, scope, self) : null);
      case "Break":
        throw new Flow("break");
      case "Continue":
        throw new Flow("continue");
      case "Throw": {
        const v = await this.eval(n.value, scope, self);
        const err: KofThrow = { value: v, __kofthrow: true };
        throw err;
      }
      case "Try": {
        let pendingFlow: Flow | null = null;
        let pendingThrow: KofThrow | null = null;
        try {
          try {
            await this.execBlock(n.body, scope, self);
          } catch (e) {
            if (e instanceof Flow) {
              pendingFlow = e;
            } else {
              const t = asKofThrow(e);
              if (!t) throw e; // erro nativo do runtime (bounds, parse) NÃO é catchable — só `throw` pega
              let caught = false;
              for (const c of n.catches) {
                if (catchMatches(c.type, t.value)) {
                  const inner = new Scope(scope);
                  inner.declare(c.name, t.value);
                  try {
                    await this.execBlock(c.body, inner, self);
                  } catch (e2) {
                    if (e2 instanceof Flow) pendingFlow = e2;
                    else throw e2;
                  }
                  caught = true;
                  break;
                }
              }
              if (!caught) pendingThrow = t;
            }
          }
        } finally {
          // DD-01: finally roda em todos os caminhos (normal/catch/return/propagação)
          if (n.finally_) await this.execBlock(n.finally_, scope, self);
        }
        if (pendingThrow) throw pendingThrow;
        if (pendingFlow) throw pendingFlow;
        return;
      }
      case "Assert": {
        if (!truthy(await this.eval(n.cond, scope, self))) {
          const msg = n.msg ? kofStr(await this.eval(n.msg, scope, self)) : "assert falhou";
          throw new KofRuntimeError(`Assertion failed: ${msg}`);
        }
        return;
      }
      case "PrintStmt": {
        const parts: string[] = [];
        for (const a of n.args) parts.push(kofStr(await this.eval(a, scope, self)));
        const s = parts.join(" ");
        if (n.name === "println") this.out.push(s);
        else if (this.out.length === 0) this.out.push(s);
        else this.out[this.out.length - 1] = (this.out[this.out.length - 1] ?? "") + s;
        return;
      }
      case "ExprStmt":
        await this.eval(n.expr, scope, self);
        return;
      case "Assign": {
        const v = await this.eval(n.value, scope, self);
        await this.assign(n.target, n.op, v, scope, self);
        return;
      }
      case "IncDec": {
        const old = await this.eval(n.target, scope, self);
        const next =
          typeof old === "bigint"
            ? wrapLong(old + (n.op === "++" ? 1n : -1n))
            : isKofChar(old)
              ? ({ __kofChar: old.__kofChar + (n.op === "++" ? 1 : -1) } as KofChar)
              : wrapInt(asInt(old) + (n.op === "++" ? 1 : -1));
        await this.assignTarget(n.target, next, scope, self);
        return;
      }
      case "Empty":
        return;
      default:
        await this.eval(n as unknown as Expr, scope, self);
    }
  }

  private async assignTarget(
    target: Expr,
    v: KofVal,
    scope: Scope,
    self: KofObj | null,
  ): Promise<void> {
    if (target.kind === "Id") {
      if (!scope.has(target.name))
        throw new KofDiag(
          `variável \`${target.name}\` não declarada — use \`var\``,
          "SEM011",
          target.line,
        );
      scope.set(target.name, v);
      return;
    }
    if (target.kind === "Field") {
      const obj = await this.eval(target.obj, scope, self);
      if (obj === null) throw new KofDiag("dereference de null", "SEM049", target.line);
      if (isObj(obj)) {
        if (obj.kind === "record")
          throw new KofDiag(
            `record \`${obj.recType}\` é imutável — campo \`${target.name}\``,
            "SEM033",
            target.line,
          );
        (obj as Record<string, unknown>)[target.name] = v;
        return;
      }
      throw new KofRuntimeError("não dá para atribuir aí");
    }
    if (target.kind === "Index") {
      const obj = await this.eval(target.obj, scope, self);
      const idx = Number(asInt(await this.eval(target.index, scope, self)));
      if (isList(obj)) {
        if (idx < 0 || idx >= obj.length) {
          const isArr = (obj as KofList & { __kofArray?: boolean }).__kofArray;
          throw new KofRuntimeError(
            isArr
              ? `Array index out of bounds: ${idx} (length ${obj.length})`
              : `Index out of bounds: ${idx} (size ${obj.length})`,
          );
        }
        obj[idx] = v;
        return;
      }
      throw new KofRuntimeError("subscript só em List/array");
    }
    throw new KofDiag(
      "alvo de atribuição inválido",
      "PARSE010",
      (target as { line?: number }).line ?? 0,
    );
  }

  private async assign(
    target: Expr,
    op: string,
    v: KofVal,
    scope: Scope,
    self: KofObj | null,
  ): Promise<void> {
    if (op === "=") return this.assignTarget(target, v, scope, self);
    const cur = await this.eval(target, scope, self);
    const r = await this.binary(op.slice(0, -1), cur, v, (target as { line?: number }).line ?? 0);
    await this.assignTarget(target, r, scope, self);
  }

  // ── switch com patterns + exaustividade ────────────────────────────────

  private async execSwitch(
    subjectE: Expr,
    clauses: SwitchClause[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<void> {
    const subject = await this.eval(subjectE, scope, self);
    for (const c of clauses) {
      for (const pat of c.patterns) {
        const bind = await this.matchPattern(pat, subject, scope, self);
        if (!bind) continue;
        try {
          await this.exec(c.body, bind, self);
        } catch (f) {
          if (f instanceof Flow && f.type === "break") return;
          throw f;
        }
        return;
      }
    }
    // SEM031 — switch sobre enum sem default e incompleto não compila
    if (isObj(subject) && subject.kind === "enumConst") {
      const en = String(subject.enumType);
      const ed = this.enums.get(en);
      if (ed && !clauses.some((c) => c.isDefault)) {
        const covered = new Set<string>();
        for (const c of clauses)
          for (const p of c.patterns) {
            if (p.type !== "const" || !p.expr) continue;
            const e = p.expr;
            if (e.kind === "Field" && e.obj.kind === "Id") covered.add(`${e.obj.name}.${e.name}`);
            else if (e.kind === "Id" && ed.consts.includes(e.name)) covered.add(`${en}.${e.name}`);
          }
        const missing = ed.consts.filter((x) => !covered.has(`${en}.${x}`));
        if (missing.length > 0)
          throw new KofDiag(
            `switch sobre \`${en}\` não cobre: ${missing.join(", ")} (adicione default ou os casos faltantes)`,
            "SEM031",
            line,
          );
      }
    }
  }

  private async evalSwitchExpr(
    subjectE: Expr,
    clauses: SwitchExprClause[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<KofVal> {
    const subject = await this.eval(subjectE, scope, self);
    let defaultBody: Expr | null = null;
    for (const c of clauses) {
      if (c.isDefault) {
        defaultBody = c.body;
        continue;
      }
      for (const pat of c.patterns) {
        const bind = await this.matchPattern(pat, subject, scope, self);
        if (!bind) continue;
        return this.eval(c.body, bind, self);
      }
    }
    if (defaultBody) return this.eval(defaultBody, scope, self);
    if (isObj(subject) && subject.kind === "enumConst") {
      const en = String(subject.enumType);
      const ed = this.enums.get(en);
      if (ed) {
        const covered = new Set<string>();
        for (const c of clauses)
          for (const p of c.patterns) {
            if (p.type !== "const" || !p.expr) continue;
            const e = p.expr;
            if (e.kind === "Field" && e.obj.kind === "Id") covered.add(`${e.obj.name}.${e.name}`);
            else if (e.kind === "Id" && ed.consts.includes(e.name)) covered.add(`${en}.${e.name}`);
          }
        const missing = ed.consts.filter((x) => !covered.has(`${en}.${x}`));
        if (missing.length > 0)
          throw new KofDiag(
            `switch-expr sobre \`${en}\` não cobre: ${missing.join(", ")} (adicione default)`,
            "SEM031",
            line,
          );
      }
    }
    throw new KofDiag("switch-expr sem ramo correspondente (inacessível)", "SEM031", line);
  }

  private async matchPattern(
    pat: Pattern,
    subject: KofVal,
    scope: Scope,
    self: KofObj | null,
  ): Promise<Scope | null> {
    const inner = new Scope(scope);
    if (pat.type === "const" && pat.expr) {
      const e = pat.expr;
      let v: KofVal;
      if (e.kind === "Field" && e.obj.kind === "Id" && this.enums.has(e.obj.name))
        v = kofObj("enumConst", { enumType: e.obj.name, label: e.name });
      else if (e.kind === "Id" && /^[A-Z]/.test(e.name)) {
        v = null;
        for (const [en, ed] of this.enums) {
          if (ed.consts.includes(e.name)) {
            v = kofObj("enumConst", { enumType: en, label: e.name });
            break;
          }
        }
        if (v === null) v = await this.eval(e, scope, self);
      } else v = await this.eval(e, scope, self);
      if (!kofEq(subject, v)) return null;
      if (pat.guard && !truthy(await this.eval(pat.guard, inner, self))) return null;
      return inner;
    }
    if (pat.type === "typeBind" && pat.varType && pat.name) {
      if (!instanceMatches(pat.varType, subject)) return null;
      inner.declare(pat.name, subject);
      if (pat.guard && !truthy(await this.eval(pat.guard, inner, self))) return null;
      return inner;
    }
    if (pat.type === "record" && pat.recType) {
      if (!isObj(subject) || subject.kind !== "record" || subject.recType !== pat.recType)
        return null;
      const comp = subject.components as { name: string; value: KofVal }[];
      (pat.bindings ?? []).forEach((b, i) => inner.declare(b, comp[i]?.value ?? null));
      if (pat.guard && !truthy(await this.eval(pat.guard, inner, self))) return null;
      return inner;
    }
    return null;
  }

  // ── expressões ─────────────────────────────────────────────────────────

  async eval(e: Expr, scope: Scope, self: KofObj | null): Promise<KofVal> {
    this.tick();
    switch (e.kind) {
      case "Lit": {
        const v = e.v as Val | FpVal | KofChar;
        return v;
      }
      case "Null":
        return null;
      case "This":
        return self;
      case "Id":
        return this.evalId(e.name, e.line, scope, self);
      case "Unary": {
        const v = await this.eval(e.e, scope, self);
        if (e.op === "!") return !truthy(v);
        if (e.op === "-") {
          if (typeof v === "bigint") return wrapLong(-v);
          if (isFp(v as Val | FpVal)) {
            const f = v as FpVal;
            return { __kofFloat: -f.__kofFloat, isFloat: f.isFloat };
          }
          const n = asNum(v);
          if (typeof n === "bigint") return wrapLong(-n);
          return Number.isInteger(n) ? wrapInt(-n) : -n;
        }
        return null;
      }
      case "Binary":
        return this.binary(
          e.op,
          await this.eval(e.left, scope, self),
          await this.eval(e.right, scope, self),
          e.line,
        );
      case "Assign": {
        const v = await this.eval(e.value, scope, self);
        await this.assign(e.target, e.op, v, scope, self);
        return v;
      }
      case "IfExpr": {
        if (truthy(await this.eval(e.cond, scope, self)))
          return await this.eval(e.then, scope, self);
        return await this.eval(e.els, scope, self);
      }
      case "Lambda":
        return kofObj("closure", { params: e.params, body: e.body, scope, self });
      case "Spawn":
        return this.evalSpawn(e.e, scope, self);
      case "Await":
        return this.evalAwait(await this.eval(e.e, scope, self));
      case "Cast":
        return this.evalCast(await this.eval(e.e, scope, self), e.to, e.line);
      case "InstanceOf": {
        const v = await this.eval(e.e, scope, self);
        const ok = instanceMatches(e.type, v);
        if (ok && e.binding) scope.declare(e.binding, v);
        return ok;
      }
      case "CollectionLit":
        return this.evalCollection(e.name, e.args, scope, self, e.line);
      case "NewArray": {
        const dims: number[] = [];
        for (const d of e.dims) dims.push(Number(asInt(await this.eval(d, scope, self))));
        const zero: KofVal =
          e.elem === "Long"
            ? 0n
            : e.elem === "Bool"
              ? false
              : e.elem === "Double" || e.elem === "Float"
                ? 0.0
                : e.elem === "Char"
                  ? ({ __kofChar: 0 } as KofChar)
                  : e.elem === "Int" || e.elem === "Short" || e.elem === "Byte"
                    ? 0
                    : null;
        const build = (ds: number[]): KofList => {
          const len = ds[0] ?? 0;
          const arr = new Array(len) as KofList & { __kofArray?: boolean; __kofElem?: string };
          arr.__kofArray = true;
          arr.__kofElem = e.elem;
          if (ds.length === 1) arr.fill(zero);
          else for (let i = 0; i < len; i++) (arr as KofList)[i] = build(ds.slice(1));
          return arr;
        };
        return build(dims);
      }
      case "NewObj": {
        const args: KofVal[] = [];
        for (const a of e.args) args.push(await this.eval(a, scope, self));
        return await this.construct(e.type, args, e.line);
      }
      case "SwitchExpr":
        return this.evalSwitchExpr(e.subject, e.clauses, scope, self, e.line);
      case "Field":
        return this.evalField(e.obj, e.name, e.line, scope, self);
      case "Index": {
        const obj = await this.eval(e.obj, scope, self);
        const idx = Number(asInt(await this.eval(e.index, scope, self)));
        if (typeof obj === "string")
          throw new KofDiag("subscript em String é rejeitado — use `.charAt(i)`", "SEM054", e.line);
        if (isMap(obj) || isSet(obj))
          throw new KofDiag(
            `subscript em ${isMap(obj) ? "Map" : "Set"} é rejeitado — use .get(k)/iterar`,
            "SEM054",
            e.line,
          );
        if (isList(obj)) {
          const isArr = (obj as KofList & { __kofArray?: boolean }).__kofArray;
          if (idx < 0 || idx >= obj.length)
            throw new KofRuntimeError(
              isArr
                ? `Array index out of bounds: ${idx} (length ${obj.length})`
                : `Index out of bounds: ${idx} (size ${obj.length})`,
            );
          return obj[idx]!;
        }
        throw new KofRuntimeError("subscript só em List/array");
      }
      case "Call":
        return this.evalCall(e.callee, e.args, scope, self, e.line);
      case "Method":
        throw new KofDiag(`\`.${e.name}\` sem chamada`, "PARSE041", e.line);
      default:
        throw new KofDiag(
          `expressão não suportada no playground (${(e as { kind: string }).kind})`,
          "PARSE041",
          (e as { line?: number }).line ?? 0,
        );
    }
  }

  private evalId(name: string, line: number, scope: Scope, self: KofObj | null): KofVal {
    if (scope.has(name)) return scope.get(name) ?? null;
    if (
      STDLIB_NAMESPACES.includes(name) ||
      name === "json" ||
      name === "db" ||
      name === "http" ||
      name === "web" ||
      name === "String" ||
      name === "Object" ||
      name === "Int" ||
      name === "Long" ||
      name === "Double" ||
      name === "Float" ||
      name === "Boolean"
    )
      return kofObj("object", { clsType: name, ns: name });
    if (this.funcs.has(name)) return kofObj("closure", { fnName: name, scope, self });
    if (this.records.has(name)) return kofObj("closure", { ctorName: name });
    if (this.classes.has(name)) return kofObj("closure", { ctorName: name });
    if (this.enums.has(name)) return kofObj("object", { ns: "enum", enumName: name });
    throw new KofDiag(`\`${name}\` não declarada neste escopo`, "SEM011", line);
  }

  private async evalField(
    objE: Expr,
    name: string,
    line: number,
    scope: Scope,
    self: KofObj | null,
  ): Promise<KofVal> {
    if (objE.kind === "Id" && this.enums.has(objE.name)) {
      const en = objE.name;
      const ed = this.enums.get(en)!;
      if (ed.consts.includes(name)) return kofObj("enumConst", { enumType: en, label: name });
      if (name === "values") return kofObj("closure", { enumStatic: en, method: "values" });
      if (name === "valueOf") return kofObj("closure", { enumStatic: en, method: "valueOf" });
    }
    if (
      objE.kind === "Id" &&
      (STDLIB_NAMESPACES.includes(objE.name) ||
        ["json", "String", "Int", "Long", "Double", "Float", "Boolean", "Object"].includes(
          objE.name,
        ))
    ) {
      return kofObj("object", { ns: objE.name, member: name });
    }
    const obj = await this.eval(objE, scope, self);
    return this.getField(obj, name, line, scope, self);
  }

  private getField(
    obj: KofVal,
    name: string,
    line: number,
    scope: Scope,
    self: KofObj | null,
  ): KofVal {
    if (obj === null || obj === undefined) throw new KofDiag("dereference de null", "SEM049", line);
    if (
      isObj(obj) &&
      typeof obj.ns === "string" &&
      (STDLIB_NAMESPACES.includes(obj.ns) ||
        obj.ns === "json" ||
        ["String", "Int", "Long", "Double", "Float", "Boolean", "Object"].includes(obj.ns))
    ) {
      return kofObj("object", { ns: obj.ns, member: name });
    }
    if (isList(obj)) {
      const k = obj as KofList & { __kofArray?: boolean };
      if (name === "size" || name === "length" || name === "count") return k.length;
      if (name === "isEmpty") return k.length === 0;
      if (
        k.__kofArray &&
        ["add", "get", "set", "remove", "clear", "map", "filter", "reduce"].includes(name)
      )
        throw new KofDiag(
          `array é fixo — sem \`.${name}\`: use arr[i] e arr.length`,
          "SEM028",
          line,
        );
      if (
        [
          "add",
          "push",
          "append",
          "get",
          "set",
          "contains",
          "remove",
          "clear",
          "indexOf",
          "map",
          "filter",
          "reduce",
          "forEach",
          "toString",
          "size",
        ].includes(name)
      )
        return kofObj("closure", { listOp: name, recv: k, scope, self });
      throw new KofDiag(`List não tem \`.${name}\``, "SEM011", line);
    }
    if (isMap(obj)) {
      if (
        [
          "put",
          "get",
          "remove",
          "contains",
          "containsKey",
          "size",
          "keys",
          "values",
          "clear",
          "isEmpty",
          "forEach",
          "toString",
        ].includes(name)
      )
        return kofObj("closure", { mapOp: name, recv: obj, scope, self });
      if (name === "size") return obj.size;
      throw new KofDiag(`Map não tem \`.${name}\``, "SEM011", line);
    }
    if (isSet(obj)) {
      if (
        ["add", "contains", "remove", "size", "clear", "isEmpty", "forEach", "toString"].includes(
          name,
        )
      )
        return kofObj("closure", { setOp: name, recv: obj, scope, self });
      throw new KofDiag(`Set não tem \`.${name}\``, "SEM011", line);
    }
    if (isObj(obj)) {
      if (obj.kind === "enumConst") {
        if (name === "name") return kofObj("closure", { enumSelf: obj, method: "name" });
        if (name === "ordinal") return kofObj("closure", { enumSelf: obj, method: "ordinal" });
      }
      if (obj.kind === "record") {
        const comp = obj.components as { name: string; value: KofVal }[];
        const found = comp.find((c) => c.name === name);
        if (found) return found.value;
        if (name === "toString" || name === "equals" || name === "hashCode")
          return kofObj("closure", { recSpecial: name, recv: obj });
        throw new KofDiag(
          `record \`${obj.recType}\` não tem componente \`${name}\``,
          "SEM011",
          line,
        );
      }
      if (name in obj && name !== "toString")
        return (obj as Record<string, unknown>)[name] as KofVal;
      if (
        obj.kind === "object" &&
        typeof obj.clsType === "string" &&
        this.classes.has(String(obj.clsType))
      ) {
        return kofObj("closure", { methodOn: obj, method: name, scope, self });
      }
      if (name === "toString") return kofObj("closure", { toStringOf: obj });
      if (name === "hashCode") return kofHashCode(obj as KofVal);
      throw new KofDiag(`\`.${name}\` não existe em \`${typeOf(obj)}\``, "SEM011", line);
    }
    if (typeof obj === "string") {
      if (name === "length") return obj.length;
      if (
        [
          "charAt",
          "substring",
          "contains",
          "startsWith",
          "endsWith",
          "indexOf",
          "lastIndexOf",
          "toUpperCase",
          "toLowerCase",
          "trim",
          "replace",
          "split",
          "equals",
          "equalsIgnoreCase",
          "compareTo",
          "isEmpty",
          "hashCode",
          "toString",
          "toInt",
          "toLong",
          "toDouble",
          "toFloat",
        ].includes(name)
      )
        return kofObj("closure", { strOp: name, recv: obj, scope, self });
      throw new KofDiag(`String não tem \`.${name}\``, "SEM011", line);
    }
    if (
      (typeof obj === "number" && !Number.isInteger(obj)) ||
      isFp(obj as Val | FpVal) ||
      typeof obj === "bigint" ||
      typeof obj === "boolean" ||
      isKofChar(obj)
    ) {
      if (name === "toString") return kofObj("closure", { toStringOf: obj });
      if (name === "hashCode") return kofHashCode(obj);
    }
    throw new KofDiag(`\`.${name}\` não existe em \`${typeOf(obj)}\``, "SEM011", line);
  }

  // ── chamada ────────────────────────────────────────────────────────────

  private async evalCall(
    callee: Expr,
    argExprs: Expr[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<KofVal> {
    const args: KofVal[] = [];
    for (const a of argExprs) args.push(await this.eval(a, scope, self));
    if (callee.kind === "Id") {
      const r = await this.callByName(callee.name, args, scope, self, line);
      if (r !== NO_MATCH) return r;
    }
    if (callee.kind === "Method") {
      const objE = callee.obj;
      if (objE.kind === "Id" && this.enums.has(objE.name)) {
        const ed = this.enums.get(objE.name)!;
        if (callee.name === "values")
          return ed.consts.map((c) => kofObj("enumConst", { enumType: objE.name, label: c }));
        if (callee.name === "valueOf") return enumValueOf(ed, args[0]);
        throw new KofDiag(`enum \`${objE.name}\` não tem \`${callee.name}\``, "SEM011", line);
      }
      if (objE.kind === "Id" && this.isStaticNs(objE.name)) {
        return this.staticCall(objE.name, callee.name, args, line);
      }
      const recv = await this.eval(objE, scope, self);
      if (isObj(recv) && typeof recv.ns === "string" && this.isStaticNs(recv.ns)) {
        return this.staticCall(
          recv.ns,
          recv.member ? String(recv.member) : callee.name,
          args,
          line,
        );
      }
      if (
        isObj(recv) &&
        recv.kind === "enumConst" &&
        (callee.name === "name" || callee.name === "ordinal")
      ) {
        if (callee.name === "name") return String(recv.label);
        return this.enumOrder.get(`${recv.enumType}.${recv.label}`) ?? 0;
      }
      return this.callMethod(recv, callee.name, args, scope, self, line);
    }
    if (callee.kind === "Field") {
      const f = await this.eval(callee, scope, self);
      return this.invoke(f, args, line);
    }
    const f = await this.eval(callee, scope, self);
    return this.invoke(f, args, line);
  }

  private isStaticNs(name: string): boolean {
    return STDLIB_NAMESPACES.includes(name) || ["json", "db", "http", "web"].includes(name);
  }

  private async staticCall(ns: string, fn: string, args: KofVal[], line: number): Promise<KofVal> {
    if (ns === "json") return this.jsonCall(fn, args, line);
    if (ns === "db")
      throw new KofRuntimeError(
        "kof.db exige libsqlite3/JDBC do host — no browser/JS puro é o gap DB001 (o `kof check` oficial reporta em compile-time)",
        undefined,
        true,
      );
    if (ns === "http") return this.httpCall(fn, args);
    if (ns === "web")
      throw new KofRuntimeError(
        "kof.web server roda no `kof serve` (JVM) — WEB001/WEB004 nos outros targets; no browser é gap honesto",
        undefined,
        true,
      );
    if (ns === "String") {
      if (fn === "valueOf") return kofStr(args[0] ?? null);
      if (fn === "format")
        throw new KofRuntimeError(
          "String.format: gap COMP002 no target JS puro (paridade §239)",
          undefined,
          true,
        );
      throw new KofDiag(`String não tem método estático \`${fn}\``, "SEM011", line);
    }
    if (["Int", "Long", "Double", "Float", "Boolean"].includes(ns)) {
      const s = kofStr(args[0] ?? "");
      if (
        fn === "parseInt" ||
        fn === "parseLong" ||
        fn === "parseDouble" ||
        fn === "parseFloat" ||
        fn === "parseBoolean"
      ) {
        return parseStatic(ns, fn, s);
      }
      if (fn === "toString" && (ns === "Int" || ns === "Long")) {
        const radix = args[1] !== undefined ? Number(asInt(args[1])) : 10;
        return (
          typeof args[0] === "bigint" ? args[0] : BigInt(wrapInt(asInt(args[0] ?? 0)))
        ).toString(radix >>> 0 ? radix : 10);
      }
      if (fn === "toHexString")
        return (
          typeof args[0] === "bigint" ? args[0] : BigInt(wrapInt(asInt(args[0] ?? 0)) >>> 0)
        ).toString(16);
      if (fn === "toBinaryString")
        return (
          typeof args[0] === "bigint" ? args[0] : BigInt(wrapInt(asInt(args[0] ?? 0)) >>> 0)
        ).toString(2);
      throw new KofDiag(`\`${ns}\` não tem método estático \`${fn}\``, "SEM011", line);
    }
    return callStdlib(ns, fn, args, this.ctx);
  }

  private async httpCall(fn: string, args: KofVal[]): Promise<KofVal> {
    const url = kofStr(args[0] ?? "");
    if (typeof fetch === "undefined")
      throw new KofRuntimeError(
        `HTTP003: kof.http.${fn} — sem transporte neste ambiente (o browser tem fetch; Node do playground não rodou aqui)`,
        undefined,
        true,
      );
    const method =
      {
        get: "GET",
        post: "POST",
        put: "PUT",
        delete: "DELETE",
        patch: "PATCH",
        options: "OPTIONS",
      }[fn] ?? "GET";
    const body =
      fn === "post" || fn === "put" || fn === "patch"
        ? args[1] !== undefined
          ? kofStr(args[1])
          : undefined
        : undefined;
    // face síncrona no JS puro = Promise cru (§133/HTTP004); await resolve
    return await fetch(url, { method, ...(body !== undefined ? { body } : {}) }).then(async (r) => {
      if (!r.ok) throw new KofRuntimeError(`HTTP ${r.status} from ${url}`, undefined, true);
      return await r.text();
    });
  }

  private jsonCall(fn: string, args: KofVal[], line: number): KofVal {
    if (fn === "encode") return jsonStringify(args[0] ?? null);
    if (fn === "decode") {
      const text = kofStr(args[0] ?? "");
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new KofRuntimeError(
          `json.decode: JSON inválido: ${text.slice(0, 40)}`,
          undefined,
          true,
        );
      }
      return fromJsValue(parsed);
    }
    throw new KofDiag(`json não tem \`${fn}\` (só encode/decode)`, "SEM011", line);
  }

  private async callByName(
    name: string,
    args: KofVal[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<KofVal | typeof NO_MATCH> {
    const NO = NO_MATCH;
    if (name === "println") {
      this.out.push(args.map(kofStr).join(" "));
      return null;
    }
    if (name === "print") {
      const s = args.map(kofStr).join(" ");
      if (this.out.length === 0) this.out.push(s);
      else this.out[this.out.length - 1] = (this.out[this.out.length - 1] ?? "") + s;
      return null;
    }
    if (name === "listOf" || name === "arrayOf") {
      const arr = args.slice() as KofList & { __kofArray?: boolean };
      if (name === "arrayOf") arr.__kofArray = true;
      return arr;
    }
    if (name === "mapOf") {
      let m = new Map<KofVal, KofVal>();
      for (let i = 0; i + 1 < args.length; i += 2) m = mapPut(m, args[i]!, args[i + 1]!) as KofMap;
      return m;
    }
    if (name === "setOf") {
      const s = new Set<KofVal>();
      for (const a of args) if (![...s].some((e) => kofEq(e, a))) s.add(a);
      return s;
    }
    if (this.records.has(name)) return this.construct(name, args, line);
    if (this.classes.has(name)) return this.construct(name, args, line);
    const fns = this.funcs.get(name);
    if (fns) return this.invokeFunc(fns, args, line);
    if (scope.has(name)) {
      const v = scope.get(name);
      return this.invoke(v ?? null, args, line);
    }
    void NO;
    return NO_MATCH;
  }

  private invokeFunc(overloads: Fn[], args: KofVal[], line: number): Promise<KofVal> | KofVal {
    const candidates = overloads.filter((o) => argsCompatible(o.params, args));
    if (candidates.length === 0) {
      if (overloads.length > 1)
        throw new KofDiag("chamada ambígua entre overloads", "SEM057", line);
      const o = overloads[0]!;
      const required = o.params.filter((p) => !p.def).length;
      if (args.length < required || args.length > o.params.length)
        throw new KofDiag(
          `\`${o.name}\` espera ${required}-${o.params.length} argumento(s), recebeu ${args.length}`,
          "SEM013",
          line,
        );
      return this.callFn(o, args, null);
    }
    if (candidates.length > 1) {
      // desempate Long>Int widening etc: pega o mais específico simples (mesmo arity → ambíguo)
      const best = candidates[0]!;
      const tie = candidates.some((c) => c !== best && c.params.length === best.params.length);
      if (tie) throw new KofDiag("chamada ambígua entre overloads", "SEM057", line);
      return this.callFn(best, args, null);
    }
    return this.callFn(candidates[0]!, args, null);
  }

  private async callFn(d: Fn, args: KofVal[], self: KofObj | null): Promise<KofVal> {
    const scope = new Scope(null);
    for (let i = 0; i < d.params.length; i++) {
      const p = d.params[i]!;
      let v: KofVal = i < args.length ? args[i]! : null;
      if (v === null && p.def && i >= args.length) v = await this.eval(p.def, scope, self);
      scope.declare(p.name, coerce(p.type, v));
    }
    if (d.exprBody) return this.eval(d.exprBody, scope, self);
    try {
      await this.execBlock(d.body, scope, self);
    } catch (f) {
      if (f instanceof Flow && f.type === "return") return f.value ?? null;
      throw f;
    }
    return null;
  }

  private async invoke(f: KofVal, args: KofVal[], line: number): Promise<KofVal> {
    if (!isObj(f)) throw new KofDiag("não é chamável", "SEM001", line);
    if (f.fnName) {
      const fd = this.funcs.get(String(f.fnName));
      if (fd) return await this.invokeFunc(fd, args, line);
    }
    if (f.ctorName) return this.construct(String(f.ctorName), args, line);
    if (f.enumStatic) {
      const en = String(f.enumStatic);
      const ed = this.enums.get(en)!;
      if (f.method === "values")
        return ed.consts.map((c) => kofObj("enumConst", { enumType: en, label: c }));
      if (f.method === "valueOf") return enumValueOf(ed, args[0]);
    }
    if (f.enumSelf) {
      const e = f.enumSelf as KofObj;
      if (f.method === "name") return String(e.label);
      if (f.method === "ordinal") return this.enumOrder.get(`${e.enumType}.${e.label}`) ?? 0;
    }
    if (f.listOp)
      return await this.listOp(
        String(f.listOp),
        f.recv as KofList,
        args,
        line,
        f.scope as Scope,
        (f.self as KofObj) ?? null,
      );
    if (f.mapOp)
      return await this.mapOp(String(f.mapOp), f.recv as KofMap, args, line, f.scope as Scope);
    if (f.setOp)
      return await this.setOp(String(f.setOp), f.recv as KofSet, args, f.scope as Scope, line);
    if (f.strOp) return this.stringMethod(String(f.recv), String(f.strOp), args, line);
    if (f.recAccessor)
      return (
        (f.recAccessor.components as { name: string; value: KofVal }[]).find(
          (c) => c.name === f.field,
        )?.value ?? null
      );
    if (f.recSpecial) {
      const recv = f.recv as KofObj;
      if (f.recSpecial === "toString") return kofStr(recv);
      if (f.recSpecial === "equals") return kofEq(recv, args[0] ?? null);
      if (f.recSpecial === "hashCode") return recordHash(recv);
    }
    if (f.methodOn) {
      const obj = f.methodOn as KofObj;
      const cls = this.classes.get(String(obj.clsType));
      const m = cls?.methods.get(String(f.method));
      if (m) return await this.callMethodOn(m, args, obj, String(obj.clsType));
      throw new KofDiag(`\`${obj.clsType}\` não tem método \`${f.method}\``, "SEM011", line);
    }
    if (f.toStringOf !== undefined) return kofStr(f.toStringOf as KofVal);
    if (f.params && f.body) {
      const s = new Scope((f.scope as Scope | null) ?? null);
      for (let i = 0; i < f.params.length; i++) {
        const p = (f.params as Param[])[i]!;
        s.declare(p.name, coerce(p.type, i < args.length ? args[i]! : null));
      }
      const body = f.body as Block | Expr;
      if ((body as Block).kind === "Block") {
        try {
          await this.execBlock(body as Block, s, (f.self as KofObj | null) ?? null);
        } catch (ff) {
          if (ff instanceof Flow && ff.type === "return") return ff.value ?? null;
          throw ff;
        }
        return null;
      }
      return this.eval(body as Expr, s, (f.self as KofObj | null) ?? null);
    }
    throw new KofDiag("não é chamável", "SEM001", line);
  }

  private async construct(name: string, args: KofVal[], line: number): Promise<KofVal> {
    const rec = this.records.get(name);
    if (rec) {
      if (args.length !== rec.params.length)
        throw new KofDiag(
          `record \`${name}\` espera ${rec.params.length} componente(s), recebeu ${args.length}`,
          "SEM013",
          line,
        );
      const comp = rec.params.map((p, i) => ({
        name: p.name,
        value: coerce(p.type, args[i] ?? null),
      }));
      const obj = kofObj("record", { recType: name, components: comp });
      return obj;
    }
    const cls = this.classes.get(name);
    if (cls) {
      const obj = kofObj("object", { clsType: name });
      for (const f of cls.fields) (obj as Record<string, unknown>)[f.name] = defaultOf(f.type);
      if (cls.prim.length > 0) {
        if (args.length !== cls.prim.length)
          throw new KofDiag(
            `classe \`${name}\` espera ${cls.prim.length} argumento(s) no construtor primário, recebeu ${args.length}`,
            "SEM013",
            line,
          );
        cls.prim.forEach((p, i) => {
          (obj as Record<string, unknown>)[p.name] = coerce(p.type, args[i] ?? null);
        });
        return obj;
      }
      if (cls.ctor) {
        const required = cls.ctor.params.filter((p) => !p.def).length;
        if (args.length < required || args.length > cls.ctor.params.length)
          throw new KofDiag(
            `construtor de \`${name}\` espera ${required}-${cls.ctor.params.length} argumento(s), recebeu ${args.length}`,
            "SEM013",
            line,
          );
        await this.callMethodOn(cls.ctor, args, obj, name);
        return obj;
      }
      if (args.length > 0)
        throw new KofDiag(
          `\`${name}\` não tem construtor com argumentos — use construtor primário \`class ${name}(Tipo campo) { }\` ou \`constructor(...)\``,
          "SEM013",
          line,
        );
      return obj;
    }
    throw new KofDiag(`tipo \`${name}\` não declarado`, "SEM011", line);
  }

  private async callMethodOn(
    d: Fn,
    args: KofVal[],
    obj: KofObj,
    _clsName: string,
  ): Promise<KofVal> {
    const scope = new Scope(null);
    for (let i = 0; i < d.params.length; i++) {
      const p = d.params[i]!;
      scope.declare(p.name, coerce(p.type, i < args.length ? args[i]! : null));
    }
    try {
      await this.execBlock(d.body, scope, obj);
    } catch (f) {
      if (f instanceof Flow && f.type === "return") return f.value ?? null;
      throw f;
    }
    return null;
  }

  private async callMethod(
    recv: KofVal,
    name: string,
    args: KofVal[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<KofVal> {
    if (recv === null || recv === undefined) throw new KofDiag("chamada em null", "SEM049", line);
    if (isList(recv)) return this.listOp(name, recv, args, line, scope, self);
    if (isMap(recv)) return this.mapOp(name, recv, args, line, scope);
    if (isSet(recv)) return this.setOp(name, recv, args, scope, line);
    if (typeof recv === "string") return Promise.resolve(this.stringMethod(recv, name, args, line));
    if (isObj(recv)) {
      if (recv.kind === "record") {
        const comp = recv.components as { name: string; value: KofVal }[];
        const found = comp.find((c) => c.name === name);
        if (found) {
          if (args.length !== 0)
            throw new KofDiag(`record accessor \`${name}\` não recebe argumentos`, "SEM013", line);
          return found.value;
        }
        if (name === "toString") return kofStr(recv);
        if (name === "hashCode") return recordHash(recv);
        if (name === "equals") return kofEq(recv, args[0] ?? null);
      }
      if (recv.kind === "object" && typeof recv.ns === "string" && this.isStaticNs(recv.ns))
        return this.staticCall(recv.ns, String(recv.member ?? name), args, line);
      const cname = String(recv.clsType);
      const cls = this.classes.get(cname);
      if (cls) {
        const m = cls.methods.get(name);
        if (m) return this.callMethodOn(m, args, recv, cname);
        let sup: string | null = cls.superName;
        while (sup) {
          const s = this.classes.get(sup);
          const mm = s?.methods.get(name);
          if (mm) return this.callMethodOn(mm, args, recv, cname);
          sup = s?.superName ?? null;
        }
      }
      if (name === "toString") return Promise.resolve(kofStr(recv));
      if (name === "hashCode") return Promise.resolve(kofHashCode(recv));
      if (name === "equals") return Promise.resolve(kofEq(recv, args[0] ?? null));
      throw new KofDiag(`\`${cname || typeOf(recv)}\` não tem método \`${name}\``, "SEM011", line);
    }
    if (
      typeof recv === "number" ||
      typeof recv === "bigint" ||
      typeof recv === "boolean" ||
      isKofChar(recv) ||
      isFp(recv as FpVal)
    ) {
      if (name === "toString") {
        if (typeof recv === "number" && Number.isInteger(recv) && args.length)
          return (recv >>> 0).toString(Number(asInt(args[0])) >>> 0 ? Number(asInt(args[0])) : 10);
        return Promise.resolve(kofStr(recv));
      }
      if (name === "hashCode") return Promise.resolve(kofHashCode(recv));
      if (name === "equals") return Promise.resolve(kofEq(recv, args[0] ?? null));
    }
    throw new KofDiag(`\`${typeOf(recv)}\` não tem método \`${name}\``, "SEM011", line);
  }

  private stringMethod(s: string, name: string, args: KofVal[], line: number): KofVal {
    switch (name) {
      case "charAt":
        return { __kofChar: s.charCodeAt(Number(asInt(args[0]))) } as KofChar;
      case "length":
        return s.length;
      case "substring": {
        const a = Math.max(0, Number(asInt(args[0])));
        const b = args.length > 1 ? Math.max(0, Number(asInt(args[1]))) : s.length;
        return s.slice(a, b);
      }
      case "contains":
        return s.includes(String(args[0] ?? ""));
      case "startsWith":
        if (args.length >= 2)
          return strStartsWith2(s, kofStr(args[0] ?? ""), Number(asInt(args[1])));
        return s.startsWith(kofStr(args[0] ?? ""));
      case "endsWith":
        return s.endsWith(kofStr(args[0] ?? ""));
      case "indexOf":
        if (args.length >= 2) return strIndexOf2(s, kofStr(args[0] ?? ""), Number(asInt(args[1])));
        return s.indexOf(kofStr(args[0] ?? ""));
      case "lastIndexOf":
        if (args.length >= 2)
          return strLastIndexOf2(s, kofStr(args[0] ?? ""), Number(asInt(args[1])));
        return s.lastIndexOf(kofStr(args[0] ?? ""));
      case "toUpperCase":
        return s.toUpperCase();
      case "toLowerCase":
        return s.toLowerCase();
      case "trim":
        return s.trim();
      case "replace": {
        const f = isKofChar(args[0])
          ? String.fromCharCode((args[0] as KofChar).__kofChar)
          : kofStr(args[0] ?? "");
        const t = isKofChar(args[1])
          ? String.fromCharCode((args[1] as KofChar).__kofChar)
          : kofStr(args[1] ?? "");
        return f ? s.split(f).join(t) : s;
      }
      case "split":
        return kofSplit(s, kofStr(args[0] ?? ""));
      case "equals":
        return s === kofStr(args[0] ?? "");
      case "equalsIgnoreCase":
        return s.toUpperCase() === kofStr(args[0] ?? "").toUpperCase();
      case "compareTo":
        return kofCompareTo(s, kofStr(args[0] ?? ""));
      case "isEmpty":
        return s.length === 0;
      case "hashCode":
        return kofHashCode(s);
      case "toString":
        return s;
      case "toInt":
      case "parseInt":
        return parseIntStrict(s);
      case "toLong":
        return parseLongStrict(s);
      case "toDouble":
        return parseDoubleStrict(s);
      case "toFloat":
        return { __kofFloat: Math.fround(parseDoubleStrict(s)), isFloat: true } as FpVal;
      default:
        throw new KofDiag(`String não tem método \`${name}\``, "SEM011", line);
    }
  }

  // ── ops de coleção ─────────────────────────────────────────────────────

  private async listOp(
    op: string,
    list: KofList,
    args: KofVal[],
    line: number,
    scope: Scope,
    self: KofObj | null,
  ): Promise<KofVal> {
    const isArr = (list as KofList & { __kofArray?: boolean }).__kofArray;
    switch (op) {
      case "get": {
        const i = Number(asInt(args[0]));
        if (i < 0 || i >= list.length)
          throw new KofRuntimeError(
            isArr
              ? `Array index out of bounds: ${i} (length ${list.length})`
              : `Index out of bounds: ${i} (size ${list.length})`,
          );
        return list[i]!;
      }
      case "set": {
        const i = Number(asInt(args[0]));
        if (i < 0 || i >= list.length)
          throw new KofRuntimeError(`Index out of bounds: ${i} (size ${list.length})`);
        list[i] = args[1]!;
        return null;
      }
      case "size":
      case "length":
      case "count":
        return list.length;
      case "add":
      case "push":
      case "append":
        if (isArr)
          throw new KofDiag("array é fixo — sem .add(): use List via listOf()", "SEM028", line);
        list.push(args[0] ?? null);
        return null;
      case "contains":
        return list.some((v) => kofEq(v, args[0] ?? null));
      case "isEmpty":
        return list.length === 0;
      case "remove": {
        if (isArr) throw new KofDiag("array é fixo — sem .remove()", "SEM028", line);
        const i = Number(asInt(args[0]));
        if (i < 0 || i >= list.length)
          throw new KofRuntimeError(`Index out of bounds: ${i} (size ${list.length})`);
        return list.splice(i, 1)[0] ?? null;
      }
      case "clear":
        list.length = 0;
        return null;
      case "indexOf":
        return list.findIndex((v) => kofEq(v, args[0] ?? null));
      case "map": {
        const outList: KofVal[] = [];
        for (const v of list) outList.push(await this.invoke(args[0] ?? null, [v], line));
        return outList;
      }
      case "filter": {
        const outList: KofVal[] = [];
        for (const v of list)
          if (truthy(await this.invoke(args[0] ?? null, [v], line))) outList.push(v);
        return outList;
      }
      case "reduce": {
        let acc = args[0] ?? null;
        for (const v of list) acc = await this.invoke(args[1] ?? null, [acc, v], line);
        return acc;
      }
      case "forEach": {
        for (const v of list) await this.invoke(args[0] ?? null, [v], line);
        return null;
      }
      case "toString":
        return kofStr(list);
      default:
        if (
          isArr &&
          ["add", "get", "set", "remove", "clear", "size", "map", "filter", "reduce"].includes(op)
        )
          throw new KofDiag(
            `array é fixo — sem \`.${op}()\`: use arr[i] e arr.length`,
            "SEM028",
            line,
          );
        throw new KofDiag(`List não tem método \`${op}\``, "SEM011", line);
    }
    void scope;
    void self;
  }

  private async mapOp(
    op: string,
    m: KofMap,
    args: KofVal[],
    line: number,
    _scope: Scope,
  ): Promise<KofVal> {
    switch (op) {
      case "put":
        return mapPut(m, args[0]!, args[1]!);
      case "get":
        return mapGet(m, args[0]!);
      case "remove":
        return mapRemove(m, args[0]!);
      case "contains":
      case "containsKey":
        return [...m.keys()].some((k) => kofEq(k, args[0]!));
      case "size":
        return m.size;
      case "clear":
        m.clear();
        return null;
      case "isEmpty":
        return m.size === 0;
      case "keys":
        return [...m.keys()];
      case "values":
        return [...m.values()];
      case "forEach": {
        for (const [k, v] of m) await this.invoke(args[0] ?? null, [k, v], line);
        return null;
      }
      case "toString":
        return kofStr(m);
      default:
        throw new KofDiag(`Map não tem método \`${op}\``, "SEM011", line);
    }
  }

  private async setOp(
    op: string,
    s: KofSet,
    args: KofVal[],
    _scope: Scope,
    line = 0,
  ): Promise<KofVal> {
    switch (op) {
      case "add": {
        if ([...s].some((e) => kofEq(e, args[0]!))) return false;
        s.add(args[0]!);
        return true;
      }
      case "contains":
        return [...s].some((e) => kofEq(e, args[0]!));
      case "remove": {
        for (const e of s) {
          if (kofEq(e, args[0]!)) {
            s.delete(e);
            return true;
          }
        }
        return false;
      }
      case "size":
        return s.size;
      case "clear":
        s.clear();
        return null;
      case "isEmpty":
        return s.size === 0;
      case "forEach": {
        for (const e of s) await this.invoke(args[0] ?? null, [e], 0);
        return null;
      }
      case "toString":
        return kofStr(s);
      default:
        throw new KofDiag(`Set não tem método \`${op}\``, "SEM011", line);
    }
  }

  // ── spawn / await — event-loop cooperativo do KofJS (CONC003) ──────────

  private evalSpawn(body: Expr, scope: Scope, self: KofObj | null): KofVal {
    const run = async (): Promise<KofVal> => {
      if (body.kind === "Lambda") {
        return this.invoke(
          kofObj("closure", { params: body.params, body: body.body, scope, self }),
          [],
          body.line,
        );
      }
      if (body.kind === "Spawn") return this.evalAwait(await this.evalSpawn(body.e, scope, self));
      return this.eval(body, scope, self);
    };
    const handle = kofObj("handle", {}) as KofObj & {
      done: boolean;
      value?: KofVal;
      error?: unknown;
    };
    handle.done = false;
    this.activeTasks++;
    const p = (async () => {
      try {
        handle.value = await run();
      } catch (e) {
        handle.error = e;
      } finally {
        handle.done = true;
        this.activeTasks--;
        this.taskPromises.delete(p!);
      }
    })();
    this.taskPromises.add(p!);
    return handle;
  }

  private async evalAwait(h: KofVal): Promise<KofVal> {
    if (h instanceof Promise) return await h;
    if (isObj(h) && h.kind === "handle") {
      const handle = h as KofObj & { done: boolean; value?: KofVal; error?: unknown };
      while (!handle.done) {
        await sleep(1);
        if (Date.now() > this.deadline)
          throw new KofRuntimeError("await timeout (loop sem fim?)", undefined, true);
      }
      if (handle.error) throw handle.error;
      return handle.value ?? null;
    }
    return h;
  }

  // ── casts ──────────────────────────────────────────────────────────────

  private evalCast(v: KofVal, to: string, line: number): KofVal {
    const base = to.replace(/\?$/, "").replace(/<.*$/, "");
    switch (base) {
      case "Int":
        if (isKofChar(v)) return v.__kofChar;
        if (typeof v === "bigint") return Number(BigInt.asIntN(32, v));
        return kofD2I(Number(asNum(v)));
      case "Long":
        if (typeof v === "bigint") return v;
        if (isKofChar(v)) return BigInt(v.__kofChar);
        return kofD2L(Number(asNum(v)));
      case "Double":
        return { __kofFloat: Number(asNum(v)), isFloat: false } as FpVal;
      case "Float":
        return { __kofFloat: Math.fround(Number(asNum(v))), isFloat: true } as FpVal;
      case "Bool":
        return truthy(v);
      case "Char":
        if (isKofChar(v)) return v;
        return { __kofChar: Number(asNum(v)) & 0xffff } as KofChar;
      case "String":
        return kofStr(v);
      default:
        if (instanceMatches(base, v)) return v;
        if (base === "Object") return v;
        throw new KofDiag(`cast \`${kofStr(v)} as ${base}\` inválido`, "SEM025", line);
    }
  }

  // ── binários ───────────────────────────────────────────────────────────

  async binary(op: string, a: KofVal, b: KofVal, line: number): Promise<KofVal> {
    switch (op) {
      case "==":
        return kofEq(a, b);
      case "!=":
        return !kofEq(a, b);
      case "&&":
        return truthy(a) ? b : false;
      case "||":
        return truthy(a) ? a : false;
    }
    if (
      op === "+" &&
      (typeof a === "string" || typeof b === "string" || isKofChar(a) || isKofChar(b))
    )
      return kofStr(a) + kofStr(b);
    if (["<", "<=", ">", ">="].includes(op) && (typeof a === "string" || typeof b === "string"))
      throw new KofDiag(
        "ordem lexicográfica de String é `compareTo`, não `<` — use `a.compareTo(b) < 0`",
        "SEM053",
        line,
      );
    if (isObj(a) || isObj(b)) {
      if (op === "+" && (isObj(a) || isObj(b)) && (typeof a === "string" || typeof b === "string"))
        return kofStr(a) + kofStr(b);
      if (isObj(a) && typeof a.ns === "string") {
        /* namespace como operando — erro */
      }
    }
    const bigint = typeof a === "bigint" || typeof b === "bigint";
    if (bigint) {
      const x = typeof a === "bigint" ? a : BigInt(Math.trunc(asNum(a) as number) || 0);
      const y = typeof b === "bigint" ? b : BigInt(Math.trunc(asNum(b) as number) || 0);
      switch (op) {
        case "+":
          return wrapLong(x + y);
        case "-":
          return wrapLong(x - y);
        case "*":
          return wrapLong(x * y);
        case "/":
          return longDiv(x, y);
        case "%":
          return longMod(x, y);
        case "<":
          return x < y;
        case "<=":
          return x <= y;
        case ">":
          return x > y;
        case ">=":
          return x >= y;
        case "&":
          return x & y;
        case "|":
          return x | y;
        case "^":
          return x ^ y;
        case "<<":
          return wrapLong(x << (y & 63n));
        case ">>":
          return wrapLong(x >> (y & 63n));
        case ">>>":
          return wrapLong(x >> (y & 63n));
      }
    }
    const aFp = isFp(a as Val | FpVal);
    const bFp = isFp(b as Val | FpVal);
    const aNum = asNum(a);
    const bNum = asNum(b);
    const bothInt =
      !aFp &&
      !bFp &&
      Number.isInteger(aNum) &&
      Number.isInteger(bNum) &&
      !isKofChar(a) &&
      !isKofChar(b);
    if (bothInt && op !== "/") {
      const x = wrapInt(aNum as number);
      const y = wrapInt(bNum as number);
      switch (op) {
        case "+":
          return wrapInt(x + y);
        case "-":
          return wrapInt(x - y);
        case "*":
          return wrapInt(Math.imul(x, y));
        case "%":
          return intMod(x, y);
        case "<":
          return x < y;
        case "<=":
          return x <= y;
        case ">":
          return x > y;
        case ">=":
          return x >= y;
        case "&":
          return x & y;
        case "|":
          return x | y;
        case "^":
          return x ^ y;
        case "<<":
          return wrapInt(x << y);
        case ">>":
          return wrapInt(x >> y);
        case ">>>":
          return x >>> y;
      }
    }
    if (bothInt && op === "/") {
      const x = wrapInt(aNum as number);
      const y = wrapInt(bNum as number);
      if (
        typeof a === "number" &&
        typeof b === "number" &&
        !isFp(a as Val) &&
        !isFp(b as Val) &&
        Number.isInteger(a) &&
        Number.isInteger(b)
      )
        return intDiv(x, y);
    }
    const x = Number(aNum);
    const y = Number(bNum);
    const mk = (n: number): KofVal =>
      aFp || bFp
        ? {
            __kofFloat: aFp && (a as FpVal).isFloat ? Math.fround(n) : n,
            isFloat: aFp
              ? (a as FpVal).isFloat && (!bFp || (b as FpVal).isFloat)
              : (b as FpVal).isFloat,
          }
        : n;
    switch (op) {
      case "+":
        return mk(x + y);
      case "-":
        return mk(x - y);
      case "*":
        return mk(x * y);
      case "/":
        return mk(x / y);
      case "%":
        return mk(x % y);
      case "<":
        return x < y;
      case "<=":
        return x <= y;
      case ">":
        return x > y;
      case ">=":
        return x >= y;
    }
    throw new KofDiag(`operador \`${op}\` não suportado`, "PARSE041", line);
  }

  private async evalCollection(
    name: string,
    argsE: Expr[],
    scope: Scope,
    self: KofObj | null,
    line: number,
  ): Promise<KofVal> {
    const args: KofVal[] = [];
    for (const a of argsE) args.push(await this.eval(a, scope, self));
    switch (name) {
      case "listOf":
        return args;
      case "arrayOf": {
        const arr = args.slice() as KofList & { __kofArray?: boolean };
        arr.__kofArray = true;
        return arr;
      }
      case "setOf": {
        const s = new Set<KofVal>();
        for (const a of args) if (![...s].some((e) => kofEq(e, a))) s.add(a);
        return s;
      }
      case "mapOf": {
        const m = new Map<KofVal, KofVal>();
        for (let i = 0; i + 1 < args.length; i += 2) mapPut(m, args[i]!, args[i + 1]!);
        return m;
      }
      default:
        throw new KofDiag(`coleção \`${name}\` não existe`, "SEM011", line);
    }
  }
}

// ── construtores pendentes (async) ─────────────────────────────────────

const NO_MATCH = Symbol("no-match");

// ── helpers ──────────────────────────────────────────────────────────────

function enumValueOf(ed: EnumDecl, nameArg: KofVal | undefined): KofVal {
  const name = typeof nameArg === "string" ? nameArg : kofStr(nameArg ?? null);
  const c = ed.consts.find((x) => x === name);
  return c ? kofObj("enumConst", { enumType: ed.name, label: c }) : null;
}

function instanceMatches(type: string, v: KofVal): boolean {
  const t = type.replace(/\?$/, "").replace(/<.*$/, "").replace(/\[\]$/, "");
  const arr = type.endsWith("[]");
  if (arr) return isList(v);
  switch (t) {
    case "String":
      return typeof v === "string";
    case "Bool":
      return typeof v === "boolean";
    case "Int":
      return typeof v === "number" && Number.isInteger(v);
    case "Long":
      return typeof v === "bigint";
    case "Double":
      return isFp(v as Val | FpVal) ? !(v as FpVal).isFloat : typeof v === "number";
    case "Float":
      return isFp(v as Val | FpVal) && (v as FpVal).isFloat;
    case "Char":
      return isKofChar(v) || (typeof v === "number" && Number.isInteger(v));
    case "List":
      return isList(v);
    case "Map":
      return isMap(v);
    case "Set":
      return isSet(v);
    case "Object":
      return true;
    default:
      if (isObj(v) && v.kind === "record") return String(v.recType) === t;
      if (isObj(v) && v.kind === "object") return String(v.clsType) === t;
      if (isObj(v) && v.kind === "enumConst") return String(v.enumType) === t;
      return false;
  }
}

function catchMatches(type: string, thrown: KofVal): boolean {
  const t = type.replace(/\?$/, "").replace(/<.*$/, "");
  switch (t) {
    case "String":
      return typeof thrown === "string";
    case "Int":
      return typeof thrown === "number" && Number.isInteger(thrown);
    case "Long":
      return typeof thrown === "bigint";
    case "Double":
      return (
        isFp(thrown as Val | FpVal) || (typeof thrown === "number" && !Number.isInteger(thrown))
      );
    case "Bool":
      return typeof thrown === "boolean";
    case "Object":
      return true;
    default:
      return isObj(thrown) && (thrown.clsType === t || thrown.recType === t);
  }
}

function mapPut(m: KofMap, k: KofVal, v: KofVal): KofVal {
  for (const ek of m.keys()) {
    if (kofEq(ek, k)) {
      const prev = m.get(ek)!;
      m.set(ek, v);
      return prev;
    }
  }
  m.set(k, v);
  return null;
}
function mapGet(m: KofMap, k: KofVal): KofVal {
  for (const [ek, ev] of m) if (kofEq(ek, k)) return ev;
  return null;
}
function mapRemove(m: KofMap, k: KofVal): KofVal {
  for (const [ek, ev] of m) {
    if (kofEq(ek, k)) {
      m.delete(ek);
      return ev;
    }
  }
  return null;
}

function coerce(type: string | null, v: KofVal): KofVal {
  if (!type) return v;
  const t = type.replace(/\?$/, "").replace(/<.*$/, "");
  if (t === "Int" && typeof v === "number") return wrapInt(v);
  if (t === "Long" && typeof v === "number") return wrapLong(BigInt(Math.trunc(v) || 0));
  if (t === "Long" && v === null) return 0n;
  if (t === "Double" && typeof v === "number") return { __kofFloat: v, isFloat: false } as FpVal;
  if (t === "Float" && typeof v === "number")
    return { __kofFloat: Math.fround(v), isFloat: true } as FpVal;
  if (t === "Char" && typeof v === "number") return { __kofChar: v & 0xffff } as KofChar;
  return v;
}

function defaultOf(type: string | null): KofVal {
  if (!type) return null;
  const t = type.replace(/\?$/, "").replace(/<.*$/, "");
  if (t === "Int" || t === "Char" || t === "Short" || t === "Byte")
    return t === "Char" ? ({ __kofChar: 0 } as KofChar) : 0;
  if (t === "Long") return 0n;
  if (t === "Double") return { __kofFloat: 0, isFloat: false } as FpVal;
  if (t === "Float") return { __kofFloat: 0, isFloat: true } as FpVal;
  if (t === "Bool") return false;
  if (t === "String") return "";
  return null;
}

function sameParamTypes(a: Fn, b: Fn): boolean {
  return a.params.every((p, i) => (p.type ?? "?") === (b.params[i]?.type ?? "?"));
}

function argsCompatible(params: Param[], args: KofVal[]): boolean {
  const required = params.filter((p) => !p.def).length;
  if (args.length < required || args.length > params.length) return false;
  return params.every((p, i) => {
    const a = args[i];
    if (a === undefined || !p.type) return true;
    if (p.type === "Int" && typeof a === "bigint") return false;
    if (p.type === "Long" && typeof a === "number" && Number.isInteger(a)) return true; // widening Int→Long abençoado
    if (p.type === "Double" && typeof a === "number" && Number.isInteger(a)) return true; // widening
    return instanceMatches(p.type, a);
  });
}

function recordHash(o: KofObj): number {
  const comp = o.components as { name: string; value: KofVal }[];
  let h = 0;
  for (const c of comp) h = (31 * h + kofHashCode(c.value)) | 0;
  return h;
}

function parseIntStrict(s: string): number {
  const t = s.trim();
  if (!/^[-+]?\d+$/.test(t)) throw new KofRuntimeError(`Cannot parse "${t}" as Int`);
  const n = Number(t);
  if (n < -2147483648 || n > 2147483647) throw new KofRuntimeError(`Cannot parse "${t}" as Int`);
  return n | 0;
}
function parseLongStrict(s: string): bigint {
  const t = s.trim();
  if (!/^[-+]?\d+$/.test(t)) throw new KofRuntimeError(`Cannot parse "${t}" as Long`);
  const b = BigInt(t);
  if (b > 9223372036854775807n || b < -9223372036854775808n)
    throw new KofRuntimeError(`Cannot parse "${t}" as Long`);
  return b;
}
function parseDoubleStrict(s: string): number {
  const t = s.trim();
  if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$|^-?Infinity$|^NaN$/.test(t))
    throw new KofRuntimeError(`Cannot parse "${t}" as Double`);
  return Number(t);
}
function parseStatic(ns: string, fn: string, s: string): KofVal {
  if (fn === "parseBoolean") return s === "true";
  if (fn === "parseInt") return parseIntStrict(s);
  if (fn === "parseLong") return parseLongStrict(s);
  if (fn === "parseDouble") return parseDoubleStrict(s);
  if (fn === "parseFloat")
    return { __kofFloat: Math.fround(parseDoubleStrict(s)), isFloat: true } as FpVal;
  throw new KofDiag(`\`${ns}\` não tem \`${fn}\``, "SEM011", 0);
}

// ── JSON (encode/decode nos tipos do runtime — kof_json_*) ───────────────

function jsonStringify(v: KofVal): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "string") return jsonQuote(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "bigint") return v.toString();
  if (isKofChar(v)) return String(v.__kofChar);
  if (isFp(v as Val | FpVal)) {
    const n = fpNum(v as FpVal);
    if (!Number.isFinite(n)) return "null";
    return String(n);
  }
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return "null";
    return Number.isInteger(v) ? String(v) : String(v);
  }
  if (isList(v)) return "[" + v.map(jsonStringify).join(",") + "]";
  if (isMap(v)) {
    const keys = [...v.keys()].map((k) => kofStr(k)).sort();
    const parts: string[] = [];
    for (const key of keys) {
      let val: KofVal = null;
      for (const [k, vv] of v) if (kofEq(k, key)) val = vv;
      parts.push(jsonQuote(key) + ":" + jsonStringify(val));
    }
    return "{" + parts.join(",") + "}";
  }
  if (isObj(v)) {
    if (v.kind === "record") {
      const comp = v.components as { name: string; value: KofVal }[];
      return (
        "{" + comp.map((c) => jsonQuote(c.name) + ":" + jsonStringify(c.value)).join(",") + "}"
      );
    }
    if (v.kind === "enumConst") return jsonQuote(String(v.label));
  }
  return "null";
}

function jsonQuote(s: string): string {
  return '"' + stringsEscapeJsonLocal(s) + '"';
}
function stringsEscapeJsonLocal(v: string): string {
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
}

function toJsValue(v: KofVal): unknown {
  void v;
  return undefined;
}

function fromJsValue(x: unknown): KofVal {
  if (x === null || x === undefined) return null;
  if (typeof x === "string" || typeof x === "boolean") return x;
  if (typeof x === "number")
    return Number.isInteger(x) ? x : ({ __kofFloat: x, isFloat: false } as FpVal);
  if (Array.isArray(x)) return x.map(fromJsValue);
  if (typeof x === "object") {
    const m = new Map<KofVal, KofVal>();
    for (const [k, val] of Object.entries(x)) m.set(k, fromJsValue(val));
    return m;
  }
  return null;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
