// C287: per-card chain of boxes from the price span up to the grid item. usage: node bbox.cjs <base> <label>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const [base,label]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();const out={};
for (const [w,h] of [[1440,900],[1280,720]]) for (const route of ['/store','/']) {
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
 await p.goto(base+route,{waitUntil:'load'});await p.waitForTimeout(3000);
 for (let y=0;y<6000;y+=600){await p.mouse.wheel(0,600);await p.waitForTimeout(120);} await p.waitForTimeout(1500);
 out[`${route}@${w}`]=await p.evaluate(()=>{const r={};
  for (const hd of ['priceless-pack','priceless-track','free-pack','middle-east','door-slams']) {
   const a=document.querySelector(`a[href="/products/${hd}"]`); if(!a) continue;
   let el=a; const chain=[];
   while(el && el!==document.body){const bb=el.getBoundingClientRect();const ps=el.parentElement?getComputedStyle(el.parentElement).display:'';
     chain.push({tag:el.tagName,cls:String(el.className).slice(0,80),w:+bb.width.toFixed(1),h:+bb.height.toFixed(1),y:+(bb.y+scrollY).toFixed(1),parentDisplay:ps});
     if(ps==='grid') break; el=el.parentElement;}
   const vis=[...a.querySelectorAll('*')].map(e=>e.getBoundingClientRect()).filter(q=>q.height>0);
   const ab=a.getBoundingClientRect();
   r[hd]={chain,linkInnerBottom:+(Math.max(...vis.map(q=>q.bottom))-ab.top).toFixed(1)};}
  return r;});
 await ctx.close();}
fs.writeFileSync(__dirname+`/probe/bbox-${label}.json`,JSON.stringify(out,null,1));await b.close();})();
