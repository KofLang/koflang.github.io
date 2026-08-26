# Site oficial da Kof

Site da linguagem de programação Kof — "Uma linguagem. Um compilador. Vários mundos."

- **Stack**: TanStack Start (React 19 + Vite + Tailwind v4), deploy estático no
  GitHub Pages via `.github/workflows/deploy-pages.yml` (build sem plugin do
  Nitro, com prerender das 10 rotas; saída em `dist/client`; `GITHUB_PAGES_BASE`
  define base/subcaminho — o workflow calcula sozinho a partir do nome do repo).
  Para Cloudflare (SSR): `NITRO_PRESET=cloudflare-module npm run build`.
- **Fonte da verdade de conteúdo**: o repositório da linguagem (`KofLang/Kof4j`) — nunca
  anunciar feature como disponível sem confirmar o estado real lá.
- **Idioma**: todo o texto do site em português (BR).
- **Comandos**: `npm run dev` (porta 8080), `npm run lint`, `npm run build`.

## Regras do projeto

1. Honestidade de estado: usar os badges Disponível / Em desenvolvimento / Planejado
   com rigor; gaps por target são nomeados (CONC001, DB001, ...).
2. Nada de números inventados: métricas vêm ao vivo da API pública do GitHub.
3. Rotas em `src/routes/` (file-based routing do TanStack Router).
