const L = require('./lib.cjs'); const D = require('./ld.cjs');
(async () => {
  const b = await L.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: D.VPS[375], deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    window.__p = { shifts: [], fr: [] };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__p.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: (e.sources || []).map((s) => ({ n: s.node && s.node.className ? String(s.node.className).slice(0, 40) : String(s.node && s.node.nodeName), p: [s.previousRect.x, s.previousRect.y, s.previousRect.width, s.previousRect.height], c: [s.currentRect.x, s.currentRect.y, s.currentRect.width, s.currentRect.height] })) }); }).observe({ type: 'layout-shift', buffered: true });
    const tick = () => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (ov) { const g = ov.children[2]; const r = g.getBoundingClientRect(); const cs = getComputedStyle(g); const o = ov.getBoundingClientRect(); window.__p.fr.push({ t: Math.round(performance.now()), g: [r.x, r.y, r.width, r.height].map(Math.round), tr: cs.transform.slice(0, 40), tl: cs.translate, op: cs.opacity, wc: cs.willChange, ov: [o.width, o.height], ovop: getComputedStyle(ov).opacity, ovst: ov.getAttribute('style'), gst: g.getAttribute('style').replace(/background[^;]*;/, '').slice(0, 160) }); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const pg = await ctx.newPage(); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(3500);
  const r = await pg.evaluate(() => window.__p);
  const big = r.shifts.filter((s) => s.v > 0.005); console.log(JSON.stringify(big));
  const t = big[0] ? big[0].t : 0; for (const f of r.fr.filter((f) => Math.abs(f.t - t) < 120 || f === r.fr[0])) console.log(JSON.stringify(f));
  await b.close();
})();
