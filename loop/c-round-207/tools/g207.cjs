const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs'); const path = require('path');
const BASE = 'http://127.0.0.1:5173';
(async () => {
  const b = await chromium.launch(); const out = { mock5199: null, vps: {} };
  out.mock5199 = await fetch('http://127.0.0.1:5199/').then((r) => r.status).catch((e) => 'down:' + e.cause?.code);
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage(); const o = {}; const tokenReq = [];
    p.on('request', (q) => { if (/studio-token/.test(q.url())) tokenReq.push(q.url()); });
    await p.goto(`${BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await p.waitForTimeout(2500);
    o.lab = await p.evaluate(() => ({ path: location.pathname, demo: document.querySelectorAll('[role=option][data-source-id^=demo-]').length, signIn: /Sign in required/i.test(document.body.innerText), storage: Object.keys(localStorage) }));
    await p.screenshot({ path: path.join(__dirname, '..', 'shots', `g207-${vp.width}-lab.png`) });
    await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(5000);
    o.prod = await p.evaluate(() => ({ path: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, text: document.body.innerText.slice(0, 200) }));
    await p.screenshot({ path: path.join(__dirname, '..', 'shots', `g207-${vp.width}-product.png`) });
    const r1 = await p.request.get(`${BASE}/api/studio-token?product=middle-east&file=stem1.wav`, { failOnStatusCode: false });
    o.tokenNoHeader = { status: r1.status(), body: (await r1.text()).slice(0, 200) };
    const r2 = await p.request.get(`${BASE}/api/studio-token?product=middle-east&file=stem1.wav`, { headers: { Authorization: 'Bearer fake.invalid.token' }, failOnStatusCode: false });
    o.tokenFake = { status: r2.status(), body: (await r2.text()).slice(0, 200) };
    o.tokenReqFromPages = tokenReq;
    out.vps[vp.width] = o; await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(__dirname, '..', 'out', process.env.G_OUT || 'g207.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
