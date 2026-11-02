// C round 188 — diff store-after non-scrolled shots vs c-round-187 (hero masked on /). Reports header-band / footer-copyright / other bboxes.
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');const out={};
for(const W of ['1440','1280','375']){const s=JSON.parse(fs.readFileSync(path.join(R,'out',`store-${W}.json`)));
 for(const pg of ['home','store','product-middle-east']) for(const suf of ['','-scrolled']){const P=s.pages[pg];
  const fa=path.join(R,'shots/store-after',`${W}-${pg}${suf}.png`),fb=path.join(R,'../c-round-187/shots/store-after',`${W}-${pg}${suf}.png`);
  const A=decode(fs.readFileSync(fa)),B=decode(fs.readFileSync(fb));const r={size:[A.w,A.h,B.w,B.h]};const h=Math.min(A.h,B.h),w=Math.min(A.w,B.w);
  const hdr=P.header.y+P.header.h, fc=P.footerCopy, hero=P.heroBox;const z=()=>({n:0,bb:[1e9,1e9,-1,-1]});const g={header:z(),footerCopy:z(),hero:z(),other:z()};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=A.px(x,y),q=B.px(x,y);if(p[0]!==q[0]||p[1]!==q[1]||p[2]!==q[2]){const X=x/2,Y=y/2;let k='other';
   if(Y<hdr)k='header';else if(fc&&Y>=fc.y-2&&Y<fc.y+fc.h+2)k='footerCopy';else if(pg==='home'&&hero&&Y>=hero.y&&Y<hero.y+hero.h)k='hero';
   const o=g[k];o.n++;o.bb=[Math.min(o.bb[0],X),Math.min(o.bb[1],Y),Math.max(o.bb[2],X),Math.max(o.bb[3],Y)];}}
  for(const k in g)if(!g[k].n)g[k].bb=null;r.regions=g;out[`${W}-${pg}${suf}`]=r;}}
fs.writeFileSync(path.join(R,'out','diff188.json'),JSON.stringify(out,null,1));for(const [k,v] of Object.entries(out))console.log(k,JSON.stringify(v));
