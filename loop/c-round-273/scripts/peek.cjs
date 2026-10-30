const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{ if(m.type()==='error') errs.push('console:'+m.text().slice(0,150)); });
 await p.goto(process.argv[2] + '/studio-lab'); await new Promise(r=>setTimeout(r,25000));
 console.log(await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent), errs.slice(0,6)); await b.close(); })();
