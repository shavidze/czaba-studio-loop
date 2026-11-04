const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 const errs=[]; p.on('pageerror', e=>errs.push(String(e).slice(0,300))); p.on('console', m=>{ if(m.type()==='error') errs.push('c:'+m.text().slice(0,200)); });
 await p.goto(process.argv[2] + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
 for (let i=0;i<6;i++){ await p.waitForTimeout(5000); const s = await p.evaluate(() => ({st: document.querySelector('[data-testid="arrangement-status"]')?.outerHTML?.slice(0,300) ?? null, body: document.body.innerText.slice(0,300)})); console.log(i, JSON.stringify(s)); }
 console.log(errs.slice(0,8).join('\n')); await b.close(); })();
