/**
 * kof-interpreter — execução de Kof no browser (subset) via transpilação para JS.
 * Cobre: println/print, variáveis, aritmética, if/while/for, funções, lambdas simples.
 * Não é o compilador oficial (Java), mas roda 100% estático no GitHub Pages
 * usando a mesma semântica do KofJS para os casos do playground.
 */
export type KofResult = { output: string; error?: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
function stripTypes(code: string): string {
  // remove anotações de tipo: var x: Int, param: String, func(): Int, class Foo(String name)
  // mantém só o nome
  let s = code;
  // tipos após :
  s = s.replace(
    /:\s*(String|Int|Long|Bool|Double|Float|Char|Void|List<[^>]+>|Set<[^>]+>|Map<[^>]+>|Int\[\]|String\[\]|Bool\[\])\b/g,
    "",
  );
  // primary constructor params: class User(String name, Int age)
  // já coberto acima
  return s;
}

function extractMainBody(code: string): string {
  // se tem main() { ... } extrai o corpo, senão usa tudo
  const mainMatch = code.match(/main\s*\(\s*\)\s*\{([\s\S]*)\}/);
  if (mainMatch) {
    // pega o conteúdo até o último } correspondente - simplificado
    // conta chaves
    const start = code.indexOf("main");
    const brace = code.indexOf("{", start);
    let depth = 0;
    let end = brace;
    for (let i = brace; i < code.length; i++) {
      if (code[i] === "{") depth++;
      else if (code[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    const body = code.slice(brace + 1, end);
    // prefixa código fora do main (funções auxiliares, classes)
    const before = code.slice(0, start);
    const after = code.slice(end + 1);
    // mantém funções auxiliares + body
    return before + "\n" + body + "\n" + after;
  }
  return code;
}

export function runKof(raw: string): KofResult {
  const out: string[] = [];
  const println = (...args: any[]) => out.push(args.map(String).join(" "));
  const print = (...args: any[]) => {
    if (out.length === 0) out.push(args.map(String).join(" "));
    else out[out.length - 1] += args.map(String).join(" ");
  };

  try {
    let code = raw.trim();
    if (!code) return { output: "", error: "código vazio" };

    // remove package/import (não usados no playground)
    code = code.replace(/^\s*(package|import)\s+.*$/gm, "");

    // extrai main
    let js = extractMainBody(code);
    js = stripTypes(js);

    // normaliza Kof -> JS
    js = js
      .replace(/\bval\s+/g, "let ")
      .replace(/\bvar\s+/g, "let ")
      // println/print
      .replace(/\bprintln\s*\(/g, "__kof_println(")
      .replace(/\bprint\s*\(/g, "__kof_print(")
      // for (var x in list) -> for (let x of list)
      .replace(/for\s*\(\s*let\s+(\w+)\s+in\s+/g, "for (let $1 of ")
      // listOf(...) -> [...]
      .replace(/\blistOf\s*\(\s*\)/g, "[]")
      .replace(/\blistOf\s*\(/g, "[")
      // fecha listOf antigo: já virou [
      // .size -> .length (List)
      .replace(/\.size\b/g, ".length")
      // .length já é string length também, mantém
      // string helpers: s.contains -> s.includes
      .replace(/\.contains\s*\(/g, ".includes(")
      // assert -> if (!cond) throw
      .replace(
        /\bassert\s*\(\s*([^,)]+)(?:,\s*("[^"]*"|'[^']*'))?\s*\)/g,
        'if(!($1)) throw new Error($2 || "assert falhou")',
      )
      // classes/records/enum ignorados no subset console - remove declaração mas mantém uso simples
      .replace(/\bclass\s+\w+[\s\S]*?\{[\s\S]*?\n\}/g, "/* class removida no subset */")
      .replace(/\brecord\s+\w+.*$/gm, "/* record */")
      .replace(/\benum\s+\w+.*$/gm, "/* enum */")
      // Bool literals: true/false já compatível
      // remove return types espectrais: func() { -> function func() {
      .replace(/^(\s*)(\w+)\s*\(\s*\)\s*\{/gm, "$1function $2() {");

    // adapta println no corpo: se ainda tem main como function, chama
    const hasMainFn = /function\s+main\s*\(/.test(js);
    const execCode = `
      const __kof_println = println;
      const __kof_print = print;
      // helpers Kof no browser
      const listOf = (...a) => a;
      const List = Array;
      ${js}
      ${hasMainFn ? "\nif (typeof main === 'function') main();" : ""}
    `;

    // executa em sandbox com Function (new Function é intencional — interpretador Kof no browser)
    const fn = new Function("println", "print", "listOf", "out", execCode);
    fn(println, print, (...a: any[]) => a, out);

    return { output: out.join("\n") };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    // junta output parcial + erro
    const partial = out.join("\n");
    return { output: partial, error: msg };
  }
}

export const playgroundExamples: { label: string; code: string }[] = [
  {
    label: "Olá",
    code: `main() {\n    println("Olá, Kof!")\n    println("2 + 2 = " + (2+2))\n}`,
  },
  {
    label: "Fatorial",
    code: `fatorial(Int n): Int {\n    if (n <= 1) return 1\n    return n * fatorial(n - 1)\n}\nmain() {\n    println("5! = " + fatorial(5))\n    for (var i = 1; i <= 5; i = i+1) {\n        println(i + "! = " + fatorial(i))\n    }\n}`,
  },
  {
    label: "Coleções",
    code: `main() {\n    var nums = listOf(3, 1, 4, 1, 5)\n    println("lista: " + nums)\n    println("tamanho: " + nums.size)\n    var soma = 0\n    for (var n in nums) {\n        soma = soma + n\n    }\n    println("soma: " + soma)\n}`,
  },
  {
    label: "Fibonacci",
    code: `fib(Int n): Int {\n    if (n <= 1) return n\n    return fib(n-1) + fib(n-2)\n}\nmain() {\n    for (var i = 0; i < 8; i = i+1) {\n        println("fib(" + i + ") = " + fib(i))\n    }\n}`,
  },
  {
    label: "UI (preview estático)",
    code: `// UI roda via KofJS -> DOM. No playground console mostramos lógica pura:\nprogressBar(Int v, Int max): String {\n    var filled = v * 20 / max\n    var out = ""\n    var i=0\n    while(i<20){\n        if(i < filled) out = out + "█"\n        else out = out + "░"\n        i=i+1\n    }\n    return out + " " + v + "/" + max\n}\nmain() {\n    println(progressBar(7, 10))\n    println(progressBar(15, 20))\n}`,
  },
];
