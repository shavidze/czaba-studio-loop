const X=require('./lib84.cjs');const{L,sleep,st,blur,vInfo,vDrag}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/pm1b-${vp}.json`);
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);const U=await X.setupV(p);await vDrag(p,'in',40);await X.dragHandle(p,'stems','in',40);await p.mouse.move(5,5);
 const out={S:U.v.start,fi:(await vInfo(p)).fi,stemsFi:(await X.clipInfo(p,'stems')).fi};
 for(const [kind,lane,sel] of [['video','video','[data-testid=arrangement-video-fade-in-handle]'],['audio','stems','[data-testid=arrangement-clip-fade-in-handle]']]){const r={};
  if(kind==='video')await X.hoverV(p);else await X.hover(p,lane);
  const hdr=await p.evaluate(l=>document.querySelector(`[data-track-id=${l}] [data-testid=arrangement-track-header]`).getBoundingClientRect().toJSON(),lane);
  const el0=await p.evaluate(sel=>{const b=document.querySelector(sel).getBoundingClientRect();return{x:b.left+b.width/2,y:b.top+b.height/2}},sel);
  const target=Math.round(hdr.right-150);const dx=Math.round(el0.x-target);await p.mouse.move(Math.round(hdr.right+300),Math.round(el0.y));await p.mouse.wheel(dx,0);await sleep(600);
  // hover the clip remains? move mouse to the handle spot (now under header)
  const el=await p.evaluate(sel=>{const e=document.querySelector(sel);const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return{x:b.left+b.width/2,y:b.top+b.height/2,op:cs.opacity,vis:cs.visibility,z:cs.zIndex}},sel);
  await p.mouse.move(Math.round(el.x),Math.round(el.y));await sleep(300);
  r.el=el;r.top=await p.evaluate(([x,y])=>{const t=document.elementFromPoint(x,y);return{tid:t&&(t.getAttribute('data-testid')||t.tagName),inHeader:!!(t&&t.closest('[data-testid=arrangement-track-header]')),inClip:!!(t&&t.closest('[data-clip-id]'))}},[Math.round(el.x),Math.round(el.y)]);
  r.opAfterHover=await p.evaluate(sel=>getComputedStyle(document.querySelector(sel)).opacity,sel);
  await p.screenshot({path:`${L.OUT}/shots/pm1b-${kind}-${vp}.png`,clip:{x:0,y:Math.max(0,Math.round(hdr.top)-10),width:700,height:Math.round(hdr.height)+20}});
  const before={v:(await vInfo(p)).fi,a:(await X.clipInfo(p,'stems')).fi,u:(await st(p)).undo};
  // real drag at that spot (+40 px) to see whether the hidden handle captures it
  const x=Math.round(el.x),y=Math.round(el.y);await p.mouse.down();await p.mouse.move(x+20,y,{steps:4});await p.mouse.move(x+40,y,{steps:4});await p.mouse.up();await sleep(400);
  r.drag={before,after:{v:(await vInfo(p)).fi,a:(await X.clipInfo(p,'stems')).fi,u:(await st(p)).undo,status:(await st(p)).status}};
  if(r.drag.after.u!==before.u){await blur(p);await X.key(p,'Control+z',400);}r.restored={v:(await vInfo(p)).fi,a:(await X.clipInfo(p,'stems')).fi};
  await p.mouse.move(Math.round(hdr.right+300),Math.round(el.y));await p.mouse.wheel(-dx,0);await sleep(500);out[kind]=r;}
 rec('P-M1b',null,out);await X.finish(s,rec,'PM1B-'+vp);})().catch(e=>{console.log('ERR',e);process.exit(1)});
