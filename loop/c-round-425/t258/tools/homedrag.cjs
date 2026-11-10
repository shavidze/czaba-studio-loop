// C round 258: GATE251-REVIEW-HOME-DRAG-INFO probe. Home during a held body-range drag moves neither the
// page scroll nor focus. usage: node homedrag.cjs <outDir>
const L = require('./lib258.cjs');
const { sleep, fs, path } = L;
const outDir = process.argv[2]; fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const browser = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
    const { ctx, page, errors } = await L.open(browser, vp, { pulse: true, zoom: true });
    const g = await L.geo(page);
    const pps = g.pps;
    const clip = await page.evaluate(() => { const b = document.querySelector('[data-track-id="music"] [data-clip-id]').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    const x0 = await page.evaluate(() => document.querySelector('[data-testid="arrangement-ruler"]').getBoundingClientRect().x - document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft);
    const y = clip.y + clip.h * 0.6;
    const xa = x0 + 1 * pps; const xb = x0 + 2.5 * pps;
    // focus a known element first (the Snap toggle) so a focus move is visible
    await page.locator('[data-testid="arrangement-snap-toggle"]').focus(); await sleep(200);
    const snap = async () => page.evaluate(() => ({ winY: window.scrollY, winX: window.scrollX, docTop: document.scrollingElement.scrollTop, scLeft: document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft, scTop: document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollTop, active: document.activeElement === document.body ? 'BODY' : (document.activeElement.getAttribute('data-testid') || document.activeElement.tagName), m: document.querySelector('[data-insert-marker]')?.getAttribute('data-insert-marker') ?? null, ph: Number(document.querySelector('[data-testid="arrangement-playhead-handle"]')?.getAttribute('aria-valuenow')), range: !!document.querySelector('[data-range-start]') }));
    await page.mouse.move(xa, y); await page.mouse.down(); await sleep(80);
    for (let i = 1; i <= 8; i += 1) { await page.mouse.move(xa + ((xb - xa) * i) / 8, y); await sleep(30); }
    r.during = await snap();
    await page.keyboard.press('Home'); await sleep(400);
    r.afterHome = await snap();
    await page.screenshot({ path: path.join(outDir, `homedrag-${k}.png`) });
    await page.mouse.up(); await sleep(400);
    r.afterUp = await snap();
    r.errors = errors;
    r.checks = {
      pageScrollKept: r.afterHome.winY === r.during.winY && r.afterHome.docTop === r.during.docTop && r.afterHome.winX === r.during.winX,
      focusKept: r.afterHome.active === r.during.active && r.afterHome.active !== 'BODY',
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean);
    console.log(k, r.pass, JSON.stringify(r.checks), JSON.stringify(r.during), JSON.stringify(r.afterHome));
    await ctx.close();
  }
  fs.writeFileSync(path.join(outDir, 'homedrag.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();
