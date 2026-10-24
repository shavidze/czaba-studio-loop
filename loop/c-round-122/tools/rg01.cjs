const X = require('./lib122.cjs'); const { L, sleep } = X;
const vp = process.argv[2] || '1440'; const id = `RG-01-${vp}`;
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try {
    const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net);
    res.badge = await p.evaluate(() => document.body.innerText.includes('დემო კოლექცია') && !!document.querySelector('[data-testid=arrangement-grid-control]'));
    res.geo = await L.geo(p);
    await L.setSnapOff(p);
    res.add1 = await L.addAt(p, 'demo-synth-mix', 'music', 0);
    res.add2 = await L.addAt(p, 'demo-soft-impact', 'music', 17);
    res.t0 = await X.clipTable(p);
    const c = (await L.clipsDom(p)).find((x) => x.lane === 'music' && x.start === 0);
    await L.selectClip(p, c.id);
    res.pos = await L.seekTo(p, 4);
    res.split = await X.key(p, 'Control+e');
    res.t1 = await X.clipTable(p);
    const second = (await L.clipsDom(p)).find((x) => x.lane === 'music' && Math.abs(x.start - 4) < 0.01);
    await L.selectClip(p, second.id);
    res.del = await X.key(p, 'Delete');
    res.t2 = await X.clipTable(p);
    await X.shot(p, `${id}-after-delete.png`);
    res.undo = await X.key(p, 'Control+z'); res.t3 = await X.clipTable(p);
    res.redo = await X.key(p, 'Control+Shift+z'); res.t4 = await X.clipTable(p);
    const m = (t) => t.filter((r) => r.lane === 'music');
    const t1 = m(res.t1), t2 = m(res.t2);
    const a = t1.find((r) => r.start === 0), s = t1.find((r) => Math.abs(r.start - 4) < 0.001);
    res.checks = {
      badge: res.badge,
      split: !!a && !!s && Math.abs(a.end - 4) < 0.002 && Math.abs(s.end - 16) < 0.002 && Math.abs(s.offset - (a.offset + 4)) < 0.002,
      delGap: t2.length === 2 && t2[0].start === 0 && Math.abs(t2[0].end - 4) < 0.002 && t2[1].start === 17,
      undoExact: X.tblKey(res.t3) === X.tblKey(res.t1),
      redoExact: X.tblKey(res.t4) === X.tblKey(res.t2),
    };
    await p.context().close();
  } catch (e) { res.error = String(e).slice(0, 500); }
  res.net = X.netOk(net); await b.close();
  L.save(L.OUT, `${id}.json`, res);
  const pass = !res.error && Object.values(res.checks || {}).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 4000)); console.log('PASS?', pass);
})();
