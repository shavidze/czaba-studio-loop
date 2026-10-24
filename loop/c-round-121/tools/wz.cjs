// C round 121 — Waveform Vertical Zoom browser rows. Usage: ROWS=a,b node wz.cjs <1440|1280> <run#>
// Criteria fixed before running (current-task.md §5): ratio rule |h − s·h0| ≤ 0.0006·(1+s); clamped y=0.000; floor y=0.980;
// ≥10 judged columns or invalid; 1× drawings equal the B baseline sha256; chrome rows [28,20,20,16]; lane y equal baseline.
const L = require('./lib.cjs');
const path = require('path');
const crypto = require('crypto');
const BASE = require('/home/runner/czaba-project/tmp/studio-real-loop/b-round-120/probe/baseline-r121.json');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const SEL = '[data-testid=arrangement-waveform-zoom]';
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const LEVELS = ['0.5', '1', '2', '4', '8'];
const STATUS = (pct) => `Waveform Zoom ${pct}% — მხოლოდ ხედი, ხმა არ იცვლება.`;
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[^\d.+-]/g, ''));
const sha = (s) => (s == null ? null : crypto.createHash('sha256').update(s).digest('hex'));

function parseD(d) { const re = /M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g; const c = []; let m; while ((m = re.exec(d))) c.push({ y: +m[2], ys: m[2], y2: +m[3] }); return c; }
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
      r.judged++; const e = Math.abs(h - s * h0); maxErr = Math.max(maxErr, e);
      if (e > 0.0006 * (1 + s) + 1e-12) r.violations.push({ i, kind: 'ratio', h0, h, exp: +(s * h0).toFixed(5) });
    } else if (h0 <= 0.999 && s * (h0 - 0.0005) >= 1) { r.clamped++; if (b[i].ys !== '0.000') r.violations.push({ i, kind: 'clamp', y: b[i].ys }); }
    else if (s * (h0 + 0.0005) < 0.02) { r.floor++; if (b[i].ys !== '0.980') r.violations.push({ i, kind: 'floor', y: b[i].ys }); }
    else r.unjudged++;
  }
  r.maxErr = +maxErr.toFixed(6); r.overEdge = overEdge; r.violations = r.violations.slice(0, 10);
  r.valid = r.judged >= 10; if (!r.valid) r.reason = `only ${r.judged} judged columns`;
  r.pass = r.valid && r.violations.length === 0 && overEdge === 0;
  return r;
}

const waves = (p) => p.evaluate(() => {
  const out = {};
  for (const e of document.querySelectorAll('[data-clip-id]')) {
    const s = e.querySelector('[data-testid="arrangement-clip-waveform"]'); const path = s ? s.querySelector('path') : null;
    const lane = e.closest('[data-track-id]').dataset.trackId;
    out[`${lane}@${e.getAttribute('data-clip-start')}`] = { id: e.getAttribute('data-clip-id'), lane, kind: e.dataset.clipKind, d: path ? path.getAttribute('d') : null, viewBox: s ? s.getAttribute('viewBox') : null, cols: s ? +s.getAttribute('viewBox').split(' ')[2] : null };
  }
  return out;
});
const detailWave = (p) => p.evaluate(() => { const c = document.querySelector('[data-testid="arrangement-detail-waveform"]'); const s = c && c.querySelector('svg'); if (!s) return null; const pa = s.querySelector('path'); return { d: pa ? pa.getAttribute('d') : null, cols: +s.getAttribute('viewBox').split(' ')[2] }; });
const layout = (p) => p.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  const chrome = g.parentElement.parentElement;
  const rows = [...chrome.children].map((r) => Math.round(r.getBoundingClientRect().height * 10) / 10);
  const lanes = [...document.querySelectorAll('[data-track-id]')].filter((e) => e.querySelector('[data-testid="arrangement-track-header"]')).map((e) => { const b = e.getBoundingClientRect(); return { id: e.dataset.trackId, y: Math.round(b.top * 10) / 10, h: Math.round(b.height * 10) / 10 }; });
  const s = document.querySelector('[data-testid=arrangement-waveform-zoom]');
  const gb = g.getBoundingClientRect(); const sb = s ? s.getBoundingClientRect() : null;
  return {
    rows, lanes, attr: g.dataset.waveformZoom, value: s && s.value, shown: s && s.options[s.selectedIndex].textContent, lastChild: g.lastElementChild === s,
    selRight: sb && Math.round((sb.right - gb.left) * 10) / 10, selW: sb && Math.round(sb.width * 10) / 10, gW: Math.round(gb.width * 10) / 10, scrollW: g.scrollWidth, clientW: g.clientWidth, gridH: Math.round(gb.height * 10) / 10,
    title: s && s.title, aria: s && s.getAttribute('aria-label'), cls: s && s.className, options: s && [...s.options].map((o) => `${o.value}:${o.textContent}`),
    status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim(),
    undo: (() => { const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return u ? `${u.getAttribute('title')}|${u.disabled}` : null; })(),
    redo: (() => { const u = [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.getAttribute('title') || '')); return u ? `${u.getAttribute('title')}|${u.disabled}` : null; })(),
    zoomReadout: (document.querySelector('[data-testid=arrangement-zoom-readout]') || {}).textContent,
  };
});
const baseLanes = () => Object.fromEntries(BASE[VPN].lanes.map((l) => [l.id, l.y]));
function layoutOk(lay) {
  const b = baseLanes();
  const bh = Object.fromEntries(BASE[VPN].lanes.map((l) => [l.id, l.h]));
  return JSON.stringify(lay.rows) === JSON.stringify(BASE[VPN].chromeRowHeights) && lay.lanes.every((l) => b[l.id] === undefined || (b[l.id] === l.y && bh[l.id] === l.h)) && lay.lanes.filter((l) => b[l.id] !== undefined).length === 4;
}
function baselineCmp(W) {
  const res = {};
  for (const c of BASE[VPN].clips) { const k = `${c.lane}@${c.start}`; const w = W[k]; res[c.lane] = { base: c.dSha256.slice(0, 8), now: w && sha(w.d) ? sha(w.d).slice(0, 8) : null, eq: !!w && sha(w.d) === c.dSha256 }; }
  res.all = Object.values(res).every((x) => x.eq);
  return res;
}

