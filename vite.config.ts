import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':       { target: 'http://localhost:5000', changeOrigin: true },
      '/restaurant': { target: 'http://localhost:5000', changeOrigin: true },
      '/employee':   { target: 'http://localhost:5000', changeOrigin: true },
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
