const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const G=(process.argv[3]||'all').split(',');const want=g=>G.includes('all')||G.includes(g);
const OUTF=`${L.OUT}/mt78-${vp}-${G.join('_')}.json`;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok===true?'PASS ':ok===false?'FAIL ':'INFO ')+id+' '+JSON.stringify(d).slice(0,700));fs.writeFileSync(OUTF,JSON.stringify(R,null,1));};
const sleep=L.sleep;const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
let PPS=40,RL=512;const MA=6.375,MB=12;
const st=p=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');const u=[...document.querySelectorAll('button')].find(b=>/^Undo/.test(b.getAttribute('title')||''));const lt=document.querySelector('[data-testid=arrangement-loop-times]');return{snap:g&&g.dataset.snap,grid:g&&g.dataset.gridSeconds,undo:u&&u.getAttribute('title'),status:(document.querySelector('[data-testid=arrangement-status]')||{}).textContent,pos:(document.querySelector('[data-testid=arrangement-position]')||{}).textContent,end:(document.querySelector('[data-testid=arrangement-project-end]')||{}).textContent,range:(document.querySelector('[data-testid=arrangement-range]')||{}).textContent||null,loop:lt?lt.textContent:null,focus:document.activeElement&&(document.activeElement.getAttribute('data-testid')||document.activeElement.tagName)}});
const secs=t=>{const m=/(\d+):(\d+\.\d+)/.exec(t||'');return m?+m[1]*60+ +m[2]:NaN;};
const pair=t=>{const m=[...(t||'').matchAll(/(\d+):(\d+\.\d+)/g)].map(x=>+x[1]*60+ +x[2]);return m.slice(0,2);};
const posOf=async p=>secs((await st(p)).pos);
const clips=p=>p.evaluate(()=>{const z=+/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];return[...document.querySelectorAll('[data-clip-id]')].map(e=>({id:e.getAttribute('data-clip-id'),lane:e.closest('[data-track-id]').getAttribute('data-track-id'),start:+e.getAttribute('data-clip-start'),dur:+(e.getBoundingClientRect().width/z).toFixed(3),title:e.textContent.trim().slice(0,14)}))});
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('data-marker-time')));
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());
const setSnap=async(p,on)=>{await blur(p);if(((await st(p)).snap==='on')!==on){await p.click('[data-testid=arrangement-snap-toggle]');await sleep(150);}await blur(p);return (await st(p)).snap;};
const setGrid=async(p,v)=>{await p.selectOption('[data-testid=arrangement-grid-division]',v);await sleep(200);await blur(p);return (await st(p)).grid;};
const tx=t=>Math.round(RL+t*PPS);const rawOf=x=>+((x-RL)/PPS).toFixed(4);
const laneBox=(p,t)=>p.evaluate(t=>{const l=document.querySelector(`[data-track-id="${t}"]`);const b=l.querySelector('[data-grid-seconds]')||l;const r=b.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}},t);
const rulerBox=p=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
async function geo(p){const g=await p.evaluate(()=>({rl:document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left,z:document.querySelector('[data-testid=arrangement-zoom-readout]').textContent,sl:document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft}));RL=g.rl;PPS=+/([\d.]+)/.exec(g.z)[1];return{RL,PPS,scrollLeft:g.sl};}
const hitAt=(p,x,y)=>p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&((e.closest('[data-testid]')||e).getAttribute('data-testid'));},[x,y]);
async function rulerClick(p,t,alt){const r=await rulerBox(p);const x=tx(t),y=Math.round(r.bottom-4);const hit=await hitAt(p,x,y);if(alt)await p.keyboard.down('Alt');await p.mouse.click(x,y);if(alt)await p.keyboard.up('Alt');await sleep(250);return{x,raw:rawOf(x),hit,pos:await posOf(p)};}
async function seekAway(p,t=2){const snap=(await st(p)).snap;const r=await rulerClick(p,t,false);return r.pos;}
async function addMarker(p,t){await setSnap(p,false);await seekAway(p,2);const r=await rulerClick(p,t,false);await p.keyboard.press('m');await sleep(200);await p.keyboard.press('Enter');await sleep(300);await blur(p);return r;}
async function libDrop(p,src,lane,t){const o=p.locator(`[role=option][data-source-id="${src}"]`);await o.scrollIntoViewIfNeeded();const t0=Date.now();while(Date.now()-t0<60000&&(await o.getAttribute('draggable'))!=='true')await sleep(200);const ob=await o.boundingBox();const lb=await laneBox(p,lane);
 await p.mouse.move(ob.x+ob.width/2,ob.y+ob.height/2);await p.mouse.down();await p.mouse.move(ob.x+ob.width/2+12,ob.y+ob.height/2,{steps:3});
 await p.mouse.move(tx(t),lb.y+lb.h/2,{steps:14});await sleep(300);await p.mouse.up();await sleep(900);return st(p);}
