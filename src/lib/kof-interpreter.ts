/**
 * kof-interpreter — execução de Kof 0.4.0-beta no browser, 100% estático
 * (GitHub Pages, sem servidor). A semântica é a mesma do backend JS oficial
 * (`kof-runtime.mjs`, gerado por `dev.kof.compiler.js.*`): Int=wrap Int32 com
 * divisão truncante, Long=BigInt, Double=wrapper Fp com Double.toString do JDK,
 * Char imprime o caráter (D-NARROW), records/imutáveis, enums, if-expr, switch
 * com patterns + guards, null-safety, `spawn`/`await` cooperativo e stdlib
 * 0.4.x (math/strings/encoding/time/uuid/validation/net/random/security).
 *
 * Não é o compilador oficial (Java); é uma portação fiel o bastante para o
 * playground. Todo erro sai com código + linha, espelhando `kof check`
 * (SEM053, PARSE085, DB001, HTTP003, ...). Nunca silencia: R6.
 */
import { parseProgram } from "./kof/parser";
import { KofInterpreter } from "./kof/interp";
import type { StdCtx } from "./kof/stdlib";
import { KofDiag } from "./kof/diag";
import { KofRuntimeError } from "./kof/values";

export type KofResult = { output: string; error?: string };

/** entropia do SO via WebCrypto (com fallback — o runtime oficial usa SecureRandom) */
function makeCtx(): StdCtx {
  const g = globalThis as { crypto?: Crypto };
  const byte = (): number => {
    if (g.crypto?.getRandomValues) {
      const a = new Uint8Array(1);
      g.crypto.getRandomValues(a);
      return a[0]!;
    }
    return Math.floor(Math.random() * 256);
  };
  return {
    now: () => Date.now(),
    randomByte: byte,
    randomInt: (bound: number) => {
      if (bound <= 0) return 0;
      const range = 256 - (256 % bound);
      let x = byte();
      while (x >= range) x = byte();
      return x % bound;
    },
  };
}

function diagnose(e: unknown): string {
  if (e instanceof KofDiag) return e.toString();
  if (e instanceof KofRuntimeError) return `✕ ${e.message} [${e.isThrow ? "RUN" : "ERR"}]`;
  if (e instanceof Error) return `✕ ${e.message}`;
  return `✕ ${String(e)}`;
}

/** executa um programa Kof completo; captura saída de println/print e erros */
export async function runKof(raw: string): Promise<KofResult> {
  const code = raw.replace(/\r\n/g, "\n");
  if (!code.trim()) return { output: "", error: "código vazio" };
  try {
    const prog = parseProgram(code);
    const interp = new KofInterpreter(prog, makeCtx());
    const output = await interp.run();
    return { output };
  } catch (e) {
    return { output: "", error: diagnose(e) };
  }
}

export const playgroundExamples: { label: string; code: string }[] = [
  {
    label: "Olá",
    code: `main() {
    println("Olá, Kof!")
    println("2 + 2 = " + (2 + 2))
    println("7 / 2 = " + (7 / 2) + "  // divisão inteira truncante")
}`,
  },
  {
    label: "Record",
    code: `record Point(Int x, Int y)

main() {
    var p = Point(1, 2)
    println(p)              // Point[x=1, y=2]
    println("x=" + p.x + " y=" + p.y)
    var q = Point(1, 2)
    println("igualdade por conteúdo: " + (p == q))
}`,
  },
  {
    label: "Enum",
    code: `enum Cor { Vermelho, Verde, Azul }

main() {
    for (var c in Cor.values()) {
        println(c + " → " + c.ordinal())
    }
    var escolha = Cor.Verde
    var nome = switch (escolha) {
        Cor.Vermelho -> "pare"
        Cor.Verde -> "siga"
        Cor.Azul -> "atenção"
    }
    println("semáforo: " + nome)
}`,
  },
  {
    label: "Switch patterns",
    code: `main() {
    var valores = listOf(1, "dois", 3.5, null)
    for (var v in valores) {
        var desc = switch (v) {
            is Int -> "inteiro " + v
            is String -> "texto \\"" + v + "\\""
            is Double -> "real " + v
            null -> "nada"
            else -> "?"
        }
        println(desc)
    }
}`,
  },
  {
    label: "Null-safety",
    code: `main() {
    var nome: String? = null
    println(nome ?: "anônimo")     // elvis
    var x: String? = "Kof"
    println(x?.length() ?: 0)      // chamada segura
    // descomente para ver SEM049 (dereference de null):
    // println(nome.length())
}`,
  },
  {
    label: "Coleções",
    code: `main() {
    var nums = listOf(3, 1, 4, 1, 5)
    println("lista: " + nums + "  tamanho: " + nums.size())
    var soma = 0
    for (var n in nums) soma += n
    println("soma: " + soma)
    var m = mapOf("a" to 1, "b" to 2)
    println("mapa: " + m + "  m[b]=" + m.get("b"))
}`,
  },
  {
    label: "spawn / await",
    code: `dobro(Int n): Int {
    return n * 2
}

main() {
    var h = spawn {
        println("tarefa em segundo plano")
        println("dobro(21) = " + dobro(21))
    }
    println("continua sem bloquear")
    await h
}`,
  },
  {
    label: "Stdlib",
    code: `main() {
    println(math.sqrt(144))
    println(strings.toSnakeCase("NomeCompleto"))
    println(strings.slugify("Olá, Kof!"))
    println(encoding.toBase64("Kof"))
    println(uuid.isUuid("00000000-0000-4000-8000-000000000000"))
    println(validation.isEmail("a@b.co"))
}`,
  },
  {
    label: "Gaps (honesto)",
    code: `main() {
    // no browser essas faces reportam o MESMO código que \`kof check\`:
    var r = kof.db.connect("sqlite:test.db")   // → DB001
    println(r)
}`,
  },
];
