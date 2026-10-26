// C round 177: compare ENV-VIS vs c-round-176 env-{1440,1280}-1
const fs=require('fs');const L='/home/runner/czaba-project/tmp/studio-real-loop';const out={};
const cur={1440:'env-1440-1',1280:'env-1280-1'};const ref175={1440:'env-1440-1',1280:'env-1280-1'};
for(const W of [1440,1280]){const ref=JSON.parse(fs.readFileSync(`${L}/c-round-177/out/env/${ref175[W]}.json`));const c=JSON.parse(fs.readFileSync(`${L}/c-round-178/out/env/${cur[W]}.json`));const rows=[];
for(const k of Object.keys(ref.states)){const a=ref.states[k].sample,b=c.states[k].sample;const m={coreVsHaloMin:[a.coreVsHalo.min,b.coreVsHalo.min],below3:[a.coreVsHaloBelow3,b.coreVsHaloBelow3],hBC:[a.handleBorderVsCentre,b.handleBorderVsCentre],ab:[a.aboveBelowMax,b.aboveBelowMax]};const drops=[];const cmp=(n,x,y)=>{if(x==null||y==null)return;if(Array.isArray(x)){x.forEach((v,i)=>{if(v-y[i]>0.1)drops.push(`${n}[${i}] ${v}->${y[i]}`)})}else if(x-y>0.1)drops.push(`${n} ${x}->${y}`)};cmp('coreVsHaloMin',...m.coreVsHaloMin);cmp('hBC',...m.hBC);cmp('ab',...m.ab);const minAll=Math.min(b.coreVsHalo.min,...(b.handleBorderVsCentre||[99]),...(b.aboveBelowMax||[99]));rows.push({state:k,...m,minAll,ge3:minAll>=3,drops});}
out[W]=rows;}
fs.writeFileSync(`${L}/c-round-178/out/env-cmp.json`,JSON.stringify(out,null,1));
for(const W in out)for(const r of out[W])console.log(W,r.state,'min',r.minAll,'ge3',r.ge3,'drops',JSON.stringify(r.drops));
