const H=require('./h3.cjs'); const {X,L,sleep,byLane}=H; const fs=require('fs');
const mk=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(m=>m.getAttribute('data-marker-time')+':'+m.textContent.trim()).join(' '));
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const log=R[w]=[]; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p7b-'+w,net);
 const snap=async(label)=>{await sleep(600); log.push({label,pos:await L.posNow(p),m:await mk(p),st:(await L.status(p)).slice(0,90),act:await p.evaluate(()=>{const a=document.activeElement; return a?(a.dataset.testid||a.tagName)+'|'+(a.getAttribute('aria-label')||'').slice(0,30):null;})});};
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',0); await snap('added clip');
 await L.seekTo(p,3.37); await snap('seek 3.37');
 await L.blur(p); await p.keyboard.press('m'); await snap('press m');
 await p.keyboard.press('m'); await snap('press m again (same pos)');
 await L.seekTo(p,8.5); await snap('seek 8.5');
 await p.click('[data-testid=arrangement-marker-add]'); await snap('click + button');
 await L.blur(p); await L.seekTo(p,10); await snap('seek 10');
 await L.blur(p); await p.keyboard.press('KeyM'); await snap('press KeyM');
 const m=await byLane(p,'music'); await X.rangeDrag(p,m.id,11.2,12.8); await snap('range 11.2-12.8');
 await L.blur(p); await p.keyboard.press('m'); await snap('press m with range');
 await ctx.close(); }
console.log(JSON.stringify(R,null,1)); fs.writeFileSync('../out/P7b.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
