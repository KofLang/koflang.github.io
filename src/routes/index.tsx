import { createFileRoute, Link } from "@tanstack/react-router";
import editorShot from "@/assets/kof-editor.png";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { GithubStats } from "@/components/kof/GithubStats";
import {
  Ascii,
  Card,
  CURSO,
  EDITOR,
  GITHUB,
  RELEASES,
  Section,
  StatusBadge,
  THEME_MAKER,
  TRAINING,
  type Status,
} from "@/components/kof/primitives";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const heroCode = `class User(
    String name,
    String email
)

main() {
    var user = User("Mel", "mel@example.com")
    println(user.name)
}`;

const philosophyCards: { title: string; body: string }[] = [
  {
    title: "Menos código",
    body: "Menos cerimônia sem remover capacidade.",
  },
  {
    title: "Tipagem forte",
    body: "Erros importantes devem ser encontrados no compile-time.",
  },
  {
    title: "Humano primeiro",
    body: "A linguagem deve ser fácil de ler e escrever.",
  },
  {
    title: "Um frontend",
    body: "A linguagem não muda entre targets.",
  },
  {
    title: "Compilação direta",
    body: "Kof IR vai diretamente para o backend correspondente.",
  },
  {
    title: "Complexidade pertence à plataforma",
    body: "Se compiler, runtime ou stdlib resolvem, o usuário não reimplementa.",
  },
  {
    title: "Sem mágica desnecessária",
    body: "Abstração boa reduz complexidade real. Abstração ruim só esconde.",
  },
];

const targets: {
  name: string;
  status: Status;
  desc: string;
  pipeline: string;
}[] = [
  {
    name: "JVM",
    status: "available",
    desc: "Integração com o ecossistema Java e execução na JVM. O backend gera bytecode diretamente — Java é plataforma, não linguagem intermediária.",
    pipeline: `Kof
  ↓
 Kof IR
  ↓
 bytecode JVM
  ↓
 JVM`,
  },
  {
    name: "Native (x86_64)",
    status: "available",
    desc: "Binários nativos sem exigir que o programador gerencie memória manualmente. GC free-list + kof_gc_collect implementados; mark-sweep em progresso.",
    pipeline: `Kof
  ↓
 Kof IR
  ↓
 Backend nativo (x86_64)
  ↓
 Executável ELF`,
  },
  {
    name: "Native (RISC-V/ARM64)",
    status: "in-development",
    desc: "Targets nativos RISC-V e ARM64 via toolchains cruzados (riscv64-linux-gnu-as/ld, qemu). Codegen ainda placeholder; target separation feita.",
    pipeline: `Kof
  ↓
 Kof IR
  ↓
 Backend nativo (riscv64/aarch64)
  ↓
 Executável ELF`,
  },
  {
    name: "KofScript",
    status: "available",
    desc: "Execução direta top-level let/const → KofScriptGlobals. REPL interativo (kof repl), watch mode (--watch), execução sem compilação explícita.",
    pipeline: `Kof Script (.ks)
  ↓
 KofScriptGlobals (JIT in-memory)
  ↓
 JVM/Native/JS`,
  },
  {
    name: "Web — KofJS",
    status: "in-development",
    desc: "Alpha: o mesmo frontend e a mesma Kof IR geram ES Modules (ECMAScript 2022+) executados na engine JS embarcada (GraalJS). kof.http funciona via Java HttpClient interop.",
    pipeline: `Kof
  ↓
 KofJS (alpha)
  ↓
 JavaScript (GraalJS)`,
  },
  {
    name: "KofC",
    status: "available",
    desc: "Subset C (int globals, void funcs, if/while, deref &/*) → ELF nativo x86_64 via kof_c. Nativo-only, sem JVM.",
    pipeline: `C subset (.c)
  ↓
 KofC compiler
  ↓
 ELF x86_64`,
  },
];

