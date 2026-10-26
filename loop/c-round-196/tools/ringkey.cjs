// C round 196 — RING-KEY probe. node ringkey.cjs <port> <W> [noshots]
// Tab from the top of /studio-lab through every focusable (then Shift+Tab back). For each: computed outline/box-shadow/bg/border + box, focused vs unfocused.
// Pixel check: focused vs unfocused clip of the same element; changed pixels = ring.
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720; const SHOTS = process.argv[4] !== 'noshots';
const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'ringkey', TAG); fs.mkdirSync(OUT, { recursive: true });
const sleep = L.sleep;
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const desc = () => {
  const el = document.activeElement; if (!el || el === document.body) return null;
  const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
  const id = el.dataset.testid || el.getAttribute('aria-label') || el.getAttribute('role') || el.tagName;
  return { id, tag: el.tagName, testid: el.dataset.testid || null, label: el.getAttribute('aria-label'), role: el.getAttribute('role'), text: (el.textContent || '').trim().slice(0, 40),
    box: { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }, fv: el.matches(':focus-visible'),
    ow: c.outlineWidth, os: c.outlineStyle, oc: c.outlineColor, oo: c.outlineOffset, bs: c.boxShadow, bg: c.backgroundColor, bc: [c.borderTopColor, c.borderRightColor, c.borderBottomColor, c.borderLeftColor].join('|'), radius: c.borderTopLeftRadius,
    fs: document.documentElement.dataset.focusSource || null, inset: c.getPropertyValue('--focus-offset').trim() || null };
};
const unfocusedOf = (i) => { const el = window.__c196[i]; const r = el.getBoundingClientRect(); const c = getComputedStyle(el);
  return { box: { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }, os: c.outlineStyle, ow: c.outlineWidth, bs: c.boxShadow, bg: c.backgroundColor, bc: [c.borderTopColor, c.borderRightColor, c.borderBottomColor, c.borderLeftColor].join('|') }; };
function analyse(fa, fb, clip, box, offset) {
  const A = decode(fs.readFileSync(fa)), B = decode(fs.readFileSync(fb)); const s = 2;
  let changed = 0, inBand = 0, outBand = 0; const ringC = [], outsideC = [];
  // band: outline drawn from edge+offset to edge+offset+1 css px (computed width 1px). We accept edge+offset-0.5 .. edge+offset+2.
  const dist = (xc, yc) => { // signed distance outside the box rectangle (Chebyshev-ish, rectangle)
    const dx = Math.max(box.x - xc, 0, xc - (box.x + box.w)); const dy = Math.max(box.y - yc, 0, yc - (box.y + box.h));
    if (dx === 0 && dy === 0) return -Math.min(xc - box.x, box.x + box.w - xc, yc - box.y, box.y + box.h - yc);
    return Math.max(dx, dy);
  };
  const lo = offset - 0.5, hi = offset + 2.0;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
    const a = A.px(x, y), b = B.px(x, y); const d = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
    const xc = clip.x + (x + 0.5) / s, yc = clip.y + (y + 0.5) / s; const dd = dist(xc, yc);
    if (d > 24) { changed++; if (dd >= lo && dd <= hi) { inBand++; ringC.push(a); } else outBand++; }
  }
  // outside pixel: 1 device px beyond the band (default) / 1 device px inside the band (inset), unchanged pixels at dd = offset+1.25..1.75 (default) or offset-0.75..-0.25
  const oLo = offset >= 0 ? offset + 1.25 : offset - 1.0, oHi = offset >= 0 ? offset + 1.75 : offset - 0.5;
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const xc = clip.x + (x + 0.5) / s, yc = clip.y + (y + 0.5) / s; const dd = dist(xc, yc); if (dd >= oLo && dd <= oHi) { const a = A.px(x, y), b = B.px(x, y); if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= 24) outsideC.push(a); } }
  const med = (arr) => { if (!arr.length) return null; const k = [0, 1, 2].map((i) => arr.map((c) => c[i]).sort((p, q) => p - q)[arr.length >> 1]); return k; };
  const rc = med(ringC), oc = med(outsideC);
  // per-side presence of ring pixels
  const sides = { t: 0, b: 0, l: 0, r: 0 };
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const a = A.px(x, y), b = B.px(x, y); if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) <= 24) continue; const xc = clip.x + (x + 0.5) / s, yc = clip.y + (y + 0.5) / s; const dd = dist(xc, yc); if (dd < lo || dd > hi) continue;
    if (xc > box.x + 3 && xc < box.x + box.w - 3) { if (yc < box.y + box.h / 2) sides.t++; else sides.b++; } if (yc > box.y + 3 && yc < box.y + box.h - 3) { if (xc < box.x + box.w / 2) sides.l++; else sides.r++; } }
  return { changed, inBand, outBand, ringMed: rc, outsideMed: oc, contrast: rc && oc ? +cr(rc, oc).toFixed(2) : null, sides };
}
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, TAG, net, { deviceScaleFactor: 2 });
  await page.evaluate(() => { window.__c196 = []; });
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
  const rows = []; let first = null;
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab'); await sleep(120);
    const d = await page.evaluate(desc); if (!d) { rows.push({ i, id: '(body)' }); continue; }
    const key = `${d.id}|${Math.round(d.box.x)}|${Math.round(d.box.y)}`;
    if (first && key === first && i > 3) break; if (!first) first = key;
    d.i = i; await page.evaluate((i) => { window.__c196[i] = document.activeElement; }, i);
    if (SHOTS && d.box.w > 0 && d.box.h > 0 && d.box.x >= 0 && d.box.y >= 0 && d.box.x + d.box.w <= W && d.box.y + d.box.h <= H) {
      const m = 6; const clip = { x: Math.max(0, Math.floor(d.box.x - m)), y: Math.max(0, Math.floor(d.box.y - m)) }; clip.width = Math.min(W - clip.x, Math.ceil(d.box.w + 2 * m + 1)); clip.height = Math.min(H - clip.y, Math.ceil(d.box.h + 2 * m + 1));
      const fa = path.join(OUT, `f${i}.png`), fb = path.join(OUT, `u${i}.png`);
      await page.screenshot({ path: fa, clip });
      await page.evaluate(() => document.activeElement.blur()); await sleep(80);
      d.unfocused = await page.evaluate(unfocusedOf, i);
      await page.screenshot({ path: fb, clip });
      await page.evaluate((i) => window.__c196[i].focus({ preventScroll: true }), i); await sleep(80);
      d.refocusFv = await page.evaluate(() => document.activeElement && document.activeElement.matches(':focus-visible'));
      const off = parseFloat(d.oo) || 0; d.px = analyse(fa, fb, { x: clip.x, y: clip.y }, d.box, off);
    } else if (SHOTS) { d.px = 'offscreen'; await page.evaluate(() => document.activeElement.blur()); d.unfocused = await page.evaluate(unfocusedOf, i); await page.evaluate((i) => window.__c196[i].focus({ preventScroll: true }), i); }
    rows.push(d);
  }
  // Shift+Tab back: sequence of ids
  const back = []; for (let i = 0; i < rows.length + 2; i++) { await page.keyboard.press('Shift+Tab'); await sleep(80); const d = await page.evaluate(desc); back.push(d ? `${d.id}|${Math.round(d.box.x)}|${Math.round(d.box.y)}` : '(body)'); }
  L.save(OUT, 'result.json', { W, PORT, rows, back, net: log });
  console.log(TAG, 'stops', rows.length, 'errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
