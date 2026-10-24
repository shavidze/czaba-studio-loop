const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p2c-'+w,net);
 for (const id of ['demo-stem-bass','demo-soft-impact','demo-middle-east']) {
 await p.locator(`[role=option][data-source-id="${id}"]`).click(); await sleep(200); await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(600);
 R[w+id]=await p.evaluate((id)=>{const o=document.querySelector(`[role=option][data-source-id="${id}"]`); const list=document.querySelector('[data-testid=arrangement-library-list]'); const sp=[...o.querySelectorAll('span')].find(s=>/ისმის/.test(s.textContent)); const lb=list.getBoundingClientRect(); const ob=o.getBoundingClientRect(); const sb=sp?sp.getBoundingClientRect():null; return {listRight:lb.right,listClientRight:lb.left+list.clientWidth,optRight:ob.right,badge:sb&&{l:sb.left,r:sb.right,t:sb.top,h:sb.height},optScrollW:o.scrollWidth,optClientW:o.clientWidth};},id);
 const ob=await p.locator(`[role=option][data-source-id="${id}"]`).boundingBox(); await p.screenshot({path:`../shots/P2-badge-${id}-${w}.png`,clip:{x:Math.max(0,ob.x-10),y:ob.y-5,width:ob.width+40,height:ob.height+10}});
 await p.click('[data-testid=arrangement-library-preview-toggle]'); await sleep(300); }
 await ctx.close(); }
console.log(JSON.stringify(R,null,0)); fs.writeFileSync('../out/P2c.json',JSON.stringify(R,null,1)); await b.close();})();
