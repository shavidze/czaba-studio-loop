const X = require('./lib91.cjs');
(async () => { const b = await X.launch(); const { ctx, page, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'warm');
  await page.goto(X.URL, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 }); await X.sleep(5000);
  const r = await page.evaluate(() => ({ ruler: !!document.querySelector('[data-testid=arrangement-ruler]'), badge: document.body.innerText.match(/demo|დემო/i)?.[0] ?? null }));
  console.log(JSON.stringify({ r, errors: S.errors })); await b.close(); })().catch((e) => { console.error(e); process.exit(1); });
