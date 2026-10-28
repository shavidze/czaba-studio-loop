import { defineConfig } from 'vitest/config';
export default defineConfig({
  root: '/home/runner/czaba-project/tmp/studio-real-loop/a-round-224',
  test: { include: ['replay/**/*.test.ts'], environment: 'node' },
});
