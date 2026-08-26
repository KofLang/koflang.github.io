import { createFileRoute } from "@tanstack/react-router";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { Ascii, Card, Section } from "@/components/kof/primitives";

export const Route = createFileRoute("/targets")({
  head: () => ({
    meta: [
      { title: "Targets — Kof" },
      {
        name: "description",
        content:
          "JVM, Native, Script e Web: um único frontend de linguagem, Kof IR e backends dedicados. Kof não é um transpiler.",
      },
      { property: "og:title", content: "Targets — Kof" },
      {
        property: "og:description",
        content: "Kof IR para JVM bytecode, binário nativo, script e, futuramente, KofJS.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "/targets" },
    ],
    links: [{ rel: "canonical", href: "/targets" }],
  }),
  component: TargetsPage,
});

function TargetsPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Targets"
        title="Uma linguagem. Vários mundos."
        lead="O mesmo frontend de linguagem alimenta todos os backends. O código não muda porque o target mudou."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="JVM" status="available">
            <p>Integração com o ecossistema Java e execução na JVM.</p>
            <Ascii className="mt-4">{`Kof
 ↓
Kof Compiler
 ↓
Kof IR
 ↓
JVM Backend
 ↓
.class
 ↓
JVM`}</Ascii>
            <p className="mt-4">
              O backend JVM gera bytecode diretamente. Java é uma plataforma de interoperabilidade,
              não uma linguagem intermediária.
            </p>
          </Card>

          <Card title="Native" status="available">
            <p>Binários nativos sem exigir que o programador gerencie memória manualmente.</p>
            <Ascii className="mt-4">{`Kof
 ↓
Kof IR
 ↓
Native Backend
 ↓
Executable`}</Ascii>
            <p className="mt-4">
              O backend nativo gera código nativo diretamente. O GC nativo ainda está em
              desenvolvimento.
            </p>
          </Card>

          <Card title="Script" status="in-development">
            Execução rápida para scripts e automações, usando exatamente a mesma linguagem.
          </Card>

          <Card title="Web — KofJS" status="in-development">
            <Ascii className="mb-4">{`Kof
 ↓
KofJS (alpha)
 ↓
JavaScript
 ↓
Browser`}</Ascii>
            Em alpha: o mesmo frontend e a mesma Kof IR geram ES Modules (ECMAScript 2022+)
            executados na engine JS embarcada (GraalJS — sem Node.js nem runtime externo). Status
            detalhado em docs/targets/KOFJS.md no repositório.
          </Card>
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Posicionamento"
        title="Kof não é um transpiler."
        lead="Não existe uma etapa em que Kof vira Java e depois pede ajuda ao javac."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Ascii label="o que Kof não é">{`Kof → Java → javac → JVM`}</Ascii>
          <Ascii label="o que Kof é">{`Kof
 ↓
Compiler
 ↓
Kof IR
 ↓
Backend
 ↓
Target`}</Ascii>
        </div>
      </Section>

      <Section
        index="03"
        eyebrow="Memória"
        title="Você escreve código. O runtime cuida da memória."
        lead="O código Kof não deve mudar apenas porque foi compilado para Native. Nada de malloc, free, ponteiros ou lifetimes manuais."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <CodeBlock
            filename="user.kf"
            code={`class User(
    String name
)

fun main() {
    var user = User("Mel")
    println(user.name)
}`}
          />
          <div className="grid gap-4">
            <Card title="JVM" status="available">
              Utiliza o garbage collector da JVM.
            </Card>
            <Card title="Native GC" status="in-development">
              Native terá gerenciamento de memória próprio. A abstração de memória pertence à
              plataforma, não ao usuário.
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
