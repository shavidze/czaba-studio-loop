const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    await p.evaluate(() => { window.__clicks = { Play: 0, Stop: 0 }; for (const n of ['Play', 'Stop']) document.querySelector(`button[aria-label="${n}"]`).addEventListener('click', () => { window.__clicks[n] += 1; }); });
    const playing = () => p.evaluate(() => document.querySelector('button[aria-label="Play"]').dataset.playing);
    const r = {};
    await p.getByRole('button', { name: 'Play', exact: true }).focus(); r.p0 = await playing();
    await p.keyboard.press('Space'); await sleep(700); r.p1 = await playing(); r.clicksAfterSpaceOnPlay = await p.evaluate(() => ({ ...window.__clicks }));
    await p.getByRole('button', { name: 'Stop', exact: true }).focus();
    await p.keyboard.press('Space'); await sleep(700); r.p2 = await playing(); r.clicksAfterSpaceOnStop = await p.evaluate(() => ({ ...window.__clicks }));
    out[`${w}x${h}`] = r; await ctx.close();
  }
  console.log(JSON.stringify(out)); require('fs').writeFileSync(__dirname + '/browser/space-native-click.json', JSON.stringify(out, null, 1)); await b.close();
})();
