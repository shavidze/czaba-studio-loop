// A round 190 (copied from C round 189; args: W label N modes) — CLS attribution: fresh (loader shows) vs seen (sessionStorage key preset by init script). node cls.cjs <W>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const W = process.argv[2]; const LABEL = process.argv[3] || 'run'; const N = +(process.argv[4] || 3); const MODES = (process.argv[5] || 'fresh,seen').split(',');
const init = () => { window.__perf = { lcp: 0, cls: 0, lcpEl: null, shifts: [] }; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__perf.lcp = e.startTime; window.__perf.lcpEl = e.element ? e.element.tagName + '.' + String(e.element.className).slice(0, 40) : null; } }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) window.__perf.cls += e.value; window.__perf.shifts.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), rec: e.hadRecentInput, src: (e.sources || []).map((s) => { const n = s.node; return { n: n ? (n.nodeType === 1 ? n.tagName + '.' + String(n.className).slice(0, 50) + (n.textContent ? ' "' + n.textContent.trim().slice(0, 25) + '"' : '') : '#text "' + n.textContent.trim().slice(0, 25) + '"') : null, p: [s.previousRect.y, s.previousRect.height], c: [s.currentRect.y, s.currentRect.height] }; }) }); } }).observe({ type: 'layout-shift', buffered: true }); } catch (e) {} };
(async () => {
  const b = await L.chromium.launch({ headless: true }); const res = { W, fresh: [], seen: [] };
  for (const mode of MODES) for (let i = 0; i < N; i++) {
    const ctx = await b.newContext({ viewport: D.VPS[W], deviceScaleFactor: 2 }); await ctx.addInitScript(init); await ctx.addInitScript(D.ldInit);
    if (mode === 'seen') await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
    const pg = await ctx.newPage(); await pg.goto(L.BASE + '/', { waitUntil: 'load' }); await L.sleep(4000); await pg.mouse.move(1, 1);
    const r = await pg.evaluate(() => ({ ...window.__perf, ins: window.__ld.ins.map(Math.round), rem: window.__ld.rem.map(Math.round) })); res[mode].push(r); await ctx.close();
  }
  const med = (a) => { const z = [...a].sort((x, y) => x - y); return z[Math.floor(z.length / 2)]; };
  for (const m of MODES) res[m + 'Median'] = { lcp: med(res[m].map((p) => p.lcp)), cls: med(res[m].map((p) => p.cls)) };
  await b.close(); L.save(path.join(__dirname, '..', 'out'), `cls-${LABEL}-${W}.json`, res);
  console.log(W, 'fresh', JSON.stringify(res.freshMedian), 'seen', JSON.stringify(res.seenMedian));
  for (const m of MODES) for (const r of res[m]) console.log(m, Math.round(r.lcp), r.lcpEl, r.cls.toFixed(4), 'ins', r.ins, 'rem', r.rem, JSON.stringify(r.shifts.map((s) => ({ t: s.t, v: s.v, src: s.src.slice(0, 3) }))).slice(0, 900));
})();
