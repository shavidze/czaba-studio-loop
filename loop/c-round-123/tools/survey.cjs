const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
(async()=>{ const b=await L.launch(); const net=[]; const out={};
for (const w of [1440,1280]) { const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'survey'+w,net);
 await X.shot(p,`P1-fresh-${w}.png`);
 out[w]=await p.evaluate(()=>{ const r=[...document.querySelectorAll('[data-testid]')].map(e=>{const b=e.getBoundingClientRect(); return {id:e.dataset.testid, x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height), vis: b.width>0&&b.height>0};}); const seen=new Set(); return r.filter(x=>{if(seen.has(x.id))return false; seen.add(x.id); return true;});});
 out[w+'buttons']=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.getAttribute('aria-label')||b.textContent.trim()).slice(0,50)+(b.title?' |'+b.title.slice(0,80):'')));
 out[w+'text']=await p.evaluate(()=>document.body.innerText.slice(0,3000));
 await ctx.close(); }
fs.writeFileSync('../out/survey.json',JSON.stringify({out,net},null,1)); await b.close();})();
