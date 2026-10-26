const fs=require('fs'),path=require('path');const dir='app/components/arrangement';
const files=fs.readdirSync(dir).filter(f=>/\.tsx?$/.test(f)).map(f=>path.join(dir,f)).concat(['app/routes/studio-lab.tsx']);
const hits=[];for(const f of files){const lines=fs.readFileSync(f,'utf8').split('\n');lines.forEach((l,i)=>{for(const m of l.matchAll(/[A-Za-z0-9:_\-\[\]\/!.%&>~*()'"=]*?(brand|accent)[A-Za-z0-9:_\-\[\]\/!.%]*/g)){let t=m[0].replace(/^['"`(]+/,'');if(t==='focus-visible:ring-brand')continue;hits.push({f:path.basename(f),l:i+1,t});}});}
console.log(JSON.stringify(hits));
