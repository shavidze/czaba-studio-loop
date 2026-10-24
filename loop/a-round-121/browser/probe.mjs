import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
const r = await page.evaluate(() => ({
  grid: !!document.querySelector('[data-testid="arrangement-grid-control"]'),
  zoom: !!document.querySelector('[data-testid="arrangement-waveform-zoom"]'),
  env: !!document.querySelector('[data-testid="arrangement-envelope-toggle"]'),
  gridHtml: document.querySelector('[data-testid="arrangement-grid-control"]')?.outerHTML.slice(-400),
}));
await page.screenshot({ path: 'probe-1440.png' });
console.log(JSON.stringify({ r, errors }, null, 1));
await browser.close();
