// C round 150 — FIELD-BOUNDARY (DUX-B-3) pixel check + pending/focus border states + Overview playhead halo (STATE-DISTINCT). node c150f.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const TAG = process.argv[3] || '';
const net = []; const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c150f-${W}${TAG}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
// Decode a PNG once in a scratch page and return a reader.
async function decoder(ctx, png) {
  const pg = await ctx.newPage(); await pg.goto('about:blank');
  await pg.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); window.__g = g; }, png.toString('base64'));
  const read = (pts) => pg.evaluate((pts) => pts.map(([x, y]) => { const d = window.__g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2]]; }), pts);
  return { read, close: () => pg.close() };
}
const median = (arr) => { const k = (c) => lum(c); const s = [...arr].sort((a, b) => k(a) - k(b)); return s[Math.floor(s.length / 2)]; };
const FIELDS = ['arrangement-tempo-input', 'arrangement-library-search', 'arrangement-detail-start', 'arrangement-detail-end', 'arrangement-detail-clip-gain-input'];
const fieldInfo = (tid) => {
  const e = document.querySelector(`[data-testid="${tid}"]`); if (!e) return { tid, missing: true };
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const g = cvs.getContext('2d', { willReadFrequently: true });
  const a = (s) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1); return g.getImageData(0, 0, 1, 1).data[3] / 255; };
  const chain = []; let parentBg = null; for (let n = e.parentElement; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const tid2 = n.getAttribute('data-testid') || n.tagName.toLowerCase(); chain.push({ el: tid2, cls: (typeof n.className === 'string' ? n.className : '').slice(0, 80), bg: c }); if (a(c) >= 1) { parentBg = c; break; } }
  const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
  return { tid, disabled: e.disabled, cls: e.className, borderTopColor: cs.borderTopColor, borderLeftColor: cs.borderLeftColor, borderWidth: cs.borderTopWidth, fill: cs.backgroundColor, parentBg, chain, box: [b.x, b.y, b.width, b.height] };
};
async function measureFields(p, ctx, label) {
  await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
  const infos = []; for (const t of FIELDS) infos.push(await p.evaluate(fieldInfo, t));
  const png = await p.screenshot(); const D = await decoder(ctx, png); const out = [];
  for (const f of infos) {
    if (f.missing) { out.push(f); continue; }
    const [x, y, w, h] = f.box;
    if (x + w <= 0 || y + h <= 0 || x >= W) { out.push({ ...f, offscreen: true }); continue; }
    const xs = []; for (let xx = Math.ceil(x) + 4; xx <= Math.floor(x + w) - 5; xx += 2) xs.push(xx);
    const ys = []; for (let yy = Math.ceil(y) + 3; yy <= Math.floor(y + h) - 4; yy += 1) ys.push(yy);
    const rowAt = async (yy) => median(await D.read(xs.map((xx) => [xx, yy])));
    const colAt = async (xx) => median(await D.read(ys.map((yy) => [xx, yy])));
    const y0 = Math.floor(y), x0 = Math.floor(x), yb = Math.ceil(y + h) - 1, xr = Math.ceil(x + w) - 1;
    const prof = { top: {}, left: {}, bottom: {}, right: {} };
    for (const d of [-3, -2, -1, 0, 1, 2, 3]) { prof.top[d] = await rowAt(y0 + d); prof.left[d] = await colAt(x0 + d); prof.bottom[d] = await rowAt(yb + d); prof.right[d] = await colAt(xr + d); }
    const edge = (P, outside, inside) => { const o = P[outside]; const ins = P[inside]; let best = null; for (const d of [-1, 0, 1]) { const r = ratio(P[d], o); if (!best || r > best.r) best = { d, px: P[d], r }; } return { borderPx: best.px, offset: best.d, outsidePx: o, insidePx: ins, borderVsOutside: best.r, borderVsInside: ratio(best.px, ins) }; };
    const e = { top: edge(prof.top, -3, 3), left: edge(prof.left, -3, 3), bottom: edge(prof.bottom, 3, -3), right: edge(prof.right, 3, -3) };
    out.push({ ...f, pixel: e, minBorderVsOutside: Math.min(...Object.values(e).map((v) => v.borderVsOutside)), minBorderVsInside: Math.min(...Object.values(e).map((v) => v.borderVsInside)), profile: prof });
    const shot = `c-round-150/shots/FB-${label}-${f.tid.replace('arrangement-', '')}-${W}.png`;
    await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip: { x: Math.max(0, x - 20), y: Math.max(0, y - 12), width: Math.min(W - Math.max(0, x - 20), w + 40), height: h + 24 } });
    out[out.length - 1].shot = shot;
  }
  await D.close(); return out;
}
(async () => {
  const b = await L.launch();
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c150f-${W}${TAG}`, net);
    await p.mouse.move(2, 2); await sleep(300);
    await sec('start', async () => ({ snap: await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap), demoBadge: await p.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required')) }));
    await sec('fieldsS0', async () => measureFields(p, ctx, 'S0'));
    await sec('setup', async () => {
      const s = [];
      s.push(await L.setSnapOff(p));
      s.push((await L.addAt(p, 'demo-hero-music', 'music', 0)).status);
      s.push((await L.addAt(p, 'demo-stem-pulse', 'stems', 2)).status);
      s.push((await L.addAt(p, 'demo-soft-impact', 'sfx', 4)).status);
      const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id; await L.selectClip(p, sfx);
      s.push({ detailToggleWas: await X.openDetail(p) });
      s.push((await L.detailInfo(p)).text);
      return s;
    });
    await sec('fieldsS1', async () => measureFields(p, ctx, 'S1'));
    await sec('pendingClipGain', async () => {
      const sel = '[data-testid=arrangement-detail-clip-gain-input]';
      const before = await p.evaluate((s) => { const e = document.querySelector(s); return { value: e.value, cls: e.className, border: getComputedStyle(e).borderTopColor }; }, sel);
      await p.click(sel, { clickCount: 3 }); await sleep(150); await p.keyboard.type('3'); await sleep(300);
      const pending = await p.evaluate((s) => { const e = document.querySelector(s); return { value: e.value, cls: e.className, tokens: e.className.split(/\s+/), border: getComputedStyle(e).borderTopColor, warningVar: getComputedStyle(e).getPropertyValue('--color-warning').trim() }; }, sel);
      const shot = 'c-round-150/shots/FB-pending-clipgain-' + W + '.png'; const bb = await p.locator(sel).boundingBox(); await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip: { x: Math.max(0, bb.x - 40), y: bb.y - 14, width: bb.width + 80, height: bb.height + 28 } });
      await p.keyboard.press('Escape'); await sleep(300);
      const after = await p.evaluate((s) => { const e = document.querySelector(s); return { value: e.value, cls: e.className, border: getComputedStyle(e).borderTopColor }; }, sel);
      await L.blur(p);
      return { before, pending, after, hasWarning: pending.tokens.includes('border-warning'), hasOutlineStrong: pending.tokens.includes('border-outline-strong'), shot };
    });
    await sec('searchFocus', async () => {
      const sel = '[data-testid=arrangement-library-search]';
      await p.focus(sel); await sleep(250);
      const r = await p.evaluate((s) => { const e = document.querySelector(s); return { focused: document.activeElement === e, border: getComputedStyle(e).borderTopColor, brandVar: getComputedStyle(e).getPropertyValue('--color-brand').trim() }; }, sel);
      const shot = 'c-round-150/shots/FB-search-focus-' + W + '.png'; const bb = await p.locator(sel).boundingBox(); await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip: { x: Math.max(0, bb.x - 10), y: bb.y - 10, width: bb.width + 20, height: bb.height + 20 } });
      await L.blur(p); await sleep(200);
      const blurred = await p.evaluate((s) => getComputedStyle(document.querySelector(s)).borderTopColor, sel);
      return { ...r, blurred, shot };
    });
    await sec('overview', async () => {
      await p.keyboard.press('Escape'); await sleep(200);
      const out = [];
      for (const t of [1, 3, 10, 30]) {
        await p.evaluate((t) => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const z = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; sc.scrollLeft = Math.max(0, t * z - 200); }, t); await sleep(300); await L.seekTo(p, t); await L.blur(p); await p.mouse.move(2, 2); await sleep(400);
        const g = await p.evaluate(() => { const phE = document.querySelector('[data-testid=arrangement-overview-playhead]'); const ph = phE.getBoundingClientRect(); const ov = document.querySelector('[data-testid=arrangement-overview]').getBoundingClientRect(); const bars = [...document.querySelectorAll('[data-testid=arrangement-overview] *')].filter((e) => /\bbg-(brand|dim)/.test(typeof e.className === 'string' ? e.className : '')).map((e) => { const r = e.getBoundingClientRect(); return { cls: e.className.match(/bg-[a-z/0-9-]+/g), x: r.x, y: r.y, w: r.width, h: r.height, bg: getComputedStyle(e).backgroundColor }; }); const cs = getComputedStyle(phE); return { ph: ph.toJSON(), phBg: cs.backgroundColor, phShadow: cs.boxShadow, phCls: phE.className, ov: ov.toJSON(), floor: getComputedStyle(document.querySelector('[data-testid=arrangement-overview]')).backgroundColor, bars, pos: Number(document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow')) }; });
        const cx = g.ph.x + g.ph.width / 2;
        const under = g.bars.filter((bb) => cx >= bb.x + 6 && cx <= bb.x + bb.w - 6 && bb.w > 0 && bb.h > 0 && /bg-brand\b/.test(bb.cls.join(' ')) && !/bg-brand\//.test(bb.cls.join(' ')));
        const png = await p.screenshot(); const D = await decoder(ctx, png);
        const xs = []; for (let d = -6; d <= 6; d++) xs.push(Math.floor(g.ph.x) + d);
        const runs = [];
        for (const bb of under) { const y = Math.round(bb.y + bb.h / 2); runs.push({ where: 'bar', y, px: await D.read(xs.map((xx) => [xx, y])) }); }
        const barTops = under.map((bb) => bb.y), barBots = under.map((bb) => bb.y + bb.h);
        const floorYs = [Math.round(g.ov.y + 2), Math.round(g.ov.y + g.ov.height - 3)].filter((y) => !under.some((bb) => y >= bb.y - 1 && y <= bb.y + bb.h + 1));
        for (const y of floorYs) runs.push({ where: 'floor', y, px: await D.read(xs.map((xx) => [xx, y])) });
        await D.close();
        const analysed = runs.map((r) => {
          const lineIdx = r.px.map((c, i) => ({ i, d: Math.abs(c[0] - 201) + Math.abs(c[1] - 164) + Math.abs(c[2] - 106) })).filter((o) => o.i >= 4 && o.i <= 8);
          // line = pixel of the playhead box columns; halo = darkest pixel adjacent; far = 6 px away
          const li = r.px.map((c, i) => ({ i, d: Math.abs(c[0] - 201) + Math.abs(c[1] - 164) + Math.abs(c[2] - 106) })).filter((o) => o.i >= 3 && o.i <= 9).sort((a, b) => a.d - b.d)[0].i;
          const line = r.px[li]; const far = [r.px[0], r.px[12]]; const neigh = [li - 2, li - 1, li + 1, li + 2].filter((i) => i >= 0 && i <= 12).map((i) => r.px[i]);
          const darkest = [...neigh].sort((a, b) => lum(a) - lum(b))[0];
          return { where: r.where, y: r.y, lineIdx: li, xs: [xs[0], xs[xs.length - 1]], px: r.px, line, halo: darkest, far, haloVsFar: Math.min(ratio(darkest, far[0]), ratio(darkest, far[1])), lineVsHalo: ratio(line, darkest), lineVsFar: Math.min(ratio(line, far[0]), ratio(line, far[1])), lineDist: lineIdx };
        });
        const clip = { x: Math.max(g.ov.x, cx - 60), y: g.ov.y, width: 120, height: g.ov.height };
        const shot = `c-round-150/shots/OV-playhead-t${t}-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip });
        out.push({ t, pos: g.pos, phBox: g.ph, phBg: g.phBg, phShadow: g.phShadow, phCls: g.phCls, floor: g.floor, ovBox: g.ov, barsUnder: under.length, runs: analysed, shot });
      }
      return out;
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save();
  console.log(JSON.stringify({ errors: res.errors, net: res.net, keys: Object.keys(res) }, null, 1)); await b.close();
})();
