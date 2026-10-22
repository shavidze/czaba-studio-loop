const X=require('./lib81.cjs');const{L,sleep,st,blur,key}=X;
// clip helpers keyed by lane (first clip on lane unless idx)
const clipInfo=(p,lane,idx=0)=>p.evaluate(([lane,idx])=>{const cs=[...document.querySelectorAll(`[data-track-id="${lane}"] [data-clip-id]`)].sort((a,b)=>+a.dataset.clipStart- +b.dataset.clipStart);const e=cs[idx];if(!e)return null;const r=e.getBoundingClientRect();
 const q=s=>{const h=e.querySelector(`[data-testid=${s}]`);if(!h)return null;const b=h.getBoundingClientRect();return{x:b.left,y:b.top,w:b.width,h:b.height,op:getComputedStyle(h).opacity,z:getComputedStyle(h).zIndex,title:h.title}};
 return{id:e.dataset.clipId,kind:e.dataset.clipKind,start:+e.dataset.clipStart,fi:e.dataset.fadeIn,fo:e.dataset.fadeOut,box:{x:r.left,y:r.top,w:r.width,h:r.height},hin:q('arrangement-clip-fade-in-handle'),hout:q('arrangement-clip-fade-out-handle'),ramps:!!e.querySelector('[data-testid=arrangement-clip-fade-ramps]'),n:cs.length}},[lane,idx]);
const allClips=p=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>{const z=+/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];return{lane:e.closest('[data-track-id]').dataset.trackId,start:+e.dataset.clipStart,dur:+(e.getBoundingClientRect().width/z).toFixed(3),fi:e.dataset.fadeIn,fo:e.dataset.fadeOut}}).sort((a,b)=>a.lane<b.lane?-1:a.lane>b.lane?1:a.start-b.start));
async function hover(p,lane,idx=0){const c=await clipInfo(p,lane,idx);await p.mouse.move(c.box.x+c.box.w/2,c.box.y+c.box.h*0.7,{steps:3});await sleep(250);return clipInfo(p,lane,idx);}
// drag a fade handle by dx px with real mouse
async function dragHandle(p,lane,edge,dx,{idx=0,steps=10,cancel=false}={}){const c=await hover(p,lane,idx);const h=edge==='in'?c.hin:c.hout;if(!h)throw new Error('no handle '+edge);
 const x=h.x+h.w/2,y=h.y+h.h/2;await p.mouse.move(x,y,{steps:2});await sleep(100);await p.mouse.down();await p.mouse.move(x+dx/2,y,{steps:Math.ceil(steps/2)});await p.mouse.move(x+dx,y,{steps:Math.ceil(steps/2)});await sleep(120);const during=(await st(p)).status;
 if(cancel){await p.evaluate(([x,y])=>{const el=document.elementFromPoint(x,y);},[x+dx,y]);}
 await p.mouse.up();await sleep(350);const after=await clipInfo(p,lane,idx);return{during,after,s:await st(p),from:{x,y}};}
async function dblHandle(p,lane,edge,idx=0){const c=await hover(p,lane,idx);const h=edge==='in'?c.hin:c.hout;await p.mouse.move(h.x+h.w/2,h.y+h.h/2,{steps:2});await sleep(100);await p.mouse.dblclick(h.x+h.w/2,h.y+h.h/2);await sleep(400);return{after:await clipInfo(p,lane,idx),s:await st(p)};}
async function pressHandle(p,lane,edge,idx=0){const c=await hover(p,lane,idx);const h=edge==='in'?c.hin:c.hout;await p.mouse.move(h.x+h.w/2,h.y+h.h/2,{steps:2});await p.mouse.down();await sleep(150);await p.mouse.up();await sleep(400);return{after:await clipInfo(p,lane,idx),s:await st(p)};}
// header click selects the clip (move strip h-5)
async function selectClip(p,lane,idx=0,mods=[]){const c=await clipInfo(p,lane,idx);for(const m of mods)await p.keyboard.down(m);await p.mouse.click(c.box.x+c.box.w/2,c.box.y+8);for(const m of mods)await p.keyboard.up(m);await sleep(250);return c;}
const tOfX=x=>(x-X.RL)/X.PPS;
module.exports={...X,clipInfo,allClips,hover,dragHandle,dblHandle,pressHandle,selectClip,tOfX};
