import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,200))});p.on('response',r=>{if(r.status()>=400&&!/5199/.test(r.url()))console.log(r.status(),r.url().slice(0,120))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.waitForTimeout(8000);
console.log(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));await b.close();
