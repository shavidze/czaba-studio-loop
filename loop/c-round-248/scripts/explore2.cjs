const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
await p.goto(process.argv[2]+'/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await sleep(800);
console.log(await p.evaluate(()=>[...document.querySelectorAll('[data-source-id]')].map(e=>e.dataset.sourceId+'|'+e.textContent.trim().slice(0,60)).join('\n')));
for (const id of process.argv.slice(3)){await p.locator(`[data-source-id="${id}"]`).first().click();await sleep(250);await p.locator('button',{hasText:/^Add/}).first().click();await sleep(900);
console.log(id, await p.evaluate(()=>JSON.stringify({status:document.querySelector('[data-testid=arrangement-status]').textContent,gc:{...document.querySelector('[data-testid=arrangement-grid-control]').dataset},clips:[...document.querySelectorAll('[data-clip-id]')].map(c=>{const r=c.getBoundingClientRect();return [c.dataset.clipId,c.dataset.clipStart,c.closest('[data-track-id]')?.dataset.trackId,Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})})));}
await b.close();})();
