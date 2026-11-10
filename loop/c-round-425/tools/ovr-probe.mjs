// C332 OVERVIEW-SHOWN + METER-SHOWN probe. Usage: node ovr-probe.mjs <base> <WxH> <out.json>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2]; const [W, H] = process.argv[3].split('x').map(Number); const out = process.argv[4];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: W, height: H } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(2000);
const clip = page.locator('[data-clip-kind="audio"]').first();
const result = { base, viewport: `${W}x${H}`, samples: [], meters: {} };
const sample = async (label) => {
  const s = await page.evaluate(() => {
    const o = document.querySelector('[data-testid="arrangement-overview"]');
    const bars = o ? [...o.querySelectorAll('.rounded-xs')].map((b) => `${b.style.left}|${b.style.width}`) : null;
    return { extent: o?.getAttribute('data-extent') ?? null, state: o?.getAttribute('data-overview-state') ?? null, bars,
      nClips: document.querySelectorAll('[data-clip-kind="audio"]').length,
      fade: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => (c.matches('[data-fade-in]') ? c : c.querySelector('[data-fade-in]'))?.getAttribute('data-fade-in') ?? null) };
  });
  result.samples.push({ label, ...s }); writeFileSync(out, JSON.stringify(result, null, 1));
};
const meters = () => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => ({ db: m.getAttribute('data-level-db'), peak: m.getAttribute('data-peak'), state: m.getAttribute('data-state') })));
const nameBar = (c) => c.getByTitle(/ — drag to move$/);
const click = async () => { const b = await nameBar(clip).boundingBox(); await page.mouse.click(b.x + Math.min(40, b.width / 2), b.y + b.height / 2); await page.waitForTimeout(500); };
await click(); await sample('pre');
const drag = async (prefix, getBox, dx = 10) => {
  const b = await getBox(); const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); await page.waitForTimeout(250);
  for (let i = 1; i <= 4; i++) { await page.mouse.move(x + 4 + i * dx, y); await page.waitForTimeout(200); await sample(`${prefix}-move${i}`); }
  await page.mouse.up(); await page.waitForTimeout(600); await sample(`${prefix}-release`);
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample(`${prefix}-undo`);
};
await drag('fade', () => clip.getByTestId('arrangement-clip-fade-in-handle').first().boundingBox());
await drag('move', async () => { const b = await nameBar(clip).boundingBox(); return { x: b.x + 20, y: b.y, width: 0, height: b.height }; });
await drag('trim', () => clip.getByTitle('Trim — left edge', { exact: true }).first().boundingBox());
// add + delete
await page.getByTestId('arrangement-library-option-title').nth(1).click(); await page.waitForTimeout(400); await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.waitForTimeout(2000); await sample('add2');
await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample('add2-undo');
await click(); await page.keyboard.press('Delete'); await page.waitForTimeout(600); await sample('delete');
await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(600); await sample('delete-undo');
// loop toggle effect on extent (A review gap)
// METERS: play
await click();
await page.keyboard.press('Space'); await page.waitForTimeout(500);
const seq = async (tag, n = 6) => { const arr = []; for (let i = 0; i < n; i++) { arr.push(await meters()); await page.waitForTimeout(300); } result.meters[tag] = arr; };
await seq('playing');
{ const hb = await clip.getByTestId('arrangement-clip-fade-in-handle').first().boundingBox(); const x = hb.x + hb.width / 2, y = hb.y + hb.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); const arr = [];
  for (let i = 1; i <= 5; i++) { await page.mouse.move(x + 4 + i * 8, y); await page.waitForTimeout(300); arr.push(await meters()); }
  await page.mouse.up(); result.meters['fade-drag'] = arr; await page.waitForTimeout(400); await page.keyboard.press('Control+KeyZ'); }
{ const nb = await nameBar(clip).boundingBox(); const x = nb.x + 20, y = nb.y + nb.height / 2;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y); const arr = [];
  for (let i = 1; i <= 5; i++) { await page.mouse.move(x + 4 + i * 8, y); await page.waitForTimeout(300); arr.push(await meters()); }
  await page.mouse.up(); result.meters['move-drag'] = arr; await page.waitForTimeout(400); await page.keyboard.press('Control+KeyZ'); }
{ const sl = page.locator('input[aria-label^="Volume"]').first(); const bb = await sl.boundingBox(); const arr = [];
  await page.mouse.move(bb.x + bb.width * 0.5, bb.y + bb.height / 2); await page.mouse.down();
  for (let i = 1; i <= 5; i++) { await page.mouse.move(bb.x + bb.width * (0.5 + i * 0.08), bb.y + bb.height / 2); await page.waitForTimeout(300); arr.push(await meters()); }
  await page.mouse.up(); result.meters['volume-drag'] = arr; }
await page.waitForTimeout(500);
result.overLatched = await page.evaluate(() => ({ lanes: [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => m.getAttribute('data-state')), overText: [...document.querySelectorAll('[data-testid="arrangement-track-meter-over"],.sr-only')].map((e) => e.textContent).filter((t) => /over|clip/i.test(t)).slice(0, 4), masterPeak: document.querySelector('[data-testid="arrangement-master-peak"]')?.getAttribute('aria-label') }));
// try to force clip gain high to latch over
await click();
const tg = page.getByTestId('arrangement-detail-toggle'); if ((await tg.count()) && (await tg.getAttribute('aria-expanded')) === 'false') { await tg.click(); await page.waitForTimeout(600); }
const gin = page.getByTestId('arrangement-detail-clip-gain-input');
if (await gin.count()) { await gin.fill('24'); await gin.press('Enter'); await page.waitForTimeout(2500); }
result.afterGain = await page.evaluate(() => ({ lanes: [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => m.getAttribute('data-state')), overEls: document.querySelectorAll('[data-testid="arrangement-track-meter-over"]').length, overSr: [...document.querySelectorAll('.sr-only')].map((e) => e.textContent).filter((t) => /over/i.test(t)).slice(0, 3), masterPeak: document.querySelector('[data-testid="arrangement-master-peak"]')?.getAttribute('aria-label') }));
const mp = page.getByTestId('arrangement-master-peak'); if (await mp.count()) { await mp.click(); await page.waitForTimeout(600); }
result.afterReset = await page.evaluate(() => ({ lanes: [...document.querySelectorAll('[data-testid="arrangement-track-meter"]')].map((m) => m.getAttribute('data-state')), overEls: document.querySelectorAll('[data-testid="arrangement-track-meter-over"]').length, masterPeak: document.querySelector('[data-testid="arrangement-master-peak"]')?.getAttribute('aria-label') }));
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
result.errors = errors; writeFileSync(out, JSON.stringify(result, null, 1)); await browser.close();
