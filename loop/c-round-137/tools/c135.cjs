// C round 135: TRANSPORT, FOLLOW, ZOOM-FIT, RULER-OVERVIEW, LOOP, TEMPO, GEO-COUNT, BAR (overflow), REG-134.
// node c135.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from task §1.1 (never imported from strings.ts). Controls found by data-testid/role/position.
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'SFX'];
// Frozen (not V-0.3b) texts, subtracted by name.
const FROZEN = [
  ['demo-ready', /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/],
  ['clip-added (library, V-0.5)', /^„[^“]+“ დაემატა .+ ხაზზე [\d:.]+-ზე\.$/],
  ['clip-added: demo source title + track name (V-0.4/V-0.5 data)', /^“[^”]+” added to the .+ track at [\d:.]+\.$/],
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (re.test(t)) { used.push(n); t = ''; } }
  for (const n of NAMES) if (t.includes(n)) { used.push(`track name ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), net: gc(t), subtracted: used, residue: gc(t) ? t.slice(0, 200) : '' };
}
const E = {
  TR1: 'Back to start', TR2: 'Back to start (0)', TR3: '/ end',
  TR4: 'Split at both edges of the time selection (Ctrl/Cmd+E)', TR5: 'Split at the playhead (Ctrl/Cmd+E)',
  TR6: 'Delete time selection — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  TR7: 'Delete time selection on all tracks — leaves a gap (Delete / Backspace). Cut Time closes the gap: Ctrl+Shift+X',
  TR8: 'Delete clip — leaves a gap (Delete)', TR9: '⌫ Delete — the selected clip; leaves a gap', TR10: '⌫ Delete',
  TR11: 'Loop the time selection (Ctrl/Cmd+L)', TR12: 'Loop on / off (Ctrl/Cmd+L)',
  TR13: 'Loop: make a time selection and press ↻ Loop (Ctrl+L)', TR14: '← → nudge · Shift + ← → length',
  TR15: (span) => `${span} · the bar moves the loop; the edges change its length`, TR16: 'Loop start', TR17: 'Loop end',
  TR18: 'Project tempo (BPM)',
  TR19: 'Project tempo — bars grid only; audio is not stretched (no time-stretch). Enter — save · Esc — cancel · empty — hide the bars',
  TR20: 'Metronome',
  NV1: 'Follow off: the view does not follow playback', NV2: 'Follow paused by manual navigation — press Follow or Play', NV3: 'Follow: the view follows the playback position',
  NV4: 'Zoom (px/s)', NV5: 'Zoom around the playhead · + / − · Ctrl+wheel', NV6: 'Zoom to selection (Z)', NV7: 'Zoom to the time selection (Z)',
  NV8: 'Zoom to selection: make a time selection first (Z)', NV9: 'Back to the previous zoom (X)',
  NV10: 'Previous zoom: the history is empty — use Fit or Zoom to selection first (X)',
  NV11: 'Fit — the entire project is visible (double-click the ruler or the overview)',
  NV12: 'Playhead — drag · ←/→ = ±0.1 s',
  NV13: 'Click = playhead · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit / Zoom to selection',
  NV14: 'Overview — entire project (← → = 5 s, double-click = Fit)',
  NV15: 'Overview: click = centre here · ↔ drag = scroll · ↕ drag = Zoom · double-click = Fit',
  NV16: (s, e) => `Visible start ${s} / ${e}`,
  NV17: 'Follow paused by manual navigation. Follow or Play resumes it.',
  NV18: 'To zoom, make a time selection first.', NV19: 'The zoom history is empty — there is no view to go back to.',
  NV20: (x) => `Fit: the entire project is visible (${x}). X goes back.`,
  NV21: (s, e) => `Zoom to selection: ${s} — ${e}. X goes back.`,
  NV22: 'Previous view restored. X goes back one more step.', NV23: 'Previous view restored.',
  NV24: 'Follow off: the view does not move by itself.', NV25: 'Follow is following the playback position again.',
  NV26: 'Follow on: the view follows the playback position during playback.',
  REG134: 'Snap on — grid 1 s (G)',
};
const fmt = (t) => { const m = Math.floor(t / 60); const s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {} };
const OUTF = path.join(L.OUT, `c135-${W}-${TAG}-${ONLY}.json`);
const validNet = () => net.filter((n) => !res.invalidRuns.some((r) => n.label === r.sessionLabel));
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(validNet()), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-137/shots/${f}`; }
async function obsInstall() {
  await P.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const Wd = { recs: [], t0: performance.now(), last: out.textContent };
    window.__so = Wd;
    Wd.mo = new MutationObserver(() => { const t = out.textContent; if (t !== Wd.last) { Wd.last = t; Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), text: t.trim() }); } });
    Wd.mo.observe(out, { childList: true, subtree: true, characterData: true });
  });
}
const obsTake = () => P.evaluate(() => { const r = window.__so.recs.slice(); window.__so.recs = []; return r; });
// Full read of every V-0.3b surface.
const surf = () => P.evaluate(() => {
  const q = (s) => document.querySelector(`[data-testid=${s}]`);
  const fit = q('arrangement-fit');
  const bar = fit.parentElement.parentElement;
  const btns = [...bar.querySelectorAll('button')];
  const idxSplit = btns.findIndex((b) => b.textContent.trim() === '✂ Split');
  const info = (e) => e ? { aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), text: e.textContent.trim(), disabled: !!e.disabled, pressed: e.getAttribute('aria-pressed') } : null;
  const back = btns.find((b) => b.textContent.trim() === '↤');
  const loopB = btns.find((b) => /↻ Loop/.test(b.textContent));
  const endSpan = q('arrangement-project-end');
  const tempo = q('arrangement-tempo-input'); const met = q('arrangement-metronome-toggle');
  const ruler = q('arrangement-ruler'); const ph = q('arrangement-playhead-handle'); const ov = q('arrangement-overview');
  const strip = q('arrangement-loop-strip');
  const brace = strip ? strip.querySelector('[tabindex="0"]') : null;
  const sc = q('arrangement-timeline-scroller');
  const pps = +/([\d.]+)/.exec(q('arrangement-zoom-readout').textContent)[1];
  const kids = [...bar.children].filter((c) => c.getClientRects().length);
  const rows = new Set(kids.map((c) => Math.round(c.getBoundingClientRect().top)));
  const tempoRow = tempo ? tempo.parentElement : null;
  const hdr = q('arrangement-grid-control');
  const allBarTexts = [...bar.querySelectorAll('*')].flatMap((e) => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('aria-valuetext'), e.children.length === 0 ? e.textContent : null]).filter(Boolean);
  return {
    back: info(back), endPrefix: endSpan ? endSpan.parentElement.textContent.trim() : null, endText: endSpan ? endSpan.textContent.trim() : null,
    split: info(btns[idxSplit]), del: info(btns[idxSplit + 1]), loop: info(loopB), follow: { ...info(q('arrangement-follow')), mode: q('arrangement-follow').dataset.followMode },
    zoom: info(q('arrangement-zoom')), zoomRange: info(q('arrangement-zoom-range')), zoomBack: info(q('arrangement-zoom-back')), fit: info(fit),
    tempo: tempo ? { aria: tempo.getAttribute('aria-label'), title: tempo.title, value: tempo.value } : null, met: info(met),
    ruler: ruler.title, playhead: ph.title, pos: Number(ph.getAttribute('aria-valuenow')),
    ov: { aria: ov.getAttribute('aria-label'), title: ov.title, vt: ov.getAttribute('aria-valuetext') },
    strip: strip ? strip.textContent.trim() : null,
    brace: brace ? { aria: brace.getAttribute('aria-label'), title: brace.title, start: (strip.querySelector('[data-testid=arrangement-loop-start-edge]') || {}).title, end: (strip.querySelector('[data-testid=arrangement-loop-end-edge]') || {}).title } : null,
    status: (q('arrangement-status').textContent || '').trim(),
    view: { pps, sl: sc.scrollLeft, cw: sc.clientWidth, sw: sc.scrollWidth },
    barLayout: { sw: bar.scrollWidth, cw: bar.clientWidth, rows: rows.size, h: Math.round(bar.getBoundingClientRect().height) },
    tempoLayout: tempoRow ? { sw: tempoRow.scrollWidth, cw: tempoRow.clientWidth, h: Math.round(tempoRow.getBoundingClientRect().height), hdrSw: hdr.scrollWidth, hdrCw: hdr.clientWidth } : null,
    geoTexts: { bar: allBarTexts, tempo: tempo ? [tempo.getAttribute('aria-label'), tempo.title, met.textContent, met.title] : [], rp: [ruler.title, ph.title], ov: [ov.getAttribute('aria-label'), ov.title, ov.getAttribute('aria-valuetext')], loop: strip ? [strip.textContent, ...[...strip.querySelectorAll('*')].flatMap((e) => [e.getAttribute('aria-label'), e.getAttribute('title')]).filter(Boolean)] : [] },
  };
});
function geoOf(s) {
  const c = (arr) => arr.reduce((a, x) => a + gc(x), 0);
  const g = { bar: c(s.geoTexts.bar), tempo: c(s.geoTexts.tempo), rp: c(s.geoTexts.rp), ov: c(s.geoTexts.ov), loop: c(s.geoTexts.loop), status: subtract(s.status) };
  g.barResidue = s.geoTexts.bar.filter((x) => gc(x));
  g.net = g.bar + g.tempo + g.rp + g.ov + g.loop + g.status.net;
  return g;
}
const fails = [];
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) fails.push({ row, id, got, exp }); console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); return ok; }
async function step(row, id, extra = {}) {
  const s = await surf(); const ob = await obsTake();
  const r = { id, s, observer: ob, geo: geoOf(s), obsGeo: ob.map((o) => ({ text: o.text, ...subtract(o.text) })), ...extra };
  delete r.s.geoTexts;
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  if (r.geo.net || r.obsGeo.some((o) => o.net)) console.log('   GEO', row, id, r.geo.net, JSON.stringify(r.geo.status), JSON.stringify(r.geo.barResidue), JSON.stringify(r.obsGeo.filter((o) => o.net)));
  return r;
}
async function clickDel() { const h = await P.evaluateHandle(() => { const bar = document.querySelector('[data-testid=arrangement-fit]').parentElement.parentElement; const b = [...bar.querySelectorAll('button')]; return b[b.findIndex((x) => x.textContent.trim() === '✂ Split') + 1]; }); await h.asElement().click(); }
async function clearRange() { const lb = await P.locator('[data-track-id=music]').first().boundingBox(); const scb = await P.locator('[data-testid=arrangement-timeline-scroller]').boundingBox(); await P.mouse.click(scb.x + scb.width * 0.7, lb.y + lb.height / 2); await sleep(350); await L.blur(P); }
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(450); };
const clips = async () => (await L.clipsDom(P)).filter((c) => c.kind !== 'video').map((c) => `${c.lane}@${c.start.toFixed(2)}+${c.wdur.toFixed(2)}`).sort().join(' ');
const detRange = () => P.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-detail-start]'), e = document.querySelector('[data-testid=arrangement-detail-end]'); return { start: s && s.value, end: e && e.value }; });
let B; const getB = async () => (B = B || await L.launch());
let O;
async function open(label) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c135-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      O = await L.openStudio(await getB(), X.VPS[W], lbl, net);
      P = O.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
      return O;
    } catch (e) { res.invalidRuns.push({ label, sessionLabel: lbl, attempt: i, reason: 'ENV-FIRST-LOAD', err: String(e).slice(0, 300) }); save(); }
  }
  throw new Error('open failed 3x ' + label);
}
async function setup(row) {
  const snap = await L.setSnapOff(P);
  const a1 = await L.addAt(P, 'demo-stem-pulse', 'stems', 0);
  const a2 = await L.addAt(P, 'demo-soft-impact', 'sfx', 5);
  await P.keyboard.press('Escape'); await sleep(200); await L.blur(P);
  const s = await step(row, 'setup', { snap, adds: [a1, a2], clips: await clips() });
  console.log(row, 'setup snap', snap, 'clips', s.clips, 'end', s.s.endText);
  return s;
}
const stemsId = async () => (await L.clipsDom(P)).filter((c) => c.lane === 'stems').sort((a, b) => a.start - b.start)[0].id;
async function makeRange(t0 = 4, t1 = 8) { const id = await stemsId(); await X.rangeDrag(P, id, t0, t1); await L.blur(P); return detRange(); }

