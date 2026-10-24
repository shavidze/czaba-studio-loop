// C round 139: V-0.4b track lane / header strings. node c139.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from the task §1.1 (never imported from the app).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
const fmt = (t) => { const m = Math.floor(t / 60); const s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'ღამის პულსი', 'სინთეზური დემო', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია', 'საჯარო preview'];
const FROZEN = [
  ['demo-ready load-time status (collection.ts, V-0.5)', /^დემო კოლექცია მზადაა\./],
  ['group create status / group name prefix (groups.ts, V-0.4d)', /ჯგუფ/],
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (gc(t) && re.test(t)) { used.push(n); t = ''; } }
  for (const n of NAMES) if (t.includes(n)) { used.push(`data ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [], oks: 0, geoSteps: [] };
const OUTF = path.join(L.OUT, `c139-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P; let B; const getB = async () => (B = B || await L.launch());
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-139/shots/${f}`; }
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); (res.rows[row] = res.rows[row] || []).push({ id, ok, got, exp }); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); (res.rows[row] = res.rows[row] || []).push({ id, ok: !!cond, info }); return cond; }

// Status observer: every status change is collected for GEO-COUNT.
function obsInit() {
  const W0 = window; W0.__so = { recs: [] };
  const start = () => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    if (!out) { setTimeout(start, 200); return; }
    let last = out.textContent;
    new MutationObserver(() => { const t = out.textContent; if (t !== last) { last = t; W0.__so.recs.push(t.trim()); } }).observe(out, { childList: true, subtree: true, characterData: true });
  };
  document.addEventListener('DOMContentLoaded', start);
  // Real output tap: RMS + peak of everything connected to the destination.
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

// Georgian surface of this round: track headers (text + all attributes), lane hints, ghosts, overlay,
// separators, status line (+ observed changes), Undo/Redo titles, selected-clip line.
const surface = () => P.evaluate(() => {
  const T = [];
  const attrs = (el, where) => { for (const a of el.getAttributeNames()) { if (/^(class|style|data-|id$|aria-controls|tabindex|type|role|aria-orientation|aria-value(min|max|now))/.test(a)) continue; const v = el.getAttribute(a); if (v && !/^(true|false)$/.test(v)) T.push({ where, a, v }); } };
  for (const h of document.querySelectorAll('[data-testid=arrangement-track-header]')) {
    const tr = h.closest('[data-track-id]')?.dataset.trackId;
    T.push({ where: `header:${tr}`, a: 'text', v: h.textContent });
    for (const el of [h, ...h.querySelectorAll('*')]) {
      if (el.closest('[data-testid=arrangement-track-meter]')) continue; // meter/Master titles: V-0.4c (R5)
      attrs(el, `header:${tr}`);
    }
  }
  for (const s of document.querySelectorAll('[data-testid=arrangement-track-height]')) attrs(s, 'separator');
  for (const z of document.querySelectorAll('[data-track-id] [data-testid=arrangement-video-dropzone] > p, [data-testid=arrangement-video-drop-hint], [data-testid=arrangement-drop-ghost], [data-testid=arrangement-lane-range]')) T.push({ where: 'lane', a: 'text', v: z.textContent });
  for (const lane of document.querySelectorAll('[data-track-id]')) for (const p of lane.querySelectorAll('p.pointer-events-none')) T.push({ where: 'lane-hint', a: 'text', v: p.textContent });
  for (const c of document.querySelectorAll('[data-clip-kind=video]')) T.push({ where: 'video-clip', a: 'text', v: c.textContent });
  const st = document.querySelector('[data-testid=arrangement-status]'); T.push({ where: 'status', a: 'text', v: st ? st.textContent : '' });
  for (const b of document.querySelectorAll('button')) if (/Undo|Redo/.test(b.textContent)) T.push({ where: 'undo/redo', a: 'title', v: b.getAttribute('title') || '' });
  const sc = document.querySelector('[data-testid=arrangement-selected-clip]'); if (sc) { T.push({ where: 'selected-clip', a: 'text', v: sc.textContent }); T.push({ where: 'selected-clip', a: 'title', v: sc.getAttribute('title') }); }
  const obs = window.__so ? window.__so.recs.splice(0) : [];
  for (const o of obs) T.push({ where: 'status-observed', a: 'text', v: o });
  return T;
});
async function geoStep(row, id) {
  const T = await surface();
  let raw = 0, netc = 0; const residue = []; const subs = new Set();
  for (const t of T) { const s = subtract(t.v); raw += s.raw + s.rawQ; netc += s.net + s.netQ; s.subtracted.forEach((x) => subs.add(`${t.where}: ${x}`)); if (s.residue) residue.push({ where: t.where, a: t.a, v: t.v.slice(0, 160) }); }
  res.geoSteps.push({ row, id, raw, net: netc, residue, subtracted: [...subs] });
  if (netc) console.log('   GEO', row, id, netc, JSON.stringify(residue));
  return netc;
}

const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
async function open(label) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c139-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
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
  await P.keyboard.press('Enter'); await sleep(800); await L.blur(P);
  const c = (await clips()).filter((x) => x.lane === lane && Math.abs(x.start - t) < 0.002);
  return c[0] ? c[0].id : null;
}
const hdr = (tr) => `[data-track-id="${tr}"] [data-testid=arrangement-track-header]`;
const attr = (sel, a) => P.locator(sel).first().getAttribute(a);
const undoT = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? b.getAttribute('title') : null; });
const rowH = (tr) => P.evaluate((t) => Math.round([...document.querySelectorAll(`[data-track-id="${t}"]`)].pop().getBoundingClientRect().height * 10) / 10, tr);
const laneBody = (tr) => `[data-track-id="${tr}"] [id][aria-label], [data-track-id="${tr}"]`;

// ---------- rows ----------
async function headerRows() {
  await open('header');
  await geoStep('S', 'start');
  // EMPTY-VIDEO
  const empty = await P.evaluate(() => { const z = document.querySelector('[data-testid=arrangement-video-dropzone]'); const p = z && z.querySelector('p'); return p ? p.textContent : null; });
  chk('EMPTY-VIDEO', 'text', empty, 'No video — use “＋ Your own video” or drop a file here');
  res.checks.emptyVideoShot = await shot('empty-video');

  // TRACK-SELECT
  const R = 'TRACK-SELECT';
  await P.click(L.nameSel('stems')); await sleep(250);
  await P.click(L.nameSel('music')); await sleep(250); await L.blur(P);
  const m1 = await P.evaluate(() => { const b = document.querySelector('[data-track-id="music"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]'); return { pressed: b.getAttribute('aria-pressed'), label: b.getAttribute('aria-label'), text: b.textContent, badge: (b.querySelector('span') || {}).textContent || null }; });
  chk(R, 'music-pressed', m1.pressed, 'true');
  chk(R, 'music-label-plain-click-selects', m1.label, 'მუსიკა — set as the active track, selected');
  chk(R, 'music-badge', m1.badge, '· active');
  chk(R, 'music-text', m1.text, 'მუსიკა· active');
  const stemsP = await attr(L.nameSel('stems'), 'aria-pressed'); chk(R, 'stems-not-pressed', stemsP, 'false');
  chk(R, 'stems-unselected-label', await attr(L.nameSel('stems'), 'aria-label'), 'სტემები — set as the active track');
  await geoStep(R, 'music-active');
  await P.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300); await L.blur(P);
  const lm = await attr(L.nameSel('music'), 'aria-label'); const ls = await attr(L.nameSel('stems'), 'aria-label');
  chk(R, 'music-selected-label', lm, 'მუსიკა — set as the active track, selected');
  chk(R, 'stems-selected-label', ls, 'სტემები — set as the active track, selected');
  res.checks.selectShot = await shot('track-select');
  await geoStep(R, 'two-selected');
  const g0 = await P.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length);
  await press('Control+g');
  const g1 = await P.evaluate(() => ({ n: document.querySelectorAll('[data-testid=arrangement-group-row]').length, focus: document.activeElement ? (document.activeElement.getAttribute('data-testid') || document.activeElement.getAttribute('aria-label')) : null }));
  const gs = await L.status(P);
  chkT(R, 'ctrl-g-group-row', g0 === 0 && g1.n === 1, { g0, g1, status: gs });
  await geoStep(R, 'grouped');
  await press('Control+z');
  const g2 = await P.evaluate(() => ({ n: document.querySelectorAll('[data-testid=arrangement-group-row]').length, focus: document.activeElement ? document.activeElement.getAttribute('aria-label') : null }));
  chkT(R, 'undo-group-removed', g2.n === 0, g2);
  res.checks.ungroupFocus = g2.focus;
  await geoStep(R, 'ungrouped');

  // VIDEO-HEADER
  const V = 'VIDEO-HEADER';
  const vh = await P.evaluate(() => document.querySelector('[data-track-id="video"] [data-testid=arrangement-track-header]').textContent);
  chkT(V, 'contains-Original-sound', vh.includes('Original sound'), vh);
  const vol = '[data-track-id="video"] input[aria-label="Volume — Original video sound"]';
  chk(V, 'volume-slider-exists', await P.locator(vol).count(), 1);
  const vt0 = await attr(vol, 'aria-valuetext');
  await P.focus(vol); for (let i = 0; i < 3; i++) await P.keyboard.press('ArrowLeft'); await sleep(300);
  const vt1 = await attr(vol, 'aria-valuetext');
  chkT(V, 'volume-valuetext-changes', vt0 !== vt1 && !!vt1, { vt0, vt1 });
  await L.blur(P);
  chk(V, 'mute-label', await attr('[data-track-id="video"] button[aria-label^="Mute"]', 'aria-label'), 'Mute — Original video sound');
  const imp = P.getByRole('button', { name: '＋ Your own video', exact: true });
  chk(V, 'import-button-text', (await imp.textContent()).trim(), '＋ Your own video');
  const [fc] = await Promise.all([P.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null), imp.click()]);
  chkT(V, 'import-opens-filechooser', !!fc, { fc: !!fc, multiple: fc ? fc.isMultiple() : null });
  await sleep(300); await L.blur(P);
  // compact density: shrink the video row with the separator keys until the compact button appears
  const sep = '[data-track-id="video"] [data-testid=arrangement-track-height], [data-testid=arrangement-track-height][aria-label="Height — ვიდეო"]';
  const vsep = P.locator('[data-testid=arrangement-track-height][aria-label="Height — ვიდეო"]');
  await vsep.focus();
  let compact = null; const hs = [];
  for (let i = 0; i < 12 && !compact; i++) {
    await P.keyboard.press('ArrowUp'); await sleep(200);
    hs.push(+(await vsep.getAttribute('aria-valuenow')));
    compact = await P.evaluate(() => { const b = [...document.querySelectorAll('[data-track-id="video"] [data-testid=arrangement-track-header] button')].find((x) => x.textContent.trim() === '＋'); return b ? { title: b.getAttribute('title'), label: b.getAttribute('aria-label'), text: b.textContent.trim() } : null; });
  }
  res.checks.compactHeights = hs;
  chk(V, 'compact-title', compact && compact.title, 'Your own video');
  chk(V, 'compact-label', compact && compact.label, '＋ Your own video');
  const vhc = await P.evaluate(() => document.querySelector('[data-track-id="video"] [data-testid=arrangement-track-header]').textContent);
  chkT(V, 'compact-no-Original-sound-line', !vhc.includes('Original sound'), vhc);
  res.checks.compactShot = await shot('video-compact');
  await geoStep(V, 'compact');
  for (let i = 0; i < hs.length; i++) { await P.keyboard.press('ArrowDown'); await sleep(120); }
  await L.blur(P);
  res.checks.videoHeightRestored = await vsep.getAttribute('aria-valuenow');

  // FILE-DRAG-HINT (synthetic Files DataTransfer, real DOM events)
  const F = 'FILE-DRAG-HINT';
  const fileDrag = (tr, kind) => P.evaluate(([t, k]) => {
    const row = [...document.querySelectorAll(`[data-track-id="${t}"]`)].pop();
    const header = row.querySelector('[data-testid=arrangement-track-header]');
    const hr = header.getBoundingClientRect();
    const cand = [...row.querySelectorAll('div')].filter((d) => d.getBoundingClientRect().left >= hr.right - 1 && d.getBoundingClientRect().width > 300 && d.getBoundingClientRect().height > 30);
    const tgt = row.querySelector('[data-testid=arrangement-video-dropzone]') || cand[0];
    const r = tgt.getBoundingClientRect();
    const dt = new DataTransfer(); dt.items.add(new File(['x'], 'clip.mp4', { type: 'video/mp4' }));
    const o = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.left + r.width * 0.5, clientY: r.top + r.height / 2 };
    if (k === 'over') { tgt.dispatchEvent(new DragEvent('dragenter', o)); tgt.dispatchEvent(new DragEvent('dragover', o)); }
    else tgt.dispatchEvent(new DragEvent('dragleave', { ...o, relatedTarget: document.body }));
    return { types: [...dt.types] };
  }, [tr, kind]);
  const hintText = (tr) => P.evaluate((t) => { const row = [...document.querySelectorAll(`[data-track-id="${t}"]`)].pop(); const ps = [...row.querySelectorAll('p')].map((p) => p.textContent).filter((x) => /drop|Drop/.test(x)); return ps; }, tr);
  const dv = await fileDrag('video', 'over'); await sleep(250);
  const hv = await hintText('video');
  chkT(F, 'video-hint', hv.includes('Drop the video here') && !hv.some((x) => x.startsWith('No video')), { types: dv.types, hv });
  res.checks.fileHintVideoShot = await shot('file-hint-video');
  await geoStep(F, 'video-over');
  await fileDrag('video', 'leave'); await sleep(250);
  const hv2 = await hintText('video'); chkT(F, 'video-leave-removes', !hv2.includes('Drop the video here'), hv2);
  await fileDrag('music', 'over'); await sleep(250);
  const hm = await hintText('music');
  chkT(F, 'music-hint', hm.includes('Video is not added here — drop it on the video track'), hm);
  res.checks.fileHintMusicShot = await shot('file-hint-music');
  await geoStep(F, 'music-over');
  await fileDrag('music', 'leave'); await sleep(250);
  const hm2 = await hintText('music'); chkT(F, 'music-leave-removes', !hm2.some((x) => x.startsWith('Video is not added')), hm2);

  // HEIGHT (music)
  const H = 'HEIGHT';
  const msep = P.locator('[data-testid=arrangement-track-height][aria-label="Height — მუსიკა"]');
  chk(H, 'label-music', await msep.count(), 1);
  chk(H, 'label-sfx', await P.locator('[data-testid=arrangement-track-height][aria-label="Height — SFX"]').count(), 1);
  await msep.focus();
  const n0 = +(await msep.getAttribute('aria-valuenow')); const h0 = await rowH('music');
  await P.keyboard.press('ArrowDown'); await sleep(300);
  const n1 = +(await msep.getAttribute('aria-valuenow')); const h1 = await rowH('music'); const vt = await msep.getAttribute('aria-valuetext');
  await P.keyboard.press('ArrowUp'); await sleep(300);
  const n2 = +(await msep.getAttribute('aria-valuenow')); const h2 = await rowH('music');
  chkT(H, 'down-grows-same-px', n1 > n0 && Math.abs((h1 - h0) - (n1 - n0)) <= 1, { n0, n1, h0, h1 });
  chkT(H, 'up-shrinks-same-px', n2 < n1 && Math.abs((h1 - h2) - (n1 - n2)) <= 1, { n1, n2, h1, h2 });
  chk(H, 'valuetext-unfolded', vt, `${n1} px`);
  await L.blur(P);

  // PAN-RESET (music)
  const PR = 'PAN-RESET';
  const pan = '[data-track-id="music"] [data-testid=arrangement-track-pan]';
  const rst = '[data-track-id="music"] [data-testid=arrangement-track-pan-reset]';
  chk(PR, 'reset-label', await attr(rst, 'aria-label'), 'Reset Pan to centre — მუსიკა');
  const r0 = { text: (await P.locator(rst).textContent()).trim(), disabled: await P.locator(rst).isDisabled() };
  await P.focus(pan); for (let i = 0; i < 4; i++) await P.keyboard.press('ArrowRight'); await sleep(300); await L.blur(P);
  const r1 = { text: (await P.locator(rst).textContent()).trim(), disabled: await P.locator(rst).isDisabled(), pan: await attr(pan, 'value') };
  chkT(PR, 'off-centre', r1.text !== 'C' && !r1.disabled, { r0, r1 });
  await P.click(`[aria-label="Reset Pan to centre — მუსიკა"]`); await sleep(350); await L.blur(P);
  const r2 = { text: (await P.locator(rst).textContent()).trim(), disabled: await P.locator(rst).isDisabled(), pan: await attr(pan, 'value') };
  chk(PR, 'readout-C', r2.text, 'C'); chk(PR, 'disabled', r2.disabled, true);
  await geoStep(PR, 'reset');
  await P.context().close();
}

async function foldSoloRows() {
  await open('foldsolo');
  // music clip 0–16 s, stems clip 20–36 s (only stems has signal at ~24 s)
  const mid = await addExact('demo-synth-mix', 'music', 0);
  const sid = await addExact('demo-stem-pulse', 'stems', 20);
  res.checks.foldSoloClips = { mid, sid, clips: await clips() };
  await geoStep('S', 'clips-added');
  // TRACK-FOLD on stems
  const R = 'TRACK-FOLD';
  const fold = '[data-track-id="stems"] [data-testid=arrangement-track-fold]';
  chk(R, 'title', await attr(fold, 'title'), 'Fold / unfold');
  chk(R, 'label', await attr(fold, 'aria-label'), 'Fold or unfold — სტემები');
  const ssep = P.locator('[data-testid=arrangement-track-height][aria-label="Height — სტემები"]');
  const hBefore = +(await ssep.getAttribute('aria-valuenow'));
  const visClips = () => P.evaluate(() => [...document.querySelectorAll('[data-track-id="stems"] [data-clip-id]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }).length);
  const clipH = () => P.evaluate(() => [...document.querySelectorAll('[data-track-id="stems"] [data-clip-id]')].map((e) => ({ h: Math.round(e.getBoundingClientRect().height), title: e.getAttribute('title') })));
  const ch0 = await clipH();
  const v0 = await visClips();
  await P.click(fold); await sleep(400); await L.blur(P);
  const f1 = { expanded: await attr(fold, 'aria-expanded'), vis: await visClips(), vt: await ssep.getAttribute('aria-valuetext'), now: +(await ssep.getAttribute('aria-valuenow')), rowH: await rowH('stems') };
  chk(R, 'folded-expanded-false', f1.expanded, 'false');
  const ch1 = await clipH(); res.checks.foldClipHeights = { ch0, ch1, rowFolded: f1.rowH };
  chkT(R, 'folded-row-collapses-clip-compact', v0 === 1 && f1.rowH < 50 && ch1.length === 1 && ch1[0].h < ch0[0].h, { v0, f1, ch0, ch1 });
  chk(R, 'folded-valuetext', f1.vt, `folded · ${f1.now} px`);
  res.checks.foldShot = await shot('stems-folded');
  await geoStep(R, 'folded');
  await P.click(fold); await sleep(400); await L.blur(P);
  const f2 = { expanded: await attr(fold, 'aria-expanded'), vis: await visClips(), vt: await ssep.getAttribute('aria-valuetext'), now: +(await ssep.getAttribute('aria-valuenow')) };
  chk(R, 'unfolded-expanded-true', f2.expanded, 'true');
  chk(R, 'unfolded-valuetext', f2.vt, `${f2.now} px`);
  chkT(R, 'unfolded-clips-back-height-same', f2.vis === 1 && f2.now === hBefore, { f2, hBefore });

  // SOLO
  const S = 'SOLO';
  const solo = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label^="Solo"]`;
  chk(S, 'music-label', await attr(solo('music'), 'aria-label'), 'Solo — მუსიკა (Ctrl/Cmd+click = add to solo)');
  chk(S, 'music-title', await attr(solo('music'), 'title'), 'Solo (Ctrl/Cmd+click = add to solo)');
  chk(S, 'video-label', await attr(solo('video'), 'aria-label'), 'Solo — Original video sound (Ctrl/Cmd+click = add to solo)');
  const pressed = async () => ({ music: await attr(solo('music'), 'aria-pressed'), stems: await attr(solo('stems'), 'aria-pressed'), sfx: await attr(solo('sfx'), 'aria-pressed'), video: await attr(solo('video'), 'aria-pressed') });
  // audio: unsoloed reference at 24 s
  const measure = async (label) => {
    await seekExact(24); await P.evaluate(() => window.__tapStart());
    await press('Space'); await sleep(1600); await press('Space'); await sleep(150);
    const S0 = await P.evaluate(() => window.__tapStop());
    const play = S0.filter((s) => s.pos > 24.25 && s.pos < 25.3);
    const rms = play.length ? Math.sqrt(play.reduce((a, s) => a + s.rms * s.rms, 0) / play.length) : 0;
    const peak = play.reduce((a, s) => Math.max(a, s.peak), 0);
    const r = { label, frames: play.length, posRange: play.length ? [play[0].pos, play[play.length - 1].pos] : null, rms, rmsDb: rms > 0 ? 20 * Math.log10(rms) : -Infinity, peak };
    (res.checks.soloAudio = res.checks.soloAudio || []).push(r); save();
    return r;
  };
  const a0 = await measure('no-solo');
  await P.click(solo('music')); await sleep(300); await L.blur(P);
  const p1 = await pressed();
  const a1 = await measure('music-soloed');
  const drop = a0.rmsDb - a1.rmsDb;
  chkT(S, 'audio-solo-music-silences-stems-ge-20dB', a0.frames > 10 && a1.frames > 10 && a0.rmsDb > -60 && drop >= 20, { a0, a1, dropDb: drop, p1 });
  // repeat the pair once (paired, same position)
  await P.click(solo('music')); await sleep(300); await L.blur(P);
  const a2 = await measure('no-solo-2');
  await P.click(solo('music')); await sleep(300); await L.blur(P);
  const a3 = await measure('music-soloed-2');
  chkT(S, 'audio-pair-2-ge-20dB', a2.rmsDb - a3.rmsDb >= 20 && a2.rmsDb > -60, { a2, a3, dropDb: a2.rmsDb - a3.rmsDb });
  await P.click(solo('stems'), { modifiers: ['Control'] }); await sleep(300); await L.blur(P);
  const p2 = await pressed();
  chkT(S, 'ctrl-click-adds-stems', p2.music === 'true' && p2.stems === 'true' && p2.sfx === 'false', p2);
  const a4 = await measure('music+stems-soloed');
  chkT(S, 'audio-stems-back-with-both-soloed', Math.abs(a4.rmsDb - a0.rmsDb) <= 3, { a0, a4 });
  res.checks.soloShot = await shot('solo-two');
  await geoStep(S, 'two-soloed');
  await P.click(solo('sfx')); await sleep(300); await L.blur(P);
  const p3 = await pressed();
  chkT(S, 'plain-click-sfx-only', p3.music === 'false' && p3.stems === 'false' && p3.sfx === 'true', p3);
  await geoStep(S, 'sfx-only');
  await P.click(solo('sfx')); await sleep(300); await L.blur(P);

  // SELECTED-CLIP + REG-138 CLIP-MOVE
  const C = 'SELECTED-CLIP';
  await L.selectClip(P, sid);
  const sc = () => P.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-selected-clip]'); return e ? { text: e.textContent, title: e.getAttribute('title') } : null; });
  const s1 = await sc();
  chkT(C, 'text-equals-title', s1 && s1.text === s1.title, s1);
  chk(C, 'text', s1 && s1.text, 'Clip: ღამის პულსი · პულსი · start 00:20.000 · length 00:16.000 · source offset 00:00.000');
  await geoStep(C, 'selected');
  const b = await P.locator(`[data-clip-id="${sid}"] > div`).first().boundingBox(); const pps = (await L.geo(P)).pps;
  const x = b.x + Math.min(30, b.width / 2), y = b.y + b.height / 2;
  await P.mouse.move(x, y); await P.mouse.down(); await P.mouse.move(x + pps * 0.5, y, { steps: 8 }); await P.mouse.move(x + pps, y, { steps: 8 }); await sleep(250); await P.mouse.up(); await sleep(500);
  const c1 = (await clips()).find((c) => c.id === sid);
  const s2 = await sc(); const st = await L.status(P); const u = await undoT();
  chkT(C, 'moved-line-updates', s2 && s2.text === s2.title && s2.text === `Clip: ღამის პულსი · პულსი · start ${fmt(c1.start)} · length 00:16.000 · source offset 00:00.000` && Math.abs(c1.start - 21) < 0.06, { s2, start: c1.start });
  chk('REG-138', 'clip-move-status', st, `Move clip: start ${fmt(c1.start)}, length 00:16.000, source offset 00:00.000.`);
  chk('REG-138', 'clip-move-undo', u, 'Undo: Move clip');
  res.checks.selectedShot = await shot('selected-clip-moved');
  await geoStep(C, 'moved');
  await P.context().close();
}

async function ghostRows() {
  await open('ghost');
  const mid = await addExact('demo-synth-mix', 'music', 0);
  res.checks.ghostClip = mid;
  const G = 'LIBRARY-GHOST';
  const libDrag = async (src, lane, t, { release = false } = {}) => {
    const o = P.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
    const ob = await o.boundingBox(); const lb = await P.locator(`[data-track-id="${lane}"]`).last().boundingBox();
    const g = await L.geo(P);
    const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
    const tx = Math.round(g.rl + t * g.pps), ty = Math.round(lb.y + lb.height / 2);
    await P.mouse.move(ox, oy); await P.mouse.down(); await P.mouse.move(ox + 12, oy, { steps: 3 });
    await P.mouse.move(tx, ty, { steps: 14 }); await sleep(400);
    const ghost = await P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((e) => ({ text: e.textContent.trim(), blocked: e.dataset.blocked, lane: e.closest('[data-track-id]')?.dataset.trackId })));
    await geoStep(G, `held-${src}-${lane}-${t}`);
    const sh = await shot(`ghost-${lane}-${t}`);
    if (!release) { await P.mouse.move(ox, oy, { steps: 14 }); await sleep(250); }
    await P.mouse.up(); await sleep(900);
    return { ghost, shot: sh, statusAfter: await L.status(P), clipsAfter: (await clips()).length };
  };
  const free = await libDrag('demo-soft-impact', 'sfx', 10);
  res.checks.ghostFree = free;
  chkT(G, 'free-no-suffix', free.ghost.length === 1 && free.ghost[0].text === '00:10.000' && free.ghost[0].blocked === 'false', free.ghost);
  const occ = await libDrag('demo-soft-impact', 'music', 5, { release: true });
  res.checks.ghostOccupied = occ;
  chkT(G, 'occupied-no-room', occ.ghost.length === 1 && occ.ghost[0].text === '00:05.000 · No room here' && occ.ghost[0].blocked === 'true', occ.ghost);
  res.checks.blockedReleaseStatus = occ.statusAfter; res.checks.blockedReleaseClips = occ.clipsAfter;
  chkT(G, 'release-occupied-no-clip-added', occ.clipsAfter === 1, occ.clipsAfter);
  console.log('INFO blocked release status (B expects /^No room here/):', /^No room here/.test(occ.statusAfter), occ.statusAfter);
  await geoStep(G, 'after-blocked-release');
  const vid = await libDrag('demo-soft-impact', 'video', 9);
  res.checks.ghostVideo = vid;
  chkT(G, 'video-refused', vid.ghost.length === 1 && vid.ghost[0].text === '00:09.000 · Audio is not added to the video track' && vid.ghost[0].blocked === 'true', vid.ghost);
  // not-ready: a library-MIME dragover with no library drag in progress (synthetic DataTransfer)
  const nr = await P.evaluate(() => {
    const row = [...document.querySelectorAll('[data-track-id="sfx"]')].pop();
    const hr = row.querySelector('[data-testid=arrangement-track-header]').getBoundingClientRect();
    const tgt = [...row.querySelectorAll('div')].find((d) => d.getBoundingClientRect().left >= hr.right - 1 && d.getBoundingClientRect().width > 300 && d.getBoundingClientRect().height > 30);
    const ruler = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect();
    const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];
    const r = tgt.getBoundingClientRect();
    const dt = new DataTransfer(); dt.setData('application/x-czaba-workspace-source', 'demo-not-a-source');
    const o = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: ruler.left + 7 * pps, clientY: r.top + r.height / 2 };
    tgt.dispatchEvent(new DragEvent('dragenter', o)); tgt.dispatchEvent(new DragEvent('dragover', o));
    return { types: [...dt.types] };
  });
  await sleep(300);
  const nrg = await P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((e) => ({ text: e.textContent.trim(), blocked: e.dataset.blocked, lane: e.closest('[data-track-id]')?.dataset.trackId })));
  res.checks.ghostNotReady = { nr, nrg, shot: await shot('ghost-not-ready-synthetic') };
  await geoStep(G, 'not-ready-synthetic');
  const nrOk = nrg.length === 1 && nrg[0].text === '00:07.000 · This sound has not loaded yet' && nrg[0].blocked === 'true';
  res.checks.ghostNotReadyOk = nrOk;
  console.log('NOT-READY (synthetic)', nrOk, JSON.stringify(nrg));
  await P.evaluate(() => { const row = [...document.querySelectorAll('[data-track-id="sfx"]')].pop(); for (const d of row.querySelectorAll('div')) d.dispatchEvent(new DragEvent('dragleave', { bubbles: true, relatedTarget: document.body })); });
  await sleep(200);

  // ALL-TRACKS-OVERLAY + REG-138 RANGE-BADGE
  const A = 'ALL-TRACKS-OVERLAY';
  await X.rangeDrag(P, mid, 3, 5);
  const badge = await P.evaluate((id) => [...document.querySelectorAll(`[data-clip-id="${id}"] span.whitespace-nowrap`)].map((e) => e.textContent), mid);
  chk('REG-138', 'range-badge', badge[0], '00:03.000 – 00:05.000 · 2.000 s');
  const rng = await X.key(P, 'Control+Shift+l');
  const ov = await P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-lane-range] span')].map((e) => ({ lane: e.closest('[data-track-id]').dataset.trackId, text: e.textContent })));
  const ro = await P.evaluate(() => (document.querySelector('[data-testid=arrangement-range]') || {}).textContent || null);
  res.checks.overlay = { ov, ro, status: rng };
  chkT(A, 'overlay-label', ov.length >= 1 && ov.every((o) => o.text === '00:03.000 – 00:05.000 · 2.000 s · all tracks'), ov);
  chkT(A, 'readout-all-tracks', !!ro && /all tracks/.test(ro), ro);
  res.checks.overlayShot = await shot('all-tracks-overlay');
  await geoStep(A, 'all-tracks');
  await P.context().close();
}

