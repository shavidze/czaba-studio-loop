import { resolve } from 'node:path';
const STORE = '/home/runner/czaba-project/store';
const MUTANT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-218/mutant/mp3-encoder.client.no-dispose.ts';
const ORIG = '/home/runner/czaba-project/store/app/lib/arrangement/mp3-encoder.client.ts';
export default {
  plugins: [{
    name: 'c-r218-mutant-redirect',
    enforce: 'pre',
    async resolveId(source, importer, opts) {
      if (importer && importer.includes('__tests__/mp3-encoder.test') && source.endsWith('mp3-encoder.client')) return MUTANT;
      if (importer === MUTANT) return this.resolve(source, ORIG, { ...opts, skipSelf: true });
      return null;
    },
  }],
  test: { globals: true, environment: 'jsdom', include: ['app/lib/arrangement/__tests__/mp3-encoder.test.ts'], root: STORE },
  resolve: { alias: { '~': resolve(STORE, 'app') } },
};
