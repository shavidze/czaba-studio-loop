// C round 212 — WAVE-LIVE-212: lane + detail waveform d during a slow single drag and a members drag (25/50/75 %),
// parsed heights vs the displayed dB, typed-value equality (single), per-frame release check, Undo/Redo equality.
// usage: node c212wave.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const h = (s) => { if (!s) return null; let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(16); };
const ds = (page) => page.evaluate(() => {
  const lanes = [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => { const p = c.querySelector('[data-testid=arrangement-clip-waveform] > path'); return { id: c.getAttribute('data-clip-id'), d: p ? p.getAttribute('d') : null }; });
  const dp = document.querySelector('[data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"] > path');
  const fd = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]');
  const rg = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]');
  return { lanes, detail: dp ? dp.getAttribute('d') : null, fader: fd && fd.value, vt: fd && fd.getAttribute('aria-valuetext'), range: rg ? rg.textContent : null };
});
function heights(d) {
  if (!d) return null;
  const e = [...d.matchAll(/V(\d+\.\d{3})H(\d+)/g)];
  const n = e.length / 2;
  return e.slice(0, n).map((m, i) => ({ top: Number(m[1]), bot: Number(e[e.length - 1 - i][1]) }));
}
// ratio check: for unclamped columns, (1 - top_s) / (1 - top_r) ~= 10^((gs-gr)/20); symmetric bottom
function ratioCheck(dRest, dS, gr, gs) {
  const a = heights(dRest), b = heights(dS);
  if (!a || !b || a.length !== b.length) return { ok: false, why: 'len' };
  const k = 10 ** ((gs - gr) / 20);
  let used = 0, bad = 0, sym = 0, worst = 0;
  for (let i = 0; i < a.length; i++) {
    const hr = 1 - a[i].top, hs = 1 - b[i].top;
    if (Math.abs((b[i].bot - 1) - hs) > 0.0011) sym += 1;
    if (hr <= 0.03 || hr >= 0.999 || hs <= 0.03 || hs >= 0.999) continue;
    const exp = Math.max(0.02, Math.min(1, hr * k));
    if (exp <= 0.021 || exp >= 0.999) continue;
    used += 1;
    const err = Math.abs(hs - exp);
    const tol = 0.0006 + 0.0006 * k;
    if (err > tol) bad += 1;
    worst = Math.max(worst, err);
  }
  return { ok: bad === 0 && sym === 0 && used > 0, used, bad, sym, worst: Math.round(worst * 1e5) / 1e5, k: Math.round(k * 1e4) / 1e4 };
}
async function slowDrag(page, label) {
  const f = L.sl(page, 'Clip Gain — fader');
  await f.scrollIntoViewIfNeeded();
  const b = await f.boundingBox();
  const y = b.y + b.height / 2;
  const rest = await ds(page);
  await page.mouse.move(b.x + b.width * 0.5, y);
  await page.mouse.down();
  for (let i = 1; i <= 30; i++) { await page.mouse.move(b.x + b.width * (0.5 - (0.3 * i) / 30), y); await L.sleep(25); }
  const samples = [];
  for (let i = 1; i <= 60; i++) {
    await page.mouse.move(b.x + b.width * (0.2 + (0.6 * i) / 60), y);
    await L.sleep(25);
    if (i === 15 || i === 30 || i === 45) { await L.sleep(80); samples.push({ at: Math.round((i / 60) * 100), ...(await ds(page)) }); if (i === 30) await page.screenshot({ path: `${L.SHOTS}/wave-${tag}-${vw}-${label}-50.png` }); }
  }
  await page.evaluate(() => {
    window.__fr = [];
    addEventListener('pointerup', () => { let n = 0; const tick = () => { const ps = [...document.querySelectorAll('[data-clip-kind="audio"] [data-testid=arrangement-clip-waveform] > path, [data-testid=arrangement-detail-waveform] svg[viewBox$=" 2"] > path')].map((p) => p.getAttribute('d').length + ':' + p.getAttribute('d').slice(-40)); window.__fr.push(ps.join('|')); if (++n < 10) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, { once: true, capture: true });
  });
  const preUp = await ds(page);
  await page.mouse.up();
  await L.quiet(page);
  await L.sleep(300);
  const after = await ds(page);
  const frames = await page.evaluate(() => window.__fr);
  await L.blurActive(page);
  await page.keyboard.press('Control+z'); await L.quiet(page);
  const undone = await ds(page);
  await page.keyboard.press('Control+Shift+z'); await L.quiet(page);
  const redone = await ds(page);
  return { rest, samples, preUp, after, frames: [...new Set(frames)].length, undone, redone };
}
const dbOfVt = (vt) => L.dbOf(vt);
(async () => {
  const br = await L.launch();
  const R = { base, tag, vw, vh, utc: new Date().toISOString() };
  try {
    {
      const { ctx, page } = await L.openLab(br, base, vw, vh);
      const id = await L.selectFirstClip(page);
      const r = await slowDrag(page, 'single');
      const laneOf = (s) => s.lanes.find((x) => x.id === id).d;
      R.single = { id, checks: [] };
      for (const s of r.samples) {
        const g = Number(s.fader);
        R.single.checks.push({ at: s.at, db: g, vt: s.vt, laneRatio: ratioCheck(laneOf(r.rest), laneOf(s), 0, g), detailRatio: ratioCheck(r.rest.detail, s.detail, 0, g), laneH: h(laneOf(s)), detailH: h(s.detail) });
      }
      R.single.releaseNoSnapBack = laneOf(r.after) === laneOf(r.preUp) && r.after.detail === r.preUp.detail && r.frames === 1;
      R.single.afterVt = r.after.vt;
      R.single.undoRestores = laneOf(r.undone) === laneOf(r.rest) && r.undone.detail === r.rest.detail;
      R.single.redoEqualsAfter = laneOf(r.redone) === laneOf(r.after) && r.redone.detail === r.after.detail;
      // typed equality: type each sampled value and compare d (same build)
      R.single.typedEq = [];
      for (const s of r.samples) {
        await L.typeClipGain(page, Number(s.fader));
        const t = await ds(page);
        R.single.typedEq.push({ db: Number(s.fader), lane: laneOf(t) === laneOf(s), detail: t.detail === s.detail });
      }
      await L.typeClipGain(page, Number(r.after.fader));
      const t2 = await ds(page);
      R.single.typedAfterEq = laneOf(t2) === laneOf(r.after) && t2.detail === r.after.detail;
      R.single.fmt = /^M0 1(V\d+\.\d{3}H\d+)+Z$/.test(laneOf(r.after)) ? 'outline' : /h-1Z/.test(laneOf(r.after)) ? 'rects' : 'other';
      await ctx.close();
    }
    {
      const { ctx, page } = await L.openLab(br, base, vw, vh);
      R.membersSel = await L.addMembers(page, [-6, 1]);
      const r = await slowDrag(page, 'members');
      const [ida, idb] = R.membersSel.ids;
      const laneOf = (s, id) => s.lanes.find((x) => x.id === id).d;
      R.members = { checks: [] };
      for (const s of r.samples) {
        // anchor = max member (+1 member, idb); the -6 member keeps the 7 dB difference
        const anchor = Number(s.fader);
        R.members.checks.push({ at: s.at, anchor, range: s.range, a: ratioCheck(laneOf(r.rest, ida), laneOf(s, ida), -6, anchor - 7), b: ratioCheck(laneOf(r.rest, idb), laneOf(s, idb), 1, anchor) });
      }
      R.members.releaseNoSnapBack = laneOf(r.after, ida) === laneOf(r.preUp, ida) && laneOf(r.after, idb) === laneOf(r.preUp, idb) && r.frames === 1;
      R.members.afterRange = r.after.range;
      R.members.undoRestores = laneOf(r.undone, ida) === laneOf(r.rest, ida) && laneOf(r.undone, idb) === laneOf(r.rest, idb);
      R.members.redoEqualsAfter = laneOf(r.redone, ida) === laneOf(r.after, ida) && laneOf(r.redone, idb) === laneOf(r.after, idb);
      await ctx.close();
    }
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await br.close();
  L.save(`wave-${tag}-${vw}.json`, R);
  console.log(tag, vw, R.fatal || '', JSON.stringify({ single: R.single && { checks: R.single.checks.map((c) => [c.at, c.db, c.laneRatio.ok, c.laneRatio.used, c.detailRatio.ok, c.detailRatio.used]), typedEq: R.single.typedEq, typedAfterEq: R.single.typedAfterEq, snap: R.single.releaseNoSnapBack, undo: R.single.undoRestores, redo: R.single.redoEqualsAfter, fmt: R.single.fmt }, members: R.members && { checks: R.members.checks.map((c) => [c.at, c.anchor, c.range, c.a.ok, c.a.used, c.b.ok, c.b.used]), snap: R.members.releaseNoSnapBack, undo: R.members.undoRestores, redo: R.members.redoEqualsAfter } }));
})();
