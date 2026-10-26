// C round 196 — POINTER / THUMB / SABA-SHOT / FUNC probe. node pointer.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const K = require('./rk-lib.cjs'); const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'pointer', TAG); fs.mkdirSync(OUT, { recursive: true });
const sleep = L.sleep;
const SEL = {
  trackVol: '[data-track-id=music] input[type=range][aria-label^="Volume — "]',
  pan: '[data-track-id=music] [data-testid=arrangement-track-pan]',
  groupVol: '[data-testid=arrangement-group-volume]',
  master: 'input[aria-label="Master Volume"]',
  clipGain: '[data-testid=arrangement-detail-clip-gain-fader]',
  zoom: '[data-testid=arrangement-zoom]',
};
const LEVEL = new Set(['trackVol', 'groupVol', 'master', 'clipGain']);
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
const BR = [201, 164, 106]; const IV = [236, 230, 218];
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
const st = (p, sel) => p.evaluate((sel) => { const el = sel ? document.querySelector(sel) : document.activeElement; if (!el) return null; const c = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { sel, focused: document.activeElement === el, active: (document.activeElement && (document.activeElement.dataset.testid || document.activeElement.getAttribute('aria-label') || document.activeElement.tagName)), fv: el.matches(':focus-visible'), os: c.outlineStyle, ow: c.outlineWidth, oo: c.outlineOffset, bs: c.boxShadow, value: el.value, fs: document.documentElement.dataset.focusSource || null, box: { x: r.x, y: r.y, w: r.width, h: r.height } }; }, sel);
function clipFor(b, m = 8) { const x = Math.max(0, Math.floor(b.x - m)), y = Math.max(0, Math.floor(b.y - m)); return { x, y, width: Math.min(W - x, Math.ceil(b.w + 2 * m + 1)), height: Math.min(H - y, Math.ceil(b.h + 2 * m + 1)) }; }
// count changed pixels outside the control box (ring zone) between two shots
function ringDiff(fa, fb, clip, b) { const A = decode(fs.readFileSync(fa)), B = decode(fs.readFileSync(fb)); let n = 0;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const xc = clip.x + (x + 0.5) / 2, yc = clip.y + (y + 0.5) / 2; const out = xc < b.x - 0.5 || xc > b.x + b.w + 0.5 || yc < b.y - 0.5 || yc > b.y + b.h + 0.5; if (!out) continue; const a = A.px(x, y), c = B.px(x, y); if (Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]) > 24) n++; } return n; }
function thumbOf(file, clip, b) { const A = decode(fs.readFileSync(file)); let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, n = 0; const cyc = b.y + b.h / 2;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const xc = clip.x + (x + 0.5) / 2, yc = clip.y + (y + 0.5) / 2; if (xc < b.x || xc > b.x + b.w || yc < b.y || yc > b.y + b.h) continue; const c = A.px(x, y); if (Math.min(c[0], c[1], c[2]) > 150 && !near(c, BR, 30)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); n++; } }
  if (x1 < 0) return null; const cx = (x0 + x1) >> 1, cy = (y0 + y1) >> 1; return { wCss: (x1 - x0 + 1) / 2, hCss: (y1 - y0 + 1) / 2, centre: A.px(cx, cy), cxCss: clip.x + (x0 + x1 + 1) / 4, n }; }