async function transport() {
  const R = 'TRANSPORT'; await open('transport'); await setup(R);
  // (a) nothing selected
  let r = await step(R, 'a-none'); let s = r.s;
  chk(R, 'a back aria', s.back.aria, E.TR1); chk(R, 'a back title', s.back.title, E.TR2);
  chk(R, 'a end prefix', s.endPrefix, `${E.TR3} ${s.endText}`);
  chk(R, 'a split title', s.split.title, E.TR5); chk(R, 'a del title', s.del.title, E.TR8); chk(R, 'a del aria', s.del.aria, E.TR9); chk(R, 'a del text', s.del.text, E.TR10);
  chk(R, 'a loop title', s.loop.title, E.TR12); chk(R, 'a follow title', s.follow.title, E.NV3);
  chk(R, 'a zoom aria', s.zoom.aria, E.NV4); chk(R, 'a zoom title', s.zoom.title, E.NV5); chk(R, 'a zr aria', s.zoomRange.aria, E.NV6); chk(R, 'a zr title', s.zoomRange.title, E.NV8);
  chk(R, 'a zb title', s.zoomBack.title, E.NV10); chk(R, 'a fit title', s.fit.title, E.NV11);
  r.disabled = { split: s.split.disabled, del: s.del.disabled, loop: s.loop.disabled };
  r.shot = await shot('tr-a');
  // back to start effect
  await L.seekTo(P, 3); const p3 = await L.posNow(P);
  await P.click('text=↤'); await sleep(300); await L.blur(P);
  r = await step(R, 'back-to-start', { before: p3, after: await L.posNow(P) }); res.checks[`${W}-back0`] = { before: p3, after: r.after };
  chk(R, 'back to start pos', r.after, 0);
  // (b) clip selected
  const sid = await stemsId(); await L.selectClip(P, sid); await L.blur(P);
  r = await step(R, 'b-clip'); s = r.s;
  chk(R, 'b split title', s.split.title, E.TR5); chk(R, 'b del title', s.del.title, E.TR8); chk(R, 'b del aria', s.del.aria, E.TR9); chk(R, 'b del text', s.del.text, E.TR10);
  chk(R, 'b loop title', s.loop.title, E.TR12); chk(R, 'b zr title', s.zoomRange.title, E.NV8);
  r.shot = await shot('tr-b');
  const c0 = await clips();
  await clickDel(); await sleep(400); await L.blur(P);
  const cB = await clips(); r = await step(R, 'b-delete-click', { before: c0, after: cB });
  await press('Control+z'); const cBu = await clips(); r.undo = cBu; save();
  res.checks[`${W}-b-delete`] = { before: c0, after: cB, undo: cBu, gap: !cB.includes('stems@0.00') && cB.includes('sfx@5.00'), undoOk: cBu === c0 };
  console.log(R, 'b delete', JSON.stringify(res.checks[`${W}-b-delete`]));
  // (c) one-track range
  const rg = await makeRange(4, 8);
  r = await step(R, 'c-range', { range: rg }); s = r.s;
  chk(R, 'c split title', s.split.title, E.TR4); chk(R, 'c del title', s.del.title, E.TR6); chk(R, 'c del aria', s.del.aria, E.TR6); chk(R, 'c del text', s.del.text, E.TR10);
  chk(R, 'c loop title', s.loop.title, E.TR11); chk(R, 'c zr title', s.zoomRange.title, E.NV7); chk(R, 'c zr aria', s.zoomRange.aria, E.NV6);
  chk(R, 'c follow title', s.follow.title, E.NV3); chk(R, 'c zb title', s.zoomBack.title, E.NV10); chk(R, 'c fit', s.fit.title, E.NV11); chk(R, 'c back', s.back.aria, E.TR1);
  r.shot = await shot('tr-c');
  r.barLayoutRange = s.barLayout;
  // split on range
  const cc0 = await clips();
  await P.locator('button', { hasText: '✂ Split' }).click(); await sleep(400); await L.blur(P);
  const cS = await clips(); r = await step(R, 'c-split', { before: cc0, after: cS });
  await press('Control+z'); const cSu = await clips(); r.undo = cSu; save();
  res.checks[`${W}-c-split`] = { before: cc0, after: cS, undo: cSu, undoOk: cSu === cc0 };
  console.log(R, 'c split', JSON.stringify(res.checks[`${W}-c-split`]));
  // range survives? re-make
  let rg2 = await detRange(); let sNow = await surf();
  if (sNow.del.title !== E.TR6) { rg2 = await makeRange(4, 8); sNow = await surf(); }
  await clickDel(); await sleep(400); await L.blur(P);
  const cD = await clips(); r = await step(R, 'c-delete', { before: cc0, after: cD, range: rg2 });
  await press('Control+z'); const cDu = await clips(); r.undo = cDu; save();
  res.checks[`${W}-c-delete`] = { before: cc0, after: cD, undo: cDu, undoOk: cDu === cc0 };
  console.log(R, 'c delete', JSON.stringify(res.checks[`${W}-c-delete`]));
  // (d) all tracks range
  sNow = await surf(); if (sNow.del.title !== E.TR6) await makeRange(4, 8);
  await press('Control+Shift+L');
  r = await step(R, 'd-alltracks', { range: await detRange() }); s = r.s;
  chk(R, 'd split title', s.split.title, E.TR4); chk(R, 'd del title', s.del.title, E.TR7); chk(R, 'd del aria', s.del.aria, E.TR7); chk(R, 'd del text', s.del.text, E.TR10);
  chk(R, 'd loop title', s.loop.title, E.TR11); chk(R, 'd zr title', s.zoomRange.title, E.NV7);
  r.shot = await shot('tr-d');
  const cd0 = await clips();
  await clickDel(); await sleep(400); await L.blur(P);
  const cDD = await clips(); r = await step(R, 'd-delete', { before: cd0, after: cDD });
  r.shot = await shot('tr-d-after-delete');
  await press('Control+z'); const cDDu = await clips(); r.undo = cDDu; save();
  res.checks[`${W}-d-delete`] = { before: cd0, after: cDD, undo: cDDu, undoOk: cDDu === cd0 };
  console.log(R, 'd delete', JSON.stringify(res.checks[`${W}-d-delete`]));
  await O.ctx.close();
}

