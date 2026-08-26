import { createFileRoute } from "@tanstack/react-router";
import { Ascii, Card, CURSO, EDITOR, GITHUB, RELEASES, Section } from "@/components/kof/primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kof" },
      {
        name: "description",
        content:
          "O que é Kof, o que Kof não é, e o que a licença GPLv3 significa para quem escreve software com a linguagem.",
      },
      { property: "og:title", content: "About — Kof" },
      {
        property: "og:description",
        content: "Uma linguagem de verdade, em desenvolvimento ativo. GPLv3.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="About"
        title="Estamos construindo uma linguagem de verdade."
        lead="Kof é uma linguagem de programação geral, fortemente tipada e estaticamente tipada, com compilador próprio, Kof IR e múltiplos backends. Está em desenvolvimento ativo — a primeira estável (0.1.0) já saiu e o dia a dia segue na 0.1.1-alpha — e este site se compromete a não transformar isso em promessa vazia."
      >
        <blockquote className="rounded-md border-l-2 border-signal bg-surface p-5 text-base leading-relaxed">
          Algumas pessoas olham para um problema e escrevem uma biblioteca. Outras escrevem um
          framework. Algumas criam uma ferramenta. Eu aparentemente olhei para o ecossistema inteiro
          e pensei:
          <span className="mt-2 block text-signal">
            “Tá tudo complicado demais. Vou criar uma linguagem.”
          </span>
          <footer className="mt-3 text-sm text-muted-foreground">
            E, aparentemente, uma linguagem só também não era suficiente.
          </footer>
        </blockquote>
      </Section>

      <Section
        index="02"
        eyebrow="Identidade"
        title="O que Kof NÃO é."
        lead="Tão importante quanto o que é:"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Java com outra sintaxe",
            "Kotlin 2",
            "Julia para JVM",
            "Um transpiler",
            "Um gerador de Java",
            "Um interpretador fantasiado de compilador",
          ].map((item) => (
            <div
              key={item}
              className="rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm"
            >
              ✗ {item}
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Kof é uma linguagem. Um compilador. Uma IR. Vários backends.
        </p>
      </Section>

      <Section
        index="03"
        eyebrow="Documentação do projeto"
        title="Três pastas, três públicos."
        lead="docs/ diz como Kof é (estado e arquitetura). learn/ ensina como usar. training/ alimenta quem gera código Kof."
      >
        <Ascii label="repositório">{`Kof4j/
├── docs/       → arquitetos, mantenedores, decisões
├── learn/      → humanos aprendendo Kof
└── training/   → LLMs e ferramentas aprendendo Kof`}</Ascii>
      </Section>

      <Section
        index="04"
        eyebrow="Licença"
        title="Compilador open source. Seu software é seu."
        lead="Kof é software livre distribuído sob a GNU General Public License v3.0. Isso se aplica ao código-fonte do compilador, ferramentas e demais componentes do projeto."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="GPLv3 no compilador">
            O código-fonte da plataforma é livre e permanece aberto.
          </Card>
          <Card title="Seu código é seu">
            Programas escritos em Kof NÃO são automaticamente GPLv3. Software proprietário escrito
            em Kof é permitido, desde que respeite as licenças das dependências que efetivamente
            incorporar.
          </Card>
        </div>
      </Section>

      <Section index="05" eyebrow="Projeto" title="Links oficiais">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">A linguagem</h3>
            <p className="mt-2 text-sm text-muted-foreground">github.com/KofLang/Kof4j</p>
          </a>
          <a
            href={EDITOR}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Editor de texto
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">github.com/KofLang/Kof-Editor</p>
          </a>
          <a
            href={CURSO}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Curso gratuito
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              github.com/lunalully/curso-completo-de-kof
            </p>
          </a>
          <a
            href={RELEASES}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">Releases</h3>
            <p className="mt-2 text-sm text-muted-foreground">Downloads oficiais</p>
          </a>
          <a
            href={`${GITHUB}/blob/main/docs/LICENSING.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">Licença</h3>
            <p className="mt-2 text-sm text-muted-foreground">Detalhes completos da GPLv3</p>
          </a>
        </div>
      </Section>
    </main>
  );
}
