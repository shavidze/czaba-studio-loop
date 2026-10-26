const s=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));
console.log(s.error, s.fonts, s.noLcd, JSON.stringify(s.setup), JSON.stringify(s.net));
for (const [k,v] of Object.entries(s.on)) { if(!v||typeof v==='string'){console.log(k,v);continue;} const g=(x)=>x&&[x.bg.replace('oklab(0.926355 0.00167474 0.0172472','fg'),x.bd,x.bs,x.col,x.comp.join(','),'u'+x.under.join(','),x.pr,x.fm,x.hov?'H':'',x.act?'A':'',x.fv?'FV':'',x.s1].join(' '); console.log('ON',k,'\n  R',g(v.rest),'\n  H',g(v.hover),'\n  P',g(v.press),v.label?'\n  L '+g(v.label):'', JSON.stringify(v.after), v.clipsUnchanged);}
for (const [k,v] of Object.entries(s.off)) { const g=(x)=>x&&[x.bg.replace('oklab(0.926355 0.00167474 0.0172472','fg'),x.bd,x.bs,x.col,x.comp.join(','),'u'+x.under.join(','),x.pr,x.fm,x.s1].join(' '); console.log('OFF',k, v&&v.rest? g(v.rest)+' | L '+g(v.label): g(v)); }
console.log(JSON.stringify(s.edges));
