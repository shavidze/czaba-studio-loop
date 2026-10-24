// Q2 Loop and range. node q2.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const R=require('./rec2.cjs'); const {L,sleep}=X;
const W=+process.argv[2]||1440; const out={vp:W}; const net=[];
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q2-${n}-${W}.png`}); return `shots/Q2-${n}-${W}.png`;};
const lp=(p)=>p.evaluate(()=>{const b=[...document.querySelectorAll('[data-testid=arrangement-loop-brace]')]; const t=document.querySelector('[data-testid=arrangement-loop-times]'); const btn=[...document.querySelectorAll('button')].find(x=>/Loop/.test(x.textContent)&&x.title&&/Ctrl\/Cmd\+L/.test(x.title)); return {braces:b.length, enabled:b[0]?b[0].dataset.loopEnabled:null, label:b[0]?b[0].getAttribute('aria-label').split(' · ')[0]:null, times:t?t.textContent.replace(/\s+/g,' ').trim():null, btnPressed:btn?btn.getAttribute('aria-pressed'):null, box:b[0]?b[0].getBoundingClientRect().toJSON():null};});
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx}=await L.openStudio(b,X.VPS[W],'q2-'+W,net,{extraInit:R.recInit});
 await L.setSnapOff(p);
 await L.loadVideo(p,'beeps-6s-h264-aac.mp4');
 await L.addAt(p,'demo-stem-pad','stems',0); await L.addAt(p,'demo-soft-impact','sfx',2);
 const stems=(await L.clipsDom(p)).find(c=>c.lane==='stems').id;
 const a={};
 a.range1=await X.rangeDrag(p,stems,2,4); a.r1=await H.range(p);
 a.ctrlL1=await X.key(p,'Control+l'); a.loop1=await lp(p); a.shot1=await shot(p,'loop-2-4');
 // second range then Ctrl+L
 a.range2=await X.rangeDrag(p,stems,5,7); a.ctrlL2=await X.key(p,'Control+l'); a.loop2=await lp(p);
 a.ctrlL3=await X.key(p,'Control+l'); a.loop3=await lp(p);
 a.shot2=await shot(p,'loop-second-range');
 out.a=a;
 // (b) toggle via button without range (Escape clears? click empty lane bg)
 const bt={};
 await X.L.seekTo(p,1); // ruler click clears range? record
 bt.rangeAfterSeek=await H.range(p);
 const loopBtn=p.locator('button[title*="Ctrl/Cmd+L"]');
 await loopBtn.click(); await sleep(300); bt.off=await lp(p); bt.offStatus=await L.status(p);
 await loopBtn.click(); await sleep(300); bt.on=await lp(p); bt.onStatus=await L.status(p);
 out.b=bt;
 // Make loop 2-4 again for drags
 await X.rangeDrag(p,stems,2,4); let s=await X.key(p,'Control+l'); let st=await lp(p); if(st.enabled!=='true'){s=await X.key(p,'Control+l'); st=await lp(p);} out.reset={s,st};
 // (c) drag brace & edges snap off then on
 const g=await L.geo(p); const c={};
 const dragLocator=async(sel,dt)=>{const bb=await p.locator(sel).boundingBox(); const x=sel.includes('edge')?bb.x+bb.width/2:bb.x+bb.width*0.5, y=bb.y+bb.height/2; await p.mouse.move(x,y); await p.mouse.down(); await p.mouse.move(x+dt*g.pps/2,y,{steps:5}); await p.mouse.move(x+dt*g.pps,y,{steps:5}); await sleep(100); await p.mouse.up(); await sleep(350); return {status:await L.status(p), loop:(await lp(p)).label};};
 c.moveOff=await dragLocator('[data-testid=arrangement-loop-brace]',0.37);
 c.endOff=await dragLocator('[data-testid=arrangement-loop-end-edge]',0.41);
 c.startOff=await dragLocator('[data-testid=arrangement-loop-start-edge]',-0.23);
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); await X.L.blur(p);
 c.snap=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap);
 c.moveOn=await dragLocator('[data-testid=arrangement-loop-brace]',0.37);
 c.endOn=await dragLocator('[data-testid=arrangement-loop-end-edge]',0.41);
 c.startOn=await dragLocator('[data-testid=arrangement-loop-start-edge]',-0.23);
 c.undo=await X.key(p,'Control+z'); c.afterUndo=(await lp(p)).label;
 // (f) keyboard on focused brace
 await p.locator('[data-testid=arrangement-loop-brace]').focus(); await p.keyboard.press('ArrowRight'); await sleep(250); c.kRight=(await lp(p)).label;
 await p.keyboard.press('Shift+ArrowRight'); await sleep(250); c.kShiftRight=(await lp(p)).label;
 await p.keyboard.press('Shift+ArrowLeft'); await sleep(250); c.kShiftLeft=(await lp(p)).label;
 await p.keyboard.press('ArrowLeft'); await sleep(250); c.kLeft=(await lp(p)).label;
 await p.keyboard.press('ArrowUp'); await sleep(250); c.kUp=(await lp(p)).label; c.kUpStatus=await L.status(p);
 await p.keyboard.press('Control+ArrowUp'); await sleep(250); c.kCtrlUp=(await lp(p)).label;
 c.shot=await shot(p,'brace-after-drags');
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); await X.L.blur(p);
 out.c=c;
 // (d) wraps: set loop to exactly 2-4
 await X.rangeDrag(p,stems,2,4); s=await X.key(p,'Control+l'); st=await lp(p); if(st.label&&!/00:02.000 — 00:04.000/.test(st.label)||st.enabled!=='true'){s=await X.key(p,'Control+l'); st=await lp(p);} 
 const d={setup:st};
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(150); await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(150);
 await X.L.seekTo(p,1.5); await sleep(300); await X.L.blur(p);
 await p.evaluate(()=>window.__recStart()); await p.keyboard.press('Space'); await sleep(7600); await p.keyboard.press('Space'); await sleep(300);
 const bl=await p.evaluate(()=>window.__recStop());
 // wraps: pos decreases
 const wraps=[]; for(let i=1;i<bl.length;i++){ if(bl[i][5]!=null&&bl[i-1][5]!=null&&bl[i][5]<bl[i-1][5]-0.5) wraps.push({t:bl[i][0], from:bl[i-1][5], to:bl[i][5], vt:bl[i][6], vtNext:(bl[i+3]||[])[6], posNext:(bl[i+3]||[])[5]}); }
 // onsets: first block with peak>0.05 after silence of >=4 blocks
 const on=[]; let quiet=0; for(const x of bl){ const pk=Math.max(x[1],x[3]); if(pk>0.05&&quiet>=4){on.push({t:x[0],pos:x[5],pk});} quiet=pk>0.02?0:quiet+1; }
 d.wraps=wraps; d.onsets=on; d.onsetIntervals=on.slice(1).map((o,i)=>+(o.t-on[i].t).toFixed(4)); d.n=bl.length;
 d.posRange=[Math.min(...bl.map(x=>x[5]).filter(Number.isFinite)),Math.max(...bl.map(x=>x[5]).filter(Number.isFinite))];
 out.d=d;
 await p.click('[data-track-id=stems] button[aria-label^="Mute"]'); await sleep(150); await p.click('[data-track-id=video] button[aria-label^="Mute"]'); await sleep(150);
 // (e) range over several lanes -> Ctrl+Shift+L then loop
 const e={};
 await X.rangeDrag(p,stems,8,10); e.csl=await X.key(p,'Control+Shift+l'); e.range=await H.range(p);
 e.ctrlL=await X.key(p,'Control+l'); e.loop=await lp(p); e.shot=await shot(p,'multilane-range-loop');
 out.e=e;
 // video gap check (Live 28.2.2.1 black during gaps): seek to 7.5 (beyond video end 6)
 await X.L.seekTo(p,7.5); await sleep(500); out.gap=await p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-video-gap]'); const v=document.querySelector('video[data-video-role=active]'); return {gap:!!g, gapVisible:g?g.getBoundingClientRect().width>0&&getComputedStyle(g).display!=='none':false, gapText:g?g.textContent.trim().slice(0,80):null, vOpacity:v?getComputedStyle(v).opacity:null, vVis:v?getComputedStyle(v).visibility:null};}); out.gapShot=await shot(p,'video-gap');
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);}
 L.save(L.OUT,`Q2-${W}.json`,out); await b.close();})();
