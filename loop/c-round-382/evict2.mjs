import { open, has } from './lib.mjs';
import fs from 'fs';
const base = process.argv[2];
const out = [];
const clips = (p) => p.locator('[data-clip-kind="audio"]').count();
const wait = (p, s) => p.waitForFunction((x) => window.__detail().some((y) => Math.abs(y - x) < 0.02), s, { timeout: 30000 }).catch(() => {});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const { browser, page, live } = await open(base, w, h);
  const r = { vp: `${w}x${h}`, steps: [] };
  const log = async (name, extra = {}) => { const l = await live(); r.steps.push({ name, live: l.filter((x) => x > 30), clips: await clips(page), ...extra }); };
  await log('ready');
  // add ME (default selected)
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await wait(page, 101.35); await page.waitForTimeout(800);
  await log('add-ME');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(800);
  await log('undo');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(500);
  await log('undo-again');
  await page.keyboard.press('Control+Shift+z'); await wait(page, 101.35); await page.waitForTimeout(800);
  await log('redo');
  // select hero and add
  const hero = page.getByRole('option', { name: /hero/i }).first();
  await hero.click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await wait(page, 150.37); await page.waitForTimeout(800);
  await log('add-hero');
  out.push(r); await browser.close();
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
for (const r of out) { console.log(r.vp); for (const s of r.steps) console.log(JSON.stringify(s)); }
