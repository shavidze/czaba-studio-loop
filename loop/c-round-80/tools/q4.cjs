const X=require('./h80.cjs');const{L,sleep,st,blur,key,fold,rowKeys,gstate,clickName,clickGroup}=X;const fs=require('fs');const W=require('./wav.cjs');const crypto=require('crypto');
const vp=process.argv[2]||'1440x900';const OUT=`${L.OUT}/q4-${vp}.json`;const rec=X.mkRec(OUT);const T=X.T(rec);const G='ჯგუფი 1';
async function exportWav(p,name){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});
 const dlP=p.waitForEvent('download',{timeout:300000});const t0=Date.now();await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;
 const out=`${L.OUT}/export-${vp}-${name}.wav`;await dl.saveAs(out);await sleep(500);await p.keyboard.press('Escape');await sleep(300);
 const buf=fs.readFileSync(out);return {ms:Date.now()-t0,buf,w:W.parse(buf),sha:crypto.createHash('sha256').update(buf).digest('hex')};}
const meterStart=p=>p.evaluate(()=>{window.__m=[];window.__mi=setInterval(()=>{const e=document.querySelector('[data-testid=arrangement-master-meter]');const pos=document.querySelector('[data-testid=arrangement-position]');window.__m.push([Math.round(performance.now()),e&&e.getAttribute('data-level-db'),pos&&pos.textContent,window.__src.length])},50)});
const meterStop=p=>p.evaluate(()=>{clearInterval(window.__mi);return window.__m});
const db=v=>(!v||v==='-inf')?-120:+v;
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);const S=await X.setup(p);rec('SETUP',S.clips.length===3,{clips:S.clips.map(c=>[c.lane,c.start,c.dur])});
 await X.groupStemsSfx(p);
 const vm=p.locator('[data-track-id=video] button[title=Mute]').first();await vm.click();await sleep(200);const videoMute=await vm.getAttribute('aria-pressed');
 await T('FOLD-AUDIO-LIVE',async()=>{const out={videoMute};await blur(p);await p.keyboard.press('Home');await sleep(200);await meterStart(p);
  await p.keyboard.press('Space');await sleep(1500);const src0=await p.evaluate(()=>window.__src.length);const pos0=await X.posOf(p);const t0=await p.evaluate(()=>performance.now());
  await fold(p,G);out.c1={rows:await rowKeys(p),pos:await X.posOf(p)};await sleep(600);await fold(p,G);out.e1={rows:(await rowKeys(p)).length,pos:await X.posOf(p)};await sleep(400);
  await clickGroup(p,G);await blur(p);await key(p,'u',400);out.uC=(await gstate(p,G)).collapsed;await key(p,'u',400);out.uE=(await gstate(p,G)).collapsed;
  const src1=await p.evaluate(()=>window.__src.length);const pos1=await X.posOf(p);const t1=await p.evaluate(()=>performance.now());
  await blur(p);await p.keyboard.press('Space');await sleep(300);const m=await meterStop(p);const during=m.filter(x=>x[0]>=t0&&x[0]<=t1);const ps=during.map(x=>X.secs(x[2]));
  out.src=[src0,src1];out.pos=[pos0,pos1];out.wallMs=Math.round(t1-t0);out.advance=+(pos1-pos0).toFixed(3);out.posMonotonic=ps.every((v,i)=>i===0||v>=ps[i-1]);
  out.meter={n:during.length,min:Math.min(...during.map(x=>db(x[1]))),max:Math.max(...during.map(x=>db(x[1]))),silent:during.filter(x=>db(x[1])<=-60).length};
  rec('FOLD-AUDIO-LIVE',src0>0&&src1===src0&&out.posMonotonic&&Math.abs(out.advance-out.wallMs/1000)<0.35&&out.meter.silent===0&&out.uC===true&&out.uE===false&&videoMute==='true'&&out.c1.rows.length===3,out);});
 await T('FOLD-AUDIO-HIDDEN-SOUND',async()=>{const out={};const mm=p.locator('[data-track-id=music] button[title=Mute]').first();await mm.click();await sleep(200);out.musicMute=await mm.getAttribute('aria-pressed');
  out.solo=await p.evaluate(()=>[...document.querySelectorAll('button[title^=Solo]')].map(b=>b.getAttribute('aria-pressed')));
  await fold(p,G);out.rows=await rowKeys(p);await blur(p);await p.keyboard.press('Home');await sleep(200);await meterStart(p);await p.keyboard.press('Space');await sleep(5200);await p.keyboard.press('Space');await sleep(200);const m=await meterStop(p);
  const seg=(a,b)=>m.filter(x=>{const t=X.secs(x[2]);return t>=a&&t<b}).map(x=>db(x[1]));const pre=seg(0.3,1.8),stems=seg(2.4,3.9),both=seg(4.2,5.0);
  out.meter={pre:{n:pre.length,max:Math.max(...pre)},stems:{n:stems.length,min:Math.min(...stems),max:Math.max(...stems)},stemsSfx:{n:both.length,min:Math.min(...both),max:Math.max(...both)}};
  // control: also mute nothing else; unmute music, expand
  await mm.click();await sleep(200);await fold(p,G);
  rec('FOLD-AUDIO-HIDDEN-SOUND',out.musicMute==='true'&&out.rows.length===3&&out.solo.every(x=>x==='false')&&out.meter.pre.max<=-60&&out.meter.stems.n>5&&out.meter.stems.min>-60&&out.meter.stemsSfx.min>-60,out);});
 await T('FOLD-AUDIO-EXPORT',async()=>{const out={};await blur(p);await key(p,'Home');
  const e1=await exportWav(p,'expanded');await fold(p,G);out.rows=await rowKeys(p);const e2=await exportWav(p,'collapsed');await fold(p,G);
  const S1=W.stats(e1.w),S2=W.stats(e2.w);out.e1={ms:e1.ms,sha:e1.sha.slice(0,16),fmt:e1.w.fmt,frames:e1.w.frames,seconds:e1.w.seconds,riff:e1.w.riff,stats:S1};out.e2={ms:e2.ms,sha:e2.sha.slice(0,16),fmt:e2.w.fmt,frames:e2.w.frames,seconds:e2.w.seconds,stats:S2};
  out.maxDelta=W.cmp(e1.w,e2.w);out.byteIdentical=e1.sha===e2.sha;const lsb=e1.w.fmt.tag===3?Math.pow(2,-23):1;
  // stems/sfx present in export: RMS in 2-4s window vs 0.5-1.5s (music+video muted? only video muted here)
  rec('FOLD-AUDIO-EXPORT',out.rows.length===3&&e1.w.riff==='RIFF'&&JSON.stringify(e1.w.fmt)===JSON.stringify(e2.w.fmt)&&e1.w.frames===e2.w.frames&&S1.nan===0&&S2.nan===0&&S1.full===S2.full&&Math.abs(S1.rms-S2.rms)<1e-6&&out.maxDelta<=lsb&&S1.rms>0.001,out);});
 await X.finish(s,rec,'Q4-'+vp);})().catch(e=>{console.log('SCRIPT ERROR',e);process.exit(1)});
