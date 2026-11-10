// C328 browser rows (copy of c-round-327/c327-rows.mjs) for PERF-DRAG-PREVIEW stage b: B-FADE-STATUS, B-FADE-CANCEL, B-FADE-PLAYING, B-FADE-END-STOP, B-VIDEO-FADE, B-FADE-EXPORT.
// usage: node c327-rows.mjs <BASE> <tag> [1440x900,1280x720]   (A tree :5173, HEAD :5197; identical pointer paths; diff with c327-diff.py)
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2];
const TAG = process.argv[3];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-425/out/b4/r328';
const SHOT = `${DIR}/shots`;
const WAVDIR = '/tmp/c328-wav';
mkdirSync(SHOT, { recursive: true }); mkdirSync(WAVDIR, { recursive: true });
const VPS = (process.argv[4] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const OUT = `${DIR}/rows-${TAG}${process.env.ROWS_SUFFIX ?? ''}.json`;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));

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
  // RMS of the first 0.5 s (fade-in region) vs 2-2.5 s
  const rms = (a, b) => { let s = 0, c = 0; for (let f = Math.floor(a * out.rate); f < Math.floor(b * out.rate) && f < out.frames; f++) { for (let ch = 0; ch < out.channels; ch++) { const o = out.dataOffset + (f * out.channels + ch) * bps; const x = bps === 2 ? buf.readInt16LE(o) / 32768 : bps === 3 ? buf.readIntLE(o, 3) / 8388608 : buf.readFloatLE(o); s += x * x; c++; } } return c ? Number(Math.sqrt(s / c).toFixed(6)) : null; };
  out.rms0to05 = rms(0, 0.5); out.rms2to25 = rms(2, 2.5);
  out.peak = Number(peak.toFixed(5)); out.nonzero = nz; out.firstAudibleSec = firstNz < 0 ? null : Number((Math.floor(firstNz / out.channels) / out.rate).toFixed(4)); delete out.dataOffset;
  return out;
}

