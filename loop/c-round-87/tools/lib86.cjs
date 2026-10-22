const X=require('./lib85.cjs');const{L,sleep,st,blur}=X;const fs=require('fs');const crypto=require('crypto');
const LABELS={wav:'WAV-ის ექსპორტი',mp3:'MP3-ის ექსპორტი',both:'WAV + MP3 ექსპორტი'};
const fmtT=t=>{const m=Math.floor(t/60);const s=t-m*60;return `${String(m).padStart(2,'0')}:${s.toFixed(3).padStart(6,'0')}`;};
function attachDl(p){p.__dls=[];p.on('download',d=>p.__dls.push({d,fn:d.suggestedFilename(),t:Date.now()}));}
function attachFiles(p){return p.route('**/c-files/**',r=>{const f=decodeURIComponent(r.request().url().split('/c-files/')[1]);r.fulfill({body:fs.readFileSync(`${L.OUT}/${f}`),contentType:'application/octet-stream'});});}
const msgState=p=>p.evaluate(()=>{const t=document.querySelector('#arrangement-export-title');const d=t&&t.closest('[role=dialog]');if(!d)return null;const e=d.querySelector('[role=status],[role=alert]');const b=[...d.querySelectorAll('button')].find(x=>/ექსპორტი|მიმდინარეობს/.test(x.textContent));const c=[...d.querySelectorAll('button')].find(x=>x.textContent.trim()==='დახურვა');
 const w=d.querySelector('[data-testid=arrangement-export-overload]');return{msg:e&&e.textContent,role:e&&e.getAttribute('role'),btn:b&&b.textContent.trim(),btnDisabled:b&&b.disabled,closeDisabled:c?c.disabled:null,warning:w&&w.textContent,
 radios:[...d.querySelectorAll('input[type=radio]')].map(i=>({tid:i.dataset.testid||null,checked:i.checked,disabled:i.disabled}))};});
async function exportFmt(p,vp,name,{format='wav',scope=null,expect=null,timeout=240000,useButton=true,watchExtra=1500}={}){
 if(scope){await p.click(`[data-testid=arrangement-export-scope-${scope}]`);await sleep(200);}
 await p.click(`[data-testid=arrangement-export-format-${format}]`);await sleep(200);
 const before=await X.dstate(p);const n0=p.__dls.length;const exp=expect??(format==='both'?2:1);const tl=[];let last=null;const t0=Date.now();
 if(useButton)await p.getByRole('button',{name:LABELS[format],exact:true}).click();
 let s=null;let renderSeen=null;
 while(Date.now()-t0<timeout){s=await msgState(p);const k=s&&(s.role+'|'+s.msg);if(k!==last){tl.push({t:Date.now()-t0,role:s&&s.role,msg:s&&s.msg,btn:s&&s.btn,close:s&&s.closeDisabled});last=k;if(s&&/მიმდინარეობს/.test(s.btn||'')&&!renderSeen)renderSeen=s.radios;}
  const done=s&&s.role==='status'&&/შეიქმნა/.test(s.msg||'');const err=s&&s.role==='alert'&&(tl.length>1||Date.now()-t0>1500);if((done&&p.__dls.length-n0>=exp&&tl.length>1)||err)break;await sleep(100);}
 const tEnd=Date.now()-t0;await sleep(watchExtra);const after=await msgState(p);const dls=p.__dls.slice(n0);const files=[];
 for(let i=0;i<dls.length;i++){const ext=dls[i].fn.split('.').pop();const out=`${L.OUT}/x-${vp}-${name}-${i}.${ext}`;await dls[i].d.saveAs(out);const buf=fs.readFileSync(out);files.push({fn:dls[i].fn,out,ext,size:buf.length,sha:crypto.createHash('sha256').update(buf).digest('hex').slice(0,16),tAfterClick:dls[i].t-t0});}
 return{before,after,timeline:tl,tEnd,files,renderRadios:renderSeen,names:files.map(f=>f.fn)};}
