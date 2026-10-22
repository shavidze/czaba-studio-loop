// C round 88 main browser run: node vis88.cjs <vp> <sessions comma list: A,B,C,D,E,F>
const X=require('./lib88.cjs');const{L,sleep,blur,fmtT}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const which=(process.argv[3]||'A,B,C,D,E,F').split(',');const is1280=vp==='1280x720';
const rec=X.mkRec(`${L.OUT}/v88-${vp}-${which.join('')}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const wavMsg=l=>`WAV შეიქმნა: ${l}, 24-bit · 48 kHz · stereo.`;const mp3Msg=l=>`MP3 შეიქმნა: ${l}, 48 kHz · stereo.`;const bothMsg=l=>`WAV და MP3 შეიქმნა: ${l}, WAV 24-bit · 48 kHz · stereo, MP3 48 kHz · stereo.`;
const WARN_RE=/^გადატვირთვა: პიკი \+1\.7 dBFS — \d+ sample შეიზღუდა 0 dBFS-ზე\. შეამცირე Master მინიმუმ 1\.8 dB-ით და გაიმეორე ექსპორტი\.$/;
const LOADFAIL='MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
const VR='ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';
const S_MP3=['რენდერი და 24-bit WAV-ის შექმნა…','MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…','MP3-ის შექმნა…'];
const band=g=>g<=150?'PASS':g<=250?'TRIAGE':'FAIL';
const P101=101.702,END5=304.406;
const vOK=v=>!!(v&&v.ok);
const idleOk=g=>g&&vOK(g.v.close)&&vOK(g.v.export)&&g.scrollTop===0&&g.footerSticky==='sticky';
const shot=(p,n)=>p.screenshot({path:`${SH}/${n}-${vp}.png`});
async function sess(){const s=await L.open(vp);const p=s.page;p.on('crash',()=>console.log('APP PAGE CRASH'));X.attachDl(p);await X.attachFiles(p);X.attachWorkers(p);await L.fresh(p);await sleep(300);return{s,p};}
async function openFresh(p){const d=await X.openDlg(p);await X.inst(p);const g0=await X.geom(p,'open');await sleep(1000);const g1=await X.geom(p,'open+1s');return{d,g0,g1};}
// pre-select format (mouse) then measure, then export via the button; MO sampler during the run
async function exportSampled(p,name,format,{beforeClick=null}={}){await p.click(`[data-testid=arrangement-export-format-${format}]`);await sleep(250);await X.inst(p);const gBefore=await X.geom(p,'beforeClick');
 await X.moStart(p);if(beforeClick)await beforeClick();const r=await X.exportFmt(p,vp,name,{format,watchExtra:800});const samples=await X.moStop(p);const gAfter=await X.geom(p,'after');return{r,gBefore,samples,gAfter,sum:X.summarizeRender(samples)};}
const phasesAllOk=(sum,need)=>need.every(k=>sum.phases[k]&&sum.phases[k].n>=1&&sum.phases[k].ok===sum.phases[k].n);
const strip=o=>({...o,samples:undefined});
(async()=>{
 // ---------- A: 101.702 s project: VIS-IDLE, FOCUS idle, VIS-DONE, FOCUS done, PX-KEYS-R
 if(which.includes('A')){const{s,p}=await sess();const S=await X.setup(p);await blur(p);const ME=S.clips.find(c=>c.lane==='music');const END=+(ME.start+ME.dur).toFixed(3);rec('SETUP-A',null,{END,clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
  await T('VIS-IDLE-101',async()=>{const o=await openFresh(p);await shot(p,'idle-101');rec('VIS-IDLE-101',idleOk(o.g0)&&idleOk(o.g1)&&o.g1.scrollTop===o.g0.scrollTop,{g0:o.g0,g1:o.g1});});
  await T('FOCUS-idle',async()=>{const seq=await X.tabCycle(p,6,{arrows:true});await shot(p,'focus-idle-end');const g=await X.geom(p,'afterTabs');
   const tabs=seq.filter(x=>!x.arrow&&!x.arrowBack).map(x=>x.id);rec('FOCUS-idle',seq.every(x=>x.inside&&!x.covered),{tabs,seq,geomAfter:{scrollTop:g.scrollTop,footer:g.footer}});});
  await T('VIS-DONE',async()=>{await X.closeDlg(p);const o=await openFresh(p);const E=await exportSampled(p,'done101','wav');const g=E.gAfter;await shot(p,'done-101');
   const dl=E.r.names;const res={names:dl,msg:g.statusText,warning:g.overloadText,statusV:g.v.status,overloadV:g.v.overload,scrollTop:g.scrollTop,scrollBefore:E.gBefore.scrollTop,sh:g.sh,ch:g.ch,footer:g.footer,renderSum:E.sum,idleGeom:o.g0};
   rec('VIS-DONE',dl.join()==='czaba-studio-lab.wav'&&g.statusText===wavMsg(fmtT(END))&&WARN_RE.test(g.overloadText||'')&&vOK(g.v.status)&&vOK(g.v.overload)&&g.statusRole==='status',res);
   rec('VIS-RENDER-wav101',phasesAllOk(E.sum,['render','wav'])&&E.sum.scrollTops.every(x=>x===E.gBefore.scrollTop),{scrollBefore:E.gBefore.scrollTop,sum:E.sum});X.rmF(E.r);});
  await T('FOCUS-done',async()=>{const seq=await X.tabCycle(p,6);await shot(p,'focus-done-end');const tabs=seq.map(x=>x.id);const g=await X.geom(p,'afterTabs');
   rec('FOCUS-done',seq.every(x=>x.inside&&!x.covered)&&vOK(g.v.overload)===true,{tabs,seq,overloadAfter:g.v.overload,statusAfter:g.v.status,scrollTop:g.scrollTop});});
  await T('PX-KEYS-R',async()=>{const o={steps:[],during:[]};const ip=X.focusProbe;await X.closeDlg(p).catch(()=>{});await blur(p);const un0=X.unpkg(s).length;await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);o.open=await ip(p);
   let g=0;while(g<12&&!/format/.test((await ip(p)).id||'')){await p.keyboard.press('Tab');await sleep(120);o.steps.push(await ip(p));g++;}o.atFmt=await ip(p);
   await p.keyboard.press('ArrowDown');await sleep(200);o.afterDown=await ip(p);
   g=0;while(g<10&&!/ექსპორტი$/.test((await ip(p)).id||'')){await p.keyboard.press('Tab');await sleep(120);o.steps.push(await ip(p));g++;}o.atBtn=await ip(p);
   await X.instrument(p);const n0=p.__dls.length;await p.keyboard.press('Enter');await sleep(150);for(let i=0;i<3;i++){await p.keyboard.press('Tab');await sleep(120);o.during.push(await ip(p));}
   const t0=Date.now();while(Date.now()-t0<120000&&p.__dls.length===n0)await sleep(200);await sleep(1500);const raw=await X.collect(p);const an=X.analyze(raw);o.order=an.order;o.files=p.__dls.slice(n0).map(d=>d.fn);o.msg=(await X.msgState(p)).msg;o.afterExport=await ip(p);
   await p.keyboard.press('Escape');await sleep(500);o.focusAfterClose=await p.evaluate(()=>document.activeElement&&(document.activeElement.textContent||'').trim().slice(0,20));o.unpkgBeforeMp3=un0;
   rec('PX-KEYS-R',[o.open,...o.steps,o.atBtn,o.afterExport,...o.during].every(x=>x.inside)&&o.afterDown.id==='arrangement-export-format-mp3'&&o.during.every(x=>x.tag!=='PROGRESS'&&!x.covered)&&!raw.focusProg&&o.atBtn.id==='MP3-ის ექსპორტი'&&o.files.join()==='czaba-studio-lab.mp3'&&o.msg===mp3Msg(fmtT(END))&&o.focusAfterClose==='Export',o);
   for(const d of p.__dls.slice(n0)){const f=await d.d.path().catch(()=>null);if(f)try{fs.unlinkSync(f)}catch{}}});
  rec('NETINFO-A',null,{unpkg:X.unpkg(s),workers:p.__workers.map(w=>w.url)});await X.finish(s,rec,'A-'+vp);}
 // ---------- B: 5M WAV: VIS-IDLE-5M, VIS-RENDER wav, VIS-SCROLL
 if(which.includes('B')){const{s,p}=await sess();await X.setup(p);const f=await X.fiveMin(p);await X.inst(p);
  await T('VIS-IDLE-5M',async()=>{const g0=await X.geom(p,'open');await sleep(1000);const g1=await X.geom(p,'open+1s');await shot(p,'idle-5m');rec('VIS-IDLE-5M',/05:04\.406/.test(f.txt)&&idleOk(g0)&&idleOk(g1),{scopeText:f.txt,g0,g1});});
  await T('VIS-RENDER-wav5',async()=>{const E=await exportSampled(p,'w5','wav');await shot(p,'wav5-done');const before=E.gBefore.scrollTop;
   rec('VIS-RENDER-wav5',E.r.names.join()==='czaba-studio-lab.wav'&&phasesAllOk(E.sum,['render','wav'])&&E.sum.scrollTops.every(x=>x===before)&&E.gAfter.statusText===wavMsg(fmtT(END5)),{names:E.r.names,scrollBefore:before,msg:E.gAfter.statusText,sum:E.sum,firstRender:E.samples.find(g=>g.label&&/^რენდერი/.test(g.label))});X.rmF(E.r);});
  await T('VIS-SCROLL',async()=>{await X.closeDlg(p);await X.openDlg(p);await p.click('[data-testid=arrangement-export-format-wav]');await sleep(200);await X.rafStart(p);const n0=p.__dls.length;
   await p.getByRole('button',{name:'WAV-ის ექსპორტი',exact:true}).click();const t0=Date.now();while(Date.now()-t0<5000&&!(await p.$('[data-testid=arrangement-export-progress]')))await sleep(10);
   const pn=await p.evaluate(()=>{const f=document.querySelector('[data-testid=arrangement-export-footer]');const r=f.parentElement.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+60};});await p.mouse.move(pn.x,pn.y);
   const marks=[];for(const dy of [60,60,200,-80,-300]){await p.mouse.wheel(0,dy);await sleep(70);marks.push({dy,g:await X.geom(p,'wheel'+dy)});if(dy===200)await shot(p,'scroll-bottom-render');}
   const t1=Date.now();while(Date.now()-t1<60000&&p.__dls.length===n0)await sleep(100);const S=await X.rafStop(p);await shot(p,'scroll-after');
   const during=S.filter(g=>g.label);const pos=[...new Set(during.map(g=>g.scrollTop))];const bad=during.filter(g=>!(vOK(g.v.label)&&vOK(g.v.bar)&&vOK(g.v.busy)&&g.footHits.every(Boolean))).slice(0,3);
   const maxST=Math.max(...during.map(g=>g.scrollTop));const atBottom=during.filter(g=>g.scrollTop===maxST);const covered=atBottom.filter(g=>g.lastNonFooterBottom>g.footer[0]+0.5);
   rec('VIS-SCROLL',during.length>=3&&pos.length>=3&&bad.length===0&&covered.length===0&&maxST>0&&maxST>=during[0].sh-during[0].ch-1&&pos.includes(0),{renderFrames:during.length,positions:pos,maxST,maxScrollable:during[0]&&during[0].sh-during[0].ch,bad,atBottomSample:atBottom[0]&&{scrollTop:atBottom[0].scrollTop,footer:atBottom[0].footer,lastNonFooterBottom:atBottom[0].lastNonFooterBottom,footHits:atBottom[0].footHits},covered:covered.length,marks:marks.map(m=>({dy:m.dy,scrollTop:m.g.scrollTop,label:m.g.label,lab:m.g.v.label,bar:m.g.v.bar,busy:m.g.v.busy})),phases:[...new Set(during.map(g=>X.phaseOf(g.label)))]});
   for(const d of p.__dls.slice(n0)){const f=await d.d.path().catch(()=>null);if(f)try{fs.unlinkSync(f)}catch{}}});
  rec('NETINFO-B',null,{unpkg:X.unpkg(s)});await X.finish(s,rec,'B-'+vp);}
 // ---------- C: 5M MP3 fresh page: VIS-RENDER mp3 + PX-PHASES-R; FOCUS render; (1440) WAV+MP3
 if(which.includes('C')){const{s,p}=await sess();await X.setup(p);const f=await X.fiveMin(p);
  await T('VIS-RENDER-mp3',async()=>{const un0=X.unpkg(s).length;await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(250);await X.inst(p);const gBefore=await X.geom(p,'beforeClick');await X.instrument(p);await X.moStart(p);
   const tClick=await p.evaluate(()=>Math.round(performance.now()-window.__c87.t0));const r=await X.exportFmt(p,vp,'m5','mp3'===undefined?{}:{format:'mp3',watchExtra:1000});const samples=await X.moStop(p);const raw=await X.collect(p);await shot(p,'mp35-done');
   const an=X.analyze(raw,{tClick});const sum=X.summarizeRender(samples);const before=gBefore.scrollTop;
   rec('VIS-RENDER-mp3',r.names.join()==='czaba-studio-lab.mp3'&&phasesAllOk(sum,['render','wav','load','mp3'])&&sum.scrollTops.every(x=>x===before)&&r.after.msg===mp3Msg(fmtT(END5)),{names:r.names,msg:r.after.msg,scrollBefore:before,sum,unpkgBeforeClick:un0,tEnd:r.tEnd});
   rec('PX-PHASES-R',an.order.join()==='render,wav,load,mp3'&&!an.reentered&&an.phases.load.noValueRecords>=1&&['render','wav','mp3'].every(k=>an.phases[k].distinct>=2&&an.phases[k].decreases===0&&an.phases[k].pctMismatch===0)&&an.issues.length===0&&an.absentAtStart&&an.absentAtEnd&&an.statuses.slice(0,3).join()===S_MP3.join()&&!an.focusProg,{order:an.order,phases:an.phases,issues:an.issues,statuses:an.statuses,absentAtStart:an.absentAtStart,absentAtEnd:an.absentAtEnd,focusProg:an.focusProg,maxGap:an.maxGap,top5:an.top5});
   const mid=samples.find(g=>g.label&&/^MP3-ის შექმნა/.test(g.label));if(mid)rec('INFO-mp3-phase-sample',null,mid);X.rmF(r);});
  await T('FOCUS-render',async()=>{await X.closeDlg(p);await X.openDlg(p);await X.inst(p);const n0=p.__dls.length;await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(200);
   await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();await sleep(150);const g0=await X.geom(p,'renderStart');const seq=await X.tabCycle(p,6);const g1=await X.geom(p,'afterTabs');await shot(p,'focus-render');
   const t0=Date.now();while(Date.now()-t0<120000&&p.__dls.length===n0)await sleep(200);await sleep(1000);
   rec('FOCUS-render',!!g0.label&&!!g1.label&&seq.every(x=>x.inside&&!x.covered&&x.tag!=='PROGRESS')&&X.renderOk(g1),{tabs:seq.map(x=>x.id),seq,labelStart:g0.label,labelAfterTabs:g1.label,vAfter:g1.v,scrollTop:[g0.scrollTop,g1.scrollTop]});
   for(const d of p.__dls.slice(n0)){const f=await d.d.path().catch(()=>null);if(f)try{fs.unlinkSync(f)}catch{}}});
  if(!is1280)await T('VIS-RENDER-both',async()=>{const E=await exportSampled(p,'b5','both');await shot(p,'both5-done');const before=E.gBefore.scrollTop;const ord=Object.keys(E.sum.phases);
   rec('VIS-RENDER-both',E.r.names.join()==='czaba-studio-lab.wav,czaba-studio-lab.mp3'&&phasesAllOk(E.sum,['render','wav','mp3'])&&E.sum.scrollTops.every(x=>x===before)&&E.r.after.msg===bothMsg(fmtT(END5)),{names:E.r.names,msg:E.r.after.msg,scrollBefore:before,sum:E.sum,phaseKeys:ord});X.rmF(E.r);});
  rec('NETINFO-C',null,{unpkg:X.unpkg(s),workers:p.__workers.map(w=>w.url)});await X.finish(s,rec,'C-'+vp);}
 // ---------- D (1280): PX-WAV5-R rAF only
 if(which.includes('D')){const{s,p}=await sess();await X.setup(p);const f=await X.fiveMin(p);
  await T('PX-WAV5-R',async()=>{const r=await X.exportInst(p,vp,'W5r',{format:'wav'});const w=X.wavInfo(r.files[0].out);
   const o={scopeText:f.txt,names:r.names,frames:w.frames,fmt:w.fmt,nan:w.stats.nan,msg:r.after.msg,tEnd:r.tEnd,maxGap:r.an.maxGap,top5:r.an.top5,rafFrames:r.an.frames,band:band(r.an.maxGap),order:r.an.order};
   rec('PX-WAV5-R',o.names.join()==='czaba-studio-lab.wav'&&w.frames===14611488&&w.fmt.sr===48000&&w.fmt.bits===24&&w.fmt.ch===2&&o.nan===0&&o.msg===wavMsg(fmtT(END5))&&o.band!=='FAIL',o);X.rmF(r);});
  await X.finish(s,rec,'D-'+vp);}
 // ---------- E: VIS-ERROR (unpkg abort)
 if(which.includes('E')){const{s,p}=await sess();const aborted=[];await p.route('**/unpkg.com/**',r=>{aborted.push(r.request().url());return r.abort();});await X.setup(p);await blur(p);
  await T('VIS-ERROR',async()=>{await X.openDlg(p);const E=await exportSampled(p,'err','mp3');await shot(p,'error');const g=E.gAfter;const prog=await p.evaluate(()=>({bar:!!document.querySelector('[data-testid=arrangement-export-progress]'),label:!!document.querySelector('[data-testid=arrangement-export-progress-label]')}));
   const o={names:E.r.names,role:g.statusRole,msg:g.statusText,statusV:g.v.status,closeV:g.v.close,closeDisabled:g.closeDisabled,prog,scrollTop:g.scrollTop,aborted:[...new Set(aborted.map(u=>u.replace('https://unpkg.com','')))],renderSum:E.sum};
   rec('VIS-ERROR',o.names.length===0&&o.role==='alert'&&o.msg===LOADFAIL&&vOK(g.v.status)&&vOK(g.v.close)&&o.closeDisabled===false&&!prog.bar&&!prog.label&&aborted.length>0,o);});
  await p.unroute('**/unpkg.com/**');rec('INFO-E-induced',null,{note:'console errors in this session may be induced by the unpkg abort',con:s.con.filter(l=>/\[error\]|pageerror/.test(l)).slice(0,6)});await X.finish(s,rec,'E-'+vp);}
 // ---------- F: VIS-VIDEO
 if(which.includes('F')){const s=await L.open(vp);const p=s.page;X.attachDl(p);await X.attachFiles(p);X.attachWorkers(p);
  await T('VIS-VIDEO',async()=>{const U=await X.setupV(p);const d=await X.openDlg(p);await X.inst(p);const gi=await X.geom(p,'idle');await shot(p,'video-idle');const vr=d.radios.find(x=>/ვიდეო \(აუდიოთი\)/.test(x.label||''));
   const E=await exportSampled(p,'vid','wav');await shot(p,'video-done');const o={video:[U.v&&U.v.start,U.v&&U.v.end],videoRadio:vr,idle:{sh:gi.sh,ch:gi.ch,close:gi.v.close,export:gi.v.export,scrollTop:gi.scrollTop},names:E.r.names,msg:E.r.after.msg,scrollBefore:E.gBefore.scrollTop,sum:E.sum};
   rec('VIS-VIDEO',!!vr&&vr.disabled&&vr.label==='ვიდეო (აუდიოთი)'+VR&&E.r.names.join()==='czaba-studio-lab.wav'&&phasesAllOk(E.sum,['render','wav'])&&E.sum.scrollTops.every(x=>x===E.gBefore.scrollTop),o);X.rmF(E.r);});
  await X.finish(s,rec,'F-'+vp);}
 process.exit(0);
})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
