// C round 137: HEADING, LANE-HINT, VIDEO-STATUS, GROUP-RENAME, ENVELOPE, WAVEFORM-ZOOM, RANGE-READOUT, SELECTION, GEO-COUNT, LAYOUT(overflow), REG-136, PX-NET.
// node c137.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from task §1.1 (never imported). Controls by data-testid.
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
const E = {
  WS1: 'Shift — lock the time; only the track changes',
  WS2: 'Shift — the time is locked; only the track changes',
  WS3: 'The video is expanded over the library. Drag it where you want; Esc or ✕ brings it back.',
  WS4: 'The library opened temporarily for the expanded video; it collapses again when the video closes. Esc or ✕ brings it back.',
  WS5: 'The library collapsed, so the video went back to the compact view.',
  WS6: 'The video went back to the compact view.',
  WS7: 'The video went back to the compact view; the library collapsed again.',
  WS8: (n) => `The name is empty — “${n}” is kept`,
  WS9: (n) => `Group name: “${n}”.`,
  WS10: 'Envelope mode: on.', WS11: 'Envelope mode: off.',
  WS12: 'Envelope on — double-click a clip to add a point (A)',
  WS13: 'Envelope off — edit the clip volume envelope (A)',
  WS14: 'Waveform Zoom — view only, the sound does not change',
  WS15: (p) => `Waveform Zoom ${p}% — view only, the sound does not change`,
  WS16: (p) => `Waveform Zoom ${p}% — view only, the sound does not change.`,
  HEAD: 'CZABA Studio Lab · Workspace',
  R1: 'Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',
  RALL: 'Time selection: 00:03.000 — 00:05.000 · length 00:02.000 · all tracks · Delete = delete, the gap remains · Ctrl+Shift+X = Cut Time',
  WS21: (n) => `${n} clips selected`,
  MK11: (n, t) => `Marker “${n}” added at ${t}.`, MK12: (n) => `The name is empty — “${n}” is kept`,
};
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'ღამის პულსი', 'სინთეზური დემო', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია', 'საჯარო preview'];
const FROZEN = [
  ['demo-ready load-time status (collection.ts, V-0.5)', /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/],
  ['envelope point status (ArrangementClipEnvelope / clip-envelope, V-0.4)', /^Envelope: წერტილი დაემატა — [\d.]+ წმ · -?[\d.]+ dB\.$/],
  ['lane-move status/history label (ArrangementClip.tsx:701, V-0.4)', /^(Undo: )?გადატანა ხაზზე — [^:]+(: start [\d:.]+\.)?$/],
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (re.test(t)) { used.push(n); t = ''; } }
  for (const n of NAMES) if (t.includes(n)) { used.push(`data ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [], oks: 0 };
const OUTF = path.join(L.OUT, `c137-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P; let B; const getB = async () => (B = B || await L.launch());
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
// The StudioWorkspace surface of V-0.3d.
const surf = () => P.evaluate(() => {
  const q = (s) => document.querySelector(`[data-testid=${s}]`);
  const tx = (s) => { const e = q(s); return e ? e.textContent : null; };
  const env = q('arrangement-envelope-toggle'); const wz = q('arrangement-waveform-zoom');
  const box = (s) => { const e = q(s); return e ? { sw: e.scrollWidth, cw: e.clientWidth, h: Math.round(e.getBoundingClientRect().height) } : null; };
  const sc = q('arrangement-selected-clip');
  return {
    h1: (document.querySelector('h1') || {}).textContent || null,
    h1suffix: (document.querySelector('h1 span') || {}).textContent || null,
    env: env ? { text: env.textContent.trim(), title: env.title, aria: env.getAttribute('aria-label'), pressed: env.getAttribute('aria-pressed') } : null,
    wz: wz ? { aria: wz.getAttribute('aria-label'), title: wz.title, value: wz.value, opts: [...wz.options].map((o) => o.text) } : null,
    status: (tx('arrangement-status') || '').trim(),
    range: tx('arrangement-range'), allLanes: tx('arrangement-range-all-lanes'),
    count: tx('arrangement-selection-count'),
    selClip: sc ? { text: sc.textContent, title: sc.title } : null,
    laneHint: tx('arrangement-lane-move-hint'), shortcutHint: !!q('arrangement-shortcut-hint'),
    boxes: { status: box('arrangement-status'), range: box('arrangement-range'), laneHint: box('arrangement-lane-move-hint'), selClip: box('arrangement-selected-clip'), doc: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth } },
    undo: (() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? b.title + '|' + b.disabled : null; })(),
  };
});
function geoOf(s) {
  const texts = [s.h1suffix, s.env && s.env.text, s.env && s.env.title, s.env && s.env.aria, s.wz && s.wz.aria, s.wz && s.wz.title, ...(s.wz ? s.wz.opts : []), s.range, s.count, s.selClip && s.selClip.text, s.selClip && s.selClip.title, s.laneHint].filter(Boolean);
  const subs = texts.map(subtract);
  const st = subtract(s.status);
  const netN = subs.reduce((a, x) => a + x.net + x.netQ, 0);
  return { rawSurf: subs.reduce((a, x) => a + x.raw + x.rawQ, 0), netSurf: netN, residue: subs.filter((x) => x.residue).map((x) => x.residue), subtracted: [...new Set(subs.flatMap((x) => x.subtracted))], status: st, net: netN + st.net + st.netQ };
}
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); return cond; }
async function step(row, id, extra = {}) {
  const s = await surf(); const ob = await obsTake();
  const r = { id, s, observer: ob, geo: geoOf(s), obsGeo: ob.map((o) => ({ text: o.text, ...subtract(o.text) })), ...extra };
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  if (r.geo.net || r.obsGeo.some((o) => o.net || o.netQ)) console.log('   GEO', row, id, r.geo.net, JSON.stringify(r.geo.residue), JSON.stringify(r.geo.status), JSON.stringify(r.obsGeo.filter((o) => o.net || o.netQ)));
  return r;
}
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
async function open(label, opts) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c137-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      const O = await L.openStudio(await getB(), X.VPS[W], lbl, net, opts);
      P = O.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
      const snap = await L.setSnapOff(P);
      res.checks[`${label}-snap`] = snap;
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
  return pos;
}
const undoCount = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? b.title : null; });