async function follow() {
  const R = 'FOLLOW'; await open('follow'); await setup(R);
  // zoom in via the slider (before play)
  const zl = P.locator('[data-testid=arrangement-zoom]');
  const mm = await zl.evaluate((e) => ({ min: +e.min, max: +e.max, v: +e.value }));
  await zl.fill(String(mm.max)); await sleep(400); await L.blur(P);
  await L.seekTo(P, 0); await sleep(200);
  let r = await step(R, 'pre', { slider: mm }); console.log(R, 'pre view', JSON.stringify(r.s.view), r.s.follow.mode);
  chk(R, 'pre mode', r.s.follow.mode, 'on'); chk(R, 'pre title', r.s.follow.title, E.NV3);
  const playBtn = P.locator('[data-testid=arrangement-fit]').locator('xpath=../..').locator('button').first();
  const vs = () => P.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const ph = document.querySelector('[data-testid=arrangement-playhead-handle]'); const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; const pos = Number(ph.getAttribute('aria-valuenow')); return { pos, sl: Math.round(sc.scrollLeft), cw: sc.clientWidth, phx: Math.round(pos * pps - sc.scrollLeft), mode: document.querySelector('[data-testid=arrangement-follow]').dataset.followMode }; });
  const trace = async (ms, tag) => { const out = []; const t0 = Date.now(); while (Date.now() - t0 < ms) { out.push({ tag, ...(await vs()) }); await sleep(250); } return out; };
  await playBtn.click(); await sleep(100); await L.blur(P);
  const tOn = await trace(4500, 'on-initial');
  r = await step(R, 'playing-on', { trace: tOn });
  const followed = tOn.some((x) => x.sl > 0) && tOn.every((x) => x.phx >= -2 && x.phx <= x.cw + 2);
  res.checks[`${W}-follow-on-initial`] = { followed, first: tOn[0], last: tOn[tOn.length - 1] };
  console.log(R, 'on initial followed', followed, JSON.stringify(tOn[tOn.length - 1]));
  // manual horizontal scroll during playback
  const sb = await P.locator('[data-testid=arrangement-timeline-scroller]').boundingBox();
  await P.mouse.move(sb.x + sb.width * 0.6, sb.y + sb.height * 0.6);
  await P.mouse.wheel(400, 0); await sleep(500);
  r = await step(R, 'paused'); const s1 = r.s;
  chk(R, 'paused mode', s1.follow.mode, 'paused'); chk(R, 'paused title', s1.follow.title, E.NV2);
  chk(R, 'paused status (observer)', r.observer.map((o) => o.text).includes(E.NV17), true);
  r.shot = await shot('follow-paused');
  const tP = await trace(1500, 'paused'); r.trace = tP; save();
  res.checks[`${W}-follow-paused-still`] = { slFirst: tP[0].sl, slLast: tP[tP.length - 1].sl, posFirst: tP[0].pos, posLast: tP[tP.length - 1].pos, still: Math.abs(tP[0].sl - tP[tP.length - 1].sl) <= 1 };
  // click 1
  const fb = P.locator('[data-testid=arrangement-follow]');
  await fb.click(); await sleep(300); await L.blur(P);
  r = await step(R, 'click1'); chk(R, 'c1 mode', r.s.follow.mode, 'on'); chk(R, 'c1 status', r.s.status, E.NV25); chk(R, 'c1 title', r.s.follow.title, E.NV3);
  const t1 = await trace(1500, 'on-after-click1'); r.trace = t1; save();
  res.checks[`${W}-follow-c1-follows`] = { last: t1[t1.length - 1], inView: t1.slice(2).every((x) => x.phx >= -2 && x.phx <= x.cw + 2) };
  // click 2
  await fb.click(); await sleep(300); await L.blur(P);
  r = await step(R, 'click2'); chk(R, 'c2 mode', r.s.follow.mode, 'off'); chk(R, 'c2 status', r.s.status, E.NV24); chk(R, 'c2 title', r.s.follow.title, E.NV1);
  r.shot = await shot('follow-off');
  const t2 = await trace(2500, 'off'); r.trace = t2; save();
  res.checks[`${W}-follow-off-still`] = { slFirst: t2[0].sl, slLast: t2[t2.length - 1].sl, posFirst: t2[0].pos, posLast: t2[t2.length - 1].pos, still: Math.abs(t2[0].sl - t2[t2.length - 1].sl) <= 1 };
  // click 3
  await fb.click(); await sleep(300); await L.blur(P);
  r = await step(R, 'click3'); chk(R, 'c3 mode', r.s.follow.mode, 'on'); chk(R, 'c3 status', r.s.status, E.NV26); chk(R, 'c3 title', r.s.follow.title, E.NV3);
  const t3 = await trace(1500, 'on-after-click3'); r.trace = t3; save();
  res.checks[`${W}-follow-c3-follows`] = { last: t3[t3.length - 1], inView: t3.slice(2).every((x) => x.phx >= -2 && x.phx <= x.cw + 2) };
  const stillPlaying = await P.evaluate(() => document.querySelector('[data-testid=arrangement-fit]').parentElement.parentElement.querySelector('button').textContent.trim());
  await playBtn.click(); await sleep(400); await L.blur(P);
  r = await step(R, 'stopped', { playBtnTextBeforeStop: stillPlaying });
  console.log(R, 'checks', JSON.stringify(Object.fromEntries(Object.entries(res.checks).filter(([k]) => k.startsWith(`${W}-follow`)))));
  await O.ctx.close();
}

