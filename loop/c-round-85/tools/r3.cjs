const X=require('./lib84.cjs');const{L,sleep,st,blur,key,envInfo,setMode,dblAt,dragPointToGain,dragPoint,undo,redo,vInfo,vDrag}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r3-${vp}.json`);const T=X.T(rec);const SH=n=>`${L.OUT}/shots/${n}-${vp}.png`;
const ADD='Undo: Envelope: წერტილის დამატება',MOV='Undo: Envelope: წერტილის გადატანა',DEL='Undo: Envelope: წერტილის წაშლა';
const geom=(p,lane='stems')=>p.evaluate(lane=>{const e=[...document.querySelectorAll(`[data-track-id="${lane}"] [data-clip-id]`)][0];const r=e.getBoundingClientRect();const rl=document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left;const z=+/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];
 const ln=e.querySelector('[data-testid=arrangement-clip-envelope-line]');const lr=ln&&ln.getBoundingClientRect();const vbW=ln?+ln.getAttribute('viewBox').split(' ')[2]:null;const verts=ln?ln.querySelector('polyline').getAttribute('points').split(' ').map(s=>+s.split(',')[0]):[];
 const pts=[...e.querySelectorAll('[data-testid=arrangement-clip-envelope-point]')].map(q=>{const b=q.getBoundingClientRect();return{t:+q.dataset.time,cx:b.left+b.width/2}});
 return{rl,z,root:{l:r.left,r:r.right},start:+e.dataset.clipStart,env:e.getAttribute('data-envelope'),line:lr?{l:lr.left,r:lr.right,w:lr.width}:null,vbW,verts,pts}},lane);
function align(g,ts){const o={};const P=X.parseEnv(g.env);o.stored=P.map(q=>q.t);o.dT=P.map((q,i)=>+(q.t-ts[i]).toFixed(4));o.tolT=+(0.5/g.z).toFixed(4);
 o.pt=g.pts.map(q=>+(q.cx-(g.rl+q.t*g.z)).toFixed(3));const sc=g.line.w/g.vbW;
 // vertices for points: polyline may include clip-edge vertices; map each point to the vertex nearest in x
 const vx=g.verts.map(v=>g.line.l+v*sc);o.vt=g.pts.map(q=>{let best=1e9;for(const v of vx)if(Math.abs(v-q.cx)<Math.abs(best))best=v-q.cx;return +best.toFixed(3)});
 o.rightEnd=+(Math.max(...vx)-g.root.r).toFixed(3);o.svgRight=+(g.line.r-g.root.r).toFixed(3);o.scale=+sc.toFixed(5);
 o.ok=P.length===ts.length&&o.dT.every(d=>Math.abs(d)<=o.tolT+1e-9)&&o.pt.every(d=>Math.abs(d)<=0.5)&&o.vt.every(d=>Math.abs(d)<=0.5)&&Math.abs(o.rightEnd)<=1;return o;}
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);const S=await X.freshSetup(p,{video:false});rec('SETUP',S.clips.length===3,{geo:S.geo});
 await T('X1-ALIGN-40',async()=>{await setMode(p,true);const u0=(await st(p)).undo;const ts=[6,10,14];const adds=[];for(const t of ts){const a=await dblAt(p,'stems',t);adds.push({x:a.x,status:a.s.status,undo:a.s.undo});}
  const g=await geom(p);const a=align(g,ts.map((t,i)=>(adds[i].x-g.rl)/g.z));await p.mouse.move(5,5);await sleep(200);await p.screenshot({path:SH('x1-40'),clip:{x:g.root.l-10,y:200,width:Math.min(800,g.root.r-g.root.l+20),height:400}});
  rec('X1-ALIGN-40',a.ok&&g.env.startsWith('6.000:')&&g.env.includes(';10.000:')&&g.env.includes(';14.000:'),{env:g.env,z:g.z,...a,adds});
  // short EN-ADD
  const z3=await undo(p,3);const e0=(await envInfo(p,'stems')).env;const y3=await redo(p,3);const e3=(await envInfo(p,'stems')).env;
  rec('EN-ADD-short',adds.every((x,i)=>x.undo===ADD&&x.status===`Envelope: წერტილი დაემატა — ${[6,10,14][i].toFixed(3)} წმ · 0.0 dB.`)&&e0===''&&z3.undo===u0&&e3===g.env,{u0,z3:z3.undo,e0,e3,statuses:adds.map(a=>a.status)});});
 await T('EN-DRAG-short',async()=>{const d=await dragPointToGain(p,'stems',1,0.2512);const g=d.after.points[1].g;const db=20*Math.log10(g);const t1=d.after.points[1].dt;
  const okS=d.s.status===`Envelope: ${t1} წმ · ${X.dbStr(g)}.`&&d.s.undo===MOV&&Math.abs(db+12)<=0.3&&t1==='10.000';const g2=await geom(p);const a=align(g2,[6,10,14]);
  rec('EN-DRAG-short',okS&&a.vt.every(v=>Math.abs(v)<=0.5),{status:d.s.status,undo:d.s.undo,db:+db.toFixed(2),t1,vt:a.vt,pt:a.pt});});
 await T('EN-UNDO-short',async()=>{const V=(await envInfo(p,'stems')).env;await sleep(700);const c=await envInfo(p,'stems');const q=c.points[0];await p.mouse.move(Math.round(q.cx),Math.round(q.cy));await sleep(100);await p.mouse.dblclick(Math.round(q.cx),Math.round(q.cy));await sleep(400);
  const del=(await envInfo(p,'stems')).env;const s1=await st(p);const z=await undo(p);const ze=(await envInfo(p,'stems')).env;const y=await redo(p);const ye=(await envInfo(p,'stems')).env;await undo(p);const back=(await envInfo(p,'stems')).env;
  rec('EN-UNDO-short',del===V.split(';').slice(1).join(';')&&s1.undo===DEL&&ze===V&&ye===del&&back===V,{V,del,undo:s1.undo,status:s1.status,ze,ye});});
 await T('X1-ALIGN-zoom2',async()=>{await undo(p,4);const e=(await envInfo(p,'stems')).env;await blur(p);await key(p,'-',500);await X.geo(p);const g0=await geom(p);
  const ts=[5,9.5,13];const adds=[];for(const t of ts){const a=await dblAt(p,'stems',t);adds.push({x:a.x,status:a.s.status});}const g=await geom(p);const T0=ts.map((t,i)=>(adds[i].x-g.rl)/g.z);const a=align(g,T0);
  await p.mouse.move(5,5);await sleep(200);await p.screenshot({path:SH('x1-zoom2'),clip:{x:Math.max(0,g.root.l-10),y:200,width:Math.min(900,g.root.r-g.root.l+20),height:400}});
  rec('X1-ALIGN-zoom2',a.ok&&e===''&&Math.abs(g.z-40)>1,{cleared:e,z:g.z,rl:g.rl,T0:T0.map(t=>+t.toFixed(4)),env:g.env,...a});
  await undo(p,3);await blur(p);await key(p,'=',500);await key(p,'+',300);await X.geo(p);});
 // P-M1 probe
 await T('P-M1',async()=>{const o={};await X.loadVideo(p);await X.geo(p);o.z=X.PPS;
  // put video at 2s with fade-in
  const mv=await X.moveV(p,Math.round(2*X.PPS));await X.setMode(p,false);const fd=await vDrag(p,'in',Math.round(X.PPS));o.v=[mv.after.start,fd.after.fi];
  await setMode(p,true);await dblAt(p,'stems',3);o.env=(await envInfo(p,'stems')).env;
  const sc=await p.evaluate(()=>{let e=document.querySelector('[data-testid=arrangement-ruler]');while(e&&!(e.scrollWidth>e.clientWidth&&/(auto|scroll)/.test(getComputedStyle(e).overflowX)))e=e.parentElement;return e?{tid:e.dataset.testid||e.className.slice(0,40),sl:e.scrollLeft,sw:e.scrollWidth,cw:e.clientWidth}:null});o.scroller=sc;
  const probe=async(kind)=>{const r={kind};const tgt=await p.evaluate(kind=>{const lane=kind==='point'?'stems':'video';const sel=kind==='point'?'[data-testid=arrangement-clip-envelope-point]':'[data-testid=arrangement-video-fade-in-handle]';const el=document.querySelector(`[data-track-id=${lane}] ${sel}`);const m=document.querySelector(`[data-track-id=${lane}] button[title=Mute]`);const b=el&&el.getBoundingClientRect(),mb=m.getBoundingClientRect();return{el:b&&{x:b.left+b.width/2,y:b.top+b.height/2},m:{x:mb.left+mb.width/2,y:mb.top+mb.height/2,l:mb.left,r:mb.right,t:mb.top,b:mb.bottom},hdrR:document.querySelector(`[data-track-id=${lane}] [data-testid=arrangement-track-header]`).getBoundingClientRect().right}},kind);
   r.before=tgt;if(!tgt.el){r.err='target not rendered (Env mode hides video handles)';return r;}
   const dx=Math.round(tgt.el.x-tgt.m.x);// scroll right by dx so target moves left onto the mute button x
   await p.mouse.move(Math.round(tgt.hdrR+200),Math.round(tgt.m.y));await p.mouse.wheel(dx,0);await sleep(500);
   let t2=await p.evaluate(kind=>{const lane=kind==='point'?'stems':'video';const sel=kind==='point'?'[data-testid=arrangement-clip-envelope-point]':'[data-testid=arrangement-video-fade-in-handle]';const el=document.querySelector(`[data-track-id=${lane}] ${sel}`);const m=document.querySelector(`[data-track-id=${lane}] button[title=Mute]`);const b=el.getBoundingClientRect(),mb=m.getBoundingClientRect();const top=(x,y)=>{const t=document.elementFromPoint(x,y);return t?(t.getAttribute('data-testid')||t.getAttribute('title')||t.tagName)+'|'+(t.closest('[data-testid=arrangement-track-header]')?'HEADER':t.closest('[data-clip-id]')?'CLIP':'other'):null};
    return{el:{x:b.left+b.width/2,y:b.top+b.height/2,l:b.left,r:b.right},m:{x:mb.left+mb.width/2,y:mb.top+mb.height/2},topAtEl:top(b.left+b.width/2,b.top+b.height/2),topAtMute:top(mb.left+mb.width/2,mb.top+mb.height/2),pressed:m.getAttribute('aria-pressed')}},kind);
   r.after=t2;const env0=(await envInfo(p,'stems')).env;const v0=await vInfo(p);const u0=(await st(p)).undo;
   await p.mouse.click(Math.round(t2.m.x),Math.round(t2.m.y));await sleep(400);
   r.click={pressed:await p.evaluate(kind=>document.querySelector(`[data-track-id=${kind==='point'?'stems':'video'}] button[title=Mute]`).getAttribute('aria-pressed'),kind),undo:(await st(p)).undo,u0,envSame:(await envInfo(p,'stems')).env===env0,fiSame:(await vInfo(p)).fi===v0.fi};
   // also click exactly on element centre if it overlaps header
   r.elUnderHeader=t2.el.x<=tgt.hdrR;
   await p.mouse.click(Math.round(t2.m.x),Math.round(t2.m.y));await sleep(300);await p.mouse.move(Math.round(tgt.hdrR+200),Math.round(t2.m.y));await p.mouse.wheel(-dx,0);await sleep(400);return r;};
  o.p1=await probe('point');await p.screenshot({path:SH('pm1-point')});await setMode(p,false);await X.hoverV(p);o.p2=await probe('handle');await p.screenshot({path:SH('pm1-handle')});
  const hit=r=>r.after&&r.after.topAtMute&&/HEADER/.test(r.after.topAtMute)&&r.click.pressed!==r.after.pressed&&r.click.envSame&&r.click.fiSame;
  rec('P-M1',null,{repro:!(hit(o.p1)&&hit(o.p2)),...o});});
 await X.finish(s,rec,'R3-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
