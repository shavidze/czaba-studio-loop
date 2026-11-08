import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage(); const errs=[];
p.on('pageerror', e=>errs.push(String(e).slice(0,120)));
for (let i=0;i<3;i++){ await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000}).catch(e=>errs.push('nav '+e.message.slice(0,80))); await p.waitForTimeout(3000);
 const n=await p.locator('[data-testid="arrangement-library-preview-wave"]').count(); console.log('try',i,'wave',n,errs.length); if(n) break; errs.length=0; }
console.log(errs); await b.close();
