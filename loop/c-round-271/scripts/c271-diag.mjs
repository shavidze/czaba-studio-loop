import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = [];
p.on('pageerror', (e) => errs.push('PE ' + String(e).slice(0, 200))); p.on('console', (m) => { if (m.type() === 'error') errs.push('CE ' + m.text().slice(0, 200)); });
await p.goto(process.argv[2] + '/studio-lab', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(25000);
console.log(await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent), '|', (await p.evaluate(() => document.body.innerText)).slice(0, 300)); console.log(errs.slice(0, 10).join('\n')); await b.close();
