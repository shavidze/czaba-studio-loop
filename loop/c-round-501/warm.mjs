import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
for (const u of ['/free-downloads','/','/hire-us']) { try { await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'load',timeout:60000}); await p.waitForTimeout(4000);} catch(e){console.log(u,e.message)} }
await b.close();
