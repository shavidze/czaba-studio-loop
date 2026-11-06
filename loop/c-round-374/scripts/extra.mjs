import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2], tag = process.argv[3];
const browser = await chromium.launch(); const out = {};
const ST = '[data-testid="arrangement-status"]';
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1000);
  const st = () => page.locator(ST).innerText().then((s) => s.trim());
  await page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first().getByText(/^Stems/).first().click();
  await page.getByRole('button', { name: 'All' }).first().click().catch(() => {});
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click();
  await page.waitForTimeout(250); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const r = out[`${w}x${h}`] = {};
  const strip = page.getByTestId('arrangement-bars-scrub-strip'); const bb = await strip.boundingBox();
  await page.getByRole('button', { name: /^Play/ }).first().click(); await page.waitForTimeout(800);
  r.playingStatus = await st();
  await page.mouse.click(bb.x + 500, bb.y + bb.height / 2); await page.waitForTimeout(500);
  r.afterClickWhilePlaying = await st(); r.pos = await page.getByTestId('arrangement-position').textContent();
  await page.getByRole('button', { name: /^Stop/ }).first().click(); await page.waitForTimeout(400);
  r.afterStop = await st();
  // click ruler (non-strip) while stopped, then Space play, Space stop
  await page.mouse.click(bb.x + 300, bb.y + bb.height + 14); await page.waitForTimeout(300);
  r.afterRulerBodyClick = await st();
  await page.keyboard.press('Space'); await page.waitForTimeout(600); r.afterSpacePlay = await st();
  await page.keyboard.press('Space'); await page.waitForTimeout(400); r.afterSpaceStop = await st();
  await ctx.close();
}
await browser.close(); writeFileSync(`extra-${tag}.json`, JSON.stringify(out, null, 1));
