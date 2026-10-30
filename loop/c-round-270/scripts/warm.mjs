import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,200))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
await p.goto(process.argv[2]+'/studio-lab',{waitUntil:'load',timeout:180000});
for (let i=0;i<20;i++){ await p.waitForTimeout(5000); const s=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent??'(none)'); console.log(i,s.slice(0,80)); if(s.includes('Demo collection ready'))break;}
console.log(errs.slice(0,8)); await b.close();
