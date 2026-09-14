import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reuses the app's path aliases so tests import the same "@store/..." specifiers
// the source does. Node environment: the persisted-state logic under test is
// pure — it takes a string and returns state, no DOM or localStorage.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      globals: false,
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    },
  })
);
