import { createFileRoute } from "@tanstack/react-router";
import editorShot from "@/assets/kof-editor-screenshot.png";
import { CodeBlock } from "@/components/kof/CodeBlock";
import {
  Ascii,
  Card,
  CURSO,
  EDITOR,
  GITHUB,
  Section,
  THEME_MAKER,
} from "@/components/kof/primitives";

export const Route = createFileRoute("/kof-editor")({
  head: () => ({
    meta: [
      { title: "Kof Editor — Kof" },
      {
        name: "description",
        content:
          "O Kof Editor: editor de texto escrito inteiramente em Kof. Desktop (JVM/KofJS), terminal, git, temas, paleta de comandos. Plus: Theme Maker para criar temas YAML.",
      },
      { property: "og:title", content: "Kof Editor — Kof" },
      {
        property: "og:description",
        content:
          "Editor de texto escrito em Kof. Desktop, terminal, git, temas. Theme Maker para customização.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/kof-editor" },
    ],
    links: [{ rel: "canonical", href: "/kof-editor" }],
  }),
  component: KofEditorPage,
});

function KofEditorPage() {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <Section
        index="01"
        eyebrow="Kof Editor"
        title="Uma linguagem. Um editor. Vários mundos."
        lead="O Kof Editor é um editor de texto escrito inteiramente em Kof — uma prova de conceito de que a linguagem pode construir ferramentas reais. O lexer do editor é o lexer de Kof."
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <img
              src={editorShot}
              alt="Kof Editor com árvore de arquivos, abas, realce de sintaxe e minimapa"
              className="w-full rounded-md border border-border"
              loading="lazy"
            />
            <p className="mt-3 font-mono text-[11px] text-muted-foreground">
              Kof Editor — abas, explorer, gutter, highlight, minimap, temas claro/escuro
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Card title="Escrito em Kof">
              Todo o editor — lexer, highlight, árvore de arquivos, abas, terminal, git, temas, paleta
              de comandos — é código Kof servido por <span className="font-mono">kof serve</span> e
              exibido em janela nativa (WebKitGTK).
            </Card>
            <Card title="Sem extensões">
              Reconhecimento de linguagem, erros, terminal e git são nativos — as mesmas APIs do
              runtime Kof (<span className="font-mono">process.run</span>).
            </Card>
            <Card title="JVM + KofJS">
              Núcleo revalidado no Kof 0.2.3-beta com saída idêntica na JVM e no KofJS (GraalJS).
            </Card>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${EDITOR}/releases`}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Baixar releases →
              </a>
              <a
                href={EDITOR}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm border border-border bg-surface px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:border-signal-dim hover:text-signal"
              >
                Ver no GitHub →
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Desktop vs Web ────────────────────────────────────────────── */}
      <Section
        index="02"
        eyebrow="Desktop vs Web"
        title="Desktop tem tudo. Web tem o essencial."
        lead="O Kof Editor existe em duas formas: uma versão desktop completa e uma demo estática no GitHub Pages. Para uso real, baixe a versão desktop."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col rounded-md border border-border bg-surface p-5 transition-colors hover:border-border-dim">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">Desktop (recomendado)</h3>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-ok/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Disponível
              </span>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Janela nativa via WebKitGTK</li>
              <li>Terminal integrado (executa comandos reais via shell)</li>
              <li>Git completo: branch, status, diff e commit via process.run</li>
              <li>Paleta de comandos (Ctrl+Shift+P), Quick Open (Ctrl+P)</li>
              <li>Símbolos (Ctrl+Shift+O), snippets, busca por arquivo e texto</li>
              <li>6 paletas de temas: Dracula, Nord, GitHub, Solarized, Monokai, Light</li>
              <li>Temas granulares (schema v2, ~91 chaves, export YAML)</li>
              <li>
                Binários:{" "}
                <span className="font-mono">kof-editor</span> (JVM) +{" "}
                <span className="font-mono">kof-editor --native</span>
              </li>
            </ul>
            <div className="mt-auto pt-4">
              <a
                href={`${EDITOR}/releases`}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm border border-signal bg-signal px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Baixar para desktop →
              </a>
            </div>
          </div>
          <div className="flex flex-col rounded-md border border-border bg-surface p-5 transition-colors hover:border-border-dim">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold tracking-tight">Demo web (GitHub Pages)</h3>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-ok/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Disponível
              </span>
            </div>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>Interface do editor completa no browser</li>
              <li>Highlight de sintaxe e visualização de temas</li>
              <li>Paleta de comandos, Quick Open, temas</li>
              <li>Source Control (visual), Run/Check</li>
              <li>Terminal e Output ( UI apenas )</li>
            </ul>
            <div className="mt-auto pt-4">
              <a
                href="https://koflang.github.io/Kof-Editor/"
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm border border-signal bg-signal px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
              >
                Abrir demo no browser →
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ──────────────────────────────────────────────────── */}
      <Section index="03" eyebrow="Features" title="O que o editor faz">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Abas e explorer em árvore",
            "Gutter, highlight e linha ativa",
            "Minimap",
            "Temas claro/escuro (6 paletas)",
            "Export YAML de temas",
            "Terminal integrado (shell do host)",
            "Git: branch, status, diff, commit",
            "Paleta de comandos (Ctrl+Shift+P)",
            "Quick Open (Ctrl+P)",
            "Símbolos (Ctrl+Shift+O)",
            "Snippets",
            "Busca por arquivo e por texto",
            "Problemas | Saída | Terminal | Git",
            "Diagnósticos do compilador Kof",
            "Roundtrip YAML com Theme Maker",
          ].map((f) => (
            <div
              key={f}
              className="rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm"
            >
              {f}
            </div>
          ))}
        </div>
      </Section>

      {/* ── CLI ───────────────────────────────────────────────────────── */}
      <Section index="04" eyebrow="CLI" title="Como rodar">
        <CodeBlock
          language="shell"
          filename="terminal"
          showLineNumbers={false}
          code={`$ kof-editor                    # abre a janela
$ kof-editor caminho.kf         # abre com um arquivo
$ kof-editor --stop             # para servidor e janela`}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Requisitos: Kof instalado (<span className="font-mono">kof install</span>) e JDK 21+
          embutido na distribuição.
        </p>
      </Section>

      {/* ── Theme Maker ──────────────────────────────────────────────── */}
      <Section
        index="05"
        eyebrow="Theme Maker"
        title="Crie seus temas na web."
        lead="O Kof Theme Maker é uma ferramenta web para criar, visualizar e exportar temas YAML compatíveis com o Kof Editor. Roundtrip testado nas duas direções."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Card title="100% web">
              Acesse pelo browser, sem instalar nada. Gere YAML, copie, importe no editor.
            </Card>
            <Card title="Paletas prontas">
              Dracula, Nord, GitHub, Solarized, Monokai, Light — comece de uma base e customize.
            </Card>
            <Card title="~91 chaves em 3 blocos">
              Interface (<span className="font-mono">if.*</span>), editor (<span className="font-mono">ed.*</span>), tokens (<span className="font-mono">tk.*</span>). Fallback para formato legado.
            </Card>
            <a
              href={THEME_MAKER}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block rounded-sm border border-signal bg-signal px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
              Abrir Theme Maker →
            </a>
          </div>
          <Ascii label="fluxo">{`Theme Maker (web)
       │
       ├── gerar YAML
       │
       ▼
Kof Editor (desktop)
       │
       ├── importar tema
       │
       ▼
tema aplicado ✨`}</Ascii>
        </div>
      </Section>

      {/* ── Arquitetura ──────────────────────────────────────────────── */}
      <Section
        index="06"
        eyebrow="Arquitetura"
        title="O editor é feito de Kof."
        lead="O mesmo compilador que compila seus programas compila o editor. O lexer de Kof é o lexer do editor."
      >
        <Ascii label="estrutura">{`src/
├── core/           # lexer, token, language, theme, highlight
└── ui/
    ├── front.kf    # arquivos, busca, git, outline, diags
    └── web/        # interface (HTML/CSS/JS gerados por Kof)

scripts/
├── web-combine.sh  # módulos → build/editor-web.kf
├── gui-build.sh    # builda app desktop (Swing/KofDomHost)
├── install.sh      # instala launcher kof-editor
└── release.sh      # empacota tarballs JVM/native`}</Ascii>
      </Section>

      {/* ── Links ─────────────────────────────────────────────────────── */}
      <Section index="07" eyebrow="Links" title="Tudo junto">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href={EDITOR}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Repositório
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              github.com/KofLang/Kof-Editor
            </p>
          </a>
          <a
            href={`${EDITOR}/releases`}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">Releases</h3>
            <p className="mt-2 text-sm text-muted-foreground">Downloads desktop (JVM + nativo)</p>
          </a>
          <a
            href={THEME_MAKER}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Theme Maker
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              koflang.github.io/Kof-editor-theme-maker
            </p>
          </a>
          <a
            href={GITHUB}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">
              Kof (linguagem)
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">github.com/KofLang/Kof4j</p>
          </a>
          <a
            href={CURSO}
            target="_blank"
            rel="noreferrer noopener"
            className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
          >
            <h3 className="font-mono text-sm font-semibold group-hover:text-signal">Curso</h3>
            <p className="mt-2 text-sm text-muted-foreground">Curso completo e gratuito</p>
          </a>
        </div>
      </Section>
    </main>
  );
}
