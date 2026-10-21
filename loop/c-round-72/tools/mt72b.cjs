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
 // ---- session 1: range add, playing add, cut time, layout, typing, deviations
 let s=await newPage();let p=s.page;PPS=40;
 await zoomOut(p,18);console.log('PPS',PPS);
 if(process.env.RANGE){
 // MK-ADD-RANGE
 const lane=await p.evaluate(()=>document.querySelector('[data-track-id=music]').getBoundingClientRect().toJSON());
 const y=lane.top+lane.height*0.75;const x0=512+20*PPS,x1=512+25*PPS;
 await p.mouse.move(x0,y);await p.mouse.down();await p.mouse.move((x0+x1)/2,y,{steps:6});await p.mouse.move(x1,y,{steps:6});await p.mouse.up();await sleep(300);
 const stR=await status(p);
 await blur(p);
 await p.click('[data-testid=arrangement-marker-add]');await sleep(200);
 const dv=await p.locator('[data-testid=arrangement-marker-name-input]').inputValue().catch(()=>null);
 await p.keyboard.press('Enter');await sleep(250);
 let m=await marks(p);
 rec('MK-ADD-RANGE',m.length===1&&m[0].t==='20.000'&&/^Marker 1$|«Marker 1»/.test(m[0].a),{stR,default:dv,marks:m.map(x=>[x.t,x.a])});
 await p.screenshot({path:`${L.OUT}/shots/range-add-${tag}.png`});
 // clear range: Escape? create other markers
 await p.keyboard.press('Escape');

 await s.browser.close();fs.writeFileSync(`${L.OUT}/mt72b-${tag}-range.json`,JSON.stringify(R,null,1));return;}
 const lane1=(await p.evaluate(()=>document.querySelector('[data-track-id=music]').getBoundingClientRect().toJSON()));const y=lane1.top+lane1.height*0.75;
 await addM(p,12,'a');await addM(p,20,'b');
 await addM(p,40,'c');
 m=await marks(p);rec('setup-markers',m.map(x=>x.t).join()==='12.000,20.000,40.000',{t:m.map(x=>x.t),stAfter:await status(p)});
 await p.screenshot({path:`${L.OUT}/shots/markers3-${tag}.png`});
 // MK-ADD-PLAYING
 await p.evaluate(()=>{window.__src.length=0});await p.keyboard.press('Home');await sleep(150);
 await p.keyboard.press('Space');await sleep(4900);
 const samples=[];let stopS=false;const sampler=(async()=>{while(!stopS){samples.push([Date.now(),await posOf(p)]);await sleep(100)}})();
 const posAtM=await posOf(p);const tM=Date.now();const srcBefore=await p.evaluate(()=>window.__src.length);const srcT0=await p.evaluate(()=>performance.now());
 await p.keyboard.press('m');await sleep(150);await p.keyboard.type('x');await p.keyboard.press('Enter');await sleep(500);
 const srcAfter=await p.evaluate(()=>window.__src.length);
 await sleep(400);stopS=true;await sampler;
 await p.keyboard.press('Space');await sleep(200);
 m=await marks(p);const nm=m.find(x=>/«x»/.test(x.a));
 let mono=true;for(let i=1;i<samples.length;i++)if(samples[i][1]<samples[i-1][1])mono=false;
 rec('MK-ADD-PLAYING',!!nm&&Math.abs(+nm.t-posAtM)<=0.2&&mono&&srcAfter===srcBefore,{posAtM,markerT:nm&&nm.t,mono,nsamples:samples.length,srcBefore,srcAfter});
 // delete + rename while playing no resync
 await p.keyboard.press('Home');await sleep(100);await p.keyboard.press('Space');await sleep(1200);
 const sb=await p.evaluate(()=>window.__src.length);
 await flag(p,nm.t).focus();await p.keyboard.press('F2');await sleep(100);await p.keyboard.type('yy');await p.keyboard.press('Enter');await sleep(300);
 await flag(p,nm.t).focus();await p.keyboard.press('Delete');await sleep(600);
 const sa=await p.evaluate(()=>window.__src.length);const pn=await posOf(p);await p.keyboard.press('Space');
 rec('MK-NO-RESYNC-rename-delete',sa===sb,{sb,sa,pn});
 // MK-CUT-TIME
 await blur(p);m=await marks(p);
 const clipsBefore=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>[e.getAttribute('data-clip-start'),e.style.width,e.style.left]));
 const xa=512+15*PPS,xb=512+25*PPS;
 await p.mouse.move(xa,y);await p.mouse.down();await p.mouse.move((xa+xb)/2,y,{steps:6});await p.mouse.move(xb,y,{steps:6});await p.mouse.up();await sleep(300);
 const stRg=await status(p);
 await p.keyboard.press('Control+Shift+x');await sleep(400);
 const mc=await marks(p);const stC=await status(p);const clipsAfter=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>[e.getAttribute('data-clip-start'),e.style.left,e.style.width]));
 const uc=await undoT(p);
 await p.keyboard.press('Control+z');await sleep(400);const mu=await marks(p);const clipsUndo=await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>[e.getAttribute('data-clip-start'),e.style.left,e.style.width]));
 rec('MK-CUT-TIME',mc.map(x=>x.t).join()==='12.000,30.000'&&/1 მარკერი წაიშალა\.$/.test(stC)&&mu.map(x=>x.t).join()==='12.000,20.000,40.000'&&clipsUndo[0][0]===clipsBefore[0][0]&&clipsUndo[0][2]===clipsBefore[0][1]&&clipsUndo.length===1,{stRg,stC,uc,after:mc.map(x=>x.t),clipsBefore,clipsAfter,undo:mu.map(x=>x.t),clipsUndo});
 await p.keyboard.press('Control+y');await sleep(300);const mr=await marks(p);
 rec('MK-CUT-TIME-redo',mr.map(x=>x.t).join()==='12.000,30.000',{t:mr.map(x=>x.t)});
 await p.keyboard.press('Control+z');await sleep(300);
 // MK-TYPING
 const before=(await marks(p)).length;
 await p.click('[data-testid=arrangement-library-search]');await p.keyboard.type('m');
 const sv=await p.inputValue('[data-testid=arrangement-library-search]');const ed1=await p.locator('[data-testid=arrangement-marker-name-input]').count();
 await p.click('[data-testid=arrangement-tempo-input]');await p.keyboard.type('m');await p.keyboard.press('Escape');
 const ed2=await p.locator('[data-testid=arrangement-marker-name-input]').count();const bpmv=await p.inputValue('[data-testid=arrangement-tempo-input]');
 rec('MK-TYPING',sv==='m'&&ed1===0&&ed2===0&&(await marks(p)).length===before,{sv,ed1,ed2,bpmv,before,after:(await marks(p)).length});
 // typing in tempo with ctrl+arrow
 await p.click('[data-testid=arrangement-tempo-input]');const pb=await posOf(p);await p.keyboard.press('Control+ArrowRight');await sleep(150);const pa=await posOf(p);
 rec('MK-CTRLARROW-in-text',pa===pb,{pb,pa});
 await blur(p);
 // D1: type name then ruler click
 await rc(p,30);await p.keyboard.press('m');await sleep(120);await p.keyboard.type('D1 name');
 const udb=await undoT(p);await rc(p,35);await sleep(300);
 m=await marks(p);const d1=m.find(x=>/D1 name/.test(x.a));
 rec('D1-blur-ruler-commits',!!d1,{d1:d1&&d1.t,pos:await posOf(p),focus:await p.evaluate(()=>document.activeElement.getAttribute('data-testid')||document.activeElement.tagName),udb,uda:await undoT(p)});
 // D2: type then click library search
 await rc(p,25);await p.keyboard.press('m');await sleep(120);await p.keyboard.type('D2 name');
 await p.click('[data-testid=arrangement-library-search]');await sleep(300);
 m=await marks(p);const d2=m.find(x=>/D2 name/.test(x.a));
 rec('D2-blur-search-commits',!!d2&&(await p.evaluate(()=>document.activeElement.getAttribute('data-testid')))==='arrangement-library-search',{d2:d2&&d2.t});
 await blur(p);
 // MK-LAYOUT: long names 1 s apart
 await rc(p,44);await p.keyboard.press('m');await sleep(100);await p.keyboard.type('L'.repeat(1)+'ა'.repeat(59));await p.keyboard.press('Enter');await sleep(200);
 await rc(p,45);await p.keyboard.press('m');await sleep(100);await p.keyboard.type('B'+'ბ'.repeat(59));await p.keyboard.press('Enter');await sleep(200);
 m=await marks(p);const a50=m.find(x=>x.t==='44.000'),a51=m.find(x=>x.t==='45.000');
 const rowH=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-marker-row]').getBoundingClientRect().height);
 const lab=(x)=>x&&x.lab;
 const overl=a50&&a51&&a50.lab&&a51.lab?(a50.r.left+a50.r.width>a51.r.left+0.5):null;
 const bb=(x)=>x&&x.r;
 rec('MK-LAYOUT',!!a50&&!!a51&&rowH===20&&overl===false&&a50.title.includes('ა'.repeat(59)),{a50:a50&&[a50.r.left,a50.r.width,a50.lab],a51:a51&&[a51.r.left,a51.r.width,a51.lab],rowH,overl,titleHasFull:a50&&a50.title.includes('ა'.repeat(59))});
 await p.screenshot({path:`${L.OUT}/shots/layout-${tag}.png`});
 // vertical scroll keeps y; horizontal scroll moves
 const rowY0=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-marker-row]').getBoundingClientRect().top);
 await p.evaluate(()=>{const sc=document.querySelector('[data-testid=arrangement-timeline-scroller]');sc.scrollTop=200;sc.scrollLeft=100});await sleep(250);
 const sc=await p.evaluate(()=>{const sc=document.querySelector('[data-testid=arrangement-timeline-scroller]');return {st:sc.scrollTop,sl:sc.scrollLeft,maxT:sc.scrollHeight-sc.clientHeight,row:document.querySelector('[data-testid=arrangement-marker-row]').getBoundingClientRect().top,fl:document.querySelector('[data-testid=arrangement-marker][data-marker-time="12.000"]').getBoundingClientRect().left,rl:document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left}});
 rec('MK-LAYOUT-scroll',Math.abs(sc.row-rowY0)<=1&&Math.abs(sc.fl-(sc.rl+12*PPS))<=1.5,{rowY0,sc,PPS,note:'vertical scrollable only if maxT>0'});
 fs.writeFileSync(`${L.OUT}/mt72b-${tag}-s1.json`,JSON.stringify(R,null,1));
 await s.browser.close();
 console.log('SESSION1 DONE');
})().catch(e=>{console.log('SCRIPT ERROR',e);fs.writeFileSync(`${L.OUT}/mt72b-${vp}-err.json`,JSON.stringify({R,e:String(e)}));process.exit(1)});
