// C325 behaviour rows for PERF-DRAG-PREVIEW stage a: D-TRIM, D-MOVE, D-MIXED, D-ABORT, D-UNDO, D-NOFLASH, D-OLDPATH, D-LOOP, EXPORT.
// usage: node c325-rows.mjs <BASE> <tag> [1440x900,1280x720]   (run on HEAD :5197 and A :5173, then diff with c325-diff.py)
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2];
const TAG = process.argv[3];
const DIR = process.env.ROWS_DIR ?? '/home/runner/czaba-project/tmp/studio-real-loop/b-round-328/rows';
const SHOT = `${DIR}/shots`;
const WAVDIR = '/tmp/b328-wav';
mkdirSync(SHOT, { recursive: true }); mkdirSync(WAVDIR, { recursive: true });
const VPS = (process.argv[4] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const OUT = `${DIR}/rows-${TAG}${process.env.ROWS_SUFFIX ?? ''}.json`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));

const read = (page) => page.evaluate(() => {
  const v = (id) => document.querySelector(`[data-testid="${id}"]`);
  const txt = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const r1 = (n) => Math.round(n * 10) / 10;
  const attrs = (el) => [...el.attributes].filter((a) => (a.name.startsWith('data-') || a.name.startsWith('aria-')) && a.name !== 'data-clip-peaks').map((a) => `${a.name}=${a.value}`.replace(/«[^»]*»|:r[0-9a-z]+:/g, 'ID')).sort().join(' ');
  const ov = v('arrangement-overview');
  const undoBtn = [...document.querySelectorAll('button')].find((b) => /^Undo/.test(txt(b)));
  const redoBtn = [...document.querySelectorAll('button')].find((b) => /^Redo/.test(txt(b)));
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => { const b = c.getBoundingClientRect(); return `${c.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'}|${c.getAttribute('data-clip-id')}|L${r1(b.left)}|W${r1(b.width)}|${attrs(c)}|src=${c.classList.contains('opacity-40')}|op=${getComputedStyle(c).opacity}`; }),
    overview: ov ? [...ov.querySelectorAll('[style]')].map((e) => `${e.getAttribute('data-testid') ?? e.tagName}:${e.getAttribute('style')}`).filter((s) => !/playhead/.test(s)) : null,
    selectedClip: v('arrangement-selected-clip') ? txt(v('arrangement-selected-clip')) : null,
    detail: txt(v('arrangement-detail-panel')).slice(0, 400),
    projectEnd: v('arrangement-project-end') ? txt(v('arrangement-project-end')) : null,
    ruler: v('arrangement-ruler') ? r1(v('arrangement-ruler').getBoundingClientRect().width) : null,
    scrollW: v('arrangement-timeline-scroller')?.scrollWidth ?? null,
    status: txt(v('arrangement-status')),
    ghosts: [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"], [data-testid="arrangement-drop-ghost"]')].map((g) => `${g.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'}|${txt(g)}|${attrs(g)}`),
    laneHint: [...document.querySelectorAll('[data-testid="arrangement-lane-move-hint"], [data-testid="arrangement-lane-move-refusal"]')].map(txt),
    undo: undoBtn ? txt(undoBtn) : null,
    redo: redoBtn ? txt(redoBtn) : null,
    playing: txt(v('arrangement-playback-state')),
    loop: v('arrangement-loop-times') ? txt(v('arrangement-loop-times')) : null,
  };
});
function parseWav(buf) {
  const out = {}; let p = 12;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') { out.format = buf.readUInt16LE(p + 8); out.channels = buf.readUInt16LE(p + 10); out.rate = buf.readUInt32LE(p + 12); out.bits = buf.readUInt16LE(p + 22); }
    if (id === 'data') { out.dataOffset = p + 8; out.dataSize = Math.min(size, buf.length - p - 8); break; }
    p += 8 + size + (size % 2);
  }
  out.frames = out.dataSize / (out.channels * out.bits / 8); out.duration = out.frames / out.rate;
  let peak = 0, nz = 0, firstNz = -1; const bps = out.bits / 8; const n = out.dataSize / bps;
  for (let i = 0; i < n; i++) { const o = out.dataOffset + i * bps; const x = bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readFloatLE(o); if (x !== 0) { nz++; if (firstNz < 0) firstNz = i; } peak = Math.max(peak, Math.abs(x)); }
  out.peak = Number(peak.toFixed(5)); out.nonzero = nz; out.firstAudibleSec = firstNz < 0 ? null : Number((Math.floor(firstNz / out.channels) / out.rate).toFixed(4)); delete out.dataOffset;
  return out;
}

