// C round 231 (variant of c231g with dragleave/keydown log): does the lane hint return after a library drag that ends without a drop? usage: node c231g.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173'; const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const R = {};
const st = (page) => page.evaluate(() => ({ hints: [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].map((h) => h.closest('[data-track-id]').getAttribute('data-track-id')), clips: document.querySelectorAll('[data-clip-id]').length, ghosts: [...document.querySelectorAll('[data-testid*="ghost"]')].map((g) => g.getAttribute('data-testid')), dropText: [...document.querySelectorAll('[data-track-id] p')].map((p) => p.textContent).filter((t) => /Drop|drop/.test(t)), musicFold: document.querySelector('[data-track-id="music"] [data-testid="arrangement-track-fold"]').getAttribute('aria-expanded'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, events: window.__ev }));
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }]) {
    const k = `${vp.width}x${vp.height}`; R[k] = {};
    for (const v of ['A-escape', 'B-drop-on-library']) {
      const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage();
      await page.addInitScript(() => { window.__ev = []; for (const t of ['dragstart', 'dragend', 'drop', 'dragleave', 'keydown']) window.addEventListener(t, (e) => window.__ev.push(+performance.now().toFixed(0) + ' ' + t + ':' + (e.key || e.target?.getAttribute?.('data-testid') || e.target?.tagName)), true); });
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
      await page.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 }); await sleep(1200);
      const r = (R[k][v] = { start: await st(page) });
      const o = await page.locator('[role="option"]').first().boundingBox();
      const hb = await page.getByTestId('arrangement-lane-empty-hint').boundingBox();
      const sb = await page.locator('[data-track-id="stems"]').boundingBox();
      const ox = o.x + o.width / 2, oy = o.y + o.height / 2;
      await page.mouse.move(ox, oy); await page.mouse.down();
      await page.mouse.move(ox + 30, oy, { steps: 5 });
      await page.mouse.move(hb.x + 200, hb.y + hb.height / 2, { steps: 20 }); await sleep(250);
      r.overMusic = await st(page);
      if (v === 'A-escape') { await page.keyboard.press('Escape'); await sleep(200); await page.mouse.move(ox, oy, { steps: 15 }); }
      if (v === 'B-drop-on-library') { await page.mouse.move(ox, oy + 120, { steps: 15 }); }
      if (v === 'C-via-stems-to-library') { await page.mouse.move(hb.x + 200, sb.y + sb.height / 2, { steps: 10 }); await sleep(200); r.overStems = await st(page); await page.mouse.move(ox, oy, { steps: 15 }); }
      await page.mouse.up(); await sleep(800);
      r.afterRelease = await st(page);
      await page.screenshot({ path: path.join(outDir, `cancel-${v}-${k}.png`) });
      // recovery: click an empty lane spot on Stems lane far right
      await page.mouse.click(hb.x + 400, sb.y + sb.height / 2); await sleep(500);
      r.afterLaneClick = await st(page);
      await page.getByRole('button', { name: 'Music — set as the active track', exact: true }).click(); await sleep(400);
      r.afterMusicReactivate = await st(page);
      await ctx.close();
    }
  }
  await b.close(); fs.writeFileSync(path.join(outDir, 'c231g.json'), JSON.stringify(R, null, 2));
  for (const [k, vv] of Object.entries(R)) for (const [v, r] of Object.entries(vv)) console.log(k, v, JSON.stringify({ over: r.overMusic.hints, overStems: r.overStems?.hints, rel: [r.afterRelease.hints, r.afterRelease.clips, r.afterRelease.ghosts, r.afterRelease.dropText, r.afterRelease.events], click: [r.afterLaneClick.hints, r.afterLaneClick.clips], react: r.afterMusicReactivate.hints }));
})();
