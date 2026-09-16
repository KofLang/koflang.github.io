import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { DocsBrowser } from "@/components/kof/DocsBrowser";
import { Ascii, Card, CURSO, LEARN_DIR, Section, TRAINING } from "@/components/kof/primitives";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Aprender — Kof" },
      {
        name: "description",
        content:
          "Curso completo e gratuito de Kof aqui no site: fundamentos, algoritmos, estruturas de dados, banco, web, segurança, testes, arquitetura e DevOps — com busca e tópicos expansíveis. Trilha learn/ e corpus training/ em /docs.",
      },
      { property: "og:title", content: "Aprender — Kof" },
      {
        property: "og:description",
        content: "Aprenda Kof do zero ao avançado, com busca no texto do curso inteiro.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/learn" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/learn" }],
  }),
  component: LearnPage,
});

function LearnPage() {
  return (
    <main>
      <Section
        index="00"
        eyebrow="Curso"
        title="Aprenda Kof do zero ao avançado — de graça."
        lead="O curso completo mora aqui: 16 módulos e projetos, do primeiro println à arquitetura, DevOps e cibersegurança. Busque por palavras-chave, expande e contrai os tópicos, tudo renderizado direto do repositório."
      >
        <div className="flex flex-wrap gap-4">
          <a
            href="#curso-completo"
            className="inline-block rounded-md border border-signal bg-signal px-5 py-4 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Começar pelo módulo 00 ↓
          </a>
          <a
            href={CURSO}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Abrir no GitHub →
          </a>
        </div>
      </Section>

      <DocsBrowser
        kind="curso"
        startCollection="curso"
        index="01"
        eyebrow="Curso completo de Kof"
        title="O curso inteiro, pesquisável."
        lead="Fundamentos, algoritmos, estruturas de dados, banco, segurança, redes, HTTP, frontend, boas práticas, cibersegurança, ciência de dados, testes, debugger, microsserviços, arquitetura e DevOps — com exercícios e projetos. Gerado no build a partir do repositório do curso e revalidado ao vivo."
      />

      <Section
        index="02"
        eyebrow="Aprender"
        title="Comece pelo menor programa possível."
        lead="Kof é fácil de começar de propósito. Um arquivo, uma função main, sem projeto, sem configuração, sem cerimônia."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="hello.kf"
            code={`main() {
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

      <Section index="03" eyebrow="Passo a passo" title="Funções, tipos e dados">
        <div className="grid gap-6">
          <div>
            <p className="mono-label mb-3">01 — funções tipadas</p>
            <CodeBlock
              filename="add.kf"
              code={`add(Int a, Int b): Int {
    return a + b
}

main() {
    println(add(2, 3))
}`}
            />
          </div>
          <div>
            <p className="mono-label mb-3">02 — dados sem cerimônia</p>
            <CodeBlock
              filename="user.kf"
              code={`record User(String name, String email)

main() {
    var user = User("Mel", "mel@example.com")
    println(user.name())
}`}
            />
          </div>
          <div>
            <p className="mono-label mb-3">03 — coleções</p>
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
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="learn/ vs training/"
        title="Duas trilhas, dois públicos."
        lead="docs/ diz como Kof é, learn/ ensina como usar, training/ alimenta quem gera código. A referência (learn/ + training/) está no navegador de /docs; o curso completo mora nesta página."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="learn/ — humanos (00 → 39)">
            <p>
              00 Introdução → 39 Standard Library universal + native/. Capítulos numerados, cada um
              um guia prático — pesquisável em /docs.
            </p>
            <Ascii className="mt-4">{`learn/
 00-introduction.md
 01-installation.md
 ...
 35-kof-ui.md
 36-security.md
 37-kofjs.md
 38-editors.md
 39-stdlib.md`}</Ascii>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/docs"
                className="inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
              >
                Navegar em /docs →
              </Link>
              <a
                href={LEARN_DIR}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:underline"
              >
                Abrir learn/ →
              </a>
            </div>
          </Card>
          <Card title="training/ — LLMs e ferramentas">
            <p>
              Corpus otimizado: language/, idioms/ (ui/web/stdlib), patterns/, anti-patterns/
              (fake-idioms com PARSE085), examples/, reference/, migration/, tooling/ — pesquisável
              em /docs.
            </p>
            <Ascii className="mt-4">{`training/
 language/
 idioms/stdlib.md
 idioms/ui.md
 anti-patterns/fake-idioms.md
 examples/`}</Ascii>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <Link
                to="/docs"
                className="inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
              >
                Navegar em /docs →
              </Link>
              <a
                href={TRAINING}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:underline"
              >
                Abrir training/ →
              </a>
            </div>
          </Card>
        </div>
      </Section>
    </main>
  );
}
