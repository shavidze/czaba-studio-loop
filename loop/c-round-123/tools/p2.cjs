const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
const opts=(p)=>p.evaluate(()=>[...document.querySelectorAll('[role=option][data-source-id]')].filter(o=>o.getBoundingClientRect().height>0).map(o=>o.dataset.sourceId));
const act=(p)=>p.evaluate(()=>{const a=document.activeElement; return a?(a.dataset.sourceId||a.dataset.testid||a.tagName)+'|sel='+a.getAttribute('aria-selected'):null;});
const selOpt=(p)=>p.evaluate(()=>[...document.querySelectorAll('[role=option][aria-selected=true]')].map(o=>o.dataset.sourceId));
const prevInfo=(p)=>p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-library-preview]'); const t=document.querySelector('[data-testid=arrangement-library-preview-toggle]'); const ph=document.querySelector('[data-testid=arrangement-library-playhead]'); return {text:e?e.textContent.replace(/\s+/g,' ').slice(0,160):null,toggle:t?t.textContent.trim()+'|'+t.getAttribute('aria-pressed'):null,ph:ph?ph.textContent.trim():null};});
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p2-'+w,net,{extraInit:X.tapInit});
 r.all=await opts(p);
 const s=p.locator('[data-testid=arrangement-library-search]');
 for (const q of ['soft impact','impact soft','soft rise','ღამის ბასი','ბასი ღამის','middle']) { await s.fill(q); await sleep(400); r['q:'+q]=await opts(p); }
 if (w===1440) await X.shot(p,'P2-search-two-words-1440.png');
 await s.fill('ღამის'); await sleep(400); r.qNight=await opts(p);
 await s.focus(); await p.keyboard.press('ArrowDown'); await sleep(200); r.afterDown1=await act(p); r.sel1=await selOpt(p);
 await p.keyboard.press('ArrowDown'); await sleep(200); r.afterDown2=await act(p); r.sel2=await selOpt(p); r.prev2=await prevInfo(p);
 await p.keyboard.press('ArrowUp'); await sleep(200); r.afterUp=await act(p);
 await p.keyboard.press('Escape'); await sleep(300); r.afterEsc={act:await act(p),q:await s.inputValue(),n:(await opts(p)).length};
 await s.fill(''); await sleep(300);
 // Ctrl+F
 await L.blur(p); await p.keyboard.press('Control+f'); await sleep(300); r.ctrlF=await act(p);
 await L.blur(p);
 // preview
 const o=p.locator('[role=option][data-source-id="demo-synth-mix"]'); await o.click(); await sleep(400); r.clickSel=await selOpt(p); r.prevAfterClick=await prevInfo(p);
 await p.evaluate(()=>window.__tapStart());
 await sleep(800); const quiet=(await p.evaluate(()=>window.__tapStop())).map(x=>x.peak); r.peakIdle=Math.max(0,...quiet);
 await p.evaluate(()=>window.__tapStart()); await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(1500);
 r.prevPlaying=await prevInfo(p);
 const S1=await p.evaluate(()=>window.__tapStop()); r.peakPreview=Math.max(0,...S1.map(x=>x.peak));
 // switch selection while previewing: click another option
 await p.evaluate(()=>window.__tapStart()); await p.locator('[role=option][data-source-id="demo-stem-bass"]').click().catch(()=>{}); await sleep(1200);
 r.prevAfterSwitch=await prevInfo(p); const S2=await p.evaluate(()=>window.__tapStop()); r.peakAfterSwitch=Math.max(0,...S2.slice(-20).map(x=>x.peak));
 // scrub the preview waveform at 50%
 const wv=await p.locator('[data-testid=arrangement-library-preview-wave]').boundingBox(); await p.mouse.click(wv.x+wv.width*0.5,wv.y+wv.height/2); await sleep(500); r.prevAfterScrub=await prevInfo(p);
 await X.shot(p,`P2-preview-playing-${w}.png`);
 // stop
 await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(800); r.prevStopped=await prevInfo(p);
 await p.evaluate(()=>window.__tapStart()); await sleep(1000); const S3=await p.evaluate(()=>window.__tapStop()); r.peakAfterStop=Math.max(0,...S3.slice(-20).map(x=>x.peak));
 // ArrowDown when preview playing: does preview follow selection?
 await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(600);
 await p.locator('[role=option][data-source-id="demo-stem-bass"]').focus(); await p.keyboard.press('ArrowDown'); await sleep(900); r.prevArrowFollow={act:await act(p),prev:await prevInfo(p)};
 await p.click('[data-testid=arrangement-library-preview-toggle]').catch(()=>{}); await sleep(400);
 r.ids=await p.evaluate(()=>[...document.querySelectorAll('[role=option][data-source-id]')].map(o=>o.dataset.sourceId));
 await ctx.close(); }
fs.writeFileSync('../out/P2a.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(R,null,0)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
