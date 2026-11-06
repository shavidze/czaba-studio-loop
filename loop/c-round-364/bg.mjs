import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const D='/home/runner/czaba-project/tmp/studio-real-loop/c-round-364';
const [W,H]=(process.argv[2]??'1440x900').split('x').map(Number);
const br=await chromium.launch();
const ctx=await br.newContext({viewport:{width:W,height:H}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const page=await ctx.newPage();const R={vp:`${W}x${H}`};
const read=()=>page.evaluate(()=>{const im=document.querySelector('[data-testid="arrangement-insert-marker"]');const ck=document.querySelector('[data-clip-kind="audio"]');const cr=ck?.getBoundingClientRect();const undo=[...document.querySelectorAll('button')].find(b=>/^undo/i.test(b.getAttribute('title')??b.getAttribute('aria-label')??''));const rs=[...document.querySelectorAll('[data-testid="arrangement-lane-range"]')];
 return {im:im?.getAttribute('data-insert-marker')??null,clipStart:ck?.getAttribute('data-clip-start')??null,clipW:cr?Math.round(cr.width):null,undo:undo?(undo.getAttribute('title')??undo.getAttribute('aria-label')):null,laneRanges:rs.map(r=>r.closest('[data-track-id]')?.getAttribute('data-track-id')),rangeStarts:document.querySelectorAll('[data-range-start]').length,
 readout:document.querySelector('[data-testid="arrangement-range"]')?.textContent??null,
 selectedClips:[...document.querySelectorAll('[data-clip-id]')].filter(c=>c.getAttribute('aria-selected')==='true'||c.getAttribute('data-selected')==='true'||c.getAttribute('aria-pressed')==='true').length,
 pos:document.querySelector('[data-testid="arrangement-position"]')?.textContent,status:document.querySelector('[data-testid="arrangement-status"]')?.textContent}});
await page.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
await page.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:180000});
await page.waitForTimeout(1000);
await page.getByText('Full mix',{exact:true}).first().click();await page.keyboard.press('Enter');
const clip=page.locator('[data-clip-kind="audio"]').first();await clip.waitFor();await page.waitForTimeout(1500);
R.before=await read();
const g=await clip.evaluate((c)=>{const own=c.closest('[data-track-id]');const lanes=[...document.querySelectorAll('[data-track-id]')];
 for(const l of lanes){if(l===own||l.contains(own)||own.contains(l))continue;const b=l.getBoundingClientRect();const y=b.top+b.height/2;if(y<0||y>=innerHeight)continue;
  for(let x=b.left+4;x<b.right-130;x+=8){const h=document.elementFromPoint(x,y),h2=document.elementFromPoint(x+120,y);const ok=e=>e&&e.hasAttribute('data-grid-seconds')&&e.closest('[data-track-id]')===l&&!e.closest('[data-clip-id]')&&!e.closest('button,input,[role=slider]');if(ok(h)&&ok(h2))return {x,y,track:l.getAttribute('data-track-id'),own:own.getAttribute('data-track-id')}}}return null});
R.grab=g;
await page.mouse.move(g.x,g.y);await page.mouse.down();
for(let i=1;i<=6;i++){await page.mouse.move(g.x+i*10,g.y);}
R.mid=await read();
for(let i=7;i<=12;i++){await page.mouse.move(g.x+i*10,g.y);}
R.dragEnd=await read();
await page.mouse.up();await page.waitForTimeout(400);
R.afterUp=await read();R.gainEnabledAfterUp=await page.locator('[aria-label*="Clip gain" i],[aria-label*="Clip Gain"]').first().isEnabled().catch(()=>null);
await page.screenshot({path:`${D}/bg-range-${W}x${H}.png`});
const nb=await clip.evaluate(c=>{const b=c.querySelector('[data-testid*="header"],[data-testid*="name"]')?.getBoundingClientRect()??null;const r=c.getBoundingClientRect();return {x:r.left+20,y:b?b.top+b.height/2:r.top+8}});
await page.mouse.click(nb.x,nb.y);await page.waitForTimeout(400);
R.afterReset=await read();R.gainEnabledAfterReset=await page.locator('[aria-label*="Clip gain" i],[aria-label*="Clip Gain"]').first().isEnabled().catch(()=>null);
await page.screenshot({path:`${D}/bg-reset-${W}x${H}.png`});
writeFileSync(`${D}/bg-${W}x${H}.json`,JSON.stringify(R,null,1));console.log(JSON.stringify(R));await br.close();