async function heading() {
  const R = 'HEADING'; await open('heading');
  const r = await step(R, 'fresh');
  chk(R, 'h1', r.s.h1, E.HEAD); chk(R, 'suffix', r.s.h1suffix, '· Workspace');
  r.shot = await shot('heading');
  await P.context().close();
}

async function laneHint() {
  const R = 'LANE-HINT'; await open('lanehint');
  await addExact('demo-soft-impact', 'music', 2);
  const c0 = (await clips()).find((c) => c.lane === 'music');
  chkT(R, 'clip-on-music', c0 && Math.abs(c0.start - 2) < 0.001, c0);
  const u0 = await undoCount();
  const h = await P.locator(`[data-clip-id="${c0.id}"] > div`).first().boundingBox();
  const stems = await P.locator('[data-track-id=stems]').first().boundingBox();
  const sx = h.x + Math.min(30, h.width / 2), sy = h.y + h.height / 2;
  const ty = stems.y + stems.height / 2;
  await P.mouse.move(sx, sy); await P.mouse.down();
  await P.mouse.move(sx + 1, sy + 6, { steps: 3 }); await P.mouse.move(sx + 3, ty, { steps: 10 }); await sleep(300);
  const a = await step(R, 'held-noShift'); a.shot = await shot('lanehint-held');
  chk(R, 'hint-WS1', a.s.laneHint, E.WS1); chkT(R, 'shortcut-hidden', !a.s.shortcutHint, a.s.shortcutHint);
  await P.keyboard.down('Shift'); await P.mouse.move(sx + 40, ty + 2, { steps: 8 }); await sleep(300);
  const ghost = await P.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => ({ lane: e.closest('[data-track-id]').dataset.trackId, start: e.getAttribute('data-clip-start'), cls: e.className.slice(0, 80), left: e.getBoundingClientRect().left })));
  const ghostEls = await P.evaluate(() => [...document.querySelectorAll('[data-testid*=ghost],[data-testid*=preview-clip],[data-lane-ghost]')].map((e) => ({ tid: e.dataset.testid, lane: (e.closest('[data-track-id]') || { dataset: {} }).dataset.trackId, left: Math.round(e.getBoundingClientRect().left), start: e.getAttribute('data-clip-start') })));
  const b = await step(R, 'held-shift', { ghost, ghostEls, clipLeft0: h.x }); b.shot = await shot('lanehint-shift');
  chk(R, 'hint-WS2', b.s.laneHint, E.WS2);
  const gh = ghostEls.find((g) => g.tid === 'arrangement-lane-move-ghost');
  chkT(R, 'ghost-on-stems-same-start', gh && gh.lane === 'stems' && Math.abs(gh.left - Math.round(h.x)) <= 1, { gh, clipLeft: h.x });
  await P.mouse.up(); await P.keyboard.up('Shift'); await sleep(500);
  const c1 = (await clips()).find((c) => c.id === c0.id) || (await clips())[0];
  const after = await step(R, 'released', { clip: c1, undo0: u0, undo1: await undoCount() });
  chkT(R, 'lands-stems-same-start', c1 && c1.lane === 'stems' && Math.abs(c1.start - 2) < 0.0005, c1);
  chkT(R, 'shortcut-back', after.s.shortcutHint && after.s.laneHint === null, { sh: after.s.shortcutHint, lh: after.s.laneHint });
  chkT(R, 'undo-entry', /^Undo: /.test(after.s.undo), after.s.undo);
  await press('Control+z'); const cu = (await clips()).find((c) => c.id === c0.id) || (await clips())[0];
  const un = await step(R, 'undo1', { clip: cu });
  chkT(R, 'one-undo-restores', cu && cu.lane === 'music' && Math.abs(cu.start - 2) < 0.0005, cu);
  await P.context().close();
}

