import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Section } from "./primitives";
import {
  buildResolver,
  collectionsIn,
  firstDocOf,
  loadDocs,
  revalidateDocs,
  COLLECTIONS,
} from "@/lib/docs";
import type { Doc, DocsKind, DocsPayload } from "@/lib/docs";
import { renderMarkdown, slugify, type Heading } from "@/lib/md";
import { highlight, searchDocs } from "@/lib/search";

const HASH_PREFIX = "kofdoc:";

function docIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return h.startsWith(HASH_PREFIX) ? h.slice(HASH_PREFIX.length) : null;
}

type Live = { state: "loading" } | { state: "ready"; payload: DocsPayload } | { state: "error" };

export function DocsBrowser({
  kind,
  startCollection,
  index,
  eyebrow,
  title,
  lead,
}: {
  kind: DocsKind;
  startCollection: Doc["collection"];
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
}) {
  const [live, setLive] = useState<Live>({ state: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<Doc["collection"] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    loadDocs(kind)
      .then(async (payload) => {
        if (!mounted) return;
        const fromHash = docIdFromHash();
        const initial =
          fromHash && payload.docs.some((d) => d.id === fromHash)
            ? fromHash
            : (firstDocOf(payload, startCollection)?.id ?? payload.docs[0]?.id ?? null);
        setLive({ state: "ready", payload });
        setSelectedId(initial);
        try {
          const fresh = await revalidateDocs(payload);
          if (mounted && fresh !== payload) setLive({ state: "ready", payload: fresh });
        } catch {
          /* offline — snapshot segue */
        }
      })
      .catch(() => mounted && setLive({ state: "error" }));
    return () => {
      mounted = false;
    };
  }, [kind, startCollection]);

  useEffect(() => {
    const onHash = () => {
      const id = docIdFromHash();
      if (id) setSelectedId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const payload = live.state === "ready" ? live.payload : null;
  const docs = useMemo(() => payload?.docs ?? [], [payload]);
  const doc = docs.find((d) => d.id === selectedId) ?? null;
  const present = useMemo(() => collectionsIn(docs), [docs]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setSidebarOpen(false);
    setQuery("");
    window.history.replaceState(null, "", `#${HASH_PREFIX}${encodeURIComponent(id)}`);
    document.getElementById("kof-doc-main")?.scrollIntoView({ block: "start" });
  }, []);

  // links internos renderizados: #kofdoc:..., âncoras locais (auto-abrem folds)
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith(`#${HASH_PREFIX}`)) {
        e.preventDefault();
        select(decodeURIComponent(href.slice(1 + HASH_PREFIX.length)));
      } else if (href.startsWith("#") && href.length > 1) {
        const target = document.getElementById(href.slice(1));
        if (target) {
          e.preventDefault();
          const fold = target.closest("details.md-fold");
          if (fold) (fold as HTMLDetailsElement).open = true;
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [select, doc?.id]);

  const grouped = useMemo(() => {
    const map = new Map<string, Doc[]>();
    for (const d of docs) {
      const prefix = d.id.slice(0, d.id.indexOf(":") + 1);
      const rest = d.id.slice(prefix.length);
      const dir = rest.includes("/") ? rest.slice(0, rest.lastIndexOf("/")) : "";
      const groupKey = `${prefix}${dir}`;
      if (!map.has(groupKey)) map.set(groupKey, []);
      map.get(groupKey)!.push(d);
    }
    return map;
  }, [docs]);

  const hits = useMemo(
    () => (query.trim().length >= 2 ? searchDocs(query, docs, collection) : []),
    [query, docs, collection],
  );

  return (
    <>
      <Section index={index} eyebrow={eyebrow} title={title} lead={lead}>
        {live.state === "loading" && <p className="mono-label">carregando documentação…</p>}
        {live.state === "error" && (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar o índice de documentação deste build. O conteúdo continua{" "}
            <a
              className="text-signal hover:underline"
              href={COLLECTIONS.find((c) => c.key === startCollection)?.browse ?? "#"}
              target="_blank"
              rel="noreferrer noopener"
            >
              no repositório
            </a>
            .
          </p>
        )}
        {live.state === "ready" && docs.length === 0 && (
          <div className="rounded-md border border-border bg-surface p-6 text-sm text-muted-foreground">
            O snapshot de documentação veio vazio deste build. O conteúdo continua disponível no{" "}
            <a
              className="md-link"
              href={COLLECTIONS.find((c) => c.key === startCollection)?.browse ?? "#"}
              target="_blank"
              rel="noreferrer noopener"
            >
              repositório
            </a>
            .
          </div>
        )}
        {live.state === "ready" && docs.length > 0 && (
          <div
            className={`grid gap-px overflow-hidden rounded-md border border-border bg-border ${
              present.length > 1 ? "sm:grid-cols-3" : ""
            }`}
          >
            {present.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  const first = firstDocOf(live.payload, c.key);
                  if (first) select(first.id);
                }}
                className="group bg-surface p-5 text-left transition-colors hover:bg-surface-2"
              >
                <h3 className="text-base font-semibold tracking-tight group-hover:text-signal">
                  {c.cardTitle ?? c.label}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
                <p className="mono-label mt-3">
                  {docs.filter((d) => d.collection === c.key).length} documentos
                </p>
              </button>
            ))}
          </div>
        )}
      </Section>

      {live.state === "ready" && docs.length > 0 && (
        <section className="rule-x" id={kind === "curso" ? "curso-completo" : undefined}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-start">
              {/* ── Sidebar ─────────────────────────────────────────────── */}
              <aside
                className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 overflow-y-auto border-r border-border bg-background px-4 py-6 transition-transform lg:sticky lg:top-14 lg:z-auto lg:h-[calc(100vh-3.5rem)] lg:w-64 lg:translate-x-0 lg:bg-transparent xl:w-72 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="mono-label">{kind === "curso" ? "Curso" : "Documentação"}</p>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-muted-foreground lg:hidden"
                    aria-label="Fechar menu"
                  >
                    ×
                  </button>
                </div>

                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar palavras-chave… (ex.: transações, jwt, null safety)"
                  aria-label="Buscar na documentação"
                  className="mb-3 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-signal focus:outline-none"
                />

                <div
                  className="mb-4 flex flex-wrap gap-1.5"
                  role="group"
                  aria-label="Filtrar coleção"
                >
                  <FilterChip
                    active={collection === null}
                    onClick={() => setCollection(null)}
                    label="Tudo"
                  />
                  {present.map((c) => (
                    <FilterChip
                      key={c.key}
                      active={collection === c.key}
                      onClick={() => setCollection(collection === c.key ? null : c.key)}
                      label={c.chip ?? c.key}
                    />
                  ))}
                </div>

                {query.trim().length >= 2 ? (
                  <div className="space-y-1.5 pb-16">
                    <p className="mono-label">
                      {hits.length} resultado{hits.length === 1 ? "" : "s"}
                    </p>
                    {hits.map((h) => (
                      <button
                        key={h.doc.id}
                        type="button"
                        onClick={() => select(h.doc.id)}
                        className={`block w-full rounded-md border px-3 py-2 text-left transition-colors ${
                          h.doc.id === selectedId
                            ? "border-signal/50 bg-surface-2"
                            : "border-transparent hover:border-border hover:bg-surface"
                        }`}
                      >
                        <span className="block text-sm font-medium text-foreground">
                          {highlight(h.doc.title, query).map((seg, i) =>
                            seg.mark ? (
                              <mark
                                key={i}
                                className="rounded-sm bg-signal/25 px-0.5 text-foreground"
                              >
                                {seg.text}
                              </mark>
                            ) : (
                              <span key={i}>{seg.text}</span>
                            ),
                          )}
                        </span>
                        <span className="mono-label mt-1 block">{collLabel(h.doc.collection)}</span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                          {highlight(h.snippet, query).map((seg, i) =>
                            seg.mark ? (
                              <mark
                                key={i}
                                className="rounded-sm bg-signal/25 px-0.5 text-foreground"
                              >
                                {seg.text}
                              </mark>
                            ) : (
                              <span key={i}>{seg.text}</span>
                            ),
                          )}
                        </span>
                      </button>
                    ))}
                    {hits.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Nada encontrado para “{query}”. Tente outro termo.
                      </p>
                    )}
                  </div>
                ) : (
                  <nav
                    className="max-h-[calc(100vh-14rem)] space-y-5 overflow-y-auto pb-16"
                    aria-label="Índice de documentação"
                  >
                    {present
                      .filter((c) => !collection || c.key === collection)
                      .map((c) => (
                        <div key={c.key}>
                          <p className="mono-label mb-2 text-signal">{c.label}</p>
                          {[...grouped.entries()]
                            .filter(([key]) => key.startsWith(`${c.key}:`))
                            .map(([key, list]) => (
                              <div key={key} className="mb-2">
                                {key.slice(c.key.length + 1) && (
                                  <p className="mono-label mt-3 mb-1 pl-1 opacity-70">
                                    {key.slice(c.key.length + 1)}
                                  </p>
                                )}
                                {list.map((d) => {
                                  const leaf = d.id.slice(d.id.indexOf(":") + 1);
                                  const name = leaf.includes("/")
                                    ? leaf.slice(leaf.lastIndexOf("/") + 1)
                                    : leaf;
                                  return (
                                    <button
                                      key={d.id}
                                      type="button"
                                      onClick={() => select(d.id)}
                                      className={`block w-full truncate rounded-sm px-2 py-1 text-left text-sm transition-colors ${
                                        d.id === selectedId
                                          ? "bg-signal/15 font-medium text-foreground"
                                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                                      }`}
                                      title={d.title}
                                    >
                                      {displayTitle(d, name)}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                        </div>
                      ))}
                  </nav>
                )}
              </aside>

              {sidebarOpen && (
                <button
                  type="button"
                  aria-label="Fechar menu lateral"
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                />
              )}

              {/* ── Conteúdo ────────────────────────────────────────────── */}
              <div id="kof-doc-main" ref={mainRef} className="min-w-0 flex-1 px-5 pb-24 sm:px-8">
                <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground lg:hidden"
                  >
                    ≡ índice
                  </button>
                  {doc && (
                    <div className="ml-auto hidden gap-2 sm:flex">
                      <FoldButton
                        label="Expandir tudo"
                        onClick={() => setAllFolds(mainRef, true)}
                      />
                      <FoldButton
                        label="Recolher tudo"
                        onClick={() => setAllFolds(mainRef, false)}
                      />
                    </div>
                  )}
                </div>
                {doc ? (
                  <article className="mx-auto max-w-3xl">
                    <DocView doc={doc} payload={live.payload} />
                  </article>
                ) : (
                  <p className="text-sm text-muted-foreground">Escolha um documento no índice.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function setAllFolds(container: React.RefObject<HTMLDivElement | null>, open: boolean) {
  container.current?.querySelectorAll("details.md-fold").forEach((d) => {
    (d as HTMLDetailsElement).open = open;
  });
}

function FoldButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-signal-dim hover:text-foreground"
    >
      {label}
    </button>
  );
}

function collLabel(collection: Doc["collection"]): string {
  return COLLECTIONS.find((c) => c.key === collection)?.label ?? collection;
}

function displayTitle(d: Doc, fallback: string): string {
  const auto =
    d.path
      .split("/")
      .pop()
      ?.replace(/\.pt_BR\.md$/, "")
      .replace(/\.md$/, "") ?? fallback;
  if (d.title && slugify(d.title).slice(0, 18) === slugify(auto).slice(0, 18)) return d.title;
  if (d.title && d.title.length <= 60) return d.title;
  return fallback.replace(/-/g, " ");
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
        active
          ? "border-signal bg-signal/15 text-signal"
          : "border-border text-muted-foreground hover:border-signal-dim hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function DocView({ doc, payload }: { doc: Doc; payload: DocsPayload }) {
  const headings = useRef<Heading[]>([]);

  const rendered = useMemo(() => {
    headings.current = [];
    const resolver = buildResolver(payload.docs);
    return renderMarkdown(doc.content, doc, headings.current, resolver, { collapsible: true });
  }, [doc, payload.docs]);

  const ghLink = `https://github.com/${doc.repo}/blob/main/${doc.path}`;
  const sameCollection = payload.docs.filter((d) => d.collection === doc.collection);
  const idx = sameCollection.findIndex((d) => d.id === doc.id);
  const prev = idx > 0 ? sameCollection[idx - 1] : null;
  const next = idx >= 0 && idx < sameCollection.length - 1 ? sameCollection[idx + 1] : null;
  const toc = headings.current.filter((h) => h.level === 2);

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="mono-label text-signal">{collLabel(doc.collection)}</span>
        <a
          href={ghLink}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          editar no GitHub ↗
        </a>
      </div>

      {toc.length >= 3 && (
        <nav
          aria-label="Nesta página"
          className="mb-8 rounded-md border border-border bg-surface p-4"
        >
          <p className="mono-label mb-2">Nesta página</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {toc.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(h.id);
                    const fold = target?.closest("details.md-fold");
                    if (fold) (fold as HTMLDetailsElement).open = true;
                    target?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="text-sm text-muted-foreground hover:text-signal"
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {rendered}

      <div className="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {prev ? <NavCard doc={prev} /> : <span />}
        {next ? <NavCard doc={next} align="right" /> : <span />}
      </div>
    </>
  );
}

function NavCard({ doc, align = "left" }: { doc: Doc; align?: "left" | "right" }) {
  return (
    <a
      href={`#${HASH_PREFIX}${encodeURIComponent(doc.id)}`}
      className={`block rounded-md border border-border bg-surface p-4 transition-colors hover:border-signal-dim ${
        align === "right" ? "sm:text-right" : ""
      }`}
    >
      <span className="mono-label">{align === "right" ? "Próximo →" : "← Anterior"}</span>
      <span className="mt-1 block text-sm font-medium text-foreground">{doc.title}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">
        {collLabel(doc.collection)}
      </span>
    </a>
  );
}
