import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { GITHUB, Ascii, Card, Section, StatusBadge } from "@/components/kof/primitives";
import { KOF_CHANGELOG } from "@/lib/kof-changelog";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Language — Kof" },
      {
        name: "description",
        content:
          "A linguagem Kof: fortemente e estaticamente tipada, sintaxe pequena, semântica explícita e boilerplate mínimo.",
      },
      { property: "og:title", content: "Language — Kof" },
      {
        property: "og:description",
        content: "Sintaxe, tipos e filosofia da linguagem Kof.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/language" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/language" }],
  }),
  component: LanguagePage,
});

const javaSample = `public final class User {

    private final String name;
    private final String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String name() {
        return name;
    }

    public String email() {
        return email;
    }
}`;

const kofSample = `record User(String name, String email)`;

function LanguagePage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Language"
        title="A linguagem deve representar intenção."
        lead="Kof é uma linguagem geral, fortemente tipada e estaticamente tipada, criada para reduzir drasticamente a complexidade necessária para construir software moderno."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="Tipagem forte">
            Erros importantes devem ser encontrados em compile-time, não em produção.
          </Card>
          <Card title="Tipagem estática">
            Tipos são verificados pelo compilador; o sistema de tipos é parte do frontend único da
            linguagem.
          </Card>
          <Card title="Humano primeiro">
            A linguagem é projetada primeiro para seres humanos: fácil de ler, escrever, aprender e
            manter.
          </Card>
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Humano primeiro"
        title="Boilerplate não é uma feature."
        lead="Se o compilador consegue entender a intenção sem exigir vinte linhas de cerimônia, vinte linhas de cerimônia não deveriam existir."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mono-label mb-3">Cerimônia tradicional</p>
            <CodeBlock code={javaSample} filename="User.java" language="text" />
          </div>
          <div>
            <p className="mono-label mb-3">Kof</p>
            <CodeBlock code={kofSample} filename="User.kf" />
            <p className="mt-4 text-sm text-muted-foreground">
              Menos código não significa menos capacidade.
            </p>
          </div>
        </div>
      </Section>

      <Section index="03" eyebrow="Sintaxe" title="Exemplos executáveis">
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="hello.kf"
            code={`main() {
    println("Hello from Kof")
}`}
          />
          <CodeBlock
            filename="add.kf"
            code={`add(Int a, Int b): Int {
    return a + b
}

main() {
    println(add(2, 3))
}`}
          />
          <CodeBlock
            filename="user.kf"
            code={`record User(String name, String email)

main() {
    var user = User("Mel", "mel@example.com")
    println(user.name())
}`}
          />
          <CodeBlock
            filename="collections.kf"
            code={`main() {
    var users = listOf("Mel", "Kof")

    for (var user in users) {
        println(user)
    }
}`}
          />
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="Estado da linguagem"
        title="O que já existe no frontend da linguagem"
        lead="Recursos abaixo fazem parte da base do compilador (linha 0.6). A separação linguagem ≠ compilador ≠ target está documentada em docs/language-reference/ (gramática, sistema de tipos, semântica) e docs/compiler-architecture.md (implementação)."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "classes com constructor (new opcional; sem getter/setter — campo direto)",
            "records (SEM038 imutável, 0.3.5+; class X(...) também é record)",
            "inheritance + dispatch virtual",
            "interfaces (SEM043 exaustividade)",
            "constructors + sobrecarga",
            "val imutável (SEM037)",
            "exceptions reais (throw String)",
            "generics (erasure) + Box<T> primitivo",
            "coleções List/Map/Set + map/filter/reduce",
            "enum + switch exaustivo (SEM031)",
            "switch-expressão (SYN001) + guardas (SG-014)",
            "string operations + kof.strings (escapeJson, word converters)",
            "control flow (if-expr, for-in, switch)",
            "lambdas com capturas (3 níveis, Box mutável)",
            "default parameters",
            "pattern matching (case String s, Point(x,y), instanceof) + guards",
            "sobrecarga top-level (SG-011B) e de método nos 4 backends",
            "print heterogêneo em if/switch-expressão (0.4.1)",
            "assignments compostos bitwise/shift (|= &= <<= >>= >>>=)",
            "null safety ampliada — Map.get→V?, valor default em primitivo nullable",
            "arrays multidim new T[a][b] (MULTIANEWARRAY)",
            "functions sem fun/fn/func (PARSE085 reservadas)",
            "private/protected checados (SEM046)",
            "sealed + switch exaustivo sobre subtipos diretos (SEM080/SEM081, 0.6.0)",
            "for-in sobre String — `for (var c in s)`, variável Char nos 4 alvos (0.6.4)",
            "`case Tipo ->` nu como type test em switch sobre sealed (0.6.4)",
            "variância out/in em declaração + projeção use-site (SEM082, 0.6.0)",
            "FFI extern com callbacks (trampoline no Native, 0.6.0)",
            "language specification (docs/language-reference/)",
            "conformance suite (embrião E2E, previsto)",
          ].map((f) => {
            const isAvailable = !f.includes("previsto");
            const status: "available" | "in-development" = isAvailable
              ? "available"
              : "in-development";
            return (
              <div
                key={f}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3"
              >
                <span className="font-mono text-sm">{f}</span>
                <StatusBadge status={status} />
              </div>
            );
          })}
        </div>
        <p className="mt-6 max-w-2xl font-mono text-xs text-muted-foreground">
          `fn`/`fun`/`func` são palavras reservadas (SG-001, 06/09) — em qualquer posição dão
          PARSE085. `let`/`const`/`async` não existem — KofScript é Kof puro (PARSE085). Arrays
          literais `[1,2,3]` e `Option&lt;T&gt;` não existem.
        </p>
      </Section>

      <Section index="05" eyebrow="One frontend" title="A linguagem não muda quando o target muda.">
        <Ascii label="frontend único">{`Kof Source
      ↓
 Kof Compiler
      ↓
 Kof IR
      ↓
  ┌───┬───┬───────┬────┬──────┐
  ↓   ↓   ↓       ↓    ↓      ↓
 JVM Native Script KofJS KofC`}</Ascii>
      </Section>

      <Section
        index="06"
        eyebrow="Changelog"
        title="Cada versão, colapsável."
        lead="O histórico completo da linguagem, uma versão por bloco — da 0.0.3 (21/08) à 0.6.4. Cada bloco resume os registros documentados da seção correspondente no changelog oficial; o detalhe item a item vive no repositório."
      >
        <div className="space-y-2">
          {KOF_CHANGELOG.map((release) => (
            <details
              key={release.version}
              className="group rounded-md border border-border bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-baseline gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-sm font-medium text-foreground">
                  {release.version}
                </span>
                {release.tag && (
                  <span className="rounded-sm border border-signal/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
                    {release.tag}
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">{release.date}</span>
                <span className="ml-auto self-center font-mono text-base leading-none text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="border-t border-border px-4 py-3">
                {release.items.map((item) => (
                  <li key={item} className="py-1 text-sm leading-relaxed text-muted-foreground">
                    · {item}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
        <p className="mt-6 font-mono text-xs text-muted-foreground">
          Curado a partir de{" "}
          <a
            className="text-signal hover:underline"
            href={`${GITHUB}/blob/main/CHANGELOG.pt_BR.md`}
            target="_blank"
            rel="noreferrer noopener"
          >
            CHANGELOG.pt_BR.md
          </a>{" "}
          no repositório oficial — as alfas 0.0.1–0.0.2 precedem o registro seção a seção.
        </p>
      </Section>
    </main>
  );
}
