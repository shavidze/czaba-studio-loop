const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const t=Date.now();
 await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 300000 });
 for (let i=0;i<60;i++){ const s = await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent||null); if (s && /^Demo collection ready/.test(s)) { console.log('ready',(Date.now()-t)/1000,s.slice(0,80)); break;} if(i%10==0) console.log('status',s&&s.slice(0,80)); await p.waitForTimeout(5000);} 
 await p.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load', timeout: 300000 }); console.log('legacy loaded',(Date.now()-t)/1000); await b.close(); })();
