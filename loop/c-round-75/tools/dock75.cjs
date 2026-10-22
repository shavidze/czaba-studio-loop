const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const tag=vp;const sleep=L.sleep;
const MEDIA='/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-h264-aac.mp4';
const out={vp};const save=()=>fs.writeFileSync(`${L.OUT}/dock75-${tag}.json`,JSON.stringify(out,null,1));
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('data-marker-time')));
const act=p=>p.evaluate(()=>{const a=document.activeElement;if(!a)return null;return (a.getAttribute('data-testid')||a.getAttribute('data-marker-menu-action')||a.tagName)+(a.getAttribute('data-marker-time')?'@'+a.getAttribute('data-marker-time'):'')});
const rect=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,r:r.right,b:r.bottom}},sel);
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur());
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);
 try{
 const inp=p.locator('[data-testid=arrangement-video-input]').first();out.inputs=await p.locator('[data-testid=arrangement-video-input]').count();
 await inp.setInputFiles(MEDIA);await p.waitForSelector('[data-testid=arrangement-video]',{timeout:30000});await sleep(2500);
 out.dockInline=await rect(p,'[data-testid=arrangement-video-dock]');
 await p.click('[data-testid=arrangement-video-expand]');await sleep(800);
 out.box=await rect(p,'[data-testid=arrangement-video-box]');out.dock=await rect(p,'[data-testid=arrangement-video-dock]');
 out.boxBeforeMove=await rect(p,'[data-testid=arrangement-video-box]');
 {const mr0=await rect(p,'[data-testid=arrangement-marker-row]');const hb=await rect(p,'[data-testid=arrangement-video-drag]');const bb=out.boxBeforeMove;const dx=520-bb.x,dy=(mr0.b+12)-bb.y;
  await p.mouse.move(hb.x+hb.w/2,hb.y+hb.h/2);await p.mouse.down();await p.mouse.move(hb.x+hb.w/2+dx/2,hb.y+hb.h/2+dy/2,{steps:8});await p.mouse.move(hb.x+hb.w/2+dx,hb.y+hb.h/2+dy,{steps:8});await p.mouse.up();await sleep(500);}
 out.box=await rect(p,'[data-testid=arrangement-video-box]');
 const ruler=await rect(p,'[data-testid=arrangement-ruler]');out.ruler=ruler;out.markerRow=await rect(p,'[data-testid=arrangement-marker-row]');
 await p.screenshot({path:`${L.OUT}/shots/dock-expanded-${tag}.png`});
 // add a marker whose flag x lies inside the floating box horizontally
 const box=out.box;const vw=p.viewportSize().width;
 const tx=Math.max(ruler.x+20,Math.min(out.box.x+40,vw-200));
 await blur(p);const m0=await marks(p);
 const hit=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.getAttribute('data-testid')||e.tagName)},[tx,ruler.y+ruler.h/2]);out.rulerHit=hit;
 await p.mouse.click(tx,ruler.y+ruler.h/2);await sleep(150);await p.keyboard.press('m');await sleep(150);await p.keyboard.press('Enter');await sleep(300);
 const t=(await marks(p)).find(v=>!m0.includes(v));out.marker=t;
 const fsel=`[data-testid=arrangement-marker][data-marker-time="${t}"]`;const fb=await rect(p,fsel);out.flag=fb;
 out.flagHit=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.closest('[data-testid=arrangement-marker]')?'flag':(e.getAttribute('data-testid')||e.tagName))},[fb.x+3,fb.y+fb.h/2]);
 await p.mouse.click(fb.x+3,fb.y+fb.h/2,{button:'right'});await sleep(300);
 const mr=await rect(p,'[data-testid=arrangement-marker-menu]');out.menu=mr;
 const b=await rect(p,'[data-testid=arrangement-video-box]');out.boxAtMenu=b;
 out.overlap=mr&&b?Math.max(0,Math.min(mr.r,b.r)-Math.max(mr.x,b.x))*Math.max(0,Math.min(mr.b,b.b)-Math.max(mr.y,b.y)):null;
 out.z=await p.evaluate(()=>{const m=document.querySelector('[data-testid=arrangement-marker-menu]');const d=document.querySelector('[data-testid=arrangement-video-dock]');const zc=e=>{const a=[];for(let x=e;x;x=x.parentElement){const z=getComputedStyle(x).zIndex;if(z!=='auto')a.push(z);}return a};return{menuParentIsBody:m&&m.parentElement===document.body,menuZ:m&&zc(m),dockZ:d&&zc(d)}});
 out.items=await p.evaluate(()=>{const m=document.querySelector('[data-testid=arrangement-marker-menu]');if(!m)return null;return [...m.querySelectorAll('[role=menuitem]')].map(i=>{const r=i.getBoundingClientRect();const cx=r.x+r.width/2,cy=r.y+r.height/2;const e=document.elementFromPoint(cx,cy);return{a:i.getAttribute('data-marker-menu-action'),cx,cy,hitSelf:!!e&&(e===i||i.contains(e))}})});
 await p.screenshot({path:`${L.OUT}/shots/dock-menu-${tag}.png`});
 // actually click "play" by coordinates (through any overlap)
 const play=out.items&&out.items.find(i=>i.a==='play');
 if(play){await p.mouse.click(play.cx,play.cy);await sleep(200);
  const pos=async()=>{const tt=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(tt);return m?+m[1]*60+ +m[2]:NaN};
  const a1=await pos();await sleep(500);const a2=await pos();out.playClick={pos:[a1,a2],menuAfter:await p.locator('[data-testid=arrangement-marker-menu]').count()};await p.keyboard.press('Space');await sleep(200);}
 // delete via coordinates too
 await p.mouse.click(fb.x+3,fb.y+fb.h/2,{button:'right'});await sleep(300);
 const del=await p.evaluate(()=>{const i=document.querySelector('[data-marker-menu-action=delete]');const r=i.getBoundingClientRect();return{cx:r.x+r.width/2,cy:r.y+r.height/2}});
 await p.mouse.click(del.cx,del.cy);await sleep(300);out.deleteClick={marks:await marks(p),act:await act(p)};
 out.pass=!!mr&&out.overlap>0&&out.items.every(i=>i.hitSelf)&&out.playClick&&Math.abs(out.playClick.pos[0]-+t)<=0.4&&out.playClick.pos[1]>out.playClick.pos[0]&&!out.deleteClick.marks.includes(t);
 }catch(e){out.error=String(e).slice(0,400);}
 out.console=s.con.filter(l=>/hydrat|did not match|pageerror/i.test(l));
 save();console.log(JSON.stringify(out,null,1));await s.browser.close();})();
