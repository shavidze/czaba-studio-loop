const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const L = require('./lib197.cjs');

function decodePng(buf) {
  let p = 8;
  let w = 0;
  let h = 0;
  let ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    const d = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      w = d.readUInt32BE(0);
      h = d.readUInt32BE(4);
      ct = d[9];
    }
    if (type === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v0 = raw[y * (stride + 1) + 1 + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let v = v0;
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const pp = a + b - c;
        const pa = Math.abs(pp - a);
        const pb = Math.abs(pp - b);
        const pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { w, h, px: (x, y) => { const i = y * stride + x * bpp; return [out[i], out[i + 1], out[i + 2]]; } };
}

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const la = lum(a); const lb = lum(b); return +((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)).toFixed(2); };
const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;

const W = +(process.argv[2] || 1440);
const PAD = 4;

async function rects(page, index) {
  return page.evaluate((i) => {
    const flag = document.querySelectorAll('[data-testid=arrangement-marker]')[i];
    const label = flag.querySelector('[data-marker-label]');
    const loop = document.querySelector('[data-testid=arrangement-loop-strip]');
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; };
    const cs = getComputedStyle(flag);
    return { flag: r(flag), label: r(label), loop: r(loop), selected: flag.getAttribute('aria-current') === 'true', name: flag.getAttribute('data-marker-label') ?? label.textContent, ow: cs.outlineWidth, os: cs.outlineStyle, oo: cs.outlineOffset, oc: cs.outlineColor, bs: cs.boxShadow, bg: cs.backgroundColor, bc: cs.borderColor, fv: flag.matches(':focus-visible'), active: document.activeElement === flag };
  }, index);
}

async function tabTo(page, index) {
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    await L.sleep(60);
    const hit = await page.evaluate((k) => document.activeElement === document.querySelectorAll('[data-testid=arrangement-marker]')[k], index);
    if (hit) return i + 1;
  }
  return -1;
}

function analyse(focusedPng, restPng, g) {
  const F = decodePng(focusedPng);
  const R = decodePng(restPng);
  const dpr = 2;
  const ox = (g.flag.x - PAD) * dpr;
  const oy = (g.flag.y - PAD) * dpr;
  const fx0 = Math.round(g.flag.x * dpr - ox);
  const fy0 = Math.round(g.flag.y * dpr - oy);
  const fx1 = Math.round((g.flag.x + g.flag.w) * dpr - ox);
  const fy1 = Math.round((g.flag.y + g.flag.h) * dpr - oy);
  const lx0 = Math.round(g.label.x * dpr - ox);
  const ly0 = Math.round(g.label.y * dpr - oy);
  const lx1 = Math.round((g.label.x + g.label.w) * dpr - ox);
  const ly1 = Math.round((g.label.y + g.label.h) * dpr - oy);
  const changed = (x, y) => !same(F.px(x, y), R.px(x, y));
  let total = 0;
  for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) if (changed(x, y)) total++;
  const midX = Math.round((lx0 + lx1) / 2);
  const midY = Math.round((fy0 + fy1) / 2);
  const band = (coords) => coords.filter(([x, y]) => changed(x, y));
  const sides = {};
  const col = (x, ya, yb) => { const o = []; for (let y = ya; y < yb; y++) o.push([x, y]); return o; };
  const row = (y, xa, xb) => { const o = []; for (let x = xa; x < xb; x++) o.push([x, y]); return o; };
  const scan = {
    top: col(midX, fy0 - 6, ly0 + 2),
    bottom: col(midX, ly1 - 2, fy1 + 6).reverse(),
    left: row(midY, fx0 - 6, lx0 + 2),
    right: row(midY, lx1 - 2, fx1 + 6).reverse(),
  };
  for (const [side, line] of Object.entries(scan)) {
    const ring = band(line);
    if (ring.length === 0) { sides[side] = { ring: 0 }; continue; }
    const first = line.findIndex(([x, y]) => changed(x, y));
    let last = first;
    while (last + 1 < line.length && changed(...line[last + 1])) last++;
    const outer = line[first - 1];
    const inner = line[last + 1];
    const ringPx = F.px(...line[first]);
    const ringPxLast = F.px(...line[last]);
    const outerPx = F.px(...outer);
    const innerPx = F.px(...inner);
    let gap = 0;
    const borderEdge = side === 'top' ? ly0 : side === 'bottom' ? ly1 - 1 : side === 'left' ? lx0 : lx1 - 1;
    for (let k = last + 1; k < line.length; k++) {
      const [x, y] = line[k];
      const coord = side === 'top' || side === 'bottom' ? y : x;
      if (coord === borderEdge) break;
      gap++;
    }
    sides[side] = {
      ringDevicePx: last - first + 1,
      ringAt: line[first],
      ring: hex(ringPx),
      ringLast: hex(ringPxLast),
      outer: hex(outerPx),
      inner: hex(innerPx),
      vsOuter: Math.min(ratio(ringPx, outerPx), ratio(ringPxLast, outerPx)),
      vsInner: Math.min(ratio(ringPx, innerPx), ratio(ringPxLast, innerPx)),
      gapDevicePxToPillBorder: gap,
      innerIsPillBorder: same(innerPx, F.px(...(side === 'top' ? [midX, ly0] : side === 'bottom' ? [midX, ly1 - 1] : side === 'left' ? [lx0, midY] : [lx1 - 1, midY]))),
    };
  }
  let outsideFlag = 0;
  for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) if (changed(x, y) && (x < fx0 || x >= fx1 || y < fy0 || y >= fy1)) outsideFlag++;
  const loopTop = Math.round(g.loop.y * dpr - oy);
  return { changedTotal: total, changedOutsideFlagBox: outsideFlag, flagDevice: { fx0, fy0, fx1, fy1 }, labelDevice: { lx0, ly0, lx1, ly1 }, loopTopDevice: loopTop, sides };
}

