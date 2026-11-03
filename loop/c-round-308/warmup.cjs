const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); const base = process.argv[2];
 await p.goto(base + '/studio-lab', { waitUntil: 'load' });
 await p.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 120000 });
 console.log('warm', base); await b.close(); })();
