import type { RoadmapEra } from "@/lib/kof-roadmap";

function Toggle({ count }: { count: number }) {
  return (
    <span className="ml-auto flex shrink-0 items-baseline gap-2 self-center">
      <span className="font-mono text-xs text-muted-foreground">{count}</span>
      <span className="inline-block font-mono text-base leading-none text-muted-foreground transition-transform group-open:rotate-45">
        +
      </span>
    </span>
  );
}

export function CollapseList({
  label,
  hint,
  items,
}: {
  label: string;
  hint?: string;
  items: string[];
}) {
  return (
    <details className="group rounded-md border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}
        <Toggle count={items.length} />
      </summary>
      <ul className="border-t border-border px-4 py-2">
        {items.map((item) => (
          <li key={item} className="py-1 font-mono text-sm leading-relaxed text-muted-foreground">
            · {item}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function EraAccordion({ eras }: { eras: RoadmapEra[] }) {
  return (
    <div className="space-y-2">
      {eras.map((era) => (
        <CollapseList key={era.label} label={era.label} hint={era.hint} items={era.items} />
      ))}
    </div>
  );
}
