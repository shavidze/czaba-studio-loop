const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.waitForTimeout(15000);
console.log(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent||'NOSTATUS'));
console.log(await p.evaluate(()=>document.body.innerText.slice(0,300)));console.log(errs);await p.screenshot({path:'probe.png'});await b.close()})();
