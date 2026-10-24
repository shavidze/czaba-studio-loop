const X=require('./lib122.cjs'); const {L,sleep}=X; const net=[]; const out={};
(async()=>{const b=await L.launch(); const {page:p,ctx}=await L.openStudio(b,X.VPS[1440],'q6key',net);
 await L.addAt(p,'demo-soft-impact','sfx',1); let nav=0; p.on('framenavigated',()=>nav++);
 await L.blur(p); await p.keyboard.press('Control+Shift+r'); await sleep(2500);
 out.navigations=nav; out.dialogOpen=await p.evaluate(()=>!!document.querySelector('#arrangement-export-title')).catch(e=>'eval-failed '+e); out.clips=await p.evaluate(()=>document.querySelectorAll('[data-clip-id]').length).catch(()=>null); out.status=await L.status(p).catch(()=>null);
 L.save(L.OUT,'Q6-ctrlshiftr.json',out); await ctx.close(); await b.close();})();
