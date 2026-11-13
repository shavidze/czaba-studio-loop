import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,200))); p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded',timeout:90000});
for (let i=0;i<8;i++){ await p.waitForTimeout(3000); console.log(i, await p.locator('[data-testid="arrangement-timeline-scroller"]').count(), (await p.locator('body').innerText()).replace(/\s+/g,' ').slice(0,150)); }
await p.screenshot({path:'c-round-495/probe.png'});
console.log(errs.slice(0,8));
await b.close();
