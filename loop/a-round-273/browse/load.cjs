const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
  p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  const t0 = Date.now();
  await p.goto('http://127.0.0.1:5173/studio-lab', { timeout: 120000 });
  for (let i = 0; i < 60; i++) {
    const s = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
    if (i % 10 === 0 || (s && s.startsWith('Demo'))) console.log(Math.round((Date.now() - t0) / 1000) + 's', JSON.stringify(s));
    if (s && s.startsWith('Demo')) break;
    await new Promise((r) => setTimeout(r, 2000));
  }
  console.log(JSON.stringify(errs.slice(0, 10)));
  await p.screenshot({ path: __dirname + '/load-1440.png' });
  await b.close();
})();
