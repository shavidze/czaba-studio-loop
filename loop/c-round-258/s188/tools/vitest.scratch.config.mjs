import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const store = '/home/runner/czaba-project/store';
const dir = process.env.SCRATCH_DIR;
const r = createRequire(`${store}/package.json`);
export default {
  root: store,
  esbuild: { jsx: 'automatic' },
  test: { globals: true, environment: 'jsdom', include: ['app/lib/__tests__/store-header-footer.test.tsx'] },
  resolve: {
    alias: [
      { find: /^~\/components\/layout\/Header$/, replacement: `${dir}/Header.tsx` },
      { find: /^~\/components\/layout\/Footer$/, replacement: `${dir}/Footer.tsx` },
      { find: /^lucide-react$/, replacement: r.resolve('lucide-react') },
      { find: /^@remix-run\/react$/, replacement: r.resolve('@remix-run/react') },
      { find: /^react-router-dom$/, replacement: r.resolve('react-router-dom') },
      { find: /^react-dom\/server$/, replacement: r.resolve('react-dom/server') },
      { find: /^react$/, replacement: r.resolve('react') },
      { find: /^react\/jsx-dev-runtime$/, replacement: r.resolve('react/jsx-dev-runtime') },
      { find: /^react\/jsx-runtime$/, replacement: r.resolve('react/jsx-runtime') },
      { find: '~', replacement: resolve(store, 'app') },
    ],
  },
};
