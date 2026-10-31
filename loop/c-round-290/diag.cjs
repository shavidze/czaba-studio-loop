const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console', m => { if (m.type()==='error') console.log('console', m.text().slice(0,150)); }); p.on('pageerror', e => console.log('pageerror', String(e).slice(0,200)));
const t0=Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab');
for (let i=0;i<24;i++){ await p.waitForTimeout(5000); const s = await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent||'(none)'); console.log((Date.now()-t0)/1000, s.slice(0,100)); if (/^Demo collection ready/.test(s)) break; }
await p.screenshot({path:'diag.png'}); await b.close(); })();
