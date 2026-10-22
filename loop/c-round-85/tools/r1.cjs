const X=require('./lib84.cjs');const{L,sleep,st,blur,key,vInfo,ov,vDrag,vDbl,vPress,moveV,seek,boxShot,undo,redo}=X;
const fs=require('fs');const crypto=require('crypto');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r1-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const near=(a,b,t)=>Math.abs(a-b)<=t;
async function dialog(p){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});await sleep(300);
 return p.evaluate(()=>{const t=document.querySelector('#arrangement-export-title');const d=t.closest('[role=dialog]');const labs=[...d.querySelectorAll('label')];const vl=labs.find(l=>/ვიდეო \(აუდიოთი\)/.test(l.textContent));const line=d.querySelector('[data-testid=arrangement-export-video-fades]');
  return{videoOpt:vl?{disabled:vl.querySelector('input').disabled,text:vl.textContent.replace(/\s+/g,' ').trim()}:null,line:line?line.textContent:null,nLine:d.querySelectorAll('[data-testid=arrangement-export-video-fades]').length}});}
async function doExport(p,name){const dlP=p.waitForEvent('download',{timeout:300000});await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;const fn=dl.suggestedFilename();const out=`${L.OUT}/export-${vp}-${name}.wav`;await dl.saveAs(out);await sleep(400);await p.keyboard.press('Escape');await sleep(400);const buf=fs.readFileSync(out);const w=X.W.parse(buf);return{fn,out,w,sha:crypto.createHash('sha256').update(buf).digest('hex').slice(0,16),frames:w.frames,fmt:w.fmt,seconds:+w.seconds.toFixed(4)};}
async function playRun(p,from,dur){await seek(p,from);await p.evaluate(()=>{window.__s=[];const o=document.querySelector('[data-testid=arrangement-video-fade]');const h=document.querySelector('[data-testid=arrangement-playhead-handle]');const f=()=>{const a=document.querySelector('video[data-video-role=active]');window.__s.push({t:performance.now(),pos:+h.getAttribute('aria-valuenow'),dv:+o.dataset.videoOpacity,co:+getComputedStyle(o).opacity,ct:a?a.currentTime:null,pa:a?a.paused:null,src:window.__src.length});if(window.__run)requestAnimationFrame(f)};window.__run=true;requestAnimationFrame(f);});
 await blur(p);await p.keyboard.press('Space');await sleep(dur);await p.keyboard.press('Space');await sleep(200);return p.evaluate(()=>{window.__run=false;return window.__s});}
function anaPlay(s,S,fi){const exp=pos=>Math.min(1,Math.max(0,(pos-S)/fi));const inr=s.filter(x=>x.pos>=S-0.5&&x.pos<=S+fi+1);let maxErr=0,worst=null,nonMono=0,maxCoErr=0;let prev=-1;
 for(const x of inr){const e=Math.abs(x.dv-exp(x.pos));if(e>maxErr){maxErr=e;worst=x}if(x.dv+1e-9<prev)nonMono++;prev=x.dv;maxCoErr=Math.max(maxCoErr,Math.abs(x.co-(1-x.dv)))}
 const pm=[];for(let i=1;i<s.length;i++)if(s[i].pos+1e-9<s[i-1].pos)pm.push(i);
 const at=t=>{const c=inr.filter(x=>x.pos<=t).pop();return c&&{pos:c.pos,dv:c.dv}};
 return{n:inr.length,maxErr:+maxErr.toFixed(4),worst,nonMono,maxCoErr:+maxCoErr.toFixed(4),posBack:pm.length,first:inr[0],last:inr[inr.length-1],at20:at(S),at25:at(S+0.5),at30:at(S+1)};}
