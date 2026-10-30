import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const out = {};
const st = (page) => page.evaluate(() => ({
  clips: document.querySelectorAll('[data-clip-id]').length,
  loop: [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L')?.getAttribute('aria-pressed'),
  status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
}));
const fire = (page, key, code, altGraph) => page.evaluate(([key, code, altGraph]) => {
  const e = new KeyboardEvent('keydown', { key, code, ctrlKey: true, altKey: true, modifierAltGraph: altGraph, bubbles: true, cancelable: true });
  const notPrevented = document.body.dispatchEvent(e);
  return { altGraphState: e.getModifierState('AltGraph'), notPrevented };
}, [key, code, altGraph]);
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = (out[`${w}x${h}`] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.evaluate(() => document.activeElement?.blur());
  r.start = await st(page);
  r.z = { ev: await fire(page, 'ż', 'KeyZ', true) }; await page.waitForTimeout(300); r.z.after = await st(page);
  // E split: select clip + marker inside
  const box = await page.locator('[data-clip-id]').first().boundingBox().catch(() => null);
  if (r.z.after.clips === 0) { await page.keyboard.press('Control+Shift+KeyZ'); await page.waitForTimeout(300); }
  const b2 = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(b2.x + 300, b2.y + b2.height / 2); await page.waitForTimeout(300);
  await page.evaluate(() => document.activeElement?.blur());
  r.beforeE = await st(page);
  r.e = { ev: await fire(page, 'ę', 'KeyE', true) }; await page.waitForTimeout(300); r.e.after = await st(page);
  r.l = { ev: await fire(page, 'ł', 'KeyL', true) }; await page.waitForTimeout(300); r.l.after = await st(page);
  r.errors = [];
  await ctx.close();
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
await browser.close();
