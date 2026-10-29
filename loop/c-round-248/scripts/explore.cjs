const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto(process.argv[2]+'/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await sleep(800);
const d=await p.evaluate(()=>{const bb=(e)=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
return {clips:[...document.querySelectorAll('[data-clip-id]')].map(c=>({id:c.dataset.clipId,start:c.dataset.clipStart,box:bb(c),track:c.closest('[data-track-id]')?.dataset.trackId})),
lanes:[...document.querySelectorAll('[data-track-id] [data-grid-lines]')].map(e=>({box:bb(e),t:e.closest('[data-track-id]').dataset.trackId,gs:e.dataset.gridSeconds})),
ruler:bb(document.querySelector('[data-testid=arrangement-ruler]')),scroller:bb(document.querySelector('[data-testid=arrangement-timeline-scroller]')),sl:document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft,
zoom:document.querySelector('[data-testid=arrangement-zoom-readout]').textContent,zoomInput:{min:document.querySelector('[data-testid=arrangement-zoom]').min,max:document.querySelector('[data-testid=arrangement-zoom]').max,v:document.querySelector('[data-testid=arrangement-zoom]').value},
ph:bb(document.querySelector('[data-testid=arrangement-playhead-handle]')),marker:bb(document.querySelector('[data-testid=arrangement-marker-row]')),loopStrip:document.querySelector('[data-testid=arrangement-loop-strip]')?bb(document.querySelector('[data-testid=arrangement-loop-strip]')):null,
gc:{...document.querySelector('[data-testid=arrangement-grid-control]').dataset}}});
console.log(JSON.stringify(d,null,0));await b.close();})();