const near=(v,t,e=0.0011)=>Math.abs(+v-t)<=e;const nearRaw=(v,t)=>Math.abs(+v-t)<=1/PPS+0.0011;
const T=async(id,fn)=>{try{await fn();}catch(e){rec(id,false,{error:String(e).slice(0,400)});}};
async function drag(p,x0,y,x1,{alt=false,steps=12,pause=0,mid=null}={}){if(alt)await p.keyboard.down('Alt');await p.mouse.move(x0,y);await p.mouse.down();let midv=null;for(let i=1;i<=steps;i++){await p.mouse.move(Math.round(x0+(x1-x0)*i/steps),y);await sleep(15);}if(pause){await sleep(pause);}if(mid)midv=await mid();await p.mouse.up();if(alt)await p.keyboard.up('Alt');await sleep(300);return midv;}
async function finish(s,id){const hyd=s.con.filter(l=>/hydrat|did not match|server rendered|useLayoutEffect/i.test(l));rec('CONSOLE-'+id,hyd.length===0,{hyd,errs:s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!NOISE.test(l)).slice(0,8)});
 rec('NET-'+id,true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url),auth:s.reqs.filter(r=>r.auth).length});await s.browser.close();}
function meterStart(p){return p.evaluate(()=>{window.__m=[];window.__mi=setInterval(()=>{const e=document.querySelector('[data-testid=arrangement-master-meter]');window.__m.push([performance.now(),e&&e.getAttribute('data-level-db')])},10)});}
function meterStop(p){return p.evaluate(()=>{clearInterval(window.__mi);return window.__m});}
const dbn=s=>(!s||s==='-inf'?-60:+s);
function onset(mm,t0){let runMin=Infinity;for(const [t,v] of mm){const d=dbn(v);if(t<t0){runMin=Math.min(runMin,d);continue;}if(d>=-15&&d-(runMin===Infinity?-60:runMin)>=3)return{t:+(t-t0).toFixed(1),db:d};runMin=Math.min(runMin,d);}return null;}
async function soloMute(p){const sb=p.locator('[data-track-id=sfx] button[title^=Solo]').first();const vm=p.locator('[data-track-id=video] button[title=Mute]').first();for(const b of [sb,vm]){const bb=await b.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(200);}await blur(p);return{solo:await sb.getAttribute('aria-pressed'),vmute:await vm.getAttribute('aria-pressed')};}
async function playMeasure(p,ms){await blur(p);const pos0=await posOf(p);await meterStart(p);await sleep(300);const t0=await p.evaluate(()=>performance.now());await p.keyboard.press('Space');await sleep(ms);const pos=await posOf(p);const mm=await meterStop(p);await blur(p);await p.keyboard.press('Space');await sleep(300);const ps1=await posOf(p);await sleep(300);const ps2=await posOf(p);
 const after=mm.filter(x=>x[0]>=t0);const max=Math.max(...after.map(x=>dbn(x[1])));const pre=Math.max(...mm.filter(x=>x[0]<t0).map(x=>dbn(x[1])));const fa=after.find(x=>dbn(x[1])>=-15);
 return{pos0,pos,stopped:ps1===ps2,stopPos:ps1,n:mm.length,preMax:pre,max,onset:onset(mm,t0),firstAboveMs:fa?Math.round(fa[0]-t0):null,trace:after.filter((x,i)=>i%10===0).slice(0,15).map(x=>[Math.round(x[0]-t0),x[1]])};}
async function fixture(p,second=true){
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Decline');if(b)b.click();});await sleep(200);
 const g=await geo(p);await setSnap(p,false);const me=await libDrop(p,'demo-middle-east','music',0.35);
 const a=await addMarker(p,MA);let b=null;if(second)b=await addMarker(p,MB);await setSnap(p,true);await setGrid(p,'1');await geo(p);
 const c=await clips(p);const s=await st(p);const F={geo:g,clips:c,marks:await marks(p),end:s.end,clickA:a,clickB:b,snap:s.snap,grid:s.grid};
 rec('FIXTURE',c.length===1&&near(c[0].start,0.35)&&F.marks.includes('6.375')&&(!second||F.marks.includes('12.000'))&&s.snap==='on'&&s.grid==='1',{vp,...F});return F;}
