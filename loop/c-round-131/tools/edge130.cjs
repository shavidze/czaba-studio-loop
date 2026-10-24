// LOOP-COPY (f) brace END-edge drag. node edge130.cjs <1440|1280> <tag>
const W = +process.argv[2]; const TAG = process.argv[3] || 'r1';
const H = require('./h3.cjs'); const { X, L, sleep } = H; const fs = require('fs'); const path = require('path');
const net = []; const res = { vp: W, tag: TAG, utc: new Date().toISOString() };
(async () => {
  const b = await L.launch();
  try {
    const { page: P } = await L.openStudio(b, X.VPS[W], `edge130-${W}-${TAG}`, net);
    await L.setSnapOff(P); await L.addAt(P, 'demo-hero-music', 'music', 0);
    const id = (await L.clipsDom(P)).find((c) => c.lane === 'music').id;
    await X.rangeDrag(P, id, 4, 6); await X.key(P, 'Control+l');
    const ls = () => P.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-loop-brace]'); return { enabled: b.dataset.loopEnabled, left: b.style.left, width: b.style.width, label: b.getAttribute('aria-label').split(' · ')[0] }; });
    res.before = await ls(); res.statusBefore = await L.status(P);
    const e = await P.locator('[data-testid=arrangement-loop-end-edge]').boundingBox(); const g = await L.geo(P);
    const x = e.x + e.width / 2, y = e.y + e.height / 2;
    await P.mouse.move(x, y); await P.mouse.down(); await P.mouse.move(x + g.pps / 2, y, { steps: 5 }); await P.mouse.move(x + g.pps, y, { steps: 5 }); await sleep(150); await P.mouse.up(); await sleep(400);
    res.after = await ls(); res.status = await L.status(P);
    res.expected = `Loop: ${res.after.label.replace(/^Loop /, '')}.`; res.exact = res.status === res.expected;
    res.startKept = res.after.left === res.before.left; res.widthGrew = parseFloat(res.after.width) > parseFloat(res.before.width);
    res.undo = ((await X.undoTitle(P)) || '').split('|')[0]; res.undoOk = res.undo === 'Undo: Loop range';
    await X.key(P, 'Control+z'); await sleep(300); res.afterUndo = await ls(); res.undoRestored = JSON.stringify(res.afterUndo) === JSON.stringify(res.before);
    await P.screenshot({ path: path.join(L.SHOTS, `LOOP-f-edge-${W}-${TAG}.png`) });
  } catch (err) { res.error = String(err.stack || err); }
  res.net = X.netOk(net); fs.writeFileSync(path.join(L.OUT, `edge130-${W}-${TAG}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); await b.close();
})();
