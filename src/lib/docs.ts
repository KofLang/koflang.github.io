export type Doc = {
  id: string;
  collection: "learn" | "training" | "curso";
  repo: string;
  path: string;
  sha: string;
  title: string;
  summary: string;
  content: string;
};

export type DocsPayload = {
  generated: string;
  repos: string[];
  docs: Doc[];
};

export const COLLECTIONS: {
  key: Doc["collection"];
  label: string;
  desc: string;
  repo: string;
  ref: string;
}[] = [
  {
    key: "learn",
    label: "learn/ — Kof4j",
    desc: "Trilha oficial da linguagem: do primeiro programa à stdlib.",
    repo: "KofLang/Kof4j",
    ref: "main",
  },
  {
    key: "training",
    label: "training/ — Kof4j",
    desc: "Corpus estruturado: linguagem, idioms, padrões, migração e tooling.",
    repo: "KofLang/Kof4j",
    ref: "main",
  },
  {
    key: "curso",
    label: "Curso completo de Kof",
    desc: "Do zero ao avançado: fundamentos, algoritmos, banco, web, segurança e DevOps.",
    repo: "lunalully/curso-completo-de-kof",
    ref: "main",
  },
];

const PATCH_KEY = "kof-docs-live";
const REVALIDATE_MS = 5 * 60 * 1000;

// Links GitHub → id interno quando o destino é uma doc carregada;
// senão, apontam para o arquivo no repositório.
export function githubUrl(doc: Doc | null, href: string): string {
  if (!doc) return href;
  if (/^https?:/i.test(href)) return href;
  const dir = doc.path.includes("/") ? doc.path.slice(0, doc.path.lastIndexOf("/") + 1) : "";
  let target = href;
  if (target.startsWith("./")) target = target.slice(2);
  if (!target.startsWith("../")) target = dir + target;
  while (target.includes("../")) target = target.slice(target.indexOf("../") + 3);
  return `https://github.com/${doc.repo}/blob/${COLLECTIONS.find((c) => c.repo === doc.repo)?.ref ?? "main"}/${target}`;
}

function loadPatches(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(PATCH_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePatch(id: string, content: string) {
  const patches = loadPatches();
  patches[id] = content;
  try {
    sessionStorage.setItem(PATCH_KEY, JSON.stringify(patches));
  } catch {
    /* quota — ignora, snapshot segue válido */
  }
}

let payloadPromise: Promise<DocsPayload> | null = null;

function docsUrl(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return `${base}/docs/docs.json`;
}

async function fetchPayload(): Promise<DocsPayload> {
  const res = await fetch(docsUrl());
  if (!res.ok) throw new Error(`docs.json → ${res.status}`);
  return res.json();
}

// Snapshot do build aplicado com patches ao vivo (staleness-while-revalidate).
export async function loadDocs(): Promise<DocsPayload> {
  if (!payloadPromise) payloadPromise = fetchPayload();
  try {
    const payload = await payloadPromise;
    const patches = loadPatches();
    return {
      ...payload,
      docs: payload.docs.map((d) =>
        patches[d.id] ? { ...d, content: patches[d.id] ?? d.content } : d,
      ),
    };
  } catch (err) {
    payloadPromise = null;
    throw err;
  }
}

// Revalidação leve: 1 request de tree por repo; só baixa o .md que mudou
// (compara SHA). Roda no máximo 1x a cada 5 min por aba.
export async function revalidateDocs(payload: DocsPayload): Promise<DocsPayload> {
  if (typeof window === "undefined") return payload;
  const last = Number(sessionStorage.getItem("kof-docs-reval") ?? "0");
  if (Date.now() - last < REVALIDATE_MS) return payload;
  sessionStorage.setItem("kof-docs-reval", String(Date.now()));

  const patches = loadPatches();
  let changed = false;

  await Promise.all(
    COLLECTIONS.map(async (col) => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${col.repo}/git/trees/${col.ref}?recursive=1`,
        );
        if (!res.ok) return;
        const tree = (await res.json()).tree as { path: string; sha: string }[];
        const shaByPath = new Map(tree.map((t) => [t.path, t.sha]));
        const stale = payload.docs.filter(
          (d) => d.repo === col.repo && shaByPath.get(d.path) && shaByPath.get(d.path) !== d.sha,
        );
        await Promise.all(
          stale.map(async (d) => {
            try {
              const raw = await fetch(
                `https://raw.githubusercontent.com/${d.repo}/${col.ref}/${d.path}`,
              );
              if (!raw.ok) return;
              const text = await raw.text();
              if (text !== d.content) {
                savePatch(d.id, text);
                changed = true;
              }
            } catch {
              /* offline — snapshot segue */
            }
          }),
        );
      } catch {
        /* sem rede / rate limit — snapshot do build continua servindo */
      }
    }),
  );

  if (!changed) return payload;
  const fresh = loadPatches();
  return {
    ...payload,
    docs: payload.docs.map((d) => (fresh[d.id] ? { ...d, content: fresh[d.id] ?? d.content } : d)),
  };
}

export function firstDocOf(payload: DocsPayload, collection: Doc["collection"]): Doc | null {
  return payload.docs.find((d) => d.collection === collection) ?? null;
}

// Converte link relativo de um .md para o id interno de outra doc carregada.
// ex.: de "learn/12-collections.pt_BR.md" → link "14-exceptions.md" vira
// "learn:14-exceptions". Retorna null se não existir doc desse caminho.
export function buildResolver(docs: Doc[]) {
  const byPath = new Map<string, string>();
  for (const d of docs) {
    byPath.set(d.path, d.id);
    // também registra o caminho sem o sufixo .pt_BR (docs em inglês linkam
    // para a versão en, que não carregamos — mas o alvo pt_BR tem mesmo dir)
    if (d.path.endsWith(".pt_BR.md")) byPath.set(d.path.replace(".pt_BR.md", ".md"), d.id);
  }

  return function resolve(fromPath: string, href: string): string | null {
    let target = href.split("#")[0];
    if (!target || !/\.md$/i.test(target)) return null;
    const dir = fromPath.includes("/") ? fromPath.slice(0, fromPath.lastIndexOf("/") + 1) : "";
    if (target.startsWith("./")) target = target.slice(2);
    let full = target.startsWith("../") ? null : dir + target;
    if (!full) {
      // resolve ../ manualmente a partir do diretório da doc de origem
      const parts = dir.split("/").filter(Boolean);
      let t = target;
      while (t.startsWith("../")) {
        parts.pop();
        t = t.slice(3);
      }
      full = (parts.length ? parts.join("/") + "/" : "") + t;
    }
    return byPath.get(full) ?? null;
  };
}
