import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
for (const u of ['/', '/store', '/']) { await p.goto(process.argv[2] + u, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => console.log('warn', e.message.slice(0, 80))); }
console.log('warm ok'); await b.close();
