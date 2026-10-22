const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const tag=vp;const sleep=L.sleep;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok===true?'PASS ':ok===false?'FAIL ':'INFO ')+id+' '+JSON.stringify(d));fs.writeFileSync(`${L.OUT}/mk75-${tag}${process.env.ONLY?'-only':''}.json`,JSON.stringify(R,null,1));};
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const T=async(id,fn)=>{if(ONLY&&!ONLY.includes(id))return;try{await fn();}catch(e){rec(id,false,{error:String(e).slice(0,400)});}};
const posOf=async p=>{const t=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(t);return m?+m[1]*60+ +m[2]:NaN;};
const undoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('data-marker-time')));
const clips=p=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>({s:e.getAttribute('data-clip-start'),sel:/ring-brand/.test(e.className)})));
const act=p=>p.evaluate(()=>{const a=document.activeElement;if(!a)return null;return (a.getAttribute('data-testid')||a.getAttribute('data-marker-menu-action')||a.tagName)+(a.getAttribute('data-marker-time')?'@'+a.getAttribute('data-marker-time'):'')});
const menu=p=>p.evaluate(()=>{const m=document.querySelectorAll('[data-testid=arrangement-marker-menu]');const r=m[0]&&m[0].getBoundingClientRect();return{count:m.length,grid:document.querySelectorAll('[data-testid=arrangement-grid-menu]').length,rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null}});
const sc=p=>p.evaluate(()=>{const s=document.querySelector('[data-testid=arrangement-timeline-scroller]');return{left:s.scrollLeft,top:s.scrollTop,sw:s.scrollWidth,cw:s.clientWidth,sh:s.scrollHeight,ch:s.clientHeight}});
const follow=p=>p.getAttribute('[data-testid=arrangement-follow]','data-follow-mode');
const zoomRO=p=>p.textContent('[data-testid=arrangement-zoom-readout]').then(s=>s.trim());
const flagSel=t=>`[data-testid=arrangement-marker][data-marker-time="${t}"]`;
const fbox=(p,t)=>p.locator(flagSel(t)).boundingBox();
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur());
const snapState=p=>p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');
const setSnap=async(p,on)=>{if((await snapState(p))!==String(on)){await p.click('[data-testid=arrangement-snap-toggle]');await sleep(150);}await blur(p);return snapState(p);};
const setFollowOn=async p=>{for(let i=0;i<3&&(await follow(p))!=='on';i++){await p.click('[data-testid=arrangement-follow]');await sleep(150);}await blur(p);return follow(p);};
const rulerRect=p=>p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
const pps=p=>p.evaluate(()=>{const f=[...document.querySelectorAll('[data-testid=arrangement-marker]')].filter(e=>+e.getAttribute('data-marker-time')>0);const e=f[0];return e?parseFloat(e.style.left)/+e.getAttribute('data-marker-time'):null});
const lanePt=async p=>{const b=await p.locator('[data-clip-id]').first().boundingBox();const vw=p.viewportSize().width;return{x:Math.min(b.x+b.width-20,vw-150),y:b.y+30};};
const addAtX=async(p,x)=>{const r=await rulerRect(p);const m0=await marks(p);await blur(p);await p.mouse.click(x,r.top+r.height/2);await sleep(150);await p.keyboard.press('m');await sleep(150);await p.keyboard.press('Enter');await sleep(300);return (await marks(p)).find(v=>!m0.includes(v));};
const rightClickFlag=async(p,t)=>{const b=await fbox(p,t);await p.mouse.click(b.x+3,b.y+b.height/2,{button:'right'});await sleep(250);return b;};
const state=async p=>({pos:await posOf(p),undo:await undoT(p),clips:JSON.stringify(await clips(p)),marks:JSON.stringify(await marks(p))});
(async()=>{
 const s=await L.open(vp);const p=s.page;await L.fresh(p);
 const snap=await setSnap(p,true);const fol=await setFollowOn(p);
 const st=await L.setupME(p,530);
 const vw=p.viewportSize().width;
 const t1=await addAtX(p,vw-220);
 const P0=await pps(p);
 rec('SETUP',st.length===1&&!!t1,{clipStarts:st,snap,follow:fol,marker:t1,pps:P0,sc:await sc(p),zoom:await zoomRO(p)});

 await T('MK-MENU-SCROLL',async()=>{const out={};
  // select the clip so selection is a real value to preserve
  const cb=await p.locator('[data-clip-id]').first().boundingBox();await p.mouse.click(cb.x+150,cb.y+40);await sleep(200);
  await p.keyboard.press('Home');await sleep(150);await blur(p);
  for(const mode of ['right-click','shift-f10']){const o={};
   const s0=await sc(p);const st0=await state(p);const fb0=await fbox(p,t1);
   if(mode==='right-click'){await rightClickFlag(p,t1);}else{await p.locator(flagSel(t1)).focus();await sleep(150);await p.keyboard.press('Shift+F10');await sleep(250);}
   o.open=await menu(p);o.actOpen=await act(p);
   await p.screenshot({path:`${L.OUT}/shots/scroll-open-${mode}-${tag}.png`});
   const lp=await lanePt(p);await p.mouse.move(lp.x,lp.y);await sleep(100);
   await p.mouse.wheel(300,0);await sleep(350);
   o.afterMenu=await menu(p);o.act=await act(p);const s1=await sc(p);const fb1=await fbox(p,t1);
   await sleep(400);const s2=await sc(p);
   await p.screenshot({path:`${L.OUT}/shots/scroll-closed-${mode}-${tag}.png`});
   const st1=await state(p);
   await p.mouse.wheel(100,0);await sleep(300);o.second={menu:(await menu(p)).count,act:await act(p),left:(await sc(p)).left};
   o.scrollLeft=[s0.left,s1.left,s2.left];o.flagX=[fb0.x,fb1.x];o.stateBefore=st0;o.stateAfter=st1;
   o.ok=o.open.count===1&&o.afterMenu.count===0&&o.act===`arrangement-marker@${t1}`&&Math.abs(s1.left-s0.left-300)<=2&&s2.left===s1.left&&Math.abs((fb0.x-fb1.x)-300)<=2&&JSON.stringify(st0)===JSON.stringify(st1)&&o.second.menu===0&&o.second.act===`arrangement-marker@${t1}`;
   out[mode]=o;
   await p.mouse.wheel(-1000,0);await sleep(400);await blur(p);}
  rec('MK-MENU-SCROLL',out['right-click'].ok&&out['shift-f10'].ok,out);});

 await T('MK-MENU-ZOOM',async()=>{const out={};await p.keyboard.press('Home');await sleep(150);await blur(p);
  const st0=await state(p);const z0=await zoomRO(p);const P1=await pps(p);out.follow0=await follow(p);
  await rightClickFlag(p,t1);out.open=await menu(p);
  const lp=await lanePt(p);const r0=await rulerRect(p);const tUnder0=(lp.x-r0.left)/P1;
  await p.mouse.move(lp.x,lp.y);await p.keyboard.down('Control');await p.mouse.wheel(0,-120);await p.keyboard.up('Control');await sleep(400);
  out.after=await menu(p);out.act=await act(p);const z1=await zoomRO(p);const P2=await pps(p);const r1=await rulerRect(p);const tUnder1=(lp.x-r1.left)/P2;
  out.zoom=[z0,z1];out.pps=[P1,P2];out.timeUnderPointer=[tUnder0,tUnder1];out.follow1=await follow(p);
  const st1=await state(p);out.state=[st0,st1];
  await p.screenshot({path:`${L.OUT}/shots/zoom-closed-${tag}.png`});
  // zoom again without a menu: focus not moved elsewhere
  await blur(p);await p.keyboard.down('Control');await p.mouse.wheel(0,120);await p.keyboard.up('Control');await sleep(300);out.noMenuZoomAct=await act(p);
  rec('MK-MENU-ZOOM',out.open.count===1&&out.after.count===0&&out.act===`arrangement-marker@${t1}`&&P2>P1&&st0.pos===st1.pos&&JSON.stringify(st0)===JSON.stringify(st1)&&Math.abs(tUnder0-tUnder1)<0.05,out);});

 await T('NB-GRID-SCROLL',async()=>{await p.mouse.wheel(-2000,0);await sleep(300);
  const ln=await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-track-id] [data-grid-seconds]')].find(x=>!x.querySelector('[data-clip-id]'));const r=e.getBoundingClientRect();return{x:r.left+400,y:r.top+r.height/2}});
  await p.mouse.click(ln.x,ln.y,{button:'right'});await sleep(250);const m0=await menu(p);
  await p.mouse.move(ln.x,ln.y);await p.mouse.wheel(300,0);await sleep(300);const m1=await menu(p);
  await p.keyboard.press('Escape');await p.mouse.wheel(-2000,0);await sleep(300);
  rec('NB-GRID-SCROLL',m0.grid===1&&m1.grid===0,{open:m0,afterWheel:m1});});

 await T('MK-MENU-VSCROLL',async()=>{const out={};await p.mouse.wheel(-2000,0);await sleep(200);
  let g=await sc(p);let i=0;
  while(g.sh<=g.ch+60&&i<8){const hs=await p.locator('[data-testid=arrangement-track-height]').all();if(!hs.length)break;const h=hs[i%hs.length];const b=await h.boundingBox();if(!b||b.y>p.viewportSize().height-5){i++;continue;}
   await p.mouse.move(Math.min(b.x+b.width/2,b.x+300),b.y+b.height/2);await p.mouse.down();await p.mouse.move(Math.min(b.x+b.width/2,b.x+300),Math.min(b.y+200,p.viewportSize().height-2),{steps:10});await p.mouse.up();await sleep(200);i++;g=await sc(p);(out.grow=out.grow||[]).push({i,y:b.y,sh:g.sh,ch:g.ch,now:await h.getAttribute('aria-valuenow')});}
  out.handles=await p.locator('[data-testid=arrangement-track-height]').count();out.overflow=g.sh-g.ch;
  if(out.overflow<=0){rec('MK-MENU-VSCROLL',null,{notRun:'no vertical overflow',...out});return;}
  await blur(p);const fb0=await fbox(p,t1);await rightClickFlag(p,t1);out.open=await menu(p);
  const lp=await lanePt(p);await p.mouse.move(lp.x,Math.min(lp.y,p.viewportSize().height-40));const s0=await sc(p);
  await p.mouse.wheel(0,200);await sleep(350);const s1=await sc(p);const fb1=await fbox(p,t1);out.after=await menu(p);out.act=await act(p);
  out.scroll=[s0,s1];out.flag=[fb0,fb1];
  await p.screenshot({path:`${L.OUT}/shots/vscroll-${tag}.png`});
  await p.keyboard.press('Escape');await sleep(150);out.escAct=await act(p);
  await p.mouse.wheel(0,-1000);await sleep(300);
  rec('MK-MENU-VSCROLL',out.open.count===1&&s1.top>s0.top&&s1.left===s0.left&&out.after.count===1&&Math.abs(fb1.x-fb0.x)<=1&&Math.abs(fb1.y-fb0.y)<=1&&Math.abs(out.after.rect.x-out.open.rect.x)<=1&&Math.abs(out.after.rect.y-out.open.rect.y)<=1,out);});

 await T('MK-MENU-FOLLOW',async()=>{const out={};await blur(p);await p.mouse.wheel(-3000,0);await sleep(200);
  await p.keyboard.press('Home');await sleep(150);
  const lp=await lanePt(p);
  // zoom in first (pauses Follow), then Follow on explicitly
  const r0=await rulerRect(p);await p.mouse.move(r0.left+20,lp.y);
  for(let i=0;i<10;i++){await p.keyboard.down('Control');await p.mouse.wheel(0,-120);await p.keyboard.up('Control');await sleep(120);}
  await p.mouse.wheel(-3000,0);await sleep(300);
  out.zoom=await zoomRO(p);out.followAfterZoom=await follow(p);out.followOn=await setFollowOn(p);
  await p.keyboard.press('Home');await sleep(150);
  const r1=await rulerRect(p);const tf=await addAtX(p,r1.left+150);const P=await pps(p);out.marker=tf;out.pps=P;out.visibleSec=(await sc(p)).cw/P;
  await blur(p);await p.keyboard.press('Home');await sleep(150);
  await p.keyboard.press('Space');await sleep(250);
  const s0=await sc(p);await rightClickFlag(p,tf);out.open=await menu(p);out.followOpen=await follow(p);
  const poll=[];let scrolledAt=null;const t0=Date.now();
  while(Date.now()-t0<12000){const s1=await sc(p);const m=await menu(p);poll.push({t:Date.now()-t0,left:s1.left,menu:m.count,pos:await posOf(p)});if(scrolledAt===null&&s1.left!==s0.left)scrolledAt=Date.now()-t0;if(scrolledAt!==null&&Date.now()-t0>scrolledAt+800)break;await sleep(100);}
  out.scrolledAt=scrolledAt;out.pollFirst=poll.slice(0,3);out.pollLast=poll.slice(-3);out.menuAlways=poll.every(x=>x.menu===1);out.followDuring=await follow(p);
  out.autoScrolls=[...new Set(poll.map(x=>x.left))];
  await p.screenshot({path:`${L.OUT}/shots/follow-open-${tag}.png`});
  // Play from here while playing
  await p.click('[data-marker-menu-action=play]');await sleep(150);const a1=await posOf(p);await sleep(500);const a2=await posOf(p);out.playFromHere=[a1,a2];out.followAfterPlay=await follow(p);
  // reopen and user wheel beyond tolerance
  await sleep(400);const fbv=await fbox(p,tf);const scr=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-timeline-scroller]').getBoundingClientRect().toJSON());
  out.flagVisible=fbv&&fbv.x>scr.left+200&&fbv.x<scr.right-20;
  if(out.flagVisible){await rightClickFlag(p,tf);out.reopen=await menu(p);
   await p.mouse.move(lp.x,lp.y);await p.mouse.wheel(300,0);await sleep(300);out.userWheel={menu:(await menu(p)).count,follow:await follow(p),act:await act(p)};
   const b1=await posOf(p);await sleep(400);const b2=await posOf(p);out.userWheel.pos=[b1,b2];}
  await p.keyboard.press('Space');await sleep(200);
  rec('MK-MENU-FOLLOW',out.followOn==='on'&&out.open.count===1&&scrolledAt!==null&&out.menuAlways&&out.followDuring==='on'&&Math.abs(a1-+tf)<=0.35&&a2>a1&&out.flagVisible&&out.reopen.count===1&&out.userWheel.menu===0&&out.userWheel.follow==='paused'&&out.userWheel.pos[1]>out.userWheel.pos[0],out);});

 const hyd=s.con.filter(l=>/hydrat|did not match|server rendered|useLayoutEffect/i.test(l));
 const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
 rec('CONSOLE',hyd.length===0,{hyd,errs:s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!NOISE.test(l)).slice(0,8)});
 rec('NET',true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url),auth:s.reqs.filter(r=>r.auth).length});
 if(vp==='1440x900')await s.context.storageState({path:'/home/runner/czaba-project/tmp/studio-real-loop/c-browse.json'});
 await s.browser.close();
})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
