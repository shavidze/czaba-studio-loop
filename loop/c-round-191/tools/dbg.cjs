const {decode}=require('./png.cjs');const fs=require('fs');
const [file,jsonf,ctrl,state]=process.argv.slice(2);const J=JSON.parse(fs.readFileSync(jsonf));const r=J.controls[ctrl][state];const sb=r.stadium;const M=10;const crop={x:sb.x-M,y:sb.y-M};
const I=decode(fs.readFileSync(file));const BR=[201,164,106];const near=(c,t,d)=>Math.abs(c[0]-t[0])<=d&&Math.abs(c[1]-t[1])<=d&&Math.abs(c[2]-t[2])<=d;
function sd(xc,yc){const rr=sb.h/2,cy=sb.y+rr,ax=sb.x+rr,bx=sb.x+sb.w-rr;const qx=Math.max(ax,Math.min(bx,xc));return Math.hypot(xc-qx,yc-cy)-rr;}
const pts=[];for(let y=0;y<I.h;y++)for(let x=0;x<I.w;x++){const c=I.px(x,y);const xc=crop.x+(x+.5)/2,yc=crop.y+(y+.5)/2;const d=sd(xc,yc);if(near(c,BR,24)&&((d<=0&&Math.abs(yc-(sb.y+sb.h/2))>2.5)||d>4.5))pts.push([x,y,+d.toFixed(2),c.slice(0,3).join(',')]);}
console.log(I.w,I.h,'n',pts.length);const ys={};for(const p of pts){ys[p[1]]=(ys[p[1]]||0)+1;}console.log(JSON.stringify(ys));console.log(JSON.stringify(pts.slice(0,8)));
