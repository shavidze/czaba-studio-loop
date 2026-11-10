// usage: node press-export-probe.mjs <base> <absolute outdir>
// (1) lane height handle: press at the border row, 1 px and 5 px above it, drag 20 px down, read the next lane's top shift; (2) a real WAV export: download bytes start with RIFF and the button returns to its idle label and opacity.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, out] = [process.argv[2], process.argv[3]];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = { base };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`; const r = { press: {} };
  for (const where of ['border-row', '1px-above', '5px-above']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    const page = await ctx.newPage();
    await page.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded', timeout: 180000 });
    await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => { r.readyTimeout = true; });
    const handle = page.locator('[data-testid="arrangement-track-height"]').first();
    const hb = await handle.boundingBox();
    const y = where === 'border-row' ? hb.y + hb.height + 0.5 : where === '1px-above' ? hb.y + hb.height - 1.5 : hb.y + 1.5;
    const x = hb.x + 240;
    const before = hb.y;
    const hit = await page.evaluate(([px, py]) => { const e = document.elementFromPoint(px, py); return e ? (e.getAttribute('data-testid') ?? e.tagName) : null; }, [x, y]);
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x, y + 20, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(400);
    const after = (await handle.boundingBox()).y;
    r.press[where] = { y: +y.toFixed(1), hit, handleTopBefore: before, handleTopAfter: after, moved: +(after - before).toFixed(1) };
    if (where === '5px-above') {
      await page.getByTestId('arrangement-library-list').getByRole('option').first().click();
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-clip-id]', { timeout: 30000 });
      await page.getByRole('button', { name: /^Export/ }).first().click();
      await page.getByRole('dialog').waitFor({ timeout: 10000 });
      const btn = page.getByRole('dialog').locator('div.justify-end > button').last();
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1); return b && !b.disabled; }, null, { timeout: 60000 });
      const dl = page.waitForEvent('download', { timeout: 120000 });
      await btn.click();
      const d = await dl;
      const file = `${out}/export-${key}.wav`;
      await d.saveAs(file);
      const head = fs.readFileSync(file).subarray(0, 12);
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1); return b && !b.disabled; }, null, { timeout: 60000 });
      r.export = { suggested: d.suggestedFilename(), bytes: fs.statSync(file).size, riff: head.subarray(0, 4).toString('latin1'), wave: head.subarray(8, 12).toString('latin1'),
        after: await btn.evaluate((b) => ({ text: b.textContent.trim(), opacity: getComputedStyle(b).opacity, busy: b.getAttribute('aria-busy'), disabled: b.disabled })) };
      fs.rmSync(file);
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      r.export.dialogClosedByEsc = (await page.getByRole('dialog').count()) === 0;
    }
    await ctx.close();
  }
  res[key] = r;
}
await browser.close();
fs.writeFileSync(`${out}/press-export.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
