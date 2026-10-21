const L=require('./lib.cjs');const sleep=L.sleep;
(async()=>{const out=[];for(let i=0;i<3;i++){const s=await L.open(process.argv[2]||'1440x900');const p=s.page;await L.fresh(p);await p.click('[data-testid=arrangement-snap-toggle]');await L.setupME(p,530);
 const before=+/([\d.]+)/.exec(await p.textContent('[data-testid=arrangement-zoom-readout]'))[1];
 const r=await p.evaluate(()=>document.querySelector('[data-testid=arrangement-ruler]').getBoundingClientRect().toJSON());
 await p.mouse.dblclick(r.left+300,r.top+r.height/2);await sleep(500);
 const after=+/([\d.]+)/.exec(await p.textContent('[data-testid=arrangement-zoom-readout]'))[1];out.push([before,after]);await s.browser.close();}
 console.log(JSON.stringify(out));require('fs').writeFileSync(L.OUT+'/fit-'+(process.argv[2]||'1440x900')+'.json',JSON.stringify(out));})();
