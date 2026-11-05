const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const out={};
const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
(async()=>{const b=await chromium.launch();
for(const [w,h] of [[1440,900],[1280,720]]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'load'});await p.waitForTimeout(2500);
await p.evaluate(()=>{const img=[...document.images].find(i=>i.alt==='Gift Card');img.closest('.group').scrollIntoView({block:'center',behavior:'instant'});});
await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{const c=[...document.images].find(i=>i.alt==='Gift Card').closest('.group');const e=c.querySelector('p');const col=getComputedStyle(e).color;e.style.setProperty('color','transparent','important');const bb=e.getBoundingClientRect();return {col,x:bb.x,y:bb.y,width:bb.width,height:bb.height,sy:scrollY}});
await p.waitForTimeout(200);
const png=await p.screenshot({clip:{x:r.x,y:r.y,width:r.width,height:r.height}});
fs.writeFileSync(`/home/runner/czaba-project/tmp/studio-real-loop/c-round-342/shots/giftbg-p-${w}.png`,png);
// decode via a page canvas
const px=await p.evaluate(async(b64)=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let L=[9,0,0,0],H=[0,0,0,0];let lo=1e9,hi=-1;const l=(r,g,b)=>0.2126*r+0.7152*g+0.0722*b;let mn,mx;for(let i=0;i<d.length;i+=4){const v=l(d[i],d[i+1],d[i+2]);if(v<lo){lo=v;mn=[d[i],d[i+1],d[i+2]]}if(v>hi){hi=v;mx=[d[i],d[i+1],d[i+2]]}}return {mn,mx,w:c.width,h:c.height}},png.toString('base64'));
const col=r.col.match(/\d+/g).slice(0,3).map(Number);
out[w]={r,px,crDark:+cr(col,px.mn).toFixed(2),crLight:+cr(col,px.mx).toFixed(2)};await p.close();}
fs.writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-342/out/giftbg.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out));await b.close()})();
