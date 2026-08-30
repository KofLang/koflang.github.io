import { createFileRoute } from "@tanstack/react-router";
import { Ascii, Section, StatusBadge, type Status } from "@/components/kof/primitives";

export const Route = createFileRoute("/standard-library")({
  head: () => ({
    meta: [
      { title: "Standard Library — Kof" },
      {
        name: "description",
        content:
          "A stdlib da Kof: coleções com Map/Set, enum, strings, kof.io, JSON, kof.web, kof.db, kof.orm, kof.mq, cliente HTTP, kof.security, kof.validation e kof.observability disponíveis; async e concorrência além da JVM em construção.",
      },
      { property: "og:title", content: "Standard Library — Kof" },
      {
        property: "og:description",
        content:
          "Complexidade que pode ser resolvida pela plataforma não deveria virar dependência.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/standard-library" },
    ],
    links: [{ rel: "canonical", href: "/standard-library" }],
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
  { name: "strings", status: "available", note: "Concat, comparação e API completa." },
  {
    name: "arquivos (kof.io)",
    status: "available",
    note: "File, Path e Directory; texto UTF-8 e erros consistentes. Nos três targets.",
  },
  {
    name: "JSON",
    status: "available",
    note: "Encode/decode tipado; objetos no JVM/JS, arrays tipados incluídos.",
  },
  {
    name: "HTTP (kof.web)",
    status: "available",
    note: "web.app(), rotas com path params, middleware, servidor embutido no runtime e TLS via web.listenSecure(port) na JVM; WEB001/WEB002 no Native/JS. Resposta rica: status(201, body) + headerSet('X', 'y').",
  },
  {
    name: "banco de dados (kof.db)",
    status: "available",
    note: "JDBC com query tipada e transaction {} na JVM; SQLite nativo via .so direto (MySQL WIP). Gap DB001 no KofJS.",
  },
  {
    name: "ORM (kof.orm)",
    status: "available",
    note: "entity, CRUD, where com operadores, saveAll, page, deleteAll e migrate na JVM; validado em MariaDB 11 e PostgreSQL 16, com MongoDB. Gaps ORM001/ORM002 nos demais.",
  },
  {
    name: "logs (kof.log)",
    status: "available",
    note: "Níveis, JSON estruturado e requestId. JVM e Native; LOG001 no KofJS.",
  },
  {
    name: "configuração (kof.config)",
    status: "available",
    note: "Arquivo > env > profile, tipado. JVM e Native (asm próprio); CONF001 no KofJS.",
  },
  { name: "tempo (kof.time)", status: "available", note: "now(), sleep, interval, scheduler every()/at() (JVM/JS). SCHED001 no Native." },
  {
    name: "interface (kof.ui)",
    status: "available",
    note: "Window, widgets, bind e layout; renderização DOM via KofJS no webview nativo (WebKitGTK) ou browser.",
  },
  {
    name: "segurança (kof.security)",
    status: "available",
    note: "v1 + G9 nos três targets: PBKDF2 (600k), SHA-256/512, HMAC, JWT HS256, secrets, rate limit (security.rateLimit), sessões e API keys — constant-time, secure by default; no Native, asm x86-64 sem libc.",
  },
  {
    name: "validação (kof.validation)",
    status: "available",
    note: "13 predicados (required, notBlank, isEmail, isUrl, inRange, min/max...) nos três targets; violação vira diagnóstico VAL001.",
  },
  {
    name: "observabilidade (kof.observability)",
    status: "available",
    note: "health/readiness/liveness, contadores e gauges (counter/gauge/increment) e requestId/correlationId nos três targets.",
  },
  {
    name: "concorrência (spawn)",
    status: "available",
    note: "Virtual threads na JVM com join implícito; val r = spawn f() / await r com handle tipado. poll/done/cancel/selectAny (0.2.0+). Native reporta CONC001; spawn no JS reporta CONC003.",
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
    note: "Pub/sub em memória com filas limitadas (subscribe, publish, queue, push, pop). JVM; MQ001 nos demais.",
  },
  {
    name: "cliente HTTP",
    status: "available",
    note: "http.get, http.post, http.put, http.delete, http.status, http.timeout na JVM e no JS via Java HttpClient interop (27/08); HTTP002 apenas no Native.",
  },
  {
    name: "cache (kof.cache)",
    status: "available",
    note: "get/set/ttl/delete/clear — ConcurrentHashMap (JVM), Map (JS). Disponível nos três targets.",
  },
  {
    name: "processos (kof.process)",
    status: "available",
    note: "Execução de processos externos (kof.process + kof_process_run).",
  },
  { name: "rede (além do HTTP)", status: "planned", note: "Camada de rede além do cliente HTTP." },
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
