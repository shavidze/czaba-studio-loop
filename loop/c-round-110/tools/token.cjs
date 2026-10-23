const { chromium, save, BASE } = require('./lib.cjs');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext();
  const out = {};
  for (const q of ['', '?product=middle-east&file=stem1.wav']) {
    const r = await ctx.request.get(`${BASE}/api/studio-token${q}`, { failOnStatusCode: false });
    out[q || 'noParams'] = { status: r.status(), body: (await r.text()).slice(0, 160) };
  }
  await b.close(); save('token.json', out); console.log(JSON.stringify(out, null, 1));
})();