for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`); });
  const step = async (name, fn) => { if (ONLY && !ONLY.includes(name)) return; try { r[name] = await fn(); } catch (e) { r[name] = { error: String(e).slice(0, 300) }; } save(); };
  const key = async (k, ms = 450) => { await page.keyboard.press(k); await page.waitForTimeout(ms); return read(page); };
  const clipLoc = (id) => page.locator(`[data-clip-id="${id}"]`);
  const setup = async (zoomOut = true) => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.waitForTimeout(800);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
    const id = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-id');
    const bar = await clipLoc(id).getByTitle(/ — drag to move$/).first().boundingBox();
    await page.mouse.click(bar.x + 20, bar.y + bar.height / 2); await page.waitForTimeout(400);
    for (let i = 0; zoomOut && i < 20 && (await clipLoc(id).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    await page.waitForTimeout(300);
    return id;
  };
  // drag from point (x,y) by a list of [dx,dy] absolute offsets; sample after each move; D-NOFLASH sampling on release
  const drag = async (clipId, from, offsets, { alt = false, playing = false, beforeUp = null } = {}) => {
    const pre = await clipLoc(clipId).boundingBox();
    if (playing) { await page.keyboard.press('Space'); await page.waitForTimeout(700); }
    const samples = [];
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    if (alt) await page.keyboard.down('Alt');
    for (const [dx, dy] of offsets) { await page.mouse.move(from.x + dx, from.y + dy, { steps: 3 }); await page.waitForTimeout(250); samples.push(await read(page)); }
    if (beforeUp) samples.push({ beforeUp: await beforeUp() });
    await page.evaluate((cid) => {
      window.__c325flash = { frames: [] };
      window.addEventListener('pointerup', () => {
        const sample = () => { const el = document.querySelector(`[data-clip-id="${cid}"]`); const b = el?.getBoundingClientRect(); window.__c325flash.frames.push(b ? [Math.round(b.left * 10) / 10, Math.round(b.width * 10) / 10, el.closest('[data-track-id]')?.getAttribute('data-track-id')] : null); };
        sample();
        let n = 0; const tick = () => { sample(); if (++n < 5) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
      }, { capture: true, once: true });
    }, clipId);
    await page.mouse.up();
    if (alt) await page.keyboard.up('Alt');
    await page.waitForTimeout(500);
    const flashFrames = await page.evaluate(() => window.__c325flash.frames);
    const after = await read(page);
    if (playing) { await page.keyboard.press('Space'); await page.waitForTimeout(500); }
    const preKey = [Math.round(pre.x * 10) / 10, Math.round(pre.width * 10) / 10];
    const final = flashFrames[flashFrames.length - 1];
    const flash = flashFrames.slice(1).some((f) => f && f[0] === preKey[0] && f[1] === preKey[1]) && !(final && final[0] === preKey[0] && final[1] === preKey[1]);
    return { pre: preKey, samples, flashFrames, flash, after, stopped: playing ? await read(page) : undefined };
  };
  const undoRedo = async () => ({ undo: await key('Control+KeyZ', 600), redo: await key('Control+Shift+KeyZ', 600) });
  const edge = async (id, which) => { const b = await clipLoc(id).getByTitle(which === 'start' ? 'Trim — left edge' : 'Trim — right edge', { exact: true }).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  const header = async (id) => { const b = await clipLoc(id).getByTitle(/ — drag to move$/).first().boundingBox(); return { x: b.x + Math.min(30, b.width / 2), y: b.y + b.height / 2 }; };
  const laneDy = async (id, n) => page.evaluate(([cid, k]) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const own = c.closest('[data-track-id]'); const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.contains(own) && !own.contains(l) && l.getBoundingClientRect().height > 20 && l.getBoundingClientRect().top > own.getBoundingClientRect().top && !l.querySelector('[data-clip-kind="video"]')); const t = lanes[k - 1]; if (!t) return null; const a = own.getBoundingClientRect(); const b = t.getBoundingClientRect(); return { dy: (b.top + b.height / 2) - (a.top + a.height / 2), track: t.getAttribute('data-track-id') }; }, [id, n]);

  let id = await setup();
  r.setup = await read(page); r.clipId = id;
  r.gridSeconds = await page.evaluate(() => document.querySelector('[data-grid-seconds]')?.getAttribute('data-grid-seconds') ?? null);
  await page.screenshot({ path: `${SHOT}/${TAG}-setup-${vp}.png` });
  r.snapInitial = await page.locator('[data-testid="arrangement-snap-toggle"]').first().evaluate((e) => `${e.getAttribute('aria-pressed')}|${e.getAttribute('aria-checked')}`).catch(() => null);
  for (const playing of [false, true]) {
    const sfx = playing ? 'Playing' : 'Stopped';
    await step(`trimStart${sfx}`, async () => { const d = await drag(id, await edge(id, 'start'), [[20, 0], [40, 0], [60, 0]], { playing }); return { ...d, ...(await undoRedo()) }; });
    await step(`trimEndIn${sfx}`, async () => { const d = await drag(id, await edge(id, 'end'), [[-30, 0], [-60, 0], [-90, 0]], { playing }); return { ...d, ...(await undoRedo()) }; });
    await step(`trimEnd${sfx}`, async () => { const d = await drag(id, await edge(id, 'end'), [[30, 0], [60, 0], [120, 0]], { playing }); return { ...d, ...(await undoRedo()) }; });
    await step(`moveRight${sfx}`, async () => { const d = await drag(id, await header(id), [[60, 0], [140, 0], [260, 0]], { playing }); return { ...d, ...(await undoRedo()) }; });
    await step(`moveLeft${sfx}`, async () => { const d = await drag(id, await header(id), [[-30, 0], [-70, 0], [-110, 0]], { playing }); return { ...d, ...(await undoRedo()) }; });
  }
  await page.screenshot({ path: `${SHOT}/${TAG}-after-trim-move-${vp}.png` });
  // snap on (ensure), then Alt
  await step('moveSnapOn', async () => {
    const t = page.locator('[data-testid="arrangement-snap-toggle"]').first();
    const st = await t.getAttribute('aria-pressed');
    if (st === 'false') { await t.click(); await page.waitForTimeout(300); }
    const d = await drag(id, await header(id), [[25, 0], [60, 0], [110, 0]]); return { snapWas: st, snapNow: await t.getAttribute('aria-pressed'), ...d, ...(await undoRedo()) };
  });
  await step('moveAlt', async () => { const d = await drag(id, await header(id), [[25, 0], [60, 0], [110, 0]], { alt: true }); return { ...d, ...(await undoRedo()) }; });
  await step('trimAlt', async () => { const d = await drag(id, await edge(id, 'start'), [[7, 0], [19, 0], [33, 0]], { alt: true }); return { ...d, ...(await undoRedo()) }; });
  // D-MIXED
  await step('mixedBack', async () => { const ld = await laneDy(id, 1); if (!ld) return { noLane: true }; const d = await drag(id, await header(id), [[30, 0], [50, ld.dy], [70, ld.dy], [90, 0]]); return { target: ld.track, ...d, ...(await undoRedo()) }; });
  await step('mixedOther', async () => { if (process.env.FRESH_MIXED) id = await setup(); const ld = await laneDy(id, 1); if (!ld) return { noLane: true }; const d = await drag(id, await header(id), [[30, 0], [50, ld.dy], [70, ld.dy]]); const ur = await undoRedo(); await key('Control+KeyZ', 600); return { target: ld.track, ...d, ...ur, undoBack: await read(page) }; });
  // D-ABORT
  await step('abortBlur', async () => {
    const d = await drag(id, await edge(id, 'start'), [[20, 0], [40, 0]], { beforeUp: async () => { await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await page.waitForTimeout(400); return read(page); } });
    const undo = await key('Control+KeyZ', 600); const redo = await key('Control+Shift+KeyZ', 600);
    return { ...d, undo, redo };
  });
  await page.screenshot({ path: `${SHOT}/${TAG}-after-mixed-abort-${vp}.png` });
  // D-OLDPATH: fade-in, 2-clip move, video move
  await step('oldFade', async () => { const hb = await clipLoc(id).getByTestId('arrangement-clip-fade-in-handle').first().boundingBox(); const d = await drag(id, { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }, [[10, 0], [25, 0], [40, 0]]); return { ...d, ...(await undoRedo()) }; });
  await step('oldGroup', async () => {
    const hb = await header(id); await page.mouse.click(hb.x, hb.y); await page.waitForTimeout(300); await key('Control+KeyD', 800);
    for (let i = 0; i < 2; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(250); }
    const ids = await page.locator('[data-clip-kind="audio"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-clip-id')));
    const other = ids.find((x) => x !== id);
    { const hb2 = await header(id); await page.mouse.click(hb2.x, hb2.y); await page.waitForTimeout(300); }
    const ob = await header(other); await page.keyboard.down('Control'); await page.mouse.click(ob.x, ob.y); await page.keyboard.up('Control'); await page.waitForTimeout(400);
    const selected = await read(page);
    const d = await drag(id, await header(id), [[20, 0], [45, 0], [70, 0]]); return { ids, selected, ...d, ...(await undoRedo()) };
  });
  await step('oldVideo', async () => {
    await page.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind="video"]').length > 0, null, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const vid = await page.locator('[data-clip-kind="video"]').first().getAttribute('data-clip-id');
    const d = await drag(vid, await header(vid), [[20, 0], [45, 0], [70, 0]]); return { vid, ...d, ...(await undoRedo()) };
  });
  await page.screenshot({ path: `${SHOT}/${TAG}-after-oldpath-${vp}.png` });
  // D-LOOP: loop over part of the clip, play, slow trimEnd drag across wraps
  await step('loop', async () => {
    id = await setup(false);
    const c = await clipLoc(id).boundingBox(); const yy = c.y + c.height * 0.7;
    await page.mouse.move(c.x + 10, yy); await page.mouse.down(); await page.mouse.move(c.x + 45, yy, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
    const rangeRead = await read(page);
    await key('Control+KeyL', 500);
    const loopOn = await read(page);
    await page.evaluate(() => { window.__c325pos = []; const p = document.querySelector('[data-testid="arrangement-position"]'); const t0 = performance.now(); const tick = () => { window.__c325pos.push([Math.round(performance.now() - t0), (p?.textContent ?? '').trim()]); if (window.__c325pos.length < 600) setTimeout(tick, 50); }; tick(); });
    const e = await edge(id, 'start');
    const d = await drag(id, e, [[3, 0], [6, 0], [9, 0], [12, 0], [15, 0], [18, 0], [21, 0], [24, 0]], { playing: true });
    const pos = await page.evaluate(() => window.__c325pos.map((x) => x[1]));
    let wraps = 0; const toSec = (s) => { const m = s.match(/(\d+):(\d+(?:\.\d+)?)/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
    const secs = pos.map(toSec).filter((x) => x !== null); for (let i = 1; i < secs.length; i++) if (secs[i] < secs[i - 1] - 0.05) wraps++;
    return { rangeRead, loopOn, ...d, wrapsSeen: wraps, posSample: pos.filter((_, i) => i % 10 === 0).slice(0, 40), errorsAtEnd: [...errors] };
  });
  // EXPORT: scripted sequence then project WAV
  await step('export', async () => {
    id = await setup();
    await drag(id, await edge(id, 'start'), [[20, 0], [40, 0], [60, 0]]);
    await drag(id, await edge(id, 'end'), [[-15, 0], [-30, 0], [-45, 0]]);
    await drag(id, await header(id), [[40, 0], [80, 0], [120, 0]]);
    await key('Control+KeyZ', 600); const before = await key('Control+Shift+KeyZ', 600);
    await key('Escape', 250);
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(700);
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const sel = page.locator('input[name="arrangement-export-scope"][data-testid$="project"]');
    if (await sel.count()) await sel.click().catch(() => {});
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const p = `${WAVDIR}/${TAG}-project-${vp}.wav`; await d.saveAs(p);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const buf = readFileSync(p);
    return { before, file: d.suggestedFilename(), path: p, sha256: createHash('sha256').update(buf).digest('hex'), info: parseWav(buf) };
  });
  await page.screenshot({ path: `${SHOT}/${TAG}-final-${vp}.png` });
  await ctx.close();
}
res.endedUtc = new Date().toISOString(); save();
await browser.close();
