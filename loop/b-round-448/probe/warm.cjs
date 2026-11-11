// usage: node warm.cjs <base> [paths...] - one untimed browser load per path (L38 warm-up)
const { createRequire } = require('module'); const req = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = req('playwright');
(async () => { const [base, ...paths] = process.argv.slice(2); const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  for (const x of paths) { const t = Date.now(); await p.goto(base + x, { waitUntil: 'networkidle', timeout: 300000 }).catch((e) => console.log('warm err', x, String(e).slice(0, 80))); await p.waitForTimeout(3000); console.log('warmed', base + x, Date.now() - t, 'ms'); }
  await b.close(); })();
