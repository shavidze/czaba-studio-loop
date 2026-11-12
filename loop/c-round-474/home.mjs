import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const b=await chromium.launch(); const res={}; const shots={};
for (const w of [1440,1280]) { const h=w==1440?900:720;
 for (const [tag,base] of [['t1','http://127.0.0.1:5173'],['h1','http://127.0.0.1:5180'],['t2','http://127.0.0.1:5173'],['h2','http://127.0.0.1:5180']]) {
  const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'}); const p=await ctx.newPage();
  await p.goto(base+'/',{waitUntil:'load'}); await p.waitForTimeout(9000);
  shots[`${w}-${tag}`]=(await p.screenshot()).toString('base64'); await p.screenshot({path:`home-${w}-${tag}.png`}); await ctx.close(); }
}
const p=await b.newPage();
const cmp=async(A,B)=>p.evaluate(async([A,B])=>{const L=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s;});const [a,b]=await Promise.all([L(A),L(B)]);const g=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data;};const da=g(a),db=g(b);let n=0,mnx=1e9,mny=1e9,mxx=-1,mxy=-1;for(let k=0;k<da.length;k+=4){if(Math.abs(da[k]-db[k])>8||Math.abs(da[k+1]-db[k+1])>8||Math.abs(da[k+2]-db[k+2])>8){n++;const q=k/4,x=q%a.width,y=(q/a.width)|0;mnx=Math.min(mnx,x);mxx=Math.max(mxx,x);mny=Math.min(mny,y);mxy=Math.max(mxy,y);}}return {n,bbox:n?[mnx,mny,mxx,mxy]:null};},[A,B]);
for (const w of [1440,1280]) { res[w]={'t1-vs-t2 (control)':await cmp(shots[`${w}-t1`],shots[`${w}-t2`]),'h1-vs-h2 (control)':await cmp(shots[`${w}-h1`],shots[`${w}-h2`]),'t1-vs-h1':await cmp(shots[`${w}-t1`],shots[`${w}-h1`]),'t2-vs-h2':await cmp(shots[`${w}-t2`],shots[`${w}-h2`])}; }
await b.close(); console.log(JSON.stringify(res,null,1)); fs.writeFileSync('home-compare.json',JSON.stringify(res,null,1));
