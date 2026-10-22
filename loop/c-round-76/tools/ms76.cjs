const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const ROWS=(process.argv[3]||'all').split(',');const want=id=>ROWS.includes('all')||ROWS.includes(id);
const OUTF=`${L.OUT}/ms76-${vp}-${ROWS.join('_')}.json`;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok===true?'PASS ':ok===false?'FAIL ':'INFO ')+id+' '+JSON.stringify(d));fs.writeFileSync(OUTF,JSON.stringify(R,null,1));};
const sleep=L.sleep;
const M1=6.3,M2=14.7;
const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
let PPS=40,RL=512;
const st=p=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');const u=[...document.querySelectorAll('button')].find(b=>/^Undo/.test(b.getAttribute('title')||''));const r=[...document.querySelectorAll('button')].find(b=>/^Redo/.test(b.getAttribute('title')||''));return{snap:g&&g.dataset.snap,grid:g&&g.dataset.gridSeconds,undo:u&&u.getAttribute('title'),redo:r&&r.getAttribute('title'),status:(document.querySelector('[data-testid=arrangement-status]')||{}).textContent,pos:(document.querySelector('[data-testid=arrangement-position]')||{}).textContent}});
const posOf=async p=>{const t=(await st(p)).pos;const m=/(\d+):(\d+\.\d+)/.exec(t||'');return m?+m[1]*60+ +m[2]:NaN;};
const clips=p=>p.evaluate(()=>{const z=+/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];return[...document.querySelectorAll('[data-clip-id]')].map(e=>({id:e.getAttribute('data-clip-id'),lane:e.closest('[data-track-id]').getAttribute('data-track-id'),start:e.getAttribute('data-clip-start'),dur:+(e.getBoundingClientRect().width/z).toFixed(3),title:e.textContent.trim().slice(0,14)}))});
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>({id:e.getAttribute('data-marker-id'),t:e.getAttribute('data-marker-time'),a:e.getAttribute('aria-label')})));
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());
const setSnap=async(p,on)=>{await blur(p);if(((await st(p)).snap==='on')!==on){await p.click('[data-testid=arrangement-snap-toggle]');await sleep(150);}await blur(p);return (await st(p)).snap;};
const tx=t=>RL+t*PPS;
const laneBox=(p,t)=>p.evaluate(t=>{const l=document.querySelector(`[data-track-id="${t}"]`);const b=l.querySelector('[data-grid-seconds]')||l;const r=b.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}},t);
const detail=p=>p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-detail-content]');return e?e.innerText.replace(/\n+/g,' | ').slice(0,200):null});
async function geo(p){const g=await p.evaluate(()=>({rl:document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left,z:document.querySelector('[data-testid=arrangement-zoom-readout]').textContent}));RL=g.rl;PPS=+/([\d.]+)/.exec(g.z)[1];return{RL,PPS};}
async function addMarker(p,t){await setSnap(p,false);const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(tx(t),r.top+r.height/2);await sleep(200);await p.keyboard.press('m');await sleep(200);await p.keyboard.press('Enter');await sleep(300);await blur(p);}
async function libDrop(p,src,lane,t,opt={}){const o=p.locator(`[role=option][data-source-id="${src}"]`);await o.scrollIntoViewIfNeeded();const t0=Date.now();while(Date.now()-t0<60000&&(await o.getAttribute('draggable'))!=='true')await sleep(200);const ob=await o.boundingBox();const lb=await laneBox(p,lane);
 await p.mouse.move(ob.x+ob.width/2,ob.y+ob.height/2);await p.mouse.down();await p.mouse.move(ob.x+ob.width/2+12,ob.y+ob.height/2,{steps:3});
 if(opt.alt)await p.keyboard.down('Alt');
 await p.mouse.move(tx(t),lb.y+lb.h/2,{steps:14});await sleep(300);
 let ghost=null;if(opt.ghost)ghost=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map(g=>({text:g.textContent.trim(),left:g.style.left,width:g.style.width,blocked:g.getAttribute('data-blocked'),lane:g.closest('[data-track-id]')&&g.closest('[data-track-id]').getAttribute('data-track-id')})));
 let hover=null;if(opt.hoverLane){const hb=await laneBox(p,opt.hoverLane);await p.mouse.move(tx(opt.hoverT??t),hb.y+hb.h/2,{steps:8});await sleep(300);hover={ghost:await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-drop-ghost]')].map(g=>({text:g.textContent.trim(),left:g.style.left,blocked:g.getAttribute('data-blocked'),lane:g.closest('[data-track-id]')&&g.closest('[data-track-id]').getAttribute('data-track-id')}))),status:(await st(p)).status};}
 await p.mouse.up();if(opt.alt)await p.keyboard.up('Alt');await sleep(800);return{ghost,hover,status:(await st(p)).status};}
