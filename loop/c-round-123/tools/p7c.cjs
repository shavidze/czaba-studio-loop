const H=require('./h3.cjs'); const {X,L,sleep,byLane}=H; const fs=require('fs');
const mk=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(m=>m.getAttribute('data-marker-time')+':'+JSON.stringify(m.textContent.trim())).join(' '));
const playing=(p)=>p.evaluate(()=>!!document.querySelector('button[aria-label="Pause"]'));
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p7c-'+w,net);
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',0);
 // range M -> time?
 const m=await byLane(p,'music'); await X.rangeDrag(p,m.id,11.2,12.8); await L.blur(p); await p.keyboard.press('m'); await sleep(400); await p.keyboard.press('Enter'); await sleep(400); r.rangeM={m:await mk(p),st:await L.status(p)};
 // during playback
 await L.blur(p); await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(1200);
 const t0=await L.posNow(p); await p.keyboard.press('m'); await sleep(300);
 r.afterM={pos:await L.posNow(p),playing:await playing(p),focus:await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.testid),inputVal:await p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-marker-name-input]'); return i?i.value:null;})};
 await X.shot(p,`P7-m-during-play-editor-${w}.png`);
 await p.keyboard.press('Space'); await sleep(800);
 r.afterSpace={pos1:await L.posNow(p),playing:await playing(p),inputVal:await p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-marker-name-input]'); return i?i.value:null;})};
 await sleep(800); r.afterSpace.pos2=await L.posNow(p);
 r.tPressM=t0;
 await p.keyboard.press('Enter'); await sleep(400); r.afterEnter={m:await mk(p),playing:await playing(p),st:await L.status(p)};
 if (await playing(p)) { await L.blur(p); await p.keyboard.press('Space'); await sleep(300); }
 // escape case during playback
 await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(1000); await p.keyboard.press('m'); await sleep(300); await p.keyboard.press('Escape'); await sleep(400);
 r.escapeDuringPlay={m:await mk(p),playing:await playing(p),st:await L.status(p)};
 if (await playing(p)) { await L.blur(p); await p.keyboard.press('Space'); await sleep(300); }
 await ctx.close(); }
console.log(JSON.stringify(R,null,1)); fs.writeFileSync('../out/P7c.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
