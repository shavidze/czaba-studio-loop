const fs=require('fs');const {decode}=require('./png.cjs');const F=require('./fl.cjs');
for (const f of process.argv.slice(2)){const im=decode(fs.readFileSync(f));const cx=Math.floor(im.w/2),cy=Math.floor(im.h/2);
 const out={};for(const [k,dx,dy] of [['down',0,1],['up',0,-1],['right',1,0],['left',-1,0]]){const arr=[];for(let t=80;t<im.w/2;t++){const p=im.px(cx+dx*t,cy+dy*t);arr.push(p.slice(0,3).join(','))} out[k]=arr.slice(Math.max(0,arr.length-40)).join(' | ');}
 console.log(f.split('/').pop(), im.w, im.h); for (const k in out) console.log(' ',k, out[k]);}
