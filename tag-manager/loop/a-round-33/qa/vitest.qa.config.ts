import { resolve } from "path";
import react from "/home/runner/czaba-project/czaba-tag-manager/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "/home/runner/czaba-project/czaba-tag-manager/node_modules/vitest/dist/config.js";
export default defineConfig({
  root: "/home/runner/czaba-project/czaba-tag-manager",
  plugins: [react()],
  resolve: { alias: { "~": resolve("/home/runner/czaba-project/czaba-tag-manager", "src/renderer/src") } },
  server: { fs: { strict: false } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["/home/runner/czaba-project/czaba-tag-manager/tests/renderer/setup.ts"],
    include: ["/home/runner/work/czaba-studio-loop/czaba-studio-loop/tag-manager/loop/a-round-33/qa/qa-d40.test.ts"],
  },
});
