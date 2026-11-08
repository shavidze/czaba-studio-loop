// B round 406 -> 407: stopped re-seek recipe for PERF-11c-iii-d-ii (C row STOPPED-SEEK). Usage: node video-stopped-seek-probe.mjs <base> <out.json> <WxH>
// Stopped: click the ruler inside the video clip, read the active video's currentTime; drag-move the clip right and release;
// Ctrl+Z (a commit with no preview); each time the frame must sit at position - clip.start + sourceOffset (clip starts at 0, offset 0).
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'video-stopped-seek.json';
const [w, h] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: w, height: h } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
const result = { viewport: `${w}x${h}`, base, steps: [] };
try {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
  const clip = page.locator('[data-clip-kind="video"]').first();
  await clip.waitFor(); await page.waitForTimeout(1500);
  for (let i = 0; i < 16; i++) { const bb = await clip.boundingBox(); if ((bb?.width ?? 0) >= 480) break; await page.keyboard.press('='); await page.waitForTimeout(400); }
  const read = async (label) => {
    await page.waitForTimeout(900);
    const r = await page.evaluate(() => {
      const v = document.querySelector('[data-testid="arrangement-video"][data-video-role="active"]');
      const t = document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? '';
      const m = t.match(/(\d+):(\d+\.\d+)/);
      const c = document.querySelector('[data-clip-kind="video"]');
      return { pos: m ? Number(m[1]) * 60 + Number(m[2]) : null, clipStart: c ? Number(c.getAttribute('data-clip-start')) : null, currentTime: v ? Number(v.currentTime.toFixed(3)) : null, paused: v ? v.paused : null, src: v ? (v.getAttribute('src') ?? '').slice(0, 40) : null };
    });
    r.expected = r.pos === null || r.clipStart === null ? null : Number((r.pos - r.clipStart).toFixed(3));
    r.error = r.expected === null || r.currentTime === null ? null : Number(Math.abs(r.currentTime - r.expected).toFixed(3));
    result.steps.push({ label, ...r });
  };
  const cb = await clip.boundingBox();
  const ruler = await page.getByTestId('arrangement-ruler').boundingBox();
  await page.mouse.click(cb.x + cb.width * 0.4, ruler.y + ruler.height / 2);
  await read('ruler-click-stopped');
  const handle = clip.getByTitle(/ — drag to move$/).first();
  const hb = await handle.boundingBox();
  const x = hb.x + Math.min(hb.width / 2, 40), y = hb.y + hb.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(x + i * 10, y); await page.waitForTimeout(100); }
  await page.mouse.up();
  await read('after-move-release');
  await page.evaluate(() => document.activeElement?.blur?.());
  await page.keyboard.press('Control+KeyZ');
  await read('after-ctrl-z');
  await page.keyboard.press('Control+Shift+KeyZ');
  await read('after-ctrl-shift-z');
  await page.screenshot({ path: out.replace(/\.json$/, '.png') });
} catch (e) {
  result.error = String(e);
}
result.maxError = Math.max(...result.steps.map((s) => s.error ?? 99));
result.moved = result.steps.length >= 2 ? result.steps[1].clipStart !== result.steps[0].clipStart : null;
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
