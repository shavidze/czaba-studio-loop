// B round 305: after the out-first crossing (3 x '-'), scroll the timeline from 0 to the end in viewport steps.
// Per step: path d rewrites, LoAF max, scroll->double-rAF ms. End: clips whose viewBox width != expected target (all must equal the visible clip's).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, out, W = '1440', H = '900'] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: Number(W), height: Number(H) } });
  await page.addInitScript(() => { window.__loaf = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push(e.duration); }).observe({ type: 'long-animation-frame', buffered: true }); } catch {} });
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
  for (let i = 0; i < 3; i++) { await page.keyboard.press('-'); await page.waitForTimeout(400); }
  const cols = () => page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-clip-waveform]')].map((x) => (x.getAttribute('viewBox') || '').split(' ')[2]));
  const before = await cols();
  await page.evaluate(() => { window.__d = 0; new MutationObserver((ms) => { for (const m of ms) if (m.attributeName === 'd' && m.target.closest('[data-testid=arrangement-clip-waveform]')) window.__d++; }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['d'] }); });
  const steps = [];
  for (let k = 0; k < 200; k++) {
    const r = await page.evaluate(async () => {
      const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
      if (sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 1) return null;
      window.__loaf = []; const d0 = window.__d; const t0 = performance.now();
      sc.scrollLeft += sc.clientWidth - 224;
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const ms = performance.now() - t0;
      await new Promise((res) => setTimeout(res, 150));
      return { left: sc.scrollLeft, ms: Math.round(ms * 10) / 10, d: window.__d - d0, loaf: Math.round(Math.max(0, ...window.__loaf)) };
    });
    if (!r) break; steps.push(r);
  }
  const after = await cols();
  const res = { before: [...new Set(before)], after: [...new Set(after)], steps: steps.length, rewrites: steps.reduce((a, s) => a + s.d, 0), maxStepRewrites: Math.max(...steps.map((s) => s.d)), loafMax: Math.max(...steps.map((s) => s.loaf)), msMax: Math.max(...steps.map((s) => s.ms)), detail: steps };
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ ...res, detail: undefined }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
