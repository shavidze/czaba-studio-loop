const X=require('./lib82.cjs');const{L,sleep,st,blur,key,clipInfo,hover,dragHandle,dblHandle,pressHandle}=X;
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/r1-${vp}.json`);const T=X.T(rec);
const SH=n=>`${L.OUT}/shots/${n}-${vp}.png`;
const inside=(c,h)=>h&&h.x>=c.box.x-0.01&&h.x+h.w<=c.box.x+c.box.w+0.01&&h.y>=c.box.y&&h.y+h.h<=c.box.y+c.box.h;
async function z(p){await blur(p);await key(p,'Control+z',350);return st(p);}
async function y(p){await blur(p);await key(p,'Control+y',350);return st(p);}
(async()=>{const s=await L.open(vp);const p=s.page;const S=await X.freshSetup(p,{video:false});const PPS=X.PPS;
 rec('SETUP',S.clips.length===3,{clips:S.clips.map(c=>[c.lane,c.start,c.dur]),geo:S.geo,snap:S.snap});
 await T('FD-HANDLES',async()=>{const o={};await p.mouse.move(5,5);await sleep(300);o.idle=await clipInfo(p,'stems');
  o.hov=await hover(p,'stems');await p.screenshot({path:SH('fd-handles-hover')});const c=o.hov;
  o.sizes=[c.hin&&[c.hin.w,c.hin.h],c.hout&&[c.hout.w,c.hout.h]];o.inside=[inside(c,c.hin),inside(c,c.hout)];o.belowHeader=[c.hin.y-c.box.y,c.hout.y-c.box.y];
  o.leftEdge=c.hin.x-c.box.x;o.rightEdge=(c.box.x+c.box.w)-(c.hout.x+c.hout.w);
  o.topIn=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.getAttribute('data-testid'),[c.hin.x+5,c.hin.y+5]);o.topOut=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.getAttribute('data-testid'),[c.hout.x+5,c.hout.y+5]);
  o.sfx=await clipInfo(p,'sfx');o.music=await clipInfo(p,'music');
  await X.loadVideo(p);o.video=await clipInfo(p,'video');if(o.video)await hover(p,'video');o.videoHov=await clipInfo(p,'video');await p.screenshot({path:SH('fd-handles-video')});
  await p.click('[data-track-id=stems] [data-testid=arrangement-track-fold]');await sleep(500);o.folded=await clipInfo(p,'stems');if(o.folded)await hover(p,'stems');o.foldedHov=await clipInfo(p,'stems');await p.screenshot({path:SH('fd-handles-folded')});
  await p.click('[data-track-id=stems] [data-testid=arrangement-track-fold]');await sleep(500);o.unfolded=await clipInfo(p,'stems');
  await X.lMute(p,'video').click();await sleep(200);
  rec('FD-HANDLES',!!(o.idle.hin&&o.idle.hin.op==='0'&&o.idle.hout.op==='0'&&c.hin.op==='1'&&c.hout.op==='1'&&o.sizes.every(a=>a&&a[0]===10&&a[1]===10)&&o.inside.every(Boolean)&&o.belowHeader.every(v=>v>=20&&v<=22)&&o.topIn==='arrangement-clip-fade-in-handle'&&o.topOut==='arrangement-clip-fade-out-handle'&&c.fi==='0.000'&&c.fo==='0.000'&&o.video&&o.video.kind==='video'&&!o.videoHov.hin&&!o.videoHov.hout&&o.folded&&!o.foldedHov.hin&&!o.foldedHov.hout&&o.unfolded.hin&&o.sfx.hin),o);});
 await T('FD-UNDO',async()=>{const o={u0:(await st(p)).undo};
  o.din=await dragHandle(p,'stems','in',PPS);o.dout=await dragHandle(p,'stems','out',-2*PPS);
  o.z1=await z(p);o.z1c=await clipInfo(p,'stems');o.y1=await y(p);o.y1c=await clipInfo(p,'stems');
  o.dbl=await dblHandle(p,'stems','in');o.zd=await z(p);o.zdc=await clipInfo(p,'stems');o.yd=await y(p);o.ydc=await clipInfo(p,'stems');
  o.dbl0=await dblHandle(p,'stems','in');o.clipsAfterDbl0=(await X.allClips(p)).length;
  o.press=await pressHandle(p,'stems','out');
  o.zp=await z(p);o.zpc=await clipInfo(p,'stems');o.yp=await y(p);o.ypc=await clipInfo(p,'stems');
  // drag that returns to the start value inside one gesture
  {const c=await hover(p,'stems');const h=c.hout;const x=h.x+5,yy=h.y+5;await p.mouse.move(x,yy);await p.mouse.down();await p.mouse.move(x-40,yy,{steps:5});await p.mouse.move(x,yy,{steps:5});await p.mouse.up();await sleep(350);o.ret={s:await st(p),c:await clipInfo(p,'stems')};}
  const f=v=>[v.after?v.after.fi:v.fi,v.after?v.after.fo:v.fo];
  const c1=o.din.during==='Fade In: 1.000 წმ'&&o.din.s.status==='Fade In: 1.000 წმ.'&&o.din.s.undo==='Undo: Fade In'&&o.din.after.fi==='1.000';
  const c2=o.dout.s.status==='Fade Out: 2.000 წმ.'&&o.dout.s.undo==='Undo: Fade Out'&&o.dout.after.fo==='2.000'&&o.dout.after.fi==='1.000';
  const c3=o.z1.undo==='Undo: Fade In'&&o.z1c.fo==='0.000'&&o.z1c.fi==='1.000'&&o.y1c.fo==='2.000'&&o.y1.undo==='Undo: Fade Out';
  const c4=o.dbl.after.fi==='0.000'&&o.dbl.s.status==='Fade In: 0.000 წმ.'&&o.dbl.s.undo==='Undo: Fade In'&&o.zdc.fi==='1.000'&&o.zd.undo==='Undo: Fade Out'&&o.ydc.fi==='0.000';
  const c5=o.dbl0.after.fi==='0.000'&&o.dbl0.s.undo==='Undo: Fade In'&&o.clipsAfterDbl0===S.clips.length+1;
  const c6=o.press.after.fo==='2.000'&&o.press.s.undo==='Undo: Fade In'&&o.zpc.fi==='1.000'&&o.zpc.fo==='2.000'&&o.ypc.fi==='0.000';
  const c7=o.ret.s.status==='Fade Out: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.'&&o.ret.s.undo==='Undo: Fade In'&&o.ret.c.fo==='2.000';
  o.ok=[c1,c2,c3,c4,c5,c6,c7];rec('FD-UNDO',o.ok.every(Boolean),o);});
 // state: fi 0, fo 2
 await T('FD-LIMITS',async()=>{const o={};o.start=await clipInfo(p,'stems');
  o.far=await dragHandle(p,'stems','in',30*PPS,{steps:30});const c=o.far.after;o.inside1=[inside(c,c.hin),inside(c,c.hout)];
  o.overlapH=c.hin&&c.hout?{inR:c.hin.x+c.hin.w,outL:c.hout.x}:null;await p.screenshot({path:SH('fd-limits-max')});
  o.left=await dragHandle(p,'stems','in',-60*PPS,{steps:30});o.inside2=[inside(o.left.after,o.left.after.hin),inside(o.left.after,o.left.after.hout)];
  o.outLeft=await dragHandle(p,'stems','out',+5*PPS,{steps:10});
  // M2: fade-out 0, fade-in to right edge, then the fade-in handle must still be draggable
  await dblHandle(p,'stems','out');o.fo0=await clipInfo(p,'stems');o.inMax=await dragHandle(p,'stems','in',30*PPS,{steps:30});o.inMaxTop=await p.evaluate(([x,y])=>document.elementFromPoint(x,y)?.getAttribute('data-testid'),[o.inMax.after.hin.x+5,o.inMax.after.hin.y+5]);
  o.inBack=await dragHandle(p,'stems','in',-4*PPS,{steps:10});o.inside3=[inside(o.inMax.after,o.inMax.after.hin),inside(o.inMax.after,o.inMax.after.hout)];
  rec('FD-LIMITS',o.start.fo==='2.000'&&c.fi==='14.000'&&o.far.s.status==='Fade In: 14.000 წმ.'&&o.inside1.every(Boolean)&&o.left.after.fi==='0.000'&&o.inside2.every(Boolean)&&o.outLeft.after.fo==='0.000'&&o.fo0.fo==='0.000'&&o.inMax.after.fi==='16.000'&&o.inMaxTop==='arrangement-clip-fade-in-handle'&&o.inBack.after.fi==='12.000'&&o.inside3.every(Boolean),o);});
 // set fades to in1/out2 for neighbours
 await T('FD-NEIGHBOURS',async()=>{const o={};await dblHandle(p,'stems','in');await dragHandle(p,'stems','in',PPS);await dragHandle(p,'stems','out',-2*PPS);o.pre=await clipInfo(p,'stems');const c=o.pre;
  const by=c.box.y+c.box.h*0.75;
  // range: body drag 6 -> 8
  await p.mouse.move(X.tx(6),by);await p.mouse.down();await p.mouse.move(X.tx(7),by,{steps:4});await p.mouse.move(X.tx(8),by,{steps:4});await p.mouse.up();await sleep(400);o.range=await st(p);o.rangeClip=await clipInfo(p,'stems');
  await p.keyboard.press('Escape');await sleep(300);
  // trim strip below the fade-in handle (left edge, low on the clip)
  await p.mouse.move(c.box.x+3,by);await sleep(100);o.trimCursor=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return{t:e&&e.getAttribute('data-testid'),cur:e&&getComputedStyle(e).cursor,cls:e&&e.className.slice(0,80)}},[c.box.x+3,by]);
  await p.mouse.down();await p.mouse.move(c.box.x+3+PPS/2,by,{steps:4});await p.mouse.move(c.box.x+3+PPS,by,{steps:4});await p.mouse.up();await sleep(400);o.trim=await st(p);o.trimClip=await clipInfo(p,'stems');o.zt=await z(p);o.ztc=await clipInfo(p,'stems');
  // header move +1 s
  await p.mouse.move(c.box.x+c.box.w/2,c.box.y+8);await p.mouse.down();await p.mouse.move(c.box.x+c.box.w/2+PPS/2,c.box.y+8,{steps:4});await p.mouse.move(c.box.x+c.box.w/2+PPS,c.box.y+8,{steps:4});await p.mouse.up();await sleep(400);o.move=await st(p);o.moveClip=await clipInfo(p,'stems');o.zm=await z(p);o.zmc=await clipInfo(p,'stems');
  // click-seek in the body at 10 s
  await p.mouse.click(X.tx(10),by);await sleep(400);o.seek=await st(p);o.seekClip=await clipInfo(p,'stems');
  rec('FD-NEIGHBOURS',/06\.000/.test(o.range.range||'')&&/08\.000/.test(o.range.range||'')&&o.rangeClip.fi==='1.000'&&o.trimClip.start===3&&/^Trim — მარცხენა კიდე: start 00:03.000, length 00:15.000/.test(o.trim.status)&&o.trimClip.fi==='1.000'&&o.trimClip.fo==='2.000'&&o.ztc.start===2&&o.moveClip.start===3&&o.moveClip.fi==='1.000'&&o.moveClip.fo==='2.000'&&o.zmc.start===2&&Math.abs(X.secs(o.seek.pos)-10)<0.03,o);});
 await T('X1-STATUS',async()=>{const o={};await blur(p);const m=await clipInfo(p,'music');const st0=await clipInfo(p,'stems');const hx=X.tx(5),hy=m.box.y+8;o.m0=m.start;
  // (1) right ~1 s on own lane, then down onto occupied stems lane
  await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+PPS/2,hy,{steps:4});await p.mouse.move(hx+PPS,hy,{steps:4});await sleep(150);o.mid=await clipInfo(p,'music');
  await p.mouse.move(hx+PPS,st0.box.y+st0.box.h/2,{steps:8});await sleep(250);o.during=(await st(p)).status;await p.screenshot({path:SH('x1-during')});await p.mouse.up();await sleep(500);
  o.after=await clipInfo(p,'music');o.s1=await st(p);o.stemsN=(await clipInfo(p,'stems')).n;
  const exp=`აქ ადგილი არ არის — კლიპი ბოლო თავისუფალ ადგილას დარჩა: მუსიკა, start ${'00:0'+o.after.start.toFixed(3)}.`;o.exp=exp;
  o.z=await z(p);o.zc=await clipInfo(p,'music');
  // (2) refused hover then back to own lane
  await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx+PPS/2,hy,{steps:4});await p.mouse.move(hx+PPS,hy,{steps:4});await p.mouse.move(hx+PPS,st0.box.y+st0.box.h/2,{steps:6});await sleep(200);await p.mouse.move(hx+PPS,hy,{steps:6});await sleep(200);await p.mouse.up();await sleep(500);
  o.s2=await st(p);o.c2=await clipInfo(p,'music');await z(p);
  // (3) first move lands directly in the refused lane
  await p.mouse.move(hx,hy);await p.mouse.down();await p.mouse.move(hx,st0.box.y+st0.box.h/2,{steps:6});await sleep(200);await p.mouse.up();await sleep(500);o.s3=await st(p);o.c3=await clipInfo(p,'music');
  // (4) free lane: sfx clip 4-6 to stems lane at 20 s
  const sf=await clipInfo(p,'sfx');await p.mouse.move(sf.box.x+sf.box.w/2,sf.box.y+8);await p.mouse.down();await p.mouse.move(sf.box.x+sf.box.w/2+10,sf.box.y+8,{steps:3});await p.mouse.move(X.tx(21),st0.box.y+st0.box.h/2,{steps:12});await sleep(250);await p.mouse.up();await sleep(500);o.s4=await st(p);o.stemsAfter4=await X.allClips(p);await z(p);
  rec('X1-DURING',/ადგილი არ არის/.test(o.during),{during:o.during});
  rec('X1-STATUS',o.after.start!==o.m0&&Math.abs(o.after.start-(o.m0+1))<0.03&&o.s1.status===exp&&o.s1.undo==='Undo: კლიპის გადატანა'&&o.zc.start===o.m0&&/^კლიპის გადატანა: start/.test(o.s2.status)&&!/ადგილი არ არის/.test(o.s2.status)&&o.s3.status==='კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.'&&o.c3.start===o.m0&&/^გადატანა ხაზზე — /.test(o.s4.status),o);});
 await X.finish(s,rec,'R1-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
