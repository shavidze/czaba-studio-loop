const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path'); const fs = require('fs');
const TAG = process.argv[2]; const SH = path.join(__dirname, '..', 'shots'); const out = [];
(async () => {
  const b = await L.chromium.launch({ headless: true });
  { const c = await b.newContext(); const p = await c.newPage(); await p.goto(L.BASE + '/', { waitUntil: 'load' }); await c.close(); }
  for (const W of [375, 1440]) for (const at of [80, 250]) {
    const { ctx, page } = await D.fresh(b, W); await page.goto(L.BASE + '/', { waitUntil: 'commit' });
    await D.waitIns(page, 15000); await page.waitForFunction((a) => performance.now() - window.__ld.ins[0] >= a, at, { polling: 'raf' });
    const t0 = await D.sinceIns(page); const f = path.join(SH, `early-${TAG}-${W}-${at}.png`); await page.screenshot({ path: f }); const t1 = await D.sinceIns(page);
    const info = await page.evaluate(() => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (!ov) return { ov: false }; const r = ov.getBoundingClientRect(); const s = [...ov.querySelectorAll('span')].find((x) => x.textContent.trim() === 'CZABA').getBoundingClientRect(); const hdr = document.querySelector('header'); const w = document.querySelector('.page-transition-wrapper'); return { ov: true, ovRect: [r.y, r.height].map(Math.round), logoY: Math.round(s.y + s.height / 2), parent: ov.parentElement.className || ov.parentElement.tagName, headerInsideWrapper: !!(w && hdr && w.contains(hdr)), wrapperOpacity: w ? getComputedStyle(w).opacity : null }; });
    const row = { TAG, W, at, shotBetweenMs: [Math.round(t0), Math.round(t1)], ...info }; out.push(row); console.log(JSON.stringify(row)); await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(__dirname, '..', 'out', `early-${TAG}.json`), JSON.stringify(out, null, 2));
})();
