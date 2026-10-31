const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:844}})).newPage();
await p.goto('http://127.0.0.1:5174/studio-lab',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>getComputedStyle(document.querySelector('audio')).colorScheme));
await p.screenshot({path:'probe/sketch-390-scheme-dark.png'}); await b.close(); })();
