import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { DocsBrowser } from "@/components/kof/DocsBrowser";
import { Ascii, Card, Section, TRAINING } from "@/components/kof/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — Kof" },
      {
        name: "description",
        content:
          "Documentação de uso da Kof: trilha learn/, corpus training/, ferramentas da CLI e treinamento para LLMs — com busca no texto inteiro e tópicos expansíveis.",
      },
      { property: "og:title", content: "Documentação — Kof" },
      {
        property: "og:description",
        content: "A documentação é parte da linguagem, não conteúdo secundário.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/docs" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/docs" }],
  }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <main>
      <DocsBrowser
        kind="core"
        startCollection="learn"
        index="01"
        eyebrow="Documentation"
        title="A documentação é parte da linguagem."
        lead="learn/ e training/ — o conteúdo de referência e treinamento dos repositórios, direto aqui, com busca por palavras-chave e tópicos que expandem. O curso completo fica em /learn. O snapshot é gerado no build e revalidado ao vivo contra o GitHub."
      />

      <Section
        index="02"
        eyebrow="Ferramentas"
        title="Uma linguagem deve vir com as suas ferramentas."
        lead="A CLI da Kof acompanha a linguagem. Ferramentas ainda não disponíveis estão marcadas como tal."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            language="shell"
            filename="kof cli"
            showLineNumbers={false}
            code={`$ kof build
$ kof run
$ kof serve
$ kof check
$ kof test
$ kof debug
$ kof bench
$ kof profile
$ kof inspect
$ kof decompile
$ kof translate
$ kof compare
$ kof migrate
$ kof fmt
$ kof new
$ kof init
$ kof deps
$ kof config
$ kof editor
$ kof info
$ kof lsp
$ kof install
$ kof script
$ kof repl
$ kof c
$ kof version`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Compilador" status="available" />
            <Card title="CLI" status="available" />
            <Card title="Testes (kof test)" status="available" />
            <Card title="Benchmarks (kof bench)" status="available" />
            <Card title="Profile (kof profile)" status="available" />
            <Card title="Inspect IR (kof inspect)" status="available" />
            <Card title="LSP" status="available">
              Diagnostics reais do frontend; hover, completion, references/rename e documentSymbol
              já.
            </Card>
            <Card title="Debugger (kof debug)" status="in-development">
              MVP DAP sobre stdio no target JVM — DWARF Native e source maps JS parciais.
            </Card>
            <Card title="Formatador (kof fmt)" status="available">
              Parser real (KofFormatter), idempotente. <span className="font-mono">kof fmt -w</span>{" "}
              reescreve no lugar.
            </Card>
            <Card title="Gerenciador de pacotes" status="available">
              MVP com <span className="font-mono">kof deps</span> — registry além do MVP em
              construção.
            </Card>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/kof-editor"
            className="inline-block rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
          >
            Kof Editor & Theme Maker →
          </Link>
          <Link
            to="/learn"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Curso completo →
          </Link>
          <Link
            to="/language"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Linguagem →
          </Link>
          <Link
            to="/standard-library"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Biblioteca padrão →
          </Link>
          <Link
            to="/targets"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Targets →
          </Link>
          <Link
            to="/web"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Web →
          </Link>
          <Link
            to="/download"
            className="inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            Instalação →
          </Link>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="Treinamento para LLMs"
        title="Ensine as suas ferramentas a falar Kof."
        lead="Kof não quer depender de modelos adivinhando como a linguagem funciona. O repositório mantém material estruturado para que ferramentas automatizadas aprendam sintaxe, semântica e padrões corretamente — o corpus training/ também está pesquisável no navegador acima."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="/training">{`training/
├── language/
├── reference/
├── patterns/
├── anti-patterns/
├── migration/
└── examples/`}</Ascii>
          <div className="grid gap-4">
            <Card title="Feita para humanos. Naturalmente amigável às máquinas.">
              Kof não é uma “AI language”. A filosofia continua humana primeiro. Mas sintaxe
              consistente, semântica explícita e baixo boilerplate têm uma consequência: a linguagem
              também fica mais fácil de compreender por ferramentas automatizadas.
            </Card>
            <Card title="Menos tokens para expressar a mesma intenção.">
              Sem benchmarks inventados: o projeto não publica números de tokens ou comparações de
              desempenho de LLM sem dados reais.
            </Card>
            <a
              href={TRAINING}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
            >
              Abrir /training no GitHub →
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
