// B round 163 planning: simulate the ruled fixes in the DOM (not source) and measure. node saba-sim.cjs <out.json>
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
async function pixels(ctx, png, pts) { const pg = await ctx.newPage(); const r = await pg.evaluate(async ({ b64, pts }) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return pts.map(([x, y]) => [...g.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3)); }, { b64: png.toString('base64'), pts }); await pg.close(); return r; }
const applySim = (haloW) => { for (const svg of document.querySelectorAll('[data-testid=arrangement-clip-envelope-line]')) { const pl = svg.querySelector('polyline'); if (!svg.querySelector('polyline[data-sim]')) { const h = pl.cloneNode(); h.setAttribute('data-sim', '1'); svg.insertBefore(h, pl); } const h = svg.querySelector('polyline[data-sim]'); h.setAttribute('stroke', 'var(--color-background)'); h.setAttribute('stroke-width', String(haloW)); pl.setAttribute('stroke', 'var(--color-foreground)'); }
  for (const pt of document.querySelectorAll('[data-testid=arrangement-clip-envelope-point]')) { pt.style.width = '10px'; pt.style.height = '10px'; pt.style.background = 'var(--color-foreground)'; pt.style.borderColor = 'var(--color-background)'; } };
async function sample(p, ctx, cid) {
  const g = await p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const pt = c.querySelector('[data-testid=arrangement-clip-envelope-point]'); const wf = c.querySelector('[data-testid=arrangement-clip-waveform]'); const body = wf.parentElement.getBoundingClientRect(); const pr = pt.getBoundingClientRect(); return { body: [body.x, body.y, body.width, body.height], gain: +pt.dataset.gain, pt: [pr.x, pr.y, pr.width, pr.height] }; }, cid);
  const png = await p.screenshot(); const [bx, by, bw, bh] = g.body; const ly = by + (1 - g.gain) * bh;
  const xs = []; for (let x = bx + 20; x < Math.min(bx + bw, 1270) - 4; x += 7) if (Math.abs(x - (g.pt[0] + 5)) > 12) xs.push(x);
  const D = 2; const offs = []; for (let o = -12; o <= 12; o++) offs.push(o); const pts = []; for (const x of xs) for (const o of offs) pts.push([x * D, ly * D + o]);
  const [px, py, pw, ph] = g.pt; const cx = px + pw / 2, cy = py + ph / 2; const ring = [[cx, cy], [px + 0.5, cy], [px + pw - 0.5, cy], [cx, py + 0.5], [cx, py + ph - 0.5], [px - 2, cy], [px + pw + 2, cy], [cx, py - 2], [cx, py + ph + 2]].map(([a, b]) => [a * D, b * D]);
  const pix = await pixels(ctx, png, [...pts, ...ring]);
  const per = { 2: [], 3: [], 4: [] }; const coreRow = []; const coreHalo = []; const haloOut = [];
  for (let i = 0; i < xs.length; i++) { const s = pix.slice(i * offs.length, (i + 1) * offs.length); let k = 6; for (let j = 6; j < s.length - 6; j++) if (lum(s[j]) > lum(s[k])) k = j; const core = s[k]; coreRow.push(offs[k]); let h = s[k - 4]; for (let j = k - 5; j <= k + 5; j++) if (lum(s[j]) < lum(h)) h = s[j]; coreHalo.push(cr(core, h)); haloOut.push(Math.min(cr(h, s[k - 6]), cr(h, s[k + 6]))); for (const d of [2, 3, 4]) per[d].push(Math.min(cr(core, s[k - d]), cr(core, s[k + d]))); }
  const st = (a) => { a = [...a].sort((x, y) => x - y); return { min: +a[0].toFixed(2), p10: +a[Math.floor(a.length * 0.1)].toFixed(2), med: +a[Math.floor(a.length / 2)].toFixed(2) }; };
  const r = pix.slice(xs.length * offs.length); const centre = r[0]; const rows = [...new Set(coreRow)];
  return { gain: g.gain, n: xs.length, coreRowOffsets: rows, coreVsHalo: st(coreHalo), haloVsBeyond: st(haloOut), coreVsPx2: st(per[2]), coreVsPx3: st(per[3]), coreVsPx4: st(per[4]), handleCentre: centre, handleBorderVsCentre: r.slice(1, 5).map((v) => +cr(centre, v).toFixed(2)), handleBorderVsOutside: r.slice(1, 5).map((v, i) => +cr(v, r[5 + i]).toFixed(2)), handleCentreVsOutside: r.slice(5).map((v) => +cr(centre, v).toFixed(2)) };
}
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    res[W] = []; const net = [];
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b163s-${W}`, net, { deviceScaleFactor: 2 });
    await p.mouse.move(2, 2); await sleep(300); await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    await L.addAt(p, 'demo-soft-impact', 'sfx', 30); await sleep(600);
    const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
    const other = await p.evaluate(() => document.querySelector('[data-track-id=sfx] [data-clip-kind=audio]').dataset.clipId);
    await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
    const cb = await X.clipBox(p, cid); await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500);
    const pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
    await p.mouse.move(pt.x + 4, pt.y + 4); await p.mouse.down(); await p.mouse.move(pt.x + 4, pt.y + 22, { steps: 6 }); await p.mouse.up(); await sleep(400);
    for (const [sel, label] of [[cid, 'selected'], [other, 'normal']]) {
      await L.selectClip(p, sel); await p.mouse.move(2, 2); await sleep(300);
      res[W].push({ label, variant: 'baseline', ...(await sample(p, ctx, cid)) });
      for (const hw of [4, 5]) { await p.evaluate(applySim, hw); await sleep(150); res[W].push({ label, variant: `sim halo ${hw}`, ...(await sample(p, ctx, cid)) }); }
      const c2 = await X.clipBox(p, cid); await p.screenshot({ path: out.replace('.json', `-${W}-${label}-sim.png`), clip: { x: c2.x, y: c2.y - 2, width: 360, height: c2.height + 4 } });
      await p.reload(); break;
    }
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
})();
