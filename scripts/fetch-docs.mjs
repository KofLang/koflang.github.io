// Gera o snapshot de documentação (public/docs/docs.json) direto do GitHub,
// em build-time. Conteúdo de uso da linguagem:
//   - KofLang/Kof4j  → learn/ (trilha) e training/ (corpus), só .pt_BR.md
//   - lunalully/curso-completo-de-kof → todos os .md
// O site também revalida ao vivo no /docs (trees API + raw), então um build
// antigo nunca deixa o conteúdo preso: este arquivo é só o snapshot inicial.
//
// Uso: node scripts/fetch-docs.mjs [--force]
// Se a rede falhar e já existir um snapshot, ele é preservado (exit 0).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/docs/docs.json");

const REPOS = [
  { repo: "KofLang/Kof4j", ref: "main" },
  { repo: "lunalully/curso-completo-de-kof", ref: "main" },
];

// coleção → como nascer o id e o que entra na árvore
const COLLECTIONS = [
  {
    collection: "learn",
    repo: "KofLang/Kof4j",
    test: (p) => p.startsWith("learn/") && p.endsWith(".pt_BR.md"),
    id: (p) => p.slice("learn/".length, -".pt_BR.md".length),
    order: ["", "native/"],
    orderSub: ["architecture", "backend-options", "README", "roadmap"],
  },
  {
    collection: "training",
    repo: "KofLang/Kof4j",
    test: (p) => p.startsWith("training/") && p.endsWith(".pt_BR.md"),
    id: (p) => p.slice("training/".length, -".pt_BR.md".length),
    order: [
      "README",
      "language/",
      "reference/",
      "idioms/",
      "patterns/",
      "anti-patterns/",
      "migration/",
      "examples/",
      "tooling/",
      "releases/",
      "distribution/",
      "datasets/",
    ],
  },
  {
    collection: "curso",
    repo: "lunalully/curso-completo-de-kof",
    test: (p) => p.endsWith(".md"),
    id: (p) => (p === "README.md" ? "README" : p.replace(/\.md$/, "")),
    order: null,
  },
];

const CONCURRENCY = 8;

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "koflang.github.io build" } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.json();
}

async function getText(url) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "koflang.github.io build" } });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
      return await res.text();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

function firstHeading(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  if (!m) return fallback;
  return m[1].replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function summary(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const t = line.trim();
    if (!t) {
      if (out.length) break;
      continue;
    }
    if (/^#/.test(t) || /^>/.test(t) || /^[-*|]/.test(t) || !t.includes(" ")) continue;
    out.push(t);
    if (out.join(" ").length > 240) break;
  }
  const s = out
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1");
  return s.length > 260 ? `${s.slice(0, 257)}…` : s;
}

function sortKey(col, path) {
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
  const groups = COLLECTIONS.find((c) => c.collection === col.collection)?.order;
  const gi = groups ? groups.indexOf(dir) : -1;
  return `${gi < 0 ? "zz" : String(gi).padStart(2, "0")}:${path}`;
}

async function main() {
  const force = process.argv.includes("--force");
  if (!force && existsSync(OUT)) {
    try {
      const stat = await readFile(OUT, "utf8");
      const age = Date.now() - new Date(JSON.parse(stat).generated).getTime();
      if (age < 6 * 60 * 60 * 1000) {
        console.log("[docs] snapshot com menos de 6h, pulando fetch (use --force)");
        return;
      }
    } catch {
      /* regenera */
    }
  }

  const trees = new Map();
  for (const { repo, ref } of REPOS) {
    const url = `https://api.github.com/repos/${repo}/git/trees/${ref}?recursive=1`;
    const data = await getJson(url);
    if (!Array.isArray(data.tree)) throw new Error(`tree inesperada para ${repo}`);
    trees.set(
      repo,
      data.tree.filter((t) => t.type === "blob").map((t) => ({ path: t.path, sha: t.sha })),
    );
    console.log(`[docs] ${repo}@${ref}: ${trees.get(repo).length} blobs`);
  }

  const docs = [];
  for (const col of COLLECTIONS) {
    const files = trees
      .get(col.repo)
      .filter((t) => col.test(t.path))
      .sort((a, b) => sortKey(col, a.path).localeCompare(sortKey(col, b.path)));
    const entries = await mapLimit(files, CONCURRENCY, async (f) => {
      const raw = `https://raw.githubusercontent.com/${col.repo}/refs/heads/${REPOS.find((r) => r.repo === col.repo).ref}/${f.path}`;
      const content = await getText(raw);
      if (content == null) return null;
      const base = f.path.split("/").pop().replace(".pt_BR.md", ".md").replace(/\.md$/, "");
      return {
        id: `${col.collection}:${col.id(f.path)}`,
        collection: col.collection,
        repo: col.repo,
        path: f.path,
        sha: f.sha,
        title: firstHeading(content, base),
        summary: summary(content),
        content,
      };
    });
    for (const e of entries) if (e) docs.push(e);
    console.log(`[docs] ${col.collection}: ${entries.filter(Boolean).length} documentos`);
  }

  const payload = {
    generated: new Date().toISOString(),
    repos: REPOS.map((r) => `${r.repo}@${r.ref}`),
    docs,
  };
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(payload));
  const kb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(0);
  console.log(`[docs] public/docs/docs.json gerado: ${docs.length} docs, ${kb} KB`);
}

main().catch((err) => {
  console.error(`[docs] erro: ${err.message}`);
  if (existsSync(OUT)) {
    console.warn(
      "[docs] mantendo snapshot anterior — a página /docs vai revalidar ao vivo no browser.",
    );
    process.exit(0);
  }
  console.warn("[docs] sem snapshot: escrevendo índice vazio (links de fallback para o GitHub).");
  mkdir(dirname(OUT), { recursive: true })
    .then(() =>
      writeFile(OUT, JSON.stringify({ generated: new Date().toISOString(), repos: [], docs: [] })),
    )
    .then(() => process.exit(0));
});
