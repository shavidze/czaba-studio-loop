const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true }); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab'); await sleep(1500);
  await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) x.click(); });
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const R = {}; R.options = await p.$$eval('[role=option]', (e) => e.map((x) => x.getAttribute('data-source-id')));
  await o.click(); await sleep(200);
  const sel = () => p.evaluate(() => ({ active: document.activeElement?.getAttribute('data-source-id'), selected: [...document.querySelectorAll('[role=option][aria-selected=true]')].map((x) => x.getAttribute('data-source-id')) }));
  R.start = await sel();
  await p.keyboard.down('ArrowDown'); await sleep(50); await p.keyboard.down('ArrowDown'); await sleep(50); await p.keyboard.down('ArrowDown'); await p.keyboard.up('ArrowDown'); await sleep(300);
  R.afterHeldDown = await sel();
  fs.writeFileSync(__dirname + '/probe-result-arrow.json', JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
})();
