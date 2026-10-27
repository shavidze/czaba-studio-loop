const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe4', net);
  console.log(await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-track-height]')].map((e) => e.outerHTML.slice(0, 400))));
  await L.setSnapOff(p); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  const c = (await L.clipsDom(p))[0]; await L.selectClip(p, c.id); const bx = await X.clipBox(p, c.id); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height * 0.7); await sleep(300);
  console.log(await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const lane = e.closest('[data-track-id]').getBoundingClientRect(); return { lane: lane.toJSON(), clip: e.getBoundingClientRect().toJSON(), hs: [...e.querySelectorAll('[data-testid*=fade]')].map((h) => h.dataset.testid + ' ' + JSON.stringify(h.getBoundingClientRect().toJSON())) }; }, c.id));
  await b.close(); })();
