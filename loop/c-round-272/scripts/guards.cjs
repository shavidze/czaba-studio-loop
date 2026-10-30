const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dir = __dirname + '/..';
const lines = (p) => p.evaluate(() => {
  const scroller = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
  const root = document.querySelector('[data-testid="arrangement-status"]')?.closest('main') || document.body;
  const seen = new Set(); const out = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode; const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el || (scroller && scroller.contains(el))) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const range = document.createRange(); range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const k = `${Math.round(r.top)}|${Math.round(r.left / 40)}`;
      if (!seen.has(k)) { seen.add(k); out.push({ y: Math.round(r.top), x: Math.round(r.left), t: t.slice(0, 40) }); }
    }
  }
  return out;
});
(async () => {
  const b = await chromium.launch();
  const res = { budget: {}, auth: {} };
  for (const [tag, base] of [['head', 'http://127.0.0.1:5186'], ['new', 'http://127.0.0.1:5173']]) {
    for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
      const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
      await p.goto(base + '/studio-lab');
      await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
      await sleep(1000);
      await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
      await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1200);
      await p.evaluate(() => document.activeElement?.blur()); await sleep(300);
      const l = await lines(p);
      res.budget[`${tag}-${vp.width}`] = { count: l.length, lines: l };
      await p.screenshot({ path: `${dir}/shots/budget-${tag}-${vp.width}x${vp.height}.png` });
      await ctx.close();
    }
  }
  // auth on new server, fresh anonymous context
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab'); await sleep(2000);
  res.auth.studioLabStatus = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent?.slice(0, 40));
  res.auth.storage = await p.evaluate(() => Object.keys(localStorage));
  const r2 = await p.goto('http://127.0.0.1:5173/studio/demo-product'); await sleep(4000);
  res.auth.studioIdHttp = r2.status();
  res.auth.studioIdSignIn = await p.evaluate(() => document.body.innerText.includes('Sign in required'));
  res.auth.studioIdHasWorkspace = await p.evaluate(() => !!document.querySelector('[data-testid="arrangement-status"]'));
  await p.screenshot({ path: `${dir}/shots/auth-studio-id.png` });
  const api = await ctx.request.post('http://127.0.0.1:5173/api/studio-token', { failOnStatusCode: false });
  res.auth.tokenPostNoAuth = api.status();
  const apiG = await ctx.request.get('http://127.0.0.1:5173/api/studio-token', { failOnStatusCode: false });
  res.auth.tokenGetNoAuth = apiG.status();
  await ctx.close(); await b.close();
  fs.writeFileSync(`${dir}/guards.json`, JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ counts: Object.fromEntries(Object.entries(res.budget).map(([k, v]) => [k, v.count])), auth: res.auth }, null, 1));
})();
