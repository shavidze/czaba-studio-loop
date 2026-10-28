// C round 231: range gesture with content vs empty, and fold after gesture+click. usage: node c231c.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173'; const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const R = {};
const info = (page) => page.evaluate(() => ({ range: document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null, rangeEls: document.querySelectorAll('[data-range-start]').length, pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent, hints: [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].map((h) => h.closest('[data-track-id]').getAttribute('data-track-id')), musicFold: document.querySelector('[data-track-id="music"] [data-testid="arrangement-track-fold"]')?.getAttribute('aria-expanded'), clips: document.querySelectorAll('[data-clip-id]').length }));
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = (R[k] = {});
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage();
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(1200);
    const hb = await page.getByTestId('arrangement-lane-empty-hint').boundingBox();
    const y = hb.y + hb.height / 2;
    // click through the hint text
    await page.mouse.click(hb.x + 100, y); await sleep(400); r.clickThroughHint = await info(page);
    // fold after a click
    await page.locator('[data-track-id="music"] [data-testid="arrangement-track-fold"]').click(); await sleep(500); r.foldAfterClick = await info(page);
    await page.locator('[data-track-id="music"] [data-testid="arrangement-track-fold"]').click(); await sleep(500); r.unfold = await info(page);
    // add a clip on SFX so content exists, then drag on Music lane
    await page.getByRole('button', { name: 'SFX — set as the active track', exact: true }).click(); await sleep(200);
    await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(1500);
    r.afterSfxAdd = await info(page);
    await page.getByRole('button', { name: 'Music — set as the active track', exact: true }).click(); await sleep(200);
    const mb = await page.locator('[data-track-id="music"]').boundingBox();
    await page.mouse.move(hb.x + 30, mb.y + mb.height / 2); await page.mouse.down(); await page.mouse.move(hb.x + 190, mb.y + mb.height / 2, { steps: 15 }); await page.mouse.up(); await sleep(500);
    r.dragWithContent = await info(page);
    await page.screenshot({ path: path.join(outDir, `range-with-content-${k}.png`) });
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(outDir, 'c231c.json'), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R, null, 1));
})();