function brassOf(file, clip, b) { const A = decode(fs.readFileSync(file)); let x1 = -1, n = 0; const yc0 = Math.round((b.y + b.h / 2 - clip.y) * 2);
  for (let y = yc0 - 2; y <= yc0 + 2; y++) for (let x = 0; x < A.w; x++) { const xc = clip.x + (x + 0.5) / 2; if (xc < b.x || xc > b.x + b.w) continue; if (near(A.px(x, y), BR, 30)) { n++; x1 = Math.max(x1, x); } }
  return { n, endCss: x1 < 0 ? null : clip.x + (x1 + 1) / 2 }; }
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `ptr-${TAG}`, net, { deviceScaleFactor: 2 });
  const R = { W, PORT };
  // SABA scene first: Tab from top to the first Pan (keyboard), shot
  await page.mouse.move(W - 2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 80; i++) { await page.keyboard.press('Tab'); await sleep(60); if (await page.evaluate(() => document.activeElement && document.activeElement.dataset.testid === 'arrangement-track-pan')) { R.sabaTabs = i + 1; break; } }
  R.sabaKey = await st(page, null);
  if (R.sabaKey) { const c = clipFor(R.sabaKey.box, 14); await page.screenshot({ path: path.join(OUT, 'saba-pan-keyboard.png'), clip: c }); R.sabaKeyClip = c;
    R.sabaRing = await page.evaluate(() => { const el = document.activeElement; const r = el.getBoundingClientRect(); const c = getComputedStyle(el); const o = parseFloat(c.outlineOffset) + parseFloat(c.outlineWidth); return { inputBox: { x: r.x, y: r.y, w: r.width, h: r.height }, ringOuter: { x: r.x - o, y: r.y - o, w: r.width + 2 * o, h: r.height + 2 * o }, label: el.getAttribute('aria-label') }; }); }
  // ring geometry in pixels for the saba shot: brass extent
  if (R.sabaKeyClip) { const A = decode(fs.readFileSync(path.join(OUT, 'saba-pan-keyboard.png'))); let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const c = A.px(x, y); if (near(c, [165, 135, 88], 22) || near(c, BR, 22)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } R.sabaBrassExtent = x1 < 0 ? null : { x: R.sabaKeyClip.x + x0 / 2, y: R.sabaKeyClip.y + y0 / 2, w: (x1 - x0 + 1) / 2, h: (y1 - y0 + 1) / 2 }; }
  // mouse-pressed Pan (saba scene)
  { const b = R.sabaKey.box; await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); await sleep(200); R.sabaMouse = await st(page, null); await page.mouse.move(W - 2, 2); await sleep(100); await page.screenshot({ path: path.join(OUT, 'saba-pan-mouse.png'), clip: R.sabaKeyClip }); }
  // setup rich scene
  await libDrop(page, 'demo-middle-east', 'music', 0.05);
  await page.click(nameSel('stems')); await sleep(200); await page.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await page.mouse.click(5, H - 5); await sleep(150); await page.keyboard.press('Control+g'); await sleep(700);
  const t = page.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = page.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await page.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
  await page.screenshot({ path: path.join(OUT, 'scene.png') });
  // POINTER + THUMB per fader
  R.faders = {};
  for (const [name, sel] of Object.entries(SEL)) {
    const loc = page.locator(sel).first(); if (!(await loc.count())) { R.faders[name] = 'missing'; continue; }
    await loc.scrollIntoViewIfNeeded(); await page.mouse.move(W - 2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(150);
    const f = { rest: await st(page, sel) }; const b = f.rest.box; const c = clipFor(b); const P = (s) => path.join(OUT, `${name}-${s}.png`);
    await page.screenshot({ path: P('rest'), clip: c }); f.thumbRest = thumbOf(P('rest'), c, b); f.brassRest = brassOf(P('rest'), c, b);
    await page.mouse.move(b.x + b.w * 0.3, b.y + b.h / 2); await sleep(200); await page.screenshot({ path: P('hover'), clip: c }); f.thumbHover = thumbOf(P('hover'), c, b);
    const tb = f.thumbRest ? f.thumbRest.cxCss : b.x + b.w / 2;
    await page.mouse.move(tb, b.y + b.h / 2); await page.mouse.down(); await sleep(250); f.pressed = await st(page, sel); await page.screenshot({ path: P('pressed'), clip: c }); f.thumbPressed = thumbOf(P('pressed'), c, b);
    await page.mouse.up(); await sleep(200); await page.mouse.move(W - 2, 2); await sleep(150); f.released = await st(page, sel); await page.screenshot({ path: P('released'), clip: c });
    f.ringPxPressed = ringDiff(P('pressed'), P('rest'), c, b); f.ringPxReleased = ringDiff(P('released'), P('rest'), c, b);
    await page.keyboard.press('Shift'); await sleep(120); f.afterShift = await st(page, sel); await page.keyboard.press('Alt'); await sleep(120); f.afterAlt = await st(page, sel);
    await page.screenshot({ path: P('modkeys'), clip: c }); f.ringPxModkeys = ringDiff(P('modkeys'), P('rest'), c, b);
    const key = name === 'pan' ? 'ArrowRight' : (name === 'trackVol' ? 'ArrowDown' : 'ArrowUp');
    const v0 = f.released.value; await page.keyboard.press(key); await sleep(200); f.afterArrow = await st(page, sel); f.arrowKey = key; f.stepped = f.afterArrow.value !== v0;
    await page.screenshot({ path: P('arrow'), clip: c }); f.ringPxArrow = ringDiff(P('arrow'), P('rest'), c, b);
    // fill end vs thumb centre at min/mid/max (thumb hidden by a C-only probe stylesheet)
    if (LEVEL.has(name)) {
      f.fill = [];
      for (const pos of ['Home', 'mid', 'End']) {
        if (pos === 'mid') { await page.evaluate((sel) => { const el = document.querySelector(sel); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, String((+el.min + +el.max) / 2)); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, sel); } else await page.keyboard.press(pos);
        await sleep(250);
        const shown = path.join(OUT, `${name}-fill-${pos}-thumb.png`); await page.screenshot({ path: shown, clip: c }); const th = thumbOf(shown, c, b);
        await page.addStyleTag({ content: 'input[type=range]::-webkit-slider-thumb{opacity:0!important}' }); await sleep(100);
        const hid = path.join(OUT, `${name}-fill-${pos}.png`); await page.screenshot({ path: hid, clip: c }); const br = brassOf(hid, c, b);
        await page.evaluate(() => { const s = [...document.querySelectorAll('style')].pop(); s.remove(); });
        const v = await st(page, sel); f.fill.push({ pos, value: v.value, thumbCx: th && th.cxCss, brassEnd: br.endCss, delta: th && br.endCss != null ? +(br.endCss - th.cxCss).toFixed(2) : null, brassN: br.n });
      }
      // restore via keyboard to roughly original
    }
    // Tab moves on with a ring
    await page.keyboard.press('Tab'); await sleep(150); f.afterTab = await st(page, null);
    R.faders[name] = f; L.save(OUT, 'result.json', R);
  }
  // Other pointer targets
  R.others = {};
  const others = { wzoom: '[data-testid=arrangement-waveform-zoom]', back: 'button[aria-label="Back to start"]', follow: '[data-testid=arrangement-follow]', overview: '[data-testid=arrangement-overview]', libraryRow: '[role=option][data-source-id]', bpm: '[data-testid=arrangement-tempo-input]', panReset: '[data-track-id=music] [data-testid=arrangement-track-pan-reset]' };
  for (const [name, sel] of Object.entries(others)) {
    const loc = page.locator(sel).first(); if (!(await loc.count())) { R.others[name] = 'missing'; continue; }
    await loc.scrollIntoViewIfNeeded(); await page.mouse.move(W - 2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(150);
    const o = { rest: await st(page, sel) }; const b = o.rest.box; const c = clipFor(b); const P = (s) => path.join(OUT, `o-${name}-${s}.png`);
    await page.screenshot({ path: P('rest'), clip: c });
    const px = name === 'overview' ? b.x + b.w * 0.9 : b.x + b.w / 2;
    await page.mouse.move(px, b.y + b.h / 2); await page.mouse.down(); await sleep(200); await page.mouse.up(); await sleep(250); await page.mouse.move(W - 2, 2); await sleep(150);
    o.after = await st(page, null); o.afterSel = await st(page, sel);
    if (name === 'wzoom') { await page.keyboard.press('Escape'); await sleep(200); o.afterEscape = await st(page, null); await page.screenshot({ path: P('afterEscape'), clip: c }); o.ringPxAfterEscape = ringDiff(P('afterEscape'), P('rest'), c, b); }
    else { await page.screenshot({ path: P('after'), clip: c }); o.ringPx = ringDiff(P('after'), P('rest'), c, b); }
    if (name === 'panReset') { o.panAfter = await st(page, SEL.pan); }
    if (name === 'bpm') { await page.keyboard.press('Escape'); await sleep(100); }
    R.others[name] = o; L.save(OUT, 'result.json', R);
  }
  // Grid menu: right-click visible part of the music lane
  { const pt = await page.evaluate(() => { const l = document.querySelector('[data-track-id="music"]'); const r = l.getBoundingClientRect(); const ov = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); return { x: Math.min(r.right, window.innerWidth) - 120, y: r.top + r.height / 2, ov: ov.left }; });
    await page.mouse.click(pt.x, pt.y, { button: 'right' }); await sleep(400);
    R.grid = { open: await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-grid-menu]')), initial: await st(page, null) };
    if (R.grid.open) { const items = []; await page.screenshot({ path: path.join(OUT, 'grid-open.png') });
      for (let i = 0; i < 6; i++) { await page.keyboard.press('ArrowDown'); await sleep(120); const d = await K.recordFocusedOnly(page, 600 + i, OUT, W, H); items.push(d); }
      await page.keyboard.press('Tab'); await sleep(120); items.push(await K.recordFocusedOnly(page, 610, OUT, W, H)); R.grid.items = items; }
    await page.keyboard.press('Escape'); await sleep(300); }
  // FUNC: Space play/pause, double-click reset on track volume, separator keyboard, search typing + Escape
  R.func = {};
  await page.mouse.click(5, H - 5); await sleep(150); await page.evaluate(() => document.activeElement && document.activeElement.blur());
  const playing = () => page.evaluate(() => { const b = document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]'); return b && b.getAttribute('aria-label'); });
  R.func.before = await playing(); await page.keyboard.press('Space'); await sleep(800); R.func.afterSpace1 = await playing(); await page.keyboard.press('Space'); await sleep(400); R.func.afterSpace2 = await playing();
  { const sel = SEL.trackVol; const b = (await st(page, sel)).box; await page.focus(sel); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown'); await sleep(100); const v1 = (await st(page, sel)).value; await page.mouse.dblclick(b.x + b.w / 2, b.y + b.h / 2); await sleep(300); R.func.dblReset = { before: v1, after: (await st(page, sel)).value, fv: (await st(page, sel)).fv }; }
  { const sel = '[data-testid=arrangement-library-separator]'; const lib0 = await page.evaluate(() => document.querySelector('[data-testid=arrangement-library-separator]').parentElement.getBoundingClientRect().width); await page.focus(sel); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(250); const lib1 = await page.evaluate(() => document.querySelector('[data-testid=arrangement-library-separator]').parentElement.getBoundingClientRect().width); R.func.separator = { lib0, lib1, aria: await page.evaluate(() => document.querySelector('[data-testid=arrangement-library-separator]').getAttribute('aria-valuenow')) }; await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft'); }
  { const sel = '[data-testid=arrangement-library-search]'; await page.click(sel); await page.keyboard.type('mid'); await sleep(400); const n1 = await page.evaluate(() => document.querySelectorAll('[role=option][data-source-id]').length); const fvType = (await st(page, sel)).fv; await page.keyboard.press('Escape'); await sleep(300); const s = await st(page, sel); const n2 = await page.evaluate(() => document.querySelectorAll('[role=option][data-source-id]').length); R.func.search = { n1, valueAfterEsc: s.value, n2, fvWhileTyping: fvType, focusedAfterEsc: s.focused }; }
  R.net = log;
  L.save(OUT, 'result.json', R);
  console.log(TAG, 'done errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
