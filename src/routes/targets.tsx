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
          "JVM, Native e KofJS (web): um único frontend de linguagem, Kof IR e backends dedicados. Kof não é um transpiler. Script é runtime planejado.",
      },
      { property: "og:title", content: "Targets — Kof" },
      {
        property: "og:description",
        content: "Kof IR para JVM bytecode, binário nativo e ES Modules (KofJS, alpha).",
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
              ELF x86-64 direto (syscalls, sem libc). GC com free-list{" "}
              <span className="font-mono">kof_free_head</span> +{" "}
              <span className="font-mono">kof_gc_collect</span> mark-sweep (27/08, 0.2.0-beta).
            </p>
          </Card>

          <Card title="Script — KofScript" status="in-development">
            <p>
              Top-level <span className="font-mono">let/const</span> →{" "}
              <span className="font-mono">KofScriptGlobals</span>, repl e{" "}
              <span className="font-mono">--watch</span> já funcionam. Execução direta completa
              ainda é planejada — hoje <span className="font-mono">kof run</span> cobre o fluxo
              compilando antes de executar.
            </p>
            <Ascii className="mt-4">{`Kof
  ↓
KofScript
  ↓
KofScriptGlobals
  ↓
Runtime`}</Ascii>
          </Card>

          <Card title="Web — KofJS" status="in-development">
            <Ascii className="mb-4">{`Kof
  ↓
KofJS (alpha)
  ↓
ES Modules (ECMAScript 2022+)`}</Ascii>
            Em alpha: o mesmo frontend e a mesma Kof IR geram ES Modules executados na engine JS
            embarcada (GraalJS — sem Node.js nem runtime externo). Classes, herança, List, JSON,
            exceções, kof.io e kof.time já funcionam; <span className="font-mono">kof.http</span> no
            JS via <span className="font-mono">Java HttpClient</span> interop (27/08) também. A
            plataforma web no browser é a próxima fase. Status em docs/targets/KOFJS.md.
          </Card>

          <Card title="Native — riscv64 / aarch64" status="in-development">
            <p>
              <span className="font-mono">native.risc</span> (riscv64) e{" "}
              <span className="font-mono">native.arm</span> (aarch64) — ELF via{" "}
              <span className="font-mono">cross-as/ld + qemu</span> (placeholder, separado de{" "}
              <span className="font-mono">native</span> x86-64).
            </p>
            <Ascii className="mt-4">{`Kof IR
  ↓
NativeBackend (riscv64/aarch64)
  ↓
ELF (cross)
  ↓
qemu`}</Ascii>
          </Card>

          <Card title="KofC — C subset" status="available">
            <p>
              <span className="font-mono">kof c</span> — subset de C (
              <span className="font-mono">int</span> globals,{" "}
              <span className="font-mono">void</span> funcs,{" "}
              <span className="font-mono">if/while/*(int*)/&amp;</span>) → ELF x86-64 nativo-only.
            </p>
            <Ascii className="mt-4">{`C subset
  ↓
KofCcompiler
  ↓
ELF x86_64
  ↓
Native`}</Ascii>
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

main() {
    var user = User("Mel")
    println(user.name)
}`}
          />
          <div className="grid gap-4">
            <Card title="JVM" status="available">
              Utiliza o garbage collector da JVM.
            </Card>
            <Card title="Native GC" status="available">
              GC nativo com free-list e <span className="font-mono">kof_gc_collect</span>{" "}
              (mark-sweep, 27/08, 0.2.0-beta). A abstração de memória pertence à plataforma.
            </Card>
          </div>
        </div>
      </Section>
    </main>
  );
}
