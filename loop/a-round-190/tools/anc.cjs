const L = require('./lib.cjs'); const D = require('./ld.cjs');
(async () => {
  const b = await L.chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: D.VPS[375], deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    window.__a = [];
    const tick = () => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (ov) { const chain = []; for (let e = ov.parentElement; e && e !== document.documentElement; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.transform !== 'none' || cs.filter !== 'none' || cs.willChange !== 'auto' || cs.contain !== 'none' || cs.perspective !== 'none' || cs.backdropFilter !== 'none' || cs.containerType !== 'normal' || cs.translate !== 'none' || cs.scale !== 'none') chain.push({ tag: e.tagName, cls: String(e.className).slice(0, 80), tr: cs.transform.slice(0, 50), f: cs.filter, wc: cs.willChange, ct: cs.contain, op: cs.opacity, st: (e.getAttribute('style') || '').slice(0, 100) }); } window.__a.push({ t: Math.round(performance.now()), h: Math.round(ov.getBoundingClientRect().height), chain }); } requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  const pg = await ctx.newPage(); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(3000);
  const a = await pg.evaluate(() => window.__a);
  let last = ''; for (const f of a) { const k = JSON.stringify([f.h, f.chain]); if (k !== last) { console.log(f.t, k.slice(0, 900)); last = k; } }
  const path = await pg.evaluate(() => 'n/a');
  await b.close();
})();
