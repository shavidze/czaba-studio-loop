const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
const t=Date.now();await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:300000});
await p.waitForFunction(()=>document.body&&document.body.innerText.length>0,null,{timeout:300000});await p.waitForTimeout(3000);
console.log('warm ms',Date.now()-t, (await p.evaluate(()=>document.body.innerText)).slice(0,100));await b.close();})();
