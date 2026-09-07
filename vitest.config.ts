import { defineConfig } from "vitest/config";

export default defineConfig({
  // An inline (empty) PostCSS config stops Vite from discovering
  // postcss.config.mjs, whose Next-specific plugin string form Vite rejects.
  css: { postcss: {} },
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
  },
});
