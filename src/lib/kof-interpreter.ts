/**
 * kof-interpreter — execução de Kof no browser (subset) via transpilação para JS.
 * Cobre: println/print, variáveis, aritmética, if/while/for, funções, lambdas simples.
 * Não é o compilador oficial (Java), mas roda 100% estático no GitHub Pages
 * usando a mesma semântica do KofJS para os casos do playground.
 */
export type KofResult = { output: string; error?: string };

/* eslint-disable @typescript-eslint/no-explicit-any */
function stripTypes(code: string): string {
  let s = code;
  // 1) remove tipo de retorno: ): Type
  s = s.replace(
    /\)\s*:\s*(String|Int|Long|Bool|Double|Float|Char|Void|List<[^>]+>|Set<[^>]+>|Map<[^>]+>|Int\[\]|String\[\]|Bool\[\])\b/g,
    ")",
  );
  // 2) remove anotação : Type  (var x: Int, param: String)
  s = s.replace(
    /:\s*(String|Int|Long|Bool|Double|Float|Char|Void|List<[^>]+>|Set<[^>]+>|Map<[^>]+>|Int\[\]|String\[\]|Bool\[\])\b/g,
    "",
  );
  // 3) remove tipo prefixado em declaração sem var/val:  Int wh = w  -> let wh = w
  s = s.replace(
    /(^|[;{\n])\s*(String|Int|Long|Bool|Double|Float|Char|Void|List<[^>]+>|Set<[^>]+>|Map<[^>]+>|Int\[\]|String\[\]|Bool\[\])\s+(\w+)\s*=/gm,
    "$1let $3 =",
  );
  // 4) remove tipo prefixado em params e resto:  Int v, String s  -> v, s
  //    (após 3, ainda sobram casos como `f(Int n)` sem `=` )
  s = s.replace(
    /\b(?:String|Int|Long|Bool|Double|Float|Char|Void|List<[^>]+>|Set<[^>]+>|Map<[^>]+>|Int\[\]|String\[\]|Bool\[\])\s+(?=[a-zA-Z_]\w*\b)/g,
    "",
  );
  return s;
}

function transformListOf(js: string): string {
  let out = "";
  let i = 0;
  while (i < js.length) {
    if (js.startsWith("listOf", i) && (i === 0 || !/[A-Za-z0-9_]/.test(js[i - 1]))) {
      let j = i + 6;
      while (j < js.length && /\s/.test(js[j])) j++;
      // suporta listOf<Int>(...)  - pula <...>
      if (j < js.length && js[j] === "<") {
        let d = 1;
        j++;
        while (j < js.length && d > 0) {
          if (js[j] === "<") d++;
          else if (js[j] === ">") d--;
          j++;
        }
        while (j < js.length && /\s/.test(js[j])) j++;
      }
      if (j < js.length && js[j] === "(") {
        let depth = 1;
        const start = j + 1;
        let k = start;
        while (k < js.length && depth > 0) {
          if (js[k] === "(") depth++;
          else if (js[k] === ")") depth--;
          k++;
        }
        const inner = js.slice(start, k - 1);
        out += "[" + transformListOf(inner) + "]";
        i = k;
        continue;
      }
    }
    out += js[i];
    i++;
  }
  return out;
}

function extractMainBody(code: string): string {
  const start = code.indexOf("main");
  if (start !== -1) {
    const brace = code.indexOf("{", start);
    if (brace !== -1) {
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
      const before = code.slice(0, start);
      const after = code.slice(end + 1);
      return before + "\n" + body + "\n" + after;
    }
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

    code = code.replace(/^\s*(package|import)\s+.*$/gm, "");

    let js = extractMainBody(code);
    js = stripTypes(js);
    js = transformListOf(js);

    js = js
      .replace(/\bval\s+/g, "let ")
      .replace(/\bvar\s+/g, "let ")
      .replace(/\bprintln\s*\(/g, "__kof_println(")
      .replace(/\bprint\s*\(/g, "__kof_print(")
      .replace(/for\s*\(\s*let\s+(\w+)\s+in\s+/g, "for (let $1 of ")
      .replace(/\.size\b/g, ".length")
      .replace(/\.contains\s*\(/g, ".includes(")
      .replace(
        /\bassert\s*\(\s*([^,)]+)(?:,\s*("[^"]*"|'[^']*'))?\s*\)/g,
        'if(!($1)) throw new Error($2 || "assert falhou")',
      )
      .replace(/\bclass\s+\w+[\s\S]*?\{[\s\S]*?\n\}/g, "/* class removida no subset */")
      .replace(/\brecord\s+\w+.*$/gm, "/* record */")
      .replace(/\benum\s+\w+.*$/gm, "/* enum */")
      .replace(
        /^(\s*)(?!if\b|while\b|for\b|switch\b|catch\b|return\b)(\w+)\s*\(([^)]*)\)\s*\{/gm,
        "$1function $2($3) {",
      );

    const hasMainFn = /function\s+main\s*\(/.test(js);
    const execCode = `
      const __kof_println = println;
      const __kof_print = print;
      const List = Array;
      ${js}
      ${hasMainFn ? "\nif (typeof main === 'function') main();" : ""}
    `;

    const fn = new Function("println", "print", execCode);
    fn(println, print);

    return { output: out.join("\n") };
  } catch (e: any) {
    const msg = e?.message ?? String(e);
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
