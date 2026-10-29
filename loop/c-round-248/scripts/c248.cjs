// C round 248: independent browser rows for SABA-B-11b stage 2b (hidden grid pauses Snap).
// usage: node c248.cjs <base> <outDir> [rowRegex] [onlyVp 1440|1280]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');

const BASE = process.argv[2];
const outDir = process.argv[3];
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
const onlyVp = process.argv[5] || null;
fs.mkdirSync(outDir, { recursive: true });
const resultFile = path.join(outDir, 'c248.json');
const R = fs.existsSync(resultFile) ? JSON.parse(fs.readFileSync(resultFile, 'utf8')) : { rows: {} };
R.base = BASE;
R.started = new Date().toISOString();
const save = () => fs.writeFileSync(resultFile, JSON.stringify(R, null, 1));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 120000 });
  await sleep(800);
  return { ctx, page, errors };
}
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
const grid = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-testid="arrangement-grid-control"]');
  const snap = document.querySelector('[data-testid="arrangement-snap-toggle"]');
  const sel = document.querySelector('[data-testid="arrangement-grid-division"]');
  return {
    snap: c.dataset.snap, snapPaused: c.dataset.snapPaused ?? null, ariaPressed: snap.getAttribute('aria-pressed'), snapText: snap.textContent.trim(),
    division: c.dataset.gridDivision, seconds: Number(c.dataset.gridSeconds), mode: c.dataset.gridMode, lines: c.dataset.gridLines,
    laneLines: [...document.querySelectorAll('[data-track-id] [data-grid-lines]')].map((e) => e.dataset.gridLines).join(','),
    laneSeconds: [...document.querySelectorAll('[data-track-id] [data-grid-lines]')].map((e) => e.dataset.gridSeconds).join(','),
    zoom: document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent,
    snapTitle: snap.title, selectTitle: sel.title,
    status: document.querySelector('[data-testid="arrangement-status"]').textContent,
  };
});
const pps = async (page) => parseFloat((await grid(page)).zoom);
const playhead = (page) => page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow')));
async function setZoomSlider(page, position) {
  await page.evaluate((pos) => {
    const input = document.querySelector('[data-testid="arrangement-zoom"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(pos));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, position);
  await sleep(300);
}
async function zoomTo(page, targetPx) {
  const max = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-zoom"]').max));
  let lo = 0; let hi = max;
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); await setZoomSlider(page, mid); const z = await pps(page); if (z >= targetPx) hi = mid; else lo = mid + 1; }
  await setZoomSlider(page, lo);
  return { pos: lo, zoom: (await grid(page)).zoom };
}
// absolute x for a given timeline time (uses the ruler origin)
async function xOf(page, t) { const box = await page.getByTestId('arrangement-ruler').boundingBox(); return box.x + t * (await pps(page)); }
async function visibleRuler(page) {
  const box = await page.getByTestId('arrangement-ruler').boundingBox();
  const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  const left = Math.max(box.x, sc.x) + 4; const right = Math.min(box.x + box.width, sc.x + sc.width, page.viewportSize().width) - 20;
  return { box, left, right };
}
let lastClickAt = 0;
async function spaced() { const w = 850 - (Date.now() - lastClickAt); if (w > 0) await sleep(w); }
async function rulerClick(page, frac, alt = false) {
  await spaced();
  const { box, left, right } = await visibleRuler(page);
  const x = left + (right - left) * frac; const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  if (alt) { await page.keyboard.down('Alt'); await sleep(120); }
  await page.mouse.down(); await page.mouse.up();
  if (alt) await page.keyboard.up('Alt');
  lastClickAt = Date.now();
  await sleep(400);
  const p = await pps(page);
  return { x: +(x - box.x).toFixed(2), pointer: +((x - box.x) / p).toFixed(4), t: await playhead(page), pps: p };
}
async function laneBody(page, trackId) { return page.locator(`[data-track-id="${trackId}"] [data-grid-lines]`).first(); }
async function laneClick(page, trackId, frac, alt = false) {
  await spaced();
  const lane = await laneBody(page, trackId); const lb = await lane.boundingBox();
  const { box, left, right } = await visibleRuler(page);
  const x = left + (right - left) * frac; const y = lb.y + lb.height / 2;
  const hit = await page.evaluate(([x0, y0]) => { const e = document.elementFromPoint(x0, y0); return e ? (e.getAttribute('data-testid') || e.tagName) + (e.closest('[data-clip-id]') ? ':clip' : '') : null; }, [x, y]);
  await page.mouse.move(x, y);
  if (alt) { await page.keyboard.down('Alt'); await sleep(120); }
  await page.mouse.down(); await page.mouse.up();
  if (alt) await page.keyboard.up('Alt');
  lastClickAt = Date.now();
  await sleep(400);
  const p = await pps(page);
  return { x: +(x - box.x).toFixed(2), pointer: +((x - box.x) / p).toFixed(4), t: await playhead(page), hit, pps: p };
}
async function playheadDrag(page, frac, releaseDx = 4) {
  await spaced();
  const h = await page.getByTestId('arrangement-playhead-handle').boundingBox();
  const { box, left, right } = await visibleRuler(page);
  const tx = left + (right - left) * frac;
  await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2); await page.mouse.down();
  for (let i = 1; i <= 8; i += 1) { await page.mouse.move(h.x + h.width / 2 + ((tx - h.x - h.width / 2) * i) / 8, h.y + h.height / 2); await sleep(30); }
  const during = await playhead(page);
  await page.mouse.move(tx + releaseDx, h.y + h.height / 2); await sleep(60);
  await page.mouse.up(); lastClickAt = Date.now(); await sleep(400);
  const p = await pps(page);
  return { xRelease: +(tx + releaseDx - box.x).toFixed(2), pointer: +((tx + releaseDx - box.x) / p).toFixed(4), during, t: await playhead(page), pps: p };
}
const clipStart = (page, id) => page.locator(`[data-clip-id="${id}"]`).getAttribute('data-clip-start');
async function clipDrag(page, id, dx, opts = {}) {
  await spaced();
  const clip = page.locator(`[data-clip-id="${id}"]`); const b = await clip.boundingBox();
  const vw = page.viewportSize().width;
  const visRight = Math.min(b.x + b.width, vw - 30);
  const sx = b.x + Math.min(Math.max(b.width * 0.5, 4), (visRight - b.x) * 0.5); const sy = b.y + 6;
  const before = Number(await clipStart(page, id));
  await page.mouse.move(sx, sy);
  if (opts.alt) { await page.keyboard.down('Alt'); await sleep(120); }
  await page.mouse.down();
  const n = 10;
  for (let i = 1; i <= n; i += 1) { await page.mouse.move(sx + (dx * i) / n, sy); await sleep(30); }
  await sleep(60);
  await page.mouse.up();
  if (opts.alt) await page.keyboard.up('Alt');
  lastClickAt = Date.now(); await sleep(500);
  const after = Number(await clipStart(page, id));
  const p = await pps(page);
  return { before, after, dx, pointerDelta: +(dx / p).toFixed(4), free: +(before + dx / p).toFixed(4), pps: p };
}
async function addBtn(page, id) {
  await page.locator(`[data-source-id="${id}"]`).first().click(); await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(900);
  await blur(page);
  return page.evaluate((sid) => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ id: c.dataset.clipId, start: c.dataset.clipStart, track: c.closest('[data-track-id]')?.dataset.trackId })).pop(), id);
}
async function chooseDivision(page, id) { await page.getByTestId('arrangement-grid-division').selectOption(id); await sleep(400); await blur(page); }
async function key(page, k) { await blur(page); await page.keyboard.press(k); await sleep(400); }
async function ensureSnap(page, on) { const g = await grid(page); if ((g.snap === 'on') !== on) await key(page, 'g'); }
async function shot(page, name, k) { await page.screenshot({ path: path.join(outDir, `${name}-${k}.png`) }); }
const multOf = (t, step) => { const q = t / step; return Math.abs(q - Math.round(q)) * step < 0.0015; };
const freeOk = (r, step) => r && Math.abs(r.t - r.pointer) * r.pps <= 1.01 && !multOf(r.t, step);
const freeDragOk = (r, step) => r && Math.abs(r.after - r.free) * r.pps <= 1.01 && !multOf(r.after, step);

