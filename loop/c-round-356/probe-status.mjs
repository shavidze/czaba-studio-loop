import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
for(let i=0;i<8;i++){await p.waitForTimeout(5000);console.log(i,await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));}
await br.close();
