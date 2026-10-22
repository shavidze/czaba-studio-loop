const H=require('./h.cjs');const{L,sleep,st,blur,rows,groupDom,selected,active,clickName,clickGroup}=H;
const vp=process.argv[2]||'1440x900';const OUT=`${L.OUT}/p1-${vp}.json`;const rec=H.mkRec(OUT);const T=H.T(rec);
const key=async(p,k)=>{await p.keyboard.press(k);await sleep(300);};
const kinds=r=>r.map(x=>x.k.replace(/@.*/,'')+(x.k.startsWith('G:')?'@'+x.k.split('@')[1]:''));
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await H.decline(p);
 // TG-REFUSE(5) first: empty selection on fresh load
 await T('TG-REFUSE-5',async()=>{await blur(p);const b=await st(p);const sel0=await selected(p);await key(p,'Control+g');const a=await st(p);const g=await groupDom(p);
  rec('TG-REFUSE-5',sel0.length===0&&/ჯერ მონიშნე ხაზები/.test(a.status)&&a.undo===b.undo&&g.count===0,{sel0,before:b,after:a,groups:g.count});});
 const S=await H.setup(p);rec('SETUP',S.clips.length===3&&S.snap==='off',S);
 const base=await rows(p);
 await p.screenshot({path:`${L.OUT}/shots/setup-${vp}.png`});
 await T('TG-SELECT',async()=>{const out=[];const step=async(lab,t,m)=>{await clickName(p,t,m);out.push({lab,sel:await selected(p),active:await active(p)});};
  await step('click music','music',[]);await step('shift stems','stems',['Shift']);await step('ctrl sfx','sfx',['Control']);await step('ctrl sfx again','sfx',['Control']);
  const exp=[['music'],['music','stems'],['music','stems','sfx'],['music','stems']];const act=['music','stems','sfx','sfx'];
  const ok=out.every((o,i)=>JSON.stringify([...o.sel].sort())===JSON.stringify([...exp[i]].sort())&&JSON.stringify(o.active)===JSON.stringify([act[i]]));
  const lab=await p.locator(H.nameSel('music')).getAttribute('aria-label');
  rec('TG-SELECT',ok&&/მონიშნული$/.test(lab),{out,musicLabel:lab});});
 await T('TG-GROUP',async()=>{await clickName(p,'music');await clickName(p,'stems',['Shift']);const b=await st(p);await blur(p);await key(p,'Control+g');const a=await st(p);const r=await rows(p);const g=await groupDom(p);
  const dom=await p.evaluate(()=>{const m=document.querySelector('[data-track-id=music]');const prev=m.previousElementSibling;return{prevIsGroup:!!(prev&&prev.dataset.groupId),prevDepth:prev&&prev.dataset.groupDepth,sameParent:prev&&prev.parentElement===m.parentElement}});
  await p.screenshot({path:`${L.OUT}/shots/tg-group-${vp}.png`});
  const pad=Object.fromEntries(r.map(x=>[x.k,x.padL]));
  const okA=JSON.stringify(r.map(x=>x.k))===JSON.stringify(['T:video','G:ჯგუფი 1@0','T:music','T:stems','T:sfx'])&&dom.prevIsGroup&&dom.sameParent&&a.status==='ჯგუფი «ჯგუფი 1» შეიქმნა: მუსიკა, სტემები.'&&a.undo==='Undo: Group Tracks'&&pad['T:music']==='20px'&&pad['T:stems']==='20px'&&pad['T:sfx']===base.find(x=>x.k==='T:sfx').padL&&g.withTrackId===0&&g.btnH.every(h=>h>=24);
  const selAfter=await selected(p);
  await blur(p);await key(p,'Control+z');const u=await st(p);const ru=await rows(p);
  await key(p,'Control+y');const y=await st(p);const ry=await rows(p);
  const ok=okA&&ru.length===4&&ry.length===5&&JSON.stringify(selAfter)===JSON.stringify(['G:ჯგუფი 1']);
  rec('TG-GROUP',ok,{before:b,after:a,rows:r,dom,groupDom:g,selAfter,afterUndo:{undo:u.undo,rows:ru.map(x=>x.k)},afterRedo:{undo:y.undo,rows:ry.map(x=>x.k)},baselinePad:base.map(x=>[x.k,x.padL])});
  // clean: undo back to no groups
  await blur(p);await key(p,'Control+z');});
 await T('TG-NEST',async()=>{const u0=(await st(p)).undo;await clickName(p,'stems');await clickName(p,'sfx',['Shift']);await blur(p);await key(p,'Control+g');const s1=await st(p);
  await clickName(p,'music');await clickGroup(p,'ჯგუფი 1',['Control']);const sel=await selected(p);await blur(p);await key(p,'Control+g');const s2=await st(p);const r=await rows(p);
  await p.screenshot({path:`${L.OUT}/shots/tg-nest-${vp}.png`});
  const exp=['T:video','G:ჯგუფი 2@0','T:music','G:ჯგუფი 1@1','T:stems','T:sfx'];const pad=Object.fromEntries(r.map(x=>[x.k,x.padL]));
  // history: undo twice returns to u0
  await blur(p);await key(p,'Control+z');const h1=await st(p);await key(p,'Control+z');const h2=await st(p);const r0=await rows(p);await key(p,'Control+y');await key(p,'Control+y');const r2=await rows(p);
  const ok=JSON.stringify(r.map(x=>x.k))===JSON.stringify(exp)&&pad['T:music']==='20px'&&pad['T:stems']==='32px'&&pad['T:sfx']==='32px'&&s1.undo==='Undo: Group Tracks'&&s2.undo==='Undo: Group Tracks'&&/«ჯგუფი 2» შეიქმნა: მუსიკა, ჯგუფი 1/.test(s2.status)&&h2.undo===u0&&r0.length===4&&JSON.stringify(r2.map(x=>x.k))===JSON.stringify(exp)&&JSON.stringify(sel.sort())===JSON.stringify(['G:ჯგუფი 1','music']);
  rec('TG-NEST',ok,{sel,s1:s1.status,s2:s2.status,rows:r,undoChain:[h1.undo,h2.undo,u0],afterTwoUndo:r0.map(x=>x.k),afterRedo:r2.map(x=>x.k)});});
 await T('TG-RENAME',async()=>{const out={};await clickGroup(p,'ჯგუფი 1');const u0=(await st(p)).undo;const snap0=(await st(p)).snap;const pos0=await H.posOf(p);const mk0=await p.locator('[data-testid=arrangement-marker]').count();
  await p.locator('[data-testid=arrangement-group-name]',{hasText:'ჯგუფი 1'}).focus();await key(p,'F2');out.inputOpen=await p.locator('[data-testid=arrangement-group-name-input]').count();
  await p.keyboard.press('Control+a');await p.keyboard.insertText('SFX ქუჩა');await p.keyboard.press('Space');await p.keyboard.press('g');await p.keyboard.press('m');await sleep(200);
  out.draft=await p.inputValue('[data-testid=arrangement-group-name-input]');const mid=await st(p);out.midSnap=mid.snap;out.midMarkers=await p.locator('[data-testid=arrangement-marker]').count();out.midPos=await H.posOf(p);
  // remove the typed ' gm' to commit exactly 'SFX ქუჩა'
  for(let i=0;i<3;i++)await p.keyboard.press('Backspace');await key(p,'Enter');const a=await st(p);out.afterEnter={undo:a.undo,status:a.status,focus:a.focus,rows:(await rows(p)).map(x=>x.k)};
  await sleep(1000);out.posAfter=await H.posOf(p);
  // F2 + Escape
  await key(p,'F2');await p.keyboard.insertText('xxx');await key(p,'Escape');const e=await st(p);out.afterEscape={undo:e.undo,rows:(await rows(p)).map(x=>x.k),focus:e.focus};
  // F2 clear Enter
  await key(p,'F2');await p.keyboard.press('Control+a');await p.keyboard.press('Backspace');await key(p,'Enter');const c=await st(p);out.afterEmpty={undo:c.undo,status:c.status,rows:(await rows(p)).map(x=>x.k),focus:c.focus};
  // F2 same name Enter -> no history
  await key(p,'F2');await key(p,'Enter');const sm=await st(p);out.afterSame={undo:sm.undo};
  // undo rename
  await blur(p);await key(p,'Control+z');out.afterUndo={undo:(await st(p)).undo,rows:(await rows(p)).map(x=>x.k)};await key(p,'Control+y');out.afterRedo=(await rows(p)).map(x=>x.k);
  await p.screenshot({path:`${L.OUT}/shots/tg-rename-${vp}.png`});
  const has=(r,n)=>r.some(k=>k.startsWith('G:'+n+'@'));
  const ok=out.inputOpen===1&&out.draft==='SFX ქუჩა gm'&&out.midSnap===snap0&&out.midMarkers===mk0&&out.midPos===pos0&&out.afterEnter.undo==='Undo: Rename Group'&&has(out.afterEnter.rows,'SFX ქუჩა')&&out.afterEnter.focus==='arrangement-group-name'&&has(out.afterEscape.rows,'SFX ქუჩა')&&out.afterEscape.undo==='Undo: Rename Group'&&out.afterEscape.focus==='arrangement-group-name'&&out.afterEmpty.status==='სახელი ცარიელია — დარჩა «SFX ქუჩა»'&&has(out.afterEmpty.rows,'SFX ქუჩა')&&out.afterEmpty.undo==='Undo: Rename Group'&&out.afterSame.undo==='Undo: Rename Group'&&has(out.afterUndo.rows,'ჯგუფი 1')&&has(out.afterRedo,'SFX ქუჩა');
  rec('TG-RENAME',ok,{...out,u0,snap0,pos0,mk0,note:'space/g/m pressed as real keydowns inside the input'});});
 await T('TG-REFUSE-1-4',async()=>{const out={};const chk=async(lab,fn,k,re)=>{await fn();const b=await st(p);const g0=(await groupDom(p)).count;await blur(p);await key(p,k);const a=await st(p);const g1=(await groupDom(p)).count;out[lab]={sel:await selected(p),status:a.status,undoSame:a.undo===b.undo,groupsSame:g0===g1,ok:re.test(a.status)&&a.undo===b.undo&&g0===g1};};
  await chk('1-video',async()=>{await clickName(p,'video');await clickName(p,'music',['Control']);},'Control+g',/ვიდეო ხაზი ჯგუფში ვერ შევა/);
  // gap needs ungrouped stems: temporarily on current nested state music(d1 of G2) & sfx(d2): mixed parents instead; use (3) here
  await chk('3-mixed',async()=>{await clickName(p,'stems');await clickName(p,'music',['Control']);},'Control+g',/სხვადასხვა ჯგუფშია/);
  await chk('4-noGroup',async()=>{await clickName(p,'music');await clickName(p,'stems',['Control']);},'Control+Shift+g',/დასაშლელად მონიშნე ჯგუფი/);
  // (2) gap: undo to no-groups state, then {music,sfx}
  await blur(p);for(let i=0;i<4;i++){if((await groupDom(p)).count===0)break;await key(p,'Control+z');}
  out.groupsBeforeGap=(await groupDom(p)).count;
  await chk('2-gap',async()=>{await clickName(p,'music');await clickName(p,'sfx',['Control']);},'Control+g',/მეზობელი ხაზები/);
  rec('TG-REFUSE-1-4',Object.values(out).filter(o=>typeof o==='object').every(o=>o.ok)&&out.groupsBeforeGap===0,out);
  // redo back to nested state
  for(let i=0;i<4;i++){await key(p,'Control+y');}out.redoRows=(await rows(p)).map(x=>x.k);});
 await T('TG-UNGROUP',async()=>{const r0=await rows(p);const out={start:r0.map(x=>x.k)};const g2=r0.find(x=>/G:ჯგუფი 2|G:.*@0/.test(x.k));
  const outer=r0.filter(x=>x.k.startsWith('G:')&&x.k.endsWith('@0')).map(x=>x.k.slice(2,-2))[0];const inner=r0.filter(x=>x.k.startsWith('G:')&&x.k.endsWith('@1')).map(x=>x.k.slice(2,-2))[0];
  await clickGroup(p,outer);await blur(p);await key(p,'Control+Shift+g');let a=await st(p);out.step1={outer,undo:a.undo,status:a.status,sel:await selected(p),rows:(await rows(p))};
  await clickGroup(p,inner);await blur(p);await key(p,'Control+Shift+g');a=await st(p);out.step2={inner,undo:a.undo,status:a.status,sel:await selected(p),rows:(await rows(p))};
  await p.screenshot({path:`${L.OUT}/shots/tg-ungroup-${vp}.png`});
  const s1k=out.step1.rows.map(x=>x.k);const endRows=out.step2.rows;
  const ok=out.step1.undo==='Undo: Ungroup Tracks'&&JSON.stringify(s1k)===JSON.stringify(['T:video','T:music',`G:${inner}@0`,'T:stems','T:sfx'])&&out.step2.undo==='Undo: Ungroup Tracks'&&JSON.stringify(endRows.map(x=>x.k))===JSON.stringify(base.map(x=>x.k))&&endRows.every((x,i)=>x.padL===base[i].padL)&&JSON.stringify(out.step1.sel.sort())===JSON.stringify([`G:${inner}`,'music'])&&JSON.stringify(out.step2.sel.sort())===JSON.stringify(['sfx','stems']);
  rec('TG-UNGROUP',ok,{...out,step1:{...out.step1,rows:s1k},step2:{...out.step2,rows:endRows.map(x=>[x.k,x.padL,x.h])},base:base.map(x=>[x.k,x.padL,x.h])});});
 await T('REG-SNAP-G',async()=>{await blur(p);const a=(await st(p)).snap;const g0=(await groupDom(p)).count;await clickName(p,'music');await clickName(p,'stems',['Shift']);await blur(p);await key(p,'g');const b=(await st(p)).snap;await key(p,'g');const c=(await st(p)).snap;const g1=(await groupDom(p)).count;
  rec('REG-SNAP-G',a!==b&&a===c&&g0===g1,{a,b,c,g0,g1});});
 await T('TG7-TYPING',async()=>{await clickName(p,'music');await clickName(p,'stems',['Shift']);const out={};
  const bpm=p.locator('[data-testid=arrangement-tempo-input]');if(await bpm.count()){await bpm.focus();const b=await st(p);await key(p,'Control+g');out.bpm={groups:(await groupDom(p)).count,undoSame:(await st(p)).undo===b.undo};}
  const search=p.locator('input[type=search], input[placeholder*="ძებნ"]').first();if(await search.count()){await search.focus();const b=await st(p);await key(p,'Control+g');out.search={groups:(await groupDom(p)).count,undoSame:(await st(p)).undo===b.undo};}
  rec('TG7-TYPING',!!out.bpm&&out.bpm.groups===0&&out.bpm.undoSame&&(!out.search||out.search.groups===0&&out.search.undoSame),out);await blur(p);});
 await T('MOD-SWEEP',async()=>{const out={};const cnt=async()=>(await H.clips(p)).length;
  const pick=async()=>{const sfx=(await H.clips(p)).find(c=>c.lane==='sfx'&&c.start===4);const hb=await p.locator(`[data-clip-id="${sfx.id}"]`).boundingBox();await p.mouse.click(hb.x+hb.width/2,hb.y+hb.height*0.25);await sleep(250);await blur(p);return (await H.clips(p)).filter(c=>c.sel).map(c=>c.lane+'@'+c.start);};await pick();
  out.sel=(await H.clips(p)).filter(c=>c.sel).map(c=>c.lane);const n0=await cnt();
  await key(p,'Control+c');out.c=(await st(p)).status;await key(p,'Control+v');out.v={n:await cnt(),undo:(await st(p)).undo};await key(p,'Control+z');
  out.selD=await pick();await key(p,'Control+d');out.d={n:await cnt(),undo:(await st(p)).undo};await key(p,'Control+z');
  out.selX=await pick();await key(p,'Control+x');out.x={n:await cnt(),undo:(await st(p)).undo};await key(p,'Control+z');out.z={n:await cnt()};await key(p,'Control+y');out.y={n:await cnt(),undo:(await st(p)).undo};await key(p,'Control+z');
  await key(p,'Control+a');out.a=(await H.clips(p)).filter(c=>c.sel).length;
  await H.clickName(p,'music');await blur(p);
  const lb=await H.laneBox(p,'music');const y=Math.round(lb.y+lb.h*0.75);await p.mouse.move(H.tx(2),y);await p.mouse.down();await p.mouse.move(H.tx(3),y,{steps:5});await p.mouse.move(H.tx(4),y,{steps:5});await p.mouse.up();await sleep(250);await blur(p);out.range=(await st(p)).range;
  await key(p,'Control+l');out.l={loop:(await st(p)).loop,undo:(await st(p)).undo};
  out.n0=n0;const ok=out.sel.length===1&&out.v.n===n0+1&&out.d.n===n0+1&&out.x.n===n0-1&&out.z.n===n0&&out.y.n===n0-1&&out.a===n0&&!!out.l.loop;
  rec('MOD-SWEEP',ok,out);});
 await H.finish(s,rec,'P1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
