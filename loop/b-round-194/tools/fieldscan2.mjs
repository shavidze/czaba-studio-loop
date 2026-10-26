import fs from 'node:fs';import path from 'node:path';
const root=process.argv[2]||'app';const skip=[/__tests__/,/components[\\/]arrangement/,/components[\\/]studio/];
const bare=/border-outline(?![-\w])/;
function walk(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(skip.some(r=>r.test(p)))continue;if(e.isDirectory())walk(p,o);else if(/\.(tsx|jsx)$/.test(e.name))o.push(p);}return o;}
function tagEnd(s,i){let depth=0,q=null;for(let j=i;j<s.length;j++){const c=s[j];if(q){if(c===q&&s[j-1]!=='\\')q=null;continue;}if(c==='"'||c==="'"||c==='`'){q=c;continue;}if(c==='{')depth++;else if(c==='}')depth--;else if(c==='>'&&depth===0)return j;}return s.length;}
const out=[];
for(const f of walk(root)){const s=fs.readFileSync(f,'utf8');
 const consts={};const cre=/const\s+(\w+)\s*=/g;let m;while((m=cre.exec(s))){const st=cre.lastIndex;let d=0,q=null,j=st;for(;j<s.length;j++){const c=s[j];if(q){if(c===q&&s[j-1]!=='\\')q=null;continue;}if(c==='"'||c==="'"||c==='`'){q=c;continue;}if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;else if(c===';'&&d<=0)break;}consts[m[1]]=s.slice(st,j);}
 const tre=/<(input|textarea|select)\b/g;
 while((m=tre.exec(s))){const e=tagEnd(s,m.index);const tag=s.slice(m.index,e+1);const line=s.slice(0,m.index).split('\n').length;
  let hit=bare.test(tag)?'inline':null;
  if(!hit){for(const [k,v] of Object.entries(consts)){if(new RegExp('\\b'+k+'\\b').test(tag)&&bare.test(v)){hit='const:'+k;break;}}}
  const type=(tag.match(/type="(\w+)"/)||[])[1]||'';
  if(hit)out.push(`${f}:${line} <${m[1]} ${type}> ${hit}`);}
}
console.log(out.join('\n'));console.log('hits',out.length);
