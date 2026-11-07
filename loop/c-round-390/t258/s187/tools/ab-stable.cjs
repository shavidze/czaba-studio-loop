// From saved home A/B PNGs: count px outside the card+hero that differ with->hidden while with==control (stable), per viewport.
const fs=require('fs'),path=require('path');const {decode}=require('./png.cjs');const R=path.join(__dirname,'..');const j=JSON.parse(fs.readFileSync(path.join(R,'out/home-ab-frozen.json')));const out={};
for(const W of ['1440','1280','375']){const S=f=>decode(fs.readFileSync(path.join(R,'shots/store-after',`${W}-home-ab-${f}.png`)));const A=S('with'),B=S('hidden'),C=S('control');const c=j[W].cardCss;let real=0,rows={};
 for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const X=x/2,Y=y/2;if(X>=c.x-1&&X<=c.x+c.w+1&&Y>=c.y-1&&Y<=c.y+c.h+1)continue;const a=A.px(x,y),b=B.px(x,y),k=C.px(x,y);const eq=(u,v)=>u[0]===v[0]&&u[1]===v[1]&&u[2]===v[2];if(eq(a,k)&&!eq(a,b)){real++;const r=Math.floor(Y/100)*100;rows[r]=(rows[r]||0)+1;}}
 out[W]={stableChangedOutsideCard:real,rowsCss100:rows};}
console.log(JSON.stringify(out));fs.writeFileSync(path.join(R,'out','home-ab-stable.json'),JSON.stringify(out,null,1));
