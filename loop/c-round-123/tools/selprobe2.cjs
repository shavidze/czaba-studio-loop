const H=require('./h3.cjs'); const {X,L,sleep,cl,brief,byLane,laneBgPoint}=H; const fs=require('fs');
const sel=(p)=>p.evaluate(()=>{const s=window.getSelection(); const t=s?s.toString():''; let anc=null; try{anc=s.rangeCount?(s.getRangeAt(0).commonAncestorContainer.nodeType===1?s.getRangeAt(0).commonAncestorContainer:s.getRangeAt(0).commonAncestorContainer.parentElement):null;}catch(e){} return {len:t.length,txt:t.slice(0,80),anc:anc?(anc.closest('[data-track-id]')||{dataset:{}}).dataset.trackId||anc.tagName:null,active:document.activeElement&&(document.activeElement.getAttribute('aria-label')||document.activeElement.tagName).slice(0,40)};});
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const log=R[w]=[]; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'sel2-'+w,net);
 const rec=async(l)=>log.push([l,await sel(p),brief(await cl(p))]);
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',1); await L.addAt(p,'demo-soft-impact','sfx',5); await rec('setup (last add via SFX name click + Enter, then blur)');
 await L.blur(p); await p.keyboard.press('Control+a'); await sleep(300); await rec('Ctrl+A focus body'); await X.shot(p,`P3-ctrl-a-body-${w}.png`);
 const q=await laneBgPoint(p,'video',0.5); await p.mouse.click(q.x,q.y); await sleep(250); await rec('bg click');
 await p.click(L.nameSel('sfx')); await sleep(200); await p.keyboard.press('Control+a'); await sleep(300); await rec('Ctrl+A focus on SFX name button'); await X.shot(p,`P3-ctrl-a-namebtn-${w}.png`);
 await ctx.close(); }
console.log(JSON.stringify(R,null,1)); fs.writeFileSync('../out/selprobe2.json',JSON.stringify({R,net:X.netOk(net)},null,1)); await b.close();})();
