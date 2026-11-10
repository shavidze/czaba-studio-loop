// B333 WAVEFORM-D probe: every drawn peak path `d` (lane clips + detail panel) at fixed samples of fade, move, trim, Clip Gain and zoom gestures.
// Usage: node waveform-d-probe.mjs <base> <out.json> <width> <height>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'waveform-d.json';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
await context.route('**/peaks/*.json', (r) => r.fulfill({ status: 404, body: 'x' }));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(1500);
const clip = page.locator('[data-clip-kind="audio"]').first();
const samples = [];
const read = async (label) => {
  await page.waitForTimeout(250);
  const s = await page.evaluate(() => ({
    lane: [...document.querySelectorAll('[data-testid="arrangement-clip-waveform"] path')].map((p) => p.getAttribute('d')),
    detail: [...document.querySelectorAll('[data-testid="arrangement-detail-waveform"] path')].map((p) => p.getAttribute('d')),
    zoom: document.querySelector('[data-testid="arrangement-waveform-zoom"]')?.value ?? null,
  }));
  samples.push({ label, ...s });
};
const nameBar = () => clip.getByTitle(/ — drag to move$/);
const nb = await nameBar().boundingBox();
await page.mouse.click(nb.x + 40, nb.y + nb.height / 2);
const toggle = page.getByTestId('arrangement-detail-toggle');
if ((await toggle.count()) && (await toggle.getAttribute('aria-expanded')) === 'false') {
  await toggle.click();
  await page.waitForTimeout(400);
}
await read('S0-selected');
const drag = async (label, loc, dx) => {
  const b = await loc.first().boundingBox({ timeout: 5000 });
  const x = b.x + Math.min(b.width / 2, 40), y = b.y + b.height / 2;
  const before = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-clip-id]')].map((el) => ({ ...el.dataset, style: el.getAttribute('style') }))));
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + Math.sign(dx) * 4, y);
  for (let i = 1; i <= 3; i++) { await page.mouse.move(x + Math.sign(dx) * 4 + i * dx, y); await page.waitForTimeout(120); }
  await read(`${label}-mid`);
  await page.mouse.up();
  await read(`${label}-released`);
  const after = await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-clip-id]')].map((el) => ({ ...el.dataset, style: el.getAttribute('style') }))));
  const status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '');
  samples.at(-1).changed = before !== after;
  samples.at(-1).status = status;
  if (before !== after || label.startsWith('S6')) {
    await page.keyboard.press('Control+KeyZ');
    await read(`${label}-undo`);
  }
};
await drag('S1-fade-in', clip.getByTestId('arrangement-clip-fade-in-handle'), 10);
await drag('S2-move', nameBar(), 10);
await drag('S3-trim-start', clip.getByTitle('Trim — left edge', { exact: true }), 10);
await drag('S4-trim-end', clip.getByTitle('Trim — right edge', { exact: true }), -10);
const reselect = async () => { const b = await nameBar().boundingBox(); await page.mouse.click(b.x + 40, b.y + b.height / 2); await page.waitForTimeout(300); };
await reselect();
await read('S5-reselected');
const gain = page.getByTestId('arrangement-detail-clip-gain-input');
await gain.fill('-3');
await gain.press('Enter');
await read('S5-gain-typed');
await reselect();
await drag('S6-gain-fader', page.getByTestId('arrangement-detail-clip-gain-fader'), -8);
await page.getByTestId('arrangement-waveform-zoom').selectOption('2');
await read('S7-zoom-2x');
await drag('S8-move-at-2x', nameBar(), 10);
await page.getByTestId('arrangement-waveform-zoom').selectOption('1');
await page.keyboard.press('Escape');
await reselect();
await page.keyboard.press('Control+KeyZ');
await read('S9-gain-undo-1x');
writeFileSync(out, JSON.stringify({ viewport: [width, height], errors, samples }, null, 1));
await browser.close();
