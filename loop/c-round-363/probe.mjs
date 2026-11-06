import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const br=await chromium.launch();const p=await (await br.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,150))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});await p.waitForTimeout(15000);
console.log(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));
await p.screenshot({path:'probe.png'});await br.close();
