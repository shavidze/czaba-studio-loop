const X = require('./lib122.cjs'); const { L, sleep } = X; const fs=require('fs');
const box=(p,s)=>p.evaluate((s)=>{const e=document.querySelector(s); if(!e) return null; const b=e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)};},s);
(async()=>{ const b=await L.chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required'],ignoreDefaultArgs:['--hide-scrollbars']}); const net=[]; const R={};
for (const w of [1440,1280]) { const r=R[w]={}; const {page:p,ctx}=await L.openStudio(b,X.VPS[w],'p1-'+w,net);
 r.lib0=await box(p,'[data-testid=arrangement-library]'); r.scroller0=await box(p,'[data-testid=arrangement-timeline-scroller]'); r.detail0=await box(p,'[data-testid=arrangement-detail-panel]');
 r.scrollbars=await p.evaluate(()=>{const s=document.querySelector('[data-testid=arrangement-timeline-scroller]'); return {offW:s.offsetWidth,clientW:s.clientWidth,offH:s.offsetHeight,clientH:s.clientHeight,scrollW:s.scrollWidth,scrollH:s.scrollHeight};});
 // library resize by separator drag
 const sep=await box(p,'[data-testid=arrangement-library-separator]');
 await p.mouse.move(sep.x+2,sep.y+300); await p.mouse.down(); await p.mouse.move(sep.x+82,sep.y+300,{steps:8}); await p.mouse.up(); await sleep(300);
 r.libAfterDrag=await box(p,'[data-testid=arrangement-library]'); r.sepAria=await p.evaluate(()=>{const e=document.querySelector('[data-testid=arrangement-library-separator]'); return {role:e.getAttribute('role'),now:e.getAttribute('aria-valuenow'),min:e.getAttribute('aria-valuemin'),max:e.getAttribute('aria-valuemax'),label:e.getAttribute('aria-label')};});
 await X.shot(p,`P1-lib-resized-${w}.png`);
 await p.click('[data-testid=arrangement-library-collapse]'); await sleep(500);
 r.libCollapsed=await box(p,'[data-testid=arrangement-library]'); r.scrollerCollapsed=await box(p,'[data-testid=arrangement-timeline-scroller]');
 await X.shot(p,`P1-lib-collapsed-${w}.png`);
 r.railButtons=await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-library] button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>b.getAttribute('aria-label')||b.textContent.trim()));
 // expand again
 const ex=p.locator('[data-testid=arrangement-library] button').first(); await ex.click(); await sleep(500); r.libReExpanded=await box(p,'[data-testid=arrangement-library]');
 // Ctrl+Alt+B (Live hide/show browser)
 await L.blur(p); await p.keyboard.press('Control+Alt+b'); await sleep(400); r.ctrlAltB=await box(p,'[data-testid=arrangement-library]');
 // detail panel
 const dt=p.locator('[data-testid=arrangement-detail-toggle]'); r.detailExpanded0=await dt.getAttribute('aria-expanded');
 await dt.click(); await sleep(600); r.detailAfterToggle=await box(p,'[data-testid=arrangement-detail-panel]'); r.detailExpanded1=await dt.getAttribute('aria-expanded');
 if (r.detailExpanded1==='false') { await dt.click(); await sleep(600); }
 const ds=await box(p,'[data-testid=arrangement-detail-separator]'); r.detBefore=await box(p,'[data-testid=arrangement-detail-panel]');
 await p.mouse.move(ds.x+400,ds.y+3); await p.mouse.down(); await p.mouse.move(ds.x+400,ds.y-60,{steps:8}); await p.mouse.up(); await sleep(400);
 r.detAfterDrag=await box(p,'[data-testid=arrangement-detail-panel]');
 // track height
 await L.setSnapOff(p); await L.addAt(p,'demo-synth-mix','music',1);
 const th=p.locator('[data-track-id=music] [data-testid=arrangement-track-height]').first(); const thb=await th.boundingBox();
 r.musicRow0=await box(p,'[data-track-id=music]');
 await p.mouse.move(thb.x+600,thb.y+thb.height/2); await p.mouse.down(); await p.mouse.move(thb.x+600,thb.y+50,{steps:8}); await p.mouse.up(); await sleep(400);
 r.musicRowTaller=await box(p,'[data-track-id=music]'); r.sfxRowAfter=await box(p,'[data-track-id=sfx]');
 await X.shot(p,`P1-track-taller-${w}.png`);
 r.undoAfterHeight=await X.undoTitle(p);
 // Alt+= / Alt+- (Live track height keys)
 await p.click(L.nameSel('music')); await sleep(200); await L.blur(p);
 await p.keyboard.press('Alt+Equal'); await sleep(300); r.altPlus=await box(p,'[data-track-id=music]');
 await p.keyboard.press('Alt+Minus'); await sleep(300); r.altMinus=await box(p,'[data-track-id=music]');
 // fold
 await p.click('[data-track-id=music] [data-testid=arrangement-track-fold]'); await sleep(400); r.musicFolded=await box(p,'[data-track-id=music]');
 await X.shot(p,`P1-music-folded-${w}.png`);
 await p.click('[data-track-id=music] [data-testid=arrangement-track-fold]'); await sleep(400); r.musicUnfolded=await box(p,'[data-track-id=music]');
 // U key with track selected
 await p.click(L.nameSel('music')); await sleep(200); await L.blur(p); await p.keyboard.press('u'); await sleep(400); r.uKey=await box(p,'[data-track-id=music]'); r.uStatus=await L.status(p);
 if (r.uKey && r.musicUnfolded && r.uKey.h < r.musicUnfolded.h-10) { await p.keyboard.press('u'); await sleep(300); }
 // selection info
 const c=(await L.clipsDom(p)).find(x=>x.lane==='music'); await L.selectClip(p,c.id); await X.openDetail(p);
 r.selInfo=await L.detailInfo(p); r.selStatus=await L.status(p); r.selReserve=await p.evaluate(()=>(document.querySelector('[data-testid=arrangement-selected-clip-reserve]')||{textContent:'<absent>'}).textContent.trim());
 r.headerLabel=await p.evaluate(()=>(document.querySelector('[data-testid=arrangement-detail-header-label]')||{textContent:'<absent>'}).textContent.trim());
 await X.shot(p,`P1-clip-selected-${w}.png`);
 // time selection info
 await X.rangeDrag(p,c.id,3,5); r.rangeStatus=await L.status(p); r.rangeHeader=await p.evaluate(()=>(document.querySelector('[data-testid=arrangement-detail-header-label]')||{textContent:'<absent>'}).textContent.trim()); r.rangeFields=await p.evaluate(()=>[document.querySelector('[data-testid=arrangement-detail-start]').value,document.querySelector('[data-testid=arrangement-detail-end]').value]);
 await X.shot(p,`P1-range-selected-${w}.png`);
 await ctx.close(); }
fs.writeFileSync('../out/P1.json',JSON.stringify({R,net:X.netOk(net),raw:net},null,1)); console.log(JSON.stringify(R,null,0)); console.log(JSON.stringify(X.netOk(net))); await b.close();})();