async function zoomFit() {
  const R = 'ZOOM-FIT'; await open('zoom'); await setup(R);
  let r = await step(R, 'start'); const v0 = r.s.view;
  await press('z'); r = await step(R, 'z-norange'); chk(R, 'z no range', r.s.status, E.NV18);
  await press('x'); r = await step(R, 'x-empty'); chk(R, 'x empty', r.s.status, E.NV19); chk(R, 'x empty title', r.s.zoomBack.title, E.NV10);
  await P.click('[data-testid=arrangement-fit]'); await sleep(450); await L.blur(P);
  r = await step(R, 'fit'); const vFit = r.s.view; chk(R, 'fit status', r.s.status, E.NV20(r.s.endText)); chk(R, 'fit zb title', r.s.zoomBack.title, E.NV9);
  r.fitWhole = { extentPx: +(16 * vFit.pps).toFixed(1), cw: vFit.cw, sl: vFit.sl }; r.shot = await shot('zoom-fit'); save();
  res.checks[`${W}-fit-whole`] = { ...r.fitWhole, ok: vFit.sl <= 1 && 16 * vFit.pps <= vFit.cw + 1 && 16 * vFit.pps >= vFit.cw * 0.6 };
  const rg = await makeRange(4, 8);
  r = await step(R, 'range', { range: rg });
  await press('z'); r = await step(R, 'z-range', { range: rg }); const vZ = r.s.view;
  chk(R, 'z range status', r.s.status, E.NV21(fmt(parseFloat(rg.start)), fmt(parseFloat(rg.end)))); chk(R, 'z zb title', r.s.zoomBack.title, E.NV9);
  r.shot = await shot('zoom-z');
  res.checks[`${W}-z-fits-range`] = { pps: vZ.pps, sl: vZ.sl, cw: vZ.cw, rangePx: +(4 * vZ.pps).toFixed(1), startPx: +(4 * vZ.pps).toFixed(1) };
  await press('x'); r = await step(R, 'x1'); const vX1 = r.s.view;
  chk(R, 'x1 status', r.s.status, E.NV22); chk(R, 'x1 zb title', r.s.zoomBack.title, E.NV9);
  res.checks[`${W}-x1-restores-fit`] = { vX1, vFit, ok: Math.abs(vX1.pps - vFit.pps) < 0.01 && Math.abs(vX1.sl - vFit.sl) <= 1 };
  await press('x'); r = await step(R, 'x2'); const vX2 = r.s.view;
  chk(R, 'x2 status', r.s.status, E.NV23); chk(R, 'x2 zb title', r.s.zoomBack.title, E.NV10);
  res.checks[`${W}-x2-restores-start`] = { vX2, v0, ok: Math.abs(vX2.pps - v0.pps) < 0.01 && Math.abs(vX2.sl - v0.sl) <= 1 };
  r.shot = await shot('zoom-x2');
  await press('x'); r = await step(R, 'x3-empty'); chk(R, 'x3 empty', r.s.status, E.NV19);
  console.log(R, 'checks', JSON.stringify(Object.fromEntries(Object.entries(res.checks).filter(([k]) => /fit|z-|x\d/.test(k) && k.startsWith(`${W}-`)))));
  await O.ctx.close();
}

