const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();await p.goto(process.argv[2]+'/studio-lab',{waitUntil:'load',timeout:300000});
await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),null,{timeout:300000});console.log('warm');await b.close();})();
