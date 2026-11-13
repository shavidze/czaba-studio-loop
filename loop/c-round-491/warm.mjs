import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:5193/account',{waitUntil:'load'}); await p.waitForTimeout(2000); await b.close(); console.log('warm');
