import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [base,tag] of [['http://127.0.0.1:5173','tree-dev'],['http://127.0.0.1:5190','head-prod'],['http://127.0.0.1:5191','tree-prod']]) for (const w of [1440,1280]) {
 const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
 await p.goto(base+'/studio/middle-east',{waitUntil:'load'}); await p.waitForTimeout(4000);
 console.log(tag,w,JSON.stringify(await p.evaluate(()=>({t:document.body.innerText.slice(0,60).replace(/\n+/g,' | '),audio:document.querySelectorAll('audio[src]').length,media:document.querySelectorAll('video,audio').length}))));
}
await b.close();
