// C329 own probe: the viewport-bound branch (timeline width from the viewport, not the end) during a header move.
// usage: node vp-bound-probe.mjs <base> <out.json>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2];
const out = process.argv[3];
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const result = {};
const snap = () => {
  const c = document.querySelector('[data-clip-kind="audio"]');
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
  return { end: document.querySelector('[data-testid="arrangement-project-end"]')?.textContent, ruler: document.querySelector('[data-testid="arrangement-ruler"]')?.getBoundingClientRect().width, scrollW: sc?.scrollWidth, clientW: sc?.clientWidth, start: c?.getAttribute('data-clip-start'), clipW: c ? Math.round(c.getBoundingClientRect().width * 10) / 10 : null, extent: document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('data-extent'), ovText: document.querySelector('[data-testid="arrangement-overview"]')?.getAttribute('aria-valuetext'), zoom: document.querySelector('input[aria-label="Zoom (px/s)"]')?.value };
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  const clip = page.locator('[data-clip-kind="audio"]').first();
  await clip.waitFor(); await page.waitForTimeout(1000);
  const zoom = page.locator('input[aria-label="Zoom (px/s)"]');
  const min = await zoom.getAttribute('min');
  await zoom.fill(min ?? '1').catch(async () => { await zoom.focus(); for (let i = 0; i < 60; i += 1) await page.keyboard.press('ArrowLeft'); });
  await page.waitForTimeout(800);
  const pre = await page.evaluate(snap);
  await page.evaluate(() => {
    window.__s = [];
    window.addEventListener('pointermove', () => requestAnimationFrame(() => window.__s.push(window.__snap())), true);
  });
  await page.evaluate(`window.__snap = ${snap.toString()}`);
  const b = await clip.getByTitle(/ — drag to move$/).boundingBox();
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 40, y, { steps: 20 });
  await page.waitForTimeout(300);
  const samples = await page.evaluate(() => window.__s);
  await page.mouse.up(); await page.waitForTimeout(500);
  const after = await page.evaluate(snap);
  await page.screenshot({ path: out.replace(/\.json$/, `-${w}x${h}.png`) });
  result[`${w}x${h}`] = { zoomMin: min, pre, moves: samples.length, distinctRulerWidths: [...new Set(samples.map((s) => s.ruler))], distinctEnds: new Set(samples.map((s) => s.end)).size, viewportBound: pre.ruler !== undefined && pre.scrollW <= pre.clientW + 2, samples, afterRelease: after, errors };
  await context.close();
}
await browser.close();
writeFileSync(out, JSON.stringify(result, null, 1));
