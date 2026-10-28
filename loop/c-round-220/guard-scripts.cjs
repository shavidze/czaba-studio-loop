const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const route of ['/studio/middle-east', '/studio-lab', '/']) for (const port of [5189, 5188]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage(); const s = [];
    page.on('request', (q) => { if (q.resourceType() === 'script') s.push(q.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, '')); });
    await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'load' }); await page.waitForTimeout(5000);
    out[route + '@' + port] = s; await ctx.close();
  }
  await b.close();
  const strip = (x) => x.replace(/-[A-Za-z0-9_-]{8}\.js$/, '');
  const res = {};
  for (const route of ['/studio/middle-east', '/studio-lab', '/']) { const A = out[route + '@5189'].map(strip), B = out[route + '@5188'].map(strip); res[route] = { base: A.length, new: B.length, onlyBase: A.filter((x) => !B.includes(x)), onlyNew: B.filter((x) => !A.includes(x)) }; }
  console.log(JSON.stringify({ res, raw: out }, null, 1));
})();
