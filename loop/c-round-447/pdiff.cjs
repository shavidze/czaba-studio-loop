const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const out={};
for(const n of ['home-full','store-full','product-full'])for(const k of [1440,1280,375]){
 const A='data:image/png;base64,'+fs.readFileSync(`shots/tree-${n}-${k}.png`).toString('base64');
 const B='data:image/png;base64,'+fs.readFileSync(`shots/head-${n}-${k}.png`).toString('base64');
 out[n+k]=await p.evaluate(async([A,B])=>{const L=s=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=s});const a=await L(A),b=await L(B);
 if(a.width!==b.width||a.height!==b.height)return{size:[a.width,a.height,b.width,b.height]};
 const g=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);return x.getImageData(0,0,i.width,i.height).data};
 const d1=g(a),d2=g(b);let minY=1e9,maxY=-1,n=0;for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++){const o=(y*a.width+x)*4;if(Math.abs(d1[o]-d2[o])+Math.abs(d1[o+1]-d2[o+1])+Math.abs(d1[o+2]-d2[o+2])>60){n++;if(y<minY)minY=y;if(y>maxY)maxY=y}}
 return{h:a.height,px:n,minY,maxY}},[A,B]);}
fs.writeFileSync('pdiff.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out));await b.close()})();
