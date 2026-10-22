import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('console', (m) => logs.push(m.type() + ': ' + m.text().slice(0, 300))); p.on('pageerror', (e) => logs.push('pageerror: ' + e.message.slice(0, 500)));
const r = await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 60000 }); 
await p.waitForTimeout(8000);
console.log('status', r.status(), 'tracks', await p.$$eval('[data-track-id]', (e) => e.length));
await p.screenshot({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-round-79/peek.png' });
console.log(logs.slice(0, 30).join('\n')); await b.close();
