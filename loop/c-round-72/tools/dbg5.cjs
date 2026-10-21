const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 for(let i=0;i<6;i++){await p.keyboard.press('-');await sleep(150);}
 const pps=+/([\d.]+)/.exec(await p.textContent('[data-testid=arrangement-zoom-readout]'))[1];
 const rc=async t=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*pps,r.top+14);await sleep(150);};
 await rc(50);await p.keyboard.press('m');await sleep(100);await p.keyboard.type('ა'.repeat(59));await p.keyboard.press('Enter');await sleep(200);
 await rc(51);await p.keyboard.press('m');await sleep(100);await p.keyboard.type('ბ'.repeat(59));await p.keyboard.press('Enter');await sleep(200);
 console.log(pps,await p.evaluate(()=>[...document.querySelectorAll('[data-testid=arrangement-marker]')].map(e=>e.outerHTML.slice(700))));
 console.log(await p.textContent('[data-testid=arrangement-status]'));
 await p.screenshot({path:L.OUT+'/shots/dbg5.png'});await s.browser.close();})();