const meBox=async p=>p.locator('[data-track-id=music] [data-clip-id]').first().boundingBox();
(async()=>{
 if(want('A')){const s=await L.open(vp);const p=s.page;await L.fresh(p);await fixture(p);
  await T('MT-RULER',async()=>{const cases=[['on',6.45,false,MA],['on',6.10,false,6],['off',6.45,false,null],['on',6.45,true,null],['off',6.45,true,MA]];const out=[];
   for(const [snap,t,alt,exp] of cases){await setSnap(p,snap==='on');await seekAway(p,2);const r=await rulerClick(p,t,alt);const e=exp===null?r.raw:exp;out.push({snap,alt,...r,expected:e,ok:exp===null?nearRaw(r.pos,t)&&near(r.pos,r.raw):near(r.pos,e),handleHit:r.hit==='arrangement-playhead-handle'});}
   await setSnap(p,true);rec('MT-RULER',out.every(o=>o.ok&&!o.handleHit),{out});});
  await T('MT-SCRUB',async()=>{const out={};for(const alt of [false,true]){await setSnap(p,true);await seekAway(p,2);const h=await p.locator('[data-testid=arrangement-playhead-handle]').boundingBox();const x0=Math.round(h.x+h.width/2),y=Math.round(h.y+h.height/2);const x1=tx(6.45);
    const mid=await drag(p,x0,y,x1,{alt,steps:16,pause:400,mid:async()=>({pos:await posOf(p),valuenow:await p.getAttribute('[data-testid=arrangement-playhead-handle]','aria-valuenow')})});const after=await posOf(p);
    out[alt?'alt':'plain']={x0,x1,startPos:rawOf(x0),raw:rawOf(x1),mid,after};}
   const a=out.plain,b=out.alt;rec('MT-SCRUB',near(a.mid.pos,MA)&&near(+a.mid.valuenow,MA)&&near(a.after,MA)&&near(b.mid.pos,b.raw)&&near(b.after,b.raw),{...out,expected:{plain:MA,alt:'raw'}});});
  await T('MT-LANE',async()=>{const out=[];for(const snap of [true,false]){await setSnap(p,snap);await seekAway(p,2);const lb=await laneBox(p,'sfx');const x=tx(6.45),y=Math.round(lb.y+lb.h/2);const hit=await hitAt(p,x,y);await p.mouse.click(x,y);await sleep(300);out.push({snap,x,raw:rawOf(x),hit,pos:await posOf(p),lane:lb});}
   await setSnap(p,true);rec('MT-LANE',near(out[0].pos,MA)&&near(out[1].pos,out[1].raw)&&!/height/.test(out[0].hit+out[1].hit),{out,expected:[MA,'raw']});});
  await T('MT-CLIPCLICK',async()=>{await setSnap(p,true);await seekAway(p,2);const cb=await meBox(p);const x=tx(6.45),y=Math.round(cb.y+cb.height*0.75);const hit=await hitAt(p,x,y);await p.mouse.click(x,y);await sleep(300);const pos=await posOf(p);const c=await clips(p);const s0=await st(p);
   rec('MT-CLIPCLICK',near(pos,MA)&&near(c[0].start,0.35)&&!s0.range,{x,raw:rawOf(x),hit,pos,clipStart:c[0].start,range:s0.range,undo:s0.undo});});
  await T('MT-RANGE',async()=>{const out={};const cb=await meBox(p);const y=Math.round(cb.y+cb.height*0.75);const u0=(await st(p)).undo;
   for(const [k,a,b,alt] of [['r1',3.2,6.45,false],['r2',6.40,6.45,false],['r2b',6.20,6.45,false],['alt',3.2,6.45,true]]){await setSnap(p,true);await seekAway(p,1);await drag(p,tx(a),y,tx(b),{alt});const s1=await st(p);out[k]={rawA:rawOf(tx(a)),rawB:rawOf(tx(b)),range:s1.range,edges:pair(s1.range),pos:await posOf(p),clipStart:(await clips(p))[0].start};}
   const u1=(await st(p)).undo;await p.screenshot({path:`${L.OUT}/shots/mt-range-${vp}.png`});
   const r1=out.r1.edges,al=out.alt.edges;
   rec('MT-RANGE',near(r1[0],3)&&near(r1[1],MA)&&!out.r2.range&&!out.r2b.range&&near(al[0],out.alt.rawA)&&near(al[1],out.alt.rawB)&&near(out.r1.clipStart,0.35)&&u0===u1,{...out,undoBefore:u0,undoAfter:u1,note:'r2 is 2 px (< DRAG_THRESHOLD_PX 3: a click/seek); r2b 10 px is the discriminating no-range drag'});});
  await finish(s,'A');}
 if(want('B')){const s=await L.open(vp);const p=s.page;await L.fresh(p);await fixture(p);
  const cb=await meBox(p);const y=Math.round(cb.y+cb.height*0.75);
  const mkLoop=async()=>{await setSnap(p,true);await drag(p,tx(2),y,tx(4));await blur(p);await p.keyboard.press('Control+l');await sleep(300);const s1=await st(p);return{range:s1.range,loop:s1.loop,edges:pair(s1.loop)};};
  const loopE=async()=>pair((await st(p)).loop);
  const undo=async()=>{await blur(p);await p.keyboard.press('Control+z');await sleep(300);return loopE();};
  const strip=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-loop-strip]').getBoundingClientRect().toJSON());const ly=Math.round(strip.top+strip.height/2);
  const L0=await mkLoop();rec('LOOP-SETUP',near(L0.edges[0],2)&&near(L0.edges[1],4),L0);
  await T('MT-LOOP-RESIZE',async()=>{const out={};const eb=await p.locator('[data-testid=arrangement-loop-end-edge]').boundingBox();const x0=Math.round(eb.x+eb.width/2);
   const u0=(await st(p)).undo;await drag(p,x0,ly,x0+Math.round((6.45-4)*PPS));out.r1={raw:4+Math.round((6.45-4)*PPS)/PPS,edges:await loopE(),undo:(await st(p)).undo,undoBefore:u0};
   out.r1.afterUndo=await undo();out.r1.undoAfterUndo=(await st(p)).undo;
   const eb2=await p.locator('[data-testid=arrangement-loop-end-edge]').boundingBox();const x2=Math.round(eb2.x+eb2.width/2);await drag(p,x2,ly,x2+Math.round((6.8-4)*PPS));out.r2={raw:4+Math.round((6.8-4)*PPS)/PPS,edges:await loopE()};out.r2.afterUndo=await undo();
   const ok=near(out.r1.edges[0],2)&&near(out.r1.edges[1],MA)&&out.r1.undo!==u0&&near(out.r1.afterUndo[1],4)&&out.r1.undoAfterUndo===u0&&near(out.r2.edges[1],7)&&near(out.r2.afterUndo[1],4);
   rec('MT-LOOP-RESIZE',ok,out);});
  await T('MT-LOOP-MOVE',async()=>{const out={};const u0=(await st(p)).undo;const bb=await p.locator('[data-testid=arrangement-loop-brace]').boundingBox();const x0=Math.round(bb.x+bb.width/2);
   const d1=Math.round((6.45-2)*PPS);await drag(p,x0,ly,x0+d1);out.m1={rawStart:2+d1/PPS,edges:await loopE(),undo:(await st(p)).undo};out.m1.afterUndo=await undo();out.m1.undoAfterUndo=(await st(p)).undo;
   const bb2=await p.locator('[data-testid=arrangement-loop-brace]').boundingBox();const x2=Math.round(bb2.x+bb2.width/2);const d2=Math.round((4.425-2)*PPS);await drag(p,x2,ly,x2+d2);out.m2={rawStart:2+d2/PPS,rawEnd:4+d2/PPS,edges:await loopE()};out.m2.afterUndo=await undo();
   const e1=out.m1.edges,e2=out.m2.edges;
   rec('MT-LOOP-MOVE',near(e1[0],MA)&&near(e1[1],8.375)&&near(e1[1]-e1[0],2)&&out.m1.undo!==u0&&out.m1.undoAfterUndo===u0&&near(out.m1.afterUndo[0],2)&&near(e2[0],4.375)&&near(e2[1],MA)&&near(out.m2.afterUndo[0],2),out);});
  await T('REG-LOOP-KEYS',async()=>{const brace=p.locator('[data-testid=arrangement-loop-brace]');await brace.focus();const fw=[];for(let i=0;i<5;i++){await p.keyboard.press('ArrowRight');await sleep(200);fw.push(await loopE());}const bw=[];for(let i=0;i<5;i++){await p.keyboard.press('ArrowLeft');await sleep(200);bw.push(await loopE());}
   const fs_=fw.map(e=>e[0]);const bs=bw.map(e=>e[0]);rec('REG-LOOP-KEYS',[3,4,5,6,7].every((v,i)=>near(fs_[i],v))&&[6,5,4,3,2].every((v,i)=>near(bs[i],v))&&fw.every(e=>near(e[1]-e[0],2)),{forward:fw,backward:bw,markers:await marks(p)});});
  await p.screenshot({path:`${L.OUT}/shots/mt-loop-${vp}.png`});
  await finish(s,'B');}
 if(want('C')){const s=await L.open(vp);const p=s.page;await L.fresh(p);await fixture(p);
  await T('MT-AUDIO',async()=>{const out={};out.grid=await setGrid(p,'10');await setSnap(p,true);const ds=await libDrop(p,'demo-soft-impact','sfx',6.45);const sfx=(await clips(p)).find(c=>c.lane==='sfx');out.sfx=sfx;
   await blur(p);const sm=await soloMute(p);out.soloMute=sm;await seekAway(p,30);
   const c1=await rulerClick(p,4.0,false);out.click1=c1;out.half1=await playMeasure(p,900);
   await seekAway(p,30);const c2=await rulerClick(p,4.0,true);out.click2=c2;out.half2=await playMeasure(p,1300);
   fs.writeFileSync(`${L.OUT}/meter-${vp}.json`,JSON.stringify(out,null,1));
   const sm2=await soloMute(p);out.restored=sm2;out.gridRestored=await setGrid(p,'1');
   const h1=out.half1,h2=out.half2;const ok1=near(sfx.start,MA)&&near(c1.pos,MA)&&h1.onset&&h1.onset.t<=300&&h1.max>=-15;const ok2=nearRaw(c2.pos,4)&&h2.max<-15&&h2.firstAboveMs===null&&h2.pos>c2.pos+1.0;
   rec('MT-AUDIO',!!(ok1&&ok2&&sm.solo==='true'&&sm.vmute==='true'&&sm2.solo==='false'&&sm2.vmute==='false'&&out.gridRestored==='1'),{...out,half1:{...h1},half2:{...h2}});});
  await T('REG-CLIP-SNAP',async()=>{const out={};await setSnap(p,true);const sfx=(await clips(p)).find(c=>c.lane==='sfx');const h=await p.locator(`[data-clip-id="${sfx.id}"] > div`).first().boundingBox();const y=Math.round(h.y+h.height/2);const x0=Math.round(h.x+h.width/2);
   await drag(p,x0,y,x0+100);out.away=(await clips(p)).find(c=>c.id===sfx.id).start;const h2=await p.locator(`[data-clip-id="${sfx.id}"] > div`).first().boundingBox();const x1=Math.round(h2.x+h2.width/2);const d=Math.round((6.45-out.away)*PPS);await drag(p,x1,y,x1+d);out.back={raw:out.away+d/PPS,start:(await clips(p)).find(c=>c.id===sfx.id).start};
   const lb=await laneBox(p,'video');const vx=tx(15),vy=Math.round(lb.y+lb.h/2);out.videoClick={x:vx,y:vy,lane:lb,hit:await hitAt(p,vx,vy),scrollTop:await p.evaluate(()=>document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop)};await p.mouse.click(vx,vy);await sleep(250);out.afterVideoClick=await p.evaluate(()=>({active:[...document.querySelectorAll('[data-track-id]')].filter(l=>l.querySelector('button[aria-pressed=true][aria-label$="აქტიური ხაზის არჩევა"]')).map(l=>l.getAttribute('data-track-id')),selected:[...document.querySelectorAll('[data-clip-id]')].filter(e=>/ring-brand/.test(e.className)).map(e=>e.closest('[data-track-id]').getAttribute('data-track-id'))}));await blur(p);await p.keyboard.press('Home');await sleep(200);const ks=[];for(let i=0;i<2;i++){await p.keyboard.press('Control+ArrowRight');await sleep(200);ks.push(await posOf(p));}out.ctrlRight=ks;
   rec('REG-CLIP-SNAP',near(out.away,9)&&near(out.back.start,MA)&&near(ks[0],MA)&&near(ks[1],MB),out);});
  await T('REG-MARKERS',async()=>{const out={};await setSnap(p,true);await seekAway(p,30);const u0=(await st(p)).undo;const f=p.locator('[data-testid=arrangement-marker][data-marker-time="12.000"]');const b=await f.boundingBox();const x0=Math.round(b.x+3),y=Math.round(b.y+b.height/2);
   const d=Math.round((6.45-12)*PPS);await drag(p,x0,y,x0+d);out.drag={raw:12+d/PPS,marks:await marks(p),undo:(await st(p)).undo,undoBefore:u0};await blur(p);await p.keyboard.press('Control+z');await sleep(300);out.afterUndo={marks:await marks(p),undo:(await st(p)).undo};
   const g=p.locator('[data-testid=arrangement-marker][data-marker-time="12.000"]');const gb=await g.boundingBox();await p.mouse.click(gb.x+3,gb.y+gb.height/2,{button:'right'});await sleep(300);
   out.menu=await p.evaluate(()=>{const m=[...document.querySelectorAll('[data-testid=arrangement-marker-menu]')];return{count:m.length,items:m[0]?[...m[0].querySelectorAll('[role=menuitem]')].map(x=>x.textContent):null}});
   await p.click('[data-marker-menu-action=play]');await sleep(200);const a=await posOf(p);await sleep(600);const a2=await posOf(p);await blur(p);await p.keyboard.press('Space');await sleep(300);out.play=[a,a2];
   rec('REG-MARKERS',JSON.stringify([...out.drag.marks].sort())===JSON.stringify(['6.000','6.375'])&&/Move Marker/.test(out.drag.undo||'')&&JSON.stringify([...out.afterUndo.marks].sort())===JSON.stringify(['12.000','6.375'])&&out.afterUndo.undo===u0&&out.menu.count===1&&a>=12&&a<12.4&&a2>a,out);});
  await T('REG-SNAP-SEEK',async()=>{const out={};for(const t of ['6.375','12.000']){await p.locator(`[data-testid=arrangement-marker][data-marker-time="${t}"]`).focus();await p.keyboard.press('Delete');await sleep(400);}out.marks=await marks(p);await blur(p);await setSnap(p,true);await seekAway(p,2);out.click=await rulerClick(p,6.45,false);
   const cb=await meBox(p);const y=Math.round(cb.y+cb.height*0.75);await drag(p,tx(3.2),y,tx(6.45));const s1=await st(p);out.range=s1.range;out.edges=pair(s1.range);
   rec('REG-SNAP-SEEK',out.marks.length===0&&near(out.click.pos,6)&&near(out.edges[0],3)&&near(out.edges[1],6),out);});
  await finish(s,'C');}
 if(want('D')){const s=await L.open(vp);const p=s.page;await L.fresh(p);await fixture(p,false);
  const pps=async()=>(await geo(p)).PPS;const sl=()=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft);
  await T('RU-DBLCLICK',async()=>{await blur(p);const r0=await rulerBox(p);await p.mouse.dblclick(r0.left+300,Math.round(r0.bottom-4));await sleep(600);const fit=await pps();const fitSL=await sl();const tries=[];
   for(let i=0;i<10;i++){await blur(p);if(i%2===0){for(let k=0;k<3;k++){await p.keyboard.press('=');await sleep(150);}}else{await p.keyboard.press('=');await sleep(150);await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-timeline-scroller]');e.scrollLeft=Math.min(e.scrollWidth-e.clientWidth,600);});}
    await sleep(400);const before={pps:await pps(),sl:await sl()};const r=await rulerBox(p);const vis=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-timeline-scroller]').getBoundingClientRect().toJSON());const x=Math.round(Math.max(r.left,vis.left+260)+150+i*20);const y=Math.round(r.bottom-4);const hit=await hitAt(p,x,y);
    await p.mouse.dblclick(x,y);await sleep(700);const after={pps:await pps(),sl:await sl()};tries.push({i,before,x,hit,after,ok:after.pps===fit&&after.sl===fitSL&&(before.pps!==fit||before.sl!==fitSL)});}
   rec('RU-DBLCLICK',tries.every(t=>t.ok),{fit,fitSL,hits:tries.filter(t=>t.ok).length+'/'+tries.length,tries});});
  await finish(s,'D');}
})().catch(e=>{console.log('SCRIPT ERROR',e);rec('SCRIPT',false,{e:String(e)});process.exit(1)});
