const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load', timeout: 240000 });
 await p.waitForFunction(() => /Sign in required/.test(document.body.innerText), null, { timeout: 240000 });
 console.log('warm legacy'); await b.close(); })();
