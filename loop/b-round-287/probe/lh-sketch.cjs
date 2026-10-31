// B288 sketch: on A's dev tree, set inline line-height on the "Price unavailable" span (32px /store, 28px home) and compare card heights with free-pack / known neighbours. usage: node lh-sketch.cjs <base> <out>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const [base,outPath]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const out={};
for (const [w,h] of [[1440,900],[1280,720]]) for (const route of ['/store','/']) for (const mode of ['as-is','sketch']) {
 const ctx=await b.newContext({viewport:{width:w,height:h}});
 await ctx.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({dismissed:true,dismissedAt:Date.now()}));}catch(e){}});
 const p=await ctx.newPage();
 await p.goto(base+route,{waitUntil:'load'});await p.waitForTimeout(3000);
 for (let y=0;y<6000;y+=600){await p.mouse.wheel(0,600);await p.waitForTimeout(100);} await p.waitForTimeout(1200);
 out[`${route}@${w}:${mode}`]=await p.evaluate(({mode,route})=>{
  const spans=[...document.querySelectorAll('span')].filter(s=>s.textContent==='Price unavailable');
  if(mode==='sketch') spans.forEach(s=>{s.style.lineHeight= route==='/store'?'2rem':'1.75rem';});
  const r={unknownSpans:spans.map(s=>{const q=s.getBoundingClientRect();const cs=getComputedStyle(s);return {h:q.height,lh:cs.lineHeight,fs:cs.fontSize};})};
  for (const hd of ['priceless-pack','priceless-track','free-pack','middle-east']) {
   const a=document.querySelector(`a[href="/products/${hd}"]`); if(!a) continue;
   const art=a.closest('article')||a; const q=art.getBoundingClientRect(); const aq=a.getBoundingClientRect();
   const known=[...a.querySelectorAll('span')].find(s=>/^\$|Complimentary|Price unavailable/.test(s.textContent||''));
   const kq=known?known.getBoundingClientRect():null;
   r[hd]={linkH:+aq.height.toFixed(1),articleH:+q.height.toFixed(1),y:+(aq.y+scrollY).toFixed(1),priceText:known&&known.textContent,priceH:kq&&kq.height,priceTop:kq&&+(kq.top-aq.top).toFixed(1)};}
  return r;},{mode,route});
 await ctx.close();}
fs.writeFileSync(outPath,JSON.stringify(out,null,1));await b.close();})();