async function vstate() {
  return P.evaluate(() => {
    const v = document.querySelector('video[data-video-role=active]') || document.querySelector('[data-testid=arrangement-video]') || document.querySelector('video');
    const d = document.querySelector('[data-video-expanded]');
    return { paused: v ? v.paused : null, ct: v ? +v.currentTime.toFixed(3) : null, expanded: d ? d.dataset.videoExpanded : null, libCollapsed: !!document.querySelector('[data-testid=arrangement-library-expand]'), libOpen: !!document.querySelector('[data-testid=arrangement-library-collapse]') };
  });
}
async function videoStatus() {
  const R = 'VIDEO-STATUS'; await open('video');
  await L.loadVideo(P, 'beeps-6s-h264-aac.mp4'); await L.blur(P); await obsTake();
  const v0 = await vstate();
  chkT(R, 'lib-open-start', v0.libOpen && !v0.libCollapsed, v0);
  // (a) expand with library open
  await P.click('[data-testid=arrangement-video-expand]'); await sleep(700);
  let s = await step(R, 'a-expand', { v: await vstate(), before: v0 }); s.shot = await shot('video-a-expand');
  chk(R, 'a-WS3', s.s.status, E.WS3); chk(R, 'a-expanded', s.v.expanded, 'true');
  chkT(R, 'a-paused-kept', s.v.paused === v0.paused, { before: v0.paused, after: s.v.paused, ct0: v0.ct, ct1: s.v.ct });
  // (b) close
  let vb = await vstate();
  await P.click('[data-testid=arrangement-video-close]'); await sleep(700);
  s = await step(R, 'b-close', { v: await vstate(), before: vb }); s.shot = await shot('video-b-close');
  chk(R, 'b-WS6', s.s.status, E.WS6); chk(R, 'b-compact', s.v.expanded, 'false');
  chkT(R, 'b-paused-kept', s.v.paused === vb.paused && Math.abs(s.v.ct - vb.ct) < 0.05, { before: vb, after: s.v });
  // (c) collapse library, expand -> WS4, close -> WS7 and collapsed again
  await L.blur(P); await P.click('[data-testid=arrangement-library-collapse]'); await sleep(800); await obsTake();
  const vc0 = await vstate(); chkT(R, 'c-lib-collapsed', vc0.libCollapsed, vc0);
  await P.click('[data-testid=arrangement-video-expand]'); await sleep(900);
  s = await step(R, 'c-expand', { v: await vstate(), before: vc0 }); s.shot = await shot('video-c-expand');
  chk(R, 'c-WS4', s.s.status, E.WS4); chkT(R, 'c-lib-temp-open', s.v.libOpen, s.v);
  chkT(R, 'c-paused-kept', s.v.paused === vc0.paused, { before: vc0, after: s.v });
  vb = await vstate();
  await P.click('[data-testid=arrangement-video-close]'); await sleep(900);
  s = await step(R, 'c-close', { v: await vstate(), before: vb }); s.shot = await shot('video-c-close');
  chk(R, 'c-WS7', s.s.status, E.WS7); chkT(R, 'c-lib-collapsed-again', s.v.libCollapsed && s.v.expanded === 'false', s.v);
  chkT(R, 'c-paused-kept2', s.v.paused === vb.paused && Math.abs(s.v.ct - vb.ct) < 0.05, { before: vb, after: s.v });
  // (d) library open, expand, collapse library while expanded -> WS5
  await P.click('[data-testid=arrangement-library-expand]'); await sleep(800); await L.blur(P);
  await P.click('[data-testid=arrangement-video-expand]'); await sleep(800); await obsTake();
  vb = await vstate(); chkT(R, 'd-pre', vb.libOpen && vb.expanded === 'true', vb);
  await P.click('[data-testid=arrangement-library-collapse]'); await sleep(900);
  s = await step(R, 'd-collapse', { v: await vstate(), before: vb }); s.shot = await shot('video-d-collapse');
  chk(R, 'd-WS5', s.s.status, E.WS5); chkT(R, 'd-compact', s.v.expanded === 'false' && s.v.libCollapsed, s.v);
  chkT(R, 'd-paused-kept', s.v.paused === vb.paused && Math.abs(s.v.ct - vb.ct) < 0.05, { before: vb, after: s.v });
  // (e) playing case: play, expand, close; video keeps playing
  await P.click('[data-testid=arrangement-library-expand]'); await sleep(800); await L.blur(P);
  await seekExact(1); await press('Space'); await sleep(900);
  const vp0 = await vstate();
  await P.click('[data-testid=arrangement-video-expand]'); await sleep(800);
  const vp1 = await vstate();
  await P.click('[data-testid=arrangement-video-close]'); await sleep(800);
  const vp2 = await vstate();
  await press('Space');
  s = await step(R, 'e-playing', { v0: vp0, v1: vp1, v2: vp2 });
  chkT(R, 'e-playing-kept', vp0.paused === false && vp1.paused === false && vp2.paused === false && vp1.ct > vp0.ct && vp2.ct > vp1.ct, { vp0, vp1, vp2 });
  chkT(R, 'e-status-seq', s.observer.some((o) => o.text === E.WS3) && s.observer.some((o) => o.text === E.WS6), s.observer.map((o) => o.text));
  await P.context().close();
}

