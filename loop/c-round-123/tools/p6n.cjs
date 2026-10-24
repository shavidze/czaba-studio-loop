const H=require('./h3.cjs'); const {X,L,sleep}=H; const fs=require('fs'); const {recInit}=require('./rec.cjs');
function clusters(blocks,thr){const out=[];let cur=null; for(const [t,pk] of blocks){ if(pk>thr){ if(!cur||t-cur.end>0.06){cur={start:t,end:t,peak:pk};out.push(cur);} else {cur.end=t; if(pk>cur.peak) cur.peak=pk;} } } return out;}
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const o=await L.openStudio(b,X.VPS[w],'p6n-'+w,net,{extraInit:recInit}); const p=o.page;
 const t=p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('120'); await t.press('Enter'); await sleep(400); await L.blur(p);
 await p.click('[data-testid=arrangement-metronome-toggle]'); await sleep(300); await L.blur(p);
 // empty project: does transport run?
 await p.keyboard.press('Space'); await sleep(1200); r.emptyPlay={pos:await L.posNow(p),st:await L.status(p),pause:await p.evaluate(()=>!!document.querySelector('button[aria-label="Pause"]')),ctxs:await p.evaluate(()=>window.__h.ctxs.length)}; await p.keyboard.press('Space'); await sleep(300); await p.keyboard.press('Home'); await sleep(200);
 await X.shot(p,`P6-empty-play-metronome-${w}.png`);
 // clip at 6 s; metronome alone in 0..6
 await L.setSnapOff(p); await L.addAt(p,'demo-soft-impact','sfx',6); await L.blur(p); await p.keyboard.press('Home'); await sleep(200);
 await p.evaluate(()=>window.__recStart()); await p.keyboard.press('Space'); await sleep(4400); await p.keyboard.press('Space'); await sleep(300);
 const B=await p.evaluate(()=>window.__recStop()); const cs=clusters(B,0.003); r.n=cs.length; r.maxBlock=Math.max(0,...B.map(x=>x[1]));
 r.clicks=cs.map(c=>[+(c.start-(cs[0]||{start:0}).start).toFixed(3),c.peak]).slice(0,10);
 await o.ctx.close(); }
console.log(JSON.stringify(R,null,0)); fs.writeFileSync('../out/P6n.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
