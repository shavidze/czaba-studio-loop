const [a,b]=[require(process.argv[2]),require(process.argv[3])];
const diffs=[]; let n=0;
const strip=(o)=>JSON.parse(JSON.stringify(o,(k,v)=>k==='rowText'&&typeof v==='string'?v.replace(/ -?[\d.]+$|−[\d.]+$/,''):v));
function walk(x,y,p){ if(x&&typeof x==='object'&&y&&typeof y==='object'){ for(const k of new Set([...Object.keys(x),...Object.keys(y)])) { if(['utc','base','tag'].includes(k)) continue; walk(x[k],y[k],p+'.'+k);} return;} n++; if(JSON.stringify(x)!==JSON.stringify(y)) diffs.push(p+': '+JSON.stringify(x)+' -> '+JSON.stringify(y)); }
walk(a,b,'');
console.log('leaves',n,'diffs',diffs.length); for(const d of diffs) console.log(d.slice(0,300));
console.log('fatal',a.fatal,b.fatal,'errors',JSON.stringify(a.errors),JSON.stringify(b.errors));
