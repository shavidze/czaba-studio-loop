// usage: node teal-probe.cjs <base> <out.json> <W> <H> <shotDir>
// STORE-2b-3c-1 probe (reducedMotion reduce): global AudioPlayer (artwork, play, progress thumb rule) after a real preview
// click on a home card; ProductCard light ::before/::after; 404 grid / code-4 / code-0; Ctrl+K palette selected vs hovered row;
// stubbed cart (GET /api/cart, client path) list + ConfirmDialog styled-scrollbar; /studio-lab computed-style digest.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs'); const crypto = require('crypto');
const [base, out, W = '1440', H = '900', shots = 'shots'] = process.argv.slice(2);
const TEAL = /19,\s*217,\s*204|20,\s*184,\s*166|hsl\(175/;
const items = Array.from({ length: 14 }, (_, i) => ({ id: 900 + i, productId: 1 + (i % 8), productTitle: `Stub Track ${i + 1}`, productHandle: 'middle-east', productImageUrl: '/studio-about.webp', unitPrice: 19, quantity: 1, total: 19 }));
const CART = { success: true, data: { id: 77, items, itemCount: items.length, subtotal: 266, discountAmount: 0, giftCardAmount: 0, total: 266 } };
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const rgb = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); return m ? m[1].split(/[ ,/]+/).filter(Boolean).map(Number) : null; };
const over = (fg, bg) => { const a = fg[3] ?? 1; return [0, 1, 2].map((i) => Math.round(fg[i] * a + bg[i] * (1 - a))); };
const contrast = (a, b) => { const l1 = lum(a); const l2 = lum(b); return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
(async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const R = { base, viewport: [+W, +H], rows: {} };
  const cs = (sel, pseudo, idx = 0) => page.evaluate(([s, p, i]) => { const e = document.querySelectorAll(s)[i]; if (!e) return null; const c = getComputedStyle(e, p || null); const r = e.getBoundingClientRect(); return { boxShadow: c.boxShadow, backgroundImage: c.backgroundImage, backgroundColor: c.backgroundColor, color: c.color, textShadow: c.textShadow, borderTop: `${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`, scrollbarColor: c.scrollbarColor, content: c.content, opacity: c.opacity, animationName: c.animationName, box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] }; }, [sel, pseudo, idx]);
  // 1 home: card light + real preview click -> global player
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  const card = page.locator('.light-flicker-effect').first(); await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  R.rows.cardBefore = await cs('.light-flicker-effect', '::before'); R.rows.cardAfter = await cs('.light-flicker-effect', '::after');
  await card.hover(); await page.waitForTimeout(500);
  await page.locator('.audio-preview-overlay-button').nth(1).click({ force: true }); await page.waitForTimeout(3500); await page.mouse.move(5, 5); await page.waitForTimeout(500);
  R.rows.player = await page.locator('.audio-player').count();
  R.rows.audio = await page.evaluate(() => [...document.querySelectorAll('audio')].map((a) => ({ paused: a.paused, t: +a.currentTime.toFixed(2), src: a.currentSrc.split('/').pop() })));
  R.rows.artworkRest = await cs('.audio-player-artwork'); R.rows.playRest = await cs('.audio-player-button-play');
  R.rows.labelsPlaying = await page.evaluate(() => ({ preview: document.querySelectorAll('.audio-preview-overlay-button')[1]?.getAttribute('aria-label'), player: document.querySelector('.audio-player-button-play')?.getAttribute('aria-label') }));
  if (R.rows.player) {
    await page.locator('.audio-player-button-play').hover(); await page.waitForTimeout(500); R.rows.playHover = await cs('.audio-player-button-play');
    await page.locator('.audio-player-artwork').hover(); await page.waitForTimeout(500); R.rows.artworkHover = await cs('.audio-player-artwork');
    await page.screenshot({ path: `${shots}/player-${W}.png`, clip: { x: 0, y: +H - 140, width: +W, height: 140 } });
    await page.keyboard.press('Tab'); await page.locator('.audio-player-button-play').focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
    R.rows.playFocus = await page.evaluate(() => { const e = document.querySelector('.audio-player-button-play'); const c = getComputedStyle(e); return { focusVisible: e.matches(':focus-visible'), outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`, boxShadow: c.boxShadow }; });
    await page.locator('.audio-player-button-play').click(); await page.waitForTimeout(600); await page.mouse.move(5, 5); await page.waitForTimeout(400);
    R.rows.labelsPaused = await page.evaluate(() => ({ player: document.querySelector('.audio-player-button-play')?.getAttribute('aria-label') }));
    R.rows.playPaused = await cs('.audio-player-button-play');
  }
  R.rows.thumbRules = await page.evaluate(() => { const o = []; for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch { continue; } for (const r of rs) if (r.selectorText && /audio-player-progress::-(webkit-slider|moz-range)-thumb:hover/.test(r.selectorText)) o.push(`${r.selectorText} => ${r.style.boxShadow}`); } return o; });
  // 2 404
  await page.goto(base + '/no-such-page-454', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  R.rows.nfGrid = await cs('.not-found-grid'); R.rows.nfCode4 = await cs('.code-4'); R.rows.nfCode0 = await cs('.code-0');
  await page.screenshot({ path: `${shots}/404-${W}.png` });
  // 3 palette
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.keyboard.press('Control+k'); await page.waitForTimeout(700);
  R.rows.paletteItems = await page.locator('.command-palette-item').count();
  const panelBg = await page.evaluate(() => { const e = document.querySelector('.command-palette'); return e ? getComputedStyle(e).backgroundColor : null; });
  await page.mouse.move(5, 5); await page.waitForTimeout(200);
  R.rows.paletteSelected = await cs('.command-palette-item.selected');
  const hoverIdx = 2; await page.locator('.command-palette-item').nth(hoverIdx).hover(); await page.waitForTimeout(300);
  R.rows.paletteHovered = await cs('.command-palette-item', null, hoverIdx);
  R.rows.paletteSelectedIndexAfterHover = await page.evaluate(() => [...document.querySelectorAll('.command-palette-item')].findIndex((e) => e.classList.contains('selected')));
  R.rows.paletteSelectedAfterHover = await cs('.command-palette-item.selected');
  await page.mouse.move(5, 5); await page.keyboard.press('ArrowDown'); await page.waitForTimeout(250);
  R.rows.paletteArrowIndex = await page.evaluate(() => [...document.querySelectorAll('.command-palette-item')].findIndex((e) => e.classList.contains('selected')));
  R.rows.panelBg = panelBg;
  const pb = rgb(panelBg); const sel = rgb(R.rows.paletteSelected?.backgroundColor); const tx = rgb(R.rows.paletteSelected?.color);
  if (pb && sel && tx) { const selOver = over(sel, pb); R.rows.paletteSelectedComposite = selOver; R.rows.paletteTextContrast = contrast(tx, selOver); const hov = rgb(R.rows.paletteHovered?.backgroundColor); if (hov) R.rows.paletteHoverComposite = over(hov, pb); }
  await page.screenshot({ path: `${shots}/palette-${W}.png` });
  await page.keyboard.press('Escape');
  // 4 cart (stubbed GET /api/cart)
  await page.route('**/api/cart**', (route) => (route.request().method() === 'GET' ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CART) }) : route.continue()));
  await page.goto(base + '/cart', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000);
  R.rows.cartList = await cs('.styled-scrollbar');
  R.rows.cartListOverflow = await page.evaluate(() => { const e = document.querySelector('.styled-scrollbar'); return e ? [e.scrollHeight, e.clientHeight] : null; });
  if (R.rows.cartList) { const el = page.locator('.styled-scrollbar').first(); const b = await el.boundingBox(); await page.screenshot({ path: `${shots}/cart-list-${W}.png`, clip: { x: Math.max(0, b.x + b.width - 40), y: b.y, width: 40, height: Math.min(b.height, 400) } }); }
  const rm = page.getByRole('button', { name: /remove/i }).first();
  if (await rm.count()) { await rm.click(); await page.waitForTimeout(800); R.rows.confirmDialog = await page.locator('[role=dialog], [role=alertdialog]').count(); R.rows.confirmScroll = await page.evaluate(() => { const d = document.querySelector('[role=dialog] .styled-scrollbar, [role=alertdialog] .styled-scrollbar') || [...document.querySelectorAll('.styled-scrollbar')].pop(); return d ? getComputedStyle(d).scrollbarColor : null; }); await page.keyboard.press('Escape'); }
  await page.unroute('**/api/cart**');
  // 5 studio-lab computed digest
  await page.goto(base + '/studio-lab', { waitUntil: 'networkidle' }); await page.waitForTimeout(3000);
  R.rows.studioDigest = await page.evaluate(() => { const K = ['color', 'backgroundColor', 'backgroundImage', 'boxShadow', 'scrollbarColor', 'borderTopColor', 'outlineColor', 'textShadow', 'filter']; const els = [...document.querySelectorAll('body *')]; return { n: els.length, s: els.map((e) => { const c = getComputedStyle(e); return K.map((k) => c[k]).join('|'); }).join('\n') }; });
  R.rows.studioDigest = { n: R.rows.studioDigest.n, sha: crypto.createHash('sha256').update(R.rows.studioDigest.s).digest('hex').slice(0, 16), teal: TEAL.test(R.rows.studioDigest.s) };
  const scan = (v) => (v && typeof v === 'object' ? JSON.stringify(v) : String(v));
  R.tealRows = Object.entries(R.rows).filter(([k, v]) => k !== 'studioDigest' && TEAL.test(scan(v))).map(([k]) => k);
  R.pageErrors = errors.length;
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