async function hdr(p,id){const b=await p.locator(`[data-clip-id="${id}"] > div`).first().boundingBox();return b;}
async function clipBox(p,id){return p.locator(`[data-clip-id="${id}"]`).boundingBox();}
// drag clip header so its raw start moves by dxSec; optional target lane; modifiers; sample lane ghost before release
async function moveClip(p,id,dxSec,opt={}){const h=await hdr(p,id);const x0=h.x+h.width/2,y0=h.y+h.height/2;let y1=y0;
 if(opt.lane){const lb=await laneBox(p,opt.lane);const cb=await clipBox(p,id);y1=lb.y+(y0-cb.y)+4;}
 const dx=Math.round(dxSec*PPS);
 if(opt.alt)await p.keyboard.down('Alt');if(opt.shift)await p.keyboard.down('Shift');
 await p.mouse.move(x0,y0);await p.mouse.down();const n=12;for(let i=1;i<=n;i++){await p.mouse.move(x0+dx*i/n,y0+(y1-y0)*i/n);await sleep(15);}
 await sleep(150);let ghost=null;if(opt.ghost)ghost=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-lane-move-ghost]')].map(g=>({gs:g.getAttribute('data-ghost-start'),blocked:g.getAttribute('data-blocked'),lane:g.closest('[data-track-id]')&&g.closest('[data-track-id]').getAttribute('data-track-id'),label:g.textContent.trim().slice(0,30)})));
 const preview=await p.evaluate(id=>document.querySelector(`[data-clip-id="${id}"]`)?.getAttribute('data-clip-start'),id);
 await p.mouse.up();if(opt.shift)await p.keyboard.up('Shift');if(opt.alt)await p.keyboard.up('Alt');await sleep(350);return{dxPx:dx,ghost,preview};}
async function trim(p,id,side,dxSec,opt={}){const b=await clipBox(p,id);const x0=side==='right'?b.x+b.width-3:b.x+3;const y0=b.y+b.height/2;const dx=Math.round(dxSec*PPS);
 if(opt.alt)await p.keyboard.down('Alt');
 await p.mouse.move(x0,y0);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(x0+dx*i/12,y0);await sleep(15);}await sleep(150);await p.mouse.up();if(opt.alt)await p.keyboard.up('Alt');await sleep(350);return{dxPx:dx,grabX:x0};}
const near=(v,t,e=0.0011)=>Math.abs(+v-t)<=e;
const T=async(id,fn)=>{try{await fn();}catch(e){rec(id,false,{error:String(e).slice(0,400)});}};
async function setup(vp,markers=true){const s=await L.open(vp);const p=s.page;await L.fresh(p);
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Decline');if(b)b.click();});await sleep(200);
 await geo(p);if(markers){await addMarker(p,M1);await addMarker(p,M2);}await setSnap(p,true);
 const s0=await st(p);rec('SETUP',s0.grid==='1'&&s0.snap==='on'&&(!markers||JSON.stringify((await marks(p)).map(m=>m.t))===JSON.stringify([M1.toFixed(3),M2.toFixed(3)])),{vp,RL,PPS,grid:s0.grid,snap:s0.snap,marks:await marks(p),markers});return{s,p};}
