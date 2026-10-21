const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 const rc=async t=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*40,r.top+14);await sleep(150);};
 const act=()=>p.evaluate(()=>{const a=document.activeElement;return a&&(a.getAttribute('data-testid')||a.tagName)});
 const nm=()=>p.locator('[data-testid=arrangement-marker]').count();
 const nc=()=>p.locator('[data-clip-id]').count();
 for(const t of [5,10]){await rc(t);await p.keyboard.press('m');await sleep(100);await p.keyboard.press('Enter');await sleep(150);}
 console.log('markers',await nm(),'focus',await act());
 await p.locator('[data-clip-id]').first().click({position:{x:300,y:40}});await sleep(150);
 console.log('after clip click focus',await act(),'sel status',(await p.textContent('[data-testid=arrangement-status]')).trim());
 await p.keyboard.press('Delete');await sleep(250);
 console.log('after Delete: markers',await nm(),'clips',await nc(),(await p.textContent('[data-testid=arrangement-status]')).trim());
 // variant: click lane empty area
 await s.browser.close();})();
