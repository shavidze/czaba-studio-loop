// C round 202 — focus helpers (store focus ring). Own code; png decoder copied from c-round-200/tools/png.cjs.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const { decode } = require('./png.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ROOT = path.join(__dirname, '..');
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|DevTools/i;

const launch = () => chromium.launch({ headless: true, args: ['--disable-lcd-text'] });

async function newPage(browser, W, H, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  const log = { errors: [], noise: 0, authHeaders: [] };
  page.on('console', (m) => { if (m.type() === 'error') { if (NOISE.test(m.text())) log.noise++; else log.errors.push(m.text().slice(0, 200)); } });
  page.on('pageerror', (e) => log.errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('request', (q) => { if (q.headers().authorization) log.authHeaders.push(q.url()); });
  return { ctx, page, log };
}

async function declineCookies(page) {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
}

// In-page: describe an element (styles + effective opacity + box)
function describeFn(el) {
  if (!el || el === document.body || el === document.documentElement) return null;
  const cs = getComputedStyle(el);
  let op = 1; let vis = true; let n = el;
  while (n && n.nodeType === 1) { const c = getComputedStyle(n); op *= parseFloat(c.opacity); if (c.visibility === 'hidden' || c.display === 'none') vis = false; n = n.parentElement; }
  const r = el.getBoundingClientRect();
  const name = (el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent || el.getAttribute('href') || el.id || '').trim().replace(/\s+/g, ' ').slice(0, 50);
  return {
    tag: el.tagName, type: el.getAttribute('type'), name, id: el.id || null,
    fv: el.matches(':focus-visible'),
    os: cs.outlineStyle, ow: cs.outlineWidth, oc: cs.outlineColor, oo: cs.outlineOffset,
    bs: cs.boxShadow, bg: cs.backgroundColor, bc: [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].join('|'), bw: cs.borderTopWidth, radius: cs.borderTopLeftRadius,
    op: +op.toFixed(3), vis, box: [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)],
    focusSource: document.documentElement.getAttribute('data-focus-source'),
  };
}
const describeActive = (page) => page.evaluate((src) => { const f = new Function('el', `return (${src})(el)`); return f(document.activeElement); }, describeFn.toString());
const describeSel = (page, sel) => page.evaluate(([src, s]) => { const f = new Function('el', `return (${src})(el)`); return f(document.querySelector(s)); }, [describeFn.toString(), sel]);

const lum = ([r, g, b]) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const isBrass = ([r, g, b]) => r > 100 && r >= g && g >= b && r - b > 40 && r - g > 12 && r - g < 70;
const med = (arr) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => lum(a) - lum(b)); return s[Math.floor(s.length / 2)]; };

// Compare focused vs unfocused crop around box; count changed brass px per side band (1..5 px outside the box).
function ringStats(fFile, uFile, clip, box) {
  const F = decode(fs.readFileSync(fFile)); const U = decode(fs.readFileSync(uFile));
  const [bx, by, bw, bh] = box; const sides = { top: 0, bottom: 0, left: 0, right: 0 }; const ring = []; const outside = [];
  let changedFar = 0; let changedInside = 0;
  for (let y = 0; y < Math.min(F.h, U.h); y++) for (let x = 0; x < Math.min(F.w, U.w); x++) {
    const X = clip.x + x + 0.5, Y = clip.y + y + 0.5; const f = F.px(x, y), u = U.px(x, y);
    const d = Math.abs(f[0] - u[0]) + Math.abs(f[1] - u[1]) + Math.abs(f[2] - u[2]);
    const inside = X > bx && X < bx + bw && Y > by && Y < by + bh;
    const dx = X < bx ? bx - X : X > bx + bw ? X - bx - bw : 0; const dy = Y < by ? by - Y : Y > by + bh ? Y - by - bh : 0; const dist = Math.max(dx, dy);
    if (inside) { if (d > 24) changedInside++; continue; }
    if (d > 24 && dist > 6) changedFar++;
    if (dist <= 5 && d > 24 && isBrass(f)) {
      ring.push(f); outside.push(u);
      if (Y < by) sides.top++; else if (Y > by + bh) sides.bottom++; else if (X < bx) sides.left++; else sides.right++;
    }
  }
  const rm = med(ring), om = med(outside);
  return { sides, nSides: Object.values(sides).filter((v) => v >= 3).length, ringMed: rm, outsideMed: om, contrast: rm && om ? contrast(rm, om) : null, changedFar, changedInside };
}

