const L=require('./lib.cjs');
(async()=>{const b=await L.chromium.launch({headless:true,args:['--disable-lcd-text']});const out={};
for(const js of [false,true]){const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,javaScriptEnabled:js});const p=await ctx.newPage();
await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(1000);const btn=p.locator('button[class*="audio-preview"]').nth(1);await btn.scrollIntoViewIfNeeded();await L.sleep(1500);
const bx=await btn.boundingBox();const tr=[];for(const w of [0,300,800,1500,3000]){if(w===0)await p.mouse.move(bx.x+bx.width/2,bx.y+bx.height/2);else await L.sleep(w);tr.push(await btn.evaluate((el,w)=>{const r=el.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{w,hover:el.matches(':hover'),tf:getComputedStyle(el).transform,rw:+r.width.toFixed(2),ow:el.offsetWidth,parentOp:getComputedStyle(el.parentElement).opacity,top:e&&(e.closest('button')===el?'self':e.tagName+'.'+String(e.className).slice(0,60))};},w));}
out[js?'js':'nojs']={bx,tr};await ctx.close();}
console.log(JSON.stringify(out,null,1));await b.close();})();
