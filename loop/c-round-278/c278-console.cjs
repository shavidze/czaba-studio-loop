const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 p.on('console', m => console.log('console', m.type(), m.text().slice(0,200))); p.on('pageerror', e => console.log('pageerror', String(e).slice(0,300)));
 p.on('response', r => { if (r.status() >= 400) console.log('resp', r.status(), r.url().slice(0,150)); });
 await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(8000);
 console.log('TEXT', (await p.evaluate(() => document.body.innerText)).slice(0, 300)); await b.close(); })();
