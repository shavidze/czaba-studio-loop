// B round 323->324 planning: can a selection be shown in a folded group's overview? (S-GROUP redefinition, INFO-C323-S-GROUP-PREMISE)
// usage: node setup-probe.mjs <BASE> <out.json>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT] = process.argv.slice(2);
const res = { base: BASE, startedUtc: new Date().toISOString(), steps: {} };
const save = () => writeFileSync(OUT, JSON.stringify(res, null, 1));
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 200))); res.errors = errs;
const read = () => page.evaluate(() => {
  const t = (e) => (e?.textContent ?? '').replace(/\s+/g, ' ').trim();
  return {
    tracks: [...document.querySelectorAll('[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]')].map((b) => b.getAttribute('aria-label')),
    clipsByTrack: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '-'),
    groups: [...document.querySelectorAll('[data-testid="arrangement-group-fold"]')].map((g) => `${g.getAttribute('aria-label')}|exp=${g.getAttribute('aria-expanded')}`),
    status: t(document.querySelector('[data-testid="arrangement-status"]')),
    overviewBlocks: document.querySelectorAll('[data-overview-selected], [data-testid="arrangement-group-header"] [data-clip-id], [data-overview-clip-id]').length,
    overviewSelected: document.querySelectorAll('[data-overview-selected="true"]').length,
    clipsSelectedAria: [...document.querySelectorAll('[data-clip-id]')].filter((c) => /selected/i.test(c.getAttribute('aria-label') ?? '') || c.getAttribute('aria-selected') === 'true' || c.getAttribute('aria-pressed') === 'true').length,
    active: document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName,
  };
});
const step = async (n, fn) => { try { await fn(); res.steps[n] = await read(); } catch (e) { res.steps[n] = { error: String(e).slice(0, 300) }; } save(); };
await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 });
await page.waitForTimeout(800);
await step('start', async () => {});
const activeBtn = (re) => page.locator('[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]').filter({ hasText: re }).first();
await step('addMusic', async () => { await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); });
await step('activateSfx', async () => { await activeBtn(/SFX/i).click(); await page.waitForTimeout(400); });
await step('addToSfx', async () => { await page.getByRole('option').nth(1).focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500); });
await step('selectRowsMusicSfx', async () => { await activeBtn(/Music/i).click(); await page.waitForTimeout(300); await page.keyboard.down('Shift'); await activeBtn(/SFX/i).click(); await page.keyboard.up('Shift'); await page.waitForTimeout(300); });
await step('ctrlG', async () => { await page.keyboard.press('Control+KeyG'); await page.waitForTimeout(600); });
await step('collapse', async () => { await page.locator('[data-testid="arrangement-group-fold"]').first().click(); await page.waitForTimeout(500); });
await step('ctrlA-folded-after-fold-click', async () => { await page.keyboard.press('Control+KeyA'); await page.waitForTimeout(500); });
await page.screenshot({ path: OUT.replace(/\.json$/, '-ctrlA-folded.png') });
await step('unfold', async () => { await page.locator('[data-testid="arrangement-group-fold"]').first().click(); await page.waitForTimeout(500); });
await step('clickMusicClipName', async () => { await page.locator('[data-clip-id]').first().locator('[data-testid="arrangement-clip-name"], [data-clip-name]').first().click({ timeout: 3000 }).catch(async () => { await page.locator('[data-clip-id]').first().click({ position: { x: 20, y: 6 } }); }); await page.waitForTimeout(400); });
await step('foldWithOneSelected', async () => { await page.locator('[data-testid="arrangement-group-fold"]').first().click(); await page.waitForTimeout(500); });
await step('ctrlA-after-body-focus', async () => { await page.locator('[data-testid="arrangement-status"]').click().catch(() => {}); await page.keyboard.press('Control+KeyA'); await page.waitForTimeout(500); });
await page.screenshot({ path: OUT.replace(/\.json$/, '-ctrlA-body.png') });
await page.screenshot({ path: OUT.replace(/\.json$/, '.png') });
res.endedUtc = new Date().toISOString(); save();
await browser.close();
