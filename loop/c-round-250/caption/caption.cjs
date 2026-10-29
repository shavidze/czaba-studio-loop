// C250: library Add caption ("Active track · playhead t") vs where Add lands. usage: node caption.cjs <base> <outDir>
const fs = require('node:fs'); const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [BASE, out] = [process.argv[2], process.argv[3]]; const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/studio-lab`); await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(900);
    await page.evaluate(() => document.activeElement?.blur());
    const s = () => page.evaluate(() => { const cap = document.querySelector('[data-testid="arrangement-library-playhead"]')?.closest('p'); return { caption: cap?.textContent.replace(/\s+/g, ' ').trim(), captionTitle: cap?.getAttribute('title'), ph: document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'), marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker'), clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => `${c.closest('[data-track-id]')?.getAttribute('data-track-id')}@${c.getAttribute('data-clip-start')}`), status: document.querySelector('[data-testid="arrangement-status"]').textContent, addTitle: [...document.querySelectorAll('button')].find((b) => b.textContent.trim().endsWith('Add'))?.getAttribute('title') }; });
    const g = await page.evaluate(() => { const r = document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect(); const pps = parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent); const l = document.querySelector('[data-track-id="sfx"]').getBoundingClientRect(); return { x: r.x + 3 * pps, y: l.y + l.height / 2 }; });
    await page.mouse.click(g.x, g.y); await sleep(900); const r = { afterClick: await s() };
    await page.keyboard.press('Space'); await sleep(1500); await page.keyboard.press('Space'); await sleep(400);
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await sleep(400);
    r.beforeAdd = await s();
    await page.screenshot({ path: path.join(out, `caption-before-add-${k}.png`) });
    await page.locator('button', { hasText: /^\s*\+?\s*Add$/ }).first().click(); await sleep(900);
    r.afterAdd = await s();
    await page.screenshot({ path: path.join(out, `caption-after-add-${k}.png`) });
    r.errors = errors; R[k] = r; await ctx.close(); console.log(k, JSON.stringify({ cap: r.beforeAdd.caption, ph: r.beforeAdd.ph, m: r.beforeAdd.marker, added: r.afterAdd.clips, st: r.afterAdd.status, addTitle: r.beforeAdd.addTitle }));
  }
  fs.writeFileSync(path.join(out, `caption-${BASE.endsWith('5174') ? 'head' : 'fix'}.json`), JSON.stringify(R, null, 1)); await browser.close();
})();