for (const [w, h] of VPS) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  await ctx.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
    window.__c327starts = 0;
    const orig = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...a) { window.__c327starts++; return orig.apply(this, a); };
  });
  const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/i.test(m.text())) errors.push(`console: ${m.text().slice(0, 160)}`); });
  const step = async (name, fn) => { if (ONLY && !ONLY.includes(name)) return; try { r[name] = await fn(); } catch (e) { r[name] = { error: String(e).slice(0, 400) }; } save(); };
  const shot = (name) => page.screenshot({ path: `${SHOT}/${TAG}-${vp}-${name}.png` });
  const read = (clipId) => page.evaluate((cid) => {
    const v = (id) => document.querySelector(`[data-testid="${id}"]`);
    const txt = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const c = cid ? document.querySelector(`[data-clip-id="${cid}"]`) : null;
    const undoBtn = [...document.querySelectorAll('button')].find((b) => /^Undo/.test(txt(b)));
    const redoBtn = [...document.querySelectorAll('button')].find((b) => /^Redo/.test(txt(b)));
    return {
      status: txt(v('arrangement-status')),
      statusSpans: v('arrangement-status')?.children.length ?? null,
      fadeIn: c?.getAttribute('data-fade-in') ?? null,
      fadeAttrs: c ? [...c.attributes].filter((a) => /fade/.test(a.name)).map((a) => `${a.name}=${a.value}`).join(' ') : null,
      fadeOut: c?.getAttribute('data-fade-out') ?? null,
      undoTitle: undoBtn ? `${txt(undoBtn)}|${undoBtn.getAttribute('title')}|${undoBtn.disabled}` : null,
      redoTitle: redoBtn ? `${txt(redoBtn)}|${redoBtn.getAttribute('title')}|${redoBtn.disabled}` : null,
      playing: txt(v('arrangement-playback-state')),
      position: txt(v('arrangement-position')),
      starts: window.__c327starts,
    };
  }, clipId ?? null);
  const observe = () => page.evaluate(() => {
    const o = document.querySelector('[data-testid="arrangement-status"]');
    window.__c327obs?.disconnect(); window.__c327rec = [];
    window.__c327obs = new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) window.__c327rec.push(`+${(n.textContent ?? '').trim()}`); for (const n of m.removedNodes) window.__c327rec.push(`-${(n.textContent ?? '').trim()}`); if (m.type === 'characterData') window.__c327rec.push(`~${(m.target.textContent ?? '').trim()}`); } });
    window.__c327obs.observe(o, { childList: true, subtree: true, characterData: true });
  });
  const takeRec = () => page.evaluate(() => { const x = window.__c327rec ?? []; window.__c327rec = []; return x; });
  const setup = async (sourceId, zoomOut = true) => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.waitForTimeout(800);
    await page.locator(`[data-source-id="${sourceId}"]`).first().click(); await page.waitForTimeout(250);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(1500);
    const id = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-id');
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; zoomOut && i < 20 && (await page.locator(`[data-clip-id="${id}"]`).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    await page.waitForTimeout(300);
    return id;
  };
  const handle = async (clipId) => { const b = await page.locator(`[data-clip-id="${clipId}"]`).locator('[title^="Fade In"], [title^="Video Fade In"]').first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  // drag the fade-in handle along offsets; per step: status, records, fadeIn
  const fadeDrag = async (clipId, offsets, { beforeUp = null, shotAt = null, shotPrefix = '' } = {}) => {
    const from = await handle(clipId);
    await observe();
    const before = await read(clipId);
    await page.mouse.move(from.x, from.y); await page.mouse.down(); await page.waitForTimeout(120);
    const down = { ...(await read(clipId)), rec: await takeRec() };
    const samples = [];
    for (let i = 0; i < offsets.length; i++) { const [dx, dy] = offsets[i]; await page.mouse.move(from.x + dx, from.y + dy, { steps: 3 }); await page.waitForTimeout(200); samples.push({ dx, ...(await read(clipId)), rec: await takeRec() }); if (shotAt === i) await shot(`${shotPrefix}mid`); }
    let bu = null; if (beforeUp) bu = await beforeUp();
    await page.mouse.up(); await page.waitForTimeout(500);
    const after = { ...(await read(clipId)), rec: await takeRec() };
    return { from, before, down, samples, beforeUp: bu, after };
  };
  const path12 = Array.from({ length: 12 }, (_, i) => [10 * (i + 1), 0]);

  await step('fadeStatus', async () => {
    const id = await setup('demo-stem-pulse');
    await shot('fs-start');
    const d = await fadeDrag(id, path12, { shotAt: 5, shotPrefix: 'fs-' });
    await shot('fs-released');
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600);
    const undo = await read(id); await shot('fs-undo');
    await page.keyboard.press('Control+Shift+KeyZ'); await page.waitForTimeout(600);
    const redo = await read(id);
    return { id, ...d, undo, redo };
  });
  await step('fadeCancel', async () => {
    const id = await setup('demo-stem-pulse');
    const d = await fadeDrag(id, [[20, 0], [40, 0], [60, 0]], { beforeUp: async () => { await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await page.waitForTimeout(400); const x = { ...(await read(id)), rec: await takeRec() }; await shot('fc-after-blur'); return x; } });
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600);
    return { id, ...d, afterUndo: await read(id) };
  });
  await step('fadePlaying', async () => {
    const id = await setup('demo-stem-pulse');
    await page.keyboard.press('Home'); await page.waitForTimeout(200);
    await page.keyboard.press('Space'); await page.waitForTimeout(800);
    const playingStart = await read(id);
    const d = await fadeDrag(id, path12, { shotAt: 5, shotPrefix: 'fp-', beforeUp: async () => read(id) });
    const startsDuringMove = d.beforeUp.starts - d.down.starts;
    const startsAtRelease = d.after.starts - d.beforeUp.starts;
    const positions = d.samples.map((s) => s.position);
    await page.waitForTimeout(800); const later = await read(id);
    await page.keyboard.press('Space'); await page.waitForTimeout(500);
    return { id, playingStart, ...d, startsDuringMove, startsAtRelease, positions, later, stopped: await read(id) };
  });
  await step('fadeEndStop', async () => {
    const id = await setup('demo-soft-impact');
    const g = await page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft = 0; const r = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect(); return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: r.y + r.height - 3 }; });
    await page.keyboard.press('Home'); await page.waitForTimeout(200);
    const x0 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
    const clipW = (await page.locator(`[data-clip-id="${id}"]`).boundingBox()).width;
    await page.mouse.click(x0 + 1.0 * g.pps, g.by, { modifiers: ['Alt'] }); await page.waitForTimeout(300);
    await page.evaluate(() => document.activeElement?.blur());
    const marker = await read(id);
    await page.keyboard.press('Space'); await page.waitForTimeout(150);
    const playing0 = await read(id);
    // slow path that lasts past the end (~2.4 s of moves)
    const offs = Array.from({ length: 12 }, (_, i) => [6 * (i + 1), 0]);
    const d = await fadeDrag(id, offs, { beforeUp: async () => { const x = await read(id); await shot('fe-before-up'); return x; } });
    await shot('fe-released');
    return { id, geom: { ...g, x0, clipW }, marker, playing0, ...d };
  });
  await step('videoFade', async () => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
    await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind="video"]').length > 0, null, { timeout: 60000 });
    await page.waitForTimeout(3000);
    const vid = await page.locator('[data-clip-kind="video"]').first().getAttribute('data-clip-id');
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 20 && (await page.locator(`[data-clip-id="${vid}"]`).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    { const hb = await page.locator(`[data-clip-id="${vid}"]`).getByTitle(/ — drag to move$/).first().boundingBox().catch(() => null); if (hb) { await page.mouse.click(hb.x + Math.min(30, hb.width / 2), hb.y + hb.height / 2); await page.waitForTimeout(400); } }
    const handleTitle = await page.locator(`[data-clip-id="${vid}"]`).locator('[title^="Video Fade In"]').first().getAttribute('title', { timeout: 10000 });
    const d = await fadeDrag(vid, path12, { shotAt: 5, shotPrefix: 'vf-' });
    await shot('vf-released');
    await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600);
    return { vid, handleTitle, ...d, undo: await read(vid) };
  });
  if (vp === '1440x900') await step('export', async () => {
    const id = await setup('demo-stem-pulse');
    const d = await fadeDrag(id, process.env.EXPORT_PX ? Array.from({ length: 4 }, (_, i) => [Number(process.env.EXPORT_PX) * (i + 1) / 4, 0]) : path12);
    await page.keyboard.press('Escape'); await page.waitForTimeout(250);
    await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(700);
    await page.locator('[data-testid="arrangement-export-format-wav"]').click().catch(() => {});
    const sel = page.locator('input[name="arrangement-export-scope"][data-testid$="project"]');
    if (await sel.count()) await sel.click().catch(() => {});
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await page.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const dd = await dl; const p = `${WAVDIR}/${TAG}-project-${vp}.wav`; await dd.saveAs(p);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    const buf = readFileSync(p);
    return { fadeInAfter: d.after.fadeIn, finalStatus: d.after.status, file: dd.suggestedFilename(), path: p, sha256: createHash('sha256').update(buf).digest('hex'), info: parseWav(buf) };
  });
  await ctx.close();
}
res.endedUtc = new Date().toISOString(); save();
await browser.close();
