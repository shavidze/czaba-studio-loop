const fs=require('fs');const path=require('path');const B=path.join(__dirname,'..','out','focus');const out={};
for (const W of [1280,1440]) for (const S of ['rich','default']) {
 const t=require(`${B}/tree-${W}-${S}/result.json`), r=require(`${B}/ref-${W}-${S}/result.json`);
 const sig=(a)=>a.map(x=>`${x.id}|${x.tag}|${x.label}|${Math.round(x.box?x.box.x:-1)}`);
 const fT=sig(t.rows),fR=sig(r.rows),bT=sig(t.back),bR=sig(r.back);
 const eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const stT=t.rows.map(x=>x.g&&x.g.st), stR=r.rows.map(x=>x.g&&x.g.st);
 const stDiff=stT.map((v,i)=>v!==stR[i]?`${i}:${stR[i]}->${v}`:null).filter(Boolean);
 const ringStyle=(a)=>a.filter(x=>x.ow).map(x=>`${x.ow}|${x.os}|${x.oc}|${x.oo}`);
 const rsT=ringStyle(t.rows),rsR=ringStyle(r.rows);
 const rsDiff=rsT.map((v,i)=>v!==rsR[i]?`${i}:${rsR[i]}=>${v}`:null).filter(Boolean);
 const lowC=t.rows.filter(x=>x.px&&x.px.contrast!=null&&x.px.contrast<3).map(x=>`${x.i}:${x.id}:${x.px.contrast}`);
 const lowCR=r.rows.filter(x=>x.px&&x.px.contrast!=null&&x.px.contrast<3).map(x=>`${x.i}:${x.id}:${x.px.contrast}`);
 const styles=[...new Set(rsT)];
 out[`${W}-${S}`]={stopsT:t.rows.length,stopsR:r.rows.length,fwdEq:eq(fT,fR),backEq:eq(bT,bR),hiddenT:[t.res.hiddenF.length,t.res.hiddenB.length],hiddenR:[r.res.hiddenF,r.res.hiddenB],zeroRingT:[t.res.zeroRingF,t.res.zeroRingB],zeroRingR:[r.res.zeroRingF.length,r.res.zeroRingB.length],stDiff,rsDiff,styles,lowC,lowCR,slT:t.res.slChanges,loadT:t.res.load,loadR:r.res.load,errT:t.net.errors.length,errR:r.net.errors.length,hydT:t.net.hydration.length,forbT:t.net.forbidden.length,authT:t.net.authHeaders.length};
}
fs.writeFileSync(path.join(__dirname,'..','out','focus-compare.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));
