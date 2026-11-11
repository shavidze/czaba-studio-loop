// usage: node teal-states-probe.cjs <base> <out.json> <W> <H> <shotDir>
// HEAD reachability probe for STORE-2b-3c live teal groups: listen journey (preview button rest/hover/playing,
// global AudioPlayer artwork/play/progress), ProductCard flicker ::after, 404 (grid, code-4, code-0),
// command palette selected item, store Modal / cart styled-scrollbar.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, out, W = '1440', H = '900', shots = 'shots'] = process.argv.slice(2);
const TEAL = /19,\s*217,\s*204|20,\s*184,\s*166/;
(async () => {
  const browser = await chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const res = { base, viewport: [+W, +H], rows: {} };
  const cs = (sel, pseudo) => page.evaluate(([s, p]) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e, p || null); return { boxShadow: c.boxShadow, background: c.backgroundImage, backgroundColor: c.backgroundColor, textShadow: c.textShadow, filter: c.filter, transform: c.transform, animationName: c.animationName, scrollbarColor: c.scrollbarColor, opacity: c.opacity }; }, [sel, pseudo]);
  const tealIn = (o) => !!o && Object.values(o).some((v) => TEAL.test(String(v)));
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2500);
  const btn = '.audio-preview-overlay-button';
  res.rows.previewCount = await page.locator(btn).count();
  res.rows.cardFlickerCount = await page.locator('.light-flicker-effect').count();
  if (res.rows.cardFlickerCount) { await page.locator('.light-flicker-effect').first().scrollIntoViewIfNeeded(); res.rows.cardAfterRest = await cs('.light-flicker-effect', '::after'); res.rows.cardBeforeRest = await cs('.light-flicker-effect', '::before'); await page.locator('.light-flicker-effect').first().hover(); await page.waitForTimeout(600); res.rows.cardAfterHover = await cs('.light-flicker-effect', '::after'); }
  if (res.rows.previewCount) {
    await page.locator('.light-flicker-effect').first().hover(); await page.waitForTimeout(500); const b = page.locator(btn).nth(1); await b.scrollIntoViewIfNeeded(); await page.mouse.move(0, 0); await page.waitForTimeout(400);
    res.rows.previewRest = await cs(btn); res.rows.previewBeforeRest = await cs(btn, '::before');
    await b.hover({ force: true }); await page.waitForTimeout(500);
    res.rows.previewHover = await cs(btn); res.rows.previewBeforeHover = await cs(btn, '::before');
    await page.screenshot({ path: `${shots}/preview-hover-${W}.png` });
    await b.click({ force: true }); await page.waitForTimeout(3000); await page.mouse.move(0, 0); await page.waitForTimeout(400);
    res.rows.previewPlayingClass = await page.evaluate((s) => document.querySelector(s)?.className, btn);
    res.rows.previewPlaying = await page.evaluate((s) => { const e = document.querySelector(s + '.playing'); if (!e) return null; const c = getComputedStyle(e); return { animationName: c.animationName, boxShadow: c.boxShadow }; }, btn);
    res.rows.audioPaused = await page.evaluate(() => [...document.querySelectorAll('audio')].map((a) => ({ paused: a.paused, t: a.currentTime, src: a.currentSrc.slice(-30) })));
    res.rows.playerPresent = await page.locator('.audio-player').count();
    res.rows.playerArtwork = await cs('.audio-player-artwork');
    res.rows.playerPlay = await cs('.audio-player-button-play'); res.rows.playerPlayClass = await page.evaluate(() => document.querySelector('.audio-player-button-play')?.className);
    if (res.rows.playerPresent) { await page.locator('.audio-player-button-play').hover(); await page.waitForTimeout(500); res.rows.playerPlayHover = await cs('.audio-player-button-play'); await page.locator('.audio-player-artwork').hover(); await page.waitForTimeout(500); res.rows.playerArtworkHover = await cs('.audio-player-artwork'); await page.screenshot({ path: `${shots}/player-${W}.png` }); }
    res.rows.progressClass = await page.evaluate(() => document.querySelector('.audio-player-progress')?.className);
  }
  await page.goto(base + '/no-such-page-454', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  res.rows.nf = { grid: await cs('.not-found-grid'), code4: await cs('.code-4'), code0: await cs('.code-0') };
  await page.screenshot({ path: `${shots}/404-${W}.png` });
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.keyboard.press('Control+k'); await page.waitForTimeout(600);
  res.rows.paletteOpen = await page.locator('.command-palette').count();
  await page.keyboard.type('gift'); await page.waitForTimeout(1200);
  res.rows.paletteItems = await page.locator('.command-palette-item').count();
  res.rows.paletteSelected = await cs('.command-palette-item.selected');
  res.rows.paletteSelectedText = await page.evaluate(() => { const e = document.querySelector('.command-palette-item.selected .command-palette-item-title'); return e ? getComputedStyle(e).color : null; });
  await page.screenshot({ path: `${shots}/palette-${W}.png` });
  await page.keyboard.press('Escape');
  await page.goto(base + '/cart', { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  res.rows.cartScroll = await cs('.styled-scrollbar');
  res.rows.cartScrollOverflows = await page.evaluate(() => { const e = document.querySelector('.styled-scrollbar'); return e ? e.scrollHeight > e.clientHeight : null; });
  await page.goto(base + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.locator('header').getByRole('button', { name: 'Sign In' }).first().click(); await page.waitForTimeout(800);
  res.rows.modalScroll = await cs('[role=dialog] .styled-scrollbar, .styled-scrollbar');
  res.rows.modalScrollOverflows = await page.evaluate(() => { const e = document.querySelector('.styled-scrollbar'); return e ? [e.scrollHeight, e.clientHeight] : null; });
  res.teal = Object.fromEntries(Object.entries(res.rows).map(([k, v]) => [k, typeof v === 'object' && v && !Array.isArray(v) ? (k === 'nf' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, tealIn(b)])) : tealIn(v)) : null]));
  res.pageErrors = errors.length;
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
