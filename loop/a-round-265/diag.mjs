import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 300))); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
await p.waitForTimeout(15000);
console.log(JSON.stringify({ status: await p.locator('[data-testid="arrangement-status"]').first().textContent().catch(() => 'none'), opts: await p.getByRole('option').count(), errs }, null, 1));
await p.screenshot({ path: 'a-round-265/diag.png' }); await b.close();
