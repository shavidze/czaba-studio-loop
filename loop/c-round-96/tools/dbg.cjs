const X = require('./ext.cjs');
(async () => { const b = await X.launch(); const { page: p, S } = await X.newCtx(b, { width: 1280, height: 720 }, 'dbg');
await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
await X.sleep(8000); console.log(await X.status(p));
console.log(await p.$$eval('[role=option]', os => os.map(o => [o.dataset.sourceId, o.innerText.slice(0,60)])));
await p.screenshot({ path: X.SHOTS + '/dbg.png' }); console.log(S.errors); await b.close(); })();
