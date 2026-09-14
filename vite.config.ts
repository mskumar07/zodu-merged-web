import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";

/**
 * Identity of this build.
 *
 * The value is baked into the bundle as `__BUILD_ID__` AND written to
 * `version.json`, so a tab that has been open across a deploy can compare the
 * id it is running against the id currently on the server. The git SHA is used
 * when available so two builds of the same commit match; otherwise the build
 * timestamp keeps them distinct.
 */
function resolveBuildId(): string {
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return String(Date.now());
  }
}

const BUILD_ID = resolveBuildId();

/**
 * Emits `version.json` beside index.html. It must be served with
 * `Cache-Control: no-cache` (as must index.html) or the poll below reads a
 * cached copy and no deploy is ever noticed — see docs/deploy-cache-headers.md.
 */
function buildVersionManifest(): Plugin {
  return {
    name: "zodu-build-version-manifest",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ buildId: BUILD_ID, builtAt: new Date().toISOString() }),
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), buildVersionManifest()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    proxy: {
      '/auth':       { target: 'http://localhost:5001', changeOrigin: true },
      '/retail':     { target: 'http://localhost:5001', changeOrigin: true },
      '^/restaurant/': { target: 'http://localhost:5001', changeOrigin: true },
      '/employee':   { target: 'http://localhost:5001', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@components": "/src/components",
      "@layouts": "/src/layouts",
      "@pages": "/src/pages",
      "@hooks": "/src/hooks",
      "@store": "/src/store",
      "@utils": "/src/utils", // Z-T71
      "@assets": "/src/assets", // Z-T71
      "@types": "/src/types", // Z-T71
      "@services": "/src/store/services", // Z-T71
      "@config": "/src/config", // Z-T71
      "@Services": "/src/Services", // Z-T71
    },
  },
});
