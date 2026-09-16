import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { COLLECTIONS, firstDocOf, loadDocs, revalidateDocs, buildResolver } from "@/lib/docs";
import type { Doc, DocsPayload } from "@/lib/docs";
import { renderMarkdown, slugify, type Heading } from "@/lib/md";
import { highlight, searchDocs } from "@/lib/search";
import { Section } from "@/components/kof/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documentação — Kof" },
      {
        name: "description",
        content:
          "Toda a documentação de uso da Kof em um lugar: trilha learn/, corpus training/ e o curso completo — com busca no texto inteiro.",
      },
      { property: "og:title", content: "Documentação — Kof" },
      {
        property: "og:description",
        content: "A documentação é parte da linguagem, não conteúdo secundário.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://koflang.github.io/docs" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [{ rel: "canonical", href: "https://koflang.github.io/docs" }],
  }),
  component: DocsPage,
});

const HASH_PREFIX = "kofdoc:";

function docIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const h = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  return h.startsWith(HASH_PREFIX) ? h.slice(HASH_PREFIX.length) : null;
}

type Live = { state: "loading" } | { state: "ready"; payload: DocsPayload } | { state: "error" };

function DocsPage() {
  const [live, setLive] = useState<Live>({ state: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<Doc["collection"] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    loadDocs()
      .then(async (payload) => {
        if (!mounted) return;
        const fromHash = docIdFromHash();
        const initial =
          fromHash && payload.docs.some((d) => d.id === fromHash)
            ? fromHash
            : (firstDocOf(payload, "learn")?.id ?? payload.docs[0]?.id ?? null);
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
  }, []);

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

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setSidebarOpen(false);
    window.history.replaceState(null, "", `#${HASH_PREFIX}${encodeURIComponent(id)}`);
    mainRef.current?.scrollTo({ top: 0 });
    document.getElementById("kof-doc-main")?.scrollIntoView({ block: "start" });
  }, []);

  // clique em links internos renderizados (#kofdoc:..., âncoras locais)
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
        // âncora local dentro do doc: rola sem destruir o deep link kofdoc:
        const target = document.getElementById(href.slice(1));
        if (target) {
          e.preventDefault();
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
    <main>
      <Section
        index="01"
        eyebrow="Documentation"
        title="A documentação é parte da linguagem."
        lead="learn/, training/ e o curso completo — o conteúdo real dos repositórios, direto aqui, com busca no texto inteiro. O snapshot é gerado no build e revalidado ao vivo contra o GitHub."
      >
        {live.state === "loading" && <p className="mono-label">carregando documentação…</p>}
        {live.state === "error" && (
          <p className="text-sm text-muted-foreground">Docs indisponíveis.</p>
        )}
        {live.state === "ready" && docs.length === 0 && (
          <div className="rounded-md border border-border bg-surface p-6 text-sm text-muted-foreground">
            O snapshot de documentação veio vazio deste build. Cada trilha continua disponível no
            repositório:{" "}
            <a
              className="md-link"
              href="https://github.com/KofLang/Kof4j/tree/main/learn"
              target="_blank"
              rel="noreferrer noopener"
            >
              learn/
            </a>
            ,{" "}
            <a
              className="md-link"
              href="https://github.com/KofLang/Kof4j/tree/main/training"
              target="_blank"
              rel="noreferrer noopener"
            >
              training/
            </a>{" "}
            e{" "}
            <a
              className="md-link"
              href="https://github.com/lunalully/curso-completo-de-kof"
              target="_blank"
              rel="noreferrer noopener"
            >
              o curso
            </a>
            .
          </div>
        )}
      </Section>

      {live.state === "ready" && docs.length > 0 && (
        <section className="rule-x">
          <div className="mx-auto max-w-7xl px-0 sm:px-8">
            <div className="flex items-start gap-0">
              {/* ── Sidebar ─────────────────────────────────────────────── */}
              <aside
                className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 overflow-y-auto border-r border-border bg-background px-4 py-6 transition-transform lg:static lg:z-auto lg:h-auto lg:w-72 lg:translate-x-0 lg:bg-transparent xl:w-80 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="mono-label">Documentação</p>
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
                  placeholder="Buscar na documentação… (ex.: transações, kof.db, null safety)"
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
                  {COLLECTIONS.map((c) => (
                    <FilterChip
                      key={c.key}
                      active={collection === c.key}
                      onClick={() => setCollection(collection === c.key ? null : c.key)}
                      label={c.key === "curso" ? "Curso" : c.key}
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
                        onClick={() => {
                          select(h.doc.id);
                          setQuery("");
                        }}
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
                        Nada encontrado. Tente outro termo, ou procure no{" "}
                        <a
                          className="md-link"
                          href="https://github.com/search?q=org%3AKofLang+repo%3AKofLang%2FKof4j&type=code"
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          repositório
                        </a>
                        .
                      </p>
                    )}
                  </div>
                ) : (
                  <nav
                    className="max-h-[calc(100vh-14rem)] space-y-5 overflow-y-auto pb-16"
                    aria-label="Índice de documentação"
                  >
                    {COLLECTIONS.filter((c) => !collection || c.key === collection).map((c) => (
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
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="mb-4 mt-2 rounded-sm border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground lg:hidden"
                >
                  ≡ índice
                </button>
                {doc ? (
                  <article className="mx-auto max-w-3xl xl:mr-0 xl:max-w-none">
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
    </main>
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
    return renderMarkdown(doc.content, doc, headings.current, resolver);
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
                <a href={`#${h.id}`} className="text-sm text-muted-foreground hover:text-signal">
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
