const X = require('./lib122.cjs'); const { L, sleep } = X; const path=require('path');
(async () => {
  const b = await L.launch(); const net = [];
  const { page: p } = await L.openStudio(b, X.VPS[1440], 'probe', net);
  const info = await p.evaluate(() => ({
    sources: [...document.querySelectorAll('[role=option][data-source-id]')].map(o => [o.dataset.sourceId, o.textContent.trim().slice(0, 60)]),
    tracks: [...document.querySelectorAll('[data-track-id]')].filter(e=>e.querySelector('[data-testid=arrangement-track-header]')).map(e => [e.dataset.trackId, e.querySelector('[data-testid=arrangement-track-header]').textContent.trim().slice(0,40)]),
    buttons: [...document.querySelectorAll('button')].map(x => [x.textContent.trim().slice(0, 30), x.title, x.getAttribute('aria-label'), x.dataset.testid]).filter(x=>x.some(Boolean)).slice(0, 120),
    loop: [...document.querySelectorAll('[data-testid*=loop]')].map(e => [e.dataset.testid, e.tagName, e.textContent.trim().slice(0,40)]),
    status: document.querySelector('[data-testid=arrangement-status]')?.outerHTML.slice(0, 400),
  }));
  console.log(JSON.stringify(info, null, 0)); console.log(JSON.stringify(net));
  await p.screenshot({ path: path.join(L.SHOTS, 'probe-1440-r2.png') });
  await b.close();
})();
