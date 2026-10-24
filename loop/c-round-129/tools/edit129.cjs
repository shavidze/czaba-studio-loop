// C round 129 EDIT-COPY + UNDO-LABEL + Undo/status layout. node edit129.cjs <1440|1280> <tag>
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const TAG = process.argv[3] || 'r1';
const H = require('./h3.cjs'); const { X, L, sleep } = H;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const TRACKS = ['მუსიკა', 'სტემები', 'ვიდეო'];
const gc = (s) => (s.match(KA) || []).length;
const gNet = (s) => { let t = s; for (const n of TRACKS) t = t.split(n).join(''); return gc(t); };
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), steps: [] };
const save = () => fs.writeFileSync(path.join(L.OUT, `edit129-${W}-${TAG}.json`), JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
const pos = (cs) => cs.map((c) => `${c.lane}@${c.start}+${c.dur}`).sort().join(' ');
async function state(p) { const cs = await H.cl(p); return { clips: H.brief(cs), pos: pos(cs), range: await H.range(p), markers: await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.dataset.markerTime)), undo: await X.undoTitle(p), playhead: await L.posNow(p) }; }
async function statusBox(p) { return p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-status]'); const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, sw: e.scrollWidth, cw: e.clientWidth, docSW: document.documentElement.scrollWidth, vw: innerWidth }; }); }
async function undoBox(p) { return p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.title || '')); const r = b.getBoundingClientRect(); const sp = b.querySelector('span.truncate'); const bar = b.parentElement; const kids = [...bar.children].map((k) => Math.round(k.getBoundingClientRect().top)); return { title: b.title, text: b.textContent.trim(), x: r.x, y: r.y, w: r.width, h: r.height, spanSW: sp ? sp.scrollWidth : null, spanCW: sp ? sp.clientWidth : null, barTops: [...new Set(kids)], barSW: bar.scrollWidth, barCW: bar.clientWidth, docSW: document.documentElement.scrollWidth }; }); }
let P;
async function act(id, fn, expected, opts = {}) {
  const before = await state(P);
  let err = null; try { await fn(); } catch (e) { err = String(e).slice(0, 300); }
  await sleep(300);
  const status = await L.status(P);
  const after = await state(P);
  let exp = typeof expected === 'function' ? await expected(after, before) : expected;
  if (exp === null) { const c = ['00:13.000–00:17.000', '00:14.000–00:18.000'].map((t) => `Paste failed: ${t} on the სტემები track is occupied. Nothing changed.`); exp = c.find((x) => x === status) || c.join(' OR '); }
  const rec = { id, expected: exp, status, exact: status === exp, georgRaw: gc(status), georgNet: gNet(status), undoGeorg: gc(after.undo || ''), before, after, err };
  if (opts.shot) { await P.screenshot({ path: path.join(L.SHOTS, `${opts.shot}-msg-${W}-${TAG}.png`) }); rec.shotMsg = `c-round-129/shots/${opts.shot}-msg-${W}-${TAG}.png`; }
  if (opts.undo) {
    rec.undoTitleExpected = opts.undo;
    rec.undoTitleOk = (after.undo || '').split('|')[0] === opts.undo;
    if (opts.measureUndo) rec.undoBox = await undoBox(P);
    await X.key(P, 'Control+z'); await sleep(300);
    const u = await state(P);
    rec.afterUndo = { pos: u.pos, status: await L.status(P), markers: u.markers, redo: await P.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.title || '')); return b ? b.title : null; }) };
    rec.undoRestored = u.pos === before.pos && JSON.stringify(u.markers) === JSON.stringify(before.markers);
    await X.key(P, 'Control+Shift+z'); await sleep(300);
    const r = await state(P);
    rec.redoReapplied = r.pos === after.pos && JSON.stringify(r.markers) === JSON.stringify(after.markers);
    rec.afterRedoStatus = await L.status(P);
  }
  if (opts.box) rec.statusBox = await statusBox(P);
  if (opts.shot) { await P.screenshot({ path: path.join(L.SHOTS, `${opts.shot}-${W}-${TAG}.png`) }); rec.shot = `c-round-129/shots/${opts.shot}-${W}-${TAG}.png`; }
  res.steps.push(rec); save();
  console.log(id, rec.exact ? 'OK ' : 'XX ', JSON.stringify(status), rec.exact ? '' : ' expected ' + JSON.stringify(exp));
  return rec;
}
const clip = async (lane, start) => { const c = (await L.clipsDom(P)).find((x) => x.lane === lane && Math.abs(x.start - start) < 0.01); if (!c) throw new Error(`no clip ${lane}@${start}`); return c.id; };
const sel = async (lane, start, mods = []) => L.selectClip(P, await clip(lane, start), mods);
const esc = async () => { await L.blur(P); await P.keyboard.press('Escape'); await sleep(250); const pt = await H.laneBgPoint(P, 'sfx', 9); await P.mouse.click(pt.x, pt.y); await sleep(350); await L.blur(P); };
const rdrag = async (lane, start, t0, t1) => X.rangeDrag(P, await clip(lane, start), t0, t1);
const k = (key) => X.key(P, key);
(async () => {
  const b = await L.launch();
  try {
    const { page } = await L.openStudio(b, X.VPS[W], `edit129-${W}-${TAG}`, net); P = page;
    res.setup = [await L.setSnapOff(P), await L.addAt(P, 'demo-hero-music', 'music', 0), await L.addAt(P, 'demo-stem-pulse', 'stems', 2), await L.addAt(P, 'demo-soft-impact', 'sfx', 4)];
    res.geo = await L.geo(P); res.statusBox0 = await statusBox(P); res.undoBox0 = await undoBox(P);
    await P.screenshot({ path: path.join(L.SHOTS, `setup-${W}-${TAG}.png`) });
    // (a) split
    await esc();
    await act('E8', () => k('Control+e'), 'To split, select a clip and place the playhead inside it, or make a time selection.');
    await L.seekTo(P, 1); await sel('sfx', 4);
    await act('E9', () => k('Control+e'), 'The playhead must be inside the selected clip.');
    await L.seekTo(P, 5); await sel('sfx', 4);
    await act('E11', () => k('Control+e'), 'Clip split at 00:05.000.', { undo: 'Undo: Split', shot: 'E11' });
    await L.seekTo(P, 10); await sel('music', 0); await sel('stems', 2, ['Control']);
    await act('E4', () => k('Control+e'), '2 clips split at 00:10.000; the right parts are selected.', { undo: 'Undo: Split (2)' });
    await esc(); await rdrag('stems', 10, 12, 14);
    await act('E7', () => k('Control+e'), 'Clip split at both edges of the time selection; the middle part is selected.', { undo: 'Undo: Split at time selection' });
    await esc(); await rdrag('stems', 14, 15, 16);
    await act('E21a', () => k('Control+Shift+l'), 'Selection on all tracks: 00:15.000 — 00:16.000.');
    await act('E1', () => k('Control+e'), 'Split does not work on a selection across all tracks — make a time selection on one track.');
    await esc();
    await L.seekTo(P, 4.5); await sel('sfx', 5); await sel('stems', 2, ['Control']);
    await act('E4-1', () => k('Control+e'), '1 clip split at 00:04.500; the right part is selected.', { undo: 'Undo: Split (1)' });
    await esc(); await L.seekTo(P, 8.5); await sel('sfx', 5); await sel('sfx', 4, ['Control']);
    await act('E2', () => k('Control+e'), 'The playhead does not cross any selected clip.');
    // (b) delete
    await esc(); await sel('sfx', 5);
    await act('E19', () => k('Delete'), 'Clip deleted; the gap remains.', { undo: 'Undo: Delete clip', shot: 'E19' });
    await esc(); await sel('sfx', 4); await sel('stems', 12, ['Control']);
    await act('E16', () => k('Delete'), '2 clips deleted; the gap remains.', { undo: 'Undo: Delete clips (2)' });
    await esc(); await rdrag('music', 0, 1, 3);
    await act('E14', () => k('Delete'), '⌫ Deleted 00:01.000 — 00:03.000 on the მუსიკა track; the gap remains.', { undo: 'Undo: Delete time selection', shot: 'E14' });
    await esc(); await rdrag('music', 3, 6, 8);
    await act('E21', () => k('Control+Shift+l'), 'Selection on all tracks: 00:06.000 — 00:08.000.');
    await act('E14-all', () => k('Delete'), '⌫ Deleted 00:06.000 — 00:08.000 on all tracks; the gap remains.', { undo: 'Undo: Delete time selection (all tracks)', measureUndo: true, box: true, shot: 'E14all' });
    await esc();
    await act('E17', () => k('Delete'), 'To delete, select a clip or make a time selection.');
    await act('E20', () => k('Control+Shift+l'), 'Make a time selection first to extend it to all tracks (Ctrl+Shift+L).');
    // (c) duplicate
    await esc();
    await act('E23', () => k('Control+d'), 'Select a clip to duplicate.');
    await sel('stems', 14);
    await act('E26', () => k('Control+d'), 'Duplicate (1): the copy starts at 00:18.000.', { undo: 'Undo: Duplicate (1)' });
    await esc(); await rdrag('stems', 14, 15, 16);
    await act('E22', () => k('Control+d'), 'Duplicate works on clips; there is no Duplicate Time.');
    // (d) clipboard
    await esc(); await sel('stems', 14);
    await act('E30', () => k('Control+c'), 'Copy: 1 clip on the clipboard.');
    await L.seekTo(P, 13);
    await act('E37', () => k('Control+v'), async () => null, {});
    await esc(); await rdrag('music', 10, 12, 14);
    await act('E28', () => k('Control+c'), 'Copy: მუსიკა 00:12.000–00:14.000 (1 part).');
    await L.seekTo(P, 1);
    await act('E42', () => k('Control+v'), 'Paste (1): at 00:01.000 · on the მუსიკა track.', { undo: 'Undo: Paste (1)', shot: 'E42' });
    await act('E32', () => k('Control+x'), 'To cut, select a clip or make a time selection.');
    await sel('music', 1);
    await act('E33', () => k('Control+x'), 'Cut: 1 part on the clipboard; the gap remains.', { undo: 'Undo: Cut', shot: 'E33' });
    await esc(); await rdrag('music', 10, 12, 14); await k('Control+Shift+l');
    await act('E28-all', () => k('Control+c'), 'Copy: all tracks 00:12.000–00:14.000 (1 part).');
    await L.seekTo(P, 6);
    await act('E42-all', () => k('Control+v'), 'Paste (1): at 00:06.000.', { undo: 'Undo: Paste (1)' });
    // (e) cut time
    await esc();
    await act('E34', () => k('Control+Shift+x'), 'Make a time selection first for Cut Time (Ctrl+Shift+X).');
    await L.seekTo(P, 16.5); await L.blur(P); await P.keyboard.press('m'); await sleep(400);
    res.markerStatus = await L.status(P);
    await esc(); await rdrag('music', 10, 16, 17);
    await act('E36', () => k('Control+Shift+x'), 'Cut Time 00:16.000 — 00:17.000: 2 parts on the clipboard; the gap was closed on all tracks. 1 marker deleted.', { undo: 'Undo: Cut Time', shot: 'E36', box: true });
    // extras: range on empty background (E12/E27/E31) if reachable
    await esc();
    const a = await H.laneBgPoint(P, 'sfx', 10), z = await H.laneBgPoint(P, 'sfx', 12);
    await P.mouse.move(a.x, a.y); await P.mouse.down(); await P.mouse.move((a.x + z.x) / 2, a.y, { steps: 6 }); await P.mouse.move(z.x, a.y, { steps: 6 }); await sleep(120); await P.mouse.up(); await sleep(400);
    res.bgRange = await H.range(P);
    if (res.bgRange.start !== '') {
      await act('E27', () => k('Control+c'), 'No sound to copy in the time selection — the clipboard did not change.');
      await act('E31', () => k('Control+x'), 'No sound to cut in the time selection — nothing changed.');
      await act('E12', () => k('Delete'), 'Nothing to delete in the time selection — nothing changed.');
    }
  } catch (e) { res.error = String(e.stack || e); console.log('ERR', res.error); }
  res.end = new Date().toISOString(); save();
  console.log(JSON.stringify({ err: res.error, net: X.netOk(net) }));
  await b.close();
})();
