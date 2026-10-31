const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const s of ['1280x720','1440x900']){
const a=fs.readFileSync(`c-round-294/shots/desk-${s}.png`).toString('base64');const c=fs.readFileSync(`b-round-291/probe/desk-5173-${s}.png`).toString('base64');
const r=await p.evaluate(async([a,c])=>{const load=(s)=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+s});const px=(img)=>{const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const x=cv.getContext('2d');x.drawImage(img,0,0);return x.getImageData(0,0,img.width,img.height).data};const [ia,ib]=await Promise.all([load(a),load(c)]);const da=px(ia),db=px(ib);const pts=[];for(let i=0;i<da.length;i+=4)if(da[i]!==db[i]||da[i+1]!==db[i+1]||da[i+2]!==db[i+2]){const k=i/4;pts.push([k%ia.width,Math.floor(k/ia.width),[da[i],da[i+1],da[i+2]],[db[i],db[i+1],db[i+2]]])}return pts},[a,c]);
console.log(s,r.length,JSON.stringify(r.slice(0,25)));}
await b.close();})();
