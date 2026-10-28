import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = {};
const id = (page) => page.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute('data-testid') || a.tagName) + '|' + (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 20)) : null; });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  const r = {};
  const ovHidden = () => page.evaluate(() => !document.querySelector('[data-testid="arrangement-overview"]'));
  await page.focus('[data-testid="arrangement-library-separator"]'); await page.keyboard.press('Tab');
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
  r.hide = await id(page);
  await page.keyboard.press('Shift+Tab'); r.shiftTab = await id(page);
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200); r.showFromSeparator = [await id(page), await ovHidden()];
  // play button focus
  const play = page.getByRole('button', { name: /^Play/ }).first();
  await play.focus(); const before = await id(page);
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
  r.playHide = [before, await id(page), await ovHidden()];
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
  r.playShow = [await id(page), await ovHidden()];
  // clip focus: add a clip then focus it
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const clip = await page.$('[data-clip-id]');
  r.clipExists = !!clip;
  if (clip) {
    const focusable = await page.evaluate(() => { const c = document.querySelector('[data-clip-id]'); const t = c.matches('[tabindex]') ? c : c.querySelector('[tabindex]'); if (t) { t.focus(); } return document.activeElement?.getAttribute('data-testid') || document.activeElement?.tagName; });
    r.clipFocus = focusable;
    await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
    r.clipHide = [await id(page), await ovHidden()];
    await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
    r.clipShow = [await id(page), await ovHidden()];
  }
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
  r.bodyHide = [await id(page), await ovHidden()];
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(200);
  r.errors = errors;
  res[`${w}x${h}`] = r;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/focus2.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
