const L=require('./lib.cjs');
(async()=>{const b=await L.chromium.launch({headless:true});const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto(L.BASE+'/',{waitUntil:'load'});await L.sleep(1000);const btn=p.locator('button[class*="audio-preview"]').nth(1);await btn.scrollIntoViewIfNeeded();await L.sleep(300);
const out=[];for(let i=0;i<8;i++){out.push(await btn.evaluate((el)=>{const r=el.getBoundingClientRect();const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);if(!e||e.closest('button')===el)return{self:true,t:performance.now()|0};const chain=[];let c=e;for(let k=0;k<5&&c;k++){chain.push(c.tagName+'.'+String(c.className).slice(0,80));c=c.parentElement;}return{t:performance.now()|0,html:e.outerHTML.slice(0,300),chain,cs:{pos:getComputedStyle(e).position,op:getComputedStyle(e).opacity,tf:getComputedStyle(e).transform}};}));await L.sleep(500);}
console.log(JSON.stringify(out,null,1));await b.close();})();
