const H=require('./h3.cjs'); const {X,L,sleep,cl,brief,byLane,dragHeader,dragEdge,laneBgPoint}=H; const fs=require('fs');
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p5b-'+w,net);
 const step=async(name,fn)=>{try{r[name]=await fn();}catch(e){r[name]={err:String(e).slice(0,200)};}};
 const desel=async()=>{const q=await laneBgPoint(p,'video',0.5); await p.mouse.click(q.x,q.y); await sleep(250);};
 await L.setSnapOff(p); await L.addAt(p,'demo-soft-impact','sfx',1.37); await L.addAt(p,'demo-soft-impact','music',6);
 await step('init',async()=>brief(await cl(p)));
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); await L.blur(p);
 for (const [nm,target] of [['near_end_3.45',3.45],['near_end_3.30',3.30],['near_start_1.45',1.45]]) {
  await step(nm,async()=>{await desel(); const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,target-m.start); const res={c:brief(await cl(p)),st}; await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); return res;});
 }
 await step('trimToEdge',async()=>{await desel(); const m=await byLane(p,'music'); const st=await dragEdge(p,m.id,'L',3.42-m.start); const res={c:brief(await cl(p)),st}; await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); return res;});
 await ctx.close(); }
fs.writeFileSync('../out/P5b.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(R,null,0)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
