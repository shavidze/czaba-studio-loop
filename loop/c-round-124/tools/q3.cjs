// Q3 Groups. node q3.cjs <1440|1280>
const X=require('./lib122.cjs'); const H=require('./h3.cjs'); const {L,sleep}=X;
const W=+process.argv[2]||1440; const out={vp:W,ex:{}}; const net=[];
const shot=async(p,n)=>{await p.screenshot({path:L.SHOTS+`/Q3-${n}-${W}.png`}); return `shots/Q3-${n}-${W}.png`;};
const groups=(p)=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-group-row]')].map(r=>({id:r.dataset.groupId, name:(r.querySelector('[data-testid=arrangement-group-name]')||{}).textContent, collapsed:r.dataset.groupCollapsed||null, mute:(r.querySelector('[data-testid=arrangement-group-mute]')||{}).dataset?.mute, solo:(r.querySelector('[data-testid=arrangement-group-solo]')||{}).dataset?.solo, vol:(r.querySelector('[data-testid=arrangement-group-volume]')||{}).value, indent:r.querySelector('[data-testid=arrangement-group-header]').style.paddingLeft})));
const lanes=(p)=>p.evaluate(()=>{const o={}; for(const id of ['video','music','stems','sfx']){const r=document.querySelector(`[data-track-id=${id}]`); const box=r?r.getBoundingClientRect():null; o[id]=r?{h:Math.round(box.height),visible:box.height>0&&r.offsetParent!==null}:null;} return o;});
const nameBtn=(p,t)=>p.locator(X.L.nameSel(t));
async function exp(p,log,tag){ const r=await X.exportWav(p,log,`Q3-${W}-${tag}`); const f=r.files.find(x=>/\.wav$/i.test(x)); if(!f) return {err:'no wav',recs:r.recs}; const w=X.wav(f); const win=(a,b)=>{const s=X.winStats(w.w,a,b); return {pk:+s.peak.toFixed(4)};}; return {file:f.replace(/.*c-round-124\//,''), frames:w.frames, sr:w.fmt.sr, music:win(1,3), stems:win(4,6), sfx:win(7,9)}; }
(async()=>{const b=await L.launch();
 try{
 const {page:p,ctx,log}=await L.openStudio(b,X.VPS[W],'q3-'+W,net);
 await L.setSnapOff(p);
 await L.addAt(p,'demo-soft-impact','music',1); await L.addAt(p,'demo-soft-impact','stems',4); await L.addAt(p,'demo-soft-impact','sfx',7);
 out.clips=await H.cl(p);
 out.ex.E0=await exp(p,log,'E0-base');
 // (a) select music + stems -> Ctrl+G
 await nameBtn(p,'music').click(); await sleep(150); await nameBtn(p,'stems').click({modifiers:['Control']}); await sleep(150);
 out.sel=await p.evaluate(()=>[...document.querySelectorAll('[data-track-id] button[aria-label*="მონიშნული"]')].map(x=>x.getAttribute('aria-label')));
 out.ctrlG=await X.key(p,'Control+g'); out.groups1=await groups(p); out.shotG=await shot(p,'grouped');
 // nonadjacent check: select video + sfx -> Ctrl+G (expected refusal GROUP-NONADJACENT)
 // rename via F2 on group
 const gname=p.locator('[data-testid=arrangement-group-name]').first();
 await gname.click(); await sleep(150); await p.keyboard.press('F2'); await sleep(250);
 const inp=p.locator('[data-testid=arrangement-group-name-input]');
 out.renameEditor=await inp.count();
 if(out.renameEditor){ await inp.fill('Score'); await inp.press('Enter'); await sleep(300); }
 out.renameStatus=await L.status(p); out.groupsRenamed=await groups(p);
 // (b) group mute
 const gm=p.locator('[data-testid=arrangement-group-mute]').first();
 await gm.click(); await sleep(200); await X.L.blur(p); out.ex.E1_groupMute=await exp(p,log,'E1-gmute');
 // (c) solo a child inside muted group
 await p.click('[data-track-id=stems] button[aria-label^="Solo"]'); await sleep(200); await X.L.blur(p);
 out.childSoloInMuted={groups:await groups(p), stemsSolo:await p.evaluate(()=>document.querySelector('[data-track-id=stems] button[aria-label^="Solo"]').getAttribute('aria-pressed'))};
 out.ex.E2_childSoloInMutedGroup=await exp(p,log,'E2-childsolo-muted');
 await p.click('[data-track-id=stems] button[aria-label^="Solo"]'); await sleep(200);
 await gm.click(); await sleep(200); await X.L.blur(p);
 // group solo
 const gs=p.locator('[data-testid=arrangement-group-solo]').first();
 await gs.click(); await sleep(200); await X.L.blur(p); out.groupSolo=await groups(p); out.ex.E3_groupSolo=await exp(p,log,'E3-gsolo');
 // child solo inside soloed group
 await p.click('[data-track-id=music] button[aria-label^="Solo"]'); await sleep(200); await X.L.blur(p); out.childSoloInSoloed={groups:await groups(p)}; out.ex.E4_childSoloInSoloedGroup=await exp(p,log,'E4-childsolo-soloed');
 out.shotSolo=await shot(p,'child-solo-in-soloed-group');
 await p.click('[data-track-id=music] button[aria-label^="Solo"]'); await sleep(200); await gs.click(); await sleep(200); await X.L.blur(p);
 // group volume -6 via PageDown
 const gv=p.locator('[data-testid=arrangement-group-volume]').first(); await gv.focus(); await p.keyboard.press('PageDown'); await sleep(400);
 out.gvol=await gv.evaluate(e=>({v:e.value,text:e.getAttribute('aria-valuetext')})); await X.L.blur(p); out.gvolStatus=await L.status(p);
 out.ex.E5_groupVolDown=await exp(p,log,'E5-gvol');
 await gv.dblclick(); await sleep(300); out.gvolReset=await gv.evaluate(e=>({v:e.value,text:e.getAttribute('aria-valuetext')})); await X.L.blur(p);
 // nested: select group row + sfx -> Ctrl+G
 await gname.click(); await sleep(150); await nameBtn(p,'sfx').click({modifiers:['Control']}); await sleep(150);
 out.nestG=await X.key(p,'Control+g'); out.groupsNested=await groups(p); out.shotNested=await shot(p,'nested');
 // outer group mute
 const outer=p.locator('[data-testid=arrangement-group-row]').first();
 await outer.locator('[data-testid=arrangement-group-mute]').click(); await sleep(200); await X.L.blur(p);
 out.ex.E6_outerMute=await exp(p,log,'E6-outer-mute');
 await outer.locator('[data-testid=arrangement-group-mute]').click(); await sleep(200); await X.L.blur(p);
 // fold/unfold inner group
 const foldInner=p.locator('[data-testid=arrangement-group-fold]').nth(1);
 out.lanesBeforeFold=await lanes(p); await foldInner.click(); await sleep(400); out.lanesFolded=await lanes(p); out.groupsFolded=await groups(p); out.shotFolded=await shot(p,'inner-folded');
 // (e) move clips of a folded group: Ctrl+A then ArrowRight nudge
 await X.L.blur(p); await p.keyboard.press('Control+a'); await sleep(250); out.selAllStatus=await L.status(p);
 await p.keyboard.press('ArrowRight'); await sleep(350); out.nudgeStatus=await L.status(p); out.clipsAfterNudge=await H.cl(p);
 out.undoNudge=await X.key(p,'Control+z');
 // drag on folded overview
 const ov=await p.locator('[data-testid=arrangement-group-overview]').nth(1).boundingBox().catch(()=>null); out.overviewBox=ov;
 if(ov){ const g=await L.geo(p); const x0=g.rl+1.5*g.pps, y=ov.y+ov.height/2; await p.mouse.move(x0,y); await p.mouse.down(); await p.mouse.move(x0+0.5*g.pps,y,{steps:6}); await sleep(100); await p.mouse.up(); await sleep(400); out.overviewDragStatus=await L.status(p); out.clipsAfterOverviewDrag=await H.cl(p); }
 await foldInner.click(); await sleep(300); out.lanesUnfolded=await lanes(p);
 // U key on selected group
 await gname.click(); await sleep(150); await X.L.blur(p); out.uKey=await X.key(p,'u'); out.groupsAfterU=await groups(p); out.uKey2=await X.key(p,'u');
 // (d) ungroup + undo/redo
 await p.locator('[data-testid=arrangement-group-name]').first().click(); await sleep(150); await X.L.blur(p);
 out.ungroup=await X.key(p,'Control+Shift+g'); out.groupsAfterUngroup=await groups(p);
 out.undo1=await X.key(p,'Control+z'); out.groupsAfterUndo=await groups(p);
 out.redo1=await X.key(p,'Control+Shift+z'); out.groupsAfterRedo=await groups(p);
 // nonadjacent: video + sfx
 await X.key(p,'Control+z');
 out.net=X.netOk(net);
 await ctx.close();
 }catch(e){out.error=String(e.stack||e);}
 L.save(L.OUT,`Q3-${W}.json`,out); await b.close();})();
