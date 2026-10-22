const X=require('./lib87.cjs');const{L,sleep}=X;const vp=process.argv[2]||'1280x720';const fs=require('fs');
(async()=>{const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await X.setup(p);await X.fiveMin(p);
 await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(200);await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();
 const meas=()=>p.evaluate(()=>{const b=document.querySelector('[data-testid=arrangement-export-progress]');const pn=document.querySelector('#arrangement-export-title').closest('.overflow-auto');if(!b||!pn)return null;const br=b.getBoundingClientRect(),pr=pn.getBoundingClientRect();return{label:(document.querySelector('[data-testid=arrangement-export-progress-label]')||{}).textContent,scrollTop:pn.scrollTop,sh:pn.scrollHeight,ch:pn.clientHeight,bar:[br.top,br.bottom],panel:[pr.top,pr.bottom],barInPanel:br.top>=pr.top&&br.bottom<=pr.bottom};});
 let a=null;const t0=Date.now();while(Date.now()-t0<20000&&!(a=await meas()))await sleep(20);
 await p.mouse.move(640,400);await p.mouse.wheel(0,200);await sleep(300);const b=await meas();await p.screenshot({path:`${L.OUT}/shots/wheel-${vp}.png`});
 let c=null;const t1=Date.now();while(Date.now()-t1<20000){const m=await meas();if(m&&/MP3-ის შექმნა/.test(m.label||'')){c=m;break;}await sleep(50);}
 const t2=Date.now();while(Date.now()-t2<60000&&p.__dls.length===0)await sleep(200);for(const d of p.__dls){const f=await d.d.path().catch(()=>null);if(f)fs.unlinkSync(f);}
 const out={vp,beforeWheel:a,afterWheel:b,laterMp3Phase:c};console.log(JSON.stringify(out));fs.writeFileSync(`${L.OUT}/wheel-${vp}.json`,JSON.stringify(out,null,1));await s.browser.close();process.exit(0);})().catch(e=>{console.log('ERR',e);process.exit(1)});
