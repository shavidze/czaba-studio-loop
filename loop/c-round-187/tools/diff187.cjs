// Diff c-round-187 store-after shots vs c-round-186 store-after (both methods). Home: hero masked.
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');const out={};
for(const W of ['1440','1280','375']){const s=JSON.parse(fs.readFileSync(path.join(R,'out',`store-${W}-1.json`)));const hero=s.pages.home.heroBox;
 for(const pg of ['home','store','product-middle-east','product-door-slams','product-harbour-lights','product-archived']) for(const suf of ['','-scrolled']){
  const fa=path.join(R,'shots/store-after',`${W}-${pg}${suf}.png`),fb=path.join(R,'../c-round-186/shots/store-after',`${W}-${pg}${suf}.png`);if(!fs.existsSync(fb))continue;
  const A=decode(fs.readFileSync(fa)),B=decode(fs.readFileSync(fb));const r={size:[A.w,A.h,B.w,B.h]};const h=Math.min(A.h,B.h),w=Math.min(A.w,B.w);let n=0,inHero=0;const bb=[1e9,1e9,-1,-1];const rows={};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=A.px(x,y),q=B.px(x,y);if(p[0]!==q[0]||p[1]!==q[1]||p[2]!==q[2]){const Y=y/2;if(pg==='home'&&Y>=hero.y&&Y<hero.y+hero.h){inHero++;continue;}n++;bb[0]=Math.min(bb[0],x/2);bb[1]=Math.min(bb[1],Y);bb[2]=Math.max(bb[2],x/2);bb[3]=Math.max(bb[3],Y);const k=Math.floor(Y/100)*100;rows[k]=(rows[k]||0)+1;}}
  Object.assign(r,{changedOutsideHero:n,inHero,bboxCss:n?bb:null,rowsCss100:n?rows:undefined});out[`${W}-${pg}${suf}`]=r;}}
fs.writeFileSync(path.join(R,'out','diff187.json'),JSON.stringify(out,null,1));for(const [k,v] of Object.entries(out))console.log(k,JSON.stringify(v));
