const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.chromium.launch({ headless: true }); const net = [];
  const o = await L.openStudio(b, X.VPS[1440], 'probe178c', net, {}); const p = o.page; const r = {};
  r.tree = await p.evaluate(() => { const all = [...document.querySelectorAll('button[aria-current]')][0]; const c = all.parentElement.parentElement; return [...c.querySelectorAll('button')].map((b) => `${b.getAttribute('aria-label') || ''}|${b.textContent.trim().slice(0, 30)}`); });
  console.log(JSON.stringify(r, null, 1)); await b.close(); })();
