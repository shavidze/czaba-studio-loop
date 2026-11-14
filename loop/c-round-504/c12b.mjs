import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:5173/account/downloads',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>[...document.querySelectorAll('a[href*="download" i]')].map(a=>a.getAttribute('href')+' | '+a.textContent.trim().slice(0,40)+' | '+(a.closest('header,footer,nav')?.tagName||'main'))));
await b.close();
