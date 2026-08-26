import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Ascii, Card, Section } from "@/components/kof/primitives";

export const Route = createFileRoute("/web")({
  head: () => ({
    meta: [
      { title: "Web — Kof" },
      {
        name: "description",
        content:
          "kof serve já existe e é o começo da plataforma web da Kof: HTTP, JSON, banco, async e concorrência como capacidades da plataforma.",
      },
      { property: "og:title", content: "Web — Kof" },
      {
        property: "og:description",
        content: "Construir uma aplicação web sem construir antes um ecossistema de frameworks.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/web" },
    ],
    links: [{ rel: "canonical", href: "/web" }],
  }),
  component: WebPage,
});

function WebPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Web"
        title="Construa uma aplicação web sem construir antes um ecossistema de frameworks."
        lead="A visão: HTTP, banco, mensageria, assincronismo e segurança como capacidades da plataforma — não como pilhas de dependências montadas manualmente em todo projeto."
      >
        <Ascii label="visão da plataforma">{`Kof Application
       │
       ├── HTTP
       ├── JSON
       ├── Database
       ├── Authentication
       ├── Messaging
       ├── Async
       └── Concurrency`}</Ascii>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          Nada disso é apresentado aqui como API final. As assinaturas concretas serão definidas
          conforme a standard library e o runtime evoluírem.
        </p>
      </Section>

      <Section
        index="02"
        eyebrow="Web server"
        title="kof serve"
        lead="O servidor web faz parte da CLI oficial. É o começo real da plataforma web — não um framework de controllers."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            language="shell"
            filename="terminal"
            showLineNumbers={false}
            code={`$ kof serve app.kf
$ kof serve app.kf --port 8080`}
          />
          <div className="grid gap-4">
            <Card title="kof serve" status="available">
              Serve uma aplicação Kof diretamente a partir do arquivo fonte.
            </Card>
            <Card title="HTTP / JSON na stdlib" status="in-development">
              Capacidades de HTTP e JSON estão sendo construídas dentro da standard library e do
              runtime.
            </Card>
          </div>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="Objetivo"
        title="Frontend, backend, database, auth, messaging e async com pouquíssimos arquivos de código de negócio."
        lead="Esse é o objetivo de longo prazo da plataforma, e ele ainda não está entregue. O que existe hoje é o compilador, os backends JVM e Native, e o início da camada web."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="HTTP deve ser simples" status="in-development" />
          <Card title="Banco deve ser simples" status="in-development" />
          <Card title="Mensageria deve ser simples" status="planned" />
          <Card title="Assincronismo deve ser simples" status="in-development" />
          <Card title="Concorrência deve ser simples" status="in-development" />
          <Card title="Segurança deve ser simples" status="planned" />
        </div>
      </Section>

      <Section
        index="04"
        eyebrow="Provocação"
        title="Não queremos substituir o Spring por outro Spring."
        lead="Kof não quer criar um “Kof Spring”. Nem um “Kof Hibernate”. Nem uma camada de abstração em cima de outra camada de abstração. A pergunta é: por que essa complexidade precisa existir em primeiro lugar?"
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
Configuration
...`}</Ascii>
          <Ascii label="kof">{`Kof
Compiler
Runtime
Standard Library`}</Ascii>
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          O objetivo não é remover capacidade. É remover cerimônia.
        </p>
      </Section>
    </main>
  );
}
