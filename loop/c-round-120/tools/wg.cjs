// C round 120 — WG-* browser rows (T12 stage 4a: waveform shows Clip Gain). Usage: ROWS=a,b node wg.cjs <1440|1280> <run#>
// Ratio rule fixed before running (current-task.md §5): judged |h − s·h0| ≤ 0.0006·(1+s); clamped y=0.000; floor y=0.980; ≥10 judged.
const L = require('./lib.cjs');
const path = require('path');
const crypto = require('crypto');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const MINUS = '−';
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[^\d.+-]/g, ''));
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const sha = (s) => crypto.createHash('sha256').update(s || '').digest('hex').slice(0, 16);

function parseD(d) {
  const re = /M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g;
  const cols = [];
  let m;
  while ((m = re.exec(d))) cols.push({ c: +m[1], y: +m[2], y2: +m[3], ys: m[2] });
  return cols;
}

const laneWave = (p, id) => p.evaluate((id) => {
  const svg = document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`);
  if (!svg) return null;
  const vb = svg.getAttribute('viewBox');
  const path = svg.querySelector('path');
  return { d: path ? path.getAttribute('d') : null, viewBox: vb, cols: +vb.split(' ')[2] };
}, id);
const detailWave = (p) => p.evaluate(() => {
  const c = document.querySelector('[data-testid="arrangement-detail-waveform"]');
  const svg = c && c.querySelector('svg');
  if (!svg) return null;
  const vb = svg.getAttribute('viewBox');
  const path = svg.querySelector('path');
  return { d: path ? path.getAttribute('d') : null, viewBox: vb, cols: +vb.split(' ')[2] };
});

function ratio(w0, w1, s) {
  const r = { s: +s.toFixed(6), judged: 0, clamped: 0, floor: 0, unjudged: 0, violations: [], cols0: w0 && w0.cols, cols1: w1 && w1.cols };
  if (!w0 || !w1 || !w0.d || !w1.d) { r.valid = false; r.reason = 'missing drawing'; return r; }
  const a = parseD(w0.d), b = parseD(w1.d);
  if (a.length !== b.length || w0.cols !== w1.cols) { r.valid = false; r.reason = `column count differs ${a.length}/${b.length}`; return r; }
  let maxErr = 0, overEdge = 0;
  for (let i = 0; i < a.length; i++) {
    const h0 = 1 - a[i].y, h = 1 - b[i].y;
    if (b[i].y < 0 || b[i].y2 > 2) overEdge++;
    if (h0 >= 0.021 && h0 <= 0.999 && s * h0 >= 0.021 && s * h0 <= 0.999) {
      r.judged++;
      const e = Math.abs(h - s * h0);
      maxErr = Math.max(maxErr, e);
      if (e > 0.0006 * (1 + s) + 1e-12) r.violations.push({ i, kind: 'ratio', h0, h, exp: +(s * h0).toFixed(5) });
    } else if (h0 <= 0.999 && s * (h0 - 0.0005) >= 1) {
      r.clamped++;
      if (b[i].ys !== '0.000') r.violations.push({ i, kind: 'clamp', y: b[i].ys });
    } else if (s * (h0 + 0.0005) < 0.02) {
      r.floor++;
      if (b[i].ys !== '0.980') r.violations.push({ i, kind: 'floor', y: b[i].ys });
    } else r.unjudged++;
  }
  r.maxErr = +maxErr.toFixed(6);
  r.overEdge = overEdge;
  r.violations = r.violations.slice(0, 10);
  r.valid = r.judged >= 10;
  if (!r.valid) r.reason = `only ${r.judged} judged columns`;
  r.pass = r.valid && r.violations.length === 0 && overEdge === 0;
  return r;
}
function hist(w) {
  if (!w || !w.d) return null;
  const hs = parseD(w.d).map((c) => 1 - c.y);
  const bins = [0.02, 0.1, 0.25, 0.5, 0.707, 0.999, 1.0001];
  const out = {};
  for (let i = 0; i < bins.length - 1; i++) out[`${bins[i]}-${bins[i + 1]}`] = hs.filter((h) => h >= bins[i] && h < bins[i + 1]).length;
  out.floor = hs.filter((h) => h < 0.02 + 1e-9).length;
  out.max = Math.max(...hs);
  return out;
}

const readG = (p) => p.evaluate(([F, FIELD]) => {
  const f = document.querySelector(F); const fi = document.querySelector(FIELD);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  const b = f.getBoundingClientRect();
  return { v: +f.value, text: f.getAttribute('aria-valuetext'), field: fi.value, fieldDisabled: fi.disabled, faderDisabled: f.disabled, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') };
}, [F, FIELD]);
const undoTitle = (p) => p.evaluate(() => { const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return u && u.getAttribute('title'); });

async function setField(p, db) {
  await p.fill(FIELD, String(db));
  await p.locator(FIELD).press('Enter');
  await L.sleep(300);
  await L.blur(p);
  await L.sleep(250);
  return readG(p);
}
async function ensureDetail(p) {
  const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  await L.blur(p);
}
async function sentinel(p) {
  await p.locator('[data-track-id="sfx"] input[aria-label^="Pan"]').focus();
  await p.keyboard.press('ArrowRight');
  await L.sleep(150);
  await L.blur(p);
  await L.sleep(150);
  return undoTitle(p);
}
const undo = async (p) => { await L.blur(p); await L.sleep(150); await p.keyboard.press('Control+z'); await L.sleep(400); };
async function shotClip(p, id, name) {
  const b = await p.locator(`[data-clip-id="${id}"]`).boundingBox();
  if (b) await p.screenshot({ path: path.join(L.SHOTS, `${name}-${VPN}-${RUN}.png`), clip: { x: Math.max(0, b.x - 6), y: Math.max(0, b.y - 6), width: Math.min(b.width + 12, VP.width - Math.max(0, b.x - 6)), height: b.height + 12 } });
}

const ids = async (p) => { const c = await L.clipsDom(p); return { music: c.find((x) => x.lane === 'music').id, stems: c.find((x) => x.lane === 'stems').id, sfx: c.find((x) => x.lane === 'sfx').id, clips: c }; };

async function rowScale(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  const g0 = await readG(p);
  const w0 = await laneWave(p, I.stems);
  await shotClip(p, I.stems, 'WG-SCALE-0db');
  const g6 = await setField(p, -6);
  const w6 = await laneWave(p, I.stems);
  await shotClip(p, I.stems, 'WG-SCALE-m6');
  const g3 = await setField(p, 3);
  const w3 = await laneWave(p, I.stems);
  await shotClip(p, I.stems, 'WG-SCALE-p3');
  await p.screenshot({ path: path.join(L.SHOTS, `WG-SCALE-full-${VPN}-${RUN}.png`) });
  const r6 = ratio(w0, w6, 10 ** (num(g6.field) / 20));
  const r3 = ratio(w0, w3, 10 ** (num(g3.field) / 20));
  const res = { stems: I.stems, g0: { v: g0.v, field: g0.field, text: g0.text }, g6: { v: g6.v, field: g6.field, text: g6.text, undo: g6.undoTitle }, g3: { v: g3.v, field: g3.field, text: g3.text }, hist0: hist(w0), d0: sha(w0 && w0.d), d6: sha(w6 && w6.d), d3: sha(w3 && w3.d), r6, r3 };
  res.pass = g0.v === 0 && g6.v === -6 && g3.v === 3 && r6.pass && r3.pass;
  res.valid = r6.valid && r3.valid;
  await setField(p, 0);
  return res;
}

async function rowClampFloor(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  await setField(p, 0);
  const w0 = await laneWave(p, I.stems);
  const g12 = await setField(p, 12);
  const w12 = await laneWave(p, I.stems);
  await shotClip(p, I.stems, 'WG-CLAMP-p12');
  const g60 = await setField(p, -60);
  const w60 = await laneWave(p, I.stems);
  await shotClip(p, I.stems, 'WG-FLOOR-m60');
  const r12 = ratio(w0, w12, 10 ** (num(g12.field) / 20));
  const c60 = parseD(w60.d);
  const all980 = c60.length > 0 && c60.every((c) => c.ys === '0.980' && c.y2 === 1.02);
  // supplementary (music clip) in case stems has too few judged columns at +12
  await L.selectClip(p, I.music); await ensureDetail(p);
  const m0 = await laneWave(p, I.music);
  const mg12 = await setField(p, 12);
  const m12 = await laneWave(p, I.music);
  const rm12 = ratio(m0, m12, 10 ** (num(mg12.field) / 20));
  await setField(p, 0);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  await setField(p, 0);
  const res = { g12: { v: g12.v, field: g12.field }, g60: { v: g60.v, field: g60.field }, r12, minus60: { cols: c60.length, all980 }, supplementaryMusic12: rm12 };
  res.pass = g12.v === 12 && g60.v === -60 && r12.pass && all980;
  res.valid = r12.valid;
  return res;
}

async function rowLive(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  const before = await sentinel(p);
  const start = await laneWave(p, I.stems);
  const g0 = await readG(p);
  const x0 = g0.box.x + ((g0.v + 60) / 84) * g0.box.w, y = g0.box.y + g0.box.h / 2;
  await p.mouse.move(x0, y);
  await p.mouse.down();
  await L.sleep(60);
  for (let k = 1; k <= 20; k++) { await p.mouse.move(x0 - k, y); await L.sleep(10); }
  await L.sleep(80);
  const mid = await p.evaluate(([id, F]) => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const svg = document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`);
    const f = document.querySelector(F);
    const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
    res({ d: svg.querySelector('path').getAttribute('d'), viewBox: svg.getAttribute('viewBox'), cols: +svg.getAttribute('viewBox').split(' ')[2], text: f.getAttribute('aria-valuetext'), v: +f.value, undoTitle: u && u.getAttribute('title') });
  }))), [I.stems, F]);
  await p.screenshot({ path: path.join(L.SHOTS, `WG-LIVE-mid-${VPN}-${RUN}.png`) });
  await p.mouse.up();
  await L.sleep(350);
  await L.blur(p);
  const rel = await readG(p);
  const relW = await laneWave(p, I.stems);
  await undo(p);
  const back = await laneWave(p, I.stems);
  const gb = await readG(p);
  const midDb = num(mid.text);
  const r = ratio(start, mid, 10 ** (midDb / 20));
  const res = { before, g0: g0.v, w: g0.box.w, mid: { text: mid.text, v: mid.v, db: midDb, undoTitle: mid.undoTitle, dHash: sha(mid.d) }, startHash: sha(start.d), ratio: r, release: { v: rel.v, field: rel.field, undo: rel.undoTitle, sameAsMid: relW.d === mid.d }, afterUndo: { v: gb.v, undo: gb.undoTitle, equalsStart: back.d === start.d } };
  res.pass = mid.d !== start.d && midDb < 0 && r.pass && rel.undoTitle === 'Undo: Clip Gain' && before !== 'Undo: Clip Gain' && gb.undoTitle === before && back.d === start.d && gb.v === g0.v && mid.undoTitle === before;
  res.valid = r.valid;
  return res;
}

