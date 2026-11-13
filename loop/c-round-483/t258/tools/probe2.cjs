const L = require('./lib.cjs');
(async () => {
  const browser = await L.launch(); const net = [];
  const o = await L.openStudio(browser, { width: 1440, height: 900 }, 'probe2', net);
  const p = o.page;
  await L.setSnapOff(p);
  console.log(await L.addAt(p, 'demo-middle-east', 'music', 0));
  const c = (await L.clipsDom(p))[0]; console.log(c);
  await L.selectClip(p, c.id);
  console.log(await p.evaluate(() => { const e = document.querySelector('[data-clip-id]'); return { ds: { ...e.dataset }, hint: document.querySelector('[data-testid=arrangement-shortcut-hint]').textContent, hintTitle: document.querySelector('[data-testid=arrangement-shortcut-hint]').getAttribute('title') }; }));
  console.log(await L.detailInfo(p));
  console.log(await p.evaluate(() => ({ start: document.querySelector('[data-testid=arrangement-detail-start]').outerHTML.slice(0,300), end: document.querySelector('[data-testid=arrangement-detail-end]').outerHTML.slice(0,300), split: [...document.querySelectorAll('button')].find(b=>/Split/.test(b.textContent)).outerHTML.slice(0,400) })));
  await browser.close();
})();
