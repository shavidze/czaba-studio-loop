import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, w, h] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: w, height: h } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1500);
const clip = page.locator('[data-clip-kind="audio"]').first();
const nb = await clip.getByTitle(/ — drag to move$/).boundingBox();
await page.mouse.click(nb.x + 40, nb.y + nb.height / 2);
const toggle = page.getByTestId('arrangement-detail-toggle');
if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) === 'false') { await toggle.click(); await page.waitForTimeout(400); }
const handle = clip.getByTitle('Trim — right edge', { exact: true });
const info = {};
info.hb0 = await handle.boundingBox();
await handle.evaluate((el) => el.scrollIntoView({ inline: 'center', block: 'nearest' }));
await page.waitForTimeout(300);
info.hb1 = await handle.boundingBox(); info.vw = w;
const read = async (label) => { await page.waitForTimeout(250); return { label, ...(await page.evaluate(() => ({
  lane: [...document.querySelectorAll('[data-testid="arrangement-clip-waveform"] path')].map((p) => p.getAttribute('d')),
  detail: [...document.querySelectorAll('[data-testid="arrangement-detail-waveform"] path')].map((p) => p.getAttribute('d')),
  clips: JSON.stringify([...document.querySelectorAll('[data-clip-id]')].map((el) => ({ ...el.dataset, style: el.getAttribute('style') })))}))) }; };
const samples = [await read('before')];
const b = info.hb1;
if (b && b.x > 0 && b.x < w) {
  const x = b.x + b.width / 2, y = b.y + b.height - 6;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 4, y);
  for (let i = 1; i <= 3; i++) { await page.mouse.move(x - 4 - i * 10, y); await page.waitForTimeout(120); }
  samples.push(await read('mid'));
  await page.mouse.up(); samples.push(await read('released'));
  await page.keyboard.press('Control+KeyZ'); samples.push(await read('undo'));
}
info.changed = samples.length > 2 && samples[0].clips !== samples[2].clips;
info.undoRestored = samples.length > 3 && samples[0].clips === samples[3].clips;
await page.screenshot({ path: out.replace('.json', '.png') });
writeFileSync(out, JSON.stringify({ info, errors, samples }, null, 1)); await browser.close();
console.log(JSON.stringify(info), errors.length);
