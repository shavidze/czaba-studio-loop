// C round 190 (copied from c-round-189) — is the one-sample logo opacity 0 seen by an early rAF sampler painted? Sample again in a ResizeObserver callback (after all rAF callbacks + style/layout, before paint). node flicker.cjs <W> <n>
const L = require('./lib.cjs'); const D = require('./ld.cjs'); const path = require('path');
const W = process.argv[2]; const N = +(process.argv[3] || 3);
function roInit() {
  const R = (window.__ro = { s: [] }); let el = null; let flip = false;
  const opac = (e, root) => { let o = 1; for (let c = e; c; c = c.parentElement) { o *= +getComputedStyle(c).opacity; if (c === root) break; } return o; };
  const ro = new ResizeObserver(() => { const ov = document.querySelector('[data-testid=entrance-loader]'); if (!ov) return; const sp = [...ov.querySelectorAll('span')].find((s) => s.textContent.trim() === 'CZABA'); if (sp) R.s.push({ t: performance.now(), o: +opac(sp.parentElement, ov).toFixed(3), w: +getComputedStyle(sp.parentElement).opacity }); });
  const tick = () => { if ((!el || !el.isConnected) && document.body) { if (el) ro.unobserve(el); el = document.createElement('div'); el.style.cssText = 'position:fixed;left:-50px;top:0;height:1px;width:1px;pointer-events:none'; document.body.appendChild(el); ro.observe(el); } if (el) { flip = !flip; el.style.width = flip ? '2px' : '1px'; } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
(async () => {
  const b = await L.chromium.launch({ headless: true }); const out = [];
  for (let k = 0; k < N; k++) {
    const { ctx, page } = await D.fresh(b, W); await ctx.addInitScript(roInit);
    await page.goto(L.BASE + '/', { waitUntil: 'commit' }); await D.waitIns(page, 8000); await D.waitRem(page, 8000);
    const r = await page.evaluate(() => { const ins = window.__ld.ins[0]; const raf = window.__ld.samples.filter((x) => typeof x.logo === 'number'); const ro = window.__ro.s; const hiR = ro.filter((x) => x.o >= 0.9); const first = hiR.length ? hiR[0].t : null, last = hiR.length ? hiR[hiR.length - 1].t : null;
      return { ins, rafDips: raf.filter((x, i) => i > 0 && x.logo < 0.5 && raf.slice(0, i).some((y) => y.logo >= 0.9) && raf.slice(i + 1).some((y) => y.logo >= 0.9)).map((x) => +(x.t - ins).toFixed(1)), roN: ro.length, roHi: first && [+(first - ins).toFixed(1), +(last - ins).toFixed(1), +(last - first).toFixed(1)], roDips: first ? ro.filter((x) => x.t > first && x.t < last && x.o < 0.9).map((x) => ({ t: +(x.t - ins).toFixed(1), o: x.o, w: x.w })) : null }; });
    out.push(r); await ctx.close();
  }
  await b.close(); L.save(path.join(__dirname, '..', 'out'), `flicker-${W}.json`, out); console.log(JSON.stringify(out));
})();
