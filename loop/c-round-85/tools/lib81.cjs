const X=require('./h80.cjs');const{L,sleep,st,blur,key}=X;const fs=require('fs');const W=require('./wav.cjs');const crypto=require('crypto');
const MEDIA='/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-vp9-opus.webm';
const G1='ჯგუფი 1',G2='ჯგუფი 2';
async function loadVideo(p){await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles(MEDIA);await p.waitForSelector('[data-testid=arrangement-video]',{timeout:30000});await sleep(2500);}
const gEl=(p,name,tid)=>X.grp(p,name).locator(`[data-testid=${tid}]`);
const gMute=(p,n)=>gEl(p,n,'arrangement-group-mute'),gSolo=(p,n)=>gEl(p,n,'arrangement-group-solo'),gVol=(p,n)=>gEl(p,n,'arrangement-group-volume'),gName=(p,n)=>gEl(p,n,'arrangement-group-name');
const lane=(p,t,sel)=>p.locator(`[data-track-id=${t}] ${sel}`).first();
const lMute=(p,t)=>lane(p,t,'button[title=Mute]'),lSolo=(p,t)=>lane(p,t,'button[title^=Solo]'),lVol=(p,t)=>lane(p,t,'input[aria-label^="Volume"]');
const mix=p=>p.evaluate(()=>{const o={tracks:{},groups:{}};for(const l of document.querySelectorAll('[data-track-id]')){const m=l.querySelector('button[title=Mute]'),s=l.querySelector('button[title^=Solo]'),v=l.querySelector('input[aria-label^="Volume"]');o.tracks[l.dataset.trackId]={m:m&&m.getAttribute('aria-pressed'),s:s&&s.getAttribute('aria-pressed'),v:v&&+v.value}}
 for(const r of document.querySelectorAll('[data-testid=arrangement-group-row]')){const n=r.querySelector('[data-testid=arrangement-group-name]');const name=n?n.textContent.replace('▣','').trim():'?';const m=r.querySelector('[data-testid=arrangement-group-mute]'),s=r.querySelector('[data-testid=arrangement-group-solo]'),v=r.querySelector('[data-testid=arrangement-group-volume]');o.groups[name]={m:m&&m.getAttribute('aria-pressed'),dm:m&&m.dataset.mute,s:s&&s.getAttribute('aria-pressed'),ds:s&&s.dataset.solo,v:v&&+v.value,vt:v&&v.getAttribute('aria-valuetext'),title:v&&v.title,collapsed:r.dataset.groupCollapsed==='true',depth:+r.dataset.groupDepth}}return o});
async function hist(p){return (await st(p)).undo;}
async function undoN(p){// count of undo steps available? not exposed; use titles only
 return null;}
async function exportWav(p,vp,name,keep=false){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});
 const dialogText=await p.evaluate(()=>{const t=document.querySelector('#arrangement-export-title');const d=t&&t.closest('[role=dialog]');return d?d.textContent.replace(/\s+/g,' ').slice(0,1200):null});
 const dlP=p.waitForEvent('download',{timeout:300000});const t0=Date.now();await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;
 const out=`${L.OUT}/export-${vp}-${name}.wav`;await dl.saveAs(out);await sleep(400);await p.keyboard.press('Escape');await sleep(300);
 const buf=fs.readFileSync(out);const w=W.parse(buf);const r={name,ms:Date.now()-t0,sha:crypto.createHash('sha256').update(buf).digest('hex').slice(0,16),fmt:w.fmt,frames:w.frames,seconds:+w.seconds.toFixed(4),riff:w.riff,all:W.stats(w),win:{pre:win(w,0.1,1.9),vid:win(w,0.0,0.3),Ws:win(w,2.4,3.9),Wx:win(w,4.2,5.0),late:win(w,7,9)}};
 r.w=w;r.dialogText=dialogText;if(!keep)fs.unlinkSync(out);return r;}
function win(w,t0,t1){const ch=w.fmt.ch,sr=w.fmt.sr,fsc=w.fmt.tag===3?1:Math.pow(2,w.fmt.bits-1);let sum=0,peak=0,full=0,nan=0,n=0,maxAbs=0;
 for(let f=Math.floor(t0*sr);f<Math.min(w.frames,Math.floor(t1*sr));f++)for(let c=0;c<ch;c++){const v=w.read(f*ch+c);if(!Number.isFinite(v)){nan++;continue}const a=Math.abs(v);if(a>maxAbs)maxAbs=a;const x=a/fsc;if(x>=0.9999)full++;sum+=x*x;n++;}
 return{rms:Math.sqrt(sum/Math.max(1,n)),maxAbsLsb:maxAbs,full,nan,n};}
const strip=r=>{const{w,...o}=r;return o};
const ratio=(a,b,k)=>a.win[k].rms/b.win[k].rms;
const dB=x=>20*Math.log10(x);
// meters
const mStart=p=>p.evaluate(()=>{window.__m=[];const rd=()=>{const o={t:Math.round(performance.now())};const m=document.querySelector('[data-testid=arrangement-master-meter]');o.M=m&&m.getAttribute('data-level-db');for(const l of document.querySelectorAll('[data-track-id]')){const e=l.querySelector('[data-testid=arrangement-track-meter]');o[l.dataset.trackId]=e&&e.getAttribute('data-level-db');}const pos=document.querySelector('[data-testid=arrangement-position]');o.pos=pos&&pos.textContent;o.src=window.__src.length;return o};window.__mi=setInterval(()=>window.__m.push(rd()),40)});
const mStop=p=>p.evaluate(()=>{clearInterval(window.__mi);return window.__m});
const dbv=v=>(!v||v==='-inf')?-120:+v;
const now=p=>p.evaluate(()=>Math.round(performance.now()));
// time-to-floor: given samples, the event time te and key, L0 = last value before te, floor at <= -60
function ttf(m,te,k){const before=m.filter(x=>x.t<=te);const L0=before.length?dbv(before[before.length-1][k]):-120;const after=m.filter(x=>x.t>te);const f=after.find(x=>dbv(x[k])<=-60);const lim=(Math.max(L0,-60)+60)/20+0.1;const tf=f?(f.t-te)/1000:null;
 const stays=f?after.filter(x=>x.t>=f.t).every(x=>dbv(x[k])<=-60):false;return{L0,tf,lim:+lim.toFixed(3),ok:tf!==null&&tf<=lim+0.05,staysFloor:stays};}
async function freshSetup(p,{video=true}={}){await L.fresh(p);if(video)await loadVideo(p);const S=await X.setup(p);return S;}
async function makeG1(p){await X.groupStemsSfx(p);await sleep(300);}
async function makeG2(p){await X.clickName(p,'music');await X.clickGroup(p,G1,['Control']);await blur(p);await key(p,'Control+g');await sleep(300);}
async function play(p){await blur(p);await p.keyboard.press('Space');}
async function playFrom(p,t){await blur(p);await p.keyboard.press('Home');await sleep(200);await p.keyboard.press('Space');}
module.exports={...X,X,W,MEDIA,G1,G2,loadVideo,gEl,gMute,gSolo,gVol,gName,lane,lMute,lSolo,lVol,mix,hist,exportWav,win,strip,ratio,dB,mStart,mStop,dbv,now,ttf,freshSetup,makeG1,makeG2,play,playFrom};
