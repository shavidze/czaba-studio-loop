const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const out = {};
  for (const r of ['/search', '/account/login']) {
    await p.goto('http://127.0.0.1:5173' + r, { waitUntil: 'networkidle' });
    out[r] = await p.evaluate(() => {
      const a = [...document.querySelectorAll('a.button-primary')][0];
      const bgs = []; let el = a ? a.parentElement : null;
      while (el) { const c = getComputedStyle(el).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)') { bgs.push(c); break; } el = el.parentElement; }
      return { found: !!a, behind: bgs[0] || getComputedStyle(document.body).backgroundColor };
    });
  }
  console.log(JSON.stringify(out)); await b.close();
})();
