const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
 p.on('pageerror', e => console.log('ERR', String(e).slice(0,200)));
 await p.goto('http://127.0.0.1:5173/studio-lab');
 for (let i=0;i<12;i++){ await p.waitForTimeout(5000); console.log(i, JSON.stringify(await p.evaluate(()=>({s:document.querySelector('[data-testid="arrangement-status"]')?.textContent, t:document.title, n:document.body.innerText.length})))); }
 await p.screenshot({path: __dirname + '/shots/probe-status.png'}); await b.close(); })();
