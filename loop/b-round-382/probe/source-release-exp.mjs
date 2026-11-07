import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const results = {};
for (const variant of ['stop-null-onended-disconnect', 'stop-disconnect-in-onended', 'stop-keep-connected', 'no-stop-disconnect', 'stop-disconnect-buffer-null']) {
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await page.goto('about:blank');
  await page.evaluate(async (variant) => {
    const ctx = new AudioContext(); await ctx.resume();
    const buf = ctx.createBuffer(2, 48000 * 30, 48000);
    window.__ref = new WeakRef(buf);
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(ctx.destination); src.start();
    await new Promise((r) => setTimeout(r, 300));
    window.__ended = false;
    if (variant === 'stop-null-onended-disconnect') { src.onended = null; src.stop(); src.disconnect(); }
    if (variant === 'stop-disconnect-in-onended') { src.onended = () => { window.__ended = true; src.disconnect(); }; src.stop(); }
    if (variant === 'stop-keep-connected') { src.onended = () => { window.__ended = true; }; src.stop(); }
    if (variant === 'no-stop-disconnect') { src.disconnect(); }
    if (variant === 'stop-disconnect-buffer-null') { src.onended = null; src.stop(); src.disconnect(); try { src.buffer = null; window.__nullOk = true; } catch (e) { window.__nullOk = String(e); } }
    window.__ctx = ctx;
  }, variant);
  await page.waitForTimeout(3000);
  for (let i = 0; i < 2; i++) { await cdp.send('HeapProfiler.collectGarbage'); await page.waitForTimeout(150); }
  results[variant] = await page.evaluate(() => ({ alive: !!window.__ref.deref(), ended: window.__ended, nullOk: window.__nullOk ?? null }));
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
