const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const BASE='http://127.0.0.1:5173'; const SH=path.join(__dirname,'shots'); const OUT=path.join(__dirname,'..','out');
const VIDEO='/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const wavInfo=(buf)=>{const fmt={ch:buf.readUInt16LE(22),rate:buf.readUInt32LE(24),bits:buf.readUInt16LE(34)};let o=12,dl=0;while(o<buf.length-8){const id=buf.toString('ascii',o,o+4);const len=buf.readUInt32LE(o+4);if(id==='data'){dl=len;break;}o+=8+len;}const st=fmt.bits/8;const frames=dl/(fmt.ch*st);let peak=0,nz=0,n=0,ss=0,nan=0,runMax=0,run=0;const chunk=Math.floor(fmt.rate/10);let sil=0,tot=0;for(let f=0;f<frames;f+=chunk){let m=0;for(let k=f;k<Math.min(frames,f+chunk);k+=11){const i=o+8+k*fmt.ch*st;let v=fmt.bits===16?buf.readInt16LE(i)/32768:fmt.bits===32?buf.readFloatLE(i):buf.readIntLE(i,3)/8388608;if(Number.isNaN(v)){nan++;continue;}const a=Math.abs(v);m=Math.max(m,a);if(a>peak)peak=a;n++;ss+=v*v;}tot++;if(m<1e-5)sil++;}
return {fmt,frames,durationS:frames/fmt.rate,peak,rmsDb:10*Math.log10(ss/n),nan,silentTenths:sil,totalTenths:tot,bytes:buf.length,sha256:crypto.createHash('sha256').update(buf).digest('hex')};};
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const res={at:new Date().toISOString(),vp:{}};
for(const [w,h] of [[1440,900],[1280,720]]){const k=`${w}x${h}`;const R=res.vp[k]={};
 const ctx=await b.newContext({viewport:{width:w,height:h},acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
 await p.goto(BASE+'/studio-lab');await p.waitForFunction(()=>/^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:120000});await sleep(600);
 await p.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());
 await p.keyboard.press('Enter');await sleep(1200);
 R.clips=await p.locator('[data-clip-kind="audio"]').count();
 // video
 const fi=p.locator('input[type=file]');R.fileInputs=await fi.count();
 if(R.fileInputs){await fi.first().setInputFiles(VIDEO);await sleep(3000);R.videoClips=await p.locator('[data-clip-kind="video"]').count();}
 R.status=await p.getByTestId('arrangement-status').textContent();
 await p.screenshot({path:path.join(SH,`exp-added-${k}.png`)});
 // play with cross-lane drag while playing
 await p.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());
 await p.keyboard.press('Space');await sleep(1500);
 const clip=p.locator('[data-clip-kind="audio"]').first();const bb=await clip.boundingBox();R.clipBox=bb;
 const lanes=await p.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.getAttribute('data-track-id'),y:r.y,h:r.height,x:r.x,w:r.width};}));R.lanes=lanes.slice(0,6);
 const music=lanes.find(l=>l.id==='music'),stems=lanes.find(l=>l.id==='stems');
 if(music&&stems){const sx=Math.max(bb.x+30,Math.min(bb.x+bb.width-30,600)),sy=bb.y+8;
  await p.mouse.move(sx,sy);await p.mouse.down();await p.mouse.move(sx+10,sy+10,{steps:3});
  await p.mouse.move(sx+10,stems.y+stems.h/2,{steps:8});await sleep(300);
  R.ghostsDuring=await p.locator('[data-testid*="ghost"],[data-ghost]').count();
  R.playingDuring=await p.evaluate(()=>document.querySelector('[data-playing]')?.getAttribute('data-playing'));
  await p.mouse.move(sx+10,music.y+music.h/2,{steps:5});await p.mouse.move(sx+10,stems.y+stems.h/2,{steps:5});await p.mouse.up();await sleep(600);
  R.trackAfter=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-kind="audio"]')].map(c=>c.closest('[data-track-id]')?.getAttribute('data-track-id')));
  R.playingAfter=await p.evaluate(()=>document.querySelector('[data-playing]')?.getAttribute('data-playing'));
  R.undo=await p.evaluate(()=>[...document.querySelectorAll('button[aria-label^="Undo"],button[title^="Undo"]')].map(e=>e.getAttribute('aria-label')||e.title)[0]);}
 await p.screenshot({path:path.join(SH,`exp-playing-${k}.png`)});
 await p.evaluate(()=>document.activeElement instanceof HTMLElement&&document.activeElement.blur());
 await p.keyboard.press('Space');await sleep(400);
 await p.getByRole('button',{name:'Export',exact:true}).first().click();const dlg=p.getByRole('dialog');await dlg.waitFor();
 await p.screenshot({path:path.join(SH,`exp-dialog-${k}.png`)});
 R.dialogText=(await dlg.innerText()).slice(0,500);
 const dlP=p.waitForEvent('download',{timeout:240000});await dlg.getByRole('button',{name:'Export WAV',exact:true}).click();const dl=await dlP;
 const f=`/tmp/c340-${k}.wav`;await dl.saveAs(f);R.wav={name:dl.suggestedFilename(),...wavInfo(fs.readFileSync(f))};fs.unlinkSync(f);
 R.errors=errs;fs.writeFileSync(path.join(OUT,'exp340.json'),JSON.stringify(res,null,1));await ctx.close();}
await b.close();console.log('ok');})().catch(e=>{console.log('ERR',e);process.exit(1);});
