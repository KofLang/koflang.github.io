/**
 * kof-interpreter — interpretador Kof real no browser (KofJS), 100% estático
 * no GitHub Pages. Mesma semântica do backend JS oficial (`kof-runtime.mjs`,
 * gerado por `dev.kof.compiler.js.*`): Int=wrap Int32 com divisão truncante,
 * Long=BigInt, Double=wrapper Fp com Double.toString do JDK, Char imprimindo o
 * caráter (D-NARROW), records/enums/classes, switch com patterns + guards,
 * null-safety, `spawn`/`await` e stdlib 0.4.x completa. Única limitação é a
 * arquitetura do Pages (sem host para `kof.db`/`kof.io`/`kof.web` → DB001/WEB001,
 * nunca silencia: R6, mesmo código que `kof check`).
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
    println("7 / 2 = " + (7 / 2) + "  // Int com divisão truncante")
    println("2.5 + 1 = " + (2.5 + 1))  // Double no formato JDK: 3.5
    println('K' + "of")                // Char imprime o caráter
}`,
  },
  {
    label: "Record",
    code: `record Point(Int x, Int y)

main() {
    var p = Point(1, 2)
    println(p)                  // Point[x=1, y=2]
    println("x=" + p.x + " y=" + p.y)  // também p.x()
    var q = Point(1, 2)
    println("p==q por conteúdo? " + (p == q))
    println("hash " + p.hashCode())
}`,
  },
  {
    label: "Enum",
    code: `enum Cor { Vermelho, Verde, Azul }

main() {
    for (var c in Cor.values()) {
        println(c + " -> " + c.ordinal() + " (" + c.name() + ")")
    }
    println(Cor.valueOf("Verde"))
    var nome = ""
    switch (Cor.Verde) {
        case Vermelho: { nome = "pare" }
        case Verde: { nome = "siga" }
        case Azul: { nome = "atenção" }
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
    println(switch (1) { case 1 -> "um" case 2 -> "dois" default -> "?" })
}`,
  },
  {
    label: "Pattern",
    code: `record Ponto(Int x, Int y)
record Pessoa(String nome, Int idade)

main() {
    Object o = Ponto(3, 7)
    switch (o) {
        case Ponto(x, y): { println("ponto " + x + "," + y) }
        case Pessoa(nome, idade): { println(nome + " " + idade) }
        case String s: { println("texto " + s) }
        default: { println("outro") }
    }
    // guard
    var n = 5
    var r = switch (n) {
        case Int v if v < 0 -> "neg"
        case Int v if v == 0 -> "zero"
        case Int v -> "pos " + v
        default -> "?"
    }
    println(r)
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
    if (s != null) println("achei: " + s + " len=" + s.length())
    println(find(42) == null) // true
    // cast seguro
    Object o = "kof"
    if (o instanceof String) println((o as String).toUpperCase())
}`,
  },
  {
    label: "Coleções",
    code: `main() {
    var nums = listOf(3, 1, 4, 1, 5)
    println(nums + " size=" + nums.size() + " contains 4? " + nums.contains(4))
    println("map " + nums.map((Int x) -> x * 2))
    println("filter " + nums.filter((Int x) -> x > 2))
    var idades = mapOf()
    idades.put("Ana", 26)
    idades.put("Bob", 31)
    println(idades + " Ana=" + idades.get("Ana"))
    var vistos = setOf(1, 2, 2, 3)
    println(vistos + " size=" + vistos.size())
    println("for-in: ")
    for (var n in nums) print(n + " ")
    println("")
}`,
  },
  {
    label: "Classes",
    code: `class Pessoa(String nome, Int idade) {
    saudacao(): String { return "oi, " + this.nome + " (" + this.idade + ")" }
}
main() {
    var p = Pessoa("Mel", 27)
    println(p.saudacao())
    println(p.nome + " " + p.idade)
}`,
  },
  {
    label: "Lambdas",
    code: `main() {
    var dobrar = (Int x) -> x * 2
    println(dobrar(21))
    var nums = listOf(1, 2, 3)
    // higher-order com lambdas
    var q = nums.map(dobrar)
    println(q) // [2, 4, 6]
    var soma = nums.reduce(0, (Int acc, Int v) -> acc + v)
    println("soma=" + soma)
    // if-expr é expressão
    var n = 5
    var s = if (n > 0) "pos" else "neg"
    println(s)
}`,
  },
  {
    label: "spawn/await",
    code: `dobro(Int n): Int { return n * 2 }
main() {
    val r = spawn dobro(21) // Handle<Int>
    println("trabalhando...")
    println("dobro=" + await r)
    // bloco
    val h = spawn { println("tarefa em paralelo"); 42 }
    println("await bloco=" + await h)
}`,
  },
  {
    label: "math",
    code: `main() {
    println("abs " + math.abs(-5) + " sign " + math.sign(-3))
    println("clamp " + math.clamp(15, 0, 10) + " min " + math.min(2, 3) + " max " + math.max(2, 3))
    println("sqrt " + math.sqrt(144) + " pow " + math.pow(2, 10))
    println("lerp " + math.lerp(0, 10, 0.5) + " percentage " + math.percentage(2, 10))
    println("isEven " + math.isEven(4) + " isOdd " + math.isOdd(3))
    println("roundTo " + math.roundTo(2.675, 2) + " isInteger " + math.isInteger(3.0))
    println(math.parseInt("42") + " " + math.parseIntOrDefault("x", 99))
}`,
  },
  {
    label: "strings",
    code: `main() {
    println(strings.isAlpha("Kof") + " " + strings.isNumeric("123"))
    println(strings.capitalize("kof") + " " + strings.uncapitalize("Kof"))
    println(strings.reverse("roma") + " " + strings.repeat("ab", 3))
    println(strings.truncate("hello world", 8) + " '" + strings.normalizeWhitespace("  a   b ") + "'")
    println(strings.toSnakeCase("NomeCompleto") + " " + strings.toKebabCase("NomeCompleto"))
    println(strings.toCamelCase("nome_completo") + " " + strings.toPascalCase("nome_completo"))
    println(strings.slugify("Olá, Kof!"))
    println(strings.escapeHtml("<b>") + " " + strings.padLeft("7", 3, "0"))
}`,
  },
  {
    label: "encoding",
    code: `main() {
    var b64 = encoding.base64Encode("Kof")
    println(b64) // S29m
    println(encoding.base64Decode(b64))
    println(encoding.base64UrlEncode("Kof!?"))
    println(encoding.hexEncode("Kof"))
    println(encoding.hexDecode(encoding.hexEncode("Kof")))
    println(encoding.urlEncode("a b&c") + " -> " + encoding.urlDecode(encoding.urlEncode("a b&c")))
}`,
  },
  {
    label: "time+uuid",
    code: `main() {
    println(time.isLeapYear(2024) + " " + time.daysInMonth(2024, 2))
    println(time.dayOfWeek(2024, 9, 17) + " " + time.isWeekend(2024, 9, 15))
    println(time.daysBetween(2024, 1, 1, 2024, 12, 31))
    println(time.addDays("2024-01-31", 1) + " " + time.diffDays("2024-01-01", "2024-01-31"))
    println(time.todayIso())
    var id = uuid.v4()
    println(id + " isUuid? " + uuid.isUuid(id))
    println(uuid.isUuid("00000000-0000-4000-8000-000000000000"))
    println(uuid.v7())
}`,
  },
  {
    label: "validation+net",
    code: `main() {
    println("cpf " + validation.isCpf("52998224725"))
    println("cnpj " + validation.isCnpj("11222333000181"))
    println("cep " + validation.isCep("01310100") + " " + validation.formatCep("01310100"))
    println("email " + validation.isEmail("a@b.co") + " url " + validation.isUrl("https://kof.dev"))
    println("ipv4 " + validation.isIpv4("192.168.0.1") + " ipv6 " + validation.isIpv6("::1"))
    println("mac " + validation.isMac("00:1A:2B:3C:4D:5E") + " port " + validation.isPort(8080))
    var u = "https://kof.dev:8080/app?a=1#top"
    println(net.scheme(u) + " " + net.host(u) + " " + net.port(u))
    println(net.path(u) + " " + net.query(u) + " " + net.fragment(u))
}`,
  },
  {
    label: "Herança",
    code: `class Animal(String nome) {
    falar(): String { return "... " + this.nome }
}
class Cao(String nome) extends Animal {
    falar(): String { return "au au, sou " + this.nome }
}
main() {
    var a = Animal("bicho")
    var c = Cao("Rex")
    println(a.falar())
    println(c.falar())
    println(c.nome)
}`,
  },
  {
    label: "Try/catch",
    code: `main() {
    try {
        println("tentando")
        throw "oops de String"
    } catch (String e) {
        println("peguei: " + e)
    } finally {
        println("finally sempre roda")
    }
    // erro nativo (bounds) não é pego por catch String — só throw String pega
    // try { var l = listOf(1,2); println(l.get(99)) } catch(String e) { } // escapa como [ERR]
}`,
  },
  {
    label: "Generics",
    code: `saudacao(String nome = "mundo"): String { return "oi, " + nome }
main() {
    // generics com erasure — List<String> é List em runtime
    var nomes = listOf<String>("ana", "bob")
    println(nomes.map((String s) -> s.toUpperCase()))
    var nums = listOf<Int>(1, 2, 3)
    println(nums.filter((Int x) -> x > 1))
    println(saudacao())
    println(saudacao("Mel"))
}`,
  },
  {
    label: "random",
    code: `main() {
    println("int 0..100 " + random.randomInt(100))
    println("bool " + random.randomBoolean() + " double " + random.double())
    println(random.randomString(8, "abc"))
    println("hex " + random.hex(4) + " bytesHex " + random.randomBytesHex(4))
    // security (parcial no browser)
    println(security.sha256("kof"))
    println(security.constantTimeEquals("abc", "abc"))
}`,
  },
  {
    label: "Concorrência+",
    code: `main() {
    // poll/done sem bloquear (além de spawn/await)
    val r = spawn { var s = 0; for (var i = 0; i < 3; i++) s += i; s }
    println("done? " + done(r))
    println("await=" + await r + " done? " + done(r))
    // arrays multidim
    var m = new Int[2][3]
    m[0][1] = 7
    println(m[0][1] + " dims " + m.length + "x" + m[0].length)
}`,
  },
  {
    label: "Gaps honestos",
    code: `main() {
    // Única limitação é o Pages ser estático — sem host:
    // os gaps abaixo reportam o MESMO código que \`kof check\`:
    // var db = db.connect("jdbc:h2:mem:test") // -> DB001
    // var s = kof.io.readText("a.txt")        // -> DB001/IO
    // kof.web.app().listen(3000)              // -> WEB001
    // No browser, try/catch NÃO pega gaps de host — só \`throw String\`:
    try { throw "oops" } catch (String e) { println("peguei: " + e) }
    println("gaps nunca silenciam (R6)")
}`,
  },
];
