const X=require('./lib83.cjs');const{L,sleep,st,blur}=X;
(async()=>{const s=await L.open(process.argv[2]||'1440x900');const p=s.page;await L.fresh(p);await sleep(500);await L.fresh(p);const S=await X.setup(p);console.log(JSON.stringify(S.geo),JSON.stringify(S.clips));
 console.log(JSON.stringify(await X.mode(p)));const m=await X.setMode(p,true);console.log(JSON.stringify(m),(await st(p)).status);
 const c=await X.envInfo(p,'stems');console.log(JSON.stringify(c));
 const a=await X.dblAt(p,'stems',6);console.log(JSON.stringify(a.c.env),JSON.stringify(a.s));
 await X.dblAt(p,'stems',10);await X.dblAt(p,'stems',14);const d=await X.dragPointToGain(p,'stems',1,0.2512);console.log(d.during,'|',JSON.stringify(d.s),JSON.stringify(d.after.points),d.after.env, JSON.stringify(d.after.line));
 console.log(s.con.filter(l=>!/ERR_CONN|cart|Failed to load resource/.test(l)).slice(0,10));await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
