import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-390/out';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(process.argv[2]), height: Number(process.argv[3]) }, acceptDownloads: true });
const page = await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e).slice(0,150)));
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 180000 });
await page.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
await page.waitForTimeout(1000);
const add = async (track, name) => {
  await page.getByTestId('arrangement-track-header').filter({ hasText: track }).first().getByText(new RegExp('^' + track)).first().click();
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: new RegExp(name) }).first().click();
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
};
for (const p of ['Pulse', 'Bass', 'Pulse']) await add('Stems', p);
await page.getByRole('button', { name: /^Export/ }).first().click();
await page.waitForTimeout(500);
const dlg = page.getByRole('dialog'); const dtxt=(await dlg.innerText()).replace(/\s+/g,' ');
console.log((await dlg.innerText()).replace(/\s+/g, ' ').slice(0, 250));
await dlg.getByRole('radio', { name: /^WAV · 24/ }).check().catch(async () => { await dlg.getByText(/^WAV · 24-bit/).first().click().catch(()=>{}); });

const crypto = require('node:crypto');
const shas = [];
for (let i = 0; i < 1; i++) {
  if (i > 0) { await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(500); }
  const d = page.getByRole('dialog');
  await d.getByRole('radio', { name: /^WAV · 24/ }).check().catch(()=>{});
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 90000 }), d.getByRole('button', { name: /^Export WAV|^Export|Download|Render/i }).last().click()]);
  const p = `${out}/det-${process.argv[2]}-${i}.wav`; await dl.saveAs(p); shas.push(crypto.createHash('sha256').update(readFileSync(p)).digest('hex'));
  await page.waitForTimeout(800);
  if (await page.getByRole('dialog').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(500); }
}
const dlgAfter = await page.getByRole('dialog').count();
await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(400); await page.keyboard.press('Escape'); await page.waitForTimeout(400);
const res = { dtxt, clips: await page.locator('[data-clip-id]').count(), shas, equal: shas[0] === shas[1], dialogOpenAfterExport: dlgAfter, dialogAfterEsc: await page.getByRole('dialog').count(), errs };
console.log(res); writeFileSync(`${out}/export-det-${process.argv[2]}.json`, JSON.stringify(res, null, 1)); await browser.close();
