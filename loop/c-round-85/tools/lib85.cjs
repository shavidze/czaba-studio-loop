const X=require('./lib84.cjs');const{L,sleep,st,blur,key}=X;const fs=require('fs');const crypto=require('crypto');const W=require('./wav.cjs');
const SR=48000;
// range drag on a clip body (below the h-5 move strip); real mouse
async function rangeDrag(p,lane,t0,t1,{idx=0,f=0.65}={}){await X.geo(p);const c=await X.clipInfo(p,lane,idx);const y=Math.round(c.box.y+c.box.h*f);const x0=X.tx(t0),x1=X.tx(t1);
 await p.mouse.move(x0,y,{steps:2});await sleep(80);await p.mouse.down();await p.mouse.move(Math.round((x0+x1)/2),y,{steps:6});await p.mouse.move(x1,y,{steps:6});await sleep(150);await p.mouse.up();await sleep(400);return st(p);}
const dlgSel='[role=dialog]:has(#arrangement-export-title)';
const dstate=p=>p.evaluate(()=>{const t=document.querySelector('#arrangement-export-title');const d=t&&t.closest('[role=dialog]');if(!d)return null;const q=s=>d.querySelector(`[data-testid=${s}]`);
 const r=e=>e&&{checked:e.checked,disabled:e.disabled,label:e.closest('label').textContent.replace(/\s+/g,' ').trim()};
 const desc=t.parentElement.querySelector('p')||t.nextElementSibling;const fmt=[...d.querySelectorAll('input[type=radio]')].map(i=>({name:i.name,tid:i.dataset.testid||null,checked:i.checked,disabled:i.disabled,label:i.closest('label').textContent.replace(/\s+/g,' ').trim().slice(0,160)}));
 const statusEl=d.querySelector('[role=status],[role=alert]');
 return{desc:desc&&desc.textContent,project:r(q('arrangement-export-scope-project')),range:r(q('arrangement-export-scope-range')),reason:q('arrangement-export-scope-range-reason')&&q('arrangement-export-scope-range-reason').textContent,radios:fmt,
  graphNote:q('arrangement-export-graph-note')&&q('arrangement-export-graph-note').textContent,loopNote:q('arrangement-export-loop-note')&&q('arrangement-export-loop-note').textContent,muteNote:q('arrangement-export-master-mute')&&q('arrangement-export-master-mute').textContent.replace(/\s+/g,' '),
  status:statusEl&&statusEl.textContent,warning:q('arrangement-export-overload')&&q('arrangement-export-overload').textContent,videoLine:q('arrangement-export-video-fades')&&q('arrangement-export-video-fades').textContent,
  text:d.textContent.replace(/\s+/g,' ').slice(0,1500)}});
async function openDlg(p){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});await sleep(300);return dstate(p);}
async function closeDlg(p){await p.keyboard.press('Escape');await sleep(400);}
function wavInfo(file){const buf=fs.readFileSync(file);const w=W.parse(buf);return{w,sha:crypto.createHash('sha256').update(buf).digest('hex').slice(0,16),frames:w.frames,fmt:w.fmt,seconds:+w.seconds.toFixed(5),stats:W.stats(w)};}
// click export in an already open dialog, capture download + dialog status
async function exportNow(p,vp,name,{scope=null}={}){if(scope){await p.click(`[data-testid=arrangement-export-scope-${scope}]`);await sleep(250);}const before=await dstate(p);
 const dlP=p.waitForEvent('download',{timeout:300000});await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;const fn=dl.suggestedFilename();const out=`${L.OUT}/export-${vp}-${name}.wav`;await dl.saveAs(out);
 const t0=Date.now();let after=await dstate(p);while(Date.now()-t0<8000&&!(after.status&&/WAV შეიქმნა/.test(after.status))){await sleep(200);after=await dstate(p);}
 const info=wavInfo(out);return{fn,out,before,after,...info};}
const nf=w=>w.fmt.tag===3?1:Math.pow(2,w.fmt.bits-1);
// compare range file a (all frames) vs project file b starting at frame off; returns max |diff| FS, in LSB, count >0, span counts
function diffAt(a,b,off,{spans=null}={}){const ch=a.fmt.ch;const na=nf(a),nb=nf(b);let m=0,at=-1,nz=0,n=0;const sp=spans?spans.map(s=>({...s,max:0,nz:0})):null;
 for(let f=0;f<a.frames;f++){const g=f+off;if(g>=b.frames)break;for(let c=0;c<ch;c++){const va=a.read(f*ch+c),vb=b.read(g*ch+c);const dl=Math.abs(va/na-vb/nb);n++;if(dl>0)nz++;if(dl>m){m=dl;at=f}
  if(sp){const t=g/SR;for(const s of sp)if(t>=s.t0&&t<s.t1){const lsb=Math.abs(va-vb);if(lsb>s.max)s.max=lsb;if(lsb>0)s.nz++;}}}}
 return{maxFS:m,maxLSB:Math.round(m*na),atFrame:at,nonzero:nz,n,spans:sp};}
function nonZero(w){let n=0;for(let i=0;i<w.n;i++)if(w.read(i)!==0)n++;return n;}
function peakWin(w,t0,t1){const ch=w.fmt.ch,n=nf(w);let m=0,full=0;for(let f=Math.max(0,Math.floor(t0*SR));f<Math.min(w.frames,Math.ceil(t1*SR));f++)for(let c=0;c<ch;c++){const a=Math.abs(w.read(f*ch+c))/n;if(a>m)m=a;if(a>=0.9999)full++;}return{peak:m,full};}
const strip=r=>{const{w,out,...o}=r;return o;};
const rm=r=>{try{fs.unlinkSync(r.out)}catch{}};
module.exports={...X,W,SR,rangeDrag,dlgSel,dstate,openDlg,closeDlg,wavInfo,exportNow,diffAt,nonZero,peakWin,strip,rm,nf};
