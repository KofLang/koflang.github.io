import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig, loadEnv, mergeConfig, type UserConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Deploy padrão: GitHub Pages — build 100% estático (prerender do TanStack
// Start) sem o plugin do Nitro; a saída publicável fica em dist/client.
// Para Cloudflare (SSR): NITRO_PRESET=cloudflare-module npm run build
const nitroPreset = process.env.NITRO_PRESET;

// Sites de projeto no Pages são servidos sob /<repo>/; sites de
// usuário/organização (<owner>.github.io) servem da raiz.
const basePath = process.env.GITHUB_PAGES_BASE || "/";

const nitroPlugin = async () => {
  const { nitro } = await import("nitro/vite");
  return nitro({ defaultPreset: nitroPreset });
};

const staticPages = [
  "/",
  "/about",
  "/docs",
  "/download",
  "/language",
  "/learn",
  "/roadmap",
  "/standard-library",
  "/targets",
  "/web",
].map((path) => ({ path }));

export default defineConfig(async ({ command, mode }) => {
  const plugins = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      // Prerender só no build estático (Pages); com Nitro/SSR o preview
      // server do prerender não encontra o bundle nesta versão.
      ...(nitroPreset
        ? {}
        : {
            pages: staticPages,
            prerender: { enabled: true, crawlLinks: true, failOnError: true },
          }),
    }),
  ];

  if (command === "build" && nitroPreset) {
    plugins.push(await nitroPlugin());
  }

  const viteReact = (await import("@vitejs/plugin-react")).default;
  plugins.push(viteReact());

  const envDefine: Record<string, string> = {};
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "VITE_"))) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  let config: UserConfig = {
    base: basePath,
    define: envDefine,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
  };

  config = mergeConfig(config, {
    server: {
      watch: {
        awaitWriteFinish: {
          stabilityThreshold: 1000,
          pollInterval: 100,
        },
      },
    },
  });

  return config;
});
