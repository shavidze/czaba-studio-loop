import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, w, h] = [process.argv[2], process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: w, height: h } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.setInputFiles('[data-testid="arrangement-video-input"]', '/home/runner/czaba-project/store/public/videos/hero/1.mp4');
await page.waitForFunction(() => document.querySelectorAll('[data-clip-kind="video"]').length > 0, null, { timeout: 60000 });
await page.waitForTimeout(2500);
const clip = page.locator('[data-clip-kind="video"]').first();
const read = async (label) => { await page.waitForTimeout(300); return { label, ...(await page.evaluate(() => ({
  vid: [...document.querySelectorAll('[data-clip-kind="video"] [data-testid="arrangement-clip-waveform"] path')].map((p) => p.getAttribute('d')),
  zoom: document.querySelector('[data-testid="arrangement-waveform-zoom"]')?.value ?? null,
  wf: document.querySelectorAll('[data-testid="arrangement-clip-waveform"]').length,
  clips: [...document.querySelectorAll('[data-clip-kind="video"]')].map((el) => el.getAttribute('style') + el.dataset.clipStart)}))) }; };
const samples = [];
const nb = await clip.getByTitle(/ — drag to move$/).first().boundingBox();
await page.mouse.click(nb.x + 40, nb.y + nb.height / 2);
samples.push(await read('select-1x'));
const z = page.getByTestId('arrangement-waveform-zoom');
const zc = await z.count();
if (zc) { await z.selectOption('4'); samples.push(await read('zoom-4x')); await z.selectOption('1'); }
const b = await clip.getByTitle(/ — drag to move$/).first().boundingBox();
const x = b.x + 40, y = b.y + b.height / 2;
await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 4, y);
for (let i = 1; i <= 3; i++) { await page.mouse.move(x + 4 + i * 10, y); await page.waitForTimeout(120); }
samples.push(await read('move-mid')); await page.mouse.up(); samples.push(await read('move-released'));
await page.keyboard.press('Control+KeyZ'); samples.push(await read('move-undo'));
writeFileSync(out, JSON.stringify({ zoomSelectorPresent: zc, errors, samples }, null, 1)); await browser.close();
console.log(zc, errors.length, samples.map((s) => `${s.label}:${s.wf}/${s.vid.length}`).join(' '));
