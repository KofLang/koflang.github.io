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
    println("7 / 2 = " + (7 / 2) + "   // divisão inteira truncante")
    println("2.5 + 1 = " + (2.5 + 1))   // Double no formato JDK: 3.5
}`,
  },
  {
    label: "Record",
    code: `record Point(Int x, Int y)

main() {
    var p = Point(1, 2)
    println(p)                  // Point[x=1, y=2]
    println("x=" + p.x + " y=" + p.y)
    var q = Point(1, 2)
    println("igual por conteúdo? " + (p == q))
}`,
  },
  {
    label: "Enum",
    code: `enum Cor { Vermelho, Verde, Azul }

main() {
    for (var c in Cor.values()) {
        println(c + " → ordinal " + c.ordinal())
    }
    var nome = ""
    switch (Cor.Verde) {
        case Vermelho: { nome = "pare" }
        case Verde:    { nome = "siga" }
        case Azul:     { nome = "atenção" }
    }
    println("semáforo: " + nome)
}`,
  },
  {
    label: "Switch expr",
    code: `record Circulo(Double raio)
record Retangulo(Double largura, Double altura)

main() {
    var forma = Retangulo(3.0, 4.0)
    var desc = switch (forma) {
        case Circulo c -> "círculo raio " + c.raio()
        case Retangulo r -> "retângulo " + r.largura() + "x" + r.altura()
        default -> "desconhecido"
    }
    println(desc)
}`,
  },
  {
    label: "Null-safety",
    code: `String? find(Int id) {
    if (id == 1) { return "mel" }
    return null
}

main() {
    var s = find(1)
    if (s != null) {
        println("achei: " + s + " (length " + s.length() + ")")
    }
    var v = find(42)
    println(v == null)   // true
}`,
  },
  {
    label: "Coleções",
    code: `main() {
    var nums = listOf(3, 1, 4, 1, 5)
    println("lista: " + nums + "  size: " + nums.size())
    var soma = 0
    for (var n in nums) soma += n
    println("soma: " + soma)

    var idades = mapOf()
    idades.put("Ana", 26)
    idades.put("Bob", 31)
    println("idades: " + idades)
    println("idades.get(Ana) = " + idades.get("Ana"))
}`,
  },
  {
    label: "spawn / await",
    code: `dobro(Int n): Int {
    return n * 2
}

main() {
    val r = spawn dobro(21)      // Handle<Int>
    println("trabalhando enquanto a soma acontece...")
    val total = await r
    println("dobro(21) = " + total)
}`,
  },
  {
    label: "Stdlib",
    code: `main() {
    println(math.sqrt(144))
    println(math.clamp(15, 0, 10))
    println(strings.toSnakeCase("NomeCompleto"))
    println(strings.slugify("Olá, Kof!"))
    println(encoding.base64Encode("Kof"))
    println(uuid.isUuid("00000000-0000-4000-8000-000000000000"))
    println(validation.isEmail("a@b.co"))
}`,
  },
  {
    label: "Gaps (honesto)",
    code: `main() {
    // no browser essa face reporta o MESMO código que \`kof check\`:
    var db = db.connect("jdbc:h2:mem:test")   // → DB001
    println(db)
}`,
  },
];
