// C round 174 FUNC-SMOKE: real-mouse move, trim, play, Overview drag. node c174-smoke.cjs <W> <att>
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const net = []; const r = { W };
(async () => { const b = await L.launch();
 try { const { page: p, ctx, log } = await L.openStudio(b, X.VPS[W], `c174smoke-${W}-${ATT}`, net);
  await p.mouse.move(2, 2); await L.setSnapOff(p); await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  await L.addAt(p, 'demo-middle-east', 'music', 1); await L.addAt(p, 'demo-soft-impact', 'sfx', 3); await sleep(600);
  const id = await p.evaluate(() => document.querySelector('[data-track-id=sfx] [data-clip-id]').dataset.clipId);
  const g = await L.geo(p);
  // move: drag header +2 s
  let bx = await X.clipBox(p, id); const hx = bx.x + 20, hy = bx.y + 10;
  await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx + g.pps, hy, { steps: 5 }); await p.mouse.move(hx + 2 * g.pps, hy, { steps: 5 }); await p.mouse.up(); await sleep(400);
  r.move = { status: await L.status(p), start: await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.clipStart, id) };
  // trim end -0.5 s
  bx = await X.clipBox(p, id); const ex = bx.x + bx.width - 3, ey = bx.y + bx.height * 0.6; const w0 = bx.width;
  await p.mouse.move(ex, ey); await p.mouse.down(); await p.mouse.move(ex - g.pps * 0.25, ey, { steps: 4 }); await p.mouse.move(ex - g.pps * 0.5, ey, { steps: 4 }); await p.mouse.up(); await sleep(400);
  bx = await X.clipBox(p, id); r.trim = { status: await L.status(p), w0, w1: bx.width, dSec: +((w0 - bx.width) / g.pps).toFixed(3) };
  // play
  await L.blur(p); await p.keyboard.press('Home'); await sleep(200); const p0 = await L.posNow(p); await p.keyboard.press('Space'); await sleep(1500); const p1 = await L.posNow(p); await p.keyboard.press('Space'); await sleep(300);
  r.play = { p0, p1, phLeft: await p.evaluate(() => document.querySelector('[data-testid=arrangement-playhead]').style.left) };
  // overview drag
  const ov = await p.locator('[data-testid=arrangement-overview]').boundingBox(); const fr = await p.locator('[data-testid=arrangement-overview-frame]').boundingBox();
  const sl0 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  const sx = fr.x + Math.min(fr.width, 60) / 2, sy = ov.y + ov.height / 2;
  await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + ov.width * 0.3, sy, { steps: 10 }); await p.mouse.up(); await sleep(500);
  const sl1 = await p.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  const fr1 = await p.locator('[data-testid=arrangement-overview-frame]').boundingBox();
  r.ovDrag = { sl0, sl1, frameX0: fr.x, frameX1: fr1.x };
  await p.screenshot({ path: path.join(L.SHOTS, `smoke-${W}-${ATT}.png`) });
  r.net = X.netOk(net); await ctx.close();
 } catch (e) { r.error = String(e.stack || e).slice(0, 800); r.net = X.netOk(net); }
 await b.close(); fs.writeFileSync(path.join(L.OUT, `smoke-${W}-${ATT}.json`), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r)); })();
