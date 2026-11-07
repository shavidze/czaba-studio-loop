import { open } from './lib.mjs';
import fs from 'fs';
const out = [];
for (const base of [process.argv[2], process.argv[3]]) {
  const { browser, page, live } = await open(base, 1440, 900);
  const r = { base, steps: [] };
  const log = async (name) => r.steps.push({ name, live: (await live()).filter((x) => x > 30) });
  await log('ready'); await page.waitForTimeout(8000);
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
  await page.waitForFunction(() => window.__starts.length > 0, null, { timeout: 30000 }).catch(() => {});
  await log('preview-ME-playing');
  await page.getByRole('button', { name: 'Stop', exact: true }).first().click();
  await page.waitForTimeout(6000);
  await log('stopped+6s');
  await page.getByRole('option', { name: /hero/i }).first().click();
  await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
  await page.waitForFunction(() => window.__starts.length > 1, null, { timeout: 30000 }).catch(() => {});
  await log('preview-hero-playing');
  await page.getByRole('button', { name: 'Stop', exact: true }).first().click();
  await page.waitForTimeout(3000);
  await log('hero-stopped+3s');
  out.push(r); await browser.close();
}
fs.writeFileSync('evict3.json', JSON.stringify(out, null, 1));
for (const r of out) { console.log(r.base); for (const s of r.steps) console.log(JSON.stringify(s)); }
