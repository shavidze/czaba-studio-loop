const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const [tag, base, playName] of [['new', 'http://127.0.0.1:5173', 'Play'], ['head', 'http://127.0.0.1:5180', 'Play']]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(base + '/studio-lab'); await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
    const snap = async () => p.evaluate(() => { const live = [...document.querySelectorAll('[aria-live],[role=status],[role=alert]')].map((e) => `${e.getAttribute('data-testid') || e.tagName}:${e.getAttribute('aria-live') || e.getAttribute('role')}:${e.textContent.trim().slice(0, 80)}`); const btns = [...document.querySelectorAll('[data-testid="arrangement-transport"] button, button[aria-label="Play"], button[aria-label="Pause"]')].filter((x) => /Play|Pause|Stop/.test(x.getAttribute('aria-label') || '')).map((x) => ({ name: x.getAttribute('aria-label'), pressed: x.getAttribute('aria-pressed'), desc: x.getAttribute('aria-describedby') })); return { live, btns }; });
    out[tag] = { before: await snap() };
    await p.getByRole('button', { name: playName, exact: true }).click(); await sleep(1000);
    out[tag].playing = await snap();
    out[tag].ax = await p.locator('body').ariaSnapshot().then((s) => s.split('\n').filter((l) => /Play|Pause|Stop|status|playing/i.test(l)).slice(0, 15));
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  require('fs').writeFileSync(__dirname + '/browser/a11y-playing-state.json', JSON.stringify(out, null, 1));
  await b.close();
})();
