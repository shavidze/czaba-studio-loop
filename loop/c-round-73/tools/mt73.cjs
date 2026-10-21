const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok?'PASS ':'FAIL ')+id+' '+JSON.stringify(d));};
const sleep=L.sleep;
const posOf=async p=>{const t=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(t);return m?+m[1]*60+ +m[2]:NaN;};
const undoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const status=p=>p.textContent('[data-testid=arrangement-status]').then(s=>s.trim());
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('data-marker-time')));
const clips=p=>p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>({s:e.getAttribute('data-clip-start'),sel:/ring-brand/.test(e.className)})));
const act=p=>p.evaluate(()=>{const a=document.activeElement;return a?(a.getAttribute('data-testid')||a.tagName)+(a.getAttribute('data-marker-time')?'@'+a.getAttribute('data-marker-time'):''):null});
const PPS=40;
const rulerClick=async(p,t)=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());const vw=p.viewportSize().width;if(r.left+t*PPS>vw-20)throw new Error('rulerClick offscreen '+t);await p.mouse.click(r.left+t*PPS,r.top+r.height/2);await sleep(150);};
const flag=(p,t)=>p.locator(`[data-testid=arrangement-marker][data-marker-time="${t}"]`);
const clipClick=async p=>{await p.locator('[data-clip-id]').first().click({position:{x:200,y:40}});await sleep(200);};
const laneBg=async p=>{const b=await p.evaluate(()=>{const e=document.querySelector('[data-track-id="sfx"] [data-grid-seconds]')||[...document.querySelectorAll('[data-track-id] [data-grid-seconds]')].find(x=>!x.querySelector('[data-clip-id]'));const r=e.getBoundingClientRect();return{x:r.left+600,y:r.top+r.height/2,id:e.closest('[data-track-id]').getAttribute('data-track-id'),hit:(document.elementFromPoint(r.left+600,r.top+r.height/2)||{}).tagName}});await p.mouse.click(b.x,b.y);await sleep(150);return b;};
const NOISE=/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource|fetch failed/;
(async()=>{
 const s=await L.open(vp);const p=s.page;await L.fresh(p);const tag=vp;
 const snap0=await p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');
 await p.click('[data-testid=arrangement-snap-toggle]');
 const st=await L.setupME(p,530);
 rec('F-ME',st.length===1,{starts:st,snapBefore:snap0,snapAfter:await p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed'),end:await p.textContent('[data-testid=arrangement-project-end]')});
 // C73-1 Delete
 await rulerClick(p,5);await p.keyboard.press('m');await sleep(150);const edOpen=await act(p);await p.keyboard.press('Enter');await sleep(250);
 const pre=await act(p);const m0=await marks(p);
 await clipClick(p);const a1=await act(p);const c1=await clips(p);
 await p.keyboard.press('Delete');await sleep(300);
 const m1=await marks(p);const c2=await clips(p);const s1=await status(p);const u1=await undoT(p);
 await p.screenshot({path:`${L.OUT}/shots/c73-1-delete-${tag}.png`});
 rec('C73-1-delete',edOpen==='arrangement-marker-name-input'&&pre==='arrangement-marker@5.000'&&a1!==pre&&c1[0].sel&&c2.length===0&&JSON.stringify(m1)===JSON.stringify(m0)&&s1==='კლიპი წაიშალა; სიცარიელე დარჩა.',{edOpen,pre,afterClipClick:a1,clipBefore:c1,clipsAfter:c2.length,markersBefore:m0,markersAfter:m1,status:s1,undo:u1});
 await p.keyboard.press('Control+z');await sleep(300);const cU=await clips(p);const mU=await marks(p);
 rec('C73-1-undo',cU.length===1&&JSON.stringify(mU)===JSON.stringify(m0),{clips:cU,markers:mU});
 // C73-1 arrow
 await rulerClick(p,8);await p.keyboard.press('m');await sleep(150);await p.keyboard.press('Enter');await sleep(250);
 const pre2=await act(p);const m2=await marks(p);
 await clipClick(p);const a2=await act(p);const cs0=(await clips(p))[0];
 await p.keyboard.press('ArrowRight');await sleep(250);const cs1=(await clips(p))[0];const m3=await marks(p);const a3=await act(p);const s2=await status(p);
 await p.screenshot({path:`${L.OUT}/shots/c73-1-arrow-${tag}.png`});
 rec('C73-1-arrow',pre2==='arrangement-marker@8.000'&&cs0.sel&&cs1.s!==cs0.s&&+cs1.s>+cs0.s&&JSON.stringify(m3)===JSON.stringify(m2)&&!/arrangement-marker@/.test(a3),{pre:pre2,afterClick:a2,start:[cs0.s,cs1.s],markers:[m2,m3],activeAfter:a3,status:s2,undo:await undoT(p)});
 await p.keyboard.press('Control+z');await sleep(250);
 // C73-2 paths
 await flag(p,'5.000').click();await sleep(150);const fa=await act(p);const lb=await laneBg(p);const pa=await act(p);
 await flag(p,'5.000').click();await sleep(150);const fb=await act(p);await rulerClick(p,10);const pb=await act(p);
 await flag(p,'5.000').click();await sleep(150);const fc=await act(p);await flag(p,'8.000').click();await sleep(150);const pc=await act(p);
 const cur=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.getAttribute('aria-current')));
 await flag(p,'5.000').click();await sleep(150);await p.keyboard.press('F2');await sleep(200);const fd=await act(p);
 const ib=await p.locator('[data-testid=arrangement-marker-name-input]').boundingBox();
 await p.mouse.click(ib.x+ib.width/2,ib.y+ib.height/2);await sleep(150);const pd=await act(p);const edStill=await p.locator('[data-testid=arrangement-marker-name-input]').count();
 await p.keyboard.press('Escape');await sleep(200);const afterEsc=await act(p);
 rec('C73-2-paths',fa==='arrangement-marker@5.000'&&pa==='BODY'&&fb==='arrangement-marker@5.000'&&pb==='BODY'&&fc==='arrangement-marker@5.000'&&pc==='arrangement-marker@8.000'&&fd==='arrangement-marker-name-input'&&pd==='arrangement-marker-name-input'&&edStill===1,{a:[fa,pa,lb],b:[fb,pb],c:[fc,pc,cur],d:[fd,pd,edStill],afterEsc,undo:await undoT(p)});
 // MK-DELETE on focused flag
 const cBefore=(await clips(p)).length;
 await flag(p,'5.000').click();await sleep(150);await p.keyboard.press('Delete');await sleep(250);
 const md=await marks(p);const ad=await act(p);const cd=(await clips(p)).length;const sd=await status(p);const ud=await undoT(p);
 rec('MK-DELETE',JSON.stringify(md)==='["8.000"]'&&cd===cBefore&&ad==='arrangement-marker@8.000',{markers:md,active:ad,clips:[cBefore,cd],status:sd,undo:ud});
 await p.keyboard.press('Control+z');await sleep(250);const mdu=await marks(p);
 rec('MK-DELETE-undo',mdu.length===2,{markers:mdu});
 // C73-3 add button + Escape
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
 await rulerClick(p,15);const pAdd=await posOf(p);
 await p.click('[data-testid=arrangement-marker-add]');await sleep(200);const ae=await act(p);await p.keyboard.type('x');await p.keyboard.press('Escape');await sleep(200);
 const aesc=await act(p);const me=await marks(p);const sesc=await status(p);
 rec('C73-3-add-escape',ae==='arrangement-marker-name-input'&&me.length===2&&aesc==='arrangement-marker-add',{pAdd,editorFocus:ae,afterEscape:aesc,markers:me,status:sesc});
 // typing m
 await p.click('[data-testid=arrangement-library-search]');await p.keyboard.type('m');await sleep(200);
 const sv=await p.inputValue('[data-testid=arrangement-library-search]');const edS=await p.locator('[data-testid=arrangement-marker-name-input]').count();
 await p.keyboard.press('Backspace');await sleep(200);
 await p.click('[data-testid=arrangement-tempo-input]');await p.keyboard.type('m');await sleep(200);
 const tv=await p.inputValue('[data-testid=arrangement-tempo-input]');const edT=await p.locator('[data-testid=arrangement-marker-name-input]').count();const mt=await marks(p);
 await p.keyboard.press('Escape');
 rec('C73-3-typing-m',sv==='m'&&edS===0&&edT===0&&mt.length===2,{searchValue:sv,editorFromSearch:edS,tempoValue:tv,editorFromTempo:edT,markers:mt.length});
 // MK-NAV
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.keyboard.press('Home');await sleep(150);
 const nav=[];for(let i=0;i<3;i++){await p.keyboard.press('Control+ArrowRight');await sleep(150);nav.push(await posOf(p));}
 const navB=[];for(let i=0;i<3;i++){await p.keyboard.press('Control+ArrowLeft');await sleep(150);navB.push(await posOf(p));}
 rec('MK-NAV',nav[0]===5&&nav[1]===8&&Math.abs(nav[2]-101.352)<0.01&&navB[0]===8&&navB[1]===5&&navB[2]===0,{nav,navB});
 // MK-ADD-PLAYING
 await p.keyboard.press('Home');await sleep(100);await p.keyboard.press('Space');await sleep(1500);
 const src0=await p.evaluate(()=>window.__src.length);const pA=await posOf(p);await p.keyboard.press('m');const pB=await posOf(p);await sleep(100);await p.keyboard.press('Enter');await sleep(200);
 const src1=await p.evaluate(()=>window.__src.length);const pC=await posOf(p);await sleep(400);const pD=await posOf(p);await p.keyboard.press('Space');
 const mp=await marks(p);const nm=mp.map(Number).find(t=>t>1&&t<3);
 rec('MK-ADD-PLAYING',nm!==undefined&&Math.abs(nm-pA)<=0.15&&src1===src0&&pD>pC,{newMarker:nm,posBeforeM:pA,posAfterM:pB,posAfterEnter:pC,later:pD,srcDelta:src1-src0,markers:mp});
 await p.keyboard.press('Control+z');await sleep(200);
 // REG-KEYS
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
 await p.keyboard.press('Home');await sleep(100);const h0=await posOf(p);
 await p.keyboard.press('Space');await sleep(800);const sp1=await posOf(p);await p.keyboard.press('Space');await sleep(300);const sp2=await posOf(p);await sleep(300);const sp3=await posOf(p);
 await p.keyboard.press('Home');await sleep(150);const h1=await posOf(p);
 const sn0=await p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');await p.keyboard.press('g');await sleep(150);const sn1=await p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');await p.keyboard.press('g');await sleep(150);const sn2=await p.getAttribute('[data-testid=arrangement-snap-toggle]','aria-pressed');
 const gd=()=>p.inputValue('[data-testid=arrangement-grid-division]').catch(()=>null);
 const g0=await gd();await p.keyboard.press('1');await sleep(150);const g1=await gd();await p.keyboard.press('2');await sleep(150);const g2=await gd();
 await clipClick(p);const ca=(await clips(p))[0];await p.keyboard.press('ArrowRight');await sleep(200);const cb=(await clips(p))[0];await p.keyboard.press('ArrowLeft');await sleep(200);const cc=(await clips(p))[0];
 rec('REG-KEYS-basic',h0===0&&sp1>0.3&&sp2===sp3&&h1===0&&sn1!==sn0&&sn2===sn0&&g1!==g0&&g2===g0&&+cb.s>+ca.s&&cc.s===ca.s,{home:[h0,h1],space:[sp1,sp2,sp3],snap:[sn0,sn1,sn2],grid:[g0,g1,g2],nudge:[ca.s,cb.s,cc.s],active:await act(p)});
 // range by drag on clip body, then Ctrl+Shift+L, C73-4c
 const cbx=await p.locator('[data-clip-id]').first().boundingBox();
 const rl=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left);
 await p.mouse.move(rl+12*PPS,cbx.y+40);await p.mouse.down();await p.mouse.move(rl+14*PPS,cbx.y+40,{steps:6});await p.mouse.move(rl+16*PPS,cbx.y+40,{steps:6});await p.mouse.up();await sleep(250);
 const rg0=await p.textContent('[data-testid=arrangement-range]').catch(()=>null);
 await p.keyboard.press('Control+Shift+L');await sleep(200);const all=await p.locator('[data-testid=arrangement-range-all-lanes]').count();
 rec('REG-KEYS-ctrl-shift-L',!!rg0&&all===1,{range:rg0,allLanes:all});
 await rulerClick(p,17);const posR=await posOf(p);await p.keyboard.press('m');await sleep(150);const nv=await p.inputValue('[data-testid=arrangement-marker-name-input]').catch(()=>null);await p.keyboard.press('Enter');await sleep(250);
 const mr=await marks(p);const rg1=await p.textContent('[data-testid=arrangement-range]').catch(()=>null);
 const rs=rg0?/(\d+):(\d+\.\d+)/.exec(rg0):null;const rstart=rs?(+rs[1]*60+ +rs[2]).toFixed(3):null;
 rec('C73-4c-range-after-M',posR===17&&mr.includes(rstart)&&!mr.includes('17.000')&&!!rg1,{rulerPos:posR,rangeStart:rstart,markers:mr,rangeAfter:rg1,defaultName:nv});
 await p.keyboard.press('Escape');await sleep(150);await p.keyboard.press('Escape');await sleep(150);
 // R33/R34 class: fader click -> clip click -> Delete
 const fader=p.locator('[data-track-id="music"] input[type=range][aria-label^="Volume"]').first();
 const fcount=await fader.count();let fa1=null;
 if(fcount){await fader.click();await sleep(150);fa1=await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('aria-label'));}
 await clipClick(p);const afc=await act(p);const nB=(await clips(p)).length;await p.keyboard.press('Delete');await sleep(300);const nA=(await clips(p)).length;const sf=await status(p);const mf=await marks(p);
 rec('REG-KEYS-fader-clip-delete',fcount===1&&/Volume/.test(fa1||'')&&nB===1&&nA===0&&mf.length===mr.length,{faderFocused:fa1,afterClipClick:afc,clips:[nB,nA],status:sf,markers:mf});
 await p.screenshot({path:`${L.OUT}/shots/end-${tag}.png`});
 const hyd=s.con.filter(l=>/hydrat|did not match|server rendered/i.test(l));
 rec('REG-HYD',hyd.length===0,{hyd,errs:s.con.filter(l=>/\[error\]|pageerror/.test(l)&&!NOISE.test(l)).slice(0,8)});
 rec('NET',true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).map(r=>r.url),auth:s.reqs.filter(r=>r.auth).length});
 fs.writeFileSync(`${L.OUT}/mt73-${tag}.json`,JSON.stringify(R,null,1));
 await s.browser.close();
})().catch(e=>{console.log('SCRIPT ERROR',e);fs.writeFileSync(`${L.OUT}/mt73-${vp}-err.json`,JSON.stringify({R,e:String(e)}));process.exit(1)});
