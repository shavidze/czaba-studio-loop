const X=require('./lib82.cjs');const{L,sleep,st,blur,key}=X;
// envelope helpers (round 83, C)
const envInfo=(p,lane,idx=0)=>p.evaluate(([lane,idx])=>{const cs=[...document.querySelectorAll(`[data-track-id="${lane}"] [data-clip-id]`)].sort((a,b)=>+a.dataset.clipStart- +b.dataset.clipStart);const e=cs[idx];if(!e)return null;
 const R=el=>{const b=el.getBoundingClientRect();return{x:b.left,y:b.top,w:b.width,h:b.height}};
 const ed=e.querySelector('[data-testid=arrangement-clip-envelope-editor]');const ln=e.querySelector('[data-testid=arrangement-clip-envelope-line]');
 const body=ed?ed.parentElement:(ln?ln.parentElement:(e.children[1]||null));
 const pts=[...e.querySelectorAll('[data-testid=arrangement-clip-envelope-point]')].map(q=>{const b=q.getBoundingClientRect();return{t:+q.dataset.time,g:+q.dataset.gain,dt:q.dataset.time,dg:q.dataset.gain,title:q.title,cx:b.left+b.width/2,cy:b.top+b.height/2,w:b.width,h:b.height}});
 return{id:e.dataset.clipId,kind:e.dataset.clipKind,start:+e.dataset.clipStart,env:e.getAttribute('data-envelope'),fi:e.dataset.fadeIn,fo:e.dataset.fadeOut,box:R(e),body:body?R(body):null,editor:ed?R(ed):null,editorCursor:ed?getComputedStyle(ed).cursor:null,
  line:ln?{r:R(ln),pts:ln.querySelector('polyline').getAttribute('points'),vb:ln.getAttribute('viewBox')}:null,points:pts,
  hin:!!e.querySelector('[data-testid=arrangement-clip-fade-in-handle]'),hout:!!e.querySelector('[data-testid=arrangement-clip-fade-out-handle]'),n:cs.length}},[lane,idx]);
const parseEnv=s=>!s?[]:s.split(';').map(x=>{const[a,b]=x.split(':');return{t:+a,g:+b}});
const envFn=pts=>t=>{if(!pts.length)return 1;if(t<=pts[0].t)return pts[0].g;const l=pts[pts.length-1];if(t>=l.t)return l.g;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(t<=b.t)return a.g+(b.g-a.g)*(t-a.t)/(b.t-a.t);}return l.g;};
const mode=p=>p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');const b=document.querySelector('[data-testid=arrangement-envelope-toggle]');return{mode:g.dataset.envelopeMode,pressed:b.getAttribute('aria-pressed'),title:b.title,keys:b.getAttribute('aria-keyshortcuts'),text:b.textContent.trim(),cls:b.className,sw:g.scrollWidth,cw:g.clientWidth}});
async function setMode(p,on,via='button'){const m=await mode(p);if((m.mode==='on')===on)return m;if(via==='button'){await p.click('[data-testid=arrangement-envelope-toggle]');await sleep(200);await blur(p);}else{await blur(p);await key(p,'a',250);}return mode(p);}
const bodyY=(c,f=0.6)=>c.body.y+c.body.h*f;
async function dblAt(p,lane,t,idx=0,f=0.6){const c=await envInfo(p,lane,idx);const x=X.tx(t),y=bodyY(c,f);await p.mouse.move(x,y,{steps:2});await sleep(80);await p.mouse.dblclick(x,y);await sleep(350);return{c:await envInfo(p,lane,idx),s:await st(p),x,y};}
// drag point i by dx,dy px (real mouse); returns during status and after state
async function dragPoint(p,lane,i,dx,dy,{idx=0,steps=12}={}){const c=await envInfo(p,lane,idx);const q=c.points[i];if(!q)throw new Error('no point '+i);const x=q.cx,y=q.cy;
 await p.mouse.move(x,y,{steps:2});await sleep(100);await p.mouse.down();await p.mouse.move(x+dx/2,y+dy/2,{steps:Math.ceil(steps/2)});await p.mouse.move(x+dx,y+dy,{steps:Math.ceil(steps/2)});await sleep(150);const during=(await st(p)).status;
 await p.mouse.up();await sleep(350);return{during,after:await envInfo(p,lane,idx),s:await st(p),from:{x,y},before:c};}
