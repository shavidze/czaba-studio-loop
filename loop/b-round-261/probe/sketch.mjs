import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const res = {};
const browser = await chromium.launch();
const measure = (page) => page.evaluate(() => {
  const b = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1) }; };
  const row = document.querySelector('footer > div');
  const kids = row ? [...row.children].map((c) => ({ tid: c.getAttribute('data-testid'), box: b(c), sw: c.scrollWidth, cw: c.clientWidth })) : [];
  const leaves = [...document.querySelectorAll('footer *')].filter((e) => e.children.length === 0).map((e) => b(e));
  let overlaps = 0;
  const m = document.querySelector('[data-testid="arrangement-master"]');
  const mb = b(m);
  for (const k of kids) { if (k.tid === 'arrangement-master' || !k.box || !mb) continue; if (k.box.right > mb.x + 0.5 && k.box.x < mb.right - 0.5 && k.box.bottom > mb.y && k.box.y < mb.bottom) overlaps++; }
  return { header: b(document.querySelector('header')), footer: b(document.querySelector('footer')), master: mb, scroller: b(document.querySelector('[data-testid="arrangement-timeline-scroller"]')), detail: b(document.querySelector('[data-testid="arrangement-detail-panel"]')), library: b(document.querySelector('aside')), kids, overlaps, rowH: b(row)?.h, footerOverflow: document.querySelector('footer').scrollWidth - document.querySelector('footer').clientWidth };
});
const move = (page) => page.evaluate(() => {
  const m = document.querySelector('[data-testid="arrangement-master"]');
  const row = document.querySelector('footer > div');
  const btn = [...row.children].at(-1);
  row.insertBefore(m, btn);
});
for (const [w, h] of [[1440, 900], [1280, 720], [1024, 720]]) {
  const v = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto((process.env.BASE ?? 'http://127.0.0.1:5173') + '/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  res[v] = { headEmpty: await measure(page) };
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(1200);
  res[v].headClip = await measure(page);
  await page.screenshot({ path: `${out}/head-clip-${v}.png` });
  await move(page);
  await page.waitForTimeout(300);
  res[v].sketchClip = await measure(page);
  await page.screenshot({ path: `${out}/sketch-clip-${v}.png` });
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/sketch.json`, JSON.stringify(res, null, 1));
for (const v in res) for (const s in res[v]) { const r = res[v][s]; console.log(v, s, 'hdr', r.header.h, 'ftr', r.footer.h, r.footer.y, 'row', r.rowH, 'master', JSON.stringify(r.master), 'scroller', r.scroller.h, 'detail', r.detail?.y, r.detail?.h, 'overlaps', r.overlaps, 'ovf', r.footerOverflow, 'kids', JSON.stringify(r.kids.map(k => [k.tid, k.box.x, k.box.w, k.box.y, k.box.h, k.sw > k.cw]))); }
