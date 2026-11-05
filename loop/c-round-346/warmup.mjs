import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 240000 });
await p
  .waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 })
  .catch(() => console.log('warm timeout'));
console.log('status:', await p.locator('[data-testid="arrangement-status"]').textContent().catch(() => null));
await b.close();