// drag the middle point of 3 so its gain becomes target (absolute)
async function dragPointToGain(p,lane,i,g,idx=0){const c=await envInfo(p,lane,idx);const q=c.points[i];const dy=(q.g-g)*c.body.h;return dragPoint(p,lane,i,0,dy,{idx});}
const dbStr=g=>g<=0?'−∞ dB':`${(20*Math.log10(g)).toFixed(1).replace('-','−')} dB`;
async function buildV(p,lane='stems',ts=[6,10,14],g=0.2512){await setMode(p,true);const adds=[];for(const t of ts)adds.push(await dblAt(p,lane,t));const d=await dragPointToGain(p,lane,1,g);return{adds,d,env:(await envInfo(p,lane)).env};}
async function undo(p,n=1){await blur(p);for(let i=0;i<n;i++)await key(p,'Control+z',350);return st(p);}
async function redo(p,n=1){await blur(p);for(let i=0;i<n;i++)await key(p,'Control+y',350);return st(p);}
const nrm=w=>w.fmt.tag===3?1:Math.pow(2,w.fmt.bits-1);
function ratioCheck(x,ref,t0,t1,expf,tol,thr=1e-3,skip=null){const ch=ref.fmt.ch,sr=ref.fmt.sr,nx=nrm(x),nr=nrm(ref);let n=0,bad=0,maxErr=0,worst=null;const badList=[];
 for(let f=Math.ceil(t0*sr);f<Math.min(ref.frames,Math.floor(t1*sr));f++){const t=f/sr;if(skip&&skip(t))continue;const e=expf(t);for(let c=0;c<ch;c++){const r=ref.read(f*ch+c)/nr;if(Math.abs(r)<=thr)continue;const v=x.read(f*ch+c)/nx;const err=Math.abs(v/r-e);n++;if(err>maxErr){maxErr=err;worst={t:+t.toFixed(6),c,r:+r.toFixed(6),v:+v.toFixed(6),e:+e.toFixed(6)}}if(err>tol){bad++;if(badList.length<5)badList.push({t:+t.toFixed(6),r:+r.toFixed(6),v:+v.toFixed(6),e:+e.toFixed(6)})}}}
 return{n,bad,maxErr:+maxErr.toPrecision(4),worst,badList,ok:n>100&&bad===0};}
function silent(w,t0,t1){const ch=w.fmt.ch,sr=w.fmt.sr,nn=nrm(w);let m=0;for(let f=Math.floor(t0*sr);f<Math.min(w.frames,Math.floor(t1*sr));f++)for(let c=0;c<ch;c++)m=Math.max(m,Math.abs(w.read(f*ch+c)/nn));return m;}
// max abs sample diff between two exports over [t0,t1], skipping predicate
function diff(a,b,t0,t1,skip=null){const ch=a.fmt.ch,sr=a.fmt.sr,na=nrm(a),nb=nrm(b);let m=0,at=null,n=0;for(let f=Math.ceil(t0*sr);f<Math.min(a.frames,b.frames,Math.floor(t1*sr));f++){const t=f/sr;if(skip&&skip(t))continue;for(let c=0;c<ch;c++){const d=Math.abs(a.read(f*ch+c)/na-b.read(f*ch+c)/nb);n++;if(d>m){m=d;at=+t.toFixed(6)}}}return{max:+m.toPrecision(4),at,n};}
const meta=e=>({fmt:e.fmt,frames:e.frames,seconds:e.seconds,sha:e.sha,nan:e.all.nan,full:e.all.full,peak:+e.all.peak.toFixed(4)});
module.exports={...X,envInfo,parseEnv,envFn,mode,setMode,bodyY,dblAt,dragPoint,dragPointToGain,dbStr,buildV,undo,redo,ratioCheck,silent,diff,meta,nrm};
