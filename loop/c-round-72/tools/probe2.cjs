const L=require('./lib.cjs');
(async()=>{const s=await L.open('1440x900');const p=s.page;await L.fresh(p);
 const x=await L.dropME(p);console.log(JSON.stringify(x));
 await p.mouse.move(x.ib.x+30,x.ib.y+10);await p.mouse.down();
 await p.mouse.move(700,400,{steps:8});await p.mouse.move(530,405,{steps:8});await L.sleep(200);await p.mouse.up();await L.sleep(800);
 console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-clip-id]')].map(e=>e.getAttribute('data-clip-start')+' '+e.textContent.trim().slice(0,30))));
 console.log(await p.textContent('[data-testid=arrangement-project-end]'),await p.textContent('[data-testid=arrangement-status]'));
 await p.screenshot({path:L.OUT+'/shots/probe2.png'});await s.browser.close();})();
