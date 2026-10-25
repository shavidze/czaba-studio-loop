const fs=require('fs');const L='/home/runner/czaba-project/tmp/studio-real-loop';
const B=JSON.parse(fs.readFileSync(L+'/b-round-166/out/v3c4a-probe.json'));
const out={};
for(const W of [1440,1280]){const r=JSON.parse(fs.readFileSync(`${L}/c-round-167/out/surf/surf-${W}-1.json`));const o=out[W]={fonts:r.fonts&&r.fonts.ok,fontBad:r.fontBad,rows:[],box:[],fields:[],rm:{},S5:r.S5};
 for(const [S,bs] of [['S0','S0-default'],['S3','S3-on']]){const st=r[S];const bb=B[W].find(x=>x.state===bs).before;
  for(const [id,m] of Object.entries(st.rest)){const ex=st.extra[id];const raw=st.raw[id];const bx=bb[id].box;const d=Math.max(...raw.map((v,i)=>Math.abs(+v.toFixed(2)-bx[i])));o.box.push({S,id,raw:raw.map(v=>+v.toFixed(2)),b:bx,maxDelta:+d.toFixed(3)});
   if(st.ha[id]){const h=st.ha[id];o.rows.push({S,id,dis:m.disabled,pressed:ex.pressed,state:ex.state,border:m.borderColor,bw:ex.bw.join('/'),radius:ex.radii.join('/'),rest:m.bgEff.slice(0,3).join(','),hover:h.hover.bgEff.slice(0,3).join(','),active:h.active.bgEff.slice(0,3).join(','),hit:h.hit,afterPressed:h.afterRelease.pressed,afterState:h.afterRelease.state,tp:ex.tp,td:ex.td,tf:ex.tf,cRest:m.contrast,cHover:h.hover.contrast,cActive:h.active.contrast});}
   else o.fields.push({S,id,radius:ex.radii.join('/'),border:m.borderColor,bw:ex.bw.join('/'),c:m.contrast,refBorder:bb[id].borderColor});}}
 o.rm={matches:r.reducedMotion.matches,S0:Object.fromEntries(Object.entries(r.reducedMotion.S0).map(([k,v])=>[k,v.tp])),S3:Object.fromEntries(Object.entries(r.reducedMotion.S3).map(([k,v])=>[k,v.tp+'|'+v.pressed]))};
 o.crops=r.crops;o.cropBoxEqual=Object.entries(r.cropRawS0).every(([k,v])=>v.every((x,i)=>Math.abs(x-r.S0.raw[k][i])<0.01));
 o.net=r.net;}
fs.writeFileSync(L+'/c-round-167/out/surf-analysis.json',JSON.stringify(out,null,1));
for(const W of [1440,1280]){const o=out[W];console.log('==',W,'fonts',o.fonts,o.fontBad,'cropBoxEqual',o.cropBoxEqual);
 for(const x of o.rows)console.log(x.S,x.id.padEnd(28),'dis',x.dis,'pr',x.pressed,x.state||'','b',x.border,x.bw,'r',x.radius,'rest',x.rest,'hov',x.hover,'act',x.active,'hit',x.hit,'after',x.afterPressed,x.afterState||'','|',x.tp,x.td,x.tf,'| c',x.cRest,x.cHover,x.cActive);
 for(const x of o.fields)console.log(x.S,x.id.padEnd(28),'r',x.radius,'b',x.border,'ref',x.refBorder,x.bw,'c',x.c);
 console.log('box max',Math.max(...o.box.map(b=>b.maxDelta)),JSON.stringify(o.box.filter(b=>b.maxDelta>0.005)));
 console.log('rm',JSON.stringify(o.rm));console.log('S5',JSON.stringify(o.S5));}
