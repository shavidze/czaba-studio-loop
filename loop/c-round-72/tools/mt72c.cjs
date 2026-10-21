const L=require('./lib.cjs');const fs=require('fs');const W=require('./wav.cjs');const crypto=require('crypto');
const vp=process.argv[2]||'1440x900';const tag=vp;const sleep=L.sleep;
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok?'PASS ':'FAIL ')+id+' '+JSON.stringify(d));};
const posOf=async p=>{const t=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(t);return m?+m[1]*60+ +m[2]:NaN;};
const undoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const status=p=>p.textContent('[data-testid=arrangement-status]').then(s=>s.trim());
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>({id:e.getAttribute('data-marker-id'),t:e.getAttribute('data-marker-time'),a:e.getAttribute('aria-label'),title:e.getAttribute('title'),r:e.getBoundingClientRect().toJSON(),lab:(()=>{const s=e.querySelector('[data-marker-label]');return s?s.getBoundingClientRect().toJSON():null})()})));
let PPS=40;const getPps=async p=>+/([\d.]+)/.exec(await p.textContent('[data-testid=arrangement-zoom-readout]'))[1];
const rc=async(p,t)=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*PPS,r.top+r.height/2);await sleep(150);};
const addM=async(p,t,name)=>{await rc(p,t);await p.keyboard.press('m');await sleep(120);if(name)await p.keyboard.type(name);await p.keyboard.press('Enter');await sleep(200);};
const blur=p=>p.evaluate(()=>document.activeElement&&document.activeElement.blur());
const flag=(p,t)=>p.locator(`[data-testid=arrangement-marker][data-marker-time="${t}"]`);
async function exportWav(p,name){await blur(p);await p.getByRole('button',{name:'Export',exact:true}).click();await p.waitForSelector('#arrangement-export-title',{timeout:10000});
 const dlP=p.waitForEvent('download',{timeout:240000});await p.getByRole('button',{name:'WAV-ის ექსპორტი'}).click();const dl=await dlP;
 const out=`${L.OUT}/export-${tag}-${name}.wav`;await dl.saveAs(out);await sleep(500);await p.keyboard.press('Escape');await sleep(300);
 const buf=fs.readFileSync(out);return {buf,w:W.parse(buf),sha:crypto.createHash('sha256').update(buf).digest('hex')};}
async function newPage(){const s=await L.open(vp);await L.fresh(s.page);await s.page.click('[data-testid=arrangement-snap-toggle]');const st=await L.setupME(s.page,530);if(st[0]!=='0.000')throw new Error('fixture '+st);return s;}
async function zoomOut(p,maxPps){for(let i=0;i<8&&PPS>maxPps;i++){await p.keyboard.press('-');await sleep(200);PPS=await getPps(p);}}

