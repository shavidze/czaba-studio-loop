const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
 const errs=[]; p.on('pageerror', e=>errs.push(String(e))); p.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,150)); });
 await p.goto(process.argv[2] + '/studio-lab'); for (let i=0;i<12;i++){ await new Promise(r=>setTimeout(r,5000)); console.log(i, await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent?.slice(0,120) ?? 'NOSTATUS')); }
 console.log(errs.slice(0,10)); await p.screenshot({path:'browser/st.png'}); await b.close(); })();
