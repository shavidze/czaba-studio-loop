const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
const wv=(p)=>p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-library-preview-wave]'); return {now:+e.getAttribute('aria-valuenow'),txt:e.getAttribute('aria-valuetext')};});
const optBox=(p,id)=>p.locator(`[role=option][data-source-id="${id}"]`).boundingBox();
async function dragToLane(p,id,lane,t,{alt=false,shotName=null}={}){ const ob=await optBox(p,id); const lb=await p.locator(`[data-track-id=${lane}] [data-testid=arrangement-lane], [data-track-id=${lane}]`).last().boundingBox(); const x=await X.tx(p,t); const y=lb.y+lb.height/2;
 await p.mouse.move(ob.x+20,ob.y+10); await p.mouse.down(); await p.mouse.move(ob.x+60,ob.y+20,{steps:4}); if(alt) await p.keyboard.down('Alt'); await p.mouse.move(x,y,{steps:12}); await sleep(250);
 const ghost=await p.evaluate(()=>{const g=document.querySelector('[data-testid*=ghost],[data-drop-ghost],[data-testid=arrangement-drop-preview]'); if(!g) return null; return {tid:g.dataset.testid,text:g.textContent.trim().slice(0,80),left:g.getBoundingClientRect().left,w:g.getBoundingClientRect().width};});
 if(shotName) await X.shot(p,shotName);
 await p.mouse.up(); if(alt) await p.keyboard.up('Alt'); await sleep(600); return {ghost,status:await L.status(p)}; }
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p2b-'+w,net,{extraInit:X.tapInit});
 const s=p.locator('[data-testid=arrangement-library-search]'); await s.fill('soft'); await sleep(300); await s.focus(); await p.keyboard.press('Escape'); await sleep(300); r.escInSearch={q:await s.inputValue(),n:(await p.evaluate(()=>document.querySelectorAll('[role=option][data-source-id]').length))};
 await s.fill(''); await sleep(300); await L.blur(p);
 // scrub
 await p.locator('[role=option][data-source-id="demo-synth-mix"]').click(); await sleep(300);
 const wb=await p.locator('[data-testid=arrangement-library-preview-wave]').boundingBox(); await p.mouse.click(wb.x+wb.width*0.5,wb.y+wb.height/2); await sleep(400); r.scrubIdle=await wv(p);
 const t0=Date.now(); r.playingAfterScrubClick=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-library-preview-toggle]').textContent.trim());
 await sleep(1000); r.scrubLater=await wv(p);
 await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(300); r.afterStop=await wv(p);
 await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(1000); r.resumeFrom=await wv(p); await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(300);
 // dblclick adds where?
 await L.setSnapOff(p); await p.click(L.nameSel('sfx')); await L.seekTo(p,2);
 await p.locator('[role=option][data-source-id="demo-soft-impact"]').dblclick(); await sleep(700); r.dbl={status:await L.status(p),clips:await L.clipsDom(p)};
 await p.keyboard.press('Control+z'); await sleep(400); await L.blur(p);
 // drag to lane: snap off at 3.37
 r.dragOff=await dragToLane(p,'demo-soft-impact','sfx',3.37,{shotName:`P2-drag-ghost-snapoff-${w}.png`}); r.dragOffClips=(await L.clipsDom(p)).filter(c=>c.lane==='sfx');
 // snap on 1s grid
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); await L.blur(p); r.snap=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
 r.dragOn=await dragToLane(p,'demo-slow-rise','stems',6.37,{shotName:`P2-drag-ghost-snapon-${w}.png`}); r.dragOnClips=(await L.clipsDom(p)).filter(c=>c.lane==='stems');
 r.dragOnAlt=await dragToLane(p,'demo-soft-impact','music',9.37,{alt:true}); r.dragOnAltClips=(await L.clipsDom(p)).filter(c=>c.lane==='music');
 // drop onto occupied spot: slow rise on stems at 7 (occupied 6..11)
 r.dragOcc=await dragToLane(p,'demo-soft-impact','stems',7.4,{shotName:`P2-drag-occupied-${w}.png`}); r.dragOccClips=(await L.clipsDom(p)).filter(c=>c.lane==='stems');
 await X.shot(p,`P2-after-drops-${w}.png`);
 // drop below last track (Live: creates new track)
 const lastB=await p.locator('[data-track-id=sfx]').boundingBox(); const ob=await optBox(p,'demo-soft-impact'); await p.mouse.move(ob.x+20,ob.y+10); await p.mouse.down(); await p.mouse.move(await X.tx(p,12),lastB.y+lastB.height+40,{steps:12}); await sleep(200); await p.mouse.up(); await sleep(500);
 r.dropBelow={status:await L.status(p),lanes:await p.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(e=>e.dataset.trackId)),n:(await L.clipsDom(p)).length};
 await ctx.close(); }
fs.writeFileSync('../out/P2b.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(R,null,0)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
