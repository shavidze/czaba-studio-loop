import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const outPath = process.argv[3];
const browser = await chromium.launch();
const out = { base };
const st = (page) =>
  page.evaluate(() => ({
    clips: document.querySelectorAll('[data-clip-id]').length,
    loop: [...document.querySelectorAll('button')]
      .find((b) => b.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L')
      ?.getAttribute('aria-pressed'),
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    active: document.activeElement?.tagName ?? null,
  }));
const altGr = (page, key, code, shiftKey = false) =>
  page.evaluate(
    ([key, code, shiftKey]) => {
      const e = new KeyboardEvent('keydown', {
        key,
        code,
        ctrlKey: true,
        altKey: true,
        shiftKey,
        modifierAltGraph: true,
        bubbles: true,
        cancelable: true,
      });
      const notPrevented = document.body.dispatchEvent(e);
      return { altGraphState: e.getModifierState('AltGraph'), notPrevented };
    },
    [key, code, shiftKey],
  );
const settle = (page) => page.waitForTimeout(350);
const blur = (page) => page.evaluate(() => document.activeElement?.blur());
for (const [w, h] of [
  [1440, 900],
  [1280, 720],
]) {
  const r = (out[`${w}x${h}`] = {});
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await blur(page);
  r.start = await st(page);
  r.altGrZ = { ev: await altGr(page, 'ż', 'KeyZ') };
  await settle(page);
  r.altGrZ.after = await st(page);
  r.altGrShiftZ = { ev: await altGr(page, 'Ż', 'KeyZ', true) };
  await settle(page);
  r.altGrShiftZ.after = await st(page);
  r.altGrY = { ev: await altGr(page, 'y', 'KeyY') };
  await settle(page);
  r.altGrY.after = await st(page);
  await page.keyboard.press('Control+Alt+KeyZ');
  await settle(page);
  r.ctrlAltZReal = await st(page);
  await page.keyboard.press('Control+KeyZ');
  await settle(page);
  r.ctrlZReal = await st(page);
  await page.keyboard.press('Control+Shift+KeyZ');
  await settle(page);
  r.ctrlShiftZReal = await st(page);
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  await page.mouse.click(box.x + 300, box.y + box.height / 2);
  await settle(page);
  await blur(page);
  r.beforeE = await st(page);
  r.altGrE = { ev: await altGr(page, 'ę', 'KeyE') };
  await settle(page);
  r.altGrE.after = await st(page);
  await page.keyboard.press('Control+Alt+KeyE');
  await settle(page);
  r.ctrlAltEReal = await st(page);
  r.altGrL = { ev: await altGr(page, 'ł', 'KeyL') };
  await settle(page);
  r.altGrL.after = await st(page);
  r.altGrA = { ev: await altGr(page, 'ą', 'KeyA') };
  await settle(page);
  r.altGrA.after = await st(page);
  r.altGrD = { ev: await altGr(page, 'd', 'KeyD') };
  await settle(page);
  r.altGrD.after = await st(page);
  await page.keyboard.press('Control+KeyE');
  await settle(page);
  r.ctrlEReal = await st(page);
  await page.keyboard.press('Control+KeyL');
  await settle(page);
  r.ctrlLReal = await st(page);
  await page.keyboard.press('Control+Alt+KeyO');
  await settle(page);
  r.ctrlAltOReal = await st(page);
  await page.keyboard.press('Control+Alt+KeyO');
  await settle(page);
  r.ctrlAltOReal2 = await st(page);
  await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}x${h}.png`) });
  r.errors = errors;
  await ctx.close();
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
await browser.close();
