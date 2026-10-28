// C round 231: reproduce run-1 fold miss: name-button activations, marquee drag, lane click, then fold. usage: node c231f.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173'; const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const R = [];
const st = (page) => page.evaluate(() => ({ exp: document.querySelector('[data-track-id="music"] [data-testid="arrangement-track-fold"]').getAttribute('aria-expanded'), hints: [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].map((h) => h.closest('[data-track-id]').getAttribute('data-track-id')), active: document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName }));
(async () => {
  const b = await chromium.launch();
  for (const steps of [['names', 'marquee', 'click'], ['marquee', 'click'], ['names'], ['marquee']]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
    await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(1200);
    const hb = await page.getByTestId('arrangement-lane-empty-hint').boundingBox(); const y = hb.y + hb.height / 2;
    if (steps.includes('names')) for (const n of ['Stems', 'SFX', 'Video', 'Music']) { await page.getByRole('button', { name: `${n} — set as the active track`, exact: true }).click(); await sleep(300); }
    if (steps.includes('marquee')) { await page.mouse.move(hb.x + 20, y); await page.mouse.down(); await page.mouse.move(hb.x + 180, y, { steps: 12 }); await page.mouse.up(); await sleep(400); }
    if (steps.includes('click')) { await page.mouse.click(hb.x + 300, y); await sleep(300); }
    const before = await st(page);
    await page.locator('[data-track-id="music"] [data-testid="arrangement-track-fold"]').first().click(); await sleep(500);
    const after = await st(page);
    await page.screenshot({ path: path.join(outDir, `fold-${steps.join('-')}.png`) });
    R.push({ steps, before, after });
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(outDir, 'c231f.json'), JSON.stringify(R, null, 2)); console.log(JSON.stringify(R));
})();
