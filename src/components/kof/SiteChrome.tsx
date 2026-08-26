import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/kof.png";
import { CURSO, EDITOR, GITHUB, RELEASES } from "./primitives";

const NAV = [
  { to: "/language", label: "Linguagem" },
  { to: "/learn", label: "Aprender" },
  { to: "/docs", label: "Docs" },
  { to: "/targets", label: "Targets" },
  { to: "/web", label: "Web" },
  { to: "/roadmap", label: "Roadmap" },
] as const;

const EXTERNAL_NAV = [
  { href: CURSO, label: "Curso gratuito" },
  { href: GITHUB, label: "GitHub" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Kof — página inicial">
          <img src={logo} alt="" aria-hidden="true" className="h-6 w-auto" />
          <span className="font-mono text-sm font-bold tracking-[0.2em]">KOF</span>
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          {EXTERNAL_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link
            to="/download"
            className="rounded-sm border border-signal bg-signal px-3.5 py-1.5 font-mono text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
          >
            Baixar Kof
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Alternar menu de navegação"
            className="rounded-sm border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground lg:hidden"
          >
            {open ? "×" : "≡"}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Navegação móvel" className="border-t border-border lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1 px-5 py-3 sm:px-8">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-sm px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            {EXTERNAL_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-sm px-2 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="rule-x">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" aria-hidden="true" className="h-6 w-auto" />
            <span className="font-mono text-sm font-bold tracking-[0.2em]">KOF</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Uma linguagem. Um compilador. Vários mundos.
          </p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Menos código. Mais intenção.
          </p>
        </div>

        <div>
          <h2 className="mono-label">Projeto</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={GITHUB}
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub (linguagem)
              </a>
            </li>
            <li>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={EDITOR}
                target="_blank"
                rel="noreferrer noopener"
              >
                Editor de texto
              </a>
            </li>
            <li>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={RELEASES}
                target="_blank"
                rel="noreferrer noopener"
              >
                Releases
              </a>
            </li>
            <li>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={`${GITHUB}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Licença — GPLv3
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mono-label">Site</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="text-muted-foreground hover:text-foreground" to="/docs">
                Documentação
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:text-foreground" to="/download">
                Download
              </Link>
            </li>
            <li>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={CURSO}
                target="_blank"
                rel="noreferrer noopener"
              >
                Curso gratuito
              </a>
            </li>
            <li>
              <Link className="text-muted-foreground hover:text-foreground" to="/roadmap">
                Roadmap
              </Link>
            </li>
            <li>
              <Link className="text-muted-foreground hover:text-foreground" to="/about">
                Sobre
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="rule-x">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <span className="mono-label">GPLv3 · Kof Language Project</span>
          <span className="mono-label">Em desenvolvimento ativo</span>
        </div>
      </div>
    </footer>
  );
}
