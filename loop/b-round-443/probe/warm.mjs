import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
console.log('warm ok'); await b.close();