async function groupRename() {
  const R = 'GROUP-RENAME'; await open('group');
  await P.click(L.nameSel('stems')); await sleep(150);
  await P.keyboard.down('Shift'); await P.click(L.nameSel('sfx')); await P.keyboard.up('Shift'); await sleep(150);
  await P.keyboard.press('Control+g'); await sleep(700); await L.blur(P); await obsTake();
  const name0 = await P.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-group-name]'); return e ? e.textContent.trim() : null; });
  chkT(R, 'group-created', !!name0, name0);
  await P.focus('[data-testid=arrangement-group-name]'); await P.keyboard.press('F2'); await sleep(300);
  await P.keyboard.press('Control+a'); await P.keyboard.type('Drums'); await P.keyboard.press('Enter'); await sleep(500);
  let s = await step(R, 'rename-drums'); s.shot = await shot('group-renamed');
  chk(R, 'WS9', s.s.status, E.WS9('Drums')); chk(R, 'undo-label', s.s.undo, 'Undo: Rename Group|false');
  const n1 = await P.evaluate(() => document.querySelector('[data-testid=arrangement-group-name]').textContent.trim());
  chkT(R, 'name-Drums', /Drums/.test(n1), n1);
  await P.focus('[data-testid=arrangement-group-name]'); await P.keyboard.press('F2'); await sleep(300);
  await P.keyboard.press('Control+a'); await P.keyboard.press('Backspace'); await P.keyboard.press('Enter'); await sleep(500);
  s = await step(R, 'rename-empty'); s.shot = await shot('group-empty');
  chk(R, 'WS8', s.s.status, E.WS8('Drums'));
  const n2 = await P.evaluate(() => document.querySelector('[data-testid=arrangement-group-name]').textContent.trim());
  chk(R, 'name-unchanged', n2, n1); chk(R, 'undo-unchanged', s.s.undo, 'Undo: Rename Group|false');
  // marker empty rename (REG-136 shape)
  await seekExact(3); await press('m'); await sleep(200);
  await P.keyboard.press('Control+a'); await P.keyboard.type('Intro'); await P.keyboard.press('Enter'); await sleep(400); await L.blur(P); await obsTake();
  const flag = P.locator('[data-testid=arrangement-marker]').first();
  await flag.focus(); await P.keyboard.press('F2'); await sleep(300);
  await P.keyboard.press('Control+a'); await P.keyboard.press('Backspace'); await P.keyboard.press('Enter'); await sleep(500);
  s = await step(R, 'marker-empty');
  chk(R, 'marker-MK12-same-shape', s.s.status, E.MK12('Intro'));
  await P.context().close();
}

