const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
for (const r of ['/account','/support']) {
  await p.goto('http://127.0.0.1:5173'+r,{waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(1500);
  const x = await p.evaluate(() => [...document.querySelectorAll('button, a[href]')].filter(e => !e.closest('header,footer')).map(e => e.tagName + ':' + e.innerText.trim().slice(0,30) + ':' + (e.getAttribute('aria-label')||'')).slice(0,25));
  console.log(r, JSON.stringify(x)); }
await b.close(); })();
