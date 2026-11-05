const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
const r=await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:120000});console.log(r.status());
await p.waitForTimeout(15000);
console.log(JSON.stringify(await p.evaluate(()=>({len:document.body?.innerText.length,txt:document.body?.innerText.slice(0,200),aud:document.querySelectorAll('audio[src]').length,ws:!!document.querySelector('[data-testid="arrangement-transport"]')}))),errs);
await b.close();})();
