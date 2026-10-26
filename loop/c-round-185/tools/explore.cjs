const L=require('./lib.cjs');
(async()=>{const b=await L.chromium.launch({headless:true});const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
const msgs=[];p.on('console',m=>msgs.push(m.type()+' '+m.text().slice(0,200)));
const r=await p.goto(L.BASE+'/products/middle-east',{waitUntil:'networkidle'});console.log('status',r.status());
await L.sleep(6000);console.log('url',p.url(), await p.evaluate(()=>document.readyState+' '+(!!document.body)));
console.log(await p.evaluate(()=>[...document.querySelectorAll('button,[role=button]')].map(x=>(x.getAttribute('aria-label')||'')+' | '+x.textContent.trim().slice(0,40)+' | '+(x.dataset.testid||'')).join('\n')));
console.log(await p.evaluate(()=>document.body.innerText.slice(0,1500)));
console.log(msgs.join('\n'));await b.close();})();
