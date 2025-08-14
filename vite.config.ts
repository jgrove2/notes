// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [tanstackStart({ target: "node-server" }), tsConfigPaths()],
  resolve: {
    alias: {
      // Use local wrapper to avoid sourcemap issues
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Prefer Dart Sass implementation
        api: "modern-compiler",
      },
    },
  },
  ssr: {
    // Force these packages to be processed by Vite instead of Node.js
    // This allows Vite to handle the CSS imports properly and bundle ESM-only deps
    noExternal: [
      "@platejs/math",
      "katex",
      // Include all platejs packages since they might import CSS
      /^@platejs\/.*/,
      // Ensure ESM-only packages are bundled for SSR
      "use-file-picker",
      "react-lite-youtube-embed",
      "react-tweet",
    ],
  },
  optimizeDeps: {
    include: ["katex", "react-lite-youtube-embed", "react-tweet"],
  },
});
