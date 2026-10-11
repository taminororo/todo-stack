import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": fileURLToPath(new URL("./", import.meta.url)),
      // packages/types をビルドしなくてもテストできるよう、ソースを直接読む（api の jest と同じ）
      "@todo/types": fileURLToPath(new URL("../../packages/types/src/index.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
});
