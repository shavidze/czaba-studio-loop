const L=require('./lib.cjs');const sleep=L.sleep;const vp=process.argv[2]||'1440x900';
(async()=>{const s=await L.open(vp);const p=s.page;await L.fresh(p);await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 const lane=await p.evaluate(()=>({m:document.querySelector('[data-track-id=music]').getBoundingClientRect().toJSON(),s:document.querySelector('[data-track-id=stems]').getBoundingClientRect().toJSON()}));
 const x0=700,y0=lane.s.top+30,x1=800,y1=lane.m.top+30;
 await p.mouse.move(x0,y0);await p.mouse.down();await p.mouse.move(750,(y0+y1)/2,{steps:5});await p.mouse.move(x1,y1,{steps:5});await p.mouse.up();await sleep(300);
 const sel=await p.evaluate(()=>document.querySelector('[data-clip-id]').className.includes('ring-brand'));
 const stt=(await p.textContent('[data-testid=arrangement-status]')).trim();
 // ctrl+shift+L extends range: make range then press
 await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
 const y=lane.m.top+lane.m.height*0.75;await p.mouse.move(600,y);await p.mouse.down();await p.mouse.move(650,y,{steps:4});await p.mouse.move(700,y,{steps:4});await p.mouse.up();await sleep(250);
 await p.keyboard.press('Control+Shift+L');await sleep(300);
 console.log(JSON.stringify({vp,marqueeSelected:sel,stt,afterCtrlShiftL:(await p.textContent('[data-testid=arrangement-status]')).trim()}));
 await s.browser.close();})();