async function envelope() {
  const R = 'ENVELOPE'; await open('env');
  await addExact('demo-slow-rise', 'music', 1);
  const c = (await clips()).find((x) => x.lane === 'music');
  let s = await step(R, 'off');
  chk(R, 'title-off-WS13', s.s.env.title, E.WS13); chk(R, 'pressed-false', s.s.env.pressed, 'false'); chk(R, 'text-Env', s.s.env.text, 'Env');
  await press('a');
  s = await step(R, 'on-key-a'); s.shot = await shot('env-on');
  chk(R, 'status-WS10', s.s.status, E.WS10); chk(R, 'title-on-WS12', s.s.env.title, E.WS12); chk(R, 'pressed-true', s.s.env.pressed, 'true');
  const cnt = () => P.evaluate((id) => document.querySelectorAll(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`).length, c.id);
  const line = () => P.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-line] polyline`); return e ? e.getAttribute('points') : null; }, c.id);
  const p0 = await cnt(); const l0 = await line();
  const bb = await P.locator(`[data-clip-id="${c.id}"]`).boundingBox();
  await P.mouse.dblclick(bb.x + bb.width * 0.5, bb.y + bb.height * 0.6); await sleep(500);
  const p1 = await cnt(); const l1 = await line();
  s = await step(R, 'dblclick', { p0, p1, l0, l1 }); s.shot = await shot('env-point');
  chkT(R, 'point-added', p1 === p0 + 1 && l1 !== l0, { p0, p1, l0, l1 });
  await L.blur(P); await press('a');
  s = await step(R, 'off-key-a');
  chk(R, 'status-WS11', s.s.status, E.WS11); chk(R, 'title-back-WS13', s.s.env.title, E.WS13); chk(R, 'pressed-false2', s.s.env.pressed, 'false');
  // click path
  await P.click('[data-testid=arrangement-envelope-toggle]'); await sleep(400);
  s = await step(R, 'on-click'); chk(R, 'click-WS10', s.s.status, E.WS10);
  await P.click('[data-testid=arrangement-envelope-toggle]'); await sleep(400); await L.blur(P);
  s = await step(R, 'off-click'); chk(R, 'click-WS11', s.s.status, E.WS11);
  await P.context().close();
}

async function waveZoom() {
  const R = 'WAVEFORM-ZOOM'; await open('wz', { extraInit: X.tapInit });
  await addExact('demo-slow-rise', 'music', 0);
  const c = (await clips()).find((x) => x.lane === 'music');
  const wpath = () => P.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"] [data-testid=arrangement-clip-waveform] path`); return e ? e.getAttribute('d') : null; }, c.id);
  let s = await step(R, 'start');
  chk(R, 'aria-WS14', s.s.wz.aria, E.WS14); chk(R, 'title-100', s.s.wz.title, E.WS15(100));
  chkT(R, 'opts', JSON.stringify(s.s.wz.opts) === JSON.stringify(['½×', '1×', '2×', '4×', '8×']), s.s.wz.opts);
  const path1 = await wpath();
  async function tap(label) {
    await L.blur(P); await P.keyboard.press('Home'); await sleep(300);
    await P.keyboard.press('Space'); await sleep(150);
    await P.evaluate(() => window.__tapStart()); await sleep(2000);
    const S = await P.evaluate(() => window.__tapStop());
    await P.keyboard.press('Space'); await sleep(400);
    const pk = Math.max(...S.map((x) => x.peak));
    return { label, n: S.length, peak: pk, db: 20 * Math.log10(pk || 1e-9) };
  }
  const t1 = await tap('1x');
  await P.selectOption('[data-testid=arrangement-waveform-zoom]', '2'); await sleep(500);
  const path2 = await wpath();
  s = await step(R, 'zoom2', { path1len: path1 && path1.length, path2len: path2 && path2.length }); s.shot = await shot('wz-2x');
  chk(R, 'status-WS16-200', s.s.status, E.WS16(200)); chk(R, 'title-200', s.s.wz.title, E.WS15(200));
  chkT(R, 'path-changed', path1 && path2 && path1 !== path2, { l1: path1 && path1.length, l2: path2 && path2.length });
  const t2 = await tap('2x');
  const dd = t2.db - t1.db;
  chkT(R, 'audio-unchanged-0.5dB', t1.peak > 0.001 && Math.abs(dd) <= 0.5, { t1, t2, dd });
  await P.selectOption('[data-testid=arrangement-waveform-zoom]', '1'); await sleep(500);
  const path3 = await wpath();
  s = await step(R, 'zoom1', { t1, t2, dd });
  chk(R, 'status-WS16-100', s.s.status, E.WS16(100)); chk(R, 'title-100-back', s.s.wz.title, E.WS15(100));
  chkT(R, 'path-back-equal', path3 === path1, { eq: path3 === path1 });
  await P.selectOption('[data-testid=arrangement-waveform-zoom]', '0.5'); await sleep(400);
  s = await step(R, 'zoom05'); chk(R, 'status-WS16-50', s.s.status, E.WS16(50));
  await P.context().close();
}

