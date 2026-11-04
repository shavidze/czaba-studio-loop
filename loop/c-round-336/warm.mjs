import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,150))});
for (let i=0;i<4;i++){
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000}).catch(e=>console.log('goto',String(e).slice(0,100)));
  await p.waitForTimeout(8000);
  const n=(await p.evaluate(()=>document.body.innerText.length)); const has=await p.locator('[data-testid="arrangement-timeline-scroller"]').count();
  console.log(i,'bodylen',n,'scroller',has, p.url());
  if(has) break;
}
console.log(errs.slice(0,5));
await p.screenshot({path:'c-round-336/warm.png'});
await b.close();
