import { loadConfigFromFile, mergeConfig } from '/home/runner/czaba-project/store/node_modules/vite/dist/node/index.js';
const r = await loadConfigFromFile({ command: 'serve', mode: 'development' }, '/home/runner/czaba-project/store/vite.config.ts');
export default mergeConfig(r.config, { cacheDir: '/tmp/c479-vite-cache', server: { port: 5175, strictPort: true } });
