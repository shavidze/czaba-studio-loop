import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(process.argv[2] + '/studio-lab', { timeout: 240000 });
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
console.log('ready', await p.locator('[data-testid="arrangement-status"]').textContent()); await b.close();
