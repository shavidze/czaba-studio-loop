const X=require('./lib85.cjs');const{L,sleep,st,blur,key}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/ov-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;const SR=48000;
const G6=Math.pow(10,6/20);
async function masterTo(p,keys){const mv=p.locator('input[aria-label="Master Volume"]');await mv.focus();for(const k of keys){await p.keyboard.press(k);await sleep(40);}await sleep(300);await blur(p);return p.locator('[data-testid=arrangement-master-readout]').textContent();}
function fullCount(w){let full=0,mx=0;for(let i=0;i<w.n;i++){const v=w.read(i);const a=Math.abs(v);if(a>mx)mx=a;if(v>=8388607||v<=-8388608)full++;}return{full,mx};}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);
 const S=await X.setup(p);await X.setSnap(p,true);await blur(p);rec('SETUP',null,{clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
 const F={};
 await T('XR-OVERLOAD',async()=>{const o={};
  // music muted so a quiet span exists at +6 dB; reference export at -6 dB (no clipping) gives the true pre-clamp level
  await X.lMute(p,'music').click();await sleep(300);await blur(p);o.musicMute=await X.lMute(p,'music').getAttribute('aria-pressed');
  o.m6=await masterTo(p,Array(12).fill('ArrowDown'));const d0=await X.openDlg(p);F.Ref=await X.exportNow(p,vp,'ref-6');await X.closeDlg(p);o.ref={frames:F.Ref.frames,warning:F.Ref.after.warning,fc:fullCount(F.Ref.w)};
  const pk=[];for(let t=0;t<101;t++)pk.push(X.peakWin(F.Ref.w,t,t+1).peak);const win=a=>Math.max(...pk.slice(a,a+5));
  o.perSecondPeakRef=pk.slice(0,24).map(x=>+x.toFixed(4));
  let quiet=null,loud=null;for(let a=1;a<=14;a++){const m=win(a)*G6*G6;if(m>0.02&&m<0.85&&quiet===null)quiet=a;if(m>1.15&&loud===null)loud=a;}o.quiet=quiet;o.loud=loud;
  o.p6=await masterTo(p,['End']);
  for(const [k,a] of [['quiet',quiet],['loud',loud]]){if(a===null){o[k]='no candidate';continue;}await X.rangeDrag(p,'music',a,a+5);const rd=(await st(p)).range;const d=await X.openDlg(p);const f=await X.exportNow(p,vp,'OV'+k);await p.screenshot({path:`${SH}/xr-overload-${k}-${vp}.png`});await X.closeDlg(p);
   const fc=fullCount(f.w);const pre=X.peakWin(F.Ref.w,a,a+5).peak*G6*G6;const m=f.after.warning&&/პიკი \+([\d.]+) dBFS — (\d+) sample/.exec(f.after.warning);
   // predicted clamped count from the -6 dB reference scaled by +12 dB
   let predClamp=0;{const w=F.Ref.w;const n=X.nf(w);for(let fr=Math.round(a*SR);fr<Math.round((a+5)*SR);fr++)for(let c=0;c<2;c++){const v=w.read(fr*2+c)/n*G6*G6;if(v>8388607/8388608||v<-1)predClamp++;}}
   o[k]={span:[a,a+5],readout:rd,fn:f.fn,frames:f.frames,status:f.after.status,warning:f.after.warning,fileFull:fc.full,fileMaxLsb:fc.mx,predictedPrePeak:+pre.toFixed(4),predictedDb:+(20*Math.log10(pre)).toFixed(2),predictedClamped:predClamp,shownDb:m?+m[1]:null,shownCount:m?+m[2]:null,gainNote:(d.text.match(/Master \+6[^.]*\./)||[null])[0]};X.rm(f);}
  const q=o.quiet,l=o.loud;
  rec('XR-OVERLOAD',/\+6/.test(o.p6)&&typeof q==='object'&&!q.warning&&q.fileFull===0&&typeof l==='object'&&!!l.warning&&Math.abs(l.shownDb-l.predictedDb)<=0.15&&l.shownCount>0&&Math.abs(l.shownCount-l.fileFull)<=Math.max(2,l.fileFull*0.01)&&Math.abs(l.shownCount-l.predictedClamped)<=Math.max(4,l.predictedClamped*0.02),o);
  await masterTo(p,['Home']);await p.locator('input[aria-label="Master Volume"]').dblclick();await sleep(300);await X.lMute(p,'music').click();await sleep(300);await blur(p);
  o.restored={master:await p.locator('[data-testid=arrangement-master-readout]').textContent(),mute:await X.lMute(p,'music').getAttribute('aria-pressed')};rec('OV-RESTORE',null,o.restored);});
 await T('XR-PASTEND',async()=>{const o={};const d0=await X.openDlg(p);o.P0dlg={p:d0.project,r:d0.range};F.P0=await X.exportNow(p,vp,'P0',{scope:d0.project.disabled?null:'project'});await X.closeDlg(p);o.P0frames=F.P0.frames;o.P0fn=F.P0.fn;
  // scroll horizontally so the project end is on screen
  await X.geo(p);const lb=await X.laneBox(p,'music');const W=vp==='1440x900'?1440:1280;const target=X.tx(101.702)-(W-200);await p.mouse.move(Math.round(W-300),Math.round(lb.y+lb.h/2));await p.mouse.wheel(target,0);await sleep(700);await X.geo(p);
  o.after={RL:X.RL,x95:X.tx(95),xEnd:X.tx(101.702)};const c=await X.clipInfo(p,'music');o.clipRight=+(c.box.x+c.box.w).toFixed(1);
  // drag from 95 s to 60 px beyond the clip end (empty lane area past project end)
  const y=Math.round(c.box.y+c.box.h*0.65);const x0=X.tx(95),x1=Math.min(W-5,Math.round(c.box.x+c.box.w+60));await p.mouse.move(x0,y);await p.mouse.down();await p.mouse.move(Math.round((x0+x1)/2),y,{steps:6});await p.mouse.move(x1,y,{steps:6});await sleep(150);await p.mouse.up();await sleep(400);
  o.readout=(await st(p)).range;await p.screenshot({path:`${SH}/xr-pastend-${vp}.png`});
  // empty area past the end: try a drag starting there
  const xe=Math.min(W-10,Math.round(c.box.x+c.box.w+20));await p.mouse.move(xe,y);await p.mouse.down();await p.mouse.move(Math.max(x0,xe-200),y,{steps:8});await p.mouse.up();await sleep(400);o.readoutEmptyDrag=(await st(p)).range;
  // re-create clip range to the end and export it (range ending exactly at project end)
  await p.mouse.move(x0,y);await p.mouse.down();await p.mouse.move(x1,y,{steps:10});await p.mouse.up();await sleep(400);o.readout2=(await st(p)).range;
  const d=await X.openDlg(p);o.label=d.range&&d.range.label;if(d.range&&d.range.checked){const f=await X.exportNow(p,vp,'tail');const st0=Math.round(95*SR);const dd=X.diffAt(f.w,F.P0.w,st0);o.tail={fn:f.fn,frames:f.frames,expFrames:Math.round((101.702-95)*SR),diff:{maxFS:dd.maxFS,maxLSB:dd.maxLSB,nonzero:dd.nonzero,n:dd.n},msg:f.after.status};X.rm(f);}await X.closeDlg(p);
  rec('XR-PASTEND',null,{...o,verdict:'not reachable: clip range is clamped to the clip end (= project end); drag starting past the end is a marquee/clear'});});
 for(const k of Object.keys(F))X.rm(F[k]);
 await X.finish(s,rec,'OV-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
