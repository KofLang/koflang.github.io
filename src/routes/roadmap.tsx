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
      "kof.web — WebSocket RFC 6455 + SSE nativo (JVM, 0.2.6-beta)",
      "kof.web — accept loop HTTP/1.1 no Native (WEB002 T1, 0.2.8-beta)",
      "kof.db — JDBC + SQLite nativo + transaction {} commit/rollback real",
      "kof.orm — entity, CRUD, migrate, MongoDB (JVM) + Query DSL tipada (ORM001)",
      "kof.log nativo",
      "kof.config — arquivo > env > profile, tipado, interpolação ${key} (3 targets)",
      "kof.mq — pub/sub (3 targets, MQ001 fechado)",
      "cliente HTTP (JVM+JS+Native, HTTP002 fechado)",
      "kof.security v1 (JVM, Native e JS)",
      "web security G9 — rateLimit, sessões e API keys (3 targets)",
      "TLS/HTTPS — web.listenSecure na JVM (WEB002 fora dela)",
      "kof.validation — 13 predicados (3 targets)",
      "kof.observability — health, métricas e request IDs (3 targets)",
      "kof.ui — widgets com render KofJS",
      "spawn na JVM (virtual threads)",
      "await de spawn — handle tipado (JVM)",
      "concórrencia real no JS — async/await/Promise (CONC003 fechado, 0.2.8-beta)",
      "enum nos 3 targets + switch exaustivo (SEM031)",
      "Map/Set nos 3 targets — COL001 fechado",
      "otimizador de IR sempre ativo + kof bench com baselines (37 benchmarks)",
      "KofScript — top-level let/const (KofScriptGlobals, repl, --watch)",
      "KofCcompiler — C subset → ELF x86_64 (kof c, nativo-only)",
      "kof.process — execução de processos externos",
      "process.spawn — stdin/stdout vivos (F10, 3 targets, PROC001 fechado)",
      "kof fmt — formatador via parser real (KofFormatter, idempotente)",
      "sobrecarga de construtores",
      "widening de return",
      "LSP com hover/completion + diagnostics reais + references + rename",
      "Native GC — free-list kof_free_head + kof_gc_collect (mark-sweep real, 0.2.8-beta)",
      "Ponto flutuante real no Native — FP em XMM (FLT001 fechado)",
      "Pattern matching — switch com tipos e destructuring (case String s, case Point(x,y)) nos 3 targets (0.2.0-beta)",
      "Null safety básica — String? com ?-check em compile-time (0.2.0-beta)",
      "Higher-order em coleções — List map/filter/reduce nos 3 targets (0.2.0-beta)",
      "Módulos multi-arquivo — import a.b.C com fix para projetos grandes (a/b/C.kf) (0.2.0-beta)",
      "switch-expressão (SYN001) — case ... -> produzindo valor nos 3 targets (0.2.8-beta)",
      "readLine → String? (null no EOF)",
      "String.lastIndexOf",
      "File.readRange(offset, len)",
      "application {} lifecycle (onStart/onShutdown)",
      "W3C spans com timing (spanStart/spanEnd) nos 3 targets",
      "kof.log no JS (LOG001 fechado)",
      "time no Native (TIME001 fechado, time.interval/cancel)",
      "observability histogram/metrics no Native (OBS002, asm puro)",
      "package manager MVP — kof deps (kofdeps, Maven Central, --deps)",
      "MySQL prepared statements binário (COM_STMT_EXECUTE)",
      "riscv64/aarch64 codegen real — 13/13 E2E qemu (NATIVE002)",
      "validation + observability em asm puro no Native",
      "releases multiplataforma",
    ],
  },
  {
    status: "in-development",
    title: "Em desenvolvimento",
    items: [
      "Standard Library (contratos em estabilização)",
      "Async (assincronismo como parte do runtime)",
      "Concurrency — concorrência 0.2.x residual: timeout, cancelamento, select, canais tipados, scheduler/cron (G8)",
      "KofAndroid — Fase 1: kof build --target android gera projeto Maven com host em Kof",
      "Debugger — além do MVP JVM (DAP sobre stdio já no JVM; DWARF variáveis/expressões + VS Code ext)",
      "KofJS — plataforma web no browser (ES Modules via GraalJS)",
      "LSP além de hover/completion (references, rename, diagnostics reais)",
    ],
  },
  {
    status: "planned",
    title: "Planejado",
    items: [
      "KofScript — runtime completo de execução direta (hoje só top-level let)",
      "package manager (kof init, kofdeps, registry)",
      "complete language specification",
      "conformance suite",
      "query DSL tipada para o ORM (User.query { where age > 18 })",
      "full web platform (frontend declarativo + routing/forms/SSR)",
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
        lead="A regra de evolução é simples: major releases > major fixes > bugfixes. A primeira release estável, a 0.1.0, já foi lançada — o desenvolvimento segue em 0.2.x (0.2.8-beta, 04/09) e o PATCH continua subindo bastante."
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
