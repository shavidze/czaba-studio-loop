const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const out = process.argv[2];
const base = process.argv[3] || 'http://127.0.0.1:5173';
async function run(browser, { playing, hide, trace, css: o_css }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(2500);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const cb = await clip.boundingBox();
  await page.mouse.click(cb.x + Math.min(200, cb.width / 2), cb.y + 10);
  await page.waitForTimeout(500);
  if (hide) await page.addStyleTag({ content: hide + '{display:none!important}' });
  if (o_css) await page.addStyleTag({ content: o_css });
  const f = page.getByRole('slider', { name: 'Clip Gain — fader', exact: true });
  await f.scrollIntoViewIfNeeded();
  const box = await f.boundingBox();
  if (playing) { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('Space'); await page.waitForTimeout(1500); }
  await page.evaluate(() => {
    window.__lat = [];
    window.addEventListener('pointermove', () => { const t0 = performance.now(); requestAnimationFrame(() => { const c = new MessageChannel(); c.port1.onmessage = () => window.__lat.push(performance.now() - t0); c.port2.postMessage(0); }); }, true);
  });
  let cdp;
  if (trace) { cdp = await ctx.newCDPSession(page); await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline', transferMode: 'ReturnAsStream' }); }
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.5, y); await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.05, y, { steps: 60 });
  await page.mouse.move(box.x + box.width * 0.95, y, { steps: 60 });
  await page.mouse.up();
  await page.waitForTimeout(800);
  const lat = await page.evaluate(() => window.__lat.slice());
  let agg = null;
  if (trace) {
    const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
    await cdp.send('Tracing.end'); const { stream } = await done;
    let data = ''; for (;;) { const c = await cdp.send('IO.read', { handle: stream }); data += c.data; if (c.eof) break; }
    const ev = JSON.parse(data); const evs = Array.isArray(ev) ? ev : ev.traceEvents;
    agg = {};
    for (const e of evs) if (e.ph === 'X' && e.dur && ['FunctionCall','EvaluateScript','RunMicrotasks','UpdateLayoutTree','Layout','Paint','PrePaint','RasterTask','Layerize','UpdateLayer','CompositeLayers','Commit','ParseHTML','HitTest','FireAnimationFrame','EventDispatch','ScrollLayer','ImageDecodeTask','GPUTask','PaintImage','Rasterize','DrawFrame'].includes(e.name)) { const k = e.name + '@' + (e.tid); agg[e.name] = (agg[e.name] || 0) + e.dur / 1000; }
  }
  await ctx.close();
  lat.sort((a, b) => a - b);
  const p = q => lat[Math.min(lat.length - 1, Math.floor(q * lat.length))];
  return { n: lat.length, p50: +p(0.5).toFixed(1), p95: +p(0.95).toFixed(1), agg };
}
(async () => {
  const browser = await chromium.launch();
  const res = {};
  const cases = [
    ['stopped', { playing: false }], ['playing', { playing: true }],
    ['playing-hide-playheads', { playing: true, hide: '[data-testid="arrangement-playhead"],[data-testid="arrangement-playhead-handle"],[data-testid="arrangement-overview-playhead"]' }],
    ['stopped-promote-svgs', { playing: false, css: '[data-testid="arrangement-clip-waveform"],[data-testid="arrangement-detail-waveform"] svg{will-change:transform}' }],
    ['playing-promote-svgs', { playing: true, css: '[data-testid="arrangement-clip-waveform"],[data-testid="arrangement-detail-waveform"] svg{will-change:transform}' }],
    ['playing-promote-and-hide-playheads', { playing: true, css: '[data-testid="arrangement-clip-waveform"],[data-testid="arrangement-detail-waveform"] svg{will-change:transform}', hide: '[data-testid="arrangement-playhead"],[data-testid="arrangement-playhead-handle"],[data-testid="arrangement-overview-playhead"]' }],
  ];
  for (const [k, o] of cases) { for (let i = 0; i < (o.trace ? 1 : 2); i++) { res[k + '#' + i] = await run(browser, o); console.log(k, i, JSON.stringify(res[k + '#' + i])); } }
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
