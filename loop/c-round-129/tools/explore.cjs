const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'explore-1440', net);
  const r = {};
  r.snap = await L.setSnapOff(p);
  r.a1 = await L.addAt(p, 'demo-hero-music', 'music', 0);
  r.a2 = await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  r.a3 = await L.addAt(p, 'demo-soft-impact', 'sfx', 4);
  r.clips = await L.clipsDom(p);
  r.geo = await L.geo(p);
  r.status = await L.status(p);
  r.undo = await X.undoTitle(p);
  r.tracks = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map(e => e.dataset.trackId + ':' + (e.querySelector('[data-testid=arrangement-track-header]')||{}).textContent?.trim().slice(0,30)));
  r.sources = await p.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].map(e => e.dataset.sourceId + ' ' + e.textContent.trim().slice(0,40)));
  await p.screenshot({ path: L.SHOTS + '/explore-1440.png' });
  console.log(JSON.stringify({ r, net: X.netOk(net) }, null, 1));
  await b.close();
})();
