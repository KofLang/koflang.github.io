import { Fragment, type ReactNode } from "react";
import { CodeBlock } from "@/components/kof/CodeBlock";
import { githubUrl, type Doc } from "./docs";

export type Heading = { level: number; id: string; text: string };
export type DocResolver = (fromPath: string, href: string) => string | null;

// ── parsing de blocos ─────────────────────────────────────────────────

type Block =
  | { t: "code"; lang: string; lines: string[] }
  | { t: "heading"; level: number; text: string; _id?: string }
  | { t: "quote"; lines: string[] }
  | { t: "hr" }
  | { t: "html"; text: string }
  | { t: "table"; header: string[]; rows: string[][]; align: (string | null)[] }
  | {
      t: "list";
      items: { lines: string[]; children: Block[] }[];
      ordered: boolean;
      start: number;
    }
  | { t: "para"; lines: string[] };

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const ATX = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^ {0,3}([-*_])(\s*\1){2,}\s*$/;
const LIST = /^(\s*)([-+*]|\d{1,9}[.)])\s+(.*)$/;
const QUOTE = /^ {0,3}>/;
const RAW =
  /^ {0,3}<(img|br|hr|kbd|div|details|summary|span|p|table|thead|tbody|tr|td|th|a|sup|sub|code|strong|em)\b/i;

const isOrderedMarker = (marker: string) => /\d/.test(marker);

function isBlockStart(line: string): boolean {
  return (
    FENCE.test(line) ||
    ATX.test(line) ||
    HR.test(line) ||
    QUOTE.test(line) ||
    LIST.test(line) ||
    /^\s{0,3}\|/.test(line) ||
    RAW.test(line)
  );
}

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const marker = (fence[1] ?? "`").charAt(0);
      const lang = marker === "`" ? ((fence[2] ?? "").trim().split(/\s+/)[0] ?? "") : "";
      const closeRe = new RegExp(`^ {0,3}${marker === "`" ? "`" : "~"}{3,}\\s*$`);
      const body: string[] = [];
      i++;
      while (i < lines.length && !closeRe.test(lines[i] ?? "")) {
        body.push(lines[i] ?? "");
        i++;
      }
      i++;
      blocks.push({ t: "code", lang, lines: body });
      continue;
    }

    const atx = line.match(ATX);
    if (atx) {
      blocks.push({
        t: "heading",
        level: (atx[1] ?? "#").length,
        text: atx[2] ?? "",
      });
      i++;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length) {
        const q = lines[i] ?? "";
        if (QUOTE.test(q)) {
          quoted.push(q.replace(/^ {0,3}>\s?/, ""));
          i++;
        } else if (quoted.length && q.trim() && !isBlockStart(q)) {
          quoted.push(q);
          i++;
        } else break;
      }
      blocks.push({ t: "quote", lines: quoted });
      continue;
    }

    if (RAW.test(line)) {
      blocks.push({ t: "html", text: line.trim() });
      i++;
      continue;
    }

    const nextLine = lines[i + 1] ?? "";
    if (/^\s{0,3}\|/.test(line) && alignCells(nextLine)) {
      const align = alignCells(nextLine)!;
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").includes("|") && (lines[i] ?? "").trim()) {
        rows.push(splitRow(lines[i] ?? ""));
        i++;
      }
      blocks.push({ t: "table", header, rows, align });
      continue;
    }

    if (LIST.test(line)) {
      const list = parseList(lines, i);
      blocks.push(list.block);
      i = list.next;
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const p = lines[i] ?? "";
      if (!p.trim() || isBlockStart(p)) break;
      para.push(p);
      i++;
    }
    blocks.push({ t: "para", lines: para });
  }
  return blocks;
}

