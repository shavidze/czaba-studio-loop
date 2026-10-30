const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const SHD = path.join(L.ROOT, 'shots', 'ov'); 
(async () => { const b = await L.launch(); const net = []; const res = { W };
  const { page: q } = await L.openStudio(b, X.VPS[W], `ovmid-${W}`, net, { deviceScaleFactor: 4 });
  await L.setSnapOff(q); await L.addAt(q, 'demo-synth-mix', 'music', 0); await q.click('[data-testid=arrangement-fit]'); await sleep(600);
  await L.seekTo(q, 8); await q.mouse.move(2, 2); await sleep(500);
  res.frame = await q.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); return [f.style.left, f.style.width]; });
  res.ph = await q.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-overview-playhead]'); return e && e.style.left; });
  const o = await q.locator('[data-testid=arrangement-overview]').boundingBox(); const files = [];
  for (const [n, x, y] of [['tl', o.x - 2, o.y - 2], ['tr', o.x + o.width - 14, o.y - 2], ['bl', o.x - 2, o.y + o.height - 14], ['br', o.x + o.width - 14, o.y + o.height - 14]]) { const f = path.join(SHD, `ovmid-${W}-${n}.png`); await q.screenshot({ path: f, clip: { x, y, width: 16, height: 16 } }); files.push(f); }
  res.files = files; res.net = X.netOk(net); console.log(JSON.stringify(res)); await b.close(); })();
