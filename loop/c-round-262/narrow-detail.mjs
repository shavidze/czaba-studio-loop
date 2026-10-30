import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const out = process.argv[2]; const label = process.argv[3] ?? 'after';
const browser = await chromium.launch();
const res = {};
for (const w of [1024, 1100, 1180, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 720 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.waitForTimeout(1200);
  res[w] = await page.evaluate(() => {
    const master = document.querySelector('[data-testid="arrangement-master"]');
    const p = document.querySelector('[data-testid="arrangement-selected-clip"]');
    const m = master.getBoundingClientRect(); const pr = p.getBoundingClientRect();
    const spans = [...p.querySelectorAll('*')].map((s) => { const q = s.getBoundingClientRect(); return { tag: s.tagName, text: (s.textContent ?? '').slice(0, 30), x: q.x, right: q.right }; });
    const visibleRight = pr.right;
    return { master: [m.x, m.right], p: [pr.x, pr.right, p.scrollWidth, p.clientWidth, getComputedStyle(p).overflow], spans, html: p.outerHTML.slice(0, 600), clippedLeafPastMaster: spans.filter((s) => s.right > m.x).map((s) => ({ ...s, hiddenByP: s.x >= visibleRight - 0.01 })) };
  });
  await page.locator('footer').screenshot({ path: `${out}/${label}-footer-clip-${w}x720.png` });
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/${label}-narrow-detail.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
