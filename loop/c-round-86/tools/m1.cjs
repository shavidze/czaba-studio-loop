const X=require('./lib85.cjs');const{L,sleep,st,blur,key,vInfo}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/m1-${vp}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const hdrRect=(p,lane)=>p.evaluate(l=>document.querySelector(`[data-track-id=${l}] [data-testid=arrangement-track-header]`).getBoundingClientRect().toJSON(),lane);
const topAt=(p,x,y)=>p.evaluate(([x,y])=>{const t=document.elementFromPoint(x,y);const h=t&&t.closest('[data-testid=arrangement-track-header],[data-testid=arrangement-group-header]');return{tag:t&&t.tagName,tid:t&&(t.getAttribute('data-testid')||t.getAttribute('title')||t.getAttribute('aria-label')||''),inHeader:!!h,headerOf:h&&(h.closest('[data-track-id]')?.dataset.trackId||'group'),inClip:!!(t&&t.closest('[data-clip-id]')),cls:t&&String(t.className).slice(0,80)}},[x,y]);
const snapState=async p=>{const v=await vInfo(p);const a=await X.clipInfo(p,'stems');const s=await st(p);return{v:{fi:v.fi,start:v.start,dur:v.dur},a:{fi:a.fi,start:a.start},undo:s.undo,status:s.status};};
async function deselect(p){await X.geo(p);const lb=await X.laneBox(p,'sfx');const vw=p.viewportSize().width;await p.mouse.click(Math.round(Math.min(vw-60,X.tx(30))),Math.round(lb.y+lb.h/2));await sleep(300);await blur(p);}
async function scrollBy(p,lane,dx){const h=await hdrRect(p,lane);await p.mouse.move(Math.round(h.right+300),Math.round(h.top+h.height/2));await p.mouse.wheel(dx,0);await sleep(600);}
const scrollLeftOf=p=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');let e=document.querySelector('[data-track-id]');while(e&&e.scrollWidth<=e.clientWidth+1)e=e.parentElement;return e?e.scrollLeft:null;});
async function pixDiff(p,a,b,splitX){return p.evaluate(async([a,b,splitX])=>{const ld=async s=>{const im=new Image();im.src='data:image/png;base64,'+s;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);return{w:im.width,h:im.height,d:g.getImageData(0,0,im.width,im.height).data}};const A=await ld(a),B=await ld(b);let inH=0,inL=0;
 for(let y=0;y<A.h;y++)for(let x=0;x<A.w;x++){const i=(y*A.w+x)*4;const df=Math.abs(A.d[i]-B.d[i])+Math.abs(A.d[i+1]-B.d[i+1])+Math.abs(A.d[i+2]-B.d[i+2]);if(df>24){if(x<splitX)inH++;else inL++;}}return{inHeader:inH,inLane:inL,w:A.w,h:A.h};},[a.toString('base64'),b.toString('base64'),splitX]);}
