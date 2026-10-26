// C round 193 — run a test file located in a scratch tree (TH2 under m2). SCRATCH_ROOT=<scratch dir containing app/>, TEST_FILE=<abs path>
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const store = '/home/runner/czaba-project/store';
const r = createRequire(`${store}/package.json`);
export default {
  root: store,
  esbuild: { jsx: 'automatic' },
  server: { fs: { strict: false } },
  test: { globals: true, environment: 'jsdom', include: [process.env.TEST_FILE], dir: '/' },
  resolve: { alias: [
    { find: /^react-dom\/server$/, replacement: r.resolve('react-dom/server') },
    { find: /^react-dom$/, replacement: r.resolve('react-dom') },
    { find: /^react$/, replacement: r.resolve('react') },
    { find: /^react\/jsx-dev-runtime$/, replacement: r.resolve('react/jsx-dev-runtime') },
    { find: /^react\/jsx-runtime$/, replacement: r.resolve('react/jsx-runtime') },
    { find: '~', replacement: resolve(process.env.SCRATCH_ROOT, 'app') } ] },
};
