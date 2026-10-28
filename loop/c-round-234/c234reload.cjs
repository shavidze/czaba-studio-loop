const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
const ready=(page)=>page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Add/.test(x.textContent.trim()));return b&&!b.disabled},undefined,{timeout:120000});
const st=(page)=>page.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');return{tempo:document.querySelector('[data-testid="arrangement-tempo-input"]').value,div:g.getAttribute('data-grid-division'),snap:g.getAttribute('data-snap'),clips:document.querySelectorAll('[data-clip-id]').length,status:document.querySelector('[data-testid="arrangement-status"]').textContent,ls:Object.keys(localStorage),ss:Object.keys(sessionStorage)}});
(async()=>{const browser=await chromium.launch();const R={};
for(const vp of [{width:1440,height:900},{width:1280,height:720}]){const key=`${vp.width}x${vp.height}`;const ctx=await browser.newContext({viewport:vp});const page=await ctx.newPage();
await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await ready(page);await sleep(800);
await page.locator('[data-source-id="demo-stem-pulse"]').first().click();await sleep(200);await page.locator('button',{hasText:/^Add/}).first().click();await sleep(800);
const r={seeded:await st(page)};
r.idb=await page.evaluate(async()=>indexedDB.databases?(await indexedDB.databases()).map(d=>d.name):null);
await page.reload({waitUntil:'load'});await ready(page);await sleep(1200);r.afterReload=await st(page);
const t=page.locator('[data-testid="arrangement-tempo-input"]');await t.click();await t.fill('');await page.keyboard.press('Enter');await sleep(400);r.cleared=await st(page);
await page.reload({waitUntil:'load'});await ready(page);await sleep(1200);r.afterReload2=await st(page);
R[key]=r;await ctx.close();}
await browser.close();fs.writeFileSync('out/c234reload.json',JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));})();