async function capture(page, g, tag) {
  const clip = { x: g.flag.x - PAD, y: g.flag.y - PAD, width: g.flag.w + PAD * 2, height: g.flag.h + PAD * 2 };
  const buf = await page.screenshot({ clip });
  fs.writeFileSync(path.join(L.OUT, 'flag', `${tag}.png`), buf);
  return buf;
}

(async () => {
  fs.mkdirSync(path.join(L.OUT, 'flag'), { recursive: true });
  const { browser, page, log } = await L.openStudio(W);
  await page.click('[data-testid=arrangement-marker-add]');
  await L.sleep(500);
  if ((await page.$$('[data-testid=arrangement-marker]')).length === 0) {
    await page.keyboard.press('Enter');
    await L.sleep(500);
  }
  const results = {};
  for (const state of ['selected', 'unselected']) {
    if (state === 'unselected') {
      const ruler = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
      await page.mouse.click(ruler.x + ruler.w * 0.5, ruler.y + ruler.h / 2);
      await L.sleep(400);
      await page.click('[data-testid=arrangement-marker-add]');
      await L.sleep(500);
      if ((await page.$$('[data-testid=arrangement-marker]')).length < 2) {
        await page.keyboard.press('Enter');
        await L.sleep(500);
      }
    }
    await page.mouse.move(W - 2, 2);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const scrollLeftBefore = await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const v = sc.scrollLeft; sc.scrollLeft = 0; return v; });
    await L.sleep(250);
    const rest = await rects(page, 0);
    const restPng = await capture(page, rest, `${W}-${state}-rest`);
    const tabs = await tabTo(page, 0);
    await L.sleep(250);
    const focused = await rects(page, 0);
    const focusedPng = await capture(page, rest, `${W}-${state}-focused`);
    results[state] = { scrollLeftBefore, scrollLeftAfterTab: await page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft), tabs, rest, focused, analysis: analyse(focusedPng, restPng, rest) };
  }
  L.save(`flag-ring-${W}.json`, { W, results, log });
  for (const [state, r] of Object.entries(results)) {
    console.log(W, state, 'scrollLeft', r.scrollLeftBefore, '->', r.scrollLeftAfterTab, 'selected=', r.focused.selected, 'tabs', r.tabs, 'fv', r.focused.fv, r.focused.ow, r.focused.oo, 'flag', JSON.stringify(r.rest.flag), 'changed', r.analysis.changedTotal, 'outsideBox', r.analysis.changedOutsideFlagBox);
    for (const [side, s] of Object.entries(r.analysis.sides)) console.log('  ', side, JSON.stringify(s));
  }
  console.log('errors', log.errors.length, 'console', log.console.length);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
