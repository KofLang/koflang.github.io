import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Ascii, Card, CURSO, GITHUB, Section, TRAINING } from "@/components/kof/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Kof" },
      {
        name: "description",
        content:
          "Documentação da Kof: primeiros passos, curso gratuito, instalação, linguagem, biblioteca padrão, compilador, targets, web, runtime, treinamento para LLMs e contribuição.",
      },
      { property: "og:title", content: "Documentation — Kof" },
      {
        property: "og:description",
        content: "A documentação é parte da linguagem, não conteúdo secundário.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/docs" },
    ],
    links: [{ rel: "canonical", href: "/docs" }],
  }),
  component: DocsPage,
});

const sections = [
  {
    title: "Primeiros passos",
    desc: "Instalar, compilar e rodar o primeiro programa Kof.",
    href: GITHUB,
  },
  {
    title: "Curso gratuito",
    desc: "Curso completo e gratuito da linguagem, do zero ao avançado.",
    href: CURSO,
  },
  {
    title: "Instalação",
    desc: "Distribuição autocontida com compilador, runtime e OpenJDK embutido.",
    to: "/download" as const,
  },
  {
    title: "Linguagem",
    desc: "Sintaxe, tipos, classes, generics e controle de fluxo.",
    to: "/language" as const,
  },
  {
    title: "Biblioteca padrão",
    desc: "Coleções, strings, e as capacidades em construção.",
    to: "/standard-library" as const,
  },
  {
    title: "Compilador",
    desc: "Lexer, parser, AST, análise semântica, símbolos e Kof IR.",
    href: GITHUB,
  },
  {
    title: "Targets",
    desc: "JVM, Native e KofJS a partir de um único frontend.",
    to: "/targets" as const,
  },
  { title: "Web", desc: "kof serve e a visão da plataforma web.", to: "/web" as const },
  { title: "Runtime", desc: "Execução, memória e o que pertence à plataforma.", href: GITHUB },
  {
    title: "Treinamento para LLMs",
    desc: "Material estruturado em /training para ferramentas automatizadas.",
    href: TRAINING,
  },
  {
    title: "Kof Editor & Theme Maker",
    desc: "Editor de texto escrito em Kof, themes e a ferramenta web para criar temas.",
    to: "/kof-editor" as const,
  },
  { title: "Contribuir", desc: "Como contribuir com o compilador e a linguagem.", href: GITHUB },
];

function DocsPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Documentation"
        title="A documentação é parte da linguagem."
        lead="Enquanto o site de documentação completo não existe, cada área aponta para a fonte real: o repositório oficial e as páginas técnicas deste site. Nada aqui documenta API que ainda não foi definida."
      >
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
          {sections.map((s) => {
            const body = (
              <>
                <h3 className="text-base font-semibold tracking-tight group-hover:text-signal">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </>
            );
            return s.to ? (
              <Link
                key={s.title}
                to={s.to}
                className="group bg-surface p-5 transition-colors hover:bg-surface-2"
              >
                {body}
              </Link>
            ) : (
              <a
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="group bg-surface p-5 transition-colors hover:bg-surface-2"
              >
                {body}
              </a>
            );
          })}
        </div>
      </Section>

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
$ kof fmt
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
            <Card title="LSP" status="in-development">
              Diagnostics reais do frontend; hover e completion são o próximo passo.
            </Card>
            <Card title="Debugger (kof debug)" status="in-development">
              MVP DAP sobre stdio no target JVM.
            </Card>
            <Card title="Formatador (kof fmt)" status="available">
              Parser real (KofFormatter), idempotente. <span className="font-mono">kof fmt -w</span> reescreve no lugar.
            </Card>
            <Card title="Gerenciador de pacotes" status="planned" />
          </div>
        </div>
        <a
          href="/kof-editor"
          className="mt-6 inline-block rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
        >
          Kof Editor & Theme Maker →
        </a>
      </Section>

      <Section
        index="03"
        eyebrow="Treinamento para LLMs"
        title="Ensine as suas ferramentas a falar Kof."
        lead="Kof não quer depender de modelos adivinhando como a linguagem funciona. O repositório mantém material estruturado para que ferramentas automatizadas aprendam sintaxe, semântica e padrões corretamente."
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
