import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:180000}).catch(e=>console.log('warm timeout'));console.log('warm ok');await b.close();
