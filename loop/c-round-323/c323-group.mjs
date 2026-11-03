// C323: §4 setup (2 lanes) + S-CLICK cross-lane + S-GROUP + INFO-C322-SHIFT retry. usage: node c323-group.mjs <BASE> <tag>
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, TAG] = process.argv.slice(2);
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-323'; const SHOT = `${DIR}/shots`; mkdirSync(SHOT, { recursive: true });
const OUT = `${DIR}/group-${TAG}.json`; const res = { base: BASE, tag: TAG, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const read = (page) => page.evaluate(() => {
  const v = (id) => document.querySelector(`[data-testid="${id}"]`); const txt = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => { const cs = getComputedStyle(c); return `${c.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'}@${c.getAttribute('data-clip-start')}|sel=${cs.boxShadow !== 'none'}|z=${cs.zIndex}`; }),
    status: txt(v('arrangement-status')), count: v('arrangement-selection-count') ? txt(v('arrangement-selection-count')) : null,
    selectedClip: v('arrangement-selected-clip') ? txt(v('arrangement-selected-clip')) : null,
    detail: txt(v('arrangement-detail-panel')).slice(0, 200),
    folds: [...document.querySelectorAll('[data-testid="arrangement-group-fold"]')].map((g) => `${g.getAttribute('aria-label')}|exp=${g.getAttribute('aria-expanded')}`),
  };
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = { steps: {} }); save();
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const errors = []; r.errors = errors;
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const step = async (n, fn) => { try { const x = await fn(); r.steps[n] = { ...(x && typeof x === 'object' && !Array.isArray(x) && x.note ? { note: x.note } : {}), ...(await read(page)) }; } catch (e) { r.steps[n] = { error: String(e).slice(0, 300) }; } save(); };
  const bar = (i) => page.locator('[data-clip-id]').nth(i).getByTitle(/ — drag to move$/).first();
  const barOf = (track, i = 0) => page.locator(`[data-track-id="${track}"] [data-clip-id]`).nth(i).getByTitle(/ — drag to move$/).first();
  const clickAt = async (loc, mods = []) => { const b = await loc.boundingBox({ timeout: 5000 }); for (const m of mods) await page.keyboard.down(m); await page.mouse.click(b.x + Math.min(30, b.width / 2), b.y + b.height / 2); for (const m of mods) await page.keyboard.up(m); await page.waitForTimeout(400); };
  const activeBtn = (re) => page.locator('[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]').filter({ hasText: re }).first();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 }); await page.waitForTimeout(800);
  await step('s1-addMusic', async () => { await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); });
  await step('s2-dup', async () => { await clickAt(bar(0)); await page.keyboard.press('Control+KeyD'); await page.waitForTimeout(700); });
  await step('s3-activateSfx', async () => { await activeBtn(/SFX/i).click(); await page.waitForTimeout(400); });
  await step('s4-addSfx', async () => { await page.getByRole('option').nth(1).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); });
  await step('s5-zoomOut', async () => { for (let i = 0; i < 8; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(150); } await page.waitForTimeout(400); });
  r.visibleBars = await page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => { const b = c.getBoundingClientRect(); return b.right > 0 && b.left < innerWidth && b.width > 20; }));
  await page.screenshot({ path: `${SHOT}/${TAG}-setup-${vp}.png` });
  // S-CLICK cross-lane
  await step('c1-clickMusic0', () => clickAt(barOf('music', 0)));
  await step('c2-ctrlClickSfx', () => clickAt(barOf('sfx', 0), ['Control']));
  await step('c3-ctrlClickSfxOff', () => clickAt(barOf('sfx', 0), ['Control']));
  await step('c4-shiftKbdSfx', () => clickAt(barOf('sfx', 0), ['Shift']));
  await step('c5-clickMusic0', () => clickAt(barOf('music', 0)));
  await step('c6-shiftLocatorSfx', async () => { await barOf('sfx', 0).click({ modifiers: ['Shift'], position: { x: 20, y: 5 } }); await page.waitForTimeout(400); });
  await step('c7-clickMusic0', () => clickAt(barOf('music', 0)));
  await step('c8-shiftLocatorMusic1', async () => { await barOf('music', 1).click({ modifiers: ['Shift'], position: { x: 20, y: 5 } }); await page.waitForTimeout(400); });
  await step('c9-esc', async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(300); });
  // S-GROUP setup
  await step('g1-activeMusic', async () => { await activeBtn(/Music/i).click(); await page.waitForTimeout(300); });
  await step('g2-shiftActiveSfx', async () => { await page.keyboard.down('Shift'); await activeBtn(/SFX/i).click(); await page.keyboard.up('Shift'); await page.waitForTimeout(300); });
  await step('g3-ctrlG', async () => { await page.keyboard.press('Control+KeyG'); await page.waitForTimeout(700); });
  // S-GROUP
  const fold = page.locator('[data-testid="arrangement-group-fold"]').first();
  const hdr = page.locator('[data-testid="arrangement-group-header"]').first();
  await step('gs1-selectMusic', () => clickAt(barOf('music', 0)));
  await step('gs2-collapse', async () => { await fold.click(); await page.waitForTimeout(600); await page.mouse.move(5, 5); await page.waitForTimeout(300); await hdr.screenshot({ path: `${SHOT}/${TAG}-group-music-${vp}.png` }); await page.screenshot({ path: `${SHOT}/${TAG}-group-music-full-${vp}.png` }); });
  await step('gs3-unfold', async () => { await fold.click(); await page.waitForTimeout(600); });
  await step('gs4-selectSfx', () => clickAt(barOf('sfx', 0)));
  await step('gs5-collapse', async () => { await fold.click(); await page.waitForTimeout(600); await page.mouse.move(5, 5); await page.waitForTimeout(300); await hdr.screenshot({ path: `${SHOT}/${TAG}-group-sfx-${vp}.png` }); await page.screenshot({ path: `${SHOT}/${TAG}-group-sfx-full-${vp}.png` }); });
  await ctx.close();
}
res.endedUtc = new Date().toISOString(); save(); await browser.close();
