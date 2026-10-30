import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const [BASE, TAG] = process.argv.slice(2); const out = {}; const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  const st = () => page.evaluate(() => { const g = document.querySelector('[data-testid="arrangement-grid-control"]'); const b = [...document.querySelectorAll('button')].find((x) => /^Snap/.test(x.getAttribute('title') ?? '')); return { grid: g?.dataset.gridSeconds, paused: g?.dataset.snapPaused, snap: g?.dataset.snap, title: b?.getAttribute('title'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }; });
  await page.mouse.click(5, 5); await page.keyboard.press('g'); await page.waitForTimeout(250);
  const seq = [await st()];
  for (let k = 0; k < 4; k++) { await page.keyboard.press('1'); await page.waitForTimeout(150); }
  for (let k = 0; k < 14 && (await st()).paused !== 'true'; k++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); seq.push(await st()); }
  const paused = await st();
  await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-271/shots/${TAG}-paused-${w}x${h}.png` });
  await page.keyboard.press('g'); await page.waitForTimeout(200); const off = await st();
  out[`${w}x${h}`] = { first: seq[0], paused, off, steps: seq.length, errors }; await ctx.close();
}
writeFileSync(`/home/runner/czaba-project/tmp/studio-real-loop/c-round-271/paused-${TAG}.json`, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
