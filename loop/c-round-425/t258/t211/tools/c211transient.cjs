// C round 211 — S5 detail: attribute-level record of the Clip Gain field on release (oldValue + value at each record), and per-frame painted state.
const L = require('./c211lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
(async () => { const b = await L.launch(); const R = { base, tag, vw };
  const { ctx, page } = await L.openLab(b, base, vw, vh); await L.selectFirstClip(page); await L.typeClipGain(page, -12);
  const arm = () => page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]'); const st = { recs: [], frames: [] }; window.__tr = st;
    new MutationObserver((ms) => { for (const m of ms) st.recs.push({ t: performance.now(), attr: m.attributeName, old: m.oldValue, now: f.getAttribute(m.attributeName) }); }).observe(f, { attributes: true, attributeOldValue: true });
    const vd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); Object.defineProperty(f, 'value', { configurable: true, get() { return vd.get.call(this); }, set(v) { st.recs.push({ t: performance.now(), prop: 'value', old: vd.get.call(this), now: v, pend: this.getAttribute('data-pending') }); vd.set.call(this, v); } });
    addEventListener('pointerup', () => { st.up = performance.now(); let n = 0; const tick = () => { st.frames.push({ t: performance.now(), v: vd.get.call(f), p: f.getAttribute('data-pending'), c: f.className.includes('border-warning') }); if (++n < 8) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { once: true, capture: true }); });
  const fd = L.sl(page, 'Clip Gain — fader'); const bx = await fd.boundingBox(); const y = bx.y + bx.height / 2;
  // value-changing drag (−12 -> about −3)
  await arm(); await page.mouse.move(bx.x + bx.width / 2, y); await page.mouse.down(); await page.mouse.move(bx.x + bx.width / 2 + 10, y, { steps: 8 }); await page.mouse.up(); await L.sleep(600);
  R.drag = await page.evaluate(() => window.__tr);
  // press without movement
  await L.blurActive(page); await arm(); await page.mouse.move(bx.x + bx.width / 2, y); await page.mouse.down(); await L.sleep(200); await page.mouse.up(); await L.sleep(600);
  R.press = await page.evaluate(() => window.__tr);
  await ctx.close(); await b.close();
  const fmt = (s) => ({ recsAfterUp: s.recs.filter((r) => r.t >= s.up).map((r) => r.prop ? `value:${r.old}->${r.now}(pend=${r.pend})` : `${r.attr}:${r.old}->${r.now}`), recsBeforeUp: s.recs.filter((r) => r.t < s.up).length, frames: [...new Set(s.frames.map((f) => `${f.v}|${f.p}|${f.c}`))], firstFrameMsAfterUp: s.frames[0] && Math.round(s.frames[0].t - s.up) });
  R.summary = { drag: fmt(R.drag), press: fmt(R.press) };
  L.save(`transient-${tag}-${vw}.json`, R); console.log(tag, vw, JSON.stringify(R.summary, null, 1)); })();
