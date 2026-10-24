// Q6 Export. node q6.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const {L,sleep}=X; const fs=require('fs');
const W=+process.argv[2]||1440; const out={vp:W}; const net=[];
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q6-${n}-${W}.png`}); return `shots/Q6-${n}-${W}.png`;};
function onsets(w,thr=0.05){const ch=w.fmt.ch,n=X.nf(w); const r=[]; let quiet=0; for(let f=0;f<w.frames;f++){let a=0; for(let k=0;k<ch;k++) a=Math.max(a,Math.abs(w.read(f*ch+k))/n); if(a>thr&&quiet>=4800){r.push(f);} quiet=a>0.001?0:quiet+1; if(r.length>8) break;} return r;}
function firstNZ(w){const ch=w.fmt.ch; for(let f=0;f<w.frames;f++){for(let k=0;k<ch;k++) if(w.read(f*ch+k)!==0) return f;} return -1;}
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx,log}=await L.openStudio(b,X.VPS[W],'q6-'+W,net);
 const reqs=[]; p.on('request',q=>{ if(/unpkg|ffmpeg/i.test(q.url())) reqs.push(q.url().slice(0,120)); });
 await L.setSnapOff(p);
 await L.addAt(p,'demo-soft-impact','sfx',3); await L.addAt(p,'demo-soft-impact','music',7.25);
 // (d) dialog survey + keyboard
 const d0=await X.openDlg(p); out.dialog={formats:d0.formats, project:d0.project, range:d0.range, text:d0.text.slice(0,900), footer:d0.footer};
 out.shotDialog=await shot(p,'dialog');
 out.dialog.focus=await p.evaluate(()=>{const a=document.activeElement; return a?(a.dataset.testid||a.tagName)+':'+(a.textContent||'').trim().slice(0,30):null;});
 const tabs=[]; for(let i=0;i<8;i++){ await p.keyboard.press('Tab'); await sleep(80); tabs.push(await p.evaluate(()=>{const a=document.activeElement; const inDlg=!!(a&&a.closest('[role=dialog]')); return (inDlg?'in:':'OUT:')+((a.dataset&&a.dataset.testid)||a.tagName)+':'+(a.textContent||a.value||'').trim().slice(0,20);})); }
 out.dialog.tabOrder=tabs;
 await p.keyboard.press('Escape'); await sleep(400); out.dialog.afterEscape=await X.dstate(p)===null?'closed':'open';
 // (a) project WAV
 const r1=await X.exportWav(p,log,`Q6-${W}-project`,{scope:'project'});
 const f1=r1.files.find(x=>/\.wav$/i.test(x)); const w1=X.wav(f1);
 out.project={file:f1.replace(/.*c-round-124\//,''), name:r1.recs.map(r=>r.name), fmt:w1.fmt, frames:w1.frames, seconds:w1.seconds, peak:+w1.peak.toFixed(4), nan:w1.nan, onsets:onsets(w1.w), firstNZ:firstNZ(w1.w), expected:{sfx:3*48000,music:7.25*48000,end:9.25*48000}, progressDone:r1.st1&&r1.st1.status};
 // mute music -> onset gone
 await p.click('[data-track-id=music] button[aria-label^="Mute"]'); await sleep(200); await L.blur(p);
 const r2=await X.exportWav(p,log,`Q6-${W}-project-musicmuted`); const w2=X.wav(r2.files.find(x=>/\.wav$/i.test(x)));
 out.projectMuted={onsets:onsets(w2.w), frames:w2.frames, music:+X.winStats(w2.w,7.2,8).peak.toFixed(4)};
 await p.click('[data-track-id=music] button[aria-label^="Mute"]'); await sleep(200); await L.blur(p);
 // (b) range export 2.5 -> 6.0: pad on stems 0-16, range dragged inside the pad waveform (away from clip edges)
 await L.addAt(p,'demo-stem-pad','stems',0);
 const padId=(await L.clipsDom(p)).find(c=>c.lane==='stems').id;
 const r1b=await X.exportWav(p,log,`Q6-${W}-project-withpad`); const w1b=X.wav(r1b.files.find(x=>/\.wav$/i.test(x)));
 out.rangeDrag=await X.rangeDrag(p,padId,2.5,6.0); out.rangeSet=await H.range(p);
 const r3=await X.exportWav(p,log,`Q6-${W}-range`,{scope:'range'}); const f3=r3.files.find(x=>/\.wav$/i.test(x)); const w3=X.wav(f3);
 out.range={file:f3.replace(/.*c-round-124\//,''), dlg:r3.st0&&{range:r3.st0.range,text:r3.st0.text.slice(-300)}, frames:w3.frames, expectedFrames:Math.round((+out.rangeSet.end-+out.rangeSet.start)*48000), start:out.rangeSet.start, firstAbove03:(()=>{const n=X.nf(w3); for(let f=0;f<w3.frames;f++){ if(Math.abs(w3.w.read(f*2))/n>0.3) return f;} return -1;})()};
 const sf=Math.round(+out.rangeSet.start*48000);
 out.range.maxLsbVsProject=X.maxLsb(w3.w,w1b.w,0,sf,w3.frames);
 // (c) MP3
 await p.keyboard.press('Escape'); await sleep(200);
 const r4=await X.exportWav(p,log,`Q6-${W}-mp3`,{scope:'project',format:'mp3'});
 out.mp3={recs:r4.recs, files:r4.files.map(f=>f.replace(/.*c-round-124\//,'')), status:r4.st1&&r4.st1.status, cdnReqs:reqs.slice(0,5)};
 const mf=r4.files.find(x=>/\.mp3$/i.test(x));
 if(mf){ const b64=fs.readFileSync(mf).toString('base64'); const ref=Array.from({length:Math.floor(w1b.frames/48)},(_,i)=>{let a=0; for(let k=0;k<2;k++) a+=w1b.w.read((i*48)*2+k)/X.nf(w1b.w); return a/2;});
  out.mp3.decode=await p.evaluate(async([b64,ref])=>{const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); const ac=new OfflineAudioContext(2,48000,48000); const buf=await ac.decodeAudioData(bin.buffer); const d0=buf.getChannelData(0), d1=buf.getChannelData(buf.numberOfChannels>1?1:0); const ds=[]; for(let i=0;i*48<buf.length;i++){ds.push((d0[i*48]+d1[i*48])/2);} let best={lag:0,c:-2}; for(let lag=0;lag<200;lag++){ let sxy=0,sxx=0,syy=0; const n=Math.min(ref.length,ds.length-lag); for(let i=0;i<n;i++){const x=ref[i],y=ds[i+lag]; sxy+=x*y; sxx+=x*x; syy+=y*y;} const c=sxy/Math.sqrt(sxx*syy||1); if(c>best.c) best={lag,c:+c.toFixed(4)}; } return {sr:buf.sampleRate, ch:buf.numberOfChannels, seconds:+buf.duration.toFixed(4), bestLagMs:best.lag, corr:best.c};},[b64,ref]); }
 // overload: sfx clip gain +6 -> export warning
 const sfxId=(await L.clipsDom(p)).find(c=>c.lane==='sfx').id;
 await L.selectClip(p,sfxId); await X.openDetail(p); await p.fill('[data-testid=arrangement-detail-clip-gain-input]','6'); await p.locator('[data-testid=arrangement-detail-clip-gain-input]').press('Enter'); await sleep(300); await L.blur(p);
 const r5=await X.exportWav(p,log,`Q6-${W}-overload`,{scope:'project',keepOpen:true}); out.overload={warn:await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-export-overload]'); return e?e.textContent.trim():null;}), status:r5.st1&&r5.st1.status};
 out.shotOverload=await shot(p,'overload'); await X.closeDlg(p);
 await X.key(p,'Control+z');
 // video in export: load beeps video, export with video sound on vs muted
 await L.loadVideo(p,'beeps-6s-h264-aac.mp4');
 const dv=await X.openDlg(p); out.videoLine=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-export-video-sound]'); const f=document.querySelector('[data-testid=arrangement-export-video-fades]'); return {sound:e?e.textContent.replace(/\s+/g,' ').trim():null, fades:f?f.textContent.replace(/\s+/g,' ').trim():null};}); await X.closeDlg(p);
 const r6=await X.exportWav(p,log,`Q6-${W}-video`); const w6=X.wav(r6.files.find(x=>/\.wav$/i.test(x)));
 await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(200); await L.blur(p);
 const r7=await X.exportWav(p,log,`Q6-${W}-video-muted`); const w7=X.wav(r7.files.find(x=>/\.wav$/i.test(x)));
 out.video={on:+X.winStats(w6.w,0.2,2.8).peak.toFixed(4), muted:+X.winStats(w7.w,0.2,2.8).peak.toFixed(4), files:[r6.recs.map(r=>r.name),r7.recs.map(r=>r.name)]};
 await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(200); await L.blur(p);
 // cancel: long hero on music lane at 30 s
 await L.addAt(p,'demo-hero-music','music',30);
 await X.openDlg(p); await p.click('[data-testid=arrangement-export-format-wav]'); await p.click('[data-testid=arrangement-export-scope-project]');
 const n0=log.downloads.length; await p.locator('[data-testid=arrangement-export-footer] button').filter({hasText:/ექსპორტი$/}).click();
 const t0=Date.now(); let prog=null; while(Date.now()-t0<15000){ prog=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-export-progress]'); const c=document.querySelector('[data-testid=arrangement-export-cancel]'); return {p:e?e.value:null,label:(document.querySelector('[data-testid=arrangement-export-progress-label]')||{}).textContent||null,cancel:!!c};}); if(prog.cancel) break; await sleep(50); }
 out.cancel={progBefore:prog}; out.shotProgress=await shot(p,'progress');
 if(prog&&prog.cancel){ await p.click('[data-testid=arrangement-export-cancel]'); await sleep(2500); out.cancel.after=await X.dstate(p); out.cancel.downloads=log.downloads.length-n0; out.cancel.status=await L.status(p);} 
 await X.closeDlg(p).catch(()=>{});
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);}
 L.save(L.OUT,`Q6-${W}.json`,out); await b.close();})();
