import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const store = '/home/runner/czaba-project/store';
const dir = process.env.SCRATCH_DIR;
const r = createRequire(`${store}/package.json`);
export default {
  root: store,
  esbuild: { jsx: 'automatic' },
  test: { globals: true, environment: 'jsdom', include: ['app/lib/__tests__/audio-preview-player.test.tsx'] },
  resolve: {
    alias: [
      { find: /^~\/components\/audio\/AudioPlayer$/, replacement: `${dir}/AudioPlayer.tsx` },
      { find: /^~\/components\/audio\/AudioPreviewButton$/, replacement: `${dir}/AudioPreviewButton.tsx` },
      { find: /^lucide-react$/, replacement: r.resolve('lucide-react') },
      { find: /^@remix-run\/react$/, replacement: r.resolve('@remix-run/react') },
      { find: /^react$/, replacement: r.resolve('react') },
      { find: /^react\/jsx-dev-runtime$/, replacement: r.resolve('react/jsx-dev-runtime') },
      { find: /^react\/jsx-runtime$/, replacement: r.resolve('react/jsx-runtime') },
      { find: '~', replacement: resolve(store, 'app') },
    ],
  },
};
