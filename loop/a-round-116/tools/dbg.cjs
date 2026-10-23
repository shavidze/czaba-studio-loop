const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const o = await L.openCtx(b, { width: 1440, height: 900 }, 'dbg', net);
  await o.page.goto(L.BASE + '/studio-lab', { waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 20; i++) {
    const s = await o.page.evaluate(() => ({ url: location.href, grid: !!document.querySelector('[data-testid=arrangement-grid-control]'), lanes: document.querySelectorAll('[data-track-id]').length, title: document.title }));
    console.log(i, JSON.stringify(s)); await L.sleep(1500);
  }
  await o.page.screenshot({ path: '../shots/dbg.png' });
  console.log(JSON.stringify(net[0].errors.slice(0, 5)));
  await b.close();
})();
