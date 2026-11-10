import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-423/video';
const res = {}; const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
  await page.getByTestId('arrangement-video-input').setInputFiles('/home/runner/czaba-project/store/public/videos/hero/1.mp4');
  await page.locator('[data-clip-kind="video"]').first().waitFor(); await page.waitForTimeout(1500);
  await page.evaluate(() => document.activeElement?.blur?.());
  const read = () => page.evaluate(() => { const v = document.querySelector('[data-testid="arrangement-video"][data-video-role="active"]'); const t = document.querySelector('[data-testid="arrangement-position"]')?.textContent ?? ''; const m = t.match(/(\d+):(\d+(?:\.\d+)?)/); return { pos: m ? +m[1] * 60 + +m[2] : null, currentTime: v ? v.currentTime : null, paused: v ? v.paused : null, dur: v ? v.duration : null, state: document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent }; });
  const r = { before: await read(), seeks: [] };
  const ruler = page.getByTestId('arrangement-ruler').first(); const bb = await ruler.boundingBox();
  for (const dx of [80, 200, 40]) {
    await page.mouse.click(bb.x + dx, bb.y + bb.height / 2); await page.waitForTimeout(900);
    const s = await read(); s.drift = s.pos === null || s.currentTime === null ? null : +(s.currentTime - s.pos).toFixed(3); r.seeks.push(s);
  }
  await page.screenshot({ path: `${out}/stopped-seek-${w}.png` }); r.errs = errs.filter((e) => !/cart|CONNECTION|TUNNEL/i.test(e)); res[`${w}x${h}`] = r; await ctx.close();
}
writeFileSync(`${out}/stopped-seek.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await browser.close();