async function audioNoteRows() {
  const N = 'AUDIO-NOTE';
  for (const file of ['noaudio-2s-h264.mp4', 'beeps-6s-h264-aac.mp4']) {
    await open(`note-${file.slice(0, 7)}`);
    await P.evaluate(() => {
      window.__notes = [];
      const mo = new MutationObserver(() => { for (const c of document.querySelectorAll('[data-clip-kind=video]')) { const t = c.textContent; if (!window.__notes.length || window.__notes[window.__notes.length - 1].t !== t) window.__notes.push({ ms: Math.round(performance.now()), t }); } });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    await P.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA + file);
    await P.waitForFunction(() => document.querySelectorAll('[data-clip-kind=video]').length > 0, null, { timeout: 30000 });
    await sleep(4000);
    const notes = await P.evaluate(() => window.__notes);
    const final = await P.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((c) => c.textContent));
    res.checks[`audioNote-${file}`] = { notes, final, shot: await shot(`video-${file.slice(0, 7)}`) };
    await geoStep(N, file);
    if (file.startsWith('noaudio')) chkT(N, 'no-sound-note', final.some((t) => t.includes('No sound')), { final, notes });
    else {
      const sawDecoding = notes.some((n) => n.t.includes('Sound is decoding…'));
      res.checks.decodingObserved = sawDecoding;
      chkT(N, 'beeps-final-no-note', final.every((t) => !/Sound is decoding…|No sound|Sound could not be read/.test(t)), { final, sawDecoding });
    }
    await P.context().close();
  }
}

(async () => {
  const rows = { headerRows, foldSoloRows, ghostRows, audioNoteRows };
  for (const [k, f] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== k) continue;
    try { await f(); } catch (e) { res.fails.push({ row: k, id: 'exception', got: String(e.stack || e).slice(0, 800) }); console.log('EXC', k, e); try { await P.context().close(); } catch (_) {} }
    save();
  }
  res.geoTotal = { steps: res.geoSteps.length, raw: res.geoSteps.reduce((a, s) => a + s.raw, 0), net: res.geoSteps.reduce((a, s) => a + s.net, 0) };
  res.endUtc = new Date().toISOString(); save();
  console.log('DONE oks', res.oks, 'fails', res.fails.length, JSON.stringify(res.geoTotal), JSON.stringify(X.netOk(net.filter((n) => !n.invalid))));
  await B.close();
})();