(async()=>{
 const s=await newPage();const p=s.page;PPS=40;
 const t0=Date.now();
 const e1=await exportWav(p,'nomarkers');
 const st1=W.stats(e1.w);console.log('export1',e1.buf.length,e1.w.fmt,e1.w.seconds,st1,(Date.now()-t0)/1000);
 await zoomOut(p,18);
 await addM(p,12,'one');await addM(p,20,'two');await addM(p,40,'three');
 const mm=await marks(p);
 const e2=await exportWav(p,'markers');const st2=W.stats(e2.w);
 const md=W.cmp(e1.w,e2.w);
 rec('MK-EXPORT-REG',mm.length===3&&e1.w.frames===e2.w.frames&&st1.nan===0&&st2.nan===0&&st1.full===st2.full&&md<=1&&JSON.stringify(e1.w.fmt)===JSON.stringify(e2.w.fmt)&&e1.w.riff==='RIFF',{markers:mm.length,sha:[e1.sha.slice(0,12),e2.sha.slice(0,12)],byteIdentical:e1.sha===e2.sha,frames:[e1.w.frames,e2.w.frames],seconds:[e1.w.seconds,e2.w.seconds],fmt:e1.w.fmt,stats:[st1,st2],maxDelta:md,expectedSeconds:101.352});
 // REG-CHROME
 // BPM 90
 await p.click('[data-testid=arrangement-tempo-input]');await p.keyboard.press('Control+a');await p.keyboard.type('90');await p.keyboard.press('Enter');await sleep(300);
 const bpm=await p.inputValue('[data-testid=arrangement-tempo-input]');await blur(p);
 // ruler click seeks and playhead aligns with readout
 await rc(p,8);const pos=await posOf(p);
 const ph=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-playhead]');const r=document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect();return e?[e.getBoundingClientRect().left,r.left]:null});
 rec('REG-ruler-playhead-bpm',pos===8&&Math.abs(ph[0]-(ph[1]+8*PPS))<=2&&/90/.test(bpm),{pos,ph,expectedX:ph[1]+8*PPS,bpm});
 // Ctrl+L brace
 await blur(p);
 const lane=await p.evaluate(()=>document.querySelector('[data-track-id=music]').getBoundingClientRect().toJSON());const y=lane.top+lane.height*0.75;
 const xa=512+2*PPS,xb=512+6*PPS;
 await p.mouse.move(xa,y);await p.mouse.down();await p.mouse.move((xa+xb)/2,y,{steps:6});await p.mouse.move(xb,y,{steps:6});await p.mouse.up();await sleep(300);
 await blur(p);await p.keyboard.press('Control+l');await sleep(300);
 const brace=p.locator('[data-testid=arrangement-loop-strip] [role=slider], [data-testid=arrangement-loop-strip] button, [data-testid=arrangement-loop-strip] [data-testid]').first();
 const bh=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-loop-strip]');return e.innerHTML.slice(0,300)});
 const bb=await brace.boundingBox();
 let moved=null;
 if(bb){const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;await p.mouse.move(cx,cy);await p.mouse.down();await p.mouse.move(cx+4*PPS,cy,{steps:6});await p.mouse.up();await sleep(300);const bb2=await brace.boundingBox();moved=[bb.x,bb2&&bb2.x];}
 rec('REG-loop-brace',!!bb&&moved&&moved[1]-moved[0]>PPS*2,{bh,bb,moved,st:await status(p)});
 // marquee on lanes selects clips (y offsets): drag empty region across clip in music lane? use stems lane clip after dropping? drag marquee over music clip from empty stems lane
 await blur(p);await p.keyboard.press('Control+l');await sleep(200);
 // dblclick ruler Fit (3 tries)
 let fit=[];for(let i=0;i<3;i++){const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());const before=await getPps(p);await p.mouse.dblclick(r.left+300,r.top+r.height/2);await sleep(400);const after=await getPps(p);fit.push([before,after]);PPS=after;await p.keyboard.press('-');await sleep(200);PPS=await getPps(p);}
 rec('REG-ruler-dblclick-fit',fit.every(f=>f[1]!==f[0]),{fit});
 // REG-KEYS
 await blur(p);await p.keyboard.press('Home');await sleep(100);const h0=await posOf(p);
 await p.keyboard.press('Space');await sleep(700);const sp1=await posOf(p);await p.keyboard.press('Space');await sleep(200);const sp2=await posOf(p);await sleep(300);const sp3=await posOf(p);
 const g0=await p.getAttribute('[data-testid=arrangement-grid-control]','data-snap');await p.keyboard.press('g');await sleep(100);const g1=await p.getAttribute('[data-testid=arrangement-grid-control]','data-snap');await p.keyboard.press('g');
 const d0=await p.getAttribute('[data-testid=arrangement-grid-control]','data-grid-seconds');await p.keyboard.press('2');await sleep(100);const d1=await p.getAttribute('[data-testid=arrangement-grid-control]','data-grid-seconds');await p.keyboard.press('1');await sleep(100);const d2=await p.getAttribute('[data-testid=arrangement-grid-control]','data-grid-seconds');
 // clip selected, plain arrow nudge (focus body)
 await blur(p);await p.locator('[data-clip-id]').first().click({position:{x:200,y:40}});await sleep(150);const cs=await p.evaluate(()=>document.querySelector('[data-clip-id]').getAttribute('data-clip-start'));await p.keyboard.press('ArrowRight');await sleep(200);const cs2=await p.evaluate(()=>document.querySelector('[data-clip-id]').getAttribute('data-clip-start'));
 rec('REG-KEYS',h0===0&&sp1>0.4&&sp2>=sp1&&Math.abs(sp3-sp2)<0.01&&g0!==g1&&d1!==d0&&cs!==cs2,{h0,sp1,sp2,sp3,g0,g1,d0,d1,d2,cs,cs2});
 // Ctrl+Shift+L extends range
 // REG-HYD + net
 const hyd=s.con.filter(l=>/hydrat/i.test(l));
 rec('REG-HYD-NET',hyd.length===0,{hyd:hyd.length,forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).length,auth:s.reqs.filter(r=>r.auth).length,errs:s.con.filter(l=>/error/i.test(l)&&!/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource/.test(l)).slice(0,4)});
 fs.writeFileSync(`${L.OUT}/mt72c-${tag}.json`,JSON.stringify(R,null,1));await s.browser.close();
})().catch(e=>{console.log('SCRIPT ERROR',e);fs.writeFileSync(`${L.OUT}/mt72c-${vp}-err.json`,JSON.stringify({R,e:String(e)}));process.exit(1)});
