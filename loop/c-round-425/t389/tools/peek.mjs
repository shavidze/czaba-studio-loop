import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,200))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150))});
const t=Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded',timeout:120000});
for(let i=0;i<12;i++){await p.waitForTimeout(5000); const n=await p.locator('[data-testid="arrangement-timeline-scroller"]').count(); console.log(Date.now()-t,n,(await p.title())); if(n)break;}
await p.screenshot({path:'screens/peek.png'}); console.log(errs.slice(0,8)); await b.close();
