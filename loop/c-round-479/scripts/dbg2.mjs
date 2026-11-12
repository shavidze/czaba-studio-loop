import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.waitForTimeout(3500);
console.log(await p.evaluate(()=>[...document.querySelectorAll('footer a')].map(a=>a.textContent).join(',')), await p.locator('footer a',{hasText:'Support'}).count());
await b.close();
