const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const G=(process.argv[3]||'all').split(',');const want=g=>G.includes('all')||G.includes(g);
const OUTF=`${L.OUT}/ek77-${vp}-${G.join('_')}.json`;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok===true?'PASS ':ok===false?'FAIL ':'INFO ')+id+' '+JSON.stringify(d).slice(0,900));fs.writeFileSync(OUTF,JSON.stringify(R,null,1));};
const sleep=L.sleep;const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
let PPS=40,RL=512;const M1=6.3;
const st=p=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');const u=[...document.querySelectorAll('button')].find(b=>/^Undo/.test(b.getAttribute('title')||''));return{snap:g&&g.dataset.snap,grid:g&&g.dataset.gridSeconds,undo:u&&u.getAttribute('title'),status:(document.querySelector('[data-testid=arrangement-status]')||{}).textContent,pos:(document.querySelector('[data-testid=arrangement-position]')||{}).textContent,end:(document.querySelector('[data-testid=arrangement-project-end]')||{}).textContent,range:(document.querySelector('[data-testid=arrangement-range]')||{}).textContent||null,allLanes:!!document.querySelector('[data-testid=arrangement-range-all-lanes]'),active:[...document.querySelectorAll('[data-track-id]')].filter(l=>l.querySelector('button[aria-pressed=true][aria-label$="აქტიური ხაზის არჩევა"]')).map(l=>l.getAttribute('data-track-id')),selected:[...document.querySelectorAll('[data-clip-id]')].filter(e=>/ring-brand/.test(e.className)).map(e=>e.closest('[data-track-id]').getAttribute('data-track-id')+':'+e.getAttribute('data-clip-start')),current:[...document.querySelectorAll('[data-testid=arrangement-marker][aria-current=true]')].map(e=>e.getAttribute('data-marker-time')),focus:document.activeElement&&(document.activeElement.getAttribute('data-testid')||document.activeElement.tagName)}});
const secs=t=>{const m=/(\d+):(\d+\.\d+)/.exec(t||'');return m?+m[1]*60+ +m[2]:NaN;};
const posOf=async p=>secs((await st(p)).pos);
const clips=p=>p.evaluate(()=>{const z=+/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];return[...document.querySelectorAll('[data-clip-id]')].map(e=>({id:e.getAttribute('data-clip-id'),lane:e.closest('[data-track-id]').getAttribute('data-track-id'),start:+e.getAttribute('data-clip-start'),dur:+(e.getBoundingClientRect().width/z).toFixed(3),title:e.textContent.trim().slice(0,14)}))});
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>({id:e.getAttribute('data-marker-id'),t:e.getAttribute('data-marker-time'),cur:e.getAttribute('aria-current')})));
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur&&document.activeElement.blur());
const setSnap=async(p,on)=>{await blur(p);if(((await st(p)).snap==='on')!==on){await p.click('[data-testid=arrangement-snap-toggle]');await sleep(150);}await blur(p);return (await st(p)).snap;};
const tx=t=>RL+t*PPS;
const laneBox=(p,t)=>p.evaluate(t=>{const l=document.querySelector(`[data-track-id="${t}"]`);const b=l.querySelector('[data-grid-seconds]')||l;const r=b.getBoundingClientRect();return{x:r.left,y:r.top,w:r.width,h:r.height}},t);
async function geo(p){const g=await p.evaluate(()=>({rl:document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left,z:document.querySelector('[data-testid=arrangement-zoom-readout]').textContent}));RL=g.rl;PPS=+/([\d.]+)/.exec(g.z)[1];return{RL,PPS};}
async function addMarker(p,t){await setSnap(p,false);const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(tx(t),r.top+r.height/2);await sleep(200);await p.keyboard.press('m');await sleep(200);await p.keyboard.press('Enter');await sleep(300);await blur(p);}
async function libDrop(p,src,lane,t){const o=p.locator(`[role=option][data-source-id="${src}"]`);await o.scrollIntoViewIfNeeded();const t0=Date.now();while(Date.now()-t0<60000&&(await o.getAttribute('draggable'))!=='true')await sleep(200);const ob=await o.boundingBox();const lb=await laneBox(p,lane);
 await p.mouse.move(ob.x+ob.width/2,ob.y+ob.height/2);await p.mouse.down();await p.mouse.move(ob.x+ob.width/2+12,ob.y+ob.height/2,{steps:3});
 await p.mouse.move(tx(t),lb.y+lb.h/2,{steps:14});await sleep(300);await p.mouse.up();await sleep(900);return st(p);}
