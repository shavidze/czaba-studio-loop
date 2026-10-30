const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,200))});
await p.goto('http://127.0.0.1:5186/studio-lab');
for(let i=0;i<4;i++){await new Promise(r=>setTimeout(r,5000));console.log(i, JSON.stringify(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent)));}
await p.screenshot({path:__dirname+'/../shots/peek.png'});console.log(errs.slice(0,10));await b.close();})();
