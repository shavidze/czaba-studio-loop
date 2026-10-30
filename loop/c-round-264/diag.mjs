import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,300))); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,200))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000});
for (let i=0;i<6;i++){ await p.waitForTimeout(5000);
 console.log(i, JSON.stringify(await p.evaluate(()=>({ready:[...document.querySelectorAll('*')].filter(e=>e.childElementCount===0&&/Demo collection ready/.test(e.textContent||'')).map(e=>e.tagName+'|'+e.className.toString().slice(0,60)), status:document.querySelector('[data-testid="arrangement-status"]')?.textContent, options:document.querySelectorAll('[role=option]').length}))));}
await p.screenshot({path:'diag-1440.png'}); console.log(errs.slice(0,10)); await b.close();
