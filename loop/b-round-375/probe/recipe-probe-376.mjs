// B round 375 -> 376: TRANSPORT-BROWSER recipe probe (v2: Fit first, so Zoom back has history). Usage: node recipe-probe-376.mjs <base> <out.json>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const outPath = process.argv[3];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  const tr = page.getByTestId('arrangement-transport');
  const active = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}|${a.getAttribute('aria-label') ?? a.textContent?.trim().slice(0, 30)}|${a.getAttribute('data-testid') ?? ''}` : null; });
  const btn = (re) => tr.getByRole('button', { name: re }).first();
  const state = async (loc) => ({ title: await loc.getAttribute('title'), dis: await loc.getAttribute('aria-disabled'), pressed: await loc.getAttribute('aria-pressed') });
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 180000 });
    r.a = { undo: await state(btn(/^Undo/)), redo: await state(btn(/^Redo/)), loop: await state(btn(/^Loop$/)), zoomBack: await state(tr.getByTestId('arrangement-zoom-back')), zoomRange: await state(tr.getByTestId('arrangement-zoom-range')) };
    await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    r.b = { undoText: (await btn(/^Undo/).textContent())?.trim(), undo: await state(btn(/^Undo/)) };
    await btn(/^Undo/).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    r.d = { afterEnterUndo: await active(), undo: await state(btn(/^Undo/)), redo: await state(btn(/^Redo/)) };
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    r.d.afterEnterRedo = await active();
    await tr.getByTestId('arrangement-fit').click(); await page.waitForTimeout(300); const slider = tr.getByTestId('arrangement-zoom'); await slider.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);
    r.e = { readout: (await tr.getByTestId('arrangement-zoom-readout').textContent())?.trim(), zoomBack: await state(tr.getByTestId('arrangement-zoom-back')) };
    await tr.getByTestId('arrangement-zoom-back').focus();
    for (let i = 0; i < 4; i++) { if ((await tr.getByTestId('arrangement-zoom-back').getAttribute('aria-disabled')) === 'true') break; await page.keyboard.press('Enter'); await page.waitForTimeout(250); }
    r.e.afterZoomBack = await active();
    await page.keyboard.press('Control+l'); await page.waitForTimeout(300);
    r.f = { loop: await state(btn(/^Loop$/)) };
    r.g = { follow: await tr.getByTestId('arrangement-follow').getAttribute('data-follow-mode') };
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) { r.error = String(e); }
  await page.context().close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
