const H=require('./h3.cjs'); const {X,L,sleep}=H; const fs=require('fs');
const {recInit}=require('./rec.cjs');
function clusters(blocks,thr){const out=[];let cur=null; for(const [t,pk] of blocks){ if(pk>thr){ if(!cur||t-cur.end>0.08){cur={start:t,end:t,peak:pk};out.push(cur);} else {cur.end=t; if(pk>cur.peak) cur.peak=pk;} } } return out;}
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const o=await L.openStudio(b,X.VPS[w],'p6m-'+w,net,{extraInit:[recInit,X.tapInit].map(f=>'('+f.toString()+')();').join('\n')}); const p=o.page;
 const t=p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('120'); await t.press('Enter'); await sleep(400); await L.blur(p);
 await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(300); await L.blur(p);
 r.pressed=await p.evaluate(()=>{const m=document.querySelector('[data-testid=arrangement-metronome-toggle]'); return [m.getAttribute('aria-pressed'),m.textContent.trim(),m.className.slice(0,80)];});
 r.ctxs=await p.evaluate(()=>window.__h.ctxs.map(c=>c.state));
 await p.keyboard.press('Home'); await sleep(200);
 await p.evaluate(()=>{window.__recStart(); window.__tapStart();}); await p.keyboard.press('Space'); await sleep(4300); await p.keyboard.press('Space'); await sleep(300);
 const B=await p.evaluate(()=>window.__recStop()); const T=await p.evaluate(()=>window.__tapStop());
 r.recErr=await p.evaluate(()=>window.__rec.err||null); r.nBlocks=B.length; r.maxBlock=Math.max(0,...B.map(x=>x[1])); r.tapMax=Math.max(0,...T.map(x=>x.peak)); r.tapN=T.length;
 const cs=clusters(B,0.005); r.clicks=cs.map(c=>[+(c.start-(cs[0]||{start:0}).start).toFixed(3),c.peak]).slice(0,12);
 r.ctxsAfter=await p.evaluate(()=>window.__h.ctxs.map(c=>c.state));
 await o.ctx.close(); }
console.log(JSON.stringify(R,null,0)); fs.writeFileSync('../out/P6m.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();