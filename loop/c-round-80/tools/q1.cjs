const X=require('./h80.cjs');const{L,sleep,st,blur,key,focus,gstate,fold,foldBtn,rowKeys,laneIds,laneH,clickName,clickGroup}=X;
const vp=process.argv[2]||'1440x900';const OUT=`${L.OUT}/q1-${vp}.json`;const rec=X.mkRec(OUT);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const G='ჯგუფი 1';
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);
 const S=await X.setup(p);const h0=await laneH(p);rec('SETUP',S.clips.length===3&&S.snap==='off',{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),laneH:h0,geo:S.geo});
 await T('FOCUS-GROUP',async()=>{await clickName(p,'stems');await clickName(p,'sfx',['Shift']);const f0=await focus(p);await key(p,'Control+g',500);const f1=await focus(p);const u1=(await st(p)).undo;
  await key(p,'F2');const inp=await p.locator('[data-testid=arrangement-group-name-input]').count();const fi=await focus(p);await key(p,'Escape');const f2=await focus(p);
  rec('FOCUS-GROUP',f1&&f1.testid==='arrangement-group-name'&&/^ჯგუფი 1 — ჯგუფი/.test(f1.label)&&inp===1&&fi.testid==='arrangement-group-name-input'&&u1==='Undo: Group Tracks',{f0,f1,u1,inp,fi,afterEsc:f2,rows:await rowKeys(p)});});
 const hG=await laneH(p);
 await T('HINT',async()=>{const t=await p.locator('[data-testid=arrangement-shortcut-hint]').innerText();rec('HINT',t.includes('Ctrl+G / Ctrl+Shift+G · F2 · U'),{tail:t.slice(-80)});});
 await T('FOLD-BUTTON',async()=>{const u0=(await st(p)).undo;const e0=await gstate(p,G);await blur(p);await fold(p,G);const c=await gstate(p,G);const ids=await laneIds(p);const uc=(await st(p)).undo;const fc=await focus(p);
  await p.screenshot({path:`${SH}/fold-collapsed-${vp}.png`});
  await fold(p,G);const e=await gstate(p,G);const ids2=await laneIds(p);const h2=await laneH(p);const ue=(await st(p)).undo;
  await p.screenshot({path:`${SH}/fold-expanded-${vp}.png`});
  const heightsBack=['video','music','stems','sfx'].every(k=>Math.abs(h2[k]-hG[k])<=0.5);
  const ok=e0.ariaExpanded==='true'&&c.collapsed&&c.ariaExpanded==='false'&&/▸/.test(c.glyph)&&c.dataGlyph==='▸'&&!ids.includes('stems')&&!ids.includes('sfx')&&c.overview&&c.overview.blocks.length===2&&uc===u0&&e.ariaExpanded==='true'&&/▾/.test(e.glyph)&&ids2.includes('stems')&&ids2.includes('sfx')&&heightsBack&&ue===u0&&!e.overview&&c.foldBox[0]>=24&&c.foldBox[1]>=24&&c.rowH===28&&e.rowH===28;
  rec('FOLD-BUTTON',ok,{u0,uc,ue,expandedBefore:e0,collapsed:c,lanesCollapsed:ids,focusAfterClick:fc,expanded:{ariaExpanded:e.ariaExpanded,glyph:e.glyph,overview:e.overview},lanesExpanded:ids2,hBefore:hG,hAfter:h2,heightsBack,labelNote:'fold aria-label order differs from C2 (A deviation 1)'});});
 await T('FOLD-SPACE',async()=>{await foldBtn(p,G).focus();const pos0=await X.posOf(p);await key(p,'Space',500);const c=await gstate(p,G);const pos1=await X.posOf(p);const play=await p.evaluate(()=>window.__src.length);await key(p,'Space',500);const e=await gstate(p,G);
  rec('FOLD-SPACE',c.collapsed&&!e.collapsed&&pos0===pos1&&play===0,{c:c.collapsed,e:e.collapsed,pos:[pos0,pos1],src:play});});
 await T('FOLD-U',async()=>{const out={};
  await clickGroup(p,G);await blur(p);await key(p,'u');out.u1={c:(await gstate(p,G)).collapsed,lanes:await laneIds(p),undo:(await st(p)).undo};await key(p,'u');out.u2={c:(await gstate(p,G)).collapsed,lanes:await laneIds(p)};
  // (2) only music
  await clickName(p,'music');await blur(p);const b2=await st(p);await key(p,'u');const a2=await st(p);out.s2={status:a2.status,c:(await gstate(p,G)).collapsed,undoSame:a2.undo===b2.undo};
  // (3) typing in BPM and search, with group selected
  await clickGroup(p,G);const bpm=p.locator('[data-testid=arrangement-tempo-input]');out.s3={};
  if(await bpm.count()){await bpm.focus();const v0=await bpm.inputValue();await key(p,'u');out.s3.bpm={c:(await gstate(p,G)).collapsed,v0,v1:await bpm.inputValue()};await key(p,'Escape');}
  const search=p.locator('input[type=search], input[placeholder*="ძებნ"]').first();if(await search.count()){await search.focus();await key(p,'u');out.s3.search={c:(await gstate(p,G)).collapsed,v:await search.inputValue()};await search.fill('');}
  await blur(p);
  // (4) ctrl+u / shift+u
  await clickGroup(p,G);await blur(p);await key(p,'Control+u');const cu=(await gstate(p,G)).collapsed;await key(p,'Shift+U');const su=(await gstate(p,G)).collapsed;await key(p,'Alt+u');const au=(await gstate(p,G)).collapsed;out.s4={ctrlU:cu,shiftU:su,altU:au};
  // (5a) A's note: ArrowUp fully (down+up) on stems fader then U
  await clickGroup(p,G,['Control']);await clickGroup(p,G);out.selG=await X.selected(p);
  const vol=p.locator('[data-track-id=stems] input[aria-label^="Volume"]').first();await vol.focus();const v0=await vol.inputValue();const ub=(await st(p)).undo;
  await key(p,'ArrowDown');const v1=await vol.inputValue();const ua=(await st(p)).undo;await key(p,'u');const a5=await st(p);
  out.s5a={v0,v1,undoBefore:ub,undoAfterArrow:ua,status:a5.status,c:(await gstate(p,G)).collapsed,lanes:await laneIds(p),focus:await focus(p)};
  // (5b) true pending: keydown ArrowUp held, u, then keyup
  await vol.focus();const ub2=(await st(p)).undo;await p.keyboard.down('ArrowDown');await sleep(150);await p.keyboard.press('u');await sleep(300);const mid=await st(p);const cMid=(await gstate(p,G)).collapsed;const lanesMid=await laneIds(p);await p.keyboard.up('ArrowDown');await sleep(400);const end=await st(p);
  out.s5b={undoBefore:ub2,statusMid:mid.status,collapsedMid:cMid,lanesMid,undoAfter:end.undo,vol:await vol.inputValue()};
  // history: one volume entry per step -> undo once returns to previous
  await blur(p);await key(p,'Control+z');const z1=await st(p);out.s5b.afterUndo1=z1.undo;out.s5b.volAfterUndo1=await vol.inputValue();await key(p,'Control+y');
  // (5c) mouse-focused fader with nothing pending then U (reviewer #2)
  const vb=await vol.boundingBox();await clickGroup(p,G);await vol.focus();await key(p,'u');out.s5c={status:(await st(p)).status,c:(await gstate(p,G)).collapsed,note:'fader focused, nothing pending'};await blur(p);
  const GEST=out.s5a.status;
  const ok=out.u1.c===true&&!out.u1.lanes.includes('stems')&&out.u2.c===false&&out.u2.lanes.includes('sfx')&&out.s2.status==='დასაკეცად მონიშნე ჯგუფი — დააწკაპუნე ჯგუფის სახელზე.'&&out.s2.c===false&&out.s2.undoSame&&(!out.s3.bpm||out.s3.bpm.c===false)&&(!out.s3.search||out.s3.search.c===false)&&!cu&&!su&&
   out.s5a.c===false&&out.s5a.lanes.includes('stems')&&out.s5a.v1!==out.s5a.v0&&/Volume/i.test(out.s5a.undoAfterArrow||'')&&out.s5b.collapsedMid===false&&out.s5b.lanesMid.includes('stems')&&/Volume/i.test(out.s5b.undoAfter||'');
  rec('FOLD-U',ok,out);});
 await T('FOLD-A11Y',async()=>{await clickGroup(p,G);await blur(p);await key(p,'u',500);const g=await gstate(p,G);
  const nb=X.grp(p,G).locator('[data-testid=arrangement-group-name]');await nb.focus();const seq=[];for(let i=0;i<40;i++){await p.keyboard.press('Tab');await sleep(25);const f=await focus(p);seq.push(f&&(f.row||f.testid||f.tag));}
  const hiddenFocusable=await p.evaluate(()=>[...document.querySelectorAll('button,input,[tabindex]')].filter(e=>{const r=e.closest('[data-track-id]');return r&&(r.dataset.trackId==='stems'||r.dataset.trackId==='sfx')}).length);
  const tl=p.locator('[data-testid=arrangement-timeline-scroller]');const aria=await tl.ariaSnapshot();const ariaMain=await p.locator('main').first().ariaSnapshot().catch(()=>'');
  const hasHidden=/სტემები|SFX/.test(aria.replace(/ჯგუფი 1[^\n]*/g,''));
  require('fs').writeFileSync(`${L.OUT}/aria-collapsed-${vp}.txt`,aria);
  const ok=g.collapsed&&g.nameLabel==='ჯგუფი 1 — ჯგუფი, დაკეცილი, 2 კლიპი, მონიშნული'&&!seq.some(x=>x==='T:stems'||x==='T:sfx')&&hiddenFocusable===0&&!hasHidden;
  rec('FOLD-A11Y',ok,{nameLabel:g.nameLabel,tabSeq:seq,hiddenFocusable,ariaHasStemsOrSfx:hasHidden,ariaLines:aria.split('\n').length,mainHasSfx:/SFX/.test(ariaMain)});});
 await T('FOLD-OVERVIEW',async()=>{const out={};const cl=S.clips.filter(c=>c.lane!=='music');const chk=async lab=>{const z=await X.geo(p);const g=await gstate(p,G);const r=g.overview.blocks.map(b=>{const c=cl.find(c=>Math.abs(c.start-b.start)<0.002);return{...b,exp:c?{start:c.start,dur:c.dur,left:c.start*z.PPS,width:c.dur*z.PPS}:null}});out[lab]={pps:z.PPS,blocks:r};return r.length===2&&r.every(b=>b.exp&&Math.abs(b.left-b.exp.left)<=1&&Math.abs(b.width-b.exp.width)<=1.5&&Math.abs(b.end-b.start-b.exp.dur)<=0.01);};
  const ok1=await chk('default');await p.screenshot({path:`${SH}/overview-default-${vp}.png`});
  await blur(p);await key(p,'+',400);await key(p,'+',600);const ok2=await chk('zoom2');out.stillCollapsed=(await gstate(p,G)).collapsed;await p.screenshot({path:`${SH}/overview-zoom-${vp}.png`});
  await key(p,'Control+a',400);const ga=await gstate(p,G);out.ctrlA=ga.overview.blocks.map(b=>[b.id,b.sel,b.bg]);await p.screenshot({path:`${SH}/overview-ctrlA-${vp}.png`});
  await key(p,'-',400);await key(p,'-',600);await p.keyboard.press('Escape');await sleep(300);
  rec('FOLD-OVERVIEW',ok1&&ok2&&out.default.pps!==out.zoom2.pps&&ga.overview.blocks.every(b=>b.sel)&&out.stillCollapsed,{...out,clipsRef:cl.map(c=>[c.lane,c.start,c.dur])});});
 await T('REG-ZOOM-KEYS',async()=>{await clickGroup(p,G);await blur(p);const c0=(await gstate(p,G)).collapsed;const z0=(await X.geo(p)).PPS;await key(p,'+',500);const z1=(await X.geo(p)).PPS;const c1=(await gstate(p,G)).collapsed;await key(p,'-',500);const z2=(await X.geo(p)).PPS;const c2=(await gstate(p,G)).collapsed;
  rec('REG-ZOOM-KEYS',z1>z0&&z2<z1&&c0===c1&&c1===c2,{z:[z0,z1,z2],c:[c0,c1,c2]});});
 // expand for next
 if((await gstate(p,G)).collapsed)await fold(p,G);
 await T('FOCUS-HIDDEN',async()=>{await clickName(p,'music');await clickGroup(p,G,['Control']);await clickName(p,'stems',['Control']);const f0=await focus(p);const sel=await X.selected(p);await key(p,'u',500);const g=await gstate(p,G);const f1=await focus(p);
  rec('FOCUS-HIDDEN',sel.includes('G:'+G)&&f0.row==='T:stems'&&g.collapsed&&f1&&f1.testid==='arrangement-group-name'&&f1.row==='G:'+g.id,{sel,f0,f1,collapsed:g.collapsed});
  if(g.collapsed)await fold(p,G);});
 await T('REG-LANE-FOLD',async()=>{const q=p.locator('[data-track-id=stems] [data-testid=arrangement-track-fold]').first();await q.click();await sleep(450);const h1=(await laneH(p)).stems;const f1=await p.locator('[data-track-id=stems]').getAttribute('data-track-folded');
  await fold(p,G);const gone=!(await laneIds(p)).includes('stems');await fold(p,G);const f2=await p.locator('[data-track-id=stems]').getAttribute('data-track-folded');const h2=(await laneH(p)).stems;
  await p.locator('[data-track-id=stems] [data-testid=arrangement-track-fold]').first().click();await sleep(450);const f3=await p.locator('[data-track-id=stems]').getAttribute('data-track-folded');const h3=(await laneH(p)).stems;
  rec('REG-LANE-FOLD',f1==='true'&&h1===36&&gone&&f2==='true'&&h2===36&&f3!=='true'&&h3>36,{f1,h1,gone,f2,h2,f3,h3});});
 await X.finish(s,rec,'Q1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
