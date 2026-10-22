const X=require('./lib86.cjs');const{L,sleep,blur}=X;const fs=require('fs');
// C round 87: rAF gap recorder + progress MutationObserver + worker tracking
function attachWorkers(p){p.__workers=[];p.on('worker',w=>{const rec={url:w.url(),t:Date.now(),closed:null};p.__workers.push(rec);w.on('close',()=>{rec.closed=Date.now();});});}
async function instrument(p){return p.evaluate(()=>{const dlg=document.querySelector('#arrangement-export-title').closest('[role=dialog]');
 const t0=performance.now();window.__c87={t0,gaps:[],prog:[],run:true,focusProg:false};let last=performance.now();
 const tick=()=>{const n=performance.now();window.__c87.gaps.push({at:Math.round(last-t0),gap:+(n-last).toFixed(1)});last=n;if(window.__c87.run)requestAnimationFrame(tick);};requestAnimationFrame(tick);
 const snap=()=>{const bar=dlg.querySelector('[data-testid=arrangement-export-progress]');const lab=dlg.querySelector('[data-testid=arrangement-export-progress-label]');const s=dlg.querySelector('[role=status],[role=alert]');
  const r={t:Math.round(performance.now()-t0),bar:!!bar,hasValue:bar?bar.hasAttribute('value'):null,value:bar&&bar.hasAttribute('value')?bar.getAttribute('value'):null,label:lab?lab.textContent:null,status:s?s.textContent:null,role:s?s.getAttribute('role'):null,barFocusable:bar?bar.tabIndex:null,barTag:bar?bar.tagName:null,barAria:bar?bar.getAttribute('aria-label'):null,barMax:bar?bar.getAttribute('max'):null,barClass:bar?bar.className:null};
  if(document.activeElement===bar&&bar)window.__c87.focusProg=true;
  const l=window.__c87.prog.at(-1);if(!l||l.bar!==r.bar||l.value!==r.value||l.hasValue!==r.hasValue||l.label!==r.label||l.status!==r.status)window.__c87.prog.push(r);};
 const mo=new MutationObserver(snap);mo.observe(dlg,{attributes:true,childList:true,characterData:true,subtree:true});window.__c87.mo=mo;snap();
 document.addEventListener('focusin',()=>{const bar=dlg.querySelector('[data-testid=arrangement-export-progress]');if(bar&&document.activeElement===bar)window.__c87.focusProg=true;});return true;});}
async function collect(p){return p.evaluate(()=>{const c=window.__c87;c.run=false;c.mo.disconnect();return{gaps:c.gaps,prog:c.prog,focusProg:c.focusProg};});}
const phaseOf=l=>!l?null:/^რენდერი · /.test(l)?'render':/^WAV-ის ჩაწერა · /.test(l)?'wav':l==='MP3 encoder-ის ჩატვირთვა…'?'load':/^MP3-ის შექმნა · /.test(l)?'mp3':'UNKNOWN:'+l;
function analyze(raw,{tClick=0,tDone=Infinity}={}){const g=raw.gaps.filter(x=>x.at>=tClick-5&&x.at<=tDone+50);const sorted=g.slice().sort((a,b)=>b.gap-a.gap);
 const prog=raw.prog;const order=[];const per={};const issues=[];
 for(const r of prog){if(!r.bar&&!r.label)continue;const ph=phaseOf(r.label);if(!ph||ph.startsWith('UNKNOWN')){issues.push('label:'+r.label);continue;}if(order.at(-1)!==ph)order.push(ph);per[ph]||={values:[],noValue:0,records:0,dec:0,pctBad:0,last:null};const P=per[ph];P.records++;
  if(ph==='load'){if(r.hasValue)issues.push('load has value '+r.value);else P.noValue++;continue;}
  if(!r.hasValue){issues.push(ph+' without value');continue;}const v=+r.value;if(P.last!==null&&v<P.last)P.dec++;P.last=v;if(!P.values.includes(v))P.values.push(v);
  const m=/(\d+)%$/.exec(r.label);if(!m||+m[1]!==Math.floor(v*100))P.pctBad++;}
 const statuses=[];for(const r of prog)if(r.status&&statuses.at(-1)!==r.status)statuses.push(r.status);
 const first=prog[0],lastR=prog.at(-1);
 const phases=Object.fromEntries(Object.entries(per).map(([k,v])=>[k,{records:v.records,distinct:v.values.length,first:v.values[0]??null,last:v.values.at(-1)??null,decreases:v.dec,pctMismatch:v.pctBad,noValueRecords:v.noValue}]));
 // a phase re-entered later counts as order violation
 const reentered=order.length!==new Set(order).size;
 return{maxGap:sorted[0]?sorted[0].gap:null,top5:sorted.slice(0,5).map(x=>[x.gap,x.at]),frames:g.length,order,reentered,phases,issues,statuses,absentAtStart:first?!first.bar&&!first.label:null,absentAtEnd:lastR?!lastR.bar&&!lastR.label:null,focusProg:raw.focusProg,barAttrs:(prog.find(r=>r.bar)||{})};}
