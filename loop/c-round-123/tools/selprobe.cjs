const H=require('./h3.cjs'); const {X,L,sleep,cl,brief,byLane,dragHeader,dragEdge,laneBgPoint}=H; const fs=require('fs');
const sel=(p)=>p.evaluate(()=>{const s=window.getSelection(); return s?JSON.stringify(s.toString().slice(0,60)):null;});
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const log=R[w]=[]; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'sel-'+w,net);
 const rec=async(l)=>log.push([l,await sel(p)]);
 const desel=async()=>{const q=await laneBgPoint(p,'video',0.5); await p.mouse.click(q.x,q.y); await sleep(250);};
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',1); await L.addAt(p,'demo-stem-bass','stems',2); await L.addAt(p,'demo-soft-impact','sfx',5); await rec('setup');
 await desel(); await rec('desel');
 let m=await byLane(p,'music'); await dragHeader(p,m.id,1); await rec('move single');
 await L.selectClip(p,(await byLane(p,'stems')).id,['Control']); await rec('ctrl select');
 m=await byLane(p,'music'); await dragHeader(p,m.id,1); await rec('move multi');
 m=await byLane(p,'music'); await dragHeader(p,m.id,0,{dyLane:'sfx'}); await rec('multi drag to other lane (refused?)');
 await desel(); m=await byLane(p,'music'); await dragHeader(p,m.id,1,{escape:true}); await rec('drag + Escape');
 m=await byLane(p,'music'); await dragEdge(p,m.id,'L',0.5); await rec('trim L');
 m=await byLane(p,'music'); await X.rangeDrag(p,m.id,6,8); await rec('range drag');
 const a=await laneBgPoint(p,'sfx',12), z=await laneBgPoint(p,'music',3); await p.mouse.move(a.x,a.y); await p.mouse.down(); await p.mouse.move(z.x,z.y,{steps:10}); await p.mouse.up(); await sleep(300); await rec('marquee');
 await X.shot(p,`P3-selection-probe-${w}.png`);
 await ctx.close(); }
console.log(JSON.stringify(R,null,0)); fs.writeFileSync('../out/selprobe.json',JSON.stringify({R,net:X.netOk(net)},null,1)); await b.close();})();
