const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const out = { loads: [] };
  for (let i = 0; i < 2; i++) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const workers = []; const errors = [];
    page.on('worker', (w) => workers.push(w.url()));
    page.on('pageerror', (e) => errors.push(String(e)));
    const t0 = Date.now();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 60000 });
    const ready = Date.now() - t0;
    const rects = await page.$$eval('[role="option"] svg rect, [role="option"] rect', (els) => els.length);
    out.loads.push({ ready, workers: workers.map((u) => u.split('/').pop().split('?')[0]), errors, rects });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
