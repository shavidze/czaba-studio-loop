const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => JSON.stringify({ ids: [...document.querySelectorAll('[data-track-id]')].map(e => e.getAttribute('data-track-id')), ranges: [...document.querySelectorAll('input[type=range]')].map(e => e.getAttribute('aria-label')), clips: document.querySelectorAll('[data-clip-id]').length, hdr: [...document.querySelectorAll('[data-testid=arrangement-track-header] button')].slice(0,6).map(b=>b.getAttribute('aria-label')) })));
await b.close(); })();
