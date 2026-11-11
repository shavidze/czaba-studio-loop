// usage: node extras-probe.cjs <base> <out.json> <W> <H>
// STORE-2b-3c-1 extra states (product-designer checklist + advisor):
//  S1 card light under DEFAULT motion (one-shot light-flicker-on still runs, ::after gone);
//  S2 palette empty result + longest quick-link title selected (contrast, no teal);
//  S3 progress thumb keyboard focus (focus-visible ring on the range input);
//  S4 ConfirmDialog scrollbar sampled strictly inside the dialog;
//  S5 CSSOM sweep: every stylesheet rule whose non-custom-property declarations contain teal, pseudo parts stripped,
//     matched against live DOM states (home, home+player, /store, /products/middle-east, 404, palette open, stubbed cart,
//     stubbed cart + ConfirmDialog); plus elements whose computed animation-name is a keyframes rule with teal.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, out, W = '1440', H = '900'] = process.argv.slice(2);
const items = Array.from({ length: 14 }, (_, i) => ({ id: 900 + i, productId: 1 + (i % 8), productTitle: `Stub Track ${i + 1}`, productHandle: 'middle-east', productImageUrl: '/studio-about.webp', unitPrice: 19, quantity: 1, total: 19 }));
const CART = { success: true, data: { id: 77, items, itemCount: items.length, subtotal: 266, discountAmount: 0, giftCardAmount: 0, total: 266 } };
const sweep = () => {
  const TEAL = /19,\s*217,\s*204|18,\s*217,\s*200|20,\s*184,\s*166|hsla?\(\s*17\d|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)/i;
  const rules = []; const tealFrames = new Set();
  const walk = (list) => { for (const r of list) { if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules); if (r instanceof CSSKeyframesRule) { if (TEAL.test(r.cssText)) tealFrames.add(r.name); continue; } if (!r.selectorText || !r.style) continue; let txt = ''; for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (!p.startsWith('--')) txt += `${p}:${r.style.getPropertyValue(p)};`; } if (TEAL.test(txt)) rules.push(r.selectorText); } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch {} }
  const hits = {};
  for (const sel of rules) for (const part of sel.split(',')) { const s = part.replace(/::?(before|after|-webkit-[\w-]+|-moz-[\w-]+|placeholder|selection|marker)(\([^)]*\))?/g, '').replace(/:(hover|active|focus|focus-visible|focus-within|visited)/g, '').trim() || '*'; let n = 0; try { n = document.querySelectorAll(s).length; } catch { n = -1; } if (n) hits[part.trim()] = n; }
  const anim = [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).animationName).filter((a) => a !== 'none' && a.split(',').some((x) => tealFrames.has(x.trim())));
  return { tealRules: rules.length, tealFrames: [...tealFrames], hits, tealAnimated: anim.length };
};
(async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const R = { base, viewport: [+W, +H], sweep: {} };
  // S1 default motion
  { const ctx = await browser.newContext({ viewport: { width: +W, height: +H } }); await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} }); const p = await ctx.newPage();
    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.locator('.light-flicker-effect').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(2500);
    R.defaultMotion = await p.evaluate(() => { const e = document.querySelector('.light-flicker-effect'); const b = getComputedStyle(e, '::before'); const a = getComputedStyle(e, '::after'); return { beforeAnim: b.animationName, beforeOpacity: b.opacity, beforeBg: b.backgroundImage, afterContent: a.content, afterBg: a.backgroundImage }; });
    await ctx.close(); }
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); } catch {} });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000); R.sweep.home = await page.evaluate(sweep);
  await page.locator('.light-flicker-effect').first().hover(); await page.waitForTimeout(400); await page.locator('.audio-preview-overlay-button').nth(1).click({ force: true }); await page.waitForTimeout(2500);
  R.sweep.homePlayer = await page.evaluate(sweep);
  // S3 thumb keyboard focus
  await page.locator('.audio-player-progress').focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(250);
  R.thumbFocus = await page.evaluate(() => { const e = document.activeElement; const c = getComputedStyle(e); return { cls: e.className, focusVisible: e.matches(':focus-visible'), outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`, boxShadow: c.boxShadow }; });
  // S2 palette empty + longest title
  await page.mouse.move(5, 5); await page.keyboard.press('Control+k'); await page.waitForTimeout(600);
  const titles = await page.locator('.command-palette-item-title').allTextContents(); const longest = titles.reduce((a, b) => (b.length > a.length ? b : a), '');
  const idx = titles.indexOf(longest); for (let i = 0; i < idx; i++) await page.keyboard.press('ArrowDown'); await page.waitForTimeout(250);
  R.paletteLongest = await page.evaluate(() => { const e = document.querySelector('.command-palette-item.selected'); const t = e.querySelector('.command-palette-item-title'); const c = getComputedStyle(e); return { title: t.textContent, bg: c.backgroundColor, color: getComputedStyle(t).color, overflow: t.scrollWidth > t.clientWidth }; });
  R.sweep.palette = await page.evaluate(sweep);
  await page.keyboard.type('zzzzqx'); await page.waitForTimeout(500);
  R.paletteEmpty = await page.evaluate(() => ({ items: document.querySelectorAll('.command-palette-item').length, text: (document.querySelector('.command-palette')?.innerText || '').slice(0, 120) }));
  await page.keyboard.press('Escape');
  for (const [k, path] of [['store', '/store'], ['product', '/products/middle-east'], ['notFound', '/no-such-page-454']]) { await page.goto(base + path, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500); R.sweep[k] = await page.evaluate(sweep); }
  await page.route('**/api/cart**', (r) => (r.request().method() === 'GET' ? r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CART) }) : r.continue()));
  await page.goto(base + '/cart', { waitUntil: 'networkidle' }); await page.waitForTimeout(2000); R.sweep.cart = await page.evaluate(sweep);
  await page.getByRole('button', { name: /remove/i }).first().click(); await page.waitForTimeout(800);
  R.confirmInDialog = await page.evaluate(() => { const d = document.querySelector('[role=dialog] .styled-scrollbar, [role=alertdialog] .styled-scrollbar, [role=dialog].styled-scrollbar, [role=alertdialog].styled-scrollbar'); return d ? { inDialog: true, scrollbarColor: getComputedStyle(d).scrollbarColor } : { inDialog: false }; });
  R.sweep.cartDialog = await page.evaluate(sweep);
  R.pageErrors = errors.length;
  R.liveTealMatches = Object.fromEntries(Object.entries(R.sweep).map(([k, v]) => [k, Object.keys(v.hits).length + v.tealAnimated]));
  fs.writeFileSync(out, JSON.stringify(R, null, 1)); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
