const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,150))});
const t0=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
for(let i=0;i<20;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent||'NOSTATUS:'+document.body.innerText.slice(0,100));console.log(((Date.now()-t0)/1000).toFixed(1),s.slice(0,120));if(/ready/.test(s))break;}
console.log(errs.slice(0,10));await b.close();})();
