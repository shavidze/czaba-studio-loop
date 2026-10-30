const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,200))});
await p.goto('http://127.0.0.1:5173/studio-lab');for(let i=0;i<6;i++){await p.waitForTimeout(5000);console.log(i,JSON.stringify(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent)));}
console.log(errs.slice(0,15).join('\n'));await b.close();})();
