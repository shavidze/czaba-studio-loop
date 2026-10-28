const fs=require('fs');
const a=JSON.parse(fs.readFileSync(process.argv[2],'utf8')), b=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
const ra=Array.isArray(a)?a:a.budgets||a.rows, rb=Array.isArray(b)?b:b.budgets||b.rows;
console.log('top keys', Array.isArray(a)?'array':Object.keys(a), Array.isArray(b)?'array':Object.keys(b));
if(!Array.isArray(a)){for(const k of Object.keys(a)) if(k!=='budgets'&&JSON.stringify(a[k])!==JSON.stringify(b[k])) console.log('TOP DIFF',k);}
console.log('rows',ra.length,rb.length,'order same',JSON.stringify(ra.map(r=>r.id))===JSON.stringify(rb.map(r=>r.id)));
let n=0;
ra.forEach((r,i)=>{const s=rb[i];const keys=new Set([...Object.keys(r),...Object.keys(s)]);const d=[...keys].filter(k=>JSON.stringify(r[k])!==JSON.stringify(s[k]));
 if(JSON.stringify(Object.keys(r))!==JSON.stringify(Object.keys(s))) console.log('KEYORDER',r.id);
 if(d.length){n++;console.log('\n#',i,r.id,'fields',d);for(const k of d){console.log('  start',k,JSON.stringify(r[k]));console.log('  end  ',k,JSON.stringify(s[k]));}}});
console.log('\nchanged',n);
const live=rb.filter(r=>/clips-|export-.*produced|js-.*-seen/.test(r.id));console.log('liveness',live.map(r=>r.id+':'+r.kind).join(' '));
console.log('mem-polls',rb.filter(r=>/mem-polls/.test(r.id)).map(r=>`${r.id} ${r.kind} ${r.mode} ${JSON.stringify(r.budget)}`).join('\n'));
