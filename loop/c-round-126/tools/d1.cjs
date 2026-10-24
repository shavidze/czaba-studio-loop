// C round 125 — D1 comfort scorecard. node d1.cjs <1440|1280> [T1,T2,...]
// Each task path runs in its own fresh context from a stated start state; actions are counted by the wrappers.
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const ONLY = (process.argv[3] || '').split(',').filter(Boolean);
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd1'); fs.mkdirSync(OUTD, { recursive: true });
const res = { vp: W, tasks: {} };
const shot = async (p, n) => { await p.screenshot({ path: path.join(L.SHOTS, `D1-${n}-${W}.png`) }); return `c-round-126/shots/D1-${n}-${W}.png`; };
function counter() { const c = { clicks: 0, drags: 0, keys: 0, wheel: 0, log: [] }; return c; }
const ck = (c, kind, what) => { c[kind] += 1; c.log.push(`${kind}:${what}`); };
async function click(p, c, sel, what, opts) { await p.click(sel, opts); ck(c, 'clicks', what || sel); await sleep(300); }
async function clickXY(p, c, x, y, what) { await p.mouse.click(x, y); ck(c, 'clicks', what); await sleep(300); }
async function key(p, c, k, what) { await p.keyboard.press(k); ck(c, 'keys', what || k); await sleep(350); }
async function typeText(p, c, t) { for (const ch of t) { await p.keyboard.press(ch); ck(c, 'keys', `type ${ch}`); } await sleep(150); }
const clipT = async (p) => H.brief(await H.cl(p));
const undoOnce = async (p, before) => { await L.blur(p); await p.keyboard.press('Control+z'); await sleep(500); const after = await clipT(p); return { restored: after === before, after }; };
async function fresh(tag) { return L.openStudio(b, X.VPS[W], `d1-${W}-${tag}`, net); }
async function oneClip(p) { await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.blur(p); return (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; }
async function buildS1(p) {
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-hero-music', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await L.seekTo(p, 1); await L.blur(p); await p.keyboard.press('m'); await sleep(400);
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  await X.rangeDrag(p, stems, 4, 2); await X.key(p, 'Control+l');
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); await X.key(p, 'Control+g');
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
  if (W === 1280) await X.openDetail(p);
  await L.blur(p);
  return { stems, sfx, hdr: await p.evaluate(() => ({ markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.dataset.markerTime), loop: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent, groups: document.querySelectorAll('[data-testid=arrangement-group-row]').length })) };
}
const view = (p) => p.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const z = document.querySelector('[data-testid=arrangement-zoom-readout]').textContent; const rl = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); const pps = +/([\d.]+)/.exec(z)[1]; return { zoom: z, pps, scrollLeft: sc.scrollLeft, visibleSec: [+(sc.scrollLeft / pps).toFixed(2), +((sc.scrollLeft + sc.clientWidth - (rl.left - sc.getBoundingClientRect().left)) / pps).toFixed(2)] }; });
let b;
async function task(id, fn) {
  if (ONLY.length && !ONLY.includes(id)) return;
  const t = (res.tasks[id] = { paths: {} });
  try { await fn(t); } catch (e) { t.error = String(e.stack || e).slice(0, 600); }
  fs.writeFileSync(path.join(OUTD, `d1-${W}.json`), JSON.stringify({ ...res, net: X.netOk(net) }, null, 1));
  console.log(id, JSON.stringify(t).slice(0, 900));
}
async function runPath(t, name, startFn, bodyFn) {
  const { page: p, ctx } = await fresh(`${name}`);
  const c = counter(); const r = { start: null };
  try { r.start = await startFn(p); r.before = await clipT(p); r.result = await bodyFn(p, c, r.start); r.after = await clipT(p); r.status = await L.status(p); } catch (e) { r.error = String(e.stack || e).slice(0, 500); }
  r.count = { clicks: c.clicks, drags: c.drags, keys: c.keys, wheel: c.wheel, steps: c.log };
  t.paths[name] = r; await ctx.close(); return r;
}
(async () => {
  b = await L.launch();
  // T1 place a sound
  await task('T1', async (t) => {
    const s0 = async (p) => { await L.setSnapOff(p); return null; };
    const rulerAt = async (p, c, s) => { const g = await L.geo(p); const r = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + s * g.pps, r.top + r.height / 2, `ruler ${s}s`); };
    await runPath(t, 'T1-keyboard', s0, async (p, c) => { await click(p, c, L.nameSel('sfx'), 'SFX lane name'); await rulerAt(p, c, 3); await click(p, c, '[role=option][data-source-id="demo-soft-impact"]', 'library item'); await key(p, c, 'Enter'); const r = { clips: await clipT(p), status: await L.status(p) }; r.undo = await undoOnce(p, ''); return r; });
    await runPath(t, 'T1-mouse', s0, async (p, c) => { await click(p, c, L.nameSel('sfx'), 'SFX lane name'); await rulerAt(p, c, 3); await click(p, c, '[role=option][data-source-id="demo-soft-impact"]', 'library item'); await click(p, c, 'button:has-text("＋ დამატება")', '＋ დამატება'); return { clips: await clipT(p), status: await L.status(p) }; });
    await runPath(t, 'T1-drag', s0, async (p, c) => {
      const src = await p.locator('[role=option][data-source-id="demo-soft-impact"]').boundingBox(); const lane = await p.locator('[data-track-id=sfx]').last().boundingBox(); const g = await L.geo(p);
      await p.mouse.move(src.x + 30, src.y + src.height / 2); await p.mouse.down(); await p.mouse.move(src.x + 80, src.y + 10, { steps: 5 }); await p.mouse.move(g.rl + 3 * g.pps, lane.y + lane.height / 2, { steps: 12 }); await sleep(200); await p.mouse.up(); ck(c, 'drags', 'library item → SFX lane at 3 s'); await sleep(700);
      return { clips: await clipT(p), status: await L.status(p), shot: await shot(p, 'T1-drag') };
    });
  });
  // T2 move
  await task('T2', async (t) => {
    await runPath(t, 'T2-drag-same-lane', oneClip, async (p, c, id) => { const s = await H.dragHeader(p, id, 1); ck(c, 'drags', 'clip header +1 s'); const r = { clips: await clipT(p), status: s }; r.undo = await undoOnce(p, 'stems@2+16'); return r; });
    await runPath(t, 'T2-drag-other-lane', oneClip, async (p, c, id) => { const s = await H.dragHeader(p, id, 0, { dyLane: 'sfx' }); ck(c, 'drags', 'clip header to SFX lane'); const r = { clips: await clipT(p), status: s, shot: await shot(p, 'T2-lane') }; r.undo = await undoOnce(p, 'stems@2+16'); return r; });
    await runPath(t, 'T2-keys', oneClip, async (p, c, id) => { await L.selectClip(p, id); ck(c, 'clicks', 'select clip'); await L.blur(p); await key(p, c, 'ArrowRight'); return { clips: await clipT(p), status: await L.status(p) }; });
    await runPath(t, 'T2-snap-on-drag', async (p) => { const id = await oneClip(p); await L.blur(p); await p.keyboard.press('g'); await sleep(300); return id; }, async (p, c, id) => { const s = await H.dragHeader(p, id, 1.37); ck(c, 'drags', 'clip header +1.37 s with Snap on'); const a = await clipT(p); await p.keyboard.press('Control+z'); await sleep(400); await H.dragHeader(p, id, 1.37, { mods: ['Alt'] }); ck(c, 'drags', 'same drag with Alt held (bypass)'); return { snapOn: a, altBypass: await clipT(p), status: s, snap: await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap) }; });
  });
  // T3 trim
  await task('T3', async (t) => {
    await runPath(t, 'T3-end', oneClip, async (p, c, id) => { const s = await H.dragEdge(p, id, 'R', -4); ck(c, 'drags', 'right edge −4 s'); const r = { clips: await clipT(p), status: s }; r.undo = await undoOnce(p, 'stems@2+16'); return r; });
    await runPath(t, 'T3-start', oneClip, async (p, c, id) => { const s = await H.dragEdge(p, id, 'L', 1.5); ck(c, 'drags', 'left edge +1.5 s'); const r = { clips: await clipT(p), status: s, detail: (await L.detailInfo(p)).text }; r.undo = await undoOnce(p, 'stems@2+16'); return r; });
  });
  // T4 split
  await task('T4', async (t) => {
    await runPath(t, 'T4-bodyclick-ctrlE', oneClip, async (p, c, id) => { await H.bodyClick(p, id, 6); ck(c, 'clicks', 'clip body at 6 s'); const pos = await L.posNow(p); const sel = await clipT(p); await L.blur(p); await key(p, c, 'Control+e'); return { posAfterBodyClick: pos, selAfterBodyClick: sel, clips: await clipT(p), status: await L.status(p) }; });
    await runPath(t, 'T4-select-ruler-ctrlE', oneClip, async (p, c, id) => { await L.selectClip(p, id); ck(c, 'clicks', 'select clip'); const g = await L.geo(p); const r0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + 6 * g.pps, r0.top + r0.height / 2, 'ruler 6 s'); await L.blur(p); await key(p, c, 'Control+e'); const r = { clips: await clipT(p), status: await L.status(p) }; r.undo = await undoOnce(p, (await clipT(p)) && 'stems@2+16'); return r; });
    await runPath(t, 'T4-mouse-button', oneClip, async (p, c, id) => { await L.selectClip(p, id); ck(c, 'clicks', 'select clip'); const g = await L.geo(p); const r0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + 6 * g.pps, r0.top + r0.height / 2, 'ruler 6 s'); await click(p, c, 'button[title*="Ctrl/Cmd+E"]', '✂ Split'); return { clips: await clipT(p), status: await L.status(p) }; });
  });
  // T5 duplicate
  await task('T5', async (t) => {
    await runPath(t, 'T5-ctrlD', oneClip, async (p, c, id) => { await L.selectClip(p, id); ck(c, 'clicks', 'select clip'); await L.blur(p); await key(p, c, 'Control+d'); const r = { clips: await clipT(p), status: await L.status(p) }; r.undo = await undoOnce(p, 'stems@2+16'); return r; });
    await runPath(t, 'T5-copy-paste', oneClip, async (p, c, id) => { await L.selectClip(p, id); ck(c, 'clicks', 'select clip'); await L.blur(p); await key(p, c, 'Control+c'); await key(p, c, 'Control+v'); return { clips: await clipT(p), status: await L.status(p), mouseOnlyDuplicate: await p.evaluate(() => [...document.querySelectorAll('button')].filter((x) => /Duplicate|დუბლ|კოპ/i.test((x.textContent || '') + (x.title || '') + (x.getAttribute('aria-label') || ''))).map((x) => x.textContent.trim())) }; });
  });
  // T6 zoom/navigation (S1)
  await task('T6', async (t) => {
    await runPath(t, 'T6-Z-X', buildS1, async (p, c, s) => { const v0 = await view(p); await X.rangeDrag(p, s.stems, 10, 6); ck(c, 'drags', 'range drag 10→6 s on stems clip'); await L.blur(p); await key(p, c, 'z', 'Z'); const v1 = await view(p); await key(p, c, 'x', 'X'); const v2 = await view(p); return { v0, afterZ: v1, afterX: v2, status: await L.status(p) }; });
    await runPath(t, 'T6-Fit-overview', buildS1, async (p, c) => { const v0 = await view(p); await click(p, c, 'button[title^="Fit"]', 'Fit'); const v1 = await view(p); await click(p, c, 'button:has-text("↩ Zoom")', '↩ Zoom'); const v2 = await view(p);
      const ov = await p.locator('[data-testid=arrangement-overview]').boundingBox(); await clickXY(p, c, ov.x + ov.width * 0.8, ov.y + ov.height / 2, 'overview click at 80%'); const v3 = await view(p); return { v0, afterFit: v1, afterBack: v2, afterOverviewClick: v3, status: await L.status(p) }; });
    await runPath(t, 'T6-ctrl-wheel', buildS1, async (p, c) => { const v0 = await view(p); const sc = await p.locator('[data-testid=arrangement-timeline-scroller]').boundingBox(); await p.mouse.move(sc.x + sc.width / 2, sc.y + 60); await p.keyboard.down('Control'); await p.mouse.wheel(0, -300); await p.keyboard.up('Control'); ck(c, 'wheel', 'Ctrl+wheel up'); await sleep(500); const v1 = await view(p); await L.blur(p); await key(p, c, '-', '−'); const v2 = await view(p); await key(p, c, '+', '+'); const v3 = await view(p); return { v0, afterCtrlWheel: v1, afterMinus: v2, afterPlus: v3 }; });
  });
  // T7 loop and play
  await task('T7', async (t) => {
    await runPath(t, 'T7-range-ctrlL-space', buildS1, async (p, c, s) => { await X.rangeDrag(p, s.stems, 8, 6); ck(c, 'drags', 'range drag 8→6 s'); await L.blur(p); await key(p, c, 'Control+l', 'Ctrl+L'); const loop = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent); const pos0 = await L.posNow(p); await key(p, c, 'Space');
      const samp = []; for (let i = 0; i < 14; i++) { await sleep(250); samp.push(await L.posNow(p)); } await p.keyboard.press('Space'); await sleep(300); return { loop, posBeforePlay: pos0, positionsEvery250ms: samp, status: await L.status(p) }; });
  });
  // T8 clip gain and lane volume
  await task('T8', async (t) => {
    await runPath(t, 'T8-clipgain-field', buildS1, async (p, c) => { await click(p, c, '[data-testid=arrangement-detail-clip-gain-input]', 'Clip Gain field'); await key(p, c, 'Control+a'); await typeText(p, c, '-3'); await key(p, c, 'Enter'); const v = await p.inputValue('[data-testid=arrangement-detail-clip-gain-input]'); const r = { field: v, fader: await p.inputValue('[data-testid=arrangement-detail-clip-gain-fader]'), status: await L.status(p) }; await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); r.undoField = await p.inputValue('[data-testid=arrangement-detail-clip-gain-input]'); return r; });
    await runPath(t, 'T8-volume-keys', buildS1, async (p, c) => { const sl = p.locator('[data-track-id=music] input[aria-label^="Volume"]'); await sl.focus(); ck(c, 'clicks', 'focus Volume fader (Tab/click on thumb)'); const r = {}; await key(p, c, 'PageDown'); r.afterPageDown = await sl.inputValue(); for (let i = 0; i < 40 && +(await sl.inputValue()) > -3; i++) await key(p, c, 'ArrowDown'); r.value = await sl.inputValue(); r.readout = await p.evaluate(() => document.querySelector('[data-track-id=music] input[aria-label^="Volume"]').nextElementSibling.textContent); r.valuetext = await sl.getAttribute('aria-valuetext'); await L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); r.undo = await sl.inputValue(); return r; });
    await runPath(t, 'T8-volume-drag', buildS1, async (p, c) => { const sl = p.locator('[data-track-id=music] input[aria-label^="Volume"]'); const bx = await sl.boundingBox(); const min = +(await sl.getAttribute('min')), max = +(await sl.getAttribute('max')); const v0 = +(await sl.inputValue()); const x0 = bx.x + bx.width * (v0 - min) / (max - min); const y = bx.y + bx.height / 2; await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 - 6, y, { steps: 6 }); await p.mouse.up(); ck(c, 'drags', 'Volume thumb −6 px'); await sleep(300); const r = { min, max, v0, widthPx: bx.width, after6px: await sl.inputValue() }; await L.blur(p); await p.locator('[data-track-id=music] input[aria-label^="Volume"]').dblclick(); ck(c, 'clicks', 'double-click reset'); await sleep(300); r.afterDblClick = await sl.inputValue(); return r; });
  });
  // T9 mute / solo
  await task('T9', async (t) => {
    await runPath(t, 'T9-buttons', buildS1, async (p, c) => { await click(p, c, '[data-track-id=sfx] button[aria-label^="Mute"]', 'Mute SFX'); await click(p, c, '[data-track-id=music] button[aria-label^="Solo"]', 'Solo music'); const st = await p.evaluate(() => Object.fromEntries(['video', 'music', 'stems', 'sfx'].map((t) => [t, { m: document.querySelector(`[data-track-id=${t}] button[aria-label^="Mute"]`).getAttribute('aria-pressed'), s: document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed') }]))); await click(p, c, '[data-track-id=stems] button[aria-label^="Solo"]', 'Solo stems (plain click)'); const st2 = await p.evaluate(() => ['music', 'stems'].map((t) => document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed'))); await click(p, c, '[data-track-id=music] button[aria-label^="Solo"]', 'Ctrl+click Solo music', { modifiers: ['Control'] }); const st3 = await p.evaluate(() => ['music', 'stems'].map((t) => document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed'))); await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); const st4 = await p.evaluate(() => ['music', 'stems'].map((t) => document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed'))); return { afterMuteSolo: st, plainSoloStems: st2, ctrlSoloMusic: st3, afterUndo: st4, status: await L.status(p) }; });
    await runPath(t, 'T9-S-key', buildS1, async (p, c) => { await p.click(L.nameSel('music')); await sleep(200); await L.blur(p); await key(p, c, 's', 'S (Live: Solo Selected Tracks)'); return { solo: await p.evaluate(() => document.querySelector('[data-track-id=music] button[aria-label^="Solo"]').getAttribute('aria-pressed')), status: await L.status(p) }; });
  });
  // T10 marker
  await task('T10', async (t) => {
    await runPath(t, 'T10-M-F2-jump', buildS1, async (p, c) => { const g = await L.geo(p); const r0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + 7 * g.pps, r0.top + r0.height / 2, 'ruler 7 s'); await L.blur(p); await key(p, c, 'm', 'M');
      const r = { afterM: await p.evaluate(() => ({ editor: !!document.querySelector('[data-testid=arrangement-marker-name-input]'), focused: document.activeElement && document.activeElement.getAttribute('data-testid'), markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => `${m.dataset.markerTime}:${m.getAttribute('aria-label')}`) })), statusM: await L.status(p) };
      if (r.afterM.editor) { await key(p, c, 'Control+a'); await typeText(p, c, 'Drop'); await key(p, c, 'Enter'); r.path = 'M opens name editor'; } else { const m7 = p.locator('[data-testid=arrangement-marker][data-marker-time="7.000"]'); await m7.click(); ck(c, 'clicks', 'marker flag'); await key(p, c, 'F2'); await key(p, c, 'Control+a'); await typeText(p, c, 'Drop'); await key(p, c, 'Enter'); r.path = 'flag click + F2'; }
      r.renamed = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => `${m.dataset.markerTime}:${m.getAttribute('aria-label')}`)); await L.blur(p); await key(p, c, 'Home'); await key(p, c, 'Control+ArrowRight', 'Ctrl+→'); r.pos1 = await L.posNow(p); await key(p, c, 'Control+ArrowRight', 'Ctrl+→'); r.pos2 = await L.posNow(p); r.status = await L.status(p); r.shot = await shot(p, 'T10'); return r; });
    await runPath(t, 'T10-mouse', buildS1, async (p, c) => { const g = await L.geo(p); const r0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + 7 * g.pps, r0.top + r0.height / 2, 'ruler 7 s'); await click(p, c, '[data-testid=arrangement-marker-add]', 'Add marker +'); const r = { editor: await p.locator('[data-testid=arrangement-marker-name-input]').count() }; const m7 = p.locator('[data-testid=arrangement-marker]').last(); if (!r.editor) { await m7.dblclick(); ck(c, 'clicks', 'double-click flag (1)'); ck(c, 'clicks', 'double-click flag (2)'); await sleep(300); r.editorAfterDbl = await p.locator('[data-testid=arrangement-marker-name-input]').count(); }
      if (await p.locator('[data-testid=arrangement-marker-name-input]').count()) { await p.locator('[data-testid=arrangement-marker-name-input]').fill('Drop'); ck(c, 'keys', 'type Drop (4 chars counted as 1 fill)'); await key(p, c, 'Enter'); }
      await click(p, c, 'button[title^="დასაწყისზე"]', 'to start'); await click(p, c, '[data-testid=arrangement-marker-next]', 'Next marker'); r.pos1 = await L.posNow(p); await click(p, c, '[data-testid=arrangement-marker-next]', 'Next marker'); r.pos2 = await L.posNow(p); r.markers = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => `${m.dataset.markerTime}:${m.getAttribute('aria-label')}`)); return r; });
  });
  // T11 export
  await task('T11', async (t) => {
    await runPath(t, 'T11-project-wav', buildS1, async (p, c) => { const log = net[net.length - 1]; const st0 = await X.openDlg(p); ck(c, 'clicks', 'Export'); const n0 = log.downloads.length; await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click(); ck(c, 'clicks', 'WAV-ის ექსპორტი'); const t0 = Date.now(); while (Date.now() - t0 < 240000) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(250); } await sleep(800); const st1 = await X.dstate(p);
      const f = log.downloads.slice(n0).find((d) => d.file); let w = null; if (f) { const x = X.wav(f.file); w = { name: f.name, size: f.size, fmt: x.fmt, frames: x.frames, seconds: x.seconds, peak: +x.peak.toFixed(4), rms: +x.rms.toFixed(5), nan: x.nan, win_0_1: X.winStats(x.w, 0, 1), win_4_4p5: X.winStats(x.w, 4, 4.5), win_100_101: X.winStats(x.w, 100, 101) }; }
      return { defaultFormat: st0.formats, scope0: { project: st0.project, range: st0.range }, wav: w, dlgStatus: st1 && st1.status, ms: Date.now() - t0 }; });
    await runPath(t, 'T11-range-wav', buildS1, async (p, c, s) => { const log = net[net.length - 1]; await X.rangeDrag(p, s.stems, 10, 6); ck(c, 'drags', 'range drag 10→6 s'); const st0 = await X.openDlg(p); ck(c, 'clicks', 'Export'); const r = { scopeOnOpen: { project: st0.project, range: st0.range } }; if (!st0.range.checked) { await p.click('[data-testid=arrangement-export-scope-range]'); ck(c, 'clicks', 'choose range scope'); }
      const n0 = log.downloads.length; await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click(); ck(c, 'clicks', 'WAV-ის ექსპორტი'); const t0 = Date.now(); while (Date.now() - t0 < 120000) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(250); } await sleep(800);
      const f = log.downloads.slice(n0).find((d) => d.file); if (f) { const x = X.wav(f.file); r.wav = { name: f.name, size: f.size, fmt: x.fmt, frames: x.frames, seconds: x.seconds, peak: +x.peak.toFixed(4), nan: x.nan }; } r.range = await H.range(p); return r; });
  });

  await task('T7b', async (t) => {
    const samp = async (p, n) => { const a = []; for (let i = 0; i < n; i++) { await sleep(250); a.push(await L.posNow(p)); } await p.keyboard.press('Space'); await sleep(300); return a; };
    await runPath(t, 'T7-wrap-from-playhead', buildS1, async (p, c, s) => { await X.rangeDrag(p, s.stems, 8, 6); ck(c, 'drags', 'range drag 8→6 s'); await L.blur(p); await key(p, c, 'Control+l', 'Ctrl+L'); await key(p, c, 'Space'); return { pos: await samp(p, 40) }; });
    await runPath(t, 'T7-ruler-at-loop-start', buildS1, async (p, c, s) => { await X.rangeDrag(p, s.stems, 8, 6); ck(c, 'drags', 'range drag 8→6 s'); await L.blur(p); await key(p, c, 'Control+l', 'Ctrl+L'); const g = await L.geo(p); const r0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON()); await clickXY(p, c, g.rl + 6 * g.pps, r0.top + r0.height / 2, 'ruler 6 s'); await L.blur(p); await key(p, c, 'Space'); return { pos: await samp(p, 14) }; });
  });
  await task('T8b', async (t) => {
    await runPath(t, 'T8-volume-drag2', buildS1, async (p, c) => { const sl = p.locator('[data-track-id=music] input[aria-label^="Volume"]'); const bx = await sl.boundingBox(); const min = +(await sl.getAttribute('min')), max = +(await sl.getAttribute('max')); const v0 = +(await sl.inputValue()); const x0 = bx.x + bx.width * (v0 - min) / (max - min) - 3; const y = bx.y + bx.height / 2; const r = { v0, widthPx: bx.width, dbPerPx: (max - min) / bx.width };
      for (const [dx, mods, tag] of [[-30, [], 'drag −30 px'], [-30, ['Shift'], 'Shift drag −30 px']]) { const cur = +(await sl.inputValue()); const xs = bx.x + bx.width * (cur - min) / (max - min) - 3; await p.mouse.move(xs, y); for (const m of mods) await p.keyboard.down(m); await p.mouse.down(); await p.mouse.move(xs + dx, y, { steps: 10 }); await p.mouse.up(); for (const m of mods) await p.keyboard.up(m); ck(c, 'drags', tag); await sleep(300); r[tag] = await sl.inputValue(); }
      await sl.dblclick(); ck(c, 'clicks', 'double-click reset (2 clicks)'); await sleep(300); r.afterDblClick = await sl.inputValue(); return r; });
  });
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d1-${W}.json`), JSON.stringify(res, null, 1));
  console.log('NET', JSON.stringify(res.net));
  await b.close();
})();
