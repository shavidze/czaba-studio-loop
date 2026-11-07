// C320 probe: after a range WAV export download, does Escape close the export dialog? N cycles per build at 1280x720.
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const [BASE, TAG, N] = [process.argv[2], process.argv[3], Number(process.argv[4] ?? 5)];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true }); const page = await ctx.newPage();
await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' }); await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(800);
await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
const clip = await page.locator('[data-clip-id]').first().boundingBox(); const y = clip.y + clip.height * 0.7;
await page.mouse.move(clip.x + 100, y); await page.mouse.down(); await page.mouse.move(clip.x + 333, y, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(400);
const out = [];
for (let i = 0; i < N; i++) {
  await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(700);
  await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
  await page.locator('input[name="arrangement-export-scope"][data-testid$="range"]').click().catch(() => {});
  const dl = page.waitForEvent('download', { timeout: 120000 }); const t0 = Date.now();
  await page.getByRole('button', { name: 'Export WAV', exact: true }).click(); await dl; const tDl = Date.now() - t0;
  const states = [];
  for (const wait of [0, 100, 500]) { await page.waitForTimeout(wait); states.push(await page.evaluate(() => { const d = document.querySelector('[role="dialog"][aria-labelledby="arrangement-export-title"]'); return d ? `open:${(d.textContent ?? '').replace(/\s+/g, ' ').slice(0, 80)}` : 'closed'; })); }
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const after = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-labelledby="arrangement-export-title"]'));
  out.push({ i, tDl, states, openAfterEsc: after, active: await page.evaluate(() => document.activeElement?.tagName + '|' + (document.activeElement?.textContent ?? '').slice(0, 30)) });
  if (after) { await page.keyboard.press('Escape'); await page.waitForTimeout(800); }
}
writeFileSync(`/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/out/b2${TAG}.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await browser.close();
