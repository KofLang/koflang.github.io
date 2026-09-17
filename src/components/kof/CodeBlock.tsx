import { useEffect, useMemo, useState, type ReactNode } from "react";

const KEYWORDS = new Set([
  "switch",
  "case",
  "default",
  "spawn",
  "await",
  "as",
  "instanceof",
  "enum",
  "entity",
  "extern",
  "generated",
  "unique",
  "do",
  "break",
  "continue",
  "assert",
  "protected",
  "abstract",
  "override",
  "native",
  "synchronized",
  "transient",
  "volatile",
  "super",
  "class",
  "var",
  "val",
  "return",
  "if",
  "else",
  "while",
  "for",
  "new",
  "interface",
  "record",
  "extends",
  "implements",
  "import",
  "package",
  "try",
  "catch",
  "finally",
  "throw",
  "public",
  "private",
  "final",
  "static",
  "this",
  "true",
  "false",
  "null",
]);

const TYPES = new Set([
  "bool",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "char",
  "string",
  "void",
  "Bool",
  "Byte",
  "Short",
  "String",
  "Int",
  "Long",
  "Double",
  "Float",
  "Boolean",
  "Char",
  "Void",
  "List",
  "Map",
  "Set",
  "User",
  "Object",
  "Exception",
]);

type Token = { text: string; cls: string };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const push = (text: string, cls: string) => tokens.push({ text, cls });

  while (i < line.length) {
    const rest = line.slice(i);

    const comment = rest.match(/^(\/\/.*|#.*)/);
    if (comment) {
      push(comment[0], "text-code-com");
      i += comment[0].length;
      continue;
    }
    const str = rest.match(/^"(?:[^"\\]|\\.)*"?/);
    if (str) {
      push(str[0], "text-code-str");
      i += str[0].length;
      continue;
    }
    const num = rest.match(/^\d+(\.\d+)?/);
    if (num) {
      push(num[0], "text-code-num");
      i += num[0].length;
      continue;
    }
    const word = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word) {
      const w = word[0];
      const after = rest.slice(w.length);
      let cls = "";
      if (KEYWORDS.has(w)) cls = "text-code-kw";
      else if (TYPES.has(w) || /^[A-Z]/.test(w)) cls = "text-code-type";
      else if (after.startsWith("(")) cls = "text-code-fn";
      push(w, cls);
      i += w.length;
      continue;
    }
    const punc = rest.match(/^[^A-Za-z0-9_\s"]+/);
    if (punc) {
      push(punc[0], "text-code-punc");

      i += punc[0].length;
      continue;
    }
    const ws = rest.match(/^\s+/);
    if (ws) {
      push(ws[0], "");
      i += ws[0].length;
      continue;
    }
    push(rest.slice(0, 1), "");
    i += 1;
  }
  return tokens;
}

export function CodeBlock({
  code,
  filename,
  language = "kof",
  showLineNumbers = true,
  className = "",
}: {
  code: string;
  filename?: string;
  language?: "kof" | "shell" | "text";
  showLineNumbers?: boolean;
  className?: string;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const lines = useMemo(() => code.replace(/\n$/, "").split("\n"), [code]);

  useEffect(() => {
    setCopyState("idle");
  }, [code]);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const copy = async () => {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <div
      className={`flex max-h-[60vh] flex-col overflow-hidden rounded-md border border-border bg-surface sm:max-h-[520px] lg:max-h-[560px] ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface-2/60 px-3 py-2">
        <span className="mono-label truncate">
          {filename ?? (language === "shell" ? "terminal" : "example.kf")}
        </span>
        <button
          type="button"
          onClick={copy}
          disabled={copyState === "copying"}
          className="rounded-sm px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Copiar código"
        >
          {copyState === "copied" ? "copiado" : copyState === "copying" ? "copiando…" : "copiar"}
        </button>
      </div>
      <div role="status" className="font-mono text-xs">
        {copyState === "error" && (
          <p className="px-3 py-2 text-destructive">
            Não foi possível copiar. Tente novamente ou selecione o código e copie manualmente.
          </p>
        )}
        {copyState === "copied" && <span className="sr-only">Código copiado.</span>}
      </div>
      <pre className="flex-1 overflow-auto overscroll-contain p-4 font-mono text-[13px] leading-6 sm:text-sm">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="flex">
              {showLineNumbers && (
                <span
                  aria-hidden="true"
                  className="mr-4 min-w-6 shrink-0 select-none text-right text-code-com"
                >
                  {idx + 1}
                </span>
              )}
              <span className="whitespace-pre">
                {language === "kof" ? (
                  tokenize(line).map((t, j) => (
                    <span key={j} className={t.cls}>
                      {t.text}
                    </span>
                  ))
                ) : language === "shell" ? (
                  <ShellLine line={line} />
                ) : (
                  line
                )}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

function ShellLine({ line }: { line: string }): ReactNode {
  if (line.startsWith("$")) {
    const [, cmd = ""] = line.split(/^\$\s?/);
    const parts = cmd.split(" ");
    return (
      <>
        <span className="text-signal-dim">$ </span>
        <span className="text-code-fn">{parts[0]}</span>
        <span className="text-foreground">
          {parts.length > 1 ? " " + parts.slice(1).join(" ") : ""}
        </span>
      </>
    );
  }
  return <span className="text-muted-foreground">{line}</span>;
}
