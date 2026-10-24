const H=require('./h3.cjs'); const {X,L,sleep}=H; const fs=require('fs');
const mk=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(m=>m.getAttribute('data-marker-time')+':'+JSON.stringify(m.textContent.trim())).join(' '));
const playing=(p)=>p.evaluate(()=>!!document.querySelector('button[aria-label="Pause"]'));
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p7d-'+w,net);
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',0);
 await L.blur(p); await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(1500);
 const before=await L.posNow(p); await p.keyboard.press('m'); const after=await L.posNow(p); await sleep(250);
 r.afterM={before,after,playing:await playing(p),focus:await p.evaluate(()=>document.activeElement&&document.activeElement.dataset.testid),inputVal:await p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-marker-name-input]'); return i?i.value:null;}),pendingTime:await p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-marker-name-input]'); const box=i&&i.closest('[data-marker-time]'); return box?box.getAttribute('data-marker-time'):(i?i.getBoundingClientRect().left:null);})};
 await X.shot(p,`P7-m-during-play-norange-${w}.png`);
 await p.keyboard.press('Space'); await sleep(700);
 r.afterSpace={playing:await playing(p),pos:await L.posNow(p),inputVal:await p.evaluate(()=>{const i=document.querySelector('[data-testid=arrangement-marker-name-input]'); return i?i.value:null;})};
 await p.keyboard.press('Enter'); await sleep(400);
 r.final={m:await mk(p),playing:await playing(p),st:await L.status(p)};
 if (await playing(p)) { await L.blur(p); await p.keyboard.press('Space'); await sleep(300); r.stoppedAfterBlur=!(await playing(p)); }
 await ctx.close(); }
console.log(JSON.stringify(R,null,1)); fs.writeFileSync('../out/P7d.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