async function rulerOverview() {
  const R = 'RULER-OVERVIEW'; await open('ruler'); await setup(R);
  let r = await step(R, 'read'); let s = r.s;
  chk(R, 'ruler title', s.ruler, E.NV13); chk(R, 'playhead title', s.playhead, E.NV12); chk(R, 'ov aria', s.ov.aria, E.NV14); chk(R, 'ov title', s.ov.title, E.NV15);
  chk(R, 'ov vt', s.ov.vt, E.NV16(fmt(Math.round(s.view.sl / s.view.pps)), s.endText));
  const zl = P.locator('[data-testid=arrangement-zoom]');
  const mm = await zl.evaluate((e) => ({ min: +e.min, max: +e.max }));
  await zl.fill(String(Math.round(mm.min + (mm.max - mm.min) * 0.8))); await sleep(400); await L.blur(P);
  const sb = await P.locator('[data-testid=arrangement-timeline-scroller]').boundingBox();
  await P.mouse.move(sb.x + sb.width * 0.6, sb.y + sb.height * 0.6); await P.mouse.wheel(600, 0); await sleep(600);
  r = await step(R, 'scrolled'); s = r.s;
  r.vtParsed = s.ov.vt; const expStart = fmt(Math.round(s.view.sl / s.view.pps));
  chk(R, 'ov vt after scroll changed', s.ov.vt !== res.rows[R][0].s.ov.vt, true);
  chk(R, 'ov vt after scroll', s.ov.vt, E.NV16(expStart, s.endText));
  r.shot = await shot('ruler-scrolled');
  // overview keyboard ArrowRight (5 s) also moves start
  await P.locator('[data-testid=arrangement-overview]').focus(); await P.keyboard.press('ArrowRight'); await sleep(400);
  r = await step(R, 'ov-arrow'); r.vt = r.s.ov.vt; await L.blur(P); save();
  // double-click ruler, no selection
  await P.keyboard.press('Escape'); await sleep(200);
  const rb = await P.locator('[data-testid=arrangement-ruler]').boundingBox();
  const scb = await P.locator('[data-testid=arrangement-timeline-scroller]').boundingBox();
  const sNoSel = await surf(); res.checks[`${W}-dbl-precondition`] = { delTitle: sNoSel.del.title, delDisabled: sNoSel.del.disabled, zrDisabled: sNoSel.zoomRange.disabled };
  const dx = scb.x + scb.width * 0.7; res.checks[`${W}-dbl-hit`] = await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.dataset.testid || e.tagName) : null; }, [dx, rb.y + rb.height / 2]); await P.mouse.dblclick(dx, rb.y + rb.height / 2); await sleep(600); await L.blur(P);
  r = await step(R, 'dblclick'); s = r.s;
  chk(R, 'dblclick = Fit status', s.status, E.NV20(s.endText));
  res.checks[`${W}-dbl-fit`] = { view: s.view, ok: s.view.sl <= 1 && 16 * s.view.pps <= s.view.cw + 1 };
  chk(R, 'dblclick whole visible', res.checks[`${W}-dbl-fit`].ok, true);
  chk(R, 'ov vt after fit', s.ov.vt, E.NV16('00:00.000', s.endText));
  r.shot = await shot('ruler-dblclick-fit');
  await O.ctx.close();
}

