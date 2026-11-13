// usage: node order-card-probe.mjs <base> <out.json> <shotdir> <tag>
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE = 'http://127.0.0.1:5173', OUT = '/tmp/oc.json', SHOTS = '/tmp/oc-shots', TAG = 'head'] = process.argv.slice(2);
mkdirSync(SHOTS, { recursive: true });
const ORDERS = [
  { id: 101, orderNumber: '1001', userId: 7, status: 'Completed', paymentStatus: 'Paid', subtotal: 49, tax: 0, total: 49, currency: 'USD', createdAt: '2026-11-01T10:00:00Z',
    items: [{ id: 501, productId: 11, productTitle: 'Middle East', variantName: 'Full mix + 4 stems', licenseType: 'Standard', unitPrice: 49, quantity: 1, total: 49 }] },
  { id: 102, orderNumber: '1002', userId: 7, status: 'Completed', paymentStatus: 'Pending', subtotal: 98, tax: 0, total: 98, currency: 'USD', createdAt: '2026-11-05T10:00:00Z',
    items: [{ id: 502, productId: 12, productTitle: 'Night Drive', licenseType: 'Extended', unitPrice: 59, quantity: 1, total: 59 },
            { id: 503, productId: 13, productTitle: 'Dust Storm', licenseType: 'Standard', unitPrice: 39, quantity: 1, total: 39 }] },
];
const out = { base: BASE, tag: TAG, rows: {} };
const browser = await chromium.launch();
const cardInfo = (page, num) => page.evaluate((n) => {
  const t = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent?.trim() === `Order #${n}`);
  if (!t) return null;
  let card = t; while (card && !(card.className?.includes?.('overflow-hidden') && card.className.includes('border'))) card = card.parentElement;
  const header = card.firstElementChild; const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x*10)/10, Math.round(b.y*10)/10, Math.round(b.width*10)/10, Math.round(b.height*10)/10]; };
  const btn = card.querySelector('button');
  const heading = card.querySelector('h3');
  const panelId = btn?.getAttribute('aria-controls');
  const panel = panelId ? document.getElementById(panelId) : null;
  const itemsVisible = [...card.querySelectorAll('h4')].filter((h) => h.offsetParent !== null).map((h) => h.textContent);
  const cs = getComputedStyle(header);
  return { card: r(card), header: r(header), headerTag: header.tagName, headingBox: r(heading), headingInsideButton: !!heading?.querySelector('button') || !!btn?.closest('h3'),
    titleBox: r(t), titleTag: t.tagName, titleFont: getComputedStyle(t).fontSize + ' ' + getComputedStyle(t).fontWeight, headerTextAlign: cs.textAlign, headerCursor: cs.cursor, headerBg: cs.backgroundColor,
    button: btn ? { type: btn.getAttribute('type'), expanded: btn.getAttribute('aria-expanded'), controls: panelId, panelExists: !!panel, panelHidden: panel ? panel.hidden : null, name: btn.textContent.replace(/\s+/g, ' ').trim(), box: r(btn) } : null,
    itemsVisible, cardHeight: card.getBoundingClientRect().height, roleButtons: card.querySelectorAll('[role=button],[tabindex]').length };
}, num);
const active = (page) => page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a);
  return { tag: a.tagName, text: (a.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60), expanded: a.getAttribute('aria-expanded'), focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, outlineOffset: cs.outlineOffset, inCard: !!a.closest('.overflow-hidden.border') }; });
