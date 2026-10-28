import { resolve } from 'node:path';
const STORE = '/home/runner/czaba-project/store';
const PROBE = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-221/probe/lock-ref.json';
export default {
  plugins: [{ name: 'c-r221-lock-redirect', enforce: 'pre',
    transform(code, id) {
      if (!id.includes('__tests__/third-party-licenses.test.ts')) return null;
      const from = "readJsonFile(join(STORE_ROOT, 'package-lock.json'))";
      if (!code.includes(from)) throw new Error('probe anchor missing');
      return code.replace(from, 'readJsonFile(' + JSON.stringify(PROBE) + ')');
    } }],
  test: { environment: 'jsdom', include: ['app/lib/__tests__/third-party-licenses.test.ts'], root: STORE },
  resolve: { alias: { '~': resolve(STORE, 'app') } },
};