// timestamps of status transitions in the page clock
const tOf=(raw,re)=>{const i0=raw.prog.findIndex(x=>x.status&&/^რენდერი და 24-bit/.test(x.status));if(i0<0)return null;const r=raw.prog.slice(i0).find(x=>x.status&&re.test(x.status));return r?r.t:null;};
async function oraclePage(vp){const so=await L.open(vp);await X.attachFiles(so.page);await so.page.route('**/c-blank',r=>r.fulfill({body:'<html><body>oracle</body></html>',contentType:'text/html'}));so.page.on('crash',()=>console.log('ORACLE PAGE CRASH'));await so.page.goto('http://127.0.0.1:5173/c-blank');return so;}
async function exportInst(p,vp,name,opt={}){const o={format:'wav',...opt};if(o.scope){await p.click(`[data-testid=arrangement-export-scope-${o.scope}]`);await sleep(200);o.scope=null;}
 await p.click(`[data-testid=arrangement-export-format-${o.format}]`);await sleep(200);await instrument(p);const w0=p.__workers.length;const tc=Date.now();
 const tClick=await p.evaluate(()=>Math.round(performance.now()-window.__c87.t0));
 const r=await X.exportFmt(p,vp,name,{...o,format:o.format,watchExtra:1200});const raw=await collect(p);
 const tDone=tOf(raw,/შეიქმნა/)??tOf(raw,/ვერ|ამოიწურა|შეცდომ/)??Infinity;const an=analyze(raw,{tClick,tDone});
 const workers=p.__workers.slice(w0).map(w=>({url:w.url,dt:w.t-tc,closedAfter:w.closed?w.closed-tc:null}));
 return{...r,an,tClick,tDone,workers,raw};}
const sameOrigin=u=>/^http:\/\/127\.0\.0\.1:5173\//.test(u);
async function fiveMin(p){const el=await p.$$eval('[data-clip-id]',els=>els.map(e=>{const r=e.getBoundingClientRect();return{lane:e.closest('[data-track-id]').getAttribute('data-track-id'),x:r.x,y:r.y,w:r.width,h:r.height};}));
 const m=el.find(c=>c.lane==='music');await p.mouse.click(Math.round(m.x+Math.min(m.w/2,20)),Math.round(m.y+m.h-8));await sleep(200);
 for(let i=0;i<2;i++){await p.keyboard.press('Control+d');await sleep(700);}await blur(p);const d=await X.openDlg(p);
 const txt=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-export-scope-project]').closest('label').innerText);return{txt,d};}
module.exports={...X,oraclePage,attachWorkers,instrument,collect,analyze,exportInst,sameOrigin,fiveMin,phaseOf};
// memory-light oracle for long files: WAV windows are cut in Node, only the MP3 is decoded in the page
function wavWin(file,w0,w1){const W=require('./wav.cjs');const w=W.parse(fs.readFileSync(file));const s0=Math.round(w0*w.fmt.sr),s1=Math.round(w1*w.fmt.sr);const fsx=Math.pow(2,w.fmt.bits-1);const L=new Float32Array(s1-s0),R=new Float32Array(s1-s0);
 for(let i=s0;i<s1;i++){L[i-s0]=w.read(i*w.fmt.ch)/fsx;R[i-s0]=w.read(i*w.fmt.ch+1)/fsx;}return{s0,L:Buffer.from(L.buffer).toString('base64'),R:Buffer.from(R.buffer).toString('base64')};}
async function oracleWin(page,mp3Rel,wavFile,wins,maxLag=4096){const W=wins.map(([a,b])=>({w0:a,w1:b,...wavWin(wavFile,a,b)}));
 return page.evaluate(async([m,W,maxLag])=>{const ac=new AudioContext({sampleRate:48000});const A=await ac.decodeAudioData(await (await fetch('/c-files/'+encodeURIComponent(m))).arrayBuffer());const o={mp3:{sr:A.sampleRate,ch:A.numberOfChannels,len:A.length,dur:+A.duration.toFixed(5)},wins:[]};
  const dec=b=>{const s=atob(b);const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new Float32Array(u.buffer);};const a0=A.getChannelData(0),a1=A.numberOfChannels>1?A.getChannelData(1):a0;
  for(const w of W){const L=dec(w.L),R=dec(w.R);const sc=(lag,step)=>{let s=0,ea=0,eb=0;for(let i=0;i<L.length;i+=step){const j=w.s0+i+lag;if(j<0||j>=a0.length)continue;const x=(a0[j]+a1[j])/2,y=(L[i]+R[i])/2;s+=x*y;ea+=x*x;eb+=y*y;}return s/Math.sqrt(ea*eb||1);};
   let best=0,bv=-2;for(let l=-maxLag;l<=maxLag;l+=4){const v=sc(l,2);if(v>bv){bv=v;best=l;}}let b2=best,bv2=-2;for(let l=best-6;l<=best+6;l++){const v=sc(l,1);if(v>bv2){bv2=v;b2=l;}}
   const ch=(X,Y)=>{let s=0,ex=0,ey=0;for(let i=0;i<Y.length;i++){const j=w.s0+i+b2;if(j<0||j>=X.length)continue;s+=X[j]*Y[i];ex+=X[j]*X[j];ey+=Y[i]*Y[i];}return +(s/Math.sqrt(ex*ey||1)).toFixed(6);};
   o.wins.push({w0:w.w0,w1:w.w1,lag:b2,lagMs:+(b2/48).toFixed(3),monoCorr:+bv2.toFixed(6),corrL:ch(a0,L),corrR:ch(a1,R)});}
  await ac.close();return o;},[mp3Rel,W,maxLag]);}
module.exports.oracleWin=oracleWin;
