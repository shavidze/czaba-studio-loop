const L=require('./lib.cjs');
(async()=>{const s=await L.open(process.argv[2]||'1440x900');const p=s.page;await L.fresh(p);
const g=()=>p.evaluate(()=>{const s=document.querySelector('[data-testid=arrangement-timeline-scroller]');return{sh:s.scrollHeight,ch:s.clientHeight,st:s.scrollTop}});
const hs=await p.locator('[data-testid=arrangement-track-height]').all();console.log('handles',hs.length,await g());
for(const h of hs){console.log(await h.boundingBox(), await h.getAttribute('aria-label'), await h.getAttribute('aria-valuenow'));}
for(let i=0;i<hs.length;i++){const b=await hs[i].boundingBox();if(!b)continue;await p.mouse.move(b.x+b.width/2,b.y+b.height/2);await p.mouse.down();await p.mouse.move(b.x+b.width/2,Math.min(b.y+200,p.viewportSize().height-2),{steps:10});await p.mouse.up();await L.sleep(200);console.log(i,await g(),await hs[i].getAttribute('aria-valuenow'));}
await s.browser.close();})();
