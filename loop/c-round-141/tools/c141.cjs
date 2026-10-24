// C round 141: V-0.4d default track / group names. node c141.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from current-task.md §1.1/§5 (never imported from the app).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
// R5 subtractions only: demo source titles (data, V-0.5) and the demo-ready status (V-0.5). Track names and the group prefix are NOT subtracted.
const DEMO_TITLES = ['ღამის პულსი', 'სინთეზური დემო', 'სრული მიქსი', 'პულსი', 'ბასი', 'პადი', 'მელოდია', 'საჯარო preview'];
const DEMO_BADGE = 'დემო კოლექცია — ავტორიზაცია არ სჭირდება';
const DEMO_READY = /^დემო კოლექცია მზადაა\./;
const OLD_NAMES = /ვიდეო|მუსიკა|სტემები|აუდიო|ჯგუფი/;
function subtract(s) {
  let t = s || ''; const used = [];
  if (gc(t) && DEMO_READY.test(t)) { used.push('demo-ready load-time status (collection.ts, V-0.5)'); t = ''; }
  if (t.includes(DEMO_BADGE)) { used.push('demo badge (collection.ts l.16 badge, V-0.5 collection copy)'); t = t.split(DEMO_BADGE).join(''); }
  for (const n of DEMO_TITLES) if (t.includes(n)) { used.push(`demo source title ${n} (data, V-0.5)`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [], oks: 0, geoSteps: [], wsScans: [], audio: {} };
const OUTF = path.join(L.OUT, `c141-${W}-${TAG}-${ONLY}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P; let B; const getB = async () => (B = B || await L.launch());
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-141/shots/${f}`; }
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); else res.oks++; console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); (res.rows[row] = res.rows[row] || []).push({ id, ok, got, exp }); save(); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); else res.oks++; console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); (res.rows[row] = res.rows[row] || []).push({ id, ok: !!cond, info }); save(); return cond; }
function note(row, id, info) { console.log(row, id, '-- ', JSON.stringify(info)); (res.rows[row] = res.rows[row] || []).push({ id, note: info }); save(); }
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
      lbl = `c141-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
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


// Workspace-wide scan outside the R5 surfaces (library, detail panel, video dock, document.title).
const WS_EXCL = ['[data-testid=arrangement-library]', '[data-testid=arrangement-detail-panel]', '[data-testid=arrangement-video-dock]'];
const wsScan = () => P.evaluate((excl) => {
  const root = document.querySelector('.studio-container') || document.body;
  const skip = (el) => excl.some((s) => el.closest(s));
  const hits = [];
  const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) { const el = n.parentElement; if (!el || skip(el)) continue; if (KA.test(n.textContent)) hits.push({ kind: 'text', tag: el.tagName, tid: (el.closest('[data-testid]') || {}).dataset?.testid || '', v: n.textContent.trim().slice(0, 140) }); }
  for (const el of root.querySelectorAll('*')) { if (skip(el)) continue; for (const a of ['aria-label', 'title', 'placeholder', 'aria-description', 'aria-valuetext', 'alt']) { const v = el.getAttribute(a); if (v && KA.test(v)) hits.push({ kind: a, tag: el.tagName, tid: (el.closest('[data-testid]') || {}).dataset?.testid || '', v: v.slice(0, 140) }); } }
  return hits;
}, WS_EXCL);
async function wsStep(row, id) {
  const hits = await wsScan();
  const oldName = hits.filter((h) => OLD_NAMES.test(h.v));
  const residue = []; const subs = new Set();
  for (const h of hits) { const s = subtract(h.v); s.subtracted.forEach((x) => subs.add(`${h.tid || h.tag}: ${x}`)); if (s.net || s.netQ) residue.push(h); }
  res.wsScans.push({ row, id, hits: hits.length, oldName, residue, subtracted: [...subs] }); save();
  if (oldName.length || residue.length) console.log('   WS', row, id, JSON.stringify({ oldName, residue }).slice(0, 600));
  return { oldName: oldName.length, residue: residue.length };
}
async function both(row, id) { const g = await geoStep(row, id); const w = await wsStep(row, id); chkT('GEO-COUNT', `${row}:${id}`, g === 0 && w.oldName === 0 && w.residue === 0, { geoNet: g, wsOldName: w.oldName, wsResidue: w.residue }); }

const nameLbl = (t) => P.locator(`[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]`).first().getAttribute('aria-label');
const nameTxt = (t) => P.locator(`[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label*="— set as the active track"]`).first().evaluate((b) => { const c = b.cloneNode(true); const badges = [...c.querySelectorAll('span')].filter((x) => x.textContent.trim() === '· active'); badges.forEach((x) => x.remove()); return JSON.stringify({ name: c.textContent, activeBadge: badges.length }); });
const redoT = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Redo/.test(x.textContent)); return b ? b.getAttribute('title') : null; });
const GN = '[data-testid=arrangement-group-name]';
const groupState = () => P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-row]')].map((r) => { const n = r.querySelector('[data-testid=arrangement-group-name]'); return { label: n && n.getAttribute('aria-label'), text: n && n.textContent.trim(), id: r.getAttribute('data-group-id') }; }));
const groupNameBtn = (name) => P.locator(`${GN}[aria-label^="${name} — group"]`).first();

// ---------- TRACK-NAMES ----------
async function trackNamesRow() {
  const R = 'TRACK-NAMES';
  await open('names');
  for (const [k, n] of [['video', 'Video'], ['music', 'Music'], ['stems', 'Stems'], ['sfx', 'SFX']]) {
    chk(R, `${k}-label`, await nameLbl(k), `${n} — set as the active track`);
    const nt = JSON.parse(await nameTxt(k)); res.checks[`${k}NameText`] = nt; chk(R, `${k}-text`, nt.name.trim(), n);
  }
  res.checks.namesShot = await shot('names-fresh');
  await both(R, 'fresh');
  await P.click(L.nameSel('music')); await sleep(300); await L.blur(P);
  chk(R, 'music-selected-label', await nameLbl('music'), 'Music — set as the active track, selected');
  chk(R, 'music-solo-label', await P.locator('[data-track-id="music"] [data-testid=arrangement-track-header] button[aria-label^="Solo"]').first().getAttribute('aria-label'), 'Solo — Music (Ctrl/Cmd+click = add to solo)');
  await seekExact(2);
  const o = P.locator('[role=option][data-source-id="demo-stem-pad"]'); await o.scrollIntoViewIfNeeded(); await o.focus(); await sleep(150);
  await P.keyboard.press('Enter'); await sleep(900);
  const st = await L.status(P); res.checks.addStatus = st;
  chkT(R, 'add-status-names-Music', /^“.+” added to the Music track at .+\.$/.test(st), st);
  await L.blur(P);
  const c = (await clips()).filter((x) => x.lane === 'music'); chkT(R, 'clip-on-music', c.length === 1, c);
  await both(R, 'added');
  await seekExact(1.5); await P.keyboard.press('Space'); await sleep(2500);
  const mtDuring = await P.locator('[data-track-id="music"] [data-testid=arrangement-track-meter]').first().getAttribute('title');
  await P.keyboard.press('Space'); await sleep(500);
  const mt = await P.locator('[data-track-id="music"] [data-testid=arrangement-track-meter]').first().getAttribute('title');
  res.checks.musicMeterTitle = { during: mtDuring, after: mt };
  chkT(R, 'music-meter-title-prefix', /^Music · Peak /.test(mt || '') && /^Music · Peak /.test(mtDuring || ''), res.checks.musicMeterTitle);
  const vmt = await P.locator('[data-track-id="video"] [data-testid=arrangement-track-meter]').first().getAttribute('title').catch(() => null);
  note(R, 'video-meter-title', vmt);
  if (vmt) chkT(R, 'video-meter-title-prefix', /^Video · Peak /.test(vmt), vmt);
  res.checks.namesShot2 = await shot('names-added-played');
  await both(R, 'played');
  await P.context().close();
}

// ---------- GROUP-DEFAULT + GROUP-MIX-REG ----------
async function groupDefaultRow() {
  const R = 'GROUP-DEFAULT';
  await open('gdef');
  const mId = await addExact('demo-stem-pad', 'music', 0);
  const sId = await addExact('demo-stem-bass', 'stems', 0);
  const xId = await addExact('demo-synth-mix', 'sfx', 20);
  chkT(R, 'clips', !!(mId && sId && xId), { mId, sId, xId });
  const titles = [];
  const rec = async (step) => { const t = { step, undo: await undoT(), redo: await redoT(), status: await L.status(P), groups: await groupState() }; titles.push(t); res.checks.historyTrail = titles; save(); return t; };
  // 1
  await P.click(L.nameSel('music')); await sleep(250);
  await P.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
  await press('Control+g');
  const s1 = await rec('1-group-music-stems');
  chk(R, '1-status', s1.status, 'Group “Group 1” created: Music, Stems.');
  chk(R, '1-name-label', await P.locator(GN).first().getAttribute('aria-label'), 'Group 1 — group, selected');
  const t1 = (await P.locator(GN).first().textContent()).trim(); res.checks.groupNameText = t1;
  chkT(R, '1-name-text', t1.replace(/^▣\s*/, '') === 'Group 1', t1);
  chk(R, '1-fold-label', await P.locator('[data-testid=arrangement-group-fold]').first().getAttribute('aria-label'), 'Fold or unfold group — Group 1');
  res.checks.g1Shot = await shot('group1-created');
  await both(R, 'step1');
  // GROUP-MIX-REG on Group 1 (members only at 0..~)
  await groupMixReg();
  // 2: Group 1 + SFX
  await groupNameBtn('Group 1').click(); await sleep(300);
  await P.click(L.nameSel('sfx'), { modifiers: ['Control'] }); await sleep(300);
  res.checks.step2Selection = { g1: await groupNameBtn('Group 1').getAttribute('aria-label'), sfx: await nameLbl('sfx') };
  await press('Control+g');
  const s2 = await rec('2-group-g1-sfx');
  chkT(R, '2-group2-exists', s2.groups.some((g) => /^Group 2 — group/.test(g.label || '')), s2.groups);
  note(R, '2-status-exact', s2.status);
  chkT(R, '2-status-shape', /^Group “Group 2” created: .+\.$/.test(s2.status) && !OLD_NAMES.test(s2.status), s2.status);
  res.checks.g2Shot = await shot('group2-created');
  await both(R, 'step2');
  // 3: ungroup Group 2
  await groupNameBtn('Group 2').click(); await sleep(300);
  await press('Control+Shift+g');
  const s3 = await rec('3-ungroup-g2');
  chk(R, '3-status', s3.status, 'Group “Group 2” ungrouped.');
  chkT(R, '3-group2-gone', !s3.groups.some((g) => /^Group 2 /.test(g.label || '')) && s3.groups.some((g) => /^Group 1 /.test(g.label || '')), s3.groups);
  await both(R, 'step3');
  // 4: rename Group 1 -> Drums, keep it; group Drums + SFX -> Group 1
  await groupNameBtn('Group 1').click(); await sleep(300);
  await P.keyboard.press('F2'); await sleep(400);
  const inp = '[data-testid=arrangement-group-name-input]';
  chk(R, '4-input-label', await P.locator(inp).getAttribute('aria-label'), 'Group name — Group 1');
  await P.keyboard.press('Control+a'); await P.keyboard.type('Drums'); await P.keyboard.press('Enter'); await sleep(500);
  const s4a = await rec('4a-rename-drums');
  chkT(R, '4a-renamed', s4a.groups.length === 1 && /^Drums — group/.test(s4a.groups[0].label || ''), s4a.groups);
  note(R, '4a-status', s4a.status);
  await L.blur(P);
  await groupNameBtn('Drums').click(); await sleep(300);
  await P.click(L.nameSel('sfx'), { modifiers: ['Control'] }); await sleep(300);
  await press('Control+g');
  const s4b = await rec('4b-group-drums-sfx');
  res.checks.g4Groups = s4b.groups;
  chkT(R, '4b-drums-kept', s4b.groups.some((g) => /^Drums — group/.test(g.label || '')), s4b.groups);
  chkT(R, '4b-new-outer-is-Group-1', s4b.groups.some((g) => /^Group 1 — group/.test(g.label || '')) && !s4b.groups.some((g) => /^Group 2 /.test(g.label || '')), s4b.groups);
  note(R, '4b-status', s4b.status);
  chkT(R, '4b-status-shape', /^Group “Group 1” created: .+\.$/.test(s4b.status) && !OLD_NAMES.test(s4b.status), s4b.status);
  res.checks.g4Shot = await shot('group1-outer-after-drums');
  await both(R, 'step4');
  // 5: Ctrl+Z chain, then Ctrl+Y/Shift+Z back
  const undoSteps = [];
  for (let i = 0; i < 6; i++) { const before = await undoT(); await press('Control+z'); const after = await rec(`5-undo-${i + 1}`); undoSteps.push({ before, after: after.undo, redo: after.redo, status: after.status, groups: after.groups.map((g) => g.label) }); }
  res.checks.undoSteps = undoSteps;
  for (const u of undoSteps) chkT(R, `5-undo-titles-english:${u.before}`, !OLD_NAMES.test(`${u.before}|${u.after}|${u.redo}|${u.status}`) && !gc(`${u.before}|${u.after}|${u.redo}`), u);
  const redoSteps = [];
  for (let i = 0; i < 6; i++) { const before = await redoT(); await press('Control+Shift+z'); const after = await rec(`5-redo-${i + 1}`); redoSteps.push({ before, after: after.redo, undo: after.undo, status: after.status, groups: after.groups.map((g) => g.label) }); }
  res.checks.redoSteps = redoSteps;
  for (const u of redoSteps) chkT(R, `5-redo-titles-english:${u.before}`, !OLD_NAMES.test(`${u.before}|${u.after}|${u.undo}|${u.status}`) && !gc(`${u.before}|${u.after}|${u.undo}`), u);
  const fin = await groupState(); res.checks.afterRedo = fin;
  chkT(R, '5-redo-restores-drums+group1', fin.some((g) => /^Drums — group/.test(g.label || '')) && fin.some((g) => /^Group 1 — group/.test(g.label || '')), fin);
  await both(R, 'step5');
  await P.context().close();
}

async function groupMixReg() {
  const R = 'GROUP-MIX-REG';
  const MB = '[data-testid=arrangement-group-mute]';
  chk(R, 'mute-label', await P.locator(MB).first().getAttribute('aria-label'), 'Mute — Group 1 (group)');
  chk(R, 'solo-label', await P.locator('[data-testid=arrangement-group-solo]').first().getAttribute('aria-label'), 'Solo — Group 1 (group, Ctrl/Cmd+click = add to solo)');
  chk(R, 'volume-label', await P.locator('[data-testid=arrangement-group-volume]').first().getAttribute('aria-label'), 'Volume — Group 1 (group)');
  await L.blur(P);
  const base = await rmsWin(0.5, 2.4, 1.0, 2.6);
  await P.locator(MB).first().click(); await sleep(300); await L.blur(P);
  chk(R, 'mute-pressed', await P.locator(MB).first().getAttribute('aria-pressed'), 'true');
  chk(R, 'undo-title-after-mute', await undoT(), 'Undo: Mute — Group 1');
  await both(R, 'muted');
  const muted = await rmsWin(0.5, 2.4, 1.0, 2.6);
  await P.locator(MB).first().click(); await sleep(300); await L.blur(P);
  const un = await rmsWin(0.5, 2.4, 1.0, 2.6);
  res.audio.groupMute = { base, muted, unmuted: un, drop: +(base.rmsDb - muted.rmsDb).toFixed(2), restore: +(un.rmsDb - base.rmsDb).toFixed(2) };
  chkT(R, 'audio-mute->=20dB', base.winFrames >= 10 && muted.winFrames >= 10 && base.rmsDb - muted.rmsDb >= 20, res.audio.groupMute);
  chkT(R, 'audio-unmute-within-1dB', un.winFrames >= 10 && Math.abs(un.rmsDb - base.rmsDb) <= 1, res.audio.groupMute);
  chk(R, 'mute-unpressed', await P.locator(MB).first().getAttribute('aria-pressed'), 'false');
}

// ---------- REG-140 ----------
async function reg140Row() {
  const R = 'REG-140';
  await open('reg');
  const id = await addExact('demo-stem-pad', 'music', 0);
  chkT(R, 'clip', !!id, { id });
  await P.click('[data-testid=arrangement-envelope-toggle]'); await sleep(400); await L.blur(P);
  const ed = `[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-editor]`;
  const g = await L.geo(P); const eb = await P.locator(ed).boundingBox();
  await P.mouse.dblclick(g.rl + 6 * g.pps, eb.y + eb.height * 0.5); await sleep(500);
  const t = await P.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`).first().getAttribute('data-time');
  chk(R, 'envelope-add-status', await L.status(P), `Envelope: point added — ${t} s · 0.0 dB.`);
  await both(R, 'env');
  await P.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(P);
  await seekExact(0); await P.keyboard.press('Space'); await sleep(2500); await P.keyboard.press('Space'); await sleep(500);
  await P.click('[data-testid=arrangement-master-peak]'); await sleep(500);
  chk(R, 'master-peak-after-reset', await P.locator('[data-testid=arrangement-master-peak]').getAttribute('aria-label'), 'Master Peak −∞ dBFS — click to clear');
  await both(R, 'master');
  res.checks.regShot = await shot('reg140');
  await P.context().close();
}

(async () => {
  const rows = { names: trackNamesRow, group: groupDefaultRow, reg: reg140Row };
  try {
    for (const [k, f] of Object.entries(rows)) {
      if (ONLY !== 'all' && ONLY !== k) continue;
      try { await f(); } catch (e) { res.fails.push({ row: k, id: 'exception', got: String(e.stack || e).slice(0, 600) }); console.log('EXC', k, e); try { await P.screenshot({ path: path.join(L.SHOTS, `exc-${k}-${W}-${TAG}.png`) }); await P.context().close(); } catch (_) {} }
    }
  } finally { res.endedUtc = new Date().toISOString(); save(); if (B) await B.close(); console.log('DONE oks', res.oks, 'fails', res.fails.length, JSON.stringify(X.netOk(net))); }
})();
