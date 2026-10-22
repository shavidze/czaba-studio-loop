// C round 89: TRAP-WAV / TRAP-MP3 / TRAP-BOTH / PX-KEYS-R2 with HR-RENDERING per press.
// node trap89.cjs <vp> <variant: wav|mp3|both|keys2> [attempt]
const X=require('./lib88.cjs');const{L,sleep,blur}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const variant=process.argv[3]||'wav';const att=process.argv[4]||'1';
const OUTF=`${L.OUT}/trap89-${vp}-${variant}-a${att}.json`;
const probe=p=>p.evaluate(()=>{const t=document.querySelector('#arrangement-export-title');const d=t&&t.closest('[role=dialog]');const a=document.activeElement;
 const btns=d?[...d.querySelectorAll('button')]:[];const busy=btns.find(b=>/მიმდინარეობს/.test(b.textContent));
 let id;const tid=a&&a.getAttribute('data-testid');const al=a&&a.getAttribute('aria-label');const txt=a?(a.textContent||'').trim():'';
 const inside=!!(d&&a&&d.contains(a));
 if(!a||a===document.body)id='BODY';else if(inside&&a.tagName==='BUTTON'&&al==='Close')id='X';else if(tid)id=tid.replace('arrangement-export-','');
 else if(inside&&a.tagName==='BUTTON'&&txt==='დახურვა')id='CloseBtn';else if(inside&&a.tagName==='BUTTON'&&/ექსპორტი$|მიმდინარეობს/.test(txt))id='ExportBtn:'+txt;
 else if(inside&&a.tagName==='DIV'&&a.tabIndex===-1)id='TRAP-WRAPPER';else id=(al||a.tagName+':'+txt.slice(0,20));
 const radios=d?[...d.querySelectorAll('input[type=radio]')].filter(i=>i.checked).map(i=>(i.dataset.testid||'').replace('arrangement-export-','')):[];
 const prog=d&&d.querySelector('[data-testid=arrangement-export-progress]');
 return{id,tag:a&&a.tagName,tabIndex:a?a.tabIndex:null,inside,dialog:!!d,busy:!!busy,busyText:busy?busy.textContent.trim():null,checked:radios,progFocused:!!(prog&&a===prog),
  label:(d&&d.querySelector('[data-testid=arrangement-export-progress-label]')||{}).textContent||null};});
const side=p=>p.evaluate(()=>{const v=document.querySelector('input[aria-label="Master Volume"]');const m=document.querySelector('button[aria-label="Master Mute"]');const pl=document.querySelector('button[aria-label="Play"],button[aria-label="Pause"]');
 return{url:location.href,vol:v?v.value:null,mute:m?(m.getAttribute('aria-pressed')):null,transport:pl?pl.getAttribute('aria-label'):null,pos:(document.querySelector('[data-testid=arrangement-position]')||{}).textContent||null};});
const DELAY=+(process.env.DELAY||20);
async function press(p,key,log){const b=log.__last||await probe(p);await p.keyboard.press(key);await sleep(DELAY);const a=await probe(p);log.__last=a;const r={key,from:b.id,to:a.id,toTag:a.tag,toTabIndex:a.tabIndex,inside:a.inside,beforeBusy:b.busy,afterBusy:a.busy,valid:b.busy&&a.busy,checked:a.checked,label:a.label,progFocused:a.progFocused};log.push(r);return r;}
async function openKbd(p,fmtKeys){const o={steps:[]};await blur(p);await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);
 o.initial=(await probe(p)).id;let g=0;while(g<12&&!/^format-/.test((await probe(p)).id)){await p.keyboard.press('Tab');await sleep(120);o.steps.push((await probe(p)).id);g++;}
 for(const k of fmtKeys){await p.keyboard.press(k);await sleep(150);o.steps.push((await probe(p)).id);}o.fmtFocus=(await probe(p)).id;o.checkedBefore=(await probe(p)).checked;
 g=0;while(g<10&&!/^ExportBtn:/.test((await probe(p)).id)){await p.keyboard.press('Tab');await sleep(120);o.steps.push((await probe(p)).id);g++;}o.atBtn=(await probe(p)).id;return o;}
