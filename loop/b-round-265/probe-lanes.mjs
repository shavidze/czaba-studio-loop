import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch(); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 });
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => ({ id: e.getAttribute('data-track-id'), tag: e.tagName, testid: e.getAttribute('data-testid'), grid: e.querySelectorAll('[data-grid-seconds]').length, gridNoTestid: e.querySelectorAll('[data-grid-seconds]:not([data-testid])').length, gridTestids: [...e.querySelectorAll('[data-grid-seconds][data-testid]')].map((g) => g.getAttribute('data-testid')), h: Math.round(e.getBoundingClientRect().height) })))));
await browser.close();
