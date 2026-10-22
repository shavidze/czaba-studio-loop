const X=require('./lib81.cjs');const{L,sleep,st,blur,key,focus,fold,rowKeys,gstate,clickName,clickGroup,G1,G2,mix,ttf,dbv,mStart,mStop,now,exportWav,strip}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r2-${vp}.json`);const T=X.T(rec);
const posNow=p=>X.posOf(p);
async function waitPos(p,t,max=15000){const t0=Date.now();while(Date.now()-t0<max){if(await posNow(p)>=t)return true;await sleep(20);}return false;}
async function dragTo0(p,n){const b=await X.gVol(p,n).boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2-300,b.y+b.height/2,{steps:3});await p.mouse.up();}
async function setVolKeys(p,loc,target){await loc.focus();let v=+(await loc.inputValue());let k=0;while(Math.abs(v-target)>1e-9&&k<120){await p.keyboard.press(v>target?'ArrowDown':'ArrowUp');v=+(await loc.inputValue());k++;}await sleep(200);await blur(p);await sleep(150);return{v,k,vt:await loc.getAttribute('aria-valuetext')};}
const noRise=(m,te,t1,k)=>{const a=m.filter(x=>x.t>te+80&&x.t<t1).map(x=>dbv(x[k]));let r=0;for(let i=1;i<a.length;i++)r=Math.max(r,a[i]-a[i-1]);return +r.toFixed(2)};
const seg=(m,a,b,k)=>m.filter(x=>x.t>=a&&x.t<=b).map(x=>dbv(x[k]));
const posmono=m=>{const ps=m.map(x=>X.secs(x.pos));return ps.every((v,i)=>i===0||v>=ps[i-1]-1e-9)};
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p);rec('SETUP',S.clips.length===4,{clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
 await X.lMute(p,'video').click();await sleep(200);await X.makeG1(p);await X.lMute(p,'music').click();await sleep(200);await blur(p);
 rec('PRE',true,await mix(p));
 const E={};
 await T('GX-VOL-EXPORT',async()=>{const o={};E.e100=await exportWav(p,vp,'g1-100');o.k50=await setVolKeys(p,X.gVol(p,G1),0.5);o.u50=(await st(p)).undo;E.e50=await exportWav(p,vp,'g1-50');o.k0=await setVolKeys(p,X.gVol(p,G1),0);E.e0=await exportWav(p,vp,'g1-0');
  o.e100=strip(E.e100);o.e50=strip(E.e50);o.e0=strip(E.e0);delete o.e50.dialogText;delete o.e0.dialogText;
  o.rWs=X.ratio(E.e50,E.e100,'Ws');o.rWx=X.ratio(E.e50,E.e100,'Wx');o.dBWs=X.dB(o.rWs);o.fullWs100=E.e100.win.Ws.full;o.fullWx100=E.e100.win.Wx.full;
  rec('GX-VOL-EXPORT',o.k50.vt==='50%'&&o.k0.vt==='0%'&&E.e100.win.Ws.rms>0.01&&o.fullWs100===0&&Math.abs(o.rWs-0.5)<=0.005&&E.e0.win.Ws.maxAbsLsb<=1&&E.e0.win.Wx.maxAbsLsb<=1&&E.e100.frames===E.e50.frames&&E.e0.frames===E.e100.frames&&E.e100.all.nan===0&&E.e100.win.pre.maxAbsLsb<=1,o);});
 // back to 100 by double-click
 await X.gVol(p,G1).dblclick();await sleep(300);await blur(p);
 await T('GX-VOL-LIVE+METER-STEMS',async()=>{const o={v0:await X.gVol(p,G1).inputValue()};await key(p,'Home',200);await mStart(p);const src0=await p.evaluate(()=>window.__src.length);await p.keyboard.press('Space');
  await waitPos(p,2.6);const te=await now(p);o.posTe=await posNow(p);await dragTo0(p,G1);o.vAfter=await X.gVol(p,G1).inputValue();
  await waitPos(p,6.5);const tr=await now(p);await X.gVol(p,G1).dblclick();o.vRestore=await X.gVol(p,G1).inputValue();await sleep(900);const tEnd=await now(p);await blur(p);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  const srcs=m.map(x=>x.src);o.src={before:src0,first:srcs.find(x=>x>src0),min:Math.min(...m.filter(x=>x.t>te).map(x=>x.src)),max:Math.max(...m.filter(x=>x.t>te).map(x=>x.src))};
  o.master=ttf(m.filter(x=>x.t<tr),te,'M');o.stems=ttf(m.filter(x=>x.t<tr),te,'stems');o.sfxDuring=Math.max(...seg(m,te+200,tr,'sfx'));o.masterDuringSfx=Math.max(...m.filter(x=>x.t>te&&x.t<tr&&X.secs(x.pos)>=4.2&&X.secs(x.pos)<=5.0).map(x=>dbv(x.M)));
  const ret=m.filter(x=>x.t>tr+60&&x.t<=tr+600);o.masterReturn=Math.max(...ret.map(x=>dbv(x.M)));o.stemsReturn=Math.max(...ret.map(x=>dbv(x.stems)));o.mono=posmono(m);o.n=m.length;o.masterRise=noRise(m,te,tr,'M');
  rec('GX-VOL-LIVE',o.vAfter==='0'&&o.master.ok&&o.master.staysFloor&&o.masterRise<=0.5&&o.masterReturn>-60&&o.src.max===o.src.min&&o.mono,o);
  rec('GX-METER-STEMS',o.stems.ok&&o.stems.staysFloor&&o.stemsReturn>-60,{stems:o.stems,stemsReturn:o.stemsReturn,sfxDuring:o.sfxDuring});});
 await T('GX-METER-SFX',async()=>{const o={};await blur(p);await key(p,'Home',200);await mStart(p);await p.keyboard.press('Space');await waitPos(p,4.35);const te=await now(p);o.posTe=await posNow(p);await dragTo0(p,G1);
  await waitPos(p,7.6);await blur(p);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);await X.gVol(p,G1).dblclick();await sleep(200);await blur(p);
  o.sfx=ttf(m,te,'sfx');o.stems=ttf(m,te,'stems');o.master=ttf(m,te,'M');o.sfxL0=o.sfx.L0;
  rec('GX-METER-SFX',o.sfx.L0>-60&&o.sfx.ok&&o.stems.ok&&o.master.ok&&o.sfx.tf<((o.sfx.L0+60)/20+(6-o.posTe)),o);});
 await T('GX-MUTE',async()=>{const o={};await blur(p);await key(p,'Home',200);await mStart(p);const src0=await p.evaluate(()=>window.__src.length);await p.keyboard.press('Space');await waitPos(p,2.6);const te=await now(p);await X.gMute(p,G1).click();
  o.pressed=await X.gMute(p,G1).getAttribute('aria-pressed');o.undo=(await st(p)).undo;await waitPos(p,6.4);const tu=await now(p);await X.gMute(p,G1).click();o.pressedUnmute=await X.gMute(p,G1).getAttribute('aria-pressed');await sleep(800);
  await blur(p);const tz=await now(p);await key(p,'Control+z',0);o.pressedUndo=await X.gMute(p,G1).getAttribute('aria-pressed');await sleep(3200);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  o.master=ttf(m.filter(x=>x.t<tu),te,'M');o.masterSfxWin=Math.max(...m.filter(x=>x.t>te&&x.t<tu&&X.secs(x.pos)>=4.2&&X.secs(x.pos)<=5).map(x=>dbv(x.M)));o.ret=Math.max(...m.filter(x=>x.t>tu+60&&x.t<tz).map(x=>dbv(x.M)));o.afterUndo=ttf(m,tz,'M');
  o.masterRise=noRise(m,te,tu,'M');o.src=[src0,Math.min(...m.filter(x=>x.t>te).map(x=>x.src)),Math.max(...m.filter(x=>x.t>te).map(x=>x.src))];o.mono=posmono(m);
  // export muted (expanded) and collapsed
  const em=await exportWav(p,vp,'g1-muted');await fold(p,G1);const ec=await exportWav(p,vp,'g1-muted-collapsed');await fold(p,G1);o.em=strip(em);o.ec=strip(ec);delete o.em.dialogText;delete o.ec.dialogText;
  rec('GX-MUTE',o.pressed==='true'&&o.undo==='Undo: Mute — '+G1&&o.master.ok&&o.master.staysFloor&&o.masterRise<=0.5&&o.pressedUnmute==='false'&&o.ret>-60&&o.pressedUndo==='true'&&o.afterUndo.ok&&o.afterUndo.staysFloor&&o.src[1]===o.src[2]&&o.mono&&em.win.Ws.maxAbsLsb<=1&&em.win.Wx.maxAbsLsb<=1,o);
  rec('GX-COLLAPSED-AUDIO',ec.win.Ws.maxAbsLsb<=1&&ec.win.Wx.maxAbsLsb<=1&&ec.frames===em.frames,{ec:o.ec.win});});
 // G1 is muted now (after undo). UNGROUP
 await T('GX-UNGROUP',async()=>{const o={pre:(await mix(p)).groups};await clickGroup(p,G1);await blur(p);await key(p,'Home',200);await mStart(p);await p.keyboard.press('Space');await waitPos(p,2.5);const tg=await now(p);
  await key(p,'Control+Shift+g',0);o.rkAfter=await rowKeys(p);await waitPos(p,4.6);const tz=await now(p);await key(p,'Control+z',0);await sleep(300);o.rkUndo=await rowKeys(p);o.mixUndo=(await mix(p)).groups;await sleep(3200);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  o.preFloor=Math.max(...m.filter(x=>x.t<tg&&X.secs(x.pos)>=0.5).map(x=>dbv(x.M)));o.afterUngroup=Math.min(...m.filter(x=>x.t>tg+300&&x.t<tz).map(x=>dbv(x.M)));o.undoTtf=ttf(m,tz,'M');
  await key(p,'Control+y',400);o.rkRedo=await rowKeys(p);const eu=await exportWav(p,vp,'ungrouped');o.ratioWs=X.ratio(eu,E.e100,'Ws');o.ratioWx=X.ratio(eu,E.e100,'Wx');await key(p,'Control+z',400);const ez=await exportWav(p,vp,'ungroup-undo');o.ez=ez.win;o.mixFinal=await mix(p);
  rec('GX-UNGROUP',o.pre[G1].m==='true'&&!o.rkAfter.some(k=>k.startsWith('G:'))&&o.preFloor<=-60&&o.afterUngroup>-60&&o.rkUndo.some(k=>k.startsWith('G:'+G1))&&o.mixUndo[G1].m==='true'&&o.undoTtf.ok&&Math.abs(o.ratioWs-1)<=0.005&&Math.abs(o.ratioWx-1)<=0.005&&ez.win.Ws.maxAbsLsb<=1&&ez.win.Wx.maxAbsLsb<=1,o);});
 // unmute G1 for no-restart
 if((await mix(p)).groups[G1].m==='true'){await X.gMute(p,G1).click();await sleep(200);}
 await T('GX-NO-RESTART',async()=>{const o={};await blur(p);await key(p,'Home',200);await mStart(p);await p.keyboard.press('Space');await sleep(1200);const src0=await p.evaluate(()=>window.__src.length);const pos0=await posNow(p);const t0=await now(p);
  await clickName(p,'music');await blur(p);await key(p,'Control+g',300);o.rk1=await rowKeys(p);await X.gMute(p,G2).click();await sleep(250);await X.gMute(p,G2).click();await sleep(250);await X.gSolo(p,G1).click();await sleep(250);await X.gSolo(p,G1).click();await sleep(250);
  const b=await X.gVol(p,G1).boundingBox();await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2-10,b.y+b.height/2,{steps:5});await p.mouse.up();await sleep(250);
  await clickGroup(p,G2);await blur(p);await key(p,'Control+Shift+g',300);o.rk2=await rowKeys(p);const src1=await p.evaluate(()=>window.__src.length);const pos1=await posNow(p);const t1=await now(p);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  const during=m.filter(x=>x.t>=t0&&x.t<=t1);o.src=[src0,src1];o.pos=[pos0,pos1];o.wall=(t1-t0)/1000;o.adv=pos1-pos0;o.mono=posmono(during);o.silent=during.filter(x=>dbv(x.M)<=-60).length;
  rec('GX-NO-RESTART',src0>0&&src1===src0&&o.mono&&Math.abs(o.adv-o.wall)<0.35&&o.rk1.includes('G:'+G2+'@0'),o);});
 await X.finish(s,rec,'R2-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
