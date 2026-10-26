// Masked diff of /products/middle-east: mask = fixed player bar band (bottom 100 CSS px of the first viewport) + play-button disc box; then list leftover clusters.
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');const VH={1440:900,1280:720,375:812};const out={};
for(const W of ['1440','1280','375']){const A=decode(fs.readFileSync(path.join(R,'shots/store-after',`${W}-product-middle-east.png`))),B=decode(fs.readFileSync(path.join(R,'../c-round-185/shots/store-before',`${W}-product-middle-east.png`)));
 const band=[(VH[W]-100)*2,VH[W]*2];const cells={};let n=0,inBand=0;
 for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const p=A.px(x,y),q=B.px(x,y);if(p[0]!==q[0]||p[1]!==q[1]||p[2]!==q[2]){n++;if(y>=band[0]&&y<band[1]){inBand++;continue;}const k=`${Math.floor(x/80)*40},${Math.floor(y/80)*40}`;cells[k]=(cells[k]||0)+1;}}
 const ks=Object.keys(cells).map(k=>k.split(',').map(Number));const bb=ks.length?[Math.min(...ks.map(k=>k[0])),Math.min(...ks.map(k=>k[1])),Math.max(...ks.map(k=>k[0]))+40,Math.max(...ks.map(k=>k[1]))+40]:null;
 out[W]={changed:n,inPlayerBand:inBand,outsideBand:n-inBand,outsideBboxCss:bb,cells40css:Object.keys(cells).length};}
fs.writeFileSync(path.join(R,'out','diff186-product.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out));
