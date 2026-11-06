// B round 373 -> 374 baseline probe v2 (L29 state recipe for STATUS-LT12-BROWSER). Usage: node lt12-probe-v2.mjs <base> <out>
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const outPath = process.argv[3];
mkdirSync(dirname(outPath), { recursive: true });
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const st = () => page.getByTestId('arrangement-status').innerText().catch(() => null);
  const playing = () => page.locator('[data-playing]').first().getAttribute('data-playing').catch(() => null);
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
  await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  r.s1_afterAdd = await st();
  r.s1_activeElement = await page.evaluate(() => { const e = document.activeElement; return e ? `${e.tagName} role=${e.getAttribute('role')} inListbox=${!!e.closest('[role="listbox"]')}` : null; });
  await page.keyboard.press('Space'); await page.waitForTimeout(800); r.s1b_spaceInLibrary_playing = await playing();
  await page.getByRole('button', { name: 'Play', exact: true }).first().click(); await page.waitForTimeout(1000);
  r.s2_playing = await playing(); r.s2_status = await st();
  await page.keyboard.press('Control+Shift+Space'); await page.waitForTimeout(400);
  r.s3_afterCtrlShiftSpace = await st(); r.s3_playing = await playing();
  const strip = page.getByTestId('arrangement-bars-scrub-strip'); const bb = await strip.boundingBox(); r.stripBox = bb;
  await page.mouse.click(bb.x + 6 * 20 + 2, bb.y + Math.min(3, bb.height / 2)); await page.waitForTimeout(500);
  r.s4_stripClickWhilePlaying = await st(); r.s4_playing = await playing();
  await page.getByRole('button', { name: 'Stop', exact: true }).first().click(); await page.waitForTimeout(500);
  r.s5_afterStop = await st(); r.s5_playing = await playing();
  await page.mouse.click(bb.x + 6 * 20 + 2, bb.y + Math.min(3, bb.height / 2)); await page.waitForTimeout(500);
  r.s6_stripClickWhileStopped = await st(); r.s6_playing = await playing();
  await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  await ctx.close();
}
await browser.close(); writeFileSync(outPath, JSON.stringify(out, null, 1));
