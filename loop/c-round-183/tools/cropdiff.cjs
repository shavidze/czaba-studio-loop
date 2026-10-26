const { decode } = require('../../c-round-180/tools/png.cjs'); const fs=require('fs');
const [a,b]=process.argv.slice(2); const A=decode(fs.readFileSync(a)),B=decode(fs.readFileSync(b));
if(A.w!==B.w||A.h!==B.h){console.log('size',A.w,A.h,B.w,B.h);process.exit();}
let n=0,max=0;for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const p=A.px(x,y),q=B.px(x,y);const d=Math.max(Math.abs(p[0]-q[0]),Math.abs(p[1]-q[1]),Math.abs(p[2]-q[2]));if(d){n++;max=Math.max(max,d);}}
console.log(a.split('/').pop(),'changed',n,'of',A.w*A.h,'maxDelta',max);
