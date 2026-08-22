import { createFileRoute, Link } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Ascii, Card, GITHUB, Section, TRAINING } from "@/components/kof/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentation — Kof" },
      {
        name: "description",
        content:
          "Documentação da Kof: getting started, instalação, linguagem, standard library, compilador, targets, web, runtime, LLM training e contributing.",
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
  { title: "Getting Started", desc: "Instalar, compilar e rodar o primeiro programa Kof.", href: GITHUB },
  { title: "Installation", desc: "Distribuição autocontida com compiler, runtime e OpenJDK embutido.", to: "/download" as const },
  { title: "Language", desc: "Sintaxe, tipos, classes, generics e controle de fluxo.", to: "/language" as const },
  { title: "Standard Library", desc: "Coleções, strings, e as capacidades em construção.", to: "/standard-library" as const },
  { title: "Compiler", desc: "Lexer, parser, AST, análise semântica, símbolos e Kof IR.", href: GITHUB },
  { title: "Targets", desc: "JVM, Native, Script e KofJS a partir de um único frontend.", to: "/targets" as const },
  { title: "Web", desc: "kof serve e a visão da plataforma web.", to: "/web" as const },
  { title: "Runtime", desc: "Execução, memória e o que pertence à plataforma.", href: GITHUB },
  { title: "LLM Training", desc: "Material estruturado em /training para ferramentas automatizadas.", href: TRAINING },
  { title: "Contributing", desc: "Como contribuir com o compilador e a linguagem.", href: GITHUB },
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
              <Link key={s.title} to={s.to} className="group bg-surface p-5 transition-colors hover:bg-surface-2">
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
        eyebrow="Tooling"
        title="A language should ship with its tools."
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
$ kof info
$ kof lsp
$ kof version`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Compiler" status="available" />
            <Card title="CLI" status="available" />
            <Card title="LSP" status="in-development" />
            <Card title="Test tooling" status="in-development" />
            <Card title="Formatter" status="planned" />
            <Card title="Package manager" status="planned" />
          </div>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="LLM Training"
        title="Teach your tools Kof."
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
            <Card title="Built for humans. Naturally friendly to machines.">
              Kof não é uma “AI language”. A filosofia continua human-first. Mas sintaxe
              consistente, semântica explícita e baixo boilerplate têm uma consequência:
              a linguagem também fica mais fácil de compreender por ferramentas
              automatizadas.
            </Card>
            <Card title="Menos tokens para expressar a mesma intenção.">
              Sem benchmarks inventados: o projeto não publica números de tokens ou
              comparações de desempenho de LLM sem dados reais.
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
