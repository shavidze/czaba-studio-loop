import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 }).catch(() => {});
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'Play', exact: true }).click();
await page.waitForTimeout(2000);
const res = {};
for (const label of ['at0dB', 'atMinus20']) {
  if (label === 'atMinus20') {
    const f = page.getByRole('slider', { name: 'Master Volume', exact: true });
    await f.focus();
    for (let i = 0; i < 40; i++) await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1500);
  }
  const trace = await page.evaluate(async () => {
    const meter = document.querySelector('[data-testid="arrangement-master-meter"]');
    const mute = document.querySelector('[data-testid="arrangement-master"] button[aria-pressed]');
    const pre = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 400) { pre.push([+(performance.now() - t0).toFixed(0), meter.getAttribute('data-level-db')]); await new Promise((r) => setTimeout(r, 20)); }
    mute.click();
    const tc = performance.now();
    const post = [];
    while (performance.now() - tc < 3500) { const v = meter.getAttribute('data-level-db'); post.push([+(performance.now() - tc).toFixed(0), v]); if (v === '-inf') break; await new Promise((r) => setTimeout(r, 20)); }
    return { pre, post, pressed: mute.getAttribute('aria-pressed') };
  });
  const pts = trace.post.filter(([, v]) => v !== '-inf').map(([t, v]) => [t, Number(v)]);
  const later = pts.filter(([t]) => t >= 100);
  let slope = null;
  if (later.length > 2) { const [ta, va] = later[0]; const [tb, vb] = later.at(-1); slope = ((vb - va) / ((tb - ta) / 1000)); }
  const preLevel = Number(trace.pre.at(-1)[1]);
  res[label] = { preLevel, msToInf: trace.post.at(-1)[0], lastValue: trace.post.at(-1)[1], predictedReleaseMs: Math.round(((preLevel + 60) / 20) * 1000), slopeDbPerSec: slope && +slope.toFixed(1), pressed: trace.pressed, post: trace.post };
  await page.getByRole('button', { name: 'Master Mute', exact: true }).click();
  await page.waitForTimeout(1500);
}
await browser.close();
writeFileSync('mute-trace.json', JSON.stringify(res, null, 1));
for (const [k, r] of Object.entries(res)) console.log(k, { preLevel: r.preLevel, msToInf: r.msToInf, last: r.lastValue, predicted: r.predictedReleaseMs, slope: r.slopeDbPerSec, pressed: r.pressed, first: r.post.slice(0, 6) });
