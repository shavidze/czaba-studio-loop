import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000}); await p.waitForTimeout(8000);
console.log((await p.locator('body').innerText({timeout:60000})).slice(0,300)); await b.close();
