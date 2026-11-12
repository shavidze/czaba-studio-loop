const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,150))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>document.body.innerText.slice(0,300)));
console.log(await p.locator('[data-testid^="arrangement-library"]').count());
await p.screenshot({path:'probe.png'});await b.close()})()