const braceTimes = (aria) => { const m = /(\d\d:\d\d\.\d{3}) — (\d\d:\d\d\.\d{3})/.exec(aria || ''); return m ? [X.parseT(m[1]), X.parseT(m[2])] : null; };
async function loop() {
  const R = 'LOOP'; await open('loop'); const su = await setup(R);
  let r = await step(R, 'no-loop'); chk(R, 'strip hint', r.s.strip, E.TR13); chk(R, 'loop btn disabled no range', r.s.loop.disabled, true);
  const rg = await makeRange(4, 8);
  r = await step(R, 'range', { range: rg }); chk(R, 'loop title range', r.s.loop.title, E.TR11);
  await press('Control+l');
  r = await step(R, 'ctrl-l'); let s = r.s;
  const span = (s.brace && s.brace.aria || '').split(' · ')[0];
  r.span = span;
  chk(R, 'brace aria', s.brace && s.brace.aria, `${span} · ${E.TR14}`); chk(R, 'brace title', s.brace && s.brace.title, E.TR15(span));
  chk(R, 'brace start', s.brace && s.brace.start, E.TR16); chk(R, 'brace end', s.brace && s.brace.end, E.TR17);
  chk(R, 'loop title still range', s.loop.title, E.TR11);
  r.shot = await shot('loop-on');
  await clearRange(); r = await step(R, 'cleared'); chk(R, 'loop title no range', r.s.loop.title, E.TR12); chk(R, 'loop pressed', r.s.loop.pressed, 'true');
  const t0 = braceTimes(r.s.brace.aria);
  const brace = P.locator('[data-testid=arrangement-loop-strip] [tabindex="0"]');
  await brace.focus(); await P.keyboard.press('ArrowRight'); await sleep(400);
  r = await step(R, 'arrowright'); const t1 = braceTimes(r.s.brace.aria);
  await P.keyboard.press('Shift+ArrowRight'); await sleep(400);
  const r2 = await step(R, 'shift-arrowright'); const t2 = braceTimes(r2.s.brace.aria);
  await L.blur(P);
  res.checks[`${W}-loop-nudge`] = { snap: su.snap, t0, t1, t2, nudgeOk: t1 && Math.abs(t1[0] - t0[0] - 0.1) < 0.0015 && Math.abs(t1[1] - t0[1] - 0.1) < 0.0015, lengthOk: t2 && Math.abs(t2[0] - t1[0]) < 0.0015 && Math.abs(t2[1] - t1[1] - 0.1) < 0.0015, statuses: [r.s.status, r2.s.status], obs: [...r.observer, ...r2.observer] };
  console.log(R, 'nudge', JSON.stringify(res.checks[`${W}-loop-nudge`]));
  chk(R, 'brace aria after nudge', r2.s.brace.aria, `${r2.s.brace.aria.split(' · ')[0]} · ${E.TR14}`);
  r2.shot = await shot('loop-nudged'); save();
  await O.ctx.close();
}

