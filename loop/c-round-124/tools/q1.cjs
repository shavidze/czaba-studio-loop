// Q1 Transport and video. node q1.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const R=require('./rec2.cjs'); const {L,sleep}=X; const fs=require('fs');
const W=+process.argv[2]||1440; const out={vp:W}; const net=[];
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q1-${n}-${W}.png`}); return `c-round-124/shots/Q1-${n}-${W}.png`;};
const vstate=(p)=>p.evaluate(()=>{const v=document.querySelector('video[data-video-role=active]'); const f=document.querySelector('[data-testid=arrangement-video-fade]'); const c=document.querySelector('[data-clip-kind=video]'); return {vt:v?+v.currentTime.toFixed(3):null, paused:v?v.paused:null, muted:v?v.muted:null, src:!!(v&&v.currentSrc), pos:+document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'), opacity:f?f.dataset.videoOpacity:null, clip:c?{start:+c.getAttribute('data-clip-start'), w:c.getBoundingClientRect().width}:null, nVideoClips:document.querySelectorAll('[data-clip-kind=video]').length};});
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx,log}=await L.openStudio(b,X.VPS[W],'q1-'+W,net,{extraInit:R.recInit});
 await L.setSnapOff(p);
 await shot(p,'fresh');
 // (e) broken file first
 await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA+'broken.mp4'); await sleep(3000);
 out.broken={status:await L.status(p), clips:await p.evaluate(()=>document.querySelectorAll('[data-clip-kind=video]').length), alerts:await p.evaluate(()=>[...document.querySelectorAll('[role=alert]')].map(x=>x.textContent.trim().slice(0,200)))};
 out.broken.shot=await shot(p,'broken');
 // (e2) audio file into video input
 await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(L.MEDIA+'tone-2s.wav'); await sleep(1500);
 out.wavIntoVideo={status:await L.status(p), clips:await p.evaluate(()=>document.querySelectorAll('[data-clip-kind=video]').length)};
 // (b) import by file chooser
 await L.loadVideo(p,'beeps-6s-h264-aac.mp4');
 out.import={status:await L.status(p), st:await vstate(p), videoLane:await p.evaluate(()=>{const c=document.querySelector('[data-clip-kind=video]'); return c.closest('[data-track-id]').dataset.trackId;})};
 out.import.shot=await shot(p,'imported');
 // add an audio clip so the project isn't only video
 await L.addAt(p,'demo-stem-pad','stems',0);
 // (b) scrub while paused: seek to 3 points
 out.scrub=[];
 for(const t of [1.0,2.5,4.2]){ await X.L.seekTo(p,t); await sleep(700); out.scrub.push({t,...await vstate(p)}); }
 // (a) Space play/stop
 await X.L.seekTo(p,1.0); await sleep(400);
 const a={};
 a.before=await vstate(p);
 await p.evaluate(()=>window.__recStart());
 await X.L.blur(p); await p.keyboard.press('Space'); await sleep(1600);
 a.during=await vstate(p);
 a.duringShot=await shot(p,'playing');
 await p.keyboard.press('Space'); await sleep(600);
 a.afterStop=await vstate(p); a.afterStopStatus=await L.status(p);
 const blocks=await p.evaluate(()=>window.__recStop());
 a.playSamples=blocks.filter((x,i)=>i%25===0).map(x=>({t:x[0],pos:x[5],vt:x[6],d:x[6]!=null&&x[5]!=null?+(x[6]-x[5]).toFixed(3):null}));
 a.out=R.summ(blocks);
 await p.keyboard.press('Space'); await sleep(800); a.secondPlayAt=await vstate(p); await p.keyboard.press('Space'); await sleep(500); a.secondStop=await vstate(p);
 await p.keyboard.press('Shift+Space'); await sleep(800); a.shiftSpace=await vstate(p); a.shiftSpaceStatus=await L.status(p); await p.keyboard.press('Space'); await sleep(500); a.shiftStop=await vstate(p);
 await p.keyboard.press('Home'); await sleep(300); a.home=await vstate(p);
 out.transport=a;
 // (c) video sound on vs muted: mute stems so only video sound is heard; play 0.5-4.5
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200);
 const c={};
 for(const mode of ['on','muted']){
  if(mode==='muted'){ await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(200);}
  await X.L.seekTo(p,0.5); await sleep(300);
  await p.evaluate(()=>window.__recStart()); await X.L.blur(p); await p.keyboard.press('Space'); await sleep(3000);
  const st=await vstate(p); await p.keyboard.press('Space'); await sleep(400);
  const bl=await p.evaluate(()=>window.__recStop());
  c[mode]={out:R.summ(bl,(x)=>x[5]>0.8), pictureMoving:st, videoMuteAria:await p.evaluate(()=>document.querySelector('[data-track-id=video] button[aria-label^="Mute"]').getAttribute('aria-pressed'))};
 }
 c.shot=await shot(p,'video-muted');
 await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(200);
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200);
 out.videoSound=c;
 // sync during playback at 3+ points with video starting at clip start 0 (pos vs vt)
 await X.L.seekTo(p,0.2); await sleep(300);
 await p.evaluate(()=>window.__recStart()); await X.L.blur(p); await p.keyboard.press('Space'); await sleep(4500); await p.keyboard.press('Space'); await sleep(300);
 const sb=await p.evaluate(()=>window.__recStop());
 const pts=sb.filter(x=>x[5]>0.5 && x[6]!=null); const pick=[0.25,0.5,0.75].map(f=>pts[Math.floor(pts.length*f)]).filter(Boolean);
 out.sync={points:pick.map(x=>({pos:x[5],vt:x[6],diffMs:+((x[6]-x[5])*1000).toFixed(1)})), n:pts.length, maxAbsMs:+Math.max(...pts.map(x=>Math.abs(x[6]-x[5])*1000)).toFixed(1)};
 // (b2) move and trim video clip
 const vid=await p.evaluate(()=>document.querySelector('[data-clip-kind=video]').getAttribute('data-clip-id'));
 await L.selectClip(p,vid); await sleep(300);
 const mv={}; mv.st=await H.dragHeader(p,vid,1.0); mv.after=await vstate(p);
 await X.L.seekTo(p,1.5); await sleep(700); mv.at15=await vstate(p);
 await X.L.seekTo(p,0.5); await sleep(700); mv.at05=await vstate(p);
 mv.trim=await H.dragEdge(p,vid,'L',0.5); mv.afterTrim=await vstate(p); mv.detail=await X.clipInfoSel(p);
 await X.L.seekTo(p,2.0); await sleep(700); mv.at20afterTrim=await vstate(p);
 mv.shot=await shot(p,'moved-trimmed');
 out.moveTrim=mv;
 // (d) video fade-in: drag handle
 const fd={};
 const hb=await p.locator('[data-testid=arrangement-video-fade-in-handle]').first().boundingBox().catch(()=>null);
 fd.handle=hb;
 if(hb){ const g=await L.geo(p); await p.mouse.move(hb.x+hb.width/2,hb.y+hb.height/2); await p.mouse.down(); await p.mouse.move(hb.x+hb.width/2+1.0*g.pps,hb.y+hb.height/2,{steps:8}); await sleep(150); await p.mouse.up(); await sleep(400);
  fd.status=await L.status(p);
  const cs=(await vstate(p)).clip.start;
  for(const dt of [0.02,0.5,0.98,1.3]){ await X.L.seekTo(p,cs+dt); await sleep(400); fd['op@'+dt]=(await vstate(p)).opacity; }
  fd.shot=await shot(p,'fade-in');
  await X.L.blur(p); await p.keyboard.press('Control+z'); await sleep(400); fd.undoStatus=await L.status(p); await X.L.seekTo(p,cs+0.02); await sleep(400); fd.opAfterUndo=(await vstate(p)).opacity;
  await X.L.blur(p); await p.keyboard.press('Control+Shift+z'); await sleep(400); fd.redoStatus=await L.status(p); await X.L.seekTo(p,cs+0.02); await sleep(400); fd.opAfterRedo=(await vstate(p)).opacity;
  // audio output during fade: is video sound faded? (signal VIDEO-FADE-SOUND, picture-only by D-29z49)
  await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200);
  await X.L.seekTo(p,cs); await sleep(300); await p.evaluate(()=>window.__recStart()); await X.L.blur(p); await p.keyboard.press('Space'); await sleep(2200); await p.keyboard.press('Space'); await sleep(300);
  const fb=await p.evaluate(()=>window.__recStop());
  fd.audioInFade=R.summ(fb,(x)=>x[5]>cs+0.05&&x[5]<cs+0.95); fd.audioAfterFade=R.summ(fb,(x)=>x[5]>cs+1.05&&x[5]<cs+1.95);
  await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200);
 }
 out.fade=fd;
 // (b3) drop import onto video lane (replace): a second file via synthetic DataTransfer
 const bytes=fs.readFileSync(L.MEDIA+'clip-3s-h264-aac.mov').toString('base64');
 const dr=await p.evaluate(async(b64)=>{const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0)); const f=new File([bin],'clip-3s-h264-aac.mov',{type:'video/quicktime'}); const dt=new DataTransfer(); dt.items.add(f); const lane=document.querySelector('[data-track-id=video] [data-clip-kind=video]')?.closest('[data-track-id]')||document.querySelector('[data-track-id=video]'); const tgt=[...lane.querySelectorAll('*')].find(e=>e.getBoundingClientRect().width>300)||lane; const r=tgt.getBoundingClientRect(); const o={bubbles:true,cancelable:true,dataTransfer:dt,clientX:r.left+r.width*0.7,clientY:r.top+r.height/2}; tgt.dispatchEvent(new DragEvent('dragenter',o)); tgt.dispatchEvent(new DragEvent('dragover',o)); const ok=tgt.dispatchEvent(new DragEvent('drop',o)); return {tag:tgt.tagName,tid:tgt.dataset.testid||null,notCancelled:ok};},bytes);
 await sleep(3500); dr.status=await L.status(p); dr.st=await vstate(p); dr.titles=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-kind=video]')].map(c=>c.textContent.trim().slice(0,40)));
 dr.shot=await shot(p,'drop');
 out.drop=dr;
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);} 
 L.save(L.OUT,`Q1-${W}.json`,out); await b.close();})();
