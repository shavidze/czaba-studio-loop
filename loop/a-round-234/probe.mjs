import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = 'http://127.0.0.1:5173';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-234';
const browser = await chromium.launch();
const state = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  const s = document.querySelector('[data-testid="arrangement-status"]');
  const r = s?.getBoundingClientRect();
  return {
    snap: g?.getAttribute('data-snap'), division: g?.getAttribute('data-grid-division'), gridSeconds: g?.getAttribute('data-grid-seconds'),
    tempo: document.querySelector('[data-testid="arrangement-tempo-input"]')?.value ?? null,
    barsMarks: document.querySelectorAll('[data-testid="arrangement-bars-mark"]').length,
    clips: document.querySelectorAll('[data-clip-id]').length,
    status: s?.textContent, statusHeight: r?.height, statusScroll: s?.scrollWidth, statusClient: s?.clientWidth,
    has120: document.body.innerText.includes('120 BPM'),
  };
});
const res = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const [sourceId, how] of [['demo-stem-pulse', 'button'], ['demo-synth-mix', 'enter'], ['demo-soft-impact', 'button']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
    await page.waitForTimeout(800);
    const before = await state(page);
    if (sourceId === 'demo-stem-pulse') await page.screenshot({ path: `${out}/empty-${w}.png` });
    const opt = page.locator(`[data-source-id="${sourceId}"]`).first();
    if (how === 'enter') { await opt.focus(); await page.keyboard.press('Enter'); }
    else { await opt.click(); await page.waitForTimeout(300); await page.locator('button', { hasText: /^Add/ }).first().click(); }
    await page.waitForTimeout(800);
    const after = await state(page);
    await page.screenshot({ path: `${out}/after-${sourceId}-${w}.png` });
    res.push({ viewport: `${w}x${h}`, sourceId, how, before, after, errors });
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/../a-browse.json`, JSON.stringify({ round: 234, at: new Date().toISOString(), results: res }, null, 2));
console.log(JSON.stringify(res.map((r) => ({ v: r.viewport, s: r.sourceId, tempo: r.after.tempo, div: r.after.division, gs: r.after.gridSeconds, snap: r.after.snap, marks: r.after.barsMarks, h: r.after.statusHeight, fit: r.after.statusScroll <= r.after.statusClient, has120: r.after.has120, errs: r.errors.length, status: r.after.status })), null, 1));
