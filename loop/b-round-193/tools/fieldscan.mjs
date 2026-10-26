import fs from 'node:fs';import path from 'node:path';
const out=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory()){if(e.name==='__tests__'||p.includes('components/arrangement'))continue;walk(p);}else if(/\.tsx?$/.test(e.name))scan(p);}}
function scan(p){const L=fs.readFileSync(p,'utf8').split('\n');L.forEach((l,i)=>{if(/<(input|textarea|select)\b/.test(l)){for(let j=i;j<Math.min(L.length,i+14);j++){if(/border-outline(?![-\w])/.test(L[j])){out.push(`${p}:${j+1}  [el ${L[i].trim().slice(0,20)} @${i+1}] ${L[j].trim().slice(0,110)}`);break;} if(j>i&&/\/?>\s*$/.test(L[j])&&!/=>/.test(L[j]))break;}}});}
walk('app');console.log(out.join('\n'));
