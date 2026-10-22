// C round 89: IDLE-ORDER, FOCUS-NOT-OBSCURED-R (idle / 5M render / done+overload), VIS-RENDER-S. node vis89.cjs <vp> <A|C>
const X=require('./lib88.cjs');const{L,sleep,blur,fmtT}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const which=process.argv[3]||'A';
const rec=X.mkRec(`${L.OUT}/v89-${vp}-${which}.json`);const T=X.T(rec);const SH=`${L.OUT}/shots`;
const shot=(p,n)=>p.screenshot({path:`${SH}/${n}-${vp}.png`});
const WARN_RE=/^გადატვირთვა: პიკი \+1\.7 dBFS — \d+ sample შეიზღუდა 0 dBFS-ზე\./;
const norm=f=>f.id==='Close'&&f.tag==='BUTTON'?'X':f.id;
async function keys(p,key,n){const out=[];for(let i=0;i<n;i++){await p.keyboard.press(key);await sleep(120);const f=await X.focusProbe(p);f.key=key;f.n=norm(f);out.push(f);}return out;}
const okSeq=seq=>seq.every(x=>x.inside&&!x.covered&&x.tag!=='PROGRESS'&&x.tag!=='BODY');
const slim=seq=>seq.map(x=>({k:x.key,id:x.n,in:x.inside,cov:x.covered,b:x.bottom,ft:x.footerTop,inF:x.inFooter}));
async function sess(){const s=await L.open(vp);const p=s.page;X.attachDl(p);await X.attachFiles(p);await L.fresh(p);await sleep(300);return{s,p};}
(async()=>{
 if(which==='A'){const{s,p}=await sess();const S=await X.setup(p);await blur(p);const ME=S.clips.find(c=>c.lane==='music');const END=+(ME.start+ME.dur).toFixed(3);rec('SETUP-A',null,{END,clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
  await T('IDLE-ORDER',async()=>{await X.openDlg(p);const init=norm(await X.focusProbe(p));const fw=await keys(p,'Tab',5);const bw=await keys(p,'Shift+Tab',5);await shot(p,'idle-order');
   const F=fw.map(x=>x.n),B=bw.map(x=>x.n);const expF=['ExportBtn','X','arrangement-export-format-wav','arrangement-export-scope-project','დახურვა'];const expB=['arrangement-export-scope-project','arrangement-export-format-wav','X','ExportBtn','დახურვა'];
   const mapE=a=>a.map(x=>/ექსპორტი$/.test(x)?'ExportBtn':x);
   rec('IDLE-ORDER',init==='დახურვა'&&JSON.stringify(mapE(F))===JSON.stringify(expF)&&JSON.stringify(mapE(B))===JSON.stringify(expB),{init,F,B,expF,expB});
   rec('FOCUS-NOT-OBSCURED-idle',okSeq(fw)&&okSeq(bw),{seq:slim(fw.concat(bw))});});
  await T('DONE',async()=>{const r=await X.exportFmt(p,vp,'done101',{format:'wav',watchExtra:800});const m=await X.msgState(p);await shot(p,'done-101');
   const fw=await keys(p,'Tab',6);const bw=await keys(p,'Shift+Tab',6);await shot(p,'focus-done');
   rec('FOCUS-NOT-OBSCURED-done',r.names.join()==='czaba-studio-lab.wav'&&WARN_RE.test(m.warning||'')&&okSeq(fw)&&okSeq(bw),{names:r.names,msg:m.msg,warning:m.warning,F:fw.map(x=>x.n),B:bw.map(x=>x.n),seq:slim(fw.concat(bw))});X.rmF(r);});
  await X.finish(s,rec,'A-'+vp);}
 if(which==='C'){const{s,p}=await sess();await X.setup(p);await X.fiveMin(p);
  await T('RENDER-5M-MP3',async()=>{await X.closeDlg(p);await X.openDlg(p);await X.inst(p);const n0=p.__dls.length;await p.click('[data-testid=arrangement-export-format-mp3]');await sleep(250);
   const gBefore=await X.geom(p,'beforeClick');await X.instrument(p);await X.moStart(p);
   await p.getByRole('button',{name:'MP3-ის ექსპორტი',exact:true}).click();await sleep(150);const gClick=await X.geom(p,'afterClick');
   const fw=await keys(p,'Tab',6);const bw=await keys(p,'Shift+Tab',4);const labels=[];
   await shot(p,'focus-render');
   const t0=Date.now();while(Date.now()-t0<180000&&p.__dls.length===n0)await sleep(200);await sleep(1000);
   const samples=await X.moStop(p);const raw=await X.collect(p);const sum=X.summarizeRender(samples);const m=await X.msgState(p);
   const rendering=fw.concat(bw).map(x=>x.scrollTop);
   rec('FOCUS-NOT-OBSCURED-render',okSeq(fw)&&okSeq(bw)&&!raw.focusProg,{F:fw.map(x=>x.n),B:bw.map(x=>x.n),seq:slim(fw.concat(bw)),focusProg:raw.focusProg});
   const need=['render','wav','load','mp3'];const allOk=need.every(k=>sum.phases[k]&&sum.phases[k].n>=1&&sum.phases[k].ok===sum.phases[k].n);
   rec('VIS-RENDER-S',p.__dls.slice(n0).map(d=>d.fn).join()==='czaba-studio-lab.mp3'&&allOk&&gBefore.scrollTop===gClick.scrollTop,{vp,files:p.__dls.slice(n0).map(d=>d.fn),msg:m.msg,scrollBefore:gBefore.scrollTop,scrollAfterClick:gClick.scrollTop,scrollTops:sum.scrollTops,phases:Object.fromEntries(Object.entries(sum.phases).map(([k,v])=>[k,{n:v.n,ok:v.ok,bad:v.bad}])),focusScrollTops:rendering});
   for(const d of p.__dls.slice(n0)){const f=await d.d.path().catch(()=>null);if(f)try{fs.unlinkSync(f)}catch{}}});
  await X.finish(s,rec,'C-'+vp);}
 process.exit(0);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
