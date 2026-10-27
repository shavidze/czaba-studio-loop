// B round 203->204 planning: L1 runtime-hidden focusable probe. node tabprobe.cjs <port> <W> <label>
const F = require('./fl.cjs'); const path = require('path');
const PORT = process.argv[2]; const W = +process.argv[3]; const LABEL = process.argv[4] || 'head';
const H = W === 1440 ? 900 : W === 1280 ? 720 : 812;
const PAGES = (process.env.PAGES || '/,/store,/products/middle-east,/about,/free-downloads').split(',');
const probe = () => {
  const a = document.activeElement; if (!a || a === document.body) return null;
  let o = 1, vis = getComputedStyle(a).visibility, n = a;
  while (n && n.nodeType === 1) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
  const r = a.getBoundingClientRect();
  const clipped = (() => { let p = a.parentElement; while (p && p !== document.body) { const cs = getComputedStyle(p); if (cs.overflow !== 'visible' || cs.overflowY !== 'visible') { const pr = p.getBoundingClientRect(); if (pr.height < 1 || pr.width < 1 || r.bottom <= pr.top || r.top >= pr.bottom) return true; } p = p.parentElement; } return false; })();
  return { tag: a.tagName, name: (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), href: a.getAttribute('href'), eff: +o.toFixed(3), vis, clipped, box: [r.x, r.y, r.width, r.height].map((v) => +v.toFixed(1)), tabindex: a.getAttribute('tabindex') };
};
(async () => {
  const browser = await F.launch(); const R = { LABEL, W, pages: {} };
  for (const p of PAGES) {
    const { ctx, page } = await F.newPage(browser, W, H, {});
    await page.goto(`http://127.0.0.1:${PORT}${p}`, { waitUntil: 'load', timeout: 120000 }); await F.sleep(3500);
    await F.declineCookies(page); await F.sleep(400); await page.mouse.move(2, H - 2);
    const stops = []; let first = null;
    for (let i = 0; i < 90; i++) {
      await page.keyboard.press('Tab'); await F.sleep(250);
      let d = await page.evaluate(probe); if (!d) continue;
      const key = `${d.tag}|${d.name}|${d.box.join(',')}`; if (key === first) break; if (!first) first = key;
      if (d.eff < 0.99 || d.vis !== 'visible' || d.clipped) { await F.sleep(2000); const d2 = await page.evaluate(probe); d.after2s = d2 && { eff: d2.eff, vis: d2.vis, clipped: d2.clipped }; }
      d.i = i; stops.push(d);
    }
    R.pages[p] = { total: stops.length, hidden: stops.filter((s) => s.after2s && (s.after2s.eff < 0.99 || s.after2s.vis !== 'visible' || s.after2s.clipped)) };
    await ctx.close();
  }
  F.save(path.join(__dirname, '..', 'out', `tabprobe-${LABEL}-${W}.json`), R);
  for (const [p, v] of Object.entries(R.pages)) console.log(W, p, 'stops', v.total, 'hidden', v.hidden.map((s) => `${s.i}:${s.tag}:${s.name}:eff${s.after2s.eff}:${s.after2s.vis}:${s.after2s.clipped ? 'clip' : ''}`).join(' | '));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
