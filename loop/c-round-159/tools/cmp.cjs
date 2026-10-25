const [a,b]=process.argv.slice(2).map(f=>require(f));
const res={};
for(const s of Object.keys(a.states)){
  const sa=a.states[s], sb=b.states[s];
  const arr=(x)=>x.elements||x;
  const A=arr(sa), B=arr(sb);
  if(!Array.isArray(A)){res[s]={keysA:Object.keys(sa)};continue;}
  const ma=new Map(A.map(e=>[e.key,e])), mb=new Map(B.map(e=>[e.key,e]));
  const missing=[...ma.keys()].filter(k=>!mb.has(k)), added=[...mb.keys()].filter(k=>!ma.has(k));
  let max=0, worst=[];
  for(const [k,e] of ma){const f=mb.get(k);if(!f)continue;const d=Math.max(...['x','y','w','h'].map(p=>Math.abs(e[p]-f[p])));if(d>max)max=d;if(d>1)worst.push({k,a:[e.x,e.y,e.w,e.h],b:[f.x,f.y,f.w,f.h]});}
  res[s]={n:A.length,nB:B.length,missing,added,maxDelta:max,over1:worst.slice(0,10)};
}
console.log(JSON.stringify(res,null,1));
