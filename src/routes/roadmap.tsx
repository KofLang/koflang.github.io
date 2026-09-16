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
      { property: "og:url", content: "https://koflang.github.io/roadmap" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/roadmap" }],
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
      "KofScript — Kof puro no MESMO frontend via KofInterpreter (sem bytecode, sem fork; let/const/fn → PARSE085)",
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
      "riscv64/aarch64 codegen real — stdlib (NATIVE002); cross reporta DB001 em compile-time (SQLite cross em desenvolvimento na branch beta)",
      "NATIVE002-stdlib — JSON, HTTP, spawn/await, String methods, kof.random, encoding, net.*, uuid (19/19+ qemu)",
      "validation + observability em asm puro no Native",
      "kof.math — Double completo nos 5 alvos (MATH001 fechado: sqrt/lerp/percentage/isInteger/isDecimal/roundTo/pow/parseOrDefault)",
      "kof.time — todayIso/formatDateIso/addDays/diffDays/isWeekend/tzOffsetSeconds nos 5 alvos (TIME002 fechado)",
      "kof.uuid — v4 + v7 time-ordered (RFC 9562) nos 5 alvos",
      "kof.validation — isNis/isCpf/isCnpj/formatCep com pontuação BR (4-5 alvos)",
      "kof.security — crypto.chacha20 (RFC 8439, JVM+JS), TLS com certificado próprio, cookies secure (C11)",
      "kof.media — Image/Audio/Mic/Video + app.serveDir com Range requests (206/416), JVM",
      "kof.supervisor — OTP core puro-Kof (restart, limits, stop cooperativo): JVM+Script+Native x86 (15/09); OTP001/OTP002 honestos no cross/JS",
      "kof.web no KofJS — servidor real via GraalJS HttpServer + KofJsWebQueue (WEB001 básico fechado 03/09) + fetch async (spawn http + await, §133)",
      "app.security() — middleware composto (rate-limit→CORS→headers→session→CSRF→auth→RBAC) + OAuth2 resource server (JVM)",
      "overloading — top-level (SG-011B) e de método por assinatura nos 4 backends (SEM047/SEM057/SEM061)",
      "null safety ampliada — Map.get→V?, narrowing em while/campo (D-NARROW-WHILE), SEM048/SEM049",
      "pattern matching com guardas (case T v if cond, SG-014)",
      "Long = BigInt no JS (paridade real de 64 bits, decisão 5b)",
      "GC mark-sweep no Native + runtime pruning por alcançabilidade (hello x86 627→37 símbolos, 32.5KB; kof build --print-sizes)",
      "kof new — esqueletos por tipo (mono/backend/frontend/full-stack) + kof build --fat (JVM)",
      "print heterogêneo em if/switch-expression (97d08e54, 0.4.1)",
      "KofAndroid — Fase 1 (projeto Maven + host em Kof) e Fase 2 (--apk standalone + release signing, AND001 fechado)",
      "concorrência completa — awaitTimeout, cancel cooperativo, selectAny, channel<T>, scheduler every/at/cancel nos 3 targets",
      "kof.strings — escapeJson/unescapeHtml, word converters, isAlpha/isNumeric, pad/repeat (5 alvos)",
      "kof.encoding — base64, base64Url, hex, urlEncode/urlDecode (5 alvos; ENC002 fechado)",
      "kof.validation — isCpf/isCnpj/isCep, isIpv4/isIpv6, isDomain, Luhn (4-5 alvos)",
      "kof.time — isLeapYear/daysInMonth/dayOfWeek/daysBetween (4-5 alvos)",
      "kof.random — randomInt/randomBoolean (5 alvos, S10a)",
      "kof.net — URI parse + fetch (NET001 fechado, 6 alvos)",
      "kof.uuid v4 (SECN000 cross-arch)",
      "arrays multidimensionais new T[a][b] (KofNewMultiArray — MULTIANEWARRAY JVM/JS/Interpreter)",
      "releases multiplataforma",
    ],
  },
  {
    status: "in-development",
    title: "Em desenvolvimento",
    items: [
      "Standard Library (contratos em estabilização)",
      "GC auto-collect (safe-points + mapa de raízes por frame)",
      "Package manager além do MVP (registry)",
      "Debugger — além do MVP JVM (DAP sobre stdio já no JVM; JS source maps V3 linha ✅, DWARF Native linha ✅ parcial — variáveis/expressões e breakpoints nativos pendentes + VS Code ext)",
      "KofJS — plataforma web no browser (ES Modules via GraalJS); web server base ✅ (HttpServer + KofJsWebQueue); residual ws/sse/TLS/path params (WEB001)",
      "kof.web no Native — residual WEB002: TLS, path params, keep-alive, ws/sse",
      "kof.db/orm no JS — DB001/ORM001 (WASM planejado)",
      "Decompiler (Java → Kof) — deprioritizado pelo mantenedor; meta atual é estabilizar a release",
    ],
  },
  {
    status: "planned",
    title: "Planejado",
    items: [
      "Language Reference — gramática, tipos e semântica já em docs/language-reference/ (evoluindo)",
      "Conformance suite — embrião nos E2E por target; suite formal futura",
      "Full web platform (frontend declarativo + routing/forms/SSR)",
      "gRPC no kof.web — app.grpc + stubs de .proto, unary + server streaming (JVM primeiro)",
      "OpenTelemetry — export/propagação completa (tracing leve W3C já entregue)",
      "Auto-hospedagem (compilador escrito em Kof)",
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
        lead="A regra de evolução é simples: major releases > major fixes > bugfixes. A primeira release estável, a 0.1.0, já foi lançada — o desenvolvimento segue no ramo 0.4.x (0.4.1-beta, 15/09) e o PATCH continua subindo bastante."
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
