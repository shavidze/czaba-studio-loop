// usage: node export-compare.mjs <base> <abs out dir> <label>  (copied from c-round-386/export-wav.mjs)
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, out, label] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
await page.goto(base + '/studio-lab', { waitUntil: 'networkidle', timeout: 180000 });
await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
await page.waitForTimeout(1000);
const add = async (track, name) => {
  await page.getByTestId('arrangement-track-header').filter({ hasText: track }).first().getByText(new RegExp('^' + track)).first().click();
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: new RegExp(name) }).first().click();
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
};
for (const p of ['Pulse', 'Bass']) await add('Stems', p);
await page.getByRole('button', { name: /^Export/ }).first().click();
await page.waitForTimeout(500);
const dlg = page.getByRole('dialog');
console.log((await dlg.innerText()).replace(/\s+/g, ' ').slice(0, 250));
await dlg.getByRole('radio', { name: /^WAV · 24/ }).check().catch(async () => { await dlg.getByText(/^WAV · 24-bit/).first().click().catch(()=>{}); });
const btns = await dlg.getByRole('button').allInnerTexts(); console.log('buttons', btns);
const [dl] = await Promise.all([
  page.waitForEvent('download', { timeout: 90000 }),
  dlg.getByRole('button', { name: /^Export|Download|Render/i }).last().click(),
]);
const path = `${out}/export-${label}.wav`; await dl.saveAs(path);
const b = readFileSync(path); const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
const tag = (o) => b.toString('latin1', o, o + 4);
let o = 12, fmt = null, dataOff = 0, dataLen = 0;
while (o < b.length - 8) { const id = tag(o), len = dv.getUint32(o + 4, true); if (id === 'fmt ') fmt = { fmt: dv.getUint16(o + 8, true), ch: dv.getUint16(o + 10, true), sr: dv.getUint32(o + 12, true), bits: dv.getUint16(o + 22, true) }; if (id === 'data') { dataOff = o + 8; dataLen = len; break; } o += 8 + len + (len & 1); }
const bps = fmt.bits / 8, frames = dataLen / (bps * fmt.ch);
let peak = 0, nan = 0, nz = 0;
const get = (i) => { const p = dataOff + i * bps; return bps === 3 ? ((b[p] | (b[p + 1] << 8) | (b[p + 2] << 16)) << 8 >> 8) / 8388608 : dv.getInt16(p, true) / 32768; };
for (let i = 0; i < frames * fmt.ch; i++) { const v = get(i); if (!Number.isFinite(v)) nan++; if (Math.abs(v) > peak) peak = Math.abs(v); if (v !== 0) nz++; }
const res = { file: dl.suggestedFilename(), size: b.length, riff: tag(0), wave: tag(8), fmt, dataLen, frames, seconds: frames / fmt.sr, peak, nan, nonzeroPct: +(100 * nz / (frames * fmt.ch)).toFixed(2), clipCount: await page.locator('[data-clip-id]').count() };
console.log(res); writeFileSync(`${out}/export-wav.json`, JSON.stringify(res, null, 1));
await browser.close();