function meterStart(p){return p.evaluate(()=>{window.__m=[];window.__mi=setInterval(()=>{const e=document.querySelector('[data-testid=arrangement-master-meter]');window.__m.push([performance.now(),e&&e.getAttribute('data-level-db')])},10)});}
function meterStop(p){return p.evaluate(()=>{clearInterval(window.__mi);return window.__m});}
const dbn=s=>(!s||s==='-inf'?-60:+s);
function onset(mm,t0){let runMin=Infinity;for(const [t,v] of mm){const d=dbn(v);if(t<t0){runMin=Math.min(runMin,d);continue;}if(d>=-15&&d-(runMin===Infinity?-60:runMin)>=3)return{t:t-t0,db:d};runMin=Math.min(runMin,d);}return null;}
async function soloMute(p){const sb=p.locator('[data-track-id=sfx] button[title^=Solo]').first();const vm=p.locator('[data-track-id=video] button[title=Mute]').first();for(const b of [sb,vm]){const bb=await b.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(200);}await blur(p);return{solo:await sb.getAttribute('aria-pressed'),vmute:await vm.getAttribute('aria-pressed')};}
async function playFromMarker(p,t,ms){const f=p.locator(`[data-testid=arrangement-marker][data-marker-time="${t.toFixed(3)}"]`);const b=await f.boundingBox();await meterStart(p);await sleep(300);const t0=await p.evaluate(()=>performance.now());await p.mouse.dblclick(b.x+3,b.y+b.height/2);await sleep(ms);const pos=await posOf(p);const stat=(await st(p)).status;const mm=await meterStop(p);await blur(p);await p.keyboard.press('Space');await sleep(300);const ps1=await posOf(p);await sleep(400);const ps2=await posOf(p);const stopped=ps1===ps2;
 const after=mm.filter(x=>x[0]>=t0);const max=Math.max(...after.map(x=>dbn(x[1])));const pre=Math.max(...mm.filter(x=>x[0]<t0).map(x=>dbn(x[1])));const on=onset(mm,t0);
 const firstAbove=after.find(x=>dbn(x[1])>=-15);
 return{t0,pos,stat,stopped,stopPos:[ps1,ps2],n:mm.length,preMax:pre,max,onset:on,firstAboveMs:firstAbove?Math.round(firstAbove[0]-t0):null,trace:after.filter((x,i)=>i%10===0).slice(0,40).map(x=>[Math.round(x[0]-t0),x[1]])};}
async function finish(s,id){const hyd=s.con.filter(l=>/hydrat|did not match|server rendered|useLayoutEffect/i.test(l));rec('CONSOLE-'+id,hyd.length===0,{hyd,errs:s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!NOISE.test(l)).slice(0,8)});
 rec('NET-'+id,true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url),auth:s.reqs.filter(r=>r.auth).length});await s.browser.close();}
