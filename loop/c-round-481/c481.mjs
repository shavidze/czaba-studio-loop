import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const D = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-481';
const out = { c4: [], c5: [], c6: [], c7: [] };
const b = await chromium.launch();
const seed = (ctx) => ctx.addInitScript(() => { const d = new Date().toISOString().split('T')[0]; localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: d, dismissed: true, submitted: true })); });
const stubs = async (ctx, p) => {
  await ctx.addInitScript(() => localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })));
  await p.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User' } }) }));
  await p.route('**/api/downloads**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }));
  await p.route('**/api/orders/my**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 50 } }) }));
};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`;
  // C4
  let ctx = await b.newContext({ viewport: { width: w, height: h } }); await seed(ctx);
  let p = await ctx.newPage(); await stubs(ctx, p);
  await p.goto(`${BASE}/account/orders`, { waitUntil: 'load' });
  await p.getByText('No orders yet').waitFor({ timeout: 90000 }); await p.waitForLoadState('networkidle').catch(()=>{}); await p.waitForTimeout(3000);
  const link = p.getByRole('link', { name: 'Browse Music' });
  const href = await link.getAttribute('href');
  const rest = await link.evaluate((a) => { const s = getComputedStyle(a); const r = a.getBoundingClientRect(); return { bg: s.backgroundColor, color: s.color, font: `${s.fontWeight} ${s.fontSize}`, radius: s.borderRadius, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; });
  await p.screenshot({ path: `${D}/empty-${vp}.png` });
  await p.evaluate(() => { window.__probeMarker = 1; });
  let tabs = null;
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const t = await p.evaluate(() => (document.activeElement?.textContent ?? '').trim()); if (t === 'Browse Music') { tabs = i + 1; break; } }
  const focus = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, offset: s.outlineOffset, focusVisible: a.matches(':focus-visible') }; });
  const dialogs = await p.locator('[role="dialog"]').count();
  await p.screenshot({ path: `${D}/focus-${vp}.png` });
  await p.keyboard.press('Enter');
  await p.waitForURL((u) => !u.pathname.startsWith('/account'), { timeout: 30000 }); await p.waitForLoadState('load'); await p.waitForTimeout(2000);
  const marker = await p.evaluate(() => window.__probeMarker ?? null);
  await p.keyboard.press('Tab');
  const firstTab = await p.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName} ${a.getAttribute('href') ?? ''} ${(a.textContent ?? '').trim().slice(0, 30)}` : null; });
  out.c4.push({ vp, href, rest, tabs, focus, dialogs, marker, firstTab, path: new URL(p.url()).pathname, title: await p.title(), h1: await p.locator('h1').first().textContent().catch(() => null) });
  await p.screenshot({ path: `${D}/landed-${vp}.png` });
  await ctx.close();
  // C5
  ctx = await b.newContext({ viewport: { width: w, height: h } }); await seed(ctx); p = await ctx.newPage();
  await p.goto(`${BASE}/account/orders`, { waitUntil: 'load' }); await p.getByText('Sign in required').waitFor({ timeout: 30000 });
  out.c5.push({ vp, h1: await p.locator('h1').first().textContent(), browse: await p.getByRole('link', { name: 'Browse Music' }).count() });
  await p.screenshot({ path: `${D}/guard-${vp}.png` });
  await ctx.close();
  // C6
  ctx = await b.newContext({ viewport: { width: w, height: h } }); await seed(ctx); p = await ctx.newPage();
  await p.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load' }); await p.waitForTimeout(5000); await p.waitForLoadState('networkidle').catch(()=>{});
  const body = (await p.locator('body').innerText({timeout:90000})).slice(0, 300);
  const audioSrc = await p.locator('audio[src]').count();
  const tok = await ctx.request.get(`${BASE}/api/studio-token?product=middle-east&file=x`);
  const p2 = await ctx.newPage(); await p2.goto(`${BASE}/studio-lab`, { waitUntil: 'load' }); await p2.waitForTimeout(8000);
  const lab = { url: p2.url(), title: await p2.title(), signin: await p2.getByText('Sign in required').count(), timelineish: await p2.locator('[data-testid*="arrangement"], [aria-label*="Arrangement" i]').count() };
  await p2.screenshot({ path: `${D}/studiolab-${vp}.png` });
  out.c6.push({ vp, studioBodyHead: body.replace(/\s+/g, ' '), signIn: /Sign in required/i.test(body), audioSrc, tokenStatus: tok.status(), lab });
  await ctx.close();
  // C7
  ctx = await b.newContext({ viewport: { width: w, height: h } }); await seed(ctx); p = await ctx.newPage(); await stubs(ctx, p);
  await p.goto(`${BASE}/account/downloads`, { waitUntil: 'load' }); await p.waitForTimeout(5000);
  const links = await p.locator('main a').evaluateAll((as) => as.map((a) => `${a.getAttribute('href')}|${a.textContent.trim().slice(0, 30)}`));
  out.c7.push({ vp, links, text: (await p.locator('main').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200) });
  await p.screenshot({ path: `${D}/downloads-${vp}.png` });
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1));
