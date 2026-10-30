import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5174/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('Shift+Slash'); await page.waitForTimeout(600);
  out[`${w}x${h}`] = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    if (!d) return { dialog: false };
    const r = d.getBoundingClientRect();
    const scrollers = [d, ...d.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 1 && getComputedStyle(e).overflowY !== 'visible').map((e) => ({ tag: e.tagName, sh: e.scrollHeight, ch: e.clientHeight, testid: e.getAttribute('data-testid') }));
    const rows = d.querySelectorAll('tr, li, [role="row"]').length;
    const overflowX = [...d.querySelectorAll('*')].filter((e) => e.getBoundingClientRect().right > r.right + 0.5).length;
    return { dialog: true, label: d.getAttribute('aria-label') ?? d.getAttribute('aria-labelledby'), box: { x: r.x, y: r.y, w: r.width, h: r.height }, scrollers, rows, overflowX };
  });
  await page.screenshot({ path: `c-round-265/k-head-sheet-head-${w}x${h}.png` });
  await ctx.close();
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
await browser.close();
