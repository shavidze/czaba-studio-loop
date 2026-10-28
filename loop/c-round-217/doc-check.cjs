const fs=require('fs');
const doc=fs.readFileSync(process.argv[2],'utf8'), start=fs.readFileSync(process.argv[3],'utf8');
const b=JSON.parse(fs.readFileSync(process.argv[4],'utf8'));const byId=Object.fromEntries(b.map(r=>[r.id,r]));
const re=/```mermaid\n[\s\S]*?```\n/g;const m1=doc.match(re)||[],m0=start.match(re)||[];
console.log('mermaid count doc',m1.length,'start',m0.length,'identical',m1[0]===m0[0]);
const arch=doc.indexOf('## არქიტექტურა'), next=doc.indexOf('\n## ',arch+5);
console.log('mermaid inside arch section', doc.indexOf(m1[0])>arch && doc.indexOf(m1[0])<next);
const ids=[...new Set(doc.match(/res\.[A-Za-z0-9.\-]+[A-Za-z0-9]/g))];
console.log('cited ids',ids.length,'missing',ids.filter(i=>!byId[i]));
let bad=[];for(const line of doc.split('\n')){const m=line.match(/^\| `(res\.[^`]+)` \| [^|]+\| (deterministic|wallclock) \/ (record|assert) \|/);if(m){const r=byId[m[1]];if(!r||r.kind!==m[2]||r.mode!==m[3])bad.push(line.slice(0,90));}}
console.log('kind/mode cell mismatches',bad);
const tableRows=doc.split('\n').filter(l=>/^\| `res\.[^`]+` \| [^|]+\| (deterministic|wallclock) \//.test(l)).length;console.log('table rows checked',tableRows);
