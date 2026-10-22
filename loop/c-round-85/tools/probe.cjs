const X=require('./lib83.cjs');const{L,sleep,st,blur}=X;
(async()=>{const s=await L.open(process.argv[2]||'1440x900');const p=s.page;await L.fresh(p);await L.fresh(p);
 const S=await X.freshSetup(p,{video:true});console.log(JSON.stringify(S.clips),S.geo);
 const v=await X.clipInfo(p,'video');console.log(JSON.stringify(v));
 const info=await p.evaluate(()=>{const e=document.querySelector('[data-track-id=video] [data-clip-id]');return{attrs:[...e.attributes].map(a=>a.name+'='+a.value.slice(0,60)),handles:[...e.querySelectorAll('[data-testid]')].map(h=>h.dataset.testid+'|'+(h.title||'')),ov:(()=>{const o=document.querySelector('[data-testid=arrangement-video-fade]');return o&&{op:o.style.opacity,cop:getComputedStyle(o).opacity,dv:o.dataset.videoOpacity,r:o.getBoundingClientRect().toJSON()}})(),vids:[...document.querySelectorAll('video')].map(x=>({role:x.dataset.videoRole,ct:x.currentTime,rs:x.readyState,vw:x.videoWidth,cls:x.className}))}});
 console.log(JSON.stringify(info,null,1));await p.screenshot({path:L.OUT+'/shots/probe.png'});
 console.log(s.con.filter(l=>!/ERR_|cart|Failed to load/.test(l)).slice(0,20));await s.browser.close();})();
