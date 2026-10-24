const H=require('./h3.cjs'); const {X,L,sleep,cl,brief,byLane,dragHeader,dragEdge,laneBgPoint,range}=H; const fs=require('fs');
const gc=(p)=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]'); const s=document.querySelector('[data-testid=arrangement-grid-division]'); return {ds:{...g.dataset},value:s.value,label:s.options[s.selectedIndex].text,title:s.title,n:s.options.length};});
const optsList=(p)=>p.evaluate(()=>[...document.querySelector('[data-testid=arrangement-grid-division]').options].map(o=>o.value+'='+o.text+(o.disabled?'(dis)':'')));
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p5-'+w,net); await X.openDetail(p);
 const step=async(name,fn)=>{try{r[name]=await fn();}catch(e){r[name]={err:String(e).slice(0,200)};}};
 const desel=async()=>{const q=await laneBgPoint(p,'video',0.5); await p.mouse.click(q.x,q.y); await sleep(250);};
 const key=async(k)=>{await L.blur(p); await p.keyboard.press(k); await sleep(300); return {...(await gc(p)),st:await L.status(p)};};
 await step('g0',()=>gc(p)); await step('optsNoBpm',()=>optsList(p));
 await step('d1',()=>key('Digit1')); await step('d1b',()=>key('Digit1')); await step('d2',()=>key('Digit2')); await step('d3noBpm',()=>key('Digit3')); await step('gKey',()=>key('g')); await step('gKey2',()=>key('g'));
 await step('setBpm',async()=>{const t=p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill('120'); await t.press('Enter'); await sleep(400); await L.blur(p); return {...(await gc(p)),opts:await optsList(p)};});
 await X.shot(p,`P5-bpm-120-grid-${w}.png`);
 await step('selectQuarter',async()=>{const v=await p.evaluate(()=>[...document.querySelector('[data-testid=arrangement-grid-division]').options].map(o=>o.value)); const q=v.find(x=>/1\/4|quarter|beat-4|q4/.test(x))||v.find(x=>/4/.test(x)); await p.selectOption('[data-testid=arrangement-grid-division]',q); await sleep(300); await L.blur(p); return gc(p);});
 await step('d1m',()=>key('Digit1')); await step('d3m',()=>key('Digit3')); await step('d3m_off',()=>key('Digit3')); await step('d2m',()=>key('Digit2'));
 await step('zoomGridAdaptive',async()=>{const lines0=await p.evaluate(()=>document.querySelectorAll('[data-testid=arrangement-bars-ruler] *').length); const g0=await gc(p); await L.blur(p); await p.keyboard.press('Equal'); await p.keyboard.press('Equal'); await sleep(400); const g1=await gc(p); const lines1=await p.evaluate(()=>document.querySelectorAll('[data-testid=arrangement-bars-ruler] *').length); const z=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-zoom-readout]').textContent); await p.keyboard.press('Minus'); await p.keyboard.press('Minus'); await sleep(300); return {g0:g0.label,g1:g1.label,lines0,lines1,z};});
 // clear bpm, back to seconds 1s
 await step('clearBpm',async()=>{const t=p.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill(''); await t.press('Enter'); await sleep(400); await L.blur(p); await p.selectOption('[data-testid=arrangement-grid-division]',{label:'1 წმ'}).catch(()=>{}); await sleep(200); await L.blur(p); return gc(p);});
 await L.setSnapOff(p);
 await L.addAt(p,'demo-soft-impact','sfx',1); await L.addAt(p,'demo-stem-bass','stems',6);
 // (b) snap off + Alt drag -> temporarily enable?
 await step('offAlt',async()=>{await desel(); const f=await byLane(p,'sfx'); const st=await dragHeader(p,f.id,1.37,{mods:['Alt']}); return {c:brief(await cl(p)),st};});
 await step('offAltUndo',async()=>{await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); return brief(await cl(p));});
 // snap on: trim, range, playhead, paste
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); await L.blur(p);
 await step('snapTrim',async()=>{await desel(); const s=await byLane(p,'stems'); const st=await dragEdge(p,s.id,'R',-2.63); return {c:brief(await cl(p)),st};});
 await step('snapRange',async()=>{await desel(); const s=await byLane(p,'stems'); await X.rangeDrag(p,s.id,7.3,9.6); return range(p);});
 await step('snapRuler',async()=>{await desel(); const g=await L.geo(p); const rr=await p.locator('[data-testid=arrangement-ruler]').boundingBox(); await p.mouse.click(g.rl+4.37*g.pps,rr.y+rr.height/2); await sleep(300); return L.posNow(p);});
 await step('snapLaneClick',async()=>{const q=await laneBgPoint(p,'music',3.37); await p.mouse.click(q.x,q.y); await sleep(300); return L.posNow(p);});
 await step('snapPaste',async()=>{await desel(); await L.selectClip(p,(await byLane(p,'sfx')).id); await L.blur(p); await p.keyboard.press('Control+c'); await p.click(L.nameSel('music')); const q=await laneBgPoint(p,'music',3.37); await p.mouse.click(q.x,q.y); await sleep(200); const pos=await L.posNow(p); await L.blur(p); await p.keyboard.press('Control+v'); await sleep(400); return {pos,c:brief(await cl(p)),st:await L.status(p)};});
 // (d) clip-edge snap: snap on, sfx clip 1..3; drag music clip so start lands 0.3s after sfx end? different lanes; edges across lanes
 await step('edgeSnapOn',async()=>{await desel(); const m=await byLane(p,'music'); const before=m.start; const st=await dragHeader(p,m.id,(8+0.15)-m.start-0.0); return {before,c:brief(await cl(p)),st};});
 await step('edgeSnapOff',async()=>{await L.setSnapOff(p); await desel(); const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,(22+0.06)-m.start); return {c:brief(await cl(p)),st, note:'stems end=22; target 22.06'};});
 await step('edgeSnapOffSameLane',async()=>{await desel(); const s=await byLane(p,'sfx'); const st=await dragHeader(p,s.id,(6-2+0.06)-s.start); return {c:brief(await cl(p)),st, note:'sfx clip len2; end target 6.06 vs stems start 6 (other lane)'};});
 await X.shot(p,`P5-after-snap-tests-${w}.png`);
 await ctx.close(); }
fs.writeFileSync('../out/P5.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(R['1440'],null,0)); for(const k of Object.keys(R['1440'])) if(JSON.stringify(R['1440'][k])!==JSON.stringify(R['1280'][k])) console.log('DIFF1280',k,JSON.stringify(R['1280'][k]).slice(0,300)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
