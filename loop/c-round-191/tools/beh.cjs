// BEHAVIOUR-191: node beh.cjs <port> <W>
const L=require('./lib.cjs');const fs=require('fs');const path=require('path');const sleep=L.sleep;
const PORT=process.argv[2];const W=+process.argv[3];const H=W===1440?900:720;const BASE=`http://127.0.0.1:${PORT}`;
const SEL={trackVol:'[data-track-id=music] input[type=range][aria-label^="Volume — "]',pan:'[data-track-id=music] [data-testid=arrangement-track-pan]',groupVol:'[data-testid=arrangement-group-volume]',master:'input[aria-label="Master Volume"]',clipGain:'[data-testid=arrangement-detail-clip-gain-fader]',zoom:'[data-testid=arrangement-zoom]'};
const RD={trackVol:(p)=>p.evaluate(()=>{const i=document.querySelector('[data-track-id=music] input[type=range][aria-label^="Volume — "]');return i.nextElementSibling.textContent.trim();}),
 pan:(p)=>p.locator('[data-track-id=music] [data-testid=arrangement-track-pan-reset]').textContent(),
 groupVol:(p)=>p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-group-volume]');return i.getAttribute('aria-valuetext');}),
 master:(p)=>p.evaluate(()=>{const i=document.querySelector('input[aria-label="Master Volume"]');return i.nextElementSibling.textContent.trim();}),
 clipGain:(p)=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-detail-clip-gain-input]').value),
 zoom:(p)=>p.locator('[data-testid=arrangement-zoom-readout]').textContent()};
const nameSel=(t)=>`[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
async function libDrop(p,src,lane,xFrac){const o=p.locator(`[role=option][data-source-id="${src}"]`);await o.scrollIntoViewIfNeeded();const t0=Date.now();while(Date.now()-t0<60000&&(await o.getAttribute('draggable'))!=='true')await sleep(200);const ob=await o.boundingBox();
 const lb=await p.evaluate((t)=>{const l=document.querySelector(`[data-track-id="${t}"]`);const g=l.querySelector('[data-grid-seconds]')||l;const r=g.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height};},lane);
 await p.mouse.move(ob.x+ob.width/2,ob.y+ob.height/2);await p.mouse.down();await p.mouse.move(ob.x+ob.width/2+12,ob.y+ob.height/2,{steps:3});await p.mouse.move(lb.x+lb.w*xFrac,lb.y+lb.h/2,{steps:14});await sleep(300);await p.mouse.up();await sleep(900);}
(async()=>{const b=await L.chromium.launch({args:['--disable-lcd-text']});const net=[];const o=await L.openCtx(b,{width:W,height:H},`beh-${PORT}-${W}`,net,{});const p=o.page;
await p.goto(BASE+'/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await sleep(3000);
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(y=>y.textContent.trim()==='Decline');if(x)x.click();});
await libDrop(p,'demo-middle-east','music',0.05);
await p.click(nameSel('stems'));await sleep(200);await p.click(nameSel('sfx'),{modifiers:['Shift']});await sleep(200);await p.mouse.click(5,H-5);await sleep(150);await p.keyboard.press('Control+g');await sleep(700);
const t=p.locator('[data-testid=arrangement-detail-toggle]');if((await t.getAttribute('aria-expanded'))==='false'){await t.click();await sleep(700);}
const clip=p.locator('[data-clip-id]').first();const cb=await clip.boundingBox();await p.mouse.click(cb.x+30,cb.y+cb.height*0.65);await sleep(500);
const res={PORT,W,controls:{}};const undoState=()=>p.evaluate(()=>{const u=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('aria-label')||x.title||x.textContent));return u?(u.getAttribute('title')||u.getAttribute('aria-label')||'')+'|'+u.disabled:null;});
for(const [n,sel] of Object.entries(SEL)){const f=p.locator(sel).first();await f.scrollIntoViewIfNeeded();const r={};const val=()=>f.evaluate(el=>el.value);const bb=await f.boundingBox();const cy=bb.y+bb.height/2;
 r.v0=await val();r.rd0=await RD[n](p);
 // plain drag -40 px
 await p.mouse.move(bb.x+bb.width*0.6,cy);await p.mouse.down();await p.mouse.move(bb.x+bb.width*0.6-40,cy,{steps:8});await sleep(120);r.vDragMid=await val();await p.mouse.up();await sleep(400);r.vDrag=await val();r.rdDrag=await RD[n](p);
 // one undo
 await p.mouse.click(5,H-5);await sleep(150);r.undoTitle=await undoState();await p.keyboard.press('Control+z');await sleep(400);r.vUndo=await val();await p.keyboard.press('Control+Shift+z');await sleep(400);r.vRedo=await val();await p.keyboard.press('Control+z');await sleep(400);r.vUndo2=await val();
 // shift drag -40 px
 const bb2=await f.boundingBox();await p.mouse.move(bb2.x+bb2.width*0.6,cy);await p.keyboard.down('Shift');await p.mouse.down();await p.mouse.move(bb2.x+bb2.width*0.6-40,cy,{steps:8});await sleep(120);await p.mouse.up();await p.keyboard.up('Shift');await sleep(400);r.vShift=await val();
 // dblclick reset
 await f.dblclick({position:{x:bb2.width*0.6,y:bb2.height/2}});await sleep(400);r.vDbl=await val();r.rdDbl=await RD[n](p);
 // keyboard
 await f.focus();await p.keyboard.press('ArrowLeft');await sleep(250);r.vLeft=await val();await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowRight');await sleep(250);r.vRight2=await val();await p.keyboard.press('ArrowLeft');await sleep(250);
 await p.mouse.click(5,H-5);await sleep(200);res.controls[n]=r;}
// M/S toggles music
const ms={};for(const k of ['Mute','Solo']){const btn=p.locator(`[data-track-id=music] button[aria-label^="${k}"]`).first();ms[k+'0']=await btn.getAttribute('aria-pressed');await btn.click();await sleep(250);ms[k+'1']=await btn.getAttribute('aria-pressed');await btn.click();await sleep(250);ms[k+'2']=await btn.getAttribute('aria-pressed');}
res.ms=ms;res.net=net.map(n=>[n.errors,n.hydration.length,n.forbidden.length,n.authHeaders.length]);await b.close();
fs.writeFileSync(path.join(L.ROOT,'out',`beh-${PORT}-${W}.json`),JSON.stringify(res,null,1));console.log(JSON.stringify(res));})().catch(e=>{console.error(e);process.exit(1);});
