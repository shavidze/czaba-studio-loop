const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,150))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
for(let i=0;i<20;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent);console.log(i,s);if(/ready/i.test(s||''))break;}
console.log(await p.evaluate(()=>document.body.innerText.slice(0,300)));console.log(errs.slice(0,5));await b.close();})();
