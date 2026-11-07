// usage: node preview-while-playing.mjs <base> <out.json> <ok|fail> [width height]
import { open } from '../../c-round-389/lib.mjs';
import fs from 'fs';
const [base, outPath, mode, w = '1440', h = '900'] = process.argv.slice(2);
const { browser, page } = await open(base, +w, +h);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message || e)));
const list = page.getByRole('listbox', { name: 'Sounds' });
const clock = () => page.evaluate(() => (document.body.innerText.match(/\d\d:\d\d\.\d\d\d/) || [''])[0]);
await list.getByRole('option', { name: /Full mix/ }).first().click();
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.waitForTimeout(800);
const routed = [];
await page.evaluate(() => {
  window.__failDecodes = 0; window.__failed = 0;
  const proto = BaseAudioContext.prototype; const dec = proto.decodeAudioData;
  proto.decodeAudioData = function (...a) {
    if (window.__failDecodes > 0) { window.__failDecodes -= 1; window.__failed += 1; return Promise.reject(new DOMException('injected decode failure', 'EncodingError')); }
    return dec.apply(this, a);
  };
});
await page.locator('button[aria-label="Play"]').first().click();
await page.waitForTimeout(1000);
await list.getByRole('option', { name: /Middle East/ }).first().click();
const startsBefore = await page.evaluate(() => window.__starts.length);
if (mode === 'fail') { await page.evaluate(() => { window.__failDecodes = 1; }); }
await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
const t0 = await clock(); await page.waitForTimeout(150); const t1 = await clock();
const r = { base, mode, vp: `${w}x${h}`, clockDuringDecode: [t0, t1] };
if (mode === 'fail') {
  await page.waitForFunction(() => /failed to load/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(300);
} else {
  await page.waitForFunction((n) => window.__starts.slice(n).some((s) => s.sec > 100), startsBefore, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
}
const a1 = await clock(); await page.waitForTimeout(800); const a2 = await clock();
r.clockAfterSettle = [a1, a2];
r.previewStarted = await page.evaluate((n) => window.__starts.slice(n).some((s) => s.sec > 100), startsBefore);
r.previewButtonText = await page.getByRole('button', { name: /^(Preview|Stop)$/ }).and(page.locator(':not([aria-label])')).first().textContent().catch(() => null);
r.failText = await page.evaluate(() => (document.body.innerText.match(/[^\n]*Middle East[^\n]*(fail|could not|not loaded)[^\n]*/i) || [null])[0]);
r.decodeFailed = await page.evaluate(() => window.__failed); r.errors = errors;
await page.screenshot({ path: outPath.replace(/\.json$/, '.png') });
fs.writeFileSync(outPath, JSON.stringify(r, null, 1)); console.log(JSON.stringify(r));
await browser.close();
