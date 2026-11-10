// B round 435 -> 436 (COPY-PD-VIS stage 1: STUDIO-VIS-4 + SR-435-2 + STUDIO-VIS-6). Real Chromium.
// usage: node copy-probe.mjs <base> <outdir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'head';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = { base, chromium: browser.version() };
const OLD = /source offset/i;
async function scan(page) {
  return page.evaluate(() => {
    const re = /source offset/i;
    const text = document.body.innerText;
    const attrs = [];
    for (const el of document.querySelectorAll('*')) for (const a of ['aria-label', 'title', 'aria-description', 'aria-valuetext', 'placeholder']) { const v = el.getAttribute(a); if (v && re.test(v)) attrs.push(`${a}=${v}`); }
    return { textHits: (text.match(/source offset/gi) ?? []).length, attrHits: attrs, clipOriginText: (text.match(/clip origin/gi) ?? []).length };
  });
}
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const r = {};
  await page.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => { r.readyTimeout = true; });
  r.scanEmpty = await scan(page);
  await page.getByTestId('arrangement-library-list').getByRole('option').first().click();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-clip-id]', { timeout: 30000 });
  await page.waitForTimeout(800);
  const clip = page.locator('[data-clip-id]').first();
  await clip.click({ position: { x: 40, y: 6 } });
  await page.waitForTimeout(600);
  const startVisible = await page.getByTestId('arrangement-detail-start').isVisible();
  r.detailExpandedByProbe = false;
  if (!startVisible) { await page.getByTestId('arrangement-detail-toggle').click(); await page.waitForTimeout(600); r.detailExpandedByProbe = true; }
  r.detail = await page.evaluate(() => {
    const box = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) }; };
    const s = document.querySelector('[data-testid="arrangement-detail-start"]');
    const e = document.querySelector('[data-testid="arrangement-detail-end"]');
    const content = document.querySelector('[data-testid="arrangement-detail-content"]');
    const offsetRow = content ? [...content.querySelectorAll('p')].find((p) => /origin|offset/i.test(p.textContent ?? '')) : null;
    return {
      fromLabel: s?.closest('label')?.firstChild?.textContent ?? null, toLabel: e?.closest('label')?.firstChild?.textContent ?? null,
      fromLabelBox: box(s?.closest('label')), toLabelBox: box(e?.closest('label')), startBox: box(s), endBox: box(e),
      startName: s?.getAttribute('aria-label'), endName: e?.getAttribute('aria-label'), startValue: s?.value, endValue: e?.value,
      offsetRowText: offsetRow?.textContent?.replace(/\s+/g, ' ').trim() ?? null, offsetRowBox: box(offsetRow),
      offsetRowOverflow: offsetRow ? offsetRow.scrollWidth - offsetRow.clientWidth : null,
      contentBox: box(content), panelBox: box(document.querySelector('[data-testid="arrangement-detail-panel"]')),
    };
  });
  r.footer = await page.evaluate(() => { const el = [...document.querySelectorAll('[title^="Clip: "]')][0]; if (!el) return null; return { text: el.textContent.replace(/\s+/g, ' ').trim(), title: el.getAttribute('title'), overflow: el.scrollWidth - el.clientWidth, w: el.clientWidth }; });
  await page.getByTestId('arrangement-detail-start').fill('1');
  await page.getByTestId('arrangement-detail-end').fill('2');
  await page.getByTestId('arrangement-detail-apply').click();
  await page.waitForTimeout(500);
  r.rangeAfterSet = await page.evaluate(() => [...document.querySelectorAll('[role="status"], [aria-live]')].map((n) => n.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
  r.rangeReadout = await page.evaluate(() => { const m = document.body.innerText.split('\n').find((l) => /Time selection: /.test(l)); return m ?? null; });
  r.statusSelected = await page.evaluate(() => [...document.querySelectorAll('[role="status"], [aria-live]')].map((n) => n.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
  r.footerClipLine = await page.evaluate(() => { const m = document.body.innerText.split('\n').find((l) => /^Clip: /.test(l.trim())); return m ?? null; });
  r.scanSelected = await scan(page);
  await page.screenshot({ path: `${out}/selected-${key}.png` });
  const cb = await clip.boundingBox();
  await page.mouse.move(cb.x + 40, cb.y + 6);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(cb.x + 40 + i * 10, cb.y + 6); await page.waitForTimeout(30); }
  await page.mouse.up();
  await page.waitForTimeout(700);
  r.statusAfterMove = await page.evaluate(() => [...document.querySelectorAll('[role="status"], [aria-live]')].map((n) => n.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
  r.scanAfterMove = await scan(page);
  const cb2 = await clip.boundingBox();
  await page.mouse.move(cb2.x + 2, cb2.y + cb2.height - 4);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(cb2.x + 2 + i * 8, cb2.y + cb2.height - 4); await page.waitForTimeout(30); }
  await page.mouse.up();
  await page.waitForTimeout(700);
  r.statusAfterTrim = await page.evaluate(() => [...document.querySelectorAll('[role="status"], [aria-live]')].map((n) => n.textContent?.replace(/\s+/g, ' ').trim()).filter(Boolean));
  r.scanAfterTrim = await scan(page);
  r.footerAfterTrim = await page.evaluate(() => { const el = [...document.querySelectorAll('[title^="Clip: "]')][0]; return el ? { text: el.textContent.replace(/\s+/g, ' ').trim(), overflow: el.scrollWidth - el.clientWidth } : null; });
  await page.screenshot({ path: `${out}/after-move-${key}.png` });
  res[key] = r;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/copy-probe.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
