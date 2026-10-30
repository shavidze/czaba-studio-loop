const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext(); const out = {};
 const u = 'http://127.0.0.1:5173/api/studio-token?product=middle-east&file=Music.wav';
 let r = await ctx.request.get(u, { failOnStatusCode: false }); out.noHeader = { status: r.status(), body: (await r.text()).slice(0, 120) };
 r = await ctx.request.get(u, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake' } }); out.fakeBearer = { status: r.status(), body: (await r.text()).slice(0, 120) };
 const c = await ctx.cookies(); out.cookies = c.map(x => x.name);
 fs.writeFileSync(__dirname + '/../auth-token.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
