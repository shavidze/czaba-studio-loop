const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const t=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{timeout:300000});
try{await p.waitForFunction(()=>/collection ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:300000});}catch(e){console.log('timeout',await p.evaluate(()=>(document.body?.innerText ?? "").slice(0,300)));}
console.log('ready ms',Date.now()-t, await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));await b.close();})();
