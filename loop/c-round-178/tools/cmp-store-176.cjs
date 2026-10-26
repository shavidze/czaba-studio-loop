// C round 175 RV3-STORE: tokens vs b-round-148 storebase149.json; pixels vs c-round-174 storebase shots
const fs=require('fs');const {decode}=require('./png.cjs');const L='/home/runner/czaba-project/tmp/studio-real-loop';
const ref=JSON.parse(fs.readFileSync(L+'/b-round-148/out/storebase149.json'));const cur=JSON.parse(fs.readFileSync(L+'/c-round-176/out/storebase176.json'));const out={};
for(const k of ['/@1440','/cart@1440','/@1280','/cart@1280']){const a=ref.pages[k],b=cur.pages[k];const tokDiff=Object.keys(a.root).filter(t=>a.root[t]!==b.root[t]||a.body[t]!==b.body[t]);
const n=k.startsWith('/@')?'home':'cart';const w=k.split('@')[1];let px=null;try{const A=decode(fs.readFileSync(`${L}/c-round-175/shots/storebase175-${n}-${w}.png`)),B=decode(fs.readFileSync(`${L}/c-round-176/shots/storebase176-${n}-${w}.png`));let d=0,minx=1e9,miny=1e9,maxx=-1,maxy=-1;for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const p=A.px(x,y),q=B.px(x,y);if(p[0]!==q[0]||p[1]!==q[1]||p[2]!==q[2]){d++;minx=Math.min(minx,x);miny=Math.min(miny,y);maxx=Math.max(maxx,x);maxy=Math.max(maxy,y);}}px={diff:d,pct:+(100*d/(A.w*A.h)).toFixed(3),bbox:d?[minx,miny,maxx,maxy]:null};}catch(e){px=String(e)}
out[k]={status:b.status,errors:b.errors,tokDiff,bodyBg:[a.bodyBg,b.bodyBg],px};}
fs.writeFileSync(L+'/c-round-176/out/rv3-store.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,0));
