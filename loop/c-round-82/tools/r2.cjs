const X=require('./lib82.cjs');const{L,sleep,st,blur,key,clipInfo,hover,dragHandle,dblHandle,exportWav,strip}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r2-${vp}.json`);const T=X.T(rec);
const nrm=w=>w.fmt.tag===3?1:Math.pow(2,w.fmt.bits-1);
// per-sample ratio oracle: expected(t) function; window [t0,t1]; tol; threshold on |ref|
function ratioCheck(x,ref,t0,t1,expf,tol,thr=1e-3){const ch=ref.fmt.ch,sr=ref.fmt.sr,nx=nrm(x),nr=nrm(ref);let n=0,bad=0,maxErr=0,worst=null;const badList=[];
 for(let f=Math.ceil(t0*sr);f<Math.min(ref.frames,Math.floor(t1*sr));f++){const t=f/sr;const e=expf(t);for(let c=0;c<ch;c++){const r=ref.read(f*ch+c)/nr;if(Math.abs(r)<=thr)continue;const v=x.read(f*ch+c)/nx;const err=Math.abs(v/r-e);n++;if(err>maxErr){maxErr=err;worst={t:+t.toFixed(6),c,r:+r.toFixed(6),v:+v.toFixed(6),e:+e.toFixed(6)}}if(err>tol){bad++;if(badList.length<5)badList.push({t:+t.toFixed(6),r:+r.toFixed(6),v:+v.toFixed(6),e:+e.toFixed(6)})}}}
 // windowed 10 ms rms ratio
 let wmax=0;const W=Math.round(0.01*sr);for(let f=Math.ceil(t0*sr);f+W<=Math.min(ref.frames,Math.floor(t1*sr));f+=W){let sx=0,sr2=0,se=0;for(let k=0;k<W;k++){const e=expf((f+k)/sr);for(let c=0;c<ch;c++){const r=ref.read((f+k)*ch+c)/nr,v=x.read((f+k)*ch+c)/nx;sx+=v*v;sr2+=r*r*e*e;}}if(sr2>1e-6){const er=Math.abs(Math.sqrt(sx)/Math.sqrt(sr2)-1);if(er>wmax)wmax=er;}}
 return{n,bad,maxErr:+maxErr.toPrecision(4),worst,badList,win10msMaxRelErr:+wmax.toPrecision(4),ok:n>100&&bad===0};}
function silent(w,t0,t1){const ch=w.fmt.ch,sr=w.fmt.sr,nn=nrm(w);let m=0;for(let f=Math.floor(t0*sr);f<Math.floor(t1*sr);f++)for(let c=0;c<ch;c++)m=Math.max(m,Math.abs(w.read(f*ch+c)/nn));return m;}
const meta=e=>({fmt:e.fmt,frames:e.frames,seconds:e.seconds,sha:e.sha,nan:e.all.nan,full:e.all.full,peak:+e.all.peak.toFixed(4)});
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 await X.lMute(p,'music').click();await sleep(200);await X.lMute(p,'sfx').click();await sleep(200);await blur(p);
 const c0=await clipInfo(p,'stems');const cs=c0.start,ce=cs+16;rec('SETUP',cs===2,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),stems:[cs,ce]});
 const E={};E.ref=await exportWav(p,vp,'ref',true);rec('REF',E.ref.all.nan===0&&E.ref.win.Ws.rms>0.01,{meta:meta(E.ref),Ws:E.ref.win.Ws,dialog:E.ref.dialogText.slice(0,300)});
 await T('FD-IN',async()=>{const o={};o.d=await dragHandle(p,'stems','in',PPS);const v=+o.d.after.fi;o.v=v;o.status=o.d.s.status;o.undo=o.d.s.undo;E.in=await exportWav(p,vp,'fadein',true);o.meta=meta(E.in);
  o.ramp=ratioCheck(E.in.w,E.ref.w,cs,cs+v,t=>(t-cs)/v,0.01);o.flat=ratioCheck(E.in.w,E.ref.w,cs+v,3.5,()=>1,1e-4);o.preIn=silent(E.in.w,0,cs);o.preRef=silent(E.ref.w,0,cs);
  rec('FD-IN',Math.abs(v-1)<=1/PPS+1e-9&&o.status===`Fade In: ${v.toFixed(3)} წმ.`&&o.undo==='Undo: Fade In'&&o.ramp.ok&&o.flat.ok&&o.preIn===0&&o.preRef===0&&E.in.frames===E.ref.frames&&E.in.all.nan===0,o);});
 await T('FD-CLIPGAIN',async()=>{const o={};const v=+(await clipInfo(p,'stems')).fi;await X.selectClip(p,'stems');const tg=p.locator('[data-testid=arrangement-detail-toggle]');o.expanded0=await tg.getAttribute('aria-expanded');if(o.expanded0==='false'){await tg.click();await sleep(500);}const inp=p.locator('[data-testid=arrangement-detail-clip-gain-input]');await inp.fill('-6');await inp.press('Enter');await sleep(300);await blur(p);o.s=await st(p);o.val=await inp.inputValue();
  E.cg=await exportWav(p,vp,'fadein-gain-6',false);const g=Math.pow(10,-6/20);o.g=g;o.ramp=ratioCheck(E.cg.w,E.ref.w,cs,cs+v,t=>g*(t-cs)/v,0.01);o.flat=ratioCheck(E.cg.w,E.ref.w,cs+v,3.5,()=>g,1e-3);
  await blur(p);await key(p,'Control+z',400);o.afterUndo=await inp.inputValue();o.uz=await st(p);
  rec('FD-CLIPGAIN',/Clip Gain/.test(o.s.status)&&o.ramp.ok&&o.flat.ok&&E.cg.frames===E.ref.frames,o);});
 await T('FD-OUT',async()=>{const o={};o.d=await dragHandle(p,'stems','out',-2*PPS);const v=+o.d.after.fo;o.v=v;o.status=o.d.s.status;E.out=await exportWav(p,vp,'fadeinout',true);o.meta=meta(E.out);
  o.ramp=ratioCheck(E.out.w,E.ref.w,ce-v,ce,t=>(ce-t)/v,0.01);o.flat=ratioCheck(E.out.w,E.ref.w,12,ce-v,()=>1,1e-4);o.post=[silent(E.out.w,ce,ce+0.5),silent(E.ref.w,ce,ce+0.5)];
  rec('FD-OUT',Math.abs(v-2)<=1/PPS+1e-9&&o.status===`Fade Out: ${v.toFixed(3)} წმ.`&&o.ramp.ok&&o.flat.ok&&E.out.frames===E.ref.frames,o);});
 await T('FD-EDITS-E-EXPORT',async()=>{const o={};await X.selectClip(p,'stems');const c=await clipInfo(p,'stems');await p.mouse.click(X.tx(10),c.box.y+c.box.h*0.75);await sleep(300);o.pos=(await st(p)).pos;await blur(p);await key(p,'Control+e',500);o.s=await st(p);o.parts=(await X.allClips(p)).filter(x=>x.lane==='stems');
  E.sp=await exportWav(p,vp,'split',false);o.out=ratioCheck(E.sp.w,E.ref.w,ce-2,ce,t=>(ce-t)/2,0.01);o.cut=ratioCheck(E.sp.w,E.ref.w,10,10.1,()=>1,1e-4);o.cutL=ratioCheck(E.sp.w,E.ref.w,9.9,10,()=>1,1e-4);
  rec('FD-EDITS-E-EXPORT',o.parts.length===2&&o.parts[0].fi==='1.000'&&o.parts[0].fo==='0.000'&&o.parts[1].start===10&&o.parts[1].fi==='0.000'&&o.parts[1].fo==='2.000'&&o.out.ok&&o.cut.ok&&o.cutL.ok,o);});
 for(const k of Object.keys(E)){try{require('fs').unlinkSync(`${L.OUT}/export-${vp}-${E[k].name}.wav`)}catch{}}
 await X.finish(s,rec,'R2-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
