import type { ReactNode } from "react";

export const GITHUB = "https://github.com/KofLang/Kof4j";
export const RELEASES = `${GITHUB}/releases`;
export const TRAINING = `${GITHUB}/tree/main/training`;
export const LEARN_DIR = `${GITHUB}/tree/main/learn`;

export type Status = "available" | "in-development" | "planned";

const statusText: Record<Status, string> = {
  available: "Available",
  "in-development": "In development",
  planned: "Planned",
};

export function StatusBadge({ status }: { status: Status }) {
  const tone =
    status === "available"
      ? "border-ok/40 text-ok"
      : status === "in-development"
        ? "border-wip/40 text-wip"
        : "border-border text-planned";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusText[status]}
    </span>
  );
}

export function Section({
  id,
  index,
  eyebrow,
  title,
  lead,
  children,
  className = "",
}: {
  id?: string;
  index?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`rule-x ${className}`}>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        {(eyebrow || index) && (
          <div className="mb-4 flex items-center gap-3">
            {index && <span className="mono-label text-signal">{index}</span>}
            {eyebrow && <span className="mono-label">{eyebrow}</span>}
          </div>
        )}
        {title && (
          <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl">
            {title}
          </h2>
        )}
        {lead && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {lead}
          </p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}

export function Ascii({
  children,
  label,
  className = "",
}: {
  children: string;
  label?: string;
  className?: string;
}) {
  return (
    <figure
      className={`overflow-hidden rounded-md border border-border bg-surface ${className}`}
    >
      {label && (
        <figcaption className="border-b border-border bg-surface-2/60 px-3 py-2 mono-label">
          {label}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-6 text-muted-foreground sm:text-[13px]">
        {children}
      </pre>
    </figure>
  );
}

export function Card({
  title,
  status,
  children,
  className = "",
}: {
  title?: ReactNode;
  status?: Status;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-surface p-5 transition-colors hover:border-signal-dim ${className}`}
    >
      {(title || status) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
          {status && <StatusBadge status={status} />}
        </div>
      )}
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
