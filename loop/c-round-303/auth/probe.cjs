const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
 p.on('framenavigated', (f) => f === p.mainFrame() && console.log('nav', f.url()));
 const r = await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'networkidle' }); console.log('status', r.status());
 for (let i = 0; i < 5; i++) { await p.waitForTimeout(1500); console.log(i, await p.evaluate(() => ({ url: location.href, body: !!document.body, signIn: document.body ? /Sign in required/.test(document.body.innerText) : null, audio: document.querySelectorAll('audio[src]').length }))); }
 await p.screenshot({ path: __dirname + '/shots/probe-legacy.png' }); await b.close(); })();
