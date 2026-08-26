import { useState } from "react";

/* Previews React que espelham a intenção dos widgets Kof (mesma estética Dracula do kof-runtime.mjs) */

// helpers
const clamped = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function CorePreview() {
  const repeat = (p: string, n: number) => p.repeat(n);
  const pad = (s: string, w: number) => s + " ".repeat(Math.max(0, w - s.length));
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-md bg-[#21222c] p-3 font-mono text-xs text-[#50fa7b]">
        App("Demo") → Window 960×640 Theme.dark()
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded bg-[#282a36] p-2 text-center">
          <span className="text-[#6272a4]">surface</span>
          <div className="h-6 rounded mt-1 bg-[#21222c] border border-[#6272a4]/30" />
        </div>
        <div className="rounded bg-[#282a36] p-2 text-center">
          <span className="text-[#6272a4]">primary</span>
          <div className="h-6 rounded mt-1 bg-[#8be9fd]" />
        </div>
        <div className="rounded bg-[#282a36] p-2 text-center">
          <span className="text-[#6272a4]">error</span>
          <div className="h-6 rounded mt-1 bg-[#ff5555]" />
        </div>
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        <div>repeat("-",10)= {repeat("-", 10)}</div>
        <div>pad("kof",8)= [{pad("kof", 8)}]</div>
        <div>ellipsis 8= kof é mui…</div>
      </div>
    </div>
  );
}
export function TypographyPreview() {
  return (
    <div className="space-y-2 p-3 bg-[#282a36] text-[#f8f8f2]">
      <div className="text-[26px] font-bold leading-none">Heading 26 bold</div>
      <div className="text-[18px] font-bold">Subheading 18 bold</div>
      <div className="text-[13px]">Text 13 — Este app é feito de intenções</div>
      <div className="text-[13px] text-[#6272a4]">Muted 13 cinza</div>
      <div className="text-[13px] text-[#8be9fd] font-mono">Code monospace cyan</div>
      <div className="border-l-2 border-[#8be9fd] pl-3 text-[#6272a4] text-xs">
        Quote — barra lateral
      </div>
    </div>
  );
}
export function LayoutPreview() {
  return (
    <div className="space-y-3 p-3">
      <div className="rounded-md border border-[#6272a4]/20 bg-[#21222c] p-3">
        <div className="font-bold text-sm text-[#f8f8f2]">Section</div>
        <div className="text-xs text-[#6272a4]">View(Style surface) + Column</div>
      </div>
      <div className="flex gap-2">
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs">Badge</span>
        <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-2 py-1 text-xs">
          Tag cyan
        </span>
        <span className="rounded-full bg-[#21222c] px-2 py-1 text-xs">Chip ✕</span>
      </div>
      <div className="h-px bg-[#6272a4]/30" />
      <div className="text-xs text-[#6272a4]">Divider — View 1px primary</div>
    </div>
  );
}
export function FormsPreview() {
  const [v, setV] = useState("");
  const [hint, setHint] = useState("");
  return (
    <div className="space-y-2 p-3">
      <div className="text-xs text-[#6272a4]">Nome</div>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="como te chamam?"
        className="w-full rounded-md border border-[#2e303e] bg-[#21222c] px-3 py-2 text-sm text-white placeholder:text-[#6272a4]"
      />
      <div className="text-xs text-[#6272a4]">{hint || " "}</div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            setHint(v.includes("@") && v.includes(".") ? "✓ valor salvo" : "✕ email inválido")
          }
          className="rounded-md border border-[#2e303e] bg-[#21222c] px-3 py-1 text-xs"
        >
          ↻ salvar valor
        </button>
        <span className="text-xs text-[#6272a4]">isEmail / validationSummary</span>
      </div>
    </div>
  );
}
export function ChoicesPreview() {
  const [on, setOn] = useState(false);
  const [tog, setTog] = useState(false);
  const [sel, setSel] = useState(0);
  const [stars, setStars] = useState(0);
  return (
    <div className="space-y-3 p-3">
      <button onClick={() => setOn(!on)} className="flex items-center gap-2 text-sm">
        <span>{on ? "[x]" : "[ ]"}</span> mostrar email público
      </button>
      <button onClick={() => setTog(!tog)} className="flex items-center gap-2 text-sm">
        <span>{tog ? "● on" : "○ off"}</span> notificações
      </button>
      <div className="flex gap-2">
        {["free", "pro", "enterprise"].map((o, i) => (
          <button
            key={o}
            onClick={() => setSel(i)}
            className={`rounded px-3 py-1 text-xs border ${sel === i ? "bg-[#8be9fd] text-black" : "bg-[#21222c] text-white border-[#2e303e]"}`}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="text-xs">
        {sel >= 0 ? `> ${["free", "pro", "enterprise"][sel]}` : "nenhuma"}
      </div>
      <div className="flex gap-2 items-center">
        <span>{["☆☆☆", "★☆☆", "★★☆", "★★★"][stars] ?? "☆☆☆"}</span>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => setStars((s) => (s === n ? 0 : n))}
            className="rounded border border-[#2e303e] bg-[#21222c] px-2 py-1 text-xs"
          >
            {"★".repeat(n)}
          </button>
        ))}
      </div>
    </div>
  );
}
export function NavigationPreview() {
  const [tab, setTab] = useState(0);
  const titles = ["visão", "vendas", "estoque"];
  const bodies = ["Conteúdo da visão", "Gráficos de vendas", "Estoque atual"];
  return (
    <div className="space-y-3 p-3">
      <div className="flex gap-2">
        {titles.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-3 py-1 text-xs rounded border ${tab === i ? "bg-[#8be9fd] text-black" : "bg-[#21222c] text-white border-[#2e303e]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="rounded bg-[#21222c] p-2 text-xs text-[#50fa7b]">
        ▸ {titles[tab]}
        <br />
        <br />
        {bodies[tab]}
      </div>
      <div className="flex gap-2 items-center text-xs">
        <button className="rounded border border-[#2e303e] px-2 py-1">‹ prev</button>
        <span>página 002 / 10</span>
        <button className="rounded border border-[#2e303e] px-2 py-1">next ›</button>
      </div>
      <div className="text-xs text-[#6272a4]">conta › perfil — Breadcrumbs(join “ › ”)</div>
    </div>
  );
}
export function OverlaysPreview() {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2 p-3">
      <div className="rounded bg-[#21222c] border border-[#2e303e] p-3">
        <div className="text-xs font-bold">i Alerta info</div>
        <div className="text-xs text-[#6272a4]">alterações só saem quando você salvar</div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShow(true)}
          className="rounded bg-[#21222c] border border-[#2e303e] px-3 py-1 text-xs"
        >
          Dialog: salvar?
        </button>
        <span className="rounded-full bg-[#8be9fd] text-black px-2 py-1 text-xs">
          Toast ✕ — sem timer
        </span>
      </div>
      {show && (
        <div className="rounded border border-[#8be9fd] bg-[#282a36] p-3 text-xs">
          Janela Dialog 460×320
          <button onClick={() => setShow(false)} className="ml-2 rounded border px-2 py-1">
            ok
          </button>
        </div>
      )}
    </div>
  );
}
export function DataPreview() {
  return (
    <div className="space-y-3 p-3 font-mono text-xs">
      <div className="whitespace-pre bg-[#21222c] p-2 rounded text-[#f8f8f2]">
        produto status meta
        <br />
        ─────────────────────────
        <br />
        widgets andamento 80%
        <br />
        docs feito 100%
        <br />
        site atrasado 45%
      </div>
      <div className="flex gap-2">
        <div className="rounded bg-[#21222c] p-3 text-center">
          <div className="text-lg font-bold">12.4k</div>
          <div className="text-xs text-green-400">+8%</div>
          <div className="text-[10px] text-[#6272a4]">downloads</div>
        </div>
        <div className="rounded bg-[#21222c] p-3 text-center">
          <div className="text-lg font-bold">R$ 84k</div>
          <div className="text-xs text-green-400">+2%</div>
          <div className="text-[10px] text-[#6272a4]">receita</div>
        </div>
        <div className="rounded-full bg-purple-500 w-10 h-10 grid place-items-center text-xs font-bold">
          MS
        </div>
      </div>
      <div className="text-[#6272a4]">
        • src/00-core.kf
        <br /> • src/04-choices.kf
        <br /> • docs/gaps.md — TreeView
      </div>
    </div>
  );
}
export function DatetimePreview() {
  return (
    <div className="space-y-2 p-3 font-mono text-xs bg-[#21222c] text-[#f8f8f2] rounded">
      <div>ago 2026</div>
      <div>D S T Q Q S S</div>
      <div> 1</div>
      <div> 2 3 4 5 6 7 8</div>
      <div> 9 10 11 12 13 14 15</div>
      <div className="flex gap-2 pt-2">
        <button className="rounded border border-[#2e303e] px-2">‹</button>
        <button className="rounded border border-[#2e303e] px-2">›</button>
        <span className="text-[#6272a4]">09:00 — Sakamoto puro</span>
      </div>
    </div>
  );
}
export function ChartsPreview() {
  const spark = "▁▂▃▄▅▆▇█";
  return (
    <div className="space-y-2 p-3">
      <div className="font-mono text-xs">
        sparkline: <span className="text-[#50fa7b]">{spark}</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {[12, 18, 9, 22, 30, 26, 41].map((v, i) => (
          <div
            key={i}
            style={{ height: `${clamped((v / 41) * 100, 10, 100)}%` }}
            className="w-6 bg-[#8be9fd]"
          />
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <span>● 72%</span>
        <span>[██████░░░░] 68%</span>
      </div>
      <div className="font-mono text-xs">{"█".repeat(7) + "░".repeat(13)} 7/10 — progressBar</div>
    </div>
  );
}
export function IoPreview() {
  const [path, setPath] = useState("caminho/do/arquivo.txt");
  const [preview, setPreview] = useState("nenhum arquivo carregado");
  return (
    <div className="space-y-2 p-3">
      <div className="text-xs text-[#6272a4]">abrir arquivo de texto</div>
      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        className="w-full rounded border border-[#2e303e] bg-[#21222c] px-2 py-1 text-xs text-white"
      />
      <button
        onClick={() =>
          setPreview(path.includes("/") ? "│ linha 1 ...\n│ linha 2 ..." : "✕ não existe: " + path)
        }
        className="rounded border border-[#2e303e] bg-[#21222c] px-3 py-1 text-xs"
      >
        carregar ⤓
      </button>
      <div className="rounded bg-[#21222c] p-2 font-mono text-xs text-[#6272a4] whitespace-pre">
        {preview}
      </div>
      <div className="text-[10px] text-[#6272a4]">kof.io → JVM/Native OK, JS gap UIW040</div>
    </div>
  );
}

// Examples previews (reaproveita famílias)
export function HelloPreview() {
  return (
    <div className="space-y-2 p-4 bg-[#282a36] text-[#f8f8f2]">
      <div className="text-2xl font-bold">Olá, Kof</div>
      <div className="text-sm text-[#6272a4]">
        Este app é feito de intenções, não de mecanismos.
      </div>
      <span className="rounded-full bg-white/10 px-2 py-1 text-xs">Badge alpha</span>
    </div>
  );
}
export function PerfilPreview() {
  return (
    <div className="space-y-2 p-3">
      <div className="text-xs text-[#6272a4]">conta › perfil</div>
      <div className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded-full bg-purple-500 grid place-items-center text-xs">MS</div>
        <div>
          <div className="text-sm font-bold">mel</div>
          <div className="text-xs text-[#6272a4]">@mel</div>
        </div>
      </div>
      <FormsPreview />
      <ChoicesPreview />
    </div>
  );
}
export function TarefasPreview() {
  const [todos, setTodos] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [feitas, setFeitas] = useState(0);
  const total = todos.length;
  return (
    <div className="space-y-2 p-3">
      <div className="text-lg font-bold">Tarefas</div>
      <div className="font-mono text-xs">
        {"█".repeat(clamped(total ? Math.round((feitas / total) * 20) : 0, 0, 20)) +
          "░".repeat(20 - clamped(total ? Math.round((feitas / total) * 20) : 0, 0, 20))}{" "}
        {feitas}/{total}
      </div>
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="o que precisa ser feito?"
          className="flex-1 rounded border border-[#2e303e] bg-[#21222c] px-2 py-1 text-xs"
        />
        <button
          onClick={() => {
            if (q.trim()) {
              setTodos([...todos, q]);
              setQ("");
            }
          }}
          className="rounded bg-[#8be9fd] text-black px-2 py-1 text-xs"
        >
          + adicionar
        </button>
      </div>
      <button
        onClick={() => setFeitas((f) => Math.min(f + 1, total))}
        className="rounded border border-[#2e303e] px-2 py-1 text-xs"
      >
        ✓ concluir última
      </button>
      <div className="space-y-1 text-xs">
        {todos.map((t, i) => (
          <div key={i} className="text-[#50fa7b]">
            [ ] {t}
          </div>
        ))}
      </div>
    </div>
  );
}
export function DashboardPreview() {
  return (
    <div className="space-y-2 p-2">
      <div className="flex gap-2 text-xs">
        <span className="rounded bg-[#21222c] px-2 py-1">visão</span>
        <span className="px-2 py-1 text-[#6272a4]">vendas</span>
        <span className="px-2 py-1 text-[#6272a4]">estoque</span>
      </div>
      <DataPreview />
      <ChartsPreview />
    </div>
  );
}
