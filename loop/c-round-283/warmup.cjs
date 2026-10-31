const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto(process.argv[2] + '/studio-lab'); await p.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 120000 }); console.log('warmup ok'); await b.close(); })();
