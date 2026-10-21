import { createFileRoute } from "@tanstack/react-router";
import { Ascii, Section, StatusBadge, type Status } from "@/components/kof/primitives";

export const Route = createFileRoute("/standard-library")({
  head: () => ({
    meta: [
      { title: "Standard Library — Kof" },
      {
        name: "description",
        content:
          "A stdlib da Kof: coleções com Map/Set, enum, strings, kof.io, JSON, kof.web, kof.db, kof.orm, kof.mq, cliente HTTP, kof.security, kof.validation, kof.observability, kof.supervisor, KofPy/KofR, FFI e Buffer disponíveis; migração COBOL (kof legacy/KofBOL) e libs oficiais (ZIP/GZIP/TAR + GzipWriter, sha256File); gaps por target nomeados em compile-time.",
      },
      { property: "og:title", content: "Standard Library — Kof" },
      {
        property: "og:description",
        content:
          "Complexidade que pode ser resolvida pela plataforma não deveria virar dependência.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/standard-library" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/standard-library" }],
  }),
  component: StdlibPage,
});

const capabilities: { name: string; status: Status; note: string }[] = [
  {
    name: "coleções",
    status: "available",
    note: "List<T>, listOf, Map<K,V> e Set<T> nos três targets — no Native, asm próprio; COL001 fechado.",
  },
  {
    name: "enum",
    status: "available",
    note: "values(), valueOf() e name() com == por conteúdo nos três targets; switch exaustivo verificado em compile-time (SEM031).",
  },
  {
    name: "strings (kof.strings)",
    status: "available",
    note: "API completa + kof.strings: escapeJson/unescapeHtml, word converters (toCamel/Pascal/Snake/Kebab), isAlpha/isNumeric, pad/repeat/capitalize, STRN001/word-converters portados p/ riscv64/aarch64 (5 alvos).",
  },
  {
    name: "arquivos (kof.io)",
    status: "available",
    note: "File, Path e Directory; texto UTF-8 e erros consistentes. Nos três targets.",
  },
  {
    name: "JSON",
    status: "available",
    note: "Encode/decode tipado; objetos no JVM/JS, arrays tipados incluídos. NATIVE002-stdlib: JSON encode/decode completo no riscv64/aarch64.",
  },
  {
    name: "HTTP (kof.web)",
    status: "available",
    note: "web.app(), rotas com path params, middleware, servidor embutido no runtime e TLS via web.listenSecure(port) na JVM; app.security() (rate-limit→CORS→headers→session→CSRF→auth→RBAC) e OAuth2 resource server na JVM. WEB002 no Native (server HTTP/1.1 base ✅; TLS/ws/sse/path params pendentes). KofJS: servidor GraalJS HttpServer + KofJsWebQueue ✅ (03/09); residual ws/sse/TLS = WEB001. Resposta rica: status(201, body) + headerSet('X', 'y'). WebSocket RFC 6455 (app.ws) + SSE nativo (app.sse) na JVM.",
  },
  {
    name: "banco de dados (kof.db)",
    status: "available",
    note: "JDBC com query tipada e transaction {} commit/rollback real na JVM e delegate JDBC no KofJS; SQLite nativo em todos os targets (cross riscv64/aarch64 fechado 15/09); MySQL/MariaDB via wire protocol (prepared statements binários) no Native x86-64 (cross recusa DB001, R7); DB001 também para schemes sem wire (postgres nativo, oracle, mongo no JS/Native).",
  },
  {
    name: "ORM (kof.orm)",
    status: "available",
    note: "entity, CRUD, where com operadores, saveAll, page, deleteAll e migrate na JVM e no Native (SQLite nos dois arquitecturas Native; MySQL via wire só x86-64); Query DSL tipada (ORM001); as 13 faces ORM medidas contra MariaDB 12.3.2; MongoDB real só na JVM. Entity-history (0.6.2+): orm.createHistory<User>(db) grava revisões INSERT/UPDATE/DELETE com snapshot JSON e expõe history/at/changes com actor/correlation_id — JVM/Android + Fase 5 completa na 0.6.5: create/save/delete + consulta (inclusive paginada) no Native x86-64 em asm puro; JS/cross reportam ORM001 em compile-time; entidade sem flag = recusa HIST002. ORM001 no JS.",
  },
  {
    name: "logs (kof.log)",
    status: "available",
    note: "Níveis, JSON estruturado e requestId. JVM, Native e KofJS (LOG001 fechado).",
  },
  {
    name: "configuração (kof.config)",
    status: "available",
    note: "Arquivo > env > profile, tipado. Interpolação ${key} nos 3 targets. Bloco ui-config + funções de config (0.4.0). JVM, Native (asm próprio) e KofJS — CONF001 fechado 16/09.",
  },
  {
    name: "tempo (kof.time)",
    status: "available",
    note: "now(), sleep, interval, every()/at() + isLeapYear/daysInMonth/dayOfWeek/daysBetween/addDays/diffDays (TIME002) / todayIso/formatDateIso/parseDateIso/hoursBetween/tzOffsetSeconds (TIME003 honesto) nos 5 alvos (TIME001 fechado no Native). formatInstantIso(Long millis) — instante UTC completo (0.6.5, #857; JS/Native diagnosticam TIME005).",
  },
  {
    name: "matemática (kof.math)",
    status: "available",
    note: "Double completo nos 5 alvos (MATH001 fechado): sqrt/pow/lerp/percentage/isInteger/isDecimal/roundTo + parse{Int,Long,Double}OrDefault; NaN IEEE em todos os alvos. pi()/e()/tau() com fold para literal double — fecha COMP001 no link Nativo (0.6.0); golden math-pow-constants 216/216.",
  },
  {
    name: "interface (kof.ui)",
    status: "available",
    note: "Window, widgets, bind e layout; renderização DOM via KofJS no webview nativo (WebKitGTK) ou browser. Accessibility 0.6.0: superfície intent-based + defaults automáticos por widget (#789).",
  },
  {
    name: "segurança (kof.security)",
    status: "available",
    note: "v1 + G9 nos três targets: PBKDF2 (600k), SHA-256/512, HMAC, AES-GCM, ChaCha20 (RFC 8439, JVM+JS — SECN002 honesto no Native), JWT HS256, secrets, rate limit (security.rateLimit), sessões, API keys e cookies secure (C11) — constant-time, secure by default; no Native, asm x86-64 sem libc.",
  },
  {
    name: "validação (kof.validation)",
    status: "available",
    note: "30+ predicados: required/notBlank/isEmail/isUrl/inRange/min/max + isCpf/isCnpj/isCep/isPis/isNis, isIpv4/isIpv6/isMac/isPort, isDomain, Luhn (isCreditCard), formatCpf/formatCep/formatCnpj (pontuação BR) — 4-5 alvos; violação VAL001.",
  },
  {
    name: "observabilidade (kof.observability)",
    status: "available",
    note: "health/readiness/liveness, contadores e gauges (counter/gauge/increment) e requestId/correlationId nos três targets.",
  },
  {
    name: "concorrência (spawn)",
    status: "available",
    note: "Virtual threads na JVM com join implícito; val r = spawn f() / await r com handle tipado. poll/done/cancel/selectAny (0.2.0+). Concórrencia real no JS via async/await (CONC003 fechado). Native via pthread (CONC001 fechado). NATIVE002-stdlib: spawn/await no riscv64/aarch64 (clone + futex).",
  },
  { name: "async", status: "in-development", note: "Assincronismo como parte do runtime." },
  {
    name: "testes",
    status: "available",
    note: 'Blocos test "nome" { } + assert; kof test reporta PASS/FAIL por teste (jvm, native e js).',
  },
  {
    name: "mensageria (kof.mq)",
    status: "available",
    note: "Pub/sub em memória com filas limitadas (subscribe, publish, queue, push, pop). Nos 3 targets (MQ001 fechado).",
  },
  {
    name: "cliente HTTP",
    status: "available",
    note: "http.get, http.post, http.put, http.delete, http.status, http.timeout nos 3 targets. No Native: HTTP/1.1 asm com timeout/retry/circuit reais (§259, 17/09); https e DNS por nome são gaps honestos (recusam/throw, nunca silenciam).",
  },
  {
    name: "cache (kof.cache)",
    status: "available",
    note: "get/set/ttl/delete/clear — ConcurrentHashMap (JVM), Map (JS). Disponível nos três targets.",
  },
  {
    name: "formatador (kof fmt)",
    status: "available",
    note: "Parser real (KofFormatter), idempotente. kof fmt <file|dir> [-w] reescreve no lugar.",
  },
  {
    name: "processos (kof.process)",
    status: "available",
    note: "process.run (bloqueia) e process.spawn (stdout vivo: readLine/exitCode/alive/kill; stdin /dev/null — write é no-op honesto, §355) — JVM, Native x86+cross e JS. process.exit(code) nos 3 targets.",
  },
  {
    name: "aleatório (kof.random)",
    status: "available",
    note: "randomInt/randomBoolean nos 5 alvos (S10a, x86_64/riscv64/aarch64/JS/JVM; getrandom ecall 278 no cross).",
  },
  {
    name: "código (kof.encoding)",
    status: "available",
    note: "base64/base64Url/hex/urlEncode/urlDecode (5 alvos; ENC002 fechado, base64 riscv B23).",
  },
  {
    name: "rede (kof.net)",
    status: "available",
    note: "URI parse + fetch; NET001 fechado nos 6 alvos (x86_64/riscv64/aarch64/JS/JVM/Android). Front de sockets (listen/accept/connect/UDP): real na JVM e nos Native x86-64 + cross riscv64/aarch64 (NET002 aposentado, 02/10); recusado em JS na v1 (NETN001 em compile-time, nunca silencioso).",
  },
  {
    name: "identidade (kof.uuid)",
    status: "available",
    note: "uuid.v4 (RFC 4122) + v7 time-ordered (RFC 9562) + isUuid nos 5 alvos; gate cross UUID001 removido (10/09).",
  },
  {
    name: "mídia (kof.media)",
    status: "available",
    note: "Image (PNG/JPEG/GIF/BMP), Audio/Mic (WAV PCM), Video (metadados MP4/MOV + streaming) e app.serveDir com Range requests (206/416) — arquivos, não base64 no fonte (JVM; MEDIA001 no Native/JS).",
  },
  {
    name: "supervisão OTP (kof.supervisor)",
    status: "available",
    note: "host puro-Kof import kof.supervisor: observe-failure, restart individual, restart limit + escalate, stop cooperativo; JVM+Script+todos os Native+JS; OTP001/OTP002 removidos (18-19/09) — supervisor em todos os alvos.",
  },
  {
    name: "arrays multidimensionais",
    status: "available",
    note: "new T[a][b] cria TODAS as dims via KofNewMultiArray (MULTIANEWARRAY JVM, Array.newInstance interp, kofMultiArray JS).",
  },
  {
    name: "interop Python (KofPy)",
    status: "available",
    note: "Engine real over python3 -u -c + RPC linha-JSON com json.decode<T> tipado (stateless replay): callInt/Double/Bool/String/Json + timeout/cancel — JVM, Native x86-64 e cross riscv64/aarch64, JS e Script certificados no CI. ANDROID/MCU/RISCV32: INTEROP005 honesto.",
  },
  {
    name: "interop R (KofR)",
    status: "available",
    note: "Engine real over Rscript --vanilla -e com o MESMO face do KofPy (callInt/Double/Bool/String/Json + timeout/cancel); spec embutida na expressão -e como string literal, jsonlite decodifica no lado R. InteropRE2ETest 10/10 skipped-0 no CI (Rscript 4.x + jsonlite).",
  },
  {
    name: "migração COBOL — kof legacy (KofBOL)",
    status: "available",
    note: "Plataforma de legado (0.6.5): `kof legacy <copybook>` gera contrato Kof a partir de copybook fixo (PIC X/9, OCCURS, 88, REDEFINES); libs/legacy em Kof puro com fixed-width, EBCDIC CP037, COMP-3, adapter com return-codes (banda 0/4/8/12/16 como DADO), transporte, mensageria/batch e transações. Limites nomeados LEG001–LEG019 (nunca drop silencioso); kof compare faz o teste diferencial Java↔Kof.",
  },
  {
    name: "bibliotecas oficiais (libs)",
    status: "available",
    note: "Pacotes importáveis escritos em Kof puro, mesmo padrão da stdlib: libs/archive — leitor ZIP (#852 s1), GZIP/RFC 1952 (#852 s2) + TAR/ustar com nomes longos GNU (#852 s3, `.tar.gz` por composição) e GzipWriter de escrita (#852, 0.6.6); libs/security — sha256File(path) (#853); libs/legacy (KofBOL). Provas E2E no CI por face.",
  },
  {
    name: "FFI (extern)",
    status: "available",
    note: 'extern "<lib>" + library(): ABI escalar direto nos 3 nativos (SysV/LP64/AAPCS64, ≥9-arg spill, String↔char*, void/Bool/Float); JVM+Nativo com structs record by-value, T[]→ptr, String[]→char** e Buffer(U8) INOUT; callbacks (upcalls) bind no JVM, JS host, Native x86-64 E cross via trampoline (M1, 11/10). Restante não-bindável → FFI001/FFI002 na linha da declaração, nunca stub silencioso.',
  },
  {
    name: "buffer (Buffer U8)",
    status: "available",
    note: "buffer.alloc / Buffer.bytes() / println(Buffer) — Buffer[cap] zero-filled, layout header 24/cap 16/payload 24; token FFI B para INOUT copy-in/copy-back nos 3 nativos + JVM (byte-parity via libc memset sob qemu).",
  },
];

function StdlibPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Standard Library"
        title="E se construir software não exigisse um ecossistema inteiro de cerimônia?"
        lead="Kof pretende tornar operações comuns parte da própria plataforma. Nada abaixo é apresentado como pronto sem estar marcado como tal."
      >
        <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2">
          {capabilities.map((c) => (
            <div key={c.name} className="bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-mono text-sm">{c.name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Filosofia"
        title="Complexidade pertence à plataforma."
        lead="Não queremos esconder complexidade atrás de abstrações infinitas. Queremos eliminar complexidade desnecessária."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="hoje">{`language
+
framework
+
ORM
+
HTTP library
+
JSON library
+
DI
+
messaging
+
async framework
+
testing framework
+
configuration framework
+
...`}</Ascii>
          <Ascii label="kof">{`language
+
stdlib
+
runtime`}</Ascii>
        </div>
      </Section>
    </main>
  );
}
