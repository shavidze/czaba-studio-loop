const X=require('./lib81.cjs');const{L,sleep,st,blur,key,focus,fold,rowKeys,gstate,clickName,clickGroup,G1,G2,mix}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r1-${vp}.json`);const T=X.T(rec);
const hdr=(p,n)=>p.evaluate(n=>{const r=[...document.querySelectorAll('[data-testid=arrangement-group-row]')].find(e=>e.querySelector('[data-testid=arrangement-group-name]').textContent.replace('▣','').trim()===n);if(!r)return null;const h=r.querySelector('[data-testid=arrangement-group-header]');const box=e=>{const b=e.getBoundingClientRect();return[+b.width.toFixed(1),+b.height.toFixed(1)]};
 const kids=[...h.children].map(e=>e.getAttribute('data-testid'));const g=t=>r.querySelector(`[data-testid=${t}]`);const m=g('arrangement-group-mute'),s=g('arrangement-group-solo'),v=g('arrangement-group-volume'),nm=g('arrangement-group-name');
 const tn=[];const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);while(w.nextNode()){const t=w.currentNode.textContent;if(t.trim())tn.push(t)}
 return{rowH:r.getBoundingClientRect().height,text:r.textContent,textNodes:tn,kids,depth:+r.dataset.groupDepth,collapsed:r.dataset.groupCollapsed==='true',
  name:{w:box(nm)[0],label:nm.getAttribute('aria-label')},
  mute:{box:box(m),label:m.getAttribute('aria-label'),title:m.title,pressed:m.getAttribute('aria-pressed'),glyph:getComputedStyle(m,'::before').content,text:m.textContent},
  solo:{box:box(s),label:s.getAttribute('aria-label'),title:s.title,pressed:s.getAttribute('aria-pressed'),ds:s.dataset.solo,glyph:getComputedStyle(s,'::before').content,bgImg:getComputedStyle(s).backgroundImage,bg:getComputedStyle(s).backgroundColor,border:getComputedStyle(s).borderColor,color:getComputedStyle(s).color,cls:s.className,text:s.textContent},
  vol:{box:box(v),type:v.type,min:v.min,max:v.max,step:v.step,label:v.getAttribute('aria-label'),vt:v.getAttribute('aria-valuetext'),title:v.title,minW:getComputedStyle(v).minWidth}}},n);
const M4=(h,n)=>h&&h.rowH===28&&h.textNodes.length===2&&h.textNodes.join('')==='▣'+n&&JSON.stringify(h.kids.slice(0,5))===JSON.stringify(['arrangement-group-fold','arrangement-group-name','arrangement-group-mute','arrangement-group-solo','arrangement-group-volume'])
 &&h.mute.box[0]>=24&&h.mute.box[1]>=24&&h.solo.box[0]>=24&&h.solo.box[1]>=24&&h.vol.box[0]>=48&&h.mute.label===`Mute — ${n} (ჯგუფი)`&&h.mute.title==='Mute'&&h.mute.glyph==='"M"'&&h.solo.label===`Solo — ${n} (ჯგუფი, Ctrl/Cmd+click ამატებს)`&&h.solo.glyph==='"S"'
 &&h.vol.type==='range'&&h.vol.min==='0'&&h.vol.max==='1'&&h.vol.step==='0.01'&&h.vol.label===`Volume — ${n} (ჯგუფი)`&&/^\d+%$/.test(h.vol.vt)&&h.vol.title===`Volume ${h.vol.vt}`&&h.mute.text===''&&h.solo.text==='';
const status=async p=>(await st(p)).status;
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p);rec('SETUP',S.clips.length===4&&S.snap==='off',{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),snap:S.snap,snapInit:S.snapInit});
 const vm=X.lMute(p,'video');await vm.click();await sleep(200);rec('VIDEO-MUTE',(await vm.getAttribute('aria-pressed'))==='true',{});
 await T('NOGROUP',async()=>{const n=await p.locator('[data-testid=arrangement-group-mute],[data-testid=arrangement-group-solo],[data-testid=arrangement-group-volume]').count();rec('NOGROUP',n===0,{n});});
 await X.makeG1(p);
 await T('GX-CONTROLS',async()=>{const e=await hdr(p,G1);const rk=await rowKeys(p);await p.screenshot({path:`${L.OUT}/shots/controls-expanded-${vp}.png`});
  await fold(p,G1);const c=await hdr(p,G1);const rk2=await rowKeys(p);await p.screenshot({path:`${L.OUT}/shots/controls-collapsed-${vp}.png`});await fold(p,G1);
  rec('GX-CONTROLS-D0',M4(e,G1)&&M4(c,G1)&&c.collapsed&&!e.collapsed&&JSON.stringify(rk)===JSON.stringify(['T:video','T:music','G:'+G1+'@0','T:stems','T:sfx']),{expanded:e,collapsed:c,rk,rk2});});
 // X1 (1)(2) + pointer refusal
 await T('X1-1',async()=>{const o={};const sel=await p.evaluate(()=>{const r=document.querySelector('[data-testid=arrangement-group-row]');return r.dataset.groupSelected==='true'});o.selBefore=sel;
  if(!sel)await clickGroup(p,G1,['Control']);o.selAfter=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-group-row]').dataset.groupSelected==='true');
  await X.gName(p,G1).focus();let i=0;for(;i<40;i++){await p.keyboard.press('Tab');const f=await focus(p);if(f&&f.row==='T:stems'&&f.tag==='INPUT'&&/^Volume/.test(f.label||''))break;}o.tabs=i+1;o.f0=await focus(p);
  const u0=(await st(p)).undo;o.u0=u0;await p.keyboard.press('u');await sleep(450);o.after=await st(p);o.f1=await focus(p);o.g=await gstate(p,G1);
  rec('X1-1',o.f0.row==='T:stems'&&o.g.collapsed&&o.after.undo===u0&&!/drag|გადატან|ჟესტ/i.test(o.after.status)&&o.f1.testid==='arrangement-group-name'&&o.f1.row&&o.f1.row.startsWith('G:'),o);});
 await T('X1-2',async()=>{const o={};await fold(p,G1);o.exp=(await gstate(p,G1)).collapsed===false;const sf=X.lVol(p,'stems');await sf.focus();o.v0=+(await sf.inputValue());const u0=(await st(p)).undo;o.u0=u0;
  await p.keyboard.down('ArrowDown');await sleep(150);await p.keyboard.press('u');await sleep(300);await p.keyboard.up('ArrowDown');await sleep(300);
  o.st=await st(p);o.f=await focus(p);o.collapsed=(await gstate(p,G1)).collapsed;await fold(p,G1);o.v1=+(await X.lVol(p,'stems').inputValue());
  await blur(p);await key(p,'Control+z',400);o.undo1={v:+(await X.lVol(p,'stems').inputValue()),u:(await st(p)).undo};await key(p,'Control+y',400);o.redo1={v:+(await X.lVol(p,'stems').inputValue()),u:(await st(p)).undo};
  rec('X1-2',o.collapsed&&o.st.undo==='Undo: Volume'&&Math.abs(o.v1-(o.v0-0.01))<1e-9&&o.undo1.v===o.v0&&o.undo1.u===u0&&o.redo1.v===o.v1,o);});
 await T('X1-REFUSE',async()=>{const o={};const sf=X.lVol(p,'stems');const b=await sf.boundingBox();o.v0=+(await sf.inputValue());await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2-6,b.y+b.height/2,{steps:3});await sleep(100);
  await p.keyboard.press('u');await sleep(300);o.st=await st(p);o.collapsed=(await gstate(p,G1)).collapsed;await p.mouse.up();await sleep(300);o.v1=+(await X.lVol(p,'stems').inputValue());o.u1=(await st(p)).undo;
  await blur(p);await key(p,'Control+z',400);o.vUndo=+(await X.lVol(p,'stems').inputValue());
  rec('X1-REFUSE',o.collapsed===false&&o.st.status.length>0,o);});
 // nest
 await X.makeG2(p);
 await T('GX-CONTROLS-D1',async()=>{const rk=await rowKeys(p);const h1=await hdr(p,G1),h2=await hdr(p,G2);await p.screenshot({path:`${L.OUT}/shots/controls-nested-${vp}.png`});
  rec('GX-CONTROLS-D1',M4(h1,G1)&&M4(h2,G2)&&h1.depth===1&&h1.name.w>=40&&JSON.stringify(rk)===JSON.stringify(['T:video','G:'+G2+'@0','T:music','G:'+G1+'@1','T:stems','T:sfx']),{rk,h1,h2});});
 await T('X1-3',async()=>{const o={};const gv=X.gVol(p,G1);await gv.focus();o.f0=await focus(p);o.v0=+(await gv.inputValue());o.u0=(await st(p)).undo;
  await p.keyboard.down('ArrowDown');await sleep(150);await X.foldBtn(p,G2).click();await sleep(400);await p.keyboard.up('ArrowDown');await sleep(300);
  o.st=await st(p);o.f=await focus(p);o.g2=(await gstate(p,G2)).collapsed;o.rk=await rowKeys(p);await fold(p,G2);o.v1=+(await X.gVol(p,G1).inputValue());
  await blur(p);await key(p,'Control+z',400);o.undo={v:+(await X.gVol(p,G1).inputValue()),u:(await st(p)).undo};await key(p,'Control+y',400);o.redo={v:+(await X.gVol(p,G1).inputValue()),u:(await st(p)).undo};
  rec('X1-3',o.g2&&o.st.undo==='Undo: Volume'&&Math.abs(o.v1-(o.v0-0.01))<1e-9&&o.undo.v===o.v0&&o.undo.u===o.u0&&o.redo.v===o.v1,o);});
 // HALF
 await T('GX-HALF',async()=>{const o={};await X.lSolo(p,'stems').click();await sleep(250);o.s1={m:await mix(p),h1:(await hdr(p,G1)).solo,h2:(await hdr(p,G2)).solo,u:(await st(p)).undo};
  const sb=await X.gSolo(p,G2).boundingBox();await p.screenshot({path:`${L.OUT}/shots/half-solo-${vp}.png`,clip:{x:Math.max(0,sb.x-200),y:sb.y-40,width:300,height:110}});await p.screenshot({path:`${L.OUT}/shots/half-solo-full-${vp}.png`});
  await X.gSolo(p,G1).click();await sleep(250);o.s2={m:await mix(p),u:(await st(p)).undo};
  await X.gSolo(p,G1).click();await sleep(250);o.s3={m:await mix(p),u:(await st(p)).undo};
  const g=x=>x.m.groups,t=x=>x.m.tracks;
  rec('GX-HALF',g(o.s1)[G1].s==='mixed'&&g(o.s1)[G1].ds==='mixed'&&g(o.s1)[G2].s==='mixed'&&g(o.s1)[G2].ds==='mixed'&&/gradient/.test(o.s1.h1.bgImg)&&t(o.s1).stems.s==='true'
   &&g(o.s2)[G1].s==='true'&&g(o.s2)[G1].ds==='on'&&g(o.s2)[G2].s==='mixed'&&t(o.s2).stems.s==='false'&&o.s2.u==='Undo: Solo — '+G1
   &&g(o.s3)[G1].ds==='off'&&g(o.s3)[G2].ds==='off'&&Object.values(t(o.s3)).every(x=>x.s==='false'),o);});
 // UNDO
 const toggleVideo=async()=>{await X.lMute(p,'video').click();await sleep(200);await blur(p);};
 const one=async(id,act,read)=>{const o={};await toggleVideo();o.u0=(await st(p)).undo;o.v0=await read();await act(o);await sleep(300);o.v1=await read();o.u1=(await st(p)).undo;await blur(p);await key(p,'Control+z',400);o.vz=await read();o.uz=(await st(p)).undo;await key(p,'Control+y',400);o.vy=await read();o.uy=(await st(p)).undo;
  o.ok=JSON.stringify(o.v1)!==JSON.stringify(o.v0)&&JSON.stringify(o.vz)===JSON.stringify(o.v0)&&o.uz===o.u0&&JSON.stringify(o.vy)===JSON.stringify(o.v1)&&o.uy===o.u1;return o;};
 const gv=()=>X.gVol(p,G1).inputValue().then(Number);
 await T('GX-UNDO',async()=>{const o={};
  o.drag=await one('drag',async()=>{const b=await X.gVol(p,G1).boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2-15,b.y+b.height/2,{steps:6});await sleep(100);await p.mouse.up();},gv);
  o.key=await one('key',async()=>{await X.gVol(p,G1).focus();await p.keyboard.down('ArrowDown');await sleep(80);await p.keyboard.up('ArrowDown');},gv);
  o.dbl=await one('dbl',async()=>{await X.gVol(p,G1).dblclick();},gv);
  const gm=async()=>(await mix(p)).groups[G1].m,gs=async()=>(await mix(p)).groups[G1].s;
  o.mute=await one('mute',async()=>{await X.gMute(p,G1).click();},gm);
  o.solo=await one('solo',async()=>{await X.gSolo(p,G1).click();},gs);
  rec('GX-UNDO',o.drag.ok&&o.drag.u1==='Undo: Volume'&&o.key.ok&&o.key.u1==='Undo: Volume'&&o.dbl.ok&&o.dbl.u1==='Undo: Volume'&&o.dbl.v1===1&&o.mute.ok&&o.mute.u1==='Undo: Mute — '+G1&&o.solo.ok&&o.solo.u1==='Undo: Solo — '+G1,o);
  // cleanup: unmute/unsolo G1 if left
  const m=await mix(p);if(m.groups[G1].m==='true')await X.gMute(p,G1).click();if(m.groups[G1].ds==='on')await X.gSolo(p,G1).click();await sleep(200);});
 // pointercancel-ish: drag then Escape? skip; Space parity
 await T('SPACE-PARITY',async()=>{const o={};const tgt=[['laneM',X.lMute(p,'music')],['groupM',X.gMute(p,G1)],['groupS',X.gSolo(p,G1)],['laneS',X.lSolo(p,'music')]];
  for(const[k,loc]of tgt){await blur(p);await p.keyboard.press('Home');await sleep(150);const before={pressed:await loc.getAttribute('aria-pressed'),pos:await X.posOf(p),u:(await st(p)).undo};await loc.focus();await p.keyboard.press('Space');await sleep(700);
   const mid={pressed:await loc.getAttribute('aria-pressed'),pos:await X.posOf(p),u:(await st(p)).undo,f:(await focus(p)).testid||(await focus(p)).label};await p.keyboard.press('Space');await sleep(300);const after={pressed:await loc.getAttribute('aria-pressed'),u:(await st(p)).undo};o[k]={before,mid,after};}
  const same=k=>o[k].before.pressed===o[k].mid.pressed&&o[k].mid.pos>o[k].before.pos&&o[k].after.pressed===o[k].before.pressed;
  rec('SPACE-PARITY',same('laneM')===same('groupM')&&same('laneM')===same('groupS')&&same('laneS')===same('groupS'),{...o,laneMPlays:same('laneM'),groupMPlays:same('groupM'),groupSPlays:same('groupS')});});
 const expandAll=async()=>{for(const n of [G2,G1]){const g=await gstate(p,n);if(g&&g.collapsed)await fold(p,n);}};
 await T('KEYS-m-u',async()=>{const o={};await blur(p);await key(p,'Home');o.sel=await X.selected(p);
  await X.gMute(p,G1).focus();await p.keyboard.press('u');await sleep(400);o.groupM_u={rk:await rowKeys(p),f:await focus(p),m:(await mix(p)).groups};await expandAll();
  await X.lMute(p,'music').focus();await p.keyboard.press('u');await sleep(400);o.laneM_u={rk:await rowKeys(p),f:await focus(p)};await expandAll();
  await X.gMute(p,G1).focus();await p.keyboard.press('m');await sleep(300);o.groupM_m={st:await st(p),pressed:await X.gMute(p,G1).getAttribute('aria-pressed')};await key(p,'Escape');
  await X.lMute(p,'music').focus();await p.keyboard.press('m');await sleep(300);o.laneM_m={st:await st(p),pressed:await X.lMute(p,'music').getAttribute('aria-pressed')};await key(p,'Escape');await blur(p);
  rec('KEYS-m-u',JSON.stringify(o.groupM_u.rk)===JSON.stringify(o.laneM_u.rk)&&o.groupM_m.pressed==='false'&&o.laneM_m.pressed==='false'&&o.groupM_m.st.focus===o.laneM_m.st.focus,o);});
 // COLLAPSED controls
 await T('GX-COLLAPSED',async()=>{const o={};await fold(p,G1);o.g=await gstate(p,G1);o.ov=o.g.overview&&o.g.overview.blocks.length;
  await X.gMute(p,G1).click();await sleep(250);o.m={p:(await mix(p)).groups[G1].m,u:(await st(p)).undo};await X.gMute(p,G1).click();await sleep(200);
  await X.gSolo(p,G1).click();await sleep(250);o.s={p:(await mix(p)).groups[G1].ds,g2:(await mix(p)).groups[G2].ds,u:(await st(p)).undo};await X.gSolo(p,G1).click();await sleep(200);
  const v0=+(await X.gVol(p,G1).inputValue());await X.gVol(p,G1).focus();await p.keyboard.press('ArrowDown');await sleep(300);o.v={v0,v1:+(await X.gVol(p,G1).inputValue()),u:(await st(p)).undo};
  await p.screenshot({path:`${L.OUT}/shots/collapsed-controls-${vp}.png`});
  await clickGroup(p,G1);await blur(p);await key(p,'u',400);o.uExp=(await gstate(p,G1)).collapsed;await key(p,'u',400);o.uCol=(await gstate(p,G1)).collapsed;o.stillOverview=(await gstate(p,G1)).overview!==null;await key(p,'u',400);
  rec('GX-COLLAPSED',o.g.collapsed&&o.ov===2&&o.m.p==='true'&&o.m.u==='Undo: Mute — '+G1&&o.s.p==='on'&&o.s.g2==='mixed'&&o.s.u==='Undo: Solo — '+G1&&o.v.u==='Undo: Volume'&&o.v.v1!==o.v.v0&&o.uExp===false&&o.uCol===true,o);});
 await X.finish(s,rec,'R1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
