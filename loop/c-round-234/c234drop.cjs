const fs=require('node:fs');const path=require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch();const R={};
for(const vp of [{width:1440,height:900},{width:1280,height:720}]){const key=`${vp.width}x${vp.height}`;
const ctx=await browser.newContext({viewport:vp});const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
await page.waitForFunction(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Add/.test(x.textContent.trim()));return b&&!b.disabled},undefined,{timeout:120000});await sleep(800);
const lane=page.locator('[data-track-id] [data-testid="arrangement-lane"], [data-testid="arrangement-lane"]').nth(1);
const lanes=await page.evaluate(()=>[...document.querySelectorAll("[data-track-id]")].map(l=>({t:l.getAttribute("data-track-id"),txt:l.textContent.slice(0,40),b:l.getBoundingClientRect().toJSON()})));
const target=lanes.find(l=>/Music/.test(l.txt));target.b.x+=400;
const src=page.locator('[data-source-id="demo-stem-pulse"]').first();
await src.dragTo(page.locator('body'),{targetPosition:{x:Math.round(target.b.x+120),y:Math.round(target.b.y+target.b.height/2)}});
await sleep(900);
R[key]=await page.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');return{lanes:document.querySelectorAll('[data-testid="arrangement-lane"]').length,tempo:document.querySelector('[data-testid="arrangement-tempo-input"]').value,div:g.getAttribute('data-grid-division'),snap:g.getAttribute('data-snap'),clips:[...document.querySelectorAll('[data-clip-id]')].map(c=>c.getAttribute('data-clip-start')),status:document.querySelector('[data-testid="arrangement-status"]').textContent}});
R[key].target=target;R[key].errors=errors;await page.screenshot({path:path.join('out',`drop-${key}.png`)});await ctx.close();}
await browser.close();fs.writeFileSync('out/c234drop.json',JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));})();
