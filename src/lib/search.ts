import type { Doc } from "./docs";

export type SearchHit = {
  doc: Doc;
  score: number;
  snippet: string;
};

const normCache = new WeakMap<Doc, string>();

// Normalização: sem acentos, minúsculas, colapsa espaços. Busca no site
// inteiro é em português — "banco de dados" deve achar "Banco de Dados".
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function haystack(doc: Doc): string {
  let h = normCache.get(doc);
  if (!h) {
    const body = doc.content.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`|[\]()!-]/g, " ");
    h = normalize(`${doc.title}\n${body}`);
    normCache.set(doc, h);
  }
  return h;
}

function rawBody(doc: Doc): string {
  return doc.content.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`]/g, "");
}

// termos exatos do título valem muito mais que termos no corpo.
export function searchDocs(query: string, docs: Doc[], collection?: string | null): SearchHit[] {
  const q = normalize(query).trim();
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const hits: SearchHit[] = [];
  for (const doc of docs) {
    if (collection && doc.collection !== collection) continue;
    const hay = haystack(doc);
    const titleHay = normalize(doc.title);

    let score = 0;
    let allTerms = true;
    for (const term of terms) {
      const inTitle = titleHay.includes(term);
      const count = hay.split(term).length - 1;
      if (count === 0 && !inTitle) {
        allTerms = false;
        break;
      }
      score += Math.min(count, 8) + (inTitle ? 40 : 0);
    }
    if (!allTerms) continue;
    if (hay.includes(q)) score += 80;

    hits.push({ doc, score, snippet: makeSnippet(doc, terms) });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, 60);
}

function makeSnippet(doc: Doc, terms: string[]): string {
  const body = rawBody(doc).replace(/\s+/g, " ").trim();
  const lower = normalize(body);
  let pos = -1;
  for (const term of terms) {
    pos = lower.indexOf(term);
    if (pos >= 0) break;
  }
  if (pos < 0) return `${body.slice(0, 140)}…`;
  const start = Math.max(0, pos - 60);
  const end = Math.min(body.length, pos + 120);
  return `${start > 0 ? "…" : ""}${body.slice(start, end).trim()}${end < body.length ? "…" : ""}`;
}

// destaca os termos encontrados dentro de um trecho de texto plano
export function highlight(text: string, query: string): { text: string; mark: boolean }[] {
  const terms = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);
  if (terms.length === 0) return [{ text, mark: false }];

  const lower = normalize(text);
  const marks: boolean[] = new Array(text.length).fill(false);
  for (const term of terms) {
    let from = 0;
    for (;;) {
      const i = lower.indexOf(term, from);
      if (i < 0) break;
      for (let j = i; j < i + term.length; j++) marks[j] = true;
      from = i + term.length;
    }
  }

  const out: { text: string; mark: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const m = marks[i] ?? false;
    const last = out[out.length - 1];
    if (last && last.mark === m) last.text += text.charAt(i);
    else out.push({ text: text.charAt(i), mark: m });
  }
  return out;
}
