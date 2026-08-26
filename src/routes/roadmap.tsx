import { createFileRoute } from "@tanstack/react-router";
import { GITHUB, Section, StatusBadge, type Status } from "@/components/kof/primitives";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Kof" },
      {
        name: "description",
        content:
          "O que já está pronto, o que está em desenvolvimento e o que está planejado na linguagem Kof. Sem datas falsas.",
      },
      { property: "og:title", content: "Roadmap — Kof" },
      {
        property: "og:description",
        content: "Estado real do compilador, backends, stdlib e tooling da Kof.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/roadmap" },
    ],
    links: [{ rel: "canonical", href: "/roadmap" }],
  }),
  component: RoadmapPage,
});

const groups: { status: Status; title: string; items: string[] }[] = [
  {
    status: "available",
    title: "Concluído",
    items: [
      "Compiler foundation",
      "Lexer",
      "Parser",
      "AST",
      "Type system foundation",
      "Semantic analysis",
      "Kof IR",
      "JVM backend",
      "Native backend",
      "classes",
      "records",
      "inheritance",
      "interfaces",
      "constructors",
      "exceptions",
      "generics",
      "collections",
      "string operations",
      "control flow",
      "kof build",
      "kof run",
      "kof serve",
      "kof test",
      "kof debug (MVP, JVM)",
      "kof bench",
      "kof.web — rotas e middleware (JVM)",
      "kof.db — JDBC + SQLite nativo",
      "kof.orm — entity, CRUD, migrate, MongoDB (JVM)",
      "kof.log nativo",
      "kof.mq — pub/sub (JVM)",
      "cliente HTTP (JVM)",
      "kof.security v1 (JVM, Native e JS)",
      "web security G9 — rateLimit, sessões e API keys (3 targets)",
      "TLS/HTTPS — web.listenSecure na JVM (WEB002 fora dela)",
      "kof.validation — 13 predicados (3 targets)",
      "kof.observability — health, métricas e request IDs (3 targets)",
      "kof.ui — widgets com render KofJS",
      "spawn na JVM (virtual threads)",
      "await de spawn — handle tipado (JVM)",
      "enum nos 3 targets + switch exaustivo (SEM031)",
      "Map/Set nos 3 targets — COL001 fechado",
      "otimizador de IR + kof bench no CI",
      "releases multiplataforma",
    ],
  },
  {
    status: "in-development",
    title: "Em desenvolvimento",
    items: [
      "Standard Library",
      "Async",
      "Concurrency — spawn no Native (CONC001), spawn-expr/await no JS (CONC003)",
      "KofAndroid — Fase 1: kof build --target android gera projeto Maven com host em Kof",
      "Native GC",
      "MySQL/MariaDB nativo (wire protocol)",
      "Ponto flutuante SSE no Native (FLT001)",
      "JSON de objetos no Native (JSN002)",
      "LSP — hover e completion",
      "Debugger — além do MVP JVM",
      "KofJS — plataforma web no browser",
    ],
  },
  {
    status: "planned",
    title: "Planejado",
    items: [
      "KofScript — runtime de execução direta",
      "kof fmt",
      "package manager (kof init, kofdeps, registry)",
      "complete language specification",
      "conformance suite",
      "query DSL tipada para o ORM",
      "módulos multi-arquivo",
      "full web platform",
      "auto-hospedagem (compilador escrito em Kof)",
    ],
  },
];

function RoadmapPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Roadmap"
        title="Sem datas falsas. Apenas estado."
        lead="O roadmap descreve o que existe, o que está sendo construído e para onde o projeto vai. Futuramente ele será alimentado diretamente pelo repositório."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title} className="rounded-md border border-border bg-surface">
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <h3 className="font-mono text-sm uppercase tracking-widest">{group.title}</h3>
                <StatusBadge status={group.status} />
              </div>
              <ul className="divide-y divide-border">
                {group.items.map((item) => (
                  <li key={item} className="px-4 py-2.5 font-mono text-sm text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Versionamento"
        title="MAJOR.MINOR.PATCH — e o pontinho da vergonha."
        lead="A regra de evolução é simples: major releases > major fixes > bugfixes. A primeira release estável, a 0.1.0, já foi lançada — o desenvolvimento segue em 0.1.x e o PATCH continua subindo bastante."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="font-mono text-sm text-muted-foreground">MAJOR.MINOR.PATCH</p>
            <p className="mt-4 text-sm text-muted-foreground">
              O PATCH é, por enquanto, o pontinho da vergonha: pequenas correções, ajustes e
              estabilização enquanto a linguagem ainda está na fase inicial. Ele sobe bastante. Faz
              parte.
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="mono-label">Objetivo de automação</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Cada commit em <span className="font-mono">main</span> deve futuramente disparar
              automaticamente a atualização de versão e release conforme as regras do projeto.
            </p>
            <a
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
              href={`${GITHUB}/releases`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Ver releases →
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
