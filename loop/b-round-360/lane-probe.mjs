// B round 360 -> 361 pre-check at HEAD: ACTIVE-LANE, GROUP-RING, PASTE-LANE recipes.
// Usage: node lane-probe.mjs <base> <out.json> [WxH] [all|active]
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const base = process.argv[2]; const out = process.argv[3];
const [W, H] = (process.argv[4] ?? '1440x900').split('x').map(Number);
const mode = process.argv[5] ?? 'all';
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch();
const R = { base, vp: `${W}x${H}`, mode };
async function fresh() {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 120000 });
  await page.waitForTimeout(1000);
  return page;
}
const read = (page) => page.evaluate(() => {
  const active = [...document.querySelectorAll('[data-track-id] button[aria-pressed="true"]')]
    .map((b) => b.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '').filter((id) => id !== '');
  const line = [...document.querySelectorAll('*')].find((e) => e.children.length <= 2 && /^Active track:/.test((e.textContent ?? '').trim()));
  const groups = [...document.querySelectorAll('[data-group-id]')].map((g) => ({ id: g.getAttribute('data-group-id'), containsActive: g.getAttribute('data-contains-active') }));
  const clips = [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => c.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null);
  return { active, libraryLine: line ? line.textContent.trim().replace(/\s+/g, ' ') : null, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null, groups, audioClipLanes: clips };
});
const laneBtn = (page, id) => page.locator(`[data-track-id="${id}"] button[aria-pressed]`).first();
const blur = (page) => page.evaluate(() => document.activeElement?.blur?.());
async function addFullMix(page) {
  await page.getByText('Full mix', { exact: true }).first().click(); await page.keyboard.press('Enter');
  await page.locator('[data-clip-kind="audio"]').first().waitFor(); await page.waitForTimeout(1200);
}
const clipHeader = (page) => page.locator('[data-clip-kind="audio"]').first().getByTitle(/ — drag to move$/).first();
{ // ACTIVE-LANE
  const page = await fresh(); const A = {};
  A.start = await read(page);
  await addFullMix(page); A.afterAdd = await read(page);
  await laneBtn(page, 'stems').click(); await page.waitForTimeout(400); A.afterStemsClick = await read(page);
  await clipHeader(page).click(); await page.waitForTimeout(400); A.afterClipClick = await read(page);
  await laneBtn(page, 'stems').click(); await page.waitForTimeout(300);
  await page.getByText('Full mix', { exact: true }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  A.afterEnterOnStems = await read(page);
  R.activeLane = A; await page.screenshot({ path: out.replace(/\.json$/, '-active.png') }); await page.context().close();
}
if (mode === 'all') {
  { // GROUP-RING
    const page = await fresh(); const G = {};
    await laneBtn(page, 'stems').click(); await laneBtn(page, 'sfx').click({ modifiers: ['Shift'] });
    await blur(page); await page.keyboard.press('Control+g'); await page.waitForTimeout(500);
    G.afterGroup = await read(page);
    await laneBtn(page, 'sfx').click(); await page.waitForTimeout(300);
    const fold = page.getByRole('button', { name: /^Fold or unfold group — / }).first();
    G.foldName = await fold.getAttribute('aria-label').catch(() => null) ?? await fold.textContent().catch(() => null);
    await fold.click(); await page.waitForTimeout(500); G.afterCollapse = await read(page);
    await laneBtn(page, 'music').click(); await page.waitForTimeout(400); G.afterMusicClick = await read(page);
    R.groupRing = G; await page.screenshot({ path: out.replace(/\.json$/, '-group.png') }); await page.context().close();
  }
  { // PASTE-LANE
    const page = await fresh(); const P = {};
    await addFullMix(page);
    await clipHeader(page).click(); await page.waitForTimeout(300); await blur(page);
    await page.keyboard.press('Control+c'); await page.waitForTimeout(300);
    await laneBtn(page, 'sfx').click(); await page.waitForTimeout(300); await blur(page);
    await page.keyboard.press('Control+v'); await page.waitForTimeout(1200);
    P.afterPaste = await read(page);
    R.pasteLane = P; await page.screenshot({ path: out.replace(/\.json$/, '-paste.png') }); await page.context().close();
  }
}
writeFileSync(out, JSON.stringify(R, null, 1));
await browser.close();
