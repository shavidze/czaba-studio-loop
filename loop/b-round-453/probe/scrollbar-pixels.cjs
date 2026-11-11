// usage: node scrollbar-pixels.cjs <base> <out.json> <W> <H>
// L61 pixel row: real (not hidden) scrollbars; stubbed GET /api/cart (14 items, client path); screenshots the cart list's
// right 12 px strip and decodes it in a canvas: counts thumb-like pixels (teal-hued vs neutral grey) and reports the thumb colour.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, out, W = '1440', H = '900'] = process.argv.slice(2);
const items = Array.from({ length: 14 }, (_, i) => ({ id: 900 + i, productId: 1 + (i % 8), productTitle: `Stub Track ${i + 1}`, productHandle: 'middle-east', productImageUrl: '/studio-about.webp', unitPrice: 19, quantity: 1, total: 19 }));
const CART = { success: true, data: { id: 77, items, itemCount: items.length, subtotal: 266, discountAmount: 0, giftCardAmount: 0, total: 266 } };
(async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
  const page = await ctx.newPage();
  await page.route('**/api/cart**', (r) => (r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CART) }) : r.continue()));
  await page.goto(base + '/cart', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  const el = page.locator('.styled-scrollbar').first(); const b = await el.boundingBox();
  const geo = await page.evaluate(() => { const e = document.querySelector('.styled-scrollbar'); return { offsetW: e.offsetWidth, clientW: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight }; });
  const png = await page.screenshot({ clip: { x: b.x + b.width - 12, y: b.y, width: 12, height: Math.min(b.height, 300) } });
  const dec = await browser.newPage();
  const res = await dec.evaluate(async (d) => { const img = new Image(); img.src = d; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data; const hist = {}; let teal = 0; let grey = 0; for (let i = 0; i < px.length; i += 4) { const [r, g, bl] = [px[i], px[i + 1], px[i + 2]]; const k = `${r},${g},${bl}`; hist[k] = (hist[k] || 0) + 1; if (g - r > 40 && bl - r > 40) teal++; if (Math.abs(r - 115) <= 6 && Math.abs(g - 107) <= 6 && Math.abs(bl - 96) <= 6) grey++; } const top = Object.entries(hist).sort((a, b2) => b2[1] - a[1]).slice(0, 5); return { w: c.width, h: c.height, tealPx: teal, thumbGreyPx: grey, top }; }, 'data:image/png;base64,' + png.toString('base64'));
  fs.writeFileSync(out, JSON.stringify({ base, viewport: [+W, +H], geo, ...res }, null, 1)); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
