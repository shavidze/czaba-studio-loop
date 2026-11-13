const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const t=Date.now();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:240000});
await p.waitForTimeout(8000);console.log('warm ms',Date.now()-t, await p.title());await b.close();})();
