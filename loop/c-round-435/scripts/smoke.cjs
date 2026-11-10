const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const OUT=process.env.OUT;
(async()=>{const b=await chromium.launch();const res={};
for(const [w,h] of [[1440,900],[1280,720]]){const k=`${w}x${h}`;const r={};
const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
await p.getByText('Demo collection ready').first().waitFor({timeout:120000});await p.waitForTimeout(1000);
r.clipsBefore=await p.locator('[data-clip-id]').count();
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.waitForTimeout(250);
r.optName=await p.getByTestId('arrangement-library-list').getByRole('option').first().innerText();
await p.keyboard.press('Enter');await p.waitForTimeout(1000);
r.clipsAfter=await p.locator('[data-clip-id]').count();
r.clipBox=await p.locator('[data-clip-id]').first().boundingBox();
await p.screenshot({path:`${OUT}/clip-added-${k}.png`});
const clock=async()=>p.evaluate(()=>{const t=document.querySelector('[data-testid="arrangement-transport"]');return t?t.innerText.replace(/\s+/g,' '):null});
r.transportText=await clock();
const play=p.getByRole('button',{name:/^Play/i}).first();r.playCount=await p.getByRole('button',{name:/Play/i}).count();
// audio graph probe: AudioContext state
r.t0=await clock();
await play.click();await p.waitForTimeout(700);r.t1=await clock();await p.waitForTimeout(800);r.t2=await clock();
r.acState=await p.evaluate(()=>window.__acState||null);
await p.screenshot({path:`${OUT}/playing-${k}.png`});
const stop=p.getByRole('button',{name:/^Stop|Pause/i}).first();
r.stopFound=await stop.count();
if(r.stopFound)await stop.click(); else await p.keyboard.press('Space');
await p.waitForTimeout(500);r.s1=await clock();await p.waitForTimeout(700);r.s2=await clock();
await p.screenshot({path:`${OUT}/stopped-${k}.png`});
const ex=p.getByRole('button',{name:/Export/i}).first();r.exportBtn=await ex.count();
await ex.click();await p.waitForTimeout(800);
r.dialog=await p.getByRole('dialog').count();
r.dialogTitle=r.dialog?await p.getByRole('dialog').first().innerText().then(t=>t.slice(0,200)):null;
await p.screenshot({path:`${OUT}/export-open-${k}.png`});
await p.keyboard.press('Escape');await p.waitForTimeout(600);
r.dialogAfterEsc=await p.getByRole('dialog').count();
if(r.dialogAfterEsc){const c=p.getByRole('button',{name:/Cancel|Close|Done/i}).first();if(await c.count()){await c.click();await p.waitForTimeout(500);r.dialogAfterBtn=await p.getByRole('dialog').count();}}
r.errors=errs;res[k]=r;await ctx.close();}
fs.writeFileSync(OUT+'/smoke.json',JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1));await b.close();})();