async function setRangeExact(lane, t0, t1) {
  // Detail-panel inputs give exact values when the drag cannot.
  await X.rangeDrag(P, (await clips()).find((c) => c.lane === lane).id, t0, t1);
  let r = await P.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null);
  if (r && r.includes('00:03.000 — 00:05.000')) return { via: 'drag', r };
  await X.openDetail(P);
  for (const [tid, v] of [['arrangement-detail-start', '00:03.000'], ['arrangement-detail-end', '00:05.000']]) {
    const loc = P.locator(`[data-testid=${tid}]`);
    if (await loc.count()) { await loc.fill(v); await loc.press('Enter'); await sleep(300); }
  }
  await L.blur(P);
  r = await P.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null);
  return { via: 'detail', r };
}
async function rangeReadout() {
  const R = 'RANGE-READOUT'; await open('range');
  await addExact('demo-slow-rise', 'music', 1); // 1..6
  await addExact('demo-soft-impact', 'music', 7); // 7..9
  await addExact('demo-soft-impact', 'stems', 4);
  const g = await L.geo(P); res.checks.rangeGeo = g;
  const how = await setRangeExact('music', 3, 5);
  let s = await step(R, 'one-track', { how }); s.shot = await shot('range-one');
  chk(R, 'one-track-line', s.s.range, E.R1);
  await press('Control+Shift+l');
  s = await step(R, 'all-tracks'); s.shot = await shot('range-all');
  chk(R, 'all-tracks-line', s.s.range, E.RALL); chk(R, 'all-lanes-span', s.s.allLanes, 'all tracks · ');
  chkT(R, 'all-1280-no-overflow', s.s.boxes.range.sw <= s.s.boxes.range.cw && s.s.boxes.status.sw <= s.s.boxes.status.cw && s.s.boxes.doc.sw <= s.s.boxes.doc.cw, s.s.boxes);
  res.checks.layoutAllTracks = s.s.boxes;
  // Delete on the all-tracks range: a gap on every track, the next clip keeps its start.
  const before = (await clips()).map((c) => `${c.lane}@${c.start.toFixed(3)}`).sort();
  await press('Delete');
  let after = (await clips()).map((c) => ({ lane: c.lane, start: +c.start.toFixed(3), w: c.wdur }));
  s = await step(R, 'deleted-all', { before, after }); s.shot = await shot('range-deleted-all');
  const has = (ln, st, w) => after.some((c) => c.lane === ln && Math.abs(c.start - st) < 0.001 && Math.abs(c.w - w) < 0.02);
  chkT(R, 'all-gap-kept', has('music', 1, 2) && has('music', 5, 1) && has('music', 7, 2) && has('stems', 5, 1) && after.length === 4, after);
  await press('Control+z');
  let und = (await clips()).map((c) => `${c.lane}@${c.start.toFixed(3)}`).sort();
  s = await step(R, 'undo-all', { und });
  chkT(R, 'undo-all-restores', JSON.stringify(und) === JSON.stringify(before), { before, und });
  // One-track range again, then Delete: only music gets a gap.
  await press('Escape');
  const how2 = await setRangeExact('music', 3, 5);
  s = await step(R, 'one-track-2', { how2 }); chk(R, 'one-track-line-2', s.s.range, E.R1);
  await press('Delete');
  after = (await clips()).map((c) => ({ lane: c.lane, start: +c.start.toFixed(3), w: c.wdur }));
  s = await step(R, 'deleted-one', { after }); s.shot = await shot('range-deleted-one');
  chkT(R, 'one-gap-kept', has('music', 1, 2) && has('music', 5, 1) && has('music', 7, 2) && has('stems', 4, 2) && after.length === 4, after);
  await press('Control+z');
  und = (await clips()).map((c) => `${c.lane}@${c.start.toFixed(3)}`).sort();
  s = await step(R, 'undo-one', { und });
  chkT(R, 'undo-one-restores', JSON.stringify(und) === JSON.stringify(before), { before, und });
  await P.context().close();
}

