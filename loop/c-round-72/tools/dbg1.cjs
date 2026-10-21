const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 const rc=async t=>{const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());await p.mouse.click(r.left+t*40,r.top+14);await sleep(150);};
 const act=()=>p.evaluate(()=>{const a=document.activeElement;return a&&(a.getAttribute('data-testid')||a.tagName)});
 const ed=()=>p.locator('[data-testid=arrangement-marker-name-input]').count();
 await rc(12);await p.keyboard.press('m');await sleep(150);await p.keyboard.type('A');await p.keyboard.press('Enter');await sleep(200);
 console.log('after add focus',await act());
 await rc(30);console.log('after ruler click focus',await act());
 await p.keyboard.press('m');await sleep(200);console.log('editor count',await ed(),'focus',await act(),(await p.textContent('[data-testid=arrangement-status]')).trim());
 // retry with body focus
 await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('m');await sleep(200);console.log('blurred: editor',await ed(),await act());
 await p.keyboard.press('Escape');await sleep(100);
 await rc(30);await p.keyboard.press('m');await sleep(200);console.log('again: editor',await ed(),await act());
 await s.browser.close();})();
