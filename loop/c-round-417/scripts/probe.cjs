const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const e=[];p.on('pageerror',x=>e.push(String(x).slice(0,150)));p.on('console',m=>{if(m.type()==='error')e.push('c:'+m.text().slice(0,120))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(5000);
console.log(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent), e.slice(0,6));await b.close()})();
