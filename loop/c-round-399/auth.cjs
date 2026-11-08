const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const vp of [{width:1440,height:900},{width:1280,height:720}]) {
    const ctx = await b.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    const k = `${vp.width}`;
    out[k] = { url: p.url(), hasLibrary: await p.getByText(/library|stems/i).count(), tracks: await p.locator('[data-testid="arrangement-track-header"]').count() };
    await p.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-399/auth-lab-${k}.png` });
    if (vp.width === 1440) {
      const r = await p.goto('http://127.0.0.1:5173/studio/premium-test-handle', { waitUntil: 'networkidle' });
      out.premium = { status: r.status(), url: p.url(), workspace: await p.locator('[data-testid="arrangement-track-header"]').count(), text: (await p.locator('body').innerText()).slice(0,200) };
      await p.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-399/auth-premium-1440.png` });
      const t = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=premium-test-handle&file=a.wav');
      out.token = { status: t.status(), body: (await t.text()).slice(0,150) };
    }
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
