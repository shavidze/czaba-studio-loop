import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "~": "/home/runner/czaba-project/czaba-tag-manager/src/renderer/src" } },
  test: {
    globals: true,
    environment: "jsdom",
    root: "/home/runner/czaba-project/tmp/tag-manager-loop/a-round-34",
    setupFiles: ["./qa-setup.ts"],
    include: ["qa-*.test.ts"],
    testTimeout: 60000,
  },
});
