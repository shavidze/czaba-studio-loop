// C248: adaptive '3' / '1' / menu Narrowest at a musical tempo with hidden lines. usage: node adaptive3.cjs <base> <out.json>
const fs=require('node:fs');const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const R={};
const gc=(p)=>p.evaluate(()=>{const c=document.querySelector('[data-testid=arrangement-grid-control]');return {div:c.dataset.gridDivision,mode:c.dataset.gridMode,lines:c.dataset.gridLines,paused:c.dataset.snapPaused,snap:c.dataset.snap,zoom:document.querySelector('[data-testid=arrangement-zoom-readout]').textContent,status:document.querySelector('[data-testid=arrangement-status]').textContent.replace(/“[^”]*”/g,'“…”')}});
async function slider(p,v){await p.evaluate((v)=>{const i=document.querySelector('[data-testid=arrangement-zoom]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,String(v));i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));},v);await sleep(300);}
async function zoomTo(p,t){let lo=0,hi=1000;while(lo<hi){const m=(lo+hi)>>1;await slider(p,m);const z=parseFloat((await gc(p)).zoom);if(z>=t)hi=m;else lo=m+1;}await slider(p,lo);}
(async()=>{const b=await chromium.launch();
for (const vp of [{width:1440,height:900},{width:1280,height:720}]) for (const target of [4,2.5]) {
 const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
 await p.goto(process.argv[2]+'/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await sleep(800);
 await p.locator('[data-source-id="demo-stem-pulse"]').first().click();await sleep(250);await p.locator('button',{hasText:/^Add/}).first().click();await sleep(900);await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
 const steps=[];const st=async(l)=>steps.push([l,await gc(p)]);
 await zoomTo(p,target);await st('zoom');
 for (const k of ['Digit1','Digit1','Digit3','Digit3']){await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.keyboard.press(k);await sleep(400);await st(k);}
 const lb=await p.locator('[data-track-id="stems"] [data-grid-lines]').first().boundingBox();
 await p.mouse.click(lb.x+100,lb.y+lb.height/2,{button:'right'});await sleep(500);
 const it=p.locator('[role=menu] [role^=menuitem]',{hasText:/Narrowest/}).first(); if(await it.count()){await it.click();await sleep(400);await st('menu Narrowest');}
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.keyboard.press('Digit3');await sleep(400);await st('Digit3 after Narrowest');
 R[`${target}@${vp.width}`]={steps,errors};await p.screenshot({path:process.argv[3].replace('.json',`-${target}-${vp.width}.png`)});await ctx.close();
 for (const [l,g] of steps) console.log(vp.width,target,l,g.div,g.mode,g.zoom,g.lines,'paused='+g.paused,'|',g.status);
}
fs.writeFileSync(process.argv[3],JSON.stringify(R,null,1));await b.close();})();
