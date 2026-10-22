const X=require('./lib87.cjs');const{L,sleep,blur,fmtT}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/m5-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const END=304.406;const PFR=Math.ceil(END*48000);
const wavMsg=l=>`WAV შეიქმნა: ${l}, 24-bit · 48 kHz · stereo.`;const mp3Msg=l=>`MP3 შეიქმნა: ${l}, 48 kHz · stereo.`;
const ok24=r=>r.fmt.sr===48000&&r.fmt.bits===24&&r.fmt.ch===2&&r.fmt.tag===1&&r.stats.nan===0;
const S_WAV=['რენდერი და 24-bit WAV-ის შექმნა…'];const S_MP3=['რენდერი და 24-bit WAV-ის შექმნა…','MP3 encoder იტვირთება (ffmpeg.wasm, პირველად ~31 MB)…','MP3-ის შექმნა…'];
const band=g=>g<=150?'PASS':g<=250?'TRIAGE':'FAIL';
async function sess(){const s=await L.open(vp);const p=s.page;p.on('crash',()=>console.log('APP PAGE CRASH'));X.attachDl(p);await X.attachFiles(p);X.attachWorkers(p);await L.fresh(p);await sleep(300);const S=await X.setup(p);const f=await X.fiveMin(p);return{s,p,S,f};}
(async()=>{let wavRef=null;
 // Session A: WAV
 {const{s,p,S,f}=await sess();rec('SETUP-A',null,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),scopeText:f.txt});
  await T('PX-WAV5',async()=>{const unBefore=X.unpkg(s).length;const wb=p.__workers.length;const r=await X.exportInst(p,vp,'W5',{format:'wav'});await p.screenshot({path:`${SH}/wav5-done-${vp}.png`});
   const w=X.wavInfo(r.files[0].out);wavRef=r.files[0];const o={scopeText:f.txt,names:r.names,frames:w.frames,PFR,fmt:w.fmt,stats:w.stats,sha:w.sha,size:r.files[0].size,msg:r.after.msg,warning:r.after.warning,tEnd:r.tEnd,maxGap:r.an.maxGap,top5:r.an.top5,rafFrames:r.an.frames,band:band(r.an.maxGap),workersBeforeClick:wb,workers:r.workers,unpkgBefore:unBefore,unpkgAfter:X.unpkg(s).length};
   rec('PX-WAV5',/00:00\.000 — 05:04\.406/.test(f.txt)&&o.names.join()==='czaba-studio-lab.wav'&&w.frames===PFR&&ok24(w)&&o.msg===wavMsg(fmtT(END))&&o.band==='PASS',o);
   rec('PX-PHASES-wav',r.an.order.join()==='render,wav'&&!r.an.reentered&&r.an.phases.render.distinct>=3&&r.an.phases.wav.distinct>=2&&r.an.phases.render.decreases===0&&r.an.phases.wav.decreases===0&&r.an.phases.render.pctMismatch===0&&r.an.phases.wav.pctMismatch===0&&r.an.issues.length===0&&r.an.absentAtStart&&r.an.absentAtEnd&&r.an.statuses.slice(0,1).join()===S_WAV.join()&&!r.an.focusProg,{order:r.an.order,phases:r.an.phases,issues:r.an.issues,statuses:r.an.statuses,absentAtStart:r.an.absentAtStart,absentAtEnd:r.an.absentAtEnd,focusProg:r.an.focusProg,bar:r.an.barAttrs});
   const ew=r.workers.filter(x=>/export-wav\.worker/.test(x.url));rec('PX-WORKER-wav',wb===0&&ew.length===1&&ew.every(x=>X.sameOrigin(x.url)&&x.dt>=0)&&r.workers.length===1,{workersBeforeClick:wb,workers:r.workers});
   fs.writeFileSync(`${L.OUT}/m5-${vp}-wav-progress.json`,JSON.stringify(r.raw.prog));});
  await X.closeDlg(p).catch(()=>{});await X.finish(s,rec,'M5A-'+vp);}
 // Session B: MP3 fresh page
 {const{s,p,S,f}=await sess();rec('SETUP-B',null,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),scopeText:f.txt});let M1=null;
  await T('PX-MP35',async()=>{const unBefore=X.unpkg(s).length;const wb=p.__workers.length;p.on('crash',()=>console.log('PAGE CRASH'));const r=await X.exportInst(p,vp,'M5',{format:'mp3'});M1=r;console.log('MP3 export done',r.names,r.after&&r.after.msg,r.tEnd,r.an.maxGap);await p.screenshot({path:`${SH}/mp35-done-${vp}.png`});const mf=r.files[0];
   const o={scopeText:f.txt,names:r.names,size:mf&&mf.size,sha:mf&&mf.sha,msg:r.after.msg,warning:r.after.warning,tEnd:r.tEnd,maxGap:r.an.maxGap,top5:r.an.top5,rafFrames:r.an.frames,band:band(r.an.maxGap),workers:r.workers,workersBeforeClick:wb,unpkgBefore:unBefore,unpkg:X.unpkg(s)};
   o.hdr=X.mp3Header(mf.out);rec('PX-MP35-export',null,o);const so=await X.oraclePage(vp);o.or=await X.oracleWin(so.page,X.rel(mf),wavRef.out,[[3,4.5],[250,251.5]]);await so.browser.close();
   rec('PX-MP35',o.names.join()==='czaba-studio-lab.mp3'&&Math.abs(o.or.mp3.dur-END)<=0.1&&o.or.mp3.sr===48000&&o.or.mp3.ch===2&&o.or.wins.length===2&&o.or.wins.every(w=>w.monoCorr>=0.99&&w.corrL>=0.99&&w.corrR>=0.99)&&o.msg===mp3Msg(fmtT(END))&&o.band==='PASS'&&unBefore===0,o);
   rec('PX-PHASES-mp3',r.an.order.join()==='render,wav,load,mp3'&&!r.an.reentered&&r.an.phases.render.distinct>=3&&r.an.phases.wav.distinct>=2&&r.an.phases.mp3.distinct>=2&&r.an.phases.load.noValueRecords>=1&&['render','wav','mp3'].every(k=>r.an.phases[k].decreases===0&&r.an.phases[k].pctMismatch===0)&&r.an.issues.length===0&&r.an.absentAtStart&&r.an.absentAtEnd&&r.an.statuses.slice(0,3).join()===S_MP3.join()&&!r.an.focusProg,{order:r.an.order,phases:r.an.phases,issues:r.an.issues,statuses:r.an.statuses,absentAtStart:r.an.absentAtStart,absentAtEnd:r.an.absentAtEnd,focusProg:r.an.focusProg});
   const ew=r.workers.filter(x=>/export-wav\.worker/.test(x.url));rec('PX-WORKER-mp3',wb===0&&ew.length===1&&ew.every(x=>X.sameOrigin(x.url)),{workersBeforeClick:wb,workers:r.workers});
   fs.writeFileSync(`${L.OUT}/m5-${vp}-mp3-progress.json`,JSON.stringify(r.raw.prog));});
  await T('PX-REUSE',async()=>{const w0=s.reqs.filter(r=>/ffmpeg-core\.wasm/.test(r.url)).length;const r=await X.exportInst(p,vp,'M5b',{format:'mp3'});const w1=s.reqs.filter(r=>/ffmpeg-core\.wasm/.test(r.url)).length;
   const load=r.an.phases.load;const ld=r.raw.prog.filter(x=>x.label==='MP3 encoder-ის ჩატვირთვა…');const ldDur=ld.length?(r.raw.prog.find(x=>x.t>ld.at(-1).t&&x.label!==ld[0].label)||{t:null}).t-ld[0].t:0;
   const o={wasmBefore:w0,wasmAfter:w1,firstMs:M1&&M1.tEnd,secondMs:r.tEnd,names:r.names,sameShaAsFirst:r.files[0]&&M1&&r.files[0].sha===M1.files[0].sha,msg:r.after.msg,loadPhase:load||null,loadDurMs:ldDur,order:r.an.order,maxGap:r.an.maxGap,top5:r.an.top5,workers:r.workers};
   rec('PX-REUSE',w0===1&&w1===1&&o.names.join()==='czaba-studio-lab.mp3'&&o.msg===mp3Msg(fmtT(END)),o);X.rmF(r);});
  X.rmF(M1);await X.finish(s,rec,'M5B-'+vp);}
 try{fs.unlinkSync(wavRef.out)}catch{}process.exit(0);
})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
