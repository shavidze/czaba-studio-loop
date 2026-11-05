import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto(process.argv[2] + '/studio-lab', { waitUntil: 'load' });
try { await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 90000 }); console.log('ready'); } catch { console.log('not ready'); }
await b.close();
