import { createFileRoute, Link } from "@tanstack/react-router";
import editorShot from "@/assets/kof-editor.png";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { GithubStats } from "@/components/kof/GithubStats";
import {
  Ascii,
  Card,
  CURSO,
  EDITOR,
  FeatureList,
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

const heroCode = `record User(String name, String email)

main() {
    var user = User("Mel", "mel@example.com")
    println(user.name())
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
    desc: "Binários nativos sem exigir que o programador gerencie memória manualmente. GC free-list + mark-sweep real (kof_gc_collect); runtime por alcançabilidade — hello em 32.5KB; auto-collect em progresso.",
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
    status: "available",
    desc: "Targets nativos RISC-V e ARM64 via toolchains cruzados (riscv64-linux-gnu-as/ld, qemu). Codegen real em asm puro — stdlib (JSON, HTTP, spawn/await, String methods — 19/19 qemu, NATIVE002; gates DB001/SECN000/SCHED001 no cross).",
    pipeline: `Kof
  ↓
 Kof IR
  ↓
 Backend nativo (riscv64/aarch64)
  ↓
 ELF estático (sem libc)`,
  },
  {
    name: "KofScript",
    status: "available",
    desc: "Target de execução direta: Kof puro no MESMO frontend, executado pelo interpretador da IR (KofInterpreter) sem compilar e sem fork de JVM. Não é JavaScript — let/const/async/fn não existem.",
    pipeline: `Kof (.ks)
  ↓
 Kof IR (MESMO frontend)
  ↓
 KofInterpreter (sem bytecode)`,
  },
  {
    name: "Web — KofJS",
    status: "in-development",
    desc: "O mesmo frontend e a mesma Kof IR geram ES Modules (ECMAScript 2022+) executados na engine JS embarcada (GraalJS). Concorrência real via async/await (CONC003), kof.http com fetch async real (spawn + await), servidor web embutido (HttpServer GraalJS + KofJsWebQueue), Long como BigInt.",
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
  { name: "matemática (kof.math)", status: "available" },
  { name: "identificadores (kof.uuid)", status: "available" },
  { name: "mídia (kof.media)", status: "available" },
  { name: "supervisão OTP (kof.supervisor)", status: "available" },
];

function ArchDiagram() {
  const rows: { backend: string; artifact: string; world: string; status: Status }[] = [
    { backend: "Backend JVM", artifact: ".class", world: "JVM", status: "available" },
    { backend: "Backend nativo (x86_64)", artifact: "ELF", world: "OS/CPU", status: "available" },
    {
      backend: "Backend nativo (riscv64/aarch64)",
      artifact: "ELF estático",
      world: "OS/CPU (sem libc)",
      status: "available",
    },
    {
      backend: "KofScript",
      artifact: "KofInterpreter (IR)",
      world: "Execução direta (sem compilar)",
      status: "available",
    },
    {
      backend: "KofJS",
      artifact: "ES Modules",
      world: "JS engine / Browser",
      status: "available",
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
              <span className="text-signal">v0.4.1-beta</span>
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
       ├── Autenticação     ✅ disponível (app.security + OAuth2)
       ├── Mensageria       ✅ disponível
       ├── Supervisão OTP   ✅ disponível (JVM+Script+Native x86)
       ├── Async            🚧 em construção
       └── Concorrência     ✅ disponível (spawn/await nos 4 targets)`}</Ascii>
            <CodeBlock
              language="shell"
              filename="terminal"
              showLineNumbers={false}
              code={`$ kof serve app.kf
$ kof serve app.kf --port 8080`}
            />
            <p className="text-sm text-muted-foreground">
              O objetivo de longo prazo — frontend, backend, banco, autenticação, mensageria e async
              com pouquíssimos arquivos de negócio — segue em evolução. O que já existe: HTTP, JSON,
              banco, mensageria, segurança web (app.security + OAuth2 resource server), supervisão
              OTP e o servidor embutido — agora também no KofJS via GraalJS HttpServer.
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
        lead="Compilador, CLI, LSP, testes, debugger, benchmarks, formatador, empacotador e editor acompanham a linguagem. O gerenciador de pacotes já é MVP (kof deps); o registry completo ainda é futuro."
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
          <div className="grid content-start gap-4 sm:grid-cols-2">
            <Card title="Compilador" status="available" />
            <Card title="CLI" status="available" />
            <Card title="LSP" status="available">
              Diagnostics reais do frontend, hover, completion, references e rename.
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
              Parser real (KofFormatter), idempotente. <span className="font-mono">kof fmt -w</span>{" "}
              reescreve no lugar.
            </Card>
            <Card title="Gerenciador de pacotes (MVP)" status="available">
              <span className="font-mono">kof deps</span> — MVP com kofdeps, Maven Central,{" "}
              <span className="font-mono">--deps</span>.
            </Card>
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

        <Link
          to="/kof-editor"
          className="mt-6 inline-block rounded-md border border-signal/40 bg-surface px-5 py-4 font-mono text-xs uppercase tracking-widest text-signal transition-colors hover:bg-surface-2"
        >
          Conhecer o Kof Editor e Theme Maker →
        </Link>
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
          <Link
            to="/learn"
            className="group flex flex-col rounded-md border border-signal/50 bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="text-base font-semibold tracking-tight group-hover:text-signal">
              Curso gratuito completo →
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              Do zero ao avançado: algoritmos, estruturas de dados, banco, segurança, web e mais —
              tudo em Kof, de graça, pesquisável aqui no site.
            </p>
            <span className="mt-4 font-mono text-[11px] uppercase tracking-widest text-signal">
              koflang.github.io/learn
            </span>
          </Link>
          <Card title="learn/ → humanos aprendendo Kof">
            Trilha em capítulos numerados no repositório: primeiros programas, tipos, classes,
            coleções, UI e mais.
            <Link
              to="/docs"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Navegar em /docs →
            </Link>
          </Card>
          <Card title="training/ → ferramentas e LLMs aprendendo Kof">
            Corpus estruturado com idiomas, padrões, anti-patterns e exemplos compiláveis.
            <Link
              to="/docs"
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Navegar em /docs →
            </Link>
          </Card>
        </div>
      </Section>

      {/* ── Roadmap ──────────────────────────────────────────────────────── */}
      <Section
        index="16"
        eyebrow="Roadmap"
        title="Sem datas falsas. Apenas estado."
        lead="O roadmap mostra o que existe, o que está sendo construído e para onde vamos — alimentado pelo estado real do repositório. Versionamento MAJOR.MINOR.PATCH; a 0.1.0 saiu 25/08, a 0.2.0-beta 27/08, a 0.4.0-beta 14/09, desenvolvimento segue em 0.4.1-beta (15/09)."
      >
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Card title="Concluído (0.4.1-beta)" status="available">
            <FeatureList
              items={[
                "Base do compilador: lexer, parser, AST, sistema de tipos, análise semântica e Kof IR",
                "Backends JVM, Native (x86_64 free-list GC + mark-sweep) e KofJS",
                "Classes, records, herança, interfaces, generics e lambdas com capturas",
                "Exceções reais e coleções com Map/Set nos três targets",
                "enum com == por conteúdo e switch exaustivo (SEM031); switch-expressão (SYN001) nos 3 targets",
                "kof build / run / serve / test / debug / bench / profile / inspect / fmt",
                "kof.web: status/headerSet, WebSocket RFC 6455, SSE nativo, accept loop HTTP/1.1",
                "kof.db + kof.orm com Query DSL tipada e transaction commit/rollback real",
                "kof.mq (pub/sub nos 3 targets) e cliente HTTP (JVM + JS + Native)",
                "kof.security v1 + web security (rate limit, sessões, API keys) nos três targets",
                "TLS via web.listenSecure na JVM",
                "kof.validation e kof.observability (histogram/metrics no Native) nos três targets",
                "kof.ui e pattern matching (case String s, Point(x,y), instanceof)",
                "null safety String?/Int? e List map/filter/reduce",
                "imports multi-arquivo, KofScript (repl, watch) e KofCcompiler",
                "targets native.risc / native.arm com codegen real e stdlib (19/19 qemu)",
                "process.run / process.spawn (stdin/stdout vivos nos 3 targets)",
                "kof fmt com parser real, idempotente; sobrecarga de construtores e widening de return",
                "kof.config com interpolação de ${key} nos 3 targets; lifecycle application",
                "W3C spans, kof.log no JS (LOG001) e time no Native (TIME001)",
                "package manager MVP (kof deps) e MySQL prepared statements binário",
                "concorrência real no JS (CONC003) e ponto flutuante no Native (FLT001)",
                "LSP references + rename e releases multiplataforma single-job",
                "kof.strings / encoding / random / validation / time / net / math / uuid (v4 + v7)",
                "arrays multidimensionais e kof.media (Image/Audio/Mic/Video + serveDir com Range)",
                "kof.supervisor (OTP core: JVM + Script + Native x86)",
                "web server no KofJS (HttpServer GraalJS + fetch async)",
                "app.security() + OAuth2 resource server (JVM)",
                "overloading top-level e de método (4 backends); Long como BigInt no JS",
                "GC mark-sweep no Native + runtime pruning (hello x86 32.5KB)",
                "kof new + kof build --fat (1777+ testes)",
              ]}
            />
          </Card>
          <Card title="Em desenvolvimento" status="in-development">
            <FeatureList
              items={[
                "GC auto-collect (safe-points + mapa de raízes por frame)",
                "package manager além do MVP (registry)",
                "LSP + diagnostics reais (hover/completion, references/rename)",
                "debugger além do MVP JVM (DWARF Native, source maps JS)",
                "KofJS plataforma web no browser",
                "web no Native/JS residual (TLS/ws/sse — WEB002 / WEB001)",
                "riscv/aarch com gates honestos (SECN000 / SCHED001)",
              ]}
            />
          </Card>
          <Card title="Planejado" status="planned">
            <FeatureList
              items={[
                "KofScript — REPL e watch já via KofInterpreter; runtime dedicado é o próprio interpreter",
                "Language Reference já em docs/language-reference/ (evoluindo)",
                "conformance suite — embrião E2E",
                "full web platform e auto-hospedagem",
              ]}
            />
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
