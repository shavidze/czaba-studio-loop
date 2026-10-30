import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const t0=Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:180000});
const ok = await p.getByText(/Demo collection ready/).first().waitFor({timeout:150000}).then(()=>true).catch(()=>false);
console.log('ready',ok,(Date.now()-t0)+'ms', await p.locator('[data-testid="arrangement-master"]').count());
await p.screenshot({path:'/home/runner/czaba-project/tmp/studio-real-loop/c-round-263/warm-1440x900.png'}); await b.close();
