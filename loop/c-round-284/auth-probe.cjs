const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const [base, out, shotDir] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch();
  const res = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
    const badge = await page.getByText('Demo collection — no sign-in required').count();
    const authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    const add = await page.getByRole('button', { name: 'Add', exact: true }).count();
    await page.screenshot({ path: `${shotDir}/studio-lab-${w}.png` });
    const p2 = await ctx.newPage();
    await p2.goto(base + '/studio/middle-east', { waitUntil: 'load', timeout: 120000 });
    await p2.waitForTimeout(3000);
    const signIn = await p2.getByText('Sign in required').count();
    const audioSrc = await p2.locator('audio[src]').count();
    const ws = await p2.getByTestId('arrangement-status').count();
    const ws2 = await p2.locator('[data-clip-id]').count();
    await p2.screenshot({ path: `${shotDir}/studio-product-${w}.png` });
    const r1 = await ctx.request.get(base + '/api/studio-token?product=middle-east&file=stem-01.wav', { failOnStatusCode: false });
    const b1 = await r1.text();
    const r2 = await ctx.request.get(base + '/api/studio-token?product=middle-east&file=stem-01.wav', { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
    const b2 = await r2.text();
    res.push({ viewport: [w, h], studioLab: { badge, authUser, addButton: add }, product: { signIn, audioSrc, arrangementStatus: ws, clips: ws2 },
      tokenNoHeader: { status: r1.status(), hasToken: /"token"\s*:\s*"[^"]+"/.test(b1), body: b1.slice(0, 160) },
      tokenFake: { status: r2.status(), hasToken: /"token"\s*:\s*"[^"]+"/.test(b2), body: b2.slice(0, 160) } });
    await ctx.close();
  }
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
