// C246 info probe: Cut Time removes the focused flag AND the next one; a later flag survives (A-R246-REVIEW-L1 branch).
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const out = {};
const act = (p) => p.evaluate(() => { const a = document.activeElement; return a === document.body ? 'BODY' : `${a.getAttribute('data-testid')}@${a.getAttribute('data-marker-time')} fv=${a.matches(':focus-visible')} ${getComputedStyle(a).outlineStyle} ${getComputedStyle(a).outlineWidth}`; });
const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-marker"]')].map((m) => m.getAttribute('data-marker-time')));
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
    await page.goto(`${process.argv[2]}/studio-lab`); await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 120000 }); await sleep(600);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(800);
    for (const n of [6, 4, 2, 0]) { await page.evaluate(() => { document.activeElement?.blur(); document.body.focus(); }); await page.keyboard.press('KeyM'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400); for (let i = 0; i < n; i += 1) { await page.keyboard.press('ArrowRight'); await sleep(60); } await sleep(300); }
    await page.evaluate(() => document.activeElement?.blur());
    const f0 = await flags(page);
    const g = await page.evaluate(() => { const x = (t) => document.querySelector(`[data-testid="arrangement-marker"][data-marker-time="${t}"]`).getBoundingClientRect().left; const c = document.querySelector('[data-clip-kind="audio"]').getBoundingClientRect(); return { x0: x('0.000'), x6: x('6.000'), y: c.top + c.height * 0.65 }; });
    const pps = (g.x6 - g.x0) / 6; const xt = (t) => g.x0 + t * pps;
    await page.keyboard.down('Alt'); await page.mouse.move(xt(1), g.y); await page.mouse.down(); await page.mouse.move(xt(5), g.y, { steps: 10 }); await page.mouse.up(); await page.keyboard.up('Alt'); await sleep(400);
    await page.locator('[data-testid="arrangement-marker"][data-marker-time="2.000"]').focus(); await sleep(200); const before = await act(page);
    await page.keyboard.press('Control+Shift+x'); await sleep(600);
    out[k] = { f0, before, after: await flags(page), focus: await act(page), status: await page.getByTestId('arrangement-status').textContent(), errs };
    await page.screenshot({ path: path.join(__dirname, `out-fix/cutTime-skipNext-${k}.png`) }); await ctx.close();
  }
  await b.close(); fs.writeFileSync(path.join(__dirname, 'out-fix/c246-skip.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
