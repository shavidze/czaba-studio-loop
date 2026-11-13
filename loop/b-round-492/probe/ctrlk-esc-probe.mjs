import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = {};
const b = await chromium.launch();
for (const [label, base] of [['v5', 'http://127.0.0.1:5195'], ['head', 'http://127.0.0.1:5196']]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); } catch {} });
  await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) }));
  await ctx.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  const page = await ctx.newPage();
  await page.goto(base + '/account', { waitUntil: 'load' });
  await page.getByText('Click to change password').waitFor({ timeout: 20000 }); await page.waitForTimeout(1500);
  const pwVisible = () => page.getByText('Change Password', { exact: true }).first().isVisible().catch(() => false);
  const paletteOpen = () => page.evaluate(() => { const i = document.querySelector('input[placeholder*="earch" i]'); return !!(i && i.offsetParent !== null); });
  const r = {};
  await page.getByText('Click to change password').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(600);
  r.afterOpen = { pw: await pwVisible(), palette: await paletteOpen() };
  await page.keyboard.press('Control+k'); await page.waitForTimeout(600);
  r.afterCtrlK = { pw: await pwVisible(), palette: await paletteOpen() };
  await page.screenshot({ path: `ctrlk-${label}-open.png` });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  r.afterEsc = { pw: await pwVisible(), palette: await paletteOpen() };
  await page.screenshot({ path: `ctrlk-${label}-esc.png` });
  out[label] = r; await ctx.close();
}
await b.close();
console.log(JSON.stringify(out));