const stdlibChips: { name: string; status: Status }[] = [
  { name: "coleções", status: "available" },
  { name: "strings", status: "available" },
  { name: "arquivos (kof.io)", status: "available" },
  { name: "JSON", status: "available" },
  { name: "HTTP (kof.web)", status: "available" },
  { name: "banco de dados (kof.db)", status: "available" },
  { name: "logs (kof.log)", status: "available" },
  { name: "configuração (kof.config)", status: "available" },
  { name: "tempo (kof.time)", status: "available" },
  { name: "UI (kof.ui)", status: "available" },
  { name: "segurança (kof.security)", status: "available" },
  { name: "validação (kof.validation)", status: "available" },
  { name: "observabilidade (kof.observability)", status: "available" },
  { name: "concorrência (spawn)", status: "available" },
  { name: "cache (kof.cache)", status: "available" },
  { name: "ORM (kof.orm)", status: "available" },
  { name: "mensageria (kof.mq)", status: "available" },
  { name: "cliente HTTP (http.get)", status: "available" },
  { name: "processos (process.run/spawn)", status: "available" },
];

function ArchDiagram() {
  const rows: { backend: string; artifact: string; world: string; status: Status }[] = [
    { backend: "Backend JVM", artifact: ".class", world: "JVM", status: "available" },
    { backend: "Backend nativo (x86_64)", artifact: "ELF", world: "OS/CPU", status: "available" },
    { backend: "Backend nativo (riscv64/aarch64)", artifact: "ELF", world: "OS/CPU", status: "in-development" },
    { backend: "KofScript", artifact: "Runtime", world: "Interativo (JIT)", status: "available" },
    {
      backend: "KofJS",
      artifact: "ES Modules",
      world: "JS engine / Browser",
      status: "in-development",
    },
    { backend: "KofC", artifact: "ELF", world: "OS/CPU (C subset)", status: "available" },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="grid gap-px bg-border sm:grid-cols-3">
        {[
          { label: "fonte", value: "Código Kof (.kf)" },
          { label: "frontend único", value: "Compilador Kof → AST → tipos → IR" },
          { label: "representação", value: "Kof IR" },
        ].map((s) => (
          <div key={s.label} className="bg-surface px-5 py-6 text-center">
            <p className="mono-label">{s.label}</p>
            <p className="mt-2 font-mono text-sm">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-5 py-3 text-center font-mono text-xs text-muted-foreground">
        ↓ a mesma IR alimenta todos os backends ↓
      </div>
      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((r) => (
          <div
            key={r.backend}
            className="group bg-surface px-5 py-6 transition-colors hover:bg-surface-2"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
                {r.backend}
              </h3>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">↓ {r.artifact}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">↓ {r.world}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="grid-bg relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_75%)]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mono-label flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-signal">v0.2.6-beta</span>
              <span aria-hidden="true">·</span>
              <span>em desenvolvimento ativo</span>
              <span aria-hidden="true">·</span>
              <span>GPLv3</span>
            </p>

            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Kof
              <span className="mt-3 block text-2xl font-semibold leading-snug tracking-tight text-muted-foreground sm:text-3xl">
                Uma linguagem. Um compilador. Vários mundos.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Menos código. Mais intenção. Uma linguagem moderna, estaticamente tipada, que compila
              direto para JVM, binário nativo e web (KofJS, em alpha).
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/download"
                className="rounded-sm border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Baixar Kof
              </Link>
              <Link
                to="/docs"
                className="rounded-sm border border-border bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
              >
                Ler a documentação
              </Link>
              <a
                href={CURSO}
                target="_blank"
                rel="noreferrer noopener"
                className="px-2 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Curso gratuito →
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noreferrer noopener"
                className="px-2 py-2.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
              >
                Ver no GitHub →
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <CodeBlock code={heroCode} filename="user.kf" />
            <CodeBlock
              language="shell"
              filename="terminal"
              showLineNumbers={false}
              className="mt-3"
              code={`$ kof run user.kf
$ kof build user.kf --target native`}
            />
          </div>
        </div>
      </section>

      {/* ── Identidade ───────────────────────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="Identidade"
        title={
          <>
            Kof é uma linguagem geral, fortemente tipada e estaticamente tipada, criada para reduzir
            drasticamente a complexidade necessária para construir software moderno.
          </>
        }
        lead="Compilador próprio: lexer, parser, AST, sistema de tipos, análise semântica, resolução de símbolos, IR própria, múltiplos backends, runtime e biblioteca padrão em evolução."
      >
        <Ascii label="a ideia fundamental">{`Fonte Kof
     ↓
Compilador Kof
     ↓
Kof IR
     ↓
 ┌───┼───────────┬───────────┐
 ↓   ↓           ↓           ↓
JVM Native     Script       Web

A linguagem não muda quando o target muda.`}</Ascii>
      </Section>

      {/* ── Não é transpiler ─────────────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="Posicionamento"
        title="Kof não é um transpiler."
        lead="Não existe uma etapa em que Kof vira Java e depois pede ajuda ao javac. O compilador possui frontend, sistema de tipos, IR e backends próprios — e gera bytecode e código nativo diretamente."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="o que Kof não é">{`Kof → Java → javac → JVM`}</Ascii>
          <Ascii label="o que Kof é">{`Kof
 ↓
Compilador Kof
 ↓
Kof IR
 ↓
Backend
 ↓
Target`}</Ascii>
        </div>
      </Section>

      {/* ── A grande ideia ───────────────────────────────────────────────── */}
      <Section
        index="03"
        eyebrow="A grande ideia"
        title="O problema não é programação. É a quantidade de coisas que precisamos fazer para programar."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="software tradicional">{`HTTP
↓
framework
↓
controllers
↓
services
↓
repositories
↓
ORM
↓
DTOs
↓
serializers
↓
injeção de dependência
↓
configuração
↓
bibliotecas de mensageria
↓
APIs assíncronas
↓
boilerplate`}</Ascii>
          <div className="flex flex-col gap-4">
            <Ascii label="kof">{`intenção
↓
Kof
↓
compilador + runtime + stdlib
↓
software`}</Ascii>
            <blockquote className="rounded-md border-l-2 border-signal bg-surface p-5 text-base leading-relaxed">
              Complexidade deve ser resolvida pela linguagem quando puder ser resolvida pela
              linguagem.
              <footer className="mt-3 text-sm text-muted-foreground">
                Não queremos esconder complexidade atrás de abstrações infinitas. Queremos eliminar
                complexidade desnecessária.
              </footer>
            </blockquote>
          </div>
        </div>
      </Section>

      {/* ── Filosofia ────────────────────────────────────────────────────── */}
      <Section index="04" eyebrow="Princípios" title="A filosofia Kof">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {philosophyCards.map((c) => (
            <Card key={c.title} title={c.title}>
              {c.body}
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Humano primeiro ──────────────────────────────────────────────── */}
      <Section
        index="05"
        eyebrow="Humano primeiro"
        title="Boilerplate não é uma feature."
        lead="Kof é projetada primeiro para seres humanos. A sintaxe deve representar intenção: se o compilador entende sem vinte linhas de cerimônia, vinte linhas de cerimônia não deveriam existir."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mono-label mb-3">Cerimônia tradicional</p>
            <CodeBlock
              language="text"
              filename="User.java"
              showLineNumbers={false}
              code={`public final class User {

    private final String name;
    private final String email;

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public String name() {
        return name;
    }

    public String email() {
        return email;
    }
}`}
            />
          </div>
          <div>
            <p className="mono-label mb-3">Intenção</p>
            <CodeBlock
              filename="User.kf"
              code={`class User(
    String name,
    String email
)`}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Menos código não significa menos capacidade.
            </p>
          </div>
        </div>
      </Section>

      {/* ── LLMs ─────────────────────────────────────────────────────────── */}
      <Section
        index="06"
        eyebrow="LLMs"
        title="Feita para humanos. Naturalmente amigável às máquinas."
        lead="Kof não é uma “AI language”. A filosofia continua humana primeiro. Mas sintaxe pequena, semântica explícita, baixo boilerplate, APIs padronizadas e documentação estruturada têm uma consequência importante: a linguagem também fica muito mais fácil de compreender por ferramentas automatizadas e modelos de linguagem."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="/training no repositório">{`training/
├── language/
├── reference/
├── patterns/
├── anti-patterns/
├── migration/
└── examples/`}</Ascii>
          <div className="flex flex-col gap-4">
            <Card title="Corpus oficial para ferramentas">
              Padrões idiomáticos documentados, anti-patterns documentados e exemplos executáveis —
              para que ferramentas não “adivinhem” como a linguagem funciona.
            </Card>
            <Card title="Menos tokens para expressar a mesma intenção.">
              Sem prometer benchmarks de tokens ou superioridade de LLM sem dados reais. A mensagem
              é estrutural, não marketing.
            </Card>
            <a
              href={TRAINING}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
            >
              Abrir /training no GitHub →
            </a>
          </div>
        </div>
      </Section>

      {/* ── Targets ──────────────────────────────────────────────────────── */}
      <Section
        id="targets"
        index="07"
        eyebrow="Targets"
        title="Uma linguagem. Vários mundos."
        lead="O mesmo frontend alimenta todos os backends. Targets em desenvolvimento estão explicitamente marcados como tal."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {targets.map((t) => (
            <Card key={t.name} title={t.name} status={t.status}>
              <Ascii className="mt-1">{t.pipeline}</Ascii>
              <p className="mt-4">{t.desc}</p>
            </Card>
          ))}
        </div>
        <Link
          to="/targets"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
        >
          Detalhes de cada target →
        </Link>
      </Section>

      {/* ── Memória ──────────────────────────────────────────────────────── */}
      <Section
        index="08"
        eyebrow="Memória"
        title="Você escreve código. O runtime cuida da memória."
        lead="O código Kof não muda porque o target mudou. Nada de malloc, free, ponteiros ou lifetimes manuais. A JVM usa o GC da JVM; Native terá gerenciamento próprio. A abstração de memória pertence à plataforma, não ao usuário."
      >
        <CodeBlock
          filename="memoria.kf"
          code={`class User(
    String name
)

main() {
    var user = User("Mel")
    println(user.name)
}`}
        />
      </Section>

      {/* ── Zero cerimônia ───────────────────────────────────────────────── */}
      <Section
        index="09"
        eyebrow="Zero cerimônia"
        title="E se construir software não exigisse um ecossistema inteiro de cerimônia?"
        lead="HTTP, JSON, banco, concorrência, async, mensageria, rede, testes, serialização, coleções, filesystem, tempo e segurança devem caminhar para dentro da biblioteca padrão e do runtime da Kof. Com etiquetas honestas do que já existe."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {stdlibChips.map((chip) => (
            <div
              key={chip.name}
              className="flex flex-col gap-2 rounded-md border border-border bg-surface px-4 py-3"
            >
              <span className="truncate font-mono text-xs sm:text-sm">{chip.name}</span>
              <StatusBadge status={chip.status} />
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Disponível indica capacidade já utilizável em ao menos um target (hoje, principalmente
          JVM). Gaps por target são diagnosticados em compile-time com códigos como CONC001 — nunca
          silenciosamente.
        </p>
        <Link
          to="/standard-library"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
        >
          Ver a biblioteca padrão →
        </Link>
      </Section>

      {/* ── Interlúdio ───────────────────────────────────────────────────── */}
      <section className="rule-x">
        <div className="mx-auto max-w-4xl px-5 pt-20 text-center sm:px-8">
          <p className="mono-label">o motivo de tudo isso</p>
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Quero que programar seja <span className="text-signal">divertido</span> de novo.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Em algum lugar entre o problema e a solução, a diversão se perdeu, trocada por
            configuração, camadas e cerimônia. A Kof existe para devolver isso: o prazer de escrever
            uma ideia e vê-la rodar de verdade.
          </p>
        </div>
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:px-8 lg:grid-cols-2">
          <Card title="Porque cerimônia cansa.">
            Ninguém brinca antes do primeiro DTO. Quando vinte linhas de ritual existem só para
            agradar um framework, escrever código deixa de ser leve. Menos código, mesma capacidade
            — é assim que a diversão volta.
          </Card>
          <Card title="Porque intenção flui.">
            Você diz o que quer — <span className="font-mono">spawn tarefa()</span>,{" "}
            <span className="font-mono">web.app()</span>,{" "}
            <span className="font-mono">Window("Contador")</span> — e a plataforma decide o como,
            por target e por convenção. Menos tradução, mais criação.
          </Card>
          <Card title="Porque confiança liberta.">
            Erro claro em compile-time e gaps nomeados (CONC001, SEM031) — nunca surpresa silenciosa
            em produção. Quem confia na rede embaixo experimenta mais, arrisca mais alto e se
            diverte mais.
          </Card>
          <Card title="Porque mágica boa não esconde poder.">
            O mesmo código rodando na JVM, num binário nativo ou no browser é o tipo de mágica que a
            gente gosta: abstração boa reduz complexidade real — não disfarça ela.
          </Card>
        </div>
      </section>

      {/* ── Web ──────────────────────────────────────────────────────────── */}
      <Section
        index="10"
        eyebrow="Web"
        title="Construa uma aplicação web sem construir antes um ecossistema de frameworks."
        lead="kof.web já existe na JVM: rotas, middleware, JSON tipado e servidor HTTP embutido no runtime — sem Spring, sem servlet container, sem annotations."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="app.kf"
            code={`record User(String name, Int age)

main() {
    var app = web.app()

    app.get("/hello") {
        return "Hello from Kof"
    }

    app.get("/users/:id") {
        return "user " + param("id")
    }

    app.post("/user") {
        var user = json.decode<User>(body())
        return json.encode(user)
    }

    app.listen(8080)
}`}
          />
          <div className="flex flex-col gap-4">
            <Ascii label="visão da plataforma">{`Aplicação Kof
       │
       ├── HTTP        ✅ disponível
       ├── JSON        ✅ disponível
       ├── Database    ✅ disponível
       ├── Autenticação     🚧 em construção
       ├── Mensageria       ✅ disponível
       ├── Async            🚧 em construção
       └── Concorrência     🚧 em construção`}</Ascii>
            <CodeBlock
              language="shell"
              filename="terminal"
              showLineNumbers={false}
              code={`$ kof serve app.kf
$ kof serve app.kf --port 8080`}
            />
            <p className="text-sm text-muted-foreground">
              O objetivo de longo prazo — frontend, backend, banco, autenticação, mensageria e async
              com pouquíssimos arquivos de negócio — ainda não está entregue. O que existe hoje é o
              compilador, os backends e o começo real da camada web.
            </p>
            <Link
              to="/web"
              className="inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              A visão da plataforma web →
            </Link>
          </div>
        </div>
      </Section>

      {/* ── Spring / Hibernate ───────────────────────────────────────────── */}
      <Section
        index="11"
        eyebrow="Provocação"
        title="Não queremos substituir o Spring por outro Spring."
        lead='Kof não quer criar um "Kof Spring". Nem um "Kof Hibernate". Nem uma camada de abstração em cima de outra camada de abstração. A pergunta é: por que essa complexidade precisa existir em primeiro lugar?'
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="hoje">{`Spring
Hibernate
ORM
DI
AOP
Controllers
Repositories
DTOs
Configuração
...`}</Ascii>
          <Ascii label="kof">{`Kof
Compilador
Runtime
Biblioteca padrão`}</Ascii>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          O objetivo não é remover capacidade. É remover cerimônia.
        </p>
      </Section>

      {/* ── Arquitetura visual ───────────────────────────────────────────── */}
      <Section
        index="12"
        eyebrow="Arquitetura"
        title="Um frontend. Uma IR. Backends dedicados."
        lead="O frontend é único: lexer, parser, tipos, semântica e IR. A partir da IR, cada backend realiza a mesma semântica no seu mundo."
      >
        <ArchDiagram />
      </Section>

      {/* ── Ferramentas ──────────────────────────────────────────────────── */}
      <Section
        index="13"
        eyebrow="Ferramentas"
        title="Uma linguagem deve vir com as suas ferramentas."
        lead="Compilador, CLI, LSP, testes, debugger, benchmarks e editor acompanham a linguagem. Formatador e gerenciador de pacotes são futuro declarado — não realidade presente."
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
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <Card title="Compilador" status="available" />
            <Card title="CLI" status="available" />
            <Card title="LSP" status="in-development">
              Diagnostics reais do frontend; hover e completion são o próximo passo.
            </Card>
            <Card title="Testes (kof test)" status="available" />
            <Card title="Debugger (kof debug)" status="in-development">
              MVP DAP sobre stdio no target JVM.
            </Card>
            <Card title="Benchmarks (kof bench)" status="available">
              Harness com baselines e gate de regressão no CI.
            </Card>
            <Card title="Profile (kof profile)" status="available" />
            <Card title="Inspect IR (kof inspect)" status="available" />
            <Card title="Formatador (kof fmt)" status="available">
              Parser real (KofFormatter), idempotente. <span className="font-mono">kof fmt -w</span> reescreve no lugar.
            </Card>
            <Card title="Gerenciador de pacotes" status="planned" />
          </div>
        </div>

        <figure className="mt-8 overflow-hidden rounded-md border border-border bg-surface">
          <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-surface-2/60 px-3 py-2">
            <span className="mono-label">Kof-Editor — o editor oficial da linguagem</span>
            <span className="mono-label text-signal">kof.kf no dia a dia</span>
          </figcaption>
          <img
            src={editorShot}
            alt="Captura de tela do Kof-Editor com um arquivo .kf aberto, mostrando árvore de arquivos, abas, realce de sintaxe e minimapa"
            className="w-full"
            loading="lazy"
          />
        </figure>

        <a
          href={EDITOR}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 inline-block rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
        >
          Conhecer o editor oficial da linguagem (Kof-Editor) →
        </a>
        <a
          href={THEME_MAKER}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 ml-4 inline-block rounded-md border border-border bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
        >
          Theme Maker para o editor →
        </a>
      </Section>

      {/* ── Distribuição ─────────────────────────────────────────────────── */}
      <Section
        index="14"
        eyebrow="Distribuição"
        title="Instale o Kof. Só isso."
        lead="Uma distribuição autocontida: compilador, CLI, runtime, biblioteca padrão, ferramentas, suporte a editores e OpenJDK embutido. Sem instalar Java separadamente."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/download"
            className="rounded-sm border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ir para o Download
          </Link>
          <a
            href={RELEASES}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-sm border border-border bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
          >
            Ver releases no GitHub →
          </a>
        </div>
      </Section>

      {/* ── Aprendizado ──────────────────────────────────────────────────── */}
      <Section index="15" eyebrow="Aprendizado" title="Duas trilhas na doc. E um curso completo.">
        <div className="grid gap-4 lg:grid-cols-3">
          <a
            href={CURSO}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex flex-col rounded-md border border-signal/50 bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="text-base font-semibold tracking-tight group-hover:text-signal">
              Curso gratuito completo →
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              Do zero ao avançado: algoritmos, estruturas de dados, banco, segurança, web e mais —
              tudo em Kof, de graça.
            </p>
            <span className="mt-4 font-mono text-[11px] uppercase tracking-widest text-signal">
              github.com/lunalully/curso-completo-de-kof
            </span>
          </a>
          <Card title="learn/ → humanos aprendendo Kof">
            Trilha em capítulos numerados no repositório: primeiros programas, tipos, classes,
            coleções, UI e mais.
            <Link
              to="/learn"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Começar a aprender →
            </Link>
          </Card>
          <Card title="training/ → ferramentas e LLMs aprendendo Kof">
            Corpus estruturado com idiomas, padrões, anti-patterns e exemplos compiláveis.
            <a
              href={TRAINING}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Abrir /training →
            </a>
          </Card>
        </div>
      </Section>

      {/* ── Roadmap ──────────────────────────────────────────────────────── */}
      <Section
        index="16"
        eyebrow="Roadmap"
        title="Sem datas falsas. Apenas estado."
        lead="O roadmap mostra o que existe, o que está sendo construído e para onde vamos — alimentado pelo estado real do repositório. Versionamento MAJOR.MINOR.PATCH; a 0.1.0 saiu 25/08, a 0.2.0-beta 27/08, desenvolvimento segue em 0.2.6-beta (30/08)."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Concluído (0.2.6-beta)" status="available">
            Base do compilador, lexer, parser, AST, sistema de tipos, análise semântica, Kof IR,
            backends JVM e Native (x86_64 free-list GC + kof_gc_collect) e KofJS (alpha), classes,
            records, herança, interfaces, generics, lambdas com capturas, exceções reais, coleções
            com Map/Set nos três targets, enum com == por conteúdo e switch exaustivo (SEM031),
            kof build/run/serve/test/debug/bench/profile/inspect/fmt, kof.web (status/headerSet,
            WebSocket RFC 6455, SSE nativo), kof.db + kof.orm, kof.mq, cliente HTTP (JVM+JS),
            kof.security v1 + web security (rate limit, sessões, API keys) nos três targets, TLS via
            web.listenSecure na JVM, kof.validation e kof.observability nos três targets, kof.ui,
            pattern matching (case String s, Point(x,y), instanceof), null safety String?/Int?,
            List map/filter/reduce, imports multi-arquivo, KofScript (repl, watch), KofCcompiler,
            targets native.risc/native.arm (placeholder), process.run/process.spawn (stdin/stdout
            vivos), kof fmt (parser real, idempotente), sobrecarga de construtores, widening de return,
            kof.config interpolação {"${key}"} nos 3 targets, releases multiplataforma single-job.
          </Card>
          <Card title="Em desenvolvimento" status="in-development">
            Async/await nativo, concorrência além da JVM (spawn no Native CONC001), process.spawn
            no Native (PROC001), MySQL/MariaDB via wire protocol (handshake SHA-1 27/08), ponto
            flutuante SSE no Native, native.risc/arm (toolchain estável), LSP além de diagnostics
            (hover/completion), debugger além do MVP JVM (DWARF Native, source maps JS), a plataforma
            web no browser, KofAndroid Fase 1.
          </Card>
          <Card title="Planejado" status="planned">
            KofScript runtime dedicado, gerenciador de pacotes, registry, especificação completa da
            linguagem, conformance suite, auto-hospedagem do compilador, plataforma web completa.
          </Card>
        </div>
        <Link
          to="/roadmap"
          className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
        >
          Roadmap completo →
        </Link>
      </Section>

      {/* ── Personalidade ────────────────────────────────────────────────── */}
      <section className="rule-x">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <p className="mono-label">origem</p>
          <blockquote className="mt-6 text-balance text-xl font-medium leading-relaxed sm:text-2xl">
            Algumas pessoas criam uma biblioteca. Outras criam um framework. A gente olhou para o
            ecossistema inteiro e pensou:
            <span className="mt-4 block text-signal">
              “Tá tudo complicado demais. Vou criar uma linguagem.”
            </span>
          </blockquote>
        </div>
      </section>

      {/* ── Código aberto ────────────────────────────────────────────────── */}
      <Section
        index="17"
        eyebrow="Código aberto"
        title="Compilador open source. Seu software é seu."
        lead="O código-fonte da Kof é GPLv3. Programas escritos em Kof não são automaticamente GPLv3: você mantém o direito de escolher a licença do seu software, respeitando as licenças das dependências que efetivamente incorporar."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Ver o código-fonte
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">github.com/KofLang/Kof4j</p>
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
          <Link
            to="/about"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Sobre / Licença
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">GPLv3 e o que isso significa</p>
          </Link>
        </div>
      </Section>

      {/* ── Métricas ─────────────────────────────────────────────────────── */}
      <Section index="18" eyebrow="Métricas" title="Números reais, ou nenhum número.">
        <GithubStats />
      </Section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="rule-x grid-bg relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,transparent_0%,var(--background)_80%)]"
        />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Estamos construindo uma linguagem de verdade.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Mostramos o que existe, o que está sendo construído e para onde estamos indo. Se você
            quer compilar, rodar e acompanhar de perto:
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/download"
              className="rounded-sm border border-signal bg-signal px-6 py-3 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Baixar Kof
            </Link>
            <a
              href={CURSO}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-sm border border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
            >
              Fazer o curso gratuito
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-sm border border-border bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
            >
              Contribuir
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
