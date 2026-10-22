// C r87 (adapted from C r86): MP-CDNFAIL (per viewport), MP-TIMEOUT (1440 only, arg 'timeout'), MP-X3 (video)
const X=require('./lib87.cjs');const{L,sleep,blur,fmtT}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const which=(process.argv[3]||'cdn,x3').split(',');
const rec=X.mkRec(`${L.OUT}/fail-${vp}-${which.join('_')}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const LOADFAIL='MP3 encoder ვერ ჩაიტვირთა (ffmpeg.wasm, unpkg CDN) — ფაილი არ შეიქმნა. შეამოწმე ინტერნეტი და სცადე თავიდან, ან აირჩიე WAV.';
const TOMSG='MP3 encoder 120 წამში ვერ ჩაიტვირთა — ფაილი არ შეიქმნა. გადატვირთე გვერდი და სცადე თავიდან, ან აირჩიე WAV.';
const VR='ვიდეოს რენდერი ამ ციკლში არ კეთდება — ექსპორტი მხოლოდ აუდიოა (ვიდეოს ორიგინალი ხმა შედის, თუ ჩართულია).';
const LINE='ვიდეოს fade-ები მხოლოდ პრევიუშია — ვიდეოს რენდერი არ კეთდება, ექსპორტი მხოლოდ აუდიოა.';
const mp3Msg=l=>`MP3 შეიქმნა: ${l}, 48 kHz · stereo.`;const wavMsg=l=>`WAV შეიქმნა: ${l}, 24-bit · 48 kHz · stereo.`;
const progDom=p=>p.evaluate(()=>({bar:!!document.querySelector('[data-testid=arrangement-export-progress]'),label:!!document.querySelector('[data-testid=arrangement-export-progress-label]')}));
async function closeWorks(p){const s=await X.msgState(p);const c=p.getByRole('button',{name:'დახურვა',exact:true});const en=await c.isEnabled();if(en){await c.click();await sleep(500);}const open=!!(await p.$('#arrangement-export-title'));return{closeEnabled:en,closedByClick:en&&!open,state:s};}
(async()=>{
 if(which.includes('cdn')){const s=await L.open(vp);const p=s.page;X.attachDl(p);await X.attachFiles(p);
  const aborted=[];await p.route('**/unpkg.com/**',r=>{aborted.push(r.request().url());return r.abort();});
  await L.fresh(p);await sleep(300);const S=await X.setup(p);await blur(p);const ME=S.clips.find(c=>c.lane==='music');const END=+(ME.start+ME.dur).toFixed(3);
  await T('PX-CDNFAIL',async()=>{const o={END};await X.openDlg(p);
   const t0=Date.now();o.mp3=await X.exportFmt(p,vp,'cf-mp3',{format:'mp3',timeout:150000});o.mp3.ms=Date.now()-t0;o.mp3Close=(await X.msgState(p)).closeDisabled===false;o.mp3Prog=await progDom(p);
   await p.screenshot({path:`${SH}/cdnfail-mp3-${vp}.png`});
   o.both=await X.exportFmt(p,vp,'cf-both',{format:'both',timeout:150000});o.bothClose=(await X.msgState(p)).closeDisabled===false;o.bothProg=await progDom(p);
   o.wav=await X.exportFmt(p,vp,'cf-wav',{format:'wav'});const wi=o.wav.files[0]?X.wavInfo(o.wav.files[0].out):null;o.wavFrames=wi&&wi.frames;
   o.abortedCount=aborted.length;o.aborted=[...new Set(aborted.map(u=>u.replace('https://unpkg.com','')))];
   await p.unroute('**/unpkg.com/**');
   const t1=Date.now();o.retry=await X.exportFmt(p,vp,'cf-retry',{format:'mp3',timeout:180000});o.retry.ms=Date.now()-t1;const rf=o.retry.files[0];o.retryHdr=rf?X.mp3Header(rf.out):null;
   o.retryOr=rf?await X.oracle(p,X.rel(rf),X.rel(o.wav.files[0]),{w0:3,w1:4.5}):null;o.retryProg=await progDom(p);
   const sum=r=>({names:r.names,msg:r.after&&r.after.msg,role:r.after&&r.after.role,timeline:r.timeline.map(x=>[x.t,x.role,(x.msg||'').slice(0,60),x.close])});
   const out={END,mp3Prog:o.mp3Prog,bothProg:o.bothProg,mp3:sum(o.mp3),mp3Ms:o.mp3.ms,mp3Close:o.mp3Close,both:sum(o.both),bothClose:o.bothClose,wav:sum(o.wav),wavFrames:o.wavFrames,aborted:o.aborted,abortedCount:o.abortedCount,retry:sum(o.retry),retryMs:o.retry.ms,retryHdr:o.retryHdr&&{sr:o.retryHdr.sampleRate,ch:o.retryHdr.channels,vbr:o.retryHdr.vbr},retryProg:o.retryProg,retryOr:o.retryOr&&{dur:o.retryOr.mp3.dur,lag:o.retryOr.lag,corr:o.retryOr.corr}};
   const ok=!o.mp3Prog.bar&&!o.mp3Prog.label&&!o.bothProg.bar&&!o.bothProg.label&&o.mp3.names.length===0&&o.mp3.after.msg===LOADFAIL&&o.mp3.after.role==='alert'&&o.mp3Close&&o.both.names.length===0&&o.both.after.msg===LOADFAIL&&o.both.after.role==='alert'&&o.bothClose&&o.wav.names.join()==='czaba-studio-lab.wav'&&o.wav.after.msg===wavMsg(fmtT(END))&&o.wavFrames===Math.ceil(END*48000)&&o.abortedCount>0&&o.retry.names.join()==='czaba-studio-lab.mp3'&&o.retry.after.msg===mp3Msg(fmtT(END))&&o.retryOr&&Math.min(...o.retryOr.corr)>=0.99;
   rec('PX-CDNFAIL',ok,out);for(const k of ['mp3','both','wav','retry'])X.rmF(o[k]);await X.closeDlg(p);});
  await X.finish(s,rec,'CDN-'+vp);await s.browser.close();}
 if(which.includes('timeout')){const s=await L.open(vp);const p=s.page;X.attachDl(p);X.attachFiles(p);const hung=[];await p.route('**/unpkg.com/**',r=>{hung.push({u:r.request().url(),t:Date.now()});/* never answer */});
  await L.fresh(p);await sleep(300);await X.setup(p);await blur(p);
  await T('PX-RETRY',async()=>{const o={samples:[]};await X.openDlg(p);await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(200);const n0=p.__dls.length;
   await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();const t0=Date.now();let tLoad=null,tMsg=null,last=null;
   while(Date.now()-t0<150000){const m=await X.msgState(p);const k=m&&m.role+'|'+m.msg;if(k!==last){o.samples.push({t:Date.now()-t0,role:m.role,msg:m.msg,btn:m.btn,close:m.closeDisabled});last=k;}
    if(!tLoad&&/encoder იტვირთება/.test(m.msg||''))tLoad=Date.now()-t0;
    if(!o.at60&&Date.now()-t0>=60000){o.at60={t:Date.now()-t0,msg:m.msg,btn:m.btn,close:m.closeDisabled};await p.screenshot({path:`${SH}/timeout-60s-${vp}.png`});}
    if(m.role==='alert'){tMsg=Date.now()-t0;break;}await sleep(250);}
   o.tLoad=tLoad;o.tMsg=tMsg;o.sinceLoad=tLoad&&tMsg?tMsg-tLoad:null;o.final=await X.msgState(p);await p.screenshot({path:`${SH}/timeout-msg-${vp}.png`});await sleep(1500);o.dls=p.__dls.slice(n0).map(d=>d.fn);o.hungReqs=hung.map(h=>[h.u.replace('https://unpkg.com',''),h.t-t0]);o.hungAtAlert=hung.length;o.progAfter=await progDom(p);o.close=await closeWorks(p);await sleep(3000);o.hungLater=hung.length;
   await p.unroute('**/unpkg.com/**');await X.openDlg(p);const t1=Date.now();o.retry=await X.exportFmt(p,vp,'retry',{format:'mp3',timeout:240000});o.retryMs=Date.now()-t1;o.retrySum={names:o.retry.names,msg:o.retry.after&&o.retry.after.msg,timeline:o.retry.timeline.map(x=>[x.t,x.role,(x.msg||'').slice(0,60)])};const rf=o.retry.files[0];o.retryHdr=rf?X.mp3Header(rf.out):null;o.retryProg=await progDom(p);X.rmF(o.retry);delete o.retry;
   rec('PX-RETRY',!o.progAfter.bar&&!o.progAfter.label&&o.hungLater===o.hungAtAlert&&o.retrySum.names.join()==='czaba-studio-lab.mp3'&&/^MP3 შეიქმნა: 01:41\.702, 48 kHz · stereo\.$/.test(o.retrySum.msg||'')&&!o.retryProg.bar&&o.at60&&/encoder იტვირთება/.test(o.at60.msg||'')&&/მიმდინარეობს/.test(o.at60.btn||'')&&o.final.msg===TOMSG&&o.final.role==='alert'&&o.sinceLoad>=115000&&o.sinceLoad<=125000&&o.dls.length===0&&o.close.closeEnabled&&o.close.closedByClick,o);});
  await X.finish(s,rec,'TO-'+vp);await s.browser.close();}
 if(which.includes('x3')){const s=await L.open(vp);const p=s.page;X.attachDl(p);await X.attachFiles(p);await L.fresh(p);await sleep(300);
  await T('PX-X3',async()=>{const U=await X.setupV(p);const o={v:[U.v.start,U.v.end]};const d=await X.openDlg(p);o.noFade={radios:d.radios,videoLine:d.videoLine};await X.closeDlg(p);
   await X.vDrag(p,'in',40);await p.mouse.move(5,5);await blur(p);const v2=await X.vInfo(p);o.fi=v2.fi;
   const d2=await X.openDlg(p);await p.screenshot({path:`${SH}/mp-x3-video-${vp}.png`});o.fade={radios:d2.radios,videoLine:d2.videoLine};
   const M=await X.exportFmt(p,vp,'x3m',{format:'mp3',timeout:240000});const B=await X.exportFmt(p,vp,'x3b',{format:'both',timeout:240000});await X.closeDlg(p);
   o.mp3={names:M.names,msg:M.after.msg};o.both={names:B.names,msg:B.after.msg};o.allDls=p.__dls.map(x=>x.fn);X.rmF(M);X.rmF(B);
   const vid=r=>r.radios.find(x=>/ვიდეო \(აუდიოთი\)/.test(x.label||''));const v0=vid(o.noFade),v1=vid(o.fade);
   rec('PX-X3',!!v0&&v0.disabled&&v0.label==='ვიდეო (აუდიოთი)'+VR&&o.noFade.videoLine===null&&!!v1&&v1.disabled&&v1.label==='ვიდეო (აუდიოთი)'+VR&&o.fade.videoLine===LINE&&o.mp3.names.join()==='czaba-studio-lab.mp3'&&o.both.names.join()==='czaba-studio-lab.wav,czaba-studio-lab.mp3'&&o.allDls.every(f=>/\.(wav|mp3)$/.test(f))&&/შეიქმნა/.test(o.mp3.msg||''),o);});
  await X.finish(s,rec,'X3-'+vp);await s.browser.close();}
process.exit(0);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
