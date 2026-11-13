import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
for (const u of ['/account/orders','/studio-lab']) { await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'networkidle'}).catch(e=>console.log(e.message)); await p.waitForTimeout(2500); }
await b.close(); console.log('warm ok');
