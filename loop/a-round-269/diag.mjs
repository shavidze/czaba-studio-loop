import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 180000 });
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(5000);
  const s = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? 'NO-STATUS');
  console.log(i * 5 + 5, 's:', s.slice(0, 120));
  if (s.includes('ready')) break;
}
await page.screenshot({ path: 'diag-1440.png' });
console.log(errors.slice(0, 10).join('\n'));
await browser.close();
