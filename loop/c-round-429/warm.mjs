import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{timeout:120000,waitUntil:'load'}); await p.waitForTimeout(5000); console.log(await p.title()); await b.close();
