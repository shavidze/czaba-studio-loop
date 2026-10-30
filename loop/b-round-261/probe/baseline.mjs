import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const label = process.argv[3] ?? 'head';
const res = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto((process.env.BASE ?? 'http://127.0.0.1:5173') + '/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const box = async (sel) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, right: Math.round(r.right * 10) / 10, bottom: Math.round(r.bottom * 10) / 10 };
  }, sel);
  const v = `${w}x${h}`;
  const take = async (state) => ({
    header: await box('header'),
    transport: await box('[data-testid="arrangement-transport"]') ?? await box('header + *'),
    master: await box('[data-testid="arrangement-master"]'),
    badge: await page.evaluate(() => { const s = document.querySelector('header span.rounded-sm'); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: s.textContent }; }),
    footer: await box('footer'),
    shortcuts: await page.evaluate(() => { const b = [...document.querySelectorAll('footer button')].at(-1); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, text: b.textContent }; }),
    footerLastRow: await page.evaluate(() => { const d = document.querySelector('footer > div'); if (!d) return null; const r = d.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, kids: [...d.children].map((c) => { const q = c.getBoundingClientRect(); return { tid: c.getAttribute('data-testid'), w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.x), sw: c.scrollWidth, cw: c.clientWidth }; }) }; }),
    scroller: await box('[data-testid="arrangement-timeline-scroller"]'),
    library: await box('aside'),
    detail: await box('[data-testid="arrangement-detail-panel"]'),
    status: await box('[data-testid="arrangement-status"]'),
  });
  res[v] = { normal: await take('normal') };
  await page.screenshot({ path: `${out}/${label}-full-${v}.png` });
  const clip = page.locator('[title$="— drag to move"]').first();
  if (await clip.count()) {
    await clip.click();
    await page.waitForTimeout(500);
    res[v].clipSelected = await take('clip');
    await page.screenshot({ path: `${out}/${label}-clip-${v}.png` });
  }
  await page.keyboard.press('Escape');
  await page.locator('body').click({ position: { x: 5, y: h - 5 } }).catch(() => {});
  await page.goto((process.env.BASE ?? 'http://127.0.0.1:5173') + '/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.getByTestId('arrangement-exit').focus();
  const stops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    stops.push(await page.evaluate(() => { const a = document.activeElement; if (!a) return null; return `${a.tagName}|${a.getAttribute('aria-label') ?? ''}|${a.getAttribute('data-testid') ?? ''}|${(a.textContent ?? '').trim().slice(0, 24)}|${a.closest('header') ? 'H' : a.closest('footer') ? 'F' : ''}`; }));
  }
  res[v].tabFromExit = stops;
  await page.keyboard.press('End').catch(() => {});
  await page.locator('footer button').last().focus();
  const back = [];
  for (let i = 0; i < 6; i++) { back.push(await page.evaluate(() => { const a = document.activeElement; return `${a?.tagName}|${a?.getAttribute('aria-label') ?? ''}|${(a?.textContent ?? '').trim().slice(0, 24)}`; })); await page.keyboard.press('Tab'); }
  res[v].tabFromShortcuts = back;
  res[v].errors = errors;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1).slice(0, 6000));