async function tempo() {
  const R = 'TEMPO'; await open('tempo'); await setup(R);
  let r = await step(R, 'no-bpm'); let s = r.s;
  chk(R, 'tempo aria', s.tempo.aria, E.TR18); chk(R, 'tempo title', s.tempo.title, E.TR19); chk(R, 'met text', s.met.text, E.TR20); chk(R, 'met disabled', s.met.disabled, true);
  r.metTitle = s.met.title;
  r.shot = await shot('tempo-none');
  const c0 = await clips();
  const t = P.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('120'); await P.keyboard.press('Enter'); await sleep(500); await L.blur(P);
  r = await step(R, 'bpm120'); const c1 = await clips(); r.clips = { before: c0, after: c1, same: c0 === c1 }; s = r.s;
  chk(R, 'clips unchanged after BPM 120', c0 === c1, true); chk(R, 'met enabled', s.met.disabled, false); chk(R, 'met text 120', s.met.text, E.TR20); chk(R, 'tempo aria 120', s.tempo.aria, E.TR18);
  r.statusBpm = s.status;
  await P.click('[data-testid=arrangement-metronome-toggle]'); await sleep(400); await L.blur(P);
  r = await step(R, 'met-on'); r.pressed = r.s.met.pressed; chk(R, 'met pressed on', r.s.met.pressed, 'true'); r.shot = await shot('tempo-met-on');
  await P.click('[data-testid=arrangement-metronome-toggle]'); await sleep(400); await L.blur(P);
  r = await step(R, 'met-off'); chk(R, 'met pressed off', r.s.met.pressed, 'false'); chk(R, 'met off status', r.s.status, 'Metronome is off.');
  console.log(R, 'statuses', JSON.stringify(res.rows[R].map((x) => x.s.status)));
  await O.ctx.close();
}

