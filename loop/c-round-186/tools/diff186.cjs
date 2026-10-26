// node diff186.cjs — round-185-method after shots vs c-round-185 store-before; reports changed px, bbox, and px outside masks.
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');
const out={};
for(const W of ['1440','1280','375']){const s=JSON.parse(fs.readFileSync(path.join(R,'out',`store-${W}-1.json`)));
 const hero=s.pages.home.heroBox, card=s.offers.boxes.card;
 for(const pg of ['home','store','product-middle-east']){
  const A=decode(fs.readFileSync(path.join(R,'shots/store-after',`${W}-${pg}.png`))),B=decode(fs.readFileSync(path.join(R,'../c-round-185/shots/store-before',`${W}-${pg}.png`)));
  const r={after:[A.w,A.h],before:[B.w,B.h]};
  const h=Math.min(A.h,B.h),w=Math.min(A.w,B.w);let n=0,outside=0,inCard=0,inHero=0;const bb=[1e9,1e9,-1,-1];const rows={};
  const inBox=(x,y,b)=>b&&x>=b.x*2&&x<(b.x+b.w)*2&&y>=b.y*2&&y<(b.y+b.h)*2;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=A.px(x,y),q=B.px(x,y);if(p[0]!==q[0]||p[1]!==q[1]||p[2]!==q[2]){n++;bb[0]=Math.min(bb[0],x);bb[1]=Math.min(bb[1],y);bb[2]=Math.max(bb[2],x);bb[3]=Math.max(bb[3],y);
   if(pg==='home'){if(inBox(x,y,hero))inHero++;else if(inBox(x,y,card))inCard++;else{outside++;const k=Math.floor(y/200)*100;rows[k]=(rows[k]||0)+1;}}}}
  Object.assign(r,{changed:n,bboxDev:n?bb:null});if(pg==='home')Object.assign(r,{heroCss:hero,cardCss:card,inHero,inCard,outsideMasks:outside,outsideByCssY100:rows});out[`${W}-${pg}`]=r;}}
fs.writeFileSync(path.join(R,'out','diff186.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));
