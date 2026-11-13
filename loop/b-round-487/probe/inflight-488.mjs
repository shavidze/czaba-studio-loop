// B round 487->488: in-flight focus matrix. usage: node inflight-488.mjs <base> <out.json>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/inflight.json'] = process.argv.slice(2);
const browser = await chromium.launch();
const out = { base: BASE };
const SCEN = ['stay-enter', 'stay-mouse', 'click-password', 'tab-away', 'orders-tab'];
for (const [w, h] of [[1440, 900], [1280, 720]]) for (const scen of SCEN) for (const status of [200, 500]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
  let puts = 0;
  await ctx.route('**/api/auth/profile', async (r) => {
    if (r.request().method() === 'PUT') { puts++; await new Promise((s) => setTimeout(s, 1500)); if (status !== 200) return r.fulfill({ status, contentType: 'application/json', body: '{"success":false,"message":"Stub failure"}' });
      const b = JSON.parse(r.request().postData() || '{}'); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: b.firstName, lastName: b.lastName, authProvider: 'Email' } }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) });
  });
  await ctx.route('**/api/orders**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"data":[]}' }));
  const page = await ctx.newPage(); page.on('console', (m) => { if (/optimized dependencies/.test(m.text())) out.envInvalid = true; });
  await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 60000 }); await page.waitForTimeout(1500);
  const act = () => page.evaluate(() => { const a = document.activeElement; if (!a) return null; let fv = false; try { fv = a.matches(':focus-visible'); } catch {} return `${a.tagName}|${a.getAttribute('aria-label') ?? ''}|${(a.textContent ?? '').trim().slice(0, 40)}|fv=${fv}`; });
  const row = {};
  await page.getByRole('button', { name: /Full Name/ }).click(); await page.waitForTimeout(300);
  if (scen === 'stay-mouse' || scen === 'click-password') await page.getByRole('button', { name: 'Save name' }).click();
  else await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  row.duringSave = await act();
  if (scen === 'click-password') { await page.getByText('Click to change password').click(); await page.waitForTimeout(300); row.modalOpenBefore = await page.getByText(/Current Password/i).first().isVisible().catch(() => false); }
  if (scen === 'tab-away') { await page.keyboard.press('Tab'); await page.waitForTimeout(150); await page.keyboard.press('Tab'); await page.waitForTimeout(150); }
  if (scen === 'orders-tab') { await page.getByRole('link', { name: 'Orders' }).click(); await page.waitForTimeout(300); }
  row.beforeSettle = await act();
  await page.waitForTimeout(2200);
  row.afterSettle = await act();
  row.editorOpen = await page.getByRole('textbox', { name: 'First name' }).isVisible().catch(() => false);
  if (scen === 'click-password') row.modalOpenAfter = await page.getByText(/Current Password/i).first().isVisible().catch(() => false);
  row.url = new URL(page.url()).pathname;
  row.puts = puts;
  out[`${w}x${h}|${scen}|${status}`] = row; await ctx.close();
}
await browser.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