function parseList(lines: string[], start: number): { block: Block; next: number } {
  const firstLine = lines[start] ?? "";
  const first = firstLine.match(LIST);
  const ordered = first ? isOrderedMarker(first[2] ?? "-") : false;
  const baseIndent = (first?.[1] ?? "").length;
  const items: { lines: string[]; children: Block[] }[] = [];

  let i = start;
  let current: { lines: string[]; children: Block[] } | null = null;

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (!line.trim()) {
      const ahead = lines[i + 1] ?? "";
      if (ahead.trim() && (LIST.test(ahead) || /^\s{2,}\S/.test(ahead))) {
        i++;
        continue;
      }
      break;
    }

    const m = line.match(LIST);
    const indent = m ? (m[1] ?? "").length : (line.match(/^\s*/)?.[0] ?? "").length;

    if (m && (m[1] ?? "").length <= baseIndent) {
      if ((m[1] ?? "").length < baseIndent) break;
      if (isOrderedMarker(m[2] ?? "-") !== ordered && items.length) break;
      current = { lines: [m[3] ?? ""], children: [] };
      items.push(current);
      i++;
      continue;
    }

    if (current && indent > baseIndent) {
      current.lines.push(line.slice(Math.min(indent, baseIndent + 2)).trim());
      i++;
      continue;
    }

    if (current && !m && !isBlockStart(line)) {
      current.lines.push(line.trim());
      i++;
      continue;
    }

    break;
  }

  for (const item of items) {
    const nested: string[] = [];
    for (let j = 1; j < item.lines.length; j++) {
      const l = item.lines[j] ?? "";
      if (LIST.test(l) || /^\s{2,}\S/.test(l)) nested.push(l);
    }
    item.children = nested.length ? parseBlocks(nested) : [];
  }

  return {
    block: {
      t: "list",
      items,
      ordered,
      start: ordered ? Number((first?.[2] ?? "1").match(/\d+/)?.[0] ?? "1") : 1,
    },
    next: i,
  };
}

