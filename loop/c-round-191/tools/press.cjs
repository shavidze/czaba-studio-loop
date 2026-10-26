// C round 191 — independent PRESS/LOOK/PANZOOM/LAYOUT probe.
// node press.cjs <base 5173|5174> <W> [fresh]
// session mode: one page, setup (library drop, group, detail+clip), then six controls x 5 states.
// fresh mode: a fresh context per control, minimal setup, one pointer-down (held 200 ms) only.
const L = require('./lib.cjs'); const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const MODE = process.argv[4] || 'session';
const H = W === 1440 ? 900 : 720; const BASE = `http://127.0.0.1:${PORT}`;
const TAG = `${PORT === '5174' ? 'head' : 'tree'}-${W}-${MODE}`;
const OUT = path.join(__dirname, '..', 'press', TAG); fs.mkdirSync(OUT, { recursive: true });
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
const BR = [201, 164, 106]; const IV = [236, 230, 218];
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
const M = 10; // crop margin css px

async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
async function setupGroup(p) {
  await p.click(nameSel('stems')); await sleep(200); await p.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await p.mouse.click(5, H - 5); await sleep(150); await p.keyboard.press('Control+g'); await sleep(700);
}
async function setupClip(p) {
  await libDrop(p, 'demo-middle-east', 'music', 0.05);
  const t = p.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = p.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await p.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
}
async function geo(f, name) {
  return f.evaluate((el, name) => {
    const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
    const reset = name === 'pan' ? el.parentElement.querySelector('[data-testid=arrangement-track-pan-reset]') : null;
    const pb = reset ? getComputedStyle(reset, '::before') : null;
    const row = el.parentElement.getBoundingClientRect();
    return { box: { x: r.x, y: r.y, w: r.width, h: r.height }, rowBox: { y: row.y, h: row.height }, value: el.value, min: el.min, max: el.max, disabled: el.disabled,
      fill: el.style.getPropertyValue('--studio-fader-fill'), fv: el.matches(':focus-visible'), focused: document.activeElement === el,
      outline: c.outline, outlineOffset: c.outlineOffset, boxShadow: c.boxShadow, bg: c.backgroundColor, appearance: c.appearance, transition: c.transitionProperty,
      cls: el.className, valuetext: el.getAttribute('aria-valuetext'),
      reset: reset ? { disabled: reset.disabled, text: reset.textContent, beforeOutline: pb.outline, beforeOffset: pb.outlineOffset, beforeShadow: pb.boxShadow, beforeW: pb.width, beforeH: pb.height } : null };
  }, name);
}
// Stadium (pill) distance in css px from the control shape; >0 outside.
function stadiumDist(xc, yc, sb) { const r = sb.h / 2; const cy = sb.y + r; const ax = sb.x + r, bx = sb.x + sb.w - r; const qx = Math.max(ax, Math.min(bx, xc)); return Math.hypot(xc - qx, yc - cy) - r; }
function analyse(file, crop, sb, name, parentRef) {
  const I = decode(fs.readFileSync(file)); const s = 2;
  const res = { gapPx: 0, gapBad: 0, gapBadAtThumbX: 0, ringPx: 0, ringBrass: 0, outerBrass: 0, insideBrassOffTrack: 0, thumb: null, thumbMean: null, bandsTop: null, bandsBottom: null, thumbOutsideStadium: 0 };
  const cyc = sb.y + sb.h / 2; let th = { x0: 1e9, x1: -1, y0: 1e9, y1: -1, n: 0, sr: 0, sg: 0, sb: 0 };
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) {
    const c = I.px(x, y); const xc = crop.x + (x + 0.5) / s, yc = crop.y + (y + 0.5) / s; const d = stadiumDist(xc, yc, sb);
    if (d <= 0.25 && Math.min(c[0], c[1], c[2]) > 120 && !near(c, BR, 30)) { th.x0 = Math.min(th.x0, x); th.x1 = Math.max(th.x1, x); th.y0 = Math.min(th.y0, y); th.y1 = Math.max(th.y1, y); th.n++; th.sr += c[0]; th.sg += c[1]; th.sb += c[2]; }
    if (d > 0.25 && near(c, IV, 14)) res.thumbOutsideStadium++;
    if (d <= 0) { if (near(c, BR, 24) && Math.abs(yc - cyc) > 2.5) res.insideBrassOffTrack++; }
    else if (d > 0.5 && d <= 1.5) { res.gapPx++; if (!near(c, parentRef, 8)) res.gapBad++; }
    else if (d > 1.5 && d <= 4.5) { res.ringPx++; if (near(c, BR, 24)) res.ringBrass++; }
    else if (d > 4.5 && xc > crop.x + 1 && xc < crop.x + crop.w - 1 && yc > crop.y + 1 && yc < crop.y + crop.h - 1) { if (near(c, BR, 24)) res.outerBrass++; }
  }
  if (th.x1 >= 0) {
    res.thumb = { x0: th.x0, x1: th.x1, y0: th.y0, y1: th.y1, w: th.x1 - th.x0 + 1, h: th.y1 - th.y0 + 1, cxCss: +(crop.x + (th.x0 + th.x1 + 1) / 2 / s).toFixed(2) };
    res.thumbMean = [th.sr / th.n, th.sg / th.n, th.sb / th.n].map((v) => +v.toFixed(1)); res.thumbN = th.n;
    // gap at the thumb x-column: rows above/below the stadium at the thumb centre column
    const xcol = Math.round((th.x0 + th.x1) / 2);
    for (let y = 0; y < I.h; y++) { const xc = crop.x + (xcol + 0.5) / s, yc = crop.y + (y + 0.5) / s; const d = stadiumDist(xc, yc, sb); if (d > 0.5 && d <= 1.5 && !near(I.px(xcol, y), parentRef, 8)) res.gapBadAtThumbX++; }
    res.thumbColumnTrace = []; for (let y = 0; y < I.h; y++) res.thumbColumnTrace.push(near(I.px(xcol, y), BR, 24) ? 'B' : near(I.px(xcol, y), IV, 14) ? 'I' : near(I.px(xcol, y), parentRef, 8) ? '.' : 'x'); res.thumbColumnTrace = res.thumbColumnTrace.join('');
  }
  // per-column parent run between the control box edge and the ring (top and bottom), straight part only
  { const by0 = Math.round((sb.y - crop.y) * s), by1 = Math.round((sb.y + sb.h - crop.y) * s); const xa = Math.round((sb.x + sb.h / 2 - crop.x) * s), xb = Math.round((sb.x + sb.w - sb.h / 2 - crop.x) * s); let minRun = 1e9, cols = 0, ringCols = 0;
    for (let x = xa; x < xb; x++) { for (const dir of [-1, 1]) { let y = dir < 0 ? by0 - 1 : by1; let run = 0; while (y >= 0 && y < I.h && near(I.px(x, y), parentRef, 8)) { run++; y += dir; } const hitBrass = y >= 0 && y < I.h && (near(I.px(x, y), BR, 24) || (y + dir >= 0 && y + dir < I.h && near(I.px(x, y + dir), BR, 24))); cols++; if (hitBrass) { ringCols++; minRun = Math.min(minRun, run); } } }
    res.minGapRunDev = ringCols ? minRun : null; res.ringColsFrac = +(ringCols / cols).toFixed(3); }
  // band thickness on the straight part, centre column of the stadium
  const cands = [0.3, 0.5, 0.7].map((f) => Math.round((sb.x + sb.h / 2 + (sb.w - sb.h) * f - crop.x) * s)); const xmid = res.thumb ? cands.sort((a, b) => Math.abs(b - (res.thumb.x0 + res.thumb.x1) / 2) - Math.abs(a - (res.thumb.x0 + res.thumb.x1) / 2))[0] : cands[1];
  const col = []; for (let y = 0; y < I.h; y++) col.push(near(I.px(xmid, y), BR, 24) ? 1 : 0);
  const bands = []; col.forEach((v, y) => { if (!v) return; if (bands.length && bands[bands.length - 1][1] === y - 1) bands[bands.length - 1][1] = y; else bands.push([y, y]); });
  res.colBands = bands.map(([a, b]) => ({ y: a, thick: b - a + 1 })); res.colX = xmid;
  // track row colours (level faders): sample at track centre row, left of thumb (fill) and right of thumb (unfilled)
  const ty = Math.round((cyc - crop.y) * s);
  if (res.thumb) {
    const lx = Math.round((sb.x - crop.x) * s) + 8, rx = Math.round((sb.x + sb.w - crop.x) * s) - 8;
    res.trackLeft = lx < res.thumb.x0 - 2 ? I.px(lx, ty).slice(0, 3) : null; res.trackRight = rx > res.thumb.x1 + 2 ? I.px(rx, ty).slice(0, 3) : null;
    res.besideThumbL = res.thumb.x0 - 3 > 0 ? I.px(res.thumb.x0 - 3, ty).slice(0, 3) : null; res.besideThumbR = res.thumb.x1 + 3 < I.w ? I.px(res.thumb.x1 + 3, ty).slice(0, 3) : null;
  }
  return res;
}
function fillEdge(file, crop, sb) {
  const I = decode(fs.readFileSync(file)); const s = 2; const y = Math.round((sb.y + sb.h / 2 - crop.y) * s); let first = -1, last = -1;
  const xa = Math.max(0, Math.round((sb.x - crop.x) * s)), xb = Math.min(I.w, Math.round((sb.x + sb.w - crop.x) * s)); for (let x = xa; x < xb; x++) if (near(I.px(x, y), BR, 24)) { if (first < 0) first = x; last = x; }
  return { fromCss: first < 0 ? null : +(crop.x + first / s).toFixed(2), toCss: last < 0 ? null : +(crop.x + (last + 1) / s).toFixed(2), trackRow: [0, 1, 2, 3].map((k) => I.px(Math.round((sb.x - crop.x) * s) + 4 + k * Math.round(sb.w * s / 4 - 2), y).slice(0, 3)) };
}
function gapMode(file, crop, sb) { const I = decode(fs.readFileSync(file)); const cnt = {}; for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) { const d = stadiumDist(crop.x + (x + 0.5) / 2, crop.y + (y + 0.5) / 2, sb); if (d > 0.5 && d <= 1.5) { const k = I.px(x, y).slice(0, 3).join(','); cnt[k] = (cnt[k] || 0) + 1; } } const e = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; return e ? e[0].split(',').map(Number) : null; }
async function chooseParent(p, sb) { const cy = sb.y + sb.h / 2; const c = { left: await parentAt(p, sb.x - 8, cy), right: await parentAt(p, sb.x + sb.w + 8, cy), top: await parentAt(p, sb.x + sb.w / 2, sb.y - 8), bottom: await parentAt(p, sb.x + sb.w / 2, sb.y + sb.h + 8) }; return c; }
async function parentAt(p, x, y) { x = Math.max(1, Math.min(W - 1, x)); y = Math.max(1, Math.min(H - 1, y)); const f = path.join(OUT, '_px.png'); await p.screenshot({ path: f, clip: { x: x - 1, y: y - 1, width: 2, height: 2 } }); const I = decode(fs.readFileSync(f)); return I.px(1, 1).slice(0, 3); }

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'] });
  const net = []; const res = { TAG, base: BASE, utc: new Date().toISOString(), controls: {}, layout: null };
  const open = async (label) => { process.env.C_BASE = BASE; const o = await L.openCtx(b, { width: W, height: H }, label, net, { deviceScaleFactor: 2 });
    await o.page.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' }); await o.page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(2500);
    await o.page.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); }); await sleep(300); return o; };
  const measure = async (p, f, name, state, g0, parentRef) => {
    const g = await geo(f, name); const sb = name === 'pan' ? { x: g.box.x, y: g.box.y + g.box.h / 2 - 8, w: g.box.w, h: 16 } : g.box;
    const cx0 = Math.max(0, sb.x - M), cy0 = Math.max(0, sb.y - M); const crop = { x: cx0, y: cy0, w: sb.x + sb.w + M - cx0, h: sb.y + sb.h + M - cy0 };
    const file = path.join(OUT, `${name}-${state}.png`); await p.screenshot({ path: file, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } });
    const a = analyse(file, crop, sb, name, parentRef); const r = { ...g, ...a, stadium: sb, shot: path.relative(path.join(__dirname, '..'), file) };
    if (LEVEL.has(name)) { await f.evaluate((el) => el.setAttribute('data-c191-nothumb', '')); await sleep(80); const nf = path.join(OUT, `${name}-${state}-nothumb.png`); await p.screenshot({ path: nf, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } }); await f.evaluate((el) => el.removeAttribute('data-c191-nothumb')); r.fillEdge = fillEdge(nf, crop, sb); if (a.thumb && r.fillEdge.toCss != null) r.fillEndMinusThumbCentre = +(r.fillEdge.toCss - a.thumb.cxCss).toFixed(2); r.fillStartMinusBoxLeft = r.fillEdge.fromCss != null ? +(r.fillEdge.fromCss - sb.x).toFixed(2) : null; }
    return r;
  };
  if (MODE === 'session') {
    const o = await open(TAG); const p = o.page;
    for (let i = 0; i < 5; i++) { try { await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 60000 }); await p.addStyleTag({ content: 'input[data-c191-nothumb]::-webkit-slider-thumb{opacity:0!important}' }); break; } catch (e) { await sleep(3000); } }
    await setupClip(p); await setupGroup(p);
    // re-select the clip (group setup changed selection)
    const clip = p.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await p.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
    res.layout = await p.evaluate(() => {
      const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
      const out = {};
      for (const t of document.querySelectorAll('[data-track-id]')) { const k = t.dataset.trackId; const hdr = t.querySelector('[data-testid=arrangement-track-header]'); out[`lane:${k}`] = R(t); out[`hdr:${k}`] = R(hdr);
        for (const btn of t.querySelectorAll('button[aria-label^="Mute"],button[aria-label^="Solo"]')) out[`${k}:${btn.getAttribute('aria-label').split(' ')[0]}`] = R(btn);
        const v = t.querySelector('input[type=range][aria-label^="Volume — "]'); out[`${k}:vol`] = R(v); if (v) out[`${k}:volReadout`] = R(v.nextElementSibling);
        const pn = t.querySelector('[data-testid=arrangement-track-pan]'); out[`${k}:pan`] = R(pn); out[`${k}:panReset`] = R(t.querySelector('[data-testid=arrangement-track-pan-reset]')); }
      const gv = document.querySelector('[data-testid=arrangement-group-volume]'); out.groupVol = R(gv); out.groupRow = R(gv && gv.closest('[data-testid]')?.parentElement); out.groupHeader = R(gv && gv.parentElement && gv.parentElement.parentElement);
      const mv = document.querySelector('input[aria-label="Master Volume"]'); out.master = R(mv); out.masterReadout = R(mv && mv.nextElementSibling); out.masterBar = R(mv && mv.parentElement);
      const cg = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]'); out.clipGain = R(cg); out.clipGainRow = R(cg && cg.parentElement); out.detailContent = R(document.querySelector('[data-testid=arrangement-detail-content]'));
      const z = document.querySelector('[data-testid=arrangement-zoom]'); out.zoom = R(z); out.zoomReadout = R(document.querySelector('[data-testid=arrangement-zoom-readout]')); out.transport = R(z && z.closest('header,[role=toolbar],div.flex'));
      return out; });
    for (const [name, sel] of Object.entries(SEL)) {
      const f = p.locator(sel).first(); await f.scrollIntoViewIfNeeded(); await p.mouse.click(5, H - 5); await sleep(200);
      const g0 = await geo(f, name); const sb = name === 'pan' ? { x: g0.box.x, y: g0.box.y + g0.box.h / 2 - 8, w: g0.box.w, h: 16 } : g0.box;
      const pc = await chooseParent(p, sb); const pre = path.join(OUT, `${name}-pre.png`); { const cx0 = Math.max(0, sb.x - M), cy0 = Math.max(0, sb.y - M); const crop = { x: cx0, y: cy0, w: sb.x + sb.w + M - cx0, h: sb.y + sb.h + M - cy0 }; await p.screenshot({ path: pre, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } }); var gm = gapMode(pre, crop, sb); } const order = ['left', 'right', 'top', 'bottom']; const which = order.find((k) => gm && near(pc[k], gm, 8)) || 'none'; const parentRef = which === 'none' ? pc.left : pc[which]; const parentL = pc.left, parentT = pc.top;
      const rec = { parentCands: pc, gapModeRest: gm, parentWhich: which, parentRef };
      rec.rest = await measure(p, f, name, 'rest', g0, parentRef);
      if (!g0.disabled) {
        const bb = g0.box; const px0 = bb.x + bb.w * 0.5;
        await p.mouse.move(px0, bb.y + bb.h / 2); await p.mouse.down(); await sleep(200); rec.pressed = await measure(p, f, name, 'pressed', g0, parentRef);
        await p.mouse.move(bb.x + bb.w * 0.3, bb.y + bb.h / 2, { steps: 6 }); await sleep(150); rec.drag = await measure(p, f, name, 'drag', g0, parentRef);
        await p.mouse.up(); await sleep(400); rec.released = await measure(p, f, name, 'released', g0, parentRef);
        await p.mouse.click(5, H - 5); await sleep(150); await p.keyboard.press('Control+z'); await sleep(350);
        rec.afterUndoValue = await f.evaluate((el) => el.value);
      }
      await f.focus(); await p.keyboard.press('Shift+Tab'); await sleep(100); await p.keyboard.press('Tab'); await sleep(100);
      rec.tabLanded = await f.evaluate((el) => el === document.activeElement);
      const v0 = await f.evaluate((el) => el.value); await p.keyboard.press('ArrowLeft'); await sleep(450); rec.keyboard = await measure(p, f, name, 'keyboard', g0, parentRef); rec.keyboard.valueBefore = v0;
      if (LEVEL.has(name) && !g0.disabled) { for (let i = 0; i < 8; i++) { await p.keyboard.press('ArrowLeft'); await sleep(60); } await sleep(400); rec.keyboardLow = await measure(p, f, name, 'keyboardLow', g0, parentRef); await p.mouse.click(5, H - 5); await sleep(300); rec.restLow = await measure(p, f, name, 'restLow', g0, parentRef); await p.keyboard.press('Control+z'); await sleep(300); }
      await p.mouse.click(5, H - 5); await sleep(200); await p.keyboard.press('Control+z'); await sleep(300);
      res.controls[name] = rec;
    }
    // disabled clip gain: no clip selected
    { const lb = await p.evaluate(() => { const g = document.querySelector('[data-track-id=sfx] [data-grid-seconds]') || document.querySelector('[data-track-id=sfx]'); const r = g.getBoundingClientRect(); return { x: r.right - 20, y: r.top + r.height / 2 }; }); await p.mouse.click(lb.x, lb.y); await sleep(500); await p.keyboard.press('Escape'); await sleep(300); }
    const cgf = p.locator(SEL.clipGain); if (await cgf.count()) { const g0 = await geo(cgf, 'clipGain'); const pc = await chooseParent(p, g0.box); const parentRef = pc.left; res.clipGainDisabled = await measure(p, cgf, 'clipGain', 'disabled', g0, parentRef); res.clipGainDisabled.parentRef = parentRef; res.clipGainDisabled.opacity = await cgf.evaluate((el) => getComputedStyle(el).opacity); }
  } else {
    for (const [name, sel] of Object.entries(SEL)) {
      const o = await open(`${TAG}-${name}`); const p = o.page; await p.addStyleTag({ content: 'input[data-c191-nothumb]::-webkit-slider-thumb{opacity:0!important}' });
      if (name === 'groupVol') await setupGroup(p); if (name === 'clipGain') await setupClip(p);
      const f = p.locator(sel).first(); await f.scrollIntoViewIfNeeded();
      const g0 = await geo(f, name); const sb = name === 'pan' ? { x: g0.box.x, y: g0.box.y + g0.box.h / 2 - 8, w: g0.box.w, h: 16 } : g0.box;
      const pc = await chooseParent(p, sb); const pre = path.join(OUT, `${name}-pre.png`); { const cx0 = Math.max(0, sb.x - M), cy0 = Math.max(0, sb.y - M); const crop = { x: cx0, y: cy0, w: sb.x + sb.w + M - cx0, h: sb.y + sb.h + M - cy0 }; await p.screenshot({ path: pre, clip: { x: crop.x, y: crop.y, width: crop.w, height: crop.h } }); var gm = gapMode(pre, crop, sb); } const which = ['left', 'right', 'top', 'bottom'].find((k) => gm && near(pc[k], gm, 8)) || 'none'; const parentRef = which === 'none' ? pc.left : pc[which]; const rec = { parentCands: pc, gapModeRest: gm, parentWhich: which, parentRef };
      rec.rest = await measure(p, f, name, 'rest', g0, parentRef);
      const bb = g0.box; await p.mouse.move(bb.x + bb.w * 0.5, bb.y + bb.h / 2); await p.mouse.down(); await sleep(200);
      rec.pressed = await measure(p, f, name, 'pressed', g0, parentRef); await p.mouse.up(); await sleep(300);
      rec.released = await measure(p, f, name, 'released', g0, parentRef);
      res.controls[name] = rec; await o.ctx.close();
    }
  }
  res.net = net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, auth: n.authHeaders, noise: n.noise }));
  await b.close(); fs.writeFileSync(path.join(OUT, 'press.json'), JSON.stringify(res, null, 1));
  for (const [n, r] of Object.entries(res.controls)) console.log(TAG, n, 'parent', r.parentWhich, JSON.stringify(r.parentRef), 'gapMode', JSON.stringify(r.gapModeRest));
  for (const [n, r] of Object.entries(res.controls)) for (const s of ['rest', 'pressed', 'drag', 'released', 'keyboard', 'keyboardLow', 'restLow']) { const v = r[s]; if (!v) continue;
    const ol = n === 'pan' && v.reset ? `${v.reset.beforeOutline}` : `${v.outline}`; console.log(TAG, n.padEnd(8), s.padEnd(11), 'fv', String(v.fv).padEnd(5), 'val', v.value, '| ol', ol.slice(0, 34), '| sh', v.boxShadow.slice(0, 22), '| thumb', v.thumb && `${v.thumb.w}x${v.thumb.h} cx${v.thumb.cxCss}`, 'mean', JSON.stringify(v.thumbMean), '| gapBad', v.gapBad, '/', v.gapPx, 'atThumb', v.gapBadAtThumbX, '| ring', v.ringBrass, '/', v.ringPx, '| outer', v.outerBrass, '| inBox', v.insideBrassOffTrack, '| bands', JSON.stringify(v.colBands), '| minGapRun', v.minGapRunDev, 'ringCols', v.ringColsFrac, '| thumbOut', v.thumbOutsideStadium, '| fillΔ', v.fillEndMinusThumbCentre ?? '-'); }
  if (res.clipGainDisabled) { const v = res.clipGainDisabled; console.log(TAG, 'clipGain disabled', v.disabled, 'op', v.opacity, 'val', v.value, 'fill', v.fill, 'fillEdge', JSON.stringify(v.fillEdge), 'thumb', JSON.stringify(v.thumbMean)); }
  console.log('net', JSON.stringify(res.net.map((n) => [n.label, n.errors.length, n.hydration.length, n.forbidden.length, n.auth.length])));
})().catch((e) => { console.error(e); process.exit(1); });
