// Q5 Gain, volume, pan, mute, solo, meters. node q5.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const {L,sleep}=X;
const W=+process.argv[2]||1440; const out={vp:W,ex:{}}; const net=[]; const wavs={};
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q5-${n}-${W}.png`}); return `shots/Q5-${n}-${W}.png`;};
function chStats(w,t0,t1){const ch=w.fmt.ch,n=X.nf(w),sr=w.fmt.sr; const s=[0,0],pk=[0,0]; let c=0; for(let f=Math.floor(t0*sr);f<Math.floor(t1*sr);f++){for(let k=0;k<ch;k++){const a=Math.abs(w.read(f*ch+k))/n; s[k]+=a*a; if(a>pk[k])pk[k]=a;} c++;} return {L:+Math.sqrt(s[0]/c).toFixed(5),R:+Math.sqrt(s[1]/c).toFixed(5),pkL:+pk[0].toFixed(4),pkR:+pk[1].toFixed(4)};}
async function exp(p,log,tag){ const r=await X.exportWav(p,log,`Q5-${W}-${tag}`); const f=r.files.find(x=>/\.wav$/i.test(x)); if(!f) return {err:'no wav',recs:r.recs,st1:r.st1&&r.st1.status}; const w=X.wav(f); wavs[tag]=w; return {file:f.replace(/.*c-round-124\//,''), frames:w.frames, pad:chStats(w.w,4,8), sfx:chStats(w.w,1,1.5), peak:+w.peak.toFixed(4), full:X.W.stats(w.w).full}; }
const rat=(a,b,k='L')=>+(out.ex[a].pad[k]/out.ex[b].pad[k]).toFixed(4);
const vol=(p,t)=>p.locator(`input[aria-label="Volume — ${t}"]`);
const val=(loc)=>loc.evaluate(e=>({v:e.value,text:e.getAttribute('aria-valuetext')}));
const wave=(p,id)=>p.evaluate((id)=>{const s=document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"] path`); return s?s.getAttribute('d').length+':'+s.getAttribute('d').slice(0,60):null;},id);
const undoT=(p)=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||'')); return b&&b.getAttribute('title');});
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx,log}=await L.openStudio(b,X.VPS[W],'q5-'+W,net,{extraInit:X.tapInit});
 await L.setSnapOff(p);
 await L.addAt(p,'demo-stem-pad','stems',0); await L.addAt(p,'demo-soft-impact','sfx',1);
 const pad=(await L.clipsDom(p)).find(c=>c.lane==='stems').id; const sfx=(await L.clipsDom(p)).find(c=>c.lane==='sfx').id;
 const stemsNames={st:'სტემები',sfx:'SFX',mu:'მუსიკა'};
 out.ex.E0=await exp(p,log,'E0');
 // (a) clip gain -6 typed
 await L.selectClip(p,pad); await X.openDetail(p);
 const w0=await wave(p,pad);
 const field='[data-testid=arrangement-detail-clip-gain-input]';
 await p.fill(field,'-6'); await p.locator(field).press('Enter'); await sleep(400); await L.blur(p);
 out.cg={field:await p.locator(field).inputValue(), status:await L.status(p), undo:await undoT(p)}; const w1=await wave(p,pad); out.cg.waveChanged=w0!==w1;
 out.shotCG=await shot(p,'clipgain-minus6');
 out.ex.E1_clipGain=await exp(p,log,'E1-cg');
 out.ratioCG={L:rat('E1_clipGain','E0','L'),R:rat('E1_clipGain','E0','R')};
 await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(300); out.cgReset=await p.locator(field).inputValue(); await L.blur(p);
 // track volume -6 via PageDown
 const sv=vol(p,stemsNames.st); await sv.focus(); await p.keyboard.press('PageDown'); await sleep(300); await L.blur(p); await sleep(200);
 out.tv={val:await val(sv), undo:await undoT(p)}; const w2=await wave(p,pad); out.tv.waveChangedVsNoGain=w2!==w0;
 out.ex.E2_trackVol=await exp(p,log,'E2-tv');
 out.ratioTV={L:rat('E2_trackVol','E0','L'),R:rat('E2_trackVol','E0','R')};
 // Delete on focused fader (Live: return to default) with the pad clip selected
 await L.selectClip(p,pad); const n0=(await L.clipsDom(p)).length; await sv.focus(); await p.keyboard.press('Delete'); await sleep(400);
 out.delOnFader={val:await val(sv), clipsBefore:n0, clipsAfter:(await L.clipsDom(p)).length, status:await L.status(p)};
 if(out.delOnFader.clipsAfter<n0){ await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); out.delOnFader.restored=(await L.clipsDom(p)).length; }
 await L.blur(p);
 // dblclick reset
 await sv.dblclick(); await sleep(300); out.tvReset=await val(sv); await L.blur(p);
 // Shift fine drag vs normal drag on stems volume (thumb at right end)
 const sb=await sv.boundingBox(); const ty=sb.y+sb.height/2; const tx=sb.x+sb.width-6;
 const drag=async(dx,shift)=>{ await p.mouse.move(tx,ty); await p.mouse.down(); if(shift) await p.keyboard.down('Shift'); await p.mouse.move(tx+dx/2,ty,{steps:4}); await p.mouse.move(tx+dx,ty,{steps:4}); await sleep(100); await p.mouse.up(); if(shift) await p.keyboard.up('Shift'); await sleep(300); const v=await val(sv); await sv.dblclick(); await sleep(250); await L.blur(p); return v; };
 out.dragNormal20=await drag(-20,false); out.dragShift20=await drag(-20,true);
 // (b) pan hard left / right
 const pan=p.locator(`input[aria-label="Pan — ${stemsNames.st}"]`);
 await pan.focus(); await p.keyboard.press('Home'); await sleep(300); await L.blur(p); out.panL=await val(pan);
 out.ex.E3_panL=await exp(p,log,'E3-panL');
 await pan.focus(); await p.keyboard.press('End'); await sleep(300); await L.blur(p); out.panR=await val(pan);
 out.ex.E4_panR=await exp(p,log,'E4-panR'); out.shotPan=await shot(p,'pan-right');
 await pan.dblclick(); await sleep(300); out.panReset=await val(pan); await L.blur(p);
 // (c) mute / solo
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200); await L.blur(p); out.muteUndo=await undoT(p);
 out.ex.E5_muteStems=await exp(p,log,'E5-mute');
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(200);
 await p.click('[data-track-id=stems] button[aria-label^="Solo"]'); await sleep(200); await L.blur(p); out.ex.E6_soloStems=await exp(p,log,'E6-solo');
 await p.click('[data-track-id=sfx] button[aria-label^="Solo"]',{modifiers:['Control']}); await sleep(200); await L.blur(p);
 out.soloAdd=await p.evaluate(()=>['stems','sfx'].map(t=>document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed')));
 out.ex.E7_soloAdd=await exp(p,log,'E7-soloadd');
 await p.click('[data-track-id=sfx] button[aria-label^="Solo"]'); await sleep(200); await L.blur(p);
 out.soloExcl=await p.evaluate(()=>['stems','sfx'].map(t=>document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed')));
 out.ex.E8_soloExcl=await exp(p,log,'E8-soloexcl');
 await p.click('[data-track-id=sfx] button[aria-label^="Solo"]'); await sleep(200); await L.blur(p);
 out.soloOff=await p.evaluate(()=>['stems','sfx'].map(t=>document.querySelector(`[data-track-id=${t}] button[aria-label^="Solo"]`).getAttribute('aria-pressed')));
 // (d) master -6 via ArrowLeft x12, then master mute
 const mv=p.locator('input[aria-label="Master Volume"]'); await mv.focus(); for(let i=0;i<12;i++){ await p.keyboard.press('ArrowLeft'); await sleep(30);} await sleep(300); await L.blur(p);
 out.master={val:await val(mv), readout:await p.locator('[data-testid=arrangement-master-readout]').textContent(), undo:await undoT(p)};
 out.ex.E9_master=await exp(p,log,'E9-master'); out.ratioMaster={L:rat('E9_master','E0','L')};
 out.exportMasterNote=await (async()=>{ const d=await X.openDlg(p); await X.closeDlg(p); return d&&d.text.slice(0,600);})();
 await mv.dblclick(); await sleep(300); await L.blur(p); out.masterReset=await val(mv);
 // master Shift fine drag
 const mb=await mv.boundingBox(); const mx=mb.x+mb.width*(60/66), my=mb.y+mb.height/2;
 const mdrag=async(dx,shift)=>{ await p.mouse.move(mx,my); await p.mouse.down(); if(shift) await p.keyboard.down('Shift'); await p.mouse.move(mx+dx/2,my,{steps:4}); await p.mouse.move(mx+dx,my,{steps:4}); await sleep(100); await p.mouse.up(); if(shift) await p.keyboard.up('Shift'); await sleep(300); const v=await val(mv); await mv.dblclick(); await sleep(250); await L.blur(p); return v; };
 out.masterDrag10=await mdrag(-10,false); out.masterShift10=await mdrag(-10,true); out.masterShift3=await mdrag(-3,true);
 await p.click('button[aria-label="Master Mute"]'); await sleep(250); await L.blur(p); out.masterMute={pressed:await p.locator('button[aria-label="Master Mute"]').getAttribute('aria-pressed'), undo:await undoT(p)};
 out.dlgMuted=await (async()=>{ const d=await X.openDlg(p); const t=await p.evaluate(()=>{const q=(s)=>{const e=document.querySelector(`[data-testid=${s}]`); return e?e.textContent.replace(/\s+/g,' ').trim():null;}; return {mute:q('arrangement-export-master-mute'),gain:q('arrangement-export-master-gain')};}); await X.closeDlg(p); return t;})();
 out.ex.E10_masterMute=await exp(p,log,'E10-mmute');
 await p.click('button[aria-label="Master Mute"]'); await sleep(250); await L.blur(p);
 // (e) meters realtime: sfx clip gain +6 -> over indicator; sample levels while playing pad region and after stop
 await L.selectClip(p,sfx); await X.openDetail(p); await p.fill(field,'6'); await p.locator(field).press('Enter'); await sleep(300); await L.blur(p);
 out.sfxCg=await p.locator(field).inputValue();
 await X.L.seekTo(p,0.5); await L.blur(p);
 await p.evaluate(()=>window.__tapStart()); await p.keyboard.press('Space'); await sleep(2500); 
 out.metersDuring=await p.evaluate(()=>{const r={}; for(const m of document.querySelectorAll('[data-track-id] [data-testid=arrangement-track-meter]')){const k=m.closest('[data-track-id]').dataset.trackId; r[k]={lv:m.getAttribute('data-level-db'),pk:m.getAttribute('data-peak'),state:m.dataset.state,over:!!m.querySelector('[data-testid=arrangement-track-meter-over]')};} r.master={peak:(document.querySelector('[data-testid=arrangement-master-peak]')||{}).textContent, label:(document.querySelector('[data-testid=arrangement-master-peak]')||{getAttribute:()=>null}).getAttribute('aria-label')}; return r;});
 out.shotMeters=await shot(p,'meters-over');
 await p.keyboard.press('Space'); await sleep(1500);
 const S=await p.evaluate(()=>window.__tapStop()); out.outPeakDuring=+Math.max(...S.map(s=>s.peak)).toFixed(4);
 out.metersAfterStop=await p.evaluate(()=>{const r={}; for(const m of document.querySelectorAll('[data-track-id] [data-testid=arrangement-track-meter]')){const k=m.closest('[data-track-id]').dataset.trackId; r[k]={lv:m.getAttribute('data-level-db'),pk:m.getAttribute('data-peak'),state:m.dataset.state};} r.master=(document.querySelector('[data-testid=arrangement-master-peak]')||{}).textContent; return r;});
 // click master peak to clear
 await p.click('[data-testid=arrangement-master-peak]'); await sleep(300); out.masterPeakAfterClick=await p.locator('[data-testid=arrangement-master-peak]').textContent(); await L.blur(p);
 out.ex.E11_sfxOver=await exp(p,log,'E11-over');
 // (g) undo chain titles
 out.undoChain=[]; for(let i=0;i<4;i++){ out.undoChain.push(await X.key(p,'Control+z')); }
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);}
 L.save(L.OUT,`Q5-${W}.json`,out); await b.close();})();
