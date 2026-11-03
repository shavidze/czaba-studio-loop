const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const log=[];p.on('console',m=>log.push(m.type()+': '+m.text().slice(0,160)));p.on('pageerror',e=>log.push('PAGEERR '+String(e).slice(0,200)));p.on('requestfailed',r=>log.push('REQFAIL '+r.url().slice(0,100)+' '+r.failure()?.errorText));
const t=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{timeout:180000});
try{await p.waitForFunction(()=>/collection ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:150000});console.log('READY',Date.now()-t);}catch(e){console.log('NOT READY',Date.now()-t, await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));}
console.log(log.slice(0,25).join('\n'));await b.close();})();
