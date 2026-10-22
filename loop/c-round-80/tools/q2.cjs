const X=require('./h80.cjs');const{L,sleep,st,blur,key,focus,gstate,fold,rowKeys,laneIds,laneH,clickName,clickGroup,selClips,nClips}=X;
const vp=process.argv[2]||'1440x900';const OUT=`${L.OUT}/q2-${vp}.json`;const rec=X.mkRec(OUT);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const G='ჯგუფი 1';
const ensure=async(p,n,c)=>{const g=await gstate(p,n);if(g&&g.collapsed!==c)await fold(p,n);return (await gstate(p,n)).collapsed;};
const clipOn=async(p,lane)=>(await X.clips(p)).filter(c=>c.lane===lane);
const clickClip=async(p,id)=>{const b=await p.locator(`[data-clip-id="${id}"]`).boundingBox();await p.mouse.click(Math.min(b.x+b.width/2,b.x+60),b.y+b.height*0.3);await sleep(250);};
const ghost=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-lane-move-ghost]')].map(g=>g.closest('[data-track-id]')&&g.closest('[data-track-id]').dataset.trackId));
const ovSel=async(p,n)=>((await gstate(p,n)).overview||{blocks:[]}).blocks.filter(b=>b.sel).map(b=>b.start);
async function marquee(p,x0,y0,x1,y1,shot){await p.mouse.move(x0,y0);await p.mouse.down();await p.mouse.move(x0+15,y0+15,{steps:4});await p.mouse.move(x1,y1,{steps:12});await sleep(150);if(shot)await p.screenshot({path:shot});await p.mouse.up();await sleep(350);}
const hit=(p,x,y)=>p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.closest('[data-clip-id]')?'clip':e.closest('[data-group-id]')?'group':e.closest('[data-track-id]')?'lane:'+e.closest('[data-track-id]').dataset.trackId:e.tagName)},[x,y]);
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);
 const S=await X.setup(p);rec('SETUP',S.clips.length===3,{clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
 await X.groupStemsSfx(p);rec('G1',JSON.stringify(await rowKeys(p))===JSON.stringify(['T:video','T:music','G:ჯგუფი 1@0','T:stems','T:sfx']),{rows:await rowKeys(p)});
 await T('FOLD-SELECTION',async()=>{const out={};const stc=(await clipOn(p,'stems'))[0];
  await clickClip(p,stc.id);out.sel1=await selClips(p);await blur(p);const u0=(await st(p)).undo;const n0=(await X.clips(p)).length;
  await fold(p,G);out.ovSelAfterCollapse=await ovSel(p,G);await blur(p);await key(p,'Delete');out.del={undo:(await st(p)).undo,undo0:u0,status:(await st(p)).status};
  await fold(p,G);out.afterExpand={stems:(await clipOn(p,'stems')).map(c=>[c.start,c.sel]),n:(await X.clips(p)).length,n0};
  const ok1=JSON.stringify(out.sel1)==='["stems"]'&&out.ovSelAfterCollapse.length===0&&out.del.undo===u0&&out.afterExpand.n===n0&&out.afterExpand.stems.length===1&&!out.afterExpand.stems[0][1];
  // (2) lane range on sfx
  await p.keyboard.press('Escape');await sleep(200);await blur(p);await X.geo(p);const lb=await X.laneBox(p,'sfx');const y=Math.round(lb.y+lb.h*0.8);out.hitRange=await hit(p,X.tx(4.3),y);
  await p.mouse.move(X.tx(4.3),y);await p.mouse.down();await p.mouse.move(X.tx(5),y,{steps:5});await p.mouse.move(X.tx(5.6),y,{steps:5});await p.mouse.up();await sleep(300);await blur(p);
  out.range2Before=(await st(p)).range;await fold(p,G);out.range2After=(await st(p)).range;await fold(p,G);out.range2Expanded=(await st(p)).range;
  const ok2=!!out.range2Before&&!out.range2After&&!out.range2Expanded;
  // (3) lane range then Ctrl+Shift+L (all lanes) then collapse
  await p.mouse.move(X.tx(4.3),y);await p.mouse.down();await p.mouse.move(X.tx(5),y,{steps:5});await p.mouse.move(X.tx(5.6),y,{steps:5});await p.mouse.up();await sleep(300);await blur(p);
  out.range3Lane=(await st(p)).range;await key(p,'Control+Shift+L');out.range3All=(await st(p)).range;out.allAttr=await p.evaluate(()=>{const r=document.querySelector('[data-testid=arrangement-range]');return r?[...r.attributes].map(a=>a.name+'='+a.value).join(' '):null});
  out.rangeLanes=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-time-range],[data-testid*=range-overlay],[data-range-track]')].length);
  await fold(p,G);out.range3After=(await st(p)).range;await p.screenshot({path:`${SH}/sel-allrange-collapsed-${vp}.png`});await fold(p,G);
  const ok3=!!out.range3All&&out.range3After===out.range3All;
  await p.keyboard.press('Escape');await sleep(200);
  rec('FOLD-SELECTION',ok1&&ok2&&ok3,{ok1,ok2,ok3,...out});});
 await T('FOLD-ACTIVE',async()=>{await p.keyboard.press('Escape');await clickName(p,'sfx');const act=await X.active(p);await fold(p,G);const g=await gstate(p,G);await p.screenshot({path:`${SH}/active-collapsed-${vp}.png`});
  const opt=p.locator('[role=option][data-source-id="demo-soft-impact"]');await opt.focus();const nb=g.overview.blocks.length;await key(p,'Enter',700);const g2=await gstate(p,G);const status=(await st(p)).status;await blur(p);
  await fold(p,G);const sfxClips=(await clipOn(p,'sfx')).map(c=>c.start);
  rec('FOLD-ACTIVE',JSON.stringify(act)==='["sfx"]'&&g.containsActive&&g.hdrClass&&g2.overview.blocks.length===nb+1&&sfxClips.length===2,{act,containsActive:g.containsActive,accent:[g.hdrClass,g.hdrBorderL],blocks:[nb,g2.overview.blocks.length],status,sfxClips});
  // undo the add to keep fixture
  await key(p,'Control+z');});
 await T('FOLD-DRAG-OVER',async()=>{await ensure(p,G,true);const rk=await rowKeys(p);const me=(await clipOn(p,'music'))[0];const u0=(await st(p)).undo;
  const hb=await p.evaluate(id=>document.querySelector(`[data-clip-id="${id}"]`).firstElementChild.getBoundingClientRect().toJSON(),me.id);const gr=await X.grp(p,G).boundingBox();
  const x0=Math.round(Math.max(hb.x+60,620)),y0=Math.round(hb.y+hb.height/2),y1=Math.round(gr.y+gr.height/2);const tgt=await hit(p,x0,y1);
  await p.mouse.move(x0,y0);await p.mouse.down();const x1=x0+Math.round(X.PPS);for(let i=1;i<=12;i++){await p.mouse.move(Math.round(x0+(x1-x0)*i/12),Math.round(y0+(y1-y0)*i/12));await sleep(15);}await sleep(300);const gh=await ghost(p);await p.screenshot({path:`${SH}/drag-over-collapsed-${vp}.png`});
  await p.mouse.up();await sleep(500);const me2=(await X.clips(p)).find(c=>c.id===me.id);const a=await st(p);
  rec('FOLD-DRAG-OVER',JSON.stringify(rk)==='["T:video","T:music","G:ჯგუფი 1@0"]'&&tgt==='group'&&gh.every(l=>l==='music')&&me2.lane==='music'&&Math.abs(me2.start-(me.start+1))<0.05,{rows:rk,target:tgt,ghost:gh,after:{lane:me2.lane,start:me2.start},undo:[u0,a.undo],status:a.status});
  if(a.undo!==u0){await blur(p);await key(p,'Control+z');}});
 await T('FOLD-MARQUEE',async()=>{const out={};await ensure(p,G,true);await p.keyboard.press('Escape');await blur(p);await X.geo(p);
  const mu=await X.laneBox(p,'music');const gr=await X.grp(p,G).boundingBox();const x0=X.tx(0.12),y0=Math.round(mu.y+mu.h*0.6);out.m1start=await hit(p,x0,y0);
  await marquee(p,x0,y0,X.tx(7),Math.round(gr.y+gr.height/2),`${SH}/marquee1-${vp}.png`);out.m1={sel:await selClips(p),ovSel:await ovSel(p,G),status:(await st(p)).status};
  const ok1=out.m1start==='lane:music'&&out.m1.ovSel.length===0&&!out.m1.sel.some(l=>l==='stems'||l==='sfx');
  await p.keyboard.press('Escape');await sleep(200);
  // (2) ungroup G1, group {music, stems}, collapse
  await clickGroup(p,G);await key(p,'Control+Shift+g',500);out.afterUngroup=await rowKeys(p);
  await clickName(p,'music');await clickName(p,'stems',['Shift']);await blur(p);await key(p,'Control+g',500);const gn=(await rowKeys(p)).find(k=>k.startsWith('G:')).slice(2).replace(/@.*/,'');await fold(p,gn);out.rows2=await rowKeys(p);
  await p.keyboard.press('Escape');await blur(p);
  const vb=await X.laneBox(p,'video');const sb=await X.laneBox(p,'sfx');const vx=X.tx(3.4),vy=Math.round(vb.y+vb.h*0.5);out.m2start=await hit(p,vx,vy);
  await marquee(p,vx,vy,X.tx(5),Math.round(sb.y+sb.h*0.6),`${SH}/marquee2-${vp}.png`);out.m2={sel:await selClips(p),ovSel:await ovSel(p,gn),status:(await st(p)).status,allSel:(await X.clips(p)).filter(c=>c.sel).map(c=>c.lane+'@'+c.start)};
  const ok2=JSON.stringify(out.rows2)===JSON.stringify(['T:video',`G:${gn}@0`,'T:sfx'])&&out.m2.sel.includes('sfx')&&out.m2.ovSel.length===0&&!out.m2.sel.some(l=>l==='music'||l==='stems');
  // expand and check that no music/stems clip is selected
  await fold(p,gn);out.m2expanded=(await X.clips(p)).filter(c=>c.sel).map(c=>c.lane);
  rec('FOLD-MARQUEE',ok1&&ok2&&!out.m2expanded.some(l=>l==='music'||l==='stems'),{ok1,ok2,...out});});
 // ---- fresh page for nested + undo
 await L.fresh(p);await X.setup(p);
 await T('FOLD-UNDO',async()=>{const out={};const u0=(await st(p)).undo;await X.groupStemsSfx(p);await fold(p,G);out.collapsedRows=await rowKeys(p);
  await blur(p);await key(p,'Control+z',500);out.z={rows:await rowKeys(p),undo:(await st(p)).undo};
  const stc=(await clipOn(p,'stems'))[0];await clickClip(p,stc.id);out.selBeforeRedo=await selClips(p);await blur(p);
  await key(p,'Control+y',500);const g=await gstate(p,G);out.y={rows:await rowKeys(p),collapsed:g&&g.collapsed,ovSel:await ovSel(p,G),blocks:g&&g.overview&&g.overview.blocks.map(b=>[b.start,b.sel])};
  await p.screenshot({path:`${SH}/undo-redo-collapsed-${vp}.png`});
  await clickGroup(p,G);const fb=await focus(p);await key(p,'Control+Shift+g',500);out.ungroup={rows:await rowKeys(p),focus:await focus(p),focusBefore:fb};
  const ok=out.z.rows.length===4&&!out.z.rows.some(k=>k.startsWith('G:'))&&out.z.rows.includes('T:stems')&&out.y.collapsed===true&&JSON.stringify(out.y.rows)==='["T:video","T:music","G:ჯგუფი 1@0"]'&&JSON.stringify(out.y.ovSel)==='[2]'&&JSON.stringify(out.ungroup.rows)==='["T:video","T:music","T:stems","T:sfx"]'&&out.ungroup.focus&&out.ungroup.focus.row==='T:stems'&&out.ungroup.focus.tag==='BUTTON'&&/სტემები/.test(out.ungroup.focus.label||'');
  rec('FOLD-UNDO',ok,{u0,...out});});
 await T('FOLD-NESTED',async()=>{const out={};await X.groupStemsSfx(p);await fold(p,G);out.g1c=await rowKeys(p);
  await clickName(p,'music');await clickGroup(p,G,['Control']);out.sel=await X.selected(p);await blur(p);await key(p,'Control+g',500);out.afterNest={rows:await rowKeys(p),g1:(await gstate(p,G)).collapsed};
  await fold(p,'ჯგუფი 2');out.g2c={rows:await rowKeys(p),lanes:await laneIds(p)};await p.screenshot({path:`${SH}/nested-g2-collapsed-${vp}.png`});
  const g2=await gstate(p,'ჯგუფი 2');out.g2ov=g2.overview.blocks.map(b=>b.start).sort((a,b)=>a-b);out.g2label=g2.nameLabel;
  await fold(p,'ჯგუფი 2');out.g2e={rows:await rowKeys(p),g1:(await gstate(p,G)).collapsed};await p.screenshot({path:`${SH}/nested-g2-expanded-${vp}.png`});
  await fold(p,G);out.g1e=await rowKeys(p);
  const ok=JSON.stringify(out.afterNest.rows)==='["T:video","G:ჯგუფი 2@0","T:music","G:ჯგუფი 1@1"]'&&out.afterNest.g1===true&&JSON.stringify(out.g2c.rows)==='["T:video","G:ჯგუფი 2@0"]'&&JSON.stringify(out.g2c.lanes)==='["video"]'&&JSON.stringify(out.g2ov)==='[0.35,2,4]'&&JSON.stringify(out.g2e.rows)==='["T:video","G:ჯგუფი 2@0","T:music","G:ჯგუფი 1@1"]'&&out.g2e.g1===true&&out.g1e.length===6;
  rec('FOLD-NESTED',ok,out);});
 // ---- REG-TG quick stage 1
 await L.fresh(p);await X.decline(p);
 await T('REG-TG',async()=>{const out={};await X.groupStemsSfx(p,false);out.g={rows:await rowKeys(p),undo:(await st(p)).undo,focus:(await focus(p)).testid};
  await key(p,'F2');await p.keyboard.press('Control+a');await p.keyboard.insertText('ბგერები');await key(p,'Enter');out.rename={rows:await rowKeys(p),undo:(await st(p)).undo};
  await key(p,'Control+Shift+g',500);out.ungroup={rows:await rowKeys(p),undo:(await st(p)).undo,focus:await focus(p)};
  await clickName(p,'video');await clickName(p,'music',['Control']);await blur(p);const b=(await st(p)).undo;await key(p,'Control+g');out.refuse={status:(await st(p)).status,undoSame:(await st(p)).undo===b,rows:await rowKeys(p)};
  const ok=out.g.undo==='Undo: Group Tracks'&&out.g.focus==='arrangement-group-name'&&out.rename.undo==='Undo: Rename Group'&&out.rename.rows.includes('G:ბგერები@0')&&out.ungroup.undo==='Undo: Ungroup Tracks'&&out.ungroup.rows.length===4&&out.ungroup.focus.tag!=='BODY'&&/ვიდეო ხაზი ჯგუფში ვერ შევა/.test(out.refuse.status)&&out.refuse.undoSame&&out.refuse.rows.length===4;
  rec('REG-TG',ok,out);});
 await X.finish(s,rec,'Q2-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
