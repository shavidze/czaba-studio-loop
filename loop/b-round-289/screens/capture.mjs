import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const res = { screens: {}, journey: {} };
const browser = await chromium.launch();
const ready = async (page, key) => {
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => { res['readyTimeout-' + key] = true; });
  await page.waitForTimeout(1200);
};
const addTo = async (page, track, name) => {
  await page.getByTestId('arrangement-track-header').filter({ hasText: track }).first().click({ position: { x: 150, y: 12 } });
  await page.waitForTimeout(250);
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.waitForTimeout(200);
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: new RegExp(name) }).first().click();
  await page.waitForTimeout(250);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
};
const textLines = (page) => page.evaluate(() => {
  const rows = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'svg', 'path', 'OPTION'].includes(el.tagName)) continue;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
    if (!own || el.closest('.sr-only')) continue;
    let vis = true;
    for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) { vis = false; break; } }
    const r = el.getBoundingClientRect();
    if (!vis || !(r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth)) continue;
    rows.push({ region: el.closest('[data-testid]')?.getAttribute('data-testid') || el.tagName, text: own.slice(0, 120), inClip: !!el.closest('[data-clip-id]'), inLibraryList: !!el.closest('[data-testid="arrangement-library-list"], [data-testid="arrangement-library-tree"]') });
  }
  return rows;
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const state of ['S0', 'DEMO']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await ready(page, `${w}-${state}`);
    if (state === 'DEMO') {
      await addTo(page, 'Music', 'Middle East');
      await addTo(page, 'SFX', 'Soft impact');
      await addTo(page, 'Stems', 'Bass');
      await page.mouse.click(5, 5);
      await page.waitForTimeout(300);
    }
    res.screens[`${w}x${h}-${state}`] = await textLines(page);
    await page.screenshot({ path: `${out}/screen290-full-${state}-${w}x${h}.png` });
    await ctx.close();
  }
  // journey: product page -> Studio (add the stems of one track, play) -> export dialog
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const j = {};
  try {
    await page.goto('http://127.0.0.1:5173/products/middle-east', { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1500);
    j.productTitle = await page.title();
    j.productStudioLinks = await page.locator('a[href*="studio"]').evaluateAll((as) => as.map((a) => `${a.textContent.trim()} -> ${a.getAttribute('href')}`));
    await page.screenshot({ path: `${out}/journey290-1-product-${w}x${h}.png`, fullPage: false });
  } catch (e) { j.productError = String(e).slice(0, 200); }
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await ready(page, `${w}-journey`);
  for (const part of ['Pulse', 'Bass', 'Pad', 'Melody']) await addTo(page, 'Stems', part);
  j.clips = await page.locator('[data-clip-id]').evaluateAll((cs) => cs.map((c) => { const r = c.getBoundingClientRect(); return { name: c.textContent.trim().slice(0, 40), top: Math.round(r.top), left: Math.round(r.left) }; }));
  j.status = (await page.getByTestId('arrangement-status').textContent().catch(() => ''))?.trim();
  await page.getByRole('button', { name: /^Play/ }).first().click();
  await page.waitForTimeout(1500);
  j.positionAfterPlay = (await page.getByTestId('arrangement-position').textContent().catch(() => ''))?.trim();
  await page.screenshot({ path: `${out}/journey290-2-studio-playing-${w}x${h}.png` });
  await page.getByRole('button', { name: /^Stop/ }).first().click().catch(() => {});
  await page.getByRole('button', { name: /^Export/ }).first().click();
  await page.waitForTimeout(800);
  j.exportDialog = (await page.getByRole('dialog').first().innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
  await page.screenshot({ path: `${out}/journey290-3-export-${w}x${h}.png` });
  res.journey[`${w}x${h}`] = j;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/screen290.json`, JSON.stringify(res, null, 1));
for (const [k, v] of Object.entries(res.screens)) console.log(k, v.length, 'outsideTimelineLib', v.filter((r) => !r.inClip && !r.inLibraryList).length);
console.log(JSON.stringify(res.journey, null, 1));
