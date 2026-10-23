const X = require('./lib90.cjs');
(async () => { const b = await X.launch(); const { ctx, page: p } = await X.newCtx(b, { width: 1280, height: 720 }, 'dbg');
await p.goto(X.URL, { waitUntil: 'domcontentloaded' }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 }); await X.sleep(5000);
console.log(await p.evaluate(() => ({ ruler: !!document.querySelector('[data-testid=arrangement-ruler]'), z: document.querySelector('[data-testid=arrangement-zoom-readout]')?.textContent, url: location.href, tids: [...document.querySelectorAll('[data-testid]')].slice(0,30).map(e=>e.dataset.testid) })));
await p.screenshot({ path: X.SHOTS + '/dbg.png' }); await b.close(); })();
