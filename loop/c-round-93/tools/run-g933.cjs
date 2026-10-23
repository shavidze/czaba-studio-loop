// G92-3 purchase protection, fresh incognito, no credentials
const X = require('./lib93.cjs'); const { sleep } = X;
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, { width: 1440, height: 900 }, 'g933');
  const R = {};
  await p.goto(X.BASE + '/', { waitUntil: 'domcontentloaded' }); await sleep(6000);
  R.links = await p.$$eval('a[href="/studio-lab"]', (as) => as.map((a) => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim(), inHeader: !!a.closest('header'), vis: r.width > 0 && r.height > 0 }; }));
  const vis = p.locator('header a[href="/studio-lab"]').filter({ visible: true }).first();
  if (await vis.count()) { await vis.click(); await p.waitForURL(/studio-lab/, { timeout: 30000 }); await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(1500);
    R.headerEntry = { url: p.url(), workspace: await p.locator('[data-testid=arrangement-grid-control]').count(), badge: await p.evaluate(() => /დემო კოლექცია/.test(document.body.innerText)) }; await p.screenshot({ path: `${X.SHOTS}/g933-studio-lab.png` }); }
  await p.goto(X.BASE + '/studio/middle-east', { waitUntil: 'domcontentloaded' }); await sleep(6000);
  R.protected = await p.evaluate(() => ({ url: location.href, signIn: /Sign in required/i.test(document.body.innerText), workspace: document.querySelectorAll('[data-testid=arrangement-grid-control]').length, audio: document.querySelectorAll('audio[src]').length, excerpt: document.body.innerText.slice(0, 200) }));
  await p.screenshot({ path: `${X.SHOTS}/g933-protected.png` });
  const q = await ctx.request.get(X.BASE + '/api/studio-token?product=middle-east&file=stem1.wav'); R.tokenAnon = { status: q.status(), body: (await q.text()).slice(0, 120) };
  const fb = await ctx.request.get(X.BASE + '/api/studio-token?product=middle-east&file=stem1.wav', { headers: { Authorization: 'Bearer fake.token.value' } }); R.fakeBearer = { status: fb.status(), body: (await fb.text()).slice(0, 120) };
  R.ls = await p.evaluate(() => Object.keys(localStorage)); R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.third = [...new Set(S.thirdParty)];
  X.save('g933.json', R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
