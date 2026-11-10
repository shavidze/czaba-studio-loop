const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const out={};
for(const [w,h] of [[1440,900],[1280,720]]){const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.getByTestId('arrangement-status').filter({hasText:/^Demo collection ready/}).waitFor({timeout:60000});await p.waitForTimeout(1500);
const opts=await p.evaluate(()=>[...document.querySelectorAll('[role=option][data-source-id]')].map(o=>o.getAttribute('data-source-id')+'|'+o.textContent.slice(0,30)));
const r={opts:opts.slice(0,12)};
const sfx=p.locator('[role=option][data-source-id="demo-soft-impact"]');await sfx.scrollIntoViewIfNeeded();await sfx.focus();await p.keyboard.press('Enter');await p.waitForTimeout(800);
r.status=await p.getByTestId('arrangement-status').textContent();
r.bars=await p.evaluate(()=>{const e=document.querySelector('[data-testid="arrangement-bars-ruler"]');if(!e)return null;const bb=e.getBoundingClientRect();return {x:bb.x,y:bb.y,w:bb.width,h:bb.height,txt:e.textContent.slice(0,60)}});
r.minsec=await p.evaluate(()=>{const e=document.querySelector('[data-testid="arrangement-ruler"]');if(!e)return null;const bb=e.getBoundingClientRect();return {x:bb.x,y:bb.y,w:bb.width,h:bb.height,ticks:document.querySelectorAll('[data-testid="arrangement-ruler-tick"]').length}});
r.tempo=await p.evaluate(()=>(document.querySelector('[data-testid*="tempo"]')?.textContent??null));
r.before=await p.evaluate(()=>({ph:document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'),m:document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker')??null,playing:[...document.querySelectorAll('button')].some(x=>/^Pause/.test(x.getAttribute('aria-label')||x.textContent))}));
if(r.bars&&r.bars.w>0){await p.mouse.click(r.bars.x+r.bars.w*0.3,r.bars.y+r.bars.h/2);await p.waitForTimeout(800);}
r.after=await p.evaluate(()=>({ph:document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow'),m:document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker')??null,playing:[...document.querySelectorAll('button')].some(x=>/^Pause/.test(x.getAttribute('aria-label')||x.textContent))}));
r.statusAfter=await p.getByTestId('arrangement-status').textContent();
await p.screenshot({path:`out/nobpm-${w}.png`});r.errors=errs;out[w]=r;await ctx.close();}
fs.writeFileSync('out/nobpm.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));await b.close();})();
