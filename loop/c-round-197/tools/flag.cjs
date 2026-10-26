// C round 197 — FLAG-RING-197 probe. node flag.cjs <port> <W>
// Selected (Marker 1 just added) and unselected (Marker 2 added at ~8 s, Tab back to Marker 1).
// Per side: ring band (geometry from computed outline-offset/width), outer and inner neighbour device px,
// min contrast over the whole side, changed px focused vs unfocused, background gap to the pill border.
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const { decode } = require('./png.cjs'); const { cr } = require('./rk-lib.cjs');
const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'flag', TAG); fs.mkdirSync(OUT, { recursive: true });
const S = 2;
const geom = (time) => {
  const b = [...document.querySelectorAll('[data-testid=arrangement-marker]')].find((x) => x.dataset.markerTime === time);
  const r = (e) => { if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; };
  const c = getComputedStyle(b); const stem = b.querySelector('span[aria-hidden=true]'); const pill = b.querySelector('[data-marker-label]');
  const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
  const ls = document.querySelector('[data-testid=arrangement-loop-strip]');
  const cx = r(b).x + r(b).w / 2, by = r(b).y + r(b).h - 0.5;
  const hit = document.elementFromPoint(cx, by);
  return { btn: r(b), pill: r(pill), stem: r(stem), loop: r(ls), stemBg: getComputedStyle(stem).backgroundColor, pillBorder: getComputedStyle(pill).borderTopColor,
    selected: b.getAttribute('aria-current') === 'true', active: document.activeElement === b, fv: b.matches(':focus-visible'),
    ow: c.outlineWidth, os: c.outlineStyle, oc: c.outlineColor, oo: c.outlineOffset, bs: c.boxShadow, bg: c.backgroundColor, bc: [c.borderTopColor, c.borderRightColor, c.borderBottomColor, c.borderLeftColor].join('|'),
    iso: c.isolation, z: getComputedStyle(stem).zIndex, cls: b.className, scrollLeft: sc.scrollLeft, scrollTop: sc.scrollTop, spt: getComputedStyle(sc).scrollPaddingTop,
    hitBottomIsBtn: !!hit && (hit === b || b.contains(hit)), fs: document.documentElement.dataset.focusSource || null, label: b.getAttribute('aria-label') };
};
async function tabTo(page, time) {
  await page.mouse.move(W - 2, H - 2); await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab'); await sleep(40);
    const ok = await page.evaluate((t) => { const a = document.activeElement; return !!a && a.dataset.testid === 'arrangement-marker' && a.dataset.markerTime === t; }, time);
    if (ok) return i;
  }
  return -1;
}
function sideAnalysis(F, U, clip, g) {
  // device coordinates relative to the clip image
  const dx = (x) => Math.round((x - clip.x) * S), dy = (y) => Math.round((y - clip.y) * S);
  const oo = parseFloat(g.oo) || 0, ow = parseFloat(g.ow) || 0;
  const b = g.btn, p = g.pill;
  // ring band in CSS from the border edge: [-(oo+ow) ... -oo] outward when oo<0 → inside band [edge+oo... ] ; general: outer edge = edge + oo + ow outward
  const outerOut = oo + ow; // distance of ring outer edge outside the border box (CSS)
  const ringPx = Math.round(ow * S); // device px thickness
  const L0 = dx(b.x) - Math.round(outerOut * S), R0 = dx(b.x + b.w) + Math.round(outerOut * S) - 1;
  const T0 = dy(b.y) - Math.round(outerOut * S), B0 = dy(b.y + b.h) + Math.round(outerOut * S) - 1;
  const res = {};
  const diff = (a, c) => Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]);
  const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  const pillT = dy(p.y), pillB = dy(p.y + p.h) - 1, pillL = dx(p.x), pillR = dx(p.x + p.w) - 1;
  const sides = {
    top: { along: [L0 + 6, R0 - 6], ring: (k, a) => [a, T0 + k], outer: (a) => [a, T0 - 1], inner: (a) => [a, T0 + ringPx], gap: () => pillT - (T0 + ringPx) },
    bottom: { along: [L0 + 6, R0 - 6], ring: (k, a) => [a, B0 - k], outer: (a) => [a, B0 + 1], inner: (a) => [a, B0 - ringPx], gap: () => (B0 - ringPx) - pillB },
    left: { along: [T0 + 6, B0 - 6], ring: (k, a) => [L0 + k, a], outer: (a) => [L0 - 1, a], inner: (a) => [L0 + ringPx, a], gap: () => pillL - (L0 + ringPx) },
    right: { along: [T0 + 6, B0 - 6], ring: (k, a) => [R0 - k, a], outer: (a) => [R0 + 1, a], inner: (a) => [R0 - ringPx, a], gap: () => (R0 - ringPx) - pillR },
  };
  for (const [name, s] of Object.entries(sides)) {
    let n = 0, changed = 0, minOut = 99, minIn = 99; const ringCols = {}, outCols = {}, inCols = {};
    for (let a = s.along[0]; a <= s.along[1]; a++) {
      for (let k = 0; k < ringPx; k++) {
        const [x, y] = s.ring(k, a); if (x < 0 || y < 0 || x >= F.w || y >= F.h) continue;
        const f = F.px(x, y), u = U.px(x, y); n++; if (diff(f, u) > 24) changed++;
        const [ox, oy] = s.outer(a), [ix, iy] = s.inner(a);
        const o = F.px(ox, oy), i = F.px(ix, iy);
        const co = cr(f, o), ci = cr(f, i); if (co < minOut) minOut = co; if (ci < minIn) minIn = ci;
        ringCols[hex(f)] = (ringCols[hex(f)] || 0) + 1; outCols[hex(o)] = (outCols[hex(o)] || 0) + 1; inCols[hex(i)] = (inCols[hex(i)] || 0) + 1;
      }
    }
    const top = (o) => Object.entries(o).sort((x, y) => y[1] - x[1]).slice(0, 3);
    res[name] = { ringPx: n, changed, minOutCR: +minOut.toFixed(2), minInCR: +minIn.toFixed(2), gapDevicePx: s.gap(), ringColours: top(ringCols), outerColours: top(outCols), innerColours: top(inCols) };
  }
  // changed px outside the flag box (ring outer bounds)
  let outside = 0, total = 0;
  for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) { const d = diff(F.px(x, y), U.px(x, y)); if (d > 24) { total++; if (x < L0 || x > R0 || y < T0 || y > B0) outside++; } }
  res.changedTotal = total; res.changedOutsideRingBox = outside; res.band = { L0, R0, T0, B0, ringPx, pill: [pillL, pillT, pillR, pillB] };
  return res;
}
async function capture(page, time, name) {
  const g = await page.evaluate(geom, time);
  const m = 8; const clip = { x: Math.floor(g.btn.x - m), y: Math.floor(g.btn.y - m), width: Math.ceil(g.btn.w + 2 * m), height: Math.ceil(g.btn.h + 2 * m) };
  const fa = path.join(OUT, `${name}-focused.png`), fb = path.join(OUT, `${name}-unfocused.png`);
  await sleep(150); await page.screenshot({ path: fa, clip });
  await page.screenshot({ path: path.join(OUT, `${name}-context.png`), clip: { x: Math.max(0, clip.x - 60), y: Math.max(0, clip.y - 40), width: clip.width + 160, height: clip.height + 80 } });
  await page.evaluate(() => document.activeElement.blur()); await sleep(150);
  const gu = await page.evaluate(geom, time);
  await page.screenshot({ path: fb, clip });
  const r = sideAnalysis(decode(fs.readFileSync(fa)), decode(fs.readFileSync(fb)), clip, g);
  const same = ['bs', 'bg', 'bc'].every((k) => g[k] === gu[k]) && JSON.stringify(g.btn) === JSON.stringify(gu.btn);
  return { g, gu: { os: gu.os, bs: gu.bs, bg: gu.bg, bc: gu.bc, btn: gu.btn }, unfocusedEqual: same, clip, sides: r };
}
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `flag-${TAG}`, net, { deviceScaleFactor: 2 });
  const out = { W, PORT, engine: browser.version() };
  out.load = await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return { st: sc.scrollTop, sl: sc.scrollLeft, spt: getComputedStyle(sc).scrollPaddingTop }; });
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
  await page.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft = 0; });
  out.tabSel = await tabTo(page, '0.000');
  out.selected = await capture(page, '0.000', 'sel');
  // unselected: second marker at ~8 s
  await L.seekTo(page, 8); await sleep(300);
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
  await page.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft = 0; }); await sleep(200);
  out.markers = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((b) => ({ t: b.dataset.markerTime, cur: b.getAttribute('aria-current') })));
  out.tabUnsel = await tabTo(page, '0.000');
  out.unselected = await capture(page, '0.000', 'unsel');
  out.net = log;
  L.save(OUT, 'result.json', out);
  const sum = (c) => Object.fromEntries(Object.entries(c.sides).filter(([k]) => ['top', 'bottom', 'left', 'right'].includes(k)).map(([k, v]) => [k, `${v.changed}/${v.ringPx} out${v.minOutCR} in${v.minInCR} gap${v.gapDevicePx}`]));
  console.log(TAG, 'tab', out.tabSel, out.tabUnsel, JSON.stringify(out.markers));
  for (const k of ['selected', 'unselected']) { const c = out[k]; console.log(k, c.g.selected, 'ow', c.g.ow, 'oo', c.g.oo, 'btn', JSON.stringify(c.g.btn), 'pill', JSON.stringify(c.g.pill), 'loop', JSON.stringify(c.g.loop), 'sl', c.g.scrollLeft, 'hitB', c.g.hitBottomIsBtn, 'eq', c.unfocusedEqual, 'outsideChanged', c.sides.changedOutsideRingBox, JSON.stringify(sum(c))); }
  console.log('errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