function anaSync(s,S,off=0){const v=s.filter(x=>x.pos>=S+0.3&&x.ct!=null&&!x.pa);let m=0,sum=0;for(const x of v){const e=Math.abs(x.ct-(x.pos-S+off));m=Math.max(m,e);sum+=e}return{n:v.length,max:+m.toFixed(4),mean:+(sum/Math.max(1,v.length)).toFixed(4)};}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);
 const U=await X.setupV(p);const S=U.v.start,E=U.v.end;rec('SETUP',U.v.n===1&&near(S,2,0.03),{S,E,v:U.v,clips:U.S.clips.map(c=>[c.lane,c.start,c.dur]),geo:U.S.geo,move:U.m.s.undo});
 await T('VF-HANDLES',async()=>{const o={};o.v=await X.hoverV(p);o.audio=await X.hover(p,'stems');await p.screenshot({path:`${SH}/vf-handles-${vp}.png`});
  await X.setMode(p,true);o.envV=await X.hoverV(p);o.envA=await X.hover(p,'stems');await p.screenshot({path:`${SH}/vf-handles-env-${vp}.png`});await X.setMode(p,false);
  await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]');await sleep(500);o.fold=await vInfo(p);o.folded=await p.evaluate(()=>document.querySelector('[data-track-id=video]').dataset.trackFolded);await p.screenshot({path:`${SH}/vf-handles-folded-${vp}.png`});await p.click('[data-track-id=video] [data-testid=arrangement-track-fold]');await sleep(500);o.unfold=await X.hoverV(p);await blur(p);
  const TI='Video Fade In — სურათი (ხმა არ იცვლება) · drag · double-click = 0',TO='Video Fade Out — სურათი (ხმა არ იცვლება) · drag · double-click = 0';
  rec('VF-HANDLES',o.v.hin&&o.v.hout&&o.v.hin.title===TI&&o.v.hout.title===TO&&o.v.clipFadeIds.length===0&&!!o.audio.hin&&!!o.audio.hout&&!o.envV.hin&&!o.envV.hout&&!o.envA.hin&&o.folded==='true'&&!o.fold.hin&&!o.fold.hout&&!!o.unfold.hin,{vh:[o.v.hin,o.v.hout],clipFadeIds:o.v.clipFadeIds,audioTitles:[o.audio.hin&&o.audio.hin.title,o.audio.hout&&o.audio.hout.title],env:{v:[o.envV.hin,o.envV.hout],a:[o.envA.hin,o.envA.hout]},folded:o.folded,fold:[o.fold.hin,o.fold.hout],unfold:!!o.unfold.hin});});
 const U0=(await st(p)).undo;
 await T('VF-IN',async()=>{const r=await vDrag(p,'in',40);await p.mouse.move(5,5);await sleep(200);const v=await vInfo(p);r.v=v;
  const u=(await st(p)).undo;rec('VF-IN',v.fi==='1.000'&&v.fo==='0.000'&&/Video Fade In: 1\.000 წმ/.test(r.during)&&r.s.status==='Video Fade In: 1.000 წმ.'&&/Video Fade In/.test(u)&&v.ramps&&v.clipFadeIds.length===0,{during:r.during,status:r.s.status,undo:u,U0,fi:v.fi,fo:v.fo,ramps:v.ramps,clipFadeIds:v.clipFadeIds});
  await p.screenshot({path:`${SH}/vf-in-${vp}.png`});});
 const tIn=Date.now();
 await T('VF-PREVIEW-stopped',async()=>{const o={pts:[]};for(const [t,e] of [[1.5,1],[S+0.25,0.25],[S+0.5,0.5],[S+0.75,0.75],[S+1.5,1]]){const r=await seek(p,t);o.pts.push({t,e,pos:r.pos,dv:+r.dv,co:+r.co,so:r.so,okv:near(+r.dv,e,0.01),oko:near(+r.co,1-e,0.011)});}
  rec('VF-PREVIEW-stopped',o.pts.every(x=>x.okv&&x.oko),o);});
 const PX={};
 await T('VF-PREVIEW-pixel-faded',async()=>{for(const [k,t] of [['bg',S],['q1',S+0.25],['q3',S+0.75],['full',S+1.5]]){await seek(p,t);await sleep(500);PX[k]={t,o:await ov(p),L:await boxShot(p,`${SH}/vf-box-${k}-${vp}.png`)};}rec('VF-PREVIEW-pixel-faded',null,PX);});
 let RUN={};
 await T('VF-PREVIEW-play',async()=>{const smp=await playRun(p,1.5,2900);fs.writeFileSync(`${L.OUT}/r1-play-faded-${vp}.json`,JSON.stringify(smp));const a=require('./ana.cjs').anaPlay(smp,S,1);RUN.f=anaSync(smp,S);
  rec('VF-PREVIEW-play',a.nRamp>30&&a.maxErr<=0.05&&a.nonMono===0&&a.maxCoErr<=0.011&&a.posBack===0&&a.firstRamp.dv<=0.05&&a.lastRamp.dv===1&&a.pre,{...a,sync:RUN.f});});
 await T('VF-OUT',async()=>{const r=await vDrag(p,'out',-80);await p.mouse.move(5,5);await sleep(200);const v=await vInfo(p);const u=(await st(p)).undo;const o={status:r.s.status,during:r.during,undo:u,fi:v.fi,fo:v.fo,pts:[]};
  for(const t of [E-1.5,E-0.5,E-2.5]){const e=Math.min(1,(E-t)/2);const q=await seek(p,t);o.pts.push({t,e:+e.toFixed(4),dv:+q.dv,co:+q.co,ok:near(+q.dv,e,0.01)&&near(+q.co,1-e,0.011)});}
  rec('VF-OUT',v.fo==='2.000'&&v.fi==='1.000'&&/Video Fade Out/.test(u)&&r.s.status==='Video Fade Out: 2.000 წმ.'&&o.pts.every(x=>x.ok),o);});
 const syncStop=async tag=>{const o=[];for(const d of [0.5,3.0,5.0]){const q=await seek(p,S+d);await sleep(500);const q2=await ov(p);o.push({t:S+d,pos:q2.pos,ct:+q2.ct.toFixed(4),exp:+(q2.pos-S).toFixed(4),err:+Math.abs(q2.ct-(q2.pos-S)).toFixed(4),dv:q2.dv});}return o;};
 const SY={};await T('VF-SYNC-stopped-faded',async()=>{SY.f=await syncStop('f');rec('VF-SYNC-stopped-faded',SY.f.every(x=>x.err<=0.1),SY.f);});
 await T('VF-FLOAT',async()=>{await blur(p);await p.click('[data-testid=arrangement-video-expand]');await sleep(800);const q=await seek(p,S+0.5);await sleep(300);const q2=await ov(p);await p.screenshot({path:`${SH}/vf-float-${vp}.png`});await p.click('[data-testid=arrangement-video-expand]');await sleep(600);const back=await ov(p);
  rec('VF-FLOAT',q2.boxExp==='true'&&q2.inBox&&q2.dv==='0.500'&&near(+q2.co,0.5,0.011)&&back.boxExp==='false',{float:q2,back:{boxExp:back.boxExp,dv:back.dv}});});
 const EX={};
 await T('VF-EXPORT-faded',async()=>{const d=await dialog(p);await p.screenshot({path:`${SH}/vf-export-faded-${vp}.png`});EX.f=await doExport(p,'faded');
  const LINE='ვიდეოს fade-ები მხოლოდ პრევიუშია — ვიდეოს რენდერი არ კეთდება, ექსპორტი მხოლოდ აუდიოა.';
  rec('VF-EXPORT-faded',d.line===LINE&&d.nLine===1&&d.videoOpt.disabled&&/ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა \(ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია\)\./.test(d.videoOpt.text)&&/\.wav$/.test(EX.f.fn),{d,fn:EX.f.fn,sha:EX.f.sha,frames:EX.f.frames,fmt:EX.f.fmt,sec:EX.f.seconds});});
 // back to no fades
 await T('VF-UNDO-to-nofade',async()=>{const a=await undo(p,1);const v1=await vInfo(p);const b=await undo(p,1);const v2=await vInfo(p);rec('VF-UNDO-to-nofade',v1.fo==='0.000'&&v1.fi==='1.000'&&v2.fi==='0.000'&&v2.fo==='0.000'&&b.undo===U0,{a:a.undo,b:b.undo,U0,v1:[v1.fi,v1.fo],v2:[v2.fi,v2.fo]});});
 await T('VF-EXPORT-nofade',async()=>{const d=await dialog(p);await p.screenshot({path:`${SH}/vf-export-nofade-${vp}.png`});EX.n=await doExport(p,'nofade');
  rec('VF-EXPORT-nofade',d.line===null&&d.nLine===0&&d.videoOpt.disabled&&/\.wav$/.test(EX.n.fn),{d,fn:EX.n.fn,sha:EX.n.sha,frames:EX.n.frames});});
 await T('VF-AUDIO',async()=>{const a=EX.f.w,b=EX.n.w;const md=X.W.cmp(a,b);const o={shaF:EX.f.sha,shaN:EX.n.sha,frames:[a.frames,b.frames],fmt:a.fmt,maxDiff:md,stats:X.W.stats(a)};
  rec('VF-AUDIO',md===0&&a.frames===b.frames&&a.n===b.n&&o.stats.nan===0,o);});
 await T('VF-PREVIEW-pixel-ref',async()=>{const R={};for(const [k,t] of [['q1',S+0.25],['q3',S+0.75],['full',S+1.5]]){await seek(p,t);await sleep(500);R[k]={t,o:await ov(p),L:await boxShot(p,`${SH}/vf-box-ref-${k}-${vp}.png`)};}
  const ok=PX.bg.L<PX.q1.L&&PX.q1.L<PX.q3.L&&PX.q1.L<R.q1.L&&PX.q3.L<R.q3.L&&Math.abs(PX.full.L-R.full.L)<1;rec('VF-PREVIEW-pixel',ok,{faded:Object.fromEntries(Object.entries(PX).map(([k,v])=>[k,{t:v.t,dv:v.o.dv,L:v.L}])),ref:Object.fromEntries(Object.entries(R).map(([k,v])=>[k,{t:v.t,dv:v.o.dv,L:v.L}]))});});
 await T('VF-SYNC-stopped-nofade',async()=>{SY.n=await syncStop('n');rec('VF-SYNC-stopped',SY.f&&SY.n.every(x=>x.err<=0.1)&&SY.f.every(x=>x.err<=0.1)&&SY.n.every((x,i)=>Math.abs(x.ct-SY.f[i].ct)<=0.1),{f:SY.f,n:SY.n});});
 await T('VF-SYNC-play',async()=>{const smp=await playRun(p,1.5,2900);fs.writeFileSync(`${L.OUT}/r1-play-nofade-${vp}.json`,JSON.stringify(smp));RUN.n=anaSync(smp,S);const flat=smp.filter(x=>x.pos>=1.5&&x.pos<=4.2).every(x=>x.dv===1);
  rec('VF-SYNC-play',RUN.f&&RUN.f.n>30&&RUN.n.n>30&&RUN.f.max<=RUN.n.max+0.05&&flat,{faded:RUN.f,nofade:RUN.n,controlOpacityAll1:flat});});
 await T('VF-UNDO',async()=>{const o={};const r1=await redo(p,1);o.r1=[(await vInfo(p)).fi,r1.undo];const r2=await redo(p,1);const v=await vInfo(p);o.r2=[v.fi,v.fo,r2.undo];
  const wait=Math.max(0,1200-(Date.now()-tIn));await sleep(wait);
  const u1=(await st(p)).undo;const d=await vDbl(p,'in');o.dbl={fi:d.after.fi,fo:d.after.fo,undo:d.s.undo,status:d.s.status};const z=await undo(p,1);o.afterZ={fi:(await vInfo(p)).fi,undo:z.undo,u1};
  const u2=(await st(p)).undo;const pr=await vPress(p,'in');o.press={fi:pr.after.fi,fo:pr.after.fo,undo:pr.s.undo,u2};
  // drag one entry exact restore
  const u3=(await st(p)).undo;const dr=await vDrag(p,'in',20);o.drag={fi:dr.after.fi,undo:dr.s.undo};const z2=await undo(p,1);o.dragZ={fi:(await vInfo(p)).fi,undo:z2.undo,u3};const y2=await redo(p,1);o.dragY={fi:(await vInfo(p)).fi};await undo(p,1);o.final=await vInfo(p);
  rec('VF-UNDO',o.r1[0]==='1.000'&&o.r2[0]==='1.000'&&o.r2[1]==='2.000'&&o.dbl.fi==='0.000'&&o.dbl.fo==='2.000'&&/Video Fade In/.test(o.dbl.undo)&&o.afterZ.fi==='1.000'&&o.afterZ.undo===u1&&o.press.fi==='1.000'&&o.press.undo===u2&&o.drag.fi==='1.500'&&o.dragZ.fi==='1.000'&&o.dragZ.undo===u3&&o.dragY.fi==='1.500'&&o.final.fi==='1.000'&&o.final.fo==='2.000',{...o,final:[o.final.fi,o.final.fo]});});
 const restored=async()=>{const v=await vInfo(p);return v.n===1&&near(v.start,S,1e-6)&&v.fi==='1.000'&&v.fo==='2.000'&&near(v.dur,E-S,0.01);};
 await T('VF-EDITS-a',async()=>{const o={};const m=await moveV(p,40);o.after=m.after.all;o.undo=m.s.undo;o.op=[];for(const d of [0.5,1.5]){const q=await seek(p,S+1+d-1+0.0);o.op.push({t:S+d,dv:q.dv});}
  const q1=await seek(p,S+1.5);const q2=await seek(p,S+1.25);o.shifted=[q1.dv,q2.dv];await undo(p);o.back=await restored();
  rec('VF-EDITS-a',m.after.start===S+1&&m.after.fi==='1.000'&&m.after.fo==='2.000'&&q1.dv==='0.500'&&q2.dv==='0.250'&&o.back,o);});
 await T('VF-EDITS-b',async()=>{const o={};const c=await vInfo(p);const y=Math.round(c.box.y+c.box.h*0.8),x=Math.round(c.box.x+3);await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+10,y,{steps:4});await p.mouse.move(x+20,y,{steps:4});await sleep(150);await p.mouse.up();await sleep(500);
  o.after=await vInfo(p);o.s=(await st(p)).status;o.undo=(await st(p)).undo;await undo(p);o.back=await restored();
  // expected via clampClipFadesAfterTrim: in=min(1,floor(dur-2)) => 1, out=2
  const d=o.after.dur;const expIn=Math.min(1,Math.floor((d-2)*1000+1e-6)/1000).toFixed(3);
  rec('VF-EDITS-b',near(o.after.start,S+0.5,1e-6)&&o.after.fi===expIn&&o.after.fo==='2.000'&&o.back,{after:o.after.all,expIn,s:o.s,undo:o.undo,back:o.back});});
 await T('VF-EDITS-b2-clamp',async()=>{const o={};const a=await vDrag(p,'in',80);o.a=[a.after.fi,a.after.fo];const c=await vInfo(p);const y=Math.round(c.box.y+c.box.h*0.8),x=Math.round(c.box.x+3);await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(x+50,y,{steps:4});await p.mouse.move(x+100,y,{steps:4});await sleep(150);await p.mouse.up();await sleep(500);
  o.after=await vInfo(p);const d=+(E-(S+2.5)).toFixed(3);o.expIn=Math.min(3,Math.floor((d-2)*1000+1e-6)/1000).toFixed(3);await undo(p,2);o.back=await restored();
  rec('VF-EDITS-b2-clamp',o.a[0]==='3.000'&&near(o.after.start,S+2.5,1e-6)&&o.after.fi===o.expIn&&o.after.fo==='2.000'&&o.back,{a:o.a,after:o.after.all,expIn:o.expIn,back:o.back});});
 await T('VF-EDITS-c',async()=>{const o={};const c=await X.selectClipV?null:null;const v=await vInfo(p);await p.mouse.click(Math.round(v.box.x+v.box.w/2),Math.round(v.box.y+8));await sleep(250);await p.mouse.click(X.tx(5),Math.round(v.box.y+v.box.h*0.75));await sleep(400);await blur(p);o.pos=(await ov(p)).pos;await key(p,'Control+e',600);o.s=await st(p);o.res=(await vInfo(p)).all;await undo(p);o.back=await restored();
  const L0=o.res[0],R0=o.res[1];rec('VF-EDITS-c',o.res.length===2&&near(o.pos,5,1e-6)&&L0.start===S&&L0.fi==='1.000'&&L0.fo==='0.000'&&R0.start===5&&R0.fi==='0.000'&&R0.fo==='2.000'&&o.back,o);});
 await T('VF-EDITS-d',async()=>{const o={};const v=await vInfo(p);await p.mouse.click(Math.round(v.box.x+v.box.w/2),Math.round(v.box.y+8));await sleep(250);await blur(p);await key(p,'Control+d',600);o.s=await st(p);o.res=(await vInfo(p)).all;await undo(p);await p.keyboard.press('Escape');o.back=await restored();
  rec('VF-EDITS-d',o.res.length===2&&o.res.every(x=>x.fi==='1.000'&&x.fo==='2.000')&&o.back,o);});
 await T('VF-PLAY-EDIT',async()=>{const o={};const u0=(await st(p)).undo;await seek(p,0);await p.evaluate(()=>{window.__s=[];const h=document.querySelector('[data-testid=arrangement-playhead-handle]');const f=()=>{window.__s.push({t:performance.now(),pos:+h.getAttribute('aria-valuenow'),src:window.__src.length});if(window.__run)requestAnimationFrame(f)};window.__run=true;requestAnimationFrame(f);});
  await blur(p);await p.keyboard.press('Space');await sleep(1500);const src0=await p.evaluate(()=>window.__src.length);const r=await vDrag(p,'in',20);await sleep(1500);const src1=await p.evaluate(()=>window.__src.length);const playing=await p.evaluate(()=>{const s=window.__s;return s[s.length-1].pos-s[s.length-20].pos});await p.keyboard.press('Space');await sleep(300);
  const smp=await p.evaluate(()=>{window.__run=false;return window.__s});let back=0;for(let i=1;i<smp.length;i++)if(smp[i].pos+1e-9<smp[i-1].pos)back++;
  o.fi=r.after.fi;o.undo=r.s.undo;o.u0=u0;o.src=[src0,src1];o.restarts=src1-src0;o.back=back;o.playingDelta=playing;o.span=[smp[0].pos,smp[smp.length-1].pos];const z=await undo(p,1);o.z={fi:(await vInfo(p)).fi,undo:z.undo};
  rec('VF-PLAY-EDIT',o.fi==='1.500'&&/Video Fade In/.test(o.undo)&&back===0&&playing>0.1&&o.z.fi==='1.000'&&o.z.undo===u0,o);});
 await T('VF-AUDIO-videoSound',async()=>{await X.lMute(p,'video').click();await sleep(300);await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title');await sleep(300);EX.m=await doExport(p,'videomuted');await X.lMute(p,'video').click();await sleep(300);
  const d=X.diff(EX.f.w,EX.m.w,S,S+1);const d2=X.diff(EX.f.w,EX.m.w,S+0.05,S+0.95);rec('VF-AUDIO-videoSound',d.max>1e-3,{note:'faded export minus video-muted export over the fade-in second: >0 means the video own sound is present (and identical faded vs unfaded per VF-AUDIO)',d,d2});});
 for(const k of Object.keys(EX)){try{fs.unlinkSync(EX[k].out)}catch{}}
 await X.finish(s,rec,'R1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
