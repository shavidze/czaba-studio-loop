// C round 88: keyboard focus during render, variants. node keys88.cjs <vp>
const X=require('./lib88.cjs');const{L,sleep,blur}=X;const fs=require('fs');
const vp=process.argv[2]||'1440x900';const rec=X.mkRec(`${L.OUT}/keys88-${vp}${process.argv[3]||''}.json`);const T=X.T(rec);
const ip=async p=>{const f=await X.focusProbe(p);f.rendering=await p.evaluate(()=>!!document.querySelector('[data-testid=arrangement-export-progress-label]')||[...document.querySelectorAll('button')].some(b=>/მიმდინარეობს/.test(b.textContent)));return f;};
async function run(p,fmtKey,tabs=4){const o={steps:[],during:[]};await X.closeDlg(p).catch(()=>{});await blur(p);await p.getByRole('button',{name:'Export',exact:true}).focus();await p.keyboard.press('Enter');await p.waitForSelector('#arrangement-export-title');await sleep(400);
 let g=0;while(g<12&&!/format/.test((await ip(p)).id||'')){await p.keyboard.press('Tab');await sleep(120);o.steps.push((await ip(p)).id);g++;}
 for(const k of fmtKey){await p.keyboard.press(k);await sleep(150);}o.fmt=(await ip(p)).id;
 g=0;while(g<10&&!/ექსპორტი$/.test((await ip(p)).id||'')){await p.keyboard.press('Tab');await sleep(120);o.steps.push((await ip(p)).id);g++;}o.atBtn=(await ip(p)).id;
 const n0=p.__dls.length;await p.keyboard.press('Enter');await sleep(120);o.afterEnter=await ip(p);for(let i=0;i<tabs;i++){await p.keyboard.press('Tab');await sleep(100);o.during.push(await ip(p));}
 await p.screenshot({path:`${L.OUT}/shots/keys-${o.fmt}-${vp}.png`});
 const t0=Date.now();while(Date.now()-t0<120000&&p.__dls.length===n0)await sleep(200);await sleep(1200);o.files=p.__dls.slice(n0).map(d=>d.fn);
 for(const d of p.__dls.slice(n0)){const f=await d.d.path().catch(()=>null);if(f)try{fs.unlinkSync(f)}catch{}}
 o.summary=o.during.map(d=>`${d.id}|${d.inside?'in':'OUT'}|${d.rendering?'R':'-'}`);return o;}
(async()=>{const only=process.argv[3];if(only==='V5'){/*skip*/}
if(!only){ // V1: round-87 recipe (snap on, range 4-9 on stems), MP3
 {const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await sleep(300);await X.setup(p);await X.setSnap(p,true);await blur(p);const r=await X.rangeDrag(p,'stems',4,9);
  await T('KEYS-V1-range-mp3',async()=>{const o=await run(p,['ArrowDown'],3);o.range=r.range;const escaped=o.during.filter(d=>!d.inside&&d.rendering||!d.inside);rec('KEYS-V1-range-mp3',o.during.every(d=>d.inside),o);});
  await X.finish(s,rec,'K1-'+vp);}
 // V2-V4: 101.702 project scope: mp3, wav (default), both
 {const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await sleep(300);await X.setup(p);await blur(p);
  await T('KEYS-V2-project-wav',async()=>{const o=await run(p,[],4);rec('KEYS-V2-project-wav',o.during.every(d=>d.inside),o);});
  await T('KEYS-V3-project-both',async()=>{const o=await run(p,['ArrowDown','ArrowDown'],4);rec('KEYS-V3-project-both',o.during.every(d=>d.inside),o);});
  await T('KEYS-V4-project-mp3',async()=>{const o=await run(p,['ArrowDown'],4);rec('KEYS-V4-project-mp3',o.during.every(d=>d.inside),o);});
  await X.finish(s,rec,'K2-'+vp);}
} // V5: 5M project (longer WAV render), WAV default
 {const s=await L.open(vp);const p=s.page;X.attachDl(p);await L.fresh(p);await sleep(300);await X.setup(p);await X.fiveMin(p);await X.closeDlg(p);
  await T('KEYS-V5-5m-wav',async()=>{const o=await run(p,[],4);rec('KEYS-V5-5m-wav',o.during.every(d=>d.inside),o);});
  await X.finish(s,rec,'K3-'+vp);}
 process.exit(0);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
