// Usage: node cancel-mp3.mjs <base> <out.json>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
const [base, out] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const result = { base, viewports: {} };
const sha = (b) => createHash('sha256').update(b).digest('hex');
async function setup(ctx, nDup) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`);
  await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
  const item = page.getByRole('option', { name: /^Bass/ }).first();
  await item.click(); await page.keyboard.press('Enter');
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 30000 });
  if (nDup) {
    const clip = page.locator('[data-clip-kind="audio"]').first();
    await clip.click({ position: { x: 20, y: 8 } });
    for (let i = 0; i < nDup; i++) { await page.keyboard.press('Control+d'); await page.waitForTimeout(300); }
  }
  return { page, errors };
}
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {};
  // CANCEL
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    const { page, errors } = await setup(ctx, 3);
    r.clips = await page.locator('[data-clip-kind="audio"]').count();
    let downloads = 0; page.on('download', () => downloads++);
    await page.getByRole('button', { name: /^Export/ }).first().click();
    const dialog = page.getByRole('dialog'); await dialog.waitFor();
    await page.getByTestId('arrangement-export-format-wav').check();
    await dialog.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const labels = []; let cancelled = false; let t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      const lab = (await page.getByTestId('arrangement-export-progress-label').count()) ? (await page.getByTestId('arrangement-export-progress-label').innerText().catch(() => '')) : '';
      if (lab && labels[labels.length - 1] !== lab) labels.push(lab);
      if (/Writing WAV/.test(lab)) { await page.getByTestId('arrangement-export-cancel').click({ timeout: 2000 }).catch(() => {}); cancelled = true; break; }
      if (!lab && labels.length && (await page.getByTestId('arrangement-export-cancel').count()) === 0) break;
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(1500);
    const msg = await dialog.locator('[role=status],[role=alert]').allInnerTexts().catch(() => []);
    r.cancel = { cancelClickedInWavPhase: cancelled, labels, messages: msg, downloadsAfterCancel: downloads, cancelBtnStillThere: await page.getByTestId('arrangement-export-cancel').count() };
    // second export
    const dl = page.waitForEvent('download', { timeout: 180000 });
    await dialog.getByRole('button', { name: 'Export WAV', exact: true }).click();
    const d = await dl; const buf = readFileSync(await d.path());
    r.cancel.second = { file: d.suggestedFilename(), bytes: buf.length, sha256: sha(buf) };
    await page.waitForTimeout(500);
    r.cancel.secondMsg = await dialog.locator('[role=status],[role=alert]').allInnerTexts().catch(() => []);
    r.cancel.errors = errors; console.log('cancel ok', JSON.stringify(r.cancel));
    await ctx.close();
  }
  // MP3
  {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, acceptDownloads: true });
    const { page, errors } = await setup(ctx, 0);
    r.mp3 = {};
    for (const [name, testid, btn] of [['mp3', 'arrangement-export-format-mp3', /^Export MP3/], ['both', 'arrangement-export-format-both', /^Export/]]) {
      await page.getByRole('button', { name: /^Export/ }).first().click();
      const dialog = page.getByRole('dialog'); await dialog.waitFor();
      await page.getByTestId(testid).check();
      const files = []; const handler = async (d) => { const p = await d.path(); const b = readFileSync(p); files.push({ file: d.suggestedFilename(), bytes: b.length, sha256: sha(b), head: b.subarray(0, 4).toString('latin1') }); };
      page.on('download', handler);
      const primary = dialog.locator('[data-testid="arrangement-export-footer"] button').last();
      r.mp3[name + '-button'] = (await primary.innerText()).trim();
      console.log('mp3 step', name, w, await primary.isEnabled(), JSON.stringify(await dialog.locator('[role=status],[role=alert]').allInnerTexts()));
      await primary.click({ timeout: 60000 });
      const t0 = Date.now();
      while (Date.now() - t0 < 180000) { await page.waitForTimeout(500); const m = await dialog.locator('[role=status]').allInnerTexts().catch(() => []); if (m.some((x) => /created|MP3|Done/i.test(x)) && files.length >= (name === 'both' ? 2 : 1)) break; }
      await page.waitForTimeout(800);
      page.off('download', handler);
      r.mp3[name] = { files, messages: await dialog.locator('[role=status],[role=alert]').allInnerTexts().catch(() => []) };
      await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' }).catch(() => {});
    }
    r.mp3.errors = errors;
    await ctx.close();
  }
  result.viewports[`${w}x${h}`] = r;
}
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
console.log('done');
