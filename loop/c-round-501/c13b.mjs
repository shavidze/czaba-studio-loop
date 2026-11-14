import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b=await chromium.launch(); const p=await b.newPage(); await p.goto('http://127.0.0.1:5173/account/downloads',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(3000);
console.log(await p.locator('a[href*="download"], a[download]').evaluateAll(a=>a.map(x=>x.href+' | '+x.textContent.trim().slice(0,30)))); await b.close();
