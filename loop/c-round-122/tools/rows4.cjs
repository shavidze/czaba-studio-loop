const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
const undoT = (p) => p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /↶\s*Undo/.test(x.textContent)); return b ? `${b.getAttribute('title')}|${b.disabled}` : null; });
const gridPx = (p) => p.evaluate(() => [...document.querySelectorAll('[data-track-id] [data-grid-seconds], [data-testid=arrangement-video-dropzone]')].map((e) => { const m = /transparent 1px ([\d.]+)px/.exec(e.getAttribute('style') || ''); return m ? +m[1] : null; }));
async function hdrDrag(p, cid, dt, { shift = false } = {}) {
  const b = await X.clipBox(p, cid); const g = await L.geo(p); const x = b.x + 20, y = b.y + 8; const tx = x + dt * g.pps;
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move((x + tx) / 2, y, { steps: 6 }); await p.mouse.move(tx, y, { steps: 6 }); await sleep(150); await p.mouse.up(); await sleep(400);
  return { fromX: x, toX: tx };
}
const rows = {
  async 'RG-14'(p, res) {
    res.tempo = await p.locator('[data-testid=arrangement-tempo-input]').inputValue();
    await L.blur(p); const sn = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap); if (sn !== 'on') { await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); }
    await p.selectOption('[data-testid=arrangement-grid-division]', '1'); await L.blur(p); await sleep(200);
    res.grid0 = await p.evaluate(() => ({ ...document.querySelector('[data-testid=arrangement-grid-control]').dataset }));
    // add at 2 with snap on (insert marker at 2 via ruler click; snapped)
    await L.addAt(p, 'demo-soft-impact', 'music', 2);
    let c = (await L.clipsDom(p))[0]; res.start0 = c.start;
    res.d1 = await hdrDrag(p, c.id, 1.3); c = (await L.clipsDom(p))[0]; res.start1 = c.start;
    await L.blur(p); await p.keyboard.press('g'); await sleep(300); res.snapAfterG = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
    const g = await L.geo(p); const target = 4.37; res.d2 = await hdrDrag(p, c.id, target - c.start); c = (await L.clipsDom(p))[0]; res.start2 = c.start;
    res.pxErr2 = +((c.start - target) * g.pps).toFixed(2);
    res.gridPx1 = await gridPx(p); await p.selectOption('[data-testid=arrangement-grid-division]', '0.5'); await sleep(300); res.gridPx05 = await gridPx(p); await p.selectOption('[data-testid=arrangement-grid-division]', '2'); await sleep(300); res.gridPx2 = await gridPx(p);
    await X.shot(p, `${res.id}-grid.png`);
    const all = (a, v) => a.length > 0 && a.every((x) => x === v);
    res.checks = { bpmEmpty: res.tempo === '', snapOn: res.grid0.snap === 'on' && res.grid0.gridSeconds === '1', start2: res.start0 === 2, snapped: res.start1 === 3, gOff: res.snapAfterG === 'off', free: Math.abs(res.pxErr2) <= 1 && res.start2 !== 4 && res.start2 !== 4.5, lines: all(res.gridPx1.filter((x) => x !== null), g.pps) && all(res.gridPx05.filter((x) => x !== null), g.pps / 2) && all(res.gridPx2.filter((x) => x !== null), g.pps * 2) };
  },
  async 'RG-16'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0);
    await L.seekTo(p, 12); res.u0 = await undoT(p);
    await L.blur(p); await p.keyboard.press('m'); await sleep(400);
    res.active = await p.evaluate(() => document.activeElement.tagName + '|' + (document.activeElement.getAttribute('aria-label') || ''));
    await p.keyboard.type('აქ შედის მუსიკა'); await p.keyboard.press('Enter'); await sleep(400);
    const flags = () => p.evaluate(() => { const rl = document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left; const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]; return [...document.querySelectorAll('[data-testid=arrangement-marker-strip] [data-marker-id], [data-testid=arrangement-marker-flag]')].map((f) => ({ id: f.dataset.markerId, text: f.textContent.trim().slice(0, 40), label: f.getAttribute('aria-label'), x: +f.getBoundingClientRect().left.toFixed(1), t: +((f.getBoundingClientRect().left - rl) / pps).toFixed(3), time: f.dataset.markerTime || f.dataset.time || null })); });
    res.f1 = await flags(); res.st1 = await L.status(p); res.u1 = await undoT(p);
    await X.shot(p, `${res.id}-marker.png`);
    await L.seekTo(p, 0); res.p0 = await L.posNow(p);
    const fl = p.locator('[data-testid=arrangement-marker-strip] [data-marker-id]').first(); const fb = await fl.boundingBox();
    await p.mouse.click(fb.x + 4, fb.y + fb.height / 2); await sleep(400); res.pClick = await L.posNow(p);
    await L.seekTo(p, 0); await L.blur(p); await p.keyboard.press('Control+ArrowRight'); await sleep(400); res.pNext = await L.posNow(p); res.stNext = await L.status(p);
    res.undo = await X.key(p, 'Control+z'); res.f2 = await flags(); res.u2 = await undoT(p);
    res.checks = { flag: res.f1.length === 1 && /აქ შედის მუსიკა/.test(res.f1[0].text + (res.f1[0].label || '')) && Math.abs(res.f1[0].t - 12) < 0.1, click: res.pClick === 12, next: res.pNext === 12, undo: res.f2.length === 0 };
  },
  async 'RG-24'(p, res) {
    await L.setSnapOff(p); await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2); await L.addAt(p, 'demo-soft-impact', 'sfx', 6);
    let m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); await L.selectClip(p, m.id); await L.seekTo(p, 10); await X.key(p, 'Control+e');
    const m2 = (await L.clipsDom(p)).find((c) => c.lane === 'music' && c.start === 10); await L.selectClip(p, m2.id); await X.key(p, 'Delete');
    res.t0 = await X.clipTable(p);
    m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    await X.rangeDrag(p, m.id, 3, 5); res.del = await X.key(p, 'Delete'); res.t1 = await X.clipTable(p);
    res.u1 = await X.key(p, 'Control+z'); res.t1u = await X.clipTable(p);
    m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    await X.rangeDrag(p, m.id, 3, 5); res.bs = await X.key(p, 'Backspace'); res.t2 = await X.clipTable(p);
    res.u2 = await X.key(p, 'Control+z'); res.t2u = await X.clipTable(p);
    m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
    await X.rangeDrag(p, m.id, 3, 5); res.all = await X.key(p, 'Control+Shift+l');
    await X.shot(p, `${res.id}-all-lanes.png`);
    res.cut = await X.key(p, 'Control+Shift+x'); res.t3 = await X.clipTable(p);
    const f = (t, ln) => t.filter((r) => r.lane === ln);
    const gapOk = (t) => { const mu = f(t, 'music'); return mu.length === 2 && mu[0].start === 0 && mu[0].end === 3 && mu[1].start === 5 && mu[1].end === 10 && mu[1].offset === 5 && JSON.stringify(t.filter((r) => r.lane !== 'music')) === JSON.stringify(res.t0.filter((r) => r.lane !== 'music')); };
    const mu3 = f(res.t3, 'music'), st3 = f(res.t3, 'stems'), sx3 = f(res.t3, 'sfx');
    res.checks = { del: gapOk(res.t1), undo1: X.tblKey(res.t1u) === X.tblKey(res.t0), bs: gapOk(res.t2), undo2: X.tblKey(res.t2u) === X.tblKey(res.t0), allLanes: /ყველა ხაზზე: 00:03\.000 — 00:05\.000/.test(res.all), cutTime: mu3.length === 2 && mu3[0].end === 3 && mu3[1].start === 3 && mu3[1].end === 8 && mu3[1].offset === 5 && st3.length === 2 && st3[0].start === 2 && st3[0].end === 3 && st3[1].start === 3 && st3[1].offset === 3 && st3[1].end === 16 && sx3[0].start === 4 };
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
