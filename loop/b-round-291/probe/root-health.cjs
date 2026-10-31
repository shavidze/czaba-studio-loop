const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  const bad = []; p.on('response', r => { if (r.status() >= 500) bad.push(r.status()+' '+r.url()); });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0,200)));
  await p.goto(process.argv[2] || 'http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  const ok = await p.locator('[data-testid="arrangement-exit"]').count();
  console.log(JSON.stringify({ bad, errs, exitCount: ok }));
  await b.close();
})();
