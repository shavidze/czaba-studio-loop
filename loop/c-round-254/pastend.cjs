const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const st = (p) => p.evaluate(() => ({ m: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'), pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent, playing: !!document.querySelector('button[aria-label="Pause"]'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, lineX: document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x, hidden: document.querySelector('[data-testid="arrangement-insert-marker"]').hidden }));
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const out = {};
  for (const [tag, base] of [['new', 'http://127.0.0.1:5173'], ['head', 'http://127.0.0.1:5180']]) for (const zoom of [0]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
    await p.goto(base + '/studio-lab'); await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(800);
    await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await p.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < zoom; i++) { await p.keyboard.press('Equal'); await sleep(150); }
    await sleep(300);
    const g = await p.evaluate(() => { const ph = document.querySelector('[data-testid="arrangement-playhead"]').getBoundingClientRect(); const b = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect(); return { x0: ph.x, pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: b.y + b.height - 3 }; });
    const sc = await p.evaluate(([x0, pps]) => { const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); const before = s.scrollLeft; s.scrollLeft = 0; return s.scrollLeft - before; }, [g.x0, g.pps]); await sleep(300);
    const x0 = g.x0 - sc;
    await p.keyboard.press('Space'); await sleep(500);
    await p.mouse.click(x0 + 16.4 * g.pps, g.by); await sleep(300); const a = await st(p);
    await p.keyboard.press('Space'); await sleep(400); const s1 = await st(p);
    await p.keyboard.press('Space'); await sleep(500); const s2 = await st(p);
    await p.keyboard.press('Space'); await sleep(200);
    out[`${tag}-zoom${zoom}`] = { pps: g.pps, a, s1, s2 }; await p.screenshot({ path: `${__dirname}/browser/pastend-${tag}-zoom${zoom}.png` }); await ctx.close();
  }
  require('fs').writeFileSync(__dirname + '/browser/pastend-zoom0.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();