async function gestures(page, step, clipId, dx, fr) {
  const g = {};
  g.ruler = await rulerClick(page, fr[0]);
  g.lane = await laneClick(page, 'stems', fr[1]);
  g.playhead = await playheadDrag(page, fr[2]);
  if (clipId) g.clip = await clipDrag(page, clipId, dx);
  g.ok = { ruler: freeOk(g.ruler, step), lane: freeOk(g.lane, step), playhead: freeOk(g.playhead, step), clip: clipId ? freeDragOk(g.clip, step) : null };
  return g;
}

const ROWS = {
  // C-HIDDEN-SNAP-248 (a)
  hiddenA: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-slow-rise');
    await chooseDivision(page, '0.1'); await ensureSnap(page, true); r.grid = await grid(page);
    r.g = await gestures(page, 0.1, r.clip.id, 13.3, [0.3711, 0.4433, 0.5127]);
    r.gridAfter = await grid(page); await shot(page, name, k);
    r.pass = r.grid.lines === 'hidden' && !/visible/.test(r.grid.laneLines) && r.grid.snapPaused === 'true' && Object.values(r.g.ok).every((v) => v !== false);
    return r;
  },
  // C-HIDDEN-SNAP-248 (b)
  hiddenB: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-hero-music'); r.statusAdd = (await grid(page)).status;
    await setZoomSlider(page, 0); await ensureSnap(page, true); r.grid = await grid(page);
    r.g = await gestures(page, r.grid.seconds, r.clip.id, 13.3, [0.37, 0.53, 0.61]);
    r.gridAfter = await grid(page); await shot(page, name, k);
    r.pass = r.grid.mode === 'adaptive' && r.grid.lines === 'hidden' && !/visible/.test(r.grid.laneLines) && r.grid.snapPaused === 'true' && Object.values(r.g.ok).every((v) => v !== false);
    return r;
  },
  // C-HIDDEN-SNAP-248 (c)
  hiddenC: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-stem-pulse');
    await chooseDivision(page, '1/32'); await ensureSnap(page, true); r.grid = await grid(page);
    r.g = await gestures(page, 0.0625, r.clip.id, 13.3, [0.3711, 0.4433, 0.5127]);
    r.gridAfter = await grid(page); await shot(page, name, k);
    r.pass = r.grid.lines === 'hidden' && !/visible/.test(r.grid.laneLines) && r.grid.snapPaused === 'true' && Object.values(r.g.ok).every((v) => v !== false);
    return r;
  },
  // C-ALT-HIDDEN-248
  altHidden: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-slow-rise');
    await chooseDivision(page, '0.1'); await ensureSnap(page, false); r.gridOff = await grid(page);
    r.offRuler = await rulerClick(page, 0.5127, true);
    r.offLane = await laneClick(page, 'stems', 0.4433, true);
    r.offClip = await clipDrag(page, r.clip.id, 13.3, { alt: true });
    await ensureSnap(page, true); r.gridOn = await grid(page);
    r.onRuler = await rulerClick(page, 0.6251, true);
    r.onClip = await clipDrag(page, r.clip.id, 13.3, { alt: true });
    await ensureSnap(page, false);
    r.zoom60 = await zoomTo(page, 60); r.gridVis = await grid(page);
    r.ctlRuler = await rulerClick(page, 0.2817, true);
    r.ctlClip = await clipDrag(page, r.clip.id, 13.3, { alt: true });
    await shot(page, name, k);
    r.ok = { offRuler: freeOk(r.offRuler, 0.1), offLane: freeOk(r.offLane, 0.1), offClip: freeDragOk(r.offClip, 0.1), onRuler: freeOk(r.onRuler, 0.1), onClip: freeDragOk(r.onClip, 0.1), ctlRuler: multOf(r.ctlRuler.t, 0.1) };
    r.pass = Object.values(r.ok).every(Boolean);
    return r;
  },
  // C-VISIBLE-KEEP-248 part 1: 0.1 at 60 px/s
  visible01: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-slow-rise');
    await chooseDivision(page, '0.1'); r.zoom = await zoomTo(page, 60); await ensureSnap(page, true); r.grid = await grid(page);
    r.ruler = await rulerClick(page, 0.3711);
    r.lane = await laneClick(page, 'stems', 0.4433);
    r.playhead = await playheadDrag(page, 0.5127);
    r.clipD = await clipDrag(page, r.clip.id, 13.3);
    await shot(page, name, k);
    r.ok = { ruler: multOf(r.ruler.t, 0.1), lane: multOf(r.lane.t, 0.1), playhead: multOf(r.playhead.t, 0.1), clip: multOf(r.clipD.after, 0.1), paused: r.grid.snapPaused === 'false' };
    r.pass = Object.values(r.ok).every(Boolean);
    return r;
  },
  // C-VISIBLE-KEEP-248 part 2: 1/32 at 100 px/s (pulse)
  visible132: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-stem-pulse');
    await chooseDivision(page, '1/32'); r.zoom = await zoomTo(page, 100); await ensureSnap(page, true); r.grid = await grid(page);
    r.ruler = await rulerClick(page, 0.3711);
    r.ruler2 = await rulerClick(page, 0.6017);
    r.lane = await laneClick(page, 'stems', 0.4433);
    r.clipD = await clipDrag(page, r.clip.id, 13.3);
    await shot(page, name, k);
    r.ok = { ruler: multOf(r.ruler.t, 0.0625), ruler2: multOf(r.ruler2.t, 0.0625), distinct: r.ruler.t !== r.ruler2.t, lane: multOf(r.lane.t, 0.0625), clip: multOf(r.clipD.after, 0.0625), paused: r.grid.snapPaused === 'false' };
    r.pass = Object.values(r.ok).every(Boolean);
    return r;
  },
  // C-VISIBLE-KEEP-248 part 3: load state adaptive 1 s at 40, Snap on; ruler, clip, loop brace, marker drags
  visibleLoad: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-slow-rise');
    await ensureSnap(page, true); r.grid = await grid(page);
    r.ruler = await rulerClick(page, 0.3711);
    r.clipD = await clipDrag(page, r.clip.id, 13.3);
    // time selection on the empty stems lane, then Ctrl+L
    const lb0 = await page.locator(`[data-clip-id="${r.clip.id}"]`).boundingBox(); const lb = { y: lb0.y + 24, height: lb0.height - 30 };
    const x0 = await xOf(page, 1.3); const x1 = await xOf(page, 3.6);
    await spaced(); await page.mouse.move(x0, lb.y + lb.height / 2); await page.mouse.down();
    for (let i = 1; i <= 8; i += 1) { await page.mouse.move(x0 + ((x1 - x0) * i) / 8, lb.y + lb.height / 2); await sleep(30); }
    await page.mouse.up(); lastClickAt = Date.now(); await sleep(400);
    r.range = await page.evaluate(() => { const e = document.querySelector('[data-range-start]'); return e ? [e.dataset.rangeStart, e.dataset.rangeEnd] : null; });
    await page.keyboard.press('Control+l'); await sleep(500);
    r.loop0 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-loop-times"]')?.textContent);
    const brace = page.getByTestId('arrangement-loop-brace'); const bb = await brace.boundingBox();
    if (bb) {
      await spaced(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down();
      for (let i = 1; i <= 8; i += 1) { await page.mouse.move(bb.x + bb.width / 2 + (53.3 * i) / 8, bb.y + bb.height / 2); await sleep(30); }
      await page.mouse.up(); lastClickAt = Date.now(); await sleep(400);
    }
    r.loop1 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-loop-times"]')?.textContent);
    // marker at a free playhead: seek by ruler click (snaps on visible grid), add marker, drag it
    await blur(page); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(500);
    const flag = page.getByTestId('arrangement-marker').first(); r.marker0 = await flag.getAttribute('data-marker-time');
    const fb = await flag.boundingBox();
    if (fb) {
      await spaced(); await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2); await page.mouse.down();
      for (let i = 1; i <= 8; i += 1) { await page.mouse.move(fb.x + fb.width / 2 + (93.3 * i) / 8, fb.y + fb.height / 2); await sleep(30); }
      await page.mouse.up(); lastClickAt = Date.now(); await sleep(400);
    }
    r.marker1 = await flag.getAttribute('data-marker-time');
    await shot(page, name, k);
    r.pass = 'compare-with-head';
    return r;
  },
  // C-RESUME-248
  resume: async (page, k, name) => {
    const r = {}; await chooseDivision(page, '0.1'); await ensureSnap(page, true);
    r.hidden = await grid(page);
    r.samples = [];
    const max = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-zoom"]').max));
    const startPos = await page.evaluate(() => Number(document.querySelector('[data-testid="arrangement-zoom"]').value));
    r.zoom60 = await zoomTo(page, 60);
    // walk from start to target, sampling aria-pressed and paused
    for (let p = startPos; p <= r.zoom60.pos; p += Math.max(1, Math.round((r.zoom60.pos - startPos) / 10))) { await setZoomSlider(page, p); const g = await grid(page); r.samples.push([p, g.zoom, g.snapPaused, g.ariaPressed, g.lines]); }
    await setZoomSlider(page, r.zoom60.pos);
    r.visible = await grid(page);
    r.click = await rulerClick(page, 0.3711);
    r.max = max;
    await shot(page, name, k);
    r.pass = r.hidden.snapPaused === 'true' && r.visible.snapPaused === 'false' && r.samples.every((s) => s[3] === 'true') && r.hidden.ariaPressed === 'true' && r.visible.ariaPressed === 'true' && multOf(r.click.t, 0.1) && r.visible.status === r.hidden.status;
    return r;
  },
  // C-NUDGE-248
  nudge: async (page, k, name) => {
    const r = {}; const c = await addBtn(page, 'demo-stem-pulse'); r.clip = c;
    await chooseDivision(page, '0.25'); r.z20 = await zoomTo(page, 20);
    const clip = page.locator(`[data-clip-id="${c.id}"]`); const b = await clip.boundingBox();
    await page.mouse.click(b.x + Math.min(30, b.width / 2), b.y + 6); await sleep(400);
    await blur(page); await ensureSnap(page, true); r.grid = await grid(page);
    r.s = [await clip.getAttribute('data-clip-start')];
    await page.keyboard.press('ArrowRight'); await sleep(350); r.s.push(await clip.getAttribute('data-clip-start'));
    await page.keyboard.press('ArrowRight'); await sleep(350); r.s.push(await clip.getAttribute('data-clip-start'));
    r.z40 = await zoomTo(page, 40); r.gridVis = await grid(page);
    await page.keyboard.press('ArrowRight'); await sleep(350); r.s.push(await clip.getAttribute('data-clip-start'));
    await shot(page, name, k);
    r.pass = r.s.join(',') === '0.000,0.100,0.200,0.250';
    return r;
  },
  // C-KEYSTEP-248 marker
  keystepMarker: async (page, k, name) => {
    const r = {}; await chooseDivision(page, '0.1'); await ensureSnap(page, true); r.grid = await grid(page);
    r.seek = await rulerClick(page, 0.2317);
    await blur(page); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(500);
    const flag = page.getByTestId('arrangement-marker').first(); r.m = [await flag.getAttribute('data-marker-time')];
    await flag.focus(); await sleep(200); r.focus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    await page.keyboard.press('ArrowRight'); await sleep(400); r.m.push(await flag.getAttribute('data-marker-time'));
    r.z60 = await zoomTo(page, 60); r.gridVis = await grid(page);
    await flag.focus(); await sleep(200);
    await page.keyboard.press('ArrowRight'); await sleep(400); r.m.push(await flag.getAttribute('data-marker-time'));
    await shot(page, name, k);
    const [a, b, c] = r.m.map(Number);
    r.ok = { hiddenStep: Math.abs(b - a - 0.1) < 0.0015, visibleLine: multOf(c, 0.1) && c > b && c - b <= 0.1 + 1e-9 };
    r.pass = Object.values(r.ok).every(Boolean);
    return r;
  },
  // C-KEYSTEP-248 loop brace
  keystepLoop: async (page, k, name) => {
    const r = {}; r.clip = await addBtn(page, 'demo-slow-rise'); await chooseDivision(page, '0.1'); await ensureSnap(page, true); r.grid = await grid(page);
    const lb0 = await page.locator(`[data-clip-id="${r.clip.id}"]`).boundingBox(); const lb = { y: lb0.y + 24, height: lb0.height - 30 };
    const x0 = await xOf(page, 1.63); const x1 = await xOf(page, 4.17);
    await spaced(); await page.mouse.move(x0, lb.y + lb.height / 2); await page.mouse.down();
    for (let i = 1; i <= 8; i += 1) { await page.mouse.move(x0 + ((x1 - x0) * i) / 8, lb.y + lb.height / 2); await sleep(30); }
    await page.mouse.up(); lastClickAt = Date.now(); await sleep(400);
    r.range = await page.evaluate(() => { const e = document.querySelector('[data-range-start]'); return e ? [e.dataset.rangeStart, e.dataset.rangeEnd] : null; });
    await page.keyboard.press('Control+l'); await sleep(500);
    const loopT = () => page.evaluate(() => { const b = document.querySelector('[data-testid="arrangement-loop-brace"]'); return { text: document.querySelector('[data-testid="arrangement-loop-times"]')?.textContent, aria: b?.getAttribute('aria-valuetext') || b?.getAttribute('aria-label') }; });
    r.l = [await loopT()];
    const brace = page.getByTestId('arrangement-loop-brace');
    await brace.focus(); await sleep(200); r.focus = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    await page.keyboard.press('ArrowRight'); await sleep(400); r.l.push(await loopT());
    r.z60 = await zoomTo(page, 60); r.gridVis = await grid(page);
    await brace.focus(); await sleep(200);
    await page.keyboard.press('ArrowRight'); await sleep(400); r.l.push(await loopT());
    await shot(page, name, k);
    r.pass = 'see-values';
    return r;
  },
  // C-SIGNALS-248 sequence in the seconds family
  signalsSeconds: async (page, k, name) => {
    const r = { steps: [] }; const st = async (label) => { const g = await grid(page); r.steps.push({ label, status: g.status, paused: g.snapPaused, aria: g.ariaPressed, snapTitle: g.snapTitle, selectTitle: g.selectTitle, lines: g.lines, division: g.division, mode: g.mode, zoom: g.zoom }); };
    await chooseDivision(page, '0.1'); await st('select 0.1 (snap off)');
    await key(page, 'g'); await st('G on');
    await key(page, 'Digit4'); await st('4 off');
    await key(page, 'Digit4'); await st('4 on');
    await key(page, 'Digit1'); await st('1 fixed (0.1 is narrowest?)');
    await key(page, 'Digit2'); await st('2 fixed widen -> 0.25?');
    await key(page, 'Digit1'); await st('1 fixed narrow -> 0.1');
    const z60 = await zoomTo(page, 60); await st(`zoom ${z60.zoom} (crossing to visible)`);
    await chooseDivision(page, '0.25'); await st('select 0.25 visible');
    await chooseDivision(page, '0.1'); await st('select 0.1 visible');
    const z40 = await zoomTo(page, 40); await st(`zoom ${z40.zoom} (crossing to hidden)`);
    // grid menu: right-click empty lane
    const lb = await (await laneBody(page, 'stems')).boundingBox();
    await page.mouse.click(lb.x + 200, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
    r.menuItems = await page.evaluate(() => [...document.querySelectorAll('[role=menu] [role^=menuitem]')].map((e) => e.textContent.trim()));
    const item = page.locator('[role=menu] [role=menuitemradio]', { hasText: /^0\.25/ }).first();
    if (await item.count()) { await item.click(); await sleep(400); await st('menu 0.25 (visible)'); }
    await page.mouse.click(lb.x + 200, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
    const item2 = page.locator('[role=menu] [role=menuitemradio]', { hasText: /^0\.1/ }).first();
    if (await item2.count()) { await item2.click(); await sleep(400); await st('menu 0.1 (hidden)'); }
    await key(page, 'Digit5'); await st('5 adaptive at 40');
    await key(page, 'Digit5'); await st('5 fixed at 40');
    await shot(page, name, k);
    r.pass = 'see-steps';
    return r;
  },
  // C-SIGNALS-248 adaptive at min zoom + grid menu width items
  signalsAdaptive: async (page, k, name) => {
    const r = { steps: [] }; const st = async (label) => { const g = await grid(page); r.steps.push({ label, status: g.status, paused: g.snapPaused, aria: g.ariaPressed, snapTitle: g.snapTitle, selectTitle: g.selectTitle, lines: g.lines, division: g.division, mode: g.mode, zoom: g.zoom }); };
    await setZoomSlider(page, 0); await st('slider 0');
    await key(page, 'g'); await st('G on');
    await key(page, 'Digit1'); await st('1 adaptive narrow');
    await key(page, 'Digit2'); await st('2 adaptive widen');
    await key(page, 'Digit2'); await st('2 adaptive widen again');
    await key(page, 'Digit5'); await st('5 fixed');
    await key(page, 'Digit5'); await st('5 adaptive');
    const lb = await (await laneBody(page, 'stems')).boundingBox();
    for (const w of ['Narrowest', 'Widest', 'Medium']) {
      await page.mouse.click(lb.x + 100, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
      if (!r.menuItems) r.menuItems = await page.evaluate(() => [...document.querySelectorAll('[role=menu] [role^=menuitem]')].map((e) => e.textContent.trim()));
      const it = page.locator('[role=menu] [role^=menuitem]', { hasText: new RegExp(w) }).first();
      if (await it.count()) { await it.click(); await sleep(400); await st(`menu width ${w}`); } else { await page.keyboard.press('Escape'); await sleep(300); r.steps.push({ label: `menu width ${w} not found` }); }
    }
    // Snap toggle from the grid menu
    await page.mouse.click(lb.x + 100, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
    const sn = page.locator('[role=menu] [role=menuitemcheckbox]', { hasText: /Snap/ }).first();
    if (await sn.count()) { await sn.click(); await sleep(400); await st('menu Snap toggle (off)'); }
    await page.mouse.click(lb.x + 100, lb.y + lb.height / 2, { button: 'right' }); await sleep(500);
    if (await sn.count()) { await sn.click(); await sleep(400); await st('menu Snap toggle (on)'); }
    await shot(page, name, k);
    r.pass = 'see-steps';
    return r;
  },
  // C-SIGNALS-248 musical: 3 adaptive + fixed, and tempo neighbours
  signalsMusical: async (page, k, name) => {
    const r = { steps: [] }; const st = async (label) => { const g = await grid(page); r.steps.push({ label, status: g.status, paused: g.snapPaused, aria: g.ariaPressed, snapTitle: g.snapTitle, lines: g.lines, division: g.division, mode: g.mode, zoom: g.zoom }); };
    await addBtn(page, 'demo-stem-pulse'); await st('seed');
    await setZoomSlider(page, 0); await st('slider 0 (adaptive)');
    await key(page, 'Digit3'); await st('3 adaptive');
    await key(page, 'Digit3'); await st('3 adaptive back');
    r.z40 = await zoomTo(page, 40);
    await chooseDivision(page, '1/32'); await st('select 1/32 at 40');
    await key(page, 'Digit3'); await st('3 fixed -> 1/32T');
    await key(page, 'Digit1'); await st('1 fixed at 1/32T (end?)');
    await key(page, 'Digit3'); await st('3 fixed -> 1/32');
    await shot(page, name, k);
    r.pass = 'see-steps';
    return r;
  },
  // C-STATUS-BOX-248
  statusBox: async (page, k, name) => {
    const m = () => page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); const cs = getComputedStyle(s); const r = s.getBoundingClientRect(); const foot = s.closest('footer') || s.parentElement; const fr = foot.getBoundingClientRect(); const tr = [...document.querySelectorAll('[data-testid=arrangement-follow], [data-testid=arrangement-position]')].map((e) => e.getBoundingClientRect()); const overlap = tr.some((t) => !(t.right <= r.left || t.left >= r.right || t.bottom <= r.top || t.top >= r.bottom)); return { text: s.textContent, h: r.height, w: r.width, top: r.top, sw: s.scrollWidth, cw: s.clientWidth, sh: s.scrollHeight, ch: s.clientHeight, lh: cs.lineHeight, lines: Math.round(r.height / parseFloat(cs.lineHeight)), footH: fr.height, footTag: foot.tagName, overlap }; });
    const r = {}; await addBtn(page, 'demo-stem-pulse'); r.seed = await m();
    await chooseDivision(page, '1/32'); await key(page, 'Digit3'); r.note = await m();
    r.grid = await grid(page);
    await shot(page, name, k);
    r.pass = r.note.sw <= r.note.cw && !r.note.overlap && r.note.lines <= r.seed.lines && /1\/32T/.test(r.note.text) && /Snap is paused/.test(r.note.text);
    return r;
  },
  // C-KEYS-248
  keysText: async (page, k, name) => {
    const r = {}; await addBtn(page, 'demo-stem-pulse'); r.g0 = await grid(page);
    const search = page.locator('input[type=search], input[placeholder*="Search" i]').first();
    r.searchFound = await search.count();
    if (r.searchFound) { await search.click(); await page.keyboard.type('g45123'); await sleep(400); r.searchVal = await search.inputValue(); r.g1 = await grid(page); await search.fill(''); await sleep(300); }
    const bpm = page.locator('input[aria-label*="BPM" i], input[aria-label*="Tempo" i]').first();
    r.bpmFound = await bpm.count();
    if (r.bpmFound) { await bpm.click(); await page.keyboard.press('End'); await page.keyboard.type('g45123'); await sleep(300); r.bpmVal = await bpm.inputValue(); r.g2 = await grid(page); await page.keyboard.press('Escape'); await sleep(300); }
    const same = (a, b) => b && a.snap === b.snap && a.division === b.division && a.mode === b.mode && a.seconds === b.seconds;
    r.pass = r.searchFound > 0 && r.bpmFound > 0 && same(r.g0, r.g1) && same(r.g0, r.g2);
    return r;
  },
  // §6 library drop with hidden lines (pointer drag of a library row)
  libraryDrop: async (page, k, name) => {
    const r = {}; await chooseDivision(page, '0.1'); await ensureSnap(page, true); r.grid = await grid(page);
    const src = page.locator('[data-source-id="demo-soft-impact"]').first(); const sb = await src.boundingBox();
    const lb = await (await laneBody(page, 'sfx')).boundingBox();
    const tx = (await xOf(page, 3.1)) + 1.3;
    r.pointer = +(((tx - (await page.getByTestId('arrangement-ruler').boundingBox()).x) / (await pps(page)))).toFixed(4);
    try { await src.dragTo(page.locator('[data-track-id="sfx"] [data-grid-lines]').first(), { targetPosition: { x: tx - lb.x, y: lb.height / 2 }, timeout: 8000 }); } catch (e) { r.dragErr = String(e).slice(0, 200); }
    await sleep(800);
    r.clips = await page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => [c.dataset.clipStart, c.closest('[data-track-id]')?.dataset.trackId]));
    r.status = (await grid(page)).status;
    await shot(page, name, k);
    r.pass = 'probe';
    return r;
  },
};

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  R.chromium = browser.version();
  const vps = [{ width: 1440, height: 900 }, { width: 1280, height: 720 }].filter((v) => !onlyVp || String(v.width) === onlyVp);
  for (const vp of vps) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of Object.entries(ROWS)) {
      if (filter && !filter.test(name)) continue;
      const t0 = Date.now(); const key = `${name}@${k}`;
      try { const { ctx, page, errors } = await open(browser, vp); R.rows[key] = await fn(page, k, name); R.rows[key].errors = errors; await ctx.close(); } catch (e) { R.rows[key] = { error: String(e).slice(0, 800) }; }
      R.rows[key].ms = Date.now() - t0; save();
      console.log(key, 'pass=', R.rows[key].pass, R.rows[key].error ? R.rows[key].error.slice(0, 300) : '', 'err', (R.rows[key].errors || []).length);
    }
  }
  await browser.close();
  R.finished = new Date().toISOString(); save();
})();