async function selection() {
  const R = 'SELECTION'; await open('sel');
  await addExact('demo-slow-rise', 'music', 2);
  await addExact('demo-soft-impact', 'stems', 4);
  const cs = await clips(); const a = cs.find((c) => c.lane === 'music'), b = cs.find((c) => c.lane === 'stems');
  await L.selectClip(P, a.id); await L.selectClip(P, b.id, ['Control']);
  let s = await step(R, 'two'); s.shot = await shot('sel-two');
  chk(R, 'count-2', s.s.count, E.WS21(2));
  const sel2 = await clips();
  const ln = await P.locator('[data-track-id=music]').last().boundingBox();
  await P.mouse.click(ln.x + ln.width - 40, ln.y + ln.height * 0.6); await sleep(300);
  const afterEmpty = (await clips()).filter((c) => c.sel).length;
  await L.selectClip(P, b.id, ['Control']);
  s = await step(R, 'one', { selBefore: sel2.filter((c) => c.sel).length, afterEmpty }); s.shot = await shot('sel-one');
  chk(R, 'count-absent', s.s.count, null);
  chkT(R, 'clip-line', s.s.selClip && /^Clip: .+ · start 00:02\.000 · length 00:05\.000 · source offset 00:00\.000$/.test(s.s.selClip.text), s.s.selClip);
  chkT(R, 'title-eq-text', s.s.selClip && s.s.selClip.title === s.s.selClip.text, s.s.selClip);
  await addExact('demo-soft-impact', 'sfx', 1); const c3 = (await clips()).find((c) => c.lane === 'sfx');
  await L.selectClip(P, c3.id); await L.selectClip(P, a.id, ['Control']); await L.selectClip(P, b.id, ['Control']);
  s = await step(R, 'three'); chk(R, 'count-3', s.s.count, E.WS21(3));
  await P.context().close();
}

async function reg136() {
  const R = 'REG-136'; await open('reg');
  await seekExact(3); await press('m'); await sleep(200);
  await P.keyboard.press('Enter'); await sleep(500); await L.blur(P);
  let s = await step(R, 'm-at-3-enter');
  chk(R, 'MK11', s.s.status, E.MK11('Marker 1', '00:03.000'));
  await seekExact(6); await press('m'); await sleep(200);
  await P.keyboard.press('Escape'); await sleep(500); await L.blur(P);
  s = await step(R, 'm-at-6-esc');
  chk(R, 'MK10-esc', s.s.status, 'Marker not added');
  await P.context().close();
}

(async () => {
  const rows = { heading, laneHint, videoStatus, groupRename, envelope, waveZoom, rangeReadout, selection, reg136 };
  for (const [n, f] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== n) continue;
    try { console.log('==', n); await f(); } catch (e) { res.fails.push({ row: n, id: 'EXCEPTION', got: String(e).slice(0, 400) }); console.log('EXC', n, e); try { await shot(`exc-${n}`); await P.context().close(); } catch {} }
    save();
  }
  const geoNet = Object.values(res.rows).flat().reduce((a, r) => a + r.geo.net + r.obsGeo.reduce((x, o) => x + o.net + o.netQ, 0), 0);
  res.summary = { oks: res.oks, fails: res.fails.length, geoNet, steps: Object.values(res.rows).flat().length, net: X.netOk(net) };
  save(); console.log('SUMMARY', JSON.stringify(res.summary));
  await B.close();
})();
