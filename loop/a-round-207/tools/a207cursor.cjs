// A round 207: real-Chromium computed cursor after the SABA-B-6 edits (no class injection).
// usage: node a207cursor.cjs <1440|1280>
const X = require('./lib122.cjs');
const { L, sleep } = X;
const fs = require('fs');
const path = require('path');
const W = +process.argv[2] || 1440;
const OUT = path.join(__dirname, '..', 'out');
const SH = path.join(__dirname, '..', 'shots');
const PLUS = new Set(['crosshair', 'move', 'cell', 'copy', 'all-scroll']);

const scanPlus = (p) => p.evaluate(() => {
  const found = {};
  for (let y = 0; y < innerHeight; y += 6) for (let x = 0; x < innerWidth; x += 6) {
    const el = document.elementFromPoint(x, y); if (!el) continue;
    const c = getComputedStyle(el).cursor;
    const k = `${c} | ${el.getAttribute('data-testid') || el.tagName.toLowerCase()}`;
    found[k] = (found[k] || 0) + 1;
  }
  return found;
});
const plusHits = (m) => Object.entries(m).filter(([k]) => /^(crosshair|move|cell|copy|all-scroll) /.test(k));

(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `a207cur-${W}`, net, { noFontWait: true });
  const at = (x, y) => p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? { c: getComputedStyle(e).cursor, t: e.getAttribute('data-testid') } : null; }, [x, y]);
  const r = { W };
  await p.mouse.move(2, 2);
  r.snap = await L.setSnapOff(p);
  await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  await L.addAt(p, 'demo-soft-impact', 'sfx', 10); await sleep(600);
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  const cid = await p.evaluate(() => document.querySelector('[data-track-id=music] [data-clip-kind=audio]').dataset.clipId);
  await p.click('[data-testid=arrangement-envelope-toggle]'); await sleep(300); await L.blur(p);
  const cb = await X.clipBox(p, cid);
  await p.mouse.dblclick(cb.x + 160, cb.y + cb.height * 0.6); await sleep(500);
  r.statusAfterAdd = await L.status(p);
  await p.mouse.move(2, 2); await sleep(300);
  r.scanEnvOn = await scanPlus(p); r.plusEnvOn = plusHits(r.scanEnvOn);
  const ed = await p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-editor]`).boundingBox();
  r.editor = [];
  for (const fx of [0.1, 0.5, 0.9]) for (const fy of [0.25, 0.75]) {
    const vis = Math.min(ed.x + ed.width, await p.evaluate(() => innerWidth - 8)) - ed.x; const x = ed.x + vis * fx, y = ed.y + ed.height * fy; await p.mouse.move(x, y); await sleep(60);
    r.editor.push({ fx, fy, ...(await at(x, y)) });
  }
  const ptL = p.locator(`[data-clip-id="${cid}"] [data-testid=arrangement-clip-envelope-point]`).first();
  const pt = await ptL.boundingBox(); const px = pt.x + pt.width / 2, py = pt.y + pt.height / 2;
  r.gainBefore = await ptL.getAttribute('data-gain');
  await p.mouse.move(px, py); await sleep(200); r.pointRest = await at(px, py);
  await p.mouse.down(); r.pointDown = await at(px, py);
  r.pointDrag = [];
  for (let i = 1; i <= 5; i++) { await p.mouse.move(px, py + 4 * i); await sleep(40); r.pointDrag.push(await at(px, py + 4 * i)); }
  await p.mouse.up(); await sleep(300); r.pointAfter = await at(px, py + 20);
  r.gainAfter = await ptL.getAttribute('data-gain'); r.statusAfterDrag = await L.status(p);
  await L.blur(p);
  await p.getByRole('button', { name: 'Expand video' }).first().click(); await sleep(900);
  const box = p.locator('[data-testid=arrangement-video-box]');
  r.floating = await box.getAttribute('data-video-floating');
  const vb = await box.boundingBox(); const x0 = vb.x + vb.width / 2, y0 = vb.y + vb.height / 2;
  await p.mouse.move(x0, y0); await sleep(150); r.videoRest = await at(x0, y0);
  await p.mouse.down(); r.videoDown = await at(x0, y0);
  r.videoDrag = [];
  for (let i = 1; i <= 4; i++) { await p.mouse.move(x0 + 10 * i, y0 + 2 * i); await sleep(40); r.videoDrag.push(await at(x0 + 10 * i, y0 + 2 * i)); }
  const vb2 = await box.boundingBox(); r.videoMoved = [+(vb2.x - vb.x).toFixed(1), +(vb2.y - vb.y).toFixed(1)];
  await p.mouse.up(); await sleep(300); r.videoAfter = await at(x0 + 40, y0 + 8);
  const h = await p.locator('[data-testid=arrangement-video-drag]').boundingBox();
  r.handle = h ? await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const d = document.querySelector('[data-testid=arrangement-video-drag]'); return { atTag: e && e.tagName.toLowerCase(), atTestid: e && e.getAttribute('data-testid'), atCls: e && (e.getAttribute('class') || '').slice(0, 120), atCursor: e && getComputedStyle(e).cursor, handleOwnCursor: getComputedStyle(d).cursor, inside: d.contains(e) }; }, [h.x + h.width / 2, h.y + h.height / 2]) : null;
  await p.mouse.move(2, 2); await sleep(200);
  r.scanFloating = await scanPlus(p); r.plusFloating = plusHits(r.scanFloating);
  await p.screenshot({ path: path.join(SH, `a207-${W}-floating.png`) });
  await p.click('[data-testid=arrangement-video-close]'); await sleep(600);
  r.compactFloatingAttr = await box.getAttribute('data-video-floating');
  const cbx = await box.boundingBox(); await p.mouse.move(cbx.x + cbx.width / 2, cbx.y + cbx.height / 2); await sleep(150);
  r.videoCompact = await at(cbx.x + cbx.width / 2, cbx.y + cbx.height / 2);
  r.net = X.netOk(net);
  await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUT, `a207cursor-${W}.json`), JSON.stringify(r, null, 1));
  const { scanEnvOn, scanFloating, ...brief } = r; console.log(JSON.stringify(brief));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
