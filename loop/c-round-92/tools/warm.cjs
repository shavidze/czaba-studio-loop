const X = require('./ext.cjs');
(async () => { const b = await X.launch(); const { page, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'warm');
  await page.goto(X.BASE + '/', { waitUntil: 'domcontentloaded' }); await X.sleep(8000);
  await page.goto(X.URL, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  const s = await X.waitStatus(page, (s) => s === X.READY); console.log(JSON.stringify({ status: s, errors: S.errors })); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
