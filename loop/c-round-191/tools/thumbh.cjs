const {decode}=require('./png.cjs');const fs=require('fs');
for(const tag of ['head-1440-session','tree-1440-session','head-1280-session','tree-1280-session'])for(const n of ['trackVol','groupVol','master','clipGain','pan','zoom']){const f=`../press/${tag}/${n}-rest.png`;if(!fs.existsSync(f))continue;const I=decode(fs.readFileSync(f));
let best={h:0};for(let x=0;x<I.w;x++){let run=0,mx=0,y0=0,by=0;for(let y=0;y<I.h;y++){const c=I.px(x,y);if(Math.min(c[0],c[1],c[2])>150&&!(Math.abs(c[0]-201)<30&&Math.abs(c[2]-106)<30)){run++;if(run>mx){mx=run;by=y-run+1;}}else run=0;}if(mx>best.h)best={h:mx,x,y:by};}
let w=0;{const y=best.y+Math.floor(best.h/2);let run=0;for(let x=0;x<I.w;x++){const c=I.px(x,y);if(Math.min(c[0],c[1],c[2])>150){run++;w=Math.max(w,run);}else run=0;}}
console.log(tag.padEnd(18),n.padEnd(9),'thumb diameter (max vertical bright run, device px)',best.h,'at x',best.x);}