async function rowDetail(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  await setField(p, 0);
  const d0 = await detailWave(p);
  const g6 = await setField(p, -6);
  const d6 = await detailWave(p);
  const db = await p.locator('[data-testid="arrangement-detail-waveform"]').boundingBox();
  if (db) await p.screenshot({ path: path.join(L.SHOTS, `WG-DETAIL-m6-${VPN}-${RUN}.png`), clip: { x: db.x, y: db.y, width: db.width, height: db.height } });
  const r = ratio(d0, d6, 10 ** (num(g6.field) / 20));
  await setField(p, 0);
  const res = { cols: d0 && d0.cols, g6: g6.v, ratio: r };
  res.pass = g6.v === -6 && r.pass && d0.cols === 480;
  res.valid = r.valid;
  return res;
}

async function rowMulti(p) {
  const I = await ids(p);
  await L.selectClip(p, I.sfx); await ensureDetail(p);
  await setField(p, 0);
  const sf0 = await laneWave(p, I.sfx);
  await L.selectClip(p, I.stems);
  await setField(p, 0);
  const st0 = await laneWave(p, I.stems);
  const gs = await setField(p, -6);
  await L.selectClip(p, I.sfx);
  const gf = await setField(p, 0);
  const stA = await laneWave(p, I.stems), sfA = await laneWave(p, I.sfx);
  await L.selectClip(p, I.stems);
  await L.selectClip(p, I.sfx, ['Control']);
  const selN = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length);
  const gm0 = await readG(p);
  const x0 = gm0.box.x + ((gm0.v + 60) / 84) * gm0.box.w, y = gm0.box.y + gm0.box.h / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 10; k++) { await p.mouse.move(x0 - k, y); await L.sleep(15); }
  await L.sleep(60); await p.mouse.up(); await L.sleep(350); await L.blur(p);
  const gm1 = await readG(p);
  const stB = await laneWave(p, I.stems), sfB = await laneWave(p, I.sfx);
  await p.screenshot({ path: path.join(L.SHOTS, `WG-MULTI-${VPN}-${RUN}.png`) });
  await L.selectClip(p, I.music); await L.selectClip(p, I.stems); const gS = await readG(p);
  await L.selectClip(p, I.music); await L.selectClip(p, I.sfx); const gF = await readG(p);
  const rA = ratio(st0, stA, 10 ** (num(gs.field) / 20));
  const rS = ratio(st0, stB, 10 ** (num(gS.field) / 20));
  const rF = ratio(sf0, sfB, 10 ** (num(gF.field) / 20));
  const res = { selN, preset: { stems: gs.field, sfx: gf.field, sfxUnchanged: sfA.d === sf0.d }, rA, multi: { text0: gm0.text, text1: gm1.text, undo: gm1.undoTitle }, after: { stems: gS.field, sfx: gF.field }, rStems: rS, rSfx: rF, changed: { stems: stB.d !== stA.d, sfx: sfB.d !== sfA.d } };
  res.pass = selN === 2 && gs.v === -6 && sfA.d === sf0.d && rA.pass && num(gS.field) < -6 && num(gF.field) < 0 && rS.pass && rF.pass && res.changed.stems && res.changed.sfx && gm1.undoTitle === 'Undo: Clip Gain';
  res.valid = rA.valid && rS.valid && rF.valid;
  // reset both
  await L.selectClip(p, I.music); await L.selectClip(p, I.stems); await setField(p, 0);
  await L.selectClip(p, I.sfx); await setField(p, 0);
  return res;
}

