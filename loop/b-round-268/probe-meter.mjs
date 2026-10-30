import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const outPath = process.argv[3];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const out = { base, startedUtc: new Date().toISOString() };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = (out[`${w}x${h}`] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByTestId('arrangement-envelope-toggle').click();
  await page.waitForTimeout(300);
  const ed = await page.getByTestId('arrangement-clip-envelope-editor').first().boundingBox();
  await page.mouse.dblclick(ed.x + 20, ed.y + 5);
  await page.waitForTimeout(300);
  await page.mouse.dblclick(ed.x + 220, ed.y + 5);
  await page.waitForTimeout(300);
  const second = page.getByTestId('arrangement-clip-envelope-point').nth(1);
  const sb = await second.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2 + 10, { steps: 2 });
  await page.mouse.move(sb.x + sb.width / 2, sb.y + 400, { steps: 4 });
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.mouse.dblclick(ed.x + 420, ed.y + 5);
  await page.waitForTimeout(300);
  r.envelope = await page.evaluate(() => document.querySelector('[data-clip-id]')?.getAttribute('data-envelope'));
  r.clipLane = await page.evaluate(() => document.querySelector('[data-clip-id]')?.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null);
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Home');
  await page.waitForTimeout(300);
  await page.keyboard.press('Space');
  const t0 = Date.now();
  const samples = [];
  while (Date.now() - t0 < 11500) {
    samples.push(await page.evaluate(() => ({
      pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent?.trim() ?? null,
      meters: [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => m.getAttribute('data-level-db')),
    })));
    await page.waitForTimeout(250);
  }
  await page.keyboard.press('Space');
  r.samples = samples;
  r.errors = errors;
  await ctx.close();
}
out.finishedUtc = new Date().toISOString();
writeFileSync(outPath, JSON.stringify(out, null, 1));
await browser.close();
console.log('done');
