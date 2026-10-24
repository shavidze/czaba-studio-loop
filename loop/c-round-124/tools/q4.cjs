// Q4 Fades and envelopes. node q4.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const {L,sleep}=X;
const W=+process.argv[2]||1440; const out={vp:W}; const net=[]; const wavs={};
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q4-${n}-${W}.png`}); return `shots/Q4-${n}-${W}.png`;};
const cattr=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].filter(e=>e.dataset.clipKind==='audio').map(e=>({lane:e.closest('[data-track-id]').dataset.trackId,start:e.dataset.clipStart,fi:e.dataset.fadeIn,fo:e.dataset.fadeOut,env:e.dataset.envelope,w:Math.round(e.getBoundingClientRect().width)})));
async function exp(p,log,tag){ const r=await X.exportWav(p,log,`Q4-${W}-${tag}`); const f=r.files.find(x=>/\.wav$/i.test(x)); if(!f) return null; wavs[tag]=X.wav(f); return f.replace(/.*c-round-124\//,''); }
const rms=(tag,a,b)=>X.winStats(wavs[tag].w,a,b).rms;
const ratio=(t1,t0,c,h=0.025)=>+(rms(t1,c-h,c+h)/Math.max(1e-12,rms(t0,c-h,c+h))).toFixed(4);
async function dragHandle(p,sel,dx,dy=0){ const hb=await p.locator(sel).first().boundingBox(); if(!hb) return {err:'no handle '+sel}; const x=hb.x+hb.width/2,y=hb.y+hb.height/2; await p.mouse.move(x,y); await p.mouse.down(); await p.mouse.move(x+dx/2,y+dy/2,{steps:5}); await p.mouse.move(x+dx,y+dy,{steps:5}); await sleep(120); await p.mouse.up(); await sleep(400); return {status:await L.status(p)}; }
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx,log}=await L.openStudio(b,X.VPS[W],'q4-'+W,net);
 await L.setSnapOff(p);
 await L.addAt(p,'demo-stem-pad','stems',0);
 const id=(await L.clipsDom(p)).find(c=>c.lane==='stems').id;
 out.f0=await exp(p,log,'E0');
 const g=await L.geo(p);
 await L.selectClip(p,id);
 // hover to show handles
 const bb=await X.clipBox(p,id); await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await sleep(200);
 out.fadeIn=await dragHandle(p,`[data-clip-id="${id}"] [data-testid=arrangement-clip-fade-in-handle]`,2*g.pps);
 await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await sleep(200);
 out.fadeOut=await dragHandle(p,`[data-clip-id="${id}"] [data-testid=arrangement-clip-fade-out-handle]`,-2*g.pps);
 out.attrs1=await cattr(p); out.shotFades=await shot(p,'fades');
 out.f1=await exp(p,log,'E1');
 out.fadeGain={in:[0.1,0.5,1.0,1.5,1.9,2.5].map(t=>({t,r:ratio('E1','E0',t)})), out:[14.1,14.5,15.0,15.5,15.9,13.5].map(t=>({t,r:ratio('E1','E0',t)}))};
 out.edgeFirstFrame={first10ms:X.winStats(wavs.E1.w,0,0.01).peak, base:X.winStats(wavs.E0.w,0,0.01).peak};
 // limits: drag fade-in far right (past fade-out)
 await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await sleep(200);
 out.fadeInMax=await dragHandle(p,`[data-clip-id="${id}"] [data-testid=arrangement-clip-fade-in-handle]`,13*g.pps); out.attrsMax=await cattr(p);
 out.undoMax=await X.key(p,'Control+z'); out.attrsUndo=await cattr(p);
 out.redoMax=await X.key(p,'Control+Shift+z'); out.attrsRedo=await cattr(p); await X.key(p,'Control+z');
 // adjacent clip: second pad at 16 on stems, drag clip1 fade-out past edge
 await L.addAt(p,'demo-stem-pad','stems',16);
 await L.selectClip(p,id); await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await sleep(200);
 out.crossDrag=await dragHandle(p,`[data-clip-id="${id}"] [data-testid=arrangement-clip-fade-out-handle]`,3*g.pps); out.attrsCross=await cattr(p);
 out.undoCross=await X.key(p,'Control+z'); out.attrsCrossUndo=await cattr(p);
 // remove clip 2 (select & Delete) to keep project 16 s
 const id2=(await L.clipsDom(p)).find(c=>c.lane==='stems'&&c.id!==id); if(id2){ await L.selectClip(p,id2.id); await X.key(p,'Delete'); }
 // Envelope: Env on, add points by double-click at 6 and 10
 out.envToggle=await X.key(p,'a'); out.envOn=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-envelope-toggle]').getAttribute('aria-pressed'));
 const ed=p.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-editor]`);
 const eb=await ed.boundingBox(); out.editorBox=eb;
 const lineY=async()=>{ const l=await p.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-line]`).boundingBox().catch(()=>null); return l; };
 out.lineBox=await lineY();
 const yTop=eb.y+3; 
 for(const t of [6,10]){ await p.mouse.dblclick(g.rl+t*g.pps, yTop+2); await sleep(350); out['add'+t]=await L.status(p); }
 out.envAfterAdd=(await cattr(p))[0].env;
 // drag point 2 (at 10) down by half body height
 const pts=p.locator(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`); out.nPts=await pts.count();
 const pb=await pts.nth(1).boundingBox(); const bodyH=eb.height;
 await p.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2); await p.mouse.down(); await p.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2+bodyH*0.25,{steps:4}); await p.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2+bodyH*0.5,{steps:4}); await sleep(120); await p.mouse.up(); await sleep(400);
 out.dragPt=await L.status(p); out.envAfterDrag=(await cattr(p))[0].env; out.shotEnv=await shot(p,'envelope');
 out.f2=await exp(p,log,'E2');
 out.envGain=[4,5.5,7,8,9,10.5,12].map(t=>({t,r:ratio('E2','E0',t)}));
 // snap: Snap on, drag point 1 horizontally +0.37 s
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); await X.L.blur(p);
 const p0=await pts.nth(0).boundingBox(); await p.mouse.move(p0.x+p0.width/2,p0.y+p0.height/2); await p.mouse.down(); await p.mouse.move(p0.x+p0.width/2+0.2*g.pps,p0.y+p0.height/2,{steps:3}); await p.mouse.move(p0.x+p0.width/2+0.37*g.pps,p0.y+p0.height/2,{steps:3}); await sleep(120); await p.mouse.up(); await sleep(400);
 out.snapDrag=await L.status(p); out.envAfterSnapDrag=(await cattr(p))[0].env;
 await p.click('[data-testid=arrangement-snap-toggle]'); await sleep(150); await X.L.blur(p);
 out.undoSnapDrag=await X.key(p,'Control+z'); out.envUndo1=(await cattr(p))[0].env;
 // delete a point by double-click, undo
 const p1=await pts.nth(0).boundingBox(); await p.mouse.dblclick(p1.x+p1.width/2,p1.y+p1.height/2); await sleep(400); out.delPt=await L.status(p); out.envAfterDel=(await cattr(p))[0].env;
 out.undoDel=await X.key(p,'Control+z'); out.envUndoDel=(await cattr(p))[0].env;
 // Env off; survive move / trim / split
 await X.key(p,'a');
 const before=(await cattr(p))[0];
 await L.selectClip(p,id); out.move=await H.dragHeader(p,id,1.0); out.afterMove=(await cattr(p))[0];
 out.trim=await H.dragEdge(p,id,'L',0.5); out.afterTrim=(await cattr(p))[0];
 await X.L.seekTo(p,9); await L.selectClip(p,id); out.split=await X.key(p,'Control+e'); out.afterSplit=await cattr(p);
 out.before=before; out.shotSplit=await shot(p,'after-split');
 out.f3=await exp(p,log,'E3');
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);}
 L.save(L.OUT,`Q4-${W}.json`,out); await b.close();})();
