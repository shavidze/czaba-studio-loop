// A round 487: reviewer Medium repro. Mouse ✓ save (PUT delayed 1500 ms), click "Click to change password" mid-save; read activeElement after settle.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/fs.json'] = process.argv.slice(2);
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) for (const status of [200, 500]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
  let puts = 0;
  await ctx.route('**/api/auth/profile', async (r) => {
    if (r.request().method() === 'PUT') { puts++; await new Promise((s) => setTimeout(s, 1500)); if (status !== 200) return r.fulfill({ status, contentType: 'application/json', body: '{"success":false,"message":"Stub failure"}' });
      const b = JSON.parse(r.request().postData() || '{}'); return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: b.firstName, lastName: b.lastName, authProvider: 'Email' } }) }); }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) });
  });
  const page = await ctx.newPage(); page.on('console', (m) => { if (/optimized dependencies/.test(m.text())) out.envInvalid = true; });
  await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 60000 }); await page.waitForTimeout(1500);
  const act = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}|${a.getAttribute('aria-label') ?? ''}|${(a.textContent ?? '').trim().slice(0, 40)}|inDialog=${!!a.closest('[role=dialog],.fixed')}` : null; });
  const row = {};
  await page.getByRole('button', { name: /Full Name/ }).click(); await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Save name' }).click(); await page.waitForTimeout(200);
  const pw = page.getByText('Click to change password'); row.pwVisible = await pw.isVisible();
  if (row.pwVisible) { await pw.click(); await page.waitForTimeout(400); row.afterPwClick = await act(); }
  row.modalOpenBefore = await page.getByText(/Current Password/i).first().isVisible().catch(() => false);
  await page.waitForTimeout(2200);
  row.afterSettle = await act();
  row.modalOpenAfter = await page.getByText(/Current Password/i).first().isVisible().catch(() => false);
  row.puts = puts;
  out[`${w}x${h}-${status}`] = row; await ctx.close();
}
await browser.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
