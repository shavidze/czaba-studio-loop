// C round 150 — FUNC-SMOKE drag + Ctrl+Z at 1280 (retry; the c149 1280 drag hit an off-screen clip after S1)
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1280; const net = [];
(async () => { const b = await L.launch(); const r = {};
  try { const { page: p } = await L.openStudio(b, X.VPS[W], `drag-${W}`, net);
    r.snap = await L.setSnapOff(p); r.add = (await L.addAt(p, 'demo-soft-impact', 'sfx', 4)).status;
    const c = await H.byLane(p, 'sfx'); r.visible = await p.locator(`[data-clip-id="${c.id}"]`).isVisible(); r.before = c.start;
    r.status = await H.dragHeader(p, c.id, 1); r.mid = (await H.byLane(p, 'sfx')).start;
    r.undo = await X.key(p, 'Control+z'); r.after = (await H.byLane(p, 'sfx')).start;
    r.moved = +(r.mid - r.before).toFixed(3); r.restored = Math.abs(r.after - r.before) < 1e-6;
  } catch (e) { r.error = String(e.stack || e); }
  r.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `drag-${W}.json`), JSON.stringify(r, null, 1)); console.log(JSON.stringify(r)); await b.close(); })();