function clipFor(box, W, H, m = 8) {
  const x = Math.max(0, Math.floor(box[0] - m)), y = Math.max(0, Math.floor(box[1] - m));
  const width = Math.max(1, Math.min(W - x, Math.ceil(box[2] + 2 * m + 1))), height = Math.max(1, Math.min(H - y, Math.ceil(box[3] + 2 * m + 1)));
  return { x, y, width, height };
}

// Tab sweep: Tab, settle, record focused + crop; blur, settle, record unfocused + crop. Stops on cycle/max.
async function tabSweep(page, dir, W, H, { max = 90, settle = 450, shift = false, label = 'p', crop = true } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const stops = []; const seen = new Map();
  for (let i = 0; i < max; i++) {
    await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
    await sleep(settle);
    const tagId = await page.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; if (!a.dataset.c202) a.dataset.c202 = String(Math.random()).slice(2, 10); return a.dataset.c202; });
    if (!tagId) { stops.push({ i, body: true }); if (stops.filter((s) => s.body).length > 1) break; continue; }
    if (seen.has(tagId)) { stops.push({ i, repeatOf: seen.get(tagId) }); break; }
    seen.set(tagId, i);
    const f = await describeActive(page);
    const rec = { i, cid: tagId, f };
    const vb = f.box; const onScreen = vb[2] > 0 && vb[3] > 0 && vb[1] + vb[3] > 0 && vb[1] < H && vb[0] < W && vb[0] + vb[2] > 0;
    rec.onScreen = onScreen;
    let clip = null;
    if (crop && onScreen) { clip = clipFor(vb, W, H); await page.screenshot({ path: path.join(dir, `${label}-${i}-f.png`), clip }); }
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await sleep(settle);
    rec.u = await describeSel(page, `[data-c202="${tagId}"]`);
    if (crop && onScreen && rec.u) {
      const same = rec.u.box.every((v, k) => Math.abs(v - vb[k]) < 0.6);
      await page.screenshot({ path: path.join(dir, `${label}-${i}-u.png`), clip });
      rec.ring = ringStats(path.join(dir, `${label}-${i}-f.png`), path.join(dir, `${label}-${i}-u.png`), clip, vb);
      rec.ring.boxStable = same;
    }
    // restore sequential focus point: focus the element again via keyboard modality is not possible; Chromium keeps the start point at the blurred element
    stops.push(rec);
  }
  return stops;
}

function judge(rec) {
  if (!rec || !rec.f) return null;
  const f = rec.f, u = rec.u || {};
  const issues = [];
  if (f.os !== 'solid') issues.push('outline-style ' + f.os);
  if (!(parseFloat(f.ow) >= 1)) issues.push('outline-width ' + f.ow);
  if (!/0\.788|201, 164, 106/.test(f.oc)) issues.push('outline-color ' + f.oc);
  if (!(f.oo === '2px' || f.oo === '-2px')) issues.push('offset ' + f.oo);
  if (u.bs !== undefined && f.bs !== u.bs) issues.push('box-shadow changed');
  if (u.bg !== undefined && f.bg !== u.bg) issues.push('bg changed');
  if (u.bc !== undefined && f.bc !== u.bc) issues.push('border changed');
  if (f.op < 0.99) issues.push('effective opacity ' + f.op);
  if (rec.ring && rec.onScreen && rec.ring.nSides < 3) issues.push('ring sides ' + rec.ring.nSides);
  if (rec.ring && rec.ring.contrast !== null && rec.ring.contrast < 3) issues.push('contrast ' + rec.ring.contrast);
  return issues;
}

function save(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 1)); }
module.exports = { launch, newPage, declineCookies, describeActive, describeSel, describeFn, tabSweep, ringStats, clipFor, judge, save, sleep, contrast, isBrass, ROOT };
