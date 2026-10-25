// B round 163 planning probe 2: SABA-B-1 pixel contrast (normal / selected / hover / muted) + SABA-B-2 4x corners in 3 overview states. node saba-probe2.cjs <out.json>
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const out = process.argv[2];
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
async function pixels(ctx, png, pts) { const pg = await ctx.newPage(); const r = await pg.evaluate(async ({ b64, pts }) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return pts.map(([x, y]) => [...g.getImageData(Math.round(x), Math.round(y), 1, 1).data].slice(0, 3)); }, { b64: png.toString('base64'), pts }); await pg.close(); return r; }
async function envSample(p, ctx, cid, label) {
  const g = await p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const line = c.querySelector('[data-testid=arrangement-clip-envelope-line]'); const pt = c.querySelector('[data-testid=arrangement-clip-envelope-point]'); const wf = c.querySelector('[data-testid=arrangement-clip-waveform]'); const body = wf.parentElement.getBoundingClientRect(); const gain = pt ? +pt.dataset.gain : null; const pr = pt && pt.getBoundingClientRect(); return { body: [body.x, body.y, body.width, body.height], gain, pt: pr && [pr.x, pr.y, pr.width, pr.height], ptBg: pt && getComputedStyle(pt).backgroundColor, ptBorder: pt && getComputedStyle(pt).borderTopColor, stroke: getComputedStyle(line.querySelector('polyline')).stroke, cls: c.className.includes('ring-brand') ? 'selected' : 'unselected' }; }, cid);
  const png = await p.screenshot(); const [bx, by, bw, bh] = g.body; const ly = by + (1 - g.gain) * bh;
  const xs = []; for (let x = bx + 20; x < Math.min(bx + bw, 1270) - 4; x += 7) if (!g.pt || Math.abs(x - (g.pt[0] + 4)) > 10) xs.push(x);
  const pts = []; for (const x of xs) pts.push([x, ly], [x, ly - 3], [x, ly + 3]);
  let ptPts = []; if (g.pt) { const [px, py, pw, ph] = g.pt; const cx = px + pw / 2, cy = py + ph / 2; ptPts = [[cx, cy], [px - 3, cy], [px + pw + 3, cy], [cx, py - 3], [cx, py + ph + 3]]; }
  const pix = await pixels(ctx, png, [...pts, ...ptPts]);
  const lineR = []; for (let i = 0; i < xs.length; i++) { const [l, a, b] = pix.slice(i * 3, i * 3 + 3); lineR.push(Math.min(cr(l, a), cr(l, b))); }
  lineR.sort((a, b) => a - b);
  const pp = pix.slice(xs.length * 3); const ptR = pp.length ? pp.slice(1).map((s) => cr(pp[0], s)) : [];
  return { label, state: g.cls, gain: g.gain, stroke: g.stroke, ptBg: g.ptBg, ptBorder: g.ptBorder, ptBox: g.pt, lineSamples: lineR.length, lineMin: +lineR[0].toFixed(2), lineP10: +lineR[Math.floor(lineR.length * 0.1)].toFixed(2), lineMedian: +lineR[Math.floor(lineR.length / 2)].toFixed(2), lineShareBelow3: +(lineR.filter((v) => v < 3).length / lineR.length).toFixed(2), handleVsAround: ptR.map((v) => +v.toFixed(2)), handleCentrePx: pp[0] };
}
(async () => {
  const b = await L.launch(); const res = {};
  for (const W of [1440, 1280]) {
    res[W] = { env: [], corners: [] }; const net = [];
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `b163b-${W}`, net);
    await p.mouse.move(2, 2); await sleep(300); await L.setSnapOff(p);
    await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
    await L.addAt(p, 'demo-soft-impact', 'sfx', 30); await sleep(600);
    const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
    const other = await p.evaluate(() => document.querySelector('[data-track-id=sfx] [data-clip-kind=audio]').dataset.clipId);
    await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
    let cb = await X.clipBox(p, cid);
    await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500);
    const pt = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
    await p.mouse.move(pt.x + 4, pt.y + 4); await p.mouse.down(); await p.mouse.move(pt.x + 4, pt.y + 4 + 18, { steps: 6 }); await p.mouse.up(); await sleep(400);
    res[W].dragStatus = await L.status(p);
    await p.mouse.move(2, 2); await sleep(200);
    res[W].env.push(await envSample(p, ctx, cid, 'selected-after-drag'));
    await L.selectClip(p, other); await p.mouse.move(2, 2); await sleep(300);
    res[W].env.push(await envSample(p, ctx, cid, 'normal (other clip selected)'));
    cb = await X.clipBox(p, cid); await p.screenshot({ path: out.replace('.json', `-${W}-env-normal.png`), clip: { x: cb.x, y: cb.y - 2, width: 360, height: cb.height + 4 } });
    const pt2 = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first().boundingBox();
    await p.mouse.move(pt2.x + 4, pt2.y + 4); await sleep(300);
    res[W].env.push(await envSample(p, ctx, cid, 'hover point (normal)'));
    await p.screenshot({ path: out.replace('.json', `-${W}-env-hover.png`), clip: { x: cb.x, y: cb.y - 2, width: 360, height: cb.height + 4 } });
    await p.mouse.move(2, 2); await X.muteLanes(p, ['music']); await sleep(300);
    res[W].env.push(await envSample(p, ctx, cid, 'muted lane (normal)'));
    res[W].mutedClipClass = await p.evaluate((cid) => document.querySelector(`[data-clip-id="${cid}"]`).className, cid);
    res[W].net = X.netOk(net);
    await ctx.close();
    // corners at 4x
    const c2 = await b.newContext({ viewport: X.VPS[W], deviceScaleFactor: 4 }); const q = await c2.newPage();
    await q.goto(`${L.BASE}/studio-lab`); await q.waitForSelector('[data-testid=arrangement-overview]', { timeout: 90000 }); await sleep(3000);
    await q.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); }); await q.mouse.move(2, 2); await sleep(500);
    const shoot = async (state) => { const o = await q.locator('[data-testid=arrangement-overview]').boundingBox(); const fr = await q.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); const ph = document.querySelector('[data-testid=arrangement-overview-playhead]'); return { frame: [f.style.left, f.style.width], playhead: ph.style.left }; }); const files = []; for (const [n, x, y] of [['tl', o.x - 2, o.y - 2], ['tr', o.x + o.width - 14, o.y - 2], ['bl', o.x - 2, o.y + o.height - 14], ['br', o.x + o.width - 14, o.y + o.height - 14]]) { const f = out.replace('.json', `-${W}-corner-${state}-${n}.png`); await q.screenshot({ path: f, clip: { x, y, width: 16, height: 16 } }); files.push(f.split('/').pop()); } res[W].corners.push({ state, ...fr, files }); };
    await shoot('empty');
    await q.keyboard.press('End').catch(() => {}); await sleep(300);
    await c2.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1).slice(0, 5000));
})();