async function rowMustNot(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  await setField(p, -6);
  const base = await laneWave(p, I.stems);
  const geom0 = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const b = e.getBoundingClientRect(); return { start: e.getAttribute('data-clip-start'), w: +b.width.toFixed(2) }; }, I.stems);
  const steps = {};
  const check = async (label, extra) => { const w = await laneWave(p, I.stems); steps[label] = { same: w.d === base.d, cols: w.cols, ...(extra || {}) }; };
  // lane volume −12
  const lv = '[data-track-id="stems"] input[type=range][aria-label^="Volume"]';
  await p.locator(lv).focus();
  for (let k = 0; k < 120; k++) await p.keyboard.press('ArrowLeft');
  await L.sleep(200); await L.blur(p); await L.sleep(200);
  await check('laneVolume', { value: await p.locator(lv).inputValue() });
  // master −12
  const mv = 'input[aria-label="Master Volume"]';
  const ms = +(await p.locator(mv).getAttribute('step'));
  await p.locator(mv).focus();
  for (let k = 0; k < Math.round(12 / ms); k++) await p.keyboard.press('ArrowLeft');
  await L.sleep(200); await L.blur(p); await L.sleep(200);
  await check('master', { value: await p.locator(mv).inputValue(), step: ms });
  // pan
  const pn = '[data-track-id="stems"] input[aria-label^="Pan"]';
  await p.locator(pn).focus();
  for (let k = 0; k < 5; k++) await p.keyboard.press('ArrowLeft');
  await L.sleep(200); await L.blur(p);
  await check('pan', { value: await p.locator(pn).inputValue() });
  // mute / solo
  await p.click('[data-track-id="stems"] button[aria-label^="Mute"]'); await L.sleep(250); await L.blur(p);
  await check('mute', { pressed: await p.locator('[data-track-id="stems"] button[aria-label^="Mute"]').getAttribute('aria-pressed') });
  await p.click('[data-track-id="stems"] button[aria-label^="Solo"]'); await L.sleep(250); await L.blur(p);
  await check('solo', { pressed: await p.locator('[data-track-id="stems"] button[aria-label^="Solo"]').getAttribute('aria-pressed') });
  // fade-in 1 s
  const z = (await L.geo(p)).pps;
  const cb = await p.locator(`[data-clip-id="${I.stems}"]`).boundingBox();
  await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height * 0.6, { steps: 3 }); await L.sleep(300);
  const hb = await p.locator(`[data-clip-id="${I.stems}"] [data-testid=arrangement-clip-fade-in-handle]`).boundingBox();
  if (hb) {
    const hx = hb.x + hb.width / 2, hy = hb.y + hb.height / 2;
    await p.mouse.move(hx, hy, { steps: 2 }); await L.sleep(100);
    await p.mouse.down(); await p.mouse.move(hx + z / 2, hy, { steps: 5 }); await p.mouse.move(hx + z, hy, { steps: 5 }); await L.sleep(150); await p.mouse.up(); await L.sleep(400);
  }
  await L.blur(p);
  const fade = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const b = e.getBoundingClientRect(); return { fadeIn: e.dataset.fadeIn, start: e.getAttribute('data-clip-start'), w: +b.width.toFixed(2) }; }, I.stems);
  await check('fadeIn', { handle: !!hb, ...fade, geomSame: fade.start === geom0.start && Math.abs(fade.w - geom0.w) < 0.6 });
  // envelope breakpoint
  await p.keyboard.press('a'); await L.sleep(400);
  const mode = await p.evaluate(() => (document.querySelector('[data-envelope-mode]') || {}).dataset?.envelopeMode);
  const ed = await p.locator(`[data-clip-id="${I.stems}"] [data-testid=arrangement-clip-envelope-editor]`).boundingBox();
  if (ed) { await p.mouse.dblclick(ed.x + ed.width * 0.6, ed.y + ed.height * 0.5); await L.sleep(400); }
  const pts = await p.locator(`[data-clip-id="${I.stems}"] [data-testid=arrangement-clip-envelope-point]`).count();
  await shotClip(p, I.stems, 'WG-MUSTNOT-fade-envelope');
  await check('envelope', { mode, editor: !!ed, points: pts, undo: await undoTitle(p) });
  await p.keyboard.press('a'); await L.sleep(300);
  await check('envelopeOff');
  await p.screenshot({ path: path.join(L.SHOTS, `WG-MUSTNOT-${VPN}-${RUN}.png`) });
  const res = { base: sha(base.d), cols: base.cols, geom0, steps };
  res.pass = Object.values(steps).every((s) => s.same) && steps.laneVolume.value === '-12' && steps.mute.pressed === 'true' && steps.solo.pressed === 'true' && steps.fadeIn.handle && +steps.fadeIn.fadeIn > 0.5 && steps.fadeIn.geomSame && steps.envelope.points >= 1;
  return res;
}