// expected target after a press, given origin and the checked format radio
function expectNext(r,checkedFmt){if(r.key==='Tab')return r.from==='X'?checkedFmt:'X';return r.from==='X'?checkedFmt:(r.from===checkedFmt||/^format-/.test(r.from))?'X':checkedFmt;}
(async()=>{const s=await L.open(vp);const p=s.page;X.attachDl(p);const res={vp,variant,att};const t0=Date.now();
 try{await L.fresh(p);await sleep(300);res.setup=(await X.setup(p)).clips.map(c=>[c.lane,c.start]);
  let tabs=6,shifts=4,fmtKeys=[];
  if(variant==='keys2'){await X.setSnap(p,true);await blur(p);const r=await X.rangeDrag(p,'stems',4,9);res.range=r.range||null;tabs=3;shifts=0;fmtKeys=['ArrowDown'];}
  else{const fm=await X.fiveMin(p);res.fiveMinScope=fm.txt;await X.closeDlg(p);fmtKeys=variant==='mp3'?['ArrowDown']:variant==='both'?['ArrowDown','ArrowDown']:[];}
  res.sideBefore=await side(p);
  const o=await openKbd(p,fmtKeys);res.open=o;const want={wav:'format-wav',mp3:'format-mp3',both:'format-both',keys2:'format-mp3'}[variant];
  res.fmtOk=o.checkedBefore.includes(want)&&o.atBtn===`ExportBtn:${({wav:'WAV-ის ექსპორტი',mp3:'MP3-ის ექსპორტი',both:'WAV + MP3 ექსპორტი',keys2:'MP3-ის ექსპორტი'})[variant]}`;
  const n0=p.__dls.length;const reqN0=s.reqs.length;res.tEnter=Date.now();
  await X.instrument(p);
  await p.keyboard.press('Enter');await sleep(150);res.afterEnter=await probe(p);
  const log=[];for(let i=0;i<tabs;i++)await press(p,'Tab',log);for(let i=0;i<shifts;i++)await press(p,'Shift+Tab',log);
  await p.screenshot({path:`${L.OUT}/shots/trap-${variant}-${vp}-a${att}.png`});
  res.log=log;res.allValid=log.every(r=>r.valid);res.allInside=log.every(r=>r.inside);
  res.mismatch=log.map((r,i)=>({i,key:r.key,from:r.from,to:r.to,exp:expectNext(r,want)})).filter(x=>x.to!==x.exp);
  res.shiftFromX=log.filter(r=>r.key==='Shift+Tab'&&r.from==='X').map(r=>r.to);
  res.sideDuring=await side(p);
  const t1=Date.now();const need=variant==='both'?2:1;while(Date.now()-t1<240000&&p.__dls.length-n0<need)await sleep(200);await sleep(1500);
  const raw=await X.collect(p);res.focusProg=raw.focusProg;res.statuses=[...new Set(raw.prog.map(r=>r.status).filter(Boolean))];res.phases=[...new Set(raw.prog.map(r=>X.phaseOf(r.label)).filter(Boolean))];
  res.files=p.__dls.slice(n0).map(d=>d.fn);res.dlAfterMs=p.__dls.slice(n0).map(d=>d.t-res.tEnter);
  for(const d of p.__dls.slice(n0)){const out=`${L.OUT}/x-${vp}-${variant}-a${att}-${d.fn}`;await d.d.saveAs(out).catch(()=>{});try{res.fileSize=(res.fileSize||[]).concat(fs.statSync(out).size);if(/\.wav$/.test(d.fn)){const W=require('./wav.cjs');const w=W.parse(fs.readFileSync(out));res.wav={sr:w.fmt.sr,ch:w.fmt.ch,bits:w.fmt.bits,seconds:+w.seconds.toFixed(4),riff:w.riff};}fs.unlinkSync(out);}catch(e){res.saveErr=String(e);}}
  res.sideAfter=await side(p);res.afterDone=await probe(p);
  if(variant==='keys2'){await p.keyboard.press('Escape');await sleep(500);res.afterEscape=await p.evaluate(()=>{const a=document.activeElement;return{tag:a.tagName,label:a.getAttribute('aria-label'),text:(a.textContent||'').trim().slice(0,20),title:a.getAttribute('title'),dialogOpen:!!document.querySelector('#arrangement-export-title'),inToolbar:!!a.closest('[role=toolbar],header,nav')};});}
  const reqs=s.reqs.map(r=>({...r,dt:r.t-res.tEnter}));res.unpkg=reqs.filter(r=>/unpkg\.com/.test(r.url)).map(r=>({u:r.url.replace(/^https:\/\/unpkg\.com/,''),dt:r.dt}));
  res.unpkgBeforeEnter=res.unpkg.filter(r=>r.dt<0).length;res.workers=[];
  res.forbidden=s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url);res.authHdr=s.reqs.filter(r=>r.auth).length;
  res.sideOk=res.sideBefore.url===res.sideAfter.url&&res.sideBefore.vol===res.sideAfter.vol&&res.sideBefore.mute===res.sideAfter.mute&&res.sideDuring.transport==='Play'&&res.sideAfter.transport==='Play';
  const extOk={wav:/\.wav$/,mp3:/\.mp3$/,both:null,keys2:/\.mp3$/}[variant];res.fileOk=variant==='both'?(res.files.some(f=>/\.wav$/.test(f))&&res.files.some(f=>/\.mp3$/.test(f))):res.files.length===1&&extOk.test(res.files[0]);
  res.verdict=!res.allValid?'INVALID':(res.allInside&&res.mismatch.length===0&&res.fmtOk&&res.sideOk&&res.fileOk&&!res.focusProg)?'PASS':'FAIL';
  const hyd=s.con.filter(l=>/hydrat|did not match|server rendered|useLayoutEffect/i.test(l));res.console={hyd,errs:s.con.filter(l=>/\[error\]|pageerror|\[warning\]/.test(l)).slice(0,20)};
 }catch(e){res.error=String(e).slice(0,800);res.verdict='ERROR';}
 res.ms=Date.now()-t0;fs.writeFileSync(OUTF,JSON.stringify(res,null,1));
 console.log(variant,vp,'a'+att,res.verdict,'valid',res.allValid,'inside',res.allInside,'mism',JSON.stringify(res.mismatch),'seq',(res.log||[]).map(r=>`${r.key[0]}:${r.from}>${r.to}${r.valid?'':'!'}`).join(' '),'files',JSON.stringify(res.files),'err',res.error||'');
 await s.browser.close();process.exit(0);})();
