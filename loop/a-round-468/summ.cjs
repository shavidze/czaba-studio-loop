const fs=require('fs');const d=JSON.parse(fs.readFileSync(process.argv[2]));const g={};
for(const r of d.rows){const k=r.path+' '+r.viewport;(g[k]=g[k]||[]).push(r);}
const med=a=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
for(const k in g){const rs=g[k];console.log(k,'slow',rs.map(r=>r.slowFrames.length).join(','),'med',med(rs.map(r=>r.slowFrames.length)),'movOver33 med',med(rs.map(r=>r.movingOver33)),'moving',rs.map(r=>r.movingFrames).join(','),'final',rs.map(r=>r.finalY).join(','));
 if(process.argv[3]) for(const r of rs) console.log('   y:',r.slowFrames.map(s=>s[2]+':'+Math.round(s[1])).join(' '));}
