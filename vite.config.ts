// vite.config.ts
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

export default defineConfig({
  server: {
    port: 3000, // Change this to your desired port
  },
  plugins: [tanstackStart({ target: "netlify" }), tsConfigPaths()],
  ssr: {
    // Force these packages to be processed by Vite instead of Node.js
    // This allows Vite to handle the CSS imports properly
    noExternal: [
      "@platejs/math",
      "katex",
      // Include all platejs packages since they might import CSS
      /^@platejs\/.*/,
    ],
  },
  optimizeDeps: {
    include: ["katex"],
  },
});
