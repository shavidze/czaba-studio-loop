import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5174/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  const lb = await lane.boundingBox();
  await page.mouse.click(lb.x + 400, lb.y + lb.height * 0.7); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const lanes = [...document.querySelectorAll('[data-grid-seconds]:not([data-testid])')].map((l) => ({ g: l.getAttribute('data-grid-seconds'), w: Math.round(l.getBoundingClientRect().width), track: l.closest('[data-track-id]')?.getAttribute('data-track-id') }));
    const snap = [...document.querySelectorAll('button')].filter((b) => /snap/i.test(b.getAttribute('aria-label') ?? b.textContent ?? '')).map((b) => ({ label: (b.getAttribute('aria-label') ?? b.textContent).trim().slice(0, 40), pressed: b.getAttribute('aria-pressed'), keys: b.getAttribute('aria-keyshortcuts') }));
    const division = [...document.querySelectorAll('[data-grid-division]')].map((e) => e.getAttribute('data-grid-division'));
    const tempo = [...document.querySelectorAll('input')].filter((i) => /bpm|tempo/i.test(i.getAttribute('aria-label') ?? '')).map((i) => ({ label: i.getAttribute('aria-label'), value: i.value }));
    return { lanes, snap, division, tempo };
  });
  // in-clip range at HEAD, then Delete
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  const y = clip.y + clip.height * 0.7;
  await page.mouse.move(clip.x + 100, y); await page.mouse.down(); await page.mouse.move(clip.x + 250, y, { steps: 6 }); await page.mouse.move(clip.x + 400, y, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(300);
  info.inClipRange = await page.evaluate(() => (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim());
  await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  info.afterDelete = await page.evaluate(() => ({ clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-start')), status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim() }));
  out[`${w}x${h}`] = info;
  await ctx.close();
}
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
await browser.close();
