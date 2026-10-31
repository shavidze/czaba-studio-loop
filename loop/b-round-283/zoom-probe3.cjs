const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2]; const out = process.argv[3]; const tracePath = process.argv[4]; const mode = process.argv[5] || 'in'; const shotDir = process.argv[6] || '';
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    window.__ev = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'keydown') window.__ev.push(e.duration); })
      .observe({ type: 'event', durationThreshold: 16, buffered: true });
  });
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /^Demo collection ready/ }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const clips = page.locator('[data-clip-id]');
  await page.getByTestId('arrangement-clip-waveform').first().waitFor();
  const clip = clips.first(); const box = await clip.boundingBox();
  await page.mouse.click(box.x + 20, box.y + 6);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 1; i < 30; i++) { await page.keyboard.press('Control+d'); }
  await page.waitForTimeout(1500);
  const nClips = await page.getByTestId('arrangement-clip-waveform').count();
  await page.evaluate(() => {
    window.__mut = { d: 0, points: 0, other: 0 };
    const mo = new MutationObserver((ms) => { for (const m of ms) { if (m.attributeName === 'd') window.__mut.d++; else if (m.attributeName === 'points') window.__mut.points++; else window.__mut.other++; } });
      for (const svg of document.querySelectorAll('[data-testid=arrangement-clip-waveform]')) mo.observe(svg, { subtree: true, attributes: true, attributeFilter: ['d', 'points', 'viewBox'] }); window.__child=0; new MutationObserver((ms)=>{for(const m of ms) window.__child+=m.addedNodes.length+m.removedNodes.length}).observe(document.body,{subtree:true,childList:true});
    window.__ev = [];
  });
  const cdp = await page.context().newCDPSession(page);
  const events = [];
  cdp.on('Tracing.dataCollected', (d) => events.push(...d.value));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReportEvents' });
  const keys = mode === 'in' ? [...Array(5).fill('='), ...Array(5).fill('-')] : [...Array(5).fill('-'), ...Array(5).fill('=')];
  const perKey = [];
  for (const k of keys) {
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    const before = await page.evaluate(() => ({ ...window.__mut, n: document.querySelectorAll('*').length }));
    await page.keyboard.press(k);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ ...window.__mut, n: document.querySelectorAll('*').length, slider: document.querySelector('input[type=range][aria-label]') && [...document.querySelectorAll('input[type=range]')].map(x=>x.getAttribute('aria-label')+'='+x.value+' '+(x.getAttribute('aria-valuetext')||'')).join('|') }));
    if (shotDir) { const c = page.locator('[data-clip-id]').first(); await page.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]') || null; }); await c.locator('[data-testid=arrangement-clip-waveform]').screenshot({ path: `${shotDir}/${mode}-${perKey.length}.png` }).catch(() => {}); }
    perKey.push({ key: k, dMut: after.d - before.d, viewBoxMut: after.other - before.other, pointsMut: after.points - before.points, nodes: after.n, dNodes: after.n - before.n, slider: after.slider });
  }
  const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.end'); await done;
  const sum = {};
  for (const e of events) { if (e.ph === 'X' && e.dur && ['FunctionCall','EventDispatch','UpdateLayoutTree','Layout','Paint','PrePaint','Layerize','RasterTask','ParseHTML','RunTask','Commit','HitTest','v8.callFunction'].includes(e.name)) sum[e.name] = (sum[e.name]||0) + e.dur/1000; }
  const ev = await page.evaluate(() => window.__ev);
  const r = { nClips, perKey, eventTimingKeydownMs: ev, traceTotalsMs: Object.fromEntries(Object.entries(sum).map(([k,v]) => [k, Math.round(v*10)/10])) };
  require('fs').writeFileSync(out, JSON.stringify(r, null, 1));
  if (tracePath) require('fs').writeFileSync(tracePath, JSON.stringify(events));
  console.log(JSON.stringify(r));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