const methods = [];
async function chooseZoom(p, level) {
  await L.blur(p);
  const cur = await p.$eval(SEL, (s) => s.value);
  const diff = LEVELS.indexOf(String(level)) - LEVELS.indexOf(cur);
  if (diff === 0) return { method: 'none', value: cur };
  const b = await p.locator(SEL).boundingBox();
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await L.sleep(250);
  for (let i = 0; i < Math.abs(diff); i++) { await p.keyboard.press(diff > 0 ? 'ArrowDown' : 'ArrowUp'); await L.sleep(80); }
  await p.keyboard.press('Enter');
  await L.sleep(350);
  let value = await p.$eval(SEL, (s) => s.value);
  let method = 'mouse-click-opens-popup+keyboard-pick';
  if (value !== String(level)) { await p.selectOption(SEL, String(level)); await L.sleep(300); value = await p.$eval(SEL, (s) => s.value); method = 'FALLBACK selectOption'; }
  await L.blur(p); await L.sleep(300);
  methods.push(method);
  return { method, value };
}

const readG = (p) => p.evaluate(([F, FIELD]) => { const f = document.querySelector(F); const fi = document.querySelector(FIELD); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); const b = f.getBoundingClientRect(); return { v: +f.value, text: f.getAttribute('aria-valuetext'), field: fi.value, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; }, [F, FIELD]);
const undoTitle = (p) => p.evaluate(() => { const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return u && u.getAttribute('title'); });
async function setField(p, db) { await p.fill(FIELD, String(db)); await p.locator(FIELD).press('Enter'); await L.sleep(300); await L.blur(p); await L.sleep(250); return readG(p); }
async function ensureDetail(p) { const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded')); if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); } await L.blur(p); }
const shot = (p, name) => p.screenshot({ path: path.join(L.SHOTS, `${name}-${VPN}-${RUN}.png`) });
const key = (lane, W) => Object.keys(W).find((k) => k.startsWith(`${lane}@`));

function ratios3(W0, W1, s) {
  const r = {};
  for (const ln of ['music', 'stems', 'sfx']) r[ln] = ratio(W0[key(ln, W0)], W1[key(ln, W1)], s);
  return r;
}
const brief = (r) => ({ pass: r.pass, valid: r.valid, judged: r.judged, clamped: r.clamped, floor: r.floor, maxErr: r.maxErr, overEdge: r.overEdge, cols: r.cols1, viol: r.violations.length, reason: r.reason });

async function rowPresentT7(p) {
  const lay1 = await layout(p);
  const W1 = await waves(p);
  await shot(p, 'WZ-T7-1x');
  const present = { lay: lay1, layoutOk: layoutOk(lay1), baseline: baselineCmp(W1) };
  present.pass = lay1.lastChild && lay1.value === '1' && lay1.shown === '1×' && lay1.attr === '1' && lay1.selRight <= 216 && lay1.scrollW <= lay1.clientW && present.layoutOk && present.baseline.all && lay1.gridH === 28;
  const c = await chooseZoom(p, 2);
  const lay2 = await layout(p);
  const W2 = await waves(p);
  await shot(p, 'WZ-T7-2x');
  const r = ratios3(W1, W2, 2);
  const vid = key('video', W1);
  const t7 = { choose: c, lay: { rows: lay2.rows, lanes: lay2.lanes, attr: lay2.attr, value: lay2.value, shown: lay2.shown, status: lay2.status, title: lay2.title, cls: lay2.cls, scrollW: lay2.scrollW, clientW: lay2.clientW }, layoutOk: layoutOk(lay2), videoSame: W2[vid].d === W1[vid].d, ratio: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, brief(v)])) };
  // detail panel with stems selected: 2× vs 1×
  await L.selectClip(p, W2[key('stems', W2)].id); await ensureDetail(p);
  const dAt2 = await detailWave(p);
  await chooseZoom(p, 1);
  const dAt1 = await detailWave(p);
  const W1b = await waves(p);
  t7.detail = { cols: dAt1 && dAt1.cols, same: !!dAt1 && !!dAt2 && dAt1.d === dAt2.d, sha: dAt1 && sha(dAt1.d).slice(0, 12) };
  t7.backTo1 = baselineCmp(W1b);
  t7.pass = c.value === '2' && lay2.attr === '2' && lay2.status === STATUS(200) && t7.layoutOk && t7.videoSame && Object.values(r).every((x) => x.pass) && r.music.clamped + r.stems.clamped + r.sfx.clamped > 0 && t7.detail.same && /border-accent/.test(lay2.cls) && lay2.title === 'Waveform Zoom 200% — მხოლოდ ხედი, ხმა არ იცვლება';
  return { present, t7 };
}

