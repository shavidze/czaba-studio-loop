const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const URL = 'http://127.0.0.1:5173/studio-lab';
async function warm(browser) { const c = await browser.newContext(); const p = await c.newPage(); await p.goto(URL); await p.waitForTimeout(3000); await c.close(); }
async function run(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:5173' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.goto(URL);
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 20000 });
  const bass = page.getByRole('option', { name: /Night Pulse · Bass|Bass/ }).first();
  await bass.click(); await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Mute — Music', exact: true }).click();
  const clipsBefore = await page.locator('[data-clip-id]').count();
  await page.locator('[data-playing]').click();
  await page.waitForTimeout(1000);
  const playingBefore = await page.locator('[data-playing]').getAttribute('data-playing');
  await page.setViewportSize({ width: 899, height: h });
  await page.waitForTimeout(300);
  const narrow = await page.evaluate(() => ({ active: document.activeElement?.getAttribute('data-testid'), exit: !!document.querySelector('[data-testid="arrangement-exit"]'), playingAttr: document.querySelector('[data-playing]')?.getAttribute('data-playing') ?? null, ctxStates: null }));
  await page.screenshot({ path: `resize-${w}-narrow.png` });
  await page.keyboard.press('Tab');
  let tabs = []; tabs.push(await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 20)));
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); tabs.push(await page.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.textContent || '').trim().slice(0, 20))); }
  await page.getByRole('button', { name: 'Send link' }).focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  const status = await page.locator('output').filter({ hasText: /Link|copy/ }).first().textContent().catch(() => null);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => 'ERR ' + e);
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(500);
  const wide = await page.evaluate(() => ({ active: document.activeElement?.getAttribute('data-testid'), playing: document.querySelector('[data-playing]')?.getAttribute('data-playing'), clips: document.querySelectorAll('[data-clip-id]').length }));
  const muted = await page.getByRole('button', { name: 'Mute — Music', exact: true }).getAttribute('aria-pressed');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(200);
  const mutedAfterUndo = await page.getByRole('button', { name: 'Mute — Music', exact: true }).getAttribute('aria-pressed');
  await page.screenshot({ path: `resize-${w}-back.png` });
  await ctx.close();
  return { clipsBefore, playingBefore, narrow, tabs, status, clip, wide, muted, mutedAfterUndo, errs };
}
async function narrowWide(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(URL); await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Send link' }).focus();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 20000 });
  const active = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
  await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  await page.locator('[data-playing]').click(); await page.waitForTimeout(700);
  const playing = await page.locator('[data-playing]').getAttribute('data-playing');
  await page.screenshot({ path: 'narrow-to-wide-1440.png' });
  await ctx.close();
  return { active, playing };
}
(async () => {
  const browser = await chromium.launch();
  await warm(browser);
  const out = { r1440: await run(browser, 1440, 900), r1280: await run(browser, 1280, 720), narrowWide: await narrowWide(browser) };
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
