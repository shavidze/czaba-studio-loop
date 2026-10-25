const X = require('./tools/lib122.cjs'); const { L, sleep } = X;
(async () => { const { chromium } = require('module').createRequire('/home/runner/czaba-project/store/package.json')('playwright');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 }); const p = await ctx.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForSelector('[data-testid=arrangement-overview]', { timeout: 90000 }); await sleep(3000);
await p.mouse.move(2, 2); await sleep(300);
const o = await p.locator('[data-testid=arrangement-overview]').boundingBox();
for (const [n, x, y] of [['bl', o.x - 4, o.y + o.height - 16], ['br', o.x + o.width - 16, o.y + o.height - 16], ['tl', o.x - 4, o.y - 4], ['tr', o.x + o.width - 16, o.y - 4]]) await p.screenshot({ path: `out/corner-1440-${n}.png`, clip: { x, y, width: 20, height: 20 } });
await b.close(); })();
