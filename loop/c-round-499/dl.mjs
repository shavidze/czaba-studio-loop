import { createRequire } from 'module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:5173/account/downloads',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(2000);
console.log(await p.locator('a[download], a[href*="download" i]:not([href="/account/downloads"])').evaluateAll(e=>e.map(x=>x.outerHTML.slice(0,160))));
await b.close();
