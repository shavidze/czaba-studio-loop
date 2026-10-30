import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const OUT = process.argv[2]; const BASE = process.argv[3] ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const setup = async () => {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
    await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1000);
    const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox(); const y = lb.y + lb.height * 0.7;
    await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
    await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
    return { lb, y, clip: await page.locator('[data-clip-id]').first().boundingBox() };
  };
  const rd = () => page.evaluate(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return { clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-start')), range: !!document.querySelector('[data-testid="arrangement-range"]'), status: s?.textContent, statusFits: s ? s.scrollWidth <= s.clientWidth : null, active: `${document.activeElement?.tagName}|${(document.activeElement?.textContent ?? '').trim().slice(0, 24)}` }; });
  const dragAt = async (yy, x0, x1) => { await page.mouse.move(x0, yy); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, yy, { steps: 4 }); await page.mouse.move(x1, yy, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
  const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(300); };
  let { lb, y, clip } = await setup();
  await page.mouse.click(clip.x + 200, y); await page.waitForTimeout(300); r.markerBefore = await rd();
  await key('Control+KeyE'); r.markerSplit = await rd();
  ({ lb, y, clip } = await setup());
  await dragAt(y, lb.x + 40, lb.x + 300); await key('Control+Shift+KeyL'); await key('Control+KeyE'); r.allTracks = await rd();
  ({ lb, y, clip } = await setup());
  await dragAt(y, clip.x + 100, clip.x + 400); r.splitBtnBefore = await rd();
  const btn = page.getByRole('button', { name: /^Split/ }); r.splitBtnCount = await btn.count();
  await btn.first().click(); await page.waitForTimeout(300); r.splitBtnAfter = await rd();
  ({ lb, y, clip } = await setup());
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300); await key('Control+KeyL'); r.loopNoRange = await rd();
  r.errors = errors; await ctx.close();
}
writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
