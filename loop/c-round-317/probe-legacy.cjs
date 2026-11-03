const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200))); p.on('console', c => { if (c.type() === 'error') errs.push('console: ' + c.text().slice(0, 200)); });
  const t0 = Date.now(); const r = await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load', timeout: 120000 });
  for (let i = 0; i < 20; i++) { const len = await p.evaluate(() => document.body ? document.body.innerText.length : -1); if (len > 0) break; await p.waitForTimeout(1000); }
  const info = await p.evaluate(() => ({ len: document.body.innerText.length, text: document.body.innerText.slice(0, 300), html: document.body.innerHTML.length }));
  console.log(JSON.stringify({ status: r.status(), ms: Date.now() - t0, info, errs: errs.slice(0, 8) }, null, 1)); await p.screenshot({ path: __dirname + '/shots/probe-legacy-1440.png' }); await b.close(); })();
