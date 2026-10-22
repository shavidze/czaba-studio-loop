const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const tag=vp;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok===true?'PASS ':ok===false?'FAIL ':'INFO ')+id+' '+JSON.stringify(d));fs.writeFileSync(`${L.OUT}/mk74r-${tag}.json`,JSON.stringify(R,null,1));};
const sleep=L.sleep;
const posOf=async p=>{const t=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(t);return m?+m[1]*60+ +m[2]:NaN;};
const undoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const status=p=>p.textContent('[data-testid=arrangement-status]').then(s=>s.trim());
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('data-marker-time')));
const names=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('aria-label')));
const clips=p=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>({s:e.getAttribute('data-clip-start'),sel:/ring-brand/.test(e.className)})));
const act=p=>p.evaluate(()=>{const a=document.activeElement;if(!a)return null;return (a.getAttribute('data-testid')||a.getAttribute('data-marker-menu-action')||a.tagName)+(a.getAttribute('data-marker-time')?'@'+a.getAttribute('data-marker-time'):'')});
const cur=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker][aria-current=true]')].map(e=>e.getAttribute('data-marker-time')));
const menuInfo=p=>p.evaluate(()=>{const m=[...document.querySelectorAll('[data-testid=arrangement-marker-menu]')];return{count:m.length,grid:document.querySelectorAll('[data-testid=arrangement-grid-menu]').length,items:m[0]?[...m[0].querySelectorAll('[role=menuitem]')].map(b=>b.textContent):null,rect:m[0]?m[0].getBoundingClientRect().toJSON():null,parentIsBody:m[0]?m[0].parentElement===document.body:null}});
const snapState=p=>p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');
const setSnap=async(p,on)=>{if((await snapState(p))!==String(on)){await p.click('[data-testid=arrangement-snap-toggle]');await sleep(150);}await p.evaluate(()=>document.activeElement&&document.activeElement.blur());return snapState(p);};
const flag=(p,t)=>p.locator(`[data-testid=arrangement-marker][data-marker-time="${t}"]`);
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur());
let RL=0,PPS=40;
const rulerClick=async(p,t)=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());const vw=p.viewportSize().width;if(r.left+t*PPS>vw-20)throw new Error('rulerClick offscreen '+t);await p.mouse.click(r.left+t*PPS,r.top+r.height/2);await sleep(150);};
const addMarker=async(p,t)=>{await blur(p);await rulerClick(p,t);await p.keyboard.press('m');await sleep(150);await p.keyboard.press('Enter');await sleep(250);};
const flagPt=async(p,t)=>{const b=await flag(p,t).boundingBox();return{x:b.x+3,y:b.y+b.height/2,b};};
const drag=async(p,t,dxSec,opt={})=>{const s=await flagPt(p,t);await p.mouse.move(s.x,s.y);await p.mouse.down();const n=opt.steps||12;const dx=dxSec*PPS;const mid=[];for(let i=1;i<=n;i++){await p.mouse.move(s.x+dx*i/n,s.y);if(opt.sample&&i===opt.sample)mid.push({act:await act(p),marks:await marks(p)});await sleep(15);}await p.mouse.up();await sleep(250);return mid;};
const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
const T=async(id,fn)=>{try{await fn();}catch(e){rec(id,false,{error:String(e).slice(0,300)});}};
(async()=>{
 const s=await L.open(vp);const p=s.page;await L.fresh(p);
 await p.evaluate(()=>{window.__cm=[];document.addEventListener('contextmenu',e=>window.__cm.push({button:e.button,x:e.clientX,y:e.clientY,trusted:e.isTrusted,t:(e.target.getAttribute&&e.target.getAttribute('data-testid'))||e.target.tagName}),true);});
 await setSnap(p,true);
 const opts=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-grid-division] option')].map(o=>o.value));
 const grid0=await p.inputValue('[data-testid=arrangement-grid-division]');
 const gsec=()=>p.evaluate(()=>{const e=document.querySelector('[data-grid-seconds]');return e&&e.getAttribute('data-grid-seconds')});
 let g=await gsec();if(g!=='1'){for(const o of opts){await p.selectOption('[data-testid=arrangement-grid-division]',o);await sleep(120);if(await gsec()==='1')break;}}
 await blur(p);
 const st=await L.setupME(p,530);
 await addMarker(p,5);await addMarker(p,12);
 PPS=await p.evaluate(()=>{const f=[...document.querySelectorAll('[data-testid=arrangement-marker]')];return(parseFloat(f[1].style.left)-parseFloat(f[0].style.left))/(+f[1].getAttribute('data-marker-time')-+f[0].getAttribute('data-marker-time'))});
 rec('SETUP',st.length===1,{clipStarts:st,gridDefault:grid0,gridOpts:opts,gridSeconds:await gsec(),snap:await snapState(p),pps:PPS,marks:await marks(p),names:await names(p)});

 await T('MK-DRAG-SNAP',async()=>{await setSnap(p,true);await p.keyboard.press('Home');await sleep(100);const pos0=await posOf(p);const u0=await undoT(p);
  await drag(p,'5.000',2.4);const m1=await marks(p);const s1=await status(p);const u1=await undoT(p);const a1=await act(p);const pos1=await posOf(p);
  await p.screenshot({path:`${L.OUT}/shots/drag-snap-${tag}.png`});
  await p.keyboard.press('Control+z');await sleep(250);const m2=await marks(p);await p.keyboard.press('Control+y');await sleep(250);const m3=await marks(p);
  rec('MK-DRAG-SNAP',JSON.stringify(m1)==='["7.000","12.000"]'&&/გადავიდა: 00:07\.000/.test(s1)&&/«/.test(s1)&&/Move Marker|მარკერის გადატანა/.test(u1||'')&&JSON.stringify(m2)==='["5.000","12.000"]'&&JSON.stringify(m3)==='["7.000","12.000"]',{snap:'true',undoBefore:u0,marks:[m1,m2,m3],status:s1,undo:u1,active:a1});
  rec('MK-DRAG-CLICK-after-drag',pos1===pos0,{posBeforeDrag:pos0,posAfterDrag:pos1});
  await p.keyboard.press('Control+z');await sleep(250);});

 await T('MK-DRAG-CROSS',async()=>{await setSnap(p,true);const mid=await drag(p,'5.000',9,{steps:30,sample:28});const m=await marks(p);const a=await act(p);const u=await undoT(p);const lab=await names(p);
  await p.screenshot({path:`${L.OUT}/shots/drag-cross-${tag}.png`});
  await p.keyboard.press('Control+z');await sleep(250);const mu=await marks(p);
  rec('MK-DRAG-CROSS',JSON.stringify(m)==='["12.000","14.000"]'&&mid[0]&&mid[0].act==='arrangement-marker@'+mid[0].marks.find(x=>+x>12.5)&&a==='arrangement-marker@14.000'&&JSON.stringify(mu)==='["5.000","12.000"]',{mid,final:m,active:a,undo:u,labels:lab,afterUndo:mu});});

 await T('MK-DRAG-FREE',async()=>{const out={};
  await setSnap(p,false);await drag(p,'5.000',1.37);out.snapOff=await marks(p);out.st1=await status(p);await p.keyboard.press('Control+z');await sleep(200);
  await setSnap(p,true);await p.keyboard.down('Alt');await drag(p,'5.000',1.37);await p.keyboard.up('Alt');out.snapOnAlt=await marks(p);await p.keyboard.press('Control+z');await sleep(200);
  await setSnap(p,false);await p.keyboard.down('Alt');await drag(p,'5.000',1.37);await p.keyboard.up('Alt');out.snapOffAlt=await marks(p);await p.keyboard.press('Control+z');await sleep(200);
  out.after=await marks(p);const exp=5+1.37;const near=v=>Math.abs(+v-exp)<=0.05&&Math.abs(+v-Math.round(+v))>0.01;
  rec('MK-DRAG-FREE',near(out.snapOff[0])&&near(out.snapOnAlt[0])&&out.snapOffAlt[0]==='6.000'&&JSON.stringify(out.after)==='["5.000","12.000"]',{pointerTime:exp,...out});});

 await T('MK-DRAG-CLICK',async()=>{await setSnap(p,true);await p.keyboard.press('Home');await sleep(100);const u0=await undoT(p);
  const f=await flagPt(p,'5.000');await p.mouse.click(f.x,f.y);await sleep(250);const pc=await posOf(p);const u1=await undoT(p);const a=await act(p);
  await blur(p);await p.keyboard.press('Home');await sleep(100);
  // drag then a fresh dblclick
  await drag(p,'5.000',2);const pd=await posOf(p);const md=await marks(p);
  await sleep(600);const f2=await flagPt(p,'7.000');await p.mouse.dblclick(f2.x,f2.y);await sleep(200);const q1=await posOf(p);await sleep(500);const q2=await posOf(p);
  await p.keyboard.press('Space');await sleep(200);
  await p.keyboard.press('Control+z');await sleep(250);
  rec('MK-DRAG-CLICK',pc===5&&u1===u0&&a==='arrangement-marker@5.000'&&pd===0&&md[0]==='7.000'&&q1>=7&&q1<7.5&&q2>q1,{clickPos:pc,undo:[u0,u1],active:a,posAfterDrag:pd,marksAfterDrag:md,dblclick:[q1,q2],marksEnd:await marks(p)});});

 await T('MK-MOVE-DUP',async()=>{await setSnap(p,true);await drag(p,'5.000',7,{steps:20});const m=await marks(p);const u=await undoT(p);
  await p.screenshot({path:`${L.OUT}/shots/move-dup-${tag}.png`});
  // arrows onto neighbour 1 s away
  await p.keyboard.press('Control+z');await sleep(200);const mm=await marks(p);
  const f=await flagPt(p,'5.000');await p.mouse.click(f.x,f.y);await sleep(200);
  for(let i=0;i<6;i++){await p.keyboard.press('ArrowRight');await sleep(150);}
  const m11=await marks(p);const u11=await undoT(p);
  await p.keyboard.press('ArrowRight');await sleep(200);const m12=await marks(p);const s12=await status(p);const u12=await undoT(p);const a12=await act(p);
  const n12=(await names(p))[1];
  rec('MK-MOVE-DUP',!m.includes('12.000')||m.filter(x=>x==='12.000').length===1&&m.length===2&&m[0]!=='12.000'&&JSON.stringify(m11)==='["11.000","12.000"]'&&JSON.stringify(m12)===JSON.stringify(m11)&&/ამ დროზე მარკერი უკვე არის/.test(s12)&&u12===u11&&a12==='arrangement-marker@11.000',{dragOnto12:m,dragUndo:u,beforeArrows:mm,after6Right:m11,refused:{marks:m12,status:s12,undo:[u11,u12],active:a12,neighbourLabel:n12}});});

 await T('MK-ARROW',async()=>{const out={};
  // marker at 11 focused, snap on: Left -> 10
  await setSnap(p,true);let f=await flagPt(p,'11.000');await p.mouse.click(f.x,f.y);await sleep(150);
  await p.keyboard.press('ArrowLeft');await sleep(200);out.snapOnLeft=await marks(p);out.act1=await act(p);
  await setSnap(p,false);f=await flagPt(p,'10.000');await p.mouse.click(f.x,f.y);await sleep(150);
  await p.keyboard.press('ArrowRight');await sleep(200);out.snapOffRight=await marks(p);out.undo=await undoT(p);
  await setSnap(p,true);f=await flagPt(p,'10.100');await p.mouse.click(f.x,f.y);await sleep(150);await p.keyboard.press('ArrowRight');await sleep(200);out.snapOnFrom10_1=await marks(p);
  // selected clip must not move
  const cb=await p.locator('[data-clip-id]').first().boundingBox();await p.mouse.click(cb.x+200,cb.y+40);await sleep(200);out.clipSel=await clips(p);
  f=await flagPt(p,'11.000');await p.mouse.click(f.x,f.y);await sleep(150);out.clipAfterFlagClick=await clips(p);out.actFlag=await act(p);
  await p.keyboard.press('ArrowLeft');await sleep(200);out.clipAfterArrow=await clips(p);out.marksAfterArrow=await marks(p);
  // Ctrl+Right navigation from focused flag
  await p.keyboard.press('Home');await sleep(100);f=await flagPt(p,'10.000');await p.keyboard.press('Control+ArrowRight').catch(()=>{});
  await blur(p);await p.keyboard.press('Home');await sleep(150);f=await flagPt(p,'10.000');
  await p.locator('[data-testid=arrangement-marker][data-marker-time="10.000"]').focus();await sleep(100);out.actBeforeCtrl=await act(p);const pb=await posOf(p);
  await p.keyboard.press('Control+ArrowRight');await sleep(200);out.ctrlRight={posBefore:pb,posAfter:await posOf(p),marks:await marks(p)};
  // Left at 0
  await addMarker(p,0);f=await flagPt(p,'0.000');await p.mouse.click(f.x,f.y);await sleep(150);const u0=await undoT(p);
  await p.keyboard.press('ArrowLeft');await sleep(200);out.leftAt0={marks:await marks(p),status:await status(p),undo:[u0,await undoT(p)]};
  await p.screenshot({path:`${L.OUT}/shots/arrow-${tag}.png`});
  const c0=out.clipSel[0];const c2=out.clipAfterArrow[0];
  rec('MK-ARROW',JSON.stringify(out.snapOnLeft)==='["10.000","12.000"]'&&out.act1==='arrangement-marker@10.000'&&JSON.stringify(out.snapOffRight)==='["10.100","12.000"]'&&JSON.stringify(out.snapOnFrom10_1)==='["11.000","12.000"]'&&c0.sel&&c2.s===c0.s&&JSON.stringify(out.marksAfterArrow)==='["10.000","12.000"]'&&out.ctrlRight.posBefore===0&&out.ctrlRight.posAfter===10&&JSON.stringify(out.ctrlRight.marks)==='["10.000","12.000"]'&&out.leftAt0.status==='მარკერი დროის დასაწყისშია.'&&out.leftAt0.marks[0]==='0.000'&&out.leftAt0.undo[0]===out.leftAt0.undo[1],out);
  await p.keyboard.press('Control+z');await sleep(200);});

 await T('MK-DRAG-PLAYING',async()=>{await setSnap(p,true);await blur(p);await p.keyboard.press('Home');await sleep(100);await p.keyboard.press('Space');await sleep(1200);
  const src0=await p.evaluate(()=>window.__src.length);const p0=await posOf(p);
  await drag(p,'10.000',-2.4);const m1=await marks(p);const p1=await posOf(p);
  await p.keyboard.press('ArrowRight');await sleep(150);await p.keyboard.press('ArrowRight');await sleep(150);const m2=await marks(p);
  const p2=await posOf(p);await sleep(400);const p3=await posOf(p);const src1=await p.evaluate(()=>window.__src.length);
  await p.keyboard.press('Space');await sleep(200);
  rec('MK-DRAG-PLAYING',src1===src0&&p1>p0&&p2>p1&&p3>p2&&p3<6&&JSON.stringify(m1)==='["8.000","12.000"]'&&JSON.stringify(m2)==='["10.000","12.000"]',{srcDelta:src1-src0,src:[src0,src1],pos:[p0,p1,p2,p3],afterDrag:m1,afterArrows:m2});
  for(let i=0;i<3;i++){await p.keyboard.press('Control+z');await sleep(150);}
  rec('MK-DRAG-PLAYING-undo',true,{marks:await marks(p)});});

 // menu rows; restore markers 5 and 12
 await T('MK-MENU',async()=>{let m=await marks(p);if(!m.includes('5.000'))await addMarker(p,5);m=await marks(p);
  const out={marks:m};
  let f=await flagPt(p,'5.000');await p.mouse.click(f.x,f.y);await sleep(150);out.focusedBefore=await act(p);
  const pos0=await posOf(p);
  const g=await flagPt(p,'12.000');await p.evaluate(()=>{window.__cm=[]});await p.mouse.click(g.x,g.y,{button:'right'});await sleep(250);
  out.open=await menuInfo(p);out.pointer={x:g.x,y:g.y};out.cur=await cur(p);out.act=await act(p);out.cm=await p.evaluate(()=>window.__cm);out.posAfterRight=await posOf(p);
  await p.screenshot({path:`${L.OUT}/shots/menu-${tag}.png`});
  await p.keyboard.press('ArrowDown');await sleep(80);out.down=await act(p);await p.keyboard.press('ArrowUp');await p.keyboard.press('ArrowUp');await sleep(80);out.upWrap=await act(p);
  await p.keyboard.press('Home');await sleep(80);out.home=await act(p);await p.keyboard.press('End');await sleep(80);out.end=await act(p);out.posAfterHome=await posOf(p);
  await p.keyboard.press('Escape');await sleep(150);out.esc={menu:(await menuInfo(p)).count,act:await act(p)};
  // Tab closes
  await p.mouse.click(g.x,g.y,{button:'right'});await sleep(200);await p.keyboard.press('Tab');await sleep(150);out.tab={menu:(await menuInfo(p)).count,act:await act(p)};
  // outside click on ruler: no seek
  await p.mouse.click(g.x,g.y,{button:'right'});await sleep(200);const pq=await posOf(p);const cq=await cur(p);
  const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
  await p.mouse.click(r.left+20*PPS,r.top+r.height/2);await sleep(250);out.outsideRuler={menu:(await menuInfo(p)).count,pos:[pq,await posOf(p)],cur:[cq,await cur(p)]};
  // outside click on clip body: no select
  await p.mouse.click(g.x,g.y,{button:'right'});await sleep(200);const cl0=await clips(p);const cb=await p.locator('[data-clip-id]').first().boundingBox();
  await p.mouse.click(cb.x+200,cb.y+40);await sleep(250);out.outsideClip={menu:(await menuInfo(p)).count,clips:[cl0,await clips(p)],pos:await posOf(p)};
  // Shift+F10 and ContextMenu key
  await p.locator('[data-testid=arrangement-marker][data-marker-time="5.000"]').focus();await sleep(100);await p.evaluate(()=>{window.__cm=[]});
  const fb=(await flag(p,'5.000').boundingBox());
  await p.keyboard.press('Shift+F10');await sleep(250);out.shiftF10={menu:await menuInfo(p),flag:fb,cm:await p.evaluate(()=>window.__cm),act:await act(p)};
  await p.keyboard.press('Shift+F10');await sleep(200);out.shiftF10again=(await menuInfo(p)).count;
  await p.keyboard.press('Escape');await sleep(150);await p.evaluate(()=>{window.__cm=[]});
  await p.keyboard.press('ContextMenu');await sleep(250);out.ctxKey={menu:await menuInfo(p),cm:await p.evaluate(()=>window.__cm)};
  await p.keyboard.press('Escape');await sleep(150);
  const o=out.open;const sf=out.shiftF10.menu;
  const ok=o.count===1&&JSON.stringify(o.items)==='["სახელის შეცვლა (F2)","დაკვრა აქედან","წაშლა (Delete)"]'&&Math.abs(o.rect.x-g.x)<=1&&Math.abs(o.rect.y-g.y)<=1&&JSON.stringify(out.cur)==='["12.000"]'&&out.act==='rename'&&out.down==='play'&&out.upWrap==='delete'&&out.home==='rename'&&out.end==='delete'&&out.esc.menu===0&&out.esc.act==='arrangement-marker@12.000'&&out.tab.menu===0&&out.outsideRuler.menu===0&&out.outsideRuler.pos[0]===out.outsideRuler.pos[1]&&out.outsideClip.menu===0&&JSON.stringify(out.outsideClip.clips[0])===JSON.stringify(out.outsideClip.clips[1])&&sf.count===1&&Math.abs(sf.rect.x-fb.x)<=2&&Math.abs(sf.rect.y-(fb.y+fb.height))<=2&&out.shiftF10again===1&&out.ctxKey.menu.count===1;
  rec('MK-MENU',ok,out);});

 await T('MK-MENU-EDGE',async()=>{const vw=p.viewportSize().width;const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
  const mb=await marks(p);await blur(p);await p.mouse.click(vw-40,r.top+r.height/2);await sleep(150);await p.keyboard.press('m');await sleep(150);await p.keyboard.press('Enter');await sleep(250);const tt=(await marks(p)).find(x=>!mb.includes(x));const f0=await flagPt(p,tt);const f={x:f0.b.x+f0.b.width-4,y:f0.y};
  await p.mouse.click(f.x,f.y,{button:'right'});await sleep(250);const mi=await menuInfo(p);
  await p.screenshot({path:`${L.OUT}/shots/menu-edge-${tag}.png`});
  // wheel scroll with menu open
  const lane=await p.locator('[data-clip-id]').first().boundingBox();await p.mouse.move(lane.x+100,lane.y+30);
  const sc0=await p.evaluate(()=>{const s=[...document.querySelectorAll('*')].find(e=>e.scrollWidth>e.clientWidth+50&&getComputedStyle(e).overflowX!=='visible'&&e.querySelector('[data-testid=arrangement-ruler]'));return s?s.scrollLeft:null});
  await p.mouse.wheel(300,0);await sleep(300);
  const sc1=await p.evaluate(()=>{const s=[...document.querySelectorAll('*')].find(e=>e.scrollWidth>e.clientWidth+50&&getComputedStyle(e).overflowX!=='visible'&&e.querySelector('[data-testid=arrangement-ruler]'));return s?s.scrollLeft:null});
  const mi2=await menuInfo(p);const fb2=await flag(p,tt).boundingBox();
  await p.screenshot({path:`${L.OUT}/shots/menu-scrolled-${tag}.png`});
  await p.keyboard.press('Escape');await sleep(150);
  rec('MK-MENU-EDGE',mi.count===1&&mi.rect.right<=vw-4+0.5&&mi.rect.x<f.x&&Math.abs(mi.rect.y-f.y)<=1,{vw,marker:tt,pointer:f,rect:mi.rect});
  rec('MK-MENU-SCROLL',null,{scrollLeft:[sc0,sc1],menuAfterScroll:mi2.count,menuRect:mi2.rect,flagAfter:fb2});
  await p.evaluate(()=>{const s=[...document.querySelectorAll('*')].find(e=>e.scrollWidth>e.clientWidth+50&&getComputedStyle(e).overflowX!=='visible'&&e.querySelector('[data-testid=arrangement-ruler]'));if(s)s.scrollLeft=0});await sleep(200);
  await p.locator(`[data-testid=arrangement-marker][data-marker-time="${tt}"]`).focus();await p.keyboard.press('Delete');await sleep(200);});

 await T('MK-MENU-ONE',async()=>{const out={};const ln=await p.evaluate(()=>{const e=document.querySelector('[data-track-id="sfx"] [data-grid-seconds]')||[...document.querySelectorAll('[data-track-id] [data-grid-seconds]')].find(x=>!x.querySelector('[data-clip-id]'));const r=e.getBoundingClientRect();return{x:r.left+600,y:r.top+r.height/2}});
  await p.mouse.click(ln.x,ln.y,{button:'right'});await sleep(250);out.laneMenu=await menuInfo(p);
  const g=await flagPt(p,'12.000');await p.mouse.click(g.x,g.y,{button:'right'});await sleep(250);out.thenFlag=await menuInfo(p);
  await p.mouse.click(ln.x,ln.y,{button:'right'});await sleep(250);out.thenLane=await menuInfo(p);
  await p.keyboard.press('Escape');await sleep(150);await p.mouse.click(5,5);await sleep(150);out.end=await menuInfo(p);
  rec('MK-MENU-ONE',out.laneMenu.grid===1&&out.thenFlag.count+out.thenFlag.grid<=1&&out.thenFlag.count===1&&out.thenLane.count+out.thenLane.grid<=1,out);});

 await T('MK-MENU-RENAME',async()=>{const g=await flagPt(p,'12.000');const nm=async()=>p.getAttribute('[data-testid=arrangement-marker][data-marker-time="12.000"]','aria-label');const n0=await nm();
  await p.mouse.click(g.x,g.y,{button:'right'});await sleep(200);await p.click('[data-marker-menu-action=rename]');await sleep(200);const a=await act(p);
  await p.keyboard.press('Control+a');await p.keyboard.type('Drop');await p.keyboard.press('Enter');await sleep(250);
  const n1=await nm();const u=await undoT(p);const a1=await act(p);await p.keyboard.press('Control+z');await sleep(250);const n2=await nm();
  rec('MK-MENU-RENAME',a==='arrangement-marker-name-input'&&/«Drop»/.test(n1)&&/Rename Marker|სახელ/.test(u||'')&&a1==='arrangement-marker@12.000'&&n2===n0,{editorFocus:a,names:[n0,n1,n2],undo:u,focusAfter:a1});});

 await T('MK-MENU-PLAY',async()=>{await blur(p);await p.keyboard.press('Home');await sleep(100);
  const f=await flagPt(p,'5.000');await p.mouse.click(f.x,f.y,{button:'right'});await sleep(200);await p.click('[data-marker-menu-action=play]');
  await sleep(150);const a1=await posOf(p);await sleep(500);const a2=await posOf(p);
  const g=await flagPt(p,'12.000');await p.mouse.click(g.x,g.y,{button:'right'});await sleep(200);await p.click('[data-marker-menu-action=play]');
  await sleep(150);const b1=await posOf(p);await sleep(500);const b2=await posOf(p);
  await p.keyboard.press('Space');await sleep(200);
  rec('MK-MENU-PLAY',a1>=5&&a1<=5.3&&a2>a1&&b1>=12&&b1<=12.3&&b2>b1,{stopped:[a1,a2],playing:[b1,b2]});});

 await T('MK-MENU-DELETE',async()=>{await addMarker(p,8);const m0=await marks(p);const f=await flagPt(p,'8.000');
  await p.mouse.click(f.x,f.y,{button:'right'});await sleep(200);await p.click('[data-marker-menu-action=delete]');await sleep(250);
  const m1=await marks(p);const a=await act(p);const u=await undoT(p);const cl=(await clips(p)).length;await p.keyboard.press('Control+z');await sleep(250);const m2=await marks(p);
  rec('MK-MENU-DELETE',JSON.stringify(m1)===JSON.stringify(m0.filter(x=>x!=='8.000'))&&/arrangement-marker@(5|10)\.000/.test(a)&&cl===1&&JSON.stringify(m2)===JSON.stringify(m0),{before:m0,after:m1,focus:a,undo:u,clips:cl,afterUndo:m2});});

 await T('MK-RENAME-F2',async()=>{await p.locator('[data-testid=arrangement-marker][data-marker-time="5.000"]').focus();await p.keyboard.press('F2');await sleep(200);const a=await act(p);
  await p.keyboard.press('Control+a');await p.keyboard.type('Intro');await p.keyboard.press('Enter');await sleep(200);
  rec('MK-RENAME-F2',a==='arrangement-marker-name-input'&&/«Intro»/.test((await names(p))[0])&&(await act(p))==='arrangement-marker@5.000',{editor:a,names:await names(p),undo:await undoT(p),focus:await act(p)});});

 await T('MK-CUT-TIME',async()=>{await setSnap(p,true);await addMarker(p,9);const m0=await marks(p);
  const cbx=await p.locator('[data-clip-id]').first().boundingBox();const rl=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left);
  await blur(p);await p.mouse.move(rl+7*PPS,cbx.y+40);await p.mouse.down();await p.mouse.move(rl+8*PPS,cbx.y+40,{steps:6});await p.mouse.move(rl+10*PPS,cbx.y+40,{steps:6});await p.mouse.up();await sleep(250);
  const rg=await p.textContent('[data-testid=arrangement-range]').catch(()=>null);
  await p.keyboard.press('Control+Shift+L');await sleep(200);await p.keyboard.press('Control+Shift+X');await sleep(300);
  const m1=await marks(p);const s1=await status(p);await p.keyboard.press('Control+z');await sleep(300);const m2=await marks(p);
  rec('MK-CUT-TIME',JSON.stringify(m1)==='["5.000","7.000","9.000"]'&&JSON.stringify(m2)===JSON.stringify(m0),{range:rg,before:m0,after:m1,status:s1,afterUndo:m2});});

 const hyd=s.con.filter(l=>/hydrat|did not match|server rendered/i.test(l));
 rec('CONSOLE',hyd.length===0,{hyd,errs:s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!NOISE.test(l)).slice(0,8)});
 rec('NET',true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url),auth:s.reqs.filter(r=>r.auth).length});
 await s.browser.close();
})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