async function hdr(p,id){return p.locator(`[data-clip-id="${id}"] > div`).first().boundingBox();}
async function clickClip(p,id,ctrl){const h=await hdr(p,id);if(ctrl)await p.keyboard.down('Control');await p.mouse.click(h.x+h.width/2,h.y+h.height/2);if(ctrl)await p.keyboard.up('Control');await sleep(250);}
async function clickEmpty(p,lane,t){const lb=await laneBox(p,lane);await p.mouse.click(tx(t),lb.y+lb.h/2);await sleep(250);}
const near=(v,t,e=0.0011)=>Math.abs(+v-t)<=e;
const T=async(id,fn)=>{try{await fn();}catch(e){rec(id,false,{error:String(e).slice(0,400)});}};
async function step(p,key,n){const out=[];let prev=(await st(p)).status;for(let i=0;i<n;i++){await p.keyboard.press(key);await sleep(180);const s=await st(p);out.push({pos:secs(s.pos),status:s.status,newStatus:s.status!==prev,current:s.current.join(',')});prev=s.status;if(out.length>1&&out[out.length-1].pos===out[out.length-2].pos)break;}return out;}
const seq=(o)=>o.map(x=>+x.pos.toFixed(3));
const eqSeq=(a,b)=>a.length===b.length&&a.every((v,i)=>near(v,b[i]));
async function home(p){await blur(p);await p.keyboard.press('Home');await sleep(200);}
async function fixture(p){
 await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='Decline');if(b)b.click();});await sleep(200);
 await geo(p);await setSnap(p,false);const steps={};
 steps.me=await libDrop(p,'demo-middle-east','music',0.35);
 steps.stems=await libDrop(p,'demo-soft-impact','stems',4.7);
 steps.sfx=await libDrop(p,'demo-soft-impact','sfx',3.45);
 await addMarker(p,M1);const c=await clips(p);const s=await st(p);
 const F={me:c.find(x=>x.lane==='music'),stems:c.find(x=>x.lane==='stems'),sfx:c.find(x=>x.lane==='sfx'),marks:await marks(p),end:secs(s.end)};
 F.sfxEnd=+(F.sfx.start+F.sfx.dur).toFixed(3);F.stemsEnd=+(F.stems.start+F.stems.dur).toFixed(3);F.meEnd=+(F.me.start+F.me.dur).toFixed(3);
 // precise ends from the detail panel is not needed: use dur from width; tolerance 1 px
 rec('FIXTURE',near(F.me.start,0.35)&&near(F.stems.start,4.7)&&near(F.sfx.start,3.45)&&F.marks.length===1&&F.marks[0].t==='6.300'&&F.sfxEnd<M1&&F.stemsEnd>M1,{vp,RL,PPS,afterDrops:{me:{active:steps.me.active,sel:steps.me.selected},stems:{active:steps.stems.active,sel:steps.stems.selected},sfx:{active:steps.sfx.active,sel:steps.sfx.selected}},F,state:s});
 return F;}
