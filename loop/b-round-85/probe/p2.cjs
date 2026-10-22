const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const logs=[];
 p.on('console', m => logs.push(m.type()+': '+m.text().slice(0,200))); p.on('pageerror', e => logs.push('PAGEERR '+e.message.slice(0,200))); p.on('requestfailed', r => logs.push('FAILED ' + r.url().slice(0,120)));
 await p.goto('http://127.0.0.1:5191/'); await p.waitForTimeout(5000); if (!(await p.evaluate(() => !!window.probe))) { console.log(JSON.stringify(logs)); await b.close(); return; }
 const t=Date.now(); const r = await p.evaluate(() => Promise.race([window.probe(), new Promise(res => setTimeout(() => res('timeout'), 60000))]).catch(e => 'error ' + e.message));
 console.log(JSON.stringify({ r, ms: Date.now()-t, logs })); await b.close(); })();
