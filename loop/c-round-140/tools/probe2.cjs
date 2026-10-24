const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p, ctx } = await L.openStudio(b, { width: 1440, height: 900 }, 'probe2', net);
  await L.setSnapOff(p);
  const srcs = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map(o => ({ id: o.dataset.sourceId, t: o.textContent.trim().slice(0, 80) })));
  console.log(JSON.stringify(srcs));
  let t = 0; const out = [];
  for (const s of srcs) { const r = await L.addAt(p, s.id, 'music', t); const c = (await L.clipsDom(p)).filter(x => x.lane === 'music').pop(); out.push({ id: s.id, r: r.status, c }); t = c ? Math.ceil(c.start + c.wdur) + 1 : t + 1; }
  console.log(JSON.stringify(out, null, 1));
  await ctx.close(); await b.close();
})();