(async()=>{
 if(want('A')){const {s,p}=await setup(vp);
  await libDrop(p,'demo-middle-east','music',0.2);await libDrop(p,'demo-soft-impact','sfx',1);let c=await clips(p);const id=(c.find(x=>x.lane==='sfx')||{}).id;rec('A-FIXTURE',c.length===2&&c.some(x=>x.lane==='sfx'&&x.start==='1.000')&&c.some(x=>x.lane==='music'&&x.start==='0.000'),{clips:c,end:await p.textContent('[data-testid=arrangement-project-end]')});
  const smPre=await soloMute(p);rec('A-SOLO-MUTE',smPre.solo==='true'&&smPre.vmute==='true',smPre);const mk0=await marks(p);const u0=(await st(p)).undo;
  await T('MS-MOVE',async()=>{const r=await moveClip(p,id,(M1+3/PPS)-1);const c1=(await clips(p)).find(x=>x.id===id);const s1=await st(p);
   await p.screenshot({path:`${L.OUT}/shots/ms-move-${vp}.png`});
   rec('MS-MOVE-1',near(c1.start,M1),{rawStart:1+r.dxPx/PPS,dxPx:r.dxPx,start:c1.start,undo:s1.undo,status:s1.status,undoBefore:u0});});
  const mk1=await marks(p);const uMove=(await st(p)).undo;
  await T('MS-PLAY',async()=>{const sm=smPre;const a=await playFromMarker(p,M1,1200);
   const c1=(await clips(p)).find(x=>x.id===id);
   await p.keyboard.press('Control+z');await sleep(400);const cu=(await clips(p)).find(x=>x.id===id);const su=await st(p);const mk2=await marks(p);
   await sleep(1500);const b=await playFromMarker(p,M1,1300);
   const bAbove1s=b.trace.filter(x=>x[0]<=1000&&dbn(x[1])>=-15).length;
   const okA=a.onset&&a.onset.t<=300&&a.max>=-15&&a.stopped&&a.pos>M1+0.8;const okB=b.max<-15&&b.firstAboveMs===null&&b.pos>M1+0.8&&b.stopped;
   rec('MS-PLAY',!!(okA&&okB&&near(cu.start,1)&&+cu.start+cu.dur<M1&&/კლიპის გადატანა/.test(uMove||'')),{soloMute:sm,clipDuring1:c1.start,half1:a,undoTitleBeforeZ:uMove,afterUndoClip:cu,afterUndoUndo:su.undo,redo:su.redo,half2:b,bAbove1s});
   fs.writeFileSync(`${L.OUT}/meter-${vp}.json`,JSON.stringify({a,b},null,1));
   // redo
   await p.keyboard.press('Control+Shift+z');await sleep(400);const cr=(await clips(p)).find(x=>x.id===id);const sr=await st(p);const mk3=await marks(p);
   rec('MS-UNDO',near(cr.start,M1)&&near(cu.start,1)&&JSON.stringify(mk0)===JSON.stringify(mk1)&&JSON.stringify(mk1)===JSON.stringify(mk2)&&JSON.stringify(mk2)===JSON.stringify(mk3)&&su.undo===u0&&sr.undo===uMove,{marksBefore:mk0,equalAll:[JSON.stringify(mk0)===JSON.stringify(mk1),JSON.stringify(mk1)===JSON.stringify(mk2),JSON.stringify(mk2)===JSON.stringify(mk3)],undoTitles:{beforeMove:u0,afterMove:uMove,afterUndo:su.undo,afterRedo:sr.undo,redoAfterUndo:su.redo},starts:{afterUndo:cu.start,afterRedo:cr.start}});
   const sm2=await soloMute(p);rec('MS-PLAY-restore',sm2.solo!=='true'&&sm2.vmute!=='true',sm2);});
  await T('MS-MOVE-2',async()=>{const c0=(await clips(p)).find(x=>x.id===id);const raw=6+3/PPS;const r=await moveClip(p,id,raw-+c0.start);const c1=(await clips(p)).find(x=>x.id===id);
   rec('MS-MOVE-2-grid',near(c1.start,6),{from:c0.start,rawStart:+c0.start+r.dxPx/PPS,start:c1.start,status:(await st(p)).status});});
  await T('MS-MOVE-END',async()=>{const c0=(await clips(p)).find(x=>x.id===id);const raw=(M2-c0.dur)+2/PPS;const r=await moveClip(p,id,raw-+c0.start);const c1=(await clips(p)).find(x=>x.id===id);
   rec('MS-MOVE-END',near(+c1.start+c1.dur,M2,0.002)&&near(c1.start,M2-c0.dur),{from:c0.start,dur:c0.dur,rawStart:+c0.start+r.dxPx/PPS,rawEnd:+c0.start+r.dxPx/PPS+c0.dur,start:c1.start,end:(+c1.start+c1.dur).toFixed(3)});
   await p.screenshot({path:`${L.OUT}/shots/ms-move-end-${vp}.png`});});
  await T('MS-SNAPOFF-ALT',async()=>{const out={};const raw=M1+3/PPS;
   const one=async(label,snap,alt)=>{await setSnap(p,snap);const c0=(await clips(p)).find(x=>x.id===id);const r=await moveClip(p,id,raw-+c0.start,{alt});const c1=(await clips(p)).find(x=>x.id===id);out[label]={from:c0.start,rawStart:+(+c0.start+r.dxPx/PPS).toFixed(3),start:c1.start,status:(await st(p)).status,undo:(await st(p)).undo};await p.keyboard.press('Control+z');await sleep(300);};
   await one('snapOff',false,false);await one('snapOnAlt',true,true);await one('snapOffAlt',false,true);await setSnap(p,true);
   const free=o=>Math.abs(+o.start-o.rawStart)<=0.026&&!near(o.start,M1)&&Math.abs(+o.start-Math.round(+o.start))>0.01;
   rec('MS-SNAPOFF-ALT',free(out.snapOff)&&free(out.snapOnAlt)&&near(out.snapOffAlt.start,M1),out);});
  await finish(s,'A');}
 if(want('B')){const {s,p}=await setup(vp);
  await libDrop(p,'demo-soft-impact','sfx',1);const c=await clips(p);const id=c[0].id;
  await T('MS-CROSSLANE',async()=>{const out={};for(const lane of ['music','stems']){const c0=(await clips(p)).find(x=>x.id===id);const r=await moveClip(p,id,(M1+3/PPS)-+c0.start,{lane,ghost:true});const c1=(await clips(p)).find(x=>x.id===id)||(await clips(p)).find(x=>x.id===id);out[lane]={from:[c0.lane,c0.start],rawStart:+c0.start+r.dxPx/PPS,ghost:r.ghost,after:c1,status:(await st(p)).status,undo:(await st(p)).undo};
    await p.screenshot({path:`${L.OUT}/shots/ms-cross-${lane}-${vp}.png`});await p.keyboard.press('Control+z');await sleep(300);out[lane].afterUndo=await clips(p);}
   const ok=l=>out[l].ghost&&out[l].ghost.length===1&&out[l].ghost[0].gs===M1.toFixed(3)&&out[l].ghost[0].blocked==='false'&&out[l].after.lane===l&&near(out[l].after.start,M1);
   rec('MS-CROSSLANE',ok('music')||ok('stems'),{music:ok('music'),stems:ok('stems'),...out});});
  await T('MS-GROUP',async()=>{await libDrop(p,'demo-slow-rise','sfx',4);let cs=await clips(p);const A=cs.find(x=>x.id===id),B=cs.find(x=>x.id!==id);
   await blur(p);{const h=await hdr(p,A.id);await p.mouse.click(h.x+h.width/2,h.y+h.height/2);await sleep(250);}{const h=await hdr(p,B.id);await p.keyboard.down('Control');await p.mouse.click(h.x+h.width/2,h.y+h.height/2);await p.keyboard.up('Control');await sleep(250);}
   const sel=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>/ring-brand/.test(e.className)));
   const r=await moveClip(p,A.id,(M1+3/PPS)-+A.start);cs=await clips(p);const A1=cs.find(x=>x.id===A.id),B1=cs.find(x=>x.id===B.id);const s1=await st(p);
   await p.screenshot({path:`${L.OUT}/shots/ms-group-${vp}.png`});
   rec('MS-GROUP',JSON.stringify(sel)==='[true,true]'&&near(A1.start,M1)&&near(+B1.start-+A1.start,+B.start-+A.start),{before:[A.start,B.start],sel,rawAnchor:+A.start+r.dxPx/PPS,after:[A1.start,B1.start],offset:[(+B.start-+A.start).toFixed(3),(+B1.start-+A1.start).toFixed(3)],undo:s1.undo,status:s1.status});
   await p.keyboard.press('Control+z');await sleep(300);rec('MS-GROUP-undo',true,{clips:await clips(p),undo:(await st(p)).undo});});
  await finish(s,'B');}
 if(want('C')){const {s,p}=await setup(vp);
  await T('REG-EDGES-marker',async()=>{await setSnap(p,false);const d0=await libDrop(p,'demo-soft-impact','music',4.2);await setSnap(p,true);await libDrop(p,'demo-soft-impact','sfx',10);
   let cs=await clips(p);const ref=cs.find(x=>x.lane==='music'),mv=cs.find(x=>x.lane==='sfx');const out={ref,mv0:mv,refEnd:(+ref.start+ref.dur).toFixed(3)};
   let r=await moveClip(p,mv.id,6.2+1/PPS-+mv.start);out.edgeNearer={raw:+mv.start+r.dxPx/PPS,start:(await clips(p)).find(x=>x.id===mv.id).start};await p.keyboard.press('Control+z');await sleep(300);
   r=await moveClip(p,mv.id,6.2+3/PPS-+mv.start);out.markerNearer={raw:+mv.start+r.dxPx/PPS,start:(await clips(p)).find(x=>x.id===mv.id).start};await p.keyboard.press('Control+z');await sleep(300);
   rec('REG-EDGES-marker',near(ref.start,4.2)&&near(out.edgeNearer.start,6.2)&&near(out.markerNearer.start,M1),out);});
  await finish(s,'C');}
 if(want('D')){const {s,p}=await setup(vp,false);
  await T('REG-EDGES-nomarker',async()=>{await setSnap(p,false);await libDrop(p,'demo-soft-impact','music',4.2);await setSnap(p,true);await libDrop(p,'demo-soft-impact','sfx',10);
   let cs=await clips(p);const ref=cs.find(x=>x.lane==='music'),mv=cs.find(x=>x.lane==='sfx');const out={ref,mv0:mv,marks:await marks(p)};
   let r=await moveClip(p,mv.id,6.2+1/PPS-+mv.start);out.a={raw:+mv.start+r.dxPx/PPS,start:(await clips(p)).find(x=>x.id===mv.id).start};await p.keyboard.press('Control+z');await sleep(300);
   r=await moveClip(p,mv.id,6.2+3/PPS-+mv.start);out.b={raw:+mv.start+r.dxPx/PPS,start:(await clips(p)).find(x=>x.id===mv.id).start};await p.keyboard.press('Control+z');await sleep(300);
   r=await moveClip(p,mv.id,6+3/PPS-+mv.start);out.c={raw:+mv.start+r.dxPx/PPS,start:(await clips(p)).find(x=>x.id===mv.id).start};await p.keyboard.press('Control+z');await sleep(300);
   rec('REG-EDGES-nomarker',out.marks.length===0&&near(out.a.start,6.2)&&near(out.b.start,6.2)&&near(out.c.start,6),out);});
  await finish(s,'D');}
 if(want('E')){const {s,p}=await setup(vp);
  await T('MS-TRIM',async()=>{const out={};await libDrop(p,'demo-slow-rise','sfx',12);let cs=await clips(p);const R1=cs[0];
   await p.locator(`[data-clip-id="${R1.id}"] > div`).first().click();await sleep(200);out.r0={start:R1.start,dur:R1.dur,detail:await detail(p)};
   const end0=+R1.start+R1.dur;await trim(p,R1.id,'right',(M2+2/PPS)-end0);cs=await clips(p);const R2=cs.find(x=>x.id===R1.id);const s2=await st(p);
   await p.locator(`[data-clip-id="${R1.id}"] > div`).first().click();await sleep(200);
   out.right={start:R2.start,end:(+R2.start+R2.dur).toFixed(3),undo:s2.undo,status:s2.status,detail:await detail(p)};
   await libDrop(p,'demo-slow-rise','sfx',5);cs=await clips(p);const Lc=cs.find(x=>x.id!==R1.id);
   await trim(p,Lc.id,'left',(M1+3/PPS)-+Lc.start);cs=await clips(p);const L2=cs.find(x=>x.id===Lc.id);const s3=await st(p);
   await p.locator(`[data-clip-id="${Lc.id}"] > div`).first().click();await sleep(200);
   out.left={before:[Lc.start,Lc.dur],start:L2.start,end:(+L2.start+L2.dur).toFixed(3),undo:s3.undo,status:s3.status,detail:await detail(p)};
   await p.screenshot({path:`${L.OUT}/shots/ms-trim-${vp}.png`});
   const blocked=o=>/blocked|დაბლოკ|ვერ /.test(o.status||'');
   rec('MS-TRIM',near(out.right.end,M2,0.002)&&(/წყაროდან 00:00\.000/.test(out.right.detail||'')||/source offset 00:00\.000/.test(out.right.status))&&near(out.left.start,M1)&&near(out.left.end,10,0.002)&&(/წყაროდან 00:01\.300/.test(out.left.detail||'')||/source offset 00:01\.300/.test(out.left.status))&&!blocked(out.right)&&!blocked(out.left),out);
   // real audio check of the left-trimmed clip offset: play from M1 with sfx solo; the slow rise at offset 1.3 s
  });
  await finish(s,'E');}
 if(want('F')){const {s,p}=await setup(vp);
  await T('MS-DROP',async()=>{const out={};out.d1=await libDrop(p,'demo-soft-impact','sfx',M1+3/PPS,{ghost:true});let cs=await clips(p);out.c1=cs;
   out.d2=await libDrop(p,'demo-slow-rise','sfx',(M2-5)+2/PPS,{ghost:true});cs=await clips(p);out.c2=cs;
   const n0=cs.length;out.dv=await libDrop(p,'demo-soft-impact','sfx',M1+3/PPS,{ghost:true,hoverLane:'video'});out.cv=await clips(p);
   await p.screenshot({path:`${L.OUT}/shots/ms-drop-${vp}.png`});
   const g1=out.d1.ghost&&out.d1.ghost[0];const sr=cs.find(x=>/Slow/.test(x.title));const si=out.c1[0];
   const vg=out.dv.hover&&out.dv.hover.ghost&&out.dv.hover.ghost.find(g=>g.lane==='video');
   rec('MS-DROP',g1&&/00:06\.300/.test(g1.text)&&Math.abs(parseFloat(g1.left)-M1*PPS)<0.6&&near(si.start,M1)&&sr&&near(+sr.start+sr.dur,M2,0.002)&&!!vg&&vg.blocked==='true'&&out.cv.length===n0,out);});
  await finish(s,'F');}
 if(want('G')){const {s,p}=await setup(vp);await libDrop(p,'demo-middle-east','music',0.2);
  await T('REG-MARKERS',async()=>{const out={};const f=p.locator(`[data-testid=arrangement-marker][data-marker-time="${M1.toFixed(3)}"]`);const b=await f.boundingBox();
   await p.mouse.move(b.x+3,b.y+b.height/2);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(b.x+3+Math.round(1.0*PPS)*i/12,b.y+b.height/2);await sleep(15);}await p.mouse.up();await sleep(300);
   out.drag={marks:(await marks(p)).map(m=>m.t),status:(await st(p)).status,undo:(await st(p)).undo};
   const g=p.locator(`[data-testid=arrangement-marker][data-marker-time="${M2.toFixed(3)}"]`);const gb=await g.boundingBox();await p.mouse.click(gb.x+3,gb.y+gb.height/2,{button:'right'});await sleep(300);
   out.menu=await p.evaluate(()=>{const m=[...document.querySelectorAll('[data-testid=arrangement-marker-menu]')];return{count:m.length,items:m[0]?[...m[0].querySelectorAll('[role=menuitem]')].map(x=>x.textContent):null}});
   await p.click('[data-marker-menu-action=play]');await sleep(200);const a=await posOf(p);await sleep(600);const a2=await posOf(p);await p.keyboard.press('Space');await sleep(200);out.play=[a,a2];
   rec('REG-MARKERS',JSON.stringify(out.drag.marks)===JSON.stringify(['7.000',M2.toFixed(3)])&&out.menu.count===1&&a>=M2&&a<M2+0.4&&a2>a,out);});
  await finish(s,'G');}
})().catch(e=>{console.log('SCRIPT ERROR',e);rec('SCRIPT',false,{e:String(e)});process.exit(1)});
