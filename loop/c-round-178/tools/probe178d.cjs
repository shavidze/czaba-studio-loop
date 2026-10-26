const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.chromium.launch({ headless: true }); const net = [];
  const o = await L.openStudio(b, X.VPS[1280], 'probe178d', net, {}); const p = o.page; await X.openDetail(p);
  const r = await p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].map((e) => { const q = e.getBoundingClientRect(); const x = q.left + q.width * 0.7, y = q.top + q.height / 2; const h = document.elementFromPoint(x, y); return { id: e.dataset.trackId, gs: e.hasAttribute('data-grid-seconds'), inner: e.querySelectorAll('[data-grid-seconds]').length, box: [q.left, q.top, q.width, q.height].map(Math.round), hit: h && (h.getAttribute('data-testid') || h.tagName + '.' + (h.className || '').toString().slice(0, 40)), contains: e.contains(h) }; }));
  console.log(JSON.stringify(r)); await b.close(); })();
