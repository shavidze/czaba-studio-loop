// C301 RG-14 sub-check (11c st.2): Snap off, drag a clip to ~2.3; G (Snap on); drag right ~1 s -> 3.3 +-0.001 (relative snap), not 3.000.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const vp = process.argv[2]; const id = `RG-14SUB-${vp}`;
async function hdrDrag(p, cid, dt) { const b = await X.clipBox(p, cid); const g = await L.geo(p); const x = b.x + 20, y = b.y + 8; const tx = x + dt * g.pps; await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move((x + tx) / 2, y, { steps: 6 }); await p.mouse.move(tx, y, { steps: 6 }); await sleep(150); await p.mouse.up(); await sleep(400); }
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try {
    const { page: p } = await L.openStudio(b, X.VPS[vp], id, net);
    res.snap0 = await L.setSnapOff(p);
    await L.addAt(p, 'demo-soft-impact', 'music', 2);
    let c = (await L.clipsDom(p))[0]; res.start0 = c.start;
    await hdrDrag(p, c.id, 0.3); c = (await L.clipsDom(p))[0]; res.startFree = c.start;
    await L.blur(p); await p.keyboard.press('g'); await sleep(300);
    res.grid = await p.evaluate(() => ({ ...document.querySelector('[data-testid=arrangement-grid-control]').dataset }));
    await hdrDrag(p, c.id, 1.0); c = (await L.clipsDom(p))[0]; res.startRel = c.start; res.status = await L.status(p);
    await X.shot(p, `${id}.png`);
    res.checks = { snapOffFirst: res.snap0 === 'off', freeNear23: Math.abs(res.startFree - 2.3) < 0.05, snapOnAfterG: res.grid.snap === 'on', relative: Math.abs(res.startRel - (res.startFree + Math.round((res.startRel - res.startFree) / Number(res.grid.gridSeconds || 1)) * Number(res.grid.gridSeconds || 1))) <= 0.001 && Math.abs(res.startRel - 3.0) > 0.01, movedOneDiv: Math.abs(res.startRel - res.startFree - 1) <= 0.001 };
    await p.context().close();
  } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok; console.log(JSON.stringify(res)); console.log('PASS?', res.pass);
})();