async function colorCount(p,buf,splitX,rgb){return p.evaluate(async([s,splitX,rgb])=>{const im=new Image();im.src='data:image/png;base64,'+s;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,im.width,im.height).data;let h=0,l=0;for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const i=(y*im.width+x)*4;if(Math.abs(d[i]-rgb[0])+Math.abs(d[i+1]-rgb[1])+Math.abs(d[i+2]-rgb[2])<60){if(x<splitX)h++;else l++;}}return{header:h,lane:l};},[buf.toString('base64'),splitX,rgb]);}
async function pixelAt(p,x,y){const buf=await p.screenshot({clip:{x,y,width:1,height:1}});return p.evaluate(async s=>{const im=new Image();im.src='data:image/png;base64,'+s;await im.decode();const c=document.createElement('canvas');c.width=1;c.height=1;const g=c.getContext('2d');g.drawImage(im,0,0);return [...g.getImageData(0,0,1,1).data.slice(0,3)]},buf.toString('base64'));}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);await X.decline(p);
 // M1-VISIBLE (f): empty video lane hint sits right of the header
 await T('M1-VISIBLE-hint',async()=>{const o=await p.evaluate(()=>{const l=document.querySelector('[data-track-id=video]');const h=l.querySelector('[data-testid=arrangement-track-header]').getBoundingClientRect();const hint=[...l.querySelectorAll('p')].find(e=>/ვიდეო არ არის/.test(e.textContent));const r=hint&&hint.getBoundingClientRect();const cx=r&&r.left+20,cy=r&&r.top+r.height/2;const t=r&&document.elementFromPoint(cx,cy);return{hdrRight:h.right,hint:r&&{left:r.left,right:r.right,text:hint.textContent.trim()},visibleTop:t&&(t.closest('[data-testid=arrangement-track-header]')?'header':t.tagName)}});
  await p.screenshot({path:`${SH}/m1-hint-${vp}.png`,clip:{x:0,y:0,width:900,height:Math.min(500,vp==='1280x720'?720:900)}});rec('M1-VISIBLE-hint',!!o.hint&&o.hint.left>=o.hdrRight-0.5&&o.hint.left<=o.hdrRight+1,o);});
 const U=await X.setupV(p);rec('SETUP',null,{v:{start:U.v.start,end:U.v.end},clips:U.S.clips.map(c=>[c.lane,c.start,c.dur])});
 await X.vDrag(p,'in',40);await X.dragHandle(p,'stems','in',40);await p.mouse.move(5,5);await sleep(200);
 const base=await snapState(p);rec('FADES',base.v.fi==='1.000'&&base.a.fi==='1.000',base);
 const probes=[{k:'video-fade',lane:'video',sel:'[data-track-id=video] [data-testid=arrangement-video-fade-in-handle]'},{k:'audio-fade',lane:'stems',sel:'[data-track-id=stems] [data-testid=arrangement-clip-fade-in-handle]'},{k:'audio-trim',lane:'stems',trim:true},{k:'video-trim',lane:'video',trim:true}];
 const RES={};
 for(const selected of [false,true]){for(const pr of probes){const id=`${pr.k}-${selected?'sel':'unsel'}`;await T('M1-'+id,async()=>{
   await deselect(p);if(selected){await X.selectClip(p,pr.lane);await blur(p);}
   const isSel=await p.evaluate(l=>{const e=document.querySelector(`[data-track-id=${l}] [data-clip-id]`);return/ring-brand/.test(e.className)},pr.lane);
   if(pr.lane==='video')await X.hoverV(p);else await X.hover(p,pr.lane);
   const hdr=await hdrRect(p,pr.lane);
   const pt=async()=>{if(pr.trim){const c=await X.clipInfo(p,pr.lane);return{x:c.box.x+3,y:c.box.y+c.box.h*0.6};}return p.evaluate(sel=>{const b=document.querySelector(sel).getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2}},pr.sel);};
   const p0=await pt();const dx=Math.round(p0.x-(hdr.right-150));const sl0=await scrollLeftOf(p);await scrollBy(p,pr.lane,dx);const sl1=await scrollLeftOf(p);
   const q=await pt();const x=Math.round(q.x),y=Math.round(q.y);const under=x>hdr.left&&x<hdr.right-1;
   await p.mouse.move(x,y,{steps:2});await sleep(250);const top=await topAt(p,x,y);
   await p.screenshot({path:`${SH}/m1-${id}-${vp}.png`,clip:{x:Math.max(0,Math.round(hdr.left)-4),y:Math.max(0,Math.round(hdr.top)-6),width:Math.round(hdr.width)+260,height:Math.round(hdr.height)+12}});
   const before=await snapState(p);await p.mouse.down();await p.mouse.move(x+20,y,{steps:4});await p.mouse.move(x+40,y,{steps:4});await sleep(120);await p.mouse.up();await sleep(450);const after=await snapState(p);
   let restored=null;if(after.undo!==before.undo){await blur(p);await key(p,'Control+z',450);restored=await snapState(p);}
   await scrollBy(p,pr.lane,-dx);
   const clipChanged=JSON.stringify(after.v)!==JSON.stringify(before.v)||JSON.stringify(after.a)!==JSON.stringify(before.a);const clipStatus=/Fade|Trim|Move|გადატან|კლიპ/i.test(after.status)&&after.status!==before.status;
   RES[id]={isSel,under,scroll:[sl0,sl1],pt:[x,y],hdr:[hdr.left,hdr.right],top,before,after,restored,clipChanged,clipStatus};
   rec('M1-'+id,isSel===selected&&under&&top.inHeader&&!top.inClip&&!clipChanged&&after.undo===before.undo&&!clipStatus,RES[id]);});}}
 // M1-ENV: envelope point under the header + header Mute click
 await T('M1-ENV',async()=>{await deselect(p);const o={};const b=await X.buildV(p,'stems',[6,10,14],0.5);o.env0=(await X.envInfo(p,'stems')).env;const c=await X.envInfo(p,'stems');const q0=c.points[0];const hdr=await hdrRect(p,'stems');const dx=Math.round(q0.cx-(hdr.right-150));await scrollBy(p,'stems',dx);
  const c1=await X.envInfo(p,'stems');const q=c1.points[0];o.pt=[Math.round(q.cx),Math.round(q.cy)];o.under=q.cx>hdr.left&&q.cx<hdr.right;await p.mouse.move(o.pt[0],o.pt[1]);await sleep(200);o.top=await topAt(p,o.pt[0],o.pt[1]);
  const u0=(await st(p)).undo;await p.mouse.down();await p.mouse.move(o.pt[0],o.pt[1]-15,{steps:5});await p.mouse.up();await sleep(400);o.envAfterDrag=(await X.envInfo(p,'stems')).env;o.undoAfterDrag=(await st(p)).undo;if(o.undoAfterDrag!==u0){await blur(p);await key(p,'Control+z',400);}
  await p.screenshot({path:`${SH}/m1-env-${vp}.png`,clip:{x:Math.round(hdr.left)-4,y:Math.round(hdr.top)-6,width:Math.round(hdr.width)+260,height:Math.round(hdr.height)+12}});
  const mb=await X.lMute(p,'stems').boundingBox();const mx=Math.round(mb.x+mb.width/2),my=Math.round(mb.y+mb.height/2);o.muteTop=await topAt(p,mx,my);const m0=await X.lMute(p,'stems').getAttribute('aria-pressed');await p.mouse.click(mx,my);await sleep(300);const m1=await X.lMute(p,'stems').getAttribute('aria-pressed');o.envAfterMute=(await X.envInfo(p,'stems')).env;await p.mouse.click(mx,my);await sleep(300);const m2=await X.lMute(p,'stems').getAttribute('aria-pressed');o.mute=[m0,m1,m2];
  await scrollBy(p,'stems',-dx);await X.setMode(p,false);
  rec('M1-ENV',o.under&&o.top.inHeader&&!o.top.inClip&&o.envAfterDrag===o.env0&&o.undoAfterDrag===u0&&o.muteTop.inHeader&&/Mute/.test(o.muteTop.tid)&&m0==='false'&&m1==='true'&&m2==='false'&&o.envAfterMute===o.env0,o);});
 // M1-GHOST: lane-move ghost partly under the sfx header
 await T('M1-GHOST',async()=>{await deselect(p);const o={};const hdrS=await hdrRect(p,'sfx');const c0=await X.clipInfo(p,'stems');const dx=Math.round(c0.box.x-(hdrS.right-120));await scrollBy(p,'stems',dx);
  const c=await X.clipInfo(p,'stems');const sx=Math.round(hdrS.right+160),sy=Math.round(c.box.y+8);const lb=await X.laneBox(p,'sfx');const ty=Math.round(lb.y+lb.h/2);
  const clip={x:Math.round(hdrS.left),y:Math.round(hdrS.top),width:Math.round(hdrS.width)+300,height:Math.round(hdrS.height)};
  await p.mouse.move(sx,sy);await sleep(300);const A=await p.screenshot({clip});
  const u0=(await st(p)).undo;await p.mouse.down();await p.mouse.move(sx,sy+10,{steps:3});await p.mouse.move(sx-20,ty,{steps:8});await p.mouse.move(sx-40,ty,{steps:4});await sleep(400);
  o.ghost=await p.evaluate(()=>{const g=[...document.querySelectorAll('[data-track-id=sfx] .border-dashed')].map(e=>e.getBoundingClientRect().toJSON());return g;});
  const B=await p.screenshot({clip});fs.writeFileSync(`${SH}/m1-ghost-before-${vp}.png`,A);fs.writeFileSync(`${SH}/m1-ghost-during-${vp}.png`,B);
  const g=o.ghost[0];if(g){const gx=Math.round(Math.max(g.left+4,hdrS.left+10)),gy=Math.round(g.top+g.height/2);o.ghostUnderHeader=g.left<hdrS.right;o.topInGhostSpot=await topAt(p,Math.min(gx,Math.round(hdrS.right-10)),gy);}
  o.diff=await pixDiff(p,A,B,Math.round(hdrS.width));o.ghostColor=await p.evaluate(()=>{const e=document.querySelector('[data-track-id=sfx] .border-dashed');return e&&getComputedStyle(e).borderTopColor});const gc=(o.ghostColor||'rgb(0,0,0)').match(/\d+/g).slice(0,3).map(Number);o.accentBefore=await colorCount(p,A,Math.round(hdrS.width)-2,gc);o.accentDuring=await colorCount(p,B,Math.round(hdrS.width)-2,gc);
  await p.keyboard.press('Escape');await sleep(200);await p.mouse.up();await sleep(400);o.after=await X.clipInfo(p,'stems');o.undo=(await st(p)).undo;o.u0=u0;o.status=(await st(p)).status;o.escapeCancelsMove=o.undo===u0;if(o.undo!==u0){await blur(p);await key(p,'Control+z',450);}o.restoredStart=(await X.clipInfo(p,'stems')).start;
  await scrollBy(p,'stems',-dx);
  rec('M1-GHOST',!!g&&o.ghostUnderHeader&&o.accentDuring.header===o.accentBefore.header&&o.accentDuring.lane>o.accentBefore.lane+50&&o.diff.inLane>0&&o.topInGhostSpot.inHeader&&o.restoredStart===c0.start,{...o,after:{start:o.after.start,lane:'stems'},c0start:c0.start});});
 // M1-VISIBLE (a-e)
 await T('M1-VISIBLE',async()=>{await deselect(p);const o={};const sl=await scrollLeftOf(p);o.scroll=sl;
  const u0=(await st(p)).undo;const f=await X.dragHandle(p,'stems','in',20);o.fd={fi:f.after.fi,undo:f.s.undo,status:f.s.status};await X.undo(p);o.fdBack=(await X.clipInfo(p,'stems')).fi;
  const c=await X.clipInfo(p,'stems');const tx0=Math.round(c.box.x+3),ty0=Math.round(c.box.y+c.box.h*0.6);o.trimTop=await topAt(p,tx0,ty0);await p.mouse.move(tx0,ty0);await p.mouse.down();await p.mouse.move(tx0+20,ty0,{steps:4});await p.mouse.move(tx0+40,ty0,{steps:4});await p.mouse.up();await sleep(400);const ct=await X.clipInfo(p,'stems');o.trim={start:ct.start,undo:(await st(p)).undo};await X.undo(p);o.trimBack=(await X.clipInfo(p,'stems')).start;
  await X.setMode(p,true);const ed=await X.dragPoint(p,'stems',1,0,-12);o.env={before:ed.before.points[1].dg,after:ed.after.points[1].dg,undo:ed.s.undo};await X.undo(p);o.envBack=(await X.envInfo(p,'stems')).env;await X.setMode(p,false);
  // selected ring above neighbour: duplicate stems clip, select first
  await X.selectClip(p,'stems');await blur(p);await key(p,'Control+d',600);const cl=await X.allClips(p);o.stemsClips=cl.filter(x=>x.lane==='stems');const c1=await X.clipInfo(p,'stems',0);const bx=Math.round(c1.box.x+c1.box.w);const by=Math.round(c1.box.y);
  const crop={x:bx-6,y:by,width:12,height:Math.round(c1.box.h)};await deselect(p);const N=await p.screenshot({clip:crop});await X.selectClip(p,'stems',0);await p.mouse.move(5,5);await sleep(300);const S2=await p.screenshot({clip:crop});
  fs.writeFileSync(`${SH}/m1-ring-unsel-${vp}.png`,N);fs.writeFileSync(`${SH}/m1-ring-sel-${vp}.png`,S2);
  o.ring=await pixDiff(p,N,S2,6);o.selZ=await p.evaluate(()=>{const e=[...document.querySelectorAll('[data-track-id=stems] [data-clip-id]')].sort((a,b)=>+a.dataset.clipStart- +b.dataset.clipStart)[0];return{z:getComputedStyle(e).zIndex,ring:/ring-brand/.test(e.className)}});
  await deselect(p);await X.undo(p);o.afterUndoDup=(await X.allClips(p)).filter(x=>x.lane==='stems').length;
  // playhead line visible over clips
  await X.seek(p,5);const ph=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-playhead]');const r=e.getBoundingClientRect();return{x:r.left,w:r.width,bg:getComputedStyle(e).backgroundColor}});const sc=await X.clipInfo(p,'stems');const pyy=Math.round(sc.box.y+sc.box.h*0.5);
  o.playhead={...ph,onClip:await pixelAt(p,Math.round(ph.x),pyy),beside:await pixelAt(p,Math.round(ph.x)+6,pyy)};
  await X.selectClip(p,'stems');await p.mouse.move(5,5);await sleep(200);o.playhead.onSelected=await pixelAt(p,Math.round(ph.x),pyy);await deselect(p);
  const near=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])+Math.abs(a[2]-b[2])<40;const rgb=o.playhead.bg.match(/\d+/g).slice(0,3).map(Number);o.playhead.bgRgb=rgb;
  rec('M1-VISIBLE',o.fd.fi==='1.500'&&/Fade In/.test(o.fd.undo)&&o.fdBack==='1.000'&&!o.trimTop.inHeader&&o.trimTop.inClip&&o.trim.start===+(c.start+1).toFixed(3)&&o.trimBack===c.start&&o.env.after!==o.env.before&&o.ring.inLane>0&&o.selZ.z==='10'&&near(o.playhead.onClip,rgb)&&near(o.playhead.onSelected,rgb)&&o.afterUndoDup===1,o);});
 // reviewer L6: group header row with overview blocks scrolled under it
 await T('M1-GROUP',async()=>{const o={};await X.groupStemsSfx(p);await sleep(500);await X.fold(p,'ჯგუფი 1');await sleep(300);const gh=await p.evaluate(()=>{const h=document.querySelector('[data-testid=arrangement-group-header]');return h&&h.getBoundingClientRect().toJSON()});o.gh=gh;
  const ov=await p.evaluate(()=>{const b=document.querySelector('[data-testid=arrangement-group-overview] [data-overview-clip-id]');return b&&b.getBoundingClientRect().toJSON()});o.ov0=ov;
  if(gh&&ov){const dx=Math.round(ov.left-(gh.right-120));await p.mouse.move(Math.round(gh.right+300),Math.round(gh.top+gh.height/2));await p.mouse.wheel(dx,0);await sleep(600);
   const ov1=await p.evaluate(()=>{const b=document.querySelector('[data-testid=arrangement-group-overview] [data-overview-clip-id]');return b.getBoundingClientRect().toJSON()});const x=Math.round(Math.min(gh.right-20,ov1.left+10)),y=Math.round(ov1.top+ov1.height/2);o.pt=[x,y];o.under=ov1.left<gh.right-20;o.top=await topAt(p,x,y);
   await p.screenshot({path:`${SH}/m1-group-${vp}.png`,clip:{x:Math.round(gh.left)-4,y:Math.round(gh.top)-4,width:Math.round(gh.width)+260,height:Math.round(gh.height)+8}});await p.mouse.move(Math.round(gh.right+300),Math.round(gh.top+gh.height/2));await p.mouse.wheel(-dx,0);await sleep(400);}
  rec('M1-GROUP',!!o.top&&o.under&&o.top.inHeader,o);});
 await X.finish(s,rec,'M1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
