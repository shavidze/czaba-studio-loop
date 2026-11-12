import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const TAG = process.env.TAG ?? 'head';
const out = [];
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); });
  await ctx.addInitScript(() => localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })));
  const p = await ctx.newPage();
  await p.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User' } }) }));
  await p.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await p.route('**/api/orders/my**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 50 } }) }));
  await p.goto(`${BASE}/account/orders`, { waitUntil: 'load' });
  await p.getByText('No orders yet').waitFor({ timeout: 20000 });
  await p.waitForTimeout(1500);
  const rest = await p.getByRole('link', { name: 'Browse Music' }).evaluate((a) => { const s = getComputedStyle(a); const r = a.getBoundingClientRect(); return { bg: s.backgroundColor, color: s.color, font: `${s.fontWeight} ${s.fontSize}`, radius: s.borderRadius, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  let tabs = null;
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const t = await p.evaluate(() => (document.activeElement?.textContent ?? '').trim()); if (t === 'Browse Music') { tabs = i + 1; break; } }
  const focus = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset, focusVisible: a.matches(':focus-visible') }; });
  const dialogs = await p.locator('[role="dialog"]').count();
  await p.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/b-round-480/probe/orders-ring-${TAG}-${w}x${h}.png` });
  out.push({ vp: `${w}x${h}`, rest, tabsToReach: tabs, focus, openDialogs: dialogs });
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1));
