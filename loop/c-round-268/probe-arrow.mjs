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
    const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight', code: 'ArrowRight', ...init });
    return { notPrevented: document.body.dispatchEvent(e), alt: e.altKey, altGraph: e.getModifierState('AltGraph') };
  }, init);
const CASES = {
  ctrlAltGraphNoAlt: (p) => chord(p, { ctrlKey: true, modifierAltGraph: true }),
  ctrlAltDispatched: (p) => chord(p, { ctrlKey: true, altKey: true }),
  metaAltDispatched: (p) => chord(p, { metaKey: true, altKey: true }),
  ctrlAltAltGraph: (p) => chord(p, { ctrlKey: true, altKey: true, modifierAltGraph: true }),
  plainCtrlDispatched: (p) => chord(p, { ctrlKey: true }),
  ctrlAltReal: (p) => p.keyboard.press('Control+Alt+ArrowRight'),
  plainCtrlReal: (p) => p.keyboard.press('Control+ArrowRight'),
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = (out[`${w}x${h}`] = { gesture: {}, noGesture: {} });
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  for (const mode of ['gesture', 'noGesture']) {
    for (const [name, fn] of Object.entries(CASES)) {
      const b = await page.locator('[data-clip-id]').first().boundingBox();
      await page.mouse.click(b.x + 300, b.y + b.height / 2);
      await page.waitForTimeout(300);
      await page.evaluate(() => document.activeElement?.blur());
      if (mode === 'gesture') {
        await page.mouse.move(b.x + 120, b.y + b.height / 2);
        await page.mouse.down();
        await page.mouse.move(b.x + 126, b.y + b.height / 2, { steps: 3 });
        await page.waitForTimeout(200);
      }
      const before = await st(page);
      const ev = (await fn(page)) ?? null;
      await page.waitForTimeout(250);
      const during = await st(page);
      if (mode === 'gesture') {
        await page.mouse.up();
        await page.waitForTimeout(300);
      }
      const after = await st(page);
      r[mode][name] = { ev, before, during, after, markerMoved: before.marker !== during.marker, blockedMsg: during.status.startsWith('Editing does not work while dragging'), statusChanged: before.status !== during.status };
      if (after.clips !== 1 || /moved/i.test(after.status)) {
        await page.keyboard.press('Control+KeyZ');
        await page.waitForTimeout(300);
      }
    }
  }
  await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}x${h}.png`) });
  r.errors = errors;
  await ctx.close();
}
out.finishedUtc = new Date().toISOString();
writeFileSync(outPath, JSON.stringify(out, null, 1));
await browser.close();
console.log('done');
