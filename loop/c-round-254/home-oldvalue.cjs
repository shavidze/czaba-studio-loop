const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await p.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 4; i++) { await p.keyboard.press('Equal'); await sleep(150); } await sleep(300);
    const g = await p.evaluate(() => { const ph = document.querySelector('[data-testid="arrangement-playhead"]').getBoundingClientRect(); const s = document.querySelector('[data-track-id="sfx"]').getBoundingClientRect(); return { x0: ph.x, pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), y: s.y + s.height / 2 }; });
    const r = {};
    for (const run of ['stopped', 'playing']) {
      await p.mouse.click(g.x0 + 6 * g.pps, g.y); await sleep(400);
      if (run === 'playing') { await p.keyboard.press('Space'); await sleep(800); }
      await p.evaluate(() => { window.__o = []; const l = document.querySelector('[data-testid="arrangement-insert-marker"]'); new MutationObserver((ms) => ms.forEach((m) => window.__o.push({ old: m.oldValue, now: l.getAttribute('data-insert-marker') }))).observe(l, { attributes: true, attributeOldValue: true, attributeFilter: ['data-insert-marker'] }); });
      const before = await p.evaluate(() => document.querySelector('[data-insert-marker]').getAttribute('data-insert-marker'));
      await p.keyboard.press('Home'); await sleep(400);
      r[run] = { before, records: await p.evaluate(() => window.__o), after: await p.evaluate(() => document.querySelector('[data-insert-marker]').getAttribute('data-insert-marker')) };
      if (run === 'playing') { await p.keyboard.press('Space'); await sleep(300); }
    }
    out[`${vp.width}x${vp.height}`] = r; await ctx.close();
  }
  require('fs').writeFileSync(__dirname + '/browser/home-oldvalue.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close();
})();
