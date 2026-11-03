// C321 STUDIO-SMOKE-321 stop leg: data-playing false -> true -> false via the transport Stop button (Play is not a toggle).
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-321'; const res = {};
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = {}); const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 }); await page.waitForTimeout(800);
  await page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first().getByText(/^Stems/).first().click(); await page.waitForTimeout(250);
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click(); await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  const play = page.locator('[data-testid="arrangement-transport"] button[data-playing]').first();
  r.transportButtons = await page.locator('[data-testid="arrangement-transport"] button').evaluateAll((bs) => bs.map((b) => `${b.getAttribute('aria-label') ?? b.textContent.trim()}|${b.getAttribute('title') ?? ''}`));
  r.s0 = await play.getAttribute('data-playing'); await play.click(); await page.waitForTimeout(1500);
  r.s1 = await play.getAttribute('data-playing'); r.pos1 = (await page.getByTestId('arrangement-position').textContent()).trim();
  const stop = page.locator('[data-testid="arrangement-transport"] button').filter({ hasNot: page.locator('[data-playing]') }).and(page.getByRole('button', { name: /^Stop/ })).first();
  r.stopLabel = await stop.getAttribute('aria-label'); await stop.click(); await page.waitForTimeout(600);
  r.s2 = await play.getAttribute('data-playing'); r.pos2 = (await page.getByTestId('arrangement-position').textContent()).trim(); await page.waitForTimeout(700); r.pos3 = (await page.getByTestId('arrangement-position').textContent()).trim();
  await page.screenshot({ path: `${DIR}/shots/smoke-stopped-${vp}.png` }); await ctx.close();
}
writeFileSync(`${DIR}/stop321.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await browser.close();