// exact end values: read via Ctrl+-> stops instead of width; compare within 1 px (1/PPS)
const nearPx=(v,t)=>Math.abs(+v-t)<=1/PPS+0.001;
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
(async()=>{
 if(want('A')){const s=await L.open(vp);const p=s.page;await L.fresh(p);const F=await fixture(p);const END=F.end;
  await T('EK-ACTIVE',async()=>{await clickEmpty(p,'sfx',15);const s0=await st(p);await home(p);const h=await st(p);
   const fw=await step(p,'Control+ArrowRight',7);const bw=await step(p,'Control+ArrowLeft',7);
   const exp=[3.45,F.sfxEnd,M1,END];const fs_=seq(fw);const bs=seq(bw);
   const fwOk=fs_.length>=4&&near(fs_[0],3.45)&&nearPx(fs_[1],F.sfxEnd)&&near(fs_[2],M1)&&near(fs_[3],END)&&!fs_.some(v=>near(v,4.7,0.01));
   const bwOk=near(bs[0],M1)&&nearPx(bs[1],F.sfxEnd)&&near(bs[2],3.45)&&near(bs[3],0)&&near(bs[4],0)&&/უკან მარკერი აღარ არის/.test(bw[4].status||'');
   const fwdRefusal=fw[fw.length-1].status;
   rec('EK-ACTIVE',fwOk&&bwOk&&fw.slice(0,4).every(x=>!x.newStatus)&&bw.slice(0,4).every(x=>!x.newStatus)&&s0.selected.length===0&&s0.active.join()==='sfx',{afterLaneClick:{active:s0.active,selected:s0.selected,pos:s0.pos,range:s0.range},afterHome:h.pos,expected:exp,forward:fw,backward:bw,fwdRefusal});
   await p.screenshot({path:`${L.OUT}/shots/ek-active-${vp}.png`});});
  await T('EK-BUTTONS',async()=>{await home(p);const out=[];for(const id of ['next','next','next','prev','prev','prev']){const b=await p.locator(`[data-testid=arrangement-marker-${id}]`).boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);await sleep(200);const x=await st(p);out.push({id,pos:secs(x.pos),status:x.status,current:x.current.join(',')});}
   const ps=out.map(x=>x.pos);rec('EK-BUTTONS',near(ps[0],M1)&&near(ps[1],END)&&near(ps[3],M1)&&near(ps[4],0),{out,expected:[M1,END,'refuse',M1,0,'refuse'],state:(await st(p)).active});});
  await T('EK-AUDIO',async()=>{await clickEmpty(p,'sfx',15);const s0=await st(p);const sm=await soloMute(p);await home(p);
   await p.keyboard.press('Control+ArrowRight');await sleep(200);const posA=await posOf(p);const a=await playMeasure(p,900);
   await home(p);const b=await p.locator('[data-testid=arrangement-marker-next]').boundingBox();await p.mouse.click(b.x+b.width/2,b.y+b.height/2);await sleep(200);const posB=await posOf(p);await blur(p);const bm=await playMeasure(p,1300);
   const bAbove=bm.trace.filter(x=>x[0]<=1000&&dbn(x[1])>=-15).length;
   const okA=near(posA,3.45)&&a.onset&&a.onset.t<=300&&a.max>=-15&&a.pos>3.45+0.5;const okB=near(posB,M1)&&bm.max<-15&&bm.firstAboveMs===null&&bm.pos>M1+1.0;
   fs.writeFileSync(`${L.OUT}/meter-${vp}.json`,JSON.stringify({a,bm},null,1));
   const sm2=await soloMute(p);
   rec('EK-AUDIO',!!(okA&&okB&&sm.solo==='true'&&sm.vmute==='true'&&sm2.solo==='false'&&sm2.vmute==='false'),{state:{active:s0.active,selected:s0.selected},soloMute:sm,restored:sm2,half1:{posBeforePlay:posA,...a},half2:{posBeforePlay:posB,...bm,bAbove1s:bAbove}});});
  await T('EK-PLAYING',async()=>{await home(p);await blur(p);await p.keyboard.press('Space');await sleep(600);const p0=await posOf(p);await p.keyboard.press('Control+ArrowRight');await sleep(60);const p1=await posOf(p);await sleep(400);const p2=await posOf(p);await blur(p);await p.keyboard.press('Space');await sleep(300);const p3=await posOf(p);await sleep(300);const p4=await posOf(p);
   rec('EK-PLAYING',p0>0.3&&p0<3.45&&p1>=3.45-0.001&&p1<3.45+0.5&&p2>p1+0.2&&p3===p4,{p0,p1,p2,stopped:[p3,p4],expectedStop:3.45});});
  await T('EK-SELECT',async()=>{await clickClip(p,F.sfx.id);await clickClip(p,F.stems.id,true);const s0=await st(p);await home(p);
   const fw=await step(p,'Control+ArrowRight',8);const fs_=seq(fw);
   const exp=[3.45,4.7,F.sfxEnd,M1,F.stemsEnd,END];
   const ok=fs_.length>=6&&near(fs_[0],3.45)&&near(fs_[1],4.7)&&nearPx(fs_[2],F.sfxEnd)&&near(fs_[3],M1)&&nearPx(fs_[4],F.stemsEnd)&&near(fs_[5],END);
   rec('EK-SELECT',ok&&s0.selected.length===2,{state:{active:s0.active,selected:s0.selected},expected:exp,forward:fw});
   // EK-MARKER-SEL from this sequence
   const atM=fw[3],afterEdge=fw[4];
   rec('EK-MARKER-SEL',atM&&afterEdge&&atM.current==='6.300'&&afterEdge.current==='6.300'&&!atM.newStatus&&!afterEdge.newStatus&&nearPx(afterEdge.pos,F.stemsEnd),{atMarker:atM,afterClipEdge:afterEdge,note:'marker aria-current before sequence recorded in EK-ACTIVE'});
   await p.screenshot({path:`${L.OUT}/shots/ek-select-${vp}.png`});});
  await T('EK-RANGE',async()=>{await clickEmpty(p,'sfx',15);const s0=await st(p);
   const cb=await p.locator(`[data-clip-id="${F.stems.id}"]`).boundingBox();const y=cb.y+cb.height*0.75;await p.mouse.move(tx(5.0),y);await p.mouse.down();for(let i=1;i<=10;i++){await p.mouse.move(tx(5.0)+Math.round(0.6*PPS)*i/10,y);await sleep(15);}await p.mouse.up();await sleep(300);
   const s1=await st(p);await home(p);const fw=await step(p,'Control+ArrowRight',9);const s2=await st(p);
   await blur(p);await p.keyboard.press('Control+Shift+L');await sleep(300);const s3=await st(p);await home(p);const fw2=await step(p,'Control+ArrowRight',10);const s4=await st(p);
   await p.screenshot({path:`${L.OUT}/shots/ek-range-${vp}.png`});
   const tracks=new Set([...s1.active,...s1.selected.map(x=>x.split(':')[0]),'stems']);
   const edgesOf=l=>l==='sfx'?[3.45,F.sfxEnd]:l==='stems'?[4.7,F.stemsEnd]:l==='music'?[0.35,F.meEnd]:[];
   const exp1=[...new Set([...[...tracks].flatMap(edgesOf),M1].map(v=>+v.toFixed(3)))].filter(v=>v>0).sort((a,b)=>a-b);
   const exp2=[0.35,3.45,4.7,F.sfxEnd,M1,F.stemsEnd,END];
   const cmp=(got,exp)=>{const g=seq(got);return exp.every((v,i)=>i<g.length&&nearPx(g[i],v));};
   rec('EK-RANGE',!!s1.range&&cmp(fw,exp1)&&s3.allLanes&&cmp(fw2,exp2),{afterLaneClick:{active:s0.active,selected:s0.selected,range:s0.range},afterRangeDrag:{active:s1.active,selected:s1.selected,range:s1.range},expected1:exp1,forward1:fw.map(x=>x.pos),rangeAfterSteps:s2.range,afterCtrlShiftL:{range:s3.range,allLanes:s3.allLanes},expected2:exp2,forward2:fw2.map(x=>x.pos),rangeAfter2:s4.range});});
  await finish(s,'A');}
 if(want('B')){const s=await L.open(vp);const p=s.page;await L.fresh(p);const F=await fixture(p);
  await T('EK-ALT-LINUX',async()=>{await clickClip(p,F.sfx.id);await setSnap(p,true);await home(p);const s0=await st(p);
   await p.keyboard.press('Alt+ArrowRight');await sleep(250);const cA=(await clips(p)).find(x=>x.id===F.sfx.id);const sA=await st(p);
   await p.keyboard.press('Control+z');await sleep(250);const cU=(await clips(p)).find(x=>x.id===F.sfx.id);const sU=await st(p);
   await p.keyboard.press('ArrowRight');await sleep(250);const cP=(await clips(p)).find(x=>x.id===F.sfx.id);const sP=await st(p);
   await p.keyboard.press('Control+z');await sleep(250);const cU2=(await clips(p)).find(x=>x.id===F.sfx.id);
   rec('EK-ALT-LINUX',near(cA.start,cP.start)&&near(cA.start,4)&&sA.pos===s0.pos&&sP.pos===s0.pos&&sA.undo===sP.undo&&near(cU.start,3.45)&&sU.undo===s0.undo&&near(cU2.start,3.45),{before:{start:3.45,pos:s0.pos,undo:s0.undo,sel:s0.selected,active:s0.active,snap:s0.snap},alt:{start:cA.start,pos:sA.pos,undo:sA.undo,status:sA.status},afterUndo:{start:cU.start,undo:sU.undo},plain:{start:cP.start,pos:sP.pos,undo:sP.undo},afterUndo2:cU2.start});});
  await T('REG-NUDGE',async()=>{const out={};await clickClip(p,F.sfx.id);
   for(const snap of [true,false]){await setSnap(p,snap);const u0=(await st(p)).undo;const c0=(await clips(p)).find(x=>x.id===F.sfx.id).start;
    await p.keyboard.press('ArrowRight');await sleep(250);const c1=(await clips(p)).find(x=>x.id===F.sfx.id).start;const u1=(await st(p)).undo;
    await p.keyboard.press('ArrowLeft');await sleep(250);const c2=(await clips(p)).find(x=>x.id===F.sfx.id).start;
    await p.keyboard.press('Control+z');await sleep(250);const c3=(await clips(p)).find(x=>x.id===F.sfx.id).start;await p.keyboard.press('Control+z');await sleep(250);const c4=(await clips(p)).find(x=>x.id===F.sfx.id).start;const u4=(await st(p)).undo;
    out[snap?'snapOn':'snapOff']={c0,right:c1,left:c2,undo1:c3,undo2:c4,undoTitleBefore:u0,afterRight:u1,afterUndos:u4};}
   const a=out.snapOn,b=out.snapOff;
   rec('REG-NUDGE',near(a.right,4)&&near(a.left,3)&&near(a.undo1,4)&&near(a.undo2,3.45)&&near(b.right,3.55)&&near(b.left,3.45)&&near(b.undo1,3.55)&&near(b.undo2,3.45)&&a.afterUndos===a.undoTitleBefore,out);});
  await T('EK-GUARDS',async()=>{const out={};await home(p);await clickEmpty(p,'sfx',15);await home(p);
   const bpm=p.locator('[data-testid=arrangement-tempo-input]');await bpm.click();await sleep(150);const b0=await st(p);await p.keyboard.press('Control+ArrowRight');await sleep(200);const b1=await st(p);out.bpm={focus:b0.focus,pos:[b0.pos,b1.pos]};
   await home(p);const fader=p.locator('[data-track-id=sfx] input[type=range]').first();await fader.focus();const v0=await fader.inputValue();const f0=await st(p);await p.keyboard.press('Control+ArrowRight');await sleep(200);const f1=await st(p);const v1=await fader.inputValue();out.fader={label:await fader.getAttribute('aria-label'),focus:f0.focus,pos:[f0.pos,f1.pos],value:[v0,v1]};
   await blur(p);if(v1!==v0){await p.keyboard.press('Control+z');await sleep(200);}
   await home(p);const vol=p.locator('[data-track-id=sfx] input[type=range][aria-label^="Volume"]').first();await vol.focus();const w0=await vol.inputValue();const vv0=await st(p);await p.keyboard.press('Control+ArrowRight');await sleep(200);const vv1=await st(p);const w1=await vol.inputValue();out.volume={label:await vol.getAttribute('aria-label'),focus:vv0.focus,pos:[vv0.pos,vv1.pos],value:[w0,w1]};
   await blur(p);await sleep(300);if(w1!==w0){await p.keyboard.press('Control+z');await sleep(200);}out.volume.afterUndo=await vol.inputValue();
   await home(p);const m0=await marks(p);const u0=(await st(p)).undo;const flag=p.locator('[data-testid=arrangement-marker]').first();await flag.focus();const g0=await st(p);await p.keyboard.press('Control+ArrowRight');await sleep(200);const g1=await st(p);await p.keyboard.press('Control+ArrowRight');await sleep(200);const g2=await st(p);const m1=await marks(p);
   out.flag={focus:g0.focus,pos:[g0.pos,g1.pos,g2.pos],marks:[m0.map(m=>m.t),m1.map(m=>m.t)],undo:[u0,g2.undo],active:g0.active,status:g2.status};
   rec('EK-GUARDS',b0.focus!=='BODY'&&b0.pos===b1.pos&&f0.pos===f1.pos&&vv0.pos===vv1.pos&&/Volume/.test(out.volume.label)&&near(secs(g1.pos),3.45)&&nearPx(secs(g2.pos),F.sfxEnd)&&JSON.stringify(m0.map(m=>m.t))===JSON.stringify(m1.map(m=>m.t))&&u0===g2.undo,out);});
  await T('REG-MARKERS',async()=>{await setSnap(p,true);const out={};const f=p.locator(`[data-testid=arrangement-marker][data-marker-time="6.300"]`);const b=await f.boundingBox();
   await p.mouse.move(b.x+3,b.y+b.height/2);await p.mouse.down();for(let i=1;i<=12;i++){await p.mouse.move(b.x+3+Math.round(1.0*PPS)*i/12,b.y+b.height/2);await sleep(15);}await p.mouse.up();await sleep(300);
   out.drag={marks:(await marks(p)).map(m=>m.t),undo:(await st(p)).undo};
   const g=p.locator('[data-testid=arrangement-marker]').first();const gb=await g.boundingBox();await p.mouse.click(gb.x+3,gb.y+gb.height/2,{button:'right'});await sleep(300);
   out.menu=await p.evaluate(()=>{const m=[...document.querySelectorAll('[data-testid=arrangement-marker-menu]')];return{count:m.length,items:m[0]?[...m[0].querySelectorAll('[role=menuitem]')].map(x=>x.textContent):null}});
   await p.click('[data-marker-menu-action=play]');await sleep(200);const a=await posOf(p);await sleep(600);const a2=await posOf(p);await blur(p);await p.keyboard.press('Space');await sleep(200);out.play=[a,a2];
   rec('REG-MARKERS',JSON.stringify(out.drag.marks)===JSON.stringify(['7.000'])&&/Move Marker|მარკერ/.test(out.drag.undo||'')&&out.menu.count===1&&a>=7&&a<7.4&&a2>a,out);});
  await finish(s,'B');}

 if(want('C')){const s=await L.open(vp);const p=s.page;await L.fresh(p);const F=await fixture(p);
  await T('EK-MARKER-SEL-2',async()=>{await addMarker(p,12);const m0=await marks(p);await clickClip(p,F.stems.id);const s0=await st(p);await home(p);
   const fw=await step(p,'Control+ArrowRight',7);const g=seq(fw);
   const ok=near(g[0],4.7)&&fw[0].current==='12.000'&&near(g[1],M1)&&fw[1].current==='6.300'&&nearPx(g[2],F.stemsEnd)&&fw[2].current==='6.300'&&near(g[3],12)&&fw[3].current==='12.000'&&near(g[4],F.end)&&fw[4].current==='12.000'&&fw.slice(0,5).every(x=>!x.newStatus);
   rec('EK-MARKER-SEL-2',ok,{marksBefore:m0,state:{active:s0.active,selected:s0.selected,current:s0.current},expected:'4.7(cur 12) 6.3(cur 6.3) 6.7(cur 6.3) 12(cur 12) end(cur 12)',forward:fw});
   await p.screenshot({path:`${L.OUT}/shots/ek-marker-sel-${vp}.png`});});
  await finish(s,'C');}
})().catch(e=>{console.log('SCRIPT ERROR',e);rec('SCRIPT',false,{e:String(e)});process.exit(1)});
