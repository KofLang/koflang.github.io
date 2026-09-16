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
      { property: "og:url", content: "https://koflang.github.io/web" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/web" }],
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
              Serve uma aplicação Kof diretamente a partir do arquivo fonte. Na JVM, cada conexão
              roda em virtual thread — sem servlet container, sem Spring.
            </Card>
            <Card title="HTTP e JSON na stdlib" status="available">
              web.app(), rotas com path params, query, headers, middleware app.use, app.security()
              (rate-limit/CORS/CSRF/auth/RBAC) e OAuth2 resource server na JVM; servidor embutido
              também no KofJS (GraalJS HttpServer + KofJsWebQueue, 03/09) e HTTP/1.1 asm no Native
              (WEB002). Residual nos dois últimos: TLS, ws/sse, path params. JSON tipado
              (json.decode&lt;User&gt;) nos três targets.
            </Card>
          </div>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="Objetivo"
        title="Frontend, backend, database, auth, messaging e async com pouquíssimos arquivos de código de negócio."
        lead="Esse é o objetivo de longo prazo da plataforma, e ele ainda não está entregue. O que existe hoje: backends JVM e Native estáveis, servidor web real na JVM (com OAuth2 + app.security), servidor base no KofJS e HTTP/1.1 asm no Native, com gaps residual nomeados (WEB002/WEB001)."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card title="HTTP deve ser simples" status="available" />
          <Card title="Banco deve ser simples" status="available" />
          <Card title="Mensageria deve ser simples" status="available" />
          <Card title="Assincronismo deve ser simples" status="in-development" />
          <Card title="Concorrência deve ser simples" status="available" />
          <Card title="Segurança deve ser simples" status="available" />
          <Card title="Supervisão deve ser simples" status="available" />
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
