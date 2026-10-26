const fs=require('fs');const path=require('path');const R=path.join(__dirname,'..','press');
const lum=(c)=>{const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]);};
const cr=(a,b)=>{const x=lum(a),y=lum(b);return +((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2);};
const LEVEL=new Set(['trackVol','groupVol','master','clipGain']);const out={press:[],look:[],panzoom:[],layout:[],fails:[]};
for(const W of [1440,1280]){const T=JSON.parse(fs.readFileSync(`${R}/tree-${W}-session/press.json`)),Hd=JSON.parse(fs.readFileSync(`${R}/head-${W}-session/press.json`));
 for(const [n,rec] of Object.entries(T.controls)){const hrec=Hd.controls[n];const rest=rec.rest;
  for(const st of ['rest','pressed','drag','released','keyboard','keyboardLow','restLow']){const v=rec[st];if(!v)continue;
   const fv=n==='pan'?v.fv:v.fv; const ringOn=v.ringBrass>0; const f=[];
   if(v.insideBrassOffTrack>0)f.push(`brass inside box off-track ${v.insideBrassOffTrack}`);
   if(v.outerBrass>0)f.push(`brass beyond ring ${v.outerBrass}`);
   if(fv!==ringOn)f.push(`ring ${ringOn} vs fv ${fv}`);
   if(ringOn){const bands=v.colBands.filter(b=>b.thick<=4);const big=v.colBands.filter(b=>b.thick>4&&!(b.y>=(v.stadium.y-0)&&false));
     if(v.ringColsFrac<0.99)f.push(`ring incomplete ${v.ringColsFrac}`);if(v.minGapRunDev==null||v.minGapRunDev<2)f.push(`gap run ${v.minGapRunDev}`);
     const outerBands=v.colBands.filter(b=>b.thick!==8);if(outerBands.some(b=>b.thick>4))f.push(`band thick ${JSON.stringify(outerBands)}`);}
   if(v.thumbOutsideStadium>0)f.push(`thumb outside ${v.thumbOutsideStadium}`);
   if(LEVEL.has(n)&&v.thumb&&rest.thumb){if(Math.abs(v.thumb.w-rest.thumb.w)>2||Math.abs(v.thumb.h-rest.thumb.h)>2)f.push(`thumb size ${v.thumb.w}x${v.thumb.h} vs ${rest.thumb.w}x${rest.thumb.h}`);if(v.thumbMean.some((c,i)=>Math.abs(c-rest.thumbMean[i])>8))f.push(`thumb colour ${v.thumbMean}`);}
   if(LEVEL.has(n)&&(v.fillEndMinusThumbCentre==null||Math.abs(v.fillEndMinusThumbCentre)>2)&&!(Number(v.fill)===1))f.push(`fill edge Δ ${v.fillEndMinusThumbCentre}`);
   const hv=hrec&&hrec[st];
   out.press.push({W,n,st,fv,value:v.value,ring:ringOn,ringCols:v.ringColsFrac,minGap:v.minGapRunDev,bands:v.colBands,thumb:v.thumb&&`${v.thumb.w}x${v.thumb.h}`,thumbMean:v.thumbMean,headThumbMean:hv&&hv.thumbMean,headFv:hv&&hv.fv,headInsideBrass:hv&&hv.insideBrassOffTrack,headOuter:hv&&hv.outerBrass,fillΔ:v.fillEndMinusThumbCentre,fails:f});
   if(f.length)out.fails.push(`${W} ${n} ${st}: ${f.join('; ')}`);}
  if(LEVEL.has(n)){for(const st of ['rest','restLow']){const v=rec[st];if(!v)continue;const P=rec.parentRef;const fill=v.besideThumbL||v.trackLeft, un=v.trackRight||v.besideThumbR;
    out.look.push({W,n,st,value:v.value,fill:v.fill,fillStartΔ:v.fillStartMinusBoxLeft,fillEndΔ:v.fillEndMinusThumbCentre,fillColour:fill,unfilled:un,parent:P,thumbHW:v.thumb&&[v.thumb.w,v.thumb.h],headThumbHW:hrec.rest.thumb&&[hrec.rest.thumb.w,hrec.rest.thumb.h],
     cr_fill_unfilled:fill&&un?cr(fill,un):null,cr_thumb_unfilled:un?cr(v.thumbMean,un):null,cr_thumb_fill:fill?cr(v.thumbMean,fill):null,cr_thumb_parent:cr(v.thumbMean,P),cr_unfilled_parent:un?cr(un,P):null,dUnfilledParent:un?Math.max(...un.map((c,i)=>Math.abs(c-P[i]))):null,cr_ring_parent:cr([201,164,106],P)});}}
  if(n==='pan'||n==='zoom'){for(const st of ['rest','pressed','drag','released','keyboard']){const v=rec[st],h=hrec[st];if(!v||!h)continue;out.panzoom.push({W,n,st,tree:{fv:v.fv,ring:v.ringBrass>0,thumbMean:v.thumbMean,thumb:v.thumb&&[v.thumb.w,v.thumb.h],val:v.value},head:{fv:h.fv,ringBrass:h.ringBrass,insideBrass:h.insideBrassOffTrack,outer:h.outerBrass,thumbMean:h.thumbMean,thumb:h.thumb&&[h.thumb.w,h.thumb.h],val:h.value}});}}
 }
 const LT=T.layout,LH=Hd.layout;for(const k of Object.keys(LH)){const a=LT[k],b=LH[k];if(!a||!b){if(a!==b)out.layout.push({W,k,miss:[!!a,!!b]});continue;}
  const isFader=/:vol$|^groupVol$|^master$|^clipGain$/.test(k);const d={dx:+(a.x-b.x).toFixed(2),dw:+(a.w-b.w).toFixed(2),dcy:+((a.y+a.h/2)-(b.y+b.h/2)).toFixed(2),dh:+(a.h-b.h).toFixed(2)};
  const bad=Math.abs(d.dx)>1||Math.abs(d.dw)>1||Math.abs(d.dcy)>1||(!isFader&&Math.abs(d.dh)>1);out.layout.push({W,k,...d,bad});if(bad)out.fails.push(`${W} layout ${k} ${JSON.stringify(d)}`);}
}
fs.writeFileSync(path.join(__dirname,'..','out','press-eval.json'),JSON.stringify(out,null,1));
console.log('FAILS',out.fails.length);out.fails.forEach(x=>console.log(' ',x));
console.log('LOOK');out.look.forEach(l=>console.log(JSON.stringify(l)));
console.log('PANZOOM');out.panzoom.forEach(l=>console.log(JSON.stringify(l)));
console.log('LAYOUT bad',out.layout.filter(l=>l.bad||l.miss).length,'of',out.layout.length);out.layout.filter(l=>l.bad||l.miss).forEach(l=>console.log(JSON.stringify(l)));
