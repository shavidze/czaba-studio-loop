// Usage: node wav-bytes-380.mjs <baseURL> <out.json>   e.g. http://127.0.0.1:5173
// Per viewport: fresh context; add Bass (Enter); export WAV whole project (E1); Ctrl+D then export (E2);
// time selection by body drag then export scope Time selection (E3); Master to max (End) then export (E4, overload text).
// Records sha256, bytes, the dialog done/overload text, and console errors.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const result = { base, chromium: browser.version(), viewports: {} };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const r = { steps: {} };
  await page.goto(`${base}/studio-lab`);
  await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
  const item = page.getByRole('option', { name: /^Bass/ }).first();
  if (await item.count()) { await item.click(); await page.keyboard.press('Enter'); }
  else { await page.getByRole('button', { name: 'Add', exact: true }).first().click(); }
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 30000 });
  const exportOnce = async (name, scopeRange) => {
    await page.getByRole('button', { name: /^Export/ }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.getByTestId('arrangement-export-format-wav').check();
    const range = page.getByTestId('arrangement-export-scope-range');
    const step = { rangeEnabled: (await range.count()) ? await range.isEnabled() : null };
    if (scopeRange) { if (step.rangeEnabled) await range.check(); else { step.skipped = 'range radio not enabled'; } }
    else { await page.getByTestId('arrangement-export-scope-project').check().catch(() => {}); }
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await dialog.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl;
    const buf = readFileSync(await d.path());
    step.file = d.suggestedFilename(); step.bytes = buf.length; step.sha256 = createHash('sha256').update(buf).digest('hex');
    await page.waitForTimeout(300);
    step.overload = (await page.getByTestId('arrangement-export-overload').count()) ? (await page.getByTestId('arrangement-export-overload').innerText()).trim() : null;
    step.progressLabel = (await page.getByTestId('arrangement-export-progress-label').count()) ? (await page.getByTestId('arrangement-export-progress-label').innerText()).trim() : null;
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' }).catch(() => {});
    r.steps[name] = step;
  };
  await exportOnce('E1-whole-1clip', false);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  await clip.click({ position: { x: 20, y: 8 } });
  await page.keyboard.press('Control+d');
  await page.waitForTimeout(500);
  r.clipsAfterDup = await page.locator('[data-clip-kind="audio"]').count();
  await exportOnce('E2-whole-2clips', false);
  const box = await clip.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 40, box.y + box.height * 0.7);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + box.height * 0.7, { steps: 8 });
    await page.mouse.move(box.x + 220, box.y + box.height * 0.7, { steps: 8 });
    await page.mouse.up();
  }
  await exportOnce('E3-range', true);
  const master = page.getByRole('slider', { name: /master/i }).first();
  if (await master.count()) { await master.focus(); await page.keyboard.press('End'); r.masterValue = await master.getAttribute('aria-valuetext'); }
  await exportOnce('E4-master-max', false);
  r.errors = errors;
  result.viewports[`${w}x${h}`] = r;
  await ctx.close();
}
writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await browser.close();
