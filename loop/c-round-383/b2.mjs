import { open } from '../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.argv[2]; const out = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const stopKind of ['library', 'transport']) {
    const { browser, page, live } = await open(base, w, h);
    const r = { vp: `${w}x${h}`, stopKind, steps: [] };
    const log = async (n) => r.steps.push({ n, live: (await live()).filter((x) => x > 30) });
    await log('ready');
    await page.getByRole('option', { name: /middle/i }).first().click().catch(() => {});
    const prev = page.getByRole('button', { name: 'Preview', exact: true }).first();
    await prev.click();
    await page.waitForFunction(() => window.__starts.length > 0, null, { timeout: 30000 }).catch(() => {});
    await log('preview-playing');
    const stopBtn = stopKind === 'library' ? page.getByRole('button', { name: 'Stop', exact: true }).and(page.locator(':not([aria-label])')) : page.locator('button[aria-label="Stop"]').first();
    r.stopHtml = (await stopBtn.first().evaluate((e) => e.outerHTML.slice(0, 120)));
    await stopBtn.first().click(); await page.waitForTimeout(2500);
    await log('after-stop');
    if (stopKind === 'library') {
      await page.getByRole('button', { name: 'Add', exact: true }).first().click(); await page.waitForTimeout(6000);
      await log('after-add');
      await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
      await page.keyboard.press('Control+z'); await page.waitForTimeout(800);
      await log('after-undo');
      await page.keyboard.press('Control+Shift+z'); await page.waitForTimeout(3000);
      await log('after-redo');
    }
    out.push(r); await browser.close(); console.log(JSON.stringify(r));
  }
}
fs.writeFileSync('b2.json', JSON.stringify(out, null, 1));
