// C round 138: V-0.4a clip gesture strings. node c138.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from the task §1.1 (never imported from the app).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
const CL = {
  CL1: 'The track is folded — unfold it to make a time selection',
  CL2: 'Video Fade In — picture only, the sound does not change · drag · double-click = 0',
  CL3: 'Video Fade Out — picture only, the sound does not change · drag · double-click = 0',
  CL7: 'Move blocked — a neighbouring clip or the start of the timeline. The clip stayed in its last free spot.',
  CL8: 'Trim stopped: the start of the source, a neighbouring clip or the minimum length (0.05 s).',
  CL9: 'Trim stopped: the end of the source, a neighbouring clip or the minimum length (0.05 s).',
  CL19: 'drag = time selection · click = playhead',
  TL: 'Trim — left edge', TR: 'Trim — right edge',
  R1: 'Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',
};
const fmt = (t) => { const m = Math.floor(t / 60); const s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
// R5 subtractions (data names and later-stage surfaces). The lane-move label is NOT subtracted (it is this round's target).
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'ღამის პულსი', 'სინთეზური დემო', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია', 'საჯარო preview', 'აუდიო'];
const FROZEN = [
  ['demo-ready load-time status (collection.ts, V-0.5)', /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/],
  ['library add status (library.ts / collection, V-0.4e/V-0.5)', /^დაემატა|დაემატა/],
  ['group create status / group name prefix (groups.ts, V-0.4d)', /ჯგუფ/],
  ['envelope texts (V-0.4c)', /^Envelope: /],
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (gc(t) && re.test(t)) { used.push(n); t = ''; } }
  for (const n of NAMES) if (t.includes(n)) { used.push(`data ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [], oks: 0 };
const OUTF = path.join(L.OUT, `c138-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P; let B; const getB = async () => (B = B || await L.launch());
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-138/shots/${f}`; }
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
// Clip surface + status + Undo/Redo titles.
const surf = () => P.evaluate(() => {
  const btn = (re) => { const b = [...document.querySelectorAll('button')].find((x) => re.test(x.textContent)); return b ? b.getAttribute('title') : null; };
  const clips = [...document.querySelectorAll('[data-clip-id]')].map((c) => {
    const header = c.firstElementChild;
    const body = c.querySelector(':scope > div.cursor-text, :scope > div > div.cursor-text') || c.querySelector('.cursor-text');
    const edges = [...c.querySelectorAll(':scope > div.cursor-ew-resize')].map((e) => e.getAttribute('title'));
    const fades = [...c.querySelectorAll('[data-testid$=-in-handle],[data-testid$=-out-handle]')].map((e) => ({ tid: e.dataset.testid, title: e.getAttribute('title') }));
    const badge = [...c.querySelectorAll('span.whitespace-nowrap')].map((e) => e.textContent);
    return { id: c.dataset.clipId, kind: c.dataset.clipKind, lane: (c.closest('[data-track-id]') || { dataset: {} }).dataset.trackId, start: +c.dataset.clipStart, fadeIn: c.dataset.fadeIn, fadeOut: c.dataset.fadeOut, rootTitle: c.getAttribute('title'), headerTitle: header ? header.getAttribute('title') : null, headerText: header ? header.textContent.trim() : null, bodyTitle: body ? body.getAttribute('title') : null, edges, fades, badge, w: c.getBoundingClientRect().width };
  });
  return { status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim(), undo: btn(/Undo/), redo: btn(/Redo/), range: (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null, clips, pps: +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1] };
});
function geoOf(s) {
  const texts = [];
  for (const c of s.clips) { texts.push(c.rootTitle, c.headerTitle, c.bodyTitle, ...c.edges, ...c.fades.map((f) => f.title), ...c.badge); }
  texts.push(s.status, s.undo, s.redo);
  const subs = texts.filter(Boolean).map(subtract);
  return { raw: subs.reduce((a, x) => a + x.raw + x.rawQ, 0), net: subs.reduce((a, x) => a + x.net + x.netQ, 0), residue: subs.filter((x) => x.residue).map((x) => x.residue), subtracted: [...new Set(subs.flatMap((x) => x.subtracted))] };
}
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); return cond; }
async function step(row, id, extra = {}) {
  const s = await surf(); const ob = await obsTake();
  const r = { id, s, observer: ob, geo: geoOf(s), obsGeo: ob.map((o) => ({ text: o.text, ...subtract(o.text) })), ...extra };
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  const obsNet = r.obsGeo.filter((o) => o.net || o.netQ);
  if (r.geo.net || obsNet.length) console.log('   GEO', row, id, r.geo.net, JSON.stringify(r.geo.residue), JSON.stringify(obsNet.map((o) => o.text)));
  return r;
}
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
async function open(label, opts) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c138-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      const O = await L.openStudio(await getB(), X.VPS[W], lbl, net, opts);
      P = O.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
      res.checks[`${label}-snapAtStart`] = await P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
      res.checks[`${label}-snap`] = await L.setSnapOff(P);
      return O;
    } catch (e) { res.invalidRuns.push({ label, sessionLabel: lbl, attempt: i, reason: 'ENV-FIRST-LOAD', err: String(e).slice(0, 300) }); save(); }
  }
  throw new Error('open failed 3x ' + label);
}
const clips = () => L.clipsDom(P);
async function seekExact(t) {
  await L.blur(P); await P.keyboard.press('Home'); await sleep(200);
  if (t > 0) { await P.focus('[data-testid=arrangement-playhead-handle]'); for (let i = 0; i < Math.round(t * 10); i++) await P.keyboard.press('ArrowRight'); await sleep(250); }
  await L.blur(P); return L.posNow(P);
}
async function addExact(src, lane, t) {
  await P.click(L.nameSel(lane)); await sleep(200);
  const pos = await seekExact(t);
  const o = P.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await P.keyboard.press('Enter'); await sleep(800); await L.blur(P);
  const c = (await clips()).filter((x) => x.lane === lane && Math.abs(x.start - t) < 0.002);
  return c[0] ? c[0].id : null;
}
const clipOf = async (id) => (await clips()).find((c) => c.id === id);
async function hdrPt(id) { const b = await P.locator(`[data-clip-id="${id}"] > div`).first().boundingBox(); return { x: b.x + Math.min(30, b.width / 2), y: b.y + b.height / 2 }; }
async function laneY(lane) { const b = await P.locator(`[data-track-id=${lane}]`).last().boundingBox(); return b.y + b.height / 2; }
// pointer path: list of [x,y]; holdFn called before release
async function drag(start, pts, { mods = [], holdFn = null, steps = 8 } = {}) {
  await P.mouse.move(start.x, start.y); await sleep(80);
  for (const m of mods) await P.keyboard.down(m);
  await P.mouse.down(); await sleep(60);
  for (const [x, y] of pts) { await P.mouse.move(x, y, { steps }); await sleep(80); }
  await sleep(250);
  let held = null; if (holdFn) held = await holdFn();
  await P.mouse.up(); await sleep(450);
  for (const m of mods) await P.keyboard.up(m);
  await sleep(150);
  return held;
}
const curStatus = () => L.status(P);
const undoT = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? b.getAttribute('title') : null; });
const near = (a, b, e = 0.0015) => Math.abs(a - b) <= e;

async function clipMove() {
  const R = 'CLIP-MOVE'; await open('move');
  const id = await addExact('demo-soft-impact', 'music', 2);
  const c0 = await clipOf(id); chkT(R, 'added', c0 && near(c0.start, 2), c0);
  const pps = (await L.geo(P)).pps; const h = await hdrPt(id);
  await obsTake();
  await drag(h, [[h.x + pps * 0.5, h.y], [h.x + pps, h.y]]);
  const c1 = await clipOf(id); let s = await step(R, 'released', { clip: c1 }); s.shot = await shot('move-released');
  chk(R, 'status', s.s.status, `Move clip: start ${fmt(c1.start)}, length 00:02.000, source offset 00:00.000.`);
  chkT(R, 'moved-about-1s', Math.abs(c1.start - 3) < 0.06, c1.start);
  chk(R, 'undo-title', s.s.undo, 'Undo: Move clip');
  await press('Control+z'); const c2 = await clipOf(id); s = await step(R, 'undo', { clip: c2 });
  chkT(R, 'undo-restores-start', near(c2.start, 2, 0.0005), c2.start);
  // NO-CHANGE (a): drag +1 s and back to exactly the start before release
  const N = 'NO-CHANGE'; const u0 = await undoT(); const h2 = await hdrPt(id);
  await drag(h2, [[h2.x + pps, h2.y], [h2.x, h2.y]]);
  s = await step(N, 'drag-back', { clip: await clipOf(id), undo0: u0 });
  chk(N, 'back-status', s.s.status, 'Move clip: nothing changed — the Undo history is unchanged.');
  chk(N, 'back-undo-unchanged', s.s.undo, u0);
  // NO-CHANGE (b): Shift time lock, horizontal drag, same lane
  const h3 = await hdrPt(id);
  await drag(h3, [[h3.x + pps * 1.5, h3.y]], { mods: ['Shift'] });
  s = await step(N, 'shift-lock', { clip: await clipOf(id), undo0: u0 });
  chk(N, 'shift-status', s.s.status, 'Move clip: nothing changed — the Undo history is unchanged.');
  chk(N, 'shift-undo-unchanged', s.s.undo, u0);
  chkT(N, 'start-unchanged', near((await clipOf(id)).start, 2, 0.0005), (await clipOf(id)).start);
  // MOVE-BLOCKED: neighbour at 6..8, drag the 2..4 clip by +3 s into it
  const M = 'MOVE-BLOCKED';
  const nb = await addExact('demo-soft-impact', 'music', 6); chkT(M, 'neighbour', !!nb, nb);
  const h4 = await hdrPt(id); await obsTake();
  const held = await drag(h4, [[h4.x + pps * 1.5, h4.y], [h4.x + pps * 3, h4.y]], { holdFn: async () => ({ status: await curStatus(), clip: await clipOf(id), shot: await shot('blocked-held') }) });
  chk(M, 'held-status', held.status, CL.CL7);
  const a = await clipOf(id), b = await clipOf(nb);
  s = await step(M, 'released', { held, a, b });
  chkT(M, 'no-overlap', a.start + 2 <= b.start + 0.0005 && near(b.start, 6), { a: a.start, aEnd: a.start + 2, b: b.start });
  chkT(M, 'last-free-spot', a.start > 3.5 && a.start <= 4.0005, a.start);
  res.checks[`${M}-releaseStatus`] = s.s.status; res.checks[`${M}-releaseUndo`] = s.s.undo;
  await P.context().close();
}

async function trim() {
  const R = 'TRIM'; await open('trim');
  const id = await addExact('demo-soft-impact', 'music', 2);
  const pps = (await L.geo(P)).pps;
  const left = P.locator(`[data-clip-id="${id}"] > [title="${CL.TL}"]`); const right = P.locator(`[data-clip-id="${id}"] > [title="${CL.TR}"]`);
  chk(R, 'left-edge-count', await left.count(), 1); chk(R, 'right-edge-count', await right.count(), 1);
  let lb = await left.boundingBox(); await P.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2); await sleep(300);
  res.checks.hoverTitle = await P.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && e.getAttribute('title'); }, [lb.x + lb.width / 2, lb.y + lb.height / 2]);
  chk(R, 'hover-left-title', res.checks.hoverTitle, CL.TL);
  let s;
  // left edge +0.5 s
  await drag({ x: lb.x + lb.width / 2, y: lb.y + lb.height / 2 }, [[lb.x + lb.width / 2 + pps * 0.5, lb.y + lb.height / 2]]);
  let c = await clipOf(id); s = await step(R, 'left-trim', { clip: c }); s.shot = await shot('trim-left');
  const len1 = +(4 - c.start).toFixed(3);
  chk(R, 'left-status', s.s.status, `Trim — left edge: start ${fmt(c.start)}, length ${fmt(len1)}, source offset ${fmt(c.start - 2)}.`);
  chkT(R, 'left-about-0.5', Math.abs(c.start - 2.5) < 0.06, c.start);
  chk(R, 'left-undo', s.s.undo, 'Undo: Trim — left edge');
  // right edge -0.5 s (commit), then +2 s past the source end and hold
  let rb = await right.boundingBox();
  await drag({ x: rb.x + rb.width / 2, y: rb.y + rb.height / 2 }, [[rb.x + rb.width / 2 - pps * 0.5, rb.y + rb.height / 2]]);
  c = await clipOf(id); s = await step(R, 'right-trim-in', { clip: c });
  const m1 = /length (\d+:\d+\.\d+)/.exec(s.s.status);
  chkT(R, 'right-in-status', /^Trim — right edge: start [\d:.]+, length [\d:.]+, source offset [\d:.]+\.$/.test(s.s.status) && Math.abs(X.parseT(m1 && m1[1]) - c.wdur) < 0.03, { st: s.s.status, wdur: c.wdur });
  chk(R, 'right-undo', s.s.undo, 'Undo: Trim — right edge');
  rb = await right.boundingBox(); const srcMax = +(2 - (c.start - 2)).toFixed(3);
  const held = await drag({ x: rb.x + rb.width / 2, y: rb.y + rb.height / 2 }, [[rb.x + rb.width / 2 + pps * 1, rb.y + rb.height / 2], [rb.x + rb.width / 2 + pps * 2, rb.y + rb.height / 2]], { holdFn: async () => ({ status: await curStatus(), clip: await clipOf(id), shot: await shot('trim-right-held') }) });
  chk(R, 'held-CL9', held.status, CL.CL9);
  chkT(R, 'held-length-at-source-end', Math.abs(held.clip.wdur - srcMax) < 0.03, { wdur: held.clip.wdur, srcMax });
  c = await clipOf(id); s = await step(R, 'right-released', { held, clip: c, srcMax });
  chk(R, 'right-release-status-kept-CL9', s.s.status, CL.CL9);
  chkT(R, 'right-release-length', Math.abs(c.wdur - srcMax) < 0.03, { wdur: c.wdur, srcMax });
  chk(R, 'right-release-undo', s.s.undo, 'Undo: Trim — right edge');
  // left edge past the source start and hold -> CL8
  lb = await left.boundingBox();
  const held2 = await drag({ x: lb.x + lb.width / 2, y: lb.y + lb.height / 2 }, [[lb.x + lb.width / 2 - pps * 1.5, lb.y + lb.height / 2]], { holdFn: async () => ({ status: await curStatus(), clip: await clipOf(id) }) });
  chk(R, 'held-CL8', held2.status, CL.CL8);
  chkT(R, 'held-start-at-source-start', near(held2.clip.start, 2, 0.0005), held2.clip.start);
  s = await step(R, 'left-out-released', { held2, clip: await clipOf(id) });
  chk(R, 'left-out-status-kept-CL8', s.s.status, CL.CL8);
  { const cc = await clipOf(id); chkT(R, 'left-out-start', near(cc.start, 2, 0.0005) && Math.abs(cc.wdur - 2) < 0.03, cc); }
  chk(R, 'left-out-undo', s.s.undo, 'Undo: Trim — left edge');
  await P.context().close();
}

async function laneMove() {
  const R = 'LANE-MOVE'; await open('lane');
  const id = await addExact('demo-soft-impact', 'music', 2);
  const occ = await addExact('demo-soft-impact', 'stems', 8);
  const pps = (await L.geo(P)).pps; const h = await hdrPt(id); const sy = await laneY('stems');
  await drag(h, [[h.x + 1, h.y + 8], [h.x, sy]], { steps: 10 });
  let c = (await clips()).find((x) => x.id === id) || (await clips()).find((x) => x.lane === 'stems' && x.start < 5);
  let s = await step(R, 'to-stems', { clip: c }); s.shot = await shot('lane-stems');
  chkT(R, 'on-stems', c && c.lane === 'stems' && near(c.start, 2, 0.06), c);
  chk(R, 'status', s.s.status, `Move to track — სტემები: start ${fmt(c.start)}.`);
  chk(R, 'undo', s.s.undo, 'Undo: Move to track — სტემები');
  await press('Control+z');
  c = (await clips()).find((x) => x.lane === 'music'); chkT(R, 'undo-back-music', c && near(c.start, 2, 0.0005), c);
  // refusal: first right inside music to ~8.5 s, then straight down onto the occupied stems spot
  const h2 = await hdrPt(c.id); await obsTake();
  const held = await drag(h2, [[h2.x + pps * 3, h2.y], [h2.x + pps * 6.5, h2.y], [h2.x + pps * 6.5, sy]], { steps: 10, holdFn: async () => ({ status: await curStatus(), shot: await shot('lane-refusal-held') }) });
  const all = await clips(); const m = all.find((x) => x.lane === 'music'); const st = all.filter((x) => x.lane === 'stems');
  s = await step(R, 'refusal-released', { held, music: m, stems: st }); s.shot = await shot('lane-refusal');
  chk(R, 'held-status', held.status, 'No room here');
  chkT(R, 'clip-stayed-music', m && Math.abs(m.start - 8.5) < 0.1 && st.length === 1 && near(st[0].start, 8), { m, st });
  chk(R, 'refusal-status', s.s.status, `No room here — the clip stayed in its last free spot: მუსიკა, start ${fmt(m.start)}.`);
  res.checks.laneRefusalUndo = s.s.undo;
  await P.context().close();
}

async function groupMove() {
  const R = 'GROUP-MOVE'; await open('group');
  const a = await addExact('demo-soft-impact', 'music', 4);
  const b = await addExact('demo-soft-impact', 'stems', 10);
  await L.selectClip(P, a); await L.selectClip(P, b, ['Control']);
  let s = await step(R, 'selected'); const sel = await P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);
  chk(R, 'two-selected', sel, 2);
  const u0 = s.s.undo;
  // ArrowRight nudge
  await L.blur(P); await P.keyboard.press('ArrowRight'); await sleep(500);
  let A = await clipOf(a), Bc = await clipOf(b);
  s = await step(R, 'nudge', { A, Bc, u0 });
  const dA = +(A.start - 4).toFixed(4), dB = +(Bc.start - 10).toFixed(4);
  chkT(R, 'nudge-both-same-step', dA > 0 && near(dA, dB, 0.0005), { dA, dB });
  chk(R, 'nudge-undo', s.s.undo, 'Undo: Move (2)');
  res.checks.nudgeStep = dA;
  await press('Control+z'); A = await clipOf(a); chkT(R, 'nudge-undo-restores', near(A.start, 4, 0.0005), A.start);
  const selNow = () => P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);
  if ((await selNow()) !== 2) { await L.selectClip(P, a); if ((await selNow()) !== 2) await L.selectClip(P, b, ['Control']); }
  chk(R, 'two-selected-before-drag', await P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length), 2);
  const pps = (await L.geo(P)).pps;
  let h = await hdrPt(a);
  await drag(h, [[h.x + pps * 0.5, h.y], [h.x + pps, h.y]]);
  A = await clipOf(a); Bc = await clipOf(b);
  s = await step(R, 'drag-right', { A, Bc }); s.shot = await shot('group-right');
  const dR = A.start - 4; chkT(R, 'right-both', near(Bc.start - 10, dR, 0.0005) && dR > 0.9, { dR, dB: Bc.start - 10 });
  chk(R, 'right-status', s.s.status, `Move (2): 2 clips moved ${fmt(Math.abs(dR))} to the right.`);
  chk(R, 'right-undo', s.s.undo, 'Undo: Move (2)');
  const a1 = A.start, b1 = Bc.start;
  h = await hdrPt(a);
  await drag(h, [[h.x - pps, h.y], [h.x - pps * 2, h.y]]);
  A = await clipOf(a); Bc = await clipOf(b);
  s = await step(R, 'drag-left', { A, Bc }); s.shot = await shot('group-left');
  const dL = A.start - a1; chkT(R, 'left-both', near(Bc.start - b1, dL, 0.0005) && dL < -1.9, { dL, dB: Bc.start - b1 });
  chk(R, 'left-status', s.s.status, `Move (2): 2 clips moved ${fmt(Math.abs(dL))} to the left.`);
  chk(R, 'left-undo', s.s.undo, 'Undo: Move (2)');
  await P.context().close();
}

async function rmsRun(clipStart) {
  await seekExact(+(clipStart - 0.5).toFixed(1)); await L.blur(P);
  await P.evaluate(() => window.__tapStart());
  await P.keyboard.press('Space'); await sleep(1600); await P.keyboard.press('Space'); await sleep(300);
  const S = await P.evaluate(() => window.__tapStop());
  const win = S.filter((f) => f.pos >= clipStart + 0.02 && f.pos <= clipStart + 0.2);
  const pre = S.filter((f) => f.pos > clipStart - 0.4 && f.pos < clipStart - 0.1);
  const later = S.filter((f) => f.pos >= clipStart + 1.1 && f.pos <= clipStart + 1.4);
  const ms = (a) => (a.length ? a.reduce((x, f) => x + f.ms, 0) / a.length : 0);
  const db = (v) => (v > 0 ? 10 * Math.log10(v) : -200);
  return { frames: S.length, winFrames: win.length, winDb: +db(ms(win)).toFixed(2), preDb: +db(ms(pre)).toFixed(2), laterDb: +db(ms(later)).toFixed(2), firstPos: (S.find((f) => f.pos > 0) || {}).pos, winPos: win.map((f) => +f.pos.toFixed(3)) };
}
function rmsTapInit() {
  const Wd = window; Wd.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) { const r = oc.call(this, dest, ...rest); try { if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) { const c = this.context; let an = Wd.__tap.an.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; Wd.__tap.an.set(c, an); } oc.call(this, an); } } catch (e) { Wd.__tap.err = String(e); } return r; };
  Wd.__tapStart = () => { Wd.__tap.on = true; Wd.__tap.S = []; const buf = new Float32Array(2048); const tick = () => { if (!Wd.__tap.on) return; let ss = 0, n = 0; for (const an of Wd.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { ss += buf[i] * buf[i]; n++; } } const h = document.querySelector('[data-testid=arrangement-playhead-handle]'); Wd.__tap.S.push({ t: performance.now(), pos: h ? Number(h.getAttribute('aria-valuenow')) : NaN, ms: n ? ss / n : 0 }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  Wd.__tapStop = () => { Wd.__tap.on = false; return Wd.__tap.S; };
}
async function fades() {
  const R = 'FADES'; await open('fades', { extraInit: rmsTapInit });
  const src = process.env.FADE_SRC || 'demo-stem-pulse';
  const id = await addExact(src, 'music', 1);
  chkT(R, 'added', !!id, id);
  const base1 = await rmsRun(1);
  const pps = (await L.geo(P)).pps;
  await L.selectClip(P, id); await sleep(200);
  const hIn = P.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-fade-in-handle]`);
  let hb = await hIn.boundingBox(); await obsTake();
  const held = await drag({ x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }, [[hb.x + hb.width / 2 + pps * 0.5, hb.y + hb.height / 2], [hb.x + hb.width / 2 + pps, hb.y + hb.height / 2]], { holdFn: async () => ({ status: await curStatus(), shot: await shot('fade-held') }) });
  let c = (await surf()).clips.find((x) => x.id === id);
  let s = await step(R, 'fade-in-released', { held, fadeIn: c.fadeIn }); s.shot = await shot('fade-released');
  chk(R, 'held-preview', held.status, `Fade In: ${c.fadeIn} s`);
  chk(R, 'release-commit', s.s.status, `Fade In: ${c.fadeIn} s.`);
  chkT(R, 'fade-about-1s', Math.abs(+c.fadeIn - 1) < 0.03, c.fadeIn);
  chk(R, 'fade-undo', s.s.undo, 'Undo: Fade In');
  const faded = await rmsRun(1);
  await L.selectClip(P, id); await sleep(200);
  hb = await hIn.boundingBox(); await obsTake();
  await P.mouse.dblclick(hb.x + hb.width / 2, hb.y + hb.height / 2); await sleep(600);
  c = (await surf()).clips.find((x) => x.id === id);
  s = await step(R, 'dblclick-reset', { fadeIn: c.fadeIn });
  chk(R, 'reset-status', s.s.status, 'Fade In: 0.000 s.'); chk(R, 'reset-data', c.fadeIn, '0.000');
  const base2 = await rmsRun(1);
  const audio = { src, base1, faded, base2, diff1: +(base1.winDb - faded.winDb).toFixed(2), diff2: +(base2.winDb - faded.winDb).toFixed(2) };
  res.checks.audio = audio; save();
  const FLOOR = -50;
  if (base1.winDb < FLOOR || base2.winDb < FLOOR || base1.winFrames < 3 || faded.winFrames < 3) { res.invalidRuns.push({ label: 'fades-audio', reason: `near-silent baseline (< ${FLOOR} dBFS) or too few frames`, audio }); console.log('INVALID audio run', JSON.stringify(audio)); }
  else chkT(R, 'rms-6dB-below', audio.diff1 >= 6 && audio.diff2 >= 6, audio);
  // video fade handles
  await L.loadVideo(P, 'beeps-6s-h264-aac.mp4'); await L.blur(P);
  const vid = (await clips()).find((x) => x.kind === 'video');
  await L.selectClip(P, vid.id); await sleep(300);
  const vt = await P.evaluate((vid) => { const c = document.querySelector(`[data-clip-id="${vid}"]`); const q = (s) => { const e = c.querySelector(`[data-testid=${s}]`); return e ? e.getAttribute('title') : null; }; return { in: q('arrangement-video-fade-in-handle'), out: q('arrangement-video-fade-out-handle') }; }, vid.id);
  chk(R, 'video-in-title', vt.in, CL.CL2); chk(R, 'video-out-title', vt.out, CL.CL3);
  const vo = P.locator(`[data-clip-id="${vid.id}"] [data-testid=arrangement-video-fade-out-handle]`); const vb = await vo.boundingBox(); await obsTake();
  const vheld = await drag({ x: vb.x + vb.width / 2, y: vb.y + vb.height / 2 }, [[vb.x + vb.width / 2 - pps, vb.y + vb.height / 2], [vb.x + vb.width / 2 - pps * 2, vb.y + vb.height / 2]], { holdFn: async () => ({ status: await curStatus() }) });
  const vc = (await surf()).clips.find((x) => x.id === vid.id);
  s = await step(R, 'video-fade-out', { vheld, fadeOut: vc.fadeOut, titles: vt }); s.shot = await shot('video-fade');
  chk(R, 'video-held', vheld.status, `Video Fade Out: ${vc.fadeOut} s`);
  chk(R, 'video-commit', s.s.status, `Video Fade Out: ${vc.fadeOut} s.`);
  chkT(R, 'video-about-2s', Math.abs(+vc.fadeOut - 2) < 0.03, vc.fadeOut);
  await P.context().close();
}

async function folded() {
  const R = 'FOLDED-TITLE'; await open('fold');
  const id = await addExact('demo-soft-impact', 'stems', 2);
  await P.click(L.nameSel('stems')); await sleep(150);
  await P.keyboard.down('Shift'); await P.click(L.nameSel('sfx')); await P.keyboard.up('Shift'); await sleep(150);
  await P.keyboard.press('Control+g'); await sleep(700); await L.blur(P);
  let s = await step(R, 'grouped');
  const c0 = s.s.clips.find((x) => x.id === id); const title = c0.headerText.replace(/^[▶⠿\s]+/, '').trim();
  res.checks.clipTitle = { headerText: c0.headerText, title };
  chk(R, 'unfolded-header-before', c0.headerTitle, `${title} — drag to move`);
  await P.click('[data-testid=arrangement-group-fold]'); await sleep(700); await L.blur(P);
  s = await step(R, 'group-folded'); s.shot = await shot('group-folded');
  res.checks.groupFoldClipsVisible = s.s.clips.length;
  await P.click('[data-testid=arrangement-group-fold]'); await sleep(700); await L.blur(P);
  const FB = '[data-track-id=stems] [data-testid=arrangement-track-header] button[aria-label="სტემები დაკეცვა ან გახსნა"]';
  chk(R, 'track-fold-button', await P.locator(FB).count(), 1);
  await P.click(FB); await sleep(700); await L.blur(P);
  s = await step(R, 'folded'); s.shot = await shot('folded');
  const c1 = s.s.clips.find((x) => x.id === id);
  chkT(R, 'clip-visible-folded', !!c1, s.s.clips.map((x) => x.id));
  if (c1) {
    chk(R, 'folded-header', c1.headerTitle, `${title} — drag to move\n${CL.CL1}`);
    chk(R, 'folded-root', c1.rootTitle, `${title}\n${CL.CL1}`);
  }
  await P.click(FB); await sleep(700); await L.blur(P);
  s = await step(R, 'unfolded');
  const c2 = s.s.clips.find((x) => x.id === id);
  chk(R, 'unfolded-header', c2.headerTitle, `${title} — drag to move`);
  chk(R, 'unfolded-root-null', c2.rootTitle, null);
  await P.context().close();
}

async function rangeBadge() {
  const R = 'RANGE-BADGE'; await open('range');
  const id = await addExact('demo-synth-mix', 'music', 0);
  const st = await X.rangeDrag(P, id, 3, 5);
  const s = await step(R, 'range', { st }); s.shot = await shot('range-badge');
  const c = s.s.clips.find((x) => x.id === id);
  chk(R, 'badge', c.badge[0], '00:03.000 – 00:05.000 · 2.000 s');
  chk(R, 'body-title', c.bodyTitle, CL.CL19);
  chk('REG-137', 'one-track-range-line', s.s.range, CL.R1);
  await P.context().close();
}

(async () => {
  const rows = { clipMove, trim, laneMove, groupMove, fades, folded, rangeBadge };
  for (const [k, f] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== k) continue;
    try { await f(); } catch (e) { res.fails.push({ row: k, id: 'exception', got: String(e.stack || e).slice(0, 600) }); console.log('EXC', k, e); try { await P.context().close(); } catch (_) {} }
    save();
  }
  res.endUtc = new Date().toISOString(); save();
  console.log('DONE oks', res.oks, 'fails', res.fails.length, JSON.stringify(X.netOk(net)));
  await B.close();
})();
