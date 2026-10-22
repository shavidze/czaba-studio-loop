const X=require('./lib83.cjs');const{L,sleep,st,blur,key,envInfo,mode,setMode,dblAt,dragPoint,dragPointToGain,undo,redo,clipInfo,hover,dragHandle}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r1-${vp}.json`);const T=X.T(rec);
const SH=n=>`${L.OUT}/shots/${n}-${vp}.png`;
const ADD='Undo: Envelope: წერტილის დამატება',MOV='Undo: Envelope: წერტილის გადატანა',DEL='Undo: Envelope: წერტილის წაშლა';
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await sleep(300);
 await p.addInitScript(()=>{window.__dbl=[];document.addEventListener('dblclick',e=>window.__dbl.push({t:performance.now(),tid:e.target&&e.target.getAttribute&&e.target.getAttribute('data-testid')}),true);});
 const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 rec('SETUP',S.clips.length===3&&S.snap==='off',{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),geo:S.geo,snap:S.snap});
 await T('EN-MODE',async()=>{const o={};o.m0=await mode(p);
  await p.click('[data-testid=arrangement-envelope-toggle]');await sleep(250);o.m1=await mode(p);o.s1=(await st(p)).status;await blur(p);
  await key(p,'a',250);o.m2=await mode(p);o.s2=(await st(p)).status;await key(p,'a',250);o.m3=await mode(p);o.s3=(await st(p)).status;
  await p.click('[data-testid=arrangement-envelope-toggle]');await sleep(250);o.m4=await mode(p);o.s4=(await st(p)).status;await blur(p);
  // modifiers / repeat do nothing (mode stays off)
  for(const k of ['Shift+a','Alt+a']){await key(p,k,250);}o.mMods=(await mode(p)).mode;o.sMods=(await st(p)).status;
  await p.evaluate(()=>{document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'a',code:'KeyA',repeat:true,bubbles:true,cancelable:true}));});await sleep(200);o.mRepeat=(await mode(p)).mode;
  const inp=p.locator('input[type=text]:visible, input[type=search]:visible, input:not([type]):visible').first();o.inputFound=await inp.count();
  if(o.inputFound){await inp.click();await p.keyboard.type('a');await sleep(200);o.mInput=(await mode(p)).mode;o.inputVal=await inp.inputValue();await inp.fill('');await blur(p);}
  // mode on: editors and handles
  await setMode(p,true);const audio=[];for(const l of ['music','stems','sfx']){await hover(p,l);const c=await envInfo(p,l);audio.push({l,editor:!!c.editor,hin:c.hin,hout:c.hout,line:!!c.line,w:c.box.w});}o.audio=audio;
  await hover(p,'stems');await p.screenshot({path:SH('en-mode-on')});
  // grid row overflow for every division
  const opts=await p.$$eval('[data-testid=arrangement-grid-division] option',os=>os.map(o=>o.value));const fit=[];const sel0=await p.locator('[data-testid=arrangement-grid-division]').inputValue();
  for(const v of opts){await p.selectOption('[data-testid=arrangement-grid-division]',v);await sleep(120);const m=await mode(p);fit.push([v,m.sw,m.cw]);}
  await p.selectOption('[data-testid=arrangement-grid-division]',sel0);await sleep(150);await blur(p);o.fit=fit;o.fitOk=fit.every(f=>f[1]<=f[2]);o.nOpts=opts.length;
  o.envBtnGap=await p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]').getBoundingClientRect();const b=document.querySelector('[data-testid=arrangement-envelope-toggle]').getBoundingClientRect();return{right:g.right-b.right,w:b.width}});
  // video + folded lane
  await X.loadVideo(p);await hover(p,'video');o.video=await envInfo(p,'video');await p.screenshot({path:SH('en-mode-video')});
  await p.click('[data-track-id=stems] [data-testid=arrangement-track-fold]');await sleep(500);o.folded=await envInfo(p,'stems');await p.screenshot({path:SH('en-mode-folded')});
  await p.click('[data-track-id=stems] [data-testid=arrangement-track-fold]');await sleep(500);o.unfolded=await envInfo(p,'stems');
  await X.lMute(p,'video').click();await sleep(200);await blur(p);
  const okM=(m,on)=>m.mode===(on?'on':'off')&&m.pressed===String(on)&&m.keys==='A'&&m.text==='Env'&&m.title===(on?'Envelope ჩართულია — კლიპზე double-click = წერტილი (A)':'Envelope გამორთულია — კლიპის volume envelope-ის რედაქტირება (A)')&&m.sw<=m.cw;
  const ON='Envelope რეჟიმი: ჩართულია.',OFF='Envelope რეჟიმი: გამორთულია.';
  o.checks={m0:okM(o.m0,false),m1:okM(o.m1,true)&&o.s1===ON,m2:okM(o.m2,false)&&o.s2===OFF,m3:okM(o.m3,true)&&o.s3===ON,m4:okM(o.m4,false)&&o.s4===OFF,mods:o.mMods==='off',repeat:o.mRepeat==='off',input:!o.inputFound||o.mInput==='off',
   audio:o.audio.every(a=>a.editor&&!a.hin&&!a.hout&&a.line),fit:o.fitOk,video:o.video&&o.video.kind==='video'&&!o.video.editor&&!o.video.line,folded:o.folded&&!o.folded.editor&&o.folded.points.length===0,unfolded:!!(o.unfolded&&o.unfolded.editor)};
  rec('EN-MODE',Object.values(o.checks).every(Boolean),o);});
 // state: mode on, video loaded+muted
 await T('EN-ADD',async()=>{const o={u0:(await st(p)).undo};await setMode(p,true);o.pre=await st(p);const adds=[];
  for(const t of [6,10,14]){const a=await dblAt(p,'stems',t);adds.push({t,env:a.c.env,status:a.s.status,undo:a.s.undo,pos:a.s.pos,range:a.s.range});}
  o.adds=adds;const c=await envInfo(p,'stems');o.env=c.env;o.pts=c.points.map(q=>[q.dt,q.dg]);o.dbl=await p.evaluate(()=>window.__dbl.length);
  const pts=X.parseEnv(c.env);o.tolT=pts.map((q,i)=>+(q.t-[6,10,14][i]).toFixed(3));
  o.statusOk=adds.every((a,i)=>a.status===`Envelope: წერტილი დაემატა — ${pts[i].t.toFixed(3)} წმ · 0.0 dB.`&&a.undo===ADD);
  // 3 entries: undo x3 empties, 4th title is the pre-add one
  o.z3=await undo(p,3);o.zEnv=(await envInfo(p,'stems')).env;o.y3=await redo(p,3);o.yEnv=(await envInfo(p,'stems')).env;
  rec('EN-ADD',pts.length===3&&pts.every(q=>q.g===1)&&o.tolT.every(d=>Math.abs(d)<=0.05)&&o.statusOk&&adds.every(a=>a.pos===o.pre.pos&&!a.range)&&o.zEnv===''&&o.z3.undo===o.u0&&o.yEnv===o.env&&c.points.length===3,o);
  rec('EN-ADD-OFFSET',null,{note:'ruler x=tx(t) vs stored time',dt:o.tolT});});
 await T('EN-DRAG',async()=>{const o={};const c0=await envInfo(p,'stems');const H=c0.body.h;o.H=H;
  o.d=await dragPointToGain(p,'stems',1,0.2512);const g=o.d.after.points[1].g;o.g=g;o.db=20*Math.log10(g);const t1=o.d.after.points[1].dt;
  o.c1=o.d.during===`Envelope: ${t1} წმ · ${X.dbStr(g)}`&&o.d.s.status===`Envelope: ${t1} წმ · ${X.dbStr(g)}.`&&o.d.s.undo===MOV&&Math.abs(o.db+12)<=0.3&&o.d.after.points[1].title===`Envelope: ${t1} წმ · ${X.dbStr(g)} — drag · double-click = წაშლა`;
  o.V=o.d.after.env;const P=X.parseEnv(o.V);
  // past right neighbour
  o.r=await dragPoint(p,'stems',1,8*PPS,0,{steps:20});o.rT=o.r.after.points[1].t;o.rUndo=o.r.s.undo;o.zr=await undo(p);o.zrEnv=(await envInfo(p,'stems')).env;
  o.l=await dragPoint(p,'stems',1,-8*PPS,0,{steps:20});o.lT=o.l.after.points[1].t;o.zl=await undo(p);o.zlEnv=(await envInfo(p,'stems')).env;
  o.top=await dragPoint(p,'stems',1,0,-2*H,{steps:16});o.topG=o.top.after.points[1].dg;o.topS=o.top.s.status;await undo(p);
  o.bot=await dragPoint(p,'stems',1,0,2*H,{steps:16});o.botG=o.bot.after.points[1].dg;o.botS=o.bot.s.status;o.botTitle=o.bot.after.points[1].title;await p.screenshot({path:SH('en-drag-bottom')});o.zb=await undo(p);o.zbEnv=(await envInfo(p,'stems')).env;
  // drag that returns to start in one gesture
  {const c=await envInfo(p,'stems');const q=c.points[1];await p.mouse.move(q.cx,q.cy);await p.mouse.down();await p.mouse.move(q.cx,q.cy+15,{steps:5});await p.mouse.move(q.cx,q.cy,{steps:5});await p.mouse.up();await sleep(350);o.ret={s:await st(p),env:(await envInfo(p,'stems')).env};}
  o.c2=Math.abs(o.rT-(P[2].t-0.001))<1e-9&&o.rUndo===MOV&&o.zrEnv===o.V&&Math.abs(o.lT-(P[0].t+0.001))<1e-9&&o.zlEnv===o.V&&o.topG==='1.0000'&&o.botG==='0.0000'&&/−∞ dB\.$/.test(o.botS)&&/−∞ dB — drag/.test(o.botTitle)&&o.zbEnv===o.V;
  o.c3=o.ret.s.status==='Envelope: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.'&&o.ret.env===o.V&&o.ret.s.undo===MOV;
  rec('EN-DRAG',o.c1&&o.c2&&o.c3,o);});
 await T('EN-DRAWN',async()=>{const o={};const c=await envInfo(p,'stems');o.line=c.line;o.body=c.body;const q=c.points[1];o.q=q;
  const vbW=+c.line.vb.split(' ')[2];const lp=c.line.pts.split(' ').map(s=>s.split(',').map(Number));o.lp=lp;
  // screen y of the middle vertex and of the point centre
  const mid=lp[2];o.vertexY=c.line.r.y+mid[1]*c.line.r.h;o.vertexX=c.line.r.x+mid[0]*c.line.r.w/vbW;o.expY=c.body.y+(1-q.g)*c.body.h;
  o.dy=[o.vertexY-o.expY,q.cy-o.expY];o.dx=o.vertexX-q.cx;
  await p.mouse.move(5,5);await sleep(200);await p.screenshot({path:SH('en-drawn-on'),clip:{x:c.box.x-20,y:c.box.y-30,width:c.box.w+40,height:c.box.h+60}});
  await setMode(p,false);const off=await envInfo(p,'stems');o.off={line:!!off.line,pts:off.line&&off.line.pts,points:off.points.length,editor:!!off.editor,env:off.env};
  await p.screenshot({path:SH('en-drawn-off'),clip:{x:c.box.x-20,y:c.box.y-30,width:c.box.w+40,height:c.box.h+60}});await setMode(p,true);
  rec('EN-DRAWN',Math.abs(o.dy[0])<=2&&Math.abs(o.dy[1])<=2&&Math.abs(mid[1]-(1-q.g))<1e-6&&o.off.line&&o.off.points===0&&!o.off.editor&&o.off.pts===c.line.pts,o);});
 await T('EN-UNDO',async()=>{const o={};const V=(await envInfo(p,'stems')).env;o.V=V;o.u0=(await st(p)).undo;
  // still press on a point: nothing
  {const c=await envInfo(p,'stems');const q=c.points[2];await p.mouse.move(q.cx,q.cy);await p.mouse.down();await sleep(150);await p.mouse.up();await sleep(400);o.press={env:(await envInfo(p,'stems')).env,undo:(await st(p)).undo};}
  await sleep(700);
  // double-click delete of point 0
  {const c=await envInfo(p,'stems');const q=c.points[0];await p.mouse.move(q.cx,q.cy);await sleep(100);await p.mouse.dblclick(q.cx,q.cy);await sleep(400);o.del={env:(await envInfo(p,'stems')).env,s:await st(p),n:(await envInfo(p,'stems')).points.length};}
  o.z1=await undo(p);o.z1Env=(await envInfo(p,'stems')).env;o.y1=await redo(p);o.y1Env=(await envInfo(p,'stems')).env;await undo(p);
  // chain: undo 4 -> '', each step exact
  const chain=[];for(let i=0;i<4;i++){const s2=await undo(p);chain.push([(await envInfo(p,'stems')).env,s2.undo]);}o.chain=chain;
  const rchain=[];for(let i=0;i<4;i++){await redo(p);rchain.push((await envInfo(p,'stems')).env);}o.rchain=rchain;
  // drag then immediate double-click on same point is ignored (guard), later dblclick deletes
  {await p.evaluate(()=>{window.__dbl=[]});const d=await dragPoint(p,'stems',2,0,6,{steps:6});const q=d.after.points[2];await p.mouse.dblclick(q.cx,q.cy);await sleep(300);o.guard={dbl:await p.evaluate(()=>window.__dbl),env:(await envInfo(p,'stems')).env,afterDrag:d.after.env,undo:(await st(p)).undo};await undo(p);o.guardBack=(await envInfo(p,'stems')).env;}
  const P=X.parseEnv(V);const expDel=V.split(';').slice(1).join(';');
  rec('EN-UNDO',o.press.env===V&&o.press.undo===o.u0&&o.del.env===expDel&&o.del.n===2&&o.del.s.undo===DEL&&o.del.s.status===`Envelope: წერტილი წაიშალა — ${P[0].t.toFixed(3)} წმ.`&&o.z1Env===V&&o.y1Env===expDel&&chain[3][0]===''&&chain[0][0]===V.split(';').map((x,i)=>i===1?x.split(':')[0]+':1.0000':x).join(';')&&rchain[3]===V&&o.guard.env===o.guard.afterDrag&&o.guardBack===V,o);});
 await T('EN-NEIGHBOURS-ON',async()=>{const o={};const c=await envInfo(p,'stems');const pos0=(await st(p)).pos;
  await p.mouse.click(X.tx(12),X.bodyY(c,0.8));await sleep(400);o.click=await st(p);o.clickSeek=o.click.pos!==pos0;
  await p.mouse.move(X.tx(11),X.bodyY(c,0.8));await p.mouse.down();await p.mouse.move(X.tx(12),X.bodyY(c,0.8),{steps:6});await p.mouse.move(X.tx(13),X.bodyY(c,0.8),{steps:6});await p.mouse.up();await sleep(400);o.rangeTry=await st(p);
  o.topAtEdgeL=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.className.slice(0,60),[c.box.x+3,X.bodyY(c,0.8)]);
  // header move +1s
  const hx=c.box.x+c.box.w/2,hy=c.box.y+8;await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+PPS/2,hy,{steps:4});await p.mouse.move(hx+PPS,hy,{steps:4});await p.mouse.up();await sleep(400);o.move=await st(p);o.moveC=await envInfo(p,'stems');await undo(p);o.moveBack=await envInfo(p,'stems');
  // trim strip +1 s
  const y=X.bodyY(c,0.8);await p.mouse.move(c.box.x+3,y);await p.mouse.down();await p.mouse.move(c.box.x+3+PPS/2,y,{steps:4});await p.mouse.move(c.box.x+3+PPS,y,{steps:4});await p.mouse.up();await sleep(400);o.trim=await st(p);o.trimC=await envInfo(p,'stems');await undo(p);o.trimBack=await envInfo(p,'stems');
  const sh=(e,d)=>X.parseEnv(e).map(q=>(q.t+d).toFixed(3)+':'+q.g.toFixed(4)).join(';');
  rec('EN-NEIGHBOURS-ON',!o.clickSeek&&!o.rangeTry.range&&o.rangeTry.pos===pos0&&/^კლიპის გადატანა: start 00:03.000/.test(o.move.status)&&o.moveC.start===3&&o.moveC.env===sh(c.env,1)&&o.moveBack.env===c.env&&o.moveBack.start===2&&/^Trim — მარცხენა კიდე: start 00:03.000/.test(o.trim.status)&&o.trimC.start===3&&o.trimC.env===c.env&&o.trimBack.start===2,o);});
 await T('EN-NEIGHBOURS-OFF',async()=>{const o={};await setMode(p,false);const c=await envInfo(p,'stems');o.env=c.env;const by=X.bodyY(c,0.75);
  await p.mouse.move(X.tx(6),by);await p.mouse.down();await p.mouse.move(X.tx(7),by,{steps:4});await p.mouse.move(X.tx(8),by,{steps:4});await p.mouse.up();await sleep(400);o.range=await st(p);await p.keyboard.press('Escape');await sleep(300);o.cAfterRange=(await envInfo(p,'stems')).box;
  {const c2=await envInfo(p,'stems');await p.mouse.click(X.tx(10),X.bodyY(c2,0.75));await sleep(400);o.seek=await st(p);}
  const c3=await envInfo(p,'stems');const y=X.bodyY(c3,0.75);await p.mouse.move(c.box.x+3,y);await p.mouse.down();await p.mouse.move(c.box.x+3+PPS/2,y,{steps:4});await p.mouse.move(c.box.x+3+PPS,y,{steps:4});await p.mouse.up();await sleep(400);o.trim=await st(p);o.trimC=await envInfo(p,'stems');await undo(p);
  const hx=c.box.x+c.box.w/2,hy=c.box.y+8;await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+PPS/2,hy,{steps:4});await p.mouse.move(hx+PPS,hy,{steps:4});await p.mouse.up();await sleep(400);o.move=await st(p);o.moveC=await envInfo(p,'stems');await undo(p);
  o.fd=await dragHandle(p,'stems','in',PPS);o.fdUndo=o.fd.s.undo;await undo(p);o.fdBack=(await clipInfo(p,'stems')).fi;o.final=await envInfo(p,'stems');
  rec('EN-NEIGHBOURS-OFF',/06\.000/.test(o.range.range||'')&&/08\.000/.test(o.range.range||'')&&Math.abs(X.secs(o.seek.pos)-10)<0.03&&/^Trim — მარცხენა კიდე: start 00:03.000/.test(o.trim.status)&&o.trimC.env===c.env&&/^კლიპის გადატანა: start 00:03.000/.test(o.move.status)&&o.fd.after.fi==='1.000'&&o.fdUndo==='Undo: Fade In'&&o.fdBack==='0.000'&&o.final.env===c.env&&o.final.start===2&&!!o.final.line&&o.final.points.length===0,o);});
 await T('X1-DBLCLICK',async()=>{const o={};await setMode(p,false);await p.evaluate(()=>{window.__dbl=[]});
  // exp1: drag +5 px then a single click within 300 ms
  o.d1=await dragHandle(p,'stems','in',5,{steps:4});const h1=o.d1.after;const t0=Date.now();const hc=await clipInfo(p,'stems');const hx=hc.hin.x+hc.hin.w/2,hy=hc.hin.y+hc.hin.h/2;
  await p.mouse.click(hx,hy);o.e1ms=Date.now()-t0;await sleep(300);o.e1={fi:(await clipInfo(p,'stems')).fi,dbl:await p.evaluate(()=>window.__dbl.length),undo:(await st(p)).undo};
  o.z1=(await undo(p)).undo;o.z1fi=(await clipInfo(p,'stems')).fi;await redo(p);
  // exp2: drag +5 px then a synthesized clickCount=2 within 300 ms -> dblclick reaches the handle
  await sleep(700);await p.evaluate(()=>{window.__dbl=[]});o.d2=await dragHandle(p,'stems','in',5,{steps:4});const t1=Date.now();const hc2=await clipInfo(p,'stems');const x2=hc2.hin.x+hc2.hin.w/2,y2=hc2.hin.y+hc2.hin.h/2;
  await p.mouse.move(x2,y2);await p.mouse.down({clickCount:1});await p.mouse.up({clickCount:1});await p.mouse.down({clickCount:2});await p.mouse.up({clickCount:2});o.e2ms=Date.now()-t1;await sleep(300);
  o.e2={fi:(await clipInfo(p,'stems')).fi,dbl:await p.evaluate(()=>window.__dbl),undo:(await st(p)).undo,status:(await st(p)).status};
  o.z2=(await undo(p)).undo;o.z2fi=(await clipInfo(p,'stems')).fi;await redo(p);
  // after 1 s a real double-click resets
  await sleep(1000);o.r=await X.dblHandle(p,'stems','in');o.rFi=o.r.after.fi;o.rS=o.r.s;o.zr=(await clipInfo(p,'stems')).fi;await undo(p);o.zrFi=(await clipInfo(p,'stems')).fi;
  rec('X1-DBLCLICK',o.d1.after.fi==='0.125'&&o.e1.fi==='0.125'&&o.z1fi==='0.000'&&o.d2.after.fi==='0.250'&&o.e2.dbl.length>=1&&o.e2.fi==='0.250'&&o.z2fi==='0.125'&&o.rFi==='0.000'&&o.rS.status==='Fade In: 0.000 წმ.'&&o.zrFi==='0.250'&&o.e1ms<300&&o.e2ms<300,o);});
 await T('STICKY-PROBE',async()=>{const o={};await setMode(p,true);const sc=await p.evaluate(()=>{const e=document.querySelector('[data-track-id=stems]');let s=e;while(s&&!(s.scrollWidth>s.clientWidth&&/(auto|scroll)/.test(getComputedStyle(s).overflowX)))s=s.parentElement;if(!s)return null;s.scrollLeft=330;return{sl:s.scrollLeft}});o.sc=sc;await sleep(400);
  const c=await envInfo(p,'stems');const hdr=await p.evaluate(()=>{const h=document.querySelector('[data-track-id=stems] [data-testid=arrangement-track-header]').getBoundingClientRect();return{x:h.left,r:h.right,y:h.top,b:h.bottom}});o.hdr=hdr;
  o.hidden=c.points.filter(q=>q.cx<hdr.r).map(q=>({q:[q.cx,q.cy],top:null}));for(const h of o.hidden){h.top=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.getAttribute('data-testid')||document.elementFromPoint(x,y)?.className.slice(0,40),h.q);}
  await p.screenshot({path:SH('sticky-probe')});await p.evaluate(()=>{const e=document.querySelector('[data-track-id=stems]');let s=e;while(s&&!(s.scrollWidth>s.clientWidth&&/(auto|scroll)/.test(getComputedStyle(s).overflowX)))s=s.parentElement;if(s)s.scrollLeft=0;});
  rec('STICKY-PROBE',null,o);});
 await T('EN-MODE-GRIDFIT',async()=>{const o={};await setMode(p,true);const inp=p.locator('[data-testid=arrangement-tempo-input]');await inp.fill('120');await inp.press('Enter');await sleep(300);await blur(p);const sel=p.locator('[data-testid=arrangement-grid-division]');
  const rows={};const meas=async v=>{await sel.selectOption(v);await sleep(120);const m=await mode(p);rows[v]=[m.sw,m.cw];};
  for(const v of await sel.locator('option').evaluateAll(os=>os.map(o=>o.value)))await meas(v);
  await sel.focus();await p.keyboard.press('3');await sleep(250);for(const v of (await sel.locator('option').evaluateAll(os=>os.map(o=>o.value))).filter(v=>!(v in rows)))await meas(v);
  await blur(p);o.rows=rows;o.n=Object.keys(rows).length;o.m=await mode(p);await p.screenshot({path:SH('en-gridfit'),clip:{x:0,y:100,width:760,height:200}});
  rec('EN-MODE-GRIDFIT',o.n>=12&&Object.values(rows).every(r=>r[0]<=r[1])&&o.m.mode==='on',o);});
 await X.finish(s,rec,'R1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
