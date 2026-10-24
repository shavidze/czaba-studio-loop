import { defineConfig, mergeConfig } from '/home/runner/czaba-project/store/node_modules/vitest/dist/config.js';
import base from '/home/runner/czaba-project/store/vitest.config.ts';
export default mergeConfig(base, defineConfig({ test: { include: ['/home/runner/czaba-project/tmp/studio-real-loop/b-round-147/probe/*.test.tsx'], dir: '/home/runner/czaba-project/tmp/studio-real-loop/b-round-147/probe' } }));
