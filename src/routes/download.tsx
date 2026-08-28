import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Card, RELEASES, Section, StatusBadge } from "@/components/kof/primitives";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download — Kof" },
      {
        name: "description",
        content:
          "Instale Kof como plataforma autocontida: compiler, CLI, runtime, stdlib, tooling e OpenJDK embutido. Sem instalar Java separadamente.",
      },
      { property: "og:title", content: "Download — Kof" },
      {
        property: "og:description",
        content:
          "Instale o Kof. Só isso. Distribuição oficial em github.com/KofLang/Kof4j/releases.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/download" },
    ],
    links: [{ rel: "canonical", href: "/download" }],
  }),
  component: DownloadPage,
});

const platforms = [
  { name: "Linux", arch: "x86_64" },
  { name: "macOS", arch: "universal" },
  { name: "Windows", arch: "x86_64" },
];

function DownloadPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Download"
        title="Instale o Kof. Só isso."
        lead="Kof é distribuída como uma plataforma autocontida. O usuário não precisa instalar Java separadamente para utilizar a distribuição oficial."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={RELEASES}
              target="_blank"
              rel="noreferrer noopener"
              className="group rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold tracking-tight">{p.name}</h3>
                <span className="font-mono text-xs text-muted-foreground">{p.arch}</span>
              </div>
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-signal">
                Ver releases →
              </p>
            </a>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Os downloads apontam para as releases oficiais no GitHub (0.1.11-beta, com artefatos para
          Linux x86_64, macOS e Windows + SHA256SUMS). Nenhum link de build inexistente é publicado
          aqui.
        </p>
      </Section>

      <Section
        index="02"
        eyebrow="Pacote oficial"
        title="O que vem dentro"
        lead="Uma instalação, uma plataforma."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "compiler",
            "CLI",
            "runtime",
            "stdlib",
            "tooling",
            "editor support",
            "OpenJDK embutido",
          ].map((item) => (
            <div
              key={item}
              className="rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card title="Tooling API mínima">
            <span className="font-mono text-2xl text-foreground">21</span>
            <p className="mt-2">
              A JVM utilizada pelo tooling vem embutida na distribuição oficial.
            </p>
          </Card>
          <Card title="Targets da distribuição">
            <ul className="mt-1 space-y-2">
              <li className="flex items-center justify-between gap-3">
                <span className="font-mono">JVM</span>
                <StatusBadge status="available" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="font-mono">Native</span>
                <StatusBadge status="available" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="font-mono">Script</span>
                <StatusBadge status="planned" />
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="font-mono">KofJS</span>
                <StatusBadge status="in-development" />
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="kof info"
        title="Diagnostique a instalação"
        lead="kof info existe para responder rapidamente qual versão, qual target e qual JVM estão em uso. O output abaixo é conceitual — o formato real é definido pela CLI instalada."
      >
        <CodeBlock
          language="shell"
          filename="terminal"
          showLineNumbers={false}
          code={`$ kof info

Kof 0.1.11-beta
Tooling API: 21
Target: JVM
JVM: bundled OpenJDK (Temurin 21)
Installation: ...`}
        />
      </Section>
    </main>
  );
}
