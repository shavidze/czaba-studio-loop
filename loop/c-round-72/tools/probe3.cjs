const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 await p.click("[data-testid=arrangement-snap-toggle]");console.log(await L.setupME(p,530));
 console.log(await p.textContent('[data-testid=arrangement-project-end]'));
 const g=await p.evaluate(()=>{const g=document.querySelector('[data-testid=arrangement-grid-control]');return [g.getAttribute('data-snap'),g.getAttribute('data-grid-seconds')]});console.log(g);await s.browser.close();})();
