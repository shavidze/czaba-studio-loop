const L=require('./lib.cjs');const fs=require('fs');
const vp=process.argv[2]||'1440x900';const only=process.argv[3]||'all';
const R=[];const rec=(id,ok,d)=>{R.push({id,ok,d});console.log((ok?'PASS ':'FAIL ')+id+' '+JSON.stringify(d));};
const sleep=L.sleep;
const posOf=async p=>{const t=await p.textContent('[data-testid=arrangement-position]');const m=/(\d+):(\d+\.\d+)/.exec(t);return m?+m[1]*60+ +m[2]:NaN;};
const undoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Undo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const redoT=p=>p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^Redo/.test(x.getAttribute('title')||''));return b&&b.getAttribute('title')});
const status=p=>p.textContent('[data-testid=arrangement-status]').then(s=>s.trim());
const marks=p=>p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>({id:e.getAttribute('data-marker-id'),t:e.getAttribute('data-marker-time'),a:e.getAttribute('aria-label'),title:e.getAttribute('title'),cur:e.getAttribute('aria-current'),r:e.getBoundingClientRect().toJSON()})));
let PPS=40;const getPps=async p=>{const z=await p.textContent('[data-testid=arrangement-zoom-readout]');return +/([\d.]+)/.exec(z)[1]};
const rulerClick=async(p,t)=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*PPS,r.top+r.height/2);await sleep(150);};
const srcCount=p=>p.evaluate(()=>window.__src.length);
(async()=>{
 const s=await L.open(vp);const p=s.page;await L.fresh(p);
 const tag=vp;
 await p.click('[data-testid=arrangement-snap-toggle]');
 const st=await L.setupME(p,530);
 const pend=await p.textContent('[data-testid=arrangement-project-end]');
 rec('F-ME',st[0]==='0.000',{starts:st,end:pend});
 const hyd=s.con.filter(l=>/hydrat/i.test(l));
 // layout
 const lay=await p.evaluate(()=>{const g=n=>document.querySelector(`[data-testid=${n}]`).getBoundingClientRect().toJSON();return{row:g('arrangement-marker-row'),tempo:g('arrangement-tempo-input'),loop:g('arrangement-loop-strip'),ruler:g('arrangement-ruler'),strip:g('arrangement-marker-strip'),lane:document.querySelector('[data-track-id=video]').getBoundingClientRect().toJSON()}});
 rec('MK-LAYOUT-basic',Math.abs(lay.row.height-20)<1.01&&lay.row.top>lay.ruler.bottom-1&&lay.row.bottom<=lay.loop.top+1&&lay.row.bottom<=lay.lane.top,{row:[lay.row.top,lay.row.height],loop:lay.loop.top,lane:lay.lane.top,ruler:lay.ruler.bottom});
 // MK-ADD
 await rulerClick(p,12);let pos=await posOf(p);
 const u0=await undoT(p);
 await p.keyboard.press('m');await sleep(150);
 const inp=p.locator('[data-testid=arrangement-marker-name-input]');
 const foc=await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('data-testid'));
 const val0=await inp.inputValue().catch(()=>null);
 await p.screenshot({path:`${L.OUT}/shots/add-editor-${tag}.png`});
 await p.keyboard.type('აქ შედის მუსიკა');await p.keyboard.press('Enter');await sleep(250);
 let m=await marks(p);const rr=await p.evaluate(()=>({ruler:document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().left,strip:document.querySelector('[data-testid=arrangement-marker-strip]').getBoundingClientRect().left}));
 const u1=await undoT(p);
 const fx=m[0]?m[0].r.left-(rr.ruler+12*40):null;
 rec('MK-ADD',pos===12&&foc==='arrangement-marker-name-input'&&val0==='Marker 1'&&m.length===1&&m[0].t==='12.000'&&/აქ შედის მუსიკა/.test(m[0].a)&&/Add Marker/.test(u1)&&Math.abs(fx)<=1.5,{pos,foc,val0,marks:m.map(x=>[x.t,x.a,x.title]),fx,u0,u1,st:await status(p),rulerLeft:rr});
 await p.screenshot({path:`${L.OUT}/shots/add-done-${tag}.png`});
 const actAfter=await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('data-testid'));
 await p.keyboard.press('Control+z');await sleep(200);let m2=await marks(p);const ut=await undoT(p);
 await p.keyboard.press('Control+y');await sleep(200);let m3=await marks(p);
 rec('MK-ADD-undoredo',m2.length===0&&m3.length===1&&m3[0].t==='12.000',{afterUndo:m2.length,afterRedo:m3.length,undoTitleAfterUndo:ut,redoTitleBefore:null,focusAfterEnter:actAfter});
 if(only==='add'){await s.browser.close();return;}
 // MK-DUP
 await rulerClick(p,12);await p.keyboard.press('m');await sleep(200);
 const dupEd=await p.locator('[data-testid=arrangement-marker-name-input]').count();const dupSt=await status(p);const dupFoc=await p.evaluate(()=>document.activeElement&&document.activeElement.getAttribute('data-testid'));m=await marks(p);
 rec('MK-DUP',dupEd===0&&/აქ შედის მუსიკა/.test(dupSt)&&m.length===1&&dupFoc==='arrangement-marker',{dupEd,dupSt,dupFoc,n:m.length});
 for(let i=0;i<6&&PPS>18;i++){await p.keyboard.press('-');await sleep(200);PPS=await getPps(p);}
 console.log('PPS',PPS);
 // MK-ESC
 await rulerClick(p,30);const uE=await undoT(p);await p.keyboard.press('m');await sleep(150);await p.keyboard.type('zzz');await p.keyboard.press('Escape');await sleep(200);
 m=await marks(p);const uE2=await undoT(p);const stE=await status(p);
 rec('MK-ESC',m.length===1&&uE===uE2&&/მარკერი არ დაემატა/.test(stE),{n:m.length,uE,uE2,stE,focusAfter:await p.evaluate(()=>document.activeElement&&(document.activeElement.getAttribute('data-testid')||document.activeElement.tagName))});
 // add 20 and 40 via M
 for(const [t,n] of [[20,'მეორე'],[40,'მესამე']]){await rulerClick(p,t);await p.keyboard.press('m');await sleep(120);await p.keyboard.type(n);await p.keyboard.press('Enter');await sleep(200);}
 m=await marks(p);rec('MK-ADD-more',m.map(x=>x.t).join()==='12.000,20.000,40.000',{t:m.map(x=>x.t)});
 // MK-JUMP
 await p.keyboard.press('Home');await sleep(100);
 const flag=id=>p.locator(`[data-testid=arrangement-marker][data-marker-time="${id}"]`);
 await flag('12.000').click();await sleep(200);const j1=await posOf(p);
 await p.keyboard.press('Space');await sleep(300);const j1p=await posOf(p);await sleep(1500);
 await flag('20.000').click();await sleep(200);const j2=await posOf(p);await sleep(500);const j3=await posOf(p);
 await p.keyboard.press('Space');await sleep(200);
 rec('MK-JUMP',Math.abs(j1-12)<0.002&&j2>=20&&j2<20.5&&j3>j2,{j1,j1p,j2,j3});
 // MK-PLAYFROM real audio
 await p.keyboard.press('Home');await sleep(200);
 const meterSel='[data-testid=arrangement-master-meter]';
 const mhtml=await p.evaluate(s=>{const e=document.querySelector(s);return e.outerHTML.slice(0,400)},meterSel);
 await p.evaluate(()=>{window.__m=[];window.__mi=setInterval(()=>{const e=document.querySelector('[data-testid=arrangement-master-readout]');const pk=document.querySelector('[data-testid=arrangement-master-peak]');window.__m.push([performance.now(),e&&e.textContent,pk&&pk.textContent,document.querySelector('[data-testid=arrangement-master-meter]').getAttribute('data-level-db')])},50)});
 const b=await flag('12.000').boundingBox();
 const t0=await p.evaluate(()=>performance.now());
 await p.mouse.dblclick(b.x+b.width/2,b.y+b.height/2);await sleep(1000);const pf=await posOf(p);
 const mm=await p.evaluate(()=>{clearInterval(window.__mi);return window.__m});
 await p.keyboard.press('Space');
 const vals=mm.map(x=>[Math.round(x[0]-0),x[3]]);
 const rise=mm.filter(x=>x[0]>t0&&x[0]<t0+600&&x[3]!=='-inf'&&+x[3]>-30).length;const pre=mm.filter(x=>x[0]<t0&&x[3]!=='-inf'&&+x[3]>-30).length;rec('MK-PLAYFROM',pf>12.8&&pf<13.3&&rise>0&&pre===0,{pf,rise,pre,maxlevel:Math.max(...mm.filter(x=>x[3]!=='-inf').map(x=>+x[3])),n:mm.length});
 fs.writeFileSync(`${L.OUT}/meter-${tag}.json`,JSON.stringify({t0,mm}));
 // MK-NAV
 await p.keyboard.press('Home');await sleep(150);await p.keyboard.press('Home');
 const seq=[];const sts=[];
 for(let i=0;i<5;i++){await p.keyboard.press('Control+ArrowRight');await sleep(120);seq.push(await posOf(p));sts.push(await status(p));}
 const seqB=[];for(let i=0;i<5;i++){await p.keyboard.press('Control+ArrowLeft');await sleep(120);seqB.push(await posOf(p));}
 const stB=await status(p);
 const seqBtn=[];for(let i=0;i<5;i++){await p.click('[data-testid=arrangement-marker-next]');await sleep(120);seqBtn.push(await posOf(p));}
 const stBtnN=await status(p);
 const seqBtnB=[];for(let i=0;i<5;i++){await p.click('[data-testid=arrangement-marker-prev]');await sleep(120);seqBtnB.push(await posOf(p));}
 await p.keyboard.press('Home');await sleep(100);await p.keyboard.press('Space');await sleep(500);await p.keyboard.press('Control+ArrowRight');await sleep(300);const pp=await posOf(p);await sleep(400);const pp2=await posOf(p);await p.keyboard.press('Space');
 rec('MK-NAV',JSON.stringify(seq.slice(0,3))==='[12,20,40]'&&Math.abs(seq[3]-101.352)<0.01&&seq[4]===seq[3]&&JSON.stringify(seqB.slice(0,4).map(x=>Math.round(x)))==='[40,20,12,0]'&&seqB[4]===0&&JSON.stringify(seqBtn.slice(0,3))==='[12,20,40]'&&pp>=12&&pp<12.6&&pp2>pp,{seq,sts:sts.slice(3),seqB,stB,seqBtn,stBtnN,seqBtnB,pp,pp2});
 // MK-RENAME
 await flag('20.000').click();await sleep(100);await p.keyboard.press('F2');await sleep(150);
 const rv=await p.locator('[data-testid=arrangement-marker-name-input]').inputValue();
 await p.keyboard.press('Control+a');await p.keyboard.type('რეკლამა');await p.keyboard.press('Enter');await sleep(200);
 let mr=await marks(p);const ur=await undoT(p);
 await flag('20.000').focus();await p.keyboard.press('F2');await sleep(100);await p.keyboard.type('qqq');await p.keyboard.press('Escape');await sleep(200);
 const mr2=await marks(p);const ur2=await undoT(p);
 await flag('20.000').focus();await p.keyboard.press('F2');await sleep(100);await p.keyboard.press('Control+a');await p.keyboard.press('Delete');await p.keyboard.press('Enter');await sleep(200);
 const mr3=await marks(p);const ur3=await undoT(p);const sr3=await status(p);
 rec('MK-RENAME',rv==='მეორე'&&/რეკლამა/.test(mr[1].a)&&/Rename Marker/.test(ur)&&/რეკლამა/.test(mr2[1].a)&&ur2===ur&&mr3.length===3&&/რეკლამა/.test(mr3[1].a)&&/სახელი ცარიელია/.test(sr3),{rv,a1:mr[1].a,ur,a2:mr2[1].a,ur2,n3:mr3.length,a3:mr3[1].a,ur3,sr3});
 // MK-DELETE: need a clip selected
 const clipSel='[data-clip-id]';
 await p.locator(clipSel).first().click({position:{x:300,y:40}});await sleep(150);
 const cs0=await p.evaluate(()=>{const c=document.querySelector('[data-clip-id]');return[c.getAttribute('data-clip-start'),c.getAttribute('data-clip-end'),c.getAttribute('aria-selected')||c.getAttribute('data-selected')||c.className.slice(0,0)]});
 await flag('40.000').click();await sleep(100);await p.keyboard.press('Delete');await sleep(200);
 const md=await marks(p);const cnt=await p.locator(clipSel).count();
 const cs1=await p.evaluate(()=>{const c=document.querySelector('[data-clip-id]');return c&&[c.getAttribute('data-clip-start'),c.getAttribute('data-clip-end')]});
 const sdel=await status(p);const udel=await undoT(p);
 const selKept=await p.evaluate(()=>{const d=document.querySelector('[data-testid=arrangement-detail-start]');return d&&d.value});
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.locator(clipSel).first().click({position:{x:300,y:40}});await sleep(100);await p.keyboard.press('Delete');await sleep(250);
 const cnt2=await p.locator(clipSel).count();const md2=await marks(p);
 rec('MK-DELETE',md.length===2&&cnt===1&&JSON.stringify(cs1)===JSON.stringify([cs0[0],cs0[1]])&&cnt2===0&&md2.length===2,{md:md.map(x=>x.t),cnt,cs0,cs1,sdel,udel,detailStartAfterMarkerDelete:selKept,cnt2,md2:md2.map(x=>x.t)});
 await p.screenshot({path:`${L.OUT}/shots/after-delete-${tag}.png`});
 rec('NET',true,{forbidden:s.reqs.filter(r=>/\/api\/studio-token|\/api\/recording-|\/api\/download|r2\.cloudflarestorage|r2\.dev|r2-proxy|workers\.dev/.test(r.url)).length,auth:s.reqs.filter(r=>r.auth).length,hyd:hyd.length,errs:s.con.filter(l=>/error|pageerror/.test(l)&&!/ERR_CONNECTION|Failed to load cart|ERR_TUNNEL|Failed to load resource/.test(l)).slice(0,5)});
 fs.writeFileSync(`${L.OUT}/mt72-${tag}-${only}.json`,JSON.stringify(R,null,1));
 await s.browser.close();
})().catch(e=>{console.log('SCRIPT ERROR',e);fs.writeFileSync(`${L.OUT}/mt72-${vp}-err.json`,JSON.stringify({R,e:String(e)}));process.exit(1)});
