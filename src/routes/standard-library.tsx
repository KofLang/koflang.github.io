import { createFileRoute } from "@tanstack/react-router";
import { Ascii, Section, StatusBadge, type Status } from "@/components/kof/primitives";

export const Route = createFileRoute("/standard-library")({
  head: () => ({
    meta: [
      { title: "Standard Library — Kof" },
      {
        name: "description",
        content:
          "A stdlib da Kof: coleções com Map/Set, enum, strings, kof.io, JSON, kof.web, kof.db, kof.orm, kof.mq, cliente HTTP, kof.security, kof.validation, kof.observability, kof.supervisor, KofPy/KofR, FFI e Buffer disponíveis; migração COBOL (kof legacy/KofBOL) e libs oficiais (ZIP/GZIP/TAR + GzipWriter, sha256File, stats/svg/sentinel/audit/bio/experiments); gaps por target nomeados em compile-time.",
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
    note: "File, Path e Directory; texto UTF-8 e erros consistentes. Nos três targets. Desde a 0.7.0, `File(p).createNew(): Bool` cria atomicamente (O_EXCL) — fecha o race TOCTOU do `ZipReader.extractTo` (#854).",
  },
  {
    name: "JSON",
    status: "available",
    note: 'Encode/decode tipado; objetos no JVM/JS, arrays tipados incluídos. NATIVE002-stdlib: JSON encode/decode completo no riscv64/aarch64. Caveat da 0.7.2: `json.decode` com shape ERRADO devolve valor errado em silêncio (container vazio no JVM/Script, map com chave 0 no JS); o erro de runtime nomeado JSN006 (#1103) está corrigido no main SEM TAG — e o #1128 já estendeu a checagem aos CAMPOS em qualquer profundidade (`Box(List<Item>)` com `{"items": {}}` nomeia o erro em vez de imprimir 0) — chega na próxima release.',
  },
  {
    name: "HTTP (kof.web)",
    status: "available",
    note: "web.app(), rotas com path params, servidor embutido no runtime e TLS via web.listenSecure(port) na JVM — mas na release 0.7.2 o middleware `app.use` responde HTTP 500 com qualquer middleware (lambda de retorno nulável não implementava a interface funcional — §935/#1080; a correção está no main SEM TAG, com o PR #1092 de contribuidor externo + bridge `kof_web_use`, e chega na 0.7.3). Desde a 0.7.1, TLS DE PRODUÇÃO na JVM: SNI multi-host com `web.secureHost(host, certPem, keyPem)` + `app.listenSecure(port, listOf(secureHost(...)))` (SNI desconhecido = HTTP 421 + WEB007, nunca serve o certificado padrão), hot-reload de certificado `app.reloadTls(certPem, keyPem)` com troca atômica (falha = WEB007 catchable, o estado velho segue servindo) e cliente ACME completo (`acme.jwsEs256`/`newAccount`/`newOrder`/`dns01Txt`/`challenge`/`finalize`, DNS-01, emissão REAL provada contra Pebble 1.0.1 no CI) — ACME fora da JVM recusa WEB008. app.security() (rate-limit→CORS→headers→session→CSRF→auth→RBAC) e OAuth2 resource server na JVM. WEB002 no Native (server HTTP/1.1 base ✅; TLS/ws/sse/path params pendentes). KofJS: servidor GraalJS HttpServer + KofJsWebQueue ✅ (03/09); residual ws/sse/TLS = WEB001. Resposta rica: status(201, body) + headerSet('X', 'y'). WebSocket RFC 6455 (app.ws) + SSE nativo (app.sse) na JVM. Chegando na 0.7.3 (main SEM TAG): `remoteAddr()` no contexto de rota — o handler lê o peer TCP (String, `\"\"` quando desconhecido; nota de proxy na doc, #1110), `app.listen(host, port)` liga numa ÚNICA interface — `listen(\"127.0.0.1\", 8080)` para serviços locais, a arity 1 segue wildcard byte-idêntica (#1114) — e os headers de hardening (CSP/X-Content-Type-Options/X-Frame-Options/Referrer-Policy) viraram OPT-IN (#1112): um `web.app()` puro não manda nenhum (antes eles até sobrescreviam headers das rotas); `app.security()` os liga por padrão.",
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
    note: "O núcleo Double é paridade total nos alvos — sqrt/pow/abs/min/max/lerp/percentage/isInteger/isDecimal/roundTo + parse{Int,Long,Double}OrDefault + NaN IEEE (probe 04/11 contra o jar 0.7.1: byte-idêntico 4/4). Na JVM/JS/Script, a família completa: trig + `floor`/`ceil`. No NATIVE (x86-64 e cross) há recusa HONESTA, nunca valor silencioso: a trig family recusa MATH001 desde §621 (07/10) e o arredondamento `floor`/`ceil` + os escalares dabs/dmin/dmax/dclamp/dsign também (linha MATH-D da matriz, medida 04/11 — aguarda o asm SSE/SSE4.1 da lane nativa). WASI tem floor/ceil IEEE e o trig/pow fdlibm byte-idênticos (0.6.8/0.6.10). pi()/e()/tau() com fold para literal double em todos (fecha COMP001 no link Nativo, 0.6.0); golden math-pow-constants 216/216.",
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
    note: "30+ predicados: required/notBlank/isEmail/isUrl/inRange/min/max + isCpf/isCnpj/isCep/isPis/isNis, isIpv4/isIpv6/isMac/isPort, isDomain, Luhn (isCreditCard), formatCpf/formatCep/formatCnpj (pontuação BR) — 4-5 alvos; violação VAL001. `matches` no nativo é substring literal, não regex do JVM (valor errado em silêncio — #979 aberto, 31/10).",
  },
  {
    name: "observabilidade (kof.observability)",
    status: "available",
    note: "health/readiness/liveness, contadores e gauges (counter/gauge/increment) e requestId/correlationId nos três targets.",
  },
  {
    name: "concorrência (spawn)",
    status: "available",
    note: "Virtual threads na JVM com join implícito; val r = spawn f() / await r com handle tipado. poll/done/cancel/selectAny (0.2.0+). Concórrencia real no JS via async/await (CONC003 fechado). Native via pthread (CONC001 fechado). NATIVE002-stdlib: spawn/await no riscv64/aarch64 (clone + futex). Desde a 0.7.2, `await`/`spawn` sem operando são recusa PARSE041 nomeando a keyword — antes o compilador roubava a expressão da linha seguinte com caras diferentes por alvo (#1002).",
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
    note: "http.get, http.post, http.put, http.delete, http.status, http.timeout nos 3 targets. Desde a 0.7.1, https ESTRITO é o default na JVM — verificação de cadeia + hostname sempre; trust-all só via opt-in explícito `http.insecure()` (avisa TLS-TRUST-ALL), e o opt-in recusa HTTP002 no JS/Native por desenho (sem trust-all nessas pontas). No Native: HTTP/1.1 asm com timeout/retry/circuit reais (§259, 17/09); https e DNS por nome são gaps honestos (recusam/throw, nunca silenciam). Em desenvolvimento (no main, SEM tag): `http.send(method, url, body, headers)` devolvendo o builtin `kof.http.Response` — status/header/headers/body sem throw em 4xx/5xx — já fechado nos TRÊS alvos JVM+Script+JS (#1126; a face Script roda no runtime gerado byte-idêntico, a JS na família http da casa). Chega na 0.7.3.",
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
    note: "Pacotes importáveis escritos em Kof puro, mesmo padrão da stdlib: libs/archive — leitor ZIP (#852 s1), GZIP/RFC 1952 (#852 s2) + TAR/ustar com nomes longos GNU (#852 s3, `.tar.gz` por composição) e GzipWriter de escrita (#852, 0.6.6); desde a 0.6.10, `ZipReader`/`ZipEntryStream` leem ZIP de forma INCREMENTAL sobre DEFLATE retomável (`open(entry, maxBytes)` → `readChunk()` — 12 MB listados com ≤ 70 KB lidos sob `-Xmx40m`); o `extractTo` não tem mais race TOCTOU desde a 0.7.0 (`File.createNew`, #854); lacunas honestas NA RELEASE 0.7.2: no JS qualquer `import archive.Zip` fura a compilação (IOJS001, #995) e o compressor DEFLATE puro falta (#993 — o `GzipWriter` só escreve STORED); os dois root fixes JÁ LANDARAM no main SEM TAG (#995: JS ganha `isSymlink` real + o fold `if/throw/else` para de engolir o epílogo; #993: DEFLATE com LZ77 e `GzipWriter`/`ZipWriter` escrevendo método 8 — certificados pela suite carimbada 7836/0F) e chegam na 0.7.3. libs/security — sha256File(path) (#853); libs/legacy (KofBOL). A onda 0.7.1 somou seis libs universais em Kof puro (E2E 2/2 JVM+Script cada, recusando em código nomeado em vez de zero silencioso): `stats` (descritiva: mean/median/min/max/pvariance/stddev/percentile — STATS001/002; distribuições de probabilidade travam em R3/FFI), `svg` (documento/retângulo/linha/texto com escaping XML + barChart determinístico de geometria INT — SVG001; o render-engine fica do lado FFI), `sentinel` (detecção de ameaças: anel de eventos com poda por janela, burst por (source, kind), alerta JSON — defensivo por contrato), `audit` (corrente à prova de adulteração sobre `crypto.sha256` auditada — `verifyChain()` quebra LOUD em remoção/reordenação/edição/splice), `bio` (leitores FASTA/FASTQ/VCF com BIO001–003 + pipeline QC stats→filter→report; BAM é binário e fica bloqueado) e `experiments` (runs/métricas/parâmetros sobre `kof.db` + export JSON-Lines). A 0.7.2 levou o 7.3: `bio/Workflow.kf` monta o QC como DAG REAL de `kof.workflow` (estágios com artefatos TSV duráveis; throw no corpo = job `failed` e dependentes `skipped`). O plano fechou no main SEM TAG (05/11, promoção autorizada pela mantenedora): `audit/Observability.kf` (snapshot Prometheus → AuditEntries encadeadas, OBS001), `sentinel/LogPump.kf` (ingestão do log redirecionado do stderr, `log:<nível>`, LOGP001/002 — JSON não parseado) e a wiring `sentinel/Http.kf` (`sentinelHttp` — o sentinela como middleware observador de requests, registra e nunca bloqueia), 2/2 JVM+Script cada. A sequência reabriu as faces de FFI no main também SEM TAG: `libs/linalg` com a família BLAS LEVEL-1 COMPLETA double+single sobre OpenBLAS (copy-in, 2/2 JVM+native x86-64) e `libs/net/Pcap.kf` no truth test de link da libpcap (`char*↔String` real); o contrato de portabilidade §8 registra o soname cru como Linux-only. Nada disso está na release baixável hoje. Provas E2E no CI por face (JVM+Script).",
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
