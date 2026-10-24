// C round 131 LAYOUT: boxes before vs after the longest V message (V6 + V7 batch). node longmsg.cjs <1440|1280>
const W = +process.argv[2] || 1440;
const X = require('./lib122.cjs'); const { L, sleep } = X; const D6 = require('./d6fns.cjs');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await L.launch(); const net = []; const res = { vp: W };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `longmsg-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300);
    const sb = () => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-status]'); const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: r.x, y: r.y, w: r.width, h: r.height, sw: e.scrollWidth, cw: e.clientWidth, ws: cs.whiteSpace, of: cs.overflow, to: cs.textOverflow, docSW: document.documentElement.scrollWidth, vw: innerWidth }; });
    const before = await p.evaluate(D6.collect, '.studio-container'); res.sBefore = await sb();
    await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles([L.MEDIA + 'tone-2s.wav', path.join(__dirname, '..', 'media', 'doc.pdf')]);
    await sleep(1200);
    res.status = await L.status(p); res.sAfter = await sb();
    const after = await p.evaluate(D6.collect, '.studio-container');
    const key = (e) => e.key || JSON.stringify(e).slice(0, 80);
    const map = (arr) => { const m = new Map(); for (const e of arr) m.set(key(e), e); return m; };
    const mb = map(before), ma = map(after); const diffs = [];
    for (const [k, e] of mb) { const a = ma.get(k); if (!a) { diffs.push({ k, only: 'before' }); continue; } const d = ['x', 'y', 'w', 'h'].map((q) => Math.abs((a[q] ?? 0) - (e[q] ?? 0))); if (Math.max(...d) > 1) diffs.push({ k, before: e, after: a }); }
    for (const k of ma.keys()) if (!mb.has(k)) diffs.push({ k, only: 'after' });
    res.counts = [before.length, after.length]; res.diffs = diffs;
    await p.screenshot({ path: path.join(L.SHOTS, `longmsg-${W}.png`) });
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(L.OUT, `longmsg-${W}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ status: res.status, counts: res.counts, diffs: res.diffs, sB: res.sBefore, sA: res.sAfter, err: res.error, net: res.net.ok }, null, 0).slice(0, 2500));
  await b.close();
})();
