// C round 164 ENV-VIS (SABA-B-1). node c164-env.cjs <1440|1280> <attempt>
// sample() is copied from b-round-163/saba-sim.cjs (the ruled metric). Changes: none to the metric;
// the handle part is skipped when no point exists (state f, Env off), using the known gain; applySim (DOM injection) is dropped.
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'env'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'env'); fs.mkdirSync(SHD, { recursive: true });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
async function pixels(ctx, png, pts) { const pg = await ctx.newPage(); const r = await pg.evaluate(async ({ b64, pts }) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return pts.map(([x, y]) => [...g.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3)); }, { b64: png.toString('base64'), pts }); await pg.close(); return r; }
async function sample(p, ctx, cid, gainIfNoPoint) {
  const g = await p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const pt = c.querySelector('[data-testid=arrangement-clip-envelope-point]'); const wf = c.querySelector('[data-testid=arrangement-clip-waveform]'); const body = wf.parentElement.getBoundingClientRect(); const pr = pt && pt.getBoundingClientRect(); return { body: [body.x, body.y, body.width, body.height], gain: pt ? +pt.dataset.gain : null, pt: pr ? [pr.x, pr.y, pr.width, pr.height] : null }; }, cid);
  if (g.gain === null) g.gain = gainIfNoPoint;
  const png = await p.screenshot(); const [bx, by, bw, bh] = g.body; const ly = by + (1 - g.gain) * bh;
  const xs = []; for (let x = bx + 20; x < Math.min(bx + bw, 1270) - 4; x += 7) if (!g.pt || Math.abs(x - (g.pt[0] + 5)) > 12) xs.push(x);
  const D = 2; const offs = []; for (let o = -12; o <= 12; o++) offs.push(o); const pts = []; for (const x of xs) for (const o of offs) pts.push([x * D, ly * D + o]);
  let ring = [];
  if (g.pt) { const [px, py, pw, ph] = g.pt; const cx = px + pw / 2, cy = py + ph / 2; ring = [[cx, cy], [px + 0.5, cy], [px + pw - 0.5, cy], [cx, py + 0.5], [cx, py + ph - 0.5], [px - 2, cy], [px + pw + 2, cy], [cx, py - 2], [cx, py + ph + 2]].map(([a, b]) => [a * D, b * D]); }
  const pix = await pixels(ctx, png, [...pts, ...ring]);
  const per = { 2: [], 3: [], 4: [] }; const coreRow = []; const coreHalo = []; const haloOut = [];
  for (let i = 0; i < xs.length; i++) { const s = pix.slice(i * offs.length, (i + 1) * offs.length); let k = 6; for (let j = 6; j < s.length - 6; j++) if (lum(s[j]) > lum(s[k])) k = j; const core = s[k]; coreRow.push(offs[k]); let h = s[k - 4]; for (let j = k - 5; j <= k + 5; j++) if (lum(s[j]) < lum(h)) h = s[j]; coreHalo.push(cr(core, h)); haloOut.push(Math.min(cr(h, s[k - 6]), cr(h, s[k + 6]))); for (const d of [2, 3, 4]) per[d].push(Math.min(cr(core, s[k - d]), cr(core, s[k + d]))); }
  const st = (a) => { a = [...a].sort((x, y) => x - y); return { min: +a[0].toFixed(2), p10: +a[Math.floor(a.length * 0.1)].toFixed(2), med: +a[Math.floor(a.length / 2)].toFixed(2) }; };
  const out = { gain: g.gain, n: xs.length, coreRowOffsets: [...new Set(coreRow)], coreVsHalo: st(coreHalo), coreVsHaloBelow3: coreHalo.filter((v) => v < 3).length, haloVsBeyond: st(haloOut), coreVsPx2: st(per[2]), coreVsPx3: st(per[3]), coreVsPx4: st(per[4]) };
  if (g.pt) {
    const r = pix.slice(xs.length * offs.length); const centre = r[0];
    out.handleCentre = centre; out.ptBox = g.pt.map((v) => +v.toFixed(2));
    out.handleBorderVsCentre = r.slice(1, 5).map((v) => +cr(centre, v).toFixed(2));
    out.handleBorderVsOutside = r.slice(1, 5).map((v, i) => +cr(v, r[5 + i]).toFixed(2));
    out.handleCentreVsOutside = r.slice(5).map((v) => +cr(centre, v).toFixed(2));
    out.aboveBelowMax = [2, 3].map((i) => +Math.max(out.handleCentreVsOutside[i], out.handleBorderVsOutside[i]).toFixed(2));
  }
  return out;
}
const comp = (cid) => {
  const c = document.querySelector(`[data-clip-id="${cid}"]`); const svg = c.querySelector('[data-testid=arrangement-clip-envelope-line]');
  const pls = svg ? [...svg.querySelectorAll('polyline')].map((q) => { const cs = getComputedStyle(q); return { cls: q.getAttribute('class'), stroke: cs.stroke, sw: cs.strokeWidth, attrStroke: q.getAttribute('stroke'), ve: q.getAttribute('vector-effect'), pointsLen: (q.getAttribute('points') || '').length, points: q.getAttribute('points') }; }) : [];
  const pts = [...c.querySelectorAll('[data-testid=arrangement-clip-envelope-point]')].map((pt) => { const cs = getComputedStyle(pt); const r = pt.getBoundingClientRect(); return { cls: pt.className, bg: cs.backgroundColor, border: cs.borderTopColor, scale: cs.scale, transform: cs.transform, transition: cs.transitionProperty + '/' + cs.transitionDuration, ow: pt.offsetWidth, oh: pt.offsetHeight, rw: +r.width.toFixed(2), rh: +r.height.toFixed(2), gain: pt.dataset.gain, time: pt.dataset.time, hover: pt.matches(':hover'), z: cs.zIndex, cursor: cs.cursor }; });
  return { svgCls: svg && svg.getAttribute('class'), pls, samePoints: pls.length === 2 && pls[0].points === pls[1].points, pts, sel: /ring-brand/.test(c.className), hoverMedia: matchMedia('(hover: hover)').matches, envToggle: (document.querySelector('[data-testid=arrangement-envelope-toggle]') || {}).getAttribute && document.querySelector('[data-testid=arrangement-envelope-toggle]').getAttribute('aria-pressed') };
};
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, states: {} };
  const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c164env-${W}-${ATT}`, net, { deviceScaleFactor: 2 });
  res.fonts = log.fontsReady; res.fontResp = log.fontResp.filter((r) => r.s !== 200);
  await p.mouse.move(2, 2); await sleep(300); res.snap = await L.setSnapOff(p);
  res.add1 = await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  res.add2 = await L.addAt(p, 'demo-soft-impact', 'sfx', 30); await sleep(600);
  const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
  const other = await p.evaluate(() => document.querySelector('[data-track-id=sfx] [data-clip-kind=audio]').dataset.clipId);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
  const crop = async (name) => { const c2 = await X.clipBox(p, cid); const f = path.join(SHD, `env-${W}-${ATT}-${name}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, c2.x), y: c2.y - 4, width: 360, height: c2.height + 8 } }); return path.relative(L.ROOT, f); };
  const run = async (name, gainIfNoPoint) => { const c = await p.evaluate(comp, cid); const s = await sample(p, ctx, cid, gainIfNoPoint); res.states[name] = { comp: c, sample: s, shot: await crop(name), status: await L.status(p) }; };
  // (e) fresh point at 0 dB on a selected clip (before the drag: a new point takes the line's gain, which is 1.0 only before any drag)
  let cb = await X.clipBox(p, cid); await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500);
  res.addStatus = await L.status(p);
  await L.selectClip(p, cid); await p.mouse.move(2, 2); await sleep(300);
  await run('e-fresh-0dB-selected');
  const pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  await p.mouse.move(pt.x + 4, pt.y + 4); await p.mouse.down(); await p.mouse.move(pt.x + 4, pt.y + 22, { steps: 6 }); await p.mouse.up(); await sleep(400);
  res.dragStatus = await L.status(p);
  await L.selectClip(p, cid); await p.mouse.move(2, 2); await sleep(300);
  await run('a-selected');
  await L.selectClip(p, other); await p.mouse.move(2, 2); await sleep(300);
  await run('b-normal');
  const pt2 = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
  await p.mouse.move(pt2.x + pt2.width / 2, pt2.y + pt2.height / 2); await sleep(400);
  await run('c-hover');
  await p.mouse.move(2, 2); await sleep(300);
  await X.muteLanes(p, ['music']); await p.mouse.move(2, 2); await sleep(300);
  res.mutePressed = await p.evaluate(() => document.querySelector('[data-track-id=music] button[aria-label^="Mute"]').getAttribute('aria-pressed'));
  await run('d-muted');
  const gainB = res.states['b-normal'].sample.gain;
  await X.muteLanes(p, ['music']); await sleep(200);
  await L.selectClip(p, other); await p.mouse.move(2, 2);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p); await p.mouse.move(2, 2); await sleep(300);
  await run('f-env-off', gainB);
  res.net = X.netOk(net);
  await ctx.close(); await b.close();
  const f = path.join(OUTD, `env-${W}-${ATT}.json`); fs.writeFileSync(f, JSON.stringify(res, null, 1));
  const brief = {}; for (const [k, v] of Object.entries(res.states)) brief[k] = { sel: v.comp.sel, pls: v.comp.pls.map((q) => `${q.cls}|${q.stroke}|${q.sw}|attr:${q.attrStroke}`), same: v.comp.samePoints, pts: v.comp.pts.map((q) => `${q.bg}|${q.border}|${q.ow}x${q.oh}|r${q.rw}x${q.rh}|scale:${q.scale}|hover:${q.hover}|g${q.gain}`), n: v.sample.n, coreVsHalo: v.sample.coreVsHalo, below3: v.sample.coreVsHaloBelow3, hBC: v.sample.handleBorderVsCentre, ab: v.sample.aboveBelowMax };
  console.log(JSON.stringify({ W, fonts: res.fonts && res.fonts.ok, addStatus: res.addStatus, dragStatus: res.dragStatus, mute: res.mutePressed, net: res.net, brief }, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
