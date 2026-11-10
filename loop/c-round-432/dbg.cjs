const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console',m=>console.log('C',m.type(),m.text().slice(0,200)));p.on('pageerror',e=>console.log('E',e.message.slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
for(let i=0;i<8;i++){await p.waitForTimeout(3000);console.log(i,await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));}
await b.close();})();
