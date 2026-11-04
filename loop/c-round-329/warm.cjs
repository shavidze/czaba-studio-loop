const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); for (const base of process.argv.slice(2)) { const p = await b.newPage(); const t = Date.now();
 try { await p.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 240000 }); await p.waitForSelector('[data-source-id="demo-stem-pulse"]', { timeout: 240000 }); console.log(base, 'ready', Date.now() - t, 'ms'); } catch (e) { console.log(base, 'ERR', e.message.split('\n')[0]); } await p.close(); } await b.close(); })();
