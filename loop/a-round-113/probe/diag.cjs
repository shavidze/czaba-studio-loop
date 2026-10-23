const L = require('./lib.cjs');
(async () => {
  const b = await L.launch(); const net = [];
  const o = await L.openStudio(b, { width: 1440, height: 900 }, 'diag', net, { hasTouch: true, isMobile: false });
  const info = await o.page.evaluate(() => ({ grid: !!document.querySelector('[data-testid=arrangement-grid-control]'), snap: [...document.querySelectorAll('[data-testid]')].map((e) => e.dataset.testid).filter((t) => /snap|grid/.test(t)) }));
  console.log(JSON.stringify(info), JSON.stringify(net[0].errors), JSON.stringify(net[0].hydration));
  await o.page.screenshot({ path: '../shots/diag-1440.png' });
  await b.close();
})();
