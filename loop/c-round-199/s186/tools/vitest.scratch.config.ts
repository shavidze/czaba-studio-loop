import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const store = '/home/runner/czaba-project/store';
const startRoute = process.env.ROUTE_UNDER_TEST;

const storeRequire = createRequire(`${store}/package.json`);

export default {
  root: store,
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['app/lib/__tests__/product-handle-route.test.tsx'],
  },
  resolve: {
    alias: [
      { find: /^~\/routes\/products\.\$handle$/, replacement: startRoute },
      { find: /^@remix-run\/node$/, replacement: storeRequire.resolve('@remix-run/node') },
      { find: /^@remix-run\/react$/, replacement: storeRequire.resolve('@remix-run/react') },
      { find: '~', replacement: resolve(store, 'app') },
    ],
  },
};
