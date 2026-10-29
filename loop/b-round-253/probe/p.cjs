const fs=require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE=process.argv[2]; const OUT=process.argv[3]; const tag=process.argv[4];
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await chromium.launch();
 const R={};
 for (const [w,h] of [[1440,900],[1280,720]]) for (const rm of ['no-preference','reduce']) {
  const key=`${w}x${h}-${rm}`; const r=R[key]={};
  const ctx=await browser.newContext({viewport:{width:w,height:h},reducedMotion:rm});
  const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(`${BASE}/studio-lab`,{waitUntil:'load'});
  await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:150000});
  await sleep(800);
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
  await page.locator('button',{hasText:/^Add/}).first().click(); await sleep(1000);
  await page.evaluate(()=>document.activeElement&&document.activeElement.blur());
  for(let i=0;i<4;i++){await page.keyboard.press('Equal');await sleep(150);}
  const lineInfo=()=>page.evaluate(()=>{const q=(s)=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return {x:+b.x.toFixed(1),w:+b.width.toFixed(2),h:+b.height.toFixed(1),display:cs.display,opacity:cs.opacity,bg:cs.backgroundColor,anim:cs.animationName,hiddenAttr:e.hasAttribute('hidden'),attr:e.getAttribute('data-insert-marker')};};return {marker:q('[data-testid="arrangement-insert-marker"]'),playhead:q('[data-testid="arrangement-playhead"]')};});
  r.start=await lineInfo();
  // click an empty lane area at 2 s: use the lanes container left + header + 2*pps; find the lane under it
  const lane=page.locator('[data-testid="arrangement-playhead"]');
  const ph=await lane.boundingBox();
  const clickX = r.start.playhead.x + 2*97.7; // 2 s at 97.7 px/s from 0
  const clickY = ph.y + 30;
  r.clickTarget=await page.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?(e.getAttribute('data-testid')||e.tagName):null;},[clickX,clickY]);
  await page.mouse.click(clickX, clickY); await sleep(400);
  r.afterClick=await lineInfo();
  await page.keyboard.press('Space'); await sleep(1600); await page.keyboard.press('Space'); await sleep(400);
  r.afterStop=await lineInfo();
  // opacity sampling
  const samples=[]; for(let i=0;i<24;i++){samples.push((await lineInfo()).marker.opacity); await sleep(100);} r.opacity=samples;
  // background under the marker line
  r.under=await page.evaluate(()=>{const m=document.querySelector('[data-testid="arrangement-insert-marker"]');const b=m.getBoundingClientRect();m.style.visibility='hidden';const p=document.querySelector('[data-testid="arrangement-playhead"]');const pv=p.style.visibility;p.style.visibility='hidden';const out=[];for(const dy of [20,60,120]){let e=document.elementFromPoint(b.x+0.5,b.y+dy);const chain=[];while(e){const c=getComputedStyle(e).backgroundColor;chain.push((e.getAttribute('data-testid')||e.tagName)+':'+c);if(c!=='rgba(0, 0, 0, 0)'&&!c.endsWith(', 0)'))break;e=e.parentElement;}out.push(chain.slice(-2));}m.style.visibility='';p.style.visibility=pv;return out;});
  await page.screenshot({path:`${OUT}/${tag}-${key}.png`});
  r.errors=errs; await ctx.close();
 }
 fs.writeFileSync(`${OUT}/${tag}.json`,JSON.stringify(R,null,1)); await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
