const H=require('./h3.cjs'); const {X,L,sleep,cl,brief,byLane,dragHeader,dragEdge,bodyClick,laneBgPoint,range}=H; const fs=require('fs');
(async()=>{ const b=await L.launch(); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p3-'+w,net); await X.openDetail(p);
 const step=async(name,fn)=>{try{r[name]=await fn();}catch(e){r[name]={err:String(e).slice(0,200)};}};
 await L.setSnapOff(p);
 await L.addAt(p,'demo-synth-mix','music',1); await L.addAt(p,'demo-stem-bass','stems',2); await L.addAt(p,'demo-soft-impact','sfx',20);
 await step('init',async()=>brief(await cl(p)));
 // (a)
 await step('a_header',async()=>{const m=await byLane(p,'music'); await L.selectClip(p,m.id); return {sel:brief(await cl(p)),pos:await L.posNow(p)};});
 await step('a_bodyClick',async()=>{const m=await byLane(p,'music'); await bodyClick(p,m.id,5.5); return {sel:brief(await cl(p)),pos:await L.posNow(p),range:await range(p),st:await L.status(p)};});
 await step('a_bodyDrag',async()=>{const m=await byLane(p,'music'); const st=await X.rangeDrag(p,m.id,3,5); await X.shot(p,`P3-range-on-waveform-${w}.png`); return {sel:brief(await cl(p)),range:await range(p),st,pos:await L.posNow(p)};});
 await step('a_bodyDragMoves',async()=>brief(await cl(p)));
 // (b)
 await step('b_multi',async()=>{const m=await byLane(p,'music'),s=await byLane(p,'stems'),f=await byLane(p,'sfx'); await L.selectClip(p,m.id); await L.selectClip(p,s.id,['Control']); const c1=brief(await cl(p)); await L.selectClip(p,f.id,['Shift']); const c2=brief(await cl(p)); await L.selectClip(p,s.id,['Control']); const c3=brief(await cl(p)); return {ctrl:c1,shift:c2,ctrlToggleOff:c3};});
 await step('b_escape',async()=>{await L.blur(p); await p.keyboard.press('Escape'); await sleep(200); return brief(await cl(p));});
 await step('b_bgDeselect',async()=>{const q=await laneBgPoint(p,'sfx',30); await p.mouse.click(q.x,q.y); await sleep(300); return brief(await cl(p));});
 await step('b_marquee',async()=>{const a=await laneBgPoint(p,'sfx',19); const z=await laneBgPoint(p,'music',0.5); await p.mouse.move(a.x,a.y); await p.mouse.down(); await p.mouse.move((a.x+z.x)/2,(a.y+z.y)/2,{steps:8}); await p.mouse.move(z.x,z.y,{steps:8}); await sleep(150); await X.shot(p,`P3-marquee-${w}.png`); await p.mouse.up(); await sleep(300); return brief(await cl(p));});
 await step('b_ctrlA',async()=>{const q=await laneBgPoint(p,'sfx',30); await p.mouse.click(q.x,q.y); await sleep(200); await L.blur(p); await p.keyboard.press('Control+a'); await sleep(300); return {sel:brief(await cl(p)),st:await L.status(p)};});
 await step('deselect',async()=>{const q=await laneBgPoint(p,'sfx',30); await p.mouse.click(q.x,q.y); await sleep(200); return brief(await cl(p));});
 // (c)
 await step('c_move2',async()=>{const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,2); return {c:brief(await cl(p)),st};});
 await step('c_snapOn',async()=>{await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); await L.blur(p); const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,1.37); return {c:brief(await cl(p)),st};});
 await step('c_snapAlt',async()=>{const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,0.37,{mods:['Alt']}); return {c:brief(await cl(p)),st};});
 await step('c_snapEdge',async()=>{await L.setSnapOff(p); return 'snap off';});
 await step('c_lane',async()=>{const f=await byLane(p,'sfx'); const st=await dragHeader(p,f.id,0,{dyLane:'stems'}); await X.shot(p,`P3-move-to-stems-${w}.png`); return {c:brief(await cl(p)),st};});
 await step('c_laneOccupied',async()=>{const f=await byLane(p,'stems',1); const st=await dragHeader(p,f.id,-12,{dyLane:'music'}); return {c:brief(await cl(p)),st};});
 await step('c_escape',async()=>{const m=await byLane(p,'music'); const st=await dragHeader(p,m.id,3,{escape:true}); return {c:brief(await cl(p)),st};});
 await step('c_undo',async()=>{await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); return {c:brief(await cl(p)),u:await X.undoTitle(p)};});
 // (d) trim
 await step('d_trimL',async()=>{const m=await byLane(p,'music'); const st=await dragEdge(p,m.id,'L',1); await L.selectClip(p,(await byLane(p,'music')).id); return {c:brief(await cl(p)),info:(await X.clipInfoSel(p)),st};});
 await step('d_trimLpast',async()=>{const m=await byLane(p,'music'); const st=await dragEdge(p,m.id,'L',-4); await L.selectClip(p,(await byLane(p,'music')).id); return {c:brief(await cl(p)),info:(await X.clipInfoSel(p)),st};});
 await step('d_trimR',async()=>{const m=await byLane(p,'music'); const st=await dragEdge(p,m.id,'R',-3); return {c:brief(await cl(p)),st};});
 await step('d_trimRpast',async()=>{const m=await byLane(p,'music'); const st=await dragEdge(p,m.id,'R',8); await L.selectClip(p,(await byLane(p,'music')).id); await X.shot(p,`P3-trim-past-end-${w}.png`); return {c:brief(await cl(p)),info:(await X.clipInfoSel(p)),st};});
 // (e) split
 await step('e_splitPlayhead',async()=>{const m=await byLane(p,'music'); await L.selectClip(p,m.id); await L.seekTo(p,10); await L.selectClip(p,m.id); await L.blur(p); await p.keyboard.press('Control+e'); await sleep(400); return {c:brief(await cl(p)),st:await L.status(p)};});
 await step('e_splitRange',async()=>{const s=await byLane(p,'stems'); await X.rangeDrag(p,s.id,8,10); await L.blur(p); await p.keyboard.press('Control+e'); await sleep(400); await X.shot(p,`P3-split-range-${w}.png`); return {c:brief(await cl(p)),st:await L.status(p),range:await range(p)};});
 await step('e_dupSingle',async()=>{const q=await laneBgPoint(p,'sfx',40); await p.mouse.click(q.x,q.y); await sleep(200); const s=(await L.clipsDom(p)).filter(c=>c.lane==='stems').sort((a,b)=>b.start-a.start)[0]; await L.selectClip(p,s.id); await L.blur(p); await p.keyboard.press('Control+d'); await sleep(400); return {c:brief(await cl(p)),st:await L.status(p)};});
 await step('e_dupGroup',async()=>{const q=await laneBgPoint(p,'sfx',40); await p.mouse.click(q.x,q.y); await sleep(200); const m=(await L.clipsDom(p)).filter(c=>c.lane==='music').sort((a,b)=>a.start-b.start); await L.selectClip(p,m[0].id); await L.selectClip(p,m[1].id,['Control']); await L.blur(p); await p.keyboard.press('Control+d'); await sleep(400); await X.shot(p,`P3-dup-group-${w}.png`); return {c:brief(await cl(p)),st:await L.status(p)};});
 await step('e_dupUndo',async()=>{await L.blur(p); await p.keyboard.press('Control+z'); await sleep(300); await p.keyboard.press('Control+z'); await sleep(300); return {c:brief(await cl(p))};});
 // (f) delete
 await step('f_delClip',async()=>{const q=await laneBgPoint(p,'sfx',40); await p.mouse.click(q.x,q.y); await sleep(200); const m=await byLane(p,'music',1); await L.selectClip(p,m.id); await L.blur(p); await p.keyboard.press('Delete'); await sleep(400); const c=brief(await cl(p)); await p.keyboard.press('Control+z'); await sleep(300); return {c,st:await L.status(p),afterUndo:brief(await cl(p))};});
 await step('f_delRange',async()=>{const s=(await L.clipsDom(p)).filter(c=>c.lane==='stems').sort((a,b)=>b.dur-a.dur)[0]; await X.rangeDrag(p,s.id,12,14); await L.blur(p); await p.keyboard.press('Backspace'); await sleep(400); const c=brief(await cl(p)); const st=await L.status(p); await p.keyboard.press('Control+z'); await sleep(300); return {c,st,afterUndo:brief(await cl(p))};});
 await step('f_ctrlShiftL',async()=>{const s=(await L.clipsDom(p)).filter(c=>c.lane==='stems').sort((a,b)=>b.dur-a.dur)[0]; await X.rangeDrag(p,s.id,12,14); await L.blur(p); await p.keyboard.press('Control+Shift+l'); await sleep(400); await X.shot(p,`P3-ctrl-shift-l-${w}.png`); return {range:await range(p),st:await L.status(p)};});
 await step('f_cutTime',async()=>{const before=brief(await cl(p)); await L.blur(p); await p.keyboard.press('Control+Shift+x'); await sleep(500); const c=brief(await cl(p)); const st=await L.status(p); await X.shot(p,`P3-cut-time-${w}.png`); await p.keyboard.press('Control+z'); await sleep(300); return {before,c,st,afterUndo:brief(await cl(p))};});
 await ctx.close(); }
fs.writeFileSync('../out/P3.json',JSON.stringify({R,net:X.netOk(net)},null,1)); console.log(JSON.stringify(R,null,1)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
