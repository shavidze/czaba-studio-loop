const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');const D=process.argv[2]+'/'; const V=process.argv[3]; const OUT=process.argv[4];
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.setContent('<canvas id=c></canvas>');
const out={};
for (const sec of ['product-section','studio-showcase']) for (const vp of [1440,1280]){
 const res={};
 for (const v of ['head',V,'hidden']){
  const b64=fs.readFileSync(`${D}${sec}-${vp}-${v}.png`).toString('base64');
  res[v]=await p.evaluate(async(b64)=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.getElementById('c');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
   const W=im.width,H=im.height;const pts=[];
   // grid of 5x6 patches 40x40 centred
   for(const fy of [0.08,0.2,0.35,0.5,0.65,0.8,0.92])for(const fx of [0.05,0.2,0.35,0.5,0.65,0.8,0.95]){const cx=Math.round(W*fx),cy=Math.round(H*fy);const d=x.getImageData(Math.max(0,cx-20),Math.max(0,cy-20),40,40).data;let s=0;for(let i=0;i<d.length;i+=4)s+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];pts.push([fx,fy,+(s/(d.length/4)).toFixed(2)]);}
   return {W,H,pts};},b64);
 }
 out[sec+'-'+vp]=res;
}
fs.writeFileSync(OUT,JSON.stringify(out));
for(const k in out){const r=out[k];const diffs=r.head.pts.map((p,i)=>({fx:p[0],fy:p[1],head:p[2],tree:r[V].pts[i][2],hid:r.hidden.pts[i][2]}));
 const worst=diffs.map(d=>({...d,dHT:+(d.tree-d.head).toFixed(2),glowHead:+(d.head-d.hid).toFixed(2),glowTree:+(d.tree-d.hid).toFixed(2)})).filter(d=>Math.abs(d.dHT)>=1||d.glowHead>=1);
 console.log(k,'size',r.head.W,r.head.H,'patches',diffs.length,'|tree-head|>=1 or head glow>=1:',worst.length);worst.forEach(w=>console.log(' ',JSON.stringify(w)));}
await b.close();})();
