import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
for (let i = 0; i < 12; i++) { await p.waitForTimeout(5000); const s = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '(no status) ' + document.body.innerText.slice(0, 200)); console.log(i, s); if (/ready/i.test(s)) break; }
await p.screenshot({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-round-266/diag.png' });
console.log(JSON.stringify(errs.slice(0, 10), null, 1)); await b.close();
