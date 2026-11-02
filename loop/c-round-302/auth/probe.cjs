const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const c = await b.newContext(); const p = await c.newPage();
  p.on('framenavigated', (f) => { if (f === p.mainFrame()) console.log('nav', f.url()); }); p.on('pageerror', (e) => console.log('err', String(e).slice(0, 200)));
  const r = await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'networkidle' }); console.log('status', r.status());
  for (let i = 0; i < 6; i++) { await p.waitForTimeout(1000); console.log(i, p.url(), await p.evaluate(() => [!!document.body, document.body ? document.body.innerText.slice(0, 120).replace(/\n/g, ' | ') : null, document.querySelectorAll('audio[src]').length])); }
  await b.close(); })();