for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
  const vp = `${w}x${h}`; const rows = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'probe@example.invalid', accessToken: 'stub-token', refreshToken: 'stub-refresh' })); } catch {} });
  await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'probe@example.invalid', firstName: 'Probe', lastName: 'User' } }) }));
  await ctx.route('**/api/orders/my**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: ORDERS, totalCount: 2, pageNumber: 1, pageSize: 50 } }) }));
  const page = await ctx.newPage();
  await page.goto(`${BASE}/account/orders`, { waitUntil: 'load' });
  await page.getByText('Order #1001').waitFor({ timeout: 20000 });
  await page.waitForTimeout(2000);
  rows.collapsed = { c1: await cardInfo(page, '1001'), c2: await cardInfo(page, '1002') };
  await page.screenshot({ path: `${SHOTS}/${TAG}-collapsed-${vp}.png` });
  // Tab walk from the top
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  const stops = [];
  for (let i = 0; i < 45; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); stops.push(await active(page)); }
  rows.tabStops = stops; rows.cardStops = stops.map((s, i) => [i + 1, s]).filter(([, s]) => s?.inCard).map(([i, s]) => ({ tab: i, text: s.text, expanded: s.expanded, focusVisible: s.focusVisible, outline: s.outline, outlineOffset: s.outlineOffset }));
  // keyboard activation on the first card stop (sketch only)
  const firstIdx = stops.findIndex((s) => s?.inCard);
  if (firstIdx >= 0) {
    await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
    for (let i = 0; i < 45; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); const s = await active(page); if (s?.inCard && s.text.startsWith('Order #1001')) break; }
    rows.focusedBefore = await active(page);
    if (!rows.focusedBefore?.text?.startsWith('Order #1001')) throw new Error('could not Tab to card 1001');
    const ringBox = await page.evaluate(() => { const b = document.activeElement.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; });
    await page.screenshot({ path: `${SHOTS}/${TAG}-ring-${vp}.png`, clip: { x: Math.max(0, ringBox[0] - 8), y: Math.max(0, ringBox[1] - 8), width: ringBox[2] + 16, height: ringBox[3] + 16 } });
    await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    rows.afterEnter = { active: await active(page), c1: await cardInfo(page, '1001') };
    await page.screenshot({ path: `${SHOTS}/${TAG}-enter-${vp}.png` });
    await page.keyboard.press('Space'); await page.waitForTimeout(300);
    rows.afterSpace = { active: await active(page), c1: await cardInfo(page, '1001') };
    // held Enter: one keydown + 5 repeats
    await page.keyboard.down('Enter'); for (let i = 0; i < 5; i++) { await page.keyboard.down('Enter'); await page.waitForTimeout(40); } await page.keyboard.up('Enter'); await page.waitForTimeout(300);
    rows.afterHeldEnter6 = { expanded: (await cardInfo(page, '1001'))?.button?.expanded ?? null, url: page.url(), active: await active(page) };
    await page.keyboard.down(' '); for (let i = 0; i < 5; i++) { await page.keyboard.down(' '); await page.waitForTimeout(40); } await page.keyboard.up(' '); await page.waitForTimeout(300);
    rows.afterHeldSpace6 = { expanded: (await cardInfo(page, '1001'))?.button?.expanded ?? null, url: page.url(), active: await active(page) };
    // reset to collapsed
    const st = (await cardInfo(page, '1001'))?.button?.expanded; if (st === 'true') { await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
  }
  // mouse click expand (both trees)
  await page.reload({ waitUntil: 'load' }); await page.getByText('Order #1001').waitFor({ timeout: 20000 }); await page.waitForTimeout(1500);
  await page.getByText('Order #1001').click(); await page.waitForTimeout(400);
  rows.afterMouse = { active: await active(page), c1: await cardInfo(page, '1001'), c2: await cardInfo(page, '1002'), focusSource: await page.evaluate(() => document.documentElement.getAttribute('data-focus-source')) };
  await page.screenshot({ path: `${SHOTS}/${TAG}-mouse-expanded-${vp}.png` });
  await page.getByText('Order #1001').click(); await page.waitForTimeout(400);
  rows.afterMouse2 = { c1: await cardInfo(page, '1001') };
  rows.speakersInPage = await page.evaluate(() => document.querySelectorAll('[aria-live],[role=alert],[role=status]').length);
  out.rows[vp] = rows; await ctx.close();
}
await browser.close();
writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log('wrote', OUT);
