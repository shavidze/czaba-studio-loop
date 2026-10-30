import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
for (let i = 0; i < 3; i++) { await p.goto(process.argv[2] + '/studio-lab', { waitUntil: 'load', timeout: 180000 }); try { await p.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 90000 }); console.log('ready', i); break; } catch { console.log('retry', i); } }
await b.close();
