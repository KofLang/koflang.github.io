import { createFileRoute } from "@tanstack/react-router";
import { GITHUB, Section, StatusBadge } from "@/components/kof/primitives";
import { CollapseList, EraAccordion } from "@/components/kof/era-accordion";
import { concluidoEras, emDesenvolvimento, planejado } from "@/lib/kof-roadmap";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap — Kof" },
      {
        name: "description",
        content:
          "O que já está pronto, o que está em desenvolvimento e o que está planejado na linguagem Kof. Sem datas falsas.",
      },
      { property: "og:title", content: "Roadmap — Kof" },
      {
        property: "og:description",
        content: "Estado real do compilador, backends, stdlib e tooling da Kof.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/roadmap" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/roadmap" }],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <main>
      <Section
        index="01"
        eyebrow="Roadmap"
        title="Sem datas falsas. Apenas estado."
        lead="O roadmap descreve o que existe, o que está sendo construído e para onde o projeto vai. O que está pronto é agrupado por era da linguagem — cada bloco colapsa; o detalhe item a item fica a um clique."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <h3 className="font-mono text-sm uppercase tracking-widest">Concluído</h3>
              <StatusBadge status="available" />
            </div>
            <EraAccordion eras={concluidoEras} />
          </div>

          <div className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <h3 className="font-mono text-sm uppercase tracking-widest">Em desenvolvimento</h3>
              <StatusBadge status="in-development" />
            </div>
            <CollapseList
              label="Frente ativa"
              hint="o que está sendo construído"
              items={emDesenvolvimento}
            />
          </div>

          <div className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between gap-3 px-1 py-2">
              <h3 className="font-mono text-sm uppercase tracking-widest">Planejado</h3>
              <StatusBadge status="planned" />
            </div>
            <CollapseList
              label="Próximos passos"
              hint="para onde o projeto vai"
              items={planejado}
            />
          </div>
        </div>
      </Section>

      <Section
        index="02"
        eyebrow="Versionamento"
        title="MAJOR.MINOR.PATCH — e o pontinho da vergonha."
        lead="A regra de evolução é simples: major releases > major fixes > bugfixes. A primeira release estável, a 0.1.0, já foi lançada — a 0.5.0-beta foi mergeada em main (27/09), a 0.6.0 é release oficial (11/10) e a linha de patch 0.6.1→0.6.2→0.6.3→0.6.4→0.6.5 foi publicada pela auto-cascade em ~5 dias (a 0.6.5 precisou de 3 tentativas de CI); o PATCH continua subindo bastante."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="font-mono text-sm text-muted-foreground">MAJOR.MINOR.PATCH</p>
            <p className="mt-4 text-sm text-muted-foreground">
              O PATCH é, por enquanto, o pontinho da vergonha: pequenas correções, ajustes e
              estabilização enquanto a linguagem ainda está na fase inicial. Ele sobe bastante. Faz
              parte.
            </p>
          </div>
          <div className="rounded-md border border-border bg-surface p-5">
            <p className="mono-label">Automação de release — landed</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Desde 11/10 cada push na <span className="font-mono">lab</span> dispara o{" "}
              <span className="font-mono">auto-cascade</span>: avaliação automática
              lab→testing→stable→prerelease com guarda fail-closed (só promove o que foi medido). Os
              cortes 0.6.0, 0.6.1, 0.6.2, 0.6.3, 0.6.4 e 0.6.5 já rodaram nesse pipeline — incluindo
              recusas honestas do gate: a 0.6.3 quando o ES module do runtime saiu com export
              duplicado (re-cortada no dia seguinte), e a 0.6.5, cujas tags só saíram na 3ª
              tentativa de CI em 16/10 — cada recusa virou um fix real, não um retry cego.
            </p>
            <a
              className="mt-4 inline-block font-mono text-xs uppercase tracking-widest text-signal hover:underline"
              href={`${GITHUB}/releases`}
              target="_blank"
              rel="noreferrer noopener"
            >
              Ver releases →
            </a>
          </div>
        </div>
      </Section>
    </main>
  );
}
