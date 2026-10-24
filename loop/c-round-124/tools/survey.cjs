const X=require('./lib122.cjs'); const {L,sleep}=X;
(async()=>{const b=await L.launch(); const net=[];
for (const w of [1440,1280]) {
 const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'survey'+w,net);
 const info=await p.evaluate(()=>({btns:[...document.querySelectorAll('button')].filter(x=>x.offsetParent).map(x=>(x.getAttribute('aria-label')||x.textContent.trim()).slice(0,50)+(x.title?' |t:'+x.title.slice(0,60):'')),
  inputs:[...document.querySelectorAll('input,[role=slider]')].filter(x=>x.offsetParent).map(x=>`${x.tagName}:${x.type||''}:${x.dataset.testid||''}:${x.getAttribute('aria-label')||''}:${x.value||x.getAttribute('aria-valuenow')||''}`),
  tracks:[...document.querySelectorAll('[data-track-id]')].map(x=>x.dataset.trackId).filter((v,i,a)=>a.indexOf(v)===i),
  sources:[...document.querySelectorAll('[role=option][data-source-id]')].map(x=>x.dataset.sourceId+':'+x.textContent.trim().slice(0,40))}));
 await p.screenshot({path:L.SHOTS+'/survey-'+w+'.png'});
 L.save(L.OUT,'survey-'+w+'.json',info); await ctx.close();}
L.save(L.OUT,'survey-net.json',X.netOk(net)); await b.close();})();
