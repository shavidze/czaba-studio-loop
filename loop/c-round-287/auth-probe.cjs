// C287 G287-AUTH (adapted from own c-round-282 script): node auth-probe.cjs <base> <tag> <out>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const [BASE, tag, out] = process.argv.slice(2); const browser = await chromium.launch(); const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage(); const r = {}; const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const tok = []; page.on('response', (res) => { if (res.url().includes('/api/studio-token')) tok.push(res.status()); });
    r.cookies0 = (await ctx.cookies()).length;
    await page.goto(`${BASE}/studio-lab`); await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
    r.labWorkspace = await page.locator('[data-testid="arrangement-timeline-scroller"]').count();
    r.labBadgeExact = await page.getByText('Demo collection — no sign-in required').count();
    r.addButtons = await page.getByRole('button', { name: /^Add/ }).count(); r.labAuthUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.screenshot({ path: `shots/auth/lab-${tag}-${k}.png` });
    await page.goto(`${BASE}/studio/middle-east`); await sleep(3000);
    r.guard = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-ruler]') || !!document.querySelector('[data-testid=arrangement-timeline-scroller]'), authUser: localStorage.getItem('auth_user') }));
    await page.screenshot({ path: `shots/auth/guard-${tag}-${k}.png` });
    const api = `${BASE}/api/studio-token?product=middle-east&file=stem-01.wav`;
    const a = await ctx.request.get(api, { failOnStatusCode: false }); r.tokenNoHeader = { status: a.status(), body: (await a.text()).slice(0, 160) };
    const b = await ctx.request.get(api, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake.invalid.token' } }); r.tokenFake = { status: b.status(), body: (await b.text()).slice(0, 160) };
    const noToken = (t) => !/"token"\s*:\s*"[^"]+"|"url"\s*:\s*"http/i.test(t.body);
    r.pageTokenResponses = tok; r.errors = errors;
    r.pass = r.labWorkspace === 1 && r.labBadgeExact > 0 && r.labAuthUser === null && r.guard.signIn && r.guard.audioSrc === 0 && !r.guard.workspace && r.tokenNoHeader.status === 401 && r.tokenFake.status !== 200 && noToken(r.tokenNoHeader) && noToken(r.tokenFake) && !tok.includes(200);
    R[k] = r; console.log(k, JSON.stringify(r)); await ctx.close();
  }
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})();
