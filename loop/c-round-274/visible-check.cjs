const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab');
    await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
    await sleep(800);
    for (let i = 0; i < 2; i++) { await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); }
    await p.evaluate(() => document.activeElement?.blur());
    const c = await p.evaluate(() => { const e = document.querySelector('[data-clip-id]').getBoundingClientRect(); return { x: e.x, y: e.y }; });
    await p.mouse.click(c.x + 40, c.y + 5); await sleep(350);
    await p.keyboard.press('Control+a'); await sleep(400);
    await p.keyboard.press('ArrowRight'); await sleep(600);
    const info = () => p.evaluate(() => {
      const s = document.querySelector('[data-testid="arrangement-status"]'); const b = s.getBoundingClientRect();
      const all = [...document.querySelectorAll('body *')].filter((e) => e.children.length === 0 && /added to the|Move \(2\)|Nudge clip:/.test(e.textContent)).map((e) => { const r = e.getBoundingClientRect(); return { tag: e.tagName, tid: e.closest('[data-testid]')?.getAttribute('data-testid'), y: Math.round(r.y), h: Math.round(r.height), text: e.textContent.slice(0, 70) }; });
      return { status: s.textContent, box: { y: b.y, h: b.height }, spans: s.children.length, all };
    });
    out[vp.width + 'group'] = await info();
    await p.screenshot({ path: `${__dirname}/shots/visible-group-${vp.width}.png` });
    await p.keyboard.press('Escape'); await sleep(300);
    const c2 = await p.evaluate(() => { const e = document.querySelector('[data-clip-id]').getBoundingClientRect(); return { x: e.x, y: e.y }; });
    await p.mouse.click(c2.x + 40, c2.y + 5); await sleep(350);
    await p.keyboard.press('ArrowRight'); await sleep(600);
    out[vp.width + 'single'] = await info();
    await p.screenshot({ path: `${__dirname}/shots/visible-single-${vp.width}.png` });
    await ctx.close();
  }
  require('fs').writeFileSync(__dirname + '/visible-check.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
