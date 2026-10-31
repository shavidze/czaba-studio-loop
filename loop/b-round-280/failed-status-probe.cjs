const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = [];
  const browser = await chromium.launch();
  for (const [name, pattern] of [['none', null], ['one', '**/middle-east.mp3'], ['two', /middle-east\.mp3|hero-music\.mp3/]]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    if (pattern) await page.route(pattern, (r) => r.abort());
    const t = Date.now();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 180000 });
    const status = page.getByTestId('arrangement-status');
    await status.filter({ hasText: /ready|failed to load/ }).waitFor({ timeout: 180000 });
    const first = await status.textContent();
    const at = Date.now() - t;
    await page.waitForTimeout(15000);
    const after15 = await status.textContent();
    const addEnabled = await page.getByRole('button', { name: 'Add', exact: true }).first().isEnabled().catch((e) => String(e));
    out.push({ name, first, firstAtMs: at, after15, stable: first === after15, addEnabled });
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
