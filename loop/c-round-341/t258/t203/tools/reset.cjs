// C round 203 — BLOCKED-AUTH-203: does account.reset render with the mock? node reset.cjs <port>
const F = require('./fl.cjs'); const path = require('path');
(async () => { const b = await F.launch(); const { ctx, page } = await F.newPage(b, 1280, 720);
  const r = await page.goto(`http://127.0.0.1:${process.argv[2]}/account/reset/x/y`, { waitUntil: 'load' }); await F.sleep(3000);
  const R = { status: r.status(), url: page.url(), inputs: await page.evaluate(() => [...document.querySelectorAll('input')].filter((e) => e.offsetParent).map((e) => e.type + ':' + e.id)), text: await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)) };
  await page.screenshot({ path: path.join(F.ROOT, 'shots', 'reset-1280.png') });
  F.save(path.join(F.ROOT, 'out', 'reset.json'), R); console.log(JSON.stringify(R)); await b.close(); })();
