const X=require('./lib81.cjs');const{L,sleep,st,blur,key,focus,fold,rowKeys,gstate,clickName,clickGroup,G1,G2,mix,exportWav,W}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r4-${vp}.json`);const T=X.T(rec);
function chWin(w,t0,t1){const ch=w.fmt.ch,sr=w.fmt.sr,fsc=Math.pow(2,w.fmt.bits-1);const s=[0,0];let n=0;for(let f=Math.floor(t0*sr);f<Math.floor(t1*sr);f++){for(let c=0;c<ch;c++){const v=w.read(f*ch+c)/fsc;s[c]+=v*v;}n++;}return s.map(x=>Math.sqrt(x/n));}
async function setKeys(p,loc,target){await loc.focus();let v=+(await loc.inputValue());let k=0;while(Math.abs(v-target)>1e-9&&k<220){await p.keyboard.press(v>target?'ArrowDown':'ArrowUp');v=+(await loc.inputValue());k++;}await sleep(200);await blur(p);await sleep(150);return{v,k};}
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p);rec('SETUP',S.clips.length===4,{clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
 await X.lMute(p,'video').click();await sleep(200);await blur(p);
 // REG-TRACK-MIX without groups
 await T('REG-TRACK-MIX',async()=>{const o={};const E0=await exportWav(p,vp,'trk-base');
  await X.lMute(p,'music').click();await sleep(200);o.uM=(await st(p)).undo;E0.m=await exportWav(p,vp,'trk-musicmuted');o.mmPre=E0.m.win.pre.maxAbsLsb;
  await X.lSolo(p,'stems').click();await sleep(200);o.uS=(await st(p)).undo;o.m1=(await mix(p)).tracks;await X.lSolo(p,'sfx').click({modifiers:['Control']});await sleep(200);o.m2=(await mix(p)).tracks;
  const es=await exportWav(p,vp,'trk-solo');o.soloWs=es.win.Ws.rms;o.soloRef=E0.m.win.Ws.rms;o.soloWx=es.win.Wx.rms/E0.m.win.Wx.rms;
  await X.lSolo(p,'stems').click();await sleep(200);await X.lSolo(p,'stems').click();await sleep(200);o.m3=(await mix(p)).tracks;
  // volume keyboard 0.5 on stems; one entry per keyup
  o.k=await setKeys(p,X.lVol(p,'stems'),0.5);o.uV=(await st(p)).undo;const ev=await exportWav(p,vp,'trk-stems50');o.rWs=X.ratio(ev,E0.m,'Ws');
  // drag one entry
  await X.lMute(p,'video').click();await sleep(150);await X.lMute(p,'video').click();await sleep(150);const u0=(await st(p)).undo;const b=await X.lVol(p,'stems').boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2+20,b.y+b.height/2,{steps:5});await p.mouse.up();await sleep(300);o.vDrag=+(await X.lVol(p,'stems').inputValue());o.uDrag=(await st(p)).undo;
  await blur(p);await key(p,'Control+z',300);o.vDragUndo=+(await X.lVol(p,'stems').inputValue());o.uDragUndo=(await st(p)).undo;
  // pan stems hard left
  const pan=X.lane(p,'stems','input[aria-label^="Pan"]');o.pan=await setKeys(p,pan,-50);o.panVt=await pan.getAttribute('aria-valuetext');const ep=await exportWav(p,vp,'trk-panL',true);o.panLR=chWin(ep.w,2.4,3.9);require('fs').unlinkSync(`${L.OUT}/export-${vp}-trk-panL.wav`);
  rec('REG-TRACK-MIX',o.panVt==='50L'&&o.uM==='Undo: Mute — მუსიკა'&&o.mmPre<=1&&/^Undo: Solo — სტემები/.test(o.uS)&&o.m1.stems.s==='true'&&o.m2.stems.s==='true'&&o.m2.sfx.s==='true'&&o.m3.stems.s==='false'&&o.m3.sfx.s==='false'&&Math.abs(o.soloWs/o.soloRef-1)<0.005&&Math.abs(o.soloWx-1)<0.005
   &&o.uV==='Undo: Volume'&&Math.abs(o.rWs-0.5)<=0.005&&o.uDrag==='Undo: Volume'&&o.vDragUndo===0.5&&o.uDragUndo===u0&&o.panLR[1]<o.panLR[0]*0.01,o);
  // reset stems solo/mute for later
  await X.lMute(p,'music').click();await sleep(200);await X.lVol(p,'stems').dblclick();await sleep(200);await blur(p);});
 await X.makeG1(p);
 await T('FOLD-BUTTON',async()=>{const u0=(await st(p)).undo;const h0=await X.laneH(p);await fold(p,G1);const g=await gstate(p,G1);const ids=await X.laneIds(p);const u1=(await st(p)).undo;await fold(p,G1);const g2=await gstate(p,G1);const h1=await X.laneH(p);
  rec('FOLD-BUTTON',g.collapsed&&g.ariaExpanded==='false'&&g.glyph==='"▸"'&&!ids.includes('stems')&&!ids.includes('sfx')&&u1===u0&&g2.ariaExpanded==='true'&&JSON.stringify(h0)===JSON.stringify(h1),{g:{c:g.collapsed,ae:g.ariaExpanded,gl:g.glyph},ids,h0,h1});});
 await T('FOLD-U',async()=>{const o={};await clickGroup(p,G1);await blur(p);await key(p,'u',400);o.c1=(await gstate(p,G1)).collapsed;await key(p,'u',400);o.c2=(await gstate(p,G1)).collapsed;
  await clickName(p,'music');await blur(p);await key(p,'u',400);o.music={st:(await st(p)).status,c:(await gstate(p,G1)).collapsed};
  await clickGroup(p,G1);await p.locator('input[placeholder*="ძიება"]').first().click();await p.keyboard.type('u');await sleep(300);o.search=(await gstate(p,G1)).collapsed;await p.keyboard.press('Backspace');await blur(p);
  await clickGroup(p,G1);await blur(p);await key(p,'Shift+U',300);o.shiftU=(await gstate(p,G1)).collapsed;
  rec('FOLD-U',o.c1===true&&o.c2===false&&o.music.c===false&&o.search===false&&o.shiftU===false,o);});
 await T('FOLD-OVERVIEW',async()=>{await fold(p,G1);const g=await gstate(p,G1);const cl=await X.clips(p);await key(p,'Control+a',300);const g2=await gstate(p,G1);await key(p,'Escape',200);await fold(p,G1);
  const b=g.overview.blocks;rec('FOLD-OVERVIEW',b.length===2&&Math.abs(b[0].start-2)<0.002&&Math.abs(b[1].start-4)<0.002&&Math.abs(b[0].left-2*X.PPS)<=1&&Math.abs(b[0].width-16*X.PPS)<=1&&g2.overview.blocks.every(x=>x.sel),{b,pps:X.PPS,sel:g2.overview.blocks.map(x=>x.sel)});});
 await T('FOLD-SELECTION-1',async()=>{const o={};const c=(await X.clips(p)).find(x=>x.lane==='stems');const box=await p.locator(`[data-clip-id="${c.id}"]`).boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height-8);await sleep(200);o.sel=await X.selClips(p);
  const u0=(await st(p)).undo;await fold(p,G1);await blur(p);await key(p,'Delete',300);o.u=(await st(p)).undo;await fold(p,G1);o.n=(await X.clips(p)).filter(x=>x.lane==='stems').length;
  rec('FOLD-SELECTION-1',o.sel.includes('stems')&&o.u===u0&&o.n===1,o);});
 await T('FOCUS-HIDDEN',async()=>{await clickGroup(p,G1);const sel0=await X.selected(p);if(!sel0.includes('G:'+G1))await clickGroup(p,G1,['Control']);await clickName(p,'stems',['Control']);const f0=await focus(p);await key(p,'u',400);const f1=await focus(p);const c=(await gstate(p,G1)).collapsed;await fold(p,G1);
  rec('FOCUS-HIDDEN',c&&f1&&f1.testid==='arrangement-group-name',{f0,f1,c});});
 await T('REG-TG',async()=>{const o={};await X.gMute(p,G1).click();await sleep(200);await X.gVol(p,G1).focus();await p.keyboard.press('ArrowDown');await sleep(200);await blur(p);
  await X.gName(p,G1).focus();await p.keyboard.press('F2');await sleep(200);await p.keyboard.press('Control+a');await p.keyboard.type('დრამები');await p.keyboard.press('Enter');await sleep(300);o.rk=await rowKeys(p);o.mix=(await mix(p)).groups;o.u=(await st(p)).undo;
  await clickName(p,'video');await blur(p);await key(p,'Control+g',300);o.video={rk:await rowKeys(p),st:(await st(p)).status};
  await clickGroup(p,'დრამები');await blur(p);await key(p,'Control+Shift+g',300);o.ung={rk:await rowKeys(p),st:(await st(p)).status,u:(await st(p)).undo};
  rec('REG-TG',o.rk.includes('G:დრამები@0')&&o.mix['დრამები'].m==='true'&&o.mix['დრამები'].v===0.99&&!o.video.rk.some(k=>k!=='G:დრამები@0'&&k.startsWith('G:'))&&o.ung.rk.every(k=>!k.startsWith('G:'))&&/^Undo: Ungroup/.test(o.ung.u),o);});
 await X.finish(s,rec,'R4-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
