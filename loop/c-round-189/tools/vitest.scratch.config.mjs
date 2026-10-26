// C round 189 — run T1 against a scratch SpotlightLoader (start copy or mutant). SCRATCH_FILE=<abs path>
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const store = '/home/runner/czaba-project/store';
const r = createRequire(`${store}/package.json`);
export default {
  root: store,
  esbuild: { jsx: 'automatic' },
  test: { globals: true, environment: 'jsdom', include: ['app/lib/__tests__/store-entrance-loader.test.tsx'] },
  resolve: {
    alias: [
      { find: /^~\/components\/loading\/SpotlightLoader$/, replacement: process.env.SCRATCH_FILE },
      { find: /^framer-motion$/, replacement: r.resolve('framer-motion') },
      { find: /^react-dom\/server$/, replacement: r.resolve('react-dom/server') },
      { find: /^react$/, replacement: r.resolve('react') },
      { find: /^react\/jsx-dev-runtime$/, replacement: r.resolve('react/jsx-dev-runtime') },
      { find: /^react\/jsx-runtime$/, replacement: r.resolve('react/jsx-runtime') },
      { find: '~', replacement: resolve(store, 'app') },
    ],
  },
};
