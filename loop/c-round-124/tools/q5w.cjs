// Q5 waveform follows Clip Gain only (T12 4a). node q5w.cjs <vp>
const X=require('./lib122.cjs'); const {L,sleep}=X; const W=+process.argv[2]||1440; const net=[]; const out={vp:W};
const D=(p,id)=>p.evaluate((id)=>{const s=document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`); return s?s.querySelector('path').getAttribute('d'):null;},id);
function parseD(d){const re=/M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g; const c=[]; let m; while((m=re.exec(d))) c.push(1-(+m[2])); return c;}
function med(d0,d1){const a=parseD(d0),b=parseD(d1); const r=[]; for(let i=0;i<Math.min(a.length,b.length);i++){ if(a[i]>0.05&&a[i]<0.95) r.push(b[i]/a[i]); } r.sort((x,y)=>x-y); return {n:r.length, median:r.length?+r[Math.floor(r.length/2)].toFixed(4):null, cols:a.length};}
(async()=>{const b=await L.launch(); try{ const {page:p,ctx}=await L.openStudio(b,X.VPS[W],'q5w-'+W,net);
 await L.setSnapOff(p); await L.addAt(p,'demo-stem-pad','stems',0); const id=(await L.clipsDom(p)).find(c=>c.lane==='stems').id;
 await L.selectClip(p,id); await X.openDetail(p); const d0=await D(p,id); out.d0len=d0&&d0.length;
 const f='[data-testid=arrangement-detail-clip-gain-input]'; await p.fill(f,'-6'); await p.locator(f).press('Enter'); await sleep(500); await L.blur(p);
 const d1=await D(p,id); out.cgSame=d0===d1; out.cgRatio=med(d0,d1); await p.screenshot({path:L.SHOTS+`/Q5-waveform-cg-minus6-${W}.png`});
 await p.click('[data-testid=arrangement-detail-clip-gain-reset]'); await sleep(400); await L.blur(p); const d2=await D(p,id); out.resetSame=d0===d2;
 const sv=p.locator('input[aria-label="Volume — სტემები"]'); await sv.focus(); await p.keyboard.press('PageDown'); await sleep(400); await L.blur(p);
 const d3=await D(p,id); out.volSame=d0===d3; out.volRatio=med(d0,d3);
 out.net=X.netOk(net); await ctx.close(); }catch(e){out.error=String(e.stack||e);} L.save(L.OUT,`Q5w-${W}.json`,out); await b.close(); })();