async function rowLevels(p) {
  const W1 = await waves(p);
  const out = {};
  for (const [lv, pct] of [[0.5, 50], [4, 400], [8, 800]]) {
    const c = await chooseZoom(p, lv);
    const lay = await layout(p);
    const W = await waves(p);
    const r = ratios3(W1, W, lv);
    out[lv] = { choose: c, attr: lay.attr, status: lay.status, statusOk: lay.status === STATUS(pct), layoutOk: layoutOk(lay), videoSame: W[key('video', W)].d === W1[key('video', W1)].d, ratio: Object.fromEntries(Object.entries(r).map(([k, v]) => [k, brief(v)])) };
    // per-level: all judged clips must pass; clips with <10 judged are invalid (reported), music must be valid
    out[lv].pass = out[lv].statusOk && out[lv].layoutOk && out[lv].videoSame && Object.values(r).every((x) => x.violations.length === 0 && x.overEdge === 0);
    out[lv].valid = r.music.valid;
    await shot(p, `WZ-LEVELS-${lv}x`);
  }
  await chooseZoom(p, 1);
  out.back = baselineCmp(await waves(p));
  out.pass = out[0.5].pass && out[4].pass && out[8].pass && out.back.all;
  out.valid = out[0.5].valid && out[4].valid && out[8].valid;
  return out;
}

