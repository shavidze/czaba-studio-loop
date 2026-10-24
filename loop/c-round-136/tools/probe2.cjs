const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe136b', net);
  const g = await L.geo(p);
  const r = await p.evaluate(() => ({ ruler: document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON(), sc: (() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return { cw: s.clientWidth, sw: s.scrollWidth }; })(), end: (document.querySelector('[data-testid=arrangement-project-end]') || {}).textContent, lanes: [...document.querySelectorAll('[data-track-id]')].map((e) => e.dataset.trackId) }));
  console.log(JSON.stringify({ g, r }));
  // seek exact via playhead handle keys
  await p.keyboard.press('Home'); await sleep(200);
  await p.focus('[data-testid=arrangement-playhead-handle]');
  for (let i = 0; i < 30; i++) await p.keyboard.press('ArrowRight');
  await sleep(300); console.log('pos', await L.posNow(p));
  // empty lane drag
  const lb = await p.locator('[data-track-id=music]').first().boundingBox();
  const y = lb.y + lb.height / 2; const x0 = g.rl + 8 * g.pps, x1 = g.rl + 10 * g.pps;
  await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move(x0 + 20, y, { steps: 5 }); await p.mouse.move(x1, y, { steps: 5 }); await p.mouse.up(); await sleep(400);
  console.log('status', await L.status(p));
  console.log(JSON.stringify(await p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-detail-start]'), e = document.querySelector('[data-testid=arrangement-detail-end]'); return { s: s && s.value, e: e && e.value, strip: !!document.querySelector('[data-testid=arrangement-loop-strip]'), rangeEls: [...document.querySelectorAll('[data-testid*=range]')].map((x) => x.dataset.testid) }; })));
  await p.screenshot({ path: L.SHOTS + '/probe2.png' });
  await b.close();
})();
