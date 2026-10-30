import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, outPath] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const out = {};
const marker = (p) => p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker'));
const status = (p) => p.evaluate(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim());
const fire = (p, init) => p.evaluate((init) => {
  const d = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ', code: 'Space', ...init });
  const np = document.body.dispatchEvent(d);
  const u = new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: ' ', code: 'Space', ...init });
  const npUp = document.body.dispatchEvent(u);
  return { np, npUp };
}, init);
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  const r = (out[`${w}x${h}`] = {});
  for (const [name, init] of [['ctrlShiftAltGraphNoAlt', { ctrlKey: true, shiftKey: true, modifierAltGraph: true }], ['plainCtrlShift', { ctrlKey: true, shiftKey: true }]]) {
    await page.keyboard.press('Home'); await page.waitForTimeout(300);
    await page.keyboard.press('Space'); await page.waitForTimeout(1500);
    const before = await marker(page);
    const ev = await fire(page, init);
    await page.waitForTimeout(300);
    const after = await marker(page);
    const st = await status(page);
    await page.keyboard.press('Space'); await page.waitForTimeout(400);
    r[name] = { before, after, ev, status: st, stoppedMarker: await marker(page) };
  }
  r.errors = errors;
  await ctx.close();
}
writeFileSync(outPath, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out));
