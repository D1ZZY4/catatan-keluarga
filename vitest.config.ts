import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".cache", "dist"],
    coverage: {
      provider: "v8",
      include: ["src/shared/**/*.ts", "src/shared/**/*.tsx"],
      exclude: ["src/shared/**/*.test.ts", "src/test/**"],
    },
  },
});
