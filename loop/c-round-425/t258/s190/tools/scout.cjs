const L=require('./lib.cjs');
(async()=>{const b=await L.chromium.launch({headless:true});const out={};
for(const [W,H] of [[1440,900],[1280,720],[375,812]]){const ctx=await b.newContext({viewport:{width:W,height:H}});await ctx.addInitScript(()=>{try{sessionStorage.setItem('czaba_entrance_seen','1')}catch{}});const p=await ctx.newPage();
await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(2500);
out[W]=await p.evaluate(()=>[...document.querySelectorAll('button[class*="audio-preview"]')].map((e,i)=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);const card=e.closest('.group');const h=card&&card.querySelector('h3,h2,h4');return{i,cls:e.className.slice(0,60),label:e.getAttribute('aria-label'),w:r.width,h:r.height,y:r.y+scrollY,vis:e.offsetParent!==null&&cs.visibility!=='hidden',op:cs.opacity,title:h&&h.textContent.trim(),href:(e.closest('a[href]')||{}).getAttribute?.('href')}}));
await ctx.close();}
console.log(JSON.stringify(out,null,1));await b.close();})();
