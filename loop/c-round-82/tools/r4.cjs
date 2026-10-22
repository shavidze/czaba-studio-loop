const X=require('./lib82.cjs');const{L,sleep,st,blur,key,clipInfo,dragHandle,dblHandle,allClips}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r4-${vp}.json`);const T=X.T(rec);
const stems=async p=>(await allClips(p)).filter(c=>c.lane==='stems');
const fx=cs=>cs.map(c=>`${c.lane}@${c.start}+${c.dur}:${c.fi}/${c.fo}`);
async function back(p,n){await blur(p);for(let i=0;i<n;i++)await key(p,'Control+z',300);await p.keyboard.press('Escape');await sleep(200);return fx(await allClips(p));}
async function seek(p,t){const r=await p.locator('[data-testid=arrangement-ruler]').boundingBox();await p.mouse.click(X.tx(t),r.y+r.height-4);await sleep(300);await blur(p);return X.posOf(p);}
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 await dragHandle(p,'stems','in',PPS);await dragHandle(p,'stems','out',-2*PPS);await p.mouse.move(5,5);const base=fx(await allClips(p));rec('BASE',base.includes('stems@2+16:1.000/2.000'),{base});
 const ok=(o,cond)=>{o.restored=o.back&&JSON.stringify(o.back)===JSON.stringify(base);return cond&&o.restored;};
 await T('FD-EDITS-a',async()=>{const o={};const c=await clipInfo(p,'stems');const hx=c.box.x+c.box.w/2,hy=c.box.y+8;await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+PPS/2,hy,{steps:4});await p.mouse.move(hx+PPS,hy,{steps:4});await p.mouse.up();await sleep(400);
  o.s=(await st(p)).status;o.res=fx(await stems(p));o.back=await back(p,1);rec('FD-EDITS-a',ok(o,o.res.length===1&&o.res[0]==='stems@3+16:1.000/2.000'),o);});
 await T('FD-EDITS-b',async()=>{const o={};const c=await clipInfo(p,'stems');const sf=await X.laneBox(p,'sfx');const hx=X.tx(10),hy=c.box.y+8;await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+10,hy,{steps:3});await p.mouse.move(X.tx(15),sf.y+sf.h/2,{steps:12});await sleep(250);await p.mouse.up();await sleep(500);
  o.s=(await st(p)).status;o.res=fx((await allClips(p)).filter(x=>x.lane==='sfx'||x.lane==='stems'));o.back=await back(p,1);rec('FD-EDITS-b',ok(o,/^გადატანა ხაზზე — SFX: start 00:07.000/.test(o.s)&&o.res.includes('sfx@7+16:1.000/2.000')&&!o.res.some(x=>x.startsWith('stems@'))),o);});
 await T('FD-EDITS-c',async()=>{const o={};await X.selectClip(p,'stems');await blur(p);await key(p,'Control+d',500);o.s=await st(p);o.res=fx(await stems(p));o.back=await back(p,1);rec('FD-EDITS-c',ok(o,o.res.length===2&&o.res.every(x=>/:1\.000\/2\.000$/.test(x))&&o.s.undo!=='Undo: Fade Out'),o);});
 await T('FD-EDITS-d',async()=>{const o={};await X.selectClip(p,'stems');await blur(p);await key(p,'Control+c',300);o.pos=await seek(p,18.5);await X.clickName(p,'stems');await blur(p);await key(p,'Control+v',500);o.s=await st(p);o.res=fx(await stems(p));o.back=await back(p,1);
  rec('FD-EDITS-d',ok(o,o.res.length===2&&o.res.every(x=>/:1\.000\/2\.000$/.test(x))),o);});
 await T('FD-EDITS-e',async()=>{const o={};await X.selectClip(p,'stems');const c=await clipInfo(p,'stems');await p.mouse.click(X.tx(10),c.box.y+c.box.h*0.75);await sleep(300);await blur(p);await key(p,'Control+e',500);o.s=await st(p);o.res=fx(await stems(p));o.back=await back(p,1);
  rec('FD-EDITS-e',ok(o,JSON.stringify(o.res)===JSON.stringify(['stems@2+8:1.000/0.000','stems@10+8:0.000/2.000'])),o);});
 await T('FD-EDITS-f',async()=>{const o={};const c=await clipInfo(p,'stems');const y=c.box.y+c.box.h*0.8;await p.mouse.move(c.box.x+3,y);await p.mouse.down();await p.mouse.move(c.box.x+3+PPS*1.5,y,{steps:5});await p.mouse.move(c.box.x+3+PPS*3,y,{steps:5});await p.mouse.up();await sleep(400);o.s=(await st(p)).status;o.res=fx(await stems(p));o.back=await back(p,1);
  rec('FD-EDITS-f',ok(o,o.res.length===1&&o.res[0]==='stems@5+13:1.000/2.000'),o);});
 await T('FD-EDITS-g',async()=>{const o={};const c=await clipInfo(p,'stems');const y=c.box.y+c.box.h*0.75;await p.mouse.move(X.tx(8),y);await p.mouse.down();await p.mouse.move(X.tx(8.5),y,{steps:4});await p.mouse.move(X.tx(9),y,{steps:4});await p.mouse.up();await sleep(300);o.range=(await st(p)).range;await key(p,'Delete',500);o.s=await st(p);o.res=fx(await stems(p));o.back=await back(p,1);
  rec('FD-EDITS-g',ok(o,JSON.stringify(o.res)===JSON.stringify(['stems@2+6:1.000/0.000','stems@9+9:0.000/2.000'])),o);});
 await X.finish(s,rec,'R4-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
