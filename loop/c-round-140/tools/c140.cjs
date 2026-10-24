// C round 140: V-0.4c envelope / group header / meter strings. node c140.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from the task §1.1 (never imported from the app).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'ღამის პულსი', 'სინთეზური დემო', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია', 'საჯარო preview'];
const FROZEN = [['demo-ready load-time status (collection.ts, V-0.5)', /^დემო კოლექცია მზადაა\./]];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (gc(t) && re.test(t)) { used.push(n); t = ''; } }
  if (/ჯგუფი \d+/.test(t)) { used.push('data default group name ჯგუფი N (groups.ts prefix, V-0.4d)'); t = t.replace(/ჯგუფი \d+/g, ''); }
  for (const n of NAMES) if (t.includes(n)) { used.push(`data ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [], oks: 0, geoSteps: [], audio: {} };
const OUTF = path.join(L.OUT, `c140-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P; let B; const getB = async () => (B = B || await L.launch());
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-140/shots/${f}`; }
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); (res.rows[row] = res.rows[row] || []).push({ id, ok, got, exp }); save(); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); (res.rows[row] = res.rows[row] || []).push({ id, ok: !!cond, info }); save(); return cond; }

function obsInit() {
  const W0 = window; W0.__so = { recs: [] };
  const start = () => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    if (!out) { setTimeout(start, 200); return; }
    let last = out.textContent;
    new MutationObserver(() => { const t = out.textContent; if (t !== last) { last = t; W0.__so.recs.push(t.trim()); } }).observe(out, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', start);
  W0.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = oc.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) {
        const c = this.context; let an = W0.__tap.an.get(c);
        if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W0.__tap.an.set(c, an); }
        oc.call(this, an);
      }
    } catch (e) { W0.__tap.err = String(e); }
    return r;
  };
  W0.__tapStart = () => {
    W0.__tap.on = true; W0.__tap.S = []; const buf = new Float32Array(2048);
    const tick = () => {
      if (!W0.__tap.on) return;
      let peak = 0, ss = 0, n = 0;
      for (const an of W0.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; ss += buf[i] * buf[i]; n++; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      W0.__tap.S.push({ t: performance.now(), peak, rms: n ? Math.sqrt(ss / n) : 0, pos: h ? +h.getAttribute('aria-valuenow') : NaN });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  W0.__tapStop = () => { W0.__tap.on = false; return W0.__tap.S; };
}

// Georgian surface of this round.
const surface = () => P.evaluate(() => {
  const T = [];
  const attrs = (el, where) => { for (const a of el.getAttributeNames()) { if (/^(class|style|data-|id$|aria-controls|tabindex|type|role|aria-orientation|aria-value(min|max|now)|min$|max$|step$|value$|viewBox|points|fill|stroke|preserve|vector)/i.test(a)) continue; const v = el.getAttribute(a); if (v && !/^(true|false)$/.test(v)) T.push({ where, a, v }); } };
  for (const g of document.querySelectorAll('[data-testid=arrangement-group-row]')) { T.push({ where: 'group-row', a: 'text', v: g.textContent }); for (const el of [g, ...g.querySelectorAll('*')]) attrs(el, 'group-row'); }
  for (const e of document.querySelectorAll('[data-testid=arrangement-clip-envelope-editor], [data-testid=arrangement-clip-envelope-point]')) attrs(e, 'envelope');
  for (const m of document.querySelectorAll('[data-testid=arrangement-track-meter]')) attrs(m, 'track-meter');
  for (const s of document.querySelectorAll('[data-testid=arrangement-track-header] .sr-only')) T.push({ where: 'track-header-sr', a: 'text', v: s.textContent });
  const ms = document.querySelector('[data-testid=arrangement-master]'); if (ms) { T.push({ where: 'master', a: 'text', v: ms.textContent }); for (const el of [ms, ...ms.querySelectorAll('*')]) attrs(el, 'master'); }
  const st = document.querySelector('[data-testid=arrangement-status]'); T.push({ where: 'status', a: 'text', v: st ? st.textContent : '' });
  for (const b of document.querySelectorAll('button')) if (/Undo|Redo/.test(b.textContent)) T.push({ where: 'undo/redo', a: 'title', v: b.getAttribute('title') || '' });
  const obs = window.__so ? window.__so.recs.splice(0) : [];
  for (const o of obs) T.push({ where: 'status-observed', a: 'text', v: o });
  return T;
});
async function geoStep(row, id) {
  const T = await surface();
  let raw = 0, netc = 0; const residue = []; const subs = new Set();
  for (const t of T) { const s = subtract(t.v); raw += s.raw + s.rawQ; netc += s.net + s.netQ; s.subtracted.forEach((x) => subs.add(`${t.where}: ${x}`)); if (s.residue) residue.push({ where: t.where, a: t.a, v: t.v.slice(0, 160) }); }
  res.geoSteps.push({ row, id, raw, net: netc, residue, subtracted: [...subs] }); save();
  if (netc) console.log('   GEO', row, id, netc, JSON.stringify(residue));
  return netc;
}

const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
async function open(label) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c140-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      const O = await L.openStudio(await getB(), X.VPS[W], lbl, net, { extraInit: obsInit });
      P = O.page; await P.mouse.move(2, 2); await sleep(300);
      res.checks[`${label}-snapAtStart`] = await P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
      res.checks[`${label}-snap`] = await L.setSnapOff(P);
      const lg = net[net.length - 1];
      if (lg.hydration.length || lg.errors.some((e) => /Invalid hook call/.test(e))) { res.invalidRuns.push({ label, sessionLabel: lbl, attempt: i, reason: 'ENV-COLD-VITE-HYDRATION', err: (lg.hydration[0] || lg.errors[0] || '').slice(0, 200) }); lg.invalid = true; await O.ctx.close(); continue; }
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
  await seekExact(t);
  const o = P.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await P.keyboard.press('Enter'); await sleep(900); await L.blur(P);
  const c = (await clips()).filter((x) => x.lane === lane && Math.abs(x.start - t) < 0.002);
  return c[0] ? c[0].id : null;
}
const attr = (sel, a) => P.locator(sel).first().getAttribute(a);
const undoT = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? b.getAttribute('title') : null; });
const db = (v) => (v > 0 ? +(20 * Math.log10(v)).toFixed(2) : -200);
// Play [from, from+dur] and return RMS (dBFS) over the frames whose playhead is inside [w0, w1].
async function rmsWin(from, dur, w0, w1) {
  await seekExact(from); await L.blur(P);
  await P.evaluate(() => window.__tapStart());
  await P.keyboard.press('Space'); await sleep(dur * 1000); await P.keyboard.press('Space'); await sleep(300);
  const S = await P.evaluate(() => window.__tapStop());
  const win = S.filter((f) => f.pos >= w0 && f.pos <= w1);
  const ms = win.length ? win.reduce((a, f) => a + f.rms * f.rms, 0) / win.length : 0;
  return { frames: S.length, winFrames: win.length, rmsDb: db(Math.sqrt(ms)), peakDb: db(win.reduce((a, f) => Math.max(a, f.peak), 0)), firstPos: (S.find((f) => f.pos > from) || {}).pos };
}

// ---------- ENVELOPE ----------
async function envelopeRow() {
  const R = 'ENVELOPE';
  await open('env');
  const id = await addExact('demo-stem-pad', 'music', 0);
  chkT(R, 'clip-added', !!id, { id });
  await geoStep(R, 'clip-added');
  await P.click('[data-testid=arrangement-envelope-toggle]'); await sleep(400); await L.blur(P);
  chk(R, 'toggle-pressed', await attr('[data-testid=arrangement-envelope-toggle]', 'aria-pressed'), 'true');
  const ed = `[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-editor]`;
  chk(R, 'EV10-editor-title', await attr(ed, 'title'), 'Envelope — double-click = add point');
  const g = await L.geo(P); const eb = await P.locator(ed).boundingBox();
  await P.mouse.dblclick(g.rl + 6 * g.pps, eb.y + eb.height * 0.5); await sleep(500);
  const st1 = await L.status(P); const pt = `[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`;
  const p1 = { time: await attr(pt, 'data-time'), gain: await attr(pt, 'data-gain'), title: await attr(pt, 'title') };
  res.checks.envPointAdded = p1;
  chk(R, 'EV6-status', st1, `Envelope: point added — ${p1.time} s · 0.0 dB.`);
  chkT(R, 'EV6-time-near-6', Math.abs(+p1.time - 6) < 0.05, p1);
  chk(R, 'EV1-undo', await undoT(), 'Undo: Envelope: add point');
  chk(R, 'EV5-point-title-0dB', p1.title, `Envelope: ${p1.time} s · 0.0 dB — drag · double-click = delete`);
  res.checks.envShotAdded = await shot('env-added');
  await geoStep(R, 'point-added');
  // no-change drag: beyond threshold and back
  let b = await P.locator(pt).boundingBox(); let cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const undoBefore = await undoT();
  await P.mouse.move(cx, cy); await P.mouse.down(); await P.mouse.move(cx, cy + 12, { steps: 4 }); await sleep(100); await P.mouse.move(cx, cy, { steps: 4 }); await sleep(100); await P.mouse.up(); await sleep(400);
  chk(R, 'EV4-no-change-status', await L.status(P), 'Envelope: nothing changed — the Undo history is unchanged.');
  chk(R, 'EV4-undo-unchanged', await undoT(), undoBefore);
  await geoStep(R, 'no-change');
  // real move down to <= -12 dB
  b = await P.locator(pt).boundingBox(); cx = b.x + b.width / 2; cy = b.y + b.height / 2;
  const body = await P.evaluate((s) => document.querySelector(s).parentElement.getBoundingClientRect().height, pt);
  const dy = Math.ceil(body * 0.8);
  await P.mouse.move(cx, cy); await P.mouse.down(); await P.mouse.move(cx, cy + dy, { steps: 10 }); await sleep(250);
  const live = { status: await L.status(P), gain: await attr(pt, 'data-gain'), time: await attr(pt, 'data-time') };
  res.checks.envLive = live; await geoStep(R, 'dragging');
  res.checks.envShotDrag = await shot('env-dragging');
  await P.mouse.up(); await sleep(400);
  const after = { status: await L.status(P), gain: await attr(pt, 'data-gain'), time: await attr(pt, 'data-time'), title: await attr(pt, 'title') };
  res.checks.envAfter = after;
  const gdb = (gn) => { const v = Math.round(20 * Math.log10(+gn) * 10) / 10; return v === 0 ? '0.0 dB' : `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)} dB`; };
  chkT(R, 'gain<=-12dB', 20 * Math.log10(+after.gain) <= -12, after);
  chk(R, 'EV7-live-status', live.status, `Envelope: ${live.time} s · ${gdb(live.gain)}`);
  chk(R, 'EV8-commit-status', after.status, `Envelope: ${after.time} s · ${gdb(after.gain)}.`);
  chk(R, 'EV2-undo', await undoT(), 'Undo: Envelope: move point');
  chk(R, 'EV5-point-title-moved', after.title, `Envelope: ${after.time} s · ${gdb(after.gain)} — drag · double-click = delete`);
  await geoStep(R, 'moved');
  // real audio paired: point low vs after Undo of the move
  const tp = +after.time;
  const low = await rmsWin(tp - 0.6, 2.2, tp + 0.1, tp + 1.3);
  await press('Control+z');
  const undone = { gain: await attr(pt, 'data-gain'), title: await attr(pt, 'title'), undo: await undoT(), status: await L.status(P) };
  res.checks.envUndone = undone;
  chk(R, 'undo-restores-gain', undone.gain, '1.0000');
  chk(R, 'undo-restores-title', undone.title, `Envelope: ${p1.time} s · 0.0 dB — drag · double-click = delete`);
  chk(R, 'undo-title-back-to-add', undone.undo, 'Undo: Envelope: add point');
  const full = await rmsWin(tp - 0.6, 2.2, tp + 0.1, tp + 1.3);
  res.audio.envelope = { low, full, diff: +(full.rmsDb - low.rmsDb).toFixed(2), gainLow: after.gain };
  chkT(R, 'audio-paired->=6dB', full.winFrames >= 10 && low.winFrames >= 10 && full.rmsDb - low.rmsDb >= 6, res.audio.envelope);
  await geoStep(R, 'undone');
  // delete by double-click on the point
  b = await P.locator(pt).boundingBox();
  await P.mouse.dblclick(b.x + b.width / 2, b.y + b.height / 2); await sleep(500);
  chk(R, 'EV9-delete-status', await L.status(P), `Envelope: point deleted — ${p1.time} s.`);
  chk(R, 'EV3-undo', await undoT(), 'Undo: Envelope: delete point');
  chk(R, 'point-gone', await P.locator(pt).count(), 0);
  res.checks.envShotDeleted = await shot('env-deleted');
  await geoStep(R, 'deleted');
  await P.context().close();
}

// ---------- GROUP-HEADER + GROUP-MIX ----------
const GN = '[data-testid=arrangement-group-name]';
const glabel = () => attr(GN, 'aria-label');
async function groupRows() {
  let R = 'GROUP-HEADER';
  await open('group');
  const mId = await addExact('demo-stem-pad', 'music', 0);
  chkT(R, 'music-clip', !!mId, { mId });
  await P.click(L.nameSel('music')); await sleep(250);
  await P.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
  await press('Control+g');
  chk(R, 'group-row', await P.locator('[data-testid=arrangement-group-row]').count(), 1);
  res.checks.groupCreateStatus = await L.status(P);
  chk(R, 'GH3+GH6-name-selected', await glabel(), 'ჯგუფი 1 — group, selected');
  chk(R, 'GH1-name-title', await attr(GN, 'title'), 'F2: Rename · Ctrl+G: Group Tracks · Ctrl+Shift+G: Ungroup Tracks');
  const FB = '[data-testid=arrangement-group-fold]';
  chk(R, 'GH7-fold-label', await attr(FB, 'aria-label'), 'Fold or unfold group — ჯგუფი 1');
  chk(R, 'GH2-fold-title', await attr(FB, 'title'), 'Fold / unfold (U)');
  res.checks.groupShot = await shot('group-created');
  await geoStep(R, 'grouped');
  // fold with one member clip
  await P.click(FB); await sleep(600); await L.blur(P);
  chk(R, 'fold-expanded-false', await attr(FB, 'aria-expanded'), 'false');
  const n1 = await P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => ['music', 'stems'].includes(c.closest('[data-track-id]').dataset.trackId)).length);
  chk(R, 'folded-0-member-clips', n1, 0);
  const l1 = await glabel(); res.checks.foldedOne = l1;
  chkT(R, 'GH4-folded-one-clip', l1 === 'ჯგუფი 1 — group, folded, 1 clip, selected' || l1 === 'ჯგუფი 1 — group, folded, 1 clip', l1);
  res.checks.foldedOneShot = await shot('group-folded-1clip');
  await geoStep(R, 'folded-1');
  await P.click(FB); await sleep(600); await L.blur(P);
  chk(R, 'unfold-expanded-true', await attr(FB, 'aria-expanded'), 'true');
  // second member clip
  const sId = await addExact('demo-stem-bass', 'stems', 0);
  chkT(R, 'stems-clip', !!sId, { sId });
  const sfxId = await addExact('demo-synth-mix', 'sfx', 20);
  chkT(R, 'sfx-clip-20s', !!sfxId, { sfxId });
  await P.click(FB); await sleep(600); await L.blur(P);
  const l2 = await glabel(); res.checks.foldedTwo = l2;
  chkT(R, 'GH5-folded-2-clips', /^ჯგუფი 1 — group, folded, 2 clips(, selected)?$/.test(l2), l2);
  const n2 = await P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => ['music', 'stems'].includes(c.closest('[data-track-id]').dataset.trackId)).length);
  chk(R, 'folded2-0-member-clips', n2, 0);
  res.checks.foldedTwoShot = await shot('group-folded-2clips');
  await geoStep(R, 'folded-2');
  await P.click(FB); await sleep(600); await L.blur(P);
  const l3 = await glabel(); res.checks.unfolded = l3;
  chkT(R, 'unfold-restores', /^ჯგუფი 1 — group(, selected)?$/.test(l3), l3);
  // select group, explicit check of plain (unselected) label after selecting a track
  await P.click(L.nameSel('sfx')); await sleep(300); await L.blur(P);
  chk(R, 'GH3-name-unselected', await glabel(), 'ჯგუფი 1 — group');
  // F2 rename input
  await P.click(GN); await sleep(300);
  const nameBefore = (await P.locator(GN).textContent()).trim(); res.checks.groupNameTextBefore = nameBefore;
  chk(R, 'GH6-after-click-selected', await glabel(), 'ჯგუფი 1 — group, selected');
  await P.keyboard.press('F2'); await sleep(400);
  const inp = '[data-testid=arrangement-group-name-input]';
  chk(R, 'F2-input', await P.locator(inp).count(), 1);
  chk(R, 'GH8-input-label', await attr(inp, 'aria-label'), 'Group name — ჯგუფი 1');
  await geoStep(R, 'rename-input');
  await P.keyboard.type('XYZ'); await P.keyboard.press('Escape'); await sleep(400);
  chk(R, 'escape-keeps-name', (await P.locator(GN).textContent()).trim(), nameBefore);
  chk(R, 'escape-keeps-label', await glabel(), 'ჯგუფი 1 — group, selected');
  await L.blur(P);

  R = 'GROUP-MIX';
  const MB = '[data-testid=arrangement-group-mute]', SB = '[data-testid=arrangement-group-solo]', VB = '[data-testid=arrangement-group-volume]';
  chk(R, 'GH9-mute-label', await attr(MB, 'aria-label'), 'Mute — ჯგუფი 1 (group)');
  chk(R, 'GH10-solo-label', await attr(SB, 'aria-label'), 'Solo — ჯგუფი 1 (group, Ctrl/Cmd+click = add to solo)');
  chk(R, 'GH11-solo-title', await attr(SB, 'title'), 'Solo (Ctrl/Cmd+click = add to solo)');
  chk(R, 'GH12-volume-label', await attr(VB, 'aria-label'), 'Volume — ჯგუფი 1 (group)');
  await geoStep(R, 'labels');
  // audio: members region 1.0..2.6, non-member (sfx) 20.6..22.0
  const memBase = await rmsWin(0.5, 2.4, 1.0, 2.6);
  await P.click(MB); await sleep(300); await L.blur(P);
  chk(R, 'mute-pressed', await attr(MB, 'aria-pressed'), 'true');
  const memMuted = await rmsWin(0.5, 2.4, 1.0, 2.6);
  await geoStep(R, 'muted');
  await P.click(MB); await sleep(300); await L.blur(P);
  const memUnmuted = await rmsWin(0.5, 2.4, 1.0, 2.6);
  res.audio.groupMute = { memBase, memMuted, memUnmuted, drop: +(memBase.rmsDb - memMuted.rmsDb).toFixed(2), restore: +(memUnmuted.rmsDb - memBase.rmsDb).toFixed(2) };
  chkT(R, 'audio-mute->=20dB', memBase.winFrames >= 10 && memMuted.winFrames >= 10 && memBase.rmsDb - memMuted.rmsDb >= 20, res.audio.groupMute);
  chkT(R, 'audio-unmute-restores', Math.abs(memUnmuted.rmsDb - memBase.rmsDb) <= 1.5, res.audio.groupMute);
  const sfxBase = await rmsWin(20.2, 2.2, 20.6, 22.0);
  await P.click(SB); await sleep(300); await L.blur(P);
  chk(R, 'solo-pressed', await attr(SB, 'aria-pressed'), 'true');
  const sfxSoloGroup = await rmsWin(20.2, 2.2, 20.6, 22.0);
  const memSolo = await rmsWin(0.5, 2.4, 1.0, 2.6);
  await geoStep(R, 'soloed');
  const sfxSolo = '[data-track-id="sfx"] [data-testid=arrangement-track-header] button[aria-label^="Solo"]';
  await P.click(sfxSolo, { modifiers: ['Control'] }); await sleep(300); await L.blur(P);
  const both = { group: await attr(SB, 'aria-pressed'), sfx: await attr(sfxSolo, 'aria-pressed') };
  chkT(R, 'ctrl-click-adds-both-soloed', both.group === 'true' && both.sfx === 'true', both);
  const sfxAdded = await rmsWin(20.2, 2.2, 20.6, 22.0);
  res.audio.groupSolo = { sfxBase, sfxSoloGroup, memSolo, sfxAdded, nonMemberDrop: +(sfxBase.rmsDb - sfxSoloGroup.rmsDb).toFixed(2), addedRestore: +(sfxAdded.rmsDb - sfxBase.rmsDb).toFixed(2) };
  chkT(R, 'audio-solo-nonmember->=20dB', sfxBase.winFrames >= 10 && sfxSoloGroup.winFrames >= 10 && sfxBase.rmsDb - sfxSoloGroup.rmsDb >= 20, res.audio.groupSolo);
  chkT(R, 'audio-solo-members-audible', Math.abs(memSolo.rmsDb - memBase.rmsDb) <= 1.5, { memSolo: memSolo.rmsDb, memBase: memBase.rmsDb });
  chkT(R, 'audio-ctrl-click-added-sounds', Math.abs(sfxAdded.rmsDb - sfxBase.rmsDb) <= 1.5, res.audio.groupSolo);
  res.checks.soloShot = await shot('group-solo-two');
  // clear solos
  await P.click(sfxSolo); await sleep(300); await L.blur(P);
  if ((await attr(SB, 'aria-pressed')) === 'true') { await P.click(SB); await sleep(300); await L.blur(P); }
  // Volume ArrowLeft
  const vt0 = await attr(VB, 'aria-valuetext');
  await P.focus(VB); await P.keyboard.press('ArrowLeft'); await sleep(300);
  const vt1 = await attr(VB, 'aria-valuetext');
  chkT(R, 'volume-arrowleft-valuetext', !!vt1 && vt0 !== vt1, { vt0, vt1 });
  await L.blur(P);
  await geoStep(R, 'volume');
  await P.context().close();
}

// ---------- METER ----------
const meterState = () => P.evaluate(() => {
  const r = {};
  for (const m of document.querySelectorAll('[data-track-id] [data-testid=arrangement-track-meter]')) {
    const tr = m.closest('[data-track-id]'); const k = tr.dataset.trackId; const hdr = tr.querySelector('[data-testid=arrangement-track-header]');
    r[k] = { title: m.getAttribute('title'), peak: m.getAttribute('data-peak'), state: m.dataset.state, over: !!m.querySelector('[data-testid=arrangement-track-meter-over]'), sr: [...(hdr ? hdr.querySelectorAll('.sr-only') : [])].map((s) => s.textContent) };
  }
  const mp = document.querySelector('[data-testid=arrangement-master-peak]');
  r.master = { text: mp.textContent, label: mp.getAttribute('aria-label'), state: mp.dataset.state };
  return r;
});
async function meterRow() {
  const R = 'METER';
  await open('meter');
  const a = await addExact('demo-synth-mix', 'music', 0);
  const b2 = await addExact('demo-stem-pulse', 'stems', 0);
  const c = await addExact('demo-stem-bass', 'sfx', 0);
  chkT(R, 'clips', !!(a && b2 && c), { a, b2, c });
  // Play 0..6 at Master 0 dB
  await seekExact(0); await P.evaluate(() => window.__tapStart());
  await P.keyboard.press('Space'); await sleep(6000);
  const during = await meterState();
  await P.keyboard.press('Space'); await sleep(600);
  const S = await P.evaluate(() => window.__tapStop());
  const m0 = await meterState();
  res.checks.meterAt0dB = { during, after: m0, outPeakDb: db(S.reduce((x, f) => Math.max(x, f.peak), 0)) };
  let tripped = m0.master.state;
  res.checks.masterTripMode = m0.master.state === 'over' ? 'Master 0 dB' : 'not at 0 dB';
  if (m0.master.state !== 'over') {
    const mv = 'input[aria-label="Master Volume"]';
    await P.focus(mv); for (let i = 0; i < 12; i++) await P.keyboard.press('ArrowRight'); await sleep(300); await L.blur(P);
    res.checks.masterVolume = await attr(mv, 'aria-valuetext');
    await seekExact(0); await P.keyboard.press('Space'); await sleep(6000); await P.keyboard.press('Space'); await sleep(600);
    tripped = (await meterState()).master.state; res.checks.masterTripMode = tripped === 'over' ? 'Master +6 dB' : 'did not trip at +6 dB';
  }
  const m1 = await meterState(); res.checks.meterBeforeClear = m1;
  chk(R, 'master-over-state', m1.master.state, 'over');
  chk(R, 'MT5-master-over-label', m1.master.label, `Master Peak ${m1.master.text} dBFS — overload (Clip). Click to clear`);
  res.checks.meterShotOver = await shot('meter-master-over');
  await geoStep(R, 'master-over');
  // track over: Clip Gain +12 dB on the loud music (full mix) clip
  await L.selectClip(P, a); await X.openDetail(P);
  const field = '[data-testid=arrangement-detail-clip-gain-input]';
  await P.fill(field, '12'); await P.locator(field).press('Enter'); await sleep(300); await L.blur(P);
  res.checks.sfxClipGain = await P.locator(field).inputValue();
  await P.keyboard.press('Escape'); await sleep(200); await L.blur(P);
  await seekExact(0); await P.keyboard.press('Space'); await sleep(5000); await P.keyboard.press('Space'); await sleep(600);
  const m2 = await meterState(); res.checks.meterTrackOver = m2;
  const overTracks = ['music', 'stems', 'sfx'].filter((k) => m2[k].over);
  res.checks.overTracks = overTracks;
  chkT(R, 'music-track-over', overTracks.includes('music'), overTracks);
  for (const k of ['music', 'stems', 'sfx']) {
    const name = { music: 'მუსიკა', stems: 'სტემები', sfx: 'SFX' }[k];
    if (m2[k].over) {
      chk(R, `MT2-${k}-over-title`, m2[k].title, `${name} · Peak ${m2[k].peak} dBFS — went above 0 dBFS. Click Master Peak to clear`);
      chkT(R, `MT3-${k}-sr`, m2[k].sr.includes(`${name}: the level went above 0 dBFS`), m2[k].sr);
    } else {
      chk(R, `MT1-${k}-normal-title`, m2[k].title, `${name} · Peak ${m2[k].peak} dBFS`);
      chkT(R, `MT1-${k}-no-sr`, !m2[k].sr.some((s) => /went above/.test(s)), m2[k].sr);
    }
  }
  chk(R, 'MT1-video-title', m2.video.title, `ვიდეო · Peak ${m2.video.peak} dBFS`);
  res.checks.meterShotTrackOver = await shot('meter-track-over');
  await geoStep(R, 'track-over');
  // click Master Peak: clears both
  const undo0 = await undoT(); const st0 = await L.status(P);
  const recs0 = await P.evaluate(() => window.__so.recs.length);
  await P.click('[data-testid=arrangement-master-peak]'); await sleep(500);
  const m3 = await meterState(); res.checks.meterAfterClear = m3;
  chk(R, 'MT4-master-clear-label', m3.master.label, 'Master Peak −∞ dBFS — click to clear');
  chk(R, 'clear-no-undo-entry', await undoT(), undo0);
  chk(R, 'clear-no-status', await L.status(P), st0);
  chk(R, 'clear-no-status-change-observed', await P.evaluate(() => window.__so.recs.length), recs0);
  for (const k of ['music', 'stems', 'sfx']) {
    const name = { music: 'მუსიკა', stems: 'სტემები', sfx: 'SFX' }[k];
    chk(R, `MT1-${k}-after-clear`, m3[k].title, `${name} · Peak ${m3[k].peak} dBFS`);
    chkT(R, `MT3-${k}-sr-gone`, !m3[k].sr.some((s) => /went above/.test(s)), m3[k].sr);
  }
  res.checks.meterShotCleared = await shot('meter-cleared');
  await geoStep(R, 'cleared');
  await P.context().close();
}

// ---------- REG-139 ----------
async function regRow() {
  const R = 'REG-139';
  await open('reg');
  await P.click(L.nameSel('music')); await sleep(300); await L.blur(P);
  chk(R, 'music-selected-label', await attr(L.nameSel('music'), 'aria-label'), 'მუსიკა — set as the active track, selected');
  chk(R, 'music-solo-label', await attr('[data-track-id="music"] [data-testid=arrangement-track-header] button[aria-label^="Solo"]', 'aria-label'), 'Solo — მუსიკა (Ctrl/Cmd+click = add to solo)');
  // group row box snapshot
  await P.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
  await press('Control+g');
  res.checks.groupRowBoxes = await P.evaluate(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; }; return { row: r('[data-testid=arrangement-group-row]'), header: r('[data-testid=arrangement-group-header]'), fold: r('[data-testid=arrangement-group-fold]'), name: r('[data-testid=arrangement-group-name]'), mute: r('[data-testid=arrangement-group-mute]'), solo: r('[data-testid=arrangement-group-solo]'), volume: r('[data-testid=arrangement-group-volume]'), overview: r('[data-testid=arrangement-group-overview]') }; });
  res.checks.groupRowShot = await shot('group-row');
  await geoStep(R, 'reg');
  await P.context().close();
}

(async () => {
  const rows = { env: envelopeRow, group: groupRows, meter: meterRow, reg: regRow };
  try {
    for (const [k, f] of Object.entries(rows)) {
      if (ONLY !== 'all' && ONLY !== k) continue;
      try { await f(); } catch (e) { res.fails.push({ row: k, id: 'exception', got: String(e.stack || e).slice(0, 600) }); console.log('EXC', k, e); try { await P.screenshot({ path: path.join(L.SHOTS, `exc-${k}-${W}-${TAG}.png`) }); await P.context().close(); } catch (_) {} }
    }
  } finally { res.endedUtc = new Date().toISOString(); save(); if (B) await B.close(); console.log('DONE oks', res.oks, 'fails', res.fails.length, JSON.stringify(X.netOk(net))); }
})();
