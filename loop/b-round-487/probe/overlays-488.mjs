// B round 487->488: other overlays opened by an unfocused click during a name save; password modal Tab/Esc. usage: node overlays-488.mjs <base> <out.json>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5188', OUT = '/tmp/overlays.json'] = process.argv.slice(2);
const browser = await chromium.launch();
const out = { base: BASE };
async function setup(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
  const st = { puts: 0 };
  await ctx.route('**/api/auth/profile', async (r) => {
    if (r.request().method() === 'PUT') { st.puts++; await new Promise((s) => setTimeout(s, 1500)); const b = JSON.parse(r.request().postData() || '{}'); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: b.firstName, lastName: b.lastName, authProvider: 'Email' } }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) });
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 60000 }); await page.waitForTimeout(1500);
  return { ctx, page, st };
}
const act = (page) => page.evaluate(() => { const a = document.activeElement; if (!a) return null; return `${a.tagName}|${a.getAttribute('aria-label') ?? ''}|${(a.textContent ?? '').trim().slice(0, 30)}`; });
const dialogs = (page) => page.evaluate(() => [...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')].map((d) => `${d.getAttribute('role')}|${d.getAttribute('aria-label') ?? d.getAttribute('aria-labelledby') ?? ''}`));
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const headerButtons = [];
  { const { ctx, page } = await setup(w, h); headerButtons.push(...(await page.evaluate(() => [...document.querySelectorAll('header button')].map((b, i) => `${i}|${b.getAttribute('aria-label') ?? ''}|${(b.textContent ?? '').trim().slice(0, 20)}`)))); await ctx.close(); }
  out[`${w}x${h}|headerButtons`] = headerButtons;
  for (let i = 0; i < headerButtons.length; i++) {
    const { ctx, page, st } = await setup(w, h);
    const row = {};
    await page.getByRole('button', { name: /Full Name/ }).click(); await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Save name' }).click(); await page.waitForTimeout(200);
    await page.evaluate((idx) => { document.querySelectorAll('header button')[idx]?.click(); }, i); await page.waitForTimeout(400);
    row.beforeSettle = await act(page); row.dialogsBefore = await dialogs(page);
    await page.waitForTimeout(2200);
    row.afterSettle = await act(page); row.dialogsAfter = await dialogs(page); row.puts = st.puts;
    out[`${w}x${h}|header-${headerButtons[i]}`] = row; await ctx.close();
  }
  { const { ctx, page } = await setup(w, h); const row = {};
    await page.getByText('Click to change password').click(); await page.waitForTimeout(400);
    row.afterOpen = await act(page); row.dialogs = await dialogs(page);
    await page.keyboard.press('Tab'); await page.waitForTimeout(150); row.afterTab = await act(page);
    await page.keyboard.press('Escape'); await page.waitForTimeout(500); row.modalAfterEsc = await page.getByText(/Current Password/i).first().isVisible().catch(() => false); row.afterEsc = await act(page);
    out[`${w}x${h}|password-modal-keys`] = row; await ctx.close(); }
}
await browser.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
