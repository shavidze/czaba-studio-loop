// Ring-vs-gap and ring-vs-outside per side, walking outward from the button centre: body -> gap -> ring -> outside.
// START = 22 CSS px x DSF 3: begins on the brass button body, outside the 32 px play/pause icon (button is 64 px).
const fs=require('fs');const {decode}=require('./png.cjs');const F=require('./fl.cjs');
function sides(file,START=66){const im=decode(fs.readFileSync(file));const cx=Math.floor(im.w/2),cy=Math.floor(im.h/2);const R={};
 for(const [k,dx,dy] of [['bottom',0,1],['top',0,-1],['right',1,0],['left',-1,0]]){const p=(t)=>im.px(cx+dx*t,cy+dy*t);
  let t=START;while(t<im.w/2-2&&F.isBrass(p(t)))t++; const gapStart=t; while(t<im.w/2-2&&!F.isBrass(p(t)))t++; const ringStart=t; while(t<im.w/2-2&&F.isBrass(p(t)))t++; const ringEnd=t;
  const ring=p(ringStart+1), gap=p(Math.max(gapStart+1,ringStart-2)), out=p(Math.min(ringEnd+1,im.w/2-1));
  R[k]={gapPx:ringStart-gapStart,ringPx:ringEnd-ringStart,ring:ring.slice(0,3),gap:gap.slice(0,3),out:out.slice(0,3),cGap:+F.contrast(ring,gap).toFixed(2),cOut:+F.contrast(ring,out).toFixed(2)};}
 return R;}
module.exports={sides}; if(require.main===module) for(const f of process.argv.slice(2)) console.log(f.split('/').pop(), JSON.stringify(sides(f)));
