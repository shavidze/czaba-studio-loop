const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const out={};
for(const [k,box] of [[1440,{x:1130,y:361.5,w:85,h:24}],[1280,{x:1050,y:271.5,w:85,h:24}]]){
 const f='data:image/png;base64,'+fs.readFileSync(`shots/tree1-${k}-showcase.png`).toString('base64');
 out[k]=await p.evaluate(async([f,box])=>{const i=await new Promise(r=>{const m=new Image();m.onload=()=>r(m);m.src=f});const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);
 const d=x.getImageData(Math.floor(box.x),Math.floor(box.y),box.w,box.h).data;const cnt={};for(let q=0;q<d.length;q+=4){const key=d[q]+','+d[q+1]+','+d[q+2];cnt[key]=(cnt[key]||0)+1}
 const e=Object.entries(cnt).sort((a,b)=>b[1]-a[1]);const bg=e[0][0].split(',').map(Number);
 // fg = pixel farthest from bg
 let far=null,fd=-1;for(const [kk] of e){const v=kk.split(',').map(Number);const dd=Math.abs(v[0]-bg[0])+Math.abs(v[1]-bg[1])+Math.abs(v[2]-bg[2]);if(dd>fd){fd=dd;far=v}}
 const L=v=>{const f=c=>{c/=255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4};return 0.2126*f(v[0])+0.7152*f(v[1])+0.0722*f(v[2])};
 const l1=L(far),l2=L(bg);return{bg,fg:far,ratio:(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05),top:e.slice(0,3)}},[f,box]);}
fs.writeFileSync('c11.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out));await b.close()})();
