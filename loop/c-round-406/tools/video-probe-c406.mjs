import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'video-playsync.json';
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width: w, height: h } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
await page.locator('[data-clip-kind="video"]').first().waitFor(); await page.waitForTimeout(1500);
await page.evaluate(() => document.activeElement?.blur?.());
const read = () => page.evaluate(() => { const v = document.querySelector('[data-testid="arrangement-video"][data-video-role="active"]'); const t = document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? ''; const m = t.match(/(\d+):(\d+\.\d+)/); const pos = m ? Number(m[1]) * 60 + Number(m[2]) : null; return { pos, currentTime: v ? Number(v.currentTime.toFixed(3)) : null, paused: v ? v.paused : null }; });
const result = { viewport: `${w}x${h}`, windows: [] };
for (let k = 0; k < 2; k++) {
  if (k === 1) {
    const clip = page.locator('[data-clip-kind="video"]').first();
    for (let i = 0; i < 16; i++) { const bb = await clip.getByTitle(/ — drag to move$/).boundingBox(); if ((bb?.width ?? 0) >= 480) break; await page.keyboard.press('='); await page.waitForTimeout(400); }
    const drag = async (loc) => { const b = await loc.first().boundingBox(); const x = b.x + Math.min(b.width / 2, 40), y = b.y + b.height / 2; await page.mouse.move(x, y); await page.mouse.down(); for (let i = 1; i <= 4; i++) { await page.mouse.move(x + i * 10, y); await page.waitForTimeout(100); } await page.mouse.up(); await page.waitForTimeout(400); await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(500); };
    await drag(clip.getByTitle('Trim — left edge', { exact: true }));
    await drag(clip.getByTestId('arrangement-video-fade-in-handle'));
    await drag(clip.getByTitle(/ — drag to move$/));
  }
  await page.keyboard.press('Home'); await page.waitForTimeout(500);
  await page.keyboard.press('Space');
  const samples = [];
  for (let s = 1; s <= 3; s++) { await page.waitForTimeout(1000); const r = await read(); samples.push({ ...r, drift: r.pos === null || r.currentTime === null ? null : Number((r.currentTime - r.pos).toFixed(3)) }); }
  await page.keyboard.press('Space'); await page.waitForTimeout(600);
  result.windows.push(samples);
}

result.dock = await page.evaluate(() => { const d = document.querySelector('[data-testid="arrangement-video-dock"]'); return d ? { swaps: d.getAttribute('data-video-swaps'), fallbacks: d.getAttribute('data-video-fallbacks'), hardSeeks: d.getAttribute('data-video-hardseeks') } : null; });
await page.screenshot({ path: out.replace(/\.json$/, '.png') });
await page.keyboard.press('Home'); await page.waitForTimeout(500);
result.stoppedSeek = null;
try {
  const ruler = page.locator('[data-testid="arrangement-ruler"], [data-testid="arrangement-time-ruler"]').first();
  await page.evaluate(() => document.activeElement?.blur?.());
  const before = await read();
  result.stoppedBefore = before;
} catch (e) { result.stoppedSeekError = String(e); }
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
