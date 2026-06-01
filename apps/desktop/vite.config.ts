import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  resolve: {
    alias: {
      // Resolve straight to TS source instead of the compiled CJS dist so
      // Rollup's production build can statically detect named exports
      // (enums compiled to CJS confuse its named-export analysis).
      "@epms/shared": path.resolve(__dirname, "../../packages/shared/src/index.ts"),
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: "electron/preload.ts",
      },
      renderer: {},
    }),
  ],
});
