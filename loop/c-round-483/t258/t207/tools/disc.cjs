const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await p.waitForTimeout(4000);
console.log(await p.evaluate(()=>({lanes:[...document.querySelectorAll('[data-track-id]')].map(e=>e.dataset.trackId+':'+(e.querySelector('button[aria-label^="Mute"]')?.getAttribute('aria-label')||'-')),src:[...document.querySelectorAll('[role=option][data-source-id]')].map(e=>e.dataset.sourceId+'|'+e.textContent.trim().slice(0,40)),cookie:[...document.querySelectorAll('button')].filter(x=>/Decline|Accept/.test(x.textContent)).map(x=>x.textContent)})));await b.close();})();
