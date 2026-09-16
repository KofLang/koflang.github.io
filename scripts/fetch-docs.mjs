// Gera os snapshots de documentação (public/docs/*.json) direto do GitHub,
// em build-time, em dois arquivos:
//   docs-core.json   → learn/ e training/ (KofLang/Kof4j) — página /docs
//   docs-curso.json  → curso completo (lunalully/curso-completo-de-kof) — /learn
// Só conteúdo de uso da linguagem, em pt-BR (Kof4j já publica .pt_BR.md).
// O site também revalida ao vivo (trees API + raw), então um build antigo
// nunca deixa o conteúdo preso: estes arquivos são só o snapshot inicial.
//
// Uso: node scripts/fetch-docs.mjs [--force]
// Se a rede falhar e já existir um snapshot, ele é preservado (exit 0).

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public/docs");
const CORE_OUT = join(OUT_DIR, "docs-core.json");
const CURSO_OUT = join(OUT_DIR, "docs-curso.json");

const REPOS = [
  { repo: "KofLang/Kof4j", ref: "main" },
  { repo: "lunalully/curso-completo-de-kof", ref: "main" },
];

// coleção → como nascer o id, o que entra na árvore e o arquivo de saída
const COLLECTIONS = [
  {
    collection: "learn",
    file: "core",
    repo: "KofLang/Kof4j",
    test: (p) => p.startsWith("learn/") && p.endsWith(".pt_BR.md"),
    id: (p) => p.slice("learn/".length, -".pt_BR.md".length),
    order: ["", "native/"],
    orderSub: ["architecture", "backend-options", "README", "roadmap"],
  },
  {
    collection: "training",
    file: "core",
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
    file: "curso",
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
  if (!force && existsSync(CORE_OUT) && existsSync(CURSO_OUT)) {
    try {
      const stat = await readFile(CORE_OUT, "utf8");
      const age = Date.now() - new Date(JSON.parse(stat).generated).getTime();
      if (age < 6 * 60 * 60 * 1000) {
        console.log("[docs] snapshots com menos de 6h, pulando fetch (use --force)");
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

  const byFile = new Map();
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
    const docs = entries.filter(Boolean);
    if (!byFile.has(col.file)) byFile.set(col.file, []);
    byFile.get(col.file).push(...docs);
    console.log(`[docs] ${col.collection}: ${docs.length} documentos`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const generated = new Date().toISOString();
  for (const [name, docs] of byFile) {
    const out = name === "core" ? CORE_OUT : CURSO_OUT;
    const payload = {
      generated,
      repos: [...new Set(docs.map((d) => `${d.repo}@main`))],
      docs,
    };
    await writeFile(out, JSON.stringify(payload));
    const kb = (Buffer.byteLength(JSON.stringify(payload)) / 1024).toFixed(0);
    console.log(`[docs] ${name}: ${docs.length} docs, ${kb} KB`);
  }
}

main().catch((err) => {
  console.error(`[docs] erro: ${err.message}`);
  if (existsSync(CORE_OUT) && existsSync(CURSO_OUT)) {
    console.warn(
      "[docs] mantendo snapshots anteriores — as páginas vão revalidar ao vivo no browser.",
    );
    process.exit(0);
  }
  console.warn("[docs] sem snapshot: escrevendo índices vazios (links de fallback para o GitHub).");
  const empty = JSON.stringify({ generated: new Date().toISOString(), repos: [], docs: [] });
  mkdir(OUT_DIR, { recursive: true })
    .then(() => Promise.all([writeFile(CORE_OUT, empty), writeFile(CURSO_OUT, empty)]))
    .then(() => process.exit(0));
});
