const X=require('./lib85.cjs');const{L,sleep,st,blur}=X;
(async()=>{const vp=process.argv[2]||'1440x900';const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);const S=await X.setup(p);console.log(JSON.stringify(S.clips),JSON.stringify(S.geo));
 console.log('snap',await X.setSnap(p,true),(await st(p)).status);
 const r=await X.rangeDrag(p,'stems',4,9);console.log('range',JSON.stringify(r));
 const d=await X.openDlg(p);console.log(JSON.stringify(d,null,1));await X.closeDlg(p);
 const r2=await X.rangeDrag(p,'sfx',4,9);console.log('sfxrange',JSON.stringify(r2));
 await s.browser.close();})().catch(e=>{console.log('ERR',e);process.exit(1)});
