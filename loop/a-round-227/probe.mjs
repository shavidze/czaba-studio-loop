import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on('pageerror', (e) => console.log('pageerror', String(e).slice(0, 200)));
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
await p.waitForTimeout(15000);
console.log('buttons', await p.locator('button[aria-haspopup="dialog"]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label'))));
await p.screenshot({ path: process.argv[2] + '/probe-1280.png' });
await b.close();
