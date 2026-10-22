const X=require('./lib81.cjs');const{L,sleep,st,blur,key,focus,fold,rowKeys,gstate,clickName,clickGroup,G1,G2,mix,ttf,dbv,mStart,mStop,now,exportWav,strip,W}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r3-${vp}.json`);const T=X.T(rec);
async function dialogVideo(p){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});await sleep(300);
 const t=await p.evaluate(()=>{const d=document.querySelector('#arrangement-export-title').closest('[role=dialog]');const all=d.textContent.replace(/\s+/g,' ');const m=/ვიდეოს ორიგინალი ხმა \([^)]*\): (.*?)დახურვა/.exec(all);return{row:m?m[0].trim():null,all}});
 await p.keyboard.press('Escape');await sleep(300);return t;}
async function setVolKeys(p,loc,target){await loc.focus();let v=+(await loc.inputValue());let k=0;while(Math.abs(v-target)>1e-9&&k<120){await p.keyboard.press(v>target?'ArrowDown':'ArrowUp');v=+(await loc.inputValue());k++;}await sleep(200);await blur(p);await sleep(150);return{v,k,vt:await loc.getAttribute('aria-valuetext')};}
const cmp=(a,b)=>W.cmp(a.w,b.w);
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p);rec('SETUP',S.clips.length===4,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),videoMute:await X.lMute(p,'video').getAttribute('aria-pressed')});
 await X.makeG1(p);await X.makeG2(p);rec('NEST',true,{rk:await rowKeys(p)});
 const D={};const E={};
 await T('GX-EXPORT-DIALOG',async()=>{D.base=await dialogVideo(p);await X.gSolo(p,G1).click();await sleep(250);D.g1=await dialogVideo(p);await X.lSolo(p,'music').click();await sleep(250);D.music=await dialogVideo(p);D.mix=await mix(p);
  await X.lSolo(p,'music').click();await sleep(250);D.clear=await dialogVideo(p);D.mixClear=await mix(p);
  rec('GX-EXPORT-DIALOG',D.base.row&&D.g1.row&&D.base.row!==D.g1.row&&D.g1.row===D.music.row&&D.clear.row===D.base.row,{base:D.base.row,g1:D.g1.row,music:D.music.row,clear:D.clear.row,soloAfterMusic:D.mix.groups,allBase:D.base.all.slice(0,700)});});
 await T('GX-SOLO',async()=>{const o={};E.base=await exportWav(p,vp,'solo-base');o.base=E.base.win;
  // (1)
  await X.gSolo(p,G1).click();await sleep(250);o.u1=(await st(p)).undo;o.m1=await mix(p);E.s1=await exportWav(p,vp,'solo-g1');o.s1=E.s1.win;
  await blur(p);await key(p,'Home',200);await mStart(p);await p.keyboard.press('Space');await sleep(5200);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  const w=(a,b,k)=>Math.max(...m.filter(x=>{const t=X.secs(x.pos);return t>=a&&t<b}).map(x=>dbv(x[k])));o.live1={videoPre:w(0.3,1.9,'video'),musicPre:w(0.5,1.9,'music'),masterPre:w(0.3,1.9,'M'),stemsWs:w(2.4,3.9,'stems'),sfxWx:w(4.2,5.0,'sfx'),musicWs:w(2.4,3.9,'music')};
  // (2)
  await X.lSolo(p,'music').click();await sleep(250);o.m2=await mix(p);E.s2=await exportWav(p,vp,'solo-music');o.s2=E.s2.win;
  // (3)
  await X.gSolo(p,G1).click({modifiers:['Control']});await sleep(250);o.m3=await mix(p);E.s3=await exportWav(p,vp,'solo-music-g1');o.s3=E.s3.win;
  // (4) remove music solo additively, then mute G1
  await X.lSolo(p,'music').click({modifiers:['Control']});await sleep(250);o.m4a=await mix(p);await X.gMute(p,G1).click();await sleep(250);o.m4=await mix(p);E.s4=await exportWav(p,vp,'solo-g1-muted');o.s4={all:E.s4.all,win:E.s4.win};
  // references: clear solo (plain click on only-soloed G1), keep G1 muted + video lane-muted => music only
  await X.gSolo(p,G1).click();await sleep(250);o.mR=await mix(p);await X.lMute(p,'video').click();await sleep(200);E.refMusic=await exportWav(p,vp,'ref-music');await X.gMute(p,G1).click();await sleep(250);E.refAll=await exportWav(p,vp,'ref-all-novideo');
  o.d2=cmp(E.s2,E.refMusic);o.d3=cmp(E.s3,E.refAll);o.mFinal=await mix(p);
  const g=x=>x.groups,t=x=>x.tracks;
  const ok1=E.base.win.vid.rms>0.001&&E.s1.win.pre.maxAbsLsb<=1&&E.s1.win.vid.maxAbsLsb<=1&&E.s1.win.Ws.rms>0.01&&o.u1==='Undo: Solo — '+G1&&g(o.m1)[G1].ds==='on'&&g(o.m1)[G2].ds==='mixed'&&o.live1.videoPre<=-60&&o.live1.musicPre<=-60&&o.live1.masterPre<=-60&&o.live1.stemsWs>-60&&o.live1.sfxWx>-60;
  const ok2=g(o.m2)[G1].ds==='off'&&g(o.m2)[G2].ds==='mixed'&&t(o.m2).music.s==='true'&&E.s2.win.vid.maxAbsLsb<=1&&o.d2<=1;
  const ok3=g(o.m3)[G1].ds==='on'&&t(o.m3).music.s==='true'&&E.s3.win.vid.maxAbsLsb<=1&&o.d3<=1;
  const ok4=g(o.m4)[G1].ds==='on'&&g(o.m4)[G1].m==='true'&&t(o.m4).music.s==='false'&&E.s4.all.peak===0;
  o.ok=[ok1,ok2,ok3,ok4];rec('GX-SOLO',ok1&&ok2&&ok3&&ok4,o);});
 // NESTED: video lane muted now (from refs). music unmuted.
 await T('GX-NESTED',async()=>{const o={pre:await mix(p)};await X.lMute(p,'music').click();await sleep(200);E.n100m=await exportWav(p,vp,'nest-100-musicmuted');await X.lMute(p,'music').click();await sleep(200);
  await X.gMute(p,G2).click();await sleep(250);o.mG2=await mix(p);
  await blur(p);await key(p,'Home',200);await mStart(p);await p.keyboard.press('Space');await sleep(3000);
  o.ks=await setVolKeys(p,X.lVol(p,'stems'),0.5);o.uS=(await st(p)).undo;o.kg=await setVolKeys(p,X.gVol(p,G1),0.5);o.uG=(await st(p)).undo;await sleep(1500);await blur(p);await p.keyboard.press('Space');await sleep(200);const m=await mStop(p);
  o.liveMax={M:Math.max(...m.filter(x=>X.secs(x.pos)>0.2).map(x=>dbv(x.M))),music:Math.max(...m.map(x=>dbv(x.music))),stems:Math.max(...m.map(x=>dbv(x.stems))),sfx:Math.max(...m.map(x=>dbv(x.sfx)))};
  E.nMuted=await exportWav(p,vp,'nest-g2-muted');o.nMuted=E.nMuted.all;
  await blur(p);let k1=0;while(k1<80&&+(await X.gVol(p,G1).inputValue())!==1){await key(p,'Control+z',60);k1++;}o.k1=k1;o.z1=await mix(p);await key(p,'Control+z',200);o.z2=await mix(p);
  for(let i=0;i<k1+1;i++)await key(p,'Control+y',60);await sleep(200);o.y2=await mix(p);
  await X.gMute(p,G2).click();await sleep(250);await X.lMute(p,'music').click();await sleep(200);o.mAfter=await mix(p);E.n25=await exportWav(p,vp,'nest-after');o.r=X.ratio(E.n25,E.n100m,'Ws');o.rWx=X.ratio(E.n25,E.n100m,'Wx');o.dB=X.dB(o.r);
  const g=x=>x.groups,t=x=>x.tracks;
  rec('GX-NESTED',g(o.mG2)[G2].m==='true'&&E.nMuted.all.peak===0&&o.liveMax.M<=-60&&o.ks.v===0.5&&o.kg.vt==='50%'&&o.uS==='Undo: Volume'&&o.uG==='Undo: Volume'&&o.k1===50&&g(o.z1)[G1].v===1&&t(o.z1).stems.v===0.5&&t(o.z2).stems.v===0.51&&g(o.y2)[G1].v===0.5&&t(o.y2).stems.v===0.5&&Math.abs(o.r-0.25)<=0.0025&&g(o.mAfter)[G2].m==='false',o);});
 await X.finish(s,rec,'R3-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
