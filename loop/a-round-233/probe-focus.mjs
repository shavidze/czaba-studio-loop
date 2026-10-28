import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = {};
const id = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-testid') || a.tagName) + '|' + (a.getAttribute('aria-label') || '') : null; });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  const r = {};
  const focusOverview = async () => { await page.focus('[data-testid="arrangement-library-separator"]'); await page.keyboard.press('Tab'); return id(page); };
  r.docked_focus = await focusOverview();
  r.docked_tabOrder = [];
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); r.docked_tabOrder.push(await id(page)); }
  r.docked_focus2 = await focusOverview();
  await page.keyboard.press('Control+Alt+KeyO');
  await page.waitForTimeout(300);
  r.afterHide = await id(page);
  r.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
  await page.keyboard.press('Tab'); r.afterHideTab = await id(page);
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(300);
  r.afterShow = await id(page);
  // floating
  await page.click('[data-testid="arrangement-video-expand"]'); await page.waitForTimeout(500);
  r.floating = await page.evaluate(() => ({ placeholder: !!document.querySelector('[data-testid="arrangement-video-placeholder"]'), ret: !!document.querySelector('[data-testid="arrangement-video-placeholder-return"]') }));
  r.float_focus = await focusOverview();
  r.float_tabOrder = [];
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); r.float_tabOrder.push(await id(page)); }
  r.dockButtonsAfterOverview = await page.evaluate(() => {
    const ov = document.querySelector('[data-testid="arrangement-overview"]');
    const dock = document.querySelector('[data-testid="arrangement-video-dock"]');
    return [...dock.querySelectorAll('button')].filter((b) => ov.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).map((b) => (b.getAttribute('data-testid') || '') + (b.disabled ? ':disabled' : ''));
  });
  await page.screenshot({ path: `${out}/float-${w}x${h}.png` });
  r.errors = errors;
  res[`${w}x${h}`] = r;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/focus.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
