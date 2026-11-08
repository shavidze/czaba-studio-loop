const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const [w,h] of [[1440,900],[1280,720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 180000 });
    await p.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
    await p.waitForTimeout(800);
    await p.screenshot({ path: `nvc-empty-${w}x${h}.png` });
    await p.getByRole('button', { name: 'Add', exact: true }).click();
    await p.waitForTimeout(800);
    await p.screenshot({ path: `nvc-demo-${w}x${h}.png` });
    if (w === 1440) {
      const r = await p.goto('http://127.0.0.1:5173/studio/some-premium-handle', { waitUntil: 'load' });
      await p.waitForTimeout(2500);
      out.studioPremium = { status: r && r.status(), url: p.url(), hasWorkspace: await p.locator('[data-testid="arrangement-status"], [data-track-id]').count(), body: (await p.locator('body').innerText()).slice(0, 300) };
      await p.screenshot({ path: `auth-premium.png` });
      const t = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=some-premium-handle&file=a.wav', { maxRedirects: 0 });
      out.token = { status: t.status(), body: (await t.text()).slice(0, 200) };
    }
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  require('fs').writeFileSync('auth.json', JSON.stringify(out, null, 1));
  await b.close();
})();