async function rowGain(p) {
  const W1 = await waves(p);
  const stems = W1[key('stems', W1)];
  await L.selectClip(p, stems.id); await ensureDetail(p);
  const g6 = await setField(p, -6);
  const tAfterSet = await undoTitle(p);
  await chooseZoom(p, 2);
  const W2 = await waves(p);
  const rRest = ratio(stems, W2[key('stems', W2)], 10 ** (num(g6.field) / 20) * 2);
  const g0 = await readG(p);
  const x0 = g0.box.x + ((g0.v + 60) / 84) * g0.box.w, y = g0.box.y + g0.box.h / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 20; k++) { await p.mouse.move(x0 - k, y); await L.sleep(10); }
  await L.sleep(80);
  const mid = await p.evaluate(([id, F]) => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const s = document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`); const f = document.querySelector(F);
    const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
    res({ d: s.querySelector('path').getAttribute('d'), cols: +s.getAttribute('viewBox').split(' ')[2], text: f.getAttribute('aria-valuetext'), undo: u && u.getAttribute('title') });
  }))), [stems.id, F]);
  await shot(p, 'WZ-GAIN-middrag-2x');
  await p.mouse.up(); await L.sleep(350); await L.blur(p);
  const rel = await readG(p);
  const midDb = num(mid.text);
  const rMid = ratio(stems, mid, 10 ** (midDb / 20) * 2);
  // one entry: Ctrl+Z goes back to −6.0
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(400);
  const afterUndo = await readG(p);
  const zAfter = await layout(p);
  const res = { set: { v: g6.v, field: g6.field, undo: tAfterSet }, rest: brief(rRest), mid: { text: mid.text, db: midDb, undoDuring: mid.undo, ratio: brief(rMid) }, release: { field: rel.field, undo: rel.undoTitle }, afterUndo: { field: afterUndo.field, undo: afterUndo.undoTitle, zoom: zAfter.attr } };
  res.pass = g6.v === -6 && rRest.pass && Math.abs(rRest.s - 1.002374) < 1e-6 && midDb < -6 && rMid.pass && rel.undoTitle === 'Undo: Clip Gain' && afterUndo.field === '-6.0' && zAfter.attr === '2';
  res.valid = rRest.valid && rMid.valid;
  return res;
}

async function rowHistory(p) {
  const W1 = await waves(p);
  const stems = W1[key('stems', W1)];
  await L.selectClip(p, stems.id); await ensureDetail(p);
  await setField(p, -6);
  const a = await layout(p);
  await chooseZoom(p, 4);
  const b = await layout(p);
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(450);
  const gU = await readG(p); const c = await layout(p);
  await L.blur(p); await p.keyboard.press('Control+Shift+z'); await L.sleep(450);
  const gR = await readG(p); const d = await layout(p);
  const res = { before: { undo: a.undo, redo: a.redo }, afterZoom: { undo: b.undo, redo: b.redo, attr: b.attr }, afterCtrlZ: { field: gU.field, attr: c.attr, value: c.value, undo: c.undo }, afterRedo: { field: gR.field, attr: d.attr, value: d.value, undo: d.undo } };
  res.pass = a.undo === b.undo && a.redo === b.redo && /Clip Gain/.test(a.undo) && num(gU.field) === 0 && c.attr === '4' && c.value === '4' && gR.field === '-6.0' && d.attr === '4' && d.value === '4';
  await chooseZoom(p, 1);
  await setField(p, 0);
  return res;
}

async function rowNewClip(p) {
  await chooseZoom(p, 2);
  const add = await L.addAt(p, 'demo-soft-impact', 'sfx', 8);
  const W2 = await waves(p);
  const k = Object.keys(W2).find((x) => x.startsWith('sfx@') && Math.abs(+x.split('@')[1] - 8) < 0.01);
  await shot(p, 'WZ-NEWCLIP-2x');
  await chooseZoom(p, 1);
  const W1 = await waves(p);
  const r = ratio(W1[k], W2[k], 2);
  const res = { add, key: k, ratio: brief(r), cols: W1[k] && W1[k].cols };
  res.pass = !!k && r.pass; res.valid = r.valid;
  return res;
}

async function rowKeys(p) {
  const W1 = await waves(p);
  const stems = W1[key('stems', W1)];
  await L.selectClip(p, stems.id);
  const st = () => p.evaluate((id) => ({ start: document.querySelector(`[data-clip-id="${id}"]`)?.getAttribute('data-clip-start'), n: document.querySelectorAll('[data-clip-id]').length, playing: !!document.querySelector('button[aria-label="Pause"]'), pos: +document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'), undo: [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''))?.getAttribute('title'), zoom: document.querySelector('[data-testid=arrangement-waveform-zoom]').value, attr: document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom, act: document.activeElement?.dataset?.testid, sel: [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length }), stems.id);
  const s0 = await st();
  await p.locator(SEL).focus(); await L.sleep(150);
  const steps = [];
  for (const k of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'Delete', 'Space']) {
    await p.keyboard.press(k); await L.sleep(400);
    const s = await st();
    const W = await waves(p);
    const z = +s.zoom;
    const rr = ratio(stems, W[key('stems', W)], z);
    steps.push({ k, ...s, drawFollows: z === 1 ? W[key('stems', W)].d === stems.d : rr.pass });
  }
  await p.keyboard.press('Escape').catch(() => {});
  await L.blur(p);
  const res = { s0, steps };
  res.pass = steps.every((s) => s.start === s0.start && s.n === s0.n && !s.playing && s.undo === s0.undo && s.attr === s.zoom && s.drawFollows && s.act === 'arrangement-waveform-zoom');
  await chooseZoom(p, 1);
  return res;
}

async function rowNeighbours(p) {
  const out = {};
  await chooseZoom(p, 2);
  for (const k of ['Equal', 'Minus']) {
    await L.blur(p);
    const z0 = (await L.geo(p)).pps;
    await p.keyboard.press(k); await L.sleep(600);
    const z1 = (await L.geo(p)).pps;
    const W2 = await waves(p);
    await chooseZoom(p, 1);
    const W1 = await waves(p);
    await chooseZoom(p, 2);
    const r = ratios3(W1, W2, 2);
    out[k] = { z0, z1, ratio: Object.fromEntries(Object.entries(r).map(([a, v]) => [a, brief(v)])), pass: Object.values(r).every((x) => x.violations.length === 0 && x.overEdge === 0) && r.music.valid };
  }
  // move + undo
  const W = await waves(p); const stems = W[key('stems', W)];
  const stOf = () => p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).getAttribute('data-clip-start'), stems.id);
  const z = (await L.geo(p)).pps; const st0 = await stOf();
  const hb = await p.locator(`[data-clip-id="${stems.id}"] > div`).first().boundingBox();
  const hx = hb.x + Math.min(30, hb.width / 2), hy = hb.y + hb.height / 2;
  await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx + z * 0.25, hy, { steps: 4 }); await p.mouse.move(hx + z * 0.5, hy, { steps: 4 }); await L.sleep(100); await p.mouse.up(); await L.sleep(400);
  const st1 = await stOf(); const u1 = await undoTitle(p); const zm1 = (await layout(p)).attr;
  await L.blur(p); await p.keyboard.press('Control+z'); await L.sleep(450);
  const st2 = await stOf(); const zm2 = await layout(p);
  out.move = { st0, st1, st2, undo: u1, zoomAfterMove: zm1, zoomAfterUndo: zm2.attr, value: zm2.value };
  out.move.pass = +st1 > +st0 && st2 === st0 && zm1 === '2' && zm2.attr === '2' && zm2.value === '2';
  // snap toggle + grid division + Env toggle
  const gd = () => p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); return { snap: g.dataset.snap, div: g.dataset.gridDivision, env: g.dataset.envelopeMode, zoom: g.dataset.waveformZoom }; });
  const g0 = await gd();
  await p.click('[data-testid=arrangement-snap-toggle]'); await L.sleep(250); await L.blur(p); const g1 = await gd();
  await p.click('[data-testid=arrangement-snap-toggle]'); await L.sleep(250); await L.blur(p); const g2 = await gd();
  const divSel = '[data-testid=arrangement-grid-division]';
  const opts = await p.$$eval(`${divSel} option`, (os) => os.map((o) => o.value));
  const curDiv = await p.$eval(divSel, (s) => s.value);
  const other = opts.find((v) => v !== curDiv);
  await p.selectOption(divSel, other); await L.sleep(300); await L.blur(p); const g3 = await gd();
  await p.selectOption(divSel, curDiv); await L.sleep(300); await L.blur(p);
  // fade-in on stems + envelope breakpoint, screenshot over 2× drawing
  const cb = await p.locator(`[data-clip-id="${stems.id}"]`).boundingBox();
  await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height * 0.6, { steps: 3 }); await L.sleep(300);
  const fh = await p.locator(`[data-clip-id="${stems.id}"] [data-testid=arrangement-clip-fade-in-handle]`).boundingBox();
  if (fh) { const fx = fh.x + fh.width / 2, fy = fh.y + fh.height / 2; await p.mouse.move(fx, fy, { steps: 2 }); await p.mouse.down(); await p.mouse.move(fx + z / 2, fy, { steps: 5 }); await p.mouse.move(fx + z, fy, { steps: 5 }); await L.sleep(150); await p.mouse.up(); await L.sleep(400); }
  await L.blur(p);
  const fadeIn = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeIn, stems.id);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await L.sleep(400); await L.blur(p);
  const g4 = await gd();
  const ed = await p.locator(`[data-clip-id="${stems.id}"] [data-testid=arrangement-clip-envelope-editor]`).boundingBox();
  if (ed) { await p.mouse.dblclick(ed.x + ed.width * 0.6, ed.y + ed.height * 0.5); await L.sleep(400); }
  const pts = await p.locator(`[data-clip-id="${stems.id}"] [data-testid=arrangement-clip-envelope-point]`).count();
  const b = await p.locator(`[data-clip-id="${stems.id}"]`).boundingBox();
  await p.screenshot({ path: path.join(L.SHOTS, `NB-fade-envelope-2x-${VPN}-${RUN}.png`), clip: { x: Math.max(0, b.x - 6), y: b.y - 6, width: Math.min(b.width + 12, VP.width - Math.max(0, b.x - 6)), height: b.height + 12 } });
  const Wd = await waves(p);
  const overlay = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); return { waveform: !!e.querySelector('[data-testid="arrangement-clip-waveform"] path'), fadeRamp: e.querySelectorAll('[data-testid*=fade]').length, envelope: !!e.querySelector('[data-testid=arrangement-clip-envelope-editor]') }; }, stems.id);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await L.sleep(300); await L.blur(p); const g5 = await gd();
  out.controls = { g0, g1, g2, g3, g4, g5, fadeIn, points: pts, overlay, stemsDrawingStillZoomedDiffers: Wd[key('stems', Wd)].d !== stems.d ? 'changed-by-fade?' : 'same' };
  out.controls.pass = g1.snap !== g0.snap && g2.snap === g0.snap && g3.div !== g0.div && g4.env === 'on' && g5.env === 'off' && +fadeIn > 0.5 && pts >= 1 && overlay.waveform && g0.zoom === '2' && g5.zoom === '2';
  out.pass = out.Equal.pass && out.Minus.pass && out.move.pass && out.controls.pass;
  return out;
}

async function rowReload(p) {
  await chooseZoom(p, 4);
  const a = await layout(p);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await L.sleep(2500);
  const b = await layout(p);
  const ls = await p.evaluate(() => Object.keys(localStorage).filter((k) => /zoom|waveform/i.test(k)).map((k) => `${k}=${localStorage.getItem(k).slice(0, 80)}`));
  await shot(p, 'WZ-RELOAD-after');
  const res = { before: { attr: a.attr, value: a.value }, after: { attr: b.attr, value: b.value, shown: b.shown }, lsZoomKeys: ls };
  res.pass = a.attr === '4' && b.attr === '1' && b.value === '1' && b.shown === '1×';
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `wz-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {}, invalid: [] };
  const save = () => { out.methods = methods; out.net = net.map((n) => ({ ...n, downloads: undefined })); L.save(L.OUT, `${tag}.json`, out); };
  const fresh = async () => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      let o;
      try {
        o = await L.openStudio(browser, VP, `${tag}-s${net.length + 1}`, net);
        const p = o.page;
        o.snap = await L.setSnapOff(p);
        for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
        await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
        await L.blur(p); await p.keyboard.press('Home'); await L.sleep(800);
        return o;
      } catch (e) { out.invalid.push(`setup attempt ${attempt}: ${String(e).slice(0, 200)}`); if (o) await o.ctx.close(); if (attempt === 2) throw e; }
    }
  };
  const all = VPN === '1440'
    ? [['PRESENT-T7', rowPresentT7], ['WZ-LEVELS', rowLevels], ['WZ-GAIN', rowGain], ['WZ-HISTORY', rowHistory], ['WZ-NEWCLIP', rowNewClip], ['WZ-KEYS', rowKeys], ['NB', rowNeighbours]]
    : [['PRESENT-T7', rowPresentT7], ['WZ-RELOAD', rowReload]];
  const ONLY = process.env.ROWS ? process.env.ROWS.split(',') : null;
  for (const [id, fn] of all) {
    if (ONLY && !ONLY.includes(id)) continue;
    let o;
    try {
      o = await fresh();
      const r = await fn(o.page);
      out.rows[id] = r;
      console.log(id, 'pass=', r.pass, JSON.stringify(r).slice(0, 1500));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 400));
      if (o) await o.page.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
    }
    if (o) await o.ctx.close();
    save();
  }
  save();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
