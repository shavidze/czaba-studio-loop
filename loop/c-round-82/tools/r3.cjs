const X=require('./lib82.cjs');const{L,sleep,st,blur,key,clipInfo,dragHandle,mStart,mStop,dbv,now}=X;
const vp=process.argv[2]||'1440x900';const LANE=process.argv[3]||'stems';const rec=X.mkRec(`${L.OUT}/r3-${vp}-${LANE}.json`);const T=X.T(rec);
const posNow=p=>X.posOf(p);
async function waitPos(p,t,max=20000){const t0=Date.now();while(Date.now()-t0<max){if(await posNow(p)>=t)return true;await sleep(15);}return false;}
async function seek(p,t){if(t<=0){await blur(p);await p.keyboard.press('Home');await sleep(300);return posNow(p);}const r=await p.locator('[data-testid=arrangement-ruler]').boundingBox();await p.mouse.click(X.tx(t),r.y+r.height-4);await sleep(300);let pos=await posNow(p);
 if(Math.abs(pos-t)>0.03){const lb=await X.laneBox(p,'video');await p.mouse.click(X.tx(t),lb.y+lb.h-6);await sleep(300);pos=await posNow(p);}await blur(p);return pos;}
// run playback from t0 to t1 and return meter samples
async function run(p,t0,t1){const ps=await seek(p,t0);await mStart(p);await p.keyboard.press('Space');await waitPos(p,t1);await p.keyboard.press('Space');await sleep(250);const m=await mStop(p);return{seekPos:ps,m};}
function readAt(m,t,k){let best=null;for(const x of m){const pt=X.secs(x.pos);if(!Number.isFinite(pt))continue;if(!best||Math.abs(pt-t)<Math.abs(X.secs(best.pos)-t))best=x;}return best?{pos:X.secs(best.pos),db:dbv(best[k])}:null;}
function around(m,t,k){return m.filter(x=>Math.abs(X.secs(x.pos)-t)<=0.09).map(x=>[X.secs(x.pos),dbv(x[k])]);}
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 const mute=['music','stems','sfx'].filter(t=>t!==LANE);for(const t of mute){await X.lMute(p,t).click();await sleep(150);}await blur(p);
 const c=await clipInfo(p,LANE);const cs=c.start;rec('SETUP',true,{lane:LANE,cs,muted:mute});
 const A=cs+0.15,B=cs+0.95,M1=cs+0.6,M2=cs+1.3;const out={};
 await T('FD-LIVE',async()=>{const o={};
  const P0=Math.max(0,cs-0.5);const c1=await run(p,P0,cs+1.4);o.ctrl1={seek:c1.seekPos,a:readAt(c1.m,A,LANE),b:readAt(c1.m,B,LANE),aN:around(c1.m,A,LANE),bN:around(c1.m,B,LANE)};o.ctrl1.d=o.ctrl1.b.db-o.ctrl1.a.db;
  o.drag=await dragHandle(p,LANE,'in',PPS);o.v=o.drag.after.fi;
  const f1=await run(p,P0,cs+1.4);o.fade={seek:f1.seekPos,a:readAt(f1.m,A,LANE),b:readAt(f1.m,B,LANE),aN:around(f1.m,A,LANE),bN:around(f1.m,B,LANE),master:{a:readAt(f1.m,A,'M'),b:readAt(f1.m,B,'M')}};o.fade.d=o.fade.b.db-o.fade.a.db;
  o.paired={a:o.fade.a.db-o.ctrl1.a.db,b:o.fade.b.db-o.ctrl1.b.db,expA:20*Math.log10(0.15),expB:20*Math.log10(0.95)};out.live=o;rec('FD-LIVE',o.v==='1.000'&&Math.abs(o.ctrl1.d)<=3&&o.fade.d>=12,{v:o.v,paired:o.paired,ctrl1:o.ctrl1,fade:o.fade,ctrlNoise:Math.abs(o.ctrl1.d)>3});});
 await T('FD-MIDSTART',async()=>{const o={};const r=await run(p,cs+0.5,cs+1.45);o.fade={seek:r.seekPos,a:readAt(r.m,M1,LANE),b:readAt(r.m,M2,LANE),aN:around(r.m,M1,LANE),bN:around(r.m,M2,LANE)};o.fade.d=o.fade.b.db-o.fade.a.db;
  await blur(p);await key(p,'Control+z',400);o.afterUndo=(await clipInfo(p,LANE)).fi;
  const r2=await run(p,cs+0.5,cs+1.45);o.ctrl={a:readAt(r2.m,M1,LANE),b:readAt(r2.m,M2,LANE)};o.ctrl.d=o.ctrl.b.db-o.ctrl.a.db;
  const r3=await run(p,Math.max(0,cs-0.5),cs+1.4);o.liveCtrl2={a:readAt(r3.m,A,LANE),b:readAt(r3.m,B,LANE)};o.liveCtrl2.d=o.liveCtrl2.b.db-o.liveCtrl2.a.db;
  o.paired={a:o.fade.a.db-o.ctrl.a.db,b:o.fade.b.db-o.ctrl.b.db,expA:20*Math.log10(0.6),expB:0};rec('FD-MIDSTART',o.fade.d>=2&&o.fade.d<=12&&o.fade.a.db>-60,o);rec('FD-LIVE-CTRL2',Math.abs(o.liveCtrl2.d)<=3,o.liveCtrl2);});
 if(LANE==='stems')await T('FD-PLAY-EDIT',async()=>{const o={u0:(await st(p)).undo};await seek(p,0);const src0=await p.evaluate(()=>window.__src.length);await mStart(p);await p.keyboard.press('Space');await waitPos(p,cs+3.3);const t0=await now(p);o.pos0=await posNow(p);
  o.drag=await dragHandle(p,LANE,'out',-PPS);const t1=await now(p);o.pos1=await posNow(p);await sleep(1500);o.pos2=await posNow(p);const t2=await now(p);o.playing=o.pos2>o.pos1;await blur(p);await p.keyboard.press('Space');await sleep(250);const m=await mStop(p);
  const ps=m.map(x=>X.secs(x.pos)).filter(Number.isFinite);o.mono=ps.every((v,i)=>i===0||v>=ps[i-1]-1e-9);o.wallAdv=(t2-t0)/1000;o.posAdv=o.pos2-o.pos0;o.src=[src0,Math.max(...m.map(x=>x.src))];o.after=o.drag.after.fo;o.u1=(await st(p)).undo;
  await key(p,'Control+z',400);o.z=(await clipInfo(p,LANE)).fo;o.uz=(await st(p)).undo;await key(p,'Control+y',400);o.y=(await clipInfo(p,LANE)).fo;
  rec('FD-PLAY-EDIT',o.after==='1.000'&&o.u1==='Undo: Fade Out'&&o.mono&&o.playing&&Math.abs(o.posAdv-o.wallAdv)<0.4&&o.z==='0.000'&&o.uz===o.u0&&o.y==='1.000',o);});
 await X.finish(s,rec,'R3-'+vp+'-'+LANE);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
