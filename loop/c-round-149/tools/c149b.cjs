// C round 149 — follow-up: overview playhead vs bar (STATE-DISTINCT), Loop off via button, group-name field (RV-2-FIELDS). node c149b.cjs <1440|1280>
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const net = []; const res = { vp: W, utc: new Date().toISOString(), errors: [] };
const OUTF = path.join(L.OUT, `c149b-${W}.json`); const save = () => fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
const sec = async (n, fn) => { try { res[n] = await fn(); } catch (e) { res.errors.push(`${n}: ${String(e.stack || e).slice(0, 500)}`); } save(); };
async function pix(ctx, png, pts) {
  const pg = await ctx.newPage(); await pg.goto('about:blank');
  const r = await pg.evaluate(async ({ b64, pts }) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return pts.map(([x, y]) => { const d = g.getImageData(Math.round(x), Math.round(y), 1, 1).data; return [d[0], d[1], d[2]]; }); }, { b64: png.toString('base64'), pts });
  await pg.close(); return r;
}
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
(async () => {
  const b = await L.launch();
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `c149b-${W}`, net);
    await sec('setup', async () => {
      const s = [];
      s.push(await L.setSnapOff(p)); s.push((await L.addAt(p, 'demo-hero-music', 'music', 0)).status); s.push((await L.addAt(p, 'demo-stem-pulse', 'stems', 2)).status);
      const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id; s.push(await X.rangeDrag(p, stems, 4, 2)); s.push(await X.key(p, 'Control+l'));
      await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150); s.push(await X.key(p, 'Control+g'));
      await p.keyboard.press('Escape'); await sleep(200); await L.blur(p); return s;
    });
    // Overview playhead over audio bars, at several playhead times
    await sec('overview', async () => {
      const out = [];
      for (const t of [1, 3, 10, 30]) {
        await L.seekTo(p, t); await L.blur(p); await p.mouse.move(2, 2); await sleep(400);
        const g = await p.evaluate(() => { const ph = document.querySelector('[data-testid=arrangement-overview-playhead]').getBoundingClientRect(); const ov = document.querySelector('[data-testid=arrangement-overview]').getBoundingClientRect(); const bars = [...document.querySelectorAll('[data-testid=arrangement-overview] *')].filter((e) => /\bbg-(brand|dim)/.test(typeof e.className === 'string' ? e.className : '')).map((e) => { const r = e.getBoundingClientRect(); return { cls: e.className.match(/bg-[a-z/0-9-]+/g), x: r.x, y: r.y, w: r.width, h: r.height, bg: getComputedStyle(e).backgroundColor }; }); return { ph: ph.toJSON(), phBg: getComputedStyle(document.querySelector('[data-testid=arrangement-overview-playhead]')).backgroundColor, ov: ov.toJSON(), bars }; });
        const cx = g.ph.x + g.ph.width / 2; const under = g.bars.filter((bb) => cx >= bb.x && cx <= bb.x + bb.w && bb.w > 0 && bb.h > 0);
        const png = await p.screenshot();
        const pts = []; for (const bb of under) { const y = bb.y + bb.h / 2; pts.push([cx, y], [Math.min(bb.x + bb.w - 1, cx + 5), y], [Math.max(bb.x, cx - 5), y]); }
        const px = pts.length ? await pix(ctx, png, pts) : [];
        const rows = under.map((bb, i) => ({ bar: bb.cls, barBg: bb.bg, y: Math.round(bb.y), playheadPx: px[i * 3], barPxRight: px[i * 3 + 1], barPxLeft: px[i * 3 + 2], ratioPlayheadVsBar: px[i * 3] ? ratio(px[i * 3], px[i * 3 + 1]) : null }));
        const clip = { x: Math.max(g.ov.x, cx - 60), y: g.ov.y, width: 120, height: g.ov.height };
        const shot = `c-round-149/shots/OV-playhead-t${t}-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip });
        out.push({ t, phBg: g.phBg, phBox: g.ph, barsUnder: rows, shot });
      }
      return out;
    });
    // Loop off via the Loop button
    await sec('loopOff', async () => {
      const st = async () => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /^↻\s*Loop/.test(x.textContent.trim())); const br = document.querySelector('[data-testid=arrangement-loop-brace]'); const lab = br && br.querySelector('span'); const cs = (e) => e && getComputedStyle(e); return { btn: b && { pressed: b.getAttribute('aria-pressed'), color: cs(b).color, bg: cs(b).backgroundColor, border: cs(b).borderTopColor }, brace: br && { enabled: br.dataset.loopEnabled, bg: cs(br).backgroundColor, border: cs(br).borderTopColor, borderStyle: cs(br).borderTopStyle, label: lab.textContent, labelColor: cs(lab).color } }; });
      const on = await st(); await p.locator('button', { hasText: 'Loop' }).filter({ hasText: '↻' }).first().click(); await sleep(400); await p.mouse.move(2, 2); await sleep(200);
      const off = await st(); let shots = {};
      const strip = await p.locator('[data-testid=arrangement-loop-strip]').boundingBox();
      if (strip) { const clip = { x: strip.x, y: strip.y - 50, width: Math.min(500, strip.width), height: strip.height + 50 }; shots.off = `c-round-149/shots/LOOP-off-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shots.off), clip }); }
      const tb = await p.locator('button', { hasText: 'Loop' }).filter({ hasText: '↻' }).first().boundingBox(); if (tb) { shots.btnOff = `c-round-149/shots/LOOP-btn-off-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shots.btnOff), clip: { x: tb.x - 10, y: tb.y - 6, width: tb.width + 20, height: tb.height + 12 } }); }
      await p.locator('button', { hasText: 'Loop' }).filter({ hasText: '↻' }).first().click(); await sleep(400); await p.mouse.move(2, 2); await sleep(200);
      const back = await st(); if (strip) { shots.on = `c-round-149/shots/LOOP-on-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shots.on), clip: { x: strip.x, y: strip.y - 50, width: Math.min(500, strip.width), height: strip.height + 50 } }); }
      if (tb) { shots.btnOn = `c-round-149/shots/LOOP-btn-on-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shots.btnOn), clip: { x: tb.x - 10, y: tb.y - 6, width: tb.width + 20, height: tb.height + 12 } }); }
      return { on, off, back, shots };
    });
    // group-name field via F2
    await sec('groupField', async () => {
      await p.locator('[data-testid=arrangement-group-name]').first().focus(); await p.keyboard.press('F2'); await sleep(300);
      const n = await p.locator('[data-testid=arrangement-group-name-input]').count(); if (!n) return { opened: 0 };
      const r = await p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-group-name-input]'); const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const g = cvs.getContext('2d', { willReadFrequently: true }); const rgb = (s) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; }; const chain = []; for (let n = e.parentElement; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; chain.push(c); if (rgb(c)[3] >= 1) break; } const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return { border: cs.borderTopColor, borderW: cs.borderTopWidth, fill: cs.backgroundColor, chain, box: [b.x, b.y, b.width, b.height] }; });
      const png = await p.screenshot(); const [x, y, w, h] = r.box;
      const px = await pix(ctx, png, [[x + w / 2, y + 0.5], [x + w / 2, y - 3], [x + w / 2, y + h / 2], [x + 0.5, y + h / 2], [x - 3, y + h / 2]]);
      const shot = `c-round-149/shots/group-field-${W}.png`; await p.screenshot({ path: path.join(L.ROOT, '..', shot), clip: { x: Math.max(0, x - 30), y: y - 12, width: w + 60, height: h + 24 } });
      await p.keyboard.press('Escape'); await sleep(200);
      return { opened: n, ...r, pixels: { borderTop: px[0], surfaceAbove: px[1], fillCenter: px[2], borderLeft: px[3], surfaceLeft: px[4] }, borderVsSurface: ratio(px[0], px[1]), borderLeftVsSurfaceLeft: ratio(px[3], px[4]), fillVsSurface: ratio(px[2], px[1]), shot };
    });
  } catch (e) { res.errors.push(String(e.stack || e)); }
  res.net = X.netOk(net); save(); console.log(JSON.stringify(res, null, 1).slice(0, 6000)); await b.close();
})();
