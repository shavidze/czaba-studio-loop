import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
page.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 200)); });
const t0 = Date.now();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded', timeout: 120000 });
console.log('dcl', Date.now() - t0);
try {
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  console.log('scroller', Date.now() - t0);
} catch (e) { console.log('no scroller', String(e).slice(0, 100)); }
console.log(errs.slice(0, 15).join('\n'));
await page.screenshot({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-round-231/browser/diag.png' });
await browser.close();