function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inCode = false;
  for (const ch of line) {
    if (ch === "`") inCode = !inCode;
    if (ch === "|" && !inCode) {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  if (cells.length > 1 && cells[0] === "") cells.shift();
  if (cells.length && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

function alignCells(line: string): (string | null)[] | null {
  if (!/^[\s|:-]+$/.test(line) || !line.includes("-")) return null;
  return splitRow(line).map((c) => {
    if (!/^-+$/.test(c)) return null;
    const l = c.startsWith(":");
    const r = c.endsWith(":");
    return l && r ? "center" : r ? "right" : l ? "left" : null;
  });
}

// ── inline ────────────────────────────────────────────────────────────

function findBalanced(text: string, from: number, open: string, close: string): number {
  let depth = 0;
  let code = false;
  for (let i = from; i < text.length; i++) {
    if (text.charAt(i) === "`") code = !code;
    if (code) continue;
    if (text.charAt(i - 1) === "\\") continue;
    const ch = text.charAt(i);
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function resolveHref(doc: Doc | null, href: string, resolveDoc?: DocResolver | undefined): string {
  if (!href) return "#";
  if (/^(https?:|mailto:|#|\/)/i.test(href)) return href;
  if (resolveDoc && doc && /\.md(#[^)]*)?$/i.test(href)) {
    const id = resolveDoc(doc.path, href.split("#")[0] ?? href);
    if (id) return `#kofdoc:${id}`;
  }
  return githubUrl(doc, href);
}

interface InlineCtx {
  doc: Doc | null;
  key: { n: number };
  resolveDoc?: DocResolver | undefined;
}

function walkInline(text: string, out: ReactNode[], ctx: InlineCtx): void {
  let buf = "";
  let i = 0;
  const k = () => `n${ctx.key.n++}`;
  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text.charAt(i);

    if (ch === "\\" && i + 1 < text.length && /[*_`~[\]()#!|<>-]/.test(text.charAt(i + 1))) {
      buf += text.charAt(i + 1);
      i += 2;
      continue;
    }

    if (ch === "`") {
      let len = 1;
      while (text.charAt(i + len) === "`") len++;
      const run = "`".repeat(len);
      const rest = text.slice(i + len);
      const close = rest.indexOf(run);
      if (close >= 0) {
        flush();
        out.push(
          <code key={k()} className="md-code">
            {rest.slice(0, close)}
          </code>,
        );
        i += len + close + len;
        continue;
      }
    }

    if (ch === "[" || (ch === "!" && text.charAt(i + 1) === "[")) {
      const isImg = ch === "!";
      const openPos = isImg ? i + 1 : i;
      const labelEnd = findBalanced(text, openPos, "[", "]");
      if (labelEnd > 0) {
        const after = text.slice(labelEnd + 1);
        const inlineLink = after.match(/^\(([^)]*)\)/);
        const refLink = after.match(/^\[(.*?)\]/);
        let href = "";
        let consumed = 0;
        if (inlineLink) {
          href = (inlineLink[1] ?? "").trim().split(/\s+/)[0] ?? "";
          consumed = inlineLink[0].length;
        } else if (refLink) {
          href = refLink[1] || text.slice(openPos + 1, labelEnd);
          consumed = refLink[0].length;
        }
        if (consumed > 0) {
          const label = text.slice(openPos + 1, labelEnd);
          flush();
          if (isImg) {
            out.push(
              <img
                key={k()}
                src={resolveHref(ctx.doc, href, ctx.resolveDoc)}
                alt={label}
                loading="lazy"
                className="md-img"
              />,
            );
          } else {
            const children: ReactNode[] = [];
            walkInline(label, children, ctx);
            const external = /^(https?:|mailto:)/i.test(href);
            out.push(
              <a
                key={k()}
                href={resolveHref(ctx.doc, href, ctx.resolveDoc)}
                className="md-link"
                {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
              >
                {children}
              </a>,
            );
          }
          i = labelEnd + 1 + consumed;
          continue;
        }
      }
    }

    if ((ch === "*" || ch === "_") && text.charAt(i + 1) === ch) {
      const rest = text.slice(i + 2);
      const close = rest.indexOf(ch + ch);
      if (close >= 0 && rest.slice(0, close).trim()) {
        flush();
        const children: ReactNode[] = [];
        walkInline(rest.slice(0, close), children, ctx);
        out.push(
          <strong key={k()} className="md-strong">
            {children}
          </strong>,
        );
        i += 2 + close + 2;
        continue;
      }
    }

    if (ch === "~" && text.charAt(i + 1) === "~") {
      const rest = text.slice(i + 2);
      const close = rest.indexOf("~~");
      if (close >= 0) {
        flush();
        const children: ReactNode[] = [];
        walkInline(rest.slice(0, close), children, ctx);
        out.push(<del key={k()}>{children}</del>);
        i += 2 + close + 2;
        continue;
      }
    }

    if ((ch === "*" || ch === "_") && text.charAt(i - 1) !== ch) {
      const rest = text.slice(i + 1);
      const close = rest.indexOf(ch);
      if (close > 0 && rest.charAt(close - 1) !== " ") {
        flush();
        const children: ReactNode[] = [];
        walkInline(rest.slice(0, close), children, ctx);
        out.push(
          <em key={k()} className="md-em">
            {children}
          </em>,
        );
        i += 1 + close + 1;
        continue;
      }
    }

    buf += ch;
    i++;
  }
  flush();
}

function inline(text: string, ctx: InlineCtx): ReactNode {
  const out: ReactNode[] = [];
  walkInline(text, out, ctx);
  return out.length === 1 ? out[0] : <Fragment>{out}</Fragment>;
}

const TAG_RE =
  /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
const ALLOWED_WRAP = new Set([
  "kbd",
  "sup",
  "sub",
  "span",
  "strong",
  "em",
  "code",
  "p",
  "div",
  "a",
]);

// HTML cru nos docs (raro): <img>, <br>, <kbd>, wrappers de alinhamento.
// Renderamos whitelisted em React — nada passa por innerHTML.
function renderRawHtml(text: string, ctx: InlineCtx): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TAG_RE.lastIndex = 0;
  const pushText = (s: string) => {
    const t = s.trim();
    if (t) nodes.push(<span key={`x${ctx.key.n++}`}>{inline(t, ctx)}</span>);
  };
  while ((m = TAG_RE.exec(text))) {
    pushText(text.slice(last, m.index));
    const closing = m[1] === "/";
    const tag = (m[2] ?? "").toLowerCase();
    const attrs = m[3] ?? "";
    if (!closing) {
      if (tag === "img") {
        const src = /src=(?:"([^"]*)"|'([^']*)')/.exec(attrs)?.[1];
        const alt = /alt=(?:"([^"]*)"|'([^']*)')/.exec(attrs)?.[1] ?? "";
        if (src)
          nodes.push(
            <img
              key={`i${ctx.key.n++}`}
              src={resolveHref(ctx.doc, src, ctx.resolveDoc)}
              alt={alt}
              loading="lazy"
              className="md-img"
            />,
          );
      } else if (tag === "br") {
        nodes.push(<br key={`r${ctx.key.n++}`} />);
      } else if (ALLOWED_WRAP.has(tag)) {
        const closeAt = text.toLowerCase().indexOf(`</${tag}`, m.index);
        if (closeAt > 0) {
          nodes.push(
            <span key={`w${ctx.key.n++}`} className={tag === "kbd" ? "md-kbd" : undefined}>
              {inline(text.slice(m.index + m[0].length, closeAt), ctx)}
            </span>,
          );
          last = closeAt + `</${tag}>`.length;
          continue;
        }
      }
    }
    last = m.index + m[0].length;
  }
  pushText(text.slice(last));
  return nodes.length === 1 ? nodes[0] : <Fragment>{nodes}</Fragment>;
}

// ── API principal ─────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type RenderOptions = {
  collapsible?: boolean;
};

type Section = {
  heading: Block & { t: "heading" };
  blocks: Block[];
};

// Agrupa blocos de nível de seção (h2) em blocos de conteúdo.
function groupByH2(blocks: Block[]): { lead: Block[]; sections: Section[] } {
  const lead: Block[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const b of blocks) {
    if (b.t === "heading" && b.level === 2) {
      current = { heading: b, blocks: [] };
      sections.push(current);
    } else if (current) {
      current.blocks.push(b);
    } else {
      lead.push(b);
    }
  }
  return { lead, sections };
}

export function renderMarkdown(
  content: string,
  doc: Doc | null,
  headings: Heading[],
  resolveDoc?: DocResolver,
  options: RenderOptions = {},
): ReactNode {
  const key = { n: 0 };
  const ctx: InlineCtx = { doc, key, resolveDoc };
  const normalized = content.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  const blocks = parseBlocks(normalized.split("\n"));
  const used = new Set<string>();

  for (const b of blocks) {
    if (b.t === "heading" && b.level <= 3) {
      let id = slugify(b.text);
      if (used.has(id)) {
        let n = 2;
        while (used.has(`${id}-${n}`)) n++;
        id = `${id}-${n}`;
      }
      used.add(id);
      b._id = id;
      headings.push({ level: b.level, id, text: b.text });
    }
  }

  function renderBlocks(list: Block[]): ReactNode {
    return list.map((b) => {
      const k = `b${key.n++}`;
      switch (b.t) {
        case "code": {
          const raw = (b.lang || "").toLowerCase();
          const body = b.lines.join("\n");
          const lang: "kof" | "shell" | "text" =
            raw === "shell" ||
            raw === "bash" ||
            raw === "console" ||
            raw === "sh" ||
            /^\s*\$\s/m.test(body)
              ? "shell"
              : raw === "kof" || raw === "kf" || raw === "kotlin"
                ? "kof"
                : "text";
          return (
            <CodeBlock
              key={k}
              code={body}
              language={lang}
              showLineNumbers={lang === "kof"}
              className="md-codeblock"
            />
          );
        }
        case "heading": {
          const id = b._id ?? slugify(b.text);
          const level = Math.min(b.level, 6);
          const children = inline(b.text, ctx);
          const cls = `md-h md-h${level}`;
          const Tag = `h${level}` as "h1";
          return (
            <Tag key={k} id={id} className={cls}>
              {children}
            </Tag>
          );
        }
        case "quote":
          return (
            <blockquote key={k} className="md-quote">
              {renderBlocks(parseBlocks(b.lines))}
            </blockquote>
          );
        case "hr":
          return <hr key={k} className="md-hr" />;
        case "html":
          return <Fragment key={k}>{renderRawHtml(b.text, ctx)}</Fragment>;
        case "table":
          return (
            <div key={k} className="md-tablewrap">
              <table className="md-table">
                <thead>
                  <tr>
                    {b.header.map((c, ci) => (
                      <th key={ci} style={cellAlign(b.align[ci])}>
                        {inline(c, ctx)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((c, ci) => (
                        <td key={ci} style={cellAlign(b.align[ci])}>
                          {inline(c, ctx)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        case "list":
          return b.ordered ? (
            <ol key={k} className="md-list" start={b.start !== 1 ? b.start : undefined}>
              {b.items.map((item, ii) => (
                <li key={ii} className="md-li">
                  <span>{inline(item.lines.join(" "), ctx)}</span>
                  {item.children.length > 0 && renderBlocks(item.children)}
                </li>
              ))}
            </ol>
          ) : (
            <ul key={k} className="md-list">
              {b.items.map((item, ii) => (
                <li key={ii} className="md-li">
                  <span>{inline(item.lines.join(" "), ctx)}</span>
                  {item.children.length > 0 && renderBlocks(item.children)}
                </li>
              ))}
            </ul>
          );
        case "para":
          return (
            <p key={k} className="md-p">
              {inline(b.lines.join(" "), ctx)}
            </p>
          );
      }
    });
  }

  if (!options.collapsible) {
    return <div className="md-body">{renderBlocks(blocks)}</div>;
  }

  const { lead, sections } = groupByH2(blocks);
  return (
    <div className="md-body">
      {renderBlocks(lead)}
      {sections.map((sec) => {
        const id = sec.heading._id ?? slugify(sec.heading.text);
        return (
          <details key={id} className="md-fold" open id={id}>
            <summary className="md-fold-summary">
              <span className="md-fold-caret" aria-hidden="true" />
              <span className="md-fold-title">{inline(sec.heading.text, ctx)}</span>
              <span className="mono-label md-fold-count">
                {sec.blocks.length} {sec.blocks.length === 1 ? "tópico" : "tópicos"}
              </span>
            </summary>
            <div className="md-fold-body">
              {sec.blocks.some(
                (x) => x.t === "heading" && (x as { level?: number }).level === 3,
              ) && (
                <nav aria-label="Subseções" className="md-subtoc">
                  {sec.blocks
                    .filter((x) => x.t === "heading" && (x as { level?: number }).level === 3)
                    .map((x) => {
                      const h = x as Block & { t: "heading"; _id?: string };
                      return (
                        <a key={h._id ?? h.text} href={`#${h._id}`} className="md-subtoc-link">
                          {h.text.replace(/[*`]/g, "")}
                        </a>
                      );
                    })}
                </nav>
              )}
              {renderBlocks(sec.blocks)}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function cellAlign(
  a: string | null | undefined,
): { textAlign: "left" | "center" | "right" } | undefined {
  if (a === "center" || a === "right" || a === "left") return { textAlign: a };
  return undefined;
}