// Neighbours: zoom in/out ratio at new column count; move + range drag on the −6 clip.
async function rowNeighbour(p) {
  const I = await ids(p);
  await L.selectClip(p, I.stems); await ensureDetail(p);
  const out = {};
  for (const key of ['=', '-']) {
    await L.blur(p);
    const z0 = (await L.geo(p)).pps;
    await p.keyboard.press(key === '=' ? 'Equal' : 'Minus'); await L.sleep(500);
    const z1 = (await L.geo(p)).pps;
    await setField(p, 0);
    const w0 = await laneWave(p, I.stems);
    const g6 = await setField(p, -6);
    const w6 = await laneWave(p, I.stems);
    out[key === '=' ? 'zoomIn' : 'zoomOut'] = { z0, z1, cols: w6.cols, ratio: ratio(w0, w6, 10 ** (num(g6.field) / 20)) };
  }
  const stOf = () => p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'), I.stems);
  const gainNow = async () => (await readG(p)).field;
  const before = await laneWave(p, I.stems);
  const z = (await L.geo(p)).pps;
  // move: header drag +0.5 s
  const t0 = await undoTitle(p);
  const st0 = await stOf();
  const hb = await p.locator(`[data-clip-id="${I.stems}"] > div`).first().boundingBox();
  const hx = hb.x + Math.min(30, hb.width / 2), hy = hb.y + hb.height / 2;
  await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx + z * 0.25, hy, { steps: 4 }); await p.mouse.move(hx + z * 0.5, hy, { steps: 4 }); await L.sleep(100); await p.mouse.up(); await L.sleep(400);
  const st1 = await stOf();
  const moved = await laneWave(p, I.stems);
  const t1 = await undoTitle(p);
  const g1 = await gainNow();
  await undo(p);
  const st2 = await stOf();
  const back = await laneWave(p, I.stems);
  out.move = { st0, st1, st2, undoBefore: t0, undoAfterMove: t1, gainAfterMove: g1, gainAfterUndo: await gainNow(), drawingSameMoved: moved.d === before.d, drawingSameUndo: back.d === before.d };
  // range drag inside the waveform area (40% → 60%)
  const r0 = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null);
  const st3 = await stOf();
  const wb = await p.locator(`[data-clip-id="${I.stems}"] [data-testid="arrangement-clip-waveform"]`).boundingBox();
  const vx0 = Math.min(wb.x + wb.width * 0.3, VP.width - 200), y = wb.y + wb.height * 0.6;
  await p.mouse.move(vx0, y); await p.mouse.down(); await p.mouse.move(vx0 + z, y, { steps: 6 }); await p.mouse.move(vx0 + 2 * z, y, { steps: 6 }); await L.sleep(100); await p.mouse.up(); await L.sleep(400);
  const afterRange = await laneWave(p, I.stems);
  out.range = { rangeBefore: r0, rangeAfter: await p.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null), startBefore: st3, startAfter: await stOf(), undo: await undoTitle(p), gain: await gainNow(), drawingSame: afterRange.d === before.d };
  await shotClip(p, I.stems, 'NB-after-move-range');
  out.pass = out.zoomIn.ratio.pass && out.zoomOut.ratio.pass && out.zoomIn.z1 > out.zoomIn.z0 && out.zoomOut.z1 < out.zoomOut.z0 && +st1 > +st0 && st2 === st0 && out.move.drawingSameMoved && out.move.drawingSameUndo && out.move.gainAfterUndo === '-6.0' && out.range.drawingSame && out.range.startAfter === out.range.startBefore;
  await setField(p, 0);
  return out;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `wg-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: undefined })); L.save(L.OUT, `${tag}.json`, out); };
  const fresh = async () => {
    const o = await L.openStudio(browser, VP, `${tag}-s${net.length + 1}`, net);
    const p = o.page;
    o.snap = await L.setSnapOff(p);
    o.adds = [];
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) o.adds.push(await L.addAt(p, s, ln, t));
    await L.blur(p);
    await p.keyboard.press('Home');
    await L.sleep(300);
    return o;
  };
  const rows = [
    ['WG-LIVE', rowLive, false],
    ['WG-SCALE', rowScale, false],
    ['WG-CLAMP-FLOOR', rowClampFloor, false],
    ['WG-DETAIL', rowDetail, false],
    ['WG-MULTI', rowMulti, true],
    ['WG-MUSTNOT', rowMustNot, true],
    ['NB-NEIGHBOUR', rowNeighbour, true],
  ];
  const ONLY = process.env.ROWS ? process.env.ROWS.split(',') : null;
  let o = await fresh();
  out.setup = { snap: o.snap, adds: o.adds, clips: await L.clipsDom(o.page) };
  save();
  for (const [id, fn, needsFresh] of rows) {
    if (ONLY && !ONLY.includes(id)) continue;
    if (needsFresh) { await o.ctx.close(); o = await fresh(); }
    try {
      const r = await fn(o.page);
      out.rows[id] = r;
      console.log(id, 'pass=', r.pass, 'valid=', r.valid, JSON.stringify(r).slice(0, 900));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 300));
      await o.page.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
      await o.page.mouse.up().catch(() => {});
      await L.blur(o.page).catch(() => {});
    }
    save();
  }
  await o.ctx.close();
  save();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
