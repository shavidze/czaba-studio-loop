const X=require('./lib85.cjs');const{L,sleep,st,blur,key}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/x3-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const VR='ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';
const LINE='ვიდეოს fade-ები მხოლოდ პრევიუშია — ვიდეოს რენდერი არ კეთდება, ექსპორტი მხოლოდ აუდიოა.';
(async()=>{const s=await L.open(vp);const p=s.page;const dls=[];p.on('download',d=>dls.push(d.suggestedFilename()));await L.fresh(p);await sleep(300);
 const U=await X.setupV(p);rec('SETUP',null,{v:[U.v.start,U.v.end]});
 await T('XR-X3-video',async()=>{const o={};const d=await X.openDlg(p);o.noFade={radios:d.radios.slice(0,3),videoLine:d.videoLine};await X.closeDlg(p);
  await X.vDrag(p,'in',40);await p.mouse.move(5,5);await X.setSnap(p,true);await X.rangeDrag(p,'stems',3,7);o.readout=(await st(p)).range;
  const d2=await X.openDlg(p);await p.screenshot({path:`${SH}/xr-x3-video-${vp}.png`});o.withRange={radios:d2.radios,videoLine:d2.videoLine,desc:d2.desc};
  const R=await X.exportNow(p,vp,'vr');const P=await X.exportNow(p,vp,'vp',{scope:'project'});await X.closeDlg(p);
  const dd=X.diffAt(R.w,P.w,3*48000,{spans:[{t0:3,t1:S8(U.v.end)},{t0:S8(U.v.end),t1:7}]});o.R={fn:R.fn,frames:R.frames,msg:R.after.status};o.P={fn:P.fn,frames:P.frames};o.diff={maxFS:dd.maxFS,maxLSB:dd.maxLSB,nonzero:dd.nonzero,spans:dd.spans};X.rm(R);X.rm(P);
  const mp3=d2.radios[1],vid=d2.radios[2];o.dls=dls.slice();
  rec('XR-X3-video',o.noFade.radios[1].disabled&&o.noFade.radios[2].disabled&&o.noFade.videoLine===null&&mp3.disabled&&mp3.label==='MP3ამ ეტაპზე ხელმისაწვდომი არ არის'&&vid.disabled&&vid.label==='ვიდეო (აუდიოთი)'+VR&&d2.videoLine===LINE&&o.dls.every(f=>/\.wav$/.test(f))&&R.frames===192000&&dd.maxLSB<=1,o);});
 await X.finish(s,rec,'X3-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
function S8(e){return Math.min(7,+e.toFixed(3));}
