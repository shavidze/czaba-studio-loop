import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(()=>{ const t=setInterval(()=>{ if(document.body){const c=getComputedStyle(document.body,'::before'); if(c.content!=='none'&&document.getElementById('czaba-entrance-cover')?.media==='all'&&!window.__c12){window.__c12={bg:c.backgroundColor,z:c.zIndex,pos:c.position};clearInterval(t);} } },1); });
await p.goto('http://127.0.0.1:5191/',{waitUntil:'commit'}); await p.waitForTimeout(250);
await p.screenshot({path:'c12-covered-1440.png'});
console.log(JSON.stringify(await p.evaluate(()=>window.__c12)));
await b.close();
