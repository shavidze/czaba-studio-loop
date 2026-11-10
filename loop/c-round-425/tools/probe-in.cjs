const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:120000});
await p.getByTestId('arrangement-video-input').setInputFiles(process.argv[2]);await p.waitForTimeout(6000);
console.log(await p.getByTestId('arrangement-status').textContent(), await p.locator('[data-clip-kind="video"]').count());await b.close();})();
