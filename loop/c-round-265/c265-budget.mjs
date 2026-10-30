import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-265';
const browser = await chromium.launch(); const out = {};
const texts = (page) => page.evaluate(() => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const lines = new Set(); let n;
  while ((n = w.nextNode())) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (!t) continue; const el = n.parentElement; if (!el || el.closest('[data-grid-seconds], [data-clip-id], [role="dialog"]')) continue; const r = document.createRange(); r.selectNodeContents(n); for (const b of r.getClientRects()) { if (b.width < 1 || b.bottom < 0 || b.top > innerHeight || b.right < 0 || b.left > innerWidth) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue; lines.add(`${Math.round(b.top)}`); } }
  const all = []; const w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while ((n = w2.nextNode())) { const t = n.textContent.replace(/\s+/g, ' ').trim(); const el = n.parentElement; if (!t || !el || el.closest('[data-grid-seconds], [data-clip-id], [role="dialog"]')) continue; const b = el.getBoundingClientRect(); if (b.width < 1 || b.bottom < 0 || b.top > innerHeight) continue; all.push(t.slice(0, 60)); }
  return { lineTops: lines.size, strings: all };
});
for (const [tag, base] of [['head', 'http://127.0.0.1:5174'], ['after', 'http://127.0.0.1:5173']]) for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${tag}-${w}x${h}`; const r = (out[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1200);
  r.empty = await texts(page);
  await page.screenshot({ path: `${DIR}/shots/budget-${vp}-empty.png` });
  const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox();
  await page.mouse.click(lb.x + 400, lb.y + lb.height * 0.7); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  r.setupS = await texts(page);
  await page.screenshot({ path: `${DIR}/shots/budget-${vp}-setupS.png` });
  await ctx.close();
}
writeFileSync(`${DIR}/budget.json`, JSON.stringify(out, null, 1)); await browser.close();
for (const vp of ['1440x900', '1280x720']) for (const st of ['empty', 'setupS']) {
  const a = out[`head-${vp}`][st], b = out[`after-${vp}`][st];
  const onlyA = a.strings.filter((s) => !b.strings.includes(s)), onlyB = b.strings.filter((s) => !a.strings.includes(s));
  console.log(vp, st, 'lineTops head', a.lineTops, 'after', b.lineTops, 'strings', a.strings.length, b.strings.length, 'onlyHead', JSON.stringify(onlyA), 'onlyAfter', JSON.stringify(onlyB));
}
