import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Ascii, Card, LEARN_DIR, Section, TRAINING } from "@/components/kof/primitives";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Kof" },
      {
        name: "description",
        content:
          "Trilha para aprender Kof: primeiros programas, tipos, classes e coleções. learn/ é para humanos, training/ é para ferramentas.",
      },
      { property: "og:title", content: "Learn — Kof" },
      {
        property: "og:description",
        content: "Aprenda Kof a partir de exemplos executáveis reais.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/learn" },
    ],
    links: [{ rel: "canonical", href: "/learn" }],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Learn"
        title="Comece pelo menor programa possível."
        lead="Kof é fácil de começar de propósito. Um arquivo, uma função main, sem projeto, sem configuração, sem cerimônia."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="hello.kf"
            code={`fun main() {
    println("Hello from Kof")
}`}
          />
          <CodeBlock
            language="shell"
            filename="terminal"
            showLineNumbers={false}
            code={`$ kof run hello.kf
$ kof build hello.kf
$ kof check hello.kf`}
          />
        </div>
      </Section>

      <Section index="02" eyebrow="Passo a passo" title="Funções, tipos e dados">
        <div className="grid gap-6">
          <div>
            <p className="mono-label mb-3">01 — funções tipadas</p>
            <CodeBlock
              filename="add.kf"
              code={`fun add(Int a, Int b): Int {
    return a + b
}

fun main() {
    println(add(2, 3))
}`}
            />
          </div>
          <div>
            <p className="mono-label mb-3">02 — dados sem cerimônia</p>
            <CodeBlock
              filename="user.kf"
              code={`class User(
    String name,
    String email
)

fun main() {
    var user = User("Mel", "mel@example.com")
    println(user.name)
}`}
            />
          </div>
          <div>
            <p className="mono-label mb-3">03 — coleções</p>
            <CodeBlock
              filename="collections.kf"
              code={`fun main() {
    var users = new List<String>()

    users.add("Mel")
    users.add("Kof")

    println(users.get(0))
}`}
            />
          </div>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="learn/ vs training/"
        title="Duas trilhas, dois públicos."
        lead="Essa separação faz parte da identidade do projeto."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="learn/">
            <p>Humanos aprendendo Kof: explicações, progressão e contexto.</p>
            <Ascii className="mt-4">{`learn/
    → humanos aprendendo Kof`}</Ascii>
            <a
              href={LEARN_DIR}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Abrir learn/ →
            </a>
          </Card>
          <Card title="training/">
            <p>Ferramentas e LLMs aprendendo Kof: material estruturado e padronizado.</p>
            <Ascii className="mt-4">{`training/
    → ferramentas e LLMs aprendendo Kof`}</Ascii>
            <a
              href={TRAINING}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Abrir training/ →
            </a>
          </Card>
        </div>
      </Section>
    </main>
  );
}
