import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Footer, Header } from "@/components/kof/SiteChrome";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para a home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado do nosso lado. Você pode tentar atualizar ou voltar para a home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Voltar para a home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Kof — Uma linguagem. Um compilador. Vários mundos.",
      },
      {
        name: "description",
        content:
          "Kof é uma linguagem de programação moderna, estaticamente tipada e compilada para JVM, Native, Script e Web. Menos código. Mais intenção.",
      },
      {
        name: "keywords",
        content:
          "Kof, KofLang, linguagem de programação, compilador, JVM, native, statically typed, programação, código, intenção",
      },
      { name: "author", content: "Kof Language Project" },
      { name: "robots", content: "index, follow" },

      // Open Graph — Facebook / LinkedIn / WhatsApp
      { property: "og:title", content: "Kof — Uma linguagem. Um compilador. Vários mundos." },
      {
        property: "og:description",
        content:
          "Linguagem moderna, estaticamente tipada, compilada para JVM, Native, Script e Web. Menos código. Mais intenção.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://koflang.github.io/" },
      { property: "og:site_name", content: "Kof" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "https://koflang.github.io/kof.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Kof — linguagem de programação" },

      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@KofLang" },
      { name: "twitter:creator", content: "@KofLang" },
      { name: "twitter:title", content: "Kof — Uma linguagem. Um compilador. Vários mundos." },
      {
        name: "twitter:description",
        content:
          "Linguagem moderna, estaticamente tipada, compilada para JVM, Native, Script e Web. Menos código. Mais intenção.",
      },
      { name: "twitter:image", content: "https://koflang.github.io/kof.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/kof.png?v=14", type: "image/png" },
      { rel: "icon", href: "/favicon.ico?v=14", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/kof.png?v=14" },
      { rel: "canonical", href: "https://koflang.github.io/" },

      // Google Search Console — substitua pelo seu código real
      {
        name: "google-site-verification",
        content: "SEU_CODIGO_VERIFICACAO_AQUI",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </div>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
