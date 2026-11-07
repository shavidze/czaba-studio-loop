import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = 'http://127.0.0.1:5173'; const out = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  const tr = page.getByTestId('arrangement-transport');
  const active = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}|${a.getAttribute('aria-label') ?? a.textContent?.trim().slice(0, 30)}` : null; });
  const btn = (re) => tr.getByRole('button', { name: re }).first();
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 180000 });
    r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    // c: select clip, Delete via keyboard on button
    const del = btn(/^Delete/);
    r.c0 = { delDis: await del.getAttribute('aria-disabled'), title: await del.getAttribute('title') };
    await page.keyboard.press('Escape');
    const clip = page.locator('[data-testid^="arrangement-clip"]').first();
    r.clipCount = await page.locator('[data-clip-id], [data-testid="arrangement-clip"]').count();
    try { await page.mouse.click(0,0); await page.locator('[data-clip-id]').first().click({ position: { x: 20, y: 12 }, timeout: 4000 }); } catch (e) { r.clipClickErr = String(e).slice(0, 80); }
    await page.waitForTimeout(300);
    r.c1 = { delDis: await del.getAttribute('aria-disabled') };
    await del.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    r.c2 = { active: await active(), undoText: (await btn(/^Undo/).textContent())?.trim() };
    // g export
    await tr.getByRole('button', { name: /Export/ }).first().click(); await page.waitForTimeout(500);
    r.g = { dialog: await page.getByRole('dialog').count() };
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    r.g.afterEsc = await active();
    // smoke: add Bass again, play 1.5s
    await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await page.keyboard.press('Space'); await page.waitForTimeout(1700);
    r.play = { pos: (await page.getByTestId('arrangement-position').textContent())?.trim(), state: await page.getByTestId('arrangement-playback-state').textContent() };
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
    r.stop = { state: await page.getByTestId('arrangement-playback-state').textContent() };
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
    r.undoTitle = await btn(/^Undo/).getAttribute('title');
    await page.screenshot({ path: `browser-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  // auth guard in fresh context
  const c2 = await browser.newContext({ viewport: { width: w, height: h } }); const p2 = await c2.newPage();
  try {
    await p2.goto(`${base}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 120000 });
    r.auth = { signIn: await p2.getByText(/Sign in required/i).count(), audio: await p2.locator('audio[src]').count(), workspace: await p2.getByTestId('arrangement-transport').count() };
    const resp = await p2.request.get(`${base}/api/studio-token`); r.auth.tokenStatus = resp.status(); r.auth.tokenBody = (await resp.text()).slice(0, 120);
  } catch (e) { r.authErr = String(e).slice(0, 200); }
  await ctx.close(); await c2.close();
}
await browser.close(); writeFileSync('browser.json', JSON.stringify(out, null, 1));
