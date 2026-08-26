import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Section } from "@/components/kof/primitives";
import { playgroundExamples, runKof } from "@/lib/kof-interpreter";
import { widgetModules, widgetExamples } from "@/data/kof-ui-widgets";
import {
  ChartsPreview,
  ChoicesPreview,
  CorePreview,
  DataPreview,
  DatetimePreview,
  FormsPreview,
  IoPreview,
  LayoutPreview,
  NavigationPreview,
  OverlaysPreview,
  TypographyPreview,
  DashboardPreview,
  HelloPreview,
  PerfilPreview,
  TarefasPreview,
} from "@/components/playground/WidgetPreview";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Playground — Kof" },
      {
        name: "description",
        content:
          "Playground Kof no navegador: rode Kof (KofJS) com dois painéis e veja a galeria kof-ui-widgets — 11 módulos de intenção com código ao lado do preview.",
      },
      { property: "og:title", content: "Playground — Kof" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/playground" },
    ],
    links: [{ rel: "canonical", href: "/playground" }],
  }),
  component: PlaygroundPage,
});

const defaultCode = `main() {
    println("Olá, Kof no browser!")
    var nome = "Mel"
    println("oi, " + nome)

    // loop
    for (var i = 1; i <= 5; i = i+1) {
        println(i + "² = " + (i*i))
    }

    // função pura do kof-ui-widgets
    println(progressBar(6, 10))
}

progressBar(Int v, Int max): String {
    var filled = v * 20 / max
    var out = ""
    var i = 0
    while (i < 20) {
        if (i < filled) out = out + "█"
        else out = out + "░"
        i = i + 1
    }
    return out + " " + v + "/" + max
}
`;

const modulePreviewMap: Record<string, React.ComponentType> = {
  "00-core": CorePreview,
  "01-typography": TypographyPreview,
  "02-layout": LayoutPreview,
  "03-forms": FormsPreview,
  "04-choices": ChoicesPreview,
  "05-navigation": NavigationPreview,
  "06-overlays": OverlaysPreview,
  "07-data": DataPreview,
  "08-datetime": DatetimePreview,
  "09-charts": ChartsPreview,
  "10-io": IoPreview,
};

const examplePreviewMap: Record<string, React.ComponentType> = {
  hello: HelloPreview,
  perfil: PerfilPreview,
  tarefas: TarefasPreview,
  dashboard: DashboardPreview,
  files: IoPreview,
};

