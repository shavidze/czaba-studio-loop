// usage: node mut-491.mjs <base> <out.json>  -- DOM mutants on the sketch build: remove one sketch class, re-measure at 375 and 320
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT] = process.argv.slice(2);
const MUTANTS = { M0: [], MA_no_min_w_0: [['input', 'min-w-0']] };
const out = {}; const browser = await chromium.launch();
for (const [w, h] of [[375, 812], [320, 640]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); });
  await ctx.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User', authProvider: 'Email' } }) }));
  const page = await ctx.newPage();
  for (const [name, edits] of Object.entries(MUTANTS)) {
    await page.goto(`${BASE}/account`, { waitUntil: 'load' }); await page.getByText('Full Name', { exact: true }).waitFor({ timeout: 20000 }); await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /Full Name/ }).click(); await page.waitForTimeout(400);
    const res = await page.evaluate((edits) => {
      const row = document.querySelector('input[aria-label="First name"]').parentElement;
      for (const [sel, cls] of edits) row.querySelectorAll(sel).forEach((e) => cls.startsWith('+') ? e.classList.add(cls.slice(1)) : e.classList.remove(cls));
      const vw = document.documentElement.clientWidth;
      return [...row.querySelectorAll('button')].map((b) => { const r = b.getBoundingClientRect(); const at = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return { label: b.getAttribute('aria-label'), right: Math.round(r.right * 10) / 10, width: Math.round(r.width * 10) / 10, inViewport: r.right <= vw, hitSelf: r.x + r.width / 2 <= vw && (at === b || b.contains(at)), sizeOk: r.width >= 32 && r.height >= 32 }; });
    }, edits);
    out[`${w}:${name}`] = { buttons: res, pass: res.every((b) => b.inViewport && b.hitSelf && b.sizeOk) };
  }
  await ctx.close();
}
await browser.close(); writeFileSync(OUT, JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k, v.pass ? 'PASS' : 'RED', v.buttons.map((b) => `${b.label}:${b.right}/${b.width}`).join(' '));
