// B round 322->323 planning: confirm S-CLICK 2-lane and S-GROUP setups exist in the demo /studio-lab.
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
await page.screenshot({ path: OUT.replace(/\.json$/, '.png') });
res.endedUtc = new Date().toISOString(); save();
await browser.close();
