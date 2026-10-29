const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 let navs = 0; p.on('framenavigated', (f) => { if (f === p.mainFrame()) navs += 1; });
 const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,200)); });
 await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
 await p.waitForTimeout(20000);
 console.log(JSON.stringify({navs, status: await p.locator('[data-testid="arrangement-status"]').textContent().catch(e=>String(e)), errs: errs.slice(0,8)}));
 await b.close(); })();
