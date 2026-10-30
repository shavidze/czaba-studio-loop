import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const outPath = process.argv[3];
const browser = await chromium.launch();
const out = { base, startedUtc: new Date().toISOString() };
const st = (page) =>
  page.evaluate(() => ({
    clips: document.querySelectorAll('[data-clip-id]').length,
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
  }));
const chord = (page, init) =>
  page.evaluate((init) => {
    const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    return { notPrevented: document.body.dispatchEvent(e), alt: e.altKey, altGraph: e.getModifierState('AltGraph') };
  }, init);
const CASES = {
  ctrlAltGraphNoAlt: (p) => chord(p, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, modifierAltGraph: true }),
  ctrlAltReal: (p) => p.keyboard.press('Control+Alt+ArrowRight'),
  metaAltReal: (p) => p.keyboard.press('Meta+Alt+ArrowRight'),
  ctrlAltAltGraph: (p) => chord(p, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, altKey: true, modifierAltGraph: true }),
  plainCtrlReal: (p) => p.keyboard.press('Control+ArrowRight'),
};
for (const [w, h] of [
  [1440, 900],
  [1280, 720],
]) {
  const r = (out[`${w}x${h}`] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(
    () => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'),
    undefined,
    { timeout: 120000 },
  );
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  for (const [name, fn] of Object.entries(CASES)) {
    // fresh state: click inside the clip (sets marker 7.5), then hold a drag
    const b = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.click(b.x + 300, b.y + b.height / 2);
    await page.waitForTimeout(300);
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(b.x + 120, b.y + b.height / 2);
    await page.mouse.down();
    await page.mouse.move(b.x + 126, b.y + b.height / 2, { steps: 3 });
    await page.waitForTimeout(200);
    const before = await st(page);
    const ev = (await fn(page)) ?? null;
    await page.waitForTimeout(250);
    const during = await st(page);
    await page.mouse.up();
    await page.waitForTimeout(300);
    const after = await st(page);
    r[name] = { ev, before, during, afterRelease: after, markerMovedDuringGesture: before.marker !== during.marker, blockedMsg: during.status.startsWith('Editing does not work while dragging') };
    // reset any move via undo if the drag moved the clip
    if (after.status.startsWith('Moved') || after.status.includes('moved')) {
      await page.keyboard.press('Control+KeyZ');
      await page.waitForTimeout(300);
    }
  }
  r.errors = errors;
  writeFileSync(outPath, JSON.stringify(out, null, 1));
  await ctx.close();
}
out.finishedUtc = new Date().toISOString();
writeFileSync(outPath, JSON.stringify(out, null, 1));
await browser.close();
console.log('done');
