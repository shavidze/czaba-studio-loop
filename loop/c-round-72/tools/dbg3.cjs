const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{for(const variant of ['control','marker-focused']){
 const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 const rc=async t=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*40,r.top+14);await sleep(150);};
 await rc(5);await p.keyboard.press('m');await sleep(100);await p.keyboard.press('Enter');await sleep(150);
 if(variant==='control'){await p.evaluate(()=>document.activeElement.blur());}
 await p.locator('[data-clip-id]').first().click({position:{x:300,y:40}});await sleep(150);
 const sel=await p.evaluate(()=>{const c=document.querySelector('[data-clip-id]');return c.outerHTML.slice(0,300)});
 const foc=await p.evaluate(()=>document.activeElement.getAttribute('data-testid')||document.activeElement.tagName);
 await p.keyboard.press('Delete');await sleep(250);
 console.log(variant,'focus',foc,'markers',await p.locator('[data-testid=arrangement-marker]').count(),'clips',await p.locator('[data-clip-id]').count(),(await p.textContent('[data-testid=arrangement-status]')).trim().slice(0,80));
 if(variant==='marker-focused')console.log(sel);
 await s.browser.close();}})();
