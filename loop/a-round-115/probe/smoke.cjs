const L = require('../../c-round-113/tools/lib.cjs');
(async () => {
  const b = await L.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await p.goto(L.BASE + '/studio-lab', { waitUntil: 'load' });
  await L.sleep(6000);
  console.log(await p.evaluate(() => ({ snap: !!document.querySelector('[data-testid=arrangement-snap-toggle]'), ws: !!document.querySelector('[data-testid=arrangement-detail-panel]'), text: document.body.innerText.slice(0, 300) })));
  console.log(errs.join('\n'));
  await b.close();
})();
