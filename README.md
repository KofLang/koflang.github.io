# Kof — Site oficial

> **Uma linguagem. Um compilador. Vários mundos.**
>
> Site oficial da linguagem de programação [Kof](https://github.com/KofLang/Kof4j).

Publicação: <https://koflang.github.io/Kof-Lang/>

## Sobre

Este repositório contém apenas o **site institucional** da Kof. A fonte da
verdade de conteúdo é sempre o repositório da linguagem
([KofLang/Kof4j](https://github.com/KofLang/Kof4j)) — nenhuma feature é
anunciada como disponível aqui sem estar confirmada lá.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + Vite + Tailwind v4)
- Deploy estático no GitHub Pages via GitHub Actions
  (`.github/workflows/deploy-pages.yml`), com prerender de todas as rotas

## Desenvolvimento

Você precisa de Node.js e npm — instale com
[nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone https://github.com/KofLang/Kof-Lang.git
cd Kof-Lang
npm i
npm run dev   # http://localhost:8080
```

Outros comandos:

```sh
npm run lint    # ESLint
npm run build   # build estático (saída em dist/client)
```

## Deploy

O workflow dispara automaticamente em push para `main`. O subcaminho do Pages
é detectado a partir do nome do repositório — se o repo se chamar
`<owner>.github.io`, o site é servido da raiz; caso contrário, de
`/<repo>/`. Para testar localmente:

```sh
GITHUB_PAGES_BASE=/Kof-Lang/ npm run build
npx serve dist/client
```
