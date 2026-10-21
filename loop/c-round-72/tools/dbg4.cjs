const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 for(let i=0;i<6;i++){await p.keyboard.press('-');await sleep(150);}
 const pps=+/([\d.]+)/.exec(await p.textContent('[data-testid=arrangement-zoom-readout]'))[1];console.log('pps',pps);
 const lane=await p.evaluate(()=>document.querySelector('[data-track-id=music]').getBoundingClientRect().toJSON());
 const x0=512+20*pps,x1=512+25*pps;
 for(const dy of [20,40,65]){
  await p.mouse.move(x0,lane.top+dy);await p.mouse.down();await p.mouse.move((x0+x1)/2,lane.top+dy,{steps:5});await p.mouse.move(x1,lane.top+dy,{steps:5});await p.mouse.up();await sleep(250);
  console.log(dy,(await p.textContent('[data-testid=arrangement-status]')).trim().slice(0,120),await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>e.getAttribute('data-clip-start'))));
 }
 await p.screenshot({path:L.OUT+'/shots/dbg4.png'});await s.browser.close();})();