// MP3 header (skip ID3v2), Xing/Info, LAME tag
function mp3Header(file){const b=fs.readFileSync(file);let o=0;const r={size:b.length};if(b.toString('latin1',0,3)==='ID3'){const sz=(b[6]<<21)|(b[7]<<14)|(b[8]<<7)|b[9];o=10+sz;r.id3=sz;}
 while(o<b.length-4&&!(b[o]===0xff&&(b[o+1]&0xe0)===0xe0))o++;r.firstSync=o;const h=b.readUInt32BE(o);const ver=(h>>19)&3,lay=(h>>17)&3,bri=(h>>12)&15,sri=(h>>10)&3,pad=(h>>9)&1,mode=(h>>6)&3;
 const V={3:'MPEG-1',2:'MPEG-2',0:'MPEG-2.5'}[ver];const Lay={1:'III',2:'II',3:'I'}[lay];const BR1=[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];const SR1=[44100,48000,32000];
 r.version=V;r.layer=Lay;r.bitrateKbps=ver===3&&lay===1?BR1[bri]:null;r.sampleRate=ver===3?SR1[sri]:null;r.mode=['stereo','joint stereo','dual channel','mono'][mode];r.channels=mode===3?1:2;
 const side=ver===3?(mode===3?17:32):(mode===3?9:17);const xo=o+4+side;const tag=b.toString('latin1',xo,xo+4);r.tag=(tag==='Xing'||tag==='Info')?tag:null;r.vbr=tag==='Xing'?true:tag==='Info'?false:null;
 if(r.tag){const fl=b.readUInt32BE(xo+4);let q=xo+8;if(fl&1){r.xingFrames=b.readUInt32BE(q);q+=4;}if(fl&2){r.xingBytes=b.readUInt32BE(q);q+=4;}if(fl&4)q+=100;if(fl&8)q+=4;r.encoder=b.toString('latin1',q,q+9);const d=b.readUIntBE(q+21,3);r.encDelay=d>>12;r.encPadding=d&0xfff;
  if(r.xingFrames&&r.sampleRate){r.durFromXing=+((r.xingFrames*1152-r.encDelay-r.encPadding)/r.sampleRate).toFixed(4);r.avgKbps=r.xingBytes?+((r.xingBytes*8)/(r.xingFrames*1152/r.sampleRate)/1000).toFixed(1):null;}}
 // scan frame bitrates (first 4000 frames)
 const brs={};let q=o;let n=0;while(q<b.length-4&&n<200000){const hh=b.readUInt32BE(q);if((hh>>>21)!==0x7ff)break;const bi=(hh>>12)&15,si=(hh>>10)&3,pd=(hh>>9)&1;const br=BR1[bi],sr=SR1[si];if(!br||!sr)break;brs[br]=(brs[br]||0)+1;q+=Math.floor(144000*br/sr)+pd;n++;}r.framesScanned=n;r.bitrateHist=brs;
 return r;}
// decode mp3 + reference wav in the page; best lag on a window; full-overlap normalised correlation
async function oracle(p,mp3Rel,wavRel,{w0=3,w1=4.5,maxLag=4096}={}){return p.evaluate(async([m,w,w0,w1,maxLag])=>{const ac=new AudioContext({sampleRate:48000});const dec=async u=>ac.decodeAudioData(await (await fetch('/c-files/'+encodeURIComponent(u))).arrayBuffer());
 const A=await dec(m);const B=w?await dec(w):null;const o={mp3:{sr:A.sampleRate,ch:A.numberOfChannels,len:A.length,dur:+A.duration.toFixed(5)}};let mx=0;for(let c=0;c<A.numberOfChannels;c++){const d=A.getChannelData(c);for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>mx)mx=a;}}o.mp3.maxAbs=mx;
 if(!B){await ac.close();return o;}o.wav={sr:B.sampleRate,ch:B.numberOfChannels,len:B.length,dur:+B.duration.toFixed(5)};
 const mono=X=>{const a=X.getChannelData(0),b=X.numberOfChannels>1?X.getChannelData(1):a;const r=new Float32Array(X.length);for(let i=0;i<X.length;i++)r[i]=(a[i]+b[i])/2;return r;};const a=mono(A),b=mono(B);
 const s0=Math.round(w0*48000),s1=Math.min(Math.round(w1*48000),b.length-maxLag-1);const sc=(lag,step)=>{let s=0,ea=0,eb=0;for(let i=s0;i<s1;i+=step){const j=i+lag;if(j<0||j>=a.length)continue;s+=a[j]*b[i];ea+=a[j]*a[j];eb+=b[i]*b[i];}return s/Math.sqrt(ea*eb||1);};
 let best=0,bv=-2;for(let l=-maxLag;l<=maxLag;l+=4){const v=sc(l,2);if(v>bv){bv=v;best=l;}}let b2=best,bv2=-2;for(let l=best-6;l<=best+6;l++){const v=sc(l,1);if(v>bv2){bv2=v;b2=l;}}o.lag=b2;o.lagMs=+(b2/48).toFixed(3);o.windowCorr=+bv2.toFixed(6);
 o.corr=[];for(let c=0;c<Math.min(A.numberOfChannels,B.numberOfChannels);c++){const x=A.getChannelData(c),y=B.getChannelData(c);let s=0,ex=0,ey=0;for(let i=0;i<y.length;i++){const j=i+b2;if(j<0||j>=x.length)continue;s+=x[j]*y[i];ex+=x[j]*x[j];ey+=y[i]*y[i];}o.corr.push(+(s/Math.sqrt(ex*ey||1)).toFixed(6));}
 let wm=0;for(let c=0;c<B.numberOfChannels;c++){const d=B.getChannelData(c);for(let i=0;i<d.length;i++){const q=Math.abs(d[i]);if(q>wm)wm=q;}}o.wav.maxAbs=wm;await ac.close();return o;},[mp3Rel,wavRel,w0,w1,maxLag]);}
const rel=f=>f.out.split('/').pop();
const rmF=r=>{if(!r)return;for(const f of (r.files||[]))try{fs.unlinkSync(f.out)}catch{}};
const unpkg=s=>s.reqs.filter(r=>/unpkg\.com/.test(r.url)).map(r=>r.url.replace(/^https:\/\/unpkg\.com/,''));
module.exports={...X,LABELS,fmtT,attachDl,attachFiles,msgState,exportFmt,mp3Header,oracle,rel,rmF,unpkg};
