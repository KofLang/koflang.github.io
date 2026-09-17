import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
          "Playground Kof 0.4.0-beta no browser: interpretador Kof real com mesma semântica do backend KofJS oficial — records, enums, classes, switch patterns, null-safety, coleções, spawn/await e stdlib 0.4.x. 100% estático no GitHub Pages.",
      },
      { property: "og:title", content: "Playground — Kof" },
      {
        property: "og:description",
        content:
          "Kof 0.4.0-beta no browser — mesma semântica do KofJS oficial para records, enums, switch patterns, null-safety, coleções e stdlib 0.4.x. Gaps reportam o mesmo código que kof check.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://koflang.github.io/playground" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/playground" }],
  }),
  component: PlaygroundPage,
});

const defaultCode = playgroundExamples[0]?.code ?? "";

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
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const [shareUrl, setShareUrl] = useState("");
  const executionStart = useRef<number | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const lineNumbers = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => code.split("\n").map((_, index) => index + 1), [code]);
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

  useEffect(() => {
    const sharedCode = new URLSearchParams(window.location.search).get("code");
    if (sharedCode !== null) setCode(sharedCode);
  }, []);

  useEffect(() => {
    if (editor.current && lineNumbers.current) {
      lineNumbers.current.scrollTop = editor.current.scrollTop;
    }
  }, [code]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      if (executionStart.current !== null) {
        setElapsed(performance.now() - executionStart.current);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running]);

  const loadCode = (value: string) => {
    if (executionStart.current !== null) return;
    setCode(value);
    setOutput("");
    setError(undefined);
    setElapsed(null);
    setShareState("idle");
    setShareUrl("");
  };

  const run = async () => {
    if (executionStart.current !== null) return;
    const start = performance.now();
    executionStart.current = start;
    setRunning(true);
    setElapsed(0);
    setOutput("");
    setError(undefined);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => window.setTimeout(resolve, 0));
      });
      const result = await runKof(code);
      setOutput(result.output);
      setError(result.error);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setElapsed(performance.now() - start);
      executionStart.current = null;
      setRunning(false);
    }
  };

  const share = async () => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set("code", code);
    url.search = params.toString();
    setShareUrl(url.href);
    setShareState("copying");
    try {
      await navigator.clipboard.writeText(url.href);
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  };

  return (
    <main>
      {/* Hero */}
      <section className="rule-x grid-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <p className="mono-label text-signal">
            playground · interpretador Kof real · KofJS no browser
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Playground Kof</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Interpretador Kof real no navegador — mesma linguagem e mesma semântica do backend JS
            oficial (<code>kof-runtime.mjs</code>): <code>Int</code> com wrap <code>|0</code>,{" "}
            <code>Long</code> como <code>BigInt</code>, <code>Double</code> no formato JDK,{" "}
            <code>Char</code> imprimindo o caráter, records com <code>==</code> de conteúdo, enums,{" "}
            classes com herança e <code>this</code>, <code>switch</code> com patterns e{" "}
            <code>switch-expr</code>, null-safety, coleções com <code>map/filter/reduce</code>,
            lambdas, <code>try/catch/finally</code>, <code>spawn/await</code> com{" "}
            <code>poll/done</code>, arrays multidim e stdlib 0.4.x completa (9 namespaces). Abaixo, os
            11 módulos de{" "}
            <a
              href="https://github.com/KofLang/kof-ui-widgets"
              target="_blank"
              rel="noreferrer"
              className="text-signal hover:underline"
            >
              kof-ui-widgets
            </a>{" "}
            com código ao lado do preview.
          </p>
          <p className="mt-3 max-w-2xl font-mono text-xs text-muted-foreground">
            Única limitação é a arquitetura do GitHub Pages: 100% estático, sem servidor/host para{" "}
            <code>kof.db</code>/<code>kof.io</code>/<code>kof.web</code> — esses gaps reportam o mesmo
            código que <code>kof check</code> (<code>DB001</code>/<code>WEB001</code>) e nunca
            silenciam (R6). Execução é manual; revise código compartilhado antes de executar.
          </p>
        </div>
      </section>

      {/* Playground console — dois quadrados */}
      <Section
        index="01"
        eyebrow="Console"
        title="Dois quadrados: código → saída"
        lead="Edite os exemplos da fachada do interpretador e execute manualmente para ver a saída."
      >
          <p id="playground-instructions" className="mb-4 text-sm text-muted-foreground">
          Kof real no browser — <code>Int/Long/Double/Float/Char</code>,{" "}
          <code>records/enums/classes</code>, <code>if-expr/switch</code> com patterns,{" "}
          <code>for-in/while</code>, <code>try/catch/finally</code> (<code>throw String</code>),{" "}
          <code>spawn/await</code> e 9 namespaces da stdlib 0.4.x. Única limitação: Pages é estático.
          Executar ou Ctrl+Enter; links compartilhados só carregam o código.
        </p>
        <div role="status" className="mb-4 text-sm text-muted-foreground">
          {shareState === "copied" &&
            "Link copiado. O código está incluído na URL; não compartilhe segredos."}
          {shareState === "error" && (
            <label className="block">
              Não foi possível copiar o link. Selecione e copie manualmente:
              <input
                aria-label="Link para compartilhar o código"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 w-full rounded-sm border border-border bg-surface p-2 font-mono text-xs"
              />
            </label>
          )}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Entrada */}
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">entrada — editor.kf</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={run}
                  disabled={running}
                  aria-keyshortcuts="Control+Enter"
                  className="rounded-sm bg-signal px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
                >
                  {running ? "Executando…" : "Executar"}
                </button>
                <button
                  onClick={() => loadCode(defaultCode)}
                  disabled={running}
                  className="rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-signal-dim disabled:opacity-50"
                >
                  Restaurar
                </button>
                <button
                  onClick={share}
                  disabled={shareState === "copying"}
                  className="rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:border-signal-dim disabled:opacity-50"
                >
                  {shareState === "copying" ? "Copiando…" : "Compartilhar"}
                </button>
              </div>
            </div>
            <div className="flex h-[360px] sm:h-[420px]">
              <div
                ref={lineNumbers}
                aria-hidden="true"
                className="h-full shrink-0 select-none overflow-hidden border-r border-border px-3 py-4 text-right font-mono text-[13px] leading-6 text-code-com"
              >
                {lines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                <div className="h-4" />
              </div>
              <textarea
                ref={editor}
                value={code}
                onChange={(e) => loadCode(e.target.value)}
                onScroll={(e) => {
                  if (lineNumbers.current)
                    lineNumbers.current.scrollTop = e.currentTarget.scrollTop;
                }}
                onKeyDown={(e) => {
                  if (e.ctrlKey && e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (!e.repeat) void run();
                  }
                }}
                readOnly={running}
                aria-label="Código do playground"
                aria-describedby="playground-instructions"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                wrap="off"
                className="h-full min-w-0 flex-1 resize-none overflow-auto bg-surface p-4 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-signal"
                placeholder={'main() {\n    println("Olá")\n}'}
              />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-border bg-surface-2/40 p-2">
              {playgroundExamples.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => loadCode(ex.code)}
                  disabled={running}
                  className="rounded-sm border border-border bg-surface px-2.5 py-1 font-mono text-xs hover:border-signal-dim hover:text-signal disabled:opacity-50"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saída */}
          <div className="flex flex-col overflow-hidden rounded-md border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">saída — interpretador local</span>
              <span role="status" className="font-mono text-xs text-muted-foreground">
                {running
                  ? "Executando…"
                  : error
                    ? "Erro"
                    : elapsed !== null
                      ? "Concluído"
                      : "Aguardando"}
              </span>
              {elapsed !== null && (
                <span className="font-mono text-xs text-muted-foreground">
                  {(elapsed / 1000).toFixed(2)} s
                </span>
              )}
            </div>
            <pre
              aria-busy={running}
              aria-live="polite"
              className="h-[360px] overflow-auto bg-[#21222c] p-4 font-mono text-sm leading-6 text-[#50fa7b] sm:h-[420px]"
            >
              {output}
              {!output && !error && (
                <span className="text-[#6272a4]">
                  {running
                    ? "Execução em andamento…"
                    : elapsed !== null
                      ? "Execução concluída sem saída."
                      : "Clique em Executar ou pressione Ctrl+Enter."}
                </span>
              )}
              {error && (
                <span className="text-[#ff5555]">
                  {output ? "\n" : ""}
                  {error}
                </span>
              )}
            </pre>
            <div className="border-t border-border bg-surface-2/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              Kof real (KofJS) · mesma semântica do oficial · sem servidor (limitação do Pages)
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
              Mesma linguagem, sem servidor
            </span>
            <p className="mt-2">
              É o mesmo Kof: <code>Int</code> com wrap <code>|0</code>, <code>Long</code> como{" "}
              <code>BigInt</code>, <code>Double.toString</code> do JDK, <code>Char</code> imprimindo
              o caráter, <code>kofEq</code>/<code>kofStr</code> de conteúdo. A única diferença é a
              arquitetura do Pages (100% estático): <code>kof.db</code>/<code>kof.io</code>/
              <code>kof.web</code> precisam de host e reportam <code>DB001</code>/
              <code>WEB001</code> — igual ao <code>kof check</code> local.
            </p>
          </div>
        </div>
      </Section>

      {/* Galeria 11 módulos */}
      <Section
        index="02"
        eyebrow="kof-ui-widgets · 11 módulos"
        title="Cada intenção com nome, código ao lado do que renderiza"
        lead="Trechos de kof-ui-widgets acompanhados de demonstrações visuais em React. Código exibido é o oficial do repo; preview é ilustrativo."
      >
        <div className="flex flex-wrap gap-2">
          {widgetModules.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs ${activeModule === m.id ? "bg-signal text-primary-foreground border-signal" : "bg-surface border-border text-muted-foreground hover:border-signal-dim hover:text-foreground"}`}
            >
              {m.id} · {m.title.split("—")[0]?.trim()}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="h-[360px] sm:h-[420px]">
              <CodeBlock
                code={activeMod.code}
                filename={activeMod.file}
                className="h-full max-h-none sm:max-h-none lg:max-h-none"
              />
            </div>
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
          <div className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-md border border-border bg-surface sm:h-[420px]">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">preview — {activeMod.id}</span>
              <span className="mono-label text-signal">demonstração React</span>
            </div>
            <div className="flex-1 overflow-auto overscroll-contain bg-[#282a36] p-0">
              <div className="min-h-full min-w-0">
                <ModPreview />
              </div>
            </div>
            <div className="shrink-0 border-t border-border bg-surface-2/40 px-3 py-2 font-mono text-xs text-muted-foreground">
              Preview ilustrativo em React, independente do editor e sem execução Kof.
            </div>
          </div>
        </div>
      </Section>

      {/* Exemplos completos */}
      <Section
        index="03"
        eyebrow="Exemplos completos"
        title="De hello a dashboard — o mesmo app, vários mundos"
        lead="Exemplos de kof-ui-widgets com previews ilustrativos em React. A galeria não executa esses programas Kof; consulte o repositório para execução local."
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
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="h-[360px] sm:h-[420px]">
              <CodeBlock
                code={activeEx.code}
                filename={activeEx.file}
                className="h-full max-h-none sm:max-h-none lg:max-h-none"
              />
            </div>
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
          <div className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-md border border-border bg-surface sm:h-[420px]">
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2/60 px-3 py-2">
              <span className="mono-label">preview — {activeEx.id}</span>
              <span className="mono-label text-signal">demonstração React</span>
            </div>
            <div className="flex-1 overflow-auto overscroll-contain bg-[#282a36] p-0 text-[#f8f8f2]">
              <div className="min-h-full min-w-0">
                <ExPreview />
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
        title="Kof real — limitação só do Pages"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-ok/30 bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold text-ok">Roda com paridade</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Mesma semântica do KofJS oficial (records, enums, switch patterns, coleções)</li>
              <li>Stdlib 0.4.x completa: math/strings/encoding/time/uuid/validation/net/random</li>
              <li>Erros com código + linha iguais ao `kof check` (R6, nunca silencia)</li>
            </ul>
          </div>
          <div className="rounded-md border border-wip/30 bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold text-wip">Só não roda no Pages</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>100% estático — sem host para `kof.db`/`kof.io`/`kof.web` → `DB001`/`WEB001`</li>
              <li>Previews da galeria são React ilustrativo (código exibido é o oficial)</li>
              <li>`fetch` do interpretador roda na thread do browser (pode congelar)</li>
            </ul>
          </div>
          <div className="rounded-md border border-border bg-surface p-5">
            <h3 className="font-mono text-sm font-semibold">Local = completo</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              No seu host, <code>kof check app.kf</code> e <code>kof run --target jvm|js|native</code>{" "}
              liberam DB/io/web/server com a mesma linguagem — o Pages só não tem servidor.
            </p>
          </div>
        </div>
      </Section>
    </main>
  );
}
