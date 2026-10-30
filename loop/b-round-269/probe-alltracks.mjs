import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-269';
const OUT = process.argv[2] ?? `${DIR}/probe-alltracks-head.json`;
const BASE = process.argv[3] ?? 'http://127.0.0.1:5173';
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
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    return { lb, y, clip };
  };
  const rd = () => page.evaluate(() => {
    const v = (id) => { const e = document.querySelector(`[data-testid="${id}"]`); return e ? e.value : null; };
    const ov = document.querySelector('[data-testid="arrangement-detail-range"]');
    return {
      clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => [c.getAttribute('data-clip-start'), c.getAttribute('aria-selected') ?? c.getAttribute('data-selected')]),
      range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').slice(0, 80),
      laneOverlays: [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((e) => [e.getAttribute('data-range-start'), e.getAttribute('data-range-end')]),
      clipOverlays: [...document.querySelectorAll('[data-range-start]')].map((e) => [e.getAttribute('data-testid'), e.getAttribute('data-range-start'), e.getAttribute('data-range-end')]),
      detailStart: v('arrangement-detail-start'), detailEnd: v('arrangement-detail-end'),
      detailOverlayStyle: ov ? ov.getAttribute('style') : null,
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
    };
  });
  const dragAt = async (yy, x0, x1) => { await page.mouse.move(x0, yy); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, yy, { steps: 4 }); await page.mouse.move(x1, yy, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
  const expand = async () => { const hidden = await page.locator('[data-testid="arrangement-detail-start"]').isHidden(); r.panelWasHidden = hidden; if (hidden) { await page.locator('[data-testid="arrangement-detail-toggle"]').click(); await page.waitForTimeout(400); } };
  for (const [name, dx0, dx1] of [["allTracks", 60, 160]]) {
    const { y, clip } = await setup();
    const x1 = dx1 === null ? clip.x + clip.width + 150 : clip.x + dx1;
    await dragAt(y, clip.x + dx0, x1);
    await page.keyboard.press('Control+Shift+KeyL'); await page.waitForTimeout(300); await expand();
    r[`${name}_afterDrag`] = await rd();
    await page.screenshot({ path: `${DIR}/shots/${name}-head-${vp}.png` });
    await page.locator('[data-testid="arrangement-detail-start"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    r[`${name}_afterEnter`] = await rd();
  }
  r.errors = errors; await ctx.close();
}
writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
