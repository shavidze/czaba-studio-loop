// C250 neighbour: library drag-drop at 1280x720 diagnosis. usage: node drop.cjs <base> <outDir>
const fs = require('node:fs'); const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [BASE, out] = [process.argv[2], process.argv[3]]; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch(); const R = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    for (const attempt of [1, 2]) {
      const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`${BASE}/studio-lab`); await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(900);
      await page.evaluate(() => document.activeElement?.blur());
      const g = await page.evaluate(() => { const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect(); const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent); const s = document.querySelector('[data-track-id="sfx"]').getBoundingClientRect(); return { rx: r.x, pps, sy: s.y, sh: s.height }; });
      const row = page.locator('[data-source-id="demo-soft-impact"]').first(); await row.scrollIntoViewIfNeeded(); const src = await row.boundingBox();
      const k = `${vp.width}-a${attempt}`; const r = { src, g };
      await page.mouse.move(src.x + src.width / 2, src.y + src.height / 2); await page.mouse.down();
      await page.mouse.move(src.x + src.width / 2 + 40, src.y + src.height / 2 + 5, { steps: 6 });
      await page.mouse.move(g.rx + 9 * g.pps, g.sy + g.sh / 2, { steps: 20 }); await sleep(300);
      await page.screenshot({ path: path.join(out, `drop-mid-${k}.png`) });
      r.mid = await page.evaluate(() => ({ status: document.querySelector('[data-testid="arrangement-status"]').textContent, ghost: !!document.querySelector('[data-testid*="ghost"], [data-testid*="drop"]') }));
      await page.mouse.up(); await sleep(900);
      r.after = await page.evaluate(() => ({ clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => `${c.closest('[data-track-id]')?.getAttribute('data-track-id')}@${c.getAttribute('data-clip-start')}`), status: document.querySelector('[data-testid="arrangement-status"]').textContent, active: document.activeElement?.getAttribute('data-testid') }));
      r.errors = errors; R[k] = r; await page.screenshot({ path: path.join(out, `drop-after-${k}.png`) }); await ctx.close();
      console.log(k, JSON.stringify(r.after));
    }
  }
  fs.writeFileSync(path.join(out, 'drop.json'), JSON.stringify(R, null, 1)); await browser.close();
})();
