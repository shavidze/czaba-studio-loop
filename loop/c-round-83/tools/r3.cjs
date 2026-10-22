const X=require('./lib83.cjs');const{L,sleep,st,blur,key,envInfo,setMode,dblAt,dragPoint,dragPointToGain,undo,redo,mStart,mStop,dbv,now}=X;
const vp=process.argv[2]||'1440x900';const tag=process.argv[3]||'a';const rec=X.mkRec(`${L.OUT}/r3-${vp}-${tag}.json`);const T=X.T(rec);
const posNow=p=>X.posOf(p);
async function waitPos(p,t,max=25000){const t0=Date.now();while(Date.now()-t0<max){if(await posNow(p)>=t)return true;await sleep(15);}return false;}
async function seek(p,t){if(t<=0){await blur(p);await p.keyboard.press('Home');await sleep(300);return posNow(p);}const r=await p.locator('[data-testid=arrangement-ruler]').boundingBox();await p.mouse.click(X.tx(t),r.y+r.height-4);await sleep(300);await blur(p);return posNow(p);}
async function run(p,t0,t1){const ps=await seek(p,t0);await mStart(p);await p.keyboard.press('Space');await waitPos(p,t1);await p.keyboard.press('Space');await sleep(250);const m=await mStop(p);return{seekPos:ps,m};}
function near(m,t,k='stems',w=0.1){const xs=m.filter(x=>Number.isFinite(X.secs(x.pos))&&Math.abs(X.secs(x.pos)-t)<=w).map(x=>dbv(x[k]));if(!xs.length)return null;const s=[...xs].sort((a,b)=>a-b);return{n:xs.length,med:s[Math.floor(s.length/2)],min:s[0],max:s[s.length-1]};}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 for(const t of ['music','sfx']){await X.lMute(p,t).click();await sleep(150);}await blur(p);
 await setMode(p,true);for(const t of [6,7,13,14])await dblAt(p,'stems',t);await dragPointToGain(p,'stems',1,0.2512);await dragPointToGain(p,'stems',2,0.2512);
 const ENV=(await envInfo(p,'stems')).env;await setMode(p,false);rec('SETUP',X.parseEnv(ENV).length===4,{ENV});
 const R={};
 R.envLive=await run(p,5,16.6);R.envMid=await run(p,10,10.7);
 // control: undo 6 entries
 const zs=await undo(p,6);const ctrlEnv=(await envInfo(p,'stems')).env;
 R.ctrlLive=await run(p,5,16.6);R.ctrlMid=await run(p,10,10.7);
 const o={ENV,ctrlEnv,undoAfter6:zs.undo};
 o.live10={env:near(R.envLive.m,10),ctrl:near(R.ctrlLive.m,10)};o.live16={env:near(R.envLive.m,16),ctrl:near(R.ctrlLive.m,16)};o.mid={env:near(R.envMid.m,10.3,'stems',0.06),ctrl:near(R.ctrlMid.m,10.3,'stems',0.06),seek:[R.envMid.seekPos,R.ctrlMid.seekPos]};
 o.d10=o.live10.env.med-o.live10.ctrl.med;o.d16=o.live16.env.med-o.live16.ctrl.med;o.dMid=o.mid.env.med-o.mid.ctrl.med;
 // extra positions for context
 o.profile=[5.5,6.5,8,12,13.5,15].map(t=>{const a=near(R.envLive.m,t),b=near(R.ctrlLive.m,t);return{t,d:a&&b?+(a.med-b.med).toFixed(2):null}});
 require('fs').writeFileSync(`${L.OUT}/r3-raw-${vp}-${tag}.json`,JSON.stringify({envLive:R.envLive.m,ctrlLive:R.ctrlLive.m,envMid:R.envMid.m,ctrlMid:R.ctrlMid.m}));
 const lin=x=>Math.pow(10,x/20);const pw=(m,a,b)=>{const xs=m.filter(x=>{const t=X.secs(x.pos);return t>=a&&t<=b}).map(x=>dbv(x.stems));const mean=20*Math.log10(xs.reduce((s,v)=>s+lin(v),0)/Math.max(1,xs.length));return{n:xs.length,meanDbLin:+mean.toFixed(2)}};
 o.wide={p10:{env:pw(R.envLive.m,9,11),ctrl:pw(R.ctrlLive.m,9,11)},p16:{env:pw(R.envLive.m,15,16.5),ctrl:pw(R.ctrlLive.m,15,16.5)},pre:{env:pw(R.envLive.m,5,5.9),ctrl:pw(R.ctrlLive.m,5,5.9)}};
 o.wd10=o.wide.p10.env.meanDbLin-o.wide.p10.ctrl.meanDbLin;o.wd16=o.wide.p16.env.meanDbLin-o.wide.p16.ctrl.meanDbLin;o.wdPre=o.wide.pre.env.meanDbLin-o.wide.pre.ctrl.meanDbLin;
 rec('EN-LIVE-narrow',Math.abs(o.d10+12)<=2&&Math.abs(o.d16)<=1,{d10:o.d10,d16:o.d16});
 rec('EN-LIVE',ctrlEnv===''&&Math.abs(o.wd10+12)<=2&&Math.abs(o.wd16)<=1&&o.wide.p10.env.n>=20,o);
 rec('EN-MIDSTART',ctrlEnv===''&&Math.abs(o.dMid+12)<=2&&Math.abs(R.envMid.seekPos-10)<0.03,{dMid:o.dMid,mid:o.mid});
 await T('EN-PLAY-EDIT',async()=>{const q={};await redo(p,6);q.env0=(await envInfo(p,'stems')).env;await setMode(p,true);q.u0=(await st(p)).undo;
  await seek(p,0);const src0=await p.evaluate(()=>window.__src.length);await mStart(p);await p.keyboard.press('Space');await waitPos(p,5.3);const t0=await now(p);q.pos0=await posNow(p);
  q.drag=await dragPoint(p,'stems',3,0,15,{steps:10});const t1=await now(p);q.pos1=await posNow(p);await sleep(1500);q.pos2=await posNow(p);const t2=await now(p);await blur(p);await p.keyboard.press('Space');await sleep(250);const m=await mStop(p);
  const ps=m.map(x=>X.secs(x.pos)).filter(Number.isFinite);q.mono=ps.every((v,i)=>i===0||v>=ps[i-1]-1e-9);q.wallAdv=(t2-t0)/1000;q.posAdv=q.pos2-q.pos0;q.src=[src0,Math.max(...m.map(x=>x.src))];q.u1=(await st(p)).undo;q.env1=(await envInfo(p,'stems')).env;
  await undo(p);q.envZ=(await envInfo(p,'stems')).env;q.uz=(await st(p)).undo;
  q.errs=s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/.test(l));
  rec('EN-PLAY-EDIT',q.env1!==q.env0&&q.u1==='Undo: Envelope: წერტილის გადატანა'&&q.mono&&q.pos2>q.pos1&&Math.abs(q.posAdv-q.wallAdv)<0.4&&q.envZ===q.env0&&q.uz===q.u0&&q.errs.length===0,{...q,drag:{during:q.drag.during,s:q.drag.s.status}});});
 await X.finish(s,rec,'R3-'+vp+'-'+tag);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
