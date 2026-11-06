// B round 359 -> 360 pre-check: VIDEO-FAIL-STOP variants 2 (playhead reaches a later video clip) and 3 (same, Follow paused first).
// Usage: node vfs-probe.mjs <base> <out.json> <v2|v3> [WxH]
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const base = process.argv[2]; const out = process.argv[3]; const variant = process.argv[4] ?? 'v2';
const [W, H] = (process.argv[5] ?? '1440x900').split('x').map(Number);
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await ctx.newPage();
const st = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null);
const pl = () => page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing') ?? null);
const pos = () => page.evaluate(() => document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? null);
const fm = () => page.getByTestId('arrangement-follow').evaluate((e) => ({ mode: e.getAttribute('data-follow-mode'), pressed: e.getAttribute('aria-pressed') }));
const blur = () => page.evaluate(() => document.activeElement?.blur?.());
const R = { base, variant, vp: `${W}x${H}`, steps: [] };
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByText('Full mix', { exact: true }).first().click(); await page.keyboard.press('Enter');
await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1500);
await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
const video = page.locator('[data-clip-kind="video"]').first();
await video.waitFor(); await page.waitForTimeout(1500);
const start = () => video.getAttribute('data-clip-start').then(Number);
R.videoStart0 = await start();
for (let i = 0; i < 4 && (await start()) < 2; i += 1) {
  const header = video.getByTitle(/ — drag to move$/).first();
  const b = await header.boundingBox();
  const x = b.x + Math.min(30, b.width / 4); const y = b.y + b.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  for (let s = 1; s <= 10; s += 1) { await page.mouse.move(x + s * 15, y); await page.waitForTimeout(30); }
  await page.mouse.up(); await page.waitForTimeout(500);
  R.steps.push({ drag: i, start: await start() });
}
R.videoStart = await start();
await blur();
if (variant === 'v3') { for (let i = 0; i < 8; i += 1) { await page.keyboard.press('='); await page.waitForTimeout(250); } }
await page.evaluate(() => { HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); document.activeElement?.blur?.(); });
await page.keyboard.press('Home'); await page.waitForTimeout(300);
await blur(); await page.keyboard.press('Space');
await page.waitForTimeout(400);
R.afterPlay = { playing: await pl(), pos: await pos(), status: await st(), follow: await fm() };
if (variant === 'v3') {
  await page.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); if (e) e.scrollLeft = e.scrollLeft + 300; });
  await page.mouse.move(W / 2, H / 2); await page.mouse.wheel(200, 0); await page.waitForTimeout(400);
  R.manual = { playing: await pl(), pos: await pos(), status: await st(), follow: await fm() };
}
const deadline = Date.now() + 12000;
while (Date.now() < deadline) {
  const p = await pl();
  if (p === 'false') break;
  await page.waitForTimeout(100);
}
await page.waitForTimeout(500);
R.final = { playing: await pl(), pos: await pos(), status: await st(), follow: await fm() };
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
writeFileSync(out, JSON.stringify(R, null, 1));
await browser.close();
