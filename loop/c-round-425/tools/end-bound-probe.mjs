// B328: per-move project end, ruler width, overview data-extent/aria-valuetext in the harness-like move drag (60 steps, +120 px), 1440x900 and 1280x720.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'end-bound-head.json';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const result = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await context.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  const clip = page.locator('[data-clip-kind="audio"]').first();
  await clip.waitFor(); await page.waitForTimeout(1200);
  await page.evaluate(() => {
    window.__s = [];
    window.addEventListener('pointermove', () => requestAnimationFrame(() => {
      const c = document.querySelector('[data-clip-kind="audio"]');
      window.__s.push({ end: document.querySelector('[data-testid="arrangement-project-end"]')?.textContent, ruler: document.querySelector('[data-testid="arrangement-ruler"]')?.getBoundingClientRect().width, scrollW: document.querySelector('[data-testid="arrangement-timeline-scroller"]')?.scrollWidth, clientW: document.querySelector('[data-testid="arrangement-timeline-scroller"]')?.clientWidth, start: c?.getAttribute('data-clip-start'), clipW: c?.getBoundingClientRect().width, extent: document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('data-extent'), ovText: document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('aria-valuetext') });
    }), true);
  });
  const b = await clip.getByTitle(/ — drag to move$/).boundingBox();
  const x = b.x + 8, y = b.y + b.height / 2;
  const pre = await page.evaluate(() => ({ end: document.querySelector('[data-testid="arrangement-project-end"]')?.textContent, ruler: document.querySelector('[data-testid="arrangement-ruler"]')?.getBoundingClientRect().width, scrollW: document.querySelector('[data-testid="arrangement-timeline-scroller"]')?.scrollWidth, clientW: document.querySelector('[data-testid="arrangement-timeline-scroller"]')?.clientWidth }));
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 60, y, { steps: 30 }); await page.mouse.move(x + 120, y, { steps: 30 });
  await page.waitForTimeout(300);
  const samples = await page.evaluate(() => window.__s);
  await page.mouse.up(); await page.waitForTimeout(500);
  const ends = [...new Set(samples.map((s) => s.end))];
  const rulers = [...new Set(samples.map((s) => s.ruler))];
  const extents = samples.map((s) => s.extent);
  const after = await page.evaluate(() => ({ end: document.querySelector('[data-testid="arrangement-project-end"]')?.textContent, extent: document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('data-extent'), ruler: document.querySelector('[data-testid="arrangement-ruler"]')?.getBoundingClientRect().width }));
  result[`${w}x${h}`] = { pre, moves: samples.length, distinctEnds: ends.length, distinctRulerWidths: rulers, distinctExtents: new Set(extents).size, extents, firstLast: [samples[0], samples.at(-1)], afterRelease: after };
  await context.close();
}
writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result, null, 1));
await browser.close();
