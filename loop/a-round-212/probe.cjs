const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' }); await p.waitForTimeout(6000);
const names = await p.getByRole('button').evaluateAll((els) => els.slice(0, 40).map((e) => e.getAttribute('aria-label') || e.textContent.trim()));
console.log(names.join(' | ')); await p.screenshot({ path: 'px/probe.png' }); await b.close(); })();
