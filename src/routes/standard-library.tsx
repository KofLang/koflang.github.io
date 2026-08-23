import { createFileRoute } from "@tanstack/react-router";
import { Ascii, Section, StatusBadge, type Status } from "@/components/kof/primitives";

export const Route = createFileRoute("/standard-library")({
  head: () => ({
    meta: [
      { title: "Standard Library — Kof" },
      {
        name: "description",
        content:
          "A stdlib da Kof em evolução: collections e strings disponíveis; HTTP, JSON, database, async e concorrência em desenvolvimento.",
      },
      { property: "og:title", content: "Standard Library — Kof" },
      {
        property: "og:description",
        content: "Complexidade que pode ser resolvida pela plataforma não deveria virar dependência.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/standard-library" },
    ],
    links: [{ rel: "canonical", href: "/standard-library" }],
  }),
  component: StdlibPage,
});

const capabilities: { name: string; status: Status; note: string }[] = [
  { name: "collections", status: "available", note: "Listas e estruturas básicas." },
  { name: "string operations", status: "available", note: "Operações de texto na linguagem." },
  { name: "HTTP", status: "in-development", note: "Servir e consumir HTTP a partir da plataforma." },
  { name: "JSON", status: "in-development", note: "Serialização como capacidade nativa." },
  { name: "database", status: "in-development", note: "Acesso a dados sem montar um ORM." },
  { name: "concurrency", status: "in-development", note: "Concorrência como parte do runtime." },
  { name: "async", status: "in-development", note: "Assincronismo sem framework externo." },
  { name: "testing", status: "in-development", note: "Testes acompanhando o tooling oficial." },
  { name: "serialization", status: "in-development", note: "Formato-agnóstico, parte da stdlib." },
  { name: "filesystem", status: "in-development", note: "Acesso a arquivos padronizado." },
  { name: "time", status: "in-development", note: "Datas e durações na stdlib." },
  { name: "messaging", status: "planned", note: "Mensageria como capacidade da plataforma." },
  { name: "networking", status: "planned", note: "Camada de rede além do HTTP." },
  { name: "security", status: "planned", note: "Autenticação e primitivas de segurança." },
];

function StdlibPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Standard Library"
        title="What if building software didn't require an entire ecosystem of ceremony?"
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
        title="Complexity belongs in the platform."
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
