import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
for (const u of ['/studio-lab','/products/middle-east']) { await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'networkidle',timeout:180000}).catch(e=>console.log('warm',u,String(e).slice(0,100))); await p.waitForTimeout(5000);} 
console.log('warm done'); await b.close();
