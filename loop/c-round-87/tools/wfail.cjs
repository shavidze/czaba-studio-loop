// EXTRA (not a B row): worker script blocked -> exact worker failure message, no file, progress cleared, no silent main-thread fallback; after unroute the next WAV works
const X=require('./lib87.cjs');const{L,sleep,blur,fmtT}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/wfail-${vp}.json`);const T=X.T(rec);
const MSG='ექსპორტი ვერ მოხერხდა — ფაილი არ შეიქმნა. WAV-ის ჩაწერა ვერ მოხერხდა (worker).';
(async()=>{const s=await L.open(vp);const p=s.page;X.attachDl(p);X.attachWorkers(p);const blocked=[];
 await L.fresh(p);await sleep(300);const S=await X.setup(p);await blur(p);const ME=S.clips.find(c=>c.lane==='music');const END=+(ME.start+ME.dur).toFixed(3);
 await s.context.route('**/export-wav.worker*',r=>{blocked.push(r.request().url());return r.abort();});
 await T('EXTRA-WORKER-FAIL',async()=>{await X.openDlg(p);const o={};
  for(const f of ['wav','mp3']){const r=await X.exportInst(p,vp,'wf-'+f,{format:f,timeout:60000});o[f]={names:r.names,msg:r.after.msg,role:r.after.role,close:r.after.closeDisabled,prog:{order:r.an.order,absentAtEnd:r.an.absentAtEnd},workers:r.workers,timeline:r.timeline.map(x=>[x.t,x.role,(x.msg||'').slice(0,70)])};X.rmF(r);}
  o.blocked=blocked.length;o.unpkgDuringFail=X.unpkg(s).length;await s.context.unroute('**/export-wav.worker*');
  const r2=await X.exportInst(p,vp,'wf-after',{format:'wav'});o.after={names:r2.names,msg:r2.after.msg,frames:r2.files[0]?X.wavInfo(r2.files[0].out).frames:null,workers:r2.workers.map(w=>w.url)};X.rmF(r2);
  rec('EXTRA-WORKER-FAIL',o.blocked>0&&['wav','mp3'].every(k=>o[k].names.length===0&&o[k].msg===MSG&&o[k].role==='alert'&&o[k].close===false&&o[k].prog.absentAtEnd)&&o.unpkgDuringFail===0&&o.after.names.join()==='czaba-studio-lab.wav'&&o.after.frames===Math.ceil(END*48000),o);});
 await X.finish(s,rec,'WF-'+vp);process.exit(0);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