function PlaygroundPage() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [activeModule, setActiveModule] = useState("00-core");
  const [activeExample, setActiveExample] = useState("hello");

  const activeMod = useMemo(
    () => widgetModules.find((m) => m.id === activeModule)!,
    [activeModule],
  );
  const activeEx = useMemo(
    () => widgetExamples.find((e) => e.id === activeExample)!,
    [activeExample],
  );
  const ModPreview = modulePreviewMap[activeModule] ?? CorePreview;
  const ExPreview = examplePreviewMap[activeExample] ?? HelloPreview;

  const run = () => {
    const r = runKof(code);
    setOutput(r.output);
    setError(r.error);
  };

  return (
    <main>
      {/* Hero */}
      <section className="rule-x grid-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="mono-label text-signal">
            playground · KofJS no browser · 100% estático (GitHub Pages)
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Playground Kof</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Escreva Kof à esquerda, veja a saída à direita — execução via{" "}
            <span className="font-mono text-foreground">KofJS</span> (
            <span className="font-mono">kof-runtime.mjs</span> browser-safe, sem servidor). Abaixo,
            os 11 módulos de{" "}
            <a
              href="https://github.com/KofLang/kof-ui-widgets"
              target="_blank"
              rel="noreferrer"
              className="text-signal hover:underline"
            >
              kof-ui-widgets
            </a>{" "}
            com código ao lado do preview real (mesma estética Dracula do runtime).
          </p>
          <p className="mt-3 max-w-2xl font-mono text-xs text-muted-foreground">
            Kof é compilado (JVM/Native/KofJS). No playground estático o compilador oficial não está
            no bundle; a execução é subset JS fiel ao KofJS para <code>println</code>, coleções,{" "}
            <code>kof.ui</code> e 11 intenções. Gaps reportam <code>DB001/CONC001</code> igual ao{" "}
            <code>kof check</code>.
          </p>
        </div>
      </section>

      {/* Playground console — dois quadrados */}
      <Section
        index="01"
        eyebrow="Console"
        title="Dois quadrados: código → saída"
        lead="Copie, edite e clique em Executar. O runtime é o mesmo do KofJS (console.log → painel)."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Entrada */}
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">entrada — editor.kf</span>
              <div className="flex gap-2">
                <button
                  onClick={run}
                  className="rounded-sm bg-signal px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-primary-foreground hover:opacity-90"
                >
                  ▶ Executar
                </button>
                <button
                  onClick={() => {
                    setCode(defaultCode);
                    setOutput("");
                    setError(undefined);
                  }}
                  className="rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-signal-dim"
                >
                  Limpar
                </button>
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-[360px] w-full resize-none bg-surface p-4 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground sm:h-[420px]"
                placeholder={'main() {\n    println("Olá")\n}'}
              />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border bg-surface-2/40 p-2">
              {playgroundExamples.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => setCode(ex.code)}
                  className="rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-xs hover:border-signal-dim hover:text-signal"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saída */}
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">saída — KofJS (browser)</span>
              <span className="font-mono text-xs text-muted-foreground">
                {error ? "✕ erro" : output ? "● executado" : "—"}
              </span>
            </div>
            <pre className="h-[360px] overflow-auto bg-[#21222c] p-4 font-mono text-sm leading-6 text-[#50fa7b] sm:h-[420px]">
              {output || <span className="text-[#6272a4]">/* clique em Executar */</span>}
              {error && (
                <span className="text-[#ff5555]">
                  {"\n"}✕ {error}
                </span>
              )}
            </pre>
            <div className="border-t border-border bg-surface-2/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              <span className="text-[#6272a4]">kof-runtime.mjs</span> browser-safe ·{" "}
              <span className="text-[#6272a4]">kof.io</span> gap no JS · sem servidor
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="terminal"
            language="shell"
            showLineNumbers={false}
            code={`$ kof run app.kf --target js   # local: GraalJS embarcado\n$ kof build app.kf --target js   # gera Default.mjs + kof-runtime.mjs`}
          />
          <div className="rounded-md border border-border bg-surface p-4 text-sm leading-relaxed text-muted-foreground">
            <span className="font-mono text-xs uppercase tracking-widest text-signal">
              Como funciona no Pages
            </span>
            <p className="mt-2">
              Oficial é Java; aqui o <code>println</code> e a lógica pura são interpretados no
              browser com a mesma semântica do backend JS. Para fidelidade 100% com{" "}
              <code>kof check</code>, rode local: <code>bin/kof check app.kf</code>.
            </p>
          </div>
        </div>
      </Section>

      {/* Galeria 11 módulos */}
      <Section
        index="02"
        eyebrow="kof-ui-widgets · 11 módulos"
        title="Cada intenção com nome, código ao lado do que renderiza"
        lead="Copiado direto de github.com/KofLang/kof-ui-widgets/src/*.kf (ordem numérica). Preview usa a mesma estética e helpers puros do runtime — sem CSS, sem DOM ids."
      >
        <div className="flex flex-wrap gap-2">
          {widgetModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs ${activeModule === m.id ? "bg-signal text-primary-foreground border-signal" : "bg-surface border-border text-muted-foreground hover:border-signal-dim hover:text-foreground"}`}
            >
              {m.id} · {m.title.split("—")[0].trim()}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0">
            <CodeBlock code={activeMod.code} filename={activeMod.file} />
            <p className="mt-2 font-mono text-xs text-muted-foreground">{activeMod.desc}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`https://github.com/KofLang/kof-ui-widgets/blob/main/${activeMod.file}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs uppercase tracking-widest text-signal hover:underline"
              >
                Ver no GitHub →
              </a>
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Pages: /playground/kof-ui-widgets/{activeMod.file}
              </span>
            </div>
          </div>
          <div className="flex max-h-[60vh] min-w-0 flex-col overflow-hidden rounded-md border border-border bg-surface sm:max-h-[520px] lg:max-h-[560px]">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">preview — {activeMod.id}</span>
              <span className="mono-label text-signal">kof-runtime.mjs</span>
            </div>
            <div className="flex-1 overflow-auto overscroll-contain bg-[#282a36] p-0">
              <div className="min-h-[280px] min-w-0">
                <ModPreview />
              </div>
            </div>
            <div className="shrink-0 border-t border-border bg-surface-2/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              Mesma intenção → mesmo pixel. Funções puras (ex: sparkline, monthGrid) testáveis sem
              janela.
            </div>
          </div>
        </div>
      </Section>

      {/* Exemplos completos */}
      <Section
        index="03"
        eyebrow="Exemplos completos"
        title="De hello a dashboard — o mesmo app, vários mundos"
        lead="Cada exemplo é cat src/*.kf + examples/*.kf → kof run --target js (scripts/build.sh). No Pages o preview é React fiel; o código é o oficial."
      >
        <div className="flex flex-wrap gap-2">
          {widgetExamples.map((e) => (
            <button
              key={e.id}
              onClick={() => setActiveExample(e.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs ${activeExample === e.id ? "bg-signal text-primary-foreground border-signal" : "bg-surface border-border text-muted-foreground hover:border-signal-dim"}`}
            >
              {e.id} · {e.title}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0">
            <CodeBlock code={activeEx.code} filename={activeEx.file} />
            <p className="mt-2 font-mono text-xs text-muted-foreground">{activeEx.desc}</p>
            <a
              href={`https://github.com/KofLang/kof-ui-widgets/blob/main/${activeEx.file}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
            >
              Ver no GitHub →
            </a>
          </div>
          <div className="flex max-h-[60vh] min-w-0 flex-col overflow-hidden rounded-md border border-border bg-surface sm:max-h-[520px] lg:max-h-[560px]">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">preview — {activeEx.id}</span>
              <span className="mono-label text-signal">App("{activeEx.id}") — Theme.dark()</span>
            </div>
            <div className="flex-1 overflow-auto overscroll-contain bg-[#282a36] p-0 text-[#f8f8f2]">
              <div className="min-h-[340px] min-w-0">
                {(() => {
                  const P = examplePreviewMap[activeEx.id] ?? HelloPreview;
                  return <P />;
                })()}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-md border border-border bg-surface p-4">
          <p className="mono-label">como rodar local com o oficial</p>
          <CodeBlock
            className="mt-3"
            language="shell"
            showLineNumbers={false}
            code={`git clone https://github.com/KofLang/kof-ui-widgets && cd kof-ui-widgets\nkof run "$(scripts/build.sh examples/dashboard.kf)" --target=js   # webview nativo\nkof run "$(scripts/build.sh examples/hello.kf)" --target=jvm       # JVM`}
          />
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="Honestidade"
        title="O que o playground Pages faz e o que não faz"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-ok/30 bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold text-ok">Faz (browser)</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>println, vars, if/while/for, funções</li>
              <li>11 intenções UI com preview fiel</li>
              <li>Funções puras (sparkline, pager, calendar)</li>
            </ul>
          </div>
          <div className="rounded-md border border-wip/30 bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold text-wip">Gap no JS</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>kof.io → DB001 / FilePicker reporta erro no preview</li>
              <li>kof.db / kof.orm → ORM001</li>
              <li>spawn → CONC003 no JS</li>
            </ul>
          </div>
          <div className="rounded-md border border-border bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold">Oficial local</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <code>kof check app.kf</code> e <code>kof run --target js</code> com GraalJS embarcado
              (SEM021, pkg, etc) — Pages é estático por design.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
