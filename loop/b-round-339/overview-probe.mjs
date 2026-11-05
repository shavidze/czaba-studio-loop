// B339 collapsed-group overview probe (PERF-DRAG-PREVIEW c4-ii). Usage: node overview-probe.mjs <base> <out.json> [w] [h] [shot-prefix]
// A clip on Music and one on Stems; Stems grouped (Ctrl+G) and collapsed; Ctrl+A; drag the Music clip name bar right 120 px;
// reads the hidden Stems clip's overview block start mid-drag, after release and after Ctrl+Z.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base = 'http://127.0.0.1:5173', out = 'overview.json', w = '1440', h = '900', shot = ''] = process.argv.slice(2);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: Number(w), height: Number(h) } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const r = { viewport: `${w}x${h}` };
try {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => /Demo collection ready/.test(document.body.textContent ?? ''), null, { timeout: 180000 });
  await page.waitForTimeout(800);
  const add = page.getByRole('button', { name: 'Add', exact: true }).first();
  await add.click(); await page.waitForTimeout(800);
  const stemsHeader = page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first();
  await stemsHeader.getByText(/^Stems/).first().click(); await page.waitForTimeout(300);
  r.active = ((await page.getByText(/Active track:/).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim();
  await add.click(); await page.waitForTimeout(800);
  const clipsNow = () => page.evaluate(() => [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => ({ id: c.getAttribute('data-clip-id'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id'), start: c.getAttribute('data-clip-start') })));
  r.clipsAfterAdd = await clipsNow();
  await stemsHeader.getByText(/^Stems/).first().click(); await page.waitForTimeout(300);
  await page.keyboard.press('Control+g'); await page.waitForTimeout(600);
  r.groupRows = await page.getByTestId('arrangement-group-row').count();
  await page.getByTestId('arrangement-group-fold').first().click(); await page.waitForTimeout(600);
  r.collapsed = await page.locator('[data-group-collapsed="true"]').count();
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('Control+a'); await page.waitForTimeout(400);
  const blocks = () => page.evaluate(() => [...document.querySelectorAll('[data-overview-clip-id]')].map((b) => ({ id: b.getAttribute('data-overview-clip-id'), start: b.getAttribute('data-overview-start'), selected: b.getAttribute('data-overview-selected') })));
  r.blocksBefore = await blocks();
  r.visibleBefore = await clipsNow();
  const music = page.locator('[data-track-id="music"] [data-clip-kind="audio"]').first();
  const bar = await music.getByTitle(/ — drag to move$/).boundingBox();
  const x0 = bar.x + 40, y0 = bar.y + bar.height / 2;
  await page.mouse.move(x0, y0); await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(x0 + i * 20, y0); await page.waitForTimeout(40); }
  await page.waitForTimeout(200);
  r.blocksMid = await blocks();
  r.visibleMid = await clipsNow();
  if (shot) await page.screenshot({ path: `${shot}-mid.png` });
  await page.mouse.up(); await page.waitForTimeout(600);
  r.blocksAfter = await blocks();
  r.visibleAfter = await clipsNow();
  r.undoTitle = await page.evaluate(() => [...document.querySelectorAll('button[title^="Undo"], button[aria-label^="Undo"]')].map((b) => b.getAttribute('title') || b.getAttribute('aria-label'))[0] ?? null);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(600);
  r.blocksUndo = await blocks();
  r.visibleUndo = await clipsNow();
} catch (e) { r.error = String(e); }
r.pageErrors = errors;
writeFileSync(out, JSON.stringify(r, null, 1));
await browser.close();
console.log(JSON.stringify(r));
