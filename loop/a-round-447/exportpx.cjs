const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(4500);
const exp = p.locator('div', { hasText: /^Export Mix$/ }).last(); await exp.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
console.log(await exp.evaluate(e=>getComputedStyle(e.parentElement.parentElement).backgroundColor));
await exp.screenshot({ path: __dirname + '/export-mix.png' });
await b.close(); })();
