import type { RoadmapEra } from "@/lib/kof-roadmap";

export function EraAccordion({ eras, openLast }: { eras: RoadmapEra[]; openLast?: boolean }) {
  return (
    <div className="space-y-2">
      {eras.map((era, i) => (
        <details
          key={era.label}
          open={openLast && i === eras.length - 1}
          className="group rounded-md border border-border bg-surface"
        >
          <summary className="flex cursor-pointer list-none items-baseline gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="font-mono text-sm font-medium text-foreground">{era.label}</span>
            <span className="font-mono text-xs text-muted-foreground">{era.hint}</span>
            <span className="ml-auto flex shrink-0 items-baseline gap-2 self-center">
              <span className="font-mono text-xs text-muted-foreground">{era.items.length}</span>
              <span className="inline-block font-mono text-base leading-none text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <ul className="border-t border-border px-4 py-2">
            {era.items.map((item) => (
              <li
                key={item}
                className="py-1 font-mono text-sm leading-relaxed text-muted-foreground"
              >
                · {item}
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}
