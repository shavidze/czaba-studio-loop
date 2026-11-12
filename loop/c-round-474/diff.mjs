import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const b=await chromium.launch(); const p=await b.newPage(); const res={};
for (const w of [1440,1280]) for (const n of ['home','store','product','studio-lab']) {
  const A=fs.readFileSync(`tree-${w}-${n}.png`).toString('base64'),B=fs.readFileSync(`head-${w}-${n}.png`).toString('base64');
  res[`${w}-${n}`]=await p.evaluate(async([A,B])=>{const L=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s;});
   const [a,b]=await Promise.all([L(A),L(B)]); if(a.width!==b.width||a.height!==b.height)return 'size';
   const g=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data;};
   const da=g(a),db=g(b);let n=0,minx=1e9,miny=1e9,maxx=-1,maxy=-1;for(let k=0;k<da.length;k+=4){if(Math.abs(da[k]-db[k])>8||Math.abs(da[k+1]-db[k+1])>8||Math.abs(da[k+2]-db[k+2])>8){n++;const q=k/4,x=q%a.width,y=(q/a.width)|0;minx=Math.min(minx,x);maxx=Math.max(maxx,x);miny=Math.min(miny,y);maxy=Math.max(maxy,y);}}
   return {diffpx:n,bbox:n?[minx,miny,maxx,maxy]:null};},[A,B]);
}
await b.close(); console.log(JSON.stringify(res)); fs.writeFileSync('pixeldiff.json',JSON.stringify(res,null,1));
