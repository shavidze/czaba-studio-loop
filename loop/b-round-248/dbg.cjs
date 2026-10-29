const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:5174/studio-lab');
await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});
const info=await p.evaluate(()=>[...document.querySelectorAll('[data-track-id]')].map(e=>{const r=e.getBoundingClientRect();return [e.tagName,e.getAttribute('data-testid'),e.dataset.trackId,Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}));
console.log(JSON.stringify(info));
const r=await p.getByTestId('arrangement-ruler').boundingBox();console.log(JSON.stringify(r));
await b.close();})();
