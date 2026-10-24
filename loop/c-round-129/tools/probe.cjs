const H = require('./h3.cjs'); const { X, L, sleep } = H;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe', net);
  await L.setSnapOff(p); await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  const r = { a: H.brief(await H.cl(p)), ph: await L.posNow(p) };
  const pt = await H.laneBgPoint(p, 'sfx', 12); await p.mouse.click(pt.x, pt.y); await sleep(400);
  r.b = H.brief(await H.cl(p)); r.ph2 = await L.posNow(p); r.range = await H.range(p); r.status = await L.status(p);
  console.log(JSON.stringify(r)); await b.close();
})();
