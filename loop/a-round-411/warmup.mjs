import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage(); const errs=[];
p.on('pageerror', e => errs.push(String(e).slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio-lab', { timeout: 180000 });
await p.waitForSelector('[data-testid="arrangement-library-preview-wave"]', { timeout: 180000 }).catch(e => errs.push('wait:' + e.message.slice(0,100)));
console.log(JSON.stringify({ errs })); await b.close();
