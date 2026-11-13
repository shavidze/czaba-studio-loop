import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, outPath] = process.argv.slice(2);
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36' });
  await ctx.addInitScript(() => Object.defineProperty(Navigator.prototype, 'platform', { get: () => 'MacIntel' }));
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const b = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(b.x + 300, b.y + b.height / 2); await page.waitForTimeout(300);
  await page.evaluate(() => document.activeElement?.blur());
  const m = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker'));
  const before = await m();
  await page.keyboard.press('Alt+ArrowRight'); await page.waitForTimeout(250);
  const after = await m();
  out[`${w}x${h}`] = { platform: await page.evaluate(() => navigator.platform), before, after, errors };
  await ctx.close();
}
writeFileSync(outPath, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out));