async function reg134() {
  const R = 'REG-134'; await open('reg134');
  const snap0 = await P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
  await press('g'); const r = await step(R, 'g', { snap0 }); chk(R, 'G status', r.s.status, E.REG134);
  await O.ctx.close();
}

async function none() {
  const R = 'TRANSPORT-A-NONE'; await open('none'); await setup(R);
  await clearRange();
  const r = await step(R, 'a-true-none'); const s = r.s;
  r.disabled = { split: s.split.disabled, del: s.del.disabled, loop: s.loop.disabled, zr: s.zoomRange.disabled };
  chk(R, 'none split disabled', s.split.disabled, true); chk(R, 'none del disabled', s.del.disabled, true);
  chk(R, 'none back aria', s.back.aria, E.TR1); chk(R, 'none back title', s.back.title, E.TR2); chk(R, 'none end', s.endPrefix, `${E.TR3} ${s.endText}`);
  chk(R, 'none split', s.split.title, E.TR5); chk(R, 'none del title', s.del.title, E.TR8); chk(R, 'none del aria', s.del.aria, E.TR9); chk(R, 'none del text', s.del.text, E.TR10);
  chk(R, 'none loop', s.loop.title, E.TR12); chk(R, 'none follow', s.follow.title, E.NV3); chk(R, 'none zoom', s.zoom.aria, E.NV4); chk(R, 'none zoom t', s.zoom.title, E.NV5);
  chk(R, 'none zr', s.zoomRange.aria, E.NV6); chk(R, 'none zr t', s.zoomRange.title, E.NV8); chk(R, 'none zb', s.zoomBack.title, E.NV10); chk(R, 'none fit', s.fit.title, E.NV11);
  r.shot = await shot('tr-a-true-none'); save();
  await O.ctx.close();
}
(async () => {
  const rows = { none, transport, follow, zoomFit, rulerOverview, loop, tempo, reg134 };
  for (const [k, f] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== k) continue;
    if (k === 'reg134' && W !== 1440 && ONLY === 'all') continue;
    try { await f(); } catch (e) { res.rows[`ERROR-${k}`] = String(e.stack || e).slice(0, 1500); console.log('ERROR', k, e); try { await O.ctx.close(); } catch (_) {} }
    res.fails = fails; save();
  }
  res.fails = fails; res.endUtc = new Date().toISOString(); save();
  console.log('FAILS', fails.length, JSON.stringify(fails)); console.log('NET', JSON.stringify(X.netOk(validNet())));
  await B.close();
})();
