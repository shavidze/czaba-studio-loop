// B round 284 planning probe for PERF-3b. args: base out mode(in|out|follow|follow-bpm|jump) [width height]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const [base, out, mode = 'in', W = '1440', H = '900', shotDir = ''] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.addInitScript(() => {
    window.__ev = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'keydown') window.__ev.push(e.duration); })
      .observe({ type: 'event', durationThreshold: 16, buffered: true });
  });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) await page.keyboard.press('Control+d');
  await page.waitForTimeout(1500);
  if (mode === 'follow-bpm') {
    const t = page.getByTestId('arrangement-tempo-input');
    await t.click(); await t.fill('120'); await t.press('Enter');
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForTimeout(800);
  }
  const rulerCount = () => page.evaluate(() => ({
    ruler: document.querySelectorAll('[data-testid=arrangement-ruler] *').length,
    bars: document.querySelectorAll('[data-testid=arrangement-bars-ruler] *').length,
    doc: document.querySelectorAll('*').length,
    step: document.querySelector('[data-testid=arrangement-ruler]')?.getAttribute('data-tick-step'),
    zoom: [...document.querySelectorAll('input[type=range]')].map((x) => x.getAttribute('aria-label') + '=' + x.value).join('|'),
    scrollLeft: document.querySelector('[data-testid=arrangement-timeline-scroller]')?.scrollLeft,
    coverage: (() => {
      // visible-tick coverage (needs the data-time attribute; null on HEAD): every multiple of data-tick-step whose x lies in [scrollLeft, scrollLeft + viewport] and inside the ruler must be rendered
      const r = document.querySelector('[data-testid=arrangement-ruler]');
      const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
      const ticks = [...document.querySelectorAll('[data-testid=arrangement-ruler-tick]')];
      if (!r || !sc || ticks.length === 0) return null;
      const step = Number(r.getAttribute('data-tick-step'));
      const width = parseFloat(r.style.width);
      const px = Number(ticks.length > 1 ? (parseFloat(ticks[1].style.left) - parseFloat(ticks[0].style.left)) / (Number(ticks[1].dataset.time) - Number(ticks[0].dataset.time)) : NaN);
      const vp = sc.clientWidth - 224;
      const have = new Set(ticks.map((t) => Number(t.dataset.time).toFixed(3)));
      let expected = 0; const missing = [];
      for (let k = Math.ceil(sc.scrollLeft / (step * px)); k * step * px <= Math.min(sc.scrollLeft + vp, width - 1); k++) { expected++; const t = (k * step).toFixed(3); if (!have.has(t)) missing.push(t); }
      return { step, px: Math.round(px * 1000) / 1000, vp, expected, missing: missing.length, firstMissing: missing.slice(0, 3) };
    })(),
  }));
  await page.evaluate(() => {
    window.__rm = { ruler: 0, bars: 0 };
    const r = document.querySelector('[data-testid=arrangement-ruler]');
    const b = document.querySelector('[data-testid=arrangement-bars-ruler]');
    new MutationObserver((ms) => { for (const m of ms) window.__rm.ruler += m.addedNodes.length + m.removedNodes.length; }).observe(r, { subtree: true, childList: true });
    if (b) new MutationObserver((ms) => { for (const m of ms) window.__rm.bars += m.addedNodes.length + m.removedNodes.length; }).observe(b, { subtree: true, childList: true });
    window.__ev = [];
  });
  const shot = async (name) => {
    if (!shotDir) return;
    const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    const rb = await page.getByTestId('arrangement-ruler').boundingBox();
    const x0 = Math.max(sc.x + 224, rb.x); const x1 = Math.min(sc.x + sc.width - 2, rb.x + rb.width);
    if (x1 - x0 < 4) return;
    await page.mouse.move(5, 5);
    await page.screenshot({ path: `${shotDir}/${name}.png`, clip: { x: x0, y: rb.y, width: x1 - x0, height: rb.height } });
  };
  const res = { mode, viewport: [W, H], start: await rulerCount(), steps: [] };
  await shot(`${mode}-start`);
  if (mode === 'in' || mode === 'out') {
    const keys = mode === 'in' ? [...Array(5).fill('='), ...Array(5).fill('-')] : [...Array(5).fill('-'), ...Array(5).fill('=')];
    for (const k of keys) {
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      const b = await rulerCount();
      await page.keyboard.press(k); await page.waitForTimeout(400);
      const a = await rulerCount();
      res.steps.push({ key: k, ...a, dRuler: a.ruler - b.ruler, dDoc: a.doc - b.doc });
      await shot(`${mode}-${res.steps.length}`);
    }
    res.eventTimingKeydownMs = await page.evaluate(() => window.__ev);
  } else if (mode === 'follow' || mode === 'follow-bpm' || mode === 'follow-zoom') {
    if (mode === 'follow-zoom') { for (let i = 0; i < 9; i++) { await page.keyboard.press('='); await page.waitForTimeout(150); } await page.waitForTimeout(600); res.zoomed = await rulerCount(); }
    // seek near the right edge of the visible page, then play 6 s with Follow on (default)
    const sc = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    const rb = await page.getByTestId('arrangement-ruler').boundingBox();
    await page.mouse.click(Math.min(sc.x + sc.width - 60, rb.x + rb.width - 5), rb.y + rb.height - 4);
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.waitForTimeout(500);
    const b = await rulerCount();
    await page.evaluate(() => { window.__rm = { ruler: 0, bars: 0 }; });
    await page.keyboard.press('Space');
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(1000); res.steps.push({ t: i + 1, ...(await rulerCount()), rm: await page.evaluate(() => ({ ...window.__rm })) }); }
    await page.keyboard.press('Space'); await page.waitForTimeout(500); await shot(`${mode}-stopped`); await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    res.beforePlay = b;
  } else if (mode === 'jump') {
    const sc = page.getByTestId('arrangement-timeline-scroller');
    for (const frac of [0.25, 0.5, 0.999, 0]) {
      await sc.evaluate((el, f) => { el.scrollLeft = (el.scrollWidth - el.clientWidth) * f; }, frac);
      await page.waitForTimeout(400);
      res.steps.push({ frac, ...(await rulerCount()), rm: await page.evaluate(() => ({ ...window.__rm })) });
      await shot(`${mode}-${frac}`);
    }
  }
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 3000));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
