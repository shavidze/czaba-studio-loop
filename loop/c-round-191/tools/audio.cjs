// AUDIO-191: node audio.cjs <port>. Each condition replays the same timeline span from the same start, so content is identical.
const X=require('./lib122.cjs');const L=X.L;const fs=require('fs');const path=require('path');const sleep=L.sleep;
const PORT=process.argv[2];const BASE=`http://127.0.0.1:${PORT}`;
async function libDrop(p,src,lane){const o=p.locator(`[role=option][data-source-id="${src}"]`);await o.scrollIntoViewIfNeeded();const t0=Date.now();while(Date.now()-t0<60000&&(await o.getAttribute('draggable'))!=='true')await sleep(200);const ob=await o.boundingBox();
 const lb=await p.evaluate((t)=>{const l=document.querySelector(`[data-track-id="${t}"]`);const g=l.querySelector('[data-grid-seconds]')||l;const r=g.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height};},lane);
 await p.mouse.move(ob.x+ob.width/2,ob.y+ob.height/2);await p.mouse.down();await p.mouse.move(ob.x+ob.width/2+12,ob.y+ob.height/2,{steps:3});await p.mouse.move(lb.x+2,lb.y+lb.h/2,{steps:14});await sleep(300);await p.mouse.up();await sleep(900);}
(async()=>{const b=await L.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const net=[];const o=await L.openCtx(b,{width:1440,height:900},`audio-${PORT}`,net,{extraInit:X.tapInit});const p=o.page;
await p.goto(BASE+'/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await sleep(3000);
await p.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(y=>y.textContent.trim()==='Decline');if(x)x.click();});
await libDrop(p,'demo-middle-east','music');await sleep(1500);
const res={PORT,tool:'Playwright Chromium; AnalyserNode tap on every AudioDestinationNode connection (tapInit, lib122)',w:[]};
const vals=()=>p.evaluate(()=>({master:document.querySelector('input[aria-label="Master Volume"]').value,music:document.querySelector('[data-track-id=music] input[aria-label^="Volume — "]').value,musicText:document.querySelector('[data-track-id=music] input[aria-label^="Volume — "]').getAttribute('aria-valuetext')}));
const win=async(label)=>{await p.mouse.click(5,895);await sleep(150);const pos0=await p.evaluate(()=>Number(document.querySelector('[data-testid=arrangement-playhead-handle]')?.getAttribute('aria-valuenow')));await p.keyboard.press('Space');await sleep(250);await p.evaluate(()=>window.__tapStart());await sleep(2500);const S=await p.evaluate(()=>window.__tapStop());await p.keyboard.press('Space');await sleep(700);
 const pk=Math.max(...S.map(s=>s.peak));const v=await vals();const r={label,pos0,peak:+pk.toFixed(5),dbfs:+(20*Math.log10(pk||1e-9)).toFixed(2),n:S.length,...v};res.w.push(r);console.log(JSON.stringify(r));};
await win('A master 0, music 0');await win('A2 repeat (content check)');
const m=p.locator('input[aria-label="Master Volume"]');const mb=await m.boundingBox();
await p.mouse.move(mb.x+mb.width*0.85,mb.y+mb.height/2);await p.mouse.down();await p.mouse.move(mb.x+mb.width*0.85-30,mb.y+mb.height/2,{steps:10});await p.mouse.up();await sleep(400);
await win('B master dragged down');
await p.mouse.move(mb.x+mb.width*0.5,mb.y+mb.height/2);await p.mouse.down();await p.mouse.move(mb.x+mb.width*0.5+30,mb.y+mb.height/2,{steps:10});await p.mouse.up();await sleep(400);
await win('C master dragged back up');
const v=p.locator('[data-track-id=music] input[aria-label^="Volume — "]');const vb=await v.boundingBox();
await p.mouse.move(vb.x+vb.width*0.9,vb.y+vb.height/2);await p.mouse.down();await p.mouse.move(vb.x-400,vb.y+vb.height/2,{steps:25});await p.mouse.up();await sleep(400);
await win('D music volume dragged to minimum');
await v.dblclick();await sleep(400);await win('E music volume double-click reset');
res.net=net.map(n=>[n.errors,n.hydration.length,n.forbidden.length,n.authHeaders.length]);await b.close();fs.writeFileSync(path.join(L.ROOT,'out',`audio-${PORT}.json`),JSON.stringify(res,null,1));console.log(JSON.stringify(res.net));})().catch(e=>{console.error(e);process.exit(1);});
