// B round 303 -> 304 planning probe for PERF-3c. args: base out mode(in|out|wheel-in|wheel-out) W H
// 30 clips (Add + 29 x Ctrl+D), then 10 steps. Key modes: Event Timing keydown duration per key (durationThreshold 16).
// Wheel modes: synthetic ctrl+wheel dispatched in page; wheel->double-rAF ms per step (Event Timing has no wheel entries).
// Per step: LoAF max, waveform path 'd' rewrites, ruler/bars child mutations, slider value.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out, mode = 'in', W = '1440', H = '900'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.addInitScript(() => {
    window.__ev = []; window.__loaf = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'keydown') window.__ev.push(e.duration); })
      .observe({ type: 'event', durationThreshold: 16, buffered: true });
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ t: e.startTime, d: e.duration }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch {}
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
  const clips = await page.locator('[data-clip-id]').count();
  await page.evaluate(() => {
    window.__m = { d: 0, ruler: 0, bars: 0 };
    new MutationObserver((ms) => { for (const m of ms) if (m.type === 'attributes' && m.attributeName === 'd') window.__m.d++; })
      .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['d'] });
    const r = document.querySelector('[data-testid=arrangement-ruler]');
    if (r) new MutationObserver((ms) => { for (const m of ms) window.__m.ruler += m.addedNodes.length + m.removedNodes.length; }).observe(r, { subtree: true, childList: true });
    const b = document.querySelector('[data-testid=arrangement-bars-ruler]');
    if (b) new MutationObserver((ms) => { for (const m of ms) window.__m.bars += m.addedNodes.length + m.removedNodes.length; }).observe(b, { subtree: true, childList: true });
    window.__ev = []; window.__loaf = [];
  });
  const slider = () => page.evaluate(() => [...document.querySelectorAll('input[type=range]')].filter((x) => /zoom/i.test(x.getAttribute('aria-label') || '')).map((x) => x.value).join('|'));
  const res = { mode, viewport: [W, H], clips, startZoom: await slider(), steps: [] };
  const down = mode === 'out' || mode === 'wheel-out';
  for (let i = 0; i < 10; i++) {
    const zoomIn = down ? i >= 5 : i < 5;
    await page.evaluate(() => { window.__m.d = 0; window.__m.ruler = 0; window.__m.bars = 0; window.__ev = []; window.__loaf = []; });
    let wheelMs = null;
    if (mode.startsWith('wheel')) {
      const sb = await page.getByTestId('arrangement-timeline-scroller').boundingBox(); await page.mouse.move(sb.x + 224 + 300, sb.y + 60); await page.keyboard.down('Control'); const tw0 = await page.evaluate(() => performance.now()); await page.mouse.wheel(0, zoomIn ? -100 : 100); wheelMs = await page.evaluate(async (t0) => { await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round((performance.now() - t0) * 10) / 10; }, tw0); await page.keyboard.up('Control'); if (0) await page.evaluate(async (zin) => {
        const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
        const r = sc.getBoundingClientRect();
        const t0 = performance.now();
        sc.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, ctrlKey: true, deltaY: zin ? -100 : 100, clientX: r.left + 224 + 300, clientY: r.top + 60 }));
        await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
        return Math.round((performance.now() - t0) * 10) / 10;
      }, zoomIn);
    } else {
      await page.keyboard.press(zoomIn ? '=' : '-');
    }
    await page.waitForTimeout(500);
    const s = await page.evaluate(() => ({ ev: window.__ev.slice(), loafMax: Math.round(Math.max(0, ...window.__loaf.map((x) => x.d))), m: { ...window.__m } }));
    res.steps.push({ key: zoomIn ? 'in' : 'out', zoom: await slider(), et: s.ev, wheelMs, loafMax: s.loafMax, pathRewrites: s.m.d, rulerMut: s.m.ruler, barsMut: s.m.bars });
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
