const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const browser=await chromium.launch();const R={};
for (const [w,h] of [[1440,900],[1280,720]]){const ctx=await browser.newContext({viewport:{width:w,height:h}});const page=await ctx.newPage();
await page.goto(process.argv[2]+'/studio-lab');
await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:150000});
await sleep(800);await page.locator('[data-source-id="demo-stem-pulse"]').first().click();await sleep(250);await page.locator('button',{hasText:/^Add/}).first().click();await sleep(1000);
await page.evaluate(()=>document.activeElement&&document.activeElement.blur());for(let i=0;i<4;i++){await page.keyboard.press('Equal');await sleep(150);}
const ph=await page.locator('[data-testid="arrangement-playhead"]').boundingBox();
const sfx=await page.evaluate(()=>{const lanes=[...document.querySelectorAll('[data-track-id]')];return lanes.map(l=>{const b=l.getBoundingClientRect();return {track:l.getAttribute('data-track-id'),y:b.y,h:b.height};});});
const last=sfx[sfx.length-1];
const x=ph.x+ph.width/2+2*97.7, y=last.y+last.h/2;
const target=await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);const lane=e&&e.closest('[data-track-id]');return {el:e&&(e.getAttribute('data-testid')||e.tagName),inLane:!!lane};},[x,y]);
await page.mouse.click(x,y);await sleep(400);
const after=await page.evaluate(()=>({marker:document.querySelector('[data-testid="arrangement-insert-marker"]').getAttribute('data-insert-marker'),status:document.querySelector('[data-testid="arrangement-status"]').textContent,playing:!!document.querySelector('[aria-label="Pause"]')}));
R[`${w}x${h}`]={lanes:sfx,click:{x,y},target,after};await ctx.close();}
fs.writeFileSync(process.argv[3],JSON.stringify(R,null,1));await browser.close();})().catch(e=>{console.error(e);process.exit(1);});
