// C round 130 copy rows. node copy130.cjs <1440|1280> <play|lib|loop|nudge|del> <tag>
// Expected strings are hand-written from task §1.1 (not imported from strings.ts).
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const SEC = process.argv[3]; const TAG = process.argv[4] || 'r1';
const H = require('./h3.cjs'); const { X, L, sleep } = H;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const SUB = ['ვიდეო', 'მუსიკა', 'სტემები', 'CZABA hero — საჯარო preview', 'Middle East — საჯარო preview', 'ღამის პულსი · პულსი', ' · აქ ადგილი არ არის'];
const gNet = (s) => { let t = s || ''; const used = []; for (const n of SUB) if (t.includes(n)) { used.push(n); t = t.split(n).join(''); } return { net: gc(t), raw: gc(s), subtracted: used }; };
const fmt = (sec) => { const ms = Math.round(Math.max(0, sec) * 1000); const m = Math.floor(ms / 60000); const s = Math.floor((ms % 60000) / 1000); return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`; };
const Q = (t) => `“${t}”`;
const net = []; const res = { vp: W, sec: SEC, tag: TAG, startedUtc: new Date().toISOString(), steps: [] };
const OUTF = path.join(L.OUT, `copy130-${SEC}-${W}-${TAG}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
const undoT = async () => ((await X.undoTitle(P)) || '').split('|')[0];
const redoT = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Redo/.test(x.textContent)); return b ? b.getAttribute('title') : null; });
const clips = async () => (await L.clipsDom(P)).filter((c) => c.kind !== 'video').map((c) => ({ id: c.id, lane: c.lane, start: c.start, dur: c.wdur, sel: c.sel }));
const brief = (cs) => cs.map((c) => `${c.lane}@${c.start}${c.sel ? '*' : ''}`).sort().join(' ');
const loopState = () => P.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-loop-brace]'); return b ? { enabled: b.dataset.loopEnabled, left: b.style.left, width: b.style.width, label: (b.getAttribute('aria-label') || '').split(' · ')[0] } : null; });
const statusBox = () => P.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-status]'); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, sw: e.scrollWidth, cw: e.clientWidth, docSW: document.documentElement.scrollWidth, vw: innerWidth }; });
const undoBox = () => P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.title || '')); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
const audio = () => P.evaluate(() => ({ cbs: window.__h.cbs, ctxs: window.__h.ctxs.map((c) => c.state), play: [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Play' || x.getAttribute('aria-label') === 'Pause' || /Play|Pause|Stop/.test(x.textContent.trim().slice(0, 8)))?.textContent.trim() }));
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-130/shots/${f}`; }
async function rec(id, expected, extra = {}) {
  const status = await L.status(P);
  const undo = await undoT();
  const r = { id, expected, status, exact: expected === null ? null : status === expected, geoStatus: gNet(status), undo, geoUndo: gNet(undo), clips: brief(await clips()), loop: await loopState(), ...extra };
  res.steps.push(r); save();
  console.log(id, r.exact === null ? 'INFO' : r.exact ? 'OK ' : 'XX ', JSON.stringify(status), r.exact === false ? ' expected ' + JSON.stringify(expected) : '', '| undo:', undo);
  return r;
}
async function undoCheck(id, expectedTitle, verify) {
  const title = await undoT();
  const before = { clips: brief(await clips()), loop: await loopState() };
  await X.key(P, 'Control+z'); await sleep(300);
  const after = { clips: brief(await clips()), loop: await loopState(), status: await L.status(P), redo: await redoT() };
  const ok = verify ? await verify(after, before) : null;
  await X.key(P, 'Control+Shift+z'); await sleep(300);
  const redone = { clips: brief(await clips()), loop: await loopState() };
  const r = { id: `${id}-undo`, undoTitle: title, expectedTitle, titleOk: title === expectedTitle, geoUndo: gNet(title), before, afterUndo: after, undoEffectOk: ok, redoReapplied: JSON.stringify({ ...redone, clips: redone.clips.replace(/\*/g, '') }) === JSON.stringify({ ...before, clips: before.clips.replace(/\*/g, '') }) };
  res.steps.push(r); save();
  console.log(r.id, r.titleOk ? 'OK ' : 'XX ', title, '| effect', ok, '| redo', r.redoReapplied);
  return r;
}
async function statusObs() {
  await P.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const Wd = { recs: [], keys: [], t0: performance.now() };
    window.__so = Wd;
    Wd.mo = new MutationObserver((rs) => { for (const r of rs) { if (r.type === 'characterData') Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), type: 'char', text: r.target.textContent }); for (const n of r.addedNodes) Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), type: 'add', text: n.textContent }); } });
    Wd.mo.observe(out, { childList: true, subtree: true, characterData: true });
    window.addEventListener('keydown', (e) => Wd.keys.push({ k: e.key, r: e.repeat, t: Math.round(performance.now() - Wd.t0) }), true);
  });
}
const obsRead = () => P.evaluate(() => { const Wd = window.__so; Wd.mo.takeRecords().forEach(() => {}); return { recs: Wd.recs.slice(), keys: Wd.keys.slice() }; });
async function cdpHold(client, key, code, vk, repeats) {
  const base = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base, autoRepeat: false });
  for (let i = 0; i < repeats; i += 1) { await sleep(90); await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...base, autoRepeat: true }); }
  await sleep(60);
  await client.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await sleep(600);
}
async function selectOption(id) { const o = P.locator(`[role=option][data-source-id="${id}"]`); await o.scrollIntoViewIfNeeded(); await o.click(); await sleep(250); }
async function addButton() { await P.getByRole('button', { name: '＋ დამატება' }).click(); await sleep(600); await L.blur(P); }
async function snap(on) { await L.blur(P); const s = await P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap); if ((s === 'on') !== on) { await P.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); } await L.blur(P); return P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap); }
const clipAt = async (lane, start) => { const c = (await clips()).find((x) => x.lane === lane && Math.abs(x.start - start) < 0.02); if (!c) throw new Error(`no clip ${lane}@${start}`); return c.id; };
const sel = async (lane, start, mods = []) => L.selectClip(P, await clipAt(lane, start), mods);
async function libDrag(src, lane, t, { readGhost = true } = {}) {
  const o = P.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const ob = await o.boundingBox(); const lb = await P.locator(`[data-track-id="${lane}"]`).last().boundingBox();
  const g = await L.geo(P);
  const ox = Math.round(ob.x + ob.width / 2), oy = Math.round(ob.y + ob.height / 2);
  const tx = Math.round(g.rl + t * g.pps), ty = Math.round(lb.y + lb.height / 2);
  await P.mouse.move(ox, oy); await P.mouse.down(); await P.mouse.move(ox + 12, oy, { steps: 3 });
  await P.mouse.move(tx, ty, { steps: 14 }); await sleep(350);
  const ghost = readGhost ? await P.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map((e) => ({ text: e.textContent.trim(), lane: e.closest('[data-track-id]')?.dataset.trackId, cls: e.className.slice(0, 120) }))) : null;
  const statusMid = await L.status(P);
  await P.mouse.up(); await sleep(900);
  return { ghost, statusMid, tx, ty };
}

(async () => {
  const b = await L.launch();
  try {
    const { ctx, page } = await L.openStudio(b, X.VPS[W], `copy130-${SEC}-${W}-${TAG}`, net); P = page;
    res.geo = await L.geo(P); res.statusBox0 = await statusBox(P); res.undoBox0 = await undoBox();
    res.initialStatus = await L.status(P);
    if (SEC === 'play') {
      await L.blur(P);
      const a0 = await audio(); const p0 = await L.posNow(P);
      await P.keyboard.press('Space'); await sleep(200);
      const s1 = await L.posNow(P); await sleep(500); const p1 = await L.posNow(P); const a1 = await audio();
      await rec('PLAY-a', 'Nothing to play — add a clip from the library first.', { audioBefore: a0, audioAfter: a1, pos: [p0, s1, p1], noPlayback: p0 === p1 && a0.cbs === a1.cbs && a0.play === a1.play, statusBox: await statusBox(), shot: await shot('PLAY-a') });
      await snap(false);
      const add = await L.addAt(P, 'demo-soft-impact', 'sfx', 0);
      await rec('PLAY-setup-add', `${Q('Soft impact')} added to the SFX track at 00:00.000.`, { addVia: 'Enter on focused library option (addAt)', add });
      const pos = await L.seekTo(P, 5);
      const a2 = await audio(); await L.blur(P);
      await P.keyboard.press('Space'); await sleep(200);
      const q1 = await L.posNow(P); await sleep(500); const q2 = await L.posNow(P); const a3 = await audio();
      await rec('PLAY-b', `Playhead (${fmt(pos)}) is past the end of the project (00:02.000) — there is nothing to play here. Home returns to 0.`, { playheadAfterRulerClick: pos, audioBefore: a2, audioAfter: a3, pos: [pos, q1, q2], noPlayback: pos === q2 && a2.cbs === a3.cbs && a2.play === a3.play, statusBox: await statusBox(), undoBox: await undoBox(), shot: await shot('PLAY-b') });
      // control: Home then Space actually plays (proves the instrument sees playback)
      await L.blur(P); await P.keyboard.press('Home'); await sleep(250);
      const c0 = await audio(); await P.keyboard.press('Space'); await sleep(700); const c1 = await audio(); const cp = await L.posNow(P);
      await P.keyboard.press('Space'); await sleep(300);
      res.playControl = { before: c0, after: c1, posAfter700ms: cp, played: c1.cbs > c0.cbs && cp > 0 }; save();
      console.log('control play', JSON.stringify(res.playControl));
    }
    if (SEC === 'lib') {
      await snap(false);
      await P.click(L.nameSel('music')); await sleep(200); await L.seekTo(P, 0);
      await selectOption('demo-hero-music'); await addButton();
      await rec('LIB-a', `${Q('CZABA hero — საჯარო preview')} added to the მუსიკა track at 00:00.000.`, { addVia: '＋ დამატება button', shot: await shot('LIB-a') });
      await undoCheck('LIB-a', 'Undo: Add — CZABA hero — საჯარო preview', (a, bf) => !a.clips.includes('music@0') && bf.clips.includes('music@0'));
      const s1 = await L.addAt(P, 'demo-soft-impact', 'sfx', 0);
      await rec('LIB-a2', `${Q('Soft impact')} added to the SFX track at 00:00.000.`, { addVia: 'Enter on focused option', s1 });
      await P.click(L.nameSel('sfx')); await sleep(200); await L.seekTo(P, 1);
      await selectOption('demo-soft-impact'); await addButton();
      await rec('LIB-b', `${Q('Soft impact')} added to the SFX track at 00:02.000 (nearest free spot).`, { addVia: '＋ დამატება button, playhead 1 inside sfx 0–2', shot: await shot('LIB-b') });
      await P.click(L.nameSel('video')); await sleep(200);
      const n0 = (await clips()).length; const bx0 = await statusBox();
      await selectOption('demo-soft-impact');
      const addDisabled = await P.getByRole('button', { name: '＋ დამატება' }).isDisabled();
      const addTitle = await P.getByRole('button', { name: '＋ დამატება' }).getAttribute('title');
      const o = P.locator('[role=option][data-source-id="demo-soft-impact"]'); await o.focus(); await sleep(150); await P.keyboard.press('Enter'); await sleep(600);
      await rec('LIB-c', 'Choose an audio track (music, stems or SFX) — audio is not added to the video track.', { addVia: 'Enter on focused option (button disabled on video track)', addButtonDisabledOnVideo: addDisabled, addButtonTitle: addTitle, clipCountBefore: n0, clipCountAfter: (await clips()).length, statusBox: await statusBox(), statusBoxBefore: bx0, undoBox: await undoBox(), shot: await shot('LIB-c') });
      if (false) await rec('LIB-c', 'Choose an audio track (music, stems or SFX) — audio is not added to the video track.', { clipCountBefore: n0, clipCountAfter: (await clips()).length, statusBox: await statusBox(), statusBoxBefore: bx0, undoBox: await undoBox(), shot: await shot('LIB-c') });
      await P.click(L.nameSel('sfx')); await sleep(200); await L.blur(P);
      const st0 = await L.status(P); const n1 = (await clips()).length;
      const d = await libDrag('demo-soft-impact', 'sfx', 1);
      await rec('LIB-d', st0, { note: 'blocked drop: expected status unchanged (no drop event); ghost overlap note', statusBefore: st0, drag: d, clipCountBefore: n1, clipCountAfter: (await clips()).length, shotPost: await shot('LIB-d') });
      const e = await libDrag('demo-soft-impact', 'sfx', 8);
      const c8 = (await clips()).find((c) => c.lane === 'sfx' && Math.abs(c.start - 8) < 0.2);
      await rec('LIB-e', c8 ? `${Q('Soft impact')} added to the SFX track at ${fmt(c8.start)}.` : 'clip not at ~8', { drag: e, dropClip: c8, shot: await shot('LIB-e') });
      await undoCheck('LIB-e', 'Undo: Add — Soft impact', (a) => !(c8 && a.clips.includes(`sfx@${c8.start}`)));
      // P1/P2 attempt: keyboard command during a live clip drag
      const id = await clipAt('sfx', 2); const hp = await H.hdr(P, id);
      await P.mouse.move(hp.x, hp.y); await P.mouse.down(); await P.mouse.move(hp.x + 30, hp.y, { steps: 5 }); await sleep(200);
      await P.keyboard.press('Control+z'); await sleep(300); const sz = await L.status(P);
      await P.keyboard.press('Control+e'); await sleep(300); const se = await L.status(P);
      await P.keyboard.press('Escape'); await sleep(200); await P.mouse.up(); await sleep(400);
      res.gesture = { ctrlZDuringDrag: sz, ctrlEDuringDrag: se, P1: sz === 'Undo/Redo does not work while dragging — let go first.', P2: se === 'Editing does not work while dragging — let go first.', clipsAfter: brief(await clips()) }; save();
      console.log('gesture', JSON.stringify(res.gesture));
    }
    if (SEC === 'loop') {
      await snap(false);
      if (W === 1280) res.detail = await X.openDetail(P);
      await L.addAt(P, 'demo-hero-music', 'music', 0);
      await L.blur(P);
      await rec('LOOP-a', 'To set a loop, first make a time selection on the waveform.', { pre: 'after add (no range, no loop)', act: await X.key(P, 'Control+l') });
      const mid = await clipAt('music', 0);
      await X.rangeDrag(P, mid, 1, 3); const r1 = await H.range(P);
      await X.key(P, 'Control+l');
      await rec('LOOP-b', `Loop created and turned on: ${fmt(+r1.start)} — ${fmt(+r1.end)}.`, { range: r1, shot: await shot('LOOP-b') });
      await undoCheck('LOOP-b', 'Undo: Loop created', (a) => a.loop === null);
      await X.rangeDrag(P, mid, 4, 6); const r2 = await H.range(P);
      await X.key(P, 'Control+l');
      const lb = await loopState();
      await rec('LOOP-c', `Loop replaced with the new range: ${fmt(+r2.start)} — ${fmt(+r2.end)}.`, { range: r2 });
      await undoCheck('LOOP-c', 'Undo: Loop replaced', (a, bf) => a.loop && a.loop.label !== bf.loop.label && a.loop.label === `Loop ${fmt(+r1.start)} — ${fmt(+r1.end)}`);
      await sel('music', 0); await X.key(P, 'Control+l');
      await rec('LOOP-d1', 'Loop is off; the range is kept.', { braceEnabledOk: (await loopState()).enabled === 'false', braceSamePos: (await loopState()).left === lb.left, shot: await shot('LOOP-d1') });
      await undoCheck('LOOP-d1', 'Undo: Loop off', (a) => a.loop && a.loop.enabled === 'true');
      await sel('music', 0); await X.key(P, 'Control+l');
      await rec('LOOP-d2', 'Loop is on.', { braceEnabledOk: (await loopState()).enabled === 'true' });
      await undoCheck('LOOP-d2', 'Undo: Loop on', (a) => a.loop && a.loop.enabled === 'false');
      // (e) range under 0.1 s via detail inputs
      try {
        await X.rangeDrag(P, mid, 10, 12);
        const si = P.locator('[data-testid=arrangement-detail-start]'); const ei = P.locator('[data-testid=arrangement-detail-end]');
        await si.fill('10'); await ei.fill('10.05'); const ap = P.locator('[data-testid=arrangement-detail-apply]'); res.applyDisabled = await ap.isDisabled(); if (!res.applyDisabled) await ap.click(); else await ei.press('Enter'); await sleep(400);
        const r3 = await H.range(P); await L.blur(P);
        await X.key(P, 'Control+l');
        await rec('LOOP-e', 'A loop needs a time selection of at least 0.1 s.', { range: r3, note: 'range typed into detail start/end inputs' });
      } catch (err) { res.loopE = String(err).slice(0, 200); save(); }
      // (f) brace steps to the timeline start
      await sel('music', 0); await L.blur(P);
      const brace = P.locator('[data-testid=arrangement-loop-brace]');
      await brace.focus(); await P.keyboard.press('ArrowLeft'); await sleep(300);
      const ls1 = await loopState();
      await rec('LOOP-f-step', `Loop: ${ls1.label.replace(/^Loop /, '')}.`, { braceLabel: ls1.label });
      await undoCheck('LOOP-f-step', 'Undo: Loop range', (a, bf) => a.loop && a.loop.label === 'Loop 00:04.000 — 00:06.000');
      let n = 0; let st = '';
      await brace.focus();
      while (n < 80) { await P.keyboard.press('ArrowLeft'); await sleep(90); n += 1; st = await L.status(P); if (st.startsWith('The loop cannot')) break; }
      const lsb = await loopState();
      await rec('LOOP-f-blocked', 'The loop cannot move further: start of the timeline or minimum length.', { presses: n, braceAtBlock: lsb, startsAtZero: /^Loop 00:00\.000/.test(lsb.label), shot: await shot('LOOP-f-blocked') });
      // drag the brace body once by +2 s
      const bb = await brace.boundingBox(); const g = await L.geo(P);
      await P.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await P.mouse.down(); await P.mouse.move(bb.x + bb.width / 2 + g.pps, bb.y + bb.height / 2, { steps: 6 }); await P.mouse.move(bb.x + bb.width / 2 + 2 * g.pps, bb.y + bb.height / 2, { steps: 6 }); await sleep(150); await P.mouse.up(); await sleep(400);
      const ld = await loopState();
      await rec('LOOP-f-drag', `Loop: ${ld.label.replace(/^Loop /, '')}.`, { braceAfterDrag: ld });
      await undoCheck('LOOP-f-drag', 'Undo: Loop range', (a) => a.loop && a.loop.label === lsb.label);
      // off + step => " · off"
      await sel('music', 0); await X.key(P, 'Control+l');
      await brace.focus(); await P.keyboard.press('ArrowRight'); await sleep(300);
      const lo = await loopState();
      await rec('LOOP-f-off-step', `Loop: ${lo.label.replace(/^Loop /, '').replace(/ · off$/, '')} · off.`, { brace: lo });
    }
    if (SEC === 'nudge') {
      await snap(false);
      await L.addAt(P, 'demo-soft-impact', 'sfx', 0);
      await L.addAt(P, 'demo-soft-impact', 'sfx', 1);
      res.setup = brief(await clips()); save();
      await sel('sfx', 0); await L.blur(P);
      await rec('NUDGE-a-snapoff', 'Nudge blocked — start of the timeline.', { act: await X.key(P, 'ArrowLeft'), path: 'Context target===clip.start', shot: await shot('NUDGE-a') });
      await sel('sfx', 2);
      await rec('NUDGE-b', 'Nudge blocked — a neighbouring clip or the start of the timeline.', { act: await X.key(P, 'ArrowLeft') });
      await sel('sfx', 2); await X.key(P, 'ArrowRight');
      const cR = brief(await clips());
      await rec('NUDGE-c', null, { movedTo2_1: cR.includes('sfx@2.1') });
      await undoCheck('NUDGE-c', 'Undo: Nudge clip', (a) => a.clips.includes('sfx@2') && !a.clips.includes('sfx@2.1'));
      await snap(true);
      await sel('sfx', 0);
      await rec('NUDGE-a-snapon', 'Nudge blocked — start of the timeline.', { act: await X.key(P, 'ArrowLeft'), path: 'StudioWorkspace adjacentGridLine null' });
      // (d) hold with snap on (StudioWorkspace === path); first make the status something else
      const client = await ctx.newCDPSession(P);
      for (const mode of ['snapon', 'snapoff']) {
        await snap(mode === 'snapon');
        await sel('sfx', 0); await L.blur(P); await X.key(P, 'Control+l');
        const pre = await L.status(P);
        await sel('sfx', 0); await L.blur(P);
        await statusObs();
        await cdpHold(client, 'ArrowLeft', 'ArrowLeft', 37, 10);
        const o = await obsRead();
        const texts = o.recs.map((r) => r.text);
        const r = await rec(`NUDGE-d-${mode}`, 'Nudge blocked — start of the timeline.', { statusBeforeHold: pre, keydowns: o.keys.filter((k) => k.k === 'ArrowLeft').length, repeatKeydowns: o.keys.filter((k) => k.k === 'ArrowLeft' && k.r).length, statusMutations: o.recs, p3Announcements: texts.filter((t) => t === 'Nudge blocked — start of the timeline.').length, clipStillAt0: brief(await clips()).includes('sfx@0') });
        console.log('  hold', mode, 'keys', r.keydowns, 'repeats', r.repeatKeydowns, 'p3 count', r.p3Announcements, 'mutations', o.recs.length);
      }
    }
    if (SEC === 'del') {
      await snap(false);
      await L.addAt(P, 'demo-soft-impact', 'sfx', 0); await L.addAt(P, 'demo-soft-impact', 'sfx', 4); await L.addAt(P, 'demo-soft-impact', 'sfx', 8);
      await sel('sfx', 0);
      await rec('DEL-1', 'Clip deleted; the gap remains.', { act: await X.key(P, 'Delete') });
      await sel('sfx', 4); await sel('sfx', 8, ['Control']);
      await rec('DEL-2', '2 clips deleted; the gap remains.', { act: await X.key(P, 'Delete'), shot: await shot('DEL-2') });
    }
  } catch (e) { res.error = String(e.stack || e); console.log('ERR', res.error); }
  res.end = new Date().toISOString(); save();
  console.log(JSON.stringify({ err: res.error, net: X.netOk(net) }));
  await b.close();
})();
