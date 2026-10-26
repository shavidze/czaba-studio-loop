import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
p.on('console', m => console.log('console', m.type(), m.text().slice(0,200)));
p.on('pageerror', e => console.log('pageerror', String(e).slice(0,300)));
await p.goto('http://127.0.0.1:5173/', {waitUntil:'load', timeout: 60000});
for (let i=0;i<8;i++){ await p.waitForTimeout(1000); console.log(i, await p.evaluate(()=>({loader: !!document.querySelector('[data-testid="entrance-loader"]'), fixed: document.querySelectorAll('.fixed.inset-0.z-50').length, ss: sessionStorage.getItem('czaba_entrance_seen'), h1: document.querySelectorAll('h1').length, rm: matchMedia('(prefers-reduced-motion: reduce)').matches}))); }
await b.close();
