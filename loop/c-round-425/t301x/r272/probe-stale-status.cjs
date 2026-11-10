const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[2] || 'http://127.0.0.1:5173';
const tag = process.argv[3] || 'head';
const st = (p) => p.evaluate(() => ({
  marker: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker'),
  pos: document.querySelector('[data-testid="arrangement-position"]')?.textContent,
  playing: document.querySelector('[data-playing]')?.getAttribute('data-playing') === 'true',
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
}));
async function setup(b, vp) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  await p.goto(base + '/studio-lab');
  await p.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
  await sleep(800);
  await p.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
  await p.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000);
  await p.evaluate(() => document.activeElement?.blur());
  const g = await p.evaluate(() => {
    const s = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); s.scrollLeft = 0;
    const ph = document.querySelector('[data-testid="arrangement-playhead"]').getBoundingClientRect();
    const r = document.querySelector('[data-testid="arrangement-bars-ruler"]').getBoundingClientRect();
    return { pps: parseFloat(document.querySelector('[data-testid="arrangement-zoom-readout"]').textContent), by: r.y + r.height - 3, phx: ph.x };
  });
  await sleep(300);
  const pos0 = await st(p);
  return { ctx, p, g, errors, pos0 };
}
async function xAt(p, g, t) {
  // playhead x at marker 0 after setup: measure insert marker line at 0
  const x0 = await p.evaluate(() => document.querySelector('[data-testid="arrangement-insert-marker"]').getBoundingClientRect().x);
  return x0;
}
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`; out[key] = {};
    for (const scen of (process.argv[4] ? process.argv[4].split(',') : ['pastEnd', 'atEnd', 'residual', 'residualManual', 'stoppedMove'])) {
      const { ctx, p, g, errors, pos0 } = await setup(b, vp);
      const x0 = await xAt(p, g, 0);
      const r = { pps: g.pps, start: pos0 };
      const clickT = scen === 'pastEnd' ? 16.6 : scen === 'atEnd' ? 16.0 : 4.0;
      await p.keyboard.press('Space'); await sleep(600);
      r.playingStarted = await st(p);
      await p.mouse.click(x0 + clickT * g.pps, g.by, scen === 'pastEnd' ? { modifiers: ['Alt'] } : undefined); await sleep(350);
      r.afterClick = await st(p);
      if (scen === 'residual' || scen === 'residualManual') { await p.keyboard.press(scen === 'residual' ? 'Control+ArrowRight' : 'Control+ArrowLeft'); await sleep(300); r.afterCtrlArrow = await st(p); }
      if (scen !== 'stoppedMove') { await p.keyboard.press('Space'); await sleep(500); }
      r.afterStop = await st(p);
      if (scen === 'stoppedMove') { await p.keyboard.press('Space'); await sleep(500); r.afterStop = await st(p); await p.keyboard.press('Control+ArrowRight'); await sleep(400); r.afterStoppedMove = await st(p); }
      await p.keyboard.press('Space'); await sleep(700);
      r.afterSpaceAgain = await st(p);
      if (r.afterSpaceAgain.playing) { await p.keyboard.press('Space'); await sleep(300); }
      r.errors = errors;
      await p.screenshot({ path: `${__dirname}/shots/${tag}-${scen}-${key}.png` });
      out[key][scen] = r; await ctx.close();
    }
  }
  require('fs').writeFileSync(`${__dirname}/probe-stale-status-${tag}.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
