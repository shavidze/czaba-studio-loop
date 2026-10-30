import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-266';
const OUT = process.argv[2] ?? `${DIR}/probe-split.json`;
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
  const rd = () => page.evaluate(() => ({ clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-start')), range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').slice(0, 52), laneOverlays: [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((e) => [e.getAttribute('data-range-start'), e.getAttribute('data-range-end')]), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, active: `${document.activeElement?.tagName}|${document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.slice(0, 30)}` }));
  const dragAt = async (yy, x0, x1) => { await page.mouse.move(x0, yy); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, yy, { steps: 4 }); await page.mouse.move(x1, yy, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
  const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(300); };
  // A: past-start (C-R265-01)
  let { lb, y, clip } = await setup();
  await dragAt(y, clip.x + 100, clip.x - 150); r.A_pastStart = await rd();
  await key('Control+KeyE'); r.A_split = await rd();
  await page.screenshot({ path: `${DIR}/shots/A-split-${vp}.png` });
  await key('Delete'); r.A_deleteSelected = await rd();
  await key('Control+KeyZ'); r.A_undoDelete = await rd();
  await key('Control+KeyZ'); r.A_undoSplit = await rd();
  // B: bg into clip 1-15
  ({ lb, y, clip } = await setup());
  await dragAt(y, lb.x + 40, clip.x + 200); r.B_range = await rd();
  await key('Control+KeyE'); r.B_split = await rd();
  // C: gap + two clips: make a gap 12.5-20 then range 11.25-22.5
  ({ lb, y, clip } = await setup());
  await dragAt(y, clip.x + 100, clip.x + 400); await key('Delete'); r.C_gapMade = await rd();
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
  await dragAt(y, clip.x + 50, clip.x + 500); r.C_range = await rd();
  await key('Control+KeyE'); r.C_split = await rd();
  await page.screenshot({ path: `${DIR}/shots/C-split-${vp}.png` });
  await key('Delete'); r.C_deleteSelected = await rd();
  // D: empty-only range
  ({ lb, y, clip } = await setup());
  await dragAt(y, lb.x + 40, lb.x + 300); r.D_range = await rd();
  await key('Control+KeyE'); r.D_split = await rd();
  // E: a range that fully covers a short clip (10-12.5) after making a gap 12.5-20
  ({ lb, y, clip } = await setup());
  await dragAt(y, clip.x + 100, clip.x + 400); await key('Delete');
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
  await dragAt(y, clip.x - 40, clip.x + 120); r.E_range = await rd();
  await key('Control+KeyE'); r.E_split = await rd();
  // H: focus on a clip (keyboard), in-clip-overshoot range, Ctrl+E, read activeElement
  ({ lb, y, clip } = await setup());
  await dragAt(y, clip.x + 100, clip.x - 150);
  await page.locator('[data-clip-id] button').first().focus().catch(() => {});
  r.H_before = await rd(); await key('Control+KeyE'); r.H_after = await rd();
  // F: video lane background drag
  const lanes = page.locator('[data-track-id="video"] [data-testid="arrangement-video-dropzone"]'); r.laneCount = await lanes.count();
  const vlb = await lanes.first().boundingBox(); const vy = vlb.y + vlb.height * 0.5;
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
  await dragAt(vy, vlb.x + 40, vlb.x + 300); r.F_videoRange = await rd();
  r.F_videoOverlayRow = await page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((e) => e.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null));
  // G: Ctrl+L without range, export dialog without range
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
  await key('Control+KeyL'); r.G_loopNoRange = await rd();
  await page.getByRole('button', { name: /^Export/ }).first().click(); await page.waitForTimeout(600);
  r.G_exportReason = await page.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-export-scope-range-reason"]'); if (!e) return null; const b = e.getBoundingClientRect(); return { text: e.textContent, w: b.width, h: b.height, lines: Math.round(b.height / parseFloat(getComputedStyle(e).lineHeight)) }; });
  await page.screenshot({ path: `${DIR}/shots/G-export-${vp}.png` });
  r.errors = errors; await ctx.close();
}
writeFileSync(OUT, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
