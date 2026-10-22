const X=require('./lib85.cjs');const{L,sleep,st,blur,key}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/xr-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const SR=48000;const TOL=1e-3;
const REASON='მონიშნე დროის მონაკვეთი Arrangement-ში (drag კლიპზე ან სახაზავზე)';
const fmtT=t=>{const m=Math.floor(t/60);const s=t-m*60;return `${String(m).padStart(2,'0')}:${s.toFixed(3).padStart(6,'0')}`;};
const rangeMsg=(a,b)=>`WAV შეიქმნა: მონაკვეთი ${fmtT(a)} — ${fmtT(b)} (${(b-a).toFixed(3)} წმ), 24-bit · 48 kHz · stereo.`;
async function clearRange(p){await X.geo(p);const lb=await X.laneBox(p,'sfx');await p.mouse.click(X.tx(12),Math.round(lb.y+lb.h/2));await sleep(400);await blur(p);return (await st(p)).range;}
const ok24=r=>r.fmt.sr===48000&&r.fmt.bits===24&&r.fmt.ch===2&&r.fmt.tag===1&&r.stats.nan===0;
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);
 const S=await X.setup(p);await X.setSnap(p,true);await blur(p);rec('SETUP',null,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),geo:S.geo,snap:(await st(p)).snap,status:(await st(p)).status});
 const ME=S.clips.find(c=>c.lane==='music');const END=+(ME.start+ME.dur).toFixed(3);const PFR=Math.ceil(END*SR);
 const F={};
 // --- no range: project only
 await T('XR-PROJECT-norange',async()=>{const d=await X.openDlg(p);await p.screenshot({path:`${SH}/xr-norange-${vp}.png`});F.P0=await X.exportNow(p,vp,'P0');await X.closeDlg(p);
  const msg=`WAV შეიქმნა: ${fmtT(END)}, 24-bit · 48 kHz · stereo.`;
  rec('XR-PROJECT-norange',d.range.disabled&&!d.range.checked&&d.reason===REASON&&d.project.checked&&d.desc===`მთელი პროექტი · 0:00 — ${fmtT(END)}`&&F.P0.fn==='czaba-studio-lab.wav'&&F.P0.frames===PFR&&ok24(F.P0)&&F.P0.after.status===msg,
   {dlg:{project:d.project,range:d.range,reason:d.reason,desc:d.desc,graphNote:d.graphNote},note:'project radio is checked AND disabled with no range (A decision, C-R14-02)',P0:X.strip(F.P0),expFrames:PFR,expMsg:msg});});
 // --- XR-DEFAULT
 await T('XR-DEFAULT',async()=>{const r=await X.rangeDrag(p,'stems',4,9);const d=await X.openDlg(p);await p.screenshot({path:`${SH}/xr-default-${vp}.png`});F.dDefault=d;
  const LBL='მონიშნული მონაკვეთი · 00:04.000 — 00:09.000 (5.000 წმ)';
  rec('XR-DEFAULT',/00:04\.000 — 00:09\.000/.test(r.range)&&d.range.checked&&!d.range.disabled&&d.range.label===LBL&&d.desc===LBL&&!d.project.checked&&!d.project.disabled&&d.project.label===`მთელი პროექტი · 00:00.000 — ${fmtT(END)}`&&d.reason===null,{readout:r.range,dlg:{project:d.project,range:d.range,desc:d.desc,graphNote:d.graphNote}});});
 // --- XR-WAV (dialog still open)
 await T('XR-WAV',async()=>{F.R1=await X.exportNow(p,vp,'R1');await p.screenshot({path:`${SH}/xr-wav-done-${vp}.png`});await X.closeDlg(p);const dd=X.diffAt(F.R1.w,F.P0.w,192000);
  rec('XR-WAV',F.R1.fn==='czaba-studio-lab-range.wav'&&Math.abs(F.R1.frames-240000)<=1&&ok24(F.R1)&&dd.maxFS<=TOL&&F.R1.after.status===rangeMsg(4,9),{R1:X.strip(F.R1),diffVsProject192000:{maxFS:dd.maxFS,maxLSB:dd.maxLSB,atFrame:dd.atFrame,nonzero:dd.nonzero,n:dd.n},nonZeroSamples:X.nonZero(F.R1.w),expMsg:rangeMsg(4,9)});});
 // --- XR-PROJECT with a range: choose project
 await T('XR-PROJECT-withrange',async()=>{const d=await X.openDlg(p);const reopenDefault=d.range.checked;F.P1=await X.exportNow(p,vp,'P1',{scope:'project'});const mid=F.P1.before;await X.closeDlg(p);const d2=await X.openDlg(p);await X.closeDlg(p);
  const msg=`WAV შეიქმნა: ${fmtT(END)}, 24-bit · 48 kHz · stereo.`;const dd=X.diffAt(F.P1.w,F.P0.w,0);const hist={};{const a=F.P1.w,b=F.P0.w;for(let f=0;f<a.frames;f++)for(let c=0;c<2;c++)if(a.read(f*2+c)!==b.read(f*2+c)){const k=Math.floor(f/48000);hist[k]=(hist[k]||0)+1;}}
  rec('XR-PROJECT-withrange',reopenDefault&&mid.project.checked&&mid.desc===`მთელი პროექტი · 0:00 — ${fmtT(END)}`&&mid.graphNote==='მთელი პროექტი, იგივე graph რაც დაკვრისას'&&F.P1.fn==='czaba-studio-lab.wav'&&F.P1.frames===PFR&&F.P1.after.status===msg&&dd.maxFS<=TOL&&d2.range.checked,
   {reopenDefault,afterSwitch:{project:mid.project,range:mid.range,desc:mid.desc,graphNote:mid.graphNote},P1:X.strip(F.P1),diffVsP0:{maxLSB:dd.maxLSB,nonzero:dd.nonzero},shaEq:F.P1.sha===F.P0.sha,jitterPerSecond:hist,reopenAgain:d2.range.checked});X.rm(F.P1);});
 // --- XR-ALLTRACKS
 await T('XR-ALLTRACKS',async()=>{const o={};const r=await X.rangeDrag(p,'music',4,9);o.musicReadout=r.range;const d=await X.openDlg(p);o.musicLabel=d.range.label;F.R2=await X.exportNow(p,vp,'R2');await X.closeDlg(p);
  o.music={fn:F.R2.fn,frames:F.R2.frames,sha:F.R2.sha,diff:X.diffAt(F.R2.w,F.P0.w,192000),eqR1:F.R2.sha===F.R1.sha};
  await blur(p);await key(p,'Control+Shift+l',500);o.allReadout=(await st(p)).range;await p.screenshot({path:`${SH}/xr-alllanes-${vp}.png`});const d3=await X.openDlg(p);o.allLabel=d3.range.label;F.R3=await X.exportNow(p,vp,'R3');await X.closeDlg(p);
  o.all={fn:F.R3.fn,frames:F.R3.frames,sha:F.R3.sha,diff:X.diffAt(F.R3.w,F.P0.w,192000),eqR1:F.R3.sha===F.R1.sha};
  const r4=await X.rangeDrag(p,'sfx',5.2,4.2);o.sfxReadout=r4.range;const d4=await X.openDlg(p);o.sfxLabel=d4.range.label;F.R4=await X.exportNow(p,vp,'R4');await X.closeDlg(p);
  o.sfx={fn:F.R4.fn,frames:F.R4.frames,diff:X.diffAt(F.R4.w,F.P0.w,192000),msg:F.R4.after.status};
  for(const k of ['music','all','sfx']){const q=o[k].diff;o[k].diff={maxFS:q.maxFS,maxLSB:q.maxLSB,nonzero:q.nonzero,n:q.n};}
  rec('XR-ALLTRACKS',/ყველა ხაზი/.test(o.allReadout)&&o.music.frames===240000&&o.all.frames===240000&&o.music.diff.maxFS<=TOL&&o.all.diff.maxFS<=TOL&&/00:04\.000 — 00:05\.000/.test(o.sfxReadout)&&o.sfx.frames===48000&&o.sfx.diff.maxFS<=TOL&&o.sfx.msg===rangeMsg(4,5)&&[F.R2,F.R3,F.R4].every(f=>f.fn==='czaba-studio-lab-range.wav'),o);[F.R2,F.R3,F.R4].forEach(X.rm);});
 // --- cleared range
 await T('XR-PROJECT-cleared',async()=>{const rr=await clearRange(p);const d=await X.openDlg(p);await p.screenshot({path:`${SH}/xr-cleared-${vp}.png`});await X.closeDlg(p);
  rec('XR-PROJECT-cleared',rr===null&&d.range.disabled&&d.reason===REASON&&d.project.checked&&d.desc===`მთელი პროექტი · 0:00 — ${fmtT(END)}`,{readout:rr,project:d.project,range:d.range,reason:d.reason,desc:d.desc});});
 // --- XR-MIDSTART
 await T('XR-MIDSTART',async()=>{const o={};const fd=await X.dragHandle(p,'stems','in',80);await p.mouse.move(5,5);o.fade={fi:fd.after.fi,status:fd.s.status};const b=await X.buildV(p,'stems',[2.5,6,10],0.2512);await X.setMode(p,false);o.env=(await X.envInfo(p,'stems')).env;
  await blur(p);const d0=await X.openDlg(p);o.dlgNoRange=d0.project.checked;F.P2=await X.exportNow(p,vp,'P2');await X.closeDlg(p);
  const r=await X.rangeDrag(p,'stems',3,8);o.readout=r.range;const d=await X.openDlg(p);F.R5=await X.exportNow(p,vp,'R5');await X.closeDlg(p);
  const dd=X.diffAt(F.R5.w,F.P2.w,144000);o.diff={maxFS:dd.maxFS,maxLSB:dd.maxLSB,atFrame:dd.atFrame,nonzero:dd.nonzero,n:dd.n};o.R5={fn:F.R5.fn,frames:F.R5.frames,msg:F.R5.after.status};
  // sanity: the fade/envelope really change the audio at 3 s (P2 vs P0 differ in 3..4 s)
  o.editAudible=X.diff(F.P2.w,F.P0.w,3,4);o.firstFrames=[0,1,2].map(i=>F.R5.w.read(i));
  rec('XR-MIDSTART',o.fade.fi==='2.000'&&o.env&&o.env.split(';').length===3&&F.R5.frames===240000&&dd.maxFS<=TOL&&o.editAudible.max>1e-3&&o.R5.msg===rangeMsg(3,8),o);X.rm(F.R5);});
 // --- XR-KEYS (range 3-8 present)
 await T('XR-KEYS',async()=>{const o={steps:[]};const inDlg=()=>p.evaluate(()=>{const a=document.activeElement;const d=document.querySelector('#arrangement-export-title')?.closest('[role=dialog]');return{inside:!!(d&&a&&d.contains(a)),tid:a&&(a.dataset.testid||a.getAttribute('aria-label')||a.textContent.trim().slice(0,24)||a.tagName),type:a&&a.type||null,name:a&&a.name||null,checked:a&&a.checked}});
  await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);o.open=await inDlg();
  for(let i=0;i<10;i++){await p.keyboard.press('Tab');await sleep(120);o.steps.push(await inDlg());}
  for(let i=0;i<4;i++){await p.keyboard.press('Shift+Tab');await sleep(120);o.steps.push(await inDlg());}
  // go to scope radio group
  let g=0;while(g<12&&(await inDlg()).name!=='arrangement-export-scope'){await p.keyboard.press('Tab');await sleep(120);g++;}o.atScope=await inDlg();
  await p.keyboard.press('ArrowUp');await sleep(200);o.afterUp=await inDlg();o.dUp=(await X.dstate(p));await p.keyboard.press('ArrowDown');await sleep(200);o.afterDown=await inDlg();o.dDown=await X.dstate(p);
  await p.keyboard.press('ArrowUp');await sleep(200);await p.keyboard.press('Space');await sleep(200);o.projSel=(await X.dstate(p)).project.checked;
  g=0;while(g<8&&!/WAV-ის ექსპორტი/.test((await inDlg()).tid||'')){await p.keyboard.press('Tab');await sleep(120);g++;}o.atBtn=await inDlg();
  let dlP=p.waitForEvent('download',{timeout:300000});await p.keyboard.press('Enter');let dl=await dlP;o.fileProject=dl.suggestedFilename();await sleep(800);o.afterExport=await inDlg();await p.keyboard.press('Escape');await sleep(400);
  await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);o.reopenRange=(await X.dstate(p)).range.checked;
  g=0;while(g<12&&!/WAV-ის ექსპორტი/.test((await inDlg()).tid||'')){await p.keyboard.press('Tab');await sleep(120);g++;}
  dlP=p.waitForEvent('download',{timeout:300000});await p.keyboard.press('Enter');dl=await dlP;o.fileRange=dl.suggestedFilename();const out=`${L.OUT}/export-${vp}-K.wav`;await dl.saveAs(out);o.kFrames=X.wavInfo(out).frames;fs.unlinkSync(out);await sleep(500);await p.keyboard.press('Escape');await sleep(400);
  o.focusAfterClose=await p.evaluate(()=>document.activeElement&&(document.activeElement.textContent||'').trim().slice(0,20));
  // no-range Tab wrap
  await clearRange(p);await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);o.norange=[];for(let i=0;i<6;i++){await p.keyboard.press('Tab');await sleep(120);o.norange.push(await inDlg());}await p.keyboard.press('Escape');await sleep(400);
  const allIn=[o.open,...o.steps,o.afterUp,o.afterDown,o.atBtn,o.afterExport,...o.norange].every(x=>x.inside);
  rec('XR-KEYS',allIn&&o.atScope.name==='arrangement-export-scope'&&o.dUp.project.checked&&o.dDown.range.checked&&o.projSel&&o.fileProject==='czaba-studio-lab.wav'&&o.reopenRange&&o.fileRange==='czaba-studio-lab-range.wav'&&o.kFrames===240000&&o.norange.every(x=>x.name!=='arrangement-export-scope'),
   {...o,dUp:{p:o.dUp.project.checked,r:o.dUp.range.checked},dDown:{p:o.dDown.project.checked,r:o.dDown.range.checked}});});
 // --- jitter location P0 vs P1-type variants: per-second nonzero diff counts R1 vs P0 window, and P2/P0 unaffected
 rec('JITTER-INFO',null,{note:'see XR-WAV/XR-PROJECT diff counts'});
 for(const k of Object.keys(F))X.rm(F[k]);
 await X.finish(s,rec,'XR-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
