const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe3', net);
  console.log(await p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); const d = document.querySelector('[data-testid=arrangement-grid-division]'); return { ds: { ...g.dataset }, div: d.outerHTML.slice(0, 600), gridLines: [...document.querySelectorAll('[data-grid-seconds]')].slice(0, 2).map((e) => e.outerHTML.slice(0, 300)) }; }));
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-synth-mix', 'music', 0); await L.addAt(p, 'demo-stem-pulse', 'stems', 2);
  const m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
  await X.rangeDrag(p, m.id, 3, 5); await X.key(p, 'Control+Shift+l');
  console.log(await L.status(p));
  console.log(await p.evaluate(() => [...document.querySelectorAll('[data-range-start],[data-testid*=range]')].map((e) => (e.dataset.testid || '') + ' ' + JSON.stringify({ ...e.dataset }).slice(0, 200) + ' ' + Math.round(e.getBoundingClientRect().top) + '/' + Math.round(e.getBoundingClientRect().height)).slice(0, 12)));
  await X.shot(p, 'probe3-ctrl-shift-l.png');
  await b.close();
})();
